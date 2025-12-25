import { useState, useEffect } from 'react'
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar
} from '@mui/material'
import {
  CalendarToday as CalendarTodayIcon,
  Event as EventIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  LocationOn as LocationOnIcon
} from '@mui/icons-material'
import Layout from '../components/Layout'

// Hardcoded data removed. Using API.
const AcademicCalendar = () => {
  const [academicEvents, setAcademicEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedSemester, setSelectedSemester] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState('all')

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      // Fetch all events. In production, we might want to filter by type='academic,exam,...'
      // For now, checking all events and we will filter in UI or backend if needed.
      const response = await import('../services/api').then(module => module.eventService.getEvents({ limit: 200 }))
      if (response.data.success) {
        // Map backend eventType to frontend categories if needed
        const fetchedEvents = response.data.data.events
          .filter(evt => ['academic', 'exam', 'holiday', 'registration', 'ceremony'].includes(evt.eventType)) // Only show academic events
          .map(evt => ({
            id: evt.id,
            title: evt.title,
            date: evt.startDate, // Using start date
            type: evt.eventType,
            priority: evt.priority || 'normal',
            description: evt.description,
            category: mapTypeToCategory(evt.eventType)
          }))
        setAcademicEvents(fetchedEvents)
      }
    } catch (error) {
      console.error('Failed to load academic calendar', error)
    } finally {
      setLoading(false)
    }
  }

  const mapTypeToCategory = (type) => {
    switch (type) {
      case 'academic': return 'Akademik';
      case 'exam': return 'Sınav';
      case 'holiday': return 'Bayram';
      case 'registration': return 'Kayıt';
      case 'ceremony': return 'Tören';
      default: return 'Genel';
    }
  }


  const getEventIcon = (type) => {
    switch (type) {
      case 'academic': return <SchoolIcon />
      case 'exam': return <AssignmentIcon />
      case 'registration': return <CheckCircleIcon />
      case 'holiday': return <EventIcon />
      case 'ceremony': return <CalendarTodayIcon />
      default: return <EventIcon />
    }
  }

  const getEventColor = (type) => {
    switch (type) {
      case 'academic': return 'primary'
      case 'exam': return 'error'
      case 'registration': return 'warning'
      case 'holiday': return 'success'
      case 'ceremony': return 'info'
      default: return 'default'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'error'
      case 'high': return 'warning'
      case 'normal': return 'info'
      case 'low': return 'default'
      default: return 'default'
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    })
  }

  const getMonthName = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })
  }

  // Etkinlikleri filtrele
  const filteredEvents = academicEvents.filter(event => {
    const eventDate = new Date(event.date)
    const currentYear = new Date().getFullYear()

    if (selectedSemester === 'fall') {
      return eventDate >= new Date(`${currentYear}-09-01`) && eventDate <= new Date(`${currentYear}-12-31`)
    } else if (selectedSemester === 'spring') {
      return eventDate >= new Date(`${currentYear + 1}-01-01`) && eventDate <= new Date(`${currentYear + 1}-06-30`)
    } else if (selectedSemester === 'summer') {
      return eventDate >= new Date(`${currentYear + 1}-07-01`) && eventDate <= new Date(`${currentYear + 1}-08-31`)
    }

    if (selectedCategory !== 'all') {
      return event.category === selectedCategory
    }

    return true
  })

  // Etkinlikleri aya göre grupla
  const eventsByMonth = filteredEvents.reduce((acc, event) => {
    const monthKey = getMonthName(event.date)
    if (!acc[monthKey]) {
      acc[monthKey] = []
    }
    acc[monthKey].push(event)
    return acc
  }, {})

  // Ayları sırala
  const sortedMonths = Object.keys(eventsByMonth).sort((a, b) => {
    return new Date(a.split(' ')[1] + ' ' + a.split(' ')[0]) - new Date(b.split(' ')[1] + ' ' + b.split(' ')[0])
  })

  const categories = ['Dönem Başlangıcı', 'Dönem Bitişi', 'Sınav', 'Kayıt', 'Bayram', 'Yaz Okulu', 'Tören']

  return (
    <Layout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
            <CalendarTodayIcon sx={{ fontSize: 40, color: 'primary.main' }} />
            Akademik Takvim
          </Typography>
          <Typography variant="body1" color="text.secondary">
            2024-2025 Akademik Yılı takvim etkinlikleri ve önemli tarihler
          </Typography>
        </Box>

        {/* Filtreler */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Dönem</InputLabel>
                <Select
                  value={selectedSemester}
                  onChange={(e) => setSelectedSemester(e.target.value)}
                  label="Dönem"
                >
                  <MenuItem value="all">Tüm Dönemler</MenuItem>
                  <MenuItem value="fall">Güz Dönemi</MenuItem>
                  <MenuItem value="spring">Bahar Dönemi</MenuItem>
                  <MenuItem value="summer">Yaz Okulu</MenuItem>
                </Select>
              </FormControl>
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Kategori</InputLabel>
                <Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  label="Kategori"
                >
                  <MenuItem value="all">Tüm Kategoriler</MenuItem>
                  {categories.map(cat => (
                    <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </CardContent>
        </Card>

        {/* Takvim Görünümü */}
        {sortedMonths.length === 0 ? (
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 8 }}>
              <CalendarTodayIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                Seçilen kriterlere uygun etkinlik bulunamadı
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {sortedMonths.map((month) => (
              <Grid item xs={12} key={month}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                      <CalendarTodayIcon sx={{ color: 'primary.main' }} />
                      <Typography variant="h5" sx={{ fontWeight: 700, textTransform: 'capitalize' }}>
                        {month}
                      </Typography>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    <List>
                      {eventsByMonth[month]
                        .sort((a, b) => new Date(a.date) - new Date(b.date))
                        .map((event) => (
                          <ListItem
                            key={event.id}
                            sx={{
                              mb: 2,
                              p: 2,
                              borderRadius: 2,
                              bgcolor: 'rgba(14, 165, 233, 0.05)',
                              border: '1px solid rgba(14, 165, 233, 0.1)',
                              transition: 'all 0.3s',
                              '&:hover': {
                                bgcolor: 'rgba(14, 165, 233, 0.1)',
                                transform: 'translateX(8px)',
                                boxShadow: '0 4px 12px rgba(14, 165, 233, 0.2)'
                              }
                            }}
                          >
                            <ListItemIcon>
                              <Avatar
                                sx={{
                                  bgcolor: `${getEventColor(event.type)}.main`,
                                  width: 48,
                                  height: 48
                                }}
                              >
                                {getEventIcon(event.type)}
                              </Avatar>
                            </ListItemIcon>
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                    {event.title}
                                  </Typography>
                                  <Chip
                                    label={event.category}
                                    size="small"
                                    color={getEventColor(event.type)}
                                    sx={{ fontWeight: 600 }}
                                  />
                                  <Chip
                                    label={event.priority === 'urgent' ? 'Acil' : event.priority === 'high' ? 'Yüksek' : 'Normal'}
                                    size="small"
                                    color={getPriorityColor(event.priority)}
                                    variant="outlined"
                                  />
                                </Box>
                              }
                              secondary={
                                <Box>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                    <ScheduleIcon fontSize="small" color="action" />
                                    <Typography variant="body2" color="text.secondary">
                                      {formatDate(event.date)}
                                    </Typography>
                                  </Box>
                                  <Typography variant="body2" color="text.secondary">
                                    {event.description}
                                  </Typography>
                                </Box>
                              }
                            />
                          </ListItem>
                        ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Özet İstatistikler */}
        <Card sx={{ mt: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
              Akademik Yıl Özeti
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.light', color: 'white' }}>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {academicEvents.length}
                  </Typography>
                  <Typography variant="body2">Toplam Etkinlik</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'error.light', color: 'white' }}>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {academicEvents.filter(e => e.type === 'exam').length}
                  </Typography>
                  <Typography variant="body2">Sınav Haftası</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.light', color: 'white' }}>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {academicEvents.filter(e => e.type === 'holiday').length}
                  </Typography>
                  <Typography variant="body2">Bayram</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.light', color: 'white' }}>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {academicEvents.filter(e => e.type === 'registration').length}
                  </Typography>
                  <Typography variant="body2">Kayıt Dönemi</Typography>
                </Paper>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Container>
    </Layout>
  )
}

export default AcademicCalendar
