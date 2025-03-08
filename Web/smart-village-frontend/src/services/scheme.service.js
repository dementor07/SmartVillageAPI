import api from '../api';

const getSchemes = (category) => {
    const url = category ? `/Scheme?category=${category}` : '/Scheme';
    return api.get(url);
};

const getSchemeById = (id) => {
    return api.get(`/Scheme/${id}`);
};

const getSchemeCategories = () => {
    return api.get('/Scheme/categories');
};

const applyForScheme = (applicationData) => {
    return api.post('/Scheme/apply', applicationData);
};

const getMyApplications = () => {
    return api.get('/Scheme/my-applications');
};

const getApplicationDetails = (id) => {
    return api.get(`/Scheme/applications/${id}`);
};

// Admin functions
const getAllApplications = (status, schemeId) => {
    let url = '/Scheme/admin/applications';
    const params = [];

    if (status) {
        params.push(`status=${status}`);
    }

    if (schemeId) {
        params.push(`schemeId=${schemeId}`);
    }

    if (params.length > 0) {
        url += `?${params.join('&')}`;
    }

    return api.get(url);
};

const updateApplicationStatus = (id, statusData) => {
    return api.put(`/Scheme/admin/applications/${id}/status`, statusData);
};

const createScheme = (schemeData) => {
    return api.post('/Scheme', schemeData);
};

const updateScheme = (id, schemeData) => {
    return api.put(`/Scheme/${id}`, schemeData);
};

const SchemeService = {
    getSchemes,
    getSchemeById,
    getSchemeCategories,
    applyForScheme,
    getMyApplications,
    getApplicationDetails,
    getAllApplications,
    updateApplicationStatus,
    createScheme,
    updateScheme
};

export default SchemeService;