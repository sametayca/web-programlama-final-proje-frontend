import { useEffect, useState } from 'react'
import {
  Box,
  Grid,
  Paper,
  Typography,
  Avatar,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Button,
  Divider,
  Stack,
  IconButton,
  Fade,
  Grow
} from '@mui/material'
import {
  School as SchoolIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  VerifiedUser as VerifiedUserIcon,
  TrendingUp as TrendingUpIcon,
  CalendarToday as CalendarTodayIcon,
  Assignment as AssignmentIcon,
  AutoAwesome as AutoAwesomeIcon,
  RocketLaunch as RocketLaunchIcon,
  Psychology as PsychologyIcon
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authService } from '../services/api'
import Layout from '../components/Layout'

const StatCard = ({ title, value, icon, color, subtitle, delay = 0 }) => (
  <Grow in={true} timeout={600} style={{ transitionDelay: `${delay}ms` }}>
    <Card 
      sx={{ 
        height: '100%', 
        position: 'relative', 
        overflow: 'hidden',
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.98) 100%)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        border: '1px solid rgba(102, 126, 234, 0.1)',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: '0 12px 40px rgba(102, 126, 234, 0.2)',
          borderColor: 'primary.main',
        }
      }}
    >
      {/* Animated background circle */}
      <Box
        sx={{
          position: 'absolute',
          top: -50,
          right: -50,
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${color === 'primary' ? '#0ea5e9' : color === 'success' ? '#10b981' : color === 'warning' ? '#f59e0b' : '#ec4899'}33 0%, transparent 70%)`,
          animation: 'pulse 4s ease-in-out infinite',
        }}
      />
      <CardContent sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
              {title}
            </Typography>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 800, 
                background: `linear-gradient(135deg, ${color === 'primary' ? '#0ea5e9' : color === 'success' ? '#10b981' : color === 'warning' ? '#f59e0b' : '#ec4899'} 0%, ${color === 'primary' ? '#14b8a6' : color === 'success' ? '#059669' : color === 'warning' ? '#d97706' : '#db2777'})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                mb: 0.5
              }}
            >
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block', fontWeight: 500 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: 3,
              background: `linear-gradient(135deg, ${color === 'primary' ? '#667eea' : color === 'success' ? '#10b981' : color === 'warning' ? '#f59e0b' : '#ec4899'} 0%, ${color === 'primary' ? '#764ba2' : color === 'success' ? '#059669' : color === 'warning' ? '#d97706' : '#db2777'})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              boxShadow: `0 8px 24px ${color === 'primary' ? 'rgba(102, 126, 234, 0.3)' : color === 'success' ? 'rgba(16, 185, 129, 0.3)' : color === 'warning' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(236, 72, 153, 0.3)'}`,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'rotate(10deg) scale(1.1)',
              }
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  </Grow>
)

const Dashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const response = await authService.getProfile()
      setProfile(response.data.data)
    } catch (error) {
      console.error('Profile load error:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRoleText = (role) => {
    const roles = {
      student: 'Öğrenci',
      faculty: 'Öğretim Üyesi',
      admin: 'Yönetici',
      staff: 'Personel'
    }
    return roles[role] || role
  }

  if (loading) {
    return (
      <Layout>
        <LinearProgress sx={{ borderRadius: 2 }} />
      </Layout>
    )
  }

  return (
    <Layout>
      <Box>
        {/* Welcome Section with Animation */}
        <Fade in={true} timeout={800}>
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Box
                sx={{
                  width: 60,
                  height: 60,
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #0ea5e9 0%, #14b8a6 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 24px rgba(102, 126, 234, 0.3)',
                  animation: 'float 3s ease-in-out infinite'
                }}
              >
                <AutoAwesomeIcon sx={{ fontSize: 32, color: 'white' }} />
              </Box>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5, color: 'text.primary' }}>
                  Hoş Geldiniz, {profile?.firstName}! 👋
                </Typography>
              </Box>
            </Box>
          </Box>
        </Fade>

        {/* Stats Grid with staggered animation */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Profil Tamamlanma"
              value="85%"
              subtitle="Profil bilgilerinizi tamamlayın"
              icon={<PersonIcon sx={{ fontSize: 32 }} />}
              color="primary"
              delay={0}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Aktivite Durumu"
              value={profile?.isEmailVerified ? "Aktif" : "Beklemede"}
              subtitle={profile?.isEmailVerified ? "E-posta doğrulandı" : "E-posta doğrulanmadı"}
              icon={profile?.isEmailVerified ? <VerifiedUserIcon sx={{ fontSize: 32 }} /> : <EmailIcon sx={{ fontSize: 32 }} />}
              color={profile?.isEmailVerified ? "success" : "warning"}
              delay={100}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Rol"
              value={getRoleText(profile?.role)}
              subtitle="Sistem kullanıcısı"
              icon={<SchoolIcon sx={{ fontSize: 32 }} />}
              color="secondary"
              delay={200}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Platform Durumu"
              value="Online"
              subtitle="Tüm servisler çalışıyor"
              icon={<TrendingUpIcon sx={{ fontSize: 32 }} />}
              color="success"
              delay={300}
            />
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          {/* Profile Card with enhanced design */}
          <Grid item xs={12} md={4}>
            <Grow in={true} timeout={800} style={{ transitionDelay: '400ms' }}>
              <Card 
                sx={{ 
                  height: '100%',
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.98) 100%)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
                  border: '1px solid rgba(102, 126, 234, 0.1)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 4,
                    background: 'linear-gradient(90deg, #0ea5e9 0%, #06b6d4 50%, #14b8a6 100%)',
                  }
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', py: 3 }}>
                    <Box sx={{ position: 'relative', mb: 3 }}>
                      <Avatar
                        src={profile?.profilePicture ? `http://localhost:3000/uploads/profile-pictures/${profile.profilePicture}` : ''}
                        sx={{
                          width: 140,
                          height: 140,
                          border: '5px solid',
                          borderColor: 'primary.light',
                          boxShadow: '0 12px 40px rgba(102, 126, 234, 0.3)',
                          animation: 'float 4s ease-in-out infinite'
                        }}
                      >
                        {profile?.firstName?.[0]}{profile?.lastName?.[0]}
                      </Avatar>
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: 0,
                          right: 0,
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          bgcolor: profile?.isEmailVerified ? 'success.main' : 'warning.main',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '3px solid white',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                        }}
                      >
                        {profile?.isEmailVerified ? (
                          <VerifiedUserIcon sx={{ fontSize: 20, color: 'white' }} />
                        ) : (
                          <EmailIcon sx={{ fontSize: 20, color: 'white' }} />
                        )}
                      </Box>
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                      {profile?.firstName} {profile?.lastName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {profile?.email}
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mb: 3, flexWrap: 'wrap', justifyContent: 'center', gap: 1 }}>
                      <Chip
                        label={getRoleText(profile?.role)}
                        sx={{ 
                          fontWeight: 700,
                          background: 'linear-gradient(135deg, #0ea5e9 0%, #14b8a6 100%)',
                          color: 'white',
                          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                        }}
                      />
                      {profile?.isEmailVerified ? (
                        <Chip
                          icon={<VerifiedUserIcon sx={{ fontSize: 16 }} />}
                          label="Doğrulanmış"
                          color="success"
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                      ) : (
                        <Chip
                          icon={<EmailIcon sx={{ fontSize: 16 }} />}
                          label="Doğrulanmamış"
                          color="warning"
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                      )}
                    </Stack>
                    {profile?.studentProfile && (
                      <Box sx={{ width: '100%', mb: 2, p: 2, bgcolor: 'rgba(102, 126, 234, 0.05)', borderRadius: 2 }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontWeight: 600 }}>
                          Öğrenci Numarası
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                          {profile.studentProfile.studentNumber}
                        </Typography>
                        {profile.studentProfile.department && (
                          <>
                            <Divider sx={{ my: 1.5 }} />
                            <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontWeight: 600 }}>
                              Bölüm
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                              {profile.studentProfile.department.name}
                            </Typography>
                          </>
                        )}
                      </Box>
                    )}
                    {profile?.facultyProfile && (
                      <Box sx={{ width: '100%', mb: 2, p: 2, bgcolor: 'rgba(236, 72, 153, 0.05)', borderRadius: 2 }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontWeight: 600 }}>
                          Personel Numarası
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: 'secondary.main' }}>
                          {profile.facultyProfile.employeeNumber}
                        </Typography>
                        {profile.facultyProfile.department && (
                          <>
                            <Divider sx={{ my: 1.5 }} />
                            <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontWeight: 600 }}>
                              Bölüm
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                              {profile.facultyProfile.department.name}
                            </Typography>
                          </>
                        )}
                      </Box>
                    )}
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={() => navigate('/profile')}
                      sx={{ 
                        mt: 2,
                        py: 1.5,
                        background: 'linear-gradient(135deg, #0ea5e9 0%, #14b8a6 100%)',
                        boxShadow: '0 8px 24px rgba(102, 126, 234, 0.3)',
                        fontWeight: 700,
                        '&:hover': {
                          boxShadow: '0 12px 32px rgba(102, 126, 234, 0.4)',
                          transform: 'translateY(-2px)',
                        },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      Profili Düzenle
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grow>
          </Grid>

          {/* Welcome & Info Card */}
          <Grid item xs={12} md={8}>
            <Grow in={true} timeout={800} style={{ transitionDelay: '500ms' }}>
              <Card 
                sx={{ 
                  mb: 3,
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.98) 100%)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
                  border: '1px solid rgba(102, 126, 234, 0.1)',
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
                    background: 'radial-gradient(circle, rgba(102, 126, 234, 0.1) 0%, transparent 70%)',
                  }
                }}
              >
                <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                  <Divider sx={{ mb: 3 }} />
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PsychologyIcon sx={{ color: 'primary.main' }} />
                    Tamamlanan Özellikler (Part 1)
                  </Typography>
                  <Grid container spacing={2}>
                    {[
                      { icon: <VerifiedUserIcon />, text: 'Kullanıcı Kayıt ve Giriş Sistemi', color: '#667eea' },
                      { icon: <EmailIcon />, text: 'E-posta Doğrulama', color: '#ec4899' },
                      { icon: <PersonIcon />, text: 'Profil Yönetimi ve Fotoğraf Yükleme', color: '#10b981' },
                      { icon: <SchoolIcon />, text: 'Rol Tabanlı Erişim Kontrolü', color: '#f59e0b' }
                    ].map((feature, index) => (
                      <Grid item xs={12} sm={6} key={index}>
                        <Paper
                          elevation={0}
                          sx={{
                            p: 2,
                            bgcolor: `${feature.color}08`,
                            border: `1px solid ${feature.color}20`,
                            borderRadius: 2,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'translateX(8px)',
                              bgcolor: `${feature.color}12`,
                              boxShadow: `0 4px 12px ${feature.color}30`
                            }
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box
                              sx={{
                                width: 40,
                                height: 40,
                                borderRadius: 2,
                                bgcolor: feature.color,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                boxShadow: `0 4px 12px ${feature.color}40`
                              }}
                            >
                              {feature.icon}
                            </Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {feature.text}
                            </Typography>
                          </Box>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Grow>

            {/* Quick Actions */}
            <Grow in={true} timeout={800} style={{ transitionDelay: '600ms' }}>
              <Card
                sx={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.98) 100%)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
                  border: '1px solid rgba(102, 126, 234, 0.1)'
                }}
              >
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AssignmentIcon sx={{ color: 'primary.main' }} />
                    Hızlı İşlemler
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Paper
                        sx={{
                          p: 3,
                          cursor: 'pointer',
                          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
                          border: '1px solid rgba(102, 126, 234, 0.1)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #0ea5e9 0%, #14b8a6 100%)',
                            color: 'white',
                            transform: 'translateY(-8px) scale(1.02)',
                            boxShadow: '0 16px 48px rgba(102, 126, 234, 0.4)',
                            '& .MuiTypography-root': {
                              color: 'white'
                            },
                            '& .MuiSvgIcon-root': {
                              color: 'white'
                            }
                          }
                        }}
                        onClick={() => navigate('/profile')}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <PersonIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                          <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
                              Profil Düzenle
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Bilgilerinizi güncelleyin
                            </Typography>
                          </Box>
                        </Box>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Paper
                        sx={{
                          p: 3,
                          cursor: 'pointer',
                          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                          background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.05) 0%, rgba(240, 147, 251, 0.05) 100%)',
                          border: '1px solid rgba(236, 72, 153, 0.1)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #ec4899 0%, #f093fb 100%)',
                            color: 'white',
                            transform: 'translateY(-8px) scale(1.02)',
                            boxShadow: '0 16px 48px rgba(236, 72, 153, 0.4)',
                            '& .MuiTypography-root': {
                              color: 'white'
                            },
                            '& .MuiSvgIcon-root': {
                              color: 'white'
                            }
                          }
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <CalendarTodayIcon sx={{ fontSize: 40, color: 'secondary.main' }} />
                          <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
                              Etkinlikler
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Yakında eklenecek
                            </Typography>
                          </Box>
                        </Box>
                      </Paper>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grow>
          </Grid>
        </Grid>
      </Box>
    </Layout>
  )
}

export default Dashboard
