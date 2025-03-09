import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import DisputeService from '../../services/dispute.service';

const CreateDisputeCase = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [disputeTypes, setDisputeTypes] = useState([]);
    const [documentPreview, setDocumentPreview] = useState('');

    useEffect(() => {
        const fetchDisputeTypes = async () => {
            try {
                const response = await DisputeService.getDisputeTypes();
                setDisputeTypes(response.data);
            } catch (error) {
                console.error('Error fetching dispute types:', error);
                setError('Failed to load dispute types. Please try again.');
            }
        };

        fetchDisputeTypes();
    }, []);

    const formik = useFormik({
        initialValues: {
            title: '',
            description: '',
            disputeType: '',
            partiesInvolved: '',
            location: '',
            disputeDate: new Date().toISOString().split('T')[0],
            priorResolutionAttempts: '',
            documentData: ''
        },
        validationSchema: Yup.object({
            title: Yup.string().required('Title is required'),
            description: Yup.string().required('Description is required'),
            disputeType: Yup.string().required('Dispute type is required'),
            partiesInvolved: Yup.string().required('Parties involved is required'),
            disputeDate: Yup.date().required('Date is required')
        }),
        onSubmit: async (values) => {
            setLoading(true);
            setError('');

            try {
                await DisputeService.createCase(values);
                navigate('/dispute-resolution/my-cases', {
                    state: { message: 'Dispute resolution case submitted successfully!' }
                });
            } catch (error) {
                const resMessage = error.response?.data?.message ||
                    'An error occurred. Please try again.';
                setError(resMessage);
                setLoading(false);
            }
        }
    });

    const handleDocumentChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result;
                formik.setFieldValue('documentData', base64String);
                setDocumentPreview(base64String);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="container mt-4">
            <div className="row justify-content-center">
                <div className="col-md-10">
                    <div className="card">
                        <div className="card-header bg-primary text-white">
                            <h3 className="mb-0">Submit Dispute Resolution Case</h3>
                        </div>
                        <div className="card-body">
                            {error && (
                                <div className="alert alert-danger" role="alert">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={formik.handleSubmit}>
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="title" className="form-label">Case Title</label>
                                        <input
                                            id="title"
                                            name="title"
                                            type="text"
                                            className={`form-control ${formik.touched.title && formik.errors.title ? 'is-invalid' : ''}`}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.title}
                                        />
                                        {formik.touched.title && formik.errors.title && (
                                            <div className="invalid-feedback">{formik.errors.title}</div>
                                        )}
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="disputeType" className="form-label">Dispute Type</label>
                                        <select
                                            id="disputeType"
                                            name="disputeType"
                                            className={`form-select ${formik.touched.disputeType && formik.errors.disputeType ? 'is-invalid' : ''}`}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.disputeType}
                                        >
                                            <option value="">Select Dispute Type</option>
                                            {disputeTypes.map((type) => (
                                                <option key={type} value={type}>
                                                    {type}
                                                </option>
                                            ))}
                                        </select>
                                        {formik.touched.disputeType && formik.errors.disputeType && (
                                            <div className="invalid-feedback">{formik.errors.disputeType}</div>
                                        )}
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="description" className="form-label">Description of the Dispute</label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        rows="4"
                                        className={`form-control ${formik.touched.description && formik.errors.description ? 'is-invalid' : ''}`}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        value={formik.values.description}
                                        placeholder="Please provide a detailed description of the dispute"
                                    ></textarea>
                                    {formik.touched.description && formik.errors.description && (
                                        <div className="invalid-feedback">{formik.errors.description}</div>
                                    )}
                                </div>

                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="partiesInvolved" className="form-label">Parties Involved</label>
                                        <input
                                            id="partiesInvolved"
                                            name="partiesInvolved"
                                            type="text"
                                            className={`form-control ${formik.touched.partiesInvolved && formik.errors.partiesInvolved ? 'is-invalid' : ''}`}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.partiesInvolved}
                                            placeholder="e.g., Myself and neighboring property owner"
                                        />
                                        {formik.touched.partiesInvolved && formik.errors.partiesInvolved && (
                                            <div className="invalid-feedback">{formik.errors.partiesInvolved}</div>
                                        )}
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="location" className="form-label">Location (if applicable)</label>
                                        <input
                                            id="location"
                                            name="location"
                                            type="text"
                                            className="form-control"
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.location}
                                            placeholder="Where did this dispute occur?"
                                        />
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="disputeDate" className="form-label">Date of Dispute</label>
                                        <input
                                            id="disputeDate"
                                            name="disputeDate"
                                            type="date"
                                            className={`form-control ${formik.touched.disputeDate && formik.errors.disputeDate ? 'is-invalid' : ''}`}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.disputeDate}
                                        />
                                        {formik.touched.disputeDate && formik.errors.disputeDate && (
                                            <div className="invalid-feedback">{formik.errors.disputeDate}</div>
                                        )}
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="priorResolutionAttempts" className="form-label">Prior Resolution Attempts</label>
                                    <textarea
                                        id="priorResolutionAttempts"
                                        name="priorResolutionAttempts"
                                        rows="3"
                                        className="form-control"
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        value={formik.values.priorResolutionAttempts}
                                        placeholder="Describe any previous attempts to resolve this dispute"
                                    ></textarea>
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="documentUpload" className="form-label">Upload Supporting Document (Optional)</label>
                                    <input
                                        id="documentUpload"
                                        name="documentUpload"
                                        type="file"
                                        className="form-control"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        onChange={handleDocumentChange}
                                    />
                                    <small className="form-text text-muted">
                                        Upload any supporting documents, photos, or evidence related to this dispute.
                                    </small>
                                </div>

                                {documentPreview && (
                                    <div className="mb-3">
                                        <label className="form-label">Document Preview</label>
                                        <div className="border p-2 text-center">
                                            {documentPreview.startsWith('data:image') ? (
                                                <img
                                                    src={documentPreview}
                                                    alt="Document Preview"
                                                    className="img-fluid"
                                                    style={{ maxHeight: '200px' }}
                                                />
                                            ) : (
                                                <div className="p-4">
                                                    <i className="fas fa-file-pdf fa-3x text-danger"></i>
                                                    <p className="mt-2">Document uploaded successfully</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="alert alert-info mb-4">
                                    <i className="fas fa-info-circle me-2"></i>
                                    <strong>Important:</strong> The dispute resolution process is governed by village regulations. A mediator will be assigned to your case once it's reviewed. You may be contacted for a hearing date.
                                </div>

                                <div className="d-flex justify-content-between mt-4">
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary"
                                        onClick={() => navigate(-1)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                        ) : (
                                            'Submit Case'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateDisputeCase;