import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Alert,
  CircularProgress,
  TextField
} from '@mui/material'
import { authService } from '../services/api'
import { toast } from 'react-toastify'

const VerifyEmail = () => {
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState('verifying') // verifying, success, error, no-token
  const [message, setMessage] = useState('')
  const [manualToken, setManualToken] = useState('')

  const verifyEmail = async (token) => {
    try {
      setStatus('verifying')
      console.log('📤 Sending verification request with token:', token?.substring(0, 20) + '...')
      const response = await authService.verifyEmail(token)
      console.log('✅ Verification response:', response.data)
      setStatus('success')
      setMessage('E-posta adresiniz başarıyla doğrulandı!')
      toast.success('E-posta doğrulandı!')
    } catch (error) {
      console.error('❌ Verification error:', error)
      console.error('❌ Error response:', error.response?.data)
      setStatus('error')
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Doğrulama başarısız'
      const finalMessage = errorMessage.includes('Geçersiz') || errorMessage.includes('Invalid') || errorMessage.includes('expired')
        ? 'Geçersiz veya süresi dolmuş doğrulama token\'ı. Lütfen yeni bir doğrulama e-postası isteyin.' 
        : errorMessage
      setMessage(finalMessage)
      toast.error('Doğrulama başarısız: ' + finalMessage)
    }
  }

  useEffect(() => {
    const token = searchParams.get('token')
    console.log('🔍 VerifyEmail page loaded')
    console.log('🔍 Token from URL:', token)
    console.log('🔍 Full URL:', window.location.href)
    console.log('🔍 Search params:', Object.fromEntries(searchParams))
    
    if (token) {
      verifyEmail(token)
    } else {
      setStatus('no-token')
      setMessage('Doğrulama token\'ı bulunamadı')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  const handleManualVerify = () => {
    if (!manualToken.trim()) {
      toast.error('Lütfen token girin')
      return
    }
    verifyEmail(manualToken.trim())
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

          {status === 'no-token' && (
            <Box sx={{ mt: 2 }}>
              <Alert severity="warning" sx={{ mb: 3 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Doğrulama token'ı bulunamadı.
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                  Lütfen e-postanızdaki doğrulama linkine tıklayarak bu sayfaya gelin. 
                  Eğer e-posta gelmediyse, spam klasörünüzü kontrol edin veya kayıt sayfasından yeni bir doğrulama e-postası isteyin.
                </Typography>
              </Alert>
              <Box sx={{ mt: 3, mb: 2 }}>
                <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                  Veya token'ınızı manuel olarak girebilirsiniz:
                </Typography>
                <TextField
                  fullWidth
                  label="Doğrulama Token'ı"
                  value={manualToken}
                  onChange={(e) => setManualToken(e.target.value)}
                  placeholder="E-postanızdaki linkten token'ı kopyalayıp yapıştırın"
                  sx={{ mb: 2 }}
                />
                <Button 
                  variant="contained" 
                  onClick={handleManualVerify}
                  disabled={!manualToken.trim()}
                  fullWidth
                >
                  Doğrula
                </Button>
              </Box>
              <Button component={Link} to="/login" variant="outlined" fullWidth sx={{ mt: 2 }}>
                Giriş Sayfasına Dön
              </Button>
            </Box>
          )}

          {status === 'error' && (
            <Box sx={{ mt: 2 }}>
              <Alert severity="error" sx={{ mb: 3 }}>
                {message}
              </Alert>
              <Box sx={{ mt: 3, mb: 2 }}>
                <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                  Farklı bir token denemek isterseniz:
                </Typography>
                <TextField
                  fullWidth
                  label="Doğrulama Token'ı"
                  value={manualToken}
                  onChange={(e) => setManualToken(e.target.value)}
                  placeholder="E-postanızdaki linkten token'ı kopyalayıp yapıştırın"
                  sx={{ mb: 2 }}
                />
                <Button 
                  variant="contained" 
                  onClick={handleManualVerify}
                  disabled={!manualToken.trim()}
                  fullWidth
                >
                  Tekrar Dene
                </Button>
              </Box>
              <Button component={Link} to="/login" variant="outlined" fullWidth sx={{ mt: 2 }}>
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

