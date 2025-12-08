import { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../services/api'

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')

    if (token && storedUser) {
      setUser(JSON.parse(storedUser))
      // Verify token by getting profile
      authService.getProfile()
        .then((response) => {
          setUser(response.data.data)
          localStorage.setItem('user', JSON.stringify(response.data.data))
        })
        .catch(() => {
          // Token invalid, clear storage
          localStorage.removeItem('token')
          localStorage.removeItem('refreshToken')
          localStorage.removeItem('user')
          setUser(null)
        })
        .finally(() => {
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password)
      const { user, token, refreshToken } = response.data.data

      localStorage.setItem('token', token)
      localStorage.setItem('refreshToken', refreshToken)
      localStorage.setItem('user', JSON.stringify(user))
      setUser(user)

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
      setUser(null)
      window.location.href = '/login'
    }
  }

  const updateUser = (userData) => {
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

