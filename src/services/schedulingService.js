import api from './api'

export const schedulingService = {
  // Get my schedule (student)
  getMySchedule: (params) => api.get('/v1/scheduling/my-schedule', { params }),
  
  // Export schedule to iCal
  exportIcal: (params) => api.get('/v1/scheduling/my-schedule/ical', { 
    params,
    responseType: 'blob' 
  }),
  
  // Generate schedule (admin only)
  generateSchedule: (data) => api.post('/v1/scheduling/generate', data),
  
  // Save generated schedule (admin only)
  saveSchedule: (data) => api.post('/v1/scheduling/save', data),
  
  // Get all sections for scheduling (admin)
  getSections: (params) => api.get('/v1/sections', { params })
}

export default schedulingService

