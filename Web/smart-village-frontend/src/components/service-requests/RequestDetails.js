import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import RequestService from '../../services/request.service';
import AuthService from '../../services/auth.service';

const RequestDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [request, setRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const isAdmin = AuthService.isAdmin();

    // Admin: Handle status update
    const [statusForm, setStatusForm] = useState({
        status: '',
        resolution: ''
    });
    const [updating, setUpdating] = useState(false);
    const [updateError, setUpdateError] = useState('');
    const [updateSuccess, setUpdateSuccess] = useState('');

    // Fetch request details
    const fetchRequestDetails = useCallback(async () => {
        try {
            const response = await RequestService.getRequestById(id);
            setRequest(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching request details:', error);
            setError('Failed to load request details. Please try again later.');
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchRequestDetails();
    }, [fetchRequestDetails]);

    const handleStatusChange = (e) => {
        setStatusForm({
            ...statusForm,
            status: e.target.value
        });
    };

    const handleResolutionChange = (e) => {
        setStatusForm({
            ...statusForm,
            resolution: e.target.value
        });
    };

    const handleStatusSubmit = async (e) => {
        e.preventDefault();

        if (!statusForm.status) {
            setUpdateError('Please select a status');
            return;
        }

        setUpdating(true);
        setUpdateError('');

        try {
            await RequestService.updateRequestStatus(id, statusForm);
            setUpdateSuccess('Request status updated successfully!');
            fetchRequestDetails(); // Refresh request data
            setUpdating(false);
        } catch (error) {
            console.error('Error updating request status:', error);
            setUpdateError(error.response?.data?.message || 'Failed to update request status');
            setUpdating(false);
        }
    };

    // Get status badge class
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

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
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

    if (error) {
        return (
            <div className="container mt-4">
                <div className="alert alert-danger">{error}</div>
                <button onClick={() => navigate(-1)} className="btn btn-primary">
                    Go Back
                </button>
            </div>
        );
    }

    if (!request) {
        return (
            <div className="container mt-4">
                <div className="alert alert-warning">Request not found</div>
                <Link to="/service-requests" className="btn btn-primary">
                    Back to Requests
                </Link>
            </div>
        );
    }

    return (
        <div className="container mt-4">
            <div className="card">
                <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                    <h3 className="mb-0">Service Request Details</h3>
                    <span className={`badge ${getStatusBadgeClass(request.status)}`}>
                        {request.status}
                    </span>
                </div>
                <div className="card-body">
                    {updateSuccess && (
                        <div className="alert alert-success alert-dismissible fade show" role="alert">
                            {updateSuccess}
                            <button type="button" className="btn-close" onClick={() => setUpdateSuccess('')} aria-label="Close"></button>
                        </div>
                    )}

                    <div className="row mb-4">
                        <div className="col-md-6">
                            <h4>Request Information</h4>
                            <table className="table table-bordered">
                                <tbody>
                                    <tr>
                                        <th width="30%">Title</th>
                                        <td>{request.title}</td>
                                    </tr>
                                    <tr>
                                        <th>Category</th>
                                        <td>{request.category}</td>
                                    </tr>
                                    <tr>
                                        <th>Status</th>
                                        <td>
                                            <span className={`badge ${getStatusBadgeClass(request.status)}`}>
                                                {request.status}
                                            </span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <th>Submitted On</th>
                                        <td>{formatDate(request.createdAt)}</td>
                                    </tr>
                                    {request.resolvedAt && (
                                        <tr>
                                            <th>Resolved On</th>
                                            <td>{formatDate(request.resolvedAt)}</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="col-md-6">
                            <h4>Description</h4>
                            <div className="card">
                                <div className="card-body">
                                    <p>{request.description}</p>
                                </div>
                            </div>

                            {request.resolution && (
                                <div className="mt-3">
                                    <h4>Resolution</h4>
                                    <div className="card bg-light">
                                        <div className="card-body">
                                            <p>{request.resolution}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Admin section for updating request status */}
                    {isAdmin && request.status !== 'Resolved' && (
                        <div className="card mt-4">
                            <div className="card-header bg-light">
                                <h4 className="mb-0">Update Request Status</h4>
                            </div>
                            <div className="card-body">
                                {updateError && (
                                    <div className="alert alert-danger">{updateError}</div>
                                )}
                                <form onSubmit={handleStatusSubmit}>
                                    <div className="mb-3">
                                        <label htmlFor="status" className="form-label">Status</label>
                                        <select
                                            id="status"
                                            className="form-select"
                                            value={statusForm.status}
                                            onChange={handleStatusChange}
                                            required
                                        >
                                            <option value="">Select Status</option>
                                            <option value="In Progress">In Progress</option>
                                            <option value="Resolved">Resolved</option>
                                            <option value="Rejected">Rejected</option>
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="resolution" className="form-label">
                                            {statusForm.status === 'Resolved' ? 'Resolution Details' : 'Notes'}
                                        </label>
                                        <textarea
                                            id="resolution"
                                            className="form-control"
                                            rows="3"
                                            value={statusForm.resolution}
                                            onChange={handleResolutionChange}
                                            required={statusForm.status === 'Resolved'}
                                        ></textarea>
                                    </div>
                                    <button
                                        type="submit"
                                        className={`btn ${statusForm.status === 'Resolved' ? 'btn-success' :
                                            statusForm.status === 'Rejected' ? 'btn-danger' : 'btn-primary'}`}
                                        disabled={updating || !statusForm.status}
                                    >
                                        {updating ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                Updating...
                                            </>
                                        ) : (
                                            <>Update Status</>
                                        )}
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Show requester information for admin */}
                    {isAdmin && (
                        <div className="card mt-4">
                            <div className="card-header bg-light">
                                <h4 className="mb-0">Requester Information</h4>
                            </div>
                            <div className="card-body">
                                <table className="table table-bordered">
                                    <tbody>
                                        <tr>
                                            <th width="30%">Name</th>
                                            <td>{request.userName}</td>
                                        </tr>
                                        <tr>
                                            <th>Contact</th>
                                            <td>{request.userContact}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
                <div className="card-footer">
                    <button onClick={() => navigate(-1)} className="btn btn-outline-secondary">
                        <i className="fas fa-arrow-left me-2"></i>
                        Back
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RequestDetails;