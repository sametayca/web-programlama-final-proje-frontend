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
      const response = await sectionService.getSections({ instructorId: user.id })
      setSections(response.data.data || [])
    } catch (err) {
      toast.error('Failed to fetch sections')
    } finally {
      setLoading(false)
    }
  }

  const handleStartSession = async () => {
    if (!selectedSection || !date || !startTime || !endTime) {
      toast.error('Please fill all required fields')
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
      toast.success('Attendance session started successfully!')
      setQrDialog(true)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to start session')
    } finally {
      setCreating(false)
    }
  }

  const handleCloseSession = async () => {
    if (!activeSession) return

    try {
      await attendanceService.closeSession(activeSession.id)
      toast.success('Session closed successfully')
      setActiveSession(null)
      setQrDialog(false)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to close session')
    }
  }

  if (user?.role !== 'faculty' && user?.role !== 'admin') {
    return (
      <Layout>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Alert severity="warning">This page is only available for faculty</Alert>
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
            Start Attendance Session
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Create a new GPS-based attendance session for your course
          </Typography>
        </Box>

        <Card>
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Select Section</InputLabel>
                  <Select
                    value={selectedSection}
                    onChange={(e) => setSelectedSection(e.target.value)}
                    label="Select Section"
                    disabled={loading}
                  >
                    {sections.map((section) => (
                      <MenuItem key={section.id} value={section.id}>
                        {section.course?.code} - {section.course?.name} (Section {section.sectionNumber})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Geofence Radius (meters)"
                  type="number"
                  value={geofenceRadius}
                  onChange={(e) => setGeofenceRadius(parseFloat(e.target.value) || 15)}
                  inputProps={{ min: 5, max: 100, step: 1 }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Start Time"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="End Time"
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
                  {creating ? 'Starting...' : 'Start Attendance Session'}
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Dialog open={qrDialog} onClose={() => setQrDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Attendance Session Started</DialogTitle>
          <DialogContent>
            {activeSession && (
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h6" gutterBottom>
                  QR Code (Backup Method)
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                  <Chip
                    label={activeSession.qrCode}
                    icon={<QrCodeIcon />}
                    sx={{ fontSize: '1rem', p: 2 }}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Students can use this QR code as a backup method
                </Typography>
                <Alert severity="info" sx={{ mt: 2 }}>
                  Session will expire in 30 minutes
                </Alert>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setQrDialog(false)}>Close</Button>
            {activeSession && (
              <Button
                variant="contained"
                color="error"
                startIcon={<StopIcon />}
                onClick={handleCloseSession}
              >
                Close Session
              </Button>
            )}
          </DialogActions>
        </Dialog>
      </Container>
    </Layout>
  )
}

export default StartAttendance

