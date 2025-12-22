import { useState, useEffect } from 'react'
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  Tabs,
  Tab,
  IconButton,
  Tooltip
} from '@mui/material'
import { toast } from 'react-toastify'
import { QRCodeSVG } from 'qrcode.react'
import Layout from '../../components/Layout'
import eventService from '../../services/eventService'
import { 
  Event, 
  QrCode, 
  CheckCircle, 
  HourglassEmpty,
  Cancel as CancelIcon,
  Delete
} from '@mui/icons-material'

const MyEvents = () => {
  const [registrations, setRegistrations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedQR, setSelectedQR] = useState(null)
  const [tabValue, setTabValue] = useState(0) // 0: upcoming, 1: past
  const [cancelling, setCancelling] = useState(null)

  useEffect(() => {
    fetchRegistrations()
  }, [])

  const fetchRegistrations = async () => {
    try {
      setLoading(true)
      const response = await eventService.myEvents()
      setRegistrations(response.data.data || [])
    } catch (err) {
      setError(err.response?.data?.error || 'Kayıtlar yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async (registration) => {
    if (!window.confirm(`${registration.event.title} etkinliği kaydını iptal etmek istediğinize emin misiniz?`)) {
      return
    }

    try {
      setCancelling(registration.id)
      await eventService.cancelRegistration(registration.event.id, registration.id)
      toast.success('Kayıt iptal edildi')
      fetchRegistrations()
    } catch (err) {
      toast.error(err.response?.data?.error || 'İptal edilemedi')
    } finally {
      setCancelling(null)
    }
  }

  const getStatusIcon = (registration) => {
    if (registration.checkedIn) return <CheckCircle color="success" />
    if (registration.status === 'pending') return <HourglassEmpty color="warning" />
    if (registration.status === 'cancelled') return <CancelIcon color="error" />
    return <Event color="primary" />
  }

  const getStatusLabel = (registration) => {
    if (registration.checkedIn) {
      return { label: 'Katıldı', color: 'success' }
    }
    if (registration.status === 'pending') {
      return { label: 'Onay Bekliyor', color: 'warning' }
    }
    if (registration.status === 'approved') {
      return { label: 'Onaylı', color: 'primary' }
    }
    if (registration.status === 'cancelled') {
      return { label: 'İptal Edildi', color: 'error' }
    }
    return { label: registration.status, color: 'default' }
  }

  const canCancel = (registration) => {
    if (registration.checkedIn || registration.status === 'cancelled') {
      return false
    }
    const eventDate = new Date(registration.event.startDate)
    return eventDate > new Date()
  }

  const filterRegistrations = () => {
    const now = new Date()
    
    return registrations.filter(reg => {
      const eventDate = new Date(reg.event.endDate)
      
      if (tabValue === 0) {
        // Upcoming: future events and not checked in
        return eventDate >= now && !reg.checkedIn && reg.status !== 'cancelled'
      } else {
        // Past: past events or checked in or cancelled
        return eventDate < now || reg.checkedIn || reg.status === 'cancelled'
      }
    }).sort((a, b) => {
      const dateA = new Date(a.event.startDate)
      const dateB = new Date(b.event.startDate)
      return tabValue === 0 ? dateA - dateB : dateB - dateA
    })
  }

  const renderRegistrationCard = (registration) => {
    const status = getStatusLabel(registration)
    const canCancelThis = canCancel(registration)
    const isPaid = registration.event.price && registration.event.price > 0
    
    return (
      <Grid item xs={12} md={6} key={registration.id}>
        <Card elevation={3}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              {getStatusIcon(registration)}
              <Chip 
                label={status.label}
                color={status.color}
                size="small"
              />
            </Box>

            <Typography variant="h6" gutterBottom fontWeight="bold">
              {registration.event.title}
            </Typography>

            <Typography variant="body2" color="text.secondary" paragraph>
              📍 {registration.event.location}
            </Typography>

            <Typography variant="body2" paragraph>
              📅 {new Date(registration.event.startDate).toLocaleDateString('tr-TR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Typography>

            {isPaid && (
              <Typography variant="body2" color="warning.main" paragraph>
                💰 Ücret: {registration.event.price} TL
              </Typography>
            )}

            {registration.checkedIn && registration.checkedInAt && (
              <Alert severity="success" sx={{ mb: 2 }}>
                ✓ Giriş yapıldı: {new Date(registration.checkedInAt).toLocaleString('tr-TR', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Alert>
            )}

            {registration.status === 'cancelled' && (
              <Alert severity="error" sx={{ mb: 2 }}>
                İptal edildi
              </Alert>
            )}

            {registration.status === 'pending' && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                Organizatör onayı bekleniyor
              </Alert>
            )}

            {tabValue === 0 && registration.status === 'approved' && !registration.checkedIn && (
              <Box display="flex" gap={1} mt={2}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<QrCode />}
                  onClick={() => setSelectedQR(registration)}
                >
                  QR Kodu Göster
                </Button>
                {canCancelThis && (
                  <Tooltip title="Kaydı İptal Et">
                    <IconButton 
                      color="error"
                      onClick={() => handleCancel(registration)}
                      disabled={cancelling === registration.id}
                    >
                      {cancelling === registration.id ? (
                        <CircularProgress size={24} />
                      ) : (
                        <Delete />
                      )}
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>
    )
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

  const filteredRegs = filterRegistrations()

  return (
    <Layout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight="bold" color="primary">
          Etkinlik Kayıtlarım
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Kayıtlı olduğunuz etkinlikleri görüntüleyin ve QR kodlarınıza erişin
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
            <Tab label="Gelecek Etkinlikler" />
            <Tab label="Geçmiş Etkinlikler" />
          </Tabs>
        </Box>

        {filteredRegs.length === 0 ? (
          <Card elevation={2}>
            <CardContent sx={{ py: 8, textAlign: 'center' }}>
              <Event sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {tabValue === 0 
                  ? 'Gelecek etkinlik kaydı bulunmamaktadır' 
                  : 'Geçmiş etkinlik kaydı bulunmamaktadır'}
              </Typography>
              {tabValue === 0 && (
                <Button 
                  variant="contained" 
                  sx={{ mt: 2 }}
                  onClick={() => window.location.href = '/events'}
                >
                  Etkinlikleri Görüntüle
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {filteredRegs.map(renderRegistrationCard)}
          </Grid>
        )}

        {/* Full Screen QR Code Dialog */}
        <Dialog 
          open={Boolean(selectedQR)} 
          onClose={() => setSelectedQR(null)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle textAlign="center" sx={{ bgcolor: 'primary.main', color: 'white' }}>
            Etkinlik QR Kodu
          </DialogTitle>
          <DialogContent sx={{ p: 4 }}>
            <Box textAlign="center">
              {selectedQR && (
                <>
                  <Typography variant="h5" gutterBottom fontWeight="bold">
                    {selectedQR.event.title}
                  </Typography>
                  
                  <Typography variant="body1" color="text.secondary" gutterBottom>
                    {new Date(selectedQR.event.startDate).toLocaleDateString('tr-TR', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    📍 {selectedQR.event.location}
                  </Typography>
                  
                  <Box 
                    sx={{ 
                      p: 4, 
                      bgcolor: 'white', 
                      borderRadius: 3,
                      mt: 3,
                      mb: 3,
                      display: 'inline-block',
                      boxShadow: 3
                    }}
                  >
                    <QRCodeSVG 
                      value={selectedQR.qrCode} 
                      size={320}
                      level="H"
                      includeMargin={true}
                    />
                  </Box>
                  
                  <Alert severity="info" icon={<Event />}>
                    <Typography variant="body2" fontWeight="bold">
                      Bu QR kodu etkinlik girişinde gösterin
                    </Typography>
                  </Alert>
                </>
              )}
            </Box>
          </DialogContent>
        </Dialog>
      </Container>
    </Layout>
  )
}

export default MyEvents
