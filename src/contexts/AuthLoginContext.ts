import { createContext } from "react";
import User from "../models/user/User";

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  loginMethod: "custom" | "keycloak" | null;
  verificationState: VerificationState | null;
}

export type AuthAction =
  | { type: "AUTH_START" }
  | {
    type: "AUTH_SUCCESS";
    payload: { state: AuthState, user: User; method: "custom" | "keycloak" };
  }
  | { type: "AUTH_FAILURE"; payload: string }
  | { type: "LOGOUT" }
  | { type: "UPDATE_USER"; payload: Partial<User> }
  | { type: "CLEAR_ERROR" }
  | { type: "REQUIRE_VERIFICATION"; payload: VerificationState }
  | { type: "VERIFICATION_SUCCESS" };

export const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  loginMethod: null,
  verificationState: null,
};

export function authReducer(state: AuthState, action: AuthAction): AuthState {
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

export interface AuthContextType {
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

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
