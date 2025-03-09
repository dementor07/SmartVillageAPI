import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import LandRevenueService from '../../services/landrevenue.service';
import AuthService from '../../services/auth.service';

const LandRevenueList = ({ adminView = false }) => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [filter, setFilter] = useState('');
    const location = useLocation();
    const navigate = useNavigate();
    const isAdmin = AuthService.isAdmin();

    useEffect(() => {
        fetchApplications();
    }, [filter]);

    useEffect(() => {
        // Check for success message from navigation
        if (location.state?.message) {
            setSuccess(location.state.message);
        }
    }, [location.state]);

    const fetchApplications = async () => {
        try {
            setLoading(true);
            const response = adminView
                ? await LandRevenueService.getAllApplications(filter)
                : await LandRevenueService.getMyApplications();

            setApplications(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching land revenue applications:', error);
            setError('Failed to load applications. Please try again later.');
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        setFilter(e.target.value);
    };

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

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString();
    };

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>{adminView ? 'Manage Land Revenue Applications' : 'My Land Revenue Applications'}</h2>
                {!adminView && (
                    <Link to="/land-revenue/create" className="btn btn-success">
                        <i className="fas fa-plus me-1"></i> New Application
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

            {adminView && (
                <div className="mb-4">
                    <select
                        className="form-select form-select-sm w-auto"
                        value={filter}
                        onChange={handleFilterChange}
                    >
                        <option value="">All Statuses</option>
                        <option value="Pending">Pending</option>
                        <option value="In Process">In Process</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                    </select>
                </div>
            )}

            {loading ? (
                <div className="d-flex justify-content-center my-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            ) : applications.length === 0 ? (
                <div className="card">
                    <div className="card-body text-center p-5">
                        <i className="fas fa-file-certificate fa-4x text-muted mb-3"></i>
                        <h3>No applications found</h3>
                        {!adminView && (
                            <p>Apply for a land revenue service to get started.</p>
                        )}
                    </div>
                </div>
            ) : (
                <div className="table-responsive">
                    <table className="table table-striped table-hover">
                        <thead className="bg-light">
                            <tr>
                                <th>Reference No.</th>
                                <th>Service Type</th>
                                <th>Land Owner</th>
                                <th>Survey No.</th>
                                <th>Location</th>
                                {adminView && <th>Applicant</th>}
                                <th>Status</th>
                                {!adminView && <th>Payment</th>}
                                <th>Applied On</th>
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
                                    <td>{app.serviceType}</td>
                                    <td>{app.landOwnerName}</td>
                                    <td>{app.surveyNumber}</td>
                                    <td>{app.village}, {app.district}</td>
                                    {adminView && <td>{app.userName}</td>}
                                    <td>
                                        <span className={`badge ${getStatusBadgeClass(app.status)}`}>
                                            {app.status}
                                        </span>
                                    </td>
                                    {!adminView && app.paymentStatus && (
                                        <td>
                                            <span className={`badge ${getPaymentStatusBadgeClass(app.paymentStatus)}`}>
                                                {app.paymentStatus}
                                            </span>
                                        </td>
                                    )}
                                    <td>{formatDate(app.createdAt)}</td>
                                    <td>
                                        <Link
                                            to={`/land-revenue/${app.id}`}
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

export default LandRevenueList;