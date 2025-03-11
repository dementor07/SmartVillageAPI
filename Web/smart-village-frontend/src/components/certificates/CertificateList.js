import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import CertificateService from '../../services/certificate.service';
import AuthService from '../../services/auth.service';

const CertificateList = ({ adminView = false }) => {
    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [filter, setFilter] = useState('');
    const isAdmin = AuthService.isAdmin();
    const navigate = useNavigate();
    const location = useLocation();

    // Add this useEffect for logging authentication status
    useEffect(() => {
        console.log("CertificateList component mounted");
        console.log("Is authenticated:", AuthService.isTokenValid());
        console.log("Is admin:", isAdmin);

        // Check for success message from navigation
        if (location.state?.message) {
            setSuccess(location.state.message);
        }
    }, [isAdmin, location.state]);

    const fetchCertificates = useCallback(async () => {
        setLoading(true);
        try {
            const response = isAdmin
                ? await CertificateService.getCertificates(filter)
                : await CertificateService.getMyCertificates();

            console.log("Certificates API response:", response);

            // Ensure we always have an array, even if the API response structure is unexpected
            const certificatesData = response.data || [];
            setCertificates(Array.isArray(certificatesData) ? certificatesData : []);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching certificates:', error);
            setError('Failed to load certificates');
            setCertificates([]); // Set to empty array on error
            setLoading(false);
        }
    }, [filter, isAdmin]);

    useEffect(() => {
        fetchCertificates();
    }, [fetchCertificates]);

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

    const handleFilterChange = (e) => {
        setFilter(e.target.value);
    };

    // Function for programmatic navigation
    const handleApplyClick = () => {
        console.log("Apply button clicked");
        navigate('/certificates/apply');
    };

    // Function to refresh data
    const handleRefresh = () => {
        fetchCertificates();
    };

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>{isAdmin ? 'Manage Certificates' : 'My Certificates'}</h2>
                <div>
                    {!isAdmin && (
                        <button
                            onClick={handleApplyClick}
                            className="btn btn-primary"
                        >
                            <i className="fas fa-plus me-1"></i> Apply for Certificate
                        </button>
                    )}
                    <button
                        onClick={handleRefresh}
                        className="btn btn-outline-secondary ms-2"
                    >
                        <i className="fas fa-sync-alt me-1"></i> Refresh
                    </button>
                </div>
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

            {isAdmin && (
                <div className="mb-4">
                    <select
                        className="form-select form-select-sm w-auto"
                        value={filter}
                        onChange={handleFilterChange}
                    >
                        <option value="">All Statuses</option>
                        <option value="Pending">Pending</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                    </select>
                </div>
            )}

            {error && <div className="alert alert-danger">{error}</div>}

            {loading ? (
                <div className="d-flex justify-content-center my-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            ) : certificates.length === 0 ? (
                <div className="card">
                    <div className="card-body text-center p-5">
                        <i className="fas fa-certificate fa-4x text-muted mb-3"></i>
                        <h3>No certificates found</h3>
                        {!isAdmin && (
                            <p>Apply for a certificate to get started.</p>
                        )}
                    </div>
                </div>
            ) : (
                <div className="table-responsive">
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th>Reference No.</th>
                                <th>Type</th>
                                <th>Applicant</th>
                                {isAdmin && <th>Submitted By</th>}
                                <th>Date Applied</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {certificates.map((cert) => (
                                <tr key={cert.id}>
                                    <td>{cert.referenceNumber || 'N/A'}</td>
                                    <td>{cert.certificateType}</td>
                                    <td>{cert.applicantName}</td>
                                    {isAdmin && <td>{cert.userName}</td>}
                                    <td>{new Date(cert.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        <span className={`badge ${getStatusBadgeClass(cert.status)}`}>
                                            {cert.status}
                                        </span>
                                    </td>
                                    <td>
                                        <Link
                                            to={`/certificates/${cert.id}`}
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

export default CertificateList;