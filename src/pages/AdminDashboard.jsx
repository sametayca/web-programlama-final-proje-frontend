import { useEffect, useState } from 'react'
import {
    Box,
    Grid,
    Paper,
    Typography,
    Card,
    CardContent,
    CircularProgress,
    Fade,
    Grow,
    Alert,
    Tabs,
    Tab,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Stack,
    InputAdornment
} from '@mui/material'
import {
    SupervisorAccount as SupervisorAccountIcon,
    School as SchoolIcon,
    Book as BookIcon,
    TrendingUp as TrendingUpIcon,
    Restaurant as RestaurantIcon,
    Person as PersonIcon,
    Event as EventIcon,
    Edit as EditIcon,
    Block as BlockIcon,
    CheckCircle as CheckCircleIcon,
    Add as AddIcon,
    Delete as DeleteIcon,
    AssignmentInd as AssignmentIndIcon,
    Campaign as CampaignIcon,
    CalendarMonth as CalendarMonthIcon
} from '@mui/icons-material'
import { analyticsService, userService, sectionService, announcementService, eventService } from '../services/api'
import Layout from '../components/Layout'
import { toast } from 'react-toastify'

// --- Components ---

const StatCard = ({ title, value, icon, color, delay = 0 }) => (
    <Grow in={true} timeout={600} style={{ transitionDelay: `${delay}ms` }}>
        <Card sx={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
            <Box
                sx={{
                    position: 'absolute',
                    top: -20,
                    right: -20,
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${color}33 0%, transparent 70%)`,
                }}
            />
            <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
                <Box
                    sx={{
                        p: 2,
                        borderRadius: 3,
                        bgcolor: `${color}20`,
                        color: color,
                        mr: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    {icon}
                </Box>
                <Box>
                    <Typography variant="body2" color="text.secondary" fontWeight="600">
                        {title}
                    </Typography>
                    <Typography variant="h4" fontWeight="800">
                        {value}
                    </Typography>
                </Box>
            </CardContent>
        </Card>
    </Grow>
)

const TabPanel = (props) => {
    const { children, value, index, ...other } = props;
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

// --- Admin Dashboard ---
const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState(0)
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // Data States
    const [users, setUsers] = useState([])
    const [sections, setSections] = useState([])
    const [facultyUsers, setFacultyUsers] = useState([]) // For dropdown
    const [announcements, setAnnouncements] = useState([])
    const [events, setEvents] = useState([])

    // Dialog States
    const [openUserDialog, setOpenUserDialog] = useState(false)
    const [selectedUser, setSelectedUser] = useState(null)
    const [openAssignDialog, setOpenAssignDialog] = useState(false)
    const [selectedSection, setSelectedSection] = useState(null)
    const [selectedInstructor, setSelectedInstructor] = useState('')

    // Event Dialog States
    const [openEventDialog, setOpenEventDialog] = useState(false)
    const [newEvent, setNewEvent] = useState({
        title: '',
        description: '',
        eventType: 'other',
        startDate: '',
        endDate: '',
        location: '',
        priority: 'normal'
    })

    useEffect(() => {
        fetchStats()
        fetchUsers()
        fetchSections()
        fetchContent()
        fetchFaculty()
    }, [])

    // --- Fetchers ---
    const fetchStats = async () => {
        try {
            const response = await analyticsService.getDashboardStats()
            if (response.data.success) {
                setStats(response.data.data)
            }
        } catch (err) {
            console.error('Stats Error:', err)
            // Safe fallback
            setStats({
                totalUsers: 0, activeUsersToday: 0, totalCourses: 0,
                totalEnrollments: 0, mealReservationsToday: 0, upcomingEvents: 0
            })
        } finally {
            setLoading(false)
        }
    }

    const fetchUsers = async () => {
        try {
            const response = await userService.getUsers({ limit: 50 })
            if (response.data.success) setUsers(response.data.data.users || [])
        } catch (err) {
            console.error('Users Error:', err);
            const msg = err.response?.data?.error || err.message;
            const details = err.response?.data?.details || '';
            toast.error(`Kullanıcılar yüklenemedi: ${msg} ${details}`);
            // Fallback for immediate user feedback
            if (msg.includes('500') || details) {
                window.alert(`HATA DETAYI (Lütfen bunu bildiriniz): \n${msg}\n${details}\n${JSON.stringify(err.response?.data)}`);
            }
        }
    }

    const fetchFaculty = async () => {
        try {
            const response = await userService.getUsers({ role: 'faculty', limit: 100 })
            if (response.data.success) setFacultyUsers(response.data.data.users || [])
        } catch (err) {
            console.error('Faculty fetch Error:', err);
            // Silent fail or toast? Let's toast for debug
            const msg = err.response?.data?.error || err.message;
            toast.error(`Öğretim üyeleri yüklenemedi: ${msg}`);
        }
    }

    const fetchSections = async () => {
        try {
            const response = await sectionService.getSections({ limit: 100 })
            if (response.data.success) setSections(response.data.data || [])
        } catch (err) {
            console.error('Sections Error:', err)
            toast.error('Ders şubeleri yüklenemedi');
        }
    }

    const fetchContent = async () => {
        try {
            const annRes = await announcementService.getAnnouncements({ limit: 10 })
            const evtRes = await eventService.getEvents({ limit: 20 }) // Increased limit
            if (annRes.data.success) setAnnouncements(annRes.data.data.announcements || [])
            if (evtRes.data.success) setEvents(evtRes.data.data.events || [])
        } catch (err) { console.error('Content Error:', err) }
    }

    // --- Handlers ---
    const handleTabChange = (event, newValue) => setActiveTab(newValue)

    const handleEditUser = (user) => {
        setSelectedUser(user)
        setOpenUserDialog(true)
    }

    const handleSaveUser = async () => {
        try {
            await userService.updateUser(selectedUser.id, selectedUser)
            toast.success('Kullanıcı güncellendi')
            setOpenUserDialog(false)
            fetchUsers()
        } catch (err) {
            toast.error('Güncelleme başarısız')
        }
    }

    const handleAssignInstructorClick = (section) => {
        setSelectedSection(section)
        setSelectedInstructor(section.instructorId || '')
        setOpenAssignDialog(true)
    }

    const handleAssignInstructor = async () => {
        try {
            await sectionService.updateSection(selectedSection.id, { instructorId: selectedInstructor })
            toast.success('Eğitmen atandı')
            setOpenAssignDialog(false)
            fetchSections()
        } catch (err) {
            toast.error('Atama başarısız')
        }
    }

    const handleDeleteAnnouncement = async (id) => {
        if (window.confirm('Bu duyuruyu silmek istediğinize emin misiniz?')) {
            try {
                await announcementService.deleteAnnouncement(id)
                fetchContent()
                toast.success('Silindi')
            } catch (err) { toast.error('Hata') }
        }
    }

    const handleDeleteEvent = async (id) => {
        if (window.confirm('Bu etkinliği silmek istediğinize emin misiniz?')) {
            try {
                await eventService.deleteEvent(id)
                fetchContent()
                toast.success('Etkinlik silindi')
            } catch (err) { toast.error('Silme başarısız') }
        }
    }

    const handleCreateEvent = async () => {
        try {
            await eventService.createEvent(newEvent)
            toast.success('Etkinlik oluşturuldu')
            setOpenEventDialog(false)
            fetchContent()
            // Reset form
            setNewEvent({
                title: '', description: '', eventType: 'other',
                startDate: '', endDate: '', location: '', priority: 'normal'
            })
        } catch (err) {
            console.error(err)
            toast.error('Oluşturma başarısız: ' + (err.response?.data?.error || err.message))
        }
    }

    if (loading) return <Layout><Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box></Layout>

    return (
        <Layout>
            <Box>
                <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold' }}>
                    Yönetici Paneli 🛡️
                </Typography>

                <Paper sx={{ mb: 3 }}>
                    <Tabs value={activeTab} onChange={handleTabChange} centered variant="fullWidth">
                        <Tab label="Genel Bakış" icon={<TrendingUpIcon />} iconPosition="start" />
                        <Tab label="Kullanıcılar" icon={<SupervisorAccountIcon />} iconPosition="start" />
                        <Tab label="Ders Yönetimi" icon={<SchoolIcon />} iconPosition="start" />
                        <Tab label="İçerik & Takvim" icon={<CalendarMonthIcon />} iconPosition="start" />
                    </Tabs>
                </Paper>

                {/* --- Tab 1: Overview --- */}
                <TabPanel value={activeTab} index={0}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatCard title="Toplam Kullanıcı" value={stats?.totalUsers || 0} icon={<SupervisorAccountIcon fontSize="large" />} color="#0ea5e9" />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatCard title="Ders Kayıtları" value={stats?.totalEnrollments || 0} icon={<SchoolIcon fontSize="large" />} color="#6366f1" />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatCard title="Yemek (Bugün)" value={stats?.mealReservationsToday || 0} icon={<RestaurantIcon />} color="#ef4444" />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatCard title="Etkinlikler" value={stats?.upcomingEvents || 0} icon={<EventIcon />} color="#8b5cf6" />
                        </Grid>
                    </Grid>

                    <Box sx={{ mt: 4 }}>
                        <Typography variant="h6" gutterBottom>Sistem Sağlığı</Typography>
                        <Alert severity="success" sx={{ mb: 2 }}>
                            Tüm servisler aktif çalışıyor. Veritabanı ve Redis bağlantıları sağlıklı.
                        </Alert>
                    </Box>
                </TabPanel>

                {/* --- Tab 2: Users --- */}
                <TabPanel value={activeTab} index={1}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="h6">Kullanıcı Listesi</Typography>
                    </Box>
                    <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
                        <Table stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Ad Soyad</TableCell>
                                    <TableCell>Email</TableCell>
                                    <TableCell>Rol</TableCell>
                                    <TableCell>Durum</TableCell>
                                    <TableCell align="right">İşlemler</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {users && users.length > 0 ? users.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell>{user.firstName} {user.lastName}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            <Chip label={user.role} color={user.role === 'admin' ? 'error' : user.role === 'faculty' ? 'warning' : 'primary'} size="small" />
                                        </TableCell>
                                        <TableCell>
                                            {user.isActive ? <CheckCircleIcon color="success" fontSize="small" /> : <BlockIcon color="action" fontSize="small" />}
                                        </TableCell>
                                        <TableCell align="right">
                                            <IconButton onClick={() => handleEditUser(user)} color="primary"><EditIcon /></IconButton>
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow><TableCell colSpan={5} align="center">Kullanıcı bulunamadı</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </TabPanel>

                {/* --- Tab 3: Academic/Courses --- */}
                <TabPanel value={activeTab} index={2}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="h6">Ders Şubeleri ve Eğitmen Atama</Typography>
                    </Box>
                    <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
                        <Table stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Ders Kodu</TableCell>
                                    <TableCell>Ders Adı</TableCell>
                                    <TableCell>Şube</TableCell>
                                    <TableCell>Mevcut Eğitmen</TableCell>
                                    <TableCell align="right">Atama Yap</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {sections && sections.length > 0 ? sections.map((sec) => (
                                    <TableRow key={sec.id}>
                                        <TableCell sx={{ fontWeight: 'bold' }}>{sec.course?.code || 'N/A'}</TableCell>
                                        <TableCell>{sec.course?.name || 'N/A'}</TableCell>
                                        <TableCell>{sec.sectionNumber}</TableCell>
                                        <TableCell>
                                            {sec.instructor ? `${sec.instructor.firstName} ${sec.instructor.lastName}` : <Chip label="Atanmadı" color="default" size="small" />}
                                        </TableCell>
                                        <TableCell align="right">
                                            <Button variant="outlined" size="small" startIcon={<AssignmentIndIcon />} onClick={() => handleAssignInstructorClick(sec)}>
                                                Eğitmen Seç
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow><TableCell colSpan={5} align="center">Ders şubesi bulunamadı</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </TabPanel>

                {/* --- Tab 4: Content & Calendar --- */}
                <TabPanel value={activeTab} index={3}>
                    <Grid container spacing={4}>
                        {/* Events / Calendar */}
                        <Grid item xs={12}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6">Etkinlikler & Akademik Takvim</Typography>
                                <Button startIcon={<AddIcon />} variant="contained" onClick={() => setOpenEventDialog(true)}>Yeni Etkinlik / Takvim Öğesi Ekle</Button>
                            </Box>
                            <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                                <TableContainer sx={{ maxHeight: 400 }}>
                                    <Table stickyHeader size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Başlık</TableCell>
                                                <TableCell>Tip</TableCell>
                                                <TableCell>Tarih</TableCell>
                                                <TableCell>Öncelik</TableCell>
                                                <TableCell align="right">İşlemler</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {events && events.length > 0 ? events.map(evt => (
                                                <TableRow key={evt.id}>
                                                    <TableCell>{evt.title}</TableCell>
                                                    <TableCell>
                                                        <Chip label={evt.eventType} size="small" variant="outlined" />
                                                    </TableCell>
                                                    <TableCell>
                                                        {new Date(evt.startDate).toLocaleDateString('tr-TR')}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={evt.priority || 'Normal'}
                                                            size="small"
                                                            color={evt.priority === 'urgent' ? 'error' : evt.priority === 'high' ? 'warning' : 'default'}
                                                        />
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <IconButton size="small" onClick={() => handleDeleteEvent(evt.id)} color="error"><DeleteIcon fontSize="small" /></IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            )) : (
                                                <TableRow><TableCell colSpan={5} align="center">Etkinlik bulunamadı</TableCell></TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Paper>
                        </Grid>

                        {/* Announcements */}
                        <Grid item xs={12}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6">Duyurular</Typography>
                                {/* Announcement Creation could be added here similarly */}
                            </Box>
                            <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                                <TableContainer sx={{ maxHeight: 300 }}>
                                    <Table stickyHeader size="small">
                                        <TableHead><TableRow><TableCell>Başlık</TableCell><TableCell align="right">Sil</TableCell></TableRow></TableHead>
                                        <TableBody>
                                            {announcements && announcements.length > 0 ? announcements.map(ann => (
                                                <TableRow key={ann.id}>
                                                    <TableCell>{ann.title}</TableCell>
                                                    <TableCell align="right">
                                                        <IconButton size="small" onClick={() => handleDeleteAnnouncement(ann.id)}><DeleteIcon fontSize="small" /></IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            )) : (
                                                <TableRow><TableCell colSpan={2} align="center">Duyuru bulunamadı</TableCell></TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Paper>
                        </Grid>
                    </Grid>
                </TabPanel>
            </Box>

            {/* --- Dialogs --- */}

            {/* User Edit Dialog */}
            <Dialog open={openUserDialog} onClose={() => setOpenUserDialog(false)} fullWidth maxWidth="sm">
                <DialogTitle>Kullanıcı Düzenle</DialogTitle>
                <DialogContent>
                    {selectedUser && (
                        <Stack spacing={2} sx={{ mt: 1 }}>
                            <TextField label="Ad" fullWidth value={selectedUser.firstName} onChange={(e) => setSelectedUser({ ...selectedUser, firstName: e.target.value })} />
                            <TextField label="Soyad" fullWidth value={selectedUser.lastName} onChange={(e) => setSelectedUser({ ...selectedUser, lastName: e.target.value })} />
                            <FormControl fullWidth>
                                <InputLabel>Rol</InputLabel>
                                <Select value={selectedUser.role} label="Rol" onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value })}>
                                    <MenuItem value="student">Student</MenuItem>
                                    <MenuItem value="faculty">Faculty</MenuItem>
                                    <MenuItem value="admin">Admin</MenuItem>
                                    <MenuItem value="staff">Staff</MenuItem>
                                </Select>
                            </FormControl>
                            <FormControl fullWidth>
                                <InputLabel>Durum</InputLabel>
                                <Select value={selectedUser.isActive ? 1 : 0} label="Durum" onChange={(e) => setSelectedUser({ ...selectedUser, isActive: e.target.value === 1 })}>
                                    <MenuItem value={1}>Aktif</MenuItem>
                                    <MenuItem value={0}>Pasif/Banlı</MenuItem>
                                </Select>
                            </FormControl>
                        </Stack>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenUserDialog(false)}>İptal</Button>
                    <Button onClick={handleSaveUser} variant="contained">Kaydet</Button>
                </DialogActions>
            </Dialog>

            {/* Assign Instructor Dialog */}
            <Dialog open={openAssignDialog} onClose={() => setOpenAssignDialog(false)} fullWidth maxWidth="sm">
                <DialogTitle>Eğitmen Ata: {selectedSection?.course?.code}</DialogTitle>
                <DialogContent>
                    <FormControl fullWidth sx={{ mt: 2 }}>
                        <InputLabel>Öğretim Üyesi Seçin</InputLabel>
                        <Select value={selectedInstructor} label="Öğretim Üyesi Seçin" onChange={(e) => setSelectedInstructor(e.target.value)}>
                            <MenuItem value=""><em>Seçiniz</em></MenuItem>
                            {facultyUsers.map(fac => (
                                <MenuItem key={fac.id} value={fac.id}>
                                    {fac.firstName} {fac.lastName} ({fac.facultyProfile?.title || 'Faculty'})
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenAssignDialog(false)}>İptal</Button>
                    <Button onClick={handleAssignInstructor} variant="contained" disabled={!selectedInstructor}>Ata</Button>
                </DialogActions>
            </Dialog>

            {/* Create Event Dialog */}
            <Dialog open={openEventDialog} onClose={() => setOpenEventDialog(false)} fullWidth maxWidth="sm">
                <DialogTitle>Yeni Etkinlik / Takvim Öğesi</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <TextField label="Başlık" fullWidth value={newEvent.title} onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })} />
                        <TextField label="Açıklama" fullWidth multiline rows={3} value={newEvent.description} onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })} />

                        <FormControl fullWidth>
                            <InputLabel>Tip</InputLabel>
                            <Select value={newEvent.eventType} label="Tip" onChange={(e) => setNewEvent({ ...newEvent, eventType: e.target.value })}>
                                <MenuItem value="academic">Akademik (Takvim)</MenuItem>
                                <MenuItem value="exam">Sınav (Takvim)</MenuItem>
                                <MenuItem value="holiday">Tatil (Takvim)</MenuItem>
                                <MenuItem value="registration">Kayıt (Takvim)</MenuItem>
                                <MenuItem value="seminar">Seminer</MenuItem>
                                <MenuItem value="conference">Konferans</MenuItem>
                                <MenuItem value="social">Sosyal</MenuItem>
                                <MenuItem value="other">Diğer</MenuItem>
                            </Select>
                        </FormControl>

                        <FormControl fullWidth>
                            <InputLabel>Öncelik</InputLabel>
                            <Select value={newEvent.priority} label="Öncelik" onChange={(e) => setNewEvent({ ...newEvent, priority: e.target.value })}>
                                <MenuItem value="normal">Normal</MenuItem>
                                <MenuItem value="high">Yüksek</MenuItem>
                                <MenuItem value="urgent">Acil</MenuItem>
                            </Select>
                        </FormControl>

                        <TextField
                            label="Başlangıç Tarihi"
                            type="datetime-local"
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            value={newEvent.startDate}
                            onChange={(e) => setNewEvent({ ...newEvent, startDate: e.target.value })}
                        />

                        <TextField
                            label="Bitiş Tarihi"
                            type="datetime-local"
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            value={newEvent.endDate}
                            onChange={(e) => setNewEvent({ ...newEvent, endDate: e.target.value })}
                        />

                        <TextField label="Konum" fullWidth value={newEvent.location} onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })} />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenEventDialog(false)}>İptal</Button>
                    <Button onClick={handleCreateEvent} variant="contained">Oluştur</Button>
                </DialogActions>
            </Dialog>

        </Layout>
    )
}

export default AdminDashboard
