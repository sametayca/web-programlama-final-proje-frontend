import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  Chip,
  Button,
  CardActions
} from '@mui/material'
import {
  School as SchoolIcon,
  People as PeopleIcon,
  Schedule as ScheduleIcon,
  Assignment as AssignmentIcon,
  Assessment as AssessmentIcon,
  LocationOn as LocationOnIcon
} from '@mui/icons-material'
import { sectionService } from '../services/api'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/Layout'

const FacultyCourses = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [sections, setSections] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (user?.role === 'faculty' || user?.role === 'admin') {
      fetchMySections()
    } else {
      setError('Bu sayfa sadece öğretim üyeleri için kullanılabilir')
      setLoading(false)
    }
  }, [user])

  const fetchMySections = async () => {
    setLoading(true)
    setError(null)
    try {
      const currentYear = new Date().getFullYear()
      const currentMonth = new Date().getMonth()
      const semester = currentMonth >= 0 && currentMonth < 6 ? 'spring' : 'fall'
      
      const response = await sectionService.getSections({ 
        semester,
        year: currentYear,
        instructorId: user?.id
      })
      setSections(response.data.data || [])
    } catch (err) {
      setError(err.response?.data?.error || 'Dersler yüklenirken bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const formatSchedule = (scheduleJson) => {
    if (!scheduleJson) return 'Belirtilmemiş'
    const days = Array.isArray(scheduleJson.days) ? scheduleJson.days.join(', ') : ''
    const time = scheduleJson.startTime && scheduleJson.endTime 
      ? `${scheduleJson.startTime} - ${scheduleJson.endTime}`
      : ''
    return days && time ? `${days} • ${time}` : days || time || 'Belirtilmemiş'
  }

  if (user?.role !== 'faculty' && user?.role !== 'admin') {
    return (
      <Layout>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Alert severity="warning">Bu sayfa sadece öğretim üyeleri için kullanılabilir</Alert>
        </Container>
      </Layout>
    )
  }

  return (
    <Layout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
            <SchoolIcon sx={{ fontSize: 40, color: 'primary.main' }} />
            Derslerim
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Verdiğiniz derslerin listesi ve yönetim seçenekleri
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : sections.length === 0 ? (
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 8 }}>
              <SchoolIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Henüz ders atanmamış
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Size atanan dersler burada görünecektir
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {sections.map((section) => (
              <Grid item xs={12} md={6} key={section.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4
                    }
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                          <Chip
                            label={section.course?.code}
                            color="primary"
                            size="small"
                            sx={{ fontWeight: 600 }}
                          />
                          <Chip
                            label={`Bölüm ${section.sectionNumber}`}
                            size="small"
                            variant="outlined"
                          />
                          <Chip
                            label={`${section.semester} ${section.year}`}
                            size="small"
                            variant="outlined"
                          />
                        </Box>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, mb: 1 }}>
                          {section.course?.name}
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
                          {section.classroom && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <LocationOnIcon fontSize="small" color="action" />
                              <Typography variant="body2" color="text.secondary">
                                {section.classroom.building} {section.classroom.roomNumber}
                              </Typography>
                            </Box>
                          )}
                          {section.scheduleJson && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <ScheduleIcon fontSize="small" color="action" />
                              <Typography variant="body2" color="text.secondary">
                                {formatSchedule(section.scheduleJson)}
                              </Typography>
                            </Box>
                          )}
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <PeopleIcon fontSize="small" color="action" />
                            <Typography variant="body2" color="text.secondary">
                              {section.enrolledCount || 0} / {section.capacity || 0} öğrenci
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  </CardContent>
                  <CardActions sx={{ p: 2, pt: 0, gap: 1, flexWrap: 'wrap' }}>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<AssessmentIcon />}
                      onClick={() => navigate(`/gradebook/${section.id}`)}
                      sx={{
                        background: 'linear-gradient(135deg, #0ea5e9 0%, #14b8a6 100%)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #0284c7 0%, #0d9488 100%)',
                        }
                      }}
                    >
                      Not Defteri
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<LocationOnIcon />}
                      onClick={() => navigate(`/attendance/report/${section.id}`)}
                    >
                      Devamsızlık Raporu
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<AssignmentIcon />}
                      onClick={() => navigate('/excuse-requests')}
                    >
                      Mazeret Talepleri
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<ScheduleIcon />}
                      onClick={() => navigate('/attendance/start')}
                    >
                      Yoklama Başlat
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Layout>
  )
}

export default FacultyCourses
