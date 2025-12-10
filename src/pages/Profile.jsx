import { useState, useEffect } from 'react'
import {
  Box,
  Grid,
  Paper,
  TextField,
  Button,
  Typography,
  Avatar,
  Card,
  CardContent,
  Divider,
  Stack,
  Chip,
  CircularProgress,
  IconButton,
  LinearProgress
} from '@mui/material'
import {
  PhotoCamera as PhotoCameraIcon,
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Person as PersonIcon,
  VerifiedUser as VerifiedUserIcon,
  School as SchoolIcon
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authService } from '../services/api'
import { toast } from 'react-toastify'
import Layout from '../components/Layout'

const Profile = () => {
  const { user, updateUser } = useAuth()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: ''
  })
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [profile, setProfile] = useState(null)
  const [profileLoading, setProfileLoading] = useState(true)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const response = await authService.getProfile()
      const profileData = response.data.data
      setProfile(profileData)
      setFormData({
        firstName: profileData.firstName || '',
        lastName: profileData.lastName || '',
        phone: profileData.phone || ''
      })
    } catch (error) {
      console.error('Profile load error:', error)
      toast.error('Profil yüklenirken bir hata oluştu')
    } finally {
      setProfileLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await authService.updateProfile(formData)
      const updatedUser = response.data.data
      
      // Reload profile to get complete updated data with relationships
      await loadProfile()
      
      // Update user context with complete profile data
      if (updatedUser && user) {
        updateUser({
          ...user,
          ...updatedUser,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          phone: updatedUser.phone
        })
      }
      
      toast.success('Profil başarıyla güncellendi!')
    } catch (error) {
      console.error('Profile update error:', error)
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Profil güncellenemedi'
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Sadece JPEG, PNG veya GIF formatında dosyalar yüklenebilir')
      e.target.value = '' // Reset input
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Dosya boyutu 5MB\'dan küçük olmalıdır')
      e.target.value = '' // Reset input
      return
    }

    setUploading(true)
    const uploadFormData = new FormData()
    uploadFormData.append('picture', file)

    try {
      const response = await authService.uploadProfilePicture(uploadFormData)
      const profilePictureFilename = response.data.data?.profilePicture
      
      // Reload profile to get updated data
      const profileResponse = await authService.getProfile()
      const updatedProfile = profileResponse.data.data
      
      // Update local state
      setProfile(updatedProfile)
      
      // Update user context with complete updated profile data
      if (updatedProfile && user) {
        updateUser({
          ...user,
          ...updatedProfile,
          profilePicture: profilePictureFilename || updatedProfile.profilePicture
        })
      }
      
      toast.success('Profil fotoğrafı başarıyla güncellendi!')
    } catch (error) {
      console.error('Upload error:', error)
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Fotoğraf yüklenemedi'
      toast.error(errorMessage)
    } finally {
      setUploading(false)
      // Reset file input
      e.target.value = ''
    }
  }

  const getRoleText = (role) => {
    const roles = {
      student: 'Öğrenci',
      faculty: 'Öğretim Üyesi',
      admin: 'Yönetici',
      staff: 'Personel'
    }
    return roles[role] || role
  }

  if (profileLoading) {
    return (
      <Layout>
        <LinearProgress />
      </Layout>
    )
  }

  return (
    <Layout>
      <Box>
        {/* Header */}
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => navigate('/dashboard')} sx={{ bgcolor: 'background.paper' }}>
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
              Profil Ayarları
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Profil bilgilerinizi görüntüleyin ve düzenleyin
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={3}>
          {/* Profile Picture & Info Card */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 3 }}>
                  <Box sx={{ position: 'relative', mb: 3 }}>
                    <Avatar
                      src={profile?.profilePicture ? `http://localhost:3000/uploads/profile-pictures/${profile.profilePicture}` : ''}
                      sx={{
                        width: 150,
                        height: 150,
                        border: '4px solid',
                        borderColor: 'primary.light',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
                      }}
                    >
                      {profile?.firstName?.[0]}{profile?.lastName?.[0]}
                    </Avatar>
                    <input
                      accept="image/*"
                      style={{ display: 'none' }}
                      id="profile-picture-upload"
                      type="file"
                      onChange={handleFileChange}
                      disabled={uploading}
                    />
                    <label htmlFor="profile-picture-upload">
                      <IconButton
                        component="span"
                        disabled={uploading}
                        sx={{
                          position: 'absolute',
                          bottom: 0,
                          right: 0,
                          bgcolor: 'primary.main',
                          color: 'white',
                          '&:hover': {
                            bgcolor: 'primary.dark'
                          }
                        }}
                      >
                        {uploading ? <CircularProgress size={24} color="inherit" /> : <PhotoCameraIcon />}
                      </IconButton>
                    </label>
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, textAlign: 'center' }}>
                    {profile?.firstName} {profile?.lastName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, textAlign: 'center' }}>
                    {profile?.email}
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mb: 3, flexWrap: 'wrap', justifyContent: 'center', gap: 1 }}>
                    <Chip
                      label={getRoleText(profile?.role)}
                      color="primary"
                      icon={<SchoolIcon />}
                      sx={{ fontWeight: 600 }}
                    />
                    {profile?.isEmailVerified ? (
                      <Chip
                        icon={<VerifiedUserIcon />}
                        label="Doğrulanmış"
                        color="success"
                        size="small"
                      />
                    ) : (
                      <Chip
                        icon={<EmailIcon />}
                        label="Doğrulanmamış"
                        color="warning"
                        size="small"
                      />
                    )}
                  </Stack>
                </Box>
              </CardContent>
            </Card>

            {/* Additional Info Card */}
            {(profile?.studentProfile || profile?.facultyProfile) && (
              <Card sx={{ mt: 3 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Ek Bilgiler
                  </Typography>
                  {profile?.studentProfile && (
                    <Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Öğrenci Numarası
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                        {profile.studentProfile.studentNumber}
                      </Typography>
                      {profile.studentProfile.department && (
                        <>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Bölüm
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {profile.studentProfile.department.name} ({profile.studentProfile.department.code})
                          </Typography>
                        </>
                      )}
                    </Box>
                  )}
                  {profile?.facultyProfile && (
                    <Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Personel Numarası
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                        {profile.facultyProfile.employeeNumber}
                      </Typography>
                      {profile.facultyProfile.department && (
                        <>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Bölüm
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {profile.facultyProfile.department.name} ({profile.facultyProfile.department.code})
                          </Typography>
                        </>
                      )}
                    </Box>
                  )}
                </CardContent>
              </Card>
            )}
          </Grid>

          {/* Edit Form */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Kişisel Bilgiler
                </Typography>
                <Box component="form" onSubmit={handleSubmit}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        required
                        id="firstName"
                        label="Ad"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        InputProps={{
                          startAdornment: <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        required
                        id="lastName"
                        label="Soyad"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        InputProps={{
                          startAdornment: <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        id="email"
                        label="E-posta"
                        value={profile?.email || ''}
                        disabled
                        InputProps={{
                          startAdornment: <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
                        }}
                        helperText="E-posta adresi değiştirilemez"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        id="phone"
                        label="Telefon Numarası"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        InputProps={{
                          startAdornment: <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Divider sx={{ my: 2 }} />
                      <Stack direction="row" spacing={2} justifyContent="flex-end">
                        <Button
                          variant="outlined"
                          onClick={() => navigate('/dashboard')}
                          disabled={loading}
                        >
                          İptal
                        </Button>
                        <Button
                          type="submit"
                          variant="contained"
                          startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                          disabled={loading}
                        >
                          {loading ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                        </Button>
                      </Stack>
                    </Grid>
                  </Grid>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Layout>
  )
}

export default Profile
