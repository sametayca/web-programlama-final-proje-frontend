import { useState, useEffect } from 'react'
import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  Chip,
  Paper
} from '@mui/material'
import { toast } from 'react-toastify'
import Layout from '../../components/Layout'
import schedulingService from '../../services/schedulingService'
import { CalendarMonth, Download, AccessTime, Place, Person } from '@mui/icons-material'

const MySchedule = () => {
  const [schedule, setSchedule] = useState([])
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [semester, setSemester] = useState('Fall')
  const [year, setYear] = useState(new Date().getFullYear())
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    fetchSchedule()
  }, [semester, year])

  const fetchSchedule = async () => {
    try {
      setLoading(true)
      const response = await schedulingService.getMySchedule({ semester, year })
      const scheduleData = response.data.data || []
      setSchedule(scheduleData)
      
      // Convert to FullCalendar events
      const calendarEvents = convertToCalendarEvents(scheduleData)
      setEvents(calendarEvents)
    } catch (err) {
      setError(err.response?.data?.error || 'Program yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  const convertToCalendarEvents = (scheduleData) => {
    const dayMap = {
      'Monday': 1,
      'Tuesday': 2,
      'Wednesday': 3,
      'Thursday': 4,
      'Friday': 5,
      'Saturday': 6,
      'Sunday': 0
    }

    return scheduleData.map(item => {
      const dayOfWeek = dayMap[item.day]
      
      return {
        id: item.id || `${item.courseCode}-${item.day}`,
        title: `${item.courseCode} - ${item.classroomName}`,
        daysOfWeek: [dayOfWeek],
        startTime: item.startTime,
        endTime: item.endTime,
        backgroundColor: '#1976d2',
        borderColor: '#1565c0',
        extendedProps: {
          courseCode: item.courseCode,
          courseName: item.courseName,
          instructorName: item.instructorName,
          classroomName: item.classroomName,
          building: item.building,
          credits: item.credits
        }
      }
    })
  }

  const handleEventClick = (info) => {
    setSelectedEvent({
      title: info.event.title,
      start: info.event.start,
      end: info.event.end,
      ...info.event.extendedProps
    })
  }

  const handleExportIcal = async () => {
    try {
      setExporting(true)
      const response = await schedulingService.exportIcal({ semester, year })
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `schedule-${semester}-${year}.ics`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      
      toast.success('Program başarıyla indirildi')
    } catch (err) {
      toast.error('İndirme başarısız')
    } finally {
      setExporting(false)
    }
  }

  if (loading) {
    return (
      <Layout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Layout>
    )
  }

  return (
    <Layout>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight="bold" color="primary">
          Ders Programım
        </Typography>

        {/* Filters */}
        <Card elevation={2} sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Dönem</InputLabel>
                  <Select
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    label="Dönem"
                  >
                    <MenuItem value="Fall">Güz</MenuItem>
                    <MenuItem value="Spring">Bahar</MenuItem>
                    <MenuItem value="Summer">Yaz</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Yıl</InputLabel>
                  <Select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    label="Yıl"
                  >
                    <MenuItem value={2023}>2023</MenuItem>
                    <MenuItem value={2024}>2024</MenuItem>
                    <MenuItem value={2025}>2025</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={exporting ? <CircularProgress size={20} /> : <Download />}
                  onClick={handleExportIcal}
                  disabled={exporting || schedule.length === 0}
                >
                  iCal Olarak İndir
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {schedule.length === 0 ? (
          <Card elevation={2}>
            <CardContent sx={{ py: 8, textAlign: 'center' }}>
              <CalendarMonth sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                Bu dönem için program bulunmamaktadır
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <>
            <Alert severity="info" sx={{ mb: 3 }}>
              Toplam {schedule.length} ders • {semester} {year}
            </Alert>
            
            {/* FullCalendar */}
            <Paper elevation={3} sx={{ p: 2 }}>
              <FullCalendar
                plugins={[timeGridPlugin, interactionPlugin]}
                initialView="timeGridWeek"
                headerToolbar={{
                  left: 'title',
                  center: '',
                  right: 'today prev,next'
                }}
                slotMinTime="08:00:00"
                slotMaxTime="20:00:00"
                allDaySlot={false}
                height="auto"
                events={events}
                eventClick={handleEventClick}
                weekends={true}
                firstDay={1} // Monday
                locale="tr"
                buttonText={{
                  today: 'Bugün',
                  week: 'Hafta'
                }}
                dayHeaderFormat={{
                  weekday: 'long'
                }}
              />
            </Paper>
          </>
        )}

        {/* Event Detail Dialog */}
        <Dialog
          open={Boolean(selectedEvent)}
          onClose={() => setSelectedEvent(null)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
            Ders Detayları
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            {selectedEvent && (
              <Box>
                <Typography variant="h5" gutterBottom fontWeight="bold">
                  {selectedEvent.courseCode}
                </Typography>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  {selectedEvent.courseName}
                </Typography>

                <Box mt={3}>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <AccessTime color="action" />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Zaman
                      </Typography>
                      <Typography variant="body1">
                        {selectedEvent.start && selectedEvent.start.toLocaleTimeString('tr-TR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })} - {selectedEvent.end && selectedEvent.end.toLocaleTimeString('tr-TR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </Typography>
                    </Box>
                  </Box>

                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Place color="action" />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Sınıf
                      </Typography>
                      <Typography variant="body1">
                        {selectedEvent.classroomName} ({selectedEvent.building})
                      </Typography>
                    </Box>
                  </Box>

                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Person color="action" />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Öğretim Üyesi
                      </Typography>
                      <Typography variant="body1">
                        {selectedEvent.instructorName}
                      </Typography>
                    </Box>
                  </Box>

                  {selectedEvent.credits && (
                    <Box mt={2}>
                      <Chip label={`${selectedEvent.credits} Kredi`} color="primary" />
                    </Box>
                  )}
                </Box>
              </Box>
            )}
          </DialogContent>
        </Dialog>
      </Container>
    </Layout>
  )
}

export default MySchedule
