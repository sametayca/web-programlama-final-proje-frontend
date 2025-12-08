import { useState } from 'react'
import { Link } from 'react-router-dom'
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

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await authService.forgotPassword(email)
      setSuccess(true)
      toast.success('Şifre sıfırlama linki e-postanıza gönderildi')
    } catch (error) {
      toast.error(error.response?.data?.error || 'Bir hata oluştu')
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
            Şifremi Unuttum
          </Typography>

          {success && (
            <Alert severity="success" sx={{ mt: 2, mb: 2 }}>
              Şifre sıfırlama linki e-postanıza gönderildi. Lütfen e-postanızı kontrol edin.
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="E-posta Adresi"
              name="email"
              type="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading || success}
            >
              {loading ? 'Gönderiliyor...' : 'Şifre Sıfırlama Linki Gönder'}
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

export default ForgotPassword

