// Web/smart-village-frontend/src/services/certificate.service.js
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
    return api.post('/Certificate', certificateData);
};

const updateCertificateStatus = (id, statusData) => {
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