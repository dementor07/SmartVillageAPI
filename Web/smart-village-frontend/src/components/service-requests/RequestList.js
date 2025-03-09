import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import RequestService from '../../services/request.service';

const RequestList = ({ adminView = false }) => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const location = useLocation();

    // Use useCallback to memoize the fetchRequests function to prevent unnecessary re-creation
    const fetchRequests = useCallback(async () => {
        try {
            setLoading(true);
            const response = adminView
                ? await RequestService.getAllRequests()
                : await RequestService.getMyRequests();

            setRequests(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching service requests:', error);
            setError('Failed to load service requests. Please try again later.');
            setLoading(false);
        }
    }, [adminView]); // Adding adminView as a dependency

    // Use fetchRequests in the dependency array
    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    useEffect(() => {
        // Check for success message from navigation
        if (location.state?.message) {
            setSuccess(location.state.message);
        }
    }, [location.state]);

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'Resolved':
                return 'bg-success';
            case 'Rejected':
                return 'bg-danger';
            case 'In Progress':
                return 'bg-info';
            case 'Pending':
                return 'bg-warning text-dark';
            default:
                return 'bg-secondary';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString();
    };

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>{adminView ? 'Manage Service Requests' : 'My Service Requests'}</h2>
                {!adminView && (
                    <Link to="/service-requests/create" className="btn btn-primary">
                        <i className="fas fa-plus me-1"></i> New Request
                    </Link>
                )}
            </div>

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

            {error && <div className="alert alert-danger">{error}</div>}

            {loading ? (
                <div className="d-flex justify-content-center my-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            ) : requests.length === 0 ? (
                <div className="card">
                    <div className="card-body text-center p-5">
                        <i className="fas fa-clipboard-list fa-4x text-muted mb-3"></i>
                        <h3>No service requests found</h3>
                        {!adminView && (
                            <p>Create a new service request to get started.</p>
                        )}
                    </div>
                </div>
            ) : (
                <div className="table-responsive">
                    <table className="table table-striped table-hover">
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Category</th>
                                <th>Status</th>
                                <th>Submitted On</th>
                                <th>Resolved On</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requests.map((request) => (
                                <tr key={request.id}>
                                    <td>{request.title}</td>
                                    <td>{request.category}</td>
                                    <td>
                                        <span className={`badge ${getStatusBadgeClass(request.status)}`}>
                                            {request.status}
                                        </span>
                                    </td>
                                    <td>{formatDate(request.createdAt)}</td>
                                    <td>{formatDate(request.resolvedAt)}</td>
                                    <td>
                                        <Link
                                            to={`/service-requests/${request.id}`}
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

export default RequestList;