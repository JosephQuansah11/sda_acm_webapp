import { createContext } from 'react'
import Keycloak from 'keycloak-js'

export interface ISecurityContext {
    keycloak: Keycloak
    isAuthenticated: () => boolean
    keycloakLogin: () => void
    keycloakLogout: () => void,
    isInitialized: boolean;
}
export default createContext<ISecurityContext>({
    keycloak: {} as any,
    isAuthenticated: () => false,
    keycloakLogin: () => {},
   keycloakLogout: () => {},
   isInitialized: false
})