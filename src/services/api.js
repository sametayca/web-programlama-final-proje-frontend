import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor - Add token to requests
api.interceptors.request.use(
  (config) => {
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
        window.location.href = '/login'
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

export default api

