import api from './api'

export const mealService = {
  // Get meal menus by date
  getMenus: (params) => api.get('/v1/meals/menus', { params }),
  
  // Get specific menu
  getMenuById: (id) => api.get(`/v1/meals/menus/${id}`),
  
  // Create meal reservation
  reserveMeal: (data) => api.post('/v1/meals/reservations', data),
  
  // Get my reservations
  getMyReservations: (params) => api.get('/v1/meals/reservations', { params }),
  
  // Cancel reservation
  cancelReservation: (id) => api.delete(`/v1/meals/reservations/${id}`),
  
  // Validate reservation (check if can be used)
  validateReservation: (qrCode) => api.get(`/v1/meals/reservations/validate`, { params: { qrCode } }),
  
  // Use meal (scan QR - confirm use)
  useReservation: (id, data) => api.post(`/v1/meals/reservations/${id}/use`, data),
  
  // Get cafeterias list
  getCafeterias: () => api.get('/v1/meals/cafeterias')
}

export default mealService

