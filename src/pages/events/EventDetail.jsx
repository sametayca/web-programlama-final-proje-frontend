import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
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
  Divider,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  Paper
} from '@mui/material'
import { toast } from 'react-toastify'
import { QRCodeSVG } from 'qrcode.react'
import Layout from '../../components/Layout'
import eventService from '../../services/eventService'
import { 
  Event, 
  People, 
  Place, 
  AccessTime, 
  Person,
  Paid,
  MoneyOff,
  CheckCircle
} from '@mui/icons-material'

const EventDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [registering, setRegistering] = useState(false)
  const [registrationSuccess, setRegistrationSuccess] = useState(null)
  const [customFields, setCustomFields] = useState([])

  const { register, handleSubmit, formState: { errors } } = useForm()

  useEffect(() => {
    fetchEvent()
  }, [id])

  const fetchEvent = async () => {
    try {
      setLoading(true)
      const response = await eventService.getEvent(id)
      const eventData = response.data.data
      setEvent(eventData)
      
      // Parse custom fields if exists
      if (eventData.customFieldsJson) {
        try {
          const fields = typeof eventData.customFieldsJson === 'string'
            ? JSON.parse(eventData.customFieldsJson)
            : eventData.customFieldsJson
          setCustomFields(Array.isArray(fields) ? fields : [])
        } catch {
          setCustomFields([])
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Etkinlik bulunamadı')
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (formData) => {
    try {
      setRegistering(true)
      
      // Prepare registration data with custom fields
      const registrationData = {
        ...formData
      }

      const response = await eventService.registerEvent(id, registrationData)
      setRegistrationSuccess(response.data.data)
      toast.success('Kayıt başarılı! QR kodunuzu kayıtlarımda görebilirsiniz.')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Kayıt yapılamadı')
    } finally {
      setRegistering(false)
    }
  }

  const getRemainingSpots = () => {
    if (!event) return 0
    return event.capacity - event.registeredCount
  }

  const getRegistrationDeadline = () => {
    if (!event) return null
    // Assuming registration deadline is event start date
    return new Date(event.startDate)
  }

  const isRegistrationOpen = () => {
    if (!event) return false
    const deadline = getRegistrationDeadline()
    return new Date() < deadline && getRemainingSpots() > 0
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

  if (error || !event) {
    return (
      <Layout>
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Alert severity="error">{error}</Alert>
          <Button onClick={() => navigate('/events')} sx={{ mt: 2 }}>
            ← Etkinliklere Dön
          </Button>
        </Container>
      </Layout>
    )
  }

  const remainingSpots = getRemainingSpots()
  const isFull = remainingSpots <= 0
  const isPast = new Date(event.startDate) < new Date()
  const registrationOpen = isRegistrationOpen()
  const isPaid = event.price && event.price > 0

  return (
    <Layout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Button onClick={() => navigate('/events')} sx={{ mb: 2 }}>
          ← Geri
        </Button>

        <Grid container spacing={3}>
          {/* Main Content */}
          <Grid item xs={12} md={8}>
            <Card elevation={3}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                  <Typography variant="h4" fontWeight="bold" color="primary">
                    {event.title}
                  </Typography>
                  <Chip 
                    label={event.eventType}
                    color="primary"
                  />
                </Box>

                <Box display="flex" gap={1} mb={3}>
                  {isPaid ? (
                    <Chip 
                      icon={<Paid />}
                      label={`${event.price} TL`}
                      color="warning"
                    />
                  ) : (
                    <Chip 
                      icon={<MoneyOff />}
                      label="Ücretsiz"
                      color="success"
                    />
                  )}
                  {event.requiresApproval && (
                    <Chip 
                      label="Onay Gerektirir"
                      color="info"
                      size="small"
                    />
                  )}
                </Box>

                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Açıklama
                </Typography>
                <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-line' }}>
                  {event.description || 'Açıklama bulunmuyor'}
                </Typography>

                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Detaylar
                </Typography>

                <Box display="flex" flexDirection="column" gap={2}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <AccessTime color="action" />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Başlangıç
                      </Typography>
                      <Typography variant="body1">
                        {new Date(event.startDate).toLocaleString('tr-TR', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </Typography>
                    </Box>
                  </Box>

                  <Box display="flex" alignItems="center" gap={2}>
                    <AccessTime color="action" />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Bitiş
                      </Typography>
                      <Typography variant="body1">
                        {new Date(event.endDate).toLocaleString('tr-TR', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </Typography>
                    </Box>
                  </Box>

                  <Box display="flex" alignItems="center" gap={2}>
                    <Place color="action" />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Konum
                      </Typography>
                      <Typography variant="body1">
                        {event.location}
                      </Typography>
                    </Box>
                  </Box>

                  <Box display="flex" alignItems="center" gap={2}>
                    <Person color="action" />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Organizatör
                      </Typography>
                      <Typography variant="body1">
                        {event.organizer || event.organizerUser?.firstName || 'Belirtilmemiş'}
                      </Typography>
                    </Box>
                  </Box>

                  <Box display="flex" alignItems="center" gap={2}>
                    <People color="action" />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Katılımcı Sayısı
                      </Typography>
                      <Typography variant="body1">
                        {event.registeredCount} / {event.capacity} kişi
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Registration Sidebar */}
          <Grid item xs={12} md={4}>
            <Card variant="outlined" sx={{ bgcolor: 'grey.50', position: 'sticky', top: 20 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Kayıt Bilgileri
                </Typography>

                {isPast ? (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    Bu etkinlik sona ermiştir
                  </Alert>
                ) : isFull ? (
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    Kapasite dolmuştur
                  </Alert>
                ) : !registrationOpen ? (
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    Kayıt süresi dolmuştur
                  </Alert>
                ) : (
                  <>
                    <Paper elevation={0} sx={{ p: 2, bgcolor: 'success.light', mb: 2 }}>
                      <Typography variant="h4" fontWeight="bold" color="success.dark" textAlign="center">
                        {remainingSpots}
                      </Typography>
                      <Typography variant="body2" textAlign="center" color="success.dark">
                        Kalan Kontenjan
                      </Typography>
                    </Paper>

                    <Typography variant="body2" color="text.secondary" paragraph>
                      Kayıt Son Tarihi: {getRegistrationDeadline().toLocaleDateString('tr-TR')}
                    </Typography>

                    {isPaid && (
                      <Alert severity="warning" sx={{ mb: 2 }}>
                        Ücretli etkinlik: {event.price} TL
                      </Alert>
                    )}

                    {/* Custom Fields Form */}
                    {customFields.length > 0 && (
                      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                        <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                          Kayıt Formu:
                        </Typography>
                        {customFields.map((field, index) => (
                          <TextField
                            key={index}
                            fullWidth
                            label={field.label || field.name}
                            placeholder={field.placeholder}
                            {...register(field.name, {
                              required: field.required ? `${field.label} gereklidir` : false
                            })}
                            error={!!errors[field.name]}
                            helperText={errors[field.name]?.message}
                            sx={{ mb: 2 }}
                          />
                        ))}
                        <Button
                          fullWidth
                          type="submit"
                          variant="contained"
                          size="large"
                          disabled={registering}
                        >
                          {registering ? <CircularProgress size={24} /> : 'Kayıt Ol'}
                        </Button>
                      </Box>
                    )}

                    {customFields.length === 0 && (
                      <Button
                        fullWidth
                        variant="contained"
                        size="large"
                        onClick={handleSubmit(onSubmit)}
                        disabled={registering}
                      >
                        {registering ? <CircularProgress size={24} /> : 'Kayıt Ol'}
                      </Button>
                    )}

                    {event.requiresApproval && (
                      <Alert severity="info" sx={{ mt: 2 }}>
                        Bu etkinlik için kayıtlar onay gerektirir
                      </Alert>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Success Dialog with QR Code */}
        <Dialog
          open={Boolean(registrationSuccess)}
          onClose={() => {
            setRegistrationSuccess(null)
            navigate('/my-events')
          }}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle textAlign="center" sx={{ bgcolor: 'success.light', color: 'white' }}>
            <CheckCircle sx={{ fontSize: 48, mb: 1 }} />
            <Typography variant="h5" fontWeight="bold">
              Kayıt Başarılı!
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ p: 4, textAlign: 'center' }}>
            {registrationSuccess && (
              <>
                <Typography variant="body1" gutterBottom>
                  {event.title} etkinliğine başarıyla kayıt oldunuz.
                </Typography>
                
                {registrationSuccess.qrCode && (
                  <>
                    <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
                      QR Kodunuz
                    </Typography>
                    <Box
                      sx={{
                        p: 3,
                        bgcolor: 'white',
                        borderRadius: 2,
                        display: 'inline-block',
                        boxShadow: 3
                      }}
                    >
                      <QRCodeSVG
                        value={registrationSuccess.qrCode}
                        size={256}
                        level="H"
                      />
                    </Box>
                    <Alert severity="info" sx={{ mt: 3 }}>
                      Bu QR kodu etkinlik girişinde gösterin
                    </Alert>
                  </>
                )}

                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => navigate('/my-events')}
                  sx={{ mt: 3 }}
                >
                  Kayıtlarımı Görüntüle
                </Button>
              </>
            )}
          </DialogContent>
        </Dialog>
      </Container>
    </Layout>
  )
}

export default EventDetail
