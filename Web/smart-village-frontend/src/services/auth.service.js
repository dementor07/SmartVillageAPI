import { jwtDecode } from 'jwt-decode';
import api from '../api';

// Enhanced Auth Service with persistent session and token management
const AuthService = {
    // Register a new user
    register: (userData) => {
        return api.post('/User/register', userData);
    },

    // Login user with email and password
    login: async (email, password) => {
        try {
            const response = await api.post('/User/login', { emailId: email, password });
            if (response.data?.token) {
                // Save auth data to localStorage for persistence
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data));

                // Set token expiration timestamp (if not in token itself)
                const decoded = jwtDecode(response.data.token);
                if (!decoded.exp) {
                    // If token doesn't contain expiration, set default (2 hours)
                    const expiresAt = new Date();
                    expiresAt.setHours(expiresAt.getHours() + 2);
                    localStorage.setItem('expires_at', expiresAt.getTime().toString());
                }
            }
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Log out user by removing all stored data
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('expires_at');
        // Force redirect to home page
        window.location.href = '/';
    },

    // Get current logged in user data
    getCurrentUser: () => {
        try {
            // Check if token is valid first
            if (!AuthService.isTokenValid()) {
                return null;
            }
            const userStr = localStorage.getItem('user');
            if (!userStr) return null;
            return JSON.parse(userStr);
        } catch {
            AuthService.logout();
            return null;
        }
    },

    // Check if the token is still valid
    isTokenValid: () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return false;

            const decoded = jwtDecode(token);
            const currentTime = Date.now() / 1000;

            // Check if token is expired
            if (decoded.exp && decoded.exp < currentTime) {
                // Token has expired, clean up and return false
                AuthService.logout();
                return false;
            }

            return true;
        } catch {
            // If any error occurs during validation, consider token invalid
            AuthService.logout();
            return false;
        }
    },

    // Check if current user is admin
    isAdmin: () => {
        try {
            const user = AuthService.getCurrentUser();
            return user && user.role === 'Admin';
        } catch {
            return false;
        }
    }
};

export default AuthService;