// Web/smart-village-frontend/src/components/dashboard/UserDashboard.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import RequestService from '../../services/request.service';
import CertificateService from '../../services/certificate.service';
import AnnouncementService from '../../services/announcement.service';
import SchemeService from '../../services/scheme.service';
import AuthService from '../../services/auth.service';

const UserDashboard = () => {
    const [serviceRequests, setServiceRequests] = useState([]);
    const [certificates, setCertificates] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [schemeApplications, setSchemeApplications] = useState([]);
    const [availableSchemes, setAvailableSchemes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const user = AuthService.getCurrentUser();

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);

                // Fetch data in parallel with Promise.all
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

                setServiceRequests(requestsResponse.data);
                setCertificates(certificatesResponse.data);
                // Get just the latest 3 announcements
                setAnnouncements(announcementsResponse.data.slice(0, 3));
                // Get just 4 schemes for the dashboard
                setAvailableSchemes(schemesResponse.data.slice(0, 4));
                setSchemeApplications(schemeApplicationsResponse.data);

                setLoading(false);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
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

    // Get status badge class for various statuses
    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'Approved':
                return 'bg-success';
            case 'Rejected':
                return 'bg-danger';
            case 'Pending':
                return 'bg-warning text-dark';
            case 'Resolved':
                return 'bg-success';
            default:
                return 'bg-secondary';
        }
    };

    return (
        <div className="container mt-4">
            <div className="row mb-4">
                <div className="col-12">
                    <div className="card bg-light">
                        <div className="card-body">
                            <h2 className="card-title">Welcome, {user?.fullName || 'Resident'}</h2>
                            <p className="card-text">
                                Access your village services, track your applications, and stay updated with the latest announcements.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Dashboard summary cards */}
            <div className="row mb-4">
                <div className="col-md-3 mb-3">
                    <div className="card bg-primary text-white h-100">
                        <div className="card-body text-center">
                            <i className="fas fa-clipboard-list fa-3x mb-3"></i>
                            <h4>{serviceRequests.length}</h4>
                            <h5>Service Requests</h5>
                        </div>
                        <div className="card-footer bg-transparent border-0">
                            <Link to="/service-requests" className="btn btn-outline-light btn-sm w-100">View All</Link>
                        </div>
                    </div>
                </div>
                <div className="col-md-3 mb-3">
                    <div className="card bg-success text-white h-100">
                        <div className="card-body text-center">
                            <i className="fas fa-certificate fa-3x mb-3"></i>
                            <h4>{certificates.length}</h4>
                            <h5>Certificates</h5>
                        </div>
                        <div className="card-footer bg-transparent border-0">
                            <Link to="/certificates" className="btn btn-outline-light btn-sm w-100">View All</Link>
                        </div>
                    </div>
                </div>
                <div className="col-md-3 mb-3">
                    <div className="card bg-info text-white h-100">
                        <div className="card-body text-center">
                            <i className="fas fa-newspaper fa-3x mb-3"></i>
                            <h4>{announcements.length}</h4>
                            <h5>Announcements</h5>
                        </div>
                        <div className="card-footer bg-transparent border-0">
                            <Link to="/announcements" className="btn btn-outline-light btn-sm w-100">View All</Link>
                        </div>
                    </div>
                </div>
                <div className="col-md-3 mb-3">
                    <div className="card bg-warning text-dark h-100">
                        <div className="card-body text-center">
                            <i className="fas fa-hands-helping fa-3x mb-3"></i>
                            <h4>{schemeApplications.length}</h4>
                            <h5>Scheme Applications</h5>
                        </div>
                        <div className="card-footer bg-transparent border-0">
                            <Link to="/schemes/my-applications" className="btn btn-outline-dark btn-sm w-100">View All</Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row mb-4">
                <div className="col-md-6 mb-4">
                    <div className="card h-100 border-primary">
                        <div className="card-header bg-primary text-white">
                            <h3 className="card-title mb-0">My Service Requests</h3>
                        </div>
                        <div className="card-body">
                            {serviceRequests.length > 0 ? (
                                <>
                                    <div className="mb-3">
                                        <span className="badge bg-info me-1">{serviceRequests.length} Total</span>
                                        <span className="badge bg-warning me-1">
                                            {serviceRequests.filter(r => r.status === 'Pending').length} Pending
                                        </span>
                                        <span className="badge bg-success me-1">
                                            {serviceRequests.filter(r => r.status === 'Resolved').length} Resolved
                                        </span>
                                    </div>
                                    <div className="list-group">
                                        {serviceRequests.slice(0, 3).map(request => (
                                            <Link
                                                to={`/service-requests/${request.id}`}
                                                className="list-group-item list-group-item-action"
                                                key={request.id}
                                            >
                                                <div className="d-flex w-100 justify-content-between">
                                                    <h5 className="mb-1">{request.title}</h5>
                                                    <small className={`badge ${getStatusBadgeClass(request.status)}`}>{request.status}</small>
                                                </div>
                                                <p className="mb-1">{request.category}</p>
                                                <small>{new Date(request.createdAt).toLocaleDateString()}</small>
                                            </Link>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <p className="text-center mt-3">No service requests found.</p>
                            )}
                        </div>
                        <div className="card-footer">
                            <div className="d-grid gap-2">
                                <Link to="/service-requests" className="btn btn-outline-primary">
                                    View All Requests
                                </Link>
                                <Link to="/service-requests/create" className="btn btn-primary">
                                    <i className="fas fa-plus me-1"></i> Create New Request
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-md-6 mb-4">
                    <div className="card h-100 border-success">
                        <div className="card-header bg-success text-white">
                            <h3 className="card-title mb-0">My Certificates</h3>
                        </div>
                        <div className="card-body">
                            {certificates.length > 0 ? (
                                <>
                                    <div className="mb-3">
                                        <span className="badge bg-info me-1">{certificates.length} Total</span>
                                        <span className="badge bg-warning me-1">
                                            {certificates.filter(c => c.status === 'Pending').length} Pending
                                        </span>
                                        <span className="badge bg-success me-1">
                                            {certificates.filter(c => c.status === 'Approved').length} Approved
                                        </span>
                                        <span className="badge bg-danger me-1">
                                            {certificates.filter(c => c.status === 'Rejected').length} Rejected
                                        </span>
                                    </div>
                                    <div className="list-group">
                                        {certificates.slice(0, 3).map(cert => (
                                            <Link
                                                to={`/certificates/${cert.id}`}
                                                className="list-group-item list-group-item-action"
                                                key={cert.id}
                                            >
                                                <div className="d-flex w-100 justify-content-between">
                                                    <h5 className="mb-1">{cert.certificateType}</h5>
                                                    <small className={`badge ${getStatusBadgeClass(cert.status)}`}>{cert.status}</small>
                                                </div>
                                                <p className="mb-1">For: {cert.applicantName}</p>
                                                <small>
                                                    Ref: {cert.referenceNumber || 'Pending'} |
                                                    Applied: {new Date(cert.createdAt).toLocaleDateString()}
                                                </small>
                                            </Link>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <p className="text-center mt-3">No certificates found.</p>
                            )}
                        </div>
                        <div className="card-footer">
                            <div className="d-grid gap-2">
                                <Link to="/certificates" className="btn btn-outline-success">
                                    View All Certificates
                                </Link>
                                <Link to="/certificates/apply" className="btn btn-success">
                                    <i className="fas fa-plus me-1"></i> Apply for Certificate
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* New Scheme Applications Section */}
            <div className="row mb-4">
                <div className="col-md-6 mb-4">
                    <div className="card h-100 border-warning">
                        <div className="card-header bg-warning text-dark">
                            <h3 className="card-title mb-0">My Scheme Applications</h3>
                        </div>
                        <div className="card-body">
                            {schemeApplications.length > 0 ? (
                                <>
                                    <div className="mb-3">
                                        <span className="badge bg-info me-1">{schemeApplications.length} Total</span>
                                        <span className="badge bg-warning me-1 text-dark">
                                            {schemeApplications.filter(a => a.status === 'Pending').length} Pending
                                        </span>
                                        <span className="badge bg-success me-1">
                                            {schemeApplications.filter(a => a.status === 'Approved').length} Approved
                                        </span>
                                        <span className="badge bg-danger me-1">
                                            {schemeApplications.filter(a => a.status === 'Rejected').length} Rejected
                                        </span>
                                    </div>
                                    <div className="list-group">
                                        {schemeApplications.slice(0, 3).map(app => (
                                            <Link
                                                to={`/schemes/applications/${app.id}`}
                                                className="list-group-item list-group-item-action"
                                                key={app.id}
                                            >
                                                <div className="d-flex w-100 justify-content-between">
                                                    <h5 className="mb-1">{app.schemeName}</h5>
                                                    <small className={`badge ${getStatusBadgeClass(app.status)}`}>{app.status}</small>
                                                </div>
                                                <p className="mb-1">Category: {app.schemeCategory}</p>
                                                <small>
                                                    Ref: {app.referenceNumber || 'Pending'} |
                                                    Applied: {app.submittedAt ? new Date(app.submittedAt).toLocaleDateString() : 'N/A'}
                                                </small>
                                            </Link>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <p className="text-center mt-3">You haven't applied for any government schemes yet.</p>
                            )}
                        </div>
                        <div className="card-footer">
                            <div className="d-grid gap-2">
                                <Link to="/schemes/my-applications" className="btn btn-outline-warning">
                                    View All Applications
                                </Link>
                                <Link to="/schemes" className="btn btn-warning text-dark">
                                    <i className="fas fa-search me-1"></i> Browse Available Schemes
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-md-6 mb-4">
                    <div className="card h-100 border-info">
                        <div className="card-header bg-info text-white">
                            <h3 className="card-title mb-0">Available Schemes</h3>
                        </div>
                        <div className="card-body">
                            {availableSchemes.length > 0 ? (
                                <div className="row">
                                    {availableSchemes.map(scheme => (
                                        <div className="col-6 mb-3" key={scheme.id}>
                                            <div className="card h-100 shadow-sm">
                                                <div className="card-body">
                                                    <h5 className="card-title">{scheme.name}</h5>
                                                    <span className="badge bg-secondary mb-2">{scheme.category}</span>
                                                    <p className="card-text small">{scheme.description.substring(0, 60)}...</p>
                                                </div>
                                                <div className="card-footer bg-transparent border-0 pt-0">
                                                    <Link to={`/schemes/${scheme.id}`} className="btn btn-sm btn-outline-primary w-100">
                                                        View Details
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center mt-3">No schemes available at the moment.</p>
                            )}
                        </div>
                        <div className="card-footer">
                            <Link to="/schemes" className="btn btn-info text-white w-100">
                                View All Government Schemes
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-md-12">
                    <div className="card border-info">
                        <div className="card-header bg-info text-white">
                            <h3 className="card-title mb-0">Recent Announcements</h3>
                        </div>
                        <div className="card-body">
                            {announcements.length > 0 ? (
                                <div className="list-group">
                                    {announcements.map(announcement => (
                                        <Link
                                            to={`/announcements/${announcement.id}`}
                                            className="list-group-item list-group-item-action"
                                            key={announcement.id}
                                        >
                                            <div className="d-flex w-100 justify-content-between">
                                                <h5 className="mb-1">{announcement.title}</h5>
                                                <small className="text-muted">{new Date(announcement.createdAt).toLocaleDateString()}</small>
                                            </div>
                                            <p className="mb-1">
                                                {announcement.content?.length > 120
                                                    ? `${announcement.content.substring(0, 120)}...`
                                                    : announcement.content}
                                            </p>
                                            <small className="text-muted">
                                                Category: {announcement.category} | By: {announcement.publishedBy}
                                            </small>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center">No recent announcements.</p>
                            )}
                        </div>
                        <div className="card-footer">
                            <Link to="/announcements" className="btn btn-info text-white w-100">
                                View All Announcements
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Profile Summary Card */}
            <div className="row mt-4">
                <div className="col-md-12">
                    <div className="card bg-light mt-4">
                        <div className="card-header">
                            <h4 className="mb-0">My Profile Summary</h4>
                        </div>
                        <div className="card-body">
                            <div className="row">
                                <div className="col-md-6">
                                    <p><strong>Name:</strong> {user?.fullName}</p>
                                    <p><strong>Email:</strong> {user?.email}</p>
                                    <p><strong>Mobile:</strong> {user?.mobileNo || 'Not provided'}</p>
                                </div>
                                <div className="col-md-6">
                                    <p><strong>Village:</strong> {user?.village}</p>
                                    <p><strong>District:</strong> {user?.district}</p>
                                    <p><strong>State:</strong> {user?.state}</p>
                                </div>
                            </div>
                            <div className="text-center mt-3">
                                <Link to="/profile" className="btn btn-outline-secondary">
                                    <i className="fas fa-user-edit me-1"></i> Edit Profile
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;