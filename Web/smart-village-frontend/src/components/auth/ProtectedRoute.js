import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import AuthService from '../../services/auth.service';

/**
 * ProtectedRoute Component
 * 
 * This component provides route protection for authenticated users.
 * It ensures that only logged-in users can access specific routes.
 * 
 * Key Features:
 * - Checks authentication status
 * - Redirects unauthenticated users to login page
 * - Preserves the intended destination for post-login redirection
 */
export const ProtectedRoute = ({ children }) => {
    // Get the current location to preserve intended destination
    const location = useLocation();

    // Verify if the user is authenticated
    const isAuthenticated = AuthService.isTokenValid();

    // If not authenticated, redirect to login
    if (!isAuthenticated) {
        return <Navigate
            to="/login"
            state={{
                from: location,
                message: 'You must be logged in to access this page.'
            }}
            replace
        />;
    }

    // Render the protected child components
    return children;
};

/**
 * AdminRoute Component
 * 
 * This component provides route protection specifically for admin users.
 * It ensures that only authenticated admin users can access admin-specific routes.
 * 
 * Key Features:
 * - Checks both authentication and admin status
 * - Redirects non-admin users to dashboard
 * - Provides clear feedback about access restrictions
 */
export const AdminRoute = ({ children }) => {
    // Get the current location to preserve intended destination
    const location = useLocation();

    // Check authentication and admin privileges
    const isAuthenticated = AuthService.isTokenValid();
    const isAdmin = AuthService.isAdmin();

    // If not authenticated or not an admin, redirect to dashboard
    if (!isAuthenticated || !isAdmin) {
        return <Navigate
            to="/dashboard"
            state={{
                from: location,
                message: 'You do not have permission to access this page.'
            }}
            replace
        />;
    }

    // Render the admin-only child components
    return children;
};

/**
 * Enhanced Route Protection Utilities
 * 
 * These utilities provide additional flexibility and context for route protection
 */
export const RouteProtectionUtils = {
    /**
     * Check if a user can access a specific route type
     * @param {string} routeType - Type of route ('protected' or 'admin')
     * @returns {boolean} - Whether the user can access the route
     */
    canAccessRoute: (routeType) => {
        const isAuthenticated = AuthService.isTokenValid();

        switch (routeType) {
            case 'protected':
                return isAuthenticated;
            case 'admin':
                return isAuthenticated && AuthService.isAdmin();
            default:
                return false;
        }
    },

    /**
     * Get appropriate redirect path based on authentication status
     * @param {string} routeType - Type of route
     * @returns {string} - Redirect path
     */
    getRedirectPath: (routeType) => {
        switch (routeType) {
            case 'protected':
                return '/login';
            case 'admin':
                return '/dashboard';
            default:
                return '/';
        }
    }
};

// Optional: Create a custom hook for easy route protection checks
export const useRouteProtection = () => {
    return {
        isProtectedRoute: RouteProtectionUtils.canAccessRoute('protected'),
        isAdminRoute: RouteProtectionUtils.canAccessRoute('admin')
    };
};