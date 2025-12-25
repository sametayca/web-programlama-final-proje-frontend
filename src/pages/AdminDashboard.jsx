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
    Alert
} from '@mui/material'
import {
    SupervisorAccount as SupervisorAccountIcon,
    School as SchoolIcon,
    Book as BookIcon,
    DateRange as DateRangeIcon,
    TrendingUp as TrendingUpIcon,
    Restaurant as RestaurantIcon,
    Person as PersonIcon,
    Event as EventIcon
} from '@mui/icons-material'
import { analyticsService } from '../services/api'
import Layout from '../components/Layout'

// Reusing StatCard or creating new one? Reusing is better if compatible.
// Let's create a local dedicated one for Admin Dashboard for flexibility
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

const AdminDashboard = () => {
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        fetchStats()
    }, [])

    const fetchStats = async () => {
        try {
            const response = await analyticsService.getDashboardStats()
            if (response.data.success) {
                setStats(response.data.data)
            } else {
                setError('Failed to load stats')
            }
        } catch (err) {
            console.error('Failed to fetch admin dashboard stats', err)
            setError('Could not load dashboard data. Ensure backend is running.')
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <Layout>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                    <CircularProgress />
                </Box>
            </Layout>
        )
    }

    if (error) {
        return (
            <Layout>
                <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
            </Layout>
        )
    }

    return (
        <Layout>
            <Box>
                <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
                    Admin Dashboard 🚀
                </Typography>

                <Grid container spacing={3}>
                    {/* Row 1: Key Metrics */}
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="Toplam Kullanıcı"
                            value={stats?.totalUsers || 0}
                            icon={<SupervisorAccountIcon fontSize="large" />}
                            color="#0ea5e9"
                            delay={100}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="Bugün Aktif"
                            value={stats?.activeUsersToday || 0}
                            icon={<PersonIcon fontSize="large" />}
                            color="#10b981"
                            delay={200}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="Toplam Ders"
                            value={stats?.totalCourses || 0}
                            icon={<BookIcon fontSize="large" />}
                            color="#f59e0b"
                            delay={300}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="Ders Kayıtları"
                            value={stats?.totalEnrollments || 0}
                            icon={<SchoolIcon fontSize="large" />}
                            color="#6366f1"
                            delay={400}
                        />
                    </Grid>

                    {/* Row 2: Secondary Metrics */}
                    <Grid item xs={12} sm={6} md={4}>
                        <StatCard
                            title="Yemek Rezervasyon (Bugün)"
                            value={stats?.mealReservationsToday || 0}
                            icon={<RestaurantIcon />}
                            color="#ef4444"
                            delay={500}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <StatCard
                            title="Yaklaşan Etkinlikler"
                            value={stats?.upcomingEvents || 0}
                            icon={<EventIcon />}
                            color="#8b5cf6"
                            delay={600}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <StatCard
                            title="Sistem Durumu"
                            value={stats?.systemHealth || 'Unknown'}
                            icon={<TrendingUpIcon />}
                            color="#22c55e"
                            delay={700}
                        />
                    </Grid>

                </Grid>

                {/* Placeholder for Charts - Will be implemented in next step */}
                <Box sx={{ mt: 5 }}>
                    <Alert severity="info">
                        Detaylı grafikler ve raporlar (Chart.js entegrasyonu) bir sonraki adımda eklenecektir.
                    </Alert>
                </Box>
            </Box>
        </Layout>
    )
}

export default AdminDashboard
