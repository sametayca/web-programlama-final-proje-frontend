import api from './api'

export const eventService = {
  // List all events with filters
  listEvents: (params) => api.get('/v1/events', { params }),
  
  // Get event by ID
  getEvent: (id) => api.get(`/v1/events/${id}`),
  
  // Register for event (with custom fields)
  registerEvent: (id, data) => api.post(`/v1/events/${id}/register`, data),
  
  // Cancel registration
  cancelRegistration: (eventId, registrationId) => 
    api.delete(`/v1/events/${eventId}/registrations/${registrationId}`),
  
  // Get my events (registrations)
  myEvents: (params) => api.get('/v1/events/my-registrations', { params }),
  
  // Check-in attendee
  checkin: (eventId, regId, data) => 
    api.post(`/v1/events/${eventId}/registrations/${regId}/checkin`, data),
  
  // Create event (organizer)
  createEvent: (data) => api.post('/v1/events', data),
  
  // Update event
  updateEvent: (id, data) => api.put(`/v1/events/${id}`, data),
  
  // Delete event
  deleteEvent: (id) => api.delete(`/v1/events/${id}`),
  
  // Get event registrations (organizer)
  getEventRegistrations: (id) => api.get(`/v1/events/${id}/registrations`)
}

export default eventService

