import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Button,
  Chip,
  Snackbar
} from '@mui/material'
import {
  School as SchoolIcon,
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material'
import { enrollmentService, gradeService, sectionService } from '../services/api'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/Layout'
import { toast } from 'react-toastify'

const Gradebook = () => {
  const { sectionId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [section, setSection] = useState(null)
  const [students, setStudents] = useState([])
  const [grades, setGrades] = useState({})
  const [error, setError] = useState(null)

  useEffect(() => {
    if (user?.role !== 'faculty' && user?.role !== 'admin') {
      setError('Bu sayfa sadece öğretim üyeleri için kullanılabilir')
      setLoading(false)
      return
    }

    fetchData()
  }, [sectionId, user])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch section details
      const sectionRes = await sectionService.getSection(sectionId)
      const sectionData = sectionRes.data.data

      // Check authorization
      if (user.role === 'faculty' && sectionData.instructorId !== user.id) {
        setError('You are not authorized to view this section')
        setLoading(false)
        return
      }

      setSection(sectionData)

      // Fetch students
      const studentsRes = await enrollmentService.getSectionStudents(sectionId)
      const studentsData = studentsRes.data.data

      setStudents(studentsData)

      // Initialize grades state
      const initialGrades = {}
      studentsData.forEach(enrollment => {
        initialGrades[enrollment.id] = {
          midtermGrade: enrollment.midtermGrade || '',
          finalGrade: enrollment.finalGrade || ''
        }
      })
      setGrades(initialGrades)
    } catch (err) {
      console.error('Error fetching data:', err)
      setError(err.response?.data?.error || 'Not defteri yüklenirken bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleGradeChange = (enrollmentId, field, value) => {
    setGrades(prev => ({
      ...prev,
      [enrollmentId]: {
        ...prev[enrollmentId],
        [field]: value === '' ? '' : parseFloat(value)
      }
    }))
  }

  const handleSaveGrades = async () => {
    try {
      setSaving(true)

      // Save grades for each student
      const savePromises = Object.entries(grades).map(async ([enrollmentId, gradeData]) => {
        if (gradeData.midtermGrade !== '' || gradeData.finalGrade !== '') {
          return gradeService.enterGrade({
            enrollmentId,
            midtermGrade: gradeData.midtermGrade || null,
            finalGrade: gradeData.finalGrade || null
          })
        }
        return Promise.resolve()
      })

      await Promise.all(savePromises)

      toast.success('Notlar başarıyla kaydedildi!')
      
      // Refresh data
      await fetchData()
    } catch (err) {
      console.error('Error saving grades:', err)
      toast.error(err.response?.data?.error || 'Notlar kaydedilemedi')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveSingleGrade = async (enrollmentId) => {
    try {
      const gradeData = grades[enrollmentId]
      if (!gradeData.midtermGrade && !gradeData.finalGrade) {
        toast.warning('Lütfen en az bir not girin')
        return
      }

      await gradeService.enterGrade({
        enrollmentId,
        midtermGrade: gradeData.midtermGrade || null,
        finalGrade: gradeData.finalGrade || null
      })

      toast.success('Not başarıyla kaydedildi!')
      await fetchData()
    } catch (err) {
      console.error('Error saving grade:', err)
      toast.error(err.response?.data?.error || 'Not kaydedilemedi')
    }
  }

  if (user?.role !== 'faculty' && user?.role !== 'admin') {
    return (
      <Layout>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Alert severity="warning">This page is only available for faculty members</Alert>
        </Container>
      </Layout>
    )
  }

  if (loading) {
    return (
      <Layout>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
            <CircularProgress />
          </Box>
        </Container>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Alert severity="error">{error}</Alert>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
            sx={{ mt: 2 }}
          >
            Go Back
          </Button>
        </Container>
      </Layout>
    )
  }

  return (
    <Layout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <Box display="flex" alignItems="center" mb={3}>
          <SchoolIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
          <Box>
            <Typography variant="h4" component="h1" fontWeight="bold">
              Not Defteri
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {section?.course?.code} - {section?.course?.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Bölüm {section?.sectionNumber} • {section?.semester} {section?.year}
            </Typography>
          </Box>
        </Box>

        {/* Save All Button */}
        <Box display="flex" justifyContent="flex-end" mb={2}>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSaveGrades}
            disabled={saving}
            sx={{ mb: 2 }}
          >
            {saving ? 'Kaydediliyor...' : 'Tüm Notları Kaydet'}
          </Button>
        </Box>

        {/* Students Table */}
        <Card>
          <CardContent>
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'primary.light' }}>
                    <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Öğrenci Numarası</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Ad Soyad</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>E-posta</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Vize</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Final</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Harf Notu</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Not Puanı</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>İşlemler</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {students.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary">Bu bölüme kayıtlı öğrenci bulunmamaktadır</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    students.map((enrollment) => {
                      const student = enrollment.student
                      const gradeData = grades[enrollment.id] || { midtermGrade: '', finalGrade: '' }
                      
                      return (
                        <TableRow key={enrollment.id} hover>
                          <TableCell>{student.studentProfile?.studentNumber || 'N/A'}</TableCell>
                          <TableCell>{`${student.firstName} ${student.lastName}`}</TableCell>
                          <TableCell>{student.email}</TableCell>
                          <TableCell>
                            <TextField
                              type="number"
                              size="small"
                              value={gradeData.midtermGrade}
                              onChange={(e) => handleGradeChange(enrollment.id, 'midtermGrade', e.target.value)}
                              inputProps={{ min: 0, max: 100, step: 0.01 }}
                              sx={{ width: 100 }}
                              placeholder={enrollment.midtermGrade || '0'}
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              type="number"
                              size="small"
                              value={gradeData.finalGrade}
                              onChange={(e) => handleGradeChange(enrollment.id, 'finalGrade', e.target.value)}
                              inputProps={{ min: 0, max: 100, step: 0.01 }}
                              sx={{ width: 100 }}
                              placeholder={enrollment.finalGrade || '0'}
                            />
                          </TableCell>
                          <TableCell>
                            {enrollment.letterGrade ? (
                              <Chip
                                label={enrollment.letterGrade}
                                color={
                                  enrollment.letterGrade === 'A' ? 'success' :
                                  enrollment.letterGrade === 'B' ? 'info' :
                                  enrollment.letterGrade === 'C' ? 'warning' :
                                  enrollment.letterGrade === 'D' ? 'error' :
                                  'error'
                                }
                                size="small"
                              />
                            ) : (
                              <Typography variant="body2" color="text.secondary">-</Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            {enrollment.gradePoint ? (
                              <Typography variant="body2">{enrollment.gradePoint.toFixed(2)}</Typography>
                            ) : (
                              <Typography variant="body2" color="text.secondary">-</Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => handleSaveSingleGrade(enrollment.id)}
                              disabled={saving}
                            >
                              Save
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Info Alert */}
        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>Note:</strong> Letter grades and grade points are automatically calculated when both midterm and final grades are entered.
            You can save individual grades or use "Save All Grades" to save all changes at once.
          </Typography>
        </Alert>
      </Container>
    </Layout>
  )
}

export default Gradebook

