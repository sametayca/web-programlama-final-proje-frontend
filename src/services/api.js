import axios from 'axios'

// API URL'ini RUNTIME'da belirle (build-time değil!)
const getApiUrl = () => {
  // Runtime'da window.location'dan tespit et (ÖNCE BU!)
  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol
    const hostname = window.location.hostname

    // Production'da (HTTPS) ise, backend URL'ini tahmin et
    if (protocol === 'https:' && hostname.includes('railway.app')) {
      // Frontend URL'inden backend URL'ini oluştur
      // Örnek: frontend-production -> backend-production
      const backendHostname = hostname.replace('frontend', 'backend')
      const url = `https://${backendHostname}/api`
      console.log('🔗 API URL (Runtime Auto-detected from Railway):', url)
      return url
    }

    // Development için - Browser'dan çalışıyorsa her zaman localhost kullan
    if (protocol === 'http:' && (hostname === 'localhost' || hostname === '127.0.0.1')) {
      const url = 'http://localhost:3000/api'
      console.log('🔗 API URL (Development - Browser):', url)
      return url
    }
  }

  // Environment variable'ı kontrol et (sadece Docker internal network için)
  const envUrl = import.meta.env.VITE_API_URL
  if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
    // Docker internal network URL'i (sadece server-side rendering için)
    console.log('🔗 API URL (Environment Variable - Docker internal):', envUrl)
    return envUrl
  }

  // Son çare: Development default
  const url = 'http://localhost:3000/api'
  console.log('🔗 API URL (Fallback - Development):', url)
  return url
}

// Runtime'da API URL'ini al
let API_URL = getApiUrl()

// Create axios instance - baseURL runtime'da belirlenir
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor - Her request'te baseURL'i kontrol et ve güncelle
api.interceptors.request.use(
  (config) => {
    // Runtime'da API URL'ini tekrar kontrol et (her request'te)
    const currentApiUrl = getApiUrl()
    if (config.baseURL !== currentApiUrl) {
      config.baseURL = currentApiUrl
      API_URL = currentApiUrl // Global değişkeni de güncelle
    }

    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)


// Response interceptor - Handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('refreshToken')
        if (!refreshToken) {
          throw new Error('No refresh token')
        }

        const response = await axios.post(`${API_URL}/auth/refresh-token`, {
          refreshToken
        })

        const { token, refreshToken: newRefreshToken } = response.data.data
        localStorage.setItem('token', token)
        localStorage.setItem('refreshToken', newRefreshToken)

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${token}`
        return api(originalRequest)
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
        // Don't redirect if already on login page or if it's a navigation request
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login?session=expired'
        }
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

// Auth service
export const authService = {
  register: (userData) => api.post('/auth/register', userData),
  login: (email, password) => api.post('/auth/login', { email, password }),
  logout: () => api.post('/auth/logout'),
  verifyEmail: (token) => api.get('/auth/verify-email', { params: { token } }),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  uploadProfilePicture: (formData) => api.post('/auth/profile/picture', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// Department service
export const departmentService = {
  getDepartments: () => api.get('/departments')
}

// Course service (Part 2)
export const courseService = {
  getCourses: (params) => api.get('/v1/courses', { params }),
  getCourseById: (id) => api.get(`/v1/courses/${id}`),
  createCourse: (data) => api.post('/v1/courses', data),
  updateCourse: (id, data) => api.put(`/v1/courses/${id}`, data),
  deleteCourse: (id) => api.delete(`/v1/courses/${id}`)
}

// Section service (Part 2)
export const sectionService = {
  getSections: (params) => api.get('/v1/sections', { params }),
  getSection: (id) => api.get(`/v1/sections/${id}`),
  getSection: (id) => api.get(`/v1/sections/${id}`),
  getSectionById: (id) => api.get(`/v1/sections/${id}`),
  createSection: (data) => api.post('/v1/sections', data),
  updateSection: (id, data) => api.put(`/v1/sections/${id}`, data)
}

// Enrollment service (Part 2)
export const enrollmentService = {
  enroll: (sectionId) => api.post('/v1/enrollments', { sectionId }),
  drop: (enrollmentId) => api.delete(`/v1/enrollments/${enrollmentId}`),
  getMyCourses: (params) => api.get('/v1/enrollments/my-courses', { params }),
  getSectionStudents: (sectionId) => api.get(`/v1/enrollments/students/${sectionId}`)
}

// Grade service (Part 2)
export const gradeService = {
  getMyGrades: (params) => api.get('/v1/grades/my-grades', { params }),
  getTranscript: () => api.get('/v1/grades/transcript'),
  getTranscriptPDF: () => api.get('/v1/grades/transcript/pdf', { responseType: 'blob' }),
  enterGrade: (data) => api.post('/v1/grades', data)
}

// Attendance service (Part 2)
export const attendanceService = {
  createSession: (data) => api.post('/v1/attendance/sessions', data),
  getAttendanceReport: (sectionId) => api.get(`/v1/attendance/report/${sectionId}`),
  getSession: (id) => api.get(`/v1/attendance/sessions/${id}`),
  closeSession: (id) => api.put(`/v1/attendance/sessions/${id}/close`),
  getMySessions: (params) => api.get('/v1/attendance/sessions/my-sessions', { params }),
  checkIn: (sessionId, data) => api.post(`/v1/attendance/sessions/${sessionId}/checkin`, data),
  getMyAttendance: (params) => api.get('/v1/attendance/my-attendance', { params }),
  getActiveSessions: () => api.get('/v1/attendance/sessions/active'),
  getSectionSessions: (sectionId) => api.get(`/v1/attendance/sessions/section/${sectionId}`),
  getReport: (sectionId) => api.get(`/v1/attendance/report/${sectionId}`),
  createExcuseRequest: (data) => api.post('/v1/attendance/excuse-requests', data),
  getExcuseRequests: (params) => api.get('/v1/attendance/excuse-requests', { params }),
  approveExcuseRequest: (id, data) => api.put(`/v1/attendance/excuse-requests/${id}/approve`, data),
  rejectExcuseRequest: (id, data) => api.put(`/v1/attendance/excuse-requests/${id}/reject`, data)
}

// Announcement service
export const announcementService = {
  getAnnouncements: (params) => api.get('/v1/announcements', { params }),
  getAnnouncementById: (id) => api.get(`/v1/announcements/${id}`),
  createAnnouncement: (data) => api.post('/v1/announcements', data),
  updateAnnouncement: (id, data) => api.put(`/v1/announcements/${id}`, data),
  deleteAnnouncement: (id) => api.delete(`/v1/announcements/${id}`)
}

// Analytics service (Part 4)
export const analyticsService = {
  getDashboardStats: () => api.get('/v1/analytics/dashboard'),
  getAcademicPerformance: () => api.get('/v1/analytics/academic-performance'),
  getAttendanceAnalytics: () => api.get('/v1/analytics/attendance'),
  getMealAnalytics: () => api.get('/v1/analytics/meal-usage')
}

export default api

