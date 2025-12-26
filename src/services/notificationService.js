import api from './api';

const notificationService = {
    // Get notifications with pagination and filters
    getNotifications: async (params = {}) => {
        const response = await api.get('/v1/notifications', { params });
        return response.data;
    },

    // Get unread count
    getUnreadCount: async () => {
        const response = await api.get('/v1/notifications/unread-count');
        return response.data;
    },

    // Mark notification as read
    markAsRead: async (id) => {
        const response = await api.put(`/v1/notifications/${id}/read`);
        return response.data;
    },

    // Mark all as read
    markAllAsRead: async () => {
        const response = await api.put('/v1/notifications/mark-all-read');
        return response.data;
    },

    // Delete notification
    deleteNotification: async (id) => {
        const response = await api.delete(`/v1/notifications/${id}`);
        return response.data;
    },

    // Clear read notifications
    clearReadNotifications: async () => {
        const response = await api.delete('/v1/notifications/clear-read');
        return response.data;
    },

    // Get preferences
    getPreferences: async () => {
        const response = await api.get('/v1/notifications/preferences');
        return response.data;
    },

    // Update preferences
    updatePreferences: async (preferences) => {
        const response = await api.put('/v1/notifications/preferences', preferences);
        return response.data;
    },

    // Create notification (admin)
    createNotification: async (data) => {
        const response = await api.post('/v1/notifications', data);
        return response.data;
    },

    // Broadcast notification (admin)
    broadcastNotification: async (data) => {
        const response = await api.post('/v1/notifications/broadcast', data);
        return response.data;
    }
};

export default notificationService;
