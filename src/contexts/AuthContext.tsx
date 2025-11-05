// src/context/AuthProvider.tsx
import {
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
import { authReducer, AuthContextType, initialState, LoginCredentials, AuthContext, AuthState } from './AuthLoginContext'

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const { keycloak, isInitialized, isAuthenticated: isKeycloakAuthenticated } = useSecurityContext(); // Get Keycloak status

  // --- Improved initialization useEffect ---
  useEffect(() => {
    console.log("AuthProvider useEffect triggered. isInitialized:", isInitialized);
    const initializeAuth = async () => {
      // Wait for Keycloak to be initialized first
      if (!isInitialized) {
        console.log("Keycloak not initialized yet, waiting...");
        // Keep isLoading true while waiting for Keycloak
        if (!state.isLoading) {
          dispatch({ type: "AUTH_START" }); // Explicitly set loading if not already
        }
        return; // Exit early, wait for next render when isInitialized changes
      }

      console.log("Keycloak initialized. isKeycloakAuthenticated:", isKeycloakAuthenticated());
      const loginMethod = localStorage.getItem("loginMethod") as "custom" | "keycloak" | null;

      // Determine the login method if not already set in localStorage (optional improvement)
      // This handles cases where user directly hits a Keycloak login URL
      // const determinedLoginMethod = loginMethod || (isKeycloakAuthenticated() ? 'keycloak' : null);

      if (loginMethod === 'keycloak') {
        console.log("Login method is Keycloak, syncing...");
        await syncKeycloak();
      } else if (loginMethod === 'custom') {
        console.log("Login method is Custom, checking session...");
        await checkExistingSession();
      } else {
        // No login method found in localStorage
        console.log("No login method found in localStorage.");
        // Optionally, you could check if Keycloak is authenticated here
        // and decide whether to sync or leave unauthenticated.
        // For now, just finish loading.
        dispatch({ type: "AUTH_FAILURE", payload: "Not logged in" }); // Or just finish loading without error
        dispatch({ type: "AUTH_START" }); // Dummy dispatch to finish loading state
        dispatch({ type: "AUTH_FAILURE", payload: "No active session" }); // Or LOGOUT if you want to reset state cleanly
        dispatch({ type: "LOGOUT" }); // This sets isLoading to false
      }
    };

    initializeAuth();
  }, [isInitialized, isKeycloakAuthenticated]); // Re-run when Keycloak status changes


  const checkExistingSession = async () => {
    dispatch({ type: "AUTH_START" }); // Ensure loading state is set
    const token = localStorage.getItem("authToken"); // Use custom token for custom login
    const loginMethod = localStorage.getItem("loginMethod") as "custom" | "keycloak" | null;

    console.log("Checking existing custom session. Token present:", !!token, "Method:", loginMethod);

    if (token && loginMethod === 'custom') {
      try {
        console.log("Validating custom session token...");
        const response: AxiosResponse<{user: User, authState: AuthState}> = await axiosInstance.get("/api/auth/validate", {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Custom session validation successful.");
        dispatch({
          type: "AUTH_SUCCESS",
          payload: {state: response.data.authState, user: response.data.user, method: loginMethod },
        });
      } catch (error: any) {
        console.error("Custom session validation failed:", error.message);
        localStorage.removeItem("authToken");
        localStorage.removeItem("loginMethod");
        // Don't logout Keycloak here unless specifically needed
        const errorMessage = error.response?.data?.message || "Session validation failed";
        dispatch({ type: "AUTH_FAILURE", payload: errorMessage });
      }
    } else {
      // If method is not custom or token missing for custom login
      console.log("No valid custom session found.");
      dispatch({ type: "LOGOUT" }); // Finish loading, user is not authenticated via custom method
    }
  };

  const syncKeycloak = async () => {
    dispatch({ type: "AUTH_START" }); // Ensure loading state is set
    const loginMethod = localStorage.getItem("loginMethod") as "keycloak" | null; // Type assertion

    console.log("Syncing Keycloak. Login method in storage:", loginMethod);

    if (loginMethod === 'keycloak' && isKeycloakAuthenticated()) {
      try {
        console.log("Keycloak authenticated, fetching user data from backend...");
        // Ensure we have the latest token from Keycloak instance
        const accessToken = keycloak.token;
        if (!accessToken) {
          console.error("Keycloak authenticated but no access token available!");
          dispatch({ type: "AUTH_FAILURE", payload: "Keycloak token missing" });
          return;
        }

        // Call your backend to exchange Keycloak token for app-specific user/token
        const response = await axiosInstance.post("/api/auth/keycloak/login", {
          accessToken: accessToken, // Use token from keycloak instance
          // email and keycloakObject usually not needed if backend validates token
          email: keycloak.tokenParsed?.email,
          isAuthenticated: keycloak?.authenticated,
          keycloakObject: keycloak
        });

        if (response.data.token && response.data.user) {
          console.log("Keycloak sync successful, storing app token.");
          // Store the application-specific token and method
          localStorage.setItem('authToken', response.data.token);
          localStorage.setItem('loginMethod', loginMethod);

          dispatch({
            type: 'AUTH_SUCCESS',
            payload: { state: response.data, user: response.data.user, method: loginMethod },
          });
        } else {
          throw new Error('Invalid Keycloak sync response format');
        }
      } catch (error: any) {
        console.error("Keycloak sync failed:", error);
        localStorage.removeItem("authToken");
        localStorage.removeItem("loginMethod");
        // Logout from Keycloak if sync fails?
        // keycloak.logout();
        const errorMessage = error.response?.data?.message || "Keycloak session sync failed";
        dispatch({ type: "AUTH_FAILURE", payload: errorMessage });
      }
    } else {
      // Keycloak not authenticated or method mismatch
      console.log("Keycloak not authenticated or method mismatch during sync.");
      localStorage.removeItem("authToken");
      localStorage.removeItem("loginMethod");
      dispatch({ type: "LOGOUT" }); // Finish loading, user is not authenticated via Keycloak
    }
  };
  // --- Login function (mostly stays the same, minor adjustments) ---
  const login = useCallback(async (credentials?: LoginCredentials, method: "custom" | "keycloak" = "custom") => {
    dispatch({ type: "AUTH_START" });
    localStorage.setItem("loginMethod", method); // Set method early

    try {
      if (method === "keycloak") {
        console.log("Initiating Keycloak login...");
        if (!isKeycloakAuthenticated()) {
          keycloak.login(); // This redirects, so code below won't run immediately
        } else {
           // If already authenticated, sync
           await syncKeycloak();
        }
        // Return early as login redirects
        return;
      } else if (method === "custom") {
        console.log("Initiating Custom login...");
        const response = await axiosInstance.post("/api/auth/login", credentials);

        if (response.data.requiresVerification && response.data.verificationState) {
          console.log("Custom login requires verification.");
          dispatch({
            type: "REQUIRE_VERIFICATION",
            payload: response.data.verificationState,
          });
          return; // Stay in verification state
        }

        if (response.data.user && response.data.token) {
          console.log("Custom login successful, storing token.");
          localStorage.setItem('authToken', response.data.token);
          localStorage.setItem('loginMethod', method);

          dispatch({
            type: 'AUTH_SUCCESS',
            payload: {state: response.data, user: response.data.user, method },
          });
        } else {
          throw new Error('Invalid custom login response format');
        }
      }
    } catch (error: any) {
      console.error("Login failed:", error);
      localStorage.removeItem("authToken");
      localStorage.removeItem("loginMethod");
      const msg = error.response?.data?.message || "Login failed";
      dispatch({ type: "AUTH_FAILURE", payload: msg });
      // alert(msg); // Consider less intrusive error display
    }
  }, [keycloak, isKeycloakAuthenticated]); // Add dependencies

  // --- Logout function ---
  const logout = useCallback(() => {
    console.log("Logging out...");
    localStorage.removeItem("authToken");
    localStorage.removeItem("loginMethod");
    removeAccessTokenFromAuthHeader();

    // Logout from Keycloak if logged in via Keycloak
    const loginMethod = localStorage.getItem("loginMethod") as "custom" | "keycloak" | null;
    if (loginMethod === 'keycloak' && isKeycloakAuthenticated()) {
        keycloak.logout(); // Redirects to Keycloak logout
    }

    dispatch({ type: "LOGOUT" });
  }, [keycloak, isKeycloakAuthenticated]); // Add dependencies

  // ... updateUser, clearError, hasRole, isAdmin remain the same ...

  // --- Complete Verification ---
  const completeVerification = useCallback(async () => {
    if (!state.verificationState?.tempToken) {
      const errorMsg = "No verification session";
      console.error(errorMsg);
      dispatch({ type: "AUTH_FAILURE", payload: errorMsg });
      return;
    }

    dispatch({ type: "AUTH_START" }); // Show loading during verification
    try {
      const response = await axiosInstance.post("/api/auth/complete-login", {
        tempToken: state.verificationState.tempToken,
      });

      if (response.data.user && response.data.token) {
        const loginMethod = localStorage.getItem("loginMethod") as "custom" | "keycloak" | null;
        if (loginMethod === "custom") {
          console.log("Verification successful for custom login, storing token.");
          localStorage.setItem('authToken', response.data.token);
          localStorage.setItem('loginMethod', loginMethod);
        } else {
           // Handle verification for Keycloak? Usually not needed, Keycloak handles it.
           console.warn("Complete verification called but login method is not 'custom'");
        }
        dispatch({
          type: "AUTH_SUCCESS",
          payload: {state: response.data, user: response.data.user, method: loginMethod || 'custom' }, // Default to custom if missing?
        });
        dispatch({ type: "VERIFICATION_SUCCESS" });
      } else {
        throw new Error("Invalid verification response");
      }
    } catch (error: any) {
      console.error("Verification failed:", error);
      const msg = error.response?.data?.message || "Verification failed";
      dispatch({ type: "AUTH_FAILURE", payload: msg });
    }
  }, [state.verificationState?.tempToken]);


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

