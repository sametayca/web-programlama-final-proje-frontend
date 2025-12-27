import { useState, useEffect } from 'react'
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Alert,
  Chip,
  Paper,
  Divider,
  Button,
  TextField,
  Tabs,
  Tab,
  Grid,
  CircularProgress
} from '@mui/material'
import { toast } from 'react-toastify'
import Layout from '../../components/Layout'
import QRScanner from '../../components/QRScanner'
import mealService from '../../services/mealService'
import {
  CheckCircle,
  Restaurant,
  ErrorOutline,
  QrCode,
  TextFields,
  CameraAlt
} from '@mui/icons-material'

const MealScan = () => {
  const [scanMode, setScanMode] = useState(0) // 0: camera, 1: manual
  const [manualQR, setManualQR] = useState('')
  const [validationData, setValidationData] = useState(null)
  const [scanResult, setScanResult] = useState(null)
  const [validating, setValidating] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [scanning, setScanning] = useState(true)

  // Add useSearchParams hook
  const { useSearchParams } = require('react-router-dom')
  const [searchParams] = useSearchParams()

  const handleScan = async (qrCode) => {
    await validateQR(qrCode)
  }

  // Effect to auto-validate if opened via QR link
  useEffect(() => {
    const codeParam = searchParams.get('code');
    if (codeParam && !validationData && !scanResult && scanning) {
      setManualQR(codeParam)
      validateQR(codeParam)
    }
  }, [searchParams])

  const handleManualValidate = async () => {
    if (!manualQR.trim()) {
      toast.error('Lütfen QR kod giriniz')
      return
    }
    await validateQR(manualQR.trim())
  }

  const validateQR = async (qrCode) => {
    try {
      setValidating(true)
      setScanResult(null)
      setScanning(false)

      const response = await mealService.validateReservation(qrCode)

      setValidationData({
        ...response.data.data,
        qrCode
      })

      toast.success('Rezervasyon geçerli!')
    } catch (err) {
      setScanResult({
        success: false,
        error: err.response?.data?.error || 'Geçersiz QR kod'
      })
      toast.error(err.response?.data?.error || 'Geçersiz QR kod')

      // Reset after 3 seconds
      setTimeout(() => {
        setScanResult(null)
        setValidationData(null)
        setScanning(true)
        setManualQR('')
      }, 3000)
    } finally {
      setValidating(false)
    }
  }

  const handleConfirmUse = async () => {
    if (!validationData) return

    try {
      setConfirming(true)

      const response = await mealService.useReservation(
        validationData.reservationId,
        { qrCode: validationData.qrCode }
      )

      setScanResult({
        success: true,
        data: response.data.data
      })

      toast.success('Yemek başarıyla kullanıldı!')

      // Reset after 5 seconds
      setTimeout(() => {
        setScanResult(null)
        setValidationData(null)
        setScanning(true)
        setManualQR('')
      }, 5000)
    } catch (err) {
      toast.error(err.response?.data?.error || 'İşlem başarısız')

      // Reset validation data but show error
      setTimeout(() => {
        setValidationData(null)
        setScanning(true)
      }, 2000)
    } finally {
      setConfirming(false)
    }
  }

  const renderValidationResult = () => {
    if (!validationData) return null

    return (
      <Card elevation={4} sx={{ bgcolor: 'info.light', color: 'white', mb: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <QrCode sx={{ fontSize: 48 }} />
            <Box>
              <Typography variant="h5" fontWeight="bold">
                Rezervasyon Geçerli!
              </Typography>
              <Typography variant="body2">
                Onay için aşağıdaki butona basın
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 2, bgcolor: 'rgba(255,255,255,0.3)' }} />

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Öğrenci
              </Typography>
              <Typography variant="h6" fontWeight="bold">
                {validationData.studentName}
              </Typography>
              <Typography variant="body2">
                No: {validationData.studentNumber}
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Öğün
              </Typography>
              <Typography variant="h6" fontWeight="bold">
                {validationData.mealType === 'lunch' ? 'Öğle Yemeği' :
                  validationData.mealType === 'dinner' ? 'Akşam Yemeği' : 'Kahvaltı'}
              </Typography>
              <Typography variant="body2">
                {new Date(validationData.mealDate).toLocaleDateString('tr-TR')}
              </Typography>
            </Grid>

            {validationData.price > 0 && (
              <Grid item xs={12}>
                <Alert severity="warning" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}>
                  <Typography variant="body2" fontWeight="bold">
                    💰 Ücret: {validationData.price} TL (Cüzdandan düşülecek)
                  </Typography>
                </Alert>
              </Grid>
            )}
          </Grid>

          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={handleConfirmUse}
            disabled={confirming}
            sx={{
              mt: 3,
              bgcolor: 'white',
              color: 'info.main',
              '&:hover': { bgcolor: 'grey.100' }
            }}
          >
            {confirming ? <CircularProgress size={24} /> : '✓ Yemek Kullanımını Onayla'}
          </Button>
        </CardContent>
      </Card>
    )
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
                    Yemek kullanıldı
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2, bgcolor: 'rgba(255,255,255,0.3)' }} />

              {scanResult.data && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    {scanResult.data.studentName}
                  </Typography>
                  <Typography variant="body2">
                    No: {scanResult.data.studentNumber}
                  </Typography>

                  <Box mt={2}>
                    <Chip
                      label={scanResult.data.mealType === 'lunch' ? 'Öğle' : 'Akşam'}
                      sx={{ bgcolor: 'rgba(255,255,255,0.3)', color: 'white', mr: 1 }}
                    />
                    {scanResult.data.price > 0 && (
                      <Chip
                        label={`${scanResult.data.price} TL düşüldü`}
                        sx={{ bgcolor: 'rgba(255,255,255,0.3)', color: 'white' }}
                      />
                    )}
                  </Box>
                </Box>
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
          Yemek QR Okuyucu
        </Typography>
        <Typography variant="body1" color="text.secondary" textAlign="center" paragraph>
          Öğrencinin QR kodunu okutun veya manuel girin
        </Typography>

        {/* Mode Tabs */}
        <Paper elevation={2} sx={{ mb: 3 }}>
          <Tabs
            value={scanMode}
            onChange={(e, newValue) => {
              setScanMode(newValue)
              setValidationData(null)
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

        {/* Scan Result (if any) */}
        {renderScanResult()}

        {/* Validation Result (if any) */}
        {renderValidationResult()}

        {/* Camera Mode */}
        {scanMode === 0 && scanning && !validationData && !scanResult && (
          <Box sx={{ mb: 4 }}>
            <QRScanner onScan={handleScan} />
          </Box>
        )}

        {/* Manual Mode */}
        {scanMode === 1 && !validationData && !scanResult && (
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
                onClick={handleManualValidate}
                disabled={validating || !manualQR.trim()}
              >
                {validating ? <CircularProgress size={24} /> : 'Doğrula'}
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
            <strong>Kamera Modu:</strong>
            <br />
            1. Öğrenci QR kodunu kameraya göstermelidir
            <br />
            2. Sistem otomatik olarak okuyacaktır
            <br />
            3. Doğrulama sonrası "Onayla" butonuna basın
            <br />
            <br />
            <strong>Manuel Mod:</strong>
            <br />
            1. Öğrenciden QR kod metnini alın
            <br />
            2. Metin kutusuna yapıştırın
            <br />
            3. "Doğrula" butonuna basın
            <br />
            4. Doğrulama sonrası "Onayla" butonuna basın
          </Typography>
        </Alert>
      </Container>
    </Layout>
  )
}

export default MealScan
