import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import RequestService from '../../services/request.service';

const CreateRequest = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Define categories for service requests
    const categories = [
        'Road Maintenance',
        'Water Supply Issues',
        'Electricity Problems',
        'Waste Management',
        'Street Lighting',
        'Drainage Issues',
        'Public Area Maintenance',
        'Others'
    ];

    const formik = useFormik({
        initialValues: {
            title: '',
            description: '',
            category: ''
        },
        validationSchema: Yup.object({
            title: Yup.string().required('Title is required'),
            description: Yup.string().required('Description is required'),
            category: Yup.string().required('Category is required')
        }),
        onSubmit: async (values) => {
            setLoading(true);
            setError('');

            try {
                await RequestService.createRequest(values);
                navigate('/service-requests', {
                    state: { message: 'Service request submitted successfully!' }
                });
            } catch (error) {
                const resMessage = error.response?.data?.message ||
                    'An error occurred. Please try again.';
                setError(resMessage);
                setLoading(false);
            }
        }
    });

    return (
        <div className="container mt-4">
            <div className="row justify-content-center">
                <div className="col-md-8">
                    <div className="card">
                        <div className="card-header bg-primary text-white">
                            <h3 className="mb-0">Create Service Request</h3>
                        </div>
                        <div className="card-body">
                            {error && (
                                <div className="alert alert-danger" role="alert">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={formik.handleSubmit}>
                                <div className="mb-3">
                                    <label htmlFor="title" className="form-label">Title</label>
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

                                <div className="mb-3">
                                    <label htmlFor="category" className="form-label">Category</label>
                                    <select
                                        id="category"
                                        name="category"
                                        className={`form-select ${formik.touched.category && formik.errors.category ? 'is-invalid' : ''}`}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        value={formik.values.category}
                                    >
                                        <option value="">Select a category</option>
                                        {categories.map((category) => (
                                            <option key={category} value={category}>
                                                {category}
                                            </option>
                                        ))}
                                    </select>
                                    {formik.touched.category && formik.errors.category && (
                                        <div className="invalid-feedback">{formik.errors.category}</div>
                                    )}
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="description" className="form-label">Description</label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        rows="5"
                                        className={`form-control ${formik.touched.description && formik.errors.description ? 'is-invalid' : ''}`}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        value={formik.values.description}
                                    ></textarea>
                                    {formik.touched.description && formik.errors.description && (
                                        <div className="invalid-feedback">{formik.errors.description}</div>
                                    )}
                                </div>

                                <div className="d-flex justify-content-between">
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary"
                                        onClick={() => navigate('/service-requests')}
                                    >
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary" disabled={loading}>
                                        {loading ? (
                                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                        ) : (
                                            'Submit Request'
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

export default CreateRequest;