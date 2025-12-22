import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel
} from '@mui/material'
import {
  ArrowBack as ArrowBackIcon,
  Assignment as AssignmentIcon,
  Upload as UploadIcon,
  Save as SaveIcon,
  CalendarToday as CalendarTodayIcon
} from '@mui/icons-material'
import { attendanceService, sectionService } from '../services/api'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/Layout'
import { toast } from 'react-toastify'

const StudentExcuseRequest = () => {
  const { sectionId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [section, setSection] = useState(null)
  const [sessions, setSessions] = useState([])
  const [selectedSessionId, setSelectedSessionId] = useState('')
  const [formData, setFormData] = useState({
    reason: '',
    documentUrl: null
  })
  const [error, setError] = useState(null)
  const [file, setFile] = useState(null)

  useEffect(() => {
    if (user?.role === 'student') {
      fetchSectionAndSessions()
    } else {
      setError('Bu sayfa sadece öğrenciler için kullanılabilir')
      setLoading(false)
    }
  }, [sectionId, user])

  const fetchSectionAndSessions = async () => {
    setLoading(true)
    setError(null)
    try {
      // Fetch section info
      const sectionResponse = await sectionService.getSection(sectionId)
      setSection(sectionResponse.data.data)

      // Fetch available sessions for excuse request
      const sessionsResponse = await attendanceService.getSectionSessions(sectionId)
      if (sessionsResponse.data.success && sessionsResponse.data.data) {
        const availableSessions = sessionsResponse.data.data
        setSessions(availableSessions)
        
        // Auto-select first session if only one available
        if (availableSessions.length === 1) {
          const sessionId = availableSessions[0].id || availableSessions[0].sessionId
          if (sessionId) {
            setSelectedSessionId(String(sessionId))
          }
        } else if (availableSessions.length > 1 && !selectedSessionId) {
          // If multiple sessions, don't auto-select - user must choose
          setSelectedSessionId('')
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Bilgiler yüklenirken bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error('Dosya boyutu 5MB\'dan küçük olmalıdır')
        return
      }
      setFile(selectedFile)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!selectedSessionId) {
      setError('Lütfen bir yoklama oturumu seçin')
      return
    }

    if (!formData.reason.trim()) {
      setError('Lütfen mazeret sebebini girin')
      return
    }

    if (formData.reason.trim().length < 10) {
      setError('Mazeret sebebi en az 10 karakter olmalıdır')
      return
    }

    setSubmitting(true)
    try {
      // Ensure sessionId is a valid string
      if (!selectedSessionId || typeof selectedSessionId !== 'string') {
        setError('Geçersiz oturum seçimi')
        setSubmitting(false)
        return
      }

      const submitData = {
        sessionId: String(selectedSessionId).trim(),
        reason: formData.reason.trim()
      }

      // documentUrl is optional - only include if we have a valid URL
      // For now, we skip file upload since it's not fully implemented
      // If file is selected, we'll just skip it for now
      if (file) {
        toast.info('Dosya yükleme özelliği yakında eklenecek. Mazeret talebi belge olmadan gönderiliyor.')
      }

      const response = await attendanceService.createExcuseRequest(submitData)
      const successMessage = response.data?.message || 'Mazeret talebiniz başarıyla gönderildi'
      toast.success(successMessage)
      navigate('/my-attendance')
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Mazeret talebi gönderilemedi'
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setSubmitting(false)
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

  if (loading) {
    return (
      <Layout>
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        </Container>
      </Layout>
    )
  }

  return (
    <Layout>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/my-attendance')}
          sx={{ mb: 3 }}
        >
          Devamsızlığıma Dön
        </Button>

        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <AssignmentIcon sx={{ fontSize: 40, color: 'primary.main' }} />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                  Mazeret Talebi Oluştur
                </Typography>
                {section && (
                  <Typography variant="body1" color="text.secondary">
                    {section.course?.code} - {section.course?.name}
                  </Typography>
                )}
              </Box>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                {sessions.length > 1 && (
                  <Grid item xs={12}>
                    <FormControl fullWidth required>
                      <InputLabel>Yoklama Oturumu Seçin</InputLabel>
                      <Select
                        value={selectedSessionId}
                        onChange={(e) => setSelectedSessionId(e.target.value)}
                        label="Yoklama Oturumu Seçin"
                      >
                        {sessions.map((session) => {
                          const sessionId = String(session.id || session.sessionId || '')
                          return (
                          <MenuItem key={sessionId} value={sessionId}>
                            <Box>
                              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                {session.date ? new Date(session.date).toLocaleDateString('tr-TR', {
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric'
                                }) : 'Tarih belirtilmemiş'}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {session.startTime && session.endTime 
                                  ? `${session.startTime} - ${session.endTime}`
                                  : session.time || 'Saat belirtilmemiş'}
                                {session.status === 'absent' && ' • Devamsız'}
                                {session.status === 'late' && ' • Geç'}
                              </Typography>
                            </Box>
                          </MenuItem>
                          )
                        })}
                      </Select>
                    </FormControl>
                  </Grid>
                )}
                {sessions.length === 1 && (
                  <Grid item xs={12}>
                    <Alert severity="info" sx={{ mb: 2 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                        Mazeret Talebi Yapılacak Oturum:
                      </Typography>
                      <Typography variant="body1">
                        {sessions[0].date ? new Date(sessions[0].date).toLocaleDateString('tr-TR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        }) : 'Tarih belirtilmemiş'}
                        {sessions[0].startTime && sessions[0].endTime 
                          ? ` • ${sessions[0].startTime} - ${sessions[0].endTime}`
                          : ''}
                      </Typography>
                    </Alert>
                  </Grid>
                )}
                {sessions.length === 0 && (
                  <Grid item xs={12}>
                    <Alert severity="info">
                      Bu ders için devamsız olduğunuz bir oturum bulunamadı. Tüm oturumlara katılmış olabilirsiniz.
                    </Alert>
                  </Grid>
                )}

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    required
                    label="Mazeret Sebebi"
                    name="reason"
                    value={formData.reason}
                    onChange={handleChange}
                    multiline
                    rows={6}
                    placeholder="Devamsızlığınızın sebebini detaylı olarak açıklayın..."
                    helperText="En az 10 karakter olmalıdır"
                    disabled={!selectedSessionId}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ border: '1px dashed', borderColor: 'divider', borderRadius: 2, p: 3, textAlign: 'center' }}>
                    <UploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                    <Typography variant="body1" gutterBottom sx={{ fontWeight: 600 }}>
                      Belge Yükle (İsteğe Bağlı)
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Doktor raporu, resmi belge vb. (Max 5MB)
                    </Typography>
                    <input
                      accept=".pdf,.jpg,.jpeg,.png"
                      style={{ display: 'none' }}
                      id="document-upload"
                      type="file"
                      onChange={handleFileChange}
                    />
                    <label htmlFor="document-upload">
                      <Button
                        variant="outlined"
                        component="span"
                        startIcon={<UploadIcon />}
                      >
                        Dosya Seç
                      </Button>
                    </label>
                    {file && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" color="success.main">
                          ✓ {file.name} seçildi
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography variant="body2">
                      <strong>Not:</strong> Mazeret talebiniz öğretim üyesi tarafından incelenecektir. 
                      Onaylandığında devamsızlığınız mazeretli olarak işaretlenecektir.
                    </Typography>
                  </Alert>
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                    <Button
                      variant="outlined"
                      onClick={() => navigate('/my-attendance')}
                      disabled={submitting}
                    >
                      İptal
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={submitting ? <CircularProgress size={20} /> : <SaveIcon />}
                      disabled={submitting}
                      sx={{
                        background: 'linear-gradient(135deg, #0ea5e9 0%, #14b8a6 100%)',
                        boxShadow: '0 8px 24px rgba(14, 165, 233, 0.4)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #0284c7 0%, #0d9488 100%)',
                          boxShadow: '0 12px 32px rgba(14, 165, 233, 0.5)',
                        }
                      }}
                    >
                      {submitting ? 'Gönderiliyor...' : 'Talebi Gönder'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Layout>
  )
}

export default StudentExcuseRequest
