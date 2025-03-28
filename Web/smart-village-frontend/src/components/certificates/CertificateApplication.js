import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import CertificateService from '../../services/certificate.service';

const CertificateApplication = () => {
    console.log("CertificateApplication component rendering");
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedCertificateType, setSelectedCertificateType] = useState('');

    // Debug logs to check component mounting
    useEffect(() => {
        console.log("CertificateApplication component mounted");
    }, []);

    const certificateTypes = [
        'Non Creamy Layer Certificate',
        'Family Membership Certificate',
        'Relationship Certificate',
        'Domicile Certificate',
        'Community Certificate',
        'Nativity Certificate',
        'Income Certificate',
        'Caste Certificate',
        'Identification Certificate'
    ];

    const formik = useFormik({
        initialValues: {
            certificateType: '',
            applicantName: '',
            gender: '',
            age: '',
            address: '',
            fatherName: '',
            religion: '',
            caste: '',
            postOffice: '',
            pinCode: '',
            state: '',
            district: '',
            village: '',
            taluk: '',
            location: '',
            familyMemberName: '',
            relationship: '',
            annualIncome: '',
            companyName: '',
            companySector: '',
            identificationMark1: '',
            identificationMark2: '',
            identificationMark3: ''
        },
        validationSchema: Yup.object({
            certificateType: Yup.string().required('Certificate type is required'),
            applicantName: Yup.string().required('Applicant name is required'),
            gender: Yup.string().required('Gender is required'),
            address: Yup.string().required('Address is required'),
            state: Yup.string().required('State is required'),
            district: Yup.string().required('District is required'),
            village: Yup.string().required('Village is required')
        }),
        onSubmit: async (values) => {
            setLoading(true);
            setError('');
            console.log("Form submitted with values:", values);

            try {
                // Create a payload with all required fields and proper defaults for optional fields
                const payload = {
                    certificateType: values.certificateType,
                    applicantName: values.applicantName,
                    gender: values.gender,
                    age: values.age || 0,               // Default for numbers
                    address: values.address,
                    fatherName: values.fatherName || '',
                    religion: values.religion || '',
                    caste: values.caste || '',
                    postOffice: values.postOffice || '',
                    pinCode: values.pinCode || '',
                    state: values.state,
                    district: values.district,
                    village: values.village,
                    taluk: values.taluk || '',
                    location: values.location || '',
                    // Handle certificate-specific fields with defaults
                    familyMemberName: values.familyMemberName || '',
                    relationship: values.relationship || '',
                    annualIncome: values.annualIncome || '',
                    companyName: values.companyName || '',
                    companySector: values.companySector || '',
                    identificationMark1: values.identificationMark1 || '',
                    identificationMark2: values.identificationMark2 || '',
                    identificationMark3: values.identificationMark3 || '',
                };

                // Log the payload for debugging
                console.log("Sending certificate payload:", payload);

                // Submit the certificate application
                const response = await CertificateService.createCertificate(payload);
                console.log("Certificate creation response:", response);

                navigate('/certificates', {
                    state: {
                        message: `Certificate application submitted successfully! Reference Number: ${response.data?.referenceNumber || 'Generated'}`
                    }
                });
            } catch (error) {
                console.error('Certificate submission error:', error);

                // Extract detailed error message
                let errorMessage = 'An error occurred. Please try again.';

                if (error.response) {
                    if (error.response.data?.message) {
                        errorMessage = error.response.data.message;
                    } else if (error.response.data?.errors) {
                        // Handle validation errors array
                        errorMessage = Array.isArray(error.response.data.errors)
                            ? error.response.data.errors.join(', ')
                            : Object.values(error.response.data.errors).flat().join(', ');
                    } else if (typeof error.response.data === 'string') {
                        errorMessage = error.response.data;
                    }
                }

                setError(errorMessage);
                setLoading(false);
            }
        }
    });

    const handleCertificateTypeChange = (e) => {
        const certificateType = e.target.value;
        console.log("Certificate type selected:", certificateType);
        setSelectedCertificateType(certificateType);
        formik.setFieldValue('certificateType', certificateType);
    };

    // The rest of your renderCertificateSpecificFields function
    const renderCertificateSpecificFields = () => {
        switch (selectedCertificateType) {
            case 'Family Membership Certificate':
            case 'Relationship Certificate':
                return (
                    <>
                        <div className="mb-3">
                            <label htmlFor="familyMemberName" className="form-label">Family Member Name</label>
                            <input
                                id="familyMemberName"
                                name="familyMemberName"
                                type="text"
                                className={`form-control ${formik.touched.familyMemberName && formik.errors.familyMemberName ? 'is-invalid' : ''}`}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.familyMemberName}
                            />
                            {formik.touched.familyMemberName && formik.errors.familyMemberName && (
                                <div className="invalid-feedback">{formik.errors.familyMemberName}</div>
                            )}
                        </div>
                        <div className="mb-3">
                            <label htmlFor="relationship" className="form-label">Relationship</label>
                            <input
                                id="relationship"
                                name="relationship"
                                type="text"
                                className={`form-control ${formik.touched.relationship && formik.errors.relationship ? 'is-invalid' : ''}`}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.relationship}
                            />
                            {formik.touched.relationship && formik.errors.relationship && (
                                <div className="invalid-feedback">{formik.errors.relationship}</div>
                            )}
                        </div>
                    </>
                );
            case 'Income Certificate':
                return (
                    <>
                        <div className="mb-3">
                            <label htmlFor="annualIncome" className="form-label">Annual Income</label>
                            <input
                                id="annualIncome"
                                name="annualIncome"
                                type="text"
                                className={`form-control ${formik.touched.annualIncome && formik.errors.annualIncome ? 'is-invalid' : ''}`}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.annualIncome}
                            />
                            {formik.touched.annualIncome && formik.errors.annualIncome && (
                                <div className="invalid-feedback">{formik.errors.annualIncome}</div>
                            )}
                        </div>
                        <div className="mb-3">
                            <label htmlFor="companyName" className="form-label">Company Name</label>
                            <input
                                id="companyName"
                                name="companyName"
                                type="text"
                                className={`form-control ${formik.touched.companyName && formik.errors.companyName ? 'is-invalid' : ''}`}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.companyName}
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="companySector" className="form-label">Company Sector</label>
                            <input
                                id="companySector"
                                name="companySector"
                                type="text"
                                className={`form-control ${formik.touched.companySector && formik.errors.companySector ? 'is-invalid' : ''}`}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.companySector}
                            />
                        </div>
                    </>
                );
            case 'Identification Certificate':
                return (
                    <>
                        <div className="mb-3">
                            <label htmlFor="identificationMark1" className="form-label">Identification Mark 1</label>
                            <input
                                id="identificationMark1"
                                name="identificationMark1"
                                type="text"
                                className={`form-control ${formik.touched.identificationMark1 && formik.errors.identificationMark1 ? 'is-invalid' : ''}`}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.identificationMark1}
                            />
                            {formik.touched.identificationMark1 && formik.errors.identificationMark1 && (
                                <div className="invalid-feedback">{formik.errors.identificationMark1}</div>
                            )}
                        </div>
                        <div className="mb-3">
                            <label htmlFor="identificationMark2" className="form-label">Identification Mark 2</label>
                            <input
                                id="identificationMark2"
                                name="identificationMark2"
                                type="text"
                                className={`form-control ${formik.touched.identificationMark2 && formik.errors.identificationMark2 ? 'is-invalid' : ''}`}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.identificationMark2}
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="identificationMark3" className="form-label">Identification Mark 3</label>
                            <input
                                id="identificationMark3"
                                name="identificationMark3"
                                type="text"
                                className={`form-control ${formik.touched.identificationMark3 && formik.errors.identificationMark3 ? 'is-invalid' : ''}`}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.identificationMark3}
                            />
                        </div>
                    </>
                );
            case 'Caste Certificate':
            case 'Community Certificate':
                return (
                    <>
                        <div className="mb-3">
                            <label htmlFor="religion" className="form-label">Religion</label>
                            <select
                                id="religion"
                                name="religion"
                                className={`form-select ${formik.touched.religion && formik.errors.religion ? 'is-invalid' : ''}`}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.religion}
                            >
                                <option value="">Select Religion</option>
                                <option value="Hindu">Hindu</option>
                                <option value="Muslim">Muslim</option>
                                <option value="Christian">Christian</option>
                                <option value="Sikh">Sikh</option>
                                <option value="Buddhist">Buddhist</option>
                                <option value="Jain">Jain</option>
                                <option value="Other">Other</option>
                            </select>
                            {formik.touched.religion && formik.errors.religion && (
                                <div className="invalid-feedback">{formik.errors.religion}</div>
                            )}
                        </div>
                        <div className="mb-3">
                            <label htmlFor="caste" className="form-label">Caste</label>
                            <input
                                id="caste"
                                name="caste"
                                type="text"
                                className={`form-control ${formik.touched.caste && formik.errors.caste ? 'is-invalid' : ''}`}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.caste}
                            />
                            {formik.touched.caste && formik.errors.caste && (
                                <div className="invalid-feedback">{formik.errors.caste}</div>
                            )}
                        </div>
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <div className="container mt-4">
            <div className="row justify-content-center">
                <div className="col-md-10">
                    <div className="card">
                        <div className="card-header bg-primary text-white">
                            <h3 className="mb-0">Apply for Certificate</h3>
                        </div>
                        <div className="card-body">
                            {error && (
                                <div className="alert alert-danger" role="alert">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={formik.handleSubmit}>
                                <div className="mb-3">
                                    <label htmlFor="certificateType" className="form-label">Certificate Type</label>
                                    <select
                                        id="certificateType"
                                        name="certificateType"
                                        className={`form-select ${formik.touched.certificateType && formik.errors.certificateType ? 'is-invalid' : ''}`}
                                        onChange={handleCertificateTypeChange}
                                        onBlur={formik.handleBlur}
                                        value={formik.values.certificateType}
                                    >
                                        <option value="">Select Certificate Type</option>
                                        {certificateTypes.map((type) => (
                                            <option key={type} value={type}>
                                                {type}
                                            </option>
                                        ))}
                                    </select>
                                    {formik.touched.certificateType && formik.errors.certificateType && (
                                        <div className="invalid-feedback">{formik.errors.certificateType}</div>
                                    )}
                                </div>

                                {selectedCertificateType && (
                                    <>
                                        <h4 className="mt-4 mb-3">Applicant Information</h4>

                                        <div className="mb-3">
                                            <label htmlFor="applicantName" className="form-label">Name of the person whom certificate is issued</label>
                                            <input
                                                id="applicantName"
                                                name="applicantName"
                                                type="text"
                                                className={`form-control ${formik.touched.applicantName && formik.errors.applicantName ? 'is-invalid' : ''}`}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                value={formik.values.applicantName}
                                            />
                                            {formik.touched.applicantName && formik.errors.applicantName && (
                                                <div className="invalid-feedback">{formik.errors.applicantName}</div>
                                            )}
                                        </div>

                                        <div className="row">
                                            <div className="col-md-6 mb-3">
                                                <label htmlFor="gender" className="form-label">Gender</label>
                                                <select
                                                    id="gender"
                                                    name="gender"
                                                    className={`form-select ${formik.touched.gender && formik.errors.gender ? 'is-invalid' : ''}`}
                                                    onChange={formik.handleChange}
                                                    onBlur={formik.handleBlur}
                                                    value={formik.values.gender}
                                                >
                                                    <option value="">Select Gender</option>
                                                    <option value="Male">Male</option>
                                                    <option value="Female">Female</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                                {formik.touched.gender && formik.errors.gender && (
                                                    <div className="invalid-feedback">{formik.errors.gender}</div>
                                                )}
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <label htmlFor="age" className="form-label">Age</label>
                                                <input
                                                    id="age"
                                                    name="age"
                                                    type="number"
                                                    className="form-control"
                                                    onChange={formik.handleChange}
                                                    onBlur={formik.handleBlur}
                                                    value={formik.values.age}
                                                />
                                            </div>
                                        </div>

                                        <div className="mb-3">
                                            <label htmlFor="address" className="form-label">Address</label>
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
                                            <div className="col-md-4 mb-3">
                                                <label htmlFor="state" className="form-label">State</label>
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
                                        </div>

                                        {/* Certificate specific fields */}
                                        {renderCertificateSpecificFields()}
                                    </>
                                )}

                                <div className="d-flex justify-content-between mt-4">
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary"
                                        onClick={() => navigate('/certificates')}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={loading || !selectedCertificateType}
                                    >
                                        {loading ? (
                                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                        ) : (
                                            'Apply for Certificate'
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

export default CertificateApplication;