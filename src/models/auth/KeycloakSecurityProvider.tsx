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
            ...(storedToken && storedRefreshToken ? {
                token: storedToken,
                refreshToken: storedRefreshToken
            } : {})
        }).then((authenticated) => {
            if (authenticated) {
                console.log("authenticated: ", authenticated);
                // Store tokens on successful init
                localStorage.setItem('kc_token', keycloak.token!);
                localStorage.setItem('kc_refresh_token', keycloak.refreshToken!);
                addAccessTokenToAuthHeader(keycloak.token);
            } else {
                // Clear tokens if not authenticated
                localStorage.removeItem('kc_token');
                localStorage.removeItem('kc_refresh_token');
                removeAccessTokenFromAuthHeader();
            }
            setIsInitialized(true);
        }).catch((error) => {
            console.error('Keycloak init failed:', error);
            removeAccessTokenFromAuthHeader();
            setIsInitialized(true);
        });
    }, [keycloak])

    keycloak.onAuthSuccess = () => {
        localStorage.setItem('kc_token', JSON.stringify(keycloak.token));
        localStorage.setItem('kc_refresh_token', JSON.stringify(keycloak.refreshToken));
        addAccessTokenToAuthHeader(keycloak.token)
    }

    keycloak.onAuthLogout = () => {
        localStorage.removeItem('kc_token');
        localStorage.removeItem('kc_refresh_token');
        removeAccessTokenFromAuthHeader()
    }

    keycloak.onAuthError = () => {
        removeAccessTokenFromAuthHeader()
    }

    keycloak.onTokenExpired = () => {
        keycloak.updateToken(30).then((refreshed) => {
            if (refreshed) {
                localStorage.setItem('kc_token', keycloak.token!);
                localStorage.setItem('kc_refresh_token', keycloak.refreshToken!);
                addAccessTokenToAuthHeader(keycloak.token);
            } else {
                console.warn('Token refresh failed');
                keycloak.logout({ redirectUri: window.location.origin });
            }
        }).catch(() => {
            console.error('Token refresh error');
            keycloak.logout({ redirectUri: window.location.origin });
        });
    }

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