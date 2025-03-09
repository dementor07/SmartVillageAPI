import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import DisasterService from '../../services/disaster.service';
import AuthService from '../../services/auth.service';

const DisasterCaseDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [disasterCase, setDisasterCase] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const isAdmin = AuthService.isAdmin();

    // Admin: Handle status update
    const [statusForm, setStatusForm] = useState({
        status: '',
        response: '',
        assignedTeam: ''
    });
    const [updating, setUpdating] = useState(false);
    const [updateError, setUpdateError] = useState('');
    const [updateSuccess, setUpdateSuccess] = useState('');

    // Fetch disaster case details
    const fetchCaseDetails = useCallback(async () => {
        try {
            const response = await DisasterService.getCaseById(id);
            setDisasterCase(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching disaster case details:', error);
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
            await DisasterService.updateCaseStatus(id, statusForm);
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
            case 'Monitoring':
                return 'bg-primary';
            case 'Pending':
                return 'bg-warning text-dark';
            default:
                return 'bg-secondary';
        }
    };

    // Get severity badge class
    const getSeverityBadgeClass = (severity) => {
        switch (severity) {
            case 'Critical':
                return 'bg-danger';
            case 'High':
                return 'bg-warning';
            case 'Medium':
                return 'bg-info';
            case 'Low':
                return 'bg-success';
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

    if (!disasterCase) {
        return (
            <div className="container mt-4">
                <div className="alert alert-warning">Case not found</div>
                <Link to="/disaster-management/my-cases" className="btn btn-primary">
                    Back to My Cases
                </Link>
            </div>
        );
    }

    return (
        <div className="container mt-4">
            <div className="card">
                <div className="card-header bg-danger text-white d-flex justify-content-between align-items-center">
                    <h3 className="mb-0">Disaster Report Details</h3>
                    <span className={`badge ${getStatusBadgeClass(disasterCase.status)}`}>
                        {disasterCase.status}
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
                            <h4>Incident Information</h4>
                            <table className="table table-bordered">
                                <tbody>
                                    <tr>
                                        <th>Title</th>
                                        <td>{disasterCase.title}</td>
                                    </tr>
                                    <tr>
                                        <th>Reference Number</th>
                                        <td>{disasterCase.referenceNumber || 'Pending'}</td>
                                    </tr>
                                    <tr>
                                        <th>Disaster Type</th>
                                        <td>{disasterCase.disasterType}</td>
                                    </tr>
                                    <tr>
                                        <th>Location</th>
                                        <td>{disasterCase.location}</td>
                                    </tr>
                                    <tr>
                                        <th>Occurrence Date</th>
                                        <td>{formatDate(disasterCase.occurrenceDate)}</td>
                                    </tr>
                                    <tr>
                                        <th>Severity</th>
                                        <td>
                                            <span className={`badge ${getSeverityBadgeClass(disasterCase.severity)}`}>
                                                {disasterCase.severity || 'Medium'}
                                            </span>
                                        </td>
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
                                            <span className={`badge ${getStatusBadgeClass(disasterCase.status)}`}>
                                                {disasterCase.status}
                                            </span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <th>Reported On</th>
                                        <td>{formatDate(disasterCase.createdAt)}</td>
                                    </tr>
                                    <tr>
                                        <th>Resolved On</th>
                                        <td>{disasterCase.resolvedAt ? formatDate(disasterCase.resolvedAt) : 'Not resolved yet'}</td>
                                    </tr>
                                    <tr>
                                        <th>Assigned Team</th>
                                        <td>{disasterCase.assignedTeam || 'Not assigned yet'}</td>
                                    </tr>
                                    <tr>
                                        <th>Impact Area</th>
                                        <td>{disasterCase.impactedArea || 'Not specified'}</td>
                                    </tr>
                                    <tr>
                                        <th>Affected Count</th>
                                        <td>{disasterCase.affectedCount || 'Not specified'}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="card mb-4">
                        <div className="card-header bg-light">
                            <h5 className="mb-0">Incident Description</h5>
                        </div>
                        <div className="card-body">
                            <p>{disasterCase.description}</p>
                        </div>
                    </div>

                    {disasterCase.response && (
                        <div className="card mb-4">
                            <div className="card-header bg-success text-white">
                                <h5 className="mb-0">Official Response</h5>
                            </div>
                            <div className="card-body">
                                <p>{disasterCase.response}</p>
                            </div>
                        </div>
                    )}

                    {disasterCase.imageData && (
                        <div className="card mb-4">
                            <div className="card-header bg-light">
                                <h5 className="mb-0">Incident Photo</h5>
                            </div>
                            <div className="card-body text-center">
                                <img
                                    src={disasterCase.imageData}
                                    alt="Disaster Incident"
                                    className="img-fluid rounded"
                                    style={{ maxHeight: '400px' }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Admin section for updating case status */}
                    {isAdmin && disasterCase.status !== 'Resolved' && disasterCase.status !== 'Rejected' && (
                        <div className="card mt-4">
                            <div className="card-header bg-light">
                                <h4 className="mb-0">Update Status</h4>
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
                                                <option value="In Progress">In Progress</option>
                                                <option value="Monitoring">Monitoring</option>
                                                <option value="Resolved">Resolved</option>
                                                <option value="Rejected">Rejected</option>
                                            </select>
                                        </div>
                                        <div className="col-md-6">
                                            <label htmlFor="assignedTeam" className="form-label">Assigned Team</label>
                                            <input
                                                id="assignedTeam"
                                                name="assignedTeam"
                                                type="text"
                                                className="form-control"
                                                value={statusForm.assignedTeam}
                                                onChange={handleInputChange}
                                                placeholder="e.g., Fire Brigade Team 3"
                                            />
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="response" className="form-label">
                                            {statusForm.status === 'Resolved' ? 'Resolution Details' : 'Response Updates'}
                                        </label>
                                        <textarea
                                            id="response"
                                            name="response"
                                            className="form-control"
                                            rows="3"
                                            value={statusForm.response}
                                            onChange={handleInputChange}
                                            required={statusForm.status === 'Resolved'}
                                            placeholder="Provide details about the actions taken or resolution"
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
                                <h4 className="mb-0">Reporter Information</h4>
                            </div>
                            <div className="card-body">
                                <table className="table table-bordered">
                                    <tbody>
                                        <tr>
                                            <th>Name</th>
                                            <td>{disasterCase.userName}</td>
                                        </tr>
                                        <tr>
                                            <th>Contact</th>
                                            <td>{disasterCase.userContact}</td>
                                        </tr>
                                        <tr>
                                            <th>Email</th>
                                            <td>{disasterCase.userEmail}</td>
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
                        {disasterCase.status === 'Pending' && !isAdmin && (
                            <span className="text-muted">
                                <i className="fas fa-info-circle me-1"></i>
                                Your report is being reviewed
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DisasterCaseDetails;