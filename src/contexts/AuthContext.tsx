// src/context/AuthProvider.tsx
import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
  useCallback,
  useMemo,
} from "react";
import axiosInstance from "../api/authPromise";
import type { AxiosResponse } from "axios";
import User from "../models/user/User";
import {
  removeAccessTokenFromAuthHeader,
} from "../services/auth";
import { useSecurityContext } from "../models/auth/KeycloakSecurityProvider";

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  loginMethod: "custom" | "keycloak" | null;
  verificationState: VerificationState | null;
}

type AuthAction =
  | { type: "AUTH_START" }
  | {
    type: "AUTH_SUCCESS";
    payload: { user: User; method: "custom" | "keycloak" };
  }
  | { type: "AUTH_FAILURE"; payload: string }
  | { type: "LOGOUT" }
  | { type: "UPDATE_USER"; payload: Partial<User> }
  | { type: "CLEAR_ERROR" }
  | { type: "REQUIRE_VERIFICATION"; payload: VerificationState }
  | { type: "VERIFICATION_SUCCESS" };

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  loginMethod: null,
  verificationState: null,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "AUTH_START":
      return { ...state, isLoading: true, error: null };
    case "AUTH_SUCCESS":
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        loginMethod: action.payload.method,
      };
    case "AUTH_FAILURE":
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
        loginMethod: null,
      };
    case "LOGOUT":
      return { ...initialState, isLoading: false };
    case "UPDATE_USER":
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null,
      };
    case "CLEAR_ERROR":
      return { ...state, error: null };
    case "REQUIRE_VERIFICATION":
      return {
        ...state,
        isLoading: false,
        verificationState: action.payload,
        error: null,
      };
    case "VERIFICATION_SUCCESS":
      return { ...state, verificationState: null };
    default:
      return state;
  }
}

interface AuthContextType {
  state: AuthState;
  login: (
    credentials?: LoginCredentials,
    method?: "custom" | "keycloak",
  ) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  hasRole: (role: string) => boolean;
  isAdmin: () => boolean;
  clearError: () => void;
  completeVerification: () => Promise<void>;
}

export interface LoginCredentials {
  identifier: string;
  password: string;
  identifierType: "email" | "phone";
}

export interface VerificationState {
  isVerificationRequired: boolean;
  identifier: string;
  type: "email" | "sms";
  tempToken?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const { keycloak, isInitialized } = useSecurityContext(); // Get initialization status

  useEffect( () => {
    const loginMethod = localStorage.getItem("loginMethod") as
    | "custom"
    | "keycloak"
    | null;
    const initialize = async () => {
      if (!isInitialized){
        return;
      }else if(isInitialized && loginMethod === 'keycloak'){
        await checkExistingSession();
        await syncKeycloak();
        // Wait for Keycloak initialization
      } else{
        await checkExistingSession();
      }
    }
    initialize();
}, [isInitialized]);

