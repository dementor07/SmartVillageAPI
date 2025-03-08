import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import SchemeService from '../../services/scheme.service';
import AuthService from '../../services/auth.service';

const SchemeApplicationForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [scheme, setScheme] = useState(null);
    const [formFields, setFormFields] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Fetch scheme details for application form
    const fetchSchemeDetails = useCallback(async () => {
        try {
            // Verify that user is logged in
            if (!AuthService.isTokenValid()) {
                navigate('/login', {
                    state: {
                        from: `/schemes/${id}/apply`,
                        message: 'Please login to apply for this scheme'
                    }
                });
                return;
            }

            const response = await SchemeService.getSchemeById(id);
            setScheme(response.data);

            // Parse form fields from JSON
            try {
                if (response.data.formFields) {
                    const fields = JSON.parse(response.data.formFields);
                    setFormFields(fields);
                }
            } catch (parseError) {
                console.error('Error parsing form fields:', parseError);
                setFormFields([]);
            }

            setLoading(false);
        } catch (error) {
            console.error('Error fetching scheme details:', error);
            setError('Failed to load scheme details. Please try again later.');
            setLoading(false);
        }
    }, [id, navigate]);

    useEffect(() => {
        fetchSchemeDetails();
    }, [fetchSchemeDetails]);

    // Dynamically build validation schema based on form fields
    const buildValidationSchema = useCallback(() => {
        const schemaObj = {};

        formFields.forEach(field => {
            if (field.required) {
                switch (field.type) {
                    case 'text':
                    case 'textarea':
                    case 'select':
                        schemaObj[field.key] = Yup.string().required(`${field.label} is required`);
                        break;
                    case 'number':
                        schemaObj[field.key] = Yup.number()
                            .typeError(`${field.label} must be a number`)
                            .required(`${field.label} is required`);
                        break;
                    case 'date':
                        schemaObj[field.key] = Yup.date()
                            .typeError(`${field.label} must be a valid date`)
                            .required(`${field.label} is required`);
                        break;
                    default:
                        schemaObj[field.key] = Yup.mixed().required(`${field.label} is required`);
                }
            }
        });

        return Yup.object().shape(schemaObj);
    }, [formFields]);

    // Build initial values based on form fields
    const buildInitialValues = useCallback(() => {
        const values = {};

        formFields.forEach(field => {
            switch (field.type) {
                case 'number':
                    values[field.key] = '';
                    break;
                case 'select':
                    values[field.key] = field.options && field.options.length > 0 ? field.options[0] : '';
                    break;
                default:
                    values[field.key] = '';
            }
        });

        return values;
    }, [formFields]);

    // Setup formik after form fields are loaded
    const formik = useFormik({
        initialValues: buildInitialValues(),
        validationSchema: buildValidationSchema(),
        enableReinitialize: true,
        onSubmit: async (values) => {
            setSubmitting(true);
            setError('');

            try {
                // Submit the application
                await SchemeService.applyForScheme({
                    schemeId: Number(id),
                    applicationData: JSON.stringify(values)
                });

                // Redirect to my applications page with success message
                navigate('/schemes/my-applications', {
                    state: {
                        message: `Application for ${scheme.name} submitted successfully!`
                    }
                });
            } catch (error) {
                console.error('Error submitting application:', error);
                setError(error.response?.data?.message || 'Failed to submit application. Please try again later.');
                setSubmitting(false);
            }
        }
    });

    // Render form field based on type
    const renderFormField = (field) => {
        const isInvalid = formik.touched[field.key] && formik.errors[field.key];

        switch (field.type) {
            case 'textarea':
                return (
                    <div className="mb-3" key={field.key}>
                        <label htmlFor={field.key} className="form-label">
                            {field.label}
                            {field.required && <span className="text-danger">*</span>}
                        </label>
                        <textarea
                            id={field.key}
                            name={field.key}
                            className={`form-control ${isInvalid ? 'is-invalid' : ''}`}
                            rows="3"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values[field.key]}
                        ></textarea>
                        {isInvalid && (
                            <div className="invalid-feedback">{formik.errors[field.key]}</div>
                        )}
                    </div>
                );

            case 'select':
                return (
                    <div className="mb-3" key={field.key}>
                        <label htmlFor={field.key} className="form-label">
                            {field.label}
                            {field.required && <span className="text-danger">*</span>}
                        </label>
                        <select
                            id={field.key}
                            name={field.key}
                            className={`form-select ${isInvalid ? 'is-invalid' : ''}`}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values[field.key]}
                        >
                            {field.options && field.options.map((option, idx) => (
                                <option key={idx} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>
                        {isInvalid && (
                            <div className="invalid-feedback">{formik.errors[field.key]}</div>
                        )}
                    </div>
                );

            case 'date':
                return (
                    <div className="mb-3" key={field.key}>
                        <label htmlFor={field.key} className="form-label">
                            {field.label}
                            {field.required && <span className="text-danger">*</span>}
                        </label>
                        <input
                            id={field.key}
                            name={field.key}
                            type="date"
                            className={`form-control ${isInvalid ? 'is-invalid' : ''}`}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values[field.key]}
                        />
                        {isInvalid && (
                            <div className="invalid-feedback">{formik.errors[field.key]}</div>
                        )}
                    </div>
                );

            case 'number':
                return (
                    <div className="mb-3" key={field.key}>
                        <label htmlFor={field.key} className="form-label">
                            {field.label}
                            {field.required && <span className="text-danger">*</span>}
                        </label>
                        <input
                            id={field.key}
                            name={field.key}
                            type="number"
                            className={`form-control ${isInvalid ? 'is-invalid' : ''}`}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values[field.key]}
                        />
                        {isInvalid && (
                            <div className="invalid-feedback">{formik.errors[field.key]}</div>
                        )}
                    </div>
                );

            case 'text':
            default:
                return (
                    <div className="mb-3" key={field.key}>
                        <label htmlFor={field.key} className="form-label">
                            {field.label}
                            {field.required && <span className="text-danger">*</span>}
                        </label>
                        <input
                            id={field.key}
                            name={field.key}
                            type="text"
                            className={`form-control ${isInvalid ? 'is-invalid' : ''}`}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values[field.key]}
                        />
                        {isInvalid && (
                            <div className="invalid-feedback">{formik.errors[field.key]}</div>
                        )}
                    </div>
                );
        }
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
                <button
                    onClick={() => navigate(-1)}
                    className="btn btn-primary"
                >
                    Back
                </button>
            </div>
        );
    }

    if (!scheme) {
        return (
            <div className="container mt-4">
                <div className="alert alert-warning">Scheme not found</div>
                <button
                    onClick={() => navigate('/schemes')}
                    className="btn btn-primary"
                >
                    Back to Schemes
                </button>
            </div>
        );
    }

    return (
        <div className="container mt-4">
            <div className="card">
                <div className="card-header bg-primary text-white">
                    <h3 className="mb-0">Apply for {scheme.name}</h3>
                </div>
                <div className="card-body">
                    <div className="alert alert-info mb-4">
                        <i className="fas fa-info-circle me-2"></i>
                        Please fill out all required fields marked with an asterisk (*). Make sure to provide accurate information.
                    </div>

                    {error && (
                        <div className="alert alert-danger mb-4">
                            <i className="fas fa-exclamation-triangle me-2"></i>
                            {error}
                        </div>
                    )}

                    <form onSubmit={formik.handleSubmit}>
                        {/* Group fields into fieldsets of 2-3 per row based on type */}
                        <div className="row">
                            {formFields.map((field, index) => (
                                <div
                                    key={field.key}
                                    className={`${field.type === 'textarea' ? 'col-12' : 'col-md-6 col-lg-4'}`}
                                >
                                    {renderFormField(field)}
                                </div>
                            ))}
                        </div>

                        <div className="d-flex justify-content-between mt-4">
                            <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={() => navigate(-1)}
                                disabled={submitting}
                            >
                                <i className="fas fa-arrow-left me-2"></i>
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-success"
                                disabled={submitting}
                            >
                                {submitting ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-paper-plane me-2"></i>
                                        Submit Application
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SchemeApplicationForm;