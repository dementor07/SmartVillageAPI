import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import RequestService from '../../services/request.service';
import CertificateService from '../../services/certificate.service';
import AnnouncementService from '../../services/announcement.service';
import AuthService from '../../services/auth.service';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        pendingRequests: 0,
        totalRequests: 0,
        pendingCertificates: 0,
        totalCertificates: 0,
        totalAnnouncements: 0
    });
    const [recentRequests, setRecentRequests] = useState([]);
    const [recentCertificates, setRecentCertificates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const user = AuthService.getCurrentUser();

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);

                // Fetch all admin data in parallel
                const [requestsResponse, certificatesResponse, announcementsResponse] = await Promise.all([
                    RequestService.getAllRequests(),
                    CertificateService.getCertificates(), // All certificates
                    AnnouncementService.getAnnouncements()
                ]);

                // Calculate stats from responses
                const allRequests = requestsResponse.data || [];
                const allCertificates = certificatesResponse.data || [];
                const allAnnouncements = announcementsResponse.data || [];

                setStats({
                    pendingRequests: allRequests.filter(r => r.status === 'Pending').length,
                    totalRequests: allRequests.length,
                    pendingCertificates: allCertificates.filter(c => c.status === 'Pending').length,
                    totalCertificates: allCertificates.length,
                    totalAnnouncements: allAnnouncements.length
                });

                // Get most recent items (last 5)
                setRecentRequests(
                    allRequests
                        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                        .slice(0, 5)
                );

                setRecentCertificates(
                    allCertificates
                        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                        .slice(0, 5)
                );

                setLoading(false);
            } catch (error) {
                console.error('Error fetching admin dashboard data:', error);
                setError('Failed to load dashboard data. Please try again later.');
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

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

    if (error) {
        return (
            <div className="container mt-4">
                <div className="alert alert-danger">{error}</div>
            </div>
        );
    }

    return (
        <div className="container mt-4">
            {/* Welcome Banner */}
            <div className="row mb-4">
                <div className="col-12">
                    <div className="card bg-primary text-white">
                        <div className="card-body">
                            <h2 className="card-title">Welcome to Admin Dashboard</h2>
                            <p className="card-text">
                                Manage village services, process certificate applications, and publish announcements.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="row mb-4">
                <div className="col-md-3 mb-3">
                    <div className="card text-white bg-primary h-100">
                        <div className="card-body text-center">
                            <h1 className="display-4">{stats.pendingRequests}</h1>
                            <h5>Pending Requests</h5>
                            <h6>Out of {stats.totalRequests} total</h6>
                        </div>
                        <div className="card-footer d-grid">
                            <Link to="/admin/requests" className="btn btn-light">Manage Requests</Link>
                        </div>
                    </div>
                </div>
                <div className="col-md-3 mb-3">
                    <div className="card text-white bg-success h-100">
                        <div className="card-body text-center">
                            <h1 className="display-4">{stats.pendingCertificates}</h1>
                            <h5>Pending Certificates</h5>
                            <h6>Out of {stats.totalCertificates} total</h6>
                        </div>
                        <div className="card-footer d-grid">
                            <Link to="/admin/certificates" className="btn btn-light">Manage Certificates</Link>
                        </div>
                    </div>
                </div>
                <div className="col-md-3 mb-3">
                    <div className="card text-white bg-info h-100">
                        <div className="card-body text-center">
                            <h1 className="display-4">{stats.totalAnnouncements}</h1>
                            <h5>Announcements</h5>
                            <h6>Published to village</h6>
                        </div>
                        <div className="card-footer d-grid">
                            <Link to="/admin/announcements" className="btn btn-light">Manage Announcements</Link>
                        </div>
                    </div>
                </div>
                <div className="col-md-3 mb-3">
                    <div className="card text-white bg-secondary h-100">
                        <div className="card-body text-center">
                            <h1 className="display-4">
                                <i className="fas fa-bullhorn"></i>
                            </h1>
                            <h5>Create Announcement</h5>
                            <h6>Inform residents</h6>
                        </div>
                        <div className="card-footer d-grid">
                            <Link to="/admin/announcements/create" className="btn btn-light">Create New</Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity Section */}
            <div className="row">
                {/* Recent Service Requests */}
                <div className="col-md-6 mb-4">
                    <div className="card border-primary h-100">
                        <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">Recent Service Requests</h5>
                            <Link to="/admin/requests" className="btn btn-sm btn-light">View All</Link>
                        </div>
                        <div className="card-body">
                            {recentRequests.length > 0 ? (
                                <div className="list-group">
                                    {recentRequests.map(request => (
                                        <Link
                                            to={`/service-requests/${request.id}`}
                                            className="list-group-item list-group-item-action"
                                            key={request.id}
                                        >
                                            <div className="d-flex w-100 justify-content-between align-items-center">
                                                <div>
                                                    <h6 className="mb-1">{request.title}</h6>
                                                    <small>
                                                        By: {request.userName} | Category: {request.category}
                                                    </small>
                                                </div>
                                                <div>
                                                    <span className={`badge ${request.status === 'Pending' ? 'bg-warning text-dark' :
                                                            request.status === 'Resolved' ? 'bg-success' : 'bg-secondary'
                                                        }`}>{request.status}</span>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center">No service requests to display.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Recent Certificate Applications */}
                <div className="col-md-6 mb-4">
                    <div className="card border-success h-100">
                        <div className="card-header bg-success text-white d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">Recent Certificate Applications</h5>
                            <Link to="/admin/certificates" className="btn btn-sm btn-light">View All</Link>
                        </div>
                        <div className="card-body">
                            {recentCertificates.length > 0 ? (
                                <div className="list-group">
                                    {recentCertificates.map(cert => (
                                        <Link
                                            to={`/certificates/${cert.id}`}
                                            className="list-group-item list-group-item-action"
                                            key={cert.id}
                                        >
                                            <div className="d-flex w-100 justify-content-between align-items-center">
                                                <div>
                                                    <h6 className="mb-1">{cert.certificateType}</h6>
                                                    <small>
                                                        Applicant: {cert.applicantName} |
                                                        Ref: {cert.referenceNumber || 'Pending'}
                                                    </small>
                                                </div>
                                                <div>
                                                    <span className={`badge ${cert.status === 'Pending' ? 'bg-warning text-dark' :
                                                            cert.status === 'Approved' ? 'bg-success' :
                                                                cert.status === 'Rejected' ? 'bg-danger' : 'bg-secondary'
                                                        }`}>{cert.status}</span>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center">No certificate applications to display.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="row mb-4">
                <div className="col-12">
                    <div className="card">
                        <div className="card-header bg-dark text-white">
                            <h5 className="mb-0">Quick Actions</h5>
                        </div>
                        <div className="card-body">
                            <div className="row text-center">
                                <div className="col-md-3 mb-3">
                                    <Link to="/admin/announcements/create" className="btn btn-lg btn-outline-primary w-100">
                                        <i className="fas fa-bullhorn mb-2 d-block fs-2"></i>
                                        Create Announcement
                                    </Link>
                                </div>
                                <div className="col-md-3 mb-3">
                                    <Link to="/admin/requests" className="btn btn-lg btn-outline-success w-100">
                                        <i className="fas fa-tasks mb-2 d-block fs-2"></i>
                                        Manage Requests
                                    </Link>
                                </div>
                                <div className="col-md-3 mb-3">
                                    <Link to="/admin/certificates" className="btn btn-lg btn-outline-info w-100">
                                        <i className="fas fa-certificate mb-2 d-block fs-2"></i>
                                        Manage Certificates
                                    </Link>
                                </div>
                                <div className="col-md-3 mb-3">
                                    <Link to="/profile" className="btn btn-lg btn-outline-secondary w-100">
                                        <i className="fas fa-user-cog mb-2 d-block fs-2"></i>
                                        My Profile
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;