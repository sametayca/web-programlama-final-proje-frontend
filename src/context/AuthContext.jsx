import { createContext, useContext, useReducer, useEffect } from 'react'
import { authService } from '../services/api'

const AuthContext = createContext(null)

// Action types
const AUTH_ACTIONS = {
  SET_USER: 'SET_USER',
  SET_LOADING: 'SET_LOADING',
  LOGOUT: 'LOGOUT',
  UPDATE_USER: 'UPDATE_USER'
}

// Reducer function
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.SET_USER:
      return {
        ...state,
        user: action.payload,
        loading: false
      }
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      }
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        loading: false
      }
    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload }
      }
    default:
      return state
  }
}

// Initial state
const initialState = {
  user: null,
  loading: true
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')

    if (token && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        // Set user immediately from stored data to avoid redirect loops
        dispatch({ type: AUTH_ACTIONS.SET_USER, payload: parsedUser })
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false })
        
        // Verify token by getting profile in background (API interceptor will handle token refresh if needed)
        authService.getProfile()
          .then((response) => {
            if (response?.data?.data) {
              dispatch({ type: AUTH_ACTIONS.SET_USER, payload: response.data.data })
              localStorage.setItem('user', JSON.stringify(response.data.data))
            }
          })
          .catch((error) => {
            // API interceptor already tried to refresh token
            // If we get here, both token and refresh token are invalid
            // Only clear if it's a real auth error (not network error)
            if (error.response?.status === 401 || error.response?.status === 403) {
              // Only logout if we're sure the token is invalid
              // Don't redirect here, let the API interceptor handle it
              console.warn('Token validation failed:', error.message)
            } else {
              // Network error or other issue, keep user logged in with stored data
              console.warn('Profile fetch failed but keeping user logged in:', error.message)
            }
          })
      } catch (parseError) {
        // Invalid stored user data
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false })
      }
    } else {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false })
    }
  }, [])

  const login = async (email, password) => {
    try {
      console.log('🔐 Attempting login for:', email)
      const response = await authService.login(email, password)
      console.log('✅ Login response:', response.data)
      
      if (!response.data.success) {
        return {
          success: false,
          error: response.data.error || response.data.message || 'Giriş başarısız'
        }
      }

      const { user, token, refreshToken } = response.data.data || response.data

      if (!token || !user) {
        console.error('❌ Missing token or user in response:', response.data)
        return {
          success: false,
          error: 'Sunucudan geçersiz yanıt alındı'
        }
      }

      localStorage.setItem('token', token)
      localStorage.setItem('refreshToken', refreshToken)
      localStorage.setItem('user', JSON.stringify(user))
      dispatch({ type: AUTH_ACTIONS.SET_USER, payload: user })

      return { success: true }
    } catch (error) {
      console.error('❌ Login error:', error)
      console.error('Error response:', error.response?.data)
      
      let errorMessage = 'Giriş başarısız'
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.message) {
        errorMessage = error.message
      } else if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
        errorMessage = 'Sunucuya bağlanılamıyor. Lütfen backend sunucusunun çalıştığından emin olun.'
      }
      
      return {
        success: false,
        error: errorMessage
      }
    }
  }

  const register = async (userData) => {
    try {
      const response = await authService.register(userData)
      return { success: true }
    } catch (error) {
      console.error('Register error:', error)
      const errorMessage = error.response?.data?.error || error.message || 'Kayıt başarısız. Lütfen tekrar deneyin.'
      return {
        success: false,
        error: errorMessage
      }
    }
  }

  const logout = async () => {
    try {
      await authService.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
      dispatch({ type: AUTH_ACTIONS.LOGOUT })
      window.location.href = '/login'
    }
  }

  const updateUser = (userData) => {
    dispatch({ type: AUTH_ACTIONS.UPDATE_USER, payload: userData })
    const updatedUser = { ...state.user, ...userData }
    localStorage.setItem('user', JSON.stringify(updatedUser))
  }

  const value = {
    user: state.user,
    loading: state.loading,
    login,
    register,
    logout,
    updateUser
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

