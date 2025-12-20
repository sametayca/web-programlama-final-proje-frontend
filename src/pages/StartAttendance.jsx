import { useEffect, useState } from 'react'
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip
} from '@mui/material'
import {
  PlayArrow as PlayArrowIcon,
  Stop as StopIcon,
  QrCode2 as QrCodeIcon
} from '@mui/icons-material'
import { sectionService, attendanceService } from '../services/api'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/Layout'
import QRCodeDisplay from '../components/QRCodeDisplay'
import { toast } from 'react-toastify'

const StartAttendance = () => {
  const { user } = useAuth()
  const [sections, setSections] = useState([])
  const [selectedSection, setSelectedSection] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [geofenceRadius, setGeofenceRadius] = useState(15)
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [activeSession, setActiveSession] = useState(null)
  const [qrDialog, setQrDialog] = useState(false)

  useEffect(() => {
    if (user?.role === 'faculty' || user?.role === 'admin') {
      fetchMySections()
    }
  }, [user])

  const fetchMySections = async () => {
    setLoading(true)
    try {
      // Get current semester and year
      const currentYear = new Date().getFullYear()
      const currentMonth = new Date().getMonth()
      const semester = currentMonth >= 0 && currentMonth < 6 ? 'spring' : 'fall'
      
      // Fetch sections for current semester/year (faculty's department courses)
      const response = await sectionService.getSections({ 
        semester,
        year: currentYear
      })
      setSections(response.data.data || [])
    } catch (err) {
      toast.error('Bölümler yüklenirken bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleStartSession = async () => {
    if (!selectedSection || !date || !startTime || !endTime) {
      toast.error('Lütfen tüm zorunlu alanları doldurun')
      return
    }

    setCreating(true)
    try {
      const response = await attendanceService.createSession({
        sectionId: selectedSection,
        date,
        startTime,
        endTime,
        geofenceRadius
      })
      setActiveSession(response.data.data)
      toast.success('Yoklama oturumu başarıyla başlatıldı!')
      setQrDialog(true)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Oturum başlatılamadı')
    } finally {
      setCreating(false)
    }
  }

  const handleCloseSession = async () => {
    if (!activeSession) return

    try {
      await attendanceService.closeSession(activeSession.id)
      toast.success('Oturum başarıyla kapatıldı')
      setActiveSession(null)
      setQrDialog(false)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Oturum kapatılamadı')
    }
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
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 1 }}>
            <PlayArrowIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Yoklama Oturumu Başlat
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Dersiniz için yeni bir GPS tabanlı yoklama oturumu oluşturun
          </Typography>
        </Box>

        <Card>
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Bölüm Seç</InputLabel>
                  <Select
                    value={selectedSection}
                    onChange={(e) => setSelectedSection(e.target.value)}
                    label="Bölüm Seç"
                    disabled={loading}
                  >
                    {sections.map((section) => (
                      <MenuItem key={section.id} value={section.id}>
                        {section.course?.code} - {section.course?.name} (Bölüm {section.sectionNumber})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Tarih"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Coğrafi Sınır Yarıçapı (metre)"
                  type="number"
                  value={geofenceRadius}
                  onChange={(e) => setGeofenceRadius(parseFloat(e.target.value) || 15)}
                  inputProps={{ min: 5, max: 100, step: 1 }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Başlangıç Saati"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Bitiş Saati"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12}>
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  startIcon={creating ? <CircularProgress size={20} color="inherit" /> : <PlayArrowIcon />}
                  onClick={handleStartSession}
                  disabled={creating || !selectedSection || !date || !startTime || !endTime}
                >
                  {creating ? 'Başlatılıyor...' : 'Yoklama Oturumunu Başlat'}
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Dialog open={qrDialog} onClose={() => setQrDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Yoklama Oturumu Başlatıldı</DialogTitle>
          <DialogContent>
            {activeSession && (
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <QRCodeDisplay
                  value={activeSession.qrCode}
                  size={256}
                  title="Yoklama QR Kodu"
                />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  Öğrenciler bu QR kodu okutarak yoklama verebilir
                </Typography>
                <Alert severity="info" sx={{ mt: 2 }}>
                  Oturum 30 dakika içinde sona erecek
                </Alert>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setQrDialog(false)}>Kapat</Button>
            {activeSession && (
              <Button
                variant="contained"
                color="error"
                startIcon={<StopIcon />}
                onClick={handleCloseSession}
              >
                Oturumu Kapat
              </Button>
            )}
          </DialogActions>
        </Dialog>
      </Container>
    </Layout>
  )
}

export default StartAttendance

