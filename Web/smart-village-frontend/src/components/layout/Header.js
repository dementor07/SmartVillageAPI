import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthService from '../../services/auth.service';

const AuthenticatedHeader = ({ isAdmin }) => {
    const [showDropdown, setShowDropdown] = useState(false);
    const navigate = useNavigate();
    const user = AuthService.getCurrentUser();

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
                            <li className="nav-item">
                                <Link className="nav-link text-white" to="/dashboard">Dashboard</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link text-white" to="/announcements">Announcements</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link text-white" to="/service-requests">Services</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link text-white" to="/certificates">Certificates</Link>
                            </li>

                            {/* Admin Links */}
                            {isAdmin && (
                                <li className="nav-item dropdown">
                                    <a
                                        className="nav-link text-white dropdown-toggle"
                                        href="#"
                                        role="button"
                                        onClick={() => setShowDropdown(!showDropdown)}
                                        aria-expanded={showDropdown}
                                    >
                                        Admin
                                    </a>
                                    <ul className={`dropdown-menu${showDropdown ? ' show' : ''}`}>
                                        <li><Link className="dropdown-item" to="/admin/announcements">Manage Announcements</Link></li>
                                        <li><Link className="dropdown-item" to="/admin/requests">Manage Service Requests</Link></li>
                                        <li><Link className="dropdown-item" to="/admin/certificates">Manage Certificates</Link></li>
                                    </ul>
                                </li>
                            )}

                            {/* User Menu */}
                            <li className="nav-item dropdown">
                                <a
                                    className="nav-link text-white"
                                    href="#"
                                    role="button"
                                    data-bs-toggle="dropdown"
                                    aria-expanded="false"
                                >
                                    <i className="fas fa-user me-1"></i> {user?.fullName || 'User'}
                                </a>
                                <ul className="dropdown-menu dropdown-menu-end">
                                    <li><Link className="dropdown-item" to="/profile">My Profile</Link></li>
                                    <li><hr className="dropdown-divider" /></li>
                                    <li><button className="dropdown-item" onClick={handleLogout}>Logout</button></li>
                                </ul>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default AuthenticatedHeader;