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
    // Check if can cancel (same day check is done in backend)
    if (!window.confirm('Rezervasyonu iptal etmek istediğinize emin misiniz? Para bakiyenize geri yüklenecektir.')) {
      return
    }

    try {
      setCancelling(reservation.id)
      await mealService.cancelReservation(reservation.id)
      toast.success('Rezervasyon iptal edildi. Para bakiyenize geri yüklendi.')
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
    if (reservation.status === 'used') {
      return <Chip icon={<CheckCircle />} label="Kullanıldı" color="success" size="small" />
    }
    if (reservation.status === 'cancelled') {
      return <Chip icon={<CancelIcon />} label="İptal Edildi" color="error" size="small" />
    }
    if (reservation.status === 'pending') {
      return <Chip icon={<Schedule />} label="Rezerve" color="primary" size="small" />
    }
    return <Chip label={reservation.status || 'Bilinmiyor'} size="small" />
  }

  const canCancel = (reservation) => {
    // Can cancel if status is pending and not used
    return reservation.status === 'pending' && !reservation.usedAt
  }

  const getCancelTooltip = (reservation) => {
    if (reservation.status === 'used') return 'Kullanılmış rezervasyon iptal edilemez'
    if (reservation.status === 'cancelled') return 'Zaten iptal edilmiş'
    if (reservation.status === 'pending') {
      // Check if same day (backend will reject if same day)
      const menuDate = new Date(reservation.menu?.menuDate || reservation.menu?.date)
      const today = new Date()
      menuDate.setHours(0, 0, 0, 0)
      today.setHours(0, 0, 0, 0)

      if (menuDate.getTime() === today.getTime()) {
        return 'Aynı gün rezervasyon iptal edilemez'
      }
      return 'Rezervasyonu iptal et (Para geri yüklenecek)'
    }
    return 'İptal edilemez'
  }

  const filterReservations = () => {
    const now = new Date()
    now.setHours(0, 0, 0, 0)

    return reservations.filter(res => {
      const menuDate = new Date(res.menu?.menuDate || res.menu?.date)
      menuDate.setHours(0, 0, 0, 0)

      if (tabValue === 0) {
        // Upcoming: gelecek veya bugün olan + henüz kullanılmamış ve iptal edilmemiş
        return menuDate >= now && res.status !== 'used' && res.status !== 'cancelled'
      } else {
        // Past: geçmiş veya kullanılmış veya iptal edilmiş
        return menuDate < now || res.status === 'used' || res.status === 'cancelled'
      }
    }).sort((a, b) => {
      const dateA = new Date(a.menu?.menuDate || a.menu?.date || a.reservationDate)
      const dateB = new Date(b.menu?.menuDate || b.menu?.date || b.reservationDate)
      return tabValue === 0 ? dateA - dateB : dateB - dateA
    })
  }

  const renderReservationCard = (reservation) => {
    const mealType = getMealTypeLabel(reservation.menu?.mealType)
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
              {new Date(reservation.menu?.menuDate || reservation.menu?.date || reservation.reservationDate).toLocaleDateString('tr-TR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </Typography>

            <Typography variant="body2" color="text.secondary" paragraph>
              📍 {reservation.menu?.cafeteria?.name || reservation.menu?.cafeteria?.location || 'Kafeterya bilgisi yok'}
            </Typography>

            <Typography variant="body2" paragraph>
              ⏰ {reservation.menu?.cafeteria?.openingTime || '08:00'} - {reservation.menu?.cafeteria?.closingTime || '20:00'}
            </Typography>

            {reservation.menu?.mainCourse && (
              <Typography variant="body2" paragraph>
                🍽️ {reservation.menu.mainCourse}
              </Typography>
            )}

            {reservation.amountPaid > 0 && (
              <Typography variant="body2" color="warning.main" paragraph>
                💰 Ödenen: {parseFloat(reservation.amountPaid).toFixed(2)} TL
              </Typography>
            )}

            {reservation.isScholarshipMeal && (
              <Typography variant="body2" color="success.main" paragraph>
                🎓 Burslu öğrenci - Ücretsiz
              </Typography>
            )}

            {reservation.status === 'used' && reservation.usedAt && (
              <Alert severity="success" sx={{ mb: 2 }}>
                ✓ Kullanıldı: {new Date(reservation.usedAt).toLocaleString('tr-TR')}
              </Alert>
            )}

            {tabValue === 0 && reservation.status === 'pending' && (
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
                    {new Date(selectedQR.menu?.menuDate || selectedQR.menu?.date || selectedQR.reservationDate).toLocaleDateString('tr-TR', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long'
                    })}
                  </Typography>

                  <Typography variant="body1" color="text.secondary" gutterBottom>
                    {selectedQR.menu?.cafeteria?.openingTime || '08:00'} - {selectedQR.menu?.cafeteria?.closingTime || '20:00'}
                  </Typography>

                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    📍 {selectedQR.menu?.cafeteria?.name || selectedQR.menu?.cafeteria?.location}
                  </Typography>

                  {selectedQR.menu?.mainCourse && (
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      🍽️ {selectedQR.menu.mainCourse}
                    </Typography>
                  )}

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
                      value={`${window.location.origin}/meals/scan?code=${selectedQR.qrCode}`}
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

                  {selectedQR.amountPaid > 0 && (
                    <Alert severity="info" sx={{ mt: 2 }}>
                      Ödenen: {parseFloat(selectedQR.amountPaid).toFixed(2)} TL (Rezervasyon sırasında düşüldü)
                    </Alert>
                  )}

                  {selectedQR.isScholarshipMeal && (
                    <Alert severity="success" sx={{ mt: 2 }}>
                      🎓 Burslu öğrenci - Ücretsiz
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


