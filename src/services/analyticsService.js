import api from './api';

const analyticsService = {
    // Dashboard statistics
    getDashboardStats: async () => {
        const response = await api.get('/v1/analytics/dashboard');
        return response.data;
    },

    // Academic performance analytics
    getAcademicPerformance: async () => {
        const response = await api.get('/v1/analytics/academic-performance');
        return response.data;
    },

    // Attendance analytics
    getAttendanceAnalytics: async () => {
        const response = await api.get('/v1/analytics/attendance');
        return response.data;
    },

    // Meal usage analytics
    getMealAnalytics: async () => {
        const response = await api.get('/v1/analytics/meal-usage');
        return response.data;
    },

    // Event analytics
    getEventAnalytics: async () => {
        const response = await api.get('/v1/analytics/events');
        return response.data;
    },

    // Export report
    exportReport: async (type, format = 'excel') => {
        const response = await api.get(`/v1/analytics/export/${type}`, {
            params: { format },
            responseType: 'blob'
        });

        // Create download link
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;

        const extensions = {
            excel: 'xlsx',
            pdf: 'pdf',
            csv: 'csv'
        };

        link.setAttribute('download', `${type}-report.${extensions[format] || 'xlsx'}`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);

        return true;
    }
};

export default analyticsService;
