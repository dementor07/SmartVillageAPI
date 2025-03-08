// Web/smart-village-frontend/src/components/certificates/CertificateList.js
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import CertificateService from '../../services/certificate.service';
import AuthService from '../../services/auth.service';

const CertificateList = () => {
    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('');
    const isAdmin = AuthService.isAdmin();

    const fetchCertificates = useCallback(async () => {
        setLoading(true);
        try {
            const response = isAdmin
                ? await CertificateService.getCertificates(filter)
                : await CertificateService.getMyCertificates();

            setCertificates(response.data);
            setLoading(false);
        } catch (error) {
            setError('Failed to load certificates');
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

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>{isAdmin ? 'Manage Certificates' : 'My Certificates'}</h2>
                {!isAdmin && (
                    <Link to="/certificates/apply" className="btn btn-primary">
                        <i className="fas fa-plus me-1"></i> Apply for Certificate
                    </Link>
                )}
            </div>

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