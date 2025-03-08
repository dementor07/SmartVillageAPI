// Web/smart-village-frontend/src/components/certificates/CertificateDetails.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CertificateService from '../../services/certificate.service';
import AuthService from '../../services/auth.service';

const CertificateDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [certificate, setCertificate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [statusUpdate, setStatusUpdate] = useState({
        status: '',
        rejectionReason: '',
        approvalComments: ''
    });
    const [updateLoading, setUpdateLoading] = useState(false);
    const [updateSuccess, setUpdateSuccess] = useState('');
    const isAdmin = AuthService.isAdmin();

    useEffect(() => {
        fetchCertificateDetails();
    }, [id]);

    const fetchCertificateDetails = async () => {
        try {
            const response = await CertificateService.getCertificateById(id);
            setCertificate(response.data);
            setLoading(false);
        } catch (error) {
            setError('Failed to load certificate details');
            setLoading(false);
        }
    };

    const handleStatusChange = (e) => {
        setStatusUpdate({
            ...statusUpdate,
            status: e.target.value
        });
    };

    const handleInputChange = (e) => {
        setStatusUpdate({
            ...statusUpdate,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUpdateLoading(true);

        try {
            await CertificateService.updateCertificateStatus(id, statusUpdate);
            setUpdateSuccess('Certificate status updated successfully!');
            fetchCertificateDetails();
            setUpdateLoading(false);
        } catch (error) {
            setError('Failed to update certificate status');
            setUpdateLoading(false);
        }
    };

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

    const renderFormFields = () => {
        const fields = [];
        if (!certificate) return fields;

        // Standard fields that most certificates have
        fields.push({ label: 'Applicant Name', value: certificate.applicantName });
        if (certificate.gender) fields.push({ label: 'Gender', value: certificate.gender });
        if (certificate.age) fields.push({ label: 'Age', value: certificate.age });
        if (certificate.address) fields.push({ label: 'Address', value: certificate.address });
        if (certificate.fatherName) fields.push({ label: 'Father\'s Name', value: certificate.fatherName });
        if (certificate.religion) fields.push({ label: 'Religion', value: certificate.religion });
        if (certificate.caste) fields.push({ label: 'Caste', value: certificate.caste });
        if (certificate.postOffice) fields.push({ label: 'Post Office', value: certificate.postOffice });
        if (certificate.pinCode) fields.push({ label: 'PIN Code', value: certificate.pinCode });
        if (certificate.state) fields.push({ label: 'State', value: certificate.state });
        if (certificate.district) fields.push({ label: 'District', value: certificate.district });
        if (certificate.village) fields.push({ label: 'Village', value: certificate.village });
        if (certificate.taluk) fields.push({ label: 'Taluk', value: certificate.taluk });
        if (certificate.location) fields.push({ label: 'Location', value: certificate.location });

        // Certificate-specific fields
        if (certificate.familyMemberName) fields.push({ label: 'Family Member Name', value: certificate.familyMemberName });
        if (certificate.relationship) fields.push({ label: 'Relationship', value: certificate.relationship });
        if (certificate.annualIncome) fields.push({ label: 'Annual Income', value: certificate.annualIncome });
        if (certificate.companyName) fields.push({ label: 'Company Name', value: certificate.companyName });
        if (certificate.companySector) fields.push({ label: 'Company Sector', value: certificate.companySector });
        if (certificate.identificationMark1) fields.push({ label: 'Identification Mark 1', value: certificate.identificationMark1 });
        if (certificate.identificationMark2) fields.push({ label: 'Identification Mark 2', value: certificate.identificationMark2 });
        if (certificate.identificationMark3) fields.push({ label: 'Identification Mark 3', value: certificate.identificationMark3 });

        return fields;
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
                <button className="btn btn-primary" onClick={() => navigate(-1)}>
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="container mt-4">
            <div className="card">
                <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                    <h3 className="mb-0">{certificate.certificateType} Details</h3>
                    <span className={`badge ${getStatusBadgeClass(certificate.status)}`}>
                        {certificate.status}
                    </span>
                </div>
                <div className="card-body">
                    {updateSuccess && (
                        <div className="alert alert-success">{updateSuccess}</div>
                    )}

                    <div className="row mb-4">
                        <div className="col-md-6">
                            <p className="mb-1"><strong>Reference Number:</strong></p>
                            <p>{certificate.referenceNumber || 'Not assigned'}</p>
                        </div>
                        <div className="col-md-6">
                            <p className="mb-1"><strong>Date Applied:</strong></p>
                            <p>{new Date(certificate.createdAt).toLocaleString()}</p>
                        </div>
                    </div>

                    <h4 className="border-bottom pb-2 mb-3">Application Details</h4>

                    <div className="row">
                        {renderFormFields().map((field, index) => (
                            <div className="col-md-6 mb-3" key={index}>
                                <p className="mb-1"><strong>{field.label}:</strong></p>
                                <p>{field.value}</p>
                            </div>
                        ))}
                    </div>

                    {certificate.status === 'Rejected' && certificate.rejectionReason && (
                        <div className="alert alert-danger mt-3">
                            <h5>Reason for Rejection:</h5>
                            <p>{certificate.rejectionReason}</p>
                        </div>
                    )}

                    {certificate.status === 'Approved' && certificate.approvalComments && (
                        <div className="alert alert-success mt-3">
                            <h5>Approval Comments:</h5>
                            <p>{certificate.approvalComments}</p>
                        </div>
                    )}

                    {isAdmin && certificate.status === 'Pending' && (
                        <div className="card mt-4">
                            <div className="card-header bg-light">
                                <h4 className="mb-0">Update Certificate Status</h4>
                            </div>
                            <div className="card-body">
                                <form onSubmit={handleSubmit}>
                                    <div className="mb-3">
                                        <label className="form-label">Status</label>
                                        <select
                                            className="form-select"
                                            value={statusUpdate.status}
                                            onChange={handleStatusChange}
                                            required
                                        >
                                            <option value="">Select Status</option>
                                            <option value="Approved">Approve</option>
                                            <option value="Rejected">Reject</option>
                                        </select>
                                    </div>

                                    {statusUpdate.status === 'Rejected' && (
                                        <div className="mb-3">
                                            <label className="form-label">Reason for Rejection</label>
                                            <textarea
                                                className="form-control"
                                                name="rejectionReason"
                                                rows="3"
                                                value={statusUpdate.rejectionReason}
                                                onChange={handleInputChange}
                                                required
                                            ></textarea>
                                        </div>
                                    )}

                                    {statusUpdate.status === 'Approved' && (
                                        <div className="mb-3">
                                            <label className="form-label">Approval Comments (Optional)</label>
                                            <textarea
                                                className="form-control"
                                                name="approvalComments"
                                                rows="3"
                                                value={statusUpdate.approvalComments}
                                                onChange={handleInputChange}
                                            ></textarea>
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={updateLoading || !statusUpdate.status}
                                    >
                                        {updateLoading ? (
                                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                        ) : (
                                            'Update Status'
                                        )}
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}

                    <div className="d-flex mt-4">
                        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
                            Go Back
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CertificateDetails;