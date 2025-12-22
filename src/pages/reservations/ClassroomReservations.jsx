import { useState, useEffect, useContext } from 'react'
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Grid,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tabs,
  Tab
} from '@mui/material'
import { LocalizationProvider, DatePicker, TimePicker } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { toast } from 'react-toastify'
import Layout from '../../components/Layout'
import reservationsService from '../../services/reservationsService'
import { useAuth } from '../../context/AuthContext'
import { 
  Add, 
  CheckCircle, 
  Cancel, 
  HourglassEmpty,
  MeetingRoom,
  Refresh
} from '@mui/icons-material'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'

const reservationSchema = yup.object({
  classroomId: yup.string().required('Sınıf seçimi zorunludur'),
  date: yup.date().nullable().required('Tarih seçimi zorunludur'),
  startTime: yup.date().nullable().required('Başlangıç saati zorunludur'),
  endTime: yup.date().nullable().required('Bitiş saati zorunludur'),
  purpose: yup.string().required('Amaç zorunludur').min(5, 'En az 5 karakter olmalıdır')
}).test('time-order', 'Bitiş saati başlangıçtan sonra olmalıdır', function(value) {
  if (value.startTime && value.endTime) {
    return value.endTime > value.startTime
  }
  return true
})

const ClassroomReservations = () => {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'

  const [classrooms, setClassrooms] = useState([])
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [buildingFilter, setBuildingFilter] = useState('all')
  const [capacityFilter, setCapacityFilter] = useState('all')
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState(0)
  const [actionLoading, setActionLoading] = useState(null)

  const { control, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: yupResolver(reservationSchema),
    defaultValues: {
      classroomId: '',
      date: null,
      startTime: null,
      endTime: null,
      purpose: ''
    }
  })

  useEffect(() => {
    fetchClassrooms()
    fetchReservations()
  }, [])

  useEffect(() => {
    if (createDialogOpen && classrooms.length === 0) {
      // Refresh classrooms when dialog opens if empty
      fetchClassrooms()
    }
  }, [createDialogOpen])

  const fetchClassrooms = async () => {
    try {
      setLoading(true)
      const response = await reservationsService.listClassrooms()
      console.log('Classrooms response:', response.data)
      const classroomsData = response.data.data || response.data || []
      setClassrooms(classroomsData)
      if (classroomsData.length === 0) {
        toast.warning('Sınıf bulunamadı')
      }
    } catch (err) {
      console.error('Error fetching classrooms:', err)
      toast.error(err.response?.data?.error || 'Sınıflar yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  const fetchReservations = async () => {
    try {
      setLoading(true)
      const response = isAdmin 
        ? await reservationsService.getAllReservations()
        : await reservationsService.listReservations()
      setReservations(response.data.data || [])
    } catch (err) {
      toast.error('Rezervasyonlar yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data) => {
    try {
      setCreating(true)
      
      // Validate required fields
      if (!data.classroomId || !data.date || !data.startTime || !data.endTime || !data.purpose) {
        toast.error('Lütfen tüm alanları doldurun')
        return
      }
      
      // Format date and times
      const dateStr = data.date ? new Date(data.date).toISOString().split('T')[0] : null
      const startTimeStr = data.startTime ? new Date(data.startTime).toTimeString().split(' ')[0].substring(0, 5) : null
      const endTimeStr = data.endTime ? new Date(data.endTime).toTimeString().split(' ')[0].substring(0, 5) : null
      
      if (!dateStr || !startTimeStr || !endTimeStr) {
        toast.error('Lütfen geçerli tarih ve saat seçin')
        return
      }
      
      await reservationsService.createReservation({
        classroomId: data.classroomId,
        date: dateStr,
        startTime: startTimeStr,
        endTime: endTimeStr,
        purpose: data.purpose
      })
      
      toast.success('Rezervasyon başarıyla oluşturuldu')
      setCreateDialogOpen(false)
      reset()
      fetchReservations()
      fetchClassrooms()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Rezervasyon oluşturulamadı')
    } finally {
      setCreating(false)
    }
  }

  const handleApprove = async (id) => {
    try {
      setActionLoading(id)
      await reservationsService.approveReservation(id)
      toast.success('Rezervasyon onaylandı')
      fetchReservations()
    } catch (err) {
      toast.error('Onaylama başarısız')
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (id) => {
    try {
      setActionLoading(id)
      await reservationsService.rejectReservation(id, { rejectedReason: 'Admin tarafından reddedildi' })
      toast.success('Rezervasyon reddedildi')
      fetchReservations()
    } catch (err) {
      toast.error('Reddetme başarısız')
    } finally {
      setActionLoading(null)
    }
  }

  const filteredClassrooms = classrooms.filter(room => {
    if (buildingFilter !== 'all' && room.building !== buildingFilter) return false
    if (capacityFilter === 'small' && room.capacity > 50) return false
    if (capacityFilter === 'medium' && (room.capacity <= 50 || room.capacity > 100)) return false
    if (capacityFilter === 'large' && room.capacity <= 100) return false
    return true
  })

  const buildings = [...new Set(classrooms.map(r => r.building))]

  const getStatusChip = (status) => {
    const statusConfig = {
      pending: { color: 'warning', icon: <HourglassEmpty />, label: 'Bekliyor' },
      approved: { color: 'success', icon: <CheckCircle />, label: 'Onaylandı' },
      rejected: { color: 'error', icon: <Cancel />, label: 'Reddedildi' }
    }
    const config = statusConfig[status] || statusConfig.pending
    return <Chip icon={config.icon} label={config.label} color={config.color} size="small" />
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

  return (
    <Layout>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" fontWeight="bold" color="primary">
            Sınıf Rezervasyonları
          </Typography>
          <Box display="flex" gap={2}>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={fetchReservations}
            >
              Yenile
            </Button>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setCreateDialogOpen(true)}
            >
              Yeni Rezervasyon
            </Button>
          </Box>
        </Box>

        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ mb: 3 }}>
          <Tab label="Sınıflar" />
          <Tab label="Rezervasyonlarım" />
          {isAdmin && <Tab label="Tüm Rezervasyonlar (Admin)" />}
        </Tabs>

        {/* Tab 0: Classrooms */}
        {activeTab === 0 && (
          <Card elevation={2}>
            <CardContent>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Bina</InputLabel>
                    <Select
                      value={buildingFilter}
                      onChange={(e) => setBuildingFilter(e.target.value)}
                      label="Bina"
                    >
                      <MenuItem value="all">Tümü</MenuItem>
                      {buildings.map(building => (
                        <MenuItem key={building} value={building}>{building}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Kapasite</InputLabel>
                    <Select
                      value={capacityFilter}
                      onChange={(e) => setCapacityFilter(e.target.value)}
                      label="Kapasite"
                    >
                      <MenuItem value="all">Tümü</MenuItem>
                      <MenuItem value="small">Küçük (≤50)</MenuItem>
                      <MenuItem value="medium">Orta (51-100)</MenuItem>
                      <MenuItem value="large">Büyük (>100)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              {classrooms.length === 0 ? (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  Sınıf bulunamadı. Veritabanında sınıf kaydı olmayabilir. Lütfen admin ile iletişime geçin.
                </Alert>
              ) : filteredClassrooms.length === 0 ? (
                <Alert severity="info">Seçilen filtreye uygun sınıf bulunamadı</Alert>
              ) : (
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Sınıf Adı</TableCell>
                        <TableCell>Bina</TableCell>
                        <TableCell>Kapasite</TableCell>
                        <TableCell>Tür</TableCell>
                        <TableCell>Özellikler</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredClassrooms.map(room => (
                        <TableRow key={room.id}>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={1}>
                              <MeetingRoom color="action" />
                              <Typography variant="body1" fontWeight="bold">
                                {room.roomNumber}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>{room.building}</TableCell>
                          <TableCell>
                            <Chip label={room.capacity} size="small" />
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label="Standart" 
                              size="small" 
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>
                            {(() => {
                              const features = typeof room.featuresJson === 'string' 
                                ? JSON.parse(room.featuresJson) 
                                : room.featuresJson || {}
                              return (
                                <>
                                  {features.projector && <Chip label="Projeksiyon" size="small" sx={{ mr: 0.5 }} />}
                                  {features.computer && <Chip label="Bilgisayar" size="small" sx={{ mr: 0.5 }} />}
                                  {features.whiteboard && <Chip label="Tahta" size="small" sx={{ mr: 0.5 }} />}
                                </>
                              )
                            })()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        )}

        {/* Tab 1 & 2: Reservations */}
        {(activeTab === 1 || activeTab === 2) && (
          <Card elevation={2}>
            <CardContent>
              {reservations.length === 0 ? (
                <Alert severity="info">Rezervasyon bulunmamaktadır</Alert>
              ) : (
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Sınıf</TableCell>
                        <TableCell>Tarih</TableCell>
                        <TableCell>Saat</TableCell>
                        <TableCell>Amaç</TableCell>
                        {isAdmin && activeTab === 2 && <TableCell>Kullanıcı</TableCell>}
                        <TableCell>Durum</TableCell>
                        {isAdmin && activeTab === 2 && <TableCell>İşlemler</TableCell>}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {reservations.map(reservation => (
                        <TableRow key={reservation.id}>
                          <TableCell>
                            <Typography variant="body2" fontWeight="bold">
                              {reservation.classroom?.building} {reservation.classroom?.roomNumber}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Kapasite: {reservation.classroom?.capacity}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {new Date(reservation.date).toLocaleDateString('tr-TR')}
                          </TableCell>
                          <TableCell>
                            {reservation.startTime} - {reservation.endTime}
                          </TableCell>
                          <TableCell>{reservation.purpose}</TableCell>
                          {isAdmin && activeTab === 2 && (
                            <TableCell>{reservation.user?.firstName} {reservation.user?.lastName}</TableCell>
                          )}
                          <TableCell>{getStatusChip(reservation.status)}</TableCell>
                          {isAdmin && activeTab === 2 && (
                            <TableCell>
                              {reservation.status === 'pending' && (
                                <Box display="flex" gap={1}>
                                  <Button
                                    size="small"
                                    variant="contained"
                                    color="success"
                                    onClick={() => handleApprove(reservation.id)}
                                    disabled={actionLoading === reservation.id}
                                  >
                                    {actionLoading === reservation.id ? <CircularProgress size={16} /> : 'Onayla'}
                                  </Button>
                                  <Button
                                    size="small"
                                    variant="contained"
                                    color="error"
                                    onClick={() => handleReject(reservation.id)}
                                    disabled={actionLoading === reservation.id}
                                  >
                                    Reddet
                                  </Button>
                                </Box>
                              )}
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        )}

        {/* Create Reservation Dialog */}
        <Dialog
          open={createDialogOpen}
          onClose={() => !creating && setCreateDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Yeni Sınıf Rezervasyonu</DialogTitle>
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Controller
                    name="classroomId"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth error={!!errors.classroomId}>
                        <InputLabel>Sınıf</InputLabel>
                        <Select {...field} label="Sınıf">
                          {classrooms.map(room => (
                            <MenuItem key={room.id} value={room.id}>
                              {room.building} {room.roomNumber} - Kapasite: {room.capacity}
                            </MenuItem>
                          ))}
                        </Select>
                        {errors.classroomId && (
                          <Typography variant="caption" color="error">
                            {errors.classroomId.message}
                          </Typography>
                        )}
                      </FormControl>
                    )}
                  />
                </Grid>

                <Grid item xs={12}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <Controller
                      name="date"
                      control={control}
                      render={({ field }) => (
                        <DatePicker
                          {...field}
                          label="Tarih"
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              error: !!errors.date,
                              helperText: errors.date?.message
                            }
                          }}
                        />
                      )}
                    />
                  </LocalizationProvider>
                </Grid>

                <Grid item xs={6}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <Controller
                      name="startTime"
                      control={control}
                      render={({ field }) => (
                        <TimePicker
                          {...field}
                          label="Başlangıç"
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              error: !!errors.startTime,
                              helperText: errors.startTime?.message
                            }
                          }}
                        />
                      )}
                    />
                  </LocalizationProvider>
                </Grid>

                <Grid item xs={6}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <Controller
                      name="endTime"
                      control={control}
                      render={({ field }) => (
                        <TimePicker
                          {...field}
                          label="Bitiş"
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              error: !!errors.endTime,
                              helperText: errors.endTime?.message
                            }
                          }}
                        />
                      )}
                    />
                  </LocalizationProvider>
                </Grid>

                <Grid item xs={12}>
                  <Controller
                    name="purpose"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Amaç"
                        multiline
                        rows={3}
                        error={!!errors.purpose}
                        helperText={errors.purpose?.message}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setCreateDialogOpen(false)} disabled={creating}>
                İptal
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={creating}
                startIcon={creating && <CircularProgress size={20} />}
              >
                Rezervasyon Oluştur
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </Container>
    </Layout>
  )
}

export default ClassroomReservations

