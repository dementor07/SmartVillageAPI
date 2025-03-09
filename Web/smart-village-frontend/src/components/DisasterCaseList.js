import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import DisasterService from '../../services/disaster.service';
import AuthService from '../../services/auth.service';

const DisasterCaseList = ({ adminView = false }) => {
    const [cases, setCases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [filter, setFilter] = useState('');
    const location = useLocation();
    const navigate = useNavigate();
    const isAdmin = AuthService.isAdmin();

    useEffect(() => {
        fetchCases();
    }, [filter]);

    useEffect(() => {
        // Check for success message from navigation
        if (location.state?.message) {
            setSuccess(location.state.message);
        }
    }, [location.state]);

    const fetchCases = async () => {
        try {
            setLoading(true);
            const response = adminView
                ? await DisasterService.getAllCases(filter)
                : await DisasterService.getMyCases();

            setCases(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching disaster cases:', error);
            setError('Failed to load disaster cases. Please try again later.');
            setLoading(false);
        }
    };

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
            case 'Monitoring':
                return 'bg-primary';
            case 'Pending':
                return 'bg-warning text-dark';
            default:
                return 'bg-secondary';
        }
    };

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

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString();
    };

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>{adminView ? 'Manage Disaster Reports' : 'My Disaster Reports'}</h2>
                {!adminView && (
                    <Link to="/disaster-management/create" className="btn btn-danger">
                        <i className="fas fa-plus me-1"></i> Report New Disaster
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
                        <option value="In Progress">In Progress</option>
                        <option value="Monitoring">Monitoring</option>
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
                        <i className="fas fa-exclamation-triangle fa-4x text-muted mb-3"></i>
                        <h3>No disaster reports found</h3>
                        {!adminView && (
                            <p>Report a disaster or emergency situation when needed.</p>
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
                                <th>Disaster Type</th>
                                <th>Location</th>
                                <th>Date</th>
                                <th>Severity</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cases.map((disasterCase) => (
                                <tr key={disasterCase.id}>
                                    <td>
                                        <span className="badge bg-light text-dark">
                                            {disasterCase.referenceNumber || 'Pending'}
                                        </span>
                                    </td>
                                    <td>{disasterCase.title}</td>
                                    <td>{disasterCase.disasterType}</td>
                                    <td>{disasterCase.location}</td>
                                    <td>{formatDate(disasterCase.occurrenceDate)}</td>
                                    <td>
                                        <span className={`badge ${getSeverityBadgeClass(disasterCase.severity)}`}>
                                            {disasterCase.severity || 'Medium'}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`badge ${getStatusBadgeClass(disasterCase.status)}`}>
                                            {disasterCase.status}
                                        </span>
                                    </td>
                                    <td>
                                        <Link
                                            to={`/disaster-management/${disasterCase.id}`}
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

export default DisasterCaseList;