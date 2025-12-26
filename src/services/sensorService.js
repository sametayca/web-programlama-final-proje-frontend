import api from './api';

const sensorService = {
    // Get all sensors
    getSensors: async (params = {}) => {
        const response = await api.get('/v1/sensors', { params });
        return response.data;
    },

    // Get sensor by ID
    getSensor: async (id) => {
        const response = await api.get(`/v1/sensors/${id}`);
        return response.data;
    },

    // Get sensor data with aggregation
    getSensorData: async (id, params = {}) => {
        const response = await api.get(`/v1/sensors/${id}/data`, { params });
        return response.data;
    },

    // Get latest reading
    getLatestReading: async (id) => {
        const response = await api.get(`/v1/sensors/${id}/latest`);
        return response.data;
    },

    // Get sensor statistics
    getSensorStats: async () => {
        const response = await api.get('/v1/sensors/stats/summary');
        return response.data;
    },

    // Create sensor (admin)
    createSensor: async (data) => {
        const response = await api.post('/v1/sensors', data);
        return response.data;
    },

    // Update sensor (admin)
    updateSensor: async (id, data) => {
        const response = await api.put(`/v1/sensors/${id}`, data);
        return response.data;
    },

    // Delete sensor (admin)
    deleteSensor: async (id) => {
        const response = await api.delete(`/v1/sensors/${id}`);
        return response.data;
    },

    // Add reading (for testing)
    addReading: async (id, data) => {
        const response = await api.post(`/v1/sensors/${id}/readings`, data);
        return response.data;
    }
};

export default sensorService;
