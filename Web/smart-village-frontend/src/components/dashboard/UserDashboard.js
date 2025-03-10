import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import RequestService from '../../services/request.service';
import CertificateService from '../../services/certificate.service';
import AnnouncementService from '../../services/announcement.service';
import SchemeService from '../../services/scheme.service';
import AuthService from '../../services/auth.service';

const UserDashboard = () => {
    // State declarations
    const [dashboardData, setDashboardData] = useState({
        serviceRequests: [],
        certificates: [],
        announcements: [],
        schemeApplications: [],
        availableSchemes: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const user = AuthService.getCurrentUser();

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);

                // Fetch all data in parallel for better performance
                const [
                    requestsResponse,
                    certificatesResponse,
                    announcementsResponse,
                    schemesResponse,
                    schemeApplicationsResponse
                ] = await Promise.all([
                    RequestService.getMyRequests(),
                    CertificateService.getMyCertificates(),
                    AnnouncementService.getAnnouncements(),
                    SchemeService.getSchemes(),
                    SchemeService.getMyApplications()
                ]);

                setDashboardData({
                    serviceRequests: requestsResponse.data,
                    certificates: certificatesResponse.data,
                    announcements: announcementsResponse.data.slice(0, 3), // Get only latest 3
                    availableSchemes: schemesResponse.data.slice(0, 4), // Get only top 4
                    schemeApplications: schemeApplicationsResponse.data
                });

                setLoading(false);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
                setError('Failed to load dashboard data. Please try again later.');
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    // Get status badge class for various statuses
    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'Approved':
            case 'Resolved':
                return 'bg-success';
            case 'Rejected':
                return 'bg-danger';
            case 'Pending':
                return 'bg-warning text-dark';
            case 'In Progress':
                return 'bg-info';
            default:
                return 'bg-secondary';
        }
    };

    // Format date in a user-friendly way
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

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

    return (
        <div className="container mt-4">
            {/* Welcome Banner */}
            <div className="row mb-4">
                <div className="col-12">
                    <div className="card bg-primary text-white">
                        <div className="card-body">
                            <h2 className="card-title">Welcome, {user?.fullName || 'Resident'}</h2>
                            <p className="card-text">
                                Access your village services, track your applications, and stay updated with the latest announcements.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {error && (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            )}

            {/* Stats Cards */}
            <div className="row mb-4">
                <div className="col-md-3 mb-3">
                    <div className="card text-white bg-primary h-100">
                        <div className="card-body text-center">
                            <h1 className="display-4">{dashboardData.serviceRequests.length}</h1>
                            <h5>Service Requests</h5>
                            <h6>
                                {dashboardData.serviceRequests.filter(r => r.status === 'Pending').length} pending
                            </h6>
                        </div>
                        <div className="card-footer d-grid">
                            <Link to="/service-requests" className="btn btn-light">Manage Requests</Link>
                        </div>
                    </div>
                </div>

                <div className="col-md-3 mb-3">
                    <div className="card text-white bg-success h-100">
                        <div className="card-body text-center">
                            <h1 className="display-4">{dashboardData.certificates.length}</h1>
                            <h5>Certificates</h5>
                            <h6>
                                {dashboardData.certificates.filter(c => c.status === 'Pending').length} pending
                            </h6>
                        </div>
                        <div className="card-footer d-grid">
                            <Link to="/certificates" className="btn btn-light">Manage Certificates</Link>
                        </div>
                    </div>
                </div>

                <div className="col-md-3 mb-3">
                    <div className="card text-white bg-warning text-dark h-100">
                        <div className="card-body text-center">
                            <h1 className="display-4">{dashboardData.schemeApplications.length}</h1>
                            <h5>Scheme Applications</h5>
                            <h6>
                                {dashboardData.schemeApplications.filter(a => a.status === 'Pending').length} pending
                            </h6>
                        </div>
                        <div className="card-footer d-grid">
                            <Link to="/schemes/my-applications" className="btn btn-dark">View Applications</Link>
                        </div>
                    </div>
                </div>

                <div className="col-md-3 mb-3">
                    <div className="card text-white bg-info h-100">
                        <div className="card-body text-center">
                            <h1 className="display-4">{dashboardData.availableSchemes.length}</h1>
                            <h5>Available Schemes</h5>
                            <h6>
                                {dashboardData.availableSchemes.filter(s => s.isActive).length} active
                            </h6>
                        </div>
                        <div className="card-footer d-grid">
                            <Link to="/schemes" className="btn btn-light">Browse Schemes</Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity Section */}
            <div className="row">
                {/* Recent Service Requests */}
                <div className="col-md-4 mb-4">
                    <div className="card border-primary h-100">
                        <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">Recent Service Requests</h5>
                            <Link to="/service-requests" className="btn btn-sm btn-light">View All</Link>
                        </div>
                        <div className="card-body">
                            {dashboardData.serviceRequests.length > 0 ? (
                                <div className="list-group">
                                    {dashboardData.serviceRequests.slice(0, 5).map(request => (
                                        <Link
                                            to={`/service-requests/${request.id}`}
                                            className="list-group-item list-group-item-action"
                                            key={request.id}
                                        >
                                            <div className="d-flex w-100 justify-content-between align-items-center">
                                                <div>
                                                    <h6 className="mb-1">{request.title}</h6>
                                                    <small>
                                                        Category: {request.category}
                                                    </small>
                                                </div>
                                                <div>
                                                    <span className={`badge ${getStatusBadgeClass(request.status)}`}>{request.status}</span>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-4">
                                    <i className="fas fa-clipboard-list fa-3x text-muted mb-3"></i>
                                    <p>No service requests yet</p>
                                    <Link to="/service-requests/create" className="btn btn-primary btn-sm">Create Request</Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Recent Certificate Applications */}
                <div className="col-md-4 mb-4">
                    <div className="card border-success h-100">
                        <div className="card-header bg-success text-white d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">Certificate Applications</h5>
                            <Link to="/certificates" className="btn btn-sm btn-light">View All</Link>
                        </div>
                        <div className="card-body">
                            {dashboardData.certificates.length > 0 ? (
                                <div className="list-group">
                                    {dashboardData.certificates.slice(0, 5).map(cert => (
                                        <Link
                                            to={`/certificates/${cert.id}`}
                                            className="list-group-item list-group-item-action"
                                            key={cert.id}
                                        >
                                            <div className="d-flex w-100 justify-content-between align-items-center">
                                                <div>
                                                    <h6 className="mb-1">{cert.certificateType}</h6>
                                                    <small>
                                                        Ref: {cert.referenceNumber || 'Pending'}
                                                    </small>
                                                </div>
                                                <div>
                                                    <span className={`badge ${getStatusBadgeClass(cert.status)}`}>{cert.status}</span>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-4">
                                    <i className="fas fa-certificate fa-3x text-muted mb-3"></i>
                                    <p>No certificate applications yet</p>
                                    <Link to="/certificates/apply" className="btn btn-success btn-sm">Apply for Certificate</Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Latest Announcements */}
                <div className="col-md-4 mb-4">
                    <div className="card border-info h-100">
                        <div className="card-header bg-info text-white d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">Latest Announcements</h5>
                            <Link to="/announcements" className="btn btn-sm btn-light">View All</Link>
                        </div>
                        <div className="card-body">
                            {dashboardData.announcements.length > 0 ? (
                                <div className="list-group">
                                    {dashboardData.announcements.slice(0, 5).map(announcement => (
                                        <Link
                                            to={`/announcements/${announcement.id}`}
                                            className="list-group-item list-group-item-action"
                                            key={announcement.id}
                                        >
                                            <div className="d-flex w-100 justify-content-between">
                                                <div>
                                                    <h6 className="mb-1">{announcement.title}</h6>
                                                    <small>
                                                        Category: {announcement.category}
                                                    </small>
                                                </div>
                                                <small>{formatDate(announcement.createdAt)}</small>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-4">
                                    <i className="fas fa-bullhorn fa-3x text-muted mb-3"></i>
                                    <p>No announcements available</p>
                                </div>
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
                                    <Link to="/service-requests/create" className="btn btn-lg btn-outline-primary w-100 h-100">
                                        <i className="fas fa-tools mb-2 d-block fs-2"></i>
                                        Create Service Request
                                    </Link>
                                </div>
                                <div className="col-md-3 mb-3">
                                    <Link to="/certificates/apply" className="btn btn-lg btn-outline-success w-100 h-100">
                                        <i className="fas fa-certificate mb-2 d-block fs-2"></i>
                                        Apply for Certificate
                                    </Link>
                                </div>
                                <div className="col-md-3 mb-3">
                                    <Link to="/schemes" className="btn btn-lg btn-outline-warning w-100 h-100">
                                        <i className="fas fa-hand-holding-usd mb-2 d-block fs-2"></i>
                                        Browse Schemes
                                    </Link>
                                </div>
                                <div className="col-md-3 mb-3">
                                    <Link to="/profile" className="btn btn-lg btn-outline-secondary w-100 h-100">
                                        <i className="fas fa-user-cog mb-2 d-block fs-2"></i>
                                        My Profile
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Village Services */}
            <div className="row mb-4">
                <div className="col-12">
                    <div className="card">
                        <div className="card-header bg-primary text-white">
                            <h5 className="mb-0">Village Services</h5>
                        </div>
                        <div className="card-body">
                            <div className="row">
                                <div className="col-md-4 mb-3">
                                    <div className="card h-100">
                                        <div className="card-body text-center">
                                            <i className="fas fa-landmark fa-3x text-success mb-3"></i>
                                            <h5>Land Revenue Services</h5>
                                            <p>Apply for land records, mutations, and other revenue services</p>
                                            <Link to="/land-revenue/services" className="btn btn-success btn-sm">Explore Services</Link>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-4 mb-3">
                                    <div className="card h-100">
                                        <div className="card-body text-center">
                                            <i className="fas fa-gavel fa-3x text-primary mb-3"></i>
                                            <h5>Dispute Resolution</h5>
                                            <p>File and track dispute resolution cases in the village</p>
                                            <Link to="/dispute-resolution/my-cases" className="btn btn-primary btn-sm">My Cases</Link>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-4 mb-3">
                                    <div className="card h-100">
                                        <div className="card-body text-center">
                                            <i className="fas fa-exclamation-triangle fa-3x text-danger mb-3"></i>
                                            <h5>Disaster Management</h5>
                                            <p>Report emergencies and track disaster management cases</p>
                                            <Link to="/disaster-management/my-cases" className="btn btn-danger btn-sm">Report Emergency</Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;