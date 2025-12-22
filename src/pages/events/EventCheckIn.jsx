import { useState } from 'react'
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Alert,
  Chip,
  TextField,
  Button,
  Tabs,
  Tab,
  Divider,
  Paper,
  Grid
} from '@mui/material'
import { toast } from 'react-toastify'
import Layout from '../../components/Layout'
import QRScanner from '../../components/QRScanner'
import eventService from '../../services/eventService'
import { 
  CheckCircle, 
  Event as EventIcon,
  ErrorOutline,
  QrCode,
  TextFields,
  CameraAlt,
  People
} from '@mui/icons-material'

const EventCheckIn = () => {
  const [scanMode, setScanMode] = useState(0) // 0: camera, 1: manual
  const [manualQR, setManualQR] = useState('')
  const [eventId, setEventId] = useState('')
  const [regId, setRegId] = useState('')
  const [scanResult, setScanResult] = useState(null)
  const [scanning, setScanning] = useState(true)
  const [attendeeCount, setAttendeeCount] = useState(0)

  const handleScan = async (qrCode) => {
    await processCheckIn(qrCode)
  }

  const handleManualCheckIn = async () => {
    if (!manualQR.trim()) {
      toast.error('Lütfen QR kod giriniz')
      return
    }
    if (!eventId.trim()) {
      toast.error('Lütfen etkinlik ID giriniz')
      return
    }
    if (!regId.trim()) {
      toast.error('Lütfen kayıt ID giriniz')
      return
    }
    
    await processCheckIn(manualQR.trim())
  }

  const processCheckIn = async (qrCode) => {
    if (!eventId || !regId) {
      toast.error('Lütfen etkinlik ve kayıt ID\'lerini girin')
      setScanResult({
        success: false,
        error: 'Etkinlik ve kayıt ID\'leri gereklidir'
      })
      setTimeout(() => {
        setScanResult(null)
        setScanning(true)
      }, 3000)
      return
    }

    try {
      setScanning(false)
      
      const response = await eventService.checkin(eventId, regId, { qrCode })
      
      setScanResult({
        success: true,
        data: response.data.data
      })
      
      // Increment attendee count
      setAttendeeCount(prev => prev + 1)
      
      toast.success('Check-in başarılı!')
      
      // Reset after 5 seconds
      setTimeout(() => {
        setScanResult(null)
        setScanning(true)
        setManualQR('')
      }, 5000)
    } catch (err) {
      setScanResult({
        success: false,
        error: err.response?.data?.error || 'Check-in başarısız'
      })
      
      toast.error(err.response?.data?.error || 'Check-in başarısız')
      
      // Reset after 3 seconds
      setTimeout(() => {
        setScanResult(null)
        setScanning(true)
        setManualQR('')
      }, 3000)
    }
  }

  const renderScanResult = () => {
    if (!scanResult) return null

    return (
      <Card 
        elevation={4}
        sx={{ 
          bgcolor: scanResult.success ? 'success.light' : 'error.light',
          color: 'white',
          mb: 3
        }}
      >
        <CardContent>
          {scanResult.success ? (
            <>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <CheckCircle sx={{ fontSize: 64 }} />
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    Başarılı!
                  </Typography>
                  <Typography variant="body1">
                    Check-in tamamlandı
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2, bgcolor: 'rgba(255,255,255,0.3)' }} />

              {scanResult.data && (
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Katılımcı
                    </Typography>
                    <Typography variant="h6" fontWeight="bold">
                      {scanResult.data.userName}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Etkinlik
                    </Typography>
                    <Typography variant="h6" fontWeight="bold">
                      {scanResult.data.eventTitle}
                    </Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Giriş Zamanı
                    </Typography>
                    <Typography variant="body1">
                      {new Date(scanResult.data.checkedInAt).toLocaleString('tr-TR')}
                    </Typography>
                  </Grid>
                </Grid>
              )}
            </>
          ) : (
            <Box textAlign="center">
              <ErrorOutline sx={{ fontSize: 64, mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Hata!
              </Typography>
              <Typography variant="body1">
                {scanResult.error}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Layout>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight="bold" color="primary" textAlign="center">
          Etkinlik Check-In
        </Typography>
        <Typography variant="body1" color="text.secondary" textAlign="center" paragraph>
          Katılımcıların QR kodunu okutun
        </Typography>

        {/* Attendee Counter */}
        <Paper 
          elevation={3} 
          sx={{ 
            p: 3, 
            mb: 3, 
            bgcolor: 'primary.light', 
            color: 'white',
            textAlign: 'center'
          }}
        >
          <Box display="flex" justifyContent="center" alignItems="center" gap={2}>
            <People sx={{ fontSize: 48 }} />
            <Box>
              <Typography variant="h3" fontWeight="bold">
                {attendeeCount}
              </Typography>
              <Typography variant="body1">
                Toplam Katılımcı
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Event & Registration ID Inputs */}
        <Card elevation={2} sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Etkinlik Bilgileri
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Etkinlik ID"
                  value={eventId}
                  onChange={(e) => setEventId(e.target.value)}
                  placeholder="UUID formatında etkinlik ID'si"
                  helperText="Etkinlik yönetim panelinden alın"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Kayıt ID"
                  value={regId}
                  onChange={(e) => setRegId(e.target.value)}
                  placeholder="UUID formatında kayıt ID'si"
                  helperText="Kayıt listesinden alın"
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Mode Tabs */}
        <Paper elevation={2} sx={{ mb: 3 }}>
          <Tabs 
            value={scanMode} 
            onChange={(e, newValue) => {
              setScanMode(newValue)
              setScanResult(null)
              setManualQR('')
              setScanning(true)
            }}
            variant="fullWidth"
          >
            <Tab icon={<CameraAlt />} label="Kamera" />
            <Tab icon={<TextFields />} label="Manuel Giriş" />
          </Tabs>
        </Paper>

        {/* Scan Result */}
        {renderScanResult()}

        {/* Camera Mode */}
        {scanMode === 0 && scanning && !scanResult && eventId && regId && (
          <Box sx={{ mb: 4 }}>
            <QRScanner onScan={handleScan} />
          </Box>
        )}

        {/* Manual Mode */}
        {scanMode === 1 && !scanResult && (
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                QR Kod Metni
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="QR kod metnini buraya yapıştırın"
                value={manualQR}
                onChange={(e) => setManualQR(e.target.value)}
                placeholder="Örn: 123e4567-e89b-12d3-a456-426614174000"
                sx={{ mb: 2 }}
              />
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handleManualCheckIn}
                disabled={!manualQR.trim() || !eventId || !regId}
              >
                Check-In Yap
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Alert severity="info" sx={{ mt: 4 }}>
          <Typography variant="body2" fontWeight="bold" gutterBottom>
            Kullanım Talimatları:
          </Typography>
          <Typography variant="body2" component="div">
            <strong>1. Etkinlik Bilgileri:</strong>
            <br />
            - Etkinlik ID ve Kayıt ID'lerini yukarıdaki alanlara girin
            <br />
            - Bu bilgileri etkinlik yönetim panelinden alabilirsiniz
            <br />
            <br />
            <strong>2. Kamera Modu:</strong>
            <br />
            - Katılımcı QR kodunu kameraya gösterir
            <br />
            - Sistem otomatik olarak okur ve check-in yapar
            <br />
            <br />
            <strong>3. Manuel Mod:</strong>
            <br />
            - Katılımcıdan QR kod metnini alın
            <br />
            - Metin kutusuna yapıştırın
            <br />
            - "Check-In Yap" butonuna basın
            <br />
            <br />
            <strong>4. Sayaç:</strong>
            <br />
            - Üstteki sayaç toplam check-in yapılan katılımcı sayısını gösterir
          </Typography>
        </Alert>
      </Container>
    </Layout>
  )
}

export default EventCheckIn
