import { useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';

type UserStatus = 'active' | 'idle' | 'inactive';

export function useUserActivityTracker() {
    const { state, updateUser } = useAuth();

    const updateUserStatus = useCallback(async (status: UserStatus) => {
        if (state.user && state.user.id) {
            try {
                // In a real implementation, this would make an API call to update the user's status
                // For now, we'll just update the local state
                console.log(`Updating user ${state.user.userName} status to ${status}`);
                
                // Update local state
                updateUser({
                    ...state.user,
                    status,
                    lastActive: new Date()
                });
                
                // In a real implementation, you would also make an API call:
                // await updateUserStatusAPI(state.user.id, status);
            } catch (error) {
                console.error('Failed to update user status:', error);
            }
        }
    }, [state.user, updateUser]);

    useEffect(() => {
        if (state.isAuthenticated && state.user) {
            // Update user status to active when they're on the page
            updateUserStatus('active');
            
            // Set up activity tracking
            const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
            let activityTimer: NodeJS.Timeout;
            
            const resetActivityTimer = () => {
                // Reset idle timer
                clearTimeout(activityTimer);
                
                // Set user as active
                updateUserStatus('active');
                
                // Set idle timeout (5 minutes)
                activityTimer = setTimeout(() => {
                    updateUserStatus('idle');
                }, 5 * 60 * 1000);
            };
            
            // Add activity listeners
            activityEvents.forEach(event => {
                window.addEventListener(event, resetActivityTimer, true);
            });
            
            // Initialize activity timer
            resetActivityTimer();
            
            // Clean up
            return () => {
                clearTimeout(activityTimer);
                activityEvents.forEach(event => {
                    window.removeEventListener(event, resetActivityTimer, true);
                });
            };
        }
    }, [state.isAuthenticated, state.user, updateUserStatus]);

    // Function to manually set user as inactive (e.g., on logout)
    const setUserInactive = useCallback(() => {
        updateUserStatus('inactive');
    }, [updateUserStatus]);

    return {
        updateUserStatus,
        setUserInactive
    };
}
