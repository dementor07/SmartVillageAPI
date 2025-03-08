// Web/smart-village-frontend/src/components/dashboard/Dashboard.js
import React from 'react';
import { Link } from 'react-router-dom';
import AuthService from '../../services/auth.service';
import AdminDashboard from './AdminDashboard';
import UserDashboard from './UserDashboard';

const Dashboard = () => {
    const isAdmin = AuthService.isAdmin();

    return isAdmin ? <AdminDashboard /> : <UserDashboard />;
};

export default Dashboard;