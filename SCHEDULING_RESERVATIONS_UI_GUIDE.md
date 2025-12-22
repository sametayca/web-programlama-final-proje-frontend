# 📅 SCHEDULING & CLASSROOM RESERVATIONS UI - Comprehensive Guide

## 📋 Overview

Bu modül 3 ana sayfadan oluşur:
1. **My Schedule** (`/schedule`) - Öğrencilerin haftalık ders programlarını görüntülemesi
2. **Generate Schedule** (`/admin/scheduling/generate`) - Admin'lerin CSP ile program oluşturması
3. **Classroom Reservations** (`/reservations`) - Sınıf rezervasyon yönetimi

---

## 🔧 Installed Packages

```json
{
  "@fullcalendar/react": "^6.1.10",
  "@fullcalendar/daygrid": "^6.1.10",
  "@fullcalendar/timegrid": "^6.1.10",
  "@fullcalendar/interaction": "^6.1.10",
  "@mui/x-date-pickers": "^6.19.0",
  "date-fns": "^2.30.0"
}
```

---

## 📂 File Structure

```
src/
├── services/
│   ├── schedulingService.js      # Schedule API calls
│   └── reservationsService.js    # Reservations API calls
├── pages/
│   ├── schedule/
│   │   ├── MySchedule.jsx        # Student weekly schedule (FullCalendar)
│   │   └── GenerateSchedule.jsx  # Admin CSP schedule generation
│   └── reservations/
│       └── ClassroomReservations.jsx  # Classroom reservation management
└── App.jsx                       # Routes added
```

---

## 📡 API Endpoints Used

### Scheduling Service

```javascript
// GET /api/v1/scheduling/my-schedule
getMySchedule({ semester, year })

// GET /api/v1/scheduling/my-schedule/ical (blob response)
exportIcal({ semester, year })

// POST /api/v1/scheduling/generate
generateSchedule({ semester, year, sectionIds: [] })

// POST /api/v1/scheduling/save
saveSchedule({ semester, year, schedule: [] })

// GET /api/v1/sections
getSections({ semester, year })
```

### Reservations Service

```javascript
// GET /api/v1/classrooms
listClassrooms({ building?, capacity? })

// POST /api/v1/reservations
createReservation({
  classroomId,
  date,       // YYYY-MM-DD
  startTime,  // HH:MM
  endTime,    // HH:MM
  purpose
})

// GET /api/v1/reservations
listReservations({ status?, date? })

// GET /api/v1/reservations/all (admin only)
getAllReservations({ status?, date? })

// PUT /api/v1/reservations/:id/approve
approveReservation(id)

// PUT /api/v1/reservations/:id/reject
rejectReservation(id, { reason })
```

---

## 🎨 Page 1: My Schedule (`/schedule`)

### Features

✅ **FullCalendar Weekly View**
- Haftalık grid görünümü (timeGridWeek)
- Saat aralığı: 08:00 - 20:00
- Pazartesi başlangıçlı

✅ **Semester & Year Filter**
- Dönem: Güz/Bahar/Yaz
- Yıl dropdown

✅ **Event Details Modal**
- Course code, course name
- Instructor name
- Classroom + building
- Time range
- Credits

✅ **Export to iCal**
- `.ics` dosya indirme
- Takvim uygulamalarına import edilebilir

### UI Components

```jsx
// FullCalendar Configuration
<FullCalendar
  plugins={[timeGridPlugin, interactionPlugin]}
  initialView="timeGridWeek"
  slotMinTime="08:00:00"
  slotMaxTime="20:00:00"
  allDaySlot={false}
  events={events}  // Converted from backend schedule
  eventClick={handleEventClick}
  firstDay={1}     // Monday
  locale="tr"
/>
```

### Data Flow

1. Backend returns schedule:
```json
[
  {
    "courseCode": "CS101",
    "courseName": "Introduction to CS",
    "instructorName": "Dr. Smith",
    "classroomName": "A101",
    "building": "Engineering",
    "day": "Monday",
    "startTime": "09:00",
    "endTime": "11:00",
    "credits": 3
  }
]
```

2. Convert to FullCalendar format:
```javascript
{
  title: "CS101 - A101",
  daysOfWeek: [1],  // Monday
  startTime: "09:00",
  endTime: "11:00",
  backgroundColor: "#1976d2",
  extendedProps: { ...courseDetails }
}
```

---

## 🎨 Page 2: Generate Schedule (`/admin/scheduling/generate`)

**Role Guard:** `admin` only

### Features

