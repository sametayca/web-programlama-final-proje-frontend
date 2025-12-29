import { useState, useEffect } from 'react'
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Divider,
  TextField,
  MenuItem,
  Paper
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { tr } from 'date-fns/locale/tr'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { QRCodeSVG } from 'qrcode.react'
import Layout from '../../components/Layout'
import mealService from '../../services/mealService'
import {
  Restaurant,
  AccessTime,
  Place,
  LocalFireDepartment,
  Spa,
  FitnessCenter,
  BookmarkBorder,
  CheckCircle,
} from '@mui/icons-material'

const MealMenu = () => {
  const navigate = useNavigate()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [menus, setMenus] = useState([])
  const [cafeterias, setCafeterias] = useState([])
  const [myReservations, setMyReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Reservation dialog
  const [reserveDialog, setReserveDialog] = useState(false)
  const [selectedMenu, setSelectedMenu] = useState(null)
  const [selectedCafeteria, setSelectedCafeteria] = useState('')
  const [reserving, setReserving] = useState(false)

  // QR Code dialog
  const [qrDialog, setQrDialog] = useState(false)
  const [reservationData, setReservationData] = useState(null)

  useEffect(() => {
    fetchCafeterias().catch(err => {
      console.error('Error fetching cafeterias:', err)
      setError('Kafeteryalar yüklenemedi')
    })
  }, [])

  useEffect(() => {
    // Menus and reservation status need to be refreshed when date changes
    const loadData = async () => {
      setLoading(true)
      try {
        await Promise.all([fetchMenus(), fetchMyReservations()])
      } catch (err) {
        console.error('Error loading data:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [selectedDate])

  const fetchMyReservations = async () => {
    try {
      const response = await mealService.getMyReservations()
      setMyReservations(response.data.data || [])
    } catch (err) {
      console.error('Error fetching reservations:', err)
    }
  }

  const fetchCafeterias = async () => {
    try {
      const response = await mealService.getCafeterias()
      const allCafeterias = response.data.data || []

      // Deduplicate cafeterias by name to avoid dropdown clutter
      const uniqueCafeterias = allCafeterias.filter((caf, index, self) =>
        index === self.findIndex((c) => c.name === caf.name)
      )

      setCafeterias(uniqueCafeterias)
      if (uniqueCafeterias.length > 0) {
        setSelectedCafeteria(uniqueCafeterias[0].id)
      }
    } catch (err) {
      console.error('Cafeterias fetch error:', err)
    }
  }

  const fetchMenus = async () => {
    try {
      setError(null)
      const dateStr = selectedDate.toISOString().split('T')[0]
      const response = await mealService.getMenus({ date: dateStr })
      const allMenus = response.data.data || []

      // Deduplicate menus based on mealType and cafeteria
      // Use a Map to keep unique entries: key = cafeteriaId + mealType
      const uniqueMenus = []
      const seen = new Set()

      allMenus.forEach(menu => {
        const key = `${menu.cafeteria?.id}-${menu.mealType}`
        if (!seen.has(key)) {
          seen.add(key)
          uniqueMenus.push(menu)
        }
      })

      setMenus(uniqueMenus)
    } catch (err) {
      console.error('Error fetching menus:', err)
      setError(err.response?.data?.error || 'Menüler yüklenemedi')
    }
  }

  const handleOpenReserve = (menu) => {
    setSelectedMenu(menu)
    setReserveDialog(true)
  }

  const handleReserve = async () => {
    if (!selectedCafeteria) {
      toast.error('Lütfen kafeterya seçin')
      return
    }

    try {
      setReserving(true)
      const response = await mealService.reserveMeal({
        menuId: selectedMenu.id,
        cafeteriaId: selectedCafeteria
      })

      setReservationData(response.data.data)
      setReserveDialog(false)
      setQrDialog(true)
      toast.success('Rezervasyon başarılı!')

      // Refresh menus and reservations
      fetchMenus()
      fetchMyReservations()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Rezervasyon yapılamadı')
    } finally {
      setReserving(false)
    }
  }

  const getMealTypeLabel = (type) => {
    const types = {
      breakfast: { label: 'Kahvaltı', color: 'warning' },
      lunch: { label: 'Öğle Yemeği', color: 'primary' },
      dinner: { label: 'Akşam Yemeği', color: 'secondary' }
    }
    return types[type] || { label: type, color: 'default' }
  }

  const getMenuItems = (menu) => {
    const items = []
    if (menu.mainCourse) items.push({ name: menu.mainCourse, type: 'main' })
    if (menu.sideDish) items.push({ name: menu.sideDish, type: 'side' })
    if (menu.soup) items.push({ name: menu.soup, type: 'soup' })
    if (menu.salad) items.push({ name: menu.salad, type: 'salad' })
    if (menu.dessert) items.push({ name: menu.dessert, type: 'dessert' })
    return items
  }

  const renderMenuCard = (menu) => {
    const mealType = getMealTypeLabel(menu.mealType)
    const available = (menu.availableCapacity || 0) > 0
    const items = getMenuItems(menu)

    // Check if this menu is already reserved by the user
    // Find the actual reservation object
    const existingReservation = myReservations.find(res => {
      if (res.status === 'cancelled') return false

      // Direct ID match
      if (res.menu?.id === menu.id || res.menuId === menu.id) return true

      // Date + Meal Type match
      const resDate = new Date(res.menu?.menuDate || res.menu?.date || res.reservationDate)
      const currentMenuDate = new Date(menu.date || selectedDate)

      resDate.setHours(0, 0, 0, 0)
      currentMenuDate.setHours(0, 0, 0, 0)

      return resDate.getTime() === currentMenuDate.getTime() &&
        res.menu?.mealType === menu.mealType
    })

    const isReservedHere = existingReservation && (existingReservation.menu?.id === menu.id || existingReservation.menu?.cafeteria?.id === menu.cafeteria?.id)
    const isReservedElsewhere = existingReservation && !isReservedHere
    const reservedCafeteriaName = existingReservation?.menu?.cafeteria?.name || existingReservation?.menu?.cafeteria?.location || 'Başka Kafeterya'

    return (
      <Grid item xs={12} md={6} key={menu.id}>
        <Card
          elevation={3}
          sx={{
            height: '100%',
            opacity: isReservedElsewhere ? 0.6 : ((!available && !isReservedHere) ? 0.7 : 1), // Assuming isFull is !available
            border: isReservedHere ? '2px solid' : (available ? '1px solid' : '1px solid'),
            borderColor: isReservedHere ? 'success.main' : (available ? 'primary.main' : 'grey.300'),
            bgcolor: isReservedElsewhere ? 'action.hover' : 'background.paper'
          }}
        >
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Chip
                label={mealType.label}
                color={mealType.color}
                icon={<Restaurant />}
              />
              <Chip
                label={`${menu.availableCapacity} kişilik`}
                size="small"
                color={available ? 'success' : 'default'}
              />
            </Box>

            {menu.cafeteria && (
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <AccessTime fontSize="small" color="action" />
                <Typography variant="body2">
                  {menu.cafeteria.openingTime || '08:00'} - {menu.cafeteria.closingTime || '20:00'}
                </Typography>
              </Box>
            )}

            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <Place fontSize="small" color="action" />
              <Typography variant="body2">{menu.cafeteria?.name || 'Tüm Kafeteryalar'}</Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Menu Items */}
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom color="primary">
              Menü İçeriği:
            </Typography>
            <List dense>
              {items.map((item, index) => (
                <ListItem key={index} disableGutters>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="body2">• {item.name}</Typography>
                        {item.isVegan && (
                          <Chip label="Vegan" size="small" color="success" icon={<Spa />} />
                        )}
                        {item.isVegetarian && (
                          <Chip label="Vejetaryen" size="small" color="info" icon={<Spa />} />
                        )}
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>


            {menu.price > 0 && (
              <Box mt={2}>
                <Alert severity="info" sx={{ py: 0.5 }}>
                  Ücret: {menu.price} TL (Kullanımda ödenecek)
                </Alert>
              </Box>
            )}

            <Button
              fullWidth
              variant={isReservedHere ? "outlined" : "contained"}
              color={isReservedHere ? "success" : (isReservedElsewhere ? "secondary" : "primary")}
              onClick={() => (isReservedHere || isReservedElsewhere) ? navigate('/meals/reservations') : handleOpenReserve(menu)}
              disabled={(!available && !isReservedHere && !isReservedElsewhere)}
              startIcon={isReservedHere ? <CheckCircle /> : (isReservedElsewhere ? <BookmarkBorder /> : null)}
              sx={{ mt: 2 }}
            >
              {isReservedHere
                ? 'Rezerve Edildi (Görüntüle)'
                : isReservedElsewhere
                  ? `Rezerve: ${reservedCafeteriaName}`
                  : available ? 'Rezervasyon Yap' : 'Kapasite Dolu'}
            </Button>
          </CardContent>
        </Card>
      </Grid>
    )
  }

  // Show loading state only if we haven't loaded anything yet
  if (loading && menus.length === 0 && !error) {
    return (
      <Layout>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
            <CircularProgress />
          </Box>
        </Container>
      </Layout>
    )
  }

  return (
    <Layout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" fontWeight="bold" color="primary">
            Yemek Menüsü
          </Typography>
          <Button
            variant="outlined"
            startIcon={<BookmarkBorder />}
            onClick={() => navigate('/meals/reservations')}
            sx={{ minWidth: 200 }}
          >
            Rezervasyonlarım
          </Button>
        </Box>

        {/* Date Picker */}
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={tr}>
            <DatePicker
              label="Tarih Seçin"
              value={selectedDate}
              onChange={(newDate) => setSelectedDate(newDate)}
              minDate={new Date()}
              sx={{ width: '100%', maxWidth: 300 }}
            />
          </LocalizationProvider>
          <Typography variant="caption" color="text.secondary" display="block" mt={1}>
            Seçilen tarih: {selectedDate.toLocaleDateString('tr-TR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </Typography>
        </Paper>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {menus.length === 0 ? (
          <Card elevation={2}>
            <CardContent sx={{ py: 8, textAlign: 'center' }}>
              <Restaurant sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                Seçilen tarih için menü bulunmamaktadır
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {menus.map(renderMenuCard)}
          </Grid>
        )}

        {/* Reserve Confirmation Dialog */}
        <Dialog open={reserveDialog} onClose={() => setReserveDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Rezervasyon Onayı</DialogTitle>
          <DialogContent>
            {selectedMenu && (
              <>
                <Typography variant="h6" gutterBottom>
                  {getMealTypeLabel(selectedMenu.mealType).label}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {selectedDate.toLocaleDateString('tr-TR')}
                  {selectedMenu.cafeteria && (
                    <> • {selectedMenu.cafeteria.openingTime || '08:00'} - {selectedMenu.cafeteria.closingTime || '20:00'}</>
                  )}
                </Typography>

                <Divider sx={{ my: 2 }} />

                <TextField
                  select
                  fullWidth
                  label="Kafeterya Seçin"
                  value={selectedCafeteria}
                  onChange={(e) => setSelectedCafeteria(e.target.value)}
                  sx={{ mb: 2 }}
                >
                  {cafeterias.map((caf) => (
                    <MenuItem key={caf.id} value={caf.id}>
                      {caf.name} - {caf.location}
                    </MenuItem>
                  ))}
                </TextField>

                {selectedMenu.price > 0 && (
                  <Alert severity="warning">
                    Ücret: {selectedMenu.price} TL (Yemek alırken cüzdanınızdan düşülecek)
                  </Alert>
                )}
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setReserveDialog(false)}>İptal</Button>
            <Button
              variant="contained"
              onClick={handleReserve}
              disabled={reserving || !selectedCafeteria}
            >
              {reserving ? <CircularProgress size={24} /> : 'Rezervasyon Yap'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* QR Code Dialog */}
        <Dialog
          open={qrDialog}
          onClose={() => setQrDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle textAlign="center">Rezervasyon Başarılı!</DialogTitle>
          <DialogContent>
            <Box textAlign="center" p={2}>
              {reservationData && (
                <>
                  <Typography variant="h6" gutterBottom color="success.main">
                    QR Kodunuz
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Bu kodu kafeteryada gösterin
                  </Typography>
                  <Box
                    sx={{
                      p: 3,
                      bgcolor: 'white',
                      borderRadius: 2,
                      mt: 2,
                      display: 'inline-block'
                    }}
                  >
                    <QRCodeSVG
                      value={reservationData.qrCode}
                      size={256}
                      level="H"
                    />
                  </Box>
                  <Alert severity="info" sx={{ mt: 2 }}>
                    Rezervasyonlarım sayfasından da QR kodunuza ulaşabilirsiniz
                  </Alert>
                </>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button variant="contained" onClick={() => setQrDialog(false)}>Tamam</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Layout>
  )
}

export default MealMenu
