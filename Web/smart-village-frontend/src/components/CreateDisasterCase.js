import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import DisasterService from '../../services/disaster.service';

const CreateDisasterCase = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [disasterTypes, setDisasterTypes] = useState([]);
    const [imagePreview, setImagePreview] = useState('');

    useEffect(() => {
        const fetchDisasterTypes = async () => {
            try {
                const response = await DisasterService.getDisasterTypes();
                setDisasterTypes(response.data);
            } catch (error) {
                console.error('Error fetching disaster types:', error);
                setError('Failed to load disaster types. Please try again.');
            }
        };

        fetchDisasterTypes();
    }, []);

    const formik = useFormik({
        initialValues: {
            title: '',
            description: '',
            disasterType: '',
            location: '',
            occurrenceDate: new Date().toISOString().split('T')[0],
            severity: 'Medium',
            impactedArea: '',
            affectedCount: '',
            imageData: ''
        },
        validationSchema: Yup.object({
            title: Yup.string().required('Title is required'),
            description: Yup.string().required('Description is required'),
            disasterType: Yup.string().required('Disaster type is required'),
            location: Yup.string().required('Location is required'),
            occurrenceDate: Yup.date().required('Date is required')
        }),
        onSubmit: async (values) => {
            setLoading(true);
            setError('');

            try {
                await DisasterService.createCase(values);
                navigate('/disaster-management/my-cases', {
                    state: { message: 'Disaster report submitted successfully!' }
                });
            } catch (error) {
                const resMessage = error.response?.data?.message ||
                    'An error occurred. Please try again.';
                setError(resMessage);
                setLoading(false);
            }
        }
    });

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result;
                formik.setFieldValue('imageData', base64String);
                setImagePreview(base64String);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="container mt-4">
            <div className="row justify-content-center">
                <div className="col-md-10">
                    <div className="card">
                        <div className="card-header bg-danger text-white">
                            <h3 className="mb-0">Report Disaster/Emergency</h3>
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
                                        <label htmlFor="title" className="form-label">Title/Subject</label>
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
                                        <label htmlFor="disasterType" className="form-label">Disaster Type</label>
                                        <select
                                            id="disasterType"
                                            name="disasterType"
                                            className={`form-select ${formik.touched.disasterType && formik.errors.disasterType ? 'is-invalid' : ''}`}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.disasterType}
                                        >
                                            <option value="">Select Disaster Type</option>
                                            {disasterTypes.map((type) => (
                                                <option key={type} value={type}>
                                                    {type}
                                                </option>
                                            ))}
                                        </select>
                                        {formik.touched.disasterType && formik.errors.disasterType && (
                                            <div className="invalid-feedback">{formik.errors.disasterType}</div>
                                        )}
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="description" className="form-label">Description</label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        rows="4"
                                        className={`form-control ${formik.touched.description && formik.errors.description ? 'is-invalid' : ''}`}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        value={formik.values.description}
                                    ></textarea>
                                    {formik.touched.description && formik.errors.description && (
                                        <div className="invalid-feedback">{formik.errors.description}</div>
                                    )}
                                </div>

                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="location" className="form-label">Location</label>
                                        <input
                                            id="location"
                                            name="location"
                                            type="text"
                                            className={`form-control ${formik.touched.location && formik.errors.location ? 'is-invalid' : ''}`}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.location}
                                        />
                                        {formik.touched.location && formik.errors.location && (
                                            <div className="invalid-feedback">{formik.errors.location}</div>
                                        )}
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="occurrenceDate" className="form-label">Date of Occurrence</label>
                                        <input
                                            id="occurrenceDate"
                                            name="occurrenceDate"
                                            type="date"
                                            className={`form-control ${formik.touched.occurrenceDate && formik.errors.occurrenceDate ? 'is-invalid' : ''}`}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.occurrenceDate}
                                        />
                                        {formik.touched.occurrenceDate && formik.errors.occurrenceDate && (
                                            <div className="invalid-feedback">{formik.errors.occurrenceDate}</div>
                                        )}
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-md-4 mb-3">
                                        <label htmlFor="severity" className="form-label">Severity</label>
                                        <select
                                            id="severity"
                                            name="severity"
                                            className="form-select"
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.severity}
                                        >
                                            <option value="Low">Low</option>
                                            <option value="Medium">Medium</option>
                                            <option value="High">High</option>
                                            <option value="Critical">Critical</option>
                                        </select>
                                    </div>
                                    <div className="col-md-4 mb-3">
                                        <label htmlFor="impactedArea" className="form-label">Impacted Area Size</label>
                                        <input
                                            id="impactedArea"
                                            name="impactedArea"
                                            type="text"
                                            className="form-control"
                                            placeholder="e.g., 3 sq km"
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.impactedArea}
                                        />
                                    </div>
                                    <div className="col-md-4 mb-3">
                                        <label htmlFor="affectedCount" className="form-label">Estimated Affected People</label>
                                        <input
                                            id="affectedCount"
                                            name="affectedCount"
                                            type="text"
                                            className="form-control"
                                            placeholder="e.g., 50-100"
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.affectedCount}
                                        />
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="imageUpload" className="form-label">Upload Image (Optional)</label>
                                    <input
                                        id="imageUpload"
                                        name="imageUpload"
                                        type="file"
                                        className="form-control"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                    />
                                    <small className="form-text text-muted">
                                        Upload an image of the disaster situation to help emergency teams assess the situation better.
                                    </small>
                                </div>

                                {imagePreview && (
                                    <div className="mb-3">
                                        <label className="form-label">Image Preview</label>
                                        <div className="text-center border p-2">
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                className="img-fluid"
                                                style={{ maxHeight: '200px' }}
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="alert alert-info">
                                    <i className="fas fa-info-circle me-2"></i>
                                    Your report will be immediately sent to the disaster management team. For life-threatening emergencies, please also call emergency services.
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
                                        className="btn btn-danger"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                        ) : (
                                            'Submit Report'
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

export default CreateDisasterCase;