import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Card,
  CardContent,
  InputAdornment,
  IconButton,
  Divider,
  Fade,
  Grow,
  CircularProgress,
  FormControlLabel,
  Checkbox
} from '@mui/material'
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  School as SchoolIcon,
  AutoAwesome as AutoAwesomeIcon,
  RocketLaunch as RocketLaunchIcon
} from '@mui/icons-material'
import { useAuth } from '../context/AuthContext'
import { toast } from 'react-toastify'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await login(email, password)

    if (result.success) {
      toast.success('Giriş başarılı! Hoş geldiniz! 🎉')
      navigate('/dashboard')
    } else {
      setError(result.error)
      toast.error(result.error)
    }

    setLoading(false)
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 50%, #14b8a6 100%)',
        backgroundSize: '200% 200%',
        animation: 'gradient 15s ease infinite',
        position: 'relative',
        overflow: 'hidden',
        py: 4,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.12) 0%, transparent 50%)',
        }
      }}
    >
      <Container component="main" maxWidth="xs" sx={{ position: 'relative', zIndex: 1 }}>
        <Grow in={true} timeout={800}>
          <Card
            sx={{
              borderRadius: 4,
              boxShadow: '0 24px 80px rgba(0,0,0,0.4)',
              overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.2)',
              background: 'rgba(255, 255, 255, 0.98)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
            }}
          >
            {/* Header with animated gradient */}
            <Box
              sx={{
                background: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 50%, #14b8a6 100%)',
                backgroundSize: '200% 200%',
                animation: 'gradient 15s ease infinite',
                p: 4,
                textAlign: 'center',
                color: 'white',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: -50,
                  right: -50,
                  width: 200,
                  height: 200,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)',
                },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: -50,
                  left: -50,
                  width: 200,
                  height: 200,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)',
                }
              }}
            >
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Box
                  sx={{
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    bgcolor: 'rgba(255,255,255,0.25)',
                    backdropFilter: 'blur(10px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px',
                    border: '4px solid rgba(255,255,255,0.4)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                    animation: 'float 4s ease-in-out infinite',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.1) rotate(5deg)',
                    }
                  }}
                >
                  <SchoolIcon sx={{ fontSize: 50 }} />
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, textShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
                  🎓 Akıllı Kampüs
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.95, fontWeight: 500 }}>
                  Yönetim Platformu
                </Typography>
              </Box>
            </Box>

            <CardContent sx={{ p: 4 }}>
              <Fade in={true} timeout={1000}>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 3 }}>
                    <RocketLaunchIcon sx={{ fontSize: 28, color: 'primary.main' }} />
                    <Typography variant="h5" align="center" sx={{ fontWeight: 700, background: 'linear-gradient(135deg, #0ea5e9 0%, #14b8a6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                      Hoş Geldiniz
                    </Typography>
                  </Box>

                  {error && (
                    <Alert 
                      severity="error" 
                      sx={{ 
                        mb: 3, 
                        borderRadius: 2,
                        boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)',
                        animation: 'fadeIn 0.5s ease'
                      }}
                    >
                      {error}
                    </Alert>
                  )}

                  <Box component="form" onSubmit={handleSubmit}>
                    <TextField
                      fullWidth
                      required
                      id="email"
                      label="E-posta Adresi"
                      name="email"
                      autoComplete="email"
                      autoFocus
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      sx={{ 
                        mb: 2.5,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.15)',
                          },
                          '&.Mui-focused': {
                            boxShadow: '0 4px 20px rgba(102, 126, 234, 0.25)',
                          }
                        }
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailIcon sx={{ color: 'primary.main' }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                    <TextField
                      fullWidth
                      required
                      name="password"
                      label="Şifre"
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      sx={{ 
                        mb: 3,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.15)',
                          },
                          '&.Mui-focused': {
                            boxShadow: '0 4px 20px rgba(102, 126, 234, 0.25)',
                          }
                        }
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockIcon sx={{ color: 'primary.main' }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                              sx={{ 
                                color: 'primary.main',
                                '&:hover': { bgcolor: 'rgba(102, 126, 234, 0.08)' }
                              }}
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                    <Box sx={{ mb: 2 }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            color="primary"
                          />
                        }
                        label="Beni hatırla"
                        sx={{
                          '& .MuiFormControlLabel-label': {
                            fontSize: '0.9rem',
                            fontWeight: 500
                          }
                        }}
                      />
                    </Box>
                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      size="large"
                      disabled={loading}
                      startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <AutoAwesomeIcon />}
                      sx={{
                        py: 1.75,
                        mb: 2,
                        fontSize: '1rem',
                        fontWeight: 700,
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, #0ea5e9 0%, #14b8a6 100%)',
                        boxShadow: '0 8px 24px rgba(14, 165, 233, 0.4)',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #0284c7 0%, #0d9488 100%)',
                          boxShadow: '0 12px 32px rgba(14, 165, 233, 0.5)',
                          transform: 'translateY(-2px)',
                        },
                        '&:disabled': {
                          background: 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)',
                        }
                      }}
                    >
                      {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
                    </Button>

                    <Divider sx={{ my: 3 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ px: 2 }}>
                        veya
                      </Typography>
                    </Divider>

                    <Box sx={{ textAlign: 'center', mb: 2 }}>
                      <Link to="/forgot-password" style={{ textDecoration: 'none' }}>
                        <Typography
                          variant="body2"
                          sx={{
                            color: 'primary.main',
                            fontWeight: 600,
                            transition: 'all 0.3s ease',
                            display: 'inline-block',
                            '&:hover': { 
                              textDecoration: 'underline',
                              transform: 'translateX(4px)'
                            }
                          }}
                        >
                          🔑 Şifremi Unuttum
                        </Typography>
                      </Link>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary" component="span" sx={{ fontWeight: 500 }}>
                        Hesabınız yok mu?{' '}
                      </Typography>
                      <Link to="/register" style={{ textDecoration: 'none' }}>
                        <Typography
                          variant="body2"
                      component="span"
                      sx={{
                        color: 'primary.main',
                        fontWeight: 700,
                        background: 'linear-gradient(135deg, #0ea5e9 0%, #14b8a6 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        transition: 'all 0.3s ease',
                        display: 'inline-block',
                        '&:hover': { 
                          transform: 'translateX(4px)',
                          filter: 'brightness(1.2)'
                        }
                      }}
                        >
                          Kayıt Olun ✨
                        </Typography>
                      </Link>
                    </Box>
                  </Box>
                </Box>
              </Fade>
            </CardContent>
          </Card>
        </Grow>
      </Container>
    </Box>
  )
}

export default Login
