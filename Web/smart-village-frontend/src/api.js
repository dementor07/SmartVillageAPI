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
        const originalRequest = error.config;

        // Check for specific error status codes
        if (error.response) {
            const { status } = error.response;

            // Handle authentication errors
            if (status === 401) {
                // Clear auth data and redirect to login
                localStorage.removeItem('token');
                localStorage.removeItem('user');

                // Make sure we don't create a redirect loop
                if (!originalRequest._retry) {
                    // Only redirect if we're not on the login page already
                    const currentPath = window.location.pathname;
                    if (currentPath !== '/login' && currentPath !== '/register') {
                        window.location.href = '/login';
                    }
                }
            }

            // Handle forbidden (permission) errors
            if (status === 403) {
                // User doesn't have permission, redirect to dashboard
                const currentPath = window.location.pathname;
                if (currentPath.includes('/admin')) {
                    window.location.href = '/dashboard';
                }
            }
        }

        return Promise.reject(error);
    }
);

export default api;