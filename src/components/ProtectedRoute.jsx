import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Alert, Box, Container } from '@mui/material'

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return <div>Yükleniyor...</div>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Check role if requiredRole is specified
  if (requiredRole) {
    const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
    
    if (!allowedRoles.includes(user.role)) {
      return (
        <Container maxWidth="md" sx={{ py: 8 }}>
          <Box textAlign="center">
            <Alert severity="error">
              Bu sayfaya erişim yetkiniz bulunmamaktadır. 
              Gerekli rol: {allowedRoles.join(' veya ')}
            </Alert>
          </Box>
        </Container>
      )
    }
  }

  return children
}

export default ProtectedRoute

