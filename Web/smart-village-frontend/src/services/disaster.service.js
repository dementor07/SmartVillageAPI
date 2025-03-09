import api from '../api';

const getDisasterTypes = () => {
    return api.get('/DisasterManagement/disaster-types');
};

const getAllCases = (status) => {
    const url = status ? `/DisasterManagement?status=${status}` : '/DisasterManagement';
    return api.get(url);
};

const getMyCases = () => {
    return api.get('/DisasterManagement/my-cases');
};

const getCaseById = (id) => {
    return api.get(`/DisasterManagement/${id}`);
};

const createCase = (caseData) => {
    return api.post('/DisasterManagement', caseData);
};

const updateCaseStatus = (id, statusData) => {
    return api.put(`/DisasterManagement/${id}/status`, statusData);
};

const DisasterService = {
    getDisasterTypes,
    getAllCases,
    getMyCases,
    getCaseById,
    createCase,
    updateCaseStatus
};

export default DisasterService;