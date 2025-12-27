import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Divider,
  Grid,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText
} from '@mui/material'
import {
  ArrowBack as ArrowBackIcon,
  School as SchoolIcon,
  People as PeopleIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material'
import { courseService, enrollmentService } from '../services/api'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/Layout'
import { toast } from 'react-toastify'

const CourseDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [enrolling, setEnrolling] = useState(false)
  const [enrollDialog, setEnrollDialog] = useState(false)
  const [selectedSection, setSelectedSection] = useState(null)
  const [enrollError, setEnrollError] = useState(null)

  useEffect(() => {
    fetchCourse()
  }, [id])

  const fetchCourse = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await courseService.getCourseById(id)
      setCourse(response.data.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Ders detayları yüklenirken bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleEnroll = async (section) => {
    if (user?.role !== 'student') {
      toast.error('Sadece öğrenciler derslere kayıt olabilir')
      return
    }

    setSelectedSection(section)
    setEnrollError(null) // Clear previous errors
    setEnrollDialog(true)
  }

  const confirmEnroll = async () => {
    setEnrolling(true)
    setEnrollError(null)
    try {
      await enrollmentService.enroll(selectedSection.id)
      toast.success('Derse başarıyla kayıt olundu!')
      setEnrollDialog(false)
      setEnrollError(null)
      fetchCourse()
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Derse kayıt olunamadı'
      setEnrollError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setEnrolling(false)
    }
  }

  if (loading) {
    return (
      <Layout>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        </Container>
      </Layout>
    )
  }

  if (error || !course) {
    return (
      <Layout>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Alert severity="error">{error || 'Ders bulunamadı'}</Alert>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/courses')}
            sx={{ mt: 2 }}
          >
            Kataloğa Dön
          </Button>
        </Container>
      </Layout>
    )
  }

  return (
    <Layout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/courses')}
          sx={{ mb: 3 }}
        >
          Kataloğa Dön
        </Button>

        {enrollError && !enrollDialog && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setEnrollError(null)}>
            {enrollError}
          </Alert>
        )}

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box>
                <Chip label={course.code} color="primary" sx={{ mb: 1, fontWeight: 600 }} />
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
                  {course.name}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {course.department?.name}
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Chip label={`${course.credits} Kredi`} sx={{ mb: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  {course.ects} ECTS
                </Typography>
              </Box>
            </Box>

            {course.description && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="body1" paragraph>
                  {course.description}
                </Typography>
              </>
            )}

            {course.syllabusUrl && (
              <Button
                variant="outlined"
                href={course.syllabusUrl}
                target="_blank"
                sx={{ mt: 2 }}
              >
                Ders Programını Görüntüle
              </Button>
            )}
          </CardContent>
        </Card>

        {course.prerequisites && course.prerequisites.length > 0 && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Önkoşullar
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                {course.prerequisites.map((prereq) => (
                  <Chip
                    key={prereq.id}
                    label={`${prereq.code} - ${prereq.name}`}
                    variant="outlined"
                    onClick={() => navigate(`/courses/${prereq.id}`)}
                    sx={{ cursor: 'pointer' }}
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
              Mevcut Bölümler
            </Typography>

            {!course.sections || course.sections.length === 0 ? (
              <Alert severity="info">Bu ders için bölüm bulunmamaktadır</Alert>
            ) : (
              <Grid container spacing={2}>
                {course.sections.map((section) => (
                  <Grid item xs={12} key={section.id}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="h6" gutterBottom>
                              Bölüm {section.sectionNumber}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 1 }}>
                              <Chip
                                icon={<PeopleIcon />}
                                label={section.instructor ? `${section.instructor.firstName} ${section.instructor.lastName}` : 'TBA'}
                                size="small"
                                variant="outlined"
                              />
                              <Chip
                                icon={<ScheduleIcon />}
                                label={`${section.semester} ${section.year}`}
                                size="small"
                                variant="outlined"
                              />
                              <Chip
                                label={`${section.enrolledCount}/${section.capacity}`}
                                size="small"
                                color={section.enrolledCount >= section.capacity ? 'error' : 'default'}
                              />
                            </Box>
                            {section.scheduleJson && (
                              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                {Array.isArray(section.scheduleJson.days) && section.scheduleJson.days.join(', ')}
                                {section.scheduleJson.startTime && ` • ${section.scheduleJson.startTime} - ${section.scheduleJson.endTime}`}
                              </Typography>
                            )}
                          </Box>
                          {user?.role === 'student' && (
                            <Button
                              variant="contained"
                              color="primary"
                              onClick={() => handleEnroll(section)}
                              disabled={section.enrolledCount >= section.capacity}
                            >
                              {section.enrolledCount >= section.capacity ? 'Dolu' : 'Kayıt Ol'}
                            </Button>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </CardContent>
        </Card>

        <Dialog open={enrollDialog} onClose={() => { setEnrollDialog(false); setEnrollError(null); }} maxWidth="sm" fullWidth>
          <DialogTitle>Kayıt Onayı</DialogTitle>
          <DialogContent>
            {enrollError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {enrollError}
              </Alert>
            )}
            <Typography>
              <strong>Bölüm {selectedSection?.sectionNumber}</strong> dersine kayıt olmak istediğinizden emin misiniz?
            </Typography>
            {selectedSection && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Öğretim Üyesi: {selectedSection.instructor?.firstName || 'TBA'} {selectedSection.instructor?.lastName || ''}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Program: {Array.isArray(selectedSection.scheduleJson?.days) ? selectedSection.scheduleJson.days.join(', ') : 'Belirtilmemiş'}
                  {selectedSection.scheduleJson?.startTime && ` • ${selectedSection.scheduleJson.startTime} - ${selectedSection.scheduleJson.endTime}`}
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => { setEnrollDialog(false); setEnrollError(null); }}>İptal</Button>
            <Button
              variant="contained"
              onClick={confirmEnroll}
              disabled={enrolling}
            >
              {enrolling ? <CircularProgress size={20} /> : 'Onayla'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Layout>
  )
}

export default CourseDetail

