import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import DisputeService from '../services/dispute.service';
import AuthService from '../services/auth.service';

const DisputeCaseDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [disputeCase, setDisputeCase] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const isAdmin = AuthService.isAdmin();

    // Admin: Handle status update
    const [statusForm, setStatusForm] = useState({
        status: '',
        notes: '',
        hearingDate: '',
        mediatorName: ''
    });
    const [updating, setUpdating] = useState(false);
    const [updateError, setUpdateError] = useState('');
    const [updateSuccess, setUpdateSuccess] = useState('');

    // Fetch dispute case details
    const fetchCaseDetails = useCallback(async () => {
        try {
            const response = await DisputeService.getCaseById(id);
            setDisputeCase(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching dispute case details:', error);
            setError('Failed to load case details. Please try again later.');
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchCaseDetails();
    }, [fetchCaseDetails]);

    const handleStatusChange = (e) => {
        setStatusForm({
            ...statusForm,
            status: e.target.value
        });
    };

    const handleInputChange = (e) => {
        setStatusForm({
            ...statusForm,
            [e.target.name]: e.target.value
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
            await DisputeService.updateCaseStatus(id, statusForm);
            setUpdateSuccess('Case status updated successfully!');
            fetchCaseDetails(); // Refresh the case data
            setUpdating(false);
        } catch (error) {
            console.error('Error updating case status:', error);
            setUpdateError(error.response?.data?.message || 'Failed to update case status');
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
            case 'Scheduled':
                return 'bg-primary';
            case 'In Review':
                return 'bg-secondary';
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

    if (!disputeCase) {
        return (
            <div className="container mt-4">
                <div className="alert alert-warning">Case not found</div>
                <Link to="/dispute-resolution/my-cases" className="btn btn-primary">
                    Back to My Cases
                </Link>
            </div>
        );
    }

    return (
        <div className="container mt-4">
            <div className="card">
                <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                    <h3 className="mb-0">Dispute Resolution Case Details</h3>
                    <span className={`badge ${getStatusBadgeClass(disputeCase.status)}`}>
                        {disputeCase.status}
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
                            <h4>Case Information</h4>
                            <table className="table table-bordered">
                                <tbody>
                                    <tr>
                                        <th>Title</th>
                                        <td>{disputeCase.title}</td>
                                    </tr>
                                    <tr>
                                        <th>Reference Number</th>
                                        <td>{disputeCase.referenceNumber || 'Pending'}</td>
                                    </tr>
                                    <tr>
                                        <th>Dispute Type</th>
                                        <td>{disputeCase.disputeType}</td>
                                    </tr>
                                    <tr>
                                        <th>Parties Involved</th>
                                        <td>{disputeCase.partiesInvolved}</td>
                                    </tr>
                                    <tr>
                                        <th>Location</th>
                                        <td>{disputeCase.location || 'Not specified'}</td>
                                    </tr>
                                    <tr>
                                        <th>Date of Dispute</th>
                                        <td>{formatDate(disputeCase.disputeDate)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div className="col-md-6">
                            <h4>Status Information</h4>
                            <table className="table table-bordered">
                                <tbody>
                                    <tr>
                                        <th>Status</th>
                                        <td>
                                            <span className={`badge ${getStatusBadgeClass(disputeCase.status)}`}>
                                                {disputeCase.status}
                                            </span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <th>Filed On</th>
                                        <td>{formatDate(disputeCase.createdAt)}</td>
                                    </tr>
                                    <tr>
                                        <th>Last Updated</th>
                                        <td>{formatDate(disputeCase.updatedAt)}</td>
                                    </tr>
                                    <tr>
                                        <th>Mediator Assigned</th>
                                        <td>{disputeCase.mediatorName || 'Not assigned yet'}</td>
                                    </tr>
                                    <tr>
                                        <th>Hearing Date</th>
                                        <td>{disputeCase.hearingDate ? formatDate(disputeCase.hearingDate) : 'Not scheduled yet'}</td>
                                    </tr>
                                    <tr>
                                        <th>Resolved On</th>
                                        <td>{disputeCase.resolvedAt ? formatDate(disputeCase.resolvedAt) : 'Not resolved yet'}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="card mb-4">
                        <div className="card-header bg-light">
                            <h5 className="mb-0">Dispute Description</h5>
                        </div>
                        <div className="card-body">
                            <p>{disputeCase.description}</p>
                        </div>
                    </div>

                    {disputeCase.priorResolutionAttempts && (
                        <div className="card mb-4">
                            <div className="card-header bg-light">
                                <h5 className="mb-0">Prior Resolution Attempts</h5>
                            </div>
                            <div className="card-body">
                                <p>{disputeCase.priorResolutionAttempts}</p>
                            </div>
                        </div>
                    )}

                    {disputeCase.notes && (
                        <div className="card mb-4">
                            <div className="card-header bg-info text-white">
                                <h5 className="mb-0">Mediator Notes</h5>
                            </div>
                            <div className="card-body">
                                <p>{disputeCase.notes}</p>
                            </div>
                        </div>
                    )}

                    {disputeCase.documentData && (
                        <div className="card mb-4">
                            <div className="card-header bg-light">
                                <h5 className="mb-0">Supporting Document</h5>
                            </div>
                            <div className="card-body text-center">
                                {disputeCase.documentData.startsWith('data:image') ? (
                                    <img
                                        src={disputeCase.documentData}
                                        alt="Supporting Document"
                                        className="img-fluid rounded"
                                        style={{ maxHeight: '400px' }}
                                    />
                                ) : (
                                    <div className="p-4">
                                        <i className="fas fa-file-pdf fa-5x text-danger mb-3"></i>
                                        <p>Document is available but cannot be previewed. Please download to view.</p>
                                        <a
                                            href={disputeCase.documentData}
                                            download={`document-${disputeCase.referenceNumber || 'dispute-case'}.pdf`}
                                            className="btn btn-outline-primary"
                                        >
                                            <i className="fas fa-download me-2"></i> Download Document
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Admin section for updating case status */}
                    {isAdmin && disputeCase.status !== 'Resolved' && disputeCase.status !== 'Rejected' && (
                        <div className="card mt-4">
                            <div className="card-header bg-light">
                                <h4 className="mb-0">Update Case Status</h4>
                            </div>
                            <div className="card-body">
                                {updateError && (
                                    <div className="alert alert-danger">{updateError}</div>
                                )}
                                <form onSubmit={handleStatusSubmit}>
                                    <div className="row mb-3">
                                        <div className="col-md-6">
                                            <label htmlFor="status" className="form-label">Status</label>
                                            <select
                                                id="status"
                                                className="form-select"
                                                value={statusForm.status}
                                                onChange={handleStatusChange}
                                                required
                                            >
                                                <option value="">Select Status</option>
                                                <option value="In Review">In Review</option>
                                                <option value="Scheduled">Scheduled</option>
                                                <option value="In Progress">In Progress</option>
                                                <option value="Resolved">Resolved</option>
                                                <option value="Rejected">Rejected</option>
                                            </select>
                                        </div>
                                        <div className="col-md-6">
                                            <label htmlFor="mediatorName" className="form-label">Mediator Name</label>
                                            <input
                                                id="mediatorName"
                                                name="mediatorName"
                                                type="text"
                                                className="form-control"
                                                value={statusForm.mediatorName}
                                                onChange={handleInputChange}
                                                placeholder="Enter mediator name"
                                            />
                                        </div>
                                    </div>

                                    <div className="row mb-3">
                                        <div className="col-md-6">
                                            <label htmlFor="hearingDate" className="form-label">Hearing Date</label>
                                            <input
                                                id="hearingDate"
                                                name="hearingDate"
                                                type="datetime-local"
                                                className="form-control"
                                                value={statusForm.hearingDate}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <label htmlFor="notes" className="form-label">Notes</label>
                                        <textarea
                                            id="notes"
                                            name="notes"
                                            className="form-control"
                                            rows="3"
                                            value={statusForm.notes}
                                            onChange={handleInputChange}
                                            placeholder="Add notes, resolution details, or rejection reason"
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

                    {/* Show reporter information for admin */}
                    {isAdmin && (
                        <div className="card mt-4">
                            <div className="card-header bg-light">
                                <h4 className="mb-0">Complainant Information</h4>
                            </div>
                            <div className="card-body">
                                <table className="table table-bordered">
                                    <tbody>
                                        <tr>
                                            <th>Name</th>
                                            <td>{disputeCase.userName}</td>
                                        </tr>
                                        <tr>
                                            <th>Contact</th>
                                            <td>{disputeCase.userContact}</td>
                                        </tr>
                                        <tr>
                                            <th>Email</th>
                                            <td>{disputeCase.userEmail}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
                <div className="card-footer">
                    <div className="d-flex justify-content-between">
                        <button onClick={() => navigate(-1)} className="btn btn-outline-secondary">
                            <i className="fas fa-arrow-left me-2"></i>
                            Back
                        </button>
                        {disputeCase.status === 'Scheduled' && (
                            <span className="text-info">
                                <i className="fas fa-calendar-check me-2"></i>
                                Your hearing is scheduled for {formatDate(disputeCase.hearingDate)}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DisputeCaseDetails;