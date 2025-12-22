import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Chip,
  useTheme,
  useMediaQuery,
  Badge
} from '@mui/material'
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  School as SchoolIcon,
  Email as EmailIcon,
  VerifiedUser as VerifiedUserIcon,
  AccountCircle,
  Notifications as NotificationsIcon,
  Book as BookIcon,
  Assignment as AssignmentIcon,
  HowToReg as HowToRegIcon,
  LocationOn as LocationOnIcon,
  Assessment as AssessmentIcon,
  Announcement as AnnouncementIcon,
  CalendarToday as CalendarTodayIcon,
  Restaurant as RestaurantIcon,
  AccountBalanceWallet as WalletIcon,
  Event as EventIcon,
  Schedule as ScheduleIcon,
  MeetingRoom as MeetingRoomIcon
} from '@mui/icons-material'
import { useAuth } from '../context/AuthContext'

const drawerWidth = 280

const Layout = ({ children }) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [mobileOpen, setMobileOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState(null)
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = () => {
    handleMenuClose()
    logout()
  }

  const menuItems = [
    { text: 'Ana Sayfa', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Profil', icon: <PersonIcon />, path: '/profile' },
    { text: 'Duyurular', icon: <AnnouncementIcon />, path: '/announcements' },
    { text: 'Akademik Takvim', icon: <CalendarTodayIcon />, path: '/academic-calendar' },
    // Part 2 - Academic Management
    { text: 'Ders Kataloğu', icon: <BookIcon />, path: '/courses', roles: ['student', 'faculty', 'admin'] },
    { text: 'Derslerim', icon: <SchoolIcon />, path: '/my-courses', roles: ['student'] },
    { text: 'Notlarım', icon: <AssessmentIcon />, path: '/grades', roles: ['student'] },
    { text: 'Devamsızlığım', icon: <LocationOnIcon />, path: '/my-attendance', roles: ['student'] },
    // Faculty only
    { text: 'Derslerim', icon: <SchoolIcon />, path: '/faculty-courses', roles: ['faculty'] },
    { text: 'Yoklama Başlat', icon: <HowToRegIcon />, path: '/attendance/start', roles: ['faculty'] },
    { text: 'Mazeret Talepleri', icon: <AssignmentIcon />, path: '/excuse-requests', roles: ['faculty'] },
    // Part 3 - New Features
    { text: 'Yemek Menüsü', icon: <RestaurantIcon />, path: '/meals/menu', roles: ['student'] },
    { text: 'Cüzdan', icon: <WalletIcon />, path: '/wallet', roles: ['student'] },
    { text: 'Etkinlikler', icon: <EventIcon />, path: '/events' },
    { text: 'Ders Programım', icon: <ScheduleIcon />, path: '/schedule', roles: ['student'] },
    { text: 'Sınıf Rezervasyonu', icon: <MeetingRoomIcon />, path: '/reservations' },
  ].filter(item => {
    // Filter menu items based on user role
    if (!item.roles) return true
    return item.roles.includes(user?.role)
  })

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header with gradient */}
      <Box
        sx={{
          p: 3,
          background: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 50%, #14b8a6 100%)',
          backgroundSize: '200% 200%',
          animation: 'gradient 15s ease infinite',
          color: 'white',
          minHeight: 200,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.2) 0%, transparent 50%)',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 80% 80%, rgba(255,255,255,0.15) 0%, transparent 50%)',
          }
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <Avatar
            src={user?.profilePicture ? `http://localhost:3000/uploads/profile-pictures/${user.profilePicture}` : ''}
            sx={{
              width: 90,
              height: 90,
              mb: 2,
              border: '4px solid rgba(255,255,255,0.3)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'scale(1.1) rotate(5deg)',
                boxShadow: '0 12px 40px rgba(0,0,0,0.3)',
              }
            }}
          >
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </Avatar>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5, textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
            {user?.firstName} {user?.lastName}
          </Typography>
          <Chip
            label={user?.role === 'student' ? 'Öğrenci' : user?.role === 'faculty' ? 'Öğretim Üyesi' : user?.role}
            size="small"
            sx={{
              bgcolor: 'rgba(255,255,255,0.25)',
              color: 'white',
              fontWeight: 600,
              mt: 1,
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.3)'
            }}
          />
          {!user?.isEmailVerified && (
            <Chip
              icon={<EmailIcon sx={{ fontSize: 14, color: 'white' }} />}
              label="Doğrulanmadı"
              size="small"
              sx={{
                bgcolor: 'rgba(255,193,7,0.9)',
                color: 'white',
                fontWeight: 500,
                mt: 1,
                ml: 0.5
              }}
            />
          )}
        </Box>
      </Box>
      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
      <List sx={{ pt: 2, flexGrow: 1, bgcolor: 'rgba(255, 255, 255, 0.02)' }}>
        {menuItems.map((item, index) => {
          const isActive = location.pathname === item.path
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5, px: 1 }}>
              <ListItemButton
                onClick={() => {
                  navigate(item.path)
                  if (isMobile) setMobileOpen(false)
                }}
                sx={{
                  borderRadius: 3,
                  bgcolor: isActive 
                    ? 'linear-gradient(135deg, #0ea5e9 0%, #14b8a6 100%)' 
                    : 'transparent',
                  py: 1.5,
                  px: 2,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: isActive ? 'translateX(8px)' : 'translateX(0)',
                  boxShadow: isActive 
                    ? '0 4px 20px rgba(14, 165, 233, 0.4)' 
                    : 'none',
                  '& .MuiListItemIcon-root': {
                    color: `${isActive ? 'white' : '#000000'} !important`
                  },
                  '& .MuiListItemText-primary': {
                    color: `${isActive ? 'white' : '#000000'} !important`,
                    fontWeight: '700 !important'
                  },
                  '& .MuiTypography-root': {
                    color: `${isActive ? 'white' : '#000000'} !important`,
                    fontWeight: '700 !important'
                  },
                  '&:hover': {
                    bgcolor: isActive 
                      ? 'linear-gradient(135deg, #0284c7 0%, #0d9488 100%)' 
                      : 'rgba(14, 165, 233, 0.12)',
                    transform: 'translateX(8px)',
                    boxShadow: '0 4px 20px rgba(14, 165, 233, 0.25)',
                    '& .MuiListItemIcon-root': {
                      color: `${isActive ? 'white' : '#0ea5e9'} !important`
                    },
                    '& .MuiListItemText-primary': {
                      color: `${isActive ? 'white' : '#0ea5e9'} !important`
                    },
                    '& .MuiTypography-root': {
                      color: `${isActive ? 'white' : '#0ea5e9'} !important`
                    }
                  },
                  '&::before': isActive ? {
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 4,
                    height: '60%',
                    bgcolor: 'white',
                    borderRadius: '0 4px 4px 0',
                  } : {}
                }}
              >
                <ListItemIcon sx={{ color: isActive ? 'white' : '#000000 !important' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  sx={{
                    '& .MuiTypography-root': {
                      color: isActive ? 'white' : '#000000 !important',
                      fontWeight: '700 !important'
                    }
                  }}
                  primaryTypographyProps={{
                    fontWeight: 700,
                    fontSize: '1rem',
                    sx: {
                      color: isActive ? 'white' : '#000000 !important'
                    }
                  }}
                />
              </ListItemButton>
            </ListItem>
          )
        })}
      </List>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          color: 'text.primary',
          boxShadow: '0 1px 20px rgba(0,0,0,0.08)',
          borderBottom: '1px solid rgba(0,0,0,0.05)'
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography 
            variant="h6" 
            noWrap 
            component="div" 
            sx={{ 
              flexGrow: 1, 
              fontWeight: 700,
              background: 'linear-gradient(135deg, #0ea5e9 0%, #14b8a6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            🎓 Akıllı Kampüs Yönetim Platformu
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Badge badgeContent={3} color="error">
              <IconButton sx={{ 
                bgcolor: 'rgba(102, 126, 234, 0.1)',
                '&:hover': { bgcolor: 'rgba(102, 126, 234, 0.2)' }
              }}>
                <NotificationsIcon />
              </IconButton>
            </Badge>
            {user?.isEmailVerified ? (
              <Chip
                icon={<VerifiedUserIcon sx={{ fontSize: 18 }} />}
                label="Doğrulanmış"
                color="success"
                size="small"
                sx={{ fontWeight: 600 }}
              />
            ) : (
              <Chip
                icon={<EmailIcon sx={{ fontSize: 18 }} />}
                label="Doğrulanmamış"
                color="warning"
                size="small"
                sx={{ fontWeight: 600 }}
              />
            )}
            <IconButton 
              onClick={handleMenuOpen} 
              sx={{ 
                p: 0,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.1)'
                }
              }}
            >
              <Avatar
                src={user?.profilePicture ? `http://localhost:3000/uploads/profile-pictures/${user.profilePicture}` : ''}
                sx={{ 
                  width: 42, 
                  height: 42,
                  border: '2px solid',
                  borderColor: 'primary.main',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                }}
              >
                <AccountCircle />
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              PaperProps={{
                sx: {
                  mt: 1.5,
                  borderRadius: 3,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                  minWidth: 180,
                  border: '1px solid rgba(0,0,0,0.05)'
                }
              }}
            >
              <MenuItem 
                onClick={() => { navigate('/profile'); handleMenuClose(); }}
                sx={{ py: 1.5, px: 2 }}
              >
                <ListItemIcon>
                  <PersonIcon fontSize="small" />
                </ListItemIcon>
                Profil
              </MenuItem>
              <Divider />
              <MenuItem 
                onClick={handleLogout}
                sx={{ py: 1.5, px: 2, color: 'error.main' }}
              >
                <ListItemIcon>
                  <LogoutIcon fontSize="small" color="error" />
                </ListItemIcon>
                Çıkış Yap
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              borderRight: 'none',
              boxShadow: '4px 0 24px rgba(0,0,0,0.1)'
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth, 
              borderRight: 'none',
              boxShadow: '4px 0 24px rgba(0,0,0,0.08)',
              background: '#ffffff'
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3, md: 4 },
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: '64px',
          minHeight: 'calc(100vh - 64px)',
          background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.05) 0%, rgba(6, 182, 212, 0.08) 50%, rgba(20, 184, 166, 0.05) 100%)',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 20% 50%, rgba(14, 165, 233, 0.08) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(20, 184, 166, 0.08) 0%, transparent 50%)',
            pointerEvents: 'none'
          }
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          {children}
        </Box>
      </Box>
    </Box>
  )
}

export default Layout
