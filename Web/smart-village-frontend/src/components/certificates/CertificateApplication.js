import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import CertificateService from '../../services/certificate.service';
import AuthService from '../../services/auth.service';

const CertificateApplication = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedCertificateType, setSelectedCertificateType] = useState('');
    const [documentPreview, setDocumentPreview] = useState('');
    const user = AuthService.getCurrentUser();

    // Certificate types available for application
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

    // Initialize formik
    const formik = useFormik({
        initialValues: {
            certificateType: '',
            applicantName: user?.fullName || '',
            gender: '',
            age: '',
            address: user?.address || '',
            fatherName: '',
            religion: '',
            caste: '',
            postOffice: '',
            pinCode: '',
            state: user?.state || '',
            district: user?.district || '',
            village: user?.village || '',
            taluk: '',
            location: '',
            familyMemberName: '',
            relationship: '',
            annualIncome: '',
            companyName: '',
            companySector: '',
            identificationMark1: '',
            identificationMark2: '',
            identificationMark3: '',
            documentData: ''
        },
        validationSchema: Yup.object({
            certificateType: Yup.string().required('Certificate type is required'),
            applicantName: Yup.string().required('Applicant name is required'),
            gender: Yup.string().required('Gender is required'),
            address: Yup.string().required('Address is required'),
            fatherName: Yup.string().required('Father\'s name is required'),
            pinCode: Yup.string().required('PIN Code is required'),
            state: Yup.string().required('State is required'),
            district: Yup.string().required('District is required'),
            village: Yup.string().required('Village is required'),
            // Conditional validation for certificate-specific fields
            religion: Yup.string().when('certificateType', {
                is: (type) => type === 'Community Certificate' || type === 'Caste Certificate',
                then: () => Yup.string().required('Religion is required'),
            }),
            caste: Yup.string().when('certificateType', {
                is: (type) => type === 'Community Certificate' || type === 'Caste Certificate',
                then: () => Yup.string().required('Caste is required'),
            }),
            familyMemberName: Yup.string().when('certificateType', {
                is: (type) => type === 'Family Membership Certificate' || type === 'Relationship Certificate',
                then: () => Yup.string().required('Family member name is required'),
            }),
            relationship: Yup.string().when('certificateType', {
                is: (type) => type === 'Family Membership Certificate' || type === 'Relationship Certificate',
                then: () => Yup.string().required('Relationship is required'),
            }),
            annualIncome: Yup.string().when('certificateType', {
                is: 'Income Certificate',
                then: () => Yup.string().required('Annual income is required'),
            }),
            identificationMark1: Yup.string().when('certificateType', {
                is: 'Identification Certificate',
                then: () => Yup.string().required('At least one identification mark is required'),
            }),
            documentData: Yup.string().required('Supporting document is required')
        }),
        onSubmit: async (values) => {
            setLoading(true);
            setError('');

            try {
                // Ensure certificate type is set
                const certificateData = {
                    ...values,
                    certificateType: selectedCertificateType
                };

                await CertificateService.createCertificate(certificateData);

                navigate('/certificates', {
                    state: { message: 'Certificate application submitted successfully!' }
                });
            } catch (error) {
                console.error('Certificate submission error:', error);
                const resMessage = error.response?.data?.message ||
                    'An error occurred. Please try again.';
                setError(resMessage);
                setLoading(false);
            }
        }
    });

    const handleCertificateTypeChange = (e) => {
        const certificateType = e.target.value;
        setSelectedCertificateType(certificateType);
        formik.setFieldValue('certificateType', certificateType);
    };

    const handleDocumentChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setError('File size exceeds 5MB limit');
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result;
                formik.setFieldValue('documentData', base64String);
                setDocumentPreview(base64String);
            };
            reader.onerror = () => {
                setError('Error reading file');
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
                            <h3 className="mb-0">
                                {selectedCertificateType
                                    ? `Apply For ${selectedCertificateType}`
                                    : 'Apply For Certificate'}
                            </h3>
                        </div>
                        <div className="card-body">
                            {error && (
                                <div className="alert alert-danger" role="alert">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={formik.handleSubmit}>
                                {!selectedCertificateType && (
                                    <div className="mb-3">
                                        <label htmlFor="certificateType" className="form-label">Certificate Type <span className="text-danger">*</span></label>
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
                                )}

                                {selectedCertificateType && (
                                    <>
                                        <div className="row">
                                            <div className="col-md-6 mb-3">
                                                <label htmlFor="applicantName" className="form-label">Name of the person whom certificate is issued <span className="text-danger">*</span></label>
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
                                            <div className="col-md-6 mb-3">
                                                <label htmlFor="gender" className="form-label">Gender <span className="text-danger">*</span></label>
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
                                        </div>

                                        <div className="row">
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
                                            <div className="col-md-6 mb-3">
                                                <label htmlFor="address" className="form-label">Address <span className="text-danger">*</span></label>
                                                <textarea
                                                    id="address"
                                                    name="address"
                                                    rows="3"
                                                    className={`form-control ${formik.touched.address && formik.errors.address ? 'is-invalid' : ''}`}
                                                    onChange={formik.handleChange}
                                                    onBlur={formik.handleBlur}
                                                    value={formik.values.address}
                                                ></textarea>
                                                {formik.touched.address && formik.errors.address && (
                                                    <div className="invalid-feedback">{formik.errors.address}</div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="row">
                                            <div className="col-md-6 mb-3">
                                                <label htmlFor="fatherName" className="form-label">Name of Father <span className="text-danger">*</span></label>
                                                <input
                                                    id="fatherName"
                                                    name="fatherName"
                                                    type="text"
                                                    className={`form-control ${formik.touched.fatherName && formik.errors.fatherName ? 'is-invalid' : ''}`}
                                                    onChange={formik.handleChange}
                                                    onBlur={formik.handleBlur}
                                                    value={formik.values.fatherName}
                                                />
                                                {formik.touched.fatherName && formik.errors.fatherName && (
                                                    <div className="invalid-feedback">{formik.errors.fatherName}</div>
                                                )}
                                            </div>

                                            {(selectedCertificateType === 'Community Certificate' ||
                                                selectedCertificateType === 'Caste Certificate' ||
                                                selectedCertificateType === 'Nativity Certificate') && (
                                                    <div className="col-md-6 mb-3">
                                                        <label htmlFor="religion" className="form-label">Religion <span className="text-danger">*</span></label>
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
                                                )}

                                            {!['Community Certificate', 'Caste Certificate', 'Nativity Certificate'].includes(selectedCertificateType) && (
                                                <div className="col-md-6 mb-3">
                                                    <label htmlFor="postOffice" className="form-label">Post Office</label>
                                                    <input
                                                        id="postOffice"
                                                        name="postOffice"
                                                        type="text"
                                                        className="form-control"
                                                        onChange={formik.handleChange}
                                                        onBlur={formik.handleBlur}
                                                        value={formik.values.postOffice}
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        {(selectedCertificateType === 'Community Certificate' ||
                                            selectedCertificateType === 'Caste Certificate') && (
                                                <div className="row">
                                                    <div className="col-md-6 mb-3">
                                                        <label htmlFor="caste" className="form-label">Caste <span className="text-danger">*</span></label>
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
                                                    <div className="col-md-6 mb-3">
                                                        <label htmlFor="postOffice" className="form-label">Post Office</label>
                                                        <input
                                                            id="postOffice"
                                                            name="postOffice"
                                                            type="text"
                                                            className="form-control"
                                                            onChange={formik.handleChange}
                                                            onBlur={formik.handleBlur}
                                                            value={formik.values.postOffice}
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                        <div className="row">
                                            <div className="col-md-4 mb-3">
                                                <label htmlFor="pinCode" className="form-label">PIN Code <span className="text-danger">*</span></label>
                                                <input
                                                    id="pinCode"
                                                    name="pinCode"
                                                    type="text"
                                                    className={`form-control ${formik.touched.pinCode && formik.errors.pinCode ? 'is-invalid' : ''}`}
                                                    onChange={formik.handleChange}
                                                    onBlur={formik.handleBlur}
                                                    value={formik.values.pinCode}
                                                />
                                                {formik.touched.pinCode && formik.errors.pinCode && (
                                                    <div className="invalid-feedback">{formik.errors.pinCode}</div>
                                                )}
                                            </div>
                                            <div className="col-md-4 mb-3">
                                                <label htmlFor="state" className="form-label">State <span className="text-danger">*</span></label>
                                                <select
                                                    id="state"
                                                    name="state"
                                                    className={`form-select ${formik.touched.state && formik.errors.state ? 'is-invalid' : ''}`}
                                                    onChange={formik.handleChange}
                                                    onBlur={formik.handleBlur}
                                                    value={formik.values.state}
                                                >
                                                    <option value="">Select State</option>
                                                    <option value="Andhra Pradesh">Andhra Pradesh</option>
                                                    <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                                                    <option value="Assam">Assam</option>
                                                    <option value="Bihar">Bihar</option>
                                                    <option value="Chhattisgarh">Chhattisgarh</option>
                                                    <option value="Goa">Goa</option>
                                                    <option value="Gujarat">Gujarat</option>
                                                    <option value="Haryana">Haryana</option>
                                                    <option value="Himachal Pradesh">Himachal Pradesh</option>
                                                    <option value="Jharkhand">Jharkhand</option>
                                                    <option value="Karnataka">Karnataka</option>
                                                    <option value="Kerala">Kerala</option>
                                                    <option value="Madhya Pradesh">Madhya Pradesh</option>
                                                    <option value="Maharashtra">Maharashtra</option>
                                                    <option value="Manipur">Manipur</option>
                                                    <option value="Meghalaya">Meghalaya</option>
                                                    <option value="Mizoram">Mizoram</option>
                                                    <option value="Nagaland">Nagaland</option>
                                                    <option value="Odisha">Odisha</option>
                                                    <option value="Punjab">Punjab</option>
                                                    <option value="Rajasthan">Rajasthan</option>
                                                    <option value="Sikkim">Sikkim</option>
                                                    <option value="Tamil Nadu">Tamil Nadu</option>
                                                    <option value="Telangana">Telangana</option>
                                                    <option value="Tripura">Tripura</option>
                                                    <option value="Uttar Pradesh">Uttar Pradesh</option>
                                                    <option value="Uttarakhand">Uttarakhand</option>
                                                    <option value="West Bengal">West Bengal</option>
                                                </select>
                                                {formik.touched.state && formik.errors.state && (
                                                    <div className="invalid-feedback">{formik.errors.state}</div>
                                                )}
                                            </div>
                                            <div className="col-md-4 mb-3">
                                                <label htmlFor="district" className="form-label">District <span className="text-danger">*</span></label>
                                                <select
                                                    id="district"
                                                    name="district"
                                                    className={`form-select ${formik.touched.district && formik.errors.district ? 'is-invalid' : ''}`}
                                                    onChange={formik.handleChange}
                                                    onBlur={formik.handleBlur}
                                                    value={formik.values.district}
                                                >
                                                    <option value="">Select District</option>
                                                    <option value="District1">District 1</option>
                                                    <option value="District2">District 2</option>
                                                    <option value="District3">District 3</option>
                                                </select>
                                                {formik.touched.district && formik.errors.district && (
                                                    <div className="invalid-feedback">{formik.errors.district}</div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="row">
                                            <div className="col-md-4 mb-3">
                                                <label htmlFor="village" className="form-label">Village <span className="text-danger">*</span></label>
                                                <select
                                                    id="village"
                                                    name="village"
                                                    className={`form-select ${formik.touched.village && formik.errors.village ? 'is-invalid' : ''}`}
                                                    onChange={formik.handleChange}
                                                    onBlur={formik.handleBlur}
                                                    value={formik.values.village}
                                                >
                                                    <option value="">Select Village</option>
                                                    <option value="Village1">Village 1</option>
                                                    <option value="Village2">Village 2</option>
                                                    <option value="Village3">Village 3</option>
                                                </select>
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
                                                    className="form-control"
                                                    onChange={formik.handleChange}
                                                    onBlur={formik.handleBlur}
                                                    value={formik.values.taluk}
                                                />
                                            </div>
                                            <div className="col-md-4 mb-3">
                                                <label htmlFor="location" className="form-label">Location</label>
                                                <input
                                                    id="location"
                                                    name="location"
                                                    type="text"
                                                    className="form-control"
                                                    onChange={formik.handleChange}
                                                    onBlur={formik.handleBlur}
                                                    value={formik.values.location}
                                                />
                                            </div>
                                        </div>

                                        {/* Certificate-specific fields */}
                                        {(selectedCertificateType === 'Family Membership Certificate' ||
                                            selectedCertificateType === 'Relationship Certificate') && (
                                                <div className="row">
                                                    <div className="col-md-6 mb-3">
                                                        <label htmlFor="familyMemberName" className="form-label">Family Member Name <span className="text-danger">*</span></label>
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
                                                    <div className="col-md-6 mb-3">
                                                        <label htmlFor="relationship" className="form-label">Relationship <span className="text-danger">*</span></label>
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
                                                </div>
                                            )}

                                        {selectedCertificateType === 'Income Certificate' && (
                                            <div className="row">
                                                <div className="col-md-4 mb-3">
                                                    <label htmlFor="annualIncome" className="form-label">Annual Income <span className="text-danger">*</span></label>
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
                                                <div className="col-md-4 mb-3">
                                                    <label htmlFor="companyName" className="form-label">Company Name</label>
                                                    <input
                                                        id="companyName"
                                                        name="companyName"
                                                        type="text"
                                                        className="form-control"
                                                        onChange={formik.handleChange}
                                                        onBlur={formik.handleBlur}
                                                        value={formik.values.companyName}
                                                    />
                                                </div>
                                                <div className="col-md-4 mb-3">
                                                    <label htmlFor="companySector" className="form-label">Company Sector</label>
                                                    <input
                                                        id="companySector"
                                                        name="companySector"
                                                        type="text"
                                                        className="form-control"
                                                        onChange={formik.handleChange}
                                                        onBlur={formik.handleBlur}
                                                        value={formik.values.companySector}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {selectedCertificateType === 'Identification Certificate' && (
                                            <div className="row">
                                                <div className="col-md-4 mb-3">
                                                    <label htmlFor="identificationMark1" className="form-label">Identification Mark 1 <span className="text-danger">*</span></label>
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
                                                <div className="col-md-4 mb-3">
                                                    <label htmlFor="identificationMark2" className="form-label">Identification Mark 2</label>
                                                    <input
                                                        id="identificationMark2"
                                                        name="identificationMark2"
                                                        type="text"
                                                        className="form-control"
                                                        onChange={formik.handleChange}
                                                        onBlur={formik.handleBlur}
                                                        value={formik.values.identificationMark2}
                                                    />
                                                </div>
                                                <div className="col-md-4 mb-3">
                                                    <label htmlFor="identificationMark3" className="form-label">Identification Mark 3</label>
                                                    <input
                                                        id="identificationMark3"
                                                        name="identificationMark3"
                                                        type="text"
                                                        className="form-control"
                                                        onChange={formik.handleChange}
                                                        onBlur={formik.handleBlur}
                                                        value={formik.values.identificationMark3}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {/* Document upload */}
                                        <div className="mb-4">
                                            <label htmlFor="documentUpload" className="form-label">Upload Supporting Document <span className="text-danger">*</span></label>
                                            <input
                                                id="documentUpload"
                                                name="documentUpload"
                                                type="file"
                                                className={`form-control ${formik.touched.documentData && formik.errors.documentData ? 'is-invalid' : ''}`}
                                                accept=".pdf,.jpg,.jpeg,.png"
                                                onChange={handleDocumentChange}
                                            />
                                            <small className="form-text text-muted">
                                                Upload a valid document as proof (PDF, JPG, PNG). Maximum size: 5MB
                                            </small>
                                            {formik.touched.documentData && formik.errors.documentData && (
                                                <div className="invalid-feedback">{formik.errors.documentData}</div>
                                            )}
                                        </div>

                                        {documentPreview && (
                                            <div className="mb-4">
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

                                        <div className="d-grid gap-2 d-md-flex justify-content-md-end mt-4">
                                            <button
                                                type="button"
                                                className="btn btn-danger"
                                                onClick={() => {
                                                    formik.resetForm();
                                                    setSelectedCertificateType('');
                                                    setDocumentPreview('');
                                                }}
                                            >
                                                RESET
                                            </button>
                                            <button
                                                type="submit"
                                                className="btn btn-success"
                                                disabled={loading}
                                            >
                                                {loading ? (
                                                    <>
                                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                        Processing...
                                                    </>
                                                ) : (
                                                    'APPLY FOR CERTIFICATE'
                                                )}
                                            </button>
                                        </div>
                                    </>
                                )}
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CertificateApplication;