import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthService from '../../services/auth.service';

const Login = () => {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Check if there's a success message passed from registration
        if (location.state?.message) {
            setSuccess(location.state.message);
        }
    }, [location]);

    const formik = useFormik({
        initialValues: {
            emailId: '',
            password: ''
        },
        validationSchema: Yup.object({
            emailId: Yup.string().email('Invalid email address').required('Email is required'),
            password: Yup.string().required('Password is required')
        }),
        onSubmit: async (values) => {
            setLoading(true);
            setMessage('');

            try {
                await AuthService.login(values.emailId, values.password);

                // Handle redirect after successful login
                const redirectPath = sessionStorage.getItem('redirectAfterLogin') || '/dashboard';
                // Clear the stored path
                sessionStorage.removeItem('redirectAfterLogin');

                // Redirect to the saved path or dashboard
                navigate(redirectPath);
            } catch (error) {
                const resMessage = error.response?.data?.message ||
                    'An error occurred during login.';
                setMessage(resMessage);
                setLoading(false);
            }
        }
    });

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="card">
                        <div className="card-header bg-primary text-white">
                            <h3 className="mb-0">Login</h3>
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
                            {location.state?.from && (
                                <div className="alert alert-info">
                                    You need to login to access that page.
                                </div>
                            )}
                            <form onSubmit={formik.handleSubmit}>
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

                                <div className="mb-3">
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

                                <div className="d-grid gap-2">
                                    <button type="submit" className="btn btn-primary" disabled={loading}>
                                        {loading ? (
                                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                        ) : (
                                            'Login'
                                        )}
                                    </button>
                                </div>
                            </form>
                            <div className="mt-3 text-center">
                                <p>
                                    Don't have an account? <a href="/register">Register Now</a>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;