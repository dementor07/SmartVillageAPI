import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthService from '../../services/auth.service';

const Header = () => {
    const [showDropdown, setShowDropdown] = useState(false);
    const [showSchemeDropdown, setShowSchemeDropdown] = useState(false);
    const navigate = useNavigate();

    // Check if user is authenticated
    const isAuthenticated = AuthService.isTokenValid();
    const isAdmin = isAuthenticated && AuthService.isAdmin();
    const user = isAuthenticated ? AuthService.getCurrentUser() : null;

    const handleLogout = () => {
        AuthService.logout();
        navigate('/');
    };

    return (
        <header className="bg-primary py-3 text-white">
            <div className="container">
                <div className="row align-items-center">
                    <div className="col-md-4">
                        <h1 className="mb-0">
                            <Link to="/" className="text-white text-decoration-none">
                                <i className="fas fa-solar-panel me-2"></i>
                                Smart Village Portal
                            </Link>
                        </h1>
                    </div>
                    <div className="col-md-8">
                        <ul className="nav justify-content-end">
                            {/* Always visible links */}
                            <li className="nav-item">
                                <Link className="nav-link text-white" to={isAuthenticated ? "/dashboard" : "/"}>
                                    {isAuthenticated ? "Dashboard" : "Home"}
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link text-white" to="/announcements">Announcements</Link>
                            </li>

                            {/* Schemes link - visible to everyone */}
                            <li className="nav-item dropdown">
                                <button
                                    className="nav-link text-white dropdown-toggle border-0 bg-transparent"
                                    type="button"
                                    onClick={() => setShowSchemeDropdown(!showSchemeDropdown)}
                                    aria-expanded={showSchemeDropdown}
                                >
                                    Schemes
                                </button>
                                <ul className={`dropdown-menu${showSchemeDropdown ? ' show' : ''}`}>
                                    <li><Link className="dropdown-item" to="/schemes">Available Schemes</Link></li>
                                    {isAuthenticated && (
                                        <li><Link className="dropdown-item" to="/schemes/my-applications">My Applications</Link></li>
                                    )}
                                </ul>
                            </li>

                            {/* Links only visible to authenticated users */}
                            {isAuthenticated ? (
                                <>
                                    <li className="nav-item">
                                        <Link className="nav-link text-white" to="/service-requests">Services</Link>
                                    </li>
                                    <li className="nav-item">
                                        <Link className="nav-link text-white" to="/certificates">Certificates</Link>
                                    </li>

                                    {/* Admin Links */}
                                    {isAdmin && (
                                        <li className="nav-item dropdown">
                                            <button
                                                className="nav-link text-white dropdown-toggle border-0 bg-transparent"
                                                type="button"
                                                onClick={() => setShowDropdown(!showDropdown)}
                                                aria-expanded={showDropdown}
                                            >
                                                Admin
                                            </button>
                                            <ul className={`dropdown-menu${showDropdown ? ' show' : ''}`}>
                                                <li><Link className="dropdown-item" to="/admin/announcements">Manage Announcements</Link></li>
                                                <li><Link className="dropdown-item" to="/admin/requests">Manage Service Requests</Link></li>
                                                <li><Link className="dropdown-item" to="/admin/certificates">Manage Certificates</Link></li>
                                                <li><hr className="dropdown-divider" /></li>
                                                <li><Link className="dropdown-item" to="/admin/schemes">Manage Schemes</Link></li>
                                                <li><Link className="dropdown-item" to="/admin/schemes/applications">Scheme Applications</Link></li>
                                            </ul>
                                        </li>
                                    )}

                                    {/* User Menu */}
                                    <li className="nav-item dropdown">
                                        <button
                                            className="nav-link text-white border-0 bg-transparent"
                                            type="button"
                                            data-bs-toggle="dropdown"
                                            aria-expanded="false"
                                        >
                                            <i className="fas fa-user me-1"></i> {user?.fullName || 'User'}
                                        </button>
                                        <ul className="dropdown-menu dropdown-menu-end">
                                            <li><Link className="dropdown-item" to="/profile">My Profile</Link></li>
                                            <li><hr className="dropdown-divider" /></li>
                                            <li><button className="dropdown-item" onClick={handleLogout}>Logout</button></li>
                                        </ul>
                                    </li>
                                </>
                            ) : (
                                <>
                                    {/* Links only visible to non-authenticated users */}
                                    <li className="nav-item">
                                        <Link className="nav-link text-white" to="/login">Login</Link>
                                    </li>
                                    <li className="nav-item">
                                        <Link className="nav-link text-white" to="/register">Register</Link>
                                    </li>
                                </>
                            )}
                        </ul>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;