import { jwtDecode } from 'jwt-decode';
import api from '../api';

const register = (userData) => {
    return api.post('/User/register', userData);
};

const login = async (email, password) => {
    try {
        const response = await api.post('/User/login', { emailId: email, password });
        if (response.data?.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data));
        }
        return response.data;
    } catch (error) {
        throw error;
    }
};

const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
};

const getCurrentUser = () => {
    try {
        const userStr = localStorage.getItem('user');
        if (!userStr) return null;
        return JSON.parse(userStr);
    } catch {
        logout();
        return null;
    }
};

const isTokenValid = () => {
    try {
        const token = localStorage.getItem('token');
        if (!token) return false;

        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        return decoded.exp > currentTime;
    } catch {
        logout();
        return false;
    }
};

const isAdmin = () => {
    try {
        const user = getCurrentUser();
        return user && user.role === 'Admin';
    } catch {
        return false;
    }
};

const AuthService = {
    register,
    login,
    logout,
    getCurrentUser,
    isTokenValid,
    isAdmin
};

export default AuthService;