import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import LandRevenueService from '../services/landrevenue.service';

const CreateLandRevenue = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [services, setServices] = useState([]);
    const [selectedService, setSelectedService] = useState(null);
    const [documentPreview, setDocumentPreview] = useState('');

    // Get selected service from location state if available
    useEffect(() => {
        if (location.state?.selectedService) {
            setSelectedService(location.state.selectedService);
        }
    }, [location.state]);

    // Fetch available services
    useEffect(() => {
        const fetchServices = async () => {
            try {
                const response = await LandRevenueService.getServiceTypes();
                setServices(response.data);

                // If there's no pre-selected service and we have services, select the first one
                if (!selectedService && response.data.length > 0 && !location.state?.selectedService) {
                    setSelectedService(response.data[0]);
                }
            } catch (error) {
                console.error('Error fetching land revenue services:', error);
                setError('Failed to load service types. Please try again.');
            }
        };

        fetchServices();
    }, [selectedService, location.state]);

    const formik = useFormik({
        initialValues: {
            serviceType: '',
            landOwnerName: '',
            surveyNumber: '',
            village: '',
            taluk: '',
            district: '',
            landArea: '',
            landType: '',
            pattaNumber: '',
            taxReceiptNumber: '',
            documentData: '',
            additionalDetails: ''
        },
        validationSchema: Yup.object({
            serviceType: Yup.string().required('Service type is required'),
            landOwnerName: Yup.string().required('Land owner name is required'),
            surveyNumber: Yup.string().required('Survey number is required'),
            village: Yup.string().required('Village is required'),
            taluk: Yup.string().required('Taluk is required'),
            district: Yup.string().required('District is required'),
        }),
        onSubmit: async (values) => {
            setLoading(true);
            setError('');

            try {
                await LandRevenueService.createApplication(values);
                navigate('/land-revenue/my-applications', {
                    state: { message: 'Land revenue application submitted successfully!' }
                });
            } catch (error) {
                const resMessage = error.response?.data?.message ||
                    'An error occurred. Please try again.';
                setError(resMessage);
                setLoading(false);
            }
        }
    });

    // Update form service type when selected service changes
    useEffect(() => {
        if (selectedService) {
            formik.setFieldValue('serviceType', selectedService.serviceName || '');
        }
    }, [selectedService]);

    const handleServiceChange = (e) => {
        const serviceId = e.target.value;
        const selected = services.find(service => service.id === parseInt(serviceId));
        setSelectedService(selected || null);
    };

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
                        <div className="card-header bg-success text-white">
                            <h3 className="mb-0">Land Revenue Service Application</h3>
                        </div>
                        <div className="card-body">
                            {error && (
                                <div className="alert alert-danger" role="alert">
                                    {error}
                                </div>
                            )}

                            {/* Service Information Alert */}
                            {selectedService && (
                                <div className="alert alert-info mb-4">
                                    <h5>{selectedService.serviceName}</h5>
                                    <p>{selectedService.description}</p>
                                    <hr />
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <strong>Fee:</strong> ₹{selectedService.fees?.toFixed(2) || '0.00'}
                                        </div>
                                        <div>
                                            <strong>Processing Time:</strong> {selectedService.processingTime || 'Not specified'}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <form onSubmit={formik.handleSubmit}>
                                <div className="mb-4">
                                    <label htmlFor="serviceType" className="form-label">Service Type</label>
                                    <select
                                        id="serviceType"
                                        className={`form-select ${formik.touched.serviceType && formik.errors.serviceType ? 'is-invalid' : ''}`}
                                        onChange={handleServiceChange}
                                        value={selectedService?.id || ''}
                                    >
                                        <option value="">Select Service Type</option>
                                        {services.map((service) => (
                                            <option key={service.id} value={service.id}>
                                                {service.serviceName}
                                            </option>
                                        ))}
                                    </select>
                                    {formik.touched.serviceType && formik.errors.serviceType && (
                                        <div className="invalid-feedback">{formik.errors.serviceType}</div>
                                    )}
                                </div>

                                <h4 className="mb-3">Land Details</h4>
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="landOwnerName" className="form-label">Land Owner Name</label>
                                        <input
                                            id="landOwnerName"
                                            name="landOwnerName"
                                            type="text"
                                            className={`form-control ${formik.touched.landOwnerName && formik.errors.landOwnerName ? 'is-invalid' : ''}`}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.landOwnerName}
                                        />
                                        {formik.touched.landOwnerName && formik.errors.landOwnerName && (
                                            <div className="invalid-feedback">{formik.errors.landOwnerName}</div>
                                        )}
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="surveyNumber" className="form-label">Survey Number</label>
                                        <input
                                            id="surveyNumber"
                                            name="surveyNumber"
                                            type="text"
                                            className={`form-control ${formik.touched.surveyNumber && formik.errors.surveyNumber ? 'is-invalid' : ''}`}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.surveyNumber}
                                        />
                                        {formik.touched.surveyNumber && formik.errors.surveyNumber && (
                                            <div className="invalid-feedback">{formik.errors.surveyNumber}</div>
                                        )}
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-md-4 mb-3">
                                        <label htmlFor="village" className="form-label">Village</label>
                                        <input
                                            id="village"
                                            name="village"
                                            type="text"
                                            className={`form-control ${formik.touched.village && formik.errors.village ? 'is-invalid' : ''}`}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.village}
                                        />
                                        {formik.touched.village && formik.errors.village && (
                                            <div className="invalid-feedback">{formik.errors.village}</div>
                                        )}
                                    </div>
                                    <div className="col-md-4 mb-3">
                                        <label htmlFor="taluk" className="form-label">Taluk</label>
                                        <input
                                            id="taluk"
                                            name="taluk"
                                            type="text"
                                            className={`form-control ${formik.touched.taluk && formik.errors.taluk ? 'is-invalid' : ''}`}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.taluk}
                                        />
                                        {formik.touched.taluk && formik.errors.taluk && (
                                            <div className="invalid-feedback">{formik.errors.taluk}</div>
                                        )}
                                    </div>
                                    <div className="col-md-4 mb-3">
                                        <label htmlFor="district" className="form-label">District</label>
                                        <input
                                            id="district"
                                            name="district"
                                            type="text"
                                            className={`form-control ${formik.touched.district && formik.errors.district ? 'is-invalid' : ''}`}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.district}
                                        />
                                        {formik.touched.district && formik.errors.district && (
                                            <div className="invalid-feedback">{formik.errors.district}</div>
                                        )}
                                    </div>
                                </div>

                                <h4 className="mt-4 mb-3">Additional Details</h4>
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="landArea" className="form-label">Land Area</label>
                                        <input
                                            id="landArea"
                                            name="landArea"
                                            type="text"
                                            className="form-control"
                                            placeholder="e.g., 2.5 acres"
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.landArea}
                                        />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="landType" className="form-label">Land Type</label>
                                        <select
                                            id="landType"
                                            name="landType"
                                            className="form-select"
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.landType}
                                        >
                                            <option value="">Select Land Type</option>
                                            <option value="Agricultural">Agricultural</option>
                                            <option value="Residential">Residential</option>
                                            <option value="Commercial">Commercial</option>
                                            <option value="Industrial">Industrial</option>
                                            <option value="Mixed">Mixed Use</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="pattaNumber" className="form-label">Patta Number (if applicable)</label>
                                        <input
                                            id="pattaNumber"
                                            name="pattaNumber"
                                            type="text"
                                            className="form-control"
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.pattaNumber}
                                        />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="taxReceiptNumber" className="form-label">Tax Receipt Number (if applicable)</label>
                                        <input
                                            id="taxReceiptNumber"
                                            name="taxReceiptNumber"
                                            type="text"
                                            className="form-control"
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.taxReceiptNumber}
                                        />
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="additionalDetails" className="form-label">Additional Details/Remarks</label>
                                    <textarea
                                        id="additionalDetails"
                                        name="additionalDetails"
                                        className="form-control"
                                        rows="3"
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        value={formik.values.additionalDetails}
                                    ></textarea>
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="documentUpload" className="form-label">Upload Supporting Document</label>
                                    <input
                                        id="documentUpload"
                                        name="documentUpload"
                                        type="file"
                                        className="form-control"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        onChange={handleDocumentChange}
                                    />
                                    <small className="form-text text-muted">
                                        Upload any supporting documents like previous land records, ownership proof, etc.
                                        Accepted formats: PDF, JPG, JPEG, PNG.
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

                                <div className="alert alert-warning mb-4">
                                    <i className="fas fa-exclamation-triangle me-2"></i>
                                    <strong>Important:</strong> Providing false information may lead to rejection of your application or legal consequences.
                                    Please ensure all details are accurate before submitting.
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
                                        className="btn btn-success"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                        ) : (
                                            'Submit Application'
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

export default CreateLandRevenue;