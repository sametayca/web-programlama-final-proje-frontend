import api from './api'

export const reservationsService = {
  // List all classrooms
  listClassrooms: (params) => api.get('/v1/classrooms', { params }),
  
  // Create classroom reservation
  createReservation: (data) => api.post('/v1/reservations', data),
  
  // Get my reservations
  listReservations: (params) => api.get('/v1/reservations', { params }),
  
  // Get all reservations (admin)
  getAllReservations: (params) => api.get('/v1/reservations/all', { params }),
  
  // Approve reservation (admin)
  approveReservation: (id) => api.put(`/v1/reservations/${id}/approve`),
  
  // Reject reservation (admin)
  rejectReservation: (id, data) => api.put(`/v1/reservations/${id}/reject`, data)
}

export default reservationsService

