// Web/smart-village-frontend/src/components/dashboard/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import RequestService from '../../services/request.service';
import CertificateService from '../../services/certificate.service';

const AdminDashboard = () => {
    const [pendingRequests, setPendingRequests] = useState(0);
    const [pendingCertificates, setPendingCertificates] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch pending service requests
                const requestsResponse = await RequestService.getAllRequests();
                const pendingCount = requestsResponse.data.filter(r => r.status === 'Pending').length;
                setPendingRequests(pendingCount);

                // Fetch pending certificates
                const certificatesResponse = await CertificateService.getCertificates('Pending');
                setPendingCertificates(certificatesResponse.data.length);

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
            <h2 className="mb-4">Admin Dashboard</h2>

            {loading ? (
                <div className="d-flex justify-content-center my-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            ) : (
                <div className="row">
                    <div className="col-md-4 mb-4">
                        <div className="card h-100 border-primary">
                            <div className="card-body text-center">
                                <i className="fas fa-tools fa-3x text-primary mb-3"></i>
                                <h3 className="card-title">Service Requests</h3>
                                <p className="card-text">
                                    Manage resident service requests
                                    {pendingRequests > 0 && (
                                        <span className="badge bg-danger ms-2">{pendingRequests} pending</span>
                                    )}
                                </p>
                                <Link to="/admin/requests" className="btn btn-primary">
                                    Manage Requests
                                </Link>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4 mb-4">
                        <div className="card h-100 border-primary">
                            <div className="card-body text-center">
                                <i className="fas fa-bullhorn fa-3x text-primary mb-3"></i>
                                <h3 className="card-title">Announcements</h3>
                                <p className="card-text">Create and manage village announcements</p>
                                <Link to="/admin/announcements" className="btn btn-primary">
                                    Manage Announcements
                                </Link>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4 mb-4">
                        <div className="card h-100 border-primary">
                            <div className="card-body text-center">
                                <i className="fas fa-certificate fa-3x text-primary mb-3"></i>
                                <h3 className="card-title">Certificates</h3>
                                <p className="card-text">
                                    Manage certificate applications
                                    {pendingCertificates > 0 && (
                                        <span className="badge bg-danger ms-2">{pendingCertificates} pending</span>
                                    )}
                                </p>
                                <Link to="/admin/certificates" className="btn btn-primary">
                                    Manage Certificates
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;