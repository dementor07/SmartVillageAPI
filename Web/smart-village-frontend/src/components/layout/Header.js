import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
    return (
        <header className="bg-primary py-3 text-white">
            <div className="container">
                <div className="row align-items-center">
                    <div className="col-md-6">
                        <h1 className="mb-0">
                            <Link to="/" className="text-white text-decoration-none">
                                <i className="fas fa-solar-panel me-2"></i>
                                Smart Village Portal
                            </Link>
                        </h1>
                    </div>
                    <div className="col-md-6">
                        <ul className="nav justify-content-end">
                            <li className="nav-item">
                                <Link className="nav-link text-white" to="/">Home</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link text-white" to="/announcements">Announcements</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link text-white" to="/service-requests">Services</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link text-white" to="/login">Login</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link text-white" to="/register">Register</Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;