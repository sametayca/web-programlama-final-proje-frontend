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
  Dialog,
  DialogTitle,
  DialogContent,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Grid
} from '@mui/material'
import { toast } from 'react-toastify'
import { QRCodeSVG } from 'qrcode.react'
import Layout from '../../components/Layout'
import mealService from '../../services/mealService'
import { Restaurant, Delete, QrCode, CheckCircle, Cancel as CancelIcon, Schedule } from '@mui/icons-material'

const MealReservations = () => {
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedQR, setSelectedQR] = useState(null)
  const [cancelling, setCancelling] = useState(null)
  const [tabValue, setTabValue] = useState(0) // 0: upcoming, 1: past

  useEffect(() => {
    fetchReservations()
  }, [])

  const fetchReservations = async () => {
    try {
      setLoading(true)
      const response = await mealService.getMyReservations()
      setReservations(response.data.data || [])
    } catch (err) {
      setError(err.response?.data?.error || 'Rezervasyonlar yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async (reservation) => {
    // Check if can cancel (2 hours before)
    const mealTime = new Date(`${reservation.menu.date} ${reservation.menu.startTime}`)
    const now = new Date()
    const hoursUntilMeal = (mealTime - now) / (1000 * 60 * 60)

    if (hoursUntilMeal < 2) {
      toast.error('Yemek saatinden 2 saat öncesine kadar iptal edebilirsiniz')
      return
    }

    if (!window.confirm('Rezervasyonu iptal etmek istediğinize emin misiniz?')) {
      return
    }

    try {
      setCancelling(reservation.id)
      await mealService.cancelReservation(reservation.id)
      toast.success('Rezervasyon iptal edildi')
      fetchReservations()
    } catch (err) {
      toast.error(err.response?.data?.error || 'İptal edilemedi')
    } finally {
      setCancelling(null)
    }
  }

  const getMealTypeLabel = (type) => {
    const types = {
      breakfast: { label: 'Kahvaltı', color: 'warning' },
      lunch: { label: 'Öğle', color: 'primary' },
      dinner: { label: 'Akşam', color: 'secondary' }
    }
    return types[type] || { label: type, color: 'default' }
  }

  const getStatusBadge = (reservation) => {
    if (reservation.used) {
      return <Chip icon={<CheckCircle />} label="Kullanıldı" color="success" size="small" />
    }
    if (reservation.status === 'cancelled') {
      return <Chip icon={<CancelIcon />} label="İptal Edildi" color="error" size="small" />
    }
    if (reservation.status === 'confirmed') {
      return <Chip icon={<Schedule />} label="Rezerve" color="primary" size="small" />
    }
    return <Chip label={reservation.status} size="small" />
  }

  const canCancel = (reservation) => {
    if (reservation.used || reservation.status === 'cancelled') return false
    
    const mealTime = new Date(`${reservation.menu.date} ${reservation.menu.startTime}`)
    const now = new Date()
    const hoursUntilMeal = (mealTime - now) / (1000 * 60 * 60)
    
    return hoursUntilMeal >= 2
  }

  const getCancelTooltip = (reservation) => {
    if (reservation.used) return 'Kullanılmış rezervasyon iptal edilemez'
    if (reservation.status === 'cancelled') return 'Zaten iptal edilmiş'
    
    const mealTime = new Date(`${reservation.menu.date} ${reservation.menu.startTime}`)
    const now = new Date()
    const hoursUntilMeal = (mealTime - now) / (1000 * 60 * 60)
    
    if (hoursUntilMeal < 2) {
      return 'Yemek saatinden 2 saat öncesine kadar iptal edilebilir'
    }
    
    return 'Rezervasyonu iptal et'
  }

  const filterReservations = () => {
    const now = new Date()
    
    return reservations.filter(res => {
      const mealDateTime = new Date(`${res.menu.date} ${res.menu.startTime}`)
      
      if (tabValue === 0) {
        // Upcoming: gelecek veya bugün olan + henüz kullanılmamış
        return mealDateTime >= now && !res.used && res.status !== 'cancelled'
      } else {
        // Past: geçmiş veya kullanılmış veya iptal edilmiş
        return mealDateTime < now || res.used || res.status === 'cancelled'
      }
    }).sort((a, b) => {
      const dateA = new Date(`${a.menu.date} ${a.menu.startTime}`)
      const dateB = new Date(`${b.menu.date} ${b.menu.startTime}`)
      return tabValue === 0 ? dateA - dateB : dateB - dateA
    })
  }

  const renderReservationCard = (reservation) => {
    const mealType = getMealTypeLabel(reservation.menu.mealType)
    const canCancelThis = canCancel(reservation)
    
    return (
      <Grid item xs={12} md={6} key={reservation.id}>
        <Card elevation={3}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Chip label={mealType.label} color={mealType.color} size="small" />
              {getStatusBadge(reservation)}
            </Box>

            <Typography variant="h6" gutterBottom>
              {new Date(reservation.menu.date).toLocaleDateString('tr-TR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </Typography>

            <Typography variant="body2" color="text.secondary" paragraph>
              📍 {reservation.cafeteria?.name || 'Kafeterya bilgisi yok'}
            </Typography>

            <Typography variant="body2" paragraph>
              ⏰ {reservation.menu.startTime} - {reservation.menu.endTime}
            </Typography>

            {reservation.menu.price > 0 && (
              <Typography variant="body2" color="warning.main" paragraph>
                💰 Ücret: {reservation.menu.price} TL
              </Typography>
            )}

            {reservation.used && reservation.usedAt && (
              <Alert severity="success" sx={{ mb: 2 }}>
                ✓ Kullanıldı: {new Date(reservation.usedAt).toLocaleString('tr-TR')}
              </Alert>
            )}

            {tabValue === 0 && !reservation.used && reservation.status === 'confirmed' && (
              <Box display="flex" gap={1} mt={2}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<QrCode />}
                  onClick={() => setSelectedQR(reservation)}
                >
                  QR Kodu Göster
                </Button>
                <Tooltip title={getCancelTooltip(reservation)}>
                  <span>
                    <IconButton 
                      color="error"
                      onClick={() => handleCancel(reservation)}
                      disabled={!canCancelThis || cancelling === reservation.id}
                    >
                      {cancelling === reservation.id ? (
                        <CircularProgress size={24} />
                      ) : (
                        <Delete />
                      )}
                    </IconButton>
                  </span>
                </Tooltip>
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

  const filteredReservations = filterReservations()

  return (
    <Layout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight="bold" color="primary">
          Yemek Rezervasyonlarım
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
            <Tab label="Gelecek Rezervasyonlar" />
            <Tab label="Geçmiş Rezervasyonlar" />
          </Tabs>
        </Box>

        {filteredReservations.length === 0 ? (
          <Card elevation={2}>
            <CardContent sx={{ py: 8, textAlign: 'center' }}>
              <Restaurant sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {tabValue === 0 ? 'Gelecek rezervasyon bulunmamaktadır' : 'Geçmiş rezervasyon bulunmamaktadır'}
              </Typography>
              {tabValue === 0 && (
                <Button 
                  variant="contained" 
                  sx={{ mt: 2 }}
                  onClick={() => window.location.href = '/meals/menu'}
                >
                  Menüyü Görüntüle
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {filteredReservations.map(renderReservationCard)}
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
            Yemek QR Kodu
          </DialogTitle>
          <DialogContent sx={{ p: 4 }}>
            <Box textAlign="center">
              {selectedQR && (
                <>
                  <Chip 
                    label={getMealTypeLabel(selectedQR.menu.mealType).label}
                    color={getMealTypeLabel(selectedQR.menu.mealType).color}
                    sx={{ mb: 2 }}
                  />
                  
                  <Typography variant="h5" gutterBottom fontWeight="bold">
                    {new Date(selectedQR.menu.date).toLocaleDateString('tr-TR', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long'
                    })}
                  </Typography>
                  
                  <Typography variant="body1" color="text.secondary" gutterBottom>
                    {selectedQR.menu.startTime} - {selectedQR.menu.endTime}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    📍 {selectedQR.cafeteria?.name}
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
                  
                  <Alert severity="info" icon={<Restaurant />}>
                    <Typography variant="body2" fontWeight="bold">
                      Bu QR kodu kafeterya personeline gösterin
                    </Typography>
                  </Alert>
                  
                  {selectedQR.menu.price > 0 && (
                    <Alert severity="warning" sx={{ mt: 2 }}>
                      Yemek alırken {selectedQR.menu.price} TL cüzdanınızdan düşülecektir
                    </Alert>
                  )}
                </>
              )}
            </Box>
          </DialogContent>
        </Dialog>
      </Container>
    </Layout>
  )
}

export default MealReservations
