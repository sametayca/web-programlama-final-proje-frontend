import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  Chip,
  Button,
  TextField,
  InputAdornment,
  Pagination,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Switch
} from '@mui/material'
import {
  Announcement as AnnouncementIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PushPin as PushPinIcon,
  Person as PersonIcon,
  AccessTime as AccessTimeIcon
} from '@mui/icons-material'
import { announcementService } from '../services/api'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/Layout'
import { toast } from 'react-toastify'

const Announcements = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [targetAudience, setTargetAudience] = useState('')
  const [priority, setPriority] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ totalPages: 1, totalAnnouncements: 0 })
  const [deleteDialog, setDeleteDialog] = useState(false)
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [createDialog, setCreateDialog] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    targetAudience: 'all',
    priority: 'normal',
    isPinned: false,
    expiresAt: ''
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchAnnouncements()
  }, [page, searchTerm, targetAudience, priority])

  const fetchAnnouncements = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = {
        page,
        limit: 10,
        ...(searchTerm && { search: searchTerm }),
        ...(targetAudience && { targetAudience }),
        ...(priority && { priority })
      }
      const response = await announcementService.getAnnouncements(params)
      setAnnouncements(response.data.data.announcements || [])
      setPagination(response.data.data.pagination || { totalPages: 1, totalAnnouncements: 0 })
    } catch (err) {
      setError(err.response?.data?.error || 'Duyurular yüklenirken bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
    setPage(1)
  }

  const handleDelete = (announcement) => {
    setSelectedAnnouncement(announcement)
    setDeleteDialog(true)
  }

  const confirmDelete = async () => {
    setDeleting(true)
    try {
      await announcementService.deleteAnnouncement(selectedAnnouncement.id)
      toast.success('Duyuru başarıyla silindi')
      setDeleteDialog(false)
      setSelectedAnnouncement(null)
      fetchAnnouncements()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Duyuru silinemedi')
    } finally {
      setDeleting(false)
    }
  }

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    })
  }

  const handleCreateAnnouncement = async () => {
    if (!formData.title.trim()) {
      toast.error('Başlık gereklidir')
      return
    }

    if (!formData.content.trim()) {
      toast.error('İçerik gereklidir')
      return
    }

    setSaving(true)
    try {
      const submitData = {
        ...formData,
        expiresAt: formData.expiresAt || null
      }
      await announcementService.createAnnouncement(submitData)
      toast.success('Duyuru başarıyla oluşturuldu')
      setCreateDialog(false)
      setFormData({
        title: '',
        content: '',
        targetAudience: 'all',
        priority: 'normal',
        isPinned: false,
        expiresAt: ''
      })
      fetchAnnouncements()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Duyuru oluşturulamadı')
    } finally {
      setSaving(false)
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

  const canEdit = (announcement) => {
    return user?.role === 'admin' || user?.role === 'faculty' || announcement.authorId === user?.id
  }

  return (
    <Layout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 1 }}>
              <AnnouncementIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Duyurular
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Tüm duyuruları görüntüleyin ve yönetin
            </Typography>
          </Box>
          {(user?.role === 'admin' || user?.role === 'faculty') && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setCreateDialog(true)}
              sx={{
                background: 'linear-gradient(135deg, #0ea5e9 0%, #14b8a6 100%)',
                boxShadow: '0 8px 24px rgba(14, 165, 233, 0.4)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #0284c7 0%, #0d9488 100%)',
                  boxShadow: '0 12px 32px rgba(14, 165, 233, 0.5)',
                }
              }}
            >
              Yeni Duyuru Ekle
            </Button>
          )}
        </Box>

        <Box sx={{ mb: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Duyurularda ara..."
            value={searchTerm}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
            sx={{ flex: 1, minWidth: 200 }}
          />
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Hedef Kitle</InputLabel>
            <Select
              value={targetAudience}
              onChange={(e) => {
                setTargetAudience(e.target.value)
                setPage(1)
              }}
              label="Hedef Kitle"
            >
              <MenuItem value="">Tümü</MenuItem>
              <MenuItem value="all">Herkes</MenuItem>
              <MenuItem value="students">Öğrenciler</MenuItem>
              <MenuItem value="faculty">Öğretim Üyeleri</MenuItem>
              <MenuItem value="staff">Personel</MenuItem>
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Öncelik</InputLabel>
            <Select
              value={priority}
              onChange={(e) => {
                setPriority(e.target.value)
                setPage(1)
              }}
              label="Öncelik"
            >
              <MenuItem value="">Tümü</MenuItem>
              <MenuItem value="urgent">Acil</MenuItem>
              <MenuItem value="high">Yüksek</MenuItem>
              <MenuItem value="normal">Normal</MenuItem>
              <MenuItem value="low">Düşük</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : announcements.length === 0 ? (
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 8 }}>
              <AnnouncementIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Duyuru bulunamadı
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Arama veya filtrelerinizi değiştirmeyi deneyin
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <>
            <Grid container spacing={3}>
              {announcements.map((announcement) => (
                <Grid item xs={12} key={announcement.id}>
                  <Card
                    sx={{
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      border: announcement.isPinned ? '2px solid' : '1px solid',
                      borderColor: announcement.isPinned ? 'primary.main' : 'divider',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 4
                      }
                    }}
                    onClick={() => navigate(`/announcements/${announcement.id}`)}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box sx={{ flex: 1 }}>
                          <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                            {announcement.isPinned && (
                              <Chip
                                icon={<PushPinIcon />}
                                label="Sabitlenmiş"
                                color="primary"
                                size="small"
                                sx={{ fontWeight: 600 }}
                              />
                            )}
                            <Chip
                              label={getPriorityLabel(announcement.priority)}
                              color={getPriorityColor(announcement.priority)}
                              size="small"
                              sx={{ fontWeight: 600 }}
                            />
                            <Chip
                              label={getTargetAudienceLabel(announcement.targetAudience)}
                              size="small"
                              variant="outlined"
                            />
                          </Box>
                          <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, mb: 1 }}>
                            {announcement.title}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              mb: 2,
                              display: '-webkit-box',
                              WebkitLineClamp: 3,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden'
                            }}
                          >
                            {announcement.content}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <PersonIcon fontSize="small" color="action" />
                              <Typography variant="caption" color="text.secondary">
                                {announcement.author?.firstName} {announcement.author?.lastName}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <AccessTimeIcon fontSize="small" color="action" />
                              <Typography variant="caption" color="text.secondary">
                                {formatDate(announcement.createdAt)}
                              </Typography>
                            </Box>
                            {announcement.expiresAt && (
                              <Chip
                                label={`Bitiş: ${formatDate(announcement.expiresAt)}`}
                                size="small"
                                variant="outlined"
                                color="warning"
                              />
                            )}
                          </Box>
                        </Box>
                        {canEdit(announcement) && (
                          <Box sx={{ display: 'flex', gap: 1, ml: 2 }}>
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation()
                                navigate(`/announcements/edit/${announcement.id}`)
                              }}
                              sx={{ color: 'primary.main' }}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDelete(announcement)
                              }}
                              sx={{ color: 'error.main' }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {pagination.totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination
                  count={pagination.totalPages}
                  page={page}
                  onChange={(e, value) => setPage(value)}
                  color="primary"
                  size="large"
                />
              </Box>
            )}
          </>
        )}

        {/* Create Announcement Dialog */}
        <Dialog 
          open={createDialog} 
          onClose={() => setCreateDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Yeni Duyuru Oluştur</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                required
                label="Başlık"
                name="title"
                value={formData.title}
                onChange={handleFormChange}
                placeholder="Duyuru başlığını girin"
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                required
                label="İçerik"
                name="content"
                value={formData.content}
                onChange={handleFormChange}
                multiline
                rows={8}
                placeholder="Duyuru içeriğini girin"
                sx={{ mb: 2 }}
              />
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <FormControl fullWidth>
                  <InputLabel>Hedef Kitle</InputLabel>
                  <Select
                    name="targetAudience"
                    value={formData.targetAudience}
                    onChange={handleFormChange}
                    label="Hedef Kitle"
                  >
                    <MenuItem value="all">Herkes</MenuItem>
                    <MenuItem value="students">Öğrenciler</MenuItem>
                    <MenuItem value="faculty">Öğretim Üyeleri</MenuItem>
                    <MenuItem value="staff">Personel</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel>Öncelik</InputLabel>
                  <Select
                    name="priority"
                    value={formData.priority}
                    onChange={handleFormChange}
                    label="Öncelik"
                  >
                    <MenuItem value="low">Düşük</MenuItem>
                    <MenuItem value="normal">Normal</MenuItem>
                    <MenuItem value="high">Yüksek</MenuItem>
                    <MenuItem value="urgent">Acil</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField
                  fullWidth
                  label="Bitiş Tarihi (İsteğe Bağlı)"
                  name="expiresAt"
                  type="date"
                  value={formData.expiresAt}
                  onChange={handleFormChange}
                  InputLabelProps={{ shrink: true }}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isPinned}
                      onChange={handleFormChange}
                      name="isPinned"
                      color="primary"
                    />
                  }
                  label="Sabitle (Öne Çıkar)"
                />
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateDialog(false)} disabled={saving}>
              İptal
            </Button>
            <Button
              variant="contained"
              onClick={handleCreateAnnouncement}
              disabled={saving}
              sx={{
                background: 'linear-gradient(135deg, #0ea5e9 0%, #14b8a6 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #0284c7 0%, #0d9488 100%)',
                }
              }}
            >
              {saving ? <CircularProgress size={20} /> : 'Oluştur'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
          <DialogTitle>Duyuruyu Sil</DialogTitle>
          <DialogContent>
            <Typography>
              <strong>{selectedAnnouncement?.title}</strong> başlıklı duyuruyu silmek istediğinizden emin misiniz?
            </Typography>
            <Alert severity="warning" sx={{ mt: 2 }}>
              Bu işlem geri alınamaz.
            </Alert>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialog(false)}>İptal</Button>
            <Button
              variant="contained"
              color="error"
              onClick={confirmDelete}
              disabled={deleting}
            >
              {deleting ? <CircularProgress size={20} /> : 'Sil'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Layout>
  )
}

export default Announcements