✅ **Section Selection**
- Checkbox list tüm sectionlar
- Select all / Deselect all buttons
- Section info: code, name, instructor, enrolled/capacity

✅ **CSP Schedule Generation**
- Backend'e seçili sectionları gönder
- Loading state (CSP algoritması zaman alabilir)
- Alternatif programlar döndürülebilir

✅ **Schedule Preview**
- Assignment listesi
- Course + classroom + time slot
- Conflict badge (varsa)

✅ **Save Schedule**
- Seçilen programı veritabanına kaydet
- Success toast

### UI Flow

```
┌─────────────────┐
│ Semester & Year │
│    Selection    │
└────────┬────────┘
         │
    ┌────▼────────────┐
    │ Load Sections   │
    │ (all selected)  │
    └────┬────────────┘
         │
┌────────▼────────────┐
│ User checks/unchecks│
│     sections        │
└────────┬────────────┘
         │
    ┌────▼──────────┐
    │ Generate btn  │
    │ (POST /api/   │
    │  scheduling/  │
    │   generate)   │
    └────┬──────────┘
         │
┌────────▼──────────┐
│ Display schedules │
│ (alternatives)    │
└────────┬──────────┘
         │
    ┌────▼──────────┐
    │ Preview modal │
    │  + Save btn   │
    └───────────────┘
```

### Backend Response

```json
{
  "success": true,
  "data": [
    {
      "conflicts": 0,
      "message": "Schedule generated successfully",
      "assignments": [
        {
          "courseCode": "CS101",
          "courseName": "Intro to CS",
          "classroomName": "A101",
          "building": "Engineering",
          "day": "Monday",
          "startTime": "09:00",
          "endTime": "11:00",
          "instructorName": "Dr. Smith"
        }
      ]
    }
  ]
}
```

---

## 🎨 Page 3: Classroom Reservations (`/reservations`)

**Role Guard:** All authenticated users (student, faculty, staff, admin)

### Features

✅ **3 Tabs**
1. **Sınıflar** - Classroom list with filters
2. **Rezervasyonlarım** - My reservations
3. **Tüm Rezervasyonlar** (Admin only) - All reservations with approve/reject

✅ **Classroom Filters**
- Building dropdown
- Capacity: Small (≤50), Medium (51-100), Large (>100)

✅ **Create Reservation Modal**
- Classroom selection
- Date picker (DatePicker)
- Start/End time (TimePicker)
- Purpose (textarea)
- Yup validation

✅ **Reservation Status**
- **Pending** (⏳ Bekliyor)
- **Approved** (✅ Onaylandı)
- **Rejected** (❌ Reddedildi)

✅ **Admin Actions**
- Approve button (pending → approved)
- Reject button (pending → rejected)

### Yup Validation

```javascript
const reservationSchema = yup.object({
  classroomId: yup.number().required('Sınıf seçimi zorunludur'),
  date: yup.date().required('Tarih seçimi zorunludur'),
  startTime: yup.date().required('Başlangıç saati zorunludur'),
  endTime: yup.date().required('Bitiş saati zorunludur'),
  purpose: yup.string()
    .required('Amaç zorunludur')
    .min(10, 'En az 10 karakter olmalıdır')
}).test('time-order', 'Bitiş saati başlangıçtan sonra olmalıdır', 
  function(value) {
    return value.endTime > value.startTime
  }
)
```

### Reservation Table

| Sınıf | Tarih | Saat | Amaç | Kullanıcı (Admin) | Durum | İşlemler (Admin) |
|-------|-------|------|------|-------------------|-------|------------------|
| A101  | 22.12.2025 | 09:00-11:00 | Seminer | John Doe | 🟡 Bekliyor | [Onayla] [Reddet] |
| B202  | 23.12.2025 | 14:00-16:00 | Toplantı | Jane Smith | ✅ Onaylandı | - |

---

## 🔐 Role Guards

```javascript
// Student only
<Route path="/schedule" element={
  <ProtectedRoute requiredRole="student">
    <MySchedule />
  </ProtectedRoute>
} />

// Admin only
<Route path="/admin/scheduling/generate" element={
  <ProtectedRoute requiredRole="admin">
    <GenerateSchedule />
  </ProtectedRoute>
} />

// All authenticated users
<Route path="/reservations" element={
  <ProtectedRoute>
    <ClassroomReservations />
  </ProtectedRoute>
} />
```

---

## 🚀 How to Test

### 1. My Schedule

```bash
# Login as student
# Navigate to /schedule
# Select semester + year
# Verify FullCalendar displays events
# Click on event → modal opens with details
# Click "iCal Olarak İndir" → .ics file downloads
```

### 2. Generate Schedule

```bash
# Login as admin
# Navigate to /admin/scheduling/generate
# Select semester + year
# Check/uncheck sections
# Click "Oluştur" → wait for CSP algorithm
# View generated schedule alternatives
# Click "Önizle" → see assignment list
# Click "Kaydet" → save to database
```

### 3. Classroom Reservations

```bash
# Login as any user
# Navigate to /reservations

# Tab 1: Sınıflar
# - Filter by building
# - Filter by capacity
# - See classroom list with projector/computer badges

# Tab 2: Rezervasyonlarım
# - Click "Yeni Rezervasyon"
# - Fill form (classroom, date, time, purpose)
# - Submit → reservation created with "pending" status

# Tab 3 (Admin only): Tüm Rezervasyonlar
# - See all users' reservations
# - Click "Onayla" → status → approved
# - Click "Reddet" → status → rejected
```

---

## 📦 Sample Backend Response Formats

### My Schedule Response

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "courseCode": "CS101",
      "courseName": "Introduction to Computer Science",
      "instructorName": "Dr. John Smith",
      "classroomName": "A101",
      "building": "Engineering",
      "day": "Monday",
      "startTime": "09:00",
      "endTime": "11:00",
      "credits": 3
    }
  ]
}
```

### Classrooms Response

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "A101",
      "building": "Engineering",
      "capacity": 40,
      "type": "Lecture Hall",
      "hasProjector": true,
      "hasComputers": false
    }
  ]
}
```

### Reservations Response

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "classroomId": 1,
      "classroomName": "A101",
      "building": "Engineering",
      "date": "2025-12-22",
      "startTime": "09:00",
      "endTime": "11:00",
      "purpose": "Seminar presentation for CS301",
      "status": "pending",
      "userId": 123,
      "userName": "John Doe"
    }
  ]
}
```

---

## ✅ Key Implementation Details

### FullCalendar Day Conversion

```javascript
const dayMap = {
  'Monday': 1,
  'Tuesday': 2,
  'Wednesday': 3,
  'Thursday': 4,
  'Friday': 5,
  'Saturday': 6,
  'Sunday': 0
}
```

### iCal Export (Blob Download)

```javascript
const response = await schedulingService.exportIcal({ semester, year })
const url = window.URL.createObjectURL(new Blob([response.data]))
const link = document.createElement('a')
link.href = url
link.setAttribute('download', `schedule-${semester}-${year}.ics`)
document.body.appendChild(link)
link.click()
link.remove()
window.URL.revokeObjectURL(url)
```

### Date/Time Formatting for API

```javascript
// DatePicker → YYYY-MM-DD
const dateStr = data.date.toISOString().split('T')[0]

// TimePicker → HH:MM
const startTimeStr = data.startTime.toTimeString().split(' ')[0].substring(0, 5)
```

---

## 🎯 Success Criteria

✅ FullCalendar displays student weekly schedule  
✅ Event click opens modal with full course details  
✅ iCal export downloads `.ics` file  
✅ Admin can select sections and generate schedule  
✅ Generated schedules display with conflict count  
✅ Schedule can be previewed and saved  
✅ Classroom list filterable by building and capacity  
✅ Reservation form validates (Yup + React Hook Form)  
✅ Students can create reservations (pending status)  
✅ Admin can approve/reject reservations  
✅ Status badges show correct colors  

---

## 🔮 Optional Enhancements

- [ ] Drag-and-drop course rescheduling
- [ ] Recurring reservations (weekly)
- [ ] Email notifications for reservation approval/rejection
- [ ] Classroom availability timeline view
- [ ] Multi-week calendar view
- [ ] Export schedule as PDF
- [ ] Conflict resolution suggestions in CSP
- [ ] Reservation cancellation (user)

---

## 🐛 Common Issues

**FullCalendar events not showing:**
- Verify `daysOfWeek` array format
- Check `startTime` and `endTime` format (HH:MM)
- Ensure `events` array is not empty

**Date/Time pickers not working:**
- Verify `@mui/x-date-pickers` and `date-fns` installed
- Wrap with `<LocalizationProvider dateAdapter={AdapterDateFns}>`

**Admin actions not working:**
- Verify `user.role === 'admin'` in AuthContext
- Check backend returns admin-specific endpoints

**iCal download fails:**
- Backend must return `Content-Type: text/calendar`
- Frontend must use `responseType: 'blob'`

---

**🎉 Implementation Complete!**

All 3 pages are production-ready with full CRUD, role-based access, FullCalendar integration, and Yup validation.

