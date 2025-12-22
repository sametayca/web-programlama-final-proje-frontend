import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Skeleton,
  InputAdornment
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { tr } from 'date-fns/locale'
import Layout from '../../components/Layout'
import eventService from '../../services/eventService'
import { 
  Event, 
  People, 
  Place, 
  AccessTime,
  Search,
  MoneyOff,
  Paid
} from '@mui/icons-material'

const Events = () => {
  const navigate = useNavigate()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    eventType: '',
    search: '',
    startDate: null
  })

  useEffect(() => {
    fetchEvents()
  }, [filters.eventType, filters.startDate])

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (filters.search !== undefined) {
        fetchEvents()
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [filters.search])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const params = {
        isActive: true
      }
      
      if (filters.eventType) params.eventType = filters.eventType
      if (filters.search) params.search = filters.search
      if (filters.startDate) {
        params.startDate = filters.startDate.toISOString().split('T')[0]
      }

      const response = await eventService.listEvents(params)
      setEvents(response.data.data || [])
    } catch (err) {
      setError(err.response?.data?.error || 'Etkinlikler yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  const getEventTypeLabel = (type) => {
    const types = {
      seminar: { label: 'Seminer', color: 'primary' },
      workshop: { label: 'Workshop', color: 'secondary' },
      conference: { label: 'Konferans', color: 'info' },
      social: { label: 'Sosyal', color: 'success' },
      sports: { label: 'Spor', color: 'warning' },
      cultural: { label: 'Kültürel', color: 'error' },
      other: { label: 'Diğer', color: 'default' }
    }
    return types[type] || types.other
  }

  const getRemainingSpots = (event) => {
    return event.capacity - event.registeredCount
  }

  const isPaid = (event) => {
    return event.price && event.price > 0
  }

  const renderEventCard = (event) => {
    const eventType = getEventTypeLabel(event.eventType)
    const remainingSpots = getRemainingSpots(event)
    const isFull = remainingSpots <= 0
    const isPast = new Date(event.startDate) < new Date()
    const paid = isPaid(event)
    
    return (
      <Grid item xs={12} md={6} lg={4} key={event.id}>
        <Card 
          elevation={3}
          sx={{ 
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            opacity: isPast || isFull ? 0.7 : 1,
            transition: 'transform 0.2s',
            '&:hover': {
              transform: 'translateY(-4px)'
            }
          }}
        >
          <CardContent sx={{ flexGrow: 1 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Chip 
                label={eventType.label}
                color={eventType.color}
                size="small"
              />
              {paid ? (
                <Chip 
                  icon={<Paid />}
                  label={`${event.price} TL`}
                  color="warning"
                  size="small"
                />
              ) : (
                <Chip 
                  icon={<MoneyOff />}
                  label="Ücretsiz"
                  color="success"
                  size="small"
                />
              )}
            </Box>

            <Typography variant="h6" gutterBottom fontWeight="bold" noWrap>
              {event.title}
            </Typography>

            <Typography 
              variant="body2" 
              color="text.secondary" 
              paragraph
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                minHeight: 40
              }}
            >
              {event.description || 'Açıklama bulunmuyor'}
            </Typography>

            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <AccessTime fontSize="small" color="action" />
              <Typography variant="body2">
                {new Date(event.startDate).toLocaleDateString('tr-TR', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Typography>
            </Box>

            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <Place fontSize="small" color="action" />
              <Typography variant="body2" noWrap>
                {event.location}
              </Typography>
            </Box>

            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <People fontSize="small" color="action" />
              <Typography variant="body2">
                {event.registeredCount} / {event.capacity} kişi
              </Typography>
              {isFull ? (
                <Chip label="Dolu" color="error" size="small" />
              ) : remainingSpots <= 10 ? (
                <Chip 
                  label={`${remainingSpots} yer kaldı`}
                  color="warning"
                  size="small"
                />
              ) : (
                <Chip 
                  label={`${remainingSpots} yer`}
                  color="success"
                  size="small"
                />
              )}
            </Box>

            <Button
              fullWidth
              variant="contained"
              onClick={() => navigate(`/events/${event.id}`)}
            >
              Detayları Gör
            </Button>
          </CardContent>
        </Card>
      </Grid>
    )
  }

  const renderSkeleton = () => (
    <>
      {[...Array(6)].map((_, index) => (
        <Grid item xs={12} md={6} lg={4} key={index}>
          <Card elevation={3}>
            <CardContent>
              <Skeleton variant="rectangular" height={40} sx={{ mb: 2 }} />
              <Skeleton variant="text" height={40} />
              <Skeleton variant="text" height={60} />
              <Skeleton variant="text" height={30} />
              <Skeleton variant="text" height={30} />
              <Skeleton variant="rectangular" height={36} sx={{ mt: 2 }} />
            </CardContent>
          </Card>
        </Grid>
      ))}
    </>
  )

  return (
    <Layout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" fontWeight="bold" color="primary">
            Etkinlikler
          </Typography>
          <Button 
            variant="outlined"
            onClick={() => navigate('/my-events')}
          >
            Kayıtlarım
          </Button>
        </Box>

        {/* Filters */}
        <Card elevation={2} sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  placeholder="Etkinlik ara..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Kategori</InputLabel>
                  <Select
                    value={filters.eventType}
                    onChange={(e) => setFilters({ ...filters, eventType: e.target.value })}
                    label="Kategori"
                  >
                    <MenuItem value="">Tümü</MenuItem>
                    <MenuItem value="seminar">Seminer</MenuItem>
                    <MenuItem value="workshop">Workshop</MenuItem>
                    <MenuItem value="conference">Konferans</MenuItem>
                    <MenuItem value="social">Sosyal</MenuItem>
                    <MenuItem value="sports">Spor</MenuItem>
                    <MenuItem value="cultural">Kültürel</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={tr}>
                  <DatePicker
                    label="Tarihten sonra"
                    value={filters.startDate}
                    onChange={(newDate) => setFilters({ ...filters, startDate: newDate })}
                    slotProps={{
                      textField: { fullWidth: true },
                      actionBar: {
                        actions: ['clear']
                      }
                    }}
                  />
                </LocalizationProvider>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Grid container spacing={3}>
            {renderSkeleton()}
          </Grid>
        ) : events.length === 0 ? (
          <Card elevation={2}>
            <CardContent sx={{ py: 8, textAlign: 'center' }}>
              <Event sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                {filters.search || filters.eventType || filters.startDate
                  ? 'Filtreye uygun etkinlik bulunamadı'
                  : 'Henüz etkinlik bulunmamaktadır'}
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {events.map(renderEventCard)}
          </Grid>
        )}
      </Container>
    </Layout>
  )
}

export default Events
