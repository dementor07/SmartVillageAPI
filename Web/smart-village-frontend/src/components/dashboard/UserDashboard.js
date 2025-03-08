// Web/smart-village-frontend/src/components/dashboard/UserDashboard.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import RequestService from '../../services/request.service';
import CertificateService from '../../services/certificate.service';

const UserDashboard = () => {
    const [serviceRequests, setServiceRequests] = useState([]);
    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch service requests
                const requestsResponse = await RequestService.getMyRequests();
                setServiceRequests(requestsResponse.data);

                // Fetch certificates
                const certificatesResponse = await CertificateService.getMyCertificates();
                setCertificates(certificatesResponse.data);

                setLoading(false);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    return (
        <div className="container mt-4">
            <h2 className="mb-4">Resident Dashboard</h2>

            {loading ? (
                <div className="d-flex justify-content-center my-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            ) : (
                <div className="row">
                    <div className="col-md-4 mb-4">
                        <div className="card h-100">
                            <div className="card-body text-center">
                                <i className="fas fa-tools fa-3x text-primary mb-3"></i>
                                <h3 className="card-title">My Service Requests</h3>
                                <p className="card-text">View and manage your service requests</p>
                                {serviceRequests.length > 0 && (
                                    <div className="mb-2">
                                        <span className="badge bg-info me-1">{serviceRequests.length} Total</span>
                                        <span className="badge bg-warning me-1">
                                            {serviceRequests.filter(r => r.status === 'Pending').length} Pending
                                        </span>
                                    </div>
                                )}
                                <Link to="/service-requests" className="btn btn-primary">
                                    View Requests
                                </Link>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4 mb-4">
                        <div className="card h-100">
                            <div className="card-body text-center">
                                <i className="fas fa-certificate fa-3x text-primary mb-3"></i>
                                <h3 className="card-title">My Certificates</h3>
                                <p className="card-text">Apply for and track your certificate applications</p>
                                {certificates.length > 0 && (
                                    <div className="mb-2">
                                        <span className="badge bg-info me-1">{certificates.length} Total</span>
                                        <span className="badge bg-warning me-1">
                                            {certificates.filter(c => c.status === 'Pending').length} Pending
                                        </span>
                                    </div>
                                )}
                                <Link to="/certificates" className="btn btn-primary">
                                    Manage Certificates
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
            )}
        </div>
    );
};

export default UserDashboard;
