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
  const [calendarView, setCalendarView] = useState(null)

  useEffect(() => {
    fetchSchedule()
  }, [semester, year])

  const fetchSchedule = async () => {
    try {
      setLoading(true)
      const response = await schedulingService.getMySchedule({ semester, year })
      const scheduleData = response.data.data || []
      console.log('📅 Schedule data from backend:', scheduleData)
      
      // Filter out invalid entries and normalize data
      const validSchedule = scheduleData.filter(item => {
        if (!item) return false
        // Check if day exists and is valid
        const day = item.day || item.days || item.dayOfWeek
        if (!day) {
          console.warn('⚠️ Item missing day field:', item)
          return false
        }
        return true
      }).map(item => ({
        ...item,
        day: item.day || item.days || item.dayOfWeek || 'Monday'
      }))
      
      setSchedule(validSchedule)
      
      // Convert to FullCalendar events (will be updated when calendar view changes)
      const calendarEvents = convertToCalendarEvents(validSchedule)
      console.log('📆 Calendar events:', calendarEvents)
      setEvents(calendarEvents)
    } catch (err) {
      console.error('Schedule fetch error:', err)
      const errorMsg = err.response?.data?.error || 'Program yüklenemedi'
      setError(errorMsg)
      // If no schedule found, don't show error, just empty state
      if (err.response?.status === 404 || errorMsg.includes('not found')) {
        setError(null)
        setSchedule([])
        setEvents([])
      }
    } finally {
      setLoading(false)
    }
  }

  const convertToCalendarEvents = (scheduleData, viewStart = null) => {
    if (!scheduleData || scheduleData.length === 0) {
      console.log('⚠️ No schedule data to convert')
      return []
    }

    const dayMap = {
      'Monday': 1,
      'Tuesday': 2,
      'Wednesday': 3,
      'Thursday': 4,
      'Friday': 5,
      'Saturday': 6,
      'Sunday': 0,
      'Pazartesi': 1,
      'Salı': 2,
      'Çarşamba': 3,
      'Perşembe': 4,
      'Cuma': 5,
      'Cumartesi': 6,
      'Pazar': 0
    }

    // Get week start from calendar view or current date
    const getWeekStart = (date = new Date()) => {
      const d = date instanceof Date ? new Date(date) : new Date(date)
      d.setHours(0, 0, 0, 0)
      const day = d.getDay()
      const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Adjust when day is Sunday
      const monday = new Date(d)
      monday.setDate(diff)
      return monday
    }

    const weekStart = viewStart ? getWeekStart(viewStart) : getWeekStart()
    console.log('📅 Week start (Monday):', weekStart.toISOString())
    
    const events = scheduleData.map((item, index) => {
      // Try multiple possible field names for day
      const day = item.day || item.days || item.dayOfWeek
      
      if (!day) {
        console.warn('⚠️ Item missing day field:', item)
        return null
      }

      const dayOfWeek = dayMap[day]
      
      if (dayOfWeek === undefined) {
        console.warn(`⚠️ Unknown day: "${day}"`, item)
        return null
      }

      // Calculate the date for this day in the current week
      const eventDate = new Date(weekStart)
      eventDate.setDate(weekStart.getDate() + (dayOfWeek - 1))
      
      // Parse time
      const startTimeStr = item.startTime || '09:00'
      const endTimeStr = item.endTime || '11:00'
      
      const [startHours, startMinutes] = startTimeStr.split(':').map(Number)
      const [endHours, endMinutes] = endTimeStr.split(':').map(Number)
      
      if (isNaN(startHours) || isNaN(startMinutes) || isNaN(endHours) || isNaN(endMinutes)) {
        console.warn('⚠️ Invalid time format:', item)
        return null
      }
      
      const start = new Date(eventDate)
      start.setHours(startHours, startMinutes, 0, 0)
      
      const end = new Date(eventDate)
      end.setHours(endHours, endMinutes, 0, 0)
      
      const event = {
        id: item.id || `${item.courseCode}-${item.day}-${index}`,
        title: `${item.courseCode}${item.courseName ? ' - ' + item.courseName : ''}`,
        start: start.toISOString(),
        end: end.toISOString(),
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
      
      console.log(`✅ Event created: ${event.title} on ${item.day} ${start.toISOString()}`)
      return event
    }).filter(Boolean) // Remove null entries
    
    console.log(`📊 Total events created: ${events.length}`)
    return events
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
                datesSet={(dateInfo) => {
                  // Update events when calendar view changes
                  if (schedule.length > 0) {
                    const weekStart = dateInfo.start
                    const updatedEvents = convertToCalendarEvents(schedule, weekStart)
                    setEvents(updatedEvents)
                  }
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
