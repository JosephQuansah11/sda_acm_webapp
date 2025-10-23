import { ComponentType, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// HOC options interface
interface WithAuthOptions {
    requireAuth?: boolean;
    requiredRoles?: string[];
    redirectTo?: string;
    fallbackComponent?: ComponentType;
}

// Default options
const defaultOptions: WithAuthOptions = {
    requireAuth: true,
    requiredRoles: [],
    redirectTo: '/login',
    fallbackComponent: undefined,
};

// Higher-Order Component for authentication and authorization
export function withAuth<P extends object>(
    WrappedComponent: ComponentType<P>,
    options: WithAuthOptions = {}
) {
    const mergedOptions = { ...defaultOptions, ...options };
    
    const AuthenticatedComponent = (props: P) => {
        const { state, hasRole, isAdmin } = useAuth();
        const navigate = useNavigate();
        const location = useLocation();
        
        const { 
            requireAuth, 
            requiredRoles, 
            redirectTo, 
            fallbackComponent: FallbackComponent 
        } = mergedOptions;

        useEffect(() => {
            // If authentication is required but user is not authenticated
            if (requireAuth && !state.isAuthenticated && !state.isLoading) {
                // Store the attempted location for redirect after login
                navigate(redirectTo!, { 
                    state: { from: location.pathname },
                    replace: true 
                });
                return;
            }

            // If specific roles are required
            if (
                requireAuth && 
                state.isAuthenticated && 
                requiredRoles && 
                requiredRoles.length > 0
            ) {
                const hasRequiredRole = requiredRoles.some(role => {
                    if (role === 'ADMIN') return isAdmin();
                    return hasRole(role);
                });

                if (!hasRequiredRole) {
                    // Redirect to unauthorized page or home
                    navigate('/unauthorized', { replace: true });
                    return;
                }
            }
        }, [
            state.isAuthenticated, 
            state.isLoading, 
            state.user, 
            hasRole,
            isAdmin,
            redirectTo,
            requiredRoles,
            requireAuth,
            navigate, 
            location.pathname
        ]);

        // Show loading state
        if (state.isLoading) {
            return (
                <div className="d-flex justify-content-center align-items-center min-vh-100">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            );
        }

        // If authentication is required but user is not authenticated
        if (requireAuth && !state.isAuthenticated) {
            if (FallbackComponent) {
                return <FallbackComponent />;
            }
            return null; // Will redirect in useEffect
        }

        // If specific roles are required but user doesn't have them
        if (
            requireAuth && 
            state.isAuthenticated && 
            requiredRoles && 
            requiredRoles.length > 0
        ) {
            const hasRequiredRole = requiredRoles.some(role => {
                if (role === 'ADMIN') return isAdmin();
                return hasRole(role);
            });

            if (!hasRequiredRole) {
                if (FallbackComponent) {
                    return <FallbackComponent />;
                }
                return (
                    <div className="container mt-5">
                        <div className="alert alert-warning" role="alert">
                            <h4 className="alert-heading">Access Denied</h4>
                            <p>You don't have the required permissions to access this page.</p>
                            <hr />
                            <p className="mb-0">
                                Required roles: {requiredRoles.join(', ')}
                            </p>
                        </div>
                    </div>
                );
            }
        }

        // User is authenticated and authorized, render the component
        return <WrappedComponent {...props} />;
    };

    // Set display name for debugging
    AuthenticatedComponent.displayName = `withAuth(${WrappedComponent.displayName || WrappedComponent.name})`;

    return AuthenticatedComponent;
}

// Convenience HOCs for common use cases
export const withRequireAuth = <P extends object>(Component: ComponentType<P>) =>
    withAuth(Component, { requireAuth: true });

export const withAdminOnly = <P extends object>(Component: ComponentType<P>) =>
    withAuth(Component, { requireAuth: true, requiredRoles: ['ADMIN'] });

export const withModeratorOrAdmin = <P extends object>(Component: ComponentType<P>) =>
    withAuth(Component, { requireAuth: true, requiredRoles: ['ADMIN', 'MODERATOR'] });

export const withOptionalAuth = <P extends object>(Component: ComponentType<P>) =>
    withAuth(Component, { requireAuth: false });

// Hook for checking permissions within components
export function usePermissions() {
    const { state, hasRole, isAdmin } = useAuth();
    
    const checkPermission = (permission: string | string[]): boolean => {
         // console.log("state", state);
        if (!state.isAuthenticated) return false;
        
        if (typeof permission === 'string') {
            if (permission === 'ADMIN') return isAdmin();
            return hasRole(permission);
        }
        
        // Array of permissions - user needs at least one
        return permission.some(perm => {
            if (perm === 'ADMIN') return isAdmin();
            return hasRole(perm);
        });
    };

    const canAccess = (requiredRoles: string[] = []): boolean => {
        if (!state.isAuthenticated) return false;
        if (requiredRoles.length === 0) return true;
        
        return requiredRoles.some(role => {
            if (role === 'ADMIN') return isAdmin();
            return hasRole(role);
        });
    };

    return {
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        isAdmin: isAdmin(),
        hasRole,
        checkPermission,
        canAccess,
    };
}
