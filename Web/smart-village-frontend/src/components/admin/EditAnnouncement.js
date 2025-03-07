import React, { useState, useEffect, useCallback } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useParams, useNavigate } from 'react-router-dom';
import AnnouncementService from '../../services/announcement.service';

const EditAnnouncement = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [error, setError] = useState('');

    const categories = [
        'General',
        'Meeting',
        'Event',
        'Emergency',
        'Service Disruption',
        'Development',
        'Health',
        'Education',
        'Other'
    ];

    const formik = useFormik({
        initialValues: {
            title: '',
            content: '',
            category: '',
            isPublished: true,
            expiresAt: ''
        },
        validationSchema: Yup.object({
            title: Yup.string().required('Title is required'),
            content: Yup.string().required('Content is required'),
            category: Yup.string().required('Category is required'),
            isPublished: Yup.boolean(),
            expiresAt: Yup.date().nullable().min(new Date(), 'Expiry date must be in the future')
        }),
        onSubmit: async (values) => {
            setLoading(true);
            setError('');

            try {
                await AnnouncementService.updateAnnouncement(id, values);
                navigate('/admin/announcements', {
                    state: { message: 'Announcement updated successfully!' }
                });
            } catch (error) {
                const resMessage = error.response?.data?.message ||
                    'An error occurred. Please try again.';
                setError(resMessage);
                setLoading(false);
            }
        }
    });

    const fetchAnnouncementDetails = useCallback(async () => {
        try {
            const response = await AnnouncementService.getAnnouncementById(id);
            const announcement = response.data;

            // Format date for datetime-local input
            let expiresAt = '';
            if (announcement.expiresAt) {
                const date = new Date(announcement.expiresAt);
                expiresAt = date.toISOString().substring(0, 16);
            }

            formik.setValues({
                title: announcement.title || '',
                content: announcement.content || '',
                category: announcement.category || '',
                isPublished: announcement.isPublished,
                expiresAt: expiresAt
            });
            setFetchLoading(false);
        } catch (error) {
            setError('Failed to load announcement details');
            setFetchLoading(false);
        }
    }, [id, formik]);

    useEffect(() => {
        fetchAnnouncementDetails();
    }, [fetchAnnouncementDetails]);

    if (fetchLoading) {
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

    return (
        <div className="container mt-4">
            <div className="row justify-content-center">
                <div className="col-md-10">
                    <div className="card">
                        <div className="card-header bg-primary text-white">
                            <h3 className="mb-0">Edit Announcement</h3>
                        </div>
                        <div className="card-body">
                            {error && (
                                <div className="alert alert-danger" role="alert">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={formik.handleSubmit}>
                                <div className="mb-3">
                                    <label htmlFor="title">Announcement Title</label>
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
                                    <label htmlFor="category">Category</label>
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
                                    <label htmlFor="content">Content</label>
                                    <textarea
                                        id="content"
                                        name="content"
                                        rows="6"
                                        className={`form-control ${formik.touched.content && formik.errors.content ? 'is-invalid' : ''}`}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        value={formik.values.content}
                                    ></textarea>
                                    {formik.touched.content && formik.errors.content && (
                                        <div className="invalid-feedback">{formik.errors.content}</div>
                                    )}
                                </div>

                                <div className="row mb-3">
                                    <div className="col-md-6">
                                        <div className="form-check">
                                            <input
                                                id="isPublished"
                                                name="isPublished"
                                                type="checkbox"
                                                className="form-check-input"
                                                onChange={formik.handleChange}
                                                checked={formik.values.isPublished}
                                            />
                                            <label className="form-check-label" htmlFor="isPublished">
                                                Published
                                            </label>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <label htmlFor="expiresAt">Expiry Date (Optional)</label>
                                        <input
                                            id="expiresAt"
                                            name="expiresAt"
                                            type="datetime-local"
                                            className={`form-control ${formik.touched.expiresAt && formik.errors.expiresAt ? 'is-invalid' : ''}`}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.expiresAt}
                                        />
                                        {formik.touched.expiresAt && formik.errors.expiresAt && (
                                            <div className="invalid-feedback">{formik.errors.expiresAt}</div>
                                        )}
                                    </div>
                                </div>

                                <div className="d-flex justify-content-between">
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary"
                                        onClick={() => navigate('/admin/announcements')}
                                    >
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary" disabled={loading}>
                                        {loading ? (
                                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                        ) : (
                                            'Update Announcement'
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

export default EditAnnouncement;