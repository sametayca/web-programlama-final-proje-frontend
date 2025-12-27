import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Grid
} from '@mui/material'
import {
  LocationOn as LocationOnIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon
} from '@mui/icons-material'
import { attendanceService } from '../services/api'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/Layout'
import MapComponent from '../components/MapComponent'
import { toast } from 'react-toastify'

const GiveAttendance = () => {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [checkingIn, setCheckingIn] = useState(false)
  const [location, setLocation] = useState(null)
  const [locationError, setLocationError] = useState(null)
  const [distance, setDistance] = useState(null)

  useEffect(() => {
    if (user?.role === 'student') {
      fetchSession()
      requestLocation()
    }
  }, [sessionId, user])

  const fetchSession = async () => {
    setLoading(true)
    try {
      const response = await attendanceService.getSession(sessionId)
      setSession(response.data.data)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Oturum yüklenirken bir hata oluştu')
      navigate('/my-attendance')
    } finally {
      setLoading(false)
    }
  }

  const requestLocation = (highAccuracy = true) => {
    if (!navigator.geolocation) {
      setLocationError('Tarayıcınız konum servislerini desteklemiyor')
      return
    }

    setLoading(true)
    setLocationError(null)

    const options = {
      enableHighAccuracy: highAccuracy,
      timeout: 10000,
      maximumAge: 0
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        })
        setLocationError(null)
        setLoading(false)
      },
      (error) => {
        // If high accuracy failed, try low accuracy
        if (highAccuracy && (error.code === error.TIMEOUT || error.code === error.POSITION_UNAVAILABLE)) {
          console.log('High accuracy failed, trying low accuracy...')
          requestLocation(false)
          return
        }

        let errorMessage;
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Konum izni reddedildi. Lütfen tarayıcı ayarlarından (Kilit simgesi) siteye konum izni verin.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Konum bilgisi alınamıyor. GPS'in açık olduğundan emin olun.";
            break;
          case error.TIMEOUT:
            errorMessage = "Konum alma süresi doldu. Açık havaya çıkıp tekrar deneyin.";
            break;
          default:
            errorMessage = "Bilinmeyen bir hata oluştu.";
        }
        setLocationError(errorMessage)
        console.error('Geolocation error:', error)
        setLoading(false)
      },
      options
    )
  }

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371000
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  useEffect(() => {
    if (location && session) {
      const dist = calculateDistance(
        location.latitude,
        location.longitude,
        parseFloat(session.latitude),
        parseFloat(session.longitude)
      )
      setDistance(dist)
    }
  }, [location, session])

  const handleCheckIn = async () => {
    if (!location) {
      toast.error('Location not available. Please enable location services.')
      return
    }

    setCheckingIn(true)
    try {
      const response = await attendanceService.checkIn(sessionId, {
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy
      })

      if (response.data.data.isFlagged) {
        toast.warning('Yoklama kaydedildi ancak GPS mesafesi nedeniyle inceleme için işaretlendi')
      } else {
        toast.success('Yoklama başarıyla kaydedildi!')
      }

      setTimeout(() => {
        navigate('/my-attendance')
      }, 2000)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Yoklama verilemedi')
    } finally {
      setCheckingIn(false)
    }
  }

  if (user?.role !== 'student') {
    return (
      <Layout>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Alert severity="warning">Bu sayfa sadece öğrenciler için kullanılabilir</Alert>
        </Container>
      </Layout>
    )
  }

  if (loading) {
    return (
      <Layout>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        </Container>
      </Layout>
    )
  }

  if (!session) {
    return (
      <Layout>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Alert severity="error">Oturum bulunamadı</Alert>
        </Container>
      </Layout>
    )
  }

  // Determine effective radius - user requested max 15m (or whatever is set in session)
  const isWithinRange = distance !== null && distance <= parseFloat(session.geofenceRadius)

  return (
    <Layout>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
              {session.section?.course?.code} - {session.section?.course?.name}
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              Bölüm {session.section?.sectionNumber}
            </Typography>
            <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip label={`Tarih: ${session.date}`} size="small" />
              <Chip label={`Saat: ${session.startTime} - ${session.endTime}`} size="small" />
              {session.section?.classroom && (
                <Chip
                  label={`${session.section.classroom.building} ${session.section.classroom.roomNumber}`}
                  size="small"
                  variant="outlined"
                />
              )}
            </Box>
          </CardContent>
        </Card>

        {/* Map Component */}
        {session && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <LocationOnIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Konum Haritası
              </Typography>
              <Box sx={{ mt: 2 }}>
                <MapComponent
                  classroomLocation={{
                    latitude: parseFloat(session.latitude),
                    longitude: parseFloat(session.longitude)
                  }}
                  userLocation={location}
                  // If we have user location, center map there to show them where they are relative to target
                  center={location ? { lat: location.latitude, lng: location.longitude } : null}
                  geofenceRadius={parseFloat(session.geofenceRadius)}
                  height="300px"
                />
              </Box>
            </CardContent>
          </Card>
        )}

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              <LocationOnIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Konum Durumu
            </Typography>

            {locationError ? (
              <Alert severity="error" sx={{ mt: 2 }}>
                {locationError}
                <Button
                  size="small"
                  onClick={requestLocation}
                  sx={{ mt: 1 }}
                >
                  Tekrar Dene
                </Button>
              </Alert>
            ) : location ? (
              <Box sx={{ mt: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Enlem
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {location.latitude.toFixed(6)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Boylam
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {location.longitude.toFixed(6)}
                    </Typography>
                  </Grid>
                  {distance !== null && (
                    <>
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary">
                          Sınıftan Mesafe
                        </Typography>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 700,
                            color: isWithinRange ? 'success.main' : 'error.main'
                          }}
                        >
                          {distance.toFixed(2)} metre
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Coğrafi sınır yarıçapı: {session.geofenceRadius}m
                        </Typography>
                      </Grid>
                      {!isWithinRange && (
                        <Grid item xs={12}>
                          <Alert severity="warning">
                            İzin verilen aralığın dışındasınız. Yoklamanız inceleme için işaretlenebilir.
                          </Alert>
                        </Grid>
                      )}
                    </>
                  )}
                </Grid>
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <CircularProgress />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  Konumunuz alınıyor...
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Button
              fullWidth
              variant="contained"
              size="large"
              startIcon={checkingIn ? <CircularProgress size={20} color="inherit" /> : <CheckCircleIcon />}
              onClick={handleCheckIn}
              disabled={checkingIn || !location || session.status !== 'active' || !isWithinRange}
              sx={{ py: 2 }}
            >
              {checkingIn ? 'Yoklama veriliyor...' : (!isWithinRange && distance !== null) ? 'Mesafe Sınırı Dışındasınız' : 'Yoklama Ver'}
            </Button>
            {session.status !== 'active' && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                Bu oturum aktif değil
              </Alert>
            )}
          </CardContent>
        </Card>
      </Container>
    </Layout>
  )
}

export default GiveAttendance

