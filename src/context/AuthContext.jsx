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
      dispatch({ type: AUTH_ACTIONS.SET_USER, payload: JSON.parse(storedUser) })
      // Verify token by getting profile
      authService.getProfile()
        .then((response) => {
          dispatch({ type: AUTH_ACTIONS.SET_USER, payload: response.data.data })
          localStorage.setItem('user', JSON.stringify(response.data.data))
        })
        .catch(() => {
          // Token invalid, clear storage
          localStorage.removeItem('token')
          localStorage.removeItem('refreshToken')
          localStorage.removeItem('user')
          dispatch({ type: AUTH_ACTIONS.LOGOUT })
        })
    } else {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false })
    }
  }, [])

  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password)
      const { user, token, refreshToken } = response.data.data

      localStorage.setItem('token', token)
      localStorage.setItem('refreshToken', refreshToken)
      localStorage.setItem('user', JSON.stringify(user))
      dispatch({ type: AUTH_ACTIONS.SET_USER, payload: user })

      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Giriş başarısız'
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