  const checkExistingSession = async () => {
    let token = localStorage.getItem("authToken");
    const loginMethod = localStorage.getItem("loginMethod") as
      | "custom"
      | "keycloak"
      | null;
      console.log("checking existing token: ", token)
    if (token && loginMethod) {
      dispatch({ type: "AUTH_START" });
      try {
        const response: AxiosResponse<User> = await axiosInstance.get(
          "/api/auth/validate",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        dispatch({
          type: "AUTH_SUCCESS",
          payload: { user: response.data, method: loginMethod },
        });
      } catch (error: any) {
        console.log("somhow we got here", error.message)
        localStorage.removeItem("authToken");
        localStorage.removeItem("loginMethod");
        keycloak.logout();
        const errorMessage =
          error.response?.data?.message || "Session validation failed";
        dispatch({ type: "AUTH_FAILURE", payload: errorMessage });
      }
    }
  }

  const syncKeycloak = async () => {
    const loginMethod = localStorage.getItem("loginMethod") as "keycloak";
    if (loginMethod === 'keycloak') {
      if (keycloak.authenticated) {
        try {
          // Call your backend to get full User object
          const response = await axiosInstance.post("/api/auth/keycloak/login", {
            accessToken: keycloak.token,
            email: keycloak.tokenParsed?.email,
            isAuthenticated: keycloak?.authenticated,
            keycloakObject: keycloak
          });

          if (response.data.token) {
            dispatch({ type: "AUTH_START" });
            try {
              if (response.data.user && response.data.token) {
                // Store token and method
                localStorage.setItem('authToken', response.data.token);
                localStorage.setItem('loginMethod', loginMethod);

                dispatch({
                  type: 'AUTH_SUCCESS',
                  payload: { user: response.data.user, method: loginMethod },
                });
              }

            } catch (error: any) {
              localStorage.removeItem("authToken");
              localStorage.removeItem("loginMethod");
              const errorMessage = error.validationResponse?.data?.message || "Session validation failed";
              dispatch({ type: "AUTH_FAILURE", payload: errorMessage });
            }
          }

        } catch (error: any) {
          console.error("Keycloak sync failed:", error);
          keycloak.logout();
        }
      }
    }
  };

  // Custom login
  const login = useCallback(
    async (
      credentials?: LoginCredentials,
      method: "custom" | "keycloak" = "custom",
    ) => {

      dispatch({ type: "AUTH_START" });

      try {
        if (method === "keycloak") {
          localStorage.setItem("loginMethod", method);
          try {
            if (!keycloak.authenticated) {
              keycloak.login();
            }

            return;
          } catch (error: any) {
            const msg = error.message || "Keycloak login failed";
            dispatch({ type: "AUTH_FAILURE", payload: msg });
          }
        } else if (method === "custom") {
          localStorage.setItem('loginMethod', method);
          // Custom login
          const response = await axiosInstance.post(
            "/api/auth/login",
            credentials,
          );

          if (method === 'custom' &&
            response.data.requiresVerification &&
            response.data.verificationState
          ) {
            dispatch({
              type: "REQUIRE_VERIFICATION",
              payload: response.data.verificationState,
            });
            return;
          }

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
        }

      } catch (error: any) {
        const msg = error.response?.data?.message || "Login failed";
        dispatch({ type: "AUTH_FAILURE", payload: msg });
        alert(msg);
      }
    },
    [],
  );

  const logout = useCallback(() => {

    localStorage.removeItem("authToken");
    localStorage.removeItem("loginMethod");
    removeAccessTokenFromAuthHeader();

    dispatch({ type: "LOGOUT" });

  }, []);

  const updateUser = useCallback((updates: Partial<User>) => {
    dispatch({ type: "UPDATE_USER", payload: updates });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: "CLEAR_ERROR" });
  }, []);

  const hasRole = useCallback(
    (role: string): boolean => {
      return state.user?.role === role;
    },
    [state.user?.role],
  );

  const isAdmin = useCallback((): boolean => {
    return hasRole("ADMIN");
  }, [hasRole]);

  const completeVerification = useCallback(async () => {
    if (!state.verificationState?.tempToken) {
      dispatch({ type: "AUTH_FAILURE", payload: "No verification session" });
      return;
    }

    try {
      const response = await axiosInstance.post("/api/auth/complete-login", {
        tempToken: state.verificationState.tempToken,
      });
      
      if (response.data.user && response.data.token) {
        const loginMethod = localStorage.getItem("loginMethod") as "custom" | "keycloak";
        if (loginMethod === "custom") {
          console.log("reached here in complete verification ", response)
          localStorage.setItem('authToken', response.data.token);
          localStorage.setItem('loginMethod', loginMethod);
        }
        // continue checking why state is unauthenticated
        dispatch({
          type: "AUTH_SUCCESS",
          payload: { user: response.data.user, method: loginMethod },
        });
        dispatch({ type: "VERIFICATION_SUCCESS" });
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || "Verification failed";
      dispatch({ type: "AUTH_FAILURE", payload: msg });
    }
  }, [state.isAuthenticated, state.verificationState?.tempToken]);

  const contextValue = useMemo(
    () => ({
      state: { ...state, isLoading: state.isLoading },
      login,
      logout,
      updateUser,
      hasRole,
      isAdmin,
      clearError,
      completeVerification,
    }),
    [
      state,
      login,
      logout,
      updateUser,
      hasRole,
      isAdmin,
      clearError,
      completeVerification,
    ],
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

