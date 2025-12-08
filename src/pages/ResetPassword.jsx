import { useState, useEffect } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert
} from '@mui/material'
import { authService } from '../services/api'
import { toast } from 'react-toastify'

const ResetPassword = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const token = searchParams.get('token')
    if (!token) {
      setError('Geçersiz veya eksik token')
    }
  }, [searchParams])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Şifreler eşleşmiyor')
      return
    }

    if (password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır')
      return
    }

    setLoading(true)

    try {
      const token = searchParams.get('token')
      await authService.resetPassword(token, password)
      setSuccess(true)
      toast.success('Şifreniz başarıyla sıfırlandı')
      setTimeout(() => {
        navigate('/login')
      }, 2000)
    } catch (error) {
      setError(error.response?.data?.error || 'Şifre sıfırlama başarısız')
      toast.error(error.response?.data?.error || 'Şifre sıfırlama başarısız')
    }

    setLoading(false)
  }

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Typography component="h1" variant="h4" align="center" gutterBottom>
            Şifre Sıfırla
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mt: 2, mb: 2 }}>
              Şifreniz başarıyla sıfırlandı. Giriş sayfasına yönlendiriliyorsunuz...
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Yeni Şifre"
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Yeni Şifre Tekrar"
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading || success}
            >
              {loading ? 'Sıfırlanıyor...' : 'Şifreyi Sıfırla'}
            </Button>
            <Box sx={{ textAlign: 'center', mt: 1 }}>
              <Link to="/login" style={{ textDecoration: 'none' }}>
                <Typography variant="body2" color="primary">
                  Giriş sayfasına dön
                </Typography>
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  )
}

export default ResetPassword

