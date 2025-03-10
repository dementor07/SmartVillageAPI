import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import LandRevenueService from '../services/landrevenue.service';
import AuthService from '../services/auth.service';

const LandRevenueDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [application, setApplication] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const isAdmin = AuthService.isAdmin();

    // Admin: Handle status update
    const [statusForm, setStatusForm] = useState({
        status: '',
        rejectionReason: '',
        approvalComments: ''
    });
    const [updating, setUpdating] = useState(false);
    const [updateError, setUpdateError] = useState('');
    const [updateSuccess, setUpdateSuccess] = useState('');

    // User: Handle payment update
    const [paymentForm, setPaymentForm] = useState({
        transactionId: ''
    });
    const [paymentUpdating, setPaymentUpdating] = useState(false);
    const [paymentError, setPaymentError] = useState('');
    const [paymentSuccess, setPaymentSuccess] = useState('');

    // Fetch application details
    const fetchApplicationDetails = useCallback(async () => {
        try {
            const response = await LandRevenueService.getApplicationById(id);
            setApplication(response.data);
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

    const handlePaymentInputChange = (e) => {
        setPaymentForm({
            ...paymentForm,
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
            await LandRevenueService.updateApplicationStatus(id, statusForm);
            setUpdateSuccess('Application status updated successfully!');
            fetchApplicationDetails(); // Refresh the application data
            setUpdating(false);
        } catch (error) {
            console.error('Error updating application status:', error);
            setUpdateError(error.response?.data?.message || 'Failed to update application status');
            setUpdating(false);
        }
    };

    const handlePaymentSubmit = async (e) => {
        e.preventDefault();

        if (!paymentForm.transactionId) {
            setPaymentError('Please enter a transaction ID');
            return;
        }

        setPaymentUpdating(true);
        setPaymentError('');

        try {
            await LandRevenueService.updatePaymentStatus(id, paymentForm);
            setPaymentSuccess('Payment status updated successfully!');
            fetchApplicationDetails(); // Refresh the application data
            setPaymentUpdating(false);
        } catch (error) {
            console.error('Error updating payment status:', error);
            setPaymentError(error.response?.data?.message || 'Failed to update payment status');
            setPaymentUpdating(false);
        }
    };

    // Get status badge class
    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'Approved':
                return 'bg-success';
            case 'Rejected':
                return 'bg-danger';
            case 'In Process':
                return 'bg-info';
            case 'Pending':
                return 'bg-warning text-dark';
            default:
                return 'bg-secondary';
        }
    };

    // Get payment status badge class
    const getPaymentStatusBadgeClass = (status) => {
        switch (status) {
            case 'Paid':
                return 'bg-success';
            case 'Pending':
                return 'bg-warning text-dark';
            case 'Not Required':
                return 'bg-secondary';
            default:
                return 'bg-light text-dark';
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

    if (!application) {
        return (
            <div className="container mt-4">
                <div className="alert alert-warning">Application not found</div>
                <Link to="/land-revenue/my-applications" className="btn btn-primary">
                    Back to My Applications
                </Link>
            </div>
        );
    }

    return (
        <div className="container mt-4">
            <div className="card">
                <div className="card-header bg-success text-white d-flex justify-content-between align-items-center">
                    <h3 className="mb-0">Land Revenue Application Details</h3>
                    <div>
                        <span className={`badge ${getStatusBadgeClass(application.status)} me-2`}>
                            {application.status}
                        </span>
                        {application.paymentStatus && (
                            <span className={`badge ${getPaymentStatusBadgeClass(application.paymentStatus)}`}>
                                Payment: {application.paymentStatus}
                            </span>
                        )}
                    </div>
                </div>
                <div className="card-body">
                    {updateSuccess && (
                        <div className="alert alert-success alert-dismissible fade show" role="alert">
                            {updateSuccess}
                            <button type="button" className="btn-close" onClick={() => setUpdateSuccess('')} aria-label="Close"></button>
                        </div>
                    )}

                    {paymentSuccess && (
                        <div className="alert alert-success alert-dismissible fade show" role="alert">
                            {paymentSuccess}
                            <button type="button" className="btn-close" onClick={() => setPaymentSuccess('')} aria-label="Close"></button>
                        </div>
                    )}

                    <div className="row mb-4">
                        <div className="col-md-6">
                            <h4>Service Information</h4>
                            <table className="table table-bordered">
                                <tbody>
                                    <tr>
                                        <th width="40%">Reference Number</th>
                                        <td>{application.referenceNumber || 'Pending'}</td>
                                    </tr>
                                    <tr>
                                        <th>Service Type</th>
                                        <td>{application.serviceType}</td>
                                    </tr>
                                    <tr>
                                        <th>Status</th>
                                        <td>
                                            <span className={`badge ${getStatusBadgeClass(application.status)}`}>
                                                {application.status}
                                            </span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <th>Application Date</th>
                                        <td>{formatDate(application.createdAt)}</td>
                                    </tr>
                                    <tr>
                                        <th>Resolved Date</th>
                                        <td>{application.resolvedAt ? formatDate(application.resolvedAt) : 'Not resolved yet'}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div className="col-md-6">
                            <h4>Land Details</h4>
                            <table className="table table-bordered">
                                <tbody>
                                    <tr>
                                        <th width="40%">Land Owner</th>
                                        <td>{application.landOwnerName}</td>
                                    </tr>
                                    <tr>
                                        <th>Survey Number</th>
                                        <td>{application.surveyNumber}</td>
                                    </tr>
                                    <tr>
                                        <th>Village</th>
                                        <td>{application.village}</td>
                                    </tr>
                                    <tr>
                                        <th>Taluk</th>
                                        <td>{application.taluk}</td>
                                    </tr>
                                    <tr>
                                        <th>District</th>
                                        <td>{application.district}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="row mb-4">
                        <div className="col-md-6">
                            <h4>Additional Information</h4>
                            <table className="table table-bordered">
                                <tbody>
                                    <tr>
                                        <th width="40%">Land Area</th>
                                        <td>{application.landArea || 'Not specified'}</td>
                                    </tr>
                                    <tr>
                                        <th>Land Type</th>
                                        <td>{application.landType || 'Not specified'}</td>
                                    </tr>
                                    <tr>
                                        <th>Patta Number</th>
                                        <td>{application.pattaNumber || 'Not specified'}</td>
                                    </tr>
                                    <tr>
                                        <th>Tax Receipt Number</th>
                                        <td>{application.taxReceiptNumber || 'Not specified'}</td>
                                    </tr>
                                </tbody>
                            </table>

                            {application.additionalDetails && (
                                <div className="card mt-3">
                                    <div className="card-header bg-light">
                                        <h5 className="mb-0">Additional Details</h5>
                                    </div>
                                    <div className="card-body">
                                        <p>{application.additionalDetails}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="col-md-6">
                            <h4>Payment Information</h4>
                            <table className="table table-bordered">
                                <tbody>
                                    <tr>
                                        <th width="40%">Fees Amount</th>
                                        <td>₹{application.feesAmount ? application.feesAmount.toFixed(2) : '0.00'}</td>
                                    </tr>
                                    <tr>
                                        <th>Payment Status</th>
                                        <td>
                                            <span className={`badge ${getPaymentStatusBadgeClass(application.paymentStatus || 'Not Required')}`}>
                                                {application.paymentStatus || 'Not Required'}
                                            </span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <th>Transaction ID</th>
                                        <td>{application.transactionId || 'Not available'}</td>
                                    </tr>
                                    <tr>
                                        <th>Payment Date</th>
                                        <td>{application.paymentDate ? formatDate(application.paymentDate) : 'Not paid yet'}</td>
                                    </tr>
                                </tbody>
                            </table>

                            {/* Payment form for user */}
                            {!isAdmin && application.paymentStatus === 'Pending' && (
                                <div className="card mt-3">
                                    <div className="card-header bg-warning text-dark">
                                        <h5 className="mb-0">Payment Required</h5>
                                    </div>
                                    <div className="card-body">
                                        {paymentError && (
                                            <div className="alert alert-danger">{paymentError}</div>
                                        )}
                                        <p>Please complete the payment of ₹{application.feesAmount ? application.feesAmount.toFixed(2) : '0.00'} to process your application.</p>
                                        <form onSubmit={handlePaymentSubmit}>
                                            <div className="mb-3">
                                                <label htmlFor="transactionId" className="form-label">Transaction ID</label>
                                                <input
                                                    id="transactionId"
                                                    name="transactionId"
                                                    type="text"
                                                    className="form-control"
                                                    value={paymentForm.transactionId}
                                                    onChange={handlePaymentInputChange}
                                                    required
                                                    placeholder="Enter your payment transaction ID"
                                                />
                                            </div>
                                            <button
                                                type="submit"
                                                className="btn btn-success"
                                                disabled={paymentUpdating}
                                            >
                                                {paymentUpdating ? (
                                                    <>
                                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                        Processing...
                                                    </>
                                                ) : (
                                                    <>Confirm Payment</>
                                                )}
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {application.documentData && (
                        <div className="card mb-4">
                            <div className="card-header bg-light">
                                <h4 className="mb-0">Supporting Document</h4>
                            </div>
                            <div className="card-body text-center">
                                {application.documentData.startsWith('data:image') ? (
                                    <img
                                        src={application.documentData}
                                        alt="Supporting Document"
                                        className="img-fluid rounded"
                                        style={{ maxHeight: '400px' }}
                                    />
                                ) : (
                                    <div className="p-4">
                                        <i className="fas fa-file-pdf fa-5x text-danger mb-3"></i>
                                        <p>Document is available but cannot be previewed. Please download to view.</p>
                                        <a
                                            href={application.documentData}
                                            download={`document-${application.referenceNumber || 'land-revenue'}.pdf`}
                                            className="btn btn-outline-primary"
                                        >
                                            <i className="fas fa-download me-2"></i> Download Document
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Status update results */}
                    {application.status === 'Rejected' && application.rejectionReason && (
                        <div className="alert alert-danger mt-3 mb-4">
                            <h5 className="alert-heading">Reason for Rejection:</h5>
                            <p>{application.rejectionReason}</p>
                        </div>
                    )}

                    {application.status === 'Approved' && application.approvalComments && (
                        <div className="alert alert-success mt-3 mb-4">
                            <h5 className="alert-heading">Approval Comments:</h5>
                            <p>{application.approvalComments}</p>
                        </div>
                    )}

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
                                            name="status"
                                            className="form-select"
                                            value={statusForm.status}
                                            onChange={handleStatusChange}
                                            required
                                        >
                                            <option value="">Select Status</option>
                                            <option value="In Process">In Process</option>
                                            <option value="Approved">Approved</option>
                                            <option value="Rejected">Rejected</option>
                                        </select>
                                    </div>

                                    {statusForm.status === 'Rejected' && (
                                        <div className="mb-3">
                                            <label htmlFor="rejectionReason" className="form-label">Reason for Rejection</label>
                                            <textarea
                                                id="rejectionReason"
                                                name="rejectionReason"
                                                className="form-control"
                                                rows="3"
                                                value={statusForm.rejectionReason}
                                                onChange={handleInputChange}
                                                required
                                            ></textarea>
                                        </div>
                                    )}

                                    {statusForm.status === 'Approved' && (
                                        <div className="mb-3">
                                            <label htmlFor="approvalComments" className="form-label">Approval Comments (Optional)</label>
                                            <textarea
                                                id="approvalComments"
                                                name="approvalComments"
                                                className="form-control"
                                                rows="3"
                                                value={statusForm.approvalComments}
                                                onChange={handleInputChange}
                                            ></textarea>
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        className="btn btn-primary"
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
                                            <td>{application.userName}</td>
                                        </tr>
                                        <tr>
                                            <th>Contact</th>
                                            <td>{application.userContact}</td>
                                        </tr>
                                        <tr>
                                            <th>Email</th>
                                            <td>{application.userEmail}</td>
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
                        {application.status === 'Approved' && (
                            <button className="btn btn-outline-success">
                                <i className="fas fa-print me-2"></i>
                                Print Certificate
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LandRevenueDetails;