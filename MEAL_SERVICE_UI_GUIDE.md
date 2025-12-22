# 🍽️ MEAL SERVICE UI - DETAILED GUIDE

## 📦 Enhanced Components

### 1. Menu Page (`/meals/menu`)

**Features:**
- ✅ Date Picker (MUI X Date Pickers)
- ✅ Separate cards for Lunch & Dinner
- ✅ Items JSON parsing and display
- ✅ Nutrition info badges (calories, protein, carbs, fat)
- ✅ Vegan/Vegetarian badges from items
- ✅ Reserve button with modal
- ✅ Cafeteria selection in modal
- ✅ QR code display after successful reservation

**UI Elements:**
```jsx
<LocalizationProvider dateAdapter={AdapterDateFns}>
  <DatePicker
    label="Tarih Seçin"
    value={selectedDate}
    onChange={(newDate) => setSelectedDate(newDate)}
  />
</LocalizationProvider>
```

**Menu Card:**
- Meal type chip (breakfast/lunch/dinner)
- Available capacity chip
- Time range
- Location (cafeteria)
- Items list with vegan/vegetarian badges
- Nutrition chips (calories, protein, carbs, fat)
- Price alert (if applicable)
- Reserve button

**Reservation Flow:**
1. Click "Rezervasyon Yap"
2. Modal opens → Select cafeteria
3. Confirm → API call
4. Success → QR code displayed
5. User can view QR or go to reservations page

---

### 2. My Reservations Page (`/meals/reservations`)

**Features:**
- ✅ Tabs: Upcoming vs Past reservations
- ✅ Full-screen QR code modal
- ✅ Cancel button (with 2-hour rule)
- ✅ Status badges (reserved/used/cancelled)
- ✅ Tooltip for disabled cancel button
- ✅ Auto-filtering by date/time

**Tabs:**
```jsx
<Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
  <Tab label="Gelecek Rezervasyonlar" />
  <Tab label="Geçmiş Rezervasyonlar" />
</Tabs>
```

**Status Badges:**
- **Kullanıldı** (green) - `used: true`
- **İptal Edildi** (red) - `status: 'cancelled'`
- **Rezerve** (blue) - `status: 'confirmed'`

**Cancel Logic:**
```javascript
const canCancel = (reservation) => {
  if (reservation.used || reservation.status === 'cancelled') return false
  
  const mealTime = new Date(`${reservation.menu.date} ${reservation.menu.startTime}`)
  const now = new Date()
  const hoursUntilMeal = (mealTime - now) / (1000 * 60 * 60)
  
  return hoursUntilMeal >= 2  // Must be 2+ hours before meal
}
```

**QR Display:**
- Large size (320px)
- White background with shadow
- Meal info above QR
- Cafeteria info
- Price warning (if applicable)

---

### 3. QR Scanner Page (`/meals/scan`)

**Features:**
- ✅ Camera scanning mode
- ✅ Manual text input mode
- ✅ Two-step process: Validate → Confirm
- ✅ Success/Error feedback
- ✅ Student info display
- ✅ Price deduction alert

**Modes:**
```jsx
<Tabs value={scanMode} onChange={(e, newValue) => setScanMode(newValue)}>
  <Tab icon={<CameraAlt />} label="Kamera" />
  <Tab icon={<TextFields />} label="Manuel Giriş" />
</Tabs>
```

**Flow:**
1. **Scan/Input** → Get QR code
2. **Validate** → `mealService.validateReservation(qrCode)`
3. **Show Info** → Student name, meal type, price
4. **Confirm** → `mealService.useReservation(id, { qrCode })`
5. **Success** → Show confirmation message

**Camera Mode:**
```jsx
<QRScanner onScan={handleScan} />
```

**Manual Mode:**
```jsx
<TextField
  multiline
  rows={4}
  label="QR kod metnini buraya yapıştırın"
  value={manualQR}
  onChange={(e) => setManualQR(e.target.value)}
/>
<Button onClick={handleManualValidate}>Doğrula</Button>
```

**Validation Display:**
- Info card (blue background)
- Student details
- Meal details
- Price warning
- "Confirm Use" button

---

## 🔌 API Service Methods

### `mealService.js`

```javascript
export const mealService = {
  // Get menus by date
  getMenus: (params) => api.get('/v1/meals/menus', { params }),
  
  // Reserve meal
  reserveMeal: (data) => api.post('/v1/meals/reservations', data),
  
  // Get my reservations
  getMyReservations: (params) => api.get('/v1/meals/reservations/my-reservations', { params }),
  
  // Cancel reservation
  cancelReservation: (id) => api.delete(`/v1/meals/reservations/${id}`),
  
  // Validate QR (check if valid)
  validateReservation: (qrCode) => api.get(`/v1/meals/reservations/validate`, { params: { qrCode } }),
  
  // Use meal (confirm)
  useReservation: (id, data) => api.post(`/v1/meals/reservations/${id}/use`, data),
  
  // Get cafeterias
  getCafeterias: () => api.get('/v1/meals/cafeterias')
}
```

---

## 🎨 UI States

### Loading State
```jsx
{loading && (
  <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
    <CircularProgress />
  </Box>
)}
```

### Empty State
```jsx
<Card elevation={2}>
  <CardContent sx={{ py: 8, textAlign: 'center' }}>
    <Restaurant sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
    <Typography variant="h6" color="text.secondary">
      Henüz rezervasyon bulunmamaktadır
    </Typography>
    <Button variant="contained" sx={{ mt: 2 }}>
      Menüyü Görüntüle
    </Button>
  </CardContent>
</Card>
```

### Error State
```jsx
{error && (
  <Alert severity="error" sx={{ mb: 3 }}>
    {error}
  </Alert>
)}
```

### Toast Notifications
```javascript
toast.success('Rezervasyon başarılı!')
toast.error('Rezervasyon yapılamadı')
```

---

## 🎯 Key Features

### Menu Page
1. **Date Picker** - Select any future date
2. **Items Parsing** - JSON → Array → Display with badges
3. **Nutrition Display** - Calories, protein, carbs, fat chips
4. **Vegan/Vegetarian** - Green badges from items JSON
5. **Cafeteria Selection** - Dropdown in modal
6. **QR Generation** - Immediate display after reservation

### Reservations Page
1. **Tab Filtering** - Upcoming vs Past (auto-filtered by date)
2. **Cancel Rules** - 2-hour minimum before meal time
3. **Tooltip Help** - Explains why cancel is disabled
4. **Full QR Display** - Large modal with meal details
5. **Status Tracking** - Visual badges for all states

### Scanner Page
1. **Dual Mode** - Camera or manual text input
2. **Validation Step** - Check before confirming
3. **Student Info** - Name, number, meal type
4. **Price Alert** - Shows deduction amount
5. **Confirmation** - Two-step process for safety

---

## 🔒 Role Guards

### Routes
```jsx
// Students only
<Route path="/meals/menu" element={
  <ProtectedRoute requiredRole="student">
    <MealMenu />
  </ProtectedRoute>
} />

<Route path="/meals/reservations" element={
  <ProtectedRoute requiredRole="student">
    <MealReservations />
  </ProtectedRoute>
} />

// Staff only
<Route path="/meals/scan" element={
  <ProtectedRoute requiredRole="staff">
    <MealScan />
  </ProtectedRoute>
} />
```

---

## 📦 New Packages

```json
{
  "@mui/x-date-pickers": "^latest",
  "date-fns": "^latest"
}
```

**Installation:**
```bash
npm install @mui/x-date-pickers date-fns
```

---

## 🧪 Test Scenarios

### Full Flow Test

**1. Student - Reserve Meal**
```
1. Go to /meals/menu
2. Select tomorrow's date
3. View lunch menu with items
4. Click "Rezervasyon Yap"
5. Select cafeteria
6. Confirm
7. QR code displayed ✅
8. Go to /meals/reservations
9. See reservation in "Upcoming" tab
10. Click "QR Kodu Göster"
11. Full-screen QR displayed ✅
```

**2. Student - Cancel Reservation**
```
1. Go to /meals/reservations
2. Find upcoming reservation
3. Check time (must be 2+ hours before meal)
4. Click cancel button
5. Confirm
6. Reservation cancelled ✅
7. Moves to "Past" tab with cancelled badge
```

**3. Staff - Scan & Validate**
```
1. Go to /meals/scan
2. Choose "Kamera" mode
3. Student shows QR code
4. Camera scans automatically
5. Validation info displayed ✅
6. Shows: student name, meal type, price
7. Click "Yemek Kullanımını Onayla"
8. Success message ✅
9. Price deducted (if applicable)
```

**4. Staff - Manual Entry**
```
1. Go to /meals/scan
2. Choose "Manuel Giriş" mode
3. Student provides QR text
4. Paste into text field
5. Click "Doğrula"
6. Validation info displayed ✅
7. Click "Yemek Kullanımını Onayla"
8. Success ✅
```

---

## ✅ Implementation Checklist

### Menu Page
- [x] Date picker component
- [x] Menu cards with items
- [x] Nutrition badges
- [x] Vegan/vegetarian flags
- [x] Cafeteria selection
- [x] QR code modal
- [x] Loading/error states

### Reservations Page
- [x] Upcoming/Past tabs
- [x] Status badges
- [x] Cancel button with 2h rule
- [x] Tooltip for disabled cancel
- [x] Full-screen QR modal
- [x] Empty states

### Scanner Page
- [x] Camera mode
- [x] Manual mode
- [x] Tabs for mode switching
- [x] Validation step
- [x] Student info display
- [x] Confirmation step
- [x] Success/error feedback

### API Service
- [x] getMenus
- [x] reserveMeal
- [x] getMyReservations
- [x] cancelReservation
- [x] validateReservation
- [x] useReservation
- [x] getCafeterias

---

## 🎉 READY!

**Enhanced Meal Service UI is complete!**

**Features:**
- ✅ Advanced date selection
- ✅ Rich menu display with nutrition
- ✅ Smart reservation management
- ✅ Dual-mode QR scanning
- ✅ Two-step validation
- ✅ Role-based access
- ✅ Comprehensive error handling
- ✅ Toast notifications
- ✅ Loading states
- ✅ Empty states

**Test and enjoy! 🚀**

