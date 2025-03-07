import api from '../api';

const getMyRequests = () => {
    return api.get('/ServiceRequest/my-requests');
};

const getRequestById = (id) => {
    return api.get(`/ServiceRequest/${id}`);
};

const createRequest = (requestData) => {
    return api.post('/ServiceRequest', requestData);
};

// Admin only functions
const getAllRequests = () => {
    return api.get('/ServiceRequest');
};

const updateRequestStatus = (id, statusData) => {
    return api.put(`/ServiceRequest/${id}/status`, statusData);
};

const RequestService = {
    getMyRequests,
    getRequestById,
    createRequest,
    getAllRequests,
    updateRequestStatus
};

export default RequestService;