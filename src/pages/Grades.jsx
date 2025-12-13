import { useEffect, useState } from 'react'
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Grid,
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
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material'
import {
  School as SchoolIcon,
  Download as DownloadIcon
} from '@mui/icons-material'
import { gradeService } from '../services/api'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/Layout'

const Grades = () => {
  const { user } = useAuth()
  const [grades, setGrades] = useState([])
  const [gpa, setGpa] = useState(0)
  const [totalCredits, setTotalCredits] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [semester, setSemester] = useState('')
  const [year, setYear] = useState('')
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    if (user?.role === 'student') {
      fetchGrades()
    }
  }, [user, semester, year])

  const fetchGrades = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = {}
      if (semester) params.semester = semester
      if (year) params.year = parseInt(year)
      
      const response = await gradeService.getMyGrades(params)
      setGrades(response.data.data.enrollments || [])
      setGpa(response.data.data.gpa || 0)
      setTotalCredits(response.data.data.totalCredits || 0)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch grades')
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadTranscript = async () => {
    setDownloading(true)
    try {
      const response = await gradeService.getTranscriptPDF()
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `transcript-${user?.email || 'transcript'}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Error downloading transcript:', err)
      const response = await gradeService.getTranscript()
      const dataStr = JSON.stringify(response.data.data, null, 2)
      const blob = new Blob([dataStr], { type: 'application/json' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `transcript-${user?.email || 'transcript'}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } finally {
      setDownloading(false)
    }
  }

  const getGradeColor = (letterGrade) => {
    switch (letterGrade) {
      case 'A': return 'success'
      case 'B': return 'info'
      case 'C': return 'warning'
      case 'D': return 'error'
      case 'F': return 'error'
      default: return 'default'
    }
  }

  if (user?.role !== 'student') {
    return (
      <Layout>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Alert severity="warning">This page is only available for students</Alert>
        </Container>
      </Layout>
    )
  }

  return (
    <Layout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 1 }}>
              <SchoolIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              My Grades
            </Typography>
            <Typography variant="body1" color="text.secondary">
              View your academic performance
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={handleDownloadTranscript}
            disabled={downloading}
          >
            {downloading ? <CircularProgress size={20} /> : 'Download Transcript'}
          </Button>
        </Box>

        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Current GPA
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  {gpa.toFixed(2)}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {totalCredits} Total Credits
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Courses Completed
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 700, color: 'success.main' }}>
                  {grades.filter(g => g.status === 'completed').length}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {grades.length} Total Enrollments
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Semester</InputLabel>
            <Select
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              label="Semester"
            >
              <MenuItem value="">All Semesters</MenuItem>
              <MenuItem value="fall">Fall</MenuItem>
              <MenuItem value="spring">Spring</MenuItem>
              <MenuItem value="summer">Summer</MenuItem>
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Year</InputLabel>
            <Select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              label="Year"
            >
              <MenuItem value="">All Years</MenuItem>
              {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                <MenuItem key={y} value={y.toString()}>
                  {y}
                </MenuItem>
              ))}
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
        ) : grades.length === 0 ? (
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 8 }}>
              <SchoolIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No grades available
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Course Code</strong></TableCell>
                  <TableCell><strong>Course Name</strong></TableCell>
                  <TableCell><strong>Section</strong></TableCell>
                  <TableCell><strong>Semester</strong></TableCell>
                  <TableCell><strong>Midterm</strong></TableCell>
                  <TableCell><strong>Final</strong></TableCell>
                  <TableCell><strong>Letter Grade</strong></TableCell>
                  <TableCell><strong>Grade Point</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {grades.map((enrollment) => {
                  const section = enrollment.section
                  const course = section?.course
                  
                  return (
                    <TableRow key={enrollment.id}>
                      <TableCell>{course?.code}</TableCell>
                      <TableCell>{course?.name}</TableCell>
                      <TableCell>{section?.sectionNumber}</TableCell>
                      <TableCell>
                        {section?.semester} {section?.year}
                      </TableCell>
                      <TableCell>
                        {enrollment.midtermGrade !== null ? enrollment.midtermGrade.toFixed(2) : '-'}
                      </TableCell>
                      <TableCell>
                        {enrollment.finalGrade !== null ? enrollment.finalGrade.toFixed(2) : '-'}
                      </TableCell>
                      <TableCell>
                        {enrollment.letterGrade ? (
                          <Chip
                            label={enrollment.letterGrade}
                            color={getGradeColor(enrollment.letterGrade)}
                            size="small"
                          />
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>
                        {enrollment.gradePoint !== null ? enrollment.gradePoint.toFixed(2) : '-'}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={enrollment.status}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Container>
    </Layout>
  )
}

export default Grades

