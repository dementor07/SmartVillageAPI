import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import AuthService from '../../services/auth.service';

const Register = () => {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const formik = useFormik({
        initialValues: {
            fullName: '',
            mobileNo: '',
            emailId: '',
            state: '',
            district: '',
            village: '',
            address: '',
            password: '',
            confirmPassword: ''
        },
        validationSchema: Yup.object({
            fullName: Yup.string().required('Full name is required'),
            mobileNo: Yup.string().required('Mobile number is required'),
            emailId: Yup.string().email('Invalid email address').required('Email is required'),
            state: Yup.string().required('State is required'),
            district: Yup.string().required('District is required'),
            village: Yup.string().required('Village is required'),
            address: Yup.string().required('Address is required'),
            password: Yup.string()
                .min(6, 'Password must be at least 6 characters')
                .required('Password is required'),
            confirmPassword: Yup.string()
                .oneOf([Yup.ref('password'), null], 'Passwords must match')
                .required('Please confirm your password')
        }),
        onSubmit: async (values) => {
            setLoading(true);
            setMessage('');

            // Remove confirmPassword as it's not expected in the API
            const { confirmPassword, ...registerData } = values;

            try {
                await AuthService.register(registerData);
                navigate('/login', { state: { message: 'Registration successful! You can now login.' } });
            } catch (error) {
                const resMessage = error.response?.data?.message ||
                    'An error occurred during registration.';
                setMessage(resMessage);
                setLoading(false);
            }
        }
    });

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-8">
                    <div className="card">
                        <div className="card-header bg-primary text-white">
                            <h3 className="mb-0">Register Now</h3>
                        </div>
                        <div className="card-body">
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

                                <div className="mb-3">
                                    <label htmlFor="emailId">Email Address</label>
                                    <input
                                        id="emailId"
                                        name="emailId"
                                        type="email"
                                        className={`form-control ${formik.touched.emailId && formik.errors.emailId ? 'is-invalid' : ''}`}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        value={formik.values.emailId}
                                    />
                                    {formik.touched.emailId && formik.errors.emailId && (
                                        <div className="invalid-feedback">{formik.errors.emailId}</div>
                                    )}
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

                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="password">Password</label>
                                        <input
                                            id="password"
                                            name="password"
                                            type="password"
                                            className={`form-control ${formik.touched.password && formik.errors.password ? 'is-invalid' : ''}`}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.password}
                                        />
                                        {formik.touched.password && formik.errors.password && (
                                            <div className="invalid-feedback">{formik.errors.password}</div>
                                        )}
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="confirmPassword">Confirm Password</label>
                                        <input
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            type="password"
                                            className={`form-control ${formik.touched.confirmPassword && formik.errors.confirmPassword ? 'is-invalid' : ''}`}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.confirmPassword}
                                        />
                                        {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                                            <div className="invalid-feedback">{formik.errors.confirmPassword}</div>
                                        )}
                                    </div>
                                </div>

                                <div className="d-grid gap-2">
                                    <button type="submit" className="btn btn-primary" disabled={loading}>
                                        {loading ? (
                                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                        ) : (
                                            'Register'
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

export default Register;