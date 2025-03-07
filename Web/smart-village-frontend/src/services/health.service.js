import api from '../api';

const HealthService = {
    async checkConnection() {
        try {
            const response = await api.get('/health');
            return {
                status: 'connected',
                message: response.data.message || 'Backend is running',
                timestamp: new Date()
            };
        } catch (error) {
            return {
                status: 'disconnected',
                message: error.message || 'Unable to connect to backend',
                timestamp: new Date()
            };
        }
    }
};

export default HealthService;