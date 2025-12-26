import { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Grid,
    Card,
    CardContent,
    Typography,
    CircularProgress,
    Alert,
    Button,
    ButtonGroup,
    Chip,
    LinearProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    useTheme
} from '@mui/material';
import {
    People as PeopleIcon,
    School as SchoolIcon,
    EventAvailable as AttendanceIcon,
    Restaurant as MealIcon,
    Event as EventIcon,
    CheckCircle as HealthyIcon,
    Warning as WarningIcon,
    Download as DownloadIcon,
    Refresh as RefreshIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import Layout from '../../components/Layout';
import analyticsService from '../../services/analyticsService';

const COLORS = ['#0ea5e9', '#14b8a6', '#8b5cf6', '#f59e0b', '#ef4444', '#10b981'];

const StatCard = ({ title, value, icon: Icon, color = 'primary', subtitle }) => (
    <Card sx={{ height: '100%' }}>
        <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                    <Typography color="text.secondary" variant="body2" gutterBottom>
                        {title}
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                        {value}
                    </Typography>
                    {subtitle && (
                        <Typography variant="caption" color="text.secondary">
                            {subtitle}
                        </Typography>
                    )}
                </Box>
                <Box
                    sx={{
                        backgroundColor: `${color}.light`,
                        borderRadius: 2,
                        p: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <Icon sx={{ color: `${color}.main`, fontSize: 32 }} />
                </Box>
            </Box>
        </CardContent>
    </Card>
);

const AdminAnalyticsDashboard = () => {
    const { t } = useTranslation();
    const theme = useTheme();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dashboardData, setDashboardData] = useState(null);
    const [academicData, setAcademicData] = useState(null);
    const [mealData, setMealData] = useState(null);
    const [eventData, setEventData] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [dashboard, academic, meal, events] = await Promise.all([
                analyticsService.getDashboardStats(),
                analyticsService.getAcademicPerformance(),
                analyticsService.getMealAnalytics(),
                analyticsService.getEventAnalytics()
            ]);

            if (dashboard.success) setDashboardData(dashboard.data);
            if (academic.success) setAcademicData(academic.data);
            if (meal.success) setMealData(meal.data);
            if (events.success) setEventData(events.data);
        } catch (err) {
            setError(err.message || 'Veri yüklenirken hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleExport = async (type, format) => {
        try {
            await analyticsService.exportReport(type, format);
        } catch (error) {
            console.error('Export error:', error);
        }
    };

    if (loading) {
        return (
            <Layout>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                    <CircularProgress />
                </Box>
            </Layout>
        );
    }

    return (
        <Layout>
            <Container maxWidth="xl" sx={{ py: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h4" fontWeight="bold">
                        {t('analytics.dashboard')}
                    </Typography>
                    <Box>
                        <Button
                            startIcon={<RefreshIcon />}
                            onClick={fetchData}
                            sx={{ mr: 1 }}
                        >
                            {t('common.refresh')}
                        </Button>
                        <ButtonGroup variant="outlined" size="small">
                            <Button onClick={() => handleExport('academic', 'excel')}>
                                <DownloadIcon sx={{ mr: 0.5 }} /> Excel
                            </Button>
                            <Button onClick={() => handleExport('academic', 'pdf')}>
                                PDF
                            </Button>
                            <Button onClick={() => handleExport('academic', 'csv')}>
                                CSV
                            </Button>
                        </ButtonGroup>
                    </Box>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}

                {/* Key Metrics */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title={t('dashboard.totalUsers')}
                            value={dashboardData?.totalUsers || 0}
                            icon={PeopleIcon}
                            color="primary"
                            subtitle={`${dashboardData?.activeUsersToday || 0} aktif bugün`}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title={t('dashboard.totalCourses')}
                            value={dashboardData?.totalCourses || 0}
                            icon={SchoolIcon}
                            color="secondary"
                            subtitle={`${dashboardData?.totalEnrollments || 0} ${t('courses.enroll', 'kayıt')}`}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title={t('dashboard.attendanceRate')}
                            value={`%${dashboardData?.attendanceRate || 0}`}
                            icon={AttendanceIcon}
                            color="success"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title={t('dashboard.mealReservations')}
                            value={dashboardData?.mealReservationsToday || 0}
                            icon={MealIcon}
                            color="warning"
                            subtitle="Bugün"
                        />
                    </Grid>
                </Grid>

                {/* System Health & Events */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    {t('dashboard.systemHealth')}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    {dashboardData?.systemHealth === 'healthy' ? (
                                        <>
                                            <HealthyIcon color="success" sx={{ fontSize: 48 }} />
                                            <Box>
                                                <Typography variant="h5" color="success.main">
                                                    Sağlıklı
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    Tüm sistemler normal çalışıyor
                                                </Typography>
                                            </Box>
                                        </>
                                    ) : (
                                        <>
                                            <WarningIcon color="warning" sx={{ fontSize: 48 }} />
                                            <Box>
                                                <Typography variant="h5" color="warning.main">
                                                    Dikkat
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    Bazı sistemlerde sorun olabilir
                                                </Typography>
                                            </Box>
                                        </>
                                    )}
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    {t('dashboard.upcomingEvents')}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <EventIcon color="primary" sx={{ fontSize: 48 }} />
                                    <Box>
                                        <Typography variant="h4">
                                            {dashboardData?.upcomingEvents || 0}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Yaklaşan etkinlik
                                        </Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Charts */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    {/* Grade Distribution */}
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    {t('analytics.gradeDistribution')}
                                </Typography>
                                <Box sx={{ height: 300 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={academicData?.gradeDistribution || []}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                                outerRadius={100}
                                                fill="#8884d8"
                                                dataKey="count"
                                                nameKey="grade"
                                            >
                                                {(academicData?.gradeDistribution || []).map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* GPA by Department */}
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    {t('analytics.gpaByDepartment')}
                                </Typography>
                                <Box sx={{ height: 300 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={academicData?.averageGpaByDept || []}>
                                            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                                            <XAxis dataKey="department" stroke={theme.palette.text.secondary} />
                                            <YAxis domain={[0, 4]} stroke={theme.palette.text.secondary} />
                                            <Tooltip contentStyle={{ backgroundColor: theme.palette.background.paper, color: theme.palette.text.primary }} />
                                            <Bar dataKey="avgGpa" fill="#0ea5e9" name={t('analytics.gpa', 'Ortalama GPA')} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Daily Meal Usage */}
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    {t('analytics.dailyMeals')}
                                </Typography>
                                <Box sx={{ height: 300 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={mealData?.dailyMealCounts || []}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="date" />
                                            <YAxis />
                                            <Tooltip />
                                            <Line type="monotone" dataKey="count" stroke="#14b8a6" strokeWidth={2} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Popular Events */}
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    {t('analytics.popularEvents')}
                                </Typography>
                                <TableContainer>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>{t('events.title', 'Etkinlik')}</TableCell>
                                                <TableCell align="right">{t('events.registered', 'Kayıt')}</TableCell>
                                                <TableCell align="right">{t('events.checkIn', 'Check-in')}</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {(eventData?.popularEvents || []).slice(0, 5).map((event) => (
                                                <TableRow key={event.id}>
                                                    <TableCell>{event.title}</TableCell>
                                                    <TableCell align="right">
                                                        <Chip
                                                            size="small"
                                                            label={event.registrationCount}
                                                            color="primary"
                                                            variant="outlined"
                                                        />
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <Chip
                                                            size="small"
                                                            label={`%${event.checkInRate}`}
                                                            color={parseFloat(event.checkInRate) > 70 ? 'success' : 'warning'}
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Top & At-Risk Students */}
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom color="success.main">
                                    {t('analytics.topStudents')}
                                </Typography>
                                <TableContainer>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>{t('common.student', 'Öğrenci')}</TableCell>
                                                <TableCell>{t('common.department', 'Bölüm')}</TableCell>
                                                <TableCell align="right">{t('grades.gpa', 'GPA')}</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {(academicData?.topStudents || []).slice(0, 5).map((student) => (
                                                <TableRow key={student.id}>
                                                    <TableCell>{student.name}</TableCell>
                                                    <TableCell>{student.department}</TableCell>
                                                    <TableCell align="right">
                                                        <Chip size="small" label={student.gpa} color="success" />
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom color="error.main">
                                    {t('analytics.atRiskStudents')}
                                </Typography>
                                <TableContainer>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>{t('common.student', 'Öğrenci')}</TableCell>
                                                <TableCell>{t('common.department', 'Bölüm')}</TableCell>
                                                <TableCell align="right">{t('grades.gpa', 'GPA')}</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {(academicData?.atRiskStudents || []).slice(0, 5).map((student) => (
                                                <TableRow key={student.id}>
                                                    <TableCell>{student.name}</TableCell>
                                                    <TableCell>{student.department}</TableCell>
                                                    <TableCell align="right">
                                                        <Chip size="small" label={student.gpa} color="error" />
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Container>
        </Layout>
    );
};

export default AdminAnalyticsDashboard;
