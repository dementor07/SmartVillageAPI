import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import RequestService from '../../services/request.service';
import CertificateService from '../../services/certificate.service';
import AnnouncementService from '../../services/announcement.service';
import SchemeService from '../../services/scheme.service';
import AuthService from '../../services/auth.service';

const AdminDashboard = () => {
    const [dashboardData, setDashboardData] = useState({
        stats: {
            pendingRequests: 0,
            totalRequests: 0,
            pendingCertificates: 0,
            totalCertificates: 0,
            pendingSchemeApplications: 0,
            totalSchemeApplications: 0,
            totalAnnouncements: 0,
            totalSchemes: 0
        },
        recentRequests: [],
        recentCertificates: [],
        recentSchemeApplications: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Retrieve current user with graceful handling
    const adminUser = useMemo(() =>
        AuthService.getCurrentUser() || {
            fullName: 'Administrator',
            emailId: 'admin@system.local',
            role: 'Admin'
        },
        []);

    useEffect(() => {
        // Log admin dashboard access only once
        console.log(`Admin Dashboard accessed by: ${adminUser.fullName} (${adminUser.emailId})`);
    }, [adminUser]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);

                // Fetch all admin data in parallel
                const [
                    requestsResponse,
                    certificatesResponse,
                    announcementsResponse,
                    schemesResponse,
                    schemeApplicationsResponse
                ] = await Promise.all([
                    RequestService.getAllRequests(),
                    CertificateService.getCertificates(),
                    AnnouncementService.getAnnouncements(),
                    SchemeService.getSchemes(),
                    SchemeService.getAllApplications()
                ]);

                // Calculate and set dashboard data
                const allRequests = requestsResponse.data || [];
                const allCertificates = certificatesResponse.data || [];
                const allAnnouncements = announcementsResponse.data || [];
                const allSchemes = schemesResponse.data || [];
                const allSchemeApplications = schemeApplicationsResponse.data || [];

                setDashboardData({
                    stats: {
                        pendingRequests: allRequests.filter(r => r.status === 'Pending').length,
                        totalRequests: allRequests.length,
                        pendingCertificates: allCertificates.filter(c => c.status === 'Pending').length,
                        totalCertificates: allCertificates.length,
                        pendingSchemeApplications: allSchemeApplications.filter(a => a.status === 'Pending').length,
                        totalSchemeApplications: allSchemeApplications.length,
                        totalAnnouncements: allAnnouncements.length,
                        totalSchemes: allSchemes.length
                    },
                    recentRequests: allRequests
                        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                        .slice(0, 5),
                    recentCertificates: allCertificates
                        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                        .slice(0, 5),
                    recentSchemeApplications: allSchemeApplications
                        .sort((a, b) => new Date(b.submittedAt || b.createdAt) - new Date(a.submittedAt || a.createdAt))
                        .slice(0, 5)
                });

                setLoading(false);
            } catch (error) {
                console.error('Error fetching admin dashboard data:', error);
                setError('Failed to load dashboard data. Please try again later.');
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []); // Empty dependency array as we don't want repeated calls

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
                                Manage village services, process applications, and publish announcements.
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
                            <h1 className="display-4">{dashboardData.stats.pendingRequests}</h1>
                            <h5>Pending Requests</h5>
                            <h6>Out of {dashboardData.stats.totalRequests} total</h6>
                        </div>
                        <div className="card-footer d-grid">
                            <Link to="/admin/requests" className="btn btn-light">Manage Requests</Link>
                        </div>
                    </div>
                </div>
                <div className="col-md-3 mb-3">
                    <div className="card text-white bg-success h-100">
                        <div className="card-body text-center">
                            <h1 className="display-4">{dashboardData.stats.pendingCertificates}</h1>
                            <h5>Pending Certificates</h5>
                            <h6>Out of {dashboardData.stats.totalCertificates} total</h6>
                        </div>
                        <div className="card-footer d-grid">
                            <Link to="/admin/certificates" className="btn btn-light">Manage Certificates</Link>
                        </div>
                    </div>
                </div>
                <div className="col-md-3 mb-3">
                    <div className="card text-white bg-warning text-dark h-100">
                        <div className="card-body text-center">
                            <h1 className="display-4">{dashboardData.stats.pendingSchemeApplications}</h1>
                            <h5>Pending Scheme Apps</h5>
                            <h6>Out of {dashboardData.stats.totalSchemeApplications} total</h6>
                        </div>
                        <div className="card-footer d-grid">
                            <Link to="/admin/schemes/applications" className="btn btn-dark">Manage Applications</Link>
                        </div>
                    </div>
                </div>
                <div className="col-md-3 mb-3">
                    <div className="card text-white bg-info h-100">
                        <div className="card-body text-center">
                            <h1 className="display-4">{dashboardData.stats.totalAnnouncements}</h1>
                            <h5>Announcements</h5>
                            <h6>{dashboardData.stats.totalSchemes} Available Schemes</h6>
                        </div>
                        <div className="card-footer d-grid">
                            <Link to="/admin/announcements" className="btn btn-light">Manage Content</Link>
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
                            <Link to="/admin/requests" className="btn btn-sm btn-light">View All</Link>
                        </div>
                        <div className="card-body">
                            {dashboardData.recentRequests.length > 0 ? (
                                <div className="list-group">
                                    {dashboardData.recentRequests.map(request => (
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
                <div className="col-md-4 mb-4">
                    <div className="card border-success h-100">
                        <div className="card-header bg-success text-white d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">Recent Certificate Applications</h5>
                            <Link to="/admin/certificates" className="btn btn-sm btn-light">View All</Link>
                        </div>
                        <div className="card-body">
                            {dashboardData.recentCertificates.length > 0 ? (
                                <div className="list-group">
                                    {dashboardData.recentCertificates.map(cert => (
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

                {/* Recent Scheme Applications */}
                <div className="col-md-4 mb-4">
                    <div className="card border-warning h-100">
                        <div className="card-header bg-warning text-dark d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">Recent Scheme Applications</h5>
                            <Link to="/admin/schemes/applications" className="btn btn-sm btn-dark">View All</Link>
                        </div>
                        <div className="card-body">
                            {dashboardData.recentSchemeApplications.length > 0 ? (
                                <div className="list-group">
                                    {dashboardData.recentSchemeApplications.map(app => (
                                        <Link
                                            to={`/schemes/applications/${app.id}`}
                                            className="list-group-item list-group-item-action"
                                            key={app.id}
                                        >
                                            <div className="d-flex w-100 justify-content-between align-items-center">
                                                <div>
                                                    <h6 className="mb-1">{app.schemeName}</h6>
                                                    <small>
                                                        Applicant: {app.applicantName} |
                                                        Ref: {app.referenceNumber || 'Pending'}
                                                    </small>
                                                </div>
                                                <div>
                                                    <span className={`badge ${app.status === 'Pending' ? 'bg-warning text-dark' :
                                                        app.status === 'Approved' ? 'bg-success' :
                                                            app.status === 'Rejected' ? 'bg-danger' : 'bg-secondary'
                                                        }`}>{app.status}</span>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center">No scheme applications to display.</p>
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
                                <div className="col-md-2 mb-3">
                                    <Link to="/admin/announcements/create" className="btn btn-lg btn-outline-primary w-100 h-100">
                                        <i className="fas fa-bullhorn mb-2 d-block fs-2"></i>
                                        Create Announcement
                                    </Link>
                                </div>
                                <div className="col-md-2 mb-3">
                                    <Link to="/admin/requests" className="btn btn-lg btn-outline-primary w-100 h-100">
                                        <i className="fas fa-tasks mb-2 d-block fs-2"></i>
                                        Manage Requests
                                    </Link>
                                </div>
                                <div className="col-md-2 mb-3">
                                    <Link to="/admin/certificates" className="btn btn-lg btn-outline-success w-100 h-100">
                                        <i className="fas fa-certificate mb-2 d-block fs-2"></i>
                                        Manage Certificates
                                    </Link>
                                </div>
                                <div className="col-md-2 mb-3">
                                    <Link to="/admin/schemes" className="btn btn-lg btn-outline-info w-100 h-100">
                                        <i className="fas fa-hand-holding-usd mb-2 d-block fs-2"></i>
                                        Manage Schemes
                                    </Link>
                                </div>
                                <div className="col-md-2 mb-3">
                                    <Link to="/admin/schemes/applications" className="btn btn-lg btn-outline-warning w-100 h-100">
                                        <i className="fas fa-clipboard-check mb-2 d-block fs-2"></i>
                                        Review Applications
                                    </Link>
                                </div>
                                <div className="col-md-2 mb-3">
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
        </div>
    );
};

export default AdminDashboard;