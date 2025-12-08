import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Alert,
  CircularProgress
} from '@mui/material'
import { authService } from '../services/api'
import { toast } from 'react-toastify'

const VerifyEmail = () => {
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState('verifying') // verifying, success, error
  const [message, setMessage] = useState('')

  useEffect(() => {
    const token = searchParams.get('token')
    if (token) {
      verifyEmail(token)
    } else {
      setStatus('error')
      setMessage('Doğrulama token\'ı bulunamadı')
    }
  }, [searchParams])

  const verifyEmail = async (token) => {
    try {
      await authService.verifyEmail(token)
      setStatus('success')
      setMessage('E-posta adresiniz başarıyla doğrulandı!')
      toast.success('E-posta doğrulandı!')
    } catch (error) {
      setStatus('error')
      setMessage(error.response?.data?.error || 'Doğrulama başarısız')
      toast.error('Doğrulama başarısız')
    }
  }

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%', textAlign: 'center' }}>
          <Typography component="h1" variant="h4" gutterBottom>
            E-posta Doğrulama
          </Typography>

          {status === 'verifying' && (
            <Box sx={{ mt: 4 }}>
              <CircularProgress />
              <Typography sx={{ mt: 2 }}>Doğrulanıyor...</Typography>
            </Box>
          )}

          {status === 'success' && (
            <Box sx={{ mt: 2 }}>
              <Alert severity="success" sx={{ mb: 2 }}>
                {message}
              </Alert>
              <Button component={Link} to="/login" variant="contained">
                Giriş Yap
              </Button>
            </Box>
          )}

          {status === 'error' && (
            <Box sx={{ mt: 2 }}>
              <Alert severity="error" sx={{ mb: 2 }}>
                {message}
              </Alert>
              <Button component={Link} to="/login" variant="contained">
                Giriş Sayfasına Dön
              </Button>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  )
}

export default VerifyEmail

