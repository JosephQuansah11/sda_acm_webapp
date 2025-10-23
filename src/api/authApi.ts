import axios from 'axios';
import { LoginCredentials } from '../contexts/AuthContext';
import User from '../models/user/User';

// Create axios instance with base configuration
const authApi = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
authApi.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle auth errors
authApi.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('authToken');
            localStorage.removeItem('loginMethod');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth API interfaces
export interface LoginResponse {
    user: User;
    token: string;
    refreshToken?: string;
    expiresIn: number;
}

export interface RegisterRequest {
    name: string;
    email?: string;
    telephone?: string;
    password: string;
    identifierType: 'email' | 'phone';
    firstName?: string;
    lastName?: string;
}

export interface RegisterResponse {
    user: User;
    token: string;
    message: string;
}

export interface ValidateTokenResponse {
    user: User;
    valid: boolean;
}

export interface RefreshTokenResponse {
    token: string;
    expiresIn: number;
}

// Auth API functions
export const authApiService = {
    // Custom login with email or phone
    async login(credentials: LoginCredentials): Promise<LoginResponse> {
        const response = await authApi.post<LoginResponse>('/auth/login', credentials);
        return response.data;
    },

    // Register new user
    async register(userData: RegisterRequest): Promise<RegisterResponse> {
        const response = await authApi.post<RegisterResponse>('/auth/register', userData);
        return response.data;
    },

    // Validate current token
    async validateToken(): Promise<ValidateTokenResponse> {
        const response = await authApi.get<ValidateTokenResponse>('/auth/validate');
        return response.data;
    },

    // Refresh token
    async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
        const response = await authApi.post<RefreshTokenResponse>('/auth/refresh', {
            refreshToken,
        });
        return response.data;
    },

    // Logout
    async logout(): Promise<void> {
        try {
            await authApi.post('/auth/logout');
        } catch (error) {
            // Even if logout fails on server, clear local storage
            console.warn('Logout request failed:', error);
        } finally {
            localStorage.removeItem('authToken');
            localStorage.removeItem('loginMethod');
            localStorage.removeItem('refreshToken');
        }
    },

    // Keycloak login initiation
    async initiateKeycloakLogin(): Promise<{ redirectUrl: string }> {
        const response = await authApi.get<{ redirectUrl: string }>('/auth/keycloak/login');
        return response.data;
    },

    // Keycloak callback handling
    async handleKeycloakCallback(code: string, state: string): Promise<LoginResponse> {
        const response = await authApi.post<LoginResponse>('/auth/keycloak/callback', {
            code,
            state,
        });
        return response.data;
    },

    // Forgot password
    async forgotPassword(identifier: string, identifierType: 'email' | 'phone'): Promise<{ message: string }> {
        const response = await authApi.post<{ message: string }>('/auth/forgot-password', {
            identifier,
            identifierType,
        });
        return response.data;
    },

    // Reset password
    async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
        const response = await authApi.post<{ message: string }>('/auth/reset-password', {
            token,
            newPassword,
        });
        return response.data;
    },

    // Change password
    async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
        const response = await authApi.post<{ message: string }>('/auth/change-password', {
            currentPassword,
            newPassword,
        });
        return response.data;
    },

    // Get user profile
    async getUserProfile(): Promise<User> {
        const response = await authApi.get<User>('/user/profile');
        return response.data;
    },

    // Update user profile
    async updateUserProfile(updates: Partial<User>): Promise<User> {
        const response = await authApi.put<User>('/user/profile', updates);
        return response.data;
    },

    // Update user preferences
    async updateUserPreferences(preferences: any): Promise<{ message: string }> {
        const response = await authApi.put<{ message: string }>('/user/preferences', preferences);
        return response.data;
    },

    // Get user activity log
    async getUserActivity(limit: number = 50): Promise<any[]> {
        const response = await authApi.get<any[]>(`/user/activity?limit=${limit}`);
        return response.data;
    },

    // Get active sessions
    async getActiveSessions(): Promise<any[]> {
        const response = await authApi.get<any[]>('/user/sessions');
        return response.data;
    },

    // Revoke session
    async revokeSession(sessionId: string): Promise<{ message: string }> {
        const response = await authApi.delete<{ message: string }>(`/user/sessions/${sessionId}`);
        return response.data;
    },

    // Revoke all sessions
    async revokeAllSessions(): Promise<{ message: string }> {
        const response = await authApi.delete<{ message: string }>('/user/sessions');
        return response.data;
    },

    // Delete account
    async deleteAccount(password: string): Promise<{ message: string }> {
        const response = await authApi.delete<{ message: string }>('/user/account', {
            data: { password },
        });
        return response.data;
    },

    // Export user data
    async exportUserData(): Promise<Blob> {
        const response = await authApi.get('/user/export', {
            responseType: 'blob',
        });
        return response.data;
    },
};

// Utility functions
export const authUtils = {
    // Check if token is expired
    isTokenExpired(token: string): boolean {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.exp * 1000 < Date.now();
        } catch (error) {
            return true;
        }
    },

    // Get token expiration time
    getTokenExpiration(token: string): Date | null {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return new Date(payload.exp * 1000);
        } catch (error) {
            return null;
        }
    },

    // Format identifier for display
    formatIdentifier(identifier: string, type: 'email' | 'phone'): string {
        if (type === 'email') {
            return identifier;
        } else {
            // Format phone number
            const cleaned = identifier.replace(/\D/g, '');
            if (cleaned.length === 10) {
                return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
            }
            return identifier;
        }
    },

    // Validate identifier
    validateIdentifier(identifier: string, type: 'email' | 'phone'): boolean {
        if (type === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(identifier);
        } else {
            const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
            return phoneRegex.test(identifier.replace(/\D/g, ''));
        }
    },
};

export default authApi;
