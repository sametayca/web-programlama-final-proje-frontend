import { useState, useEffect } from 'react'
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Grid,
  Button,
  Checkbox,
  FormControlLabel,
  List,
  ListItem,
  ListItemText,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material'
import { toast } from 'react-toastify'
import Layout from '../../components/Layout'
import schedulingService from '../../services/schedulingService'
import { 
  ExpandMore, 
  PlayArrow, 
  Save, 
  Visibility,
  CheckCircle,
  Warning
} from '@mui/icons-material'

const GenerateSchedule = () => {
  const [sections, setSections] = useState([])
  const [selectedSections, setSelectedSections] = useState([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [semester, setSemester] = useState('Fall')
  const [year, setYear] = useState(new Date().getFullYear())
  const [generatedSchedules, setGeneratedSchedules] = useState([])
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false)
  const [previewSchedule, setPreviewSchedule] = useState(null)

  useEffect(() => {
    fetchSections()
  }, [semester, year])

  const fetchSections = async () => {
    try {
      setLoading(true)
      const response = await schedulingService.getSections({ semester, year })
      setSections(response.data.data || [])
      // Select all by default
      setSelectedSections((response.data.data || []).map(s => s.id))
    } catch (err) {
      toast.error('Sectionlar yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleSection = (sectionId) => {
    setSelectedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    )
  }

  const handleGenerate = async () => {
    if (selectedSections.length === 0) {
      toast.error('Lütfen en az bir section seçin')
      return
    }

    try {
      setGenerating(true)
      const response = await schedulingService.generateSchedule({
        semester,
        year,
        sectionIds: selectedSections
      })
      
      const result = response.data.data
      // Backend may return single schedule or multiple alternatives
      const schedules = Array.isArray(result) ? result : [result]
      setGeneratedSchedules(schedules)
      
      toast.success(`${schedules.length} program alternatifi oluşturuldu`)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Program oluşturulamadı')
    } finally {
      setGenerating(false)
    }
  }

  const handlePreview = (schedule) => {
    setPreviewSchedule(schedule)
    setPreviewDialogOpen(true)
  }

  const handleSaveSchedule = async (schedule) => {
    try {
      setSaving(true)
      await schedulingService.saveSchedule({
        semester,
        year,
        schedule: schedule.assignments || schedule.schedule || schedule
      })
      toast.success('Program başarıyla kaydedildi')
      setGeneratedSchedules([])
    } catch (err) {
      toast.error(err.response?.data?.error || 'Kayıt başarısız')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Layout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Layout>
    )
  }

  return (
    <Layout>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight="bold" color="primary">
          Program Oluştur (Admin)
        </Typography>

        {/* Filters */}
        <Card elevation={2} sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={5}>
                <FormControl fullWidth>
                  <InputLabel>Dönem</InputLabel>
                  <Select
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    label="Dönem"
                  >
                    <MenuItem value="Fall">Güz</MenuItem>
                    <MenuItem value="Spring">Bahar</MenuItem>
                    <MenuItem value="Summer">Yaz</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={5}>
                <FormControl fullWidth>
                  <InputLabel>Yıl</InputLabel>
                  <Select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    label="Yıl"
                  >
                    <MenuItem value={2023}>2023</MenuItem>
                    <MenuItem value={2024}>2024</MenuItem>
                    <MenuItem value={2025}>2025</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={2}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={generating ? <CircularProgress size={20} /> : <PlayArrow />}
                  onClick={handleGenerate}
                  disabled={generating || selectedSections.length === 0}
                >
                  Oluştur
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Section List */}
        <Card elevation={2} sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Section Seçimi ({selectedSections.length}/{sections.length})
            </Typography>
            <Box display="flex" gap={2} mb={2}>
              <Button
                size="small"
                onClick={() => setSelectedSections(sections.map(s => s.id))}
              >
                Tümünü Seç
              </Button>
              <Button
                size="small"
                onClick={() => setSelectedSections([])}
              >
                Hiçbirini Seçme
              </Button>
            </Box>

            {sections.length === 0 ? (
              <Alert severity="info">Bu dönem için section bulunmamaktadır</Alert>
            ) : (
              <Paper variant="outlined" sx={{ maxHeight: 400, overflow: 'auto' }}>
                <List dense>
                  {sections.map(section => (
                    <ListItem key={section.id}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={selectedSections.includes(section.id)}
                            onChange={() => handleToggleSection(section.id)}
                          />
                        }
                        label={
                          <Box>
                            <Typography variant="body1">
                              {section.courseCode} - Section {section.sectionNumber}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {section.courseName} • {section.instructorName} • {section.enrolledCount}/{section.capacity} öğrenci
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            )}
          </CardContent>
        </Card>

        {/* Generated Schedules */}
        {generatedSchedules.length > 0 && (
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Oluşturulan Programlar ({generatedSchedules.length})
              </Typography>

              {generatedSchedules.map((schedule, index) => (
                <Accordion key={index}>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        Program {index + 1}
                      </Typography>
                      {schedule.conflicts === 0 ? (
                        <Chip icon={<CheckCircle />} label="Çakışma Yok" color="success" size="small" />
                      ) : (
                        <Chip icon={<Warning />} label={`${schedule.conflicts} Çakışma`} color="warning" size="small" />
                      )}
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {schedule.message || 'Program başarıyla oluşturuldu'}
                      </Typography>

                      {/* Assignment Summary */}
                      {schedule.assignments && (
                        <Paper variant="outlined" sx={{ p: 2, mt: 2, mb: 2 }}>
                          <Typography variant="subtitle2" gutterBottom>
                            Atamalar:
                          </Typography>
                          <List dense>
                            {schedule.assignments.slice(0, 5).map((assignment, idx) => (
                              <ListItem key={idx}>
                                <ListItemText
                                  primary={`${assignment.courseCode} - ${assignment.classroomName}`}
                                  secondary={`${assignment.day} ${assignment.startTime}-${assignment.endTime}`}
                                />
                              </ListItem>
                            ))}
                            {schedule.assignments.length > 5 && (
                              <ListItem>
                                <ListItemText
                                  secondary={`... ve ${schedule.assignments.length - 5} ders daha`}
                                />
                              </ListItem>
                            )}
                          </List>
                        </Paper>
                      )}

                      <Box display="flex" gap={2}>
                        <Button
                          variant="outlined"
                          startIcon={<Visibility />}
                          onClick={() => handlePreview(schedule)}
                        >
                          Önizle
                        </Button>
                        <Button
                          variant="contained"
                          startIcon={saving ? <CircularProgress size={20} /> : <Save />}
                          onClick={() => handleSaveSchedule(schedule)}
                          disabled={saving}
                        >
                          Kaydet
                        </Button>
                      </Box>
                    </Box>
                  </AccordionDetails>
                </Accordion>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Preview Dialog */}
        <Dialog
          open={previewDialogOpen}
          onClose={() => setPreviewDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Program Önizleme</DialogTitle>
          <DialogContent>
            {previewSchedule && (
              <Box>
                {previewSchedule.assignments ? (
                  <List>
                    {previewSchedule.assignments.map((assignment, idx) => (
                      <ListItem key={idx} divider>
                        <ListItemText
                          primary={`${assignment.courseCode} - ${assignment.courseName}`}
                          secondary={
                            <>
                              <Typography variant="body2" component="span">
                                🏫 {assignment.classroomName} ({assignment.building})
                              </Typography>
                              <br />
                              <Typography variant="body2" component="span">
                                📅 {assignment.day} • ⏰ {assignment.startTime} - {assignment.endTime}
                              </Typography>
                              <br />
                              <Typography variant="body2" component="span">
                                👨‍🏫 {assignment.instructorName}
                              </Typography>
                            </>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <pre>{JSON.stringify(previewSchedule, null, 2)}</pre>
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPreviewDialogOpen(false)}>Kapat</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Layout>
  )
}

export default GenerateSchedule
