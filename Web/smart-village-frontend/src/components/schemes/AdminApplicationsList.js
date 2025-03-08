import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import SchemeService from '../../services/scheme.service';

const AdminApplicationsList = () => {
    const [applications, setApplications] = useState([]);
    const [schemes, setSchemes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [schemeFilter, setSchemeFilter] = useState('');
    const location = useLocation();

    // Fetch applications with filters
    const fetchApplications = useCallback(async () => {
        try {
            setLoading(true);
            const response = await SchemeService.getAllApplications(statusFilter, schemeFilter);
            setApplications(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching applications:', error);
            setError('Failed to load applications. Please try again later.');
            setLoading(false);
        }
    }, [statusFilter, schemeFilter]);

    // Fetch all schemes for filter
    const fetchSchemes = useCallback(async () => {
        try {
            const response = await SchemeService.getSchemes();
            setSchemes(response.data);
        } catch (error) {
            console.error('Error fetching schemes for filter:', error);
        }
    }, []);

    useEffect(() => {
        fetchApplications();
    }, [fetchApplications]);

    useEffect(() => {
        fetchSchemes();
    }, [fetchSchemes]);

    useEffect(() => {
        // Check for success message from navigation
        if (location.state?.message) {
            setSuccess(location.state.message);
        }
    }, [location.state]);

    const handleStatusFilterChange = (e) => {
        setStatusFilter(e.target.value);
    };

    const handleSchemeFilterChange = (e) => {
        setSchemeFilter(e.target.value);
    };

    const handleClearFilters = () => {
        setStatusFilter('');
        setSchemeFilter('');
    };

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
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

    // Calculate stats for the dashboard
    const getStats = () => {
        const total = applications.length;
        const pending = applications.filter(app => app.status === 'Pending').length;
        const approved = applications.filter(app => app.status === 'Approved').length;
        const rejected = applications.filter(app => app.status === 'Rejected').length;

        return { total, pending, approved, rejected };
    };

    const stats = getStats();

    return (
        <div className="container mt-4">
            <h2 className="mb-4">Manage Scheme Applications</h2>

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

            {/* Stats cards */}
            <div className="row mb-4">
                <div className="col-md-3">
                    <div className="card bg-primary text-white">
                        <div className="card-body text-center">
                            <h5 className="card-title">Total Applications</h5>
                            <h2 className="display-4">{stats.total}</h2>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card bg-warning text-dark">
                        <div className="card-body text-center">
                            <h5 className="card-title">Pending</h5>
                            <h2 className="display-4">{stats.pending}</h2>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card bg-success text-white">
                        <div className="card-body text-center">
                            <h5 className="card-title">Approved</h5>
                            <h2 className="display-4">{stats.approved}</h2>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card bg-danger text-white">
                        <div className="card-body text-center">
                            <h5 className="card-title">Rejected</h5>
                            <h2 className="display-4">{stats.rejected}</h2>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="card mb-4">
                <div className="card-header bg-light">
                    <h5 className="mb-0">Filter Applications</h5>
                </div>
                <div className="card-body">
                    <div className="row">
                        <div className="col-md-5">
                            <div className="mb-3">
                                <label htmlFor="statusFilter" className="form-label">Filter by Status</label>
                                <select
                                    id="statusFilter"
                                    className="form-select"
                                    value={statusFilter}
                                    onChange={handleStatusFilterChange}
                                >
                                    <option value="">All Statuses</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Approved">Approved</option>
                                    <option value="Rejected">Rejected</option>
                                </select>
                            </div>
                        </div>
                        <div className="col-md-5">
                            <div className="mb-3">
                                <label htmlFor="schemeFilter" className="form-label">Filter by Scheme</label>
                                <select
                                    id="schemeFilter"
                                    className="form-select"
                                    value={schemeFilter}
                                    onChange={handleSchemeFilterChange}
                                >
                                    <option value="">All Schemes</option>
                                    {schemes.map(scheme => (
                                        <option key={scheme.id} value={scheme.id}>
                                            {scheme.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="col-md-2 d-flex align-items-end">
                            <button
                                className="btn btn-secondary w-100"
                                onClick={handleClearFilters}
                            >
                                Clear Filters
                            </button>
                        </div>
                    </div>
                </div>
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
                        <p>No applications match your current filters.</p>
                        {(statusFilter || schemeFilter) && (
                            <button
                                className="btn btn-primary mt-3"
                                onClick={handleClearFilters}
                            >
                                Clear Filters
                            </button>
                        )}
                    </div>
                </div>
            ) : (
                <div className="table-responsive">
                    <table className="table table-striped table-hover">
                        <thead className="bg-light">
                            <tr>
                                <th>Ref Number</th>
                                <th>Scheme Name</th>
                                <th>Applicant</th>
                                <th>Contact</th>
                                <th>Status</th>
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
                                    <td>{app.schemeName}</td>
                                    <td>{app.applicantName}</td>
                                    <td>{app.applicantContact}</td>
                                    <td>
                                        <span className={`badge ${getStatusBadgeClass(app.status)}`}>
                                            {app.status}
                                        </span>
                                    </td>
                                    <td>{formatDate(app.submittedAt)}</td>
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

export default AdminApplicationsList;