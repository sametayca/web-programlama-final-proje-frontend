import axios from 'axios'

// API URL'ini RUNTIME'da belirle (build-time değil!)
const getApiUrl = () => {
  // Önce environment variable'ı kontrol et (build-time'da set edilmiş olabilir)
  const envUrl = import.meta.env.VITE_API_URL
  
  // Eğer environment variable local IP veya localhost içeriyorsa, production'da kullanma
  if (envUrl && !envUrl.includes('192.168.') && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
    console.log('🔗 API URL (Environment Variable):', envUrl)
    return envUrl
  }
  
  // Runtime'da window.location'dan tespit et
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
      if (envUrl && (envUrl.includes('192.168.') || envUrl.includes('localhost'))) {
        console.warn('⚠️ VITE_API_URL local IP içeriyor! Railway\'de backend URL\'ini düzeltin.')
      }
      return url
    }
    
    // Development için
    if (protocol === 'http:' && (hostname === 'localhost' || hostname === '127.0.0.1')) {
      const url = 'http://localhost:3000/api'
      console.log('🔗 API URL (Development):', url)
      return url
    }
  }
  
  // Fallback: Environment variable varsa onu kullan (ama local IP değilse)
  if (envUrl && !envUrl.includes('192.168.') && !envUrl.includes('localhost')) {
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

