import api from '../api';

const getCertificates = (status) => {
    const url = status ? `/Certificate?status=${status}` : '/Certificate';
    return api.get(url);
};

const getMyCertificates = () => {
    return api.get('/Certificate/my-certificates');
};

const getCertificateById = (id) => {
    return api.get(`/Certificate/${id}`);
};

const createCertificate = (certificateData) => {
    // Log the data being sent to help with debugging
    console.log("Certificate service sending data:", certificateData);

    // Make sure all required fields are present
    const requiredFields = [
        'certificateType',
        'applicantName',
        'gender',
        'address',
        'state',
        'district',
        'village'
    ];

    const missingFields = requiredFields.filter(field =>
        !certificateData[field] || certificateData[field].trim() === ''
    );

    if (missingFields.length > 0) {
        console.error("Missing required fields:", missingFields);
    }

    return api.post('/Certificate', certificateData);
};

const updateCertificateStatus = (id, statusData) => {
    // Ensure statusData contains the required fields: status, and optionally rejectionReason or approvalComments
    return api.put(`/Certificate/${id}/status`, statusData);
};

const CertificateService = {
    getCertificates,
    getMyCertificates,
    getCertificateById,
    createCertificate,
    updateCertificateStatus
};

export default CertificateService;