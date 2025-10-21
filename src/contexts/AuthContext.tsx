import { createContext, useContext, useReducer, useEffect, ReactNode, useCallback, useMemo } from 'react';
import axiosInstance from '../api/authPromise'; // Import the mocked Axios instance from the previous response
import type { AxiosResponse } from 'axios';

// User types and interfaces
export interface User {
    id: string;
    email?: string;
    telephone?: string;
    password?: string;
    name: string;
    role: 'admin' | 'user' | 'moderator';
    profile?: {
        firstName: string;
        lastName: string;
        avatar?: string;
        preferences?: {
            theme: string;
            notifications: boolean;
        };
    };
}

export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    loginMethod: 'custom' | 'keycloak' | null;
    verificationState: VerificationState | null;
}

// Auth actions
type AuthAction =
    | { type: 'AUTH_START' }
    | { type: 'AUTH_SUCCESS'; payload: { user: User; method: 'custom' | 'keycloak' } }
    | { type: 'AUTH_FAILURE'; payload: string }
    | { type: 'LOGOUT' }
    | { type: 'UPDATE_USER'; payload: Partial<User> }
    | { type: 'CLEAR_ERROR' }
    | { type: 'REQUIRE_VERIFICATION'; payload: VerificationState }
    | { type: 'VERIFICATION_SUCCESS' };

// Initial state
const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    loginMethod: null,
    verificationState: null,
};

// Auth reducer (unchanged)
function authReducer(state: AuthState, action: AuthAction): AuthState {
    switch (action.type) {
        case 'AUTH_START':
            return {
                ...state,
                isLoading: true,
                error: null,
            };
        case 'AUTH_SUCCESS':
            return {
                ...state,
                user: action.payload.user,
                isAuthenticated: true,
                isLoading: false,
                error: null,
                loginMethod: action.payload.method,
            };
        case 'AUTH_FAILURE':
            return {
                ...state,
                user: null,
                isAuthenticated: false,
                isLoading: false,
                error: action.payload,
                loginMethod: null,
            };
        case 'LOGOUT':
            return {
                ...initialState,
            };
        case 'UPDATE_USER':
            return {
                ...state,
                user: state.user ? { ...state.user, ...action.payload } : null,
            };
        case 'CLEAR_ERROR':
            return {
                ...state,
                error: null,
            };
        case 'REQUIRE_VERIFICATION':
            return {
                ...state,
                isLoading: false,
                verificationState: action.payload,
                error: null,
            };
        case 'VERIFICATION_SUCCESS':
            return {
                ...state,
                verificationState: null,
            };
        default:
            return state;
    }
}

// Context interface
interface AuthContextType {
    state: AuthState;
    login: (credentials: LoginCredentials, method: 'custom' | 'keycloak') => Promise<void>;
    logout: () => void;
    updateUser: (updates: Partial<User>) => void;
    hasRole: (role: string) => boolean;
    isAdmin: () => boolean;
    clearError: () => void;
    completeVerification: () => void;
}

export interface LoginCredentials {
    identifier: string;
    password: string;
    identifierType: 'email' | 'phone';
}

export interface VerificationState {
    isVerificationRequired: boolean;
    identifier: string;
    type: 'email' | 'sms';
    tempToken?: string; // Temporary token for verification step
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
interface AuthProviderProps {
    children: ReactNode;
    verificationState?: VerificationState;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [state, dispatch] = useReducer(authReducer, initialState);

    // Check for existing session on mount
    useEffect(() => {
        const checkExistingSession = async () => {
            const token = localStorage.getItem('authToken');
            const loginMethod = localStorage.getItem('loginMethod') as 'custom' | 'keycloak' | null;
            console.log("token", token);
            console.log("loginMethod", loginMethod);
            if (token && loginMethod) {
                dispatch({ type: 'AUTH_START' });
                try {
                    const response: AxiosResponse<User> = await axiosInstance.get('/api/auth/validate', {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });
                    console.log("on validate", response.data);
                    dispatch({
                        type: 'AUTH_SUCCESS',
                        payload: { user: response.data, method: loginMethod },
                    });
                } catch (error: any) {
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('loginMethod');
                    const errorMessage = error.response?.data?.message || 'Session validation failed';
                    dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
                }
            }
        };
        checkExistingSession();
    }, []);

    // Login function
    const login = useCallback(async (credentials: LoginCredentials, method: 'custom' | 'keycloak') => {
        dispatch({ type: 'AUTH_START' });
        try {
            let response: AxiosResponse;
            if (method === 'custom') {
                response = await axiosInstance.post('/api/auth/login', credentials);
            } else {
                // Keycloak login logic
                response = await axiosInstance.post('/api/auth/keycloak');
            }

            // Check if verification is required (only for custom login)
            if (method === 'custom' && response.data.requiresVerification && response.data.verificationState) {
                dispatch({
                    type: 'REQUIRE_VERIFICATION',
                    payload: response.data.verificationState,
                });
                return;
            }

            // For Keycloak or successful verification, proceed with normal login
            if (response.data.user && response.data.token) {
                console.log("saving token and method")
                // Store token and method
                localStorage.setItem('authToken', response.data.token);
                localStorage.setItem('loginMethod', method);

                dispatch({
                    type: 'AUTH_SUCCESS',
                    payload: { user: response.data.user, method },
                });
            } else {
                throw new Error('Invalid response format');
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Login failed';
            dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
        }
    }, []);

    // Logout function
    const logout = useCallback(() => {
        // Clear all authentication-related localStorage items
        localStorage.removeItem('authToken');
        localStorage.removeItem('loginMethod');

        // Clear any verification state
        dispatch({ type: 'LOGOUT' });

        // Optional: Call logout API endpoint to invalidate server-side session
        const token = localStorage.getItem('authToken');
        if (token) {
            axiosInstance
                .post('/api/auth/logout', undefined, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })
                .catch((error: any) => {
                    // Silently handle logout API errors since local logout is more important
                    console.warn('Logout API call failed:', error);
                });
        }
    }, []);

    // Update user function
    const updateUser = useCallback((updates: Partial<User>) => {
        dispatch({ type: 'UPDATE_USER', payload: updates });
    }, []);

    // Clear error function
    const clearError = useCallback(() => {
        dispatch({ type: 'CLEAR_ERROR' });
    }, []);

    // Role checking functions
    const hasRole = useCallback(
        (role: string): boolean => {
            return state.user?.role === role;
        },
        [state.user?.role]
    );

    const isAdmin = useCallback((): boolean => {
        return state.user?.role === 'admin';
    }, [state.user?.role]);

    // Complete verification function
    const completeVerification = useCallback(async () => {
        if (!state.verificationState?.tempToken) {
            dispatch({ type: 'AUTH_FAILURE', payload: 'No verification session found' });
            return;
        }
        
        try {
            const response: AxiosResponse = await axiosInstance.post('/api/auth/complete-login', {
                tempToken: state.verificationState.tempToken,
            });

             console.log('completeVerification response ', response);
            if (response.data.user && response.data.token) {
                // Store token and method
                localStorage.setItem('authToken', response.data.token);
                localStorage.setItem('loginMethod', 'custom');

                dispatch({
                    type: 'AUTH_SUCCESS',
                    payload: { user: response.data.user, method: 'custom' },
                });

                // Clear verification state
                dispatch({ type: 'VERIFICATION_SUCCESS' });
            } else {
                dispatch({ type: 'AUTH_FAILURE', payload: 'Failed to complete login' });
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Verification failed';
            dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
        }
    }, [state.verificationState?.tempToken]);

    const contextValue: AuthContextType = useMemo(
        () => ({
            state,
            login,
            logout,
            updateUser,
            clearError,
            hasRole,
            isAdmin,
            completeVerification,
        }),
        [state, login, logout, updateUser, clearError, hasRole, isAdmin, completeVerification]
    );

    //  // console.log("contextValue ", contextValue);
    return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

// Custom hook to use auth context
export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}