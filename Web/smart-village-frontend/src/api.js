import axios from 'axios';

// Create API instance with base URL
const api = axios.create({
    baseURL: 'https://localhost:7044/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add request interceptor for adding auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor for handling auth errors and other responses
api.interceptors.response.use(
    // On successful response
    (response) => response,
    // On error response
    (error) => {
        // Create a copy of the original request for potential retries
        const originalRequest = error.config;

        // Check for specific error status codes
        if (error.response) {
            const { status } = error.response;

            // Handle authentication errors
            if (status === 401) {
                // Clear auth data
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                localStorage.removeItem('expires_at');

                // Make sure we don't create a redirect loop
                if (!originalRequest._retry) {
                    originalRequest._retry = true;

                    // Store the current path for redirection after login
                    const currentPath = window.location.pathname;

                    // Only redirect if we're not on the login or register page
                    if (currentPath !== '/login' && currentPath !== '/register') {
                        // Store intended destination to redirect back after login
                        sessionStorage.setItem('redirectAfterLogin', currentPath);

                        // Redirect to login page
                        window.location.href = '/login';
                    }
                }
            }

            // Handle forbidden (permission) errors
            if (status === 403) {
                console.error('Permission denied');

                // User doesn't have permission, redirect to dashboard
                const currentPath = window.location.pathname;
                if (currentPath.includes('/admin')) {
                    window.location.href = '/dashboard';
                }
            }

            // Handle server errors
            if (status >= 500) {
                console.error('Server error:', error.response.data);
            }
        } else if (error.request) {
            // The request was made but no response was received
            console.error('Network error - no response received:', error.request);
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error('Request configuration error:', error.message);
        }

        return Promise.reject(error);
    }
);

export default api;