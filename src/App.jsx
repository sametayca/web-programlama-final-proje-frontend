import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Box, CircularProgress } from '@mui/material'
import { useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

// Lazy load components
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const ResetPassword = lazy(() => import('./pages/ResetPassword'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Profile = lazy(() => import('./pages/Profile'))
const CourseCatalog = lazy(() => import('./pages/CourseCatalog'))
const CourseDetail = lazy(() => import('./pages/CourseDetail'))
const MyCourses = lazy(() => import('./pages/MyCourses'))
const Grades = lazy(() => import('./pages/Grades'))
const MyAttendance = lazy(() => import('./pages/MyAttendance'))
const StartAttendance = lazy(() => import('./pages/StartAttendance'))
const GiveAttendance = lazy(() => import('./pages/GiveAttendance'))
const Gradebook = lazy(() => import('./pages/Gradebook'))
const AttendanceReport = lazy(() => import('./pages/AttendanceReport'))
const ExcuseRequests = lazy(() => import('./pages/ExcuseRequests'))
const Announcements = lazy(() => import('./pages/Announcements'))
const AnnouncementDetail = lazy(() => import('./pages/AnnouncementDetail'))
const AnnouncementForm = lazy(() => import('./pages/AnnouncementForm'))
const AcademicCalendar = lazy(() => import('./pages/AcademicCalendar'))
const StudentExcuseRequest = lazy(() => import('./pages/StudentExcuseRequest'))
const FacultyCourses = lazy(() => import('./pages/FacultyCourses'))

// Part 3 - Meal System
const MealMenu = lazy(() => import('./pages/meals/MealMenu'))
const MealReservations = lazy(() => import('./pages/meals/MealReservations'))
const MealScan = lazy(() => import('./pages/meals/MealScan'))

// Part 3 - Wallet
const Wallet = lazy(() => import('./pages/wallet/Wallet'))

// Part 3 - Events
const Events = lazy(() => import('./pages/events/Events'))
const EventDetail = lazy(() => import('./pages/events/EventDetail'))
const MyEvents = lazy(() => import('./pages/events/MyEvents'))
const EventCheckIn = lazy(() => import('./pages/events/EventCheckIn'))

// Part 3 - Schedule
const MySchedule = lazy(() => import('./pages/schedule/MySchedule'))
const GenerateSchedule = lazy(() => import('./pages/schedule/GenerateSchedule'))

// Part 3 - Classroom Reservations
const ClassroomReservations = lazy(() => import('./pages/reservations/ClassroomReservations'))

// Loading fallback component
const LoadingFallback = () => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0ea5e9 0%, #14b8a6 100%)'
    }}
  >
    <CircularProgress sx={{ color: 'white' }} size={60} />
  </Box>
)

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #0ea5e9 0%, #14b8a6 100%)'
        }}
      >
        <CircularProgress sx={{ color: 'white' }} />
      </Box>
    )
  }

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/courses"
        element={
          <ProtectedRoute>
            <CourseCatalog />
          </ProtectedRoute>
        }
      />
      <Route
        path="/courses/:id"
        element={
          <ProtectedRoute>
            <CourseDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-courses"
        element={
          <ProtectedRoute>
            <MyCourses />
          </ProtectedRoute>
        }
      />
      <Route
        path="/grades"
        element={
          <ProtectedRoute>
            <Grades />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-attendance"
        element={
          <ProtectedRoute>
            <MyAttendance />
          </ProtectedRoute>
        }
      />
      <Route
        path="/attendance/start"
        element={
          <ProtectedRoute>
            <StartAttendance />
          </ProtectedRoute>
        }
      />
      <Route
        path="/attendance/give/:sessionId"
        element={
          <ProtectedRoute>
            <GiveAttendance />
          </ProtectedRoute>
        }
      />
      <Route
        path="/gradebook/:sectionId"
        element={
          <ProtectedRoute>
            <Gradebook />
          </ProtectedRoute>
        }
      />
      <Route
        path="/attendance/report/:sectionId"
        element={
          <ProtectedRoute>
            <AttendanceReport />
          </ProtectedRoute>
        }
      />
      <Route
        path="/excuse-requests"
        element={
          <ProtectedRoute>
            <ExcuseRequests />
          </ProtectedRoute>
        }
      />
      <Route
        path="/attendance/excuse/:sectionId"
        element={
          <ProtectedRoute>
            <StudentExcuseRequest />
          </ProtectedRoute>
        }
      />
      <Route
        path="/faculty-courses"
        element={
          <ProtectedRoute>
            <FacultyCourses />
          </ProtectedRoute>
        }
      />
      <Route
        path="/announcements"
        element={
          <ProtectedRoute>
            <Announcements />
          </ProtectedRoute>
        }
      />
      <Route
        path="/announcements/new"
        element={
          <ProtectedRoute>
            <AnnouncementForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/announcements/edit/:id"
        element={
          <ProtectedRoute>
            <AnnouncementForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/announcements/:id"
        element={
          <ProtectedRoute>
            <AnnouncementDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/academic-calendar"
        element={
          <ProtectedRoute>
            <AcademicCalendar />
          </ProtectedRoute>
        }
      />

      {/* Part 3 - Meal System Routes */}
      <Route
        path="/meals/menu"
        element={
          <ProtectedRoute>
            <MealMenu />
          </ProtectedRoute>
        }
      />
      <Route
        path="/meals/reservations"
        element={
          <ProtectedRoute requiredRole="student">
            <MealReservations />
          </ProtectedRoute>
        }
      />
      <Route
        path="/meals/scan"
        element={
          <ProtectedRoute requiredRole="staff">
            <MealScan />
          </ProtectedRoute>
        }
      />

      {/* Part 3 - Wallet Route */}
      <Route
        path="/wallet"
        element={
          <ProtectedRoute requiredRole="student">
            <Wallet />
          </ProtectedRoute>
        }
      />

      {/* Part 3 - Event Routes */}
      <Route
        path="/events"
        element={
          <ProtectedRoute>
            <Events />
          </ProtectedRoute>
        }
      />
      <Route
        path="/events/:id"
        element={
          <ProtectedRoute>
            <EventDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-events"
        element={
          <ProtectedRoute>
            <MyEvents />
          </ProtectedRoute>
        }
      />
      <Route
        path="/events/checkin"
        element={
          <ProtectedRoute requiredRole={['staff', 'faculty']}>
            <EventCheckIn />
          </ProtectedRoute>
        }
      />

      {/* Part 3 - Schedule Routes */}
      <Route
        path="/schedule"
        element={
          <ProtectedRoute requiredRole="student">
            <MySchedule />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/scheduling/generate"
        element={
          <ProtectedRoute requiredRole="admin">
            <GenerateSchedule />
          </ProtectedRoute>
        }
      />

      {/* Part 3 - Classroom Reservations Route */}
      <Route
        path="/reservations"
        element={
          <ProtectedRoute>
            <ClassroomReservations />
          </ProtectedRoute>
        }
      />

        <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
      </Routes>
    </Suspense>
  )
}

export default App

