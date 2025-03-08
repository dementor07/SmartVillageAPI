import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import SchemeService from '../../services/scheme.service';
import AuthService from '../../services/auth.service';

const ApplicationDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [application, setApplication] = useState(null);
    const [applicationData, setApplicationData] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const isAdmin = AuthService.isAdmin();

    // Fetch application details
    const fetchApplicationDetails = useCallback(async () => {
        try {
            const response = await SchemeService.getApplicationDetails(id);
            setApplication(response.data);

            // Parse application data
            try {
                if (response.data.applicationData) {
                    const parsedData = JSON.parse(response.data.applicationData);
                    setApplicationData(parsedData);
                }
            } catch (parseError) {
                console.error('Error parsing application data:', parseError);
                setApplicationData({});
            }

            setLoading(false);
        } catch (error) {
            console.error('Error fetching application details:', error);
            setError('Failed to load application details. Please try again later.');
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchApplicationDetails();
    }, [fetchApplicationDetails]);

    // Admin: Handle status update
    const [statusForm, setStatusForm] = useState({
        status: '',
        notes: ''
    });
    const [updating, setUpdating] = useState(false);
    const [updateError, setUpdateError] = useState('');
    const [updateSuccess, setUpdateSuccess] = useState('');

    const handleStatusChange = (e) => {
        setStatusForm({
            ...statusForm,
            status: e.target.value
        });
    };

    const handleNotesChange = (e) => {
        setStatusForm({
            ...statusForm,
            notes: e.target.value
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
            await SchemeService.updateApplicationStatus(id, statusForm);
            setUpdateSuccess('Application status updated successfully!');
            fetchApplicationDetails(); // Refresh the application data
            setUpdating(false);
        } catch (error) {
            console.error('Error updating application status:', error);
            setUpdateError(error.response?.data?.message || 'Failed to update application status');
            setUpdating(false);
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

    // Get status badge class
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

    if (!application) {
        return (
            <div className="container mt-4">
                <div className="alert alert-warning">Application not found</div>
                <Link to="/schemes/my-applications" className="btn btn-primary">
                    Back to My Applications
                </Link>
            </div>
        );
    }

    return (
        <div className="container mt-4">
            <div className="card">
                <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                    <h3 className="mb-0">Application Details</h3>
                    <span className={`badge ${getStatusBadgeClass(application.status)}`}>
                        {application.status}
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
                            <h4>Scheme Information</h4>
                            <table className="table table-bordered">
                                <tbody>
                                    <tr>
                                        <th>Scheme Name</th>
                                        <td>{application.schemeName}</td>
                                    </tr>
                                    <tr>
                                        <th>Category</th>
                                        <td>{application.schemeCategory}</td>
                                    </tr>
                                    <tr>
                                        <th>Reference Number</th>
                                        <td>{application.referenceNumber || 'Pending'}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div className="col-md-6">
                            <h4>Application Status</h4>
                            <table className="table table-bordered">
                                <tbody>
                                    <tr>
                                        <th>Status</th>
                                        <td>
                                            <span className={`badge ${getStatusBadgeClass(application.status)}`}>
                                                {application.status}
                                            </span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <th>Submitted At</th>
                                        <td>{formatDate(application.submittedAt)}</td>
                                    </tr>
                                    <tr>
                                        <th>Reviewed At</th>
                                        <td>{formatDate(application.reviewedAt)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* If application is rejected, show the rejection notes */}
                    {application.status === 'Rejected' && application.notes && (
                        <div className="alert alert-danger mt-3 mb-4">
                            <h5 className="alert-heading">Rejection Notes:</h5>
                            <p>{application.notes}</p>
                        </div>
                    )}

                    {/* If application is approved, show any approval notes */}
                    {application.status === 'Approved' && application.notes && (
                        <div className="alert alert-success mt-3 mb-4">
                            <h5 className="alert-heading">Approval Notes:</h5>
                            <p>{application.notes}</p>
                        </div>
                    )}

                    <h4 className="mt-4 mb-3">Application Details</h4>
                    <div className="table-responsive">
                        <table className="table table-bordered table-striped">
                            <thead>
                                <tr>
                                    <th style={{ width: '30%' }}>Field</th>
                                    <th>Value</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(applicationData).map(([key, value]) => (
                                    <tr key={key}>
                                        <th>{key.replace(/([A-Z])/g, ' $1').charAt(0).toUpperCase() + key.replace(/([A-Z])/g, ' $1').slice(1)}</th>
                                        <td>{value}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Admin section for updating application status */}
                    {isAdmin && application.status === 'Pending' && (
                        <div className="card mt-4">
                            <div className="card-header bg-light">
                                <h4 className="mb-0">Update Application Status</h4>
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
                                            <option value="Approved">Approve</option>
                                            <option value="Rejected">Reject</option>
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="notes" className="form-label">
                                            {statusForm.status === 'Rejected' ? 'Rejection Reason' : 'Notes (Optional)'}
                                        </label>
                                        <textarea
                                            id="notes"
                                            className="form-control"
                                            rows="3"
                                            value={statusForm.notes}
                                            onChange={handleNotesChange}
                                            required={statusForm.status === 'Rejected'}
                                        ></textarea>
                                    </div>
                                    <button
                                        type="submit"
                                        className={`btn ${statusForm.status === 'Approved' ? 'btn-success' : statusForm.status === 'Rejected' ? 'btn-danger' : 'btn-primary'}`}
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

                    {/* Show applicant information for admin */}
                    {isAdmin && (
                        <div className="card mt-4">
                            <div className="card-header bg-light">
                                <h4 className="mb-0">Applicant Information</h4>
                            </div>
                            <div className="card-body">
                                <table className="table table-bordered">
                                    <tbody>
                                        <tr>
                                            <th>Name</th>
                                            <td>{application.applicantName}</td>
                                        </tr>
                                        <tr>
                                            <th>Email</th>
                                            <td>{application.applicantEmail}</td>
                                        </tr>
                                        <tr>
                                            <th>Contact</th>
                                            <td>{application.applicantMobile}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
                <div className="card-footer">
                    <div className="d-flex justify-content-between">
                        {isAdmin ? (
                            <Link to="/schemes/admin/applications" className="btn btn-outline-secondary">
                                <i className="fas fa-arrow-left me-2"></i>
                                Back to Applications
                            </Link>
                        ) : (
                            <Link to="/schemes/my-applications" className="btn btn-outline-secondary">
                                <i className="fas fa-arrow-left me-2"></i>
                                Back to My Applications
                            </Link>
                        )}
                        <Link to={`/schemes/${application.schemeId}`} className="btn btn-primary">
                            <i className="fas fa-info-circle me-2"></i>
                            View Scheme Details
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ApplicationDetails;