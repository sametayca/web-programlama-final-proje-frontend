import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Chip,
  Button,
  Divider,
  Avatar
} from '@mui/material'
import {
  ArrowBack as ArrowBackIcon,
  PushPin as PushPinIcon,
  Person as PersonIcon,
  AccessTime as AccessTimeIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material'
import { announcementService } from '../services/api'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/Layout'
import { toast } from 'react-toastify'

// API base URL'ini al
const getBaseUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
  return apiUrl.replace(/\/api\/?$/, '')
}

const AnnouncementDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [announcement, setAnnouncement] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchAnnouncement()
  }, [id])

  const fetchAnnouncement = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await announcementService.getAnnouncementById(id)
      setAnnouncement(response.data.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Duyuru yüklenirken bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'error'
      case 'high': return 'warning'
      case 'normal': return 'info'
      case 'low': return 'default'
      default: return 'default'
    }
  }

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 'urgent': return 'Acil'
      case 'high': return 'Yüksek'
      case 'normal': return 'Normal'
      case 'low': return 'Düşük'
      default: return priority
    }
  }

  const getTargetAudienceLabel = (audience) => {
    switch (audience) {
      case 'all': return 'Herkes'
      case 'students': return 'Öğrenciler'
      case 'faculty': return 'Öğretim Üyeleri'
      case 'staff': return 'Personel'
      default: return audience
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const canEdit = () => {
    if (!announcement || !user) return false
    return user.role === 'admin' || user.role === 'faculty' || announcement.authorId === user.id
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

  if (error || !announcement) {
    return (
      <Layout>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Alert severity="error">{error || 'Duyuru bulunamadı'}</Alert>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/announcements')}
            sx={{ mt: 2 }}
          >
            Duyurulara Dön
          </Button>
        </Container>
      </Layout>
    )
  }

  return (
    <Layout>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/announcements')}
          sx={{ mb: 3 }}
        >
          Duyurulara Dön
        </Button>

        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                  {announcement.isPinned && (
                    <Chip
                      icon={<PushPinIcon />}
                      label="Sabitlenmiş"
                      color="primary"
                      sx={{ fontWeight: 600 }}
                    />
                  )}
                  <Chip
                    label={getPriorityLabel(announcement.priority)}
                    color={getPriorityColor(announcement.priority)}
                    sx={{ fontWeight: 600 }}
                  />
                  <Chip
                    label={getTargetAudienceLabel(announcement.targetAudience)}
                    variant="outlined"
                  />
                </Box>
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
                  {announcement.title}
                </Typography>
              </Box>
              {canEdit() && (
                <Box sx={{ display: 'flex', gap: 1, ml: 2 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={() => navigate(`/announcements/edit/${announcement.id}`)}
                  >
                    Düzenle
                  </Button>
                </Box>
              )}
            </Box>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ mb: 3 }}>
              <Typography
                variant="body1"
                sx={{
                  whiteSpace: 'pre-wrap',
                  lineHeight: 1.8,
                  fontSize: '1.1rem'
                }}
              >
                {announcement.content}
              </Typography>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar
                  src={announcement.author?.profilePicture ? `${getBaseUrl()}/uploads/profile-pictures/${announcement.author.profilePicture}` : ''}
                  sx={{ width: 40, height: 40 }}
                >
                  {announcement.author?.firstName?.[0]}{announcement.author?.lastName?.[0]}
                </Avatar>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {announcement.author?.firstName} {announcement.author?.lastName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {announcement.author?.email}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <AccessTimeIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  Yayınlanma: {formatDate(announcement.createdAt)}
                </Typography>
              </Box>
              {announcement.updatedAt !== announcement.createdAt && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <AccessTimeIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    Güncelleme: {formatDate(announcement.updatedAt)}
                  </Typography>
                </Box>
              )}
              {announcement.expiresAt && (
                <Chip
                  label={`Bitiş: ${formatDate(announcement.expiresAt)}`}
                  color="warning"
                  variant="outlined"
                />
              )}
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Layout>
  )
}

export default AnnouncementDetail
