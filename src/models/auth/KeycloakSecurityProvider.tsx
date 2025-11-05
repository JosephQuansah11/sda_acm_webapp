import Keycloak from "keycloak-js";
import { useEffect, ReactNode, useContext, useState } from "react";
import { addAccessTokenToAuthHeader, removeAccessTokenFromAuthHeader } from "../../services/auth";
import { isExpired } from 'react-jwt'
import SecurityContext from "../../contexts/SecurityContext";

interface IWithChildren {
    children: ReactNode
    keycloak: Keycloak
}


export function KeycloakSecurityProvider({ keycloak, children }: IWithChildren) {
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        const storedToken = localStorage.getItem('kc_token');
        const storedRefreshToken = localStorage.getItem('kc_refresh_token');

        keycloak.init({
            onLoad: "check-sso",
            // silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
            checkLoginIframe: true,
            pkceMethod: "S256",
            // Pass tokens correctly if they exist
            ...(storedToken && storedRefreshToken ? {
                token: storedToken,
                refreshToken: storedRefreshToken
            } : {})
        }).then((authenticated) => {
            console.log("Keycloak init result - Authenticated:", authenticated);
            if (authenticated) {
                // Ensure tokens are available after init
                if (keycloak.token && keycloak.refreshToken) {
                    console.log("Storing tokens after successful init");
                    localStorage.setItem('kc_token', keycloak.token); // No JSON.stringify
                    localStorage.setItem('kc_refresh_token', keycloak.refreshToken); // No JSON.stringify
                    addAccessTokenToAuthHeader(keycloak.token);
                } else {
                    console.warn("Authenticated but tokens missing after init!");
                    // Treat as not authenticated if tokens are missing
                    localStorage.removeItem('kc_token');
                    localStorage.removeItem('kc_refresh_token');
                    removeAccessTokenFromAuthHeader();
                }
            } else {
                console.log("User not authenticated via Keycloak init.");
                localStorage.removeItem('kc_token');
                localStorage.removeItem('kc_refresh_token');
                removeAccessTokenFromAuthHeader();
            }
            setIsInitialized(true); // Signal completion regardless of auth status
        }).catch((error) => {
            console.error('Keycloak initialization failed:', error);
            localStorage.removeItem('kc_token');
            localStorage.removeItem('kc_refresh_token');
            removeAccessTokenFromAuthHeader();
            setIsInitialized(true); // Signal completion even on error
        });
    }, [keycloak]); // Ensure keycloak instance is stable

    // --- Fix token storage in event handlers ---
    keycloak.onAuthSuccess = () => {
        console.log("Keycloak onAuthSuccess triggered");
        // Store token strings directly, not JSON strings
        if (keycloak.token && keycloak.refreshToken) {
            localStorage.setItem('kc_token', keycloak.token); // Fix here
            localStorage.setItem('kc_refresh_token', keycloak.refreshToken); // Fix here
            addAccessTokenToAuthHeader(keycloak.token);
        }
    };

    keycloak.onAuthLogout = () => {
        console.log("Keycloak onAuthLogout triggered");
        localStorage.removeItem('kc_token');
        localStorage.removeItem('kc_refresh_token');
        removeAccessTokenFromAuthHeader();
    };

    keycloak.onAuthError = () => {
        console.log("Keycloak onAuthError triggered");
        // Optionally remove tokens on auth error
        // localStorage.removeItem('kc_token');
        // localStorage.removeItem('kc_refresh_token');
        removeAccessTokenFromAuthHeader();
    };

    keycloak.onTokenExpired = () => {
        console.log("Keycloak token expired, attempting refresh...");
        keycloak.updateToken(30).then((refreshed) => {
            if (refreshed) {
                console.log("Keycloak token successfully refreshed");
                // Store the NEW refreshed tokens directly
                if (keycloak.token && keycloak.refreshToken) {
                    localStorage.setItem('kc_token', keycloak.token); // Fix here
                    localStorage.setItem('kc_refresh_token', keycloak.refreshToken); // Fix here
                    addAccessTokenToAuthHeader(keycloak.token); // Update axios header
                }
            } else {
                console.warn('Keycloak token refresh failed (not refreshed)');
                // Consider logout if refresh fails
                keycloak.logout({ redirectUri: window.location.origin });
            }
        }).catch((error) => {
            console.error('Keycloak token refresh error:', error);
            // Clear tokens and logout on refresh error
            localStorage.removeItem('kc_token');
            localStorage.removeItem('kc_refresh_token');
            removeAccessTokenFromAuthHeader();
            keycloak.logout({ redirectUri: window.location.origin });
        });
    };

    function keycloakLogin() {
        keycloak.login()
    }

    function keycloakLogout() {
        localStorage.removeItem('kc_token');
        localStorage.removeItem('kc_refresh_token');
        const logoutOptions = { redirectUri: "http://localhost:5173/" }
        keycloak.logout(logoutOptions)
    }

    function isAuthenticated() {
        return keycloak.authenticated || false;
    }


    return (
        <SecurityContext.Provider
            value={{
                keycloak,
                isAuthenticated,
                keycloakLogin,
                keycloakLogout,
                isInitialized // Expose initialization status
            }}
        >
            {children}
        </SecurityContext.Provider>
    )

}

export function useSecurityContext() {
    return useContext(SecurityContext);
}