import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import DisputeService from '../../services/dispute.service';

const DisputeCaseList = ({ adminView = false }) => {
    const [cases, setCases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [filter, setFilter] = useState('');
    const location = useLocation();

    // Use useCallback to memoize fetchCases function
    const fetchCases = useCallback(async () => {
        try {
            setLoading(true);
            const response = adminView
                ? await DisputeService.getAllCases(filter)
                : await DisputeService.getMyCases();

            setCases(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching dispute cases:', error);
            setError('Failed to load dispute cases. Please try again later.');
            setLoading(false);
        }
    }, [filter, adminView]);

    // Now use fetchCases in the dependency array
    useEffect(() => {
        fetchCases();
    }, [fetchCases]);

    useEffect(() => {
        // Check for success message from navigation
        if (location.state?.message) {
            setSuccess(location.state.message);
        }
    }, [location.state]);

    const handleFilterChange = (e) => {
        setFilter(e.target.value);
    };

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

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString();
    };

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>{adminView ? 'Manage Dispute Resolution Cases' : 'My Dispute Resolution Cases'}</h2>
                {!adminView && (
                    <Link to="/dispute-resolution/create" className="btn btn-primary">
                        <i className="fas fa-plus me-1"></i> File New Case
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
                        <option value="In Review">In Review</option>
                        <option value="Scheduled">Scheduled</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
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
            ) : cases.length === 0 ? (
                <div className="card">
                    <div className="card-body text-center p-5">
                        <i className="fas fa-gavel fa-4x text-muted mb-3"></i>
                        <h3>No dispute cases found</h3>
                        {!adminView && (
                            <p>File a new dispute resolution case when needed.</p>
                        )}
                    </div>
                </div>
            ) : (
                <div className="table-responsive">
                    <table className="table table-striped table-hover">
                        <thead className="bg-light">
                            <tr>
                                <th>Reference No.</th>
                                <th>Title</th>
                                <th>Dispute Type</th>
                                <th>Parties Involved</th>
                                {adminView && <th>Filed By</th>}
                                <th>Status</th>
                                <th>Hearing Date</th>
                                <th>Filed On</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cases.map((disputeCase) => (
                                <tr key={disputeCase.id}>
                                    <td>
                                        <span className="badge bg-light text-dark">
                                            {disputeCase.referenceNumber || 'Pending'}
                                        </span>
                                    </td>
                                    <td>{disputeCase.title}</td>
                                    <td>{disputeCase.disputeType}</td>
                                    <td>{disputeCase.partiesInvolved}</td>
                                    {adminView && <td>{disputeCase.userName}</td>}
                                    <td>
                                        <span className={`badge ${getStatusBadgeClass(disputeCase.status)}`}>
                                            {disputeCase.status}
                                        </span>
                                    </td>
                                    <td>{disputeCase.hearingDate ? formatDate(disputeCase.hearingDate) : 'Not scheduled'}</td>
                                    <td>{formatDate(disputeCase.createdAt)}</td>
                                    <td>
                                        <Link
                                            to={`/dispute-resolution/${disputeCase.id}`}
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

export default DisputeCaseList;