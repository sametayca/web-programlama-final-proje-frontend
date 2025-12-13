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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  TextField
} from '@mui/material'
import {
  Assessment as AssessmentIcon,
  ArrowBack as ArrowBackIcon,
  Download as DownloadIcon,
  Warning as WarningIcon
} from '@mui/icons-material'
import { attendanceService, sectionService } from '../services/api'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/Layout'

const AttendanceReport = () => {
  const { sectionId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [section, setSection] = useState(null)
  const [report, setReport] = useState([])
  const [error, setError] = useState(null)
  const [dateFilter, setDateFilter] = useState({ start: '', end: '' })

  useEffect(() => {
    if (user?.role !== 'faculty' && user?.role !== 'admin') {
      setError('This page is only available for faculty members')
      setLoading(false)
      return
    }

    fetchReport()
  }, [sectionId, user])

  const fetchReport = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch section details
      const sectionRes = await sectionService.getSection(sectionId)
      const sectionData = sectionRes.data.data

      // Check authorization
      if (user.role === 'faculty' && sectionData.instructorId !== user.id) {
        setError('You are not authorized to view this report')
        setLoading(false)
        return
      }

      setSection(sectionData)

      // Fetch attendance report
      const reportRes = await attendanceService.getAttendanceReport(sectionId)
      const reportData = reportRes.data.data

      setReport(reportData.report || [])
    } catch (err) {
      console.error('Error fetching report:', err)
      setError(err.response?.data?.error || 'Failed to load attendance report')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (percentage) => {
    if (percentage >= 80) return 'success'
    if (percentage >= 70) return 'warning'
    return 'error'
  }

  const getStatusLabel = (percentage) => {
    if (percentage >= 80) return 'OK'
    if (percentage >= 70) return 'Warning'
    return 'Critical'
  }

  const handleExportExcel = () => {
    // Simple CSV export
    const headers = ['Student Number', 'Name', 'Email', 'Total Sessions', 'Attended', 'Excused', 'Absent', 'Percentage', 'Status', 'Flagged']
    const rows = report.map(item => [
      item.student.studentProfile?.studentNumber || 'N/A',
      `${item.student.firstName} ${item.student.lastName}`,
      item.student.email,
      item.attendance.totalSessions,
      item.attendance.attendedSessions,
      item.attendance.excusedSessions,
      item.attendance.absentSessions,
      `${item.attendance.attendancePercentage.toFixed(1)}%`,
      getStatusLabel(item.attendance.attendancePercentage),
      item.flaggedCount
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `attendance-report-${section?.course?.code || 'section'}-${Date.now()}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (user?.role !== 'faculty' && user?.role !== 'admin') {
    return (
      <Layout>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Alert severity="warning">This page is only available for faculty members</Alert>
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

  if (error) {
    return (
      <Layout>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Alert severity="error">{error}</Alert>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
            sx={{ mt: 2 }}
          >
            Go Back
          </Button>
        </Container>
      </Layout>
    )
  }

  return (
    <Layout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
          <Box display="flex" alignItems="center">
            <AssessmentIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
            <Box>
              <Typography variant="h4" component="h1" fontWeight="bold">
                Attendance Report
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {section?.course?.code} - {section?.course?.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Section {section?.sectionNumber} • {section?.semester} {section?.year}
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={handleExportExcel}
            sx={{ ml: 2 }}
          >
            Export to Excel
          </Button>
        </Box>

        {/* Date Filter (Placeholder for future implementation) */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box display="flex" gap={2} alignItems="center">
              <Typography variant="body2" color="text.secondary">
                Filter by Date Range:
              </Typography>
              <TextField
                type="date"
                label="Start Date"
                size="small"
                value={dateFilter.start}
                onChange={(e) => setDateFilter({ ...dateFilter, start: e.target.value })}
                InputLabelProps={{ shrink: true }}
                sx={{ width: 200 }}
              />
              <TextField
                type="date"
                label="End Date"
                size="small"
                value={dateFilter.end}
                onChange={(e) => setDateFilter({ ...dateFilter, end: e.target.value })}
                InputLabelProps={{ shrink: true }}
                sx={{ width: 200 }}
              />
            </Box>
          </CardContent>
        </Card>

        {/* Report Table */}
        <Card>
          <CardContent>
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'primary.light' }}>
                    <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Student Number</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'white' }} align="center">Total Sessions</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'white' }} align="center">Attended</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'white' }} align="center">Excused</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'white' }} align="center">Absent</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'white' }} align="center">Percentage</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'white' }} align="center">Status</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'white' }} align="center">Flagged</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {report.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary">No students enrolled in this section</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    report.map((item, index) => {
                      const student = item.student
                      const attendance = item.attendance
                      const percentage = attendance.attendancePercentage

                      return (
                        <TableRow key={student.id} hover>
                          <TableCell>{student.studentProfile?.studentNumber || 'N/A'}</TableCell>
                          <TableCell>{`${student.firstName} ${student.lastName}`}</TableCell>
                          <TableCell>{student.email}</TableCell>
                          <TableCell align="center">{attendance.totalSessions}</TableCell>
                          <TableCell align="center">{attendance.attendedSessions}</TableCell>
                          <TableCell align="center">{attendance.excusedSessions}</TableCell>
                          <TableCell align="center">{attendance.absentSessions}</TableCell>
                          <TableCell align="center">
                            <Typography variant="body2" fontWeight="bold">
                              {percentage.toFixed(1)}%
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={getStatusLabel(percentage)}
                              color={getStatusColor(percentage)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="center">
                            {item.flaggedCount > 0 ? (
                              <Chip
                                icon={<WarningIcon />}
                                label={item.flaggedCount}
                                color="error"
                                size="small"
                              />
                            ) : (
                              <Typography variant="body2" color="text.secondary">-</Typography>
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Summary Stats */}
        {report.length > 0 && (
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Summary Statistics
              </Typography>
              <Box display="flex" gap={4} flexWrap="wrap">
                <Box>
                  <Typography variant="body2" color="text.secondary">Total Students</Typography>
                  <Typography variant="h6">{report.length}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Average Attendance</Typography>
                  <Typography variant="h6">
                    {(
                      report.reduce((sum, item) => sum + item.attendance.attendancePercentage, 0) / report.length
                    ).toFixed(1)}%
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Students with Warnings</Typography>
                  <Typography variant="h6" color="warning.main">
                    {report.filter(item => item.attendance.attendancePercentage < 80 && item.attendance.attendancePercentage >= 70).length}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Students with Critical Status</Typography>
                  <Typography variant="h6" color="error.main">
                    {report.filter(item => item.attendance.attendancePercentage < 70).length}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Flagged Records</Typography>
                  <Typography variant="h6" color="error.main">
                    {report.reduce((sum, item) => sum + item.flaggedCount, 0)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        )}
      </Container>
    </Layout>
  )
}

export default AttendanceReport

