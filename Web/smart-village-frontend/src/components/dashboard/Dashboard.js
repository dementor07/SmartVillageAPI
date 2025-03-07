import React from 'react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    return (
        <div className="container mt-4">
            <h2 className="mb-4">Dashboard</h2>
            <div className="row">
                <div className="col-md-4 mb-4">
                    <div className="card h-100">
                        <div className="card-body text-center">
                            <i className="fas fa-tools fa-3x text-primary mb-3"></i>
                            <h3 className="card-title">My Service Requests</h3>
                            <p className="card-text">View and manage your service requests</p>
                            <Link to="/service-requests" className="btn btn-primary">
                                View Requests
                            </Link>
                        </div>
                    </div>
                </div>
                <div className="col-md-4 mb-4">
                    <div className="card h-100">
                        <div className="card-body text-center">
                            <i className="fas fa-bullhorn fa-3x text-primary mb-3"></i>
                            <h3 className="card-title">Announcements</h3>
                            <p className="card-text">Stay updated with the latest announcements</p>
                            <Link to="/announcements" className="btn btn-primary">
                                View Announcements
                            </Link>
                        </div>
                    </div>
                </div>
                <div className="col-md-4 mb-4">
                    <div className="card h-100">
                        <div className="card-body text-center">
                            <i className="fas fa-user fa-3x text-primary mb-3"></i>
                            <h3 className="card-title">My Profile</h3>
                            <p className="card-text">View and update your profile information</p>
                            <Link to="/profile" className="btn btn-primary">
                                View Profile
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;