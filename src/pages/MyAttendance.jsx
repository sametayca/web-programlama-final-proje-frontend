import { useEffect, useState } from 'react'
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  Chip,
  LinearProgress,
  Button
} from '@mui/material'
import {
  LocationOn as LocationOnIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Assignment as AssignmentIcon,
  AccessTime as AccessTimeIcon
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { attendanceService } from '../services/api'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/Layout'
import { toast } from 'react-toastify'

const MyAttendance = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [attendanceData, setAttendanceData] = useState([])
  const [activeSessions, setActiveSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (user?.role === 'student') {
      fetchMyAttendance()
      fetchActiveSessions()
    }
  }, [user])

  const fetchMyAttendance = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await attendanceService.getMyAttendance()
      setAttendanceData(response.data.data || [])
    } catch (err) {
      setError(err.response?.data?.error || 'Devamsızlık verileri yüklenirken bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const fetchActiveSessions = async () => {
    try {
      const response = await attendanceService.getActiveSessions()
      setActiveSessions(response.data.data || [])
    } catch (err) {
      console.error('Failed to fetch active sessions:', err)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'ok': return 'success'
      case 'warning': return 'warning'
      case 'critical': return 'error'
      default: return 'default'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ok': return <CheckCircleIcon />
      case 'warning': return <WarningIcon />
      case 'critical': return <ErrorIcon />
      default: return <LocationOnIcon />
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'ok': return 'İyi'
      case 'warning': return 'Uyarı'
      case 'critical': return 'Kritik'
      default: return 'Bilinmiyor'
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

  return (
    <Layout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 1 }}>
            <LocationOnIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Devamsızlığım
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Tüm dersler için devamsızlık istatistiklerinizi görüntüleyin
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Active Sessions */}
        {activeSessions.length > 0 && (
          <Card sx={{ mb: 3, backgroundColor: '#e3f2fd' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <AccessTimeIcon sx={{ mr: 1 }} />
                Aktif Yoklama Oturumları
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Bugün {activeSessions.length} aktif yoklama oturumunuz var
              </Typography>
              <Grid container spacing={2}>
                {activeSessions.map((session) => (
                  <Grid item xs={12} sm={6} md={4} key={session.id}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          {session.section?.course?.code}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {session.section?.course?.name}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          <strong>Saat:</strong> {session.startTime} - {session.endTime}
                        </Typography>
                        {session.section?.classroom && (
                          <Typography variant="body2">
                            <strong>Konum:</strong> {session.section.classroom.building} {session.section.classroom.roomNumber}
                          </Typography>
                        )}
                        <Box sx={{ mt: 2 }}>
                          {session.hasCheckedIn ? (
                            <Chip
                              icon={<CheckCircleIcon />}
                              label="Zaten Yoklama Verildi"
                              color="success"
                              size="small"
                            />
                          ) : (
                            <Button
                              variant="contained"
                              size="small"
                              fullWidth
                              onClick={() => navigate(`/attendance/give/${session.id}`)}
                            >
                              Yoklama Ver
                            </Button>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : attendanceData.length === 0 ? (
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 8 }}>
              <LocationOnIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Devamsızlık verisi bulunamadı
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Oturumlar oluşturulduğunda devamsızlık kayıtları burada görünecek
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Attendance Chart */}
            {attendanceData.length > 0 && (
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Devamsızlık Özeti
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={attendanceData.map(item => ({
                      course: item.course?.code || 'N/A',
                      percentage: item.attendance.attendancePercentage || 0,
                      attended: item.attendance.attendedSessions || 0,
                      total: item.attendance.totalSessions || 0
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="course" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="percentage" stroke="#3b82f6" strokeWidth={2} name="Devamsızlık %" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            <Grid container spacing={3}>
              {attendanceData.map((item) => {
              const { course, attendance } = item
              const percentage = attendance.attendancePercentage || 0

              return (
                <Grid item xs={12} key={item.sectionId}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" gutterBottom>
                            {course?.code} - {course?.name}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                            <Chip
                              icon={getStatusIcon(attendance.status)}
                              label={getStatusText(attendance.status)}
                              color={getStatusColor(attendance.status)}
                              size="small"
                            />
                            <Chip
                              label={`${attendance.attendedSessions || 0}/${attendance.totalSessions || 0} Oturum`}
                              size="small"
                              variant="outlined"
                            />
                            {attendance.excusedSessions > 0 && (
                              <Chip
                                label={`${attendance.excusedSessions} Mazeretli`}
                                size="small"
                                variant="outlined"
                                color="info"
                              />
                            )}
                          </Box>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="h4" sx={{ fontWeight: 700, color: getStatusColor(attendance.status) + '.main' }}>
                            {percentage.toFixed(1)}%
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Devamsızlık Oranı
                          </Typography>
                        </Box>
                      </Box>

                      <LinearProgress
                        variant="determinate"
                        value={percentage}
                        color={getStatusColor(attendance.status)}
                        sx={{ height: 8, borderRadius: 4, mt: 2 }}
                      />

                      <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<AssignmentIcon />}
                          onClick={() => navigate(`/attendance/excuse/${item.sectionId}`)}
                        >
                          Mazeret Talep Et
                        </Button>
                      </Box>

                      {attendance.status === 'critical' && (
                        <Alert severity="error" sx={{ mt: 2 }}>
                          Devamsızlığınız %70'in altında. Lütfen danışmanınızla iletişime geçin.
                        </Alert>
                      )}
                      {attendance.status === 'warning' && (
                        <Alert severity="warning" sx={{ mt: 2 }}>
                          Devamsızlığınız %80'in altında. Lütfen devamsızlığınızı iyileştirin.
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              )
            })}
            </Grid>
          </>
        )}
      </Container>
    </Layout>
  )
}

export default MyAttendance

