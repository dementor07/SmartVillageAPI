import React, { useState, useEffect, useCallback } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import api from '../../api';

const Profile = () => {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [success, setSuccess] = useState('');

    const formik = useFormik({
        initialValues: {
            fullName: '',
            mobileNo: '',
            state: '',
            district: '',
            village: '',
            address: ''
        },
        validationSchema: Yup.object({
            fullName: Yup.string().required('Full name is required'),
            mobileNo: Yup.string().required('Mobile number is required'),
            state: Yup.string().required('State is required'),
            district: Yup.string().required('District is required'),
            village: Yup.string().required('Village is required'),
            address: Yup.string().required('Address is required')
        }),
        onSubmit: async (values) => {
            setLoading(true);
            setMessage('');
            setSuccess('');

            try {
                await api.put('/User/profile', values);
                setSuccess('Profile updated successfully!');
                setLoading(false);
            } catch (error) {
                const resMessage = error.response?.data?.message ||
                    'An error occurred while updating profile.';
                setMessage(resMessage);
                setLoading(false);
            }
        }
    });

    const fetchProfile = useCallback(async () => {
        try {
            const response = await api.get('/User/profile');
            const userData = response.data;

            formik.setValues({
                fullName: userData.fullName || '',
                mobileNo: userData.mobileNo || '',
                state: userData.state || '',
                district: userData.district || '',
                village: userData.village || '',
                address: userData.address || ''
            });
        } catch (error) {
            setMessage('Failed to load profile data.');
        }
    }, [formik]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    return (
        <div className="container mt-4">
            <div className="row justify-content-center">
                <div className="col-md-8">
                    <div className="card">
                        <div className="card-header bg-primary text-white">
                            <h3 className="mb-0">My Profile</h3>
                        </div>
                        <div className="card-body">
                            {success && (
                                <div className="alert alert-success" role="alert">
                                    {success}
                                </div>
                            )}
                            {message && (
                                <div className="alert alert-danger" role="alert">
                                    {message}
                                </div>
                            )}

                            <form onSubmit={formik.handleSubmit}>
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="fullName">Full Name</label>
                                        <input
                                            id="fullName"
                                            name="fullName"
                                            type="text"
                                            className={`form-control ${formik.touched.fullName && formik.errors.fullName ? 'is-invalid' : ''}`}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.fullName}
                                        />
                                        {formik.touched.fullName && formik.errors.fullName && (
                                            <div className="invalid-feedback">{formik.errors.fullName}</div>
                                        )}
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="mobileNo">Mobile Number</label>
                                        <input
                                            id="mobileNo"
                                            name="mobileNo"
                                            type="text"
                                            className={`form-control ${formik.touched.mobileNo && formik.errors.mobileNo ? 'is-invalid' : ''}`}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.mobileNo}
                                        />
                                        {formik.touched.mobileNo && formik.errors.mobileNo && (
                                            <div className="invalid-feedback">{formik.errors.mobileNo}</div>
                                        )}
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-md-4 mb-3">
                                        <label htmlFor="state">State</label>
                                        <input
                                            id="state"
                                            name="state"
                                            type="text"
                                            className={`form-control ${formik.touched.state && formik.errors.state ? 'is-invalid' : ''}`}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.state}
                                        />
                                        {formik.touched.state && formik.errors.state && (
                                            <div className="invalid-feedback">{formik.errors.state}</div>
                                        )}
                                    </div>
                                    <div className="col-md-4 mb-3">
                                        <label htmlFor="district">District</label>
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
                                    <div className="col-md-4 mb-3">
                                        <label htmlFor="village">Village</label>
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
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="address">Address</label>
                                    <textarea
                                        id="address"
                                        name="address"
                                        className={`form-control ${formik.touched.address && formik.errors.address ? 'is-invalid' : ''}`}
                                        rows="3"
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        value={formik.values.address}
                                    ></textarea>
                                    {formik.touched.address && formik.errors.address && (
                                        <div className="invalid-feedback">{formik.errors.address}</div>
                                    )}
                                </div>

                                <div className="d-grid gap-2">
                                    <button type="submit" className="btn btn-primary" disabled={loading}>
                                        {loading ? (
                                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                        ) : (
                                            'Update Profile'
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

export default Profile;