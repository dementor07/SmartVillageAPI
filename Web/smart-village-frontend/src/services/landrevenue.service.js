import api from '../api';

const getServiceTypes = () => {
    return api.get('/LandRevenue/services');
};

const getServiceTypeById = (id) => {
    return api.get(`/LandRevenue/services/${id}`);
};

const getAllApplications = (status) => {
    const url = status ? `/LandRevenue/applications?status=${status}` : '/LandRevenue/applications';
    return api.get(url);
};

const getMyApplications = () => {
    return api.get('/LandRevenue/my-applications');
};

const getApplicationById = (id) => {
    return api.get(`/LandRevenue/applications/${id}`);
};

const createApplication = (applicationData) => {
    return api.post('/LandRevenue/applications', applicationData);
};

const updateApplicationStatus = (id, statusData) => {
    return api.put(`/LandRevenue/applications/${id}/status`, statusData);
};

const updatePaymentStatus = (id, paymentData) => {
    return api.put(`/LandRevenue/applications/${id}/payment`, paymentData);
};

const LandRevenueService = {
    getServiceTypes,
    getServiceTypeById,
    getAllApplications,
    getMyApplications,
    getApplicationById,
    createApplication,
    updateApplicationStatus,
    updatePaymentStatus
};

export default LandRevenueService;