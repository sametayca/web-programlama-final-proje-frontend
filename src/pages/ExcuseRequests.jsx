import { useEffect, useState } from 'react'
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tabs,
  Tab
} from '@mui/material'
import {
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Visibility as VisibilityIcon,
  Download as DownloadIcon
} from '@mui/icons-material'
import { attendanceService } from '../services/api'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/Layout'
import { toast } from 'react-toastify'

const ExcuseRequests = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [requests, setRequests] = useState([])
  const [error, setError] = useState(null)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [reviewDialog, setReviewDialog] = useState(false)
  const [reviewNotes, setReviewNotes] = useState('')
  const [reviewAction, setReviewAction] = useState(null)
  const [tabValue, setTabValue] = useState(0)

  useEffect(() => {
    if (user?.role === 'faculty' || user?.role === 'admin') {
      fetchRequests()
    } else {
      setError('Bu sayfa sadece öğretim üyeleri için kullanılabilir')
      setLoading(false)
    }
  }, [user])

  const fetchRequests = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await attendanceService.getExcuseRequests()
      setRequests(response.data.data || [])
    } catch (err) {
      console.error('Error fetching excuse requests:', err)
      setError(err.response?.data?.error || 'Mazeret talepleri yüklenirken bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleReview = (request, action) => {
    setSelectedRequest(request)
    setReviewAction(action)
    setReviewNotes('')
    setReviewDialog(true)
  }

  const handleSubmitReview = async () => {
    try {
      if (!selectedRequest) return

      if (reviewAction === 'approve') {
        await attendanceService.approveExcuseRequest(selectedRequest.id, {
          notes: reviewNotes
        })
        toast.success('Mazeret talebi başarıyla onaylandı')
      } else if (reviewAction === 'reject') {
        await attendanceService.rejectExcuseRequest(selectedRequest.id, {
          notes: reviewNotes
        })
        toast.success('Mazeret talebi reddedildi')
      }

      setReviewDialog(false)
      setSelectedRequest(null)
      setReviewNotes('')
      fetchRequests()
    } catch (err) {
      console.error('Error reviewing request:', err)
      toast.error(err.response?.data?.error || 'Talep incelenemedi')
    }
  }

  const filteredRequests = () => {
    if (tabValue === 0) {
      return requests.filter(req => req.status === 'pending')
    } else if (tabValue === 1) {
      return requests.filter(req => req.status === 'approved')
    } else {
      return requests.filter(req => req.status === 'rejected')
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'success'
      case 'rejected': return 'error'
      case 'pending': return 'warning'
      default: return 'default'
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (user?.role !== 'faculty' && user?.role !== 'admin') {
    return (
      <Layout>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Alert severity="warning">Bu sayfa sadece öğretim üyeleri için kullanılabilir</Alert>
        </Container>
      </Layout>
    )
  }

  if (loading) {
    return (
      <Layout>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
            <CircularProgress />
          </Box>
        </Container>
      </Layout>
    )
  }

  return (
    <Layout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <Box display="flex" alignItems="center" mb={3}>
          <AssignmentIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
          <Box>
            <Typography variant="h4" component="h1" fontWeight="bold">
              Mazeret Talepleri
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Öğrenci mazeret taleplerini inceleyin ve yönetin
            </Typography>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Tabs */}
        <Card sx={{ mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={(e, newValue) => setTabValue(newValue)}
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label={`Bekleyen (${requests.filter(r => r.status === 'pending').length})`} />
            <Tab label={`Onaylanan (${requests.filter(r => r.status === 'approved').length})`} />
            <Tab label={`Reddedilen (${requests.filter(r => r.status === 'rejected').length})`} />
          </Tabs>
        </Card>

        {/* Requests Table */}
        <Card>
          <CardContent>
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'primary.light' }}>
                    <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Öğrenci</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Ders</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Devamsızlık Tarihi</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Sebep</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Durum</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Belge</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>İşlemler</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredRequests().length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary">
                          No {tabValue === 0 ? 'pending' : tabValue === 1 ? 'approved' : 'rejected'} excuse requests
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRequests().map((request) => (
                      <TableRow key={request.id} hover>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" fontWeight="bold">
                              {request.student?.firstName} {request.student?.lastName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {request.student?.email}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          {request.session?.section?.course?.code || 'N/A'}
                        </TableCell>
                        <TableCell>
                          {request.session?.date ? formatDate(request.session.date) : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ maxWidth: 200 }}>
                            {request.reason || 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={request.status}
                            color={getStatusColor(request.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {request.documentUrl ? (
                            <Button
                              size="small"
                              startIcon={<VisibilityIcon />}
                              onClick={() => window.open(request.documentUrl, '_blank')}
                            >
                              Görüntüle
                            </Button>
                          ) : (
                            <Typography variant="body2" color="text.secondary">-</Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          {request.status === 'pending' ? (
                            <Box display="flex" gap={1}>
                              <Button
                                size="small"
                                variant="contained"
                                color="success"
                                startIcon={<CheckCircleIcon />}
                                onClick={() => handleReview(request, 'approve')}
                              >
                                Onayla
                              </Button>
                              <Button
                                size="small"
                                variant="contained"
                                color="error"
                                startIcon={<CancelIcon />}
                                onClick={() => handleReview(request, 'reject')}
                              >
                                Reddet
                              </Button>
                            </Box>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              İnceleyen: {request.reviewedBy?.firstName} {request.reviewedBy?.lastName}
                            </Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Review Dialog */}
        <Dialog
          open={reviewDialog}
          onClose={() => setReviewDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            {reviewAction === 'approve' ? 'Onayla' : 'Reddet'} Mazeret Talebi
          </DialogTitle>
          <DialogContent>
            {selectedRequest && (
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Öğrenci: {selectedRequest.student?.firstName} {selectedRequest.student?.lastName}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Ders: {selectedRequest.session?.section?.course?.code}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Sebep: {selectedRequest.reason}
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="İnceleme Notları (İsteğe Bağlı)"
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  sx={{ mt: 2 }}
                  placeholder="Kararınız hakkında notlar ekleyin..."
                />
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setReviewDialog(false)}>İptal</Button>
            <Button
              onClick={handleSubmitReview}
              variant="contained"
              color={reviewAction === 'approve' ? 'success' : 'error'}
            >
              {reviewAction === 'approve' ? 'Onayla' : 'Reddet'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Layout>
  )
}

export default ExcuseRequests

