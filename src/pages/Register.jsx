import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  InputAdornment,
  Divider,
  Stepper,
  Step,
  StepLabel,
  Fade,
  Grow
} from '@mui/material'
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Lock as LockIcon,
  School as SchoolIcon,
  Work as WorkIcon,
  Visibility,
  VisibilityOff,
  CheckCircle as CheckCircleIcon,
  AutoAwesome as AutoAwesomeIcon,
  RocketLaunch as RocketLaunchIcon
} from '@mui/icons-material'
import { IconButton } from '@mui/material'
import { useAuth } from '../context/AuthContext'
import { departmentService } from '../services/api'
import { toast } from 'react-toastify'

const steps = ['Kişisel Bilgiler', 'Hesap Bilgileri', 'Rol ve Bölüm']

const Register = () => {
  const [activeStep, setActiveStep] = useState(0)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'student',
    departmentId: '',
    enrollmentYear: new Date().getFullYear(),
    title: 'lecturer'
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [departments, setDepartments] = useState([])
  const [loadingDepartments, setLoadingDepartments] = useState(true)
  const { register } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setLoadingDepartments(true)
        const response = await departmentService.getDepartments()
        if (response.data.success) {
          setDepartments(response.data.data)
        }
      } catch (error) {
        console.error('Error fetching departments:', error)
        toast.error('Bölümler yüklenirken bir hata oluştu')
      } finally {
        setLoadingDepartments(false)
      }
    }

    fetchDepartments()
  }, [])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleNext = () => {
    if (activeStep === 0) {
      if (!formData.firstName || !formData.lastName || !formData.phone) {
        setError('Lütfen tüm alanları doldurun')
        return
      }
    } else if (activeStep === 1) {
      if (!formData.email || !formData.password || !formData.confirmPassword) {
        setError('Lütfen tüm alanları doldurun')
        return
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Şifreler eşleşmiyor')
        return
      }
      if (formData.password.length < 6) {
        setError('Şifre en az 6 karakter olmalıdır')
        return
      }
    }
    setError('')
    setActiveStep(activeStep + 1)
  }

  const handleBack = () => {
    setError('')
    setActiveStep(activeStep - 1)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!formData.departmentId) {
      setError('Lütfen bölüm seçin')
      return
    }

    setLoading(true)

    const { confirmPassword, ...registerData } = formData
    const result = await register(registerData)

    if (result.success) {
      toast.success('Kayıt başarılı! Lütfen e-postanızı kontrol edin. ✉️')
      navigate('/verify-email', { state: { email: formData.email } })
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
      <Container component="main" maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
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
                  <RocketLaunchIcon sx={{ fontSize: 50 }} />
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, textShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
                  ✨ Yeni Hesap Oluştur
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.95, fontWeight: 500 }}>
                  Kampüs yönetim platformuna katılın
                </Typography>
              </Box>
            </Box>

          <CardContent sx={{ p: 4 }}>
            <Stepper 
              activeStep={activeStep} 
              sx={{ 
                mb: 4,
                '& .MuiStepLabel-root .Mui-completed': {
                  color: '#10b981',
                },
                '& .MuiStepLabel-root .Mui-active': {
                  color: '#667eea',
                },
                '& .MuiStepLabel-root .MuiStepIcon-root': {
                  fontSize: '2rem',
                  '&.Mui-completed': {
                    color: '#10b981',
                  },
                  '&.Mui-active': {
                    color: '#667eea',
                    animation: 'pulse 2s ease-in-out infinite',
                  },
                },
              }}
            >
              {steps.map((label, index) => (
                <Step key={label} completed={activeStep > index}>
                  <StepLabel
                    StepIconComponent={(props) => {
                      const isActive = props.active
                      const isCompleted = props.completed
                      return (
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          background: isActive 
                            ? 'linear-gradient(135deg, #0ea5e9 0%, #14b8a6 100%)' 
                            : isCompleted 
                            ? '#10b981' 
                            : '#e5e7eb',
                            color: isActive || isCompleted ? 'white' : '#9ca3af',
                            fontWeight: 700,
                            fontSize: '1.2rem',
                            boxShadow: isActive ? '0 4px 12px rgba(14, 165, 233, 0.4)' : 'none',
                            transition: 'all 0.3s ease',
                          }}
                        >
                          {isCompleted ? (
                            <CheckCircleIcon sx={{ fontSize: 24 }} />
                          ) : (
                            index + 1
                          )}
                        </Box>
                      )
                    }}
                    sx={{
                      '& .MuiStepLabel-label': {
                        fontWeight: activeStep === index ? 700 : 500,
                        mt: 1
                      }
                    }}
                  >
                    {label}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>

            {error && (
              <Fade in={true}>
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
              </Fade>
            )}

            <Box component="form" onSubmit={handleSubmit}>
              {activeStep === 0 && (
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      required
                      id="firstName"
                      label="Ad"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      sx={{
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
                            <PersonIcon sx={{ color: 'primary.main' }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      required
                      id="lastName"
                      label="Soyad"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      sx={{
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
                            <PersonIcon sx={{ color: 'primary.main' }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      id="phone"
                      label="Telefon"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      sx={{
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
                            <PhoneIcon sx={{ color: 'primary.main' }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                </Grid>
              )}

              {activeStep === 1 && (
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      required
                      id="email"
                      label="E-posta Adresi"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      sx={{
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
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      required
                      name="password"
                      label="Şifre"
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      value={formData.password}
                      onChange={handleChange}
                      sx={{
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
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      required
                      name="confirmPassword"
                      label="Şifre Tekrar"
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      sx={{
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
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              edge="end"
                              sx={{ 
                                color: 'primary.main',
                                '&:hover': { bgcolor: 'rgba(102, 126, 234, 0.08)' }
                              }}
                            >
                              {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                </Grid>
              )}

              {activeStep === 2 && (
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel>Rol</InputLabel>
                      <Select
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        label="Rol"
                        startAdornment={
                          <InputAdornment position="start">
                            {formData.role === 'student' ? (
                              <SchoolIcon sx={{ ml: 1, color: 'text.secondary' }} />
                            ) : (
                              <WorkIcon sx={{ ml: 1, color: 'text.secondary' }} />
                            )}
                          </InputAdornment>
                        }
                      >
                        <MenuItem value="student">
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <SchoolIcon fontSize="small" />
                            <span>Öğrenci</span>
                          </Box>
                        </MenuItem>
                        <MenuItem value="faculty">
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <WorkIcon fontSize="small" />
                            <span>Öğretim Üyesi</span>
                          </Box>
                        </MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  {formData.role === 'student' && (
                    <Grid item xs={12}>
                      <FormControl fullWidth required>
                        <InputLabel>Bölüm</InputLabel>
                        <Select
                          name="departmentId"
                          value={formData.departmentId}
                          onChange={handleChange}
                          label="Bölüm"
                          disabled={loadingDepartments}
                        >
                          {loadingDepartments ? (
                            <MenuItem disabled>
                              <CircularProgress size={20} sx={{ mr: 1 }} />
                              Bölümler yükleniyor...
                            </MenuItem>
                          ) : (
                            departments.map((dept) => (
                              <MenuItem key={dept.id} value={dept.id}>
                                {dept.name} ({dept.code})
                              </MenuItem>
                            ))
                          )}
                        </Select>
                      </FormControl>
                    </Grid>
                  )}

                  {formData.role === 'faculty' && (
                    <>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth required>
                          <InputLabel>Unvan</InputLabel>
                          <Select
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            label="Unvan"
                          >
                            <MenuItem value="professor">Profesör</MenuItem>
                            <MenuItem value="associate_professor">Doçent</MenuItem>
                            <MenuItem value="assistant_professor">Dr. Öğretim Üyesi</MenuItem>
                            <MenuItem value="lecturer">Öğretim Görevlisi</MenuItem>
                            <MenuItem value="research_assistant">Araştırma Görevlisi</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth required>
                          <InputLabel>Bölüm</InputLabel>
                          <Select
                            name="departmentId"
                            value={formData.departmentId}
                            onChange={handleChange}
                            label="Bölüm"
                            disabled={loadingDepartments}
                          >
                            {loadingDepartments ? (
                              <MenuItem disabled>
                                <CircularProgress size={20} sx={{ mr: 1 }} />
                                Bölümler yükleniyor...
                              </MenuItem>
                            ) : (
                              departments.map((dept) => (
                                <MenuItem key={dept.id} value={dept.id}>
                                  {dept.name} ({dept.code})
                                </MenuItem>
                              ))
                            )}
                          </Select>
                        </FormControl>
                      </Grid>
                    </>
                  )}
                </Grid>
              )}

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Button
                  disabled={activeStep === 0}
                  onClick={handleBack}
                  variant="outlined"
                  sx={{
                    borderRadius: 2,
                    px: 4,
                    py: 1.5,
                    fontWeight: 600,
                    borderWidth: 2,
                    '&:hover': {
                      borderWidth: 2,
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    }
                  }}
                >
                  Geri
                </Button>
                {activeStep < steps.length - 1 ? (
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    endIcon={<AutoAwesomeIcon />}
                    sx={{
                      borderRadius: 2,
                      px: 4,
                      py: 1.5,
                      fontWeight: 700,
                      background: 'linear-gradient(135deg, #0ea5e9 0%, #14b8a6 100%)',
                      boxShadow: '0 8px 24px rgba(14, 165, 233, 0.4)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #0284c7 0%, #0d9488 100%)',
                        boxShadow: '0 12px 32px rgba(14, 165, 233, 0.5)',
                        transform: 'translateY(-2px)',
                      }
                    }}
                  >
                    İleri
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <RocketLaunchIcon />}
                    sx={{
                      borderRadius: 2,
                      px: 4,
                      py: 1.5,
                      fontWeight: 700,
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
                    {loading ? 'Kaydediliyor...' : 'Kayıt Ol'}
                  </Button>
                )}
              </Box>

              <Divider sx={{ my: 3 }} />

              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary" component="span">
                  Zaten hesabınız var mı?{' '}
                </Typography>
                <Link to="/login" style={{ textDecoration: 'none' }}>
                  <Typography
                    variant="body2"
                    component="span"
                    sx={{
                      color: 'primary.main',
                      fontWeight: 600,
                      '&:hover': { textDecoration: 'underline' }
                    }}
                  >
                    Giriş Yapın
                  </Typography>
                </Link>
              </Box>
            </Box>
          </CardContent>
        </Card>
        </Grow>
      </Container>
    </Box>
  )
}

export default Register
