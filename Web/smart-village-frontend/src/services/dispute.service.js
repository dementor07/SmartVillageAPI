import api from '../api';

const getDisputeTypes = () => {
    return api.get('/DisputeResolution/dispute-types');
};

const getAllCases = (status) => {
    const url = status ? `/DisputeResolution?status=${status}` : '/DisputeResolution';
    return api.get(url);
};

const getMyCases = () => {
    return api.get('/DisputeResolution/my-cases');
};

const getCaseById = (id) => {
    return api.get(`/DisputeResolution/${id}`);
};

const createCase = (caseData) => {
    return api.post('/DisputeResolution', caseData);
};

const updateCaseStatus = (id, statusData) => {
    return api.put(`/DisputeResolution/${id}/status`, statusData);
};

const DisputeService = {
    getDisputeTypes,
    getAllCases,
    getMyCases,
    getCaseById,
    createCase,
    updateCaseStatus
};

export default DisputeService;