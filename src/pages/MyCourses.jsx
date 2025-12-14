import { useEffect, useState } from 'react'
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Grid,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material'
import {
  School as SchoolIcon,
  People as PeopleIcon,
  Schedule as ScheduleIcon,
  Delete as DeleteIcon
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { enrollmentService } from '../services/api'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/Layout'
import { toast } from 'react-toastify'

const MyCourses = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [enrollments, setEnrollments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [dropDialog, setDropDialog] = useState(false)
  const [selectedEnrollment, setSelectedEnrollment] = useState(null)
  const [dropping, setDropping] = useState(false)

  useEffect(() => {
    if (user?.role === 'student') {
      fetchMyCourses()
    }
  }, [user])

  const fetchMyCourses = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await enrollmentService.getMyCourses()
      setEnrollments(response.data.data || [])
    } catch (err) {
      setError(err.response?.data?.error || 'Dersler yüklenirken bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleDrop = (enrollment) => {
    setSelectedEnrollment(enrollment)
    setDropDialog(true)
  }

  const confirmDrop = async () => {
    setDropping(true)
    try {
      await enrollmentService.drop(selectedEnrollment.id)
      toast.success('Dersten başarıyla çıkıldı')
      setDropDialog(false)
      fetchMyCourses()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Ders bırakılamadı')
    } finally {
      setDropping(false)
    }
  }

  if (user?.role !== 'student') {
    return (
      <Layout>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Alert severity="warning">Bu sayfa sadece öğrenciler için kullanılabilir</Alert>
        </Container>
      </Layout>
    )
  }

  return (
    <Layout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 1 }}>
            <SchoolIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Derslerim
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Kayıtlı olduğunuz dersleri görüntüleyin ve yönetin
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
        ) : enrollments.length === 0 ? (
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 8 }}>
              <SchoolIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Kayıtlı ders bulunamadı
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate('/courses')}
                sx={{ mt: 2 }}
              >
                Derslere Göz At
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {enrollments.map((enrollment) => {
              const section = enrollment.section
              const course = section?.course
              const instructor = section?.instructor
              const classroom = section?.classroom

              return (
                <Grid item xs={12} key={enrollment.id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box sx={{ flex: 1 }}>
                          <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                            <Chip label={course?.code} color="primary" size="small" />
                            <Chip label={`Bölüm ${section?.sectionNumber}`} size="small" variant="outlined" />
                            <Chip
                              label={`${section?.semester} ${section?.year}`}
                              size="small"
                              variant="outlined"
                            />
                          </Box>
                          <Typography variant="h6" gutterBottom>
                            {course?.name}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 2 }}>
                            {instructor && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <PeopleIcon fontSize="small" color="action" />
                                <Typography variant="body2" color="text.secondary">
                                  {instructor.firstName} {instructor.lastName}
                                </Typography>
                              </Box>
                            )}
                            {classroom && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <ScheduleIcon fontSize="small" color="action" />
                                <Typography variant="body2" color="text.secondary">
                                  {classroom.building} {classroom.roomNumber}
                                </Typography>
                              </Box>
                            )}
                          </Box>
                          {section?.scheduleJson && (
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                              {Array.isArray(section.scheduleJson.days) && section.scheduleJson.days.join(', ')}
                              {section.scheduleJson.startTime && ` • ${section.scheduleJson.startTime} - ${section.scheduleJson.endTime}`}
                            </Typography>
                          )}
                        </Box>
                        <Button
                          variant="outlined"
                          color="error"
                          startIcon={<DeleteIcon />}
                          onClick={() => handleDrop(enrollment)}
                          sx={{ ml: 2 }}
                        >
                          Dersi Bırak
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              )
            })}
          </Grid>
        )}

        <Dialog open={dropDialog} onClose={() => setDropDialog(false)}>
          <DialogTitle>Dersi Bırakmayı Onayla</DialogTitle>
          <DialogContent>
            <Typography>
              <strong>{selectedEnrollment?.section?.course?.code} - {selectedEnrollment?.section?.course?.name}</strong> dersini bırakmak istediğinizden emin misiniz?
            </Typography>
            <Alert severity="warning" sx={{ mt: 2 }}>
              Dersleri sadece kayıt sonrası ilk 4 hafta içinde bırakabilirsiniz.
            </Alert>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDropDialog(false)}>İptal</Button>
            <Button
              variant="contained"
              color="error"
              onClick={confirmDrop}
              disabled={dropping}
            >
              {dropping ? <CircularProgress size={20} /> : 'Onayla'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Layout>
  )
}

export default MyCourses

