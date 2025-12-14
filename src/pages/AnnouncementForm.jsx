import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormControlLabel,
  Switch,
  Grid
} from '@mui/material'
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon
} from '@mui/icons-material'
import { announcementService } from '../services/api'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/Layout'
import { toast } from 'react-toastify'

const AnnouncementForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const isEdit = !!id
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    targetAudience: 'all',
    priority: 'normal',
    isPinned: false,
    expiresAt: ''
  })

  useEffect(() => {
    if (isEdit) {
      fetchAnnouncement()
    }
  }, [id])

  const fetchAnnouncement = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await announcementService.getAnnouncementById(id)
      const announcement = response.data.data
      setFormData({
        title: announcement.title,
        content: announcement.content,
        targetAudience: announcement.targetAudience,
        priority: announcement.priority,
        isPinned: announcement.isPinned,
        expiresAt: announcement.expiresAt ? announcement.expiresAt.split('T')[0] : ''
      })
    } catch (err) {
      setError(err.response?.data?.error || 'Duyuru yüklenirken bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!formData.title.trim()) {
      setError('Başlık gereklidir')
      return
    }

    if (!formData.content.trim()) {
      setError('İçerik gereklidir')
      return
    }

    setSaving(true)
    try {
      const submitData = {
        ...formData,
        expiresAt: formData.expiresAt || null
      }

      if (isEdit) {
        await announcementService.updateAnnouncement(id, submitData)
        toast.success('Duyuru başarıyla güncellendi')
      } else {
        await announcementService.createAnnouncement(submitData)
        toast.success('Duyuru başarıyla oluşturuldu')
      }

      navigate('/announcements')
    } catch (err) {
      setError(err.response?.data?.error || 'Duyuru kaydedilemedi')
      toast.error(err.response?.data?.error || 'Duyuru kaydedilemedi')
    } finally {
      setSaving(false)
    }
  }

  if (user?.role !== 'admin' && user?.role !== 'faculty') {
    return (
      <Layout>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Alert severity="warning">Bu sayfa sadece yöneticiler ve öğretim üyeleri için kullanılabilir</Alert>
        </Container>
      </Layout>
    )
  }

  if (loading) {
    return (
      <Layout>
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
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
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
              {isEdit ? 'Duyuru Düzenle' : 'Yeni Duyuru Oluştur'}
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    required
                    label="Başlık"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Duyuru başlığını girin"
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    required
                    label="İçerik"
                    name="content"
                    value={formData.content}
                    onChange={handleChange}
                    multiline
                    rows={10}
                    placeholder="Duyuru içeriğini girin"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Hedef Kitle</InputLabel>
                    <Select
                      name="targetAudience"
                      value={formData.targetAudience}
                      onChange={handleChange}
                      label="Hedef Kitle"
                    >
                      <MenuItem value="all">Herkes</MenuItem>
                      <MenuItem value="students">Öğrenciler</MenuItem>
                      <MenuItem value="faculty">Öğretim Üyeleri</MenuItem>
                      <MenuItem value="staff">Personel</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Öncelik</InputLabel>
                    <Select
                      name="priority"
                      value={formData.priority}
                      onChange={handleChange}
                      label="Öncelik"
                    >
                      <MenuItem value="low">Düşük</MenuItem>
                      <MenuItem value="normal">Normal</MenuItem>
                      <MenuItem value="high">Yüksek</MenuItem>
                      <MenuItem value="urgent">Acil</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Bitiş Tarihi (İsteğe Bağlı)"
                    name="expiresAt"
                    type="date"
                    value={formData.expiresAt}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.isPinned}
                        onChange={handleChange}
                        name="isPinned"
                        color="primary"
                      />
                    }
                    label="Sabitle (Öne Çıkar)"
                  />
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                    <Button
                      variant="outlined"
                      onClick={() => navigate('/announcements')}
                      disabled={saving}
                    >
                      İptal
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                      disabled={saving}
                      sx={{
                        background: 'linear-gradient(135deg, #0ea5e9 0%, #14b8a6 100%)',
                        boxShadow: '0 8px 24px rgba(14, 165, 233, 0.4)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #0284c7 0%, #0d9488 100%)',
                          boxShadow: '0 12px 32px rgba(14, 165, 233, 0.5)',
                        }
                      }}
                    >
                      {saving ? 'Kaydediliyor...' : isEdit ? 'Güncelle' : 'Oluştur'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Layout>
  )
}

export default AnnouncementForm
