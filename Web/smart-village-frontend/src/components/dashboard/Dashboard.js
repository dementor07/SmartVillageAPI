import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import AuthService from '../../services/auth.service';
import AdminDashboard from './AdminDashboard';
import UserDashboard from './UserDashboard';

const Dashboard = () => {
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        // Check authentication and admin status
        const authenticated = AuthService.isTokenValid();
        setIsAuthenticated(authenticated);

        if (authenticated) {
            setIsAdmin(AuthService.isAdmin());
        }

        setLoading(false);
    }, []);

    // Show loading state
    if (loading) {
        return (
            <div className="container mt-4">
                <div className="d-flex justify-content-center my-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            </div>
        );
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    // Render the appropriate dashboard based on role
    return isAdmin ? <AdminDashboard /> : <UserDashboard />;
};

export default Dashboard;