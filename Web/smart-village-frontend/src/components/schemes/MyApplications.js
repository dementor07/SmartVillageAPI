import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import SchemeService from '../../services/scheme.service';

const MyApplications = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const location = useLocation();
    const navigate = useNavigate();

    // Fetch user's applications
    const fetchApplications = useCallback(async () => {
        try {
            setLoading(true);
            const response = await SchemeService.getMyApplications();
            setApplications(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching applications:', error);
            setError('Failed to load your applications. Please try again later.');
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchApplications();
    }, [fetchApplications]);

    useEffect(() => {
        // Check for success message from navigation
        if (location.state?.message) {
            setSuccess(location.state.message);
        }
    }, [location.state]);

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'Approved':
                return 'bg-success';
            case 'Rejected':
                return 'bg-danger';
            case 'Pending':
                return 'bg-warning text-dark';
            default:
                return 'bg-secondary';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="container mt-4">
            <h2 className="mb-4">My Scheme Applications</h2>

            {/* Success message */}
            {success && (
                <div className="alert alert-success alert-dismissible fade show" role="alert">
                    {success}
                    <button
                        type="button"
                        className="btn-close"
                        onClick={() => setSuccess('')}
                        aria-label="Close"
                    ></button>
                </div>
            )}

            {/* Error message */}
            {error && <div className="alert alert-danger">{error}</div>}

            <div className="d-flex justify-content-between mb-4">
                <Link to="/schemes" className="btn btn-outline-primary">
                    <i className="fas fa-arrow-left me-2"></i>
                    Back to Schemes
                </Link>
                <Link to="/schemes" className="btn btn-success">
                    <i className="fas fa-plus me-2"></i>
                    Apply for New Scheme
                </Link>
            </div>

            {/* Loading state */}
            {loading ? (
                <div className="d-flex justify-content-center my-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            ) : applications.length === 0 ? (
                <div className="card">
                    <div className="card-body text-center p-5">
                        <i className="fas fa-clipboard-list fa-4x text-muted mb-3"></i>
                        <h3>No applications found</h3>
                        <p>You haven't applied for any schemes yet.</p>
                        <Link to="/schemes" className="btn btn-primary mt-3">
                            Browse Available Schemes
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="table-responsive">
                    <table className="table table-striped table-hover">
                        <thead>
                            <tr>
                                <th>Ref Number</th>
                                <th>Scheme Name</th>
                                <th>Category</th>
                                <th>Status</th>
                                <th>Applied On</th>
                                <th>Last Updated</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {applications.map((app) => (
                                <tr key={app.id}>
                                    <td>
                                        <span className="badge bg-light text-dark">
                                            {app.referenceNumber || 'Pending'}
                                        </span>
                                    </td>
                                    <td>{app.schemeName}</td>
                                    <td>{app.schemeCategory}</td>
                                    <td>
                                        <span className={`badge ${getStatusBadgeClass(app.status)}`}>
                                            {app.status}
                                        </span>
                                    </td>
                                    <td>{formatDate(app.submittedAt)}</td>
                                    <td>{formatDate(app.reviewedAt)}</td>
                                    <td>
                                        <Link
                                            to={`/schemes/applications/${app.id}`}
                                            className="btn btn-sm btn-primary"
                                        >
                                            <i className="fas fa-eye"></i> View
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default MyApplications;