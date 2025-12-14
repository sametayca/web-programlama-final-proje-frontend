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
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
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
      setError(err.response?.data?.error || 'Notlar yüklenirken bir hata oluştu')
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
          <Alert severity="warning">Bu sayfa sadece öğrenciler için kullanılabilir</Alert>
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
              Notlarım
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Akademik performansınızı görüntüleyin
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={handleDownloadTranscript}
            disabled={downloading}
          >
            {downloading ? <CircularProgress size={20} /> : 'Transkript İndir'}
          </Button>
        </Box>

        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Mevcut GNO
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  {gpa.toFixed(2)}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {totalCredits} Toplam Kredi
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Tamamlanan Dersler
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 700, color: 'success.main' }}>
                  {grades.filter(g => g.status === 'completed').length}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {grades.length} Toplam Kayıt
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Dönem</InputLabel>
            <Select
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              label="Dönem"
            >
              <MenuItem value="">Tüm Dönemler</MenuItem>
              <MenuItem value="fall">Güz</MenuItem>
              <MenuItem value="spring">Bahar</MenuItem>
              <MenuItem value="summer">Yaz</MenuItem>
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Yıl</InputLabel>
            <Select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              label="Yıl"
            >
              <MenuItem value="">Tüm Yıllar</MenuItem>
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
                Not bulunamadı
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Charts */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
              {/* Grade Distribution Chart */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Not Dağılımı
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={(() => {
                        const gradeCounts = { A: 0, B: 0, C: 0, D: 0, F: 0 }
                        grades.forEach(g => {
                          if (g.letterGrade && gradeCounts.hasOwnProperty(g.letterGrade)) {
                            gradeCounts[g.letterGrade]++
                          }
                        })
                        return Object.entries(gradeCounts).map(([grade, count]) => ({ grade, count }))
                      })()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="grade" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>

              {/* GPA Trend Chart */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      GNO Trendi
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={(() => {
                        // Group by semester/year and calculate GPA for each
                        const semesterData = {}
                        grades.forEach(g => {
                          if (g.section && g.gradePoint !== null) {
                            const key = `${g.section.semester}-${g.section.year}`
                            if (!semesterData[key]) {
                              semesterData[key] = { semester: key, totalPoints: 0, totalCredits: 0 }
                            }
                            const credits = g.section.course?.credits || 0
                            semesterData[key].totalPoints += (g.gradePoint * credits)
                            semesterData[key].totalCredits += credits
                          }
                        })
                        return Object.values(semesterData).map(d => ({
                          semester: d.semester,
                          gpa: d.totalCredits > 0 ? (d.totalPoints / d.totalCredits).toFixed(2) : 0
                        })).sort((a, b) => a.semester.localeCompare(b.semester))
                      })()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="semester" />
                        <YAxis domain={[0, 4]} />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="gpa" stroke="#10b981" strokeWidth={2} name="GPA" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Ders Kodu</strong></TableCell>
                  <TableCell><strong>Ders Adı</strong></TableCell>
                  <TableCell><strong>Bölüm</strong></TableCell>
                  <TableCell><strong>Dönem</strong></TableCell>
                  <TableCell><strong>Vize</strong></TableCell>
                  <TableCell><strong>Final</strong></TableCell>
                  <TableCell><strong>Harf Notu</strong></TableCell>
                  <TableCell><strong>Not Puanı</strong></TableCell>
                  <TableCell><strong>Durum</strong></TableCell>
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
          </>
        )}
      </Container>
    </Layout>
  )
}

export default Grades

