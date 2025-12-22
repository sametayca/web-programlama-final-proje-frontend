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
  FitnessCenter
} from '@mui/icons-material'

const MealMenu = () => {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [menus, setMenus] = useState([])
  const [cafeterias, setCafeterias] = useState([])
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
    fetchCafeterias()
  }, [])

  useEffect(() => {
    fetchMenus()
  }, [selectedDate])

  const fetchCafeterias = async () => {
    try {
      const response = await mealService.getCafeterias()
      setCafeterias(response.data.data || [])
      if (response.data.data?.length > 0) {
        setSelectedCafeteria(response.data.data[0].id)
      }
    } catch (err) {
      console.error('Cafeterias fetch error:', err)
    }
  }

  const fetchMenus = async () => {
    try {
      setLoading(true)
      setError(null)
      const dateStr = selectedDate.toISOString().split('T')[0]
      const response = await mealService.getMenus({ date: dateStr, available: true })
      setMenus(response.data.data || [])
    } catch (err) {
      setError(err.response?.data?.error || 'Menüler yüklenemedi')
    } finally {
      setLoading(false)
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
      
      // Refresh menus
      fetchMenus()
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

  const parseItemsJson = (itemsJson) => {
    try {
      if (typeof itemsJson === 'string') {
        return JSON.parse(itemsJson)
      }
      return itemsJson || []
    } catch {
      return []
    }
  }

  const parseNutritionJson = (nutritionJson) => {
    try {
      if (typeof nutritionJson === 'string') {
        return JSON.parse(nutritionJson)
      }
      return nutritionJson || {}
    } catch {
      return {}
    }
  }

  const renderMenuCard = (menu) => {
    const mealType = getMealTypeLabel(menu.mealType)
    const available = menu.availableCapacity > 0
    const items = parseItemsJson(menu.itemsJson)
    const nutrition = parseNutritionJson(menu.nutritionJson)
    
    return (
      <Grid item xs={12} md={6} key={menu.id}>
        <Card 
          elevation={3}
          sx={{ 
            height: '100%',
            opacity: available ? 1 : 0.7,
            border: available ? '2px solid' : '1px solid',
            borderColor: available ? 'primary.main' : 'grey.300'
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

            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <AccessTime fontSize="small" color="action" />
              <Typography variant="body2">
                {menu.startTime} - {menu.endTime}
              </Typography>
            </Box>

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

            {/* Nutrition Info */}
            {Object.keys(nutrition).length > 0 && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom color="primary">
                  Besin Değerleri:
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {nutrition.calories && (
                    <Chip 
                      icon={<LocalFireDepartment />}
                      label={`${nutrition.calories} kcal`}
                      size="small"
                      variant="outlined"
                    />
                  )}
                  {nutrition.protein && (
                    <Chip 
                      icon={<FitnessCenter />}
                      label={`${nutrition.protein}g protein`}
                      size="small"
                      variant="outlined"
                    />
                  )}
                  {nutrition.carbs && (
                    <Chip 
                      label={`${nutrition.carbs}g karb`}
                      size="small"
                      variant="outlined"
                    />
                  )}
                  {nutrition.fat && (
                    <Chip 
                      label={`${nutrition.fat}g yağ`}
                      size="small"
                      variant="outlined"
                    />
                  )}
                </Box>
              </>
            )}

            {menu.price > 0 && (
              <Box mt={2}>
                <Alert severity="info" sx={{ py: 0.5 }}>
                  Ücret: {menu.price} TL (Kullanımda ödenecek)
                </Alert>
              </Box>
            )}

            <Button
              fullWidth
              variant="contained"
              onClick={() => handleOpenReserve(menu)}
              disabled={!available}
              sx={{ mt: 2 }}
            >
              {available ? 'Rezervasyon Yap' : 'Kapasite Dolu'}
            </Button>
          </CardContent>
        </Card>
      </Grid>
    )
  }

  if (loading && menus.length === 0) {
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
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight="bold" color="primary">
          Yemek Menüsü
        </Typography>

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
                  {selectedDate.toLocaleDateString('tr-TR')} • {selectedMenu.startTime} - {selectedMenu.endTime}
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
                      {caf.name} - {caf.building}
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
