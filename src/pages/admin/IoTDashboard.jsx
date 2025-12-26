import { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Container,
    Grid,
    Card,
    CardContent,
    Typography,
    CircularProgress,
    Alert,
    Chip,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    LinearProgress,
    Tooltip,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    useTheme
} from '@mui/material';
import {
    Thermostat as TemperatureIcon,
    People as OccupancyIcon,
    Bolt as EnergyIcon,
    WaterDrop as HumidityIcon,
    Refresh as RefreshIcon,
    Warning as AlertIcon,
    CheckCircle as OkIcon,
    Settings as SettingsIcon,
    Timeline as ChartIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import Layout from '../../components/Layout';
import sensorService from '../../services/sensorService';
import socketService from '../../services/socketService';

const sensorIcons = {
    temperature: TemperatureIcon,
    occupancy: OccupancyIcon,
    energy: EnergyIcon,
    humidity: HumidityIcon
};

const sensorColors = {
    temperature: '#ef4444',
    occupancy: '#0ea5e9',
    energy: '#f59e0b',
    humidity: '#06b6d4'
};

const SensorCard = ({ sensor, onViewDetails }) => {
    const Icon = sensorIcons[sensor.type] || TemperatureIcon;
    const color = sensorColors[sensor.type] || '#64748b';
    const isAlert = !sensor.isWithinThreshold;

    return (
        <Card
            sx={{
                height: '100%',
                borderLeft: 4,
                borderColor: isAlert ? 'error.main' : color,
                transition: 'all 0.3s',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4
                }
            }}
        >
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Icon sx={{ color, fontSize: 28 }} />
                        <Box>
                            <Typography variant="subtitle1" fontWeight="600">
                                {sensor.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {sensor.location}
                            </Typography>
                        </Box>
                    </Box>
                    <Chip
                        size="small"
                        icon={isAlert ? <AlertIcon /> : <OkIcon />}
                        label={sensor.statusLabel}
                        color={isAlert ? 'error' : sensor.status === 'active' ? 'success' : 'default'}
                    />
                </Box>

                <Box sx={{ textAlign: 'center', my: 3 }}>
                    <Typography variant="h3" fontWeight="bold" color={isAlert ? 'error.main' : 'text.primary'}>
                        {sensor.lastReading !== null ? Number(sensor.lastReading).toFixed(1) : '--'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {sensor.unit}
                    </Typography>
                </Box>

                {(sensor.minThreshold || sensor.maxThreshold) && (
                    <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="caption" color="text.secondary">
                                Min: {sensor.minThreshold}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Max: {sensor.maxThreshold}
                            </Typography>
                        </Box>
                        <LinearProgress
                            variant="determinate"
                            value={Math.min(100, Math.max(0,
                                ((sensor.lastReading - sensor.minThreshold) / (sensor.maxThreshold - sensor.minThreshold)) * 100
                            ))}
                            color={isAlert ? 'error' : 'primary'}
                            sx={{ height: 8, borderRadius: 4 }}
                        />
                    </Box>
                )}

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                        Son güncelleme: {sensor.lastReadingAt
                            ? new Date(sensor.lastReadingAt).toLocaleTimeString('tr-TR')
                            : '--'
                        }
                    </Typography>
                    <Tooltip title="Detayları Gör">
                        <IconButton size="small" onClick={() => onViewDetails(sensor)}>
                            <ChartIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
            </CardContent>
        </Card>
    );
};

const IoTDashboard = () => {
    const { t } = useTranslation();
    const theme = useTheme();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sensors, setSensors] = useState([]);
    const [stats, setStats] = useState(null);
    const [selectedSensor, setSelectedSensor] = useState(null);
    const [sensorData, setSensorData] = useState([]);
    const [aggregation, setAggregation] = useState('raw');
    const [dialogOpen, setDialogOpen] = useState(false);

    const fetchSensors = useCallback(async () => {
        try {
            const response = await sensorService.getSensors();
            if (response.success) {
                setSensors(response.data);
            }
        } catch (err) {
            setError(err.message);
        }
    }, []);

    const fetchStats = useCallback(async () => {
        try {
            const response = await sensorService.getSensorStats();
            if (response.success) {
                setStats(response.data);
            }
        } catch (err) {
            console.error('Stats error:', err);
        }
    }, []);

    const fetchSensorData = useCallback(async (sensorId) => {
        try {
            const response = await sensorService.getSensorData(sensorId, { aggregation, limit: 50 });
            if (response.success) {
                setSensorData(response.data.readings.reverse());
            }
        } catch (err) {
            console.error('Sensor data error:', err);
        }
    }, [aggregation]);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await Promise.all([fetchSensors(), fetchStats()]);
            setLoading(false);
        };
        loadData();

        // Setup WebSocket for real-time updates
        const token = localStorage.getItem('token');
        if (token) {
            socketService.connect(token);
            socketService.subscribeAllSensors();

            socketService.onSensorReading((data) => {
                setSensors(prev => prev.map(s =>
                    s.id === data.sensorId
                        ? { ...s, lastReading: data.value, lastReadingAt: data.timestamp, isWithinThreshold: data.isWithinThreshold }
                        : s
                ));
            });

            socketService.onSensorAlert((alert) => {
                // Could show a toast notification here
                console.warn('Sensor alert:', alert);
            });
        }

        return () => {
            socketService.off('sensor:reading');
            socketService.off('sensor:alert');
        };
    }, [fetchSensors, fetchStats]);

    useEffect(() => {
        if (selectedSensor) {
            fetchSensorData(selectedSensor.id);
        }
    }, [selectedSensor, aggregation, fetchSensorData]);

    const handleViewDetails = (sensor) => {
        setSelectedSensor(sensor);
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setSelectedSensor(null);
        setSensorData([]);
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

    const sensorsByType = {
        temperature: sensors.filter(s => s.type === 'temperature'),
        occupancy: sensors.filter(s => s.type === 'occupancy'),
        energy: sensors.filter(s => s.type === 'energy'),
        humidity: sensors.filter(s => s.type === 'humidity')
    };

    return (
        <Layout>
            <Container maxWidth="xl" sx={{ py: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h4" fontWeight="bold">
                        {t('iot.dashboard')}
                    </Typography>
                    <Button
                        startIcon={<RefreshIcon />}
                        onClick={() => { fetchSensors(); fetchStats(); }}
                    >
                        {t('common.refresh')}
                    </Button>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}

                {/* Stats Overview */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={6} sm={3}>
                        <Card>
                            <CardContent sx={{ textAlign: 'center' }}>
                                <Typography variant="h4" color="primary.main">
                                    {stats?.totalSensors || 0}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {t('iot.totalSensors', 'Toplam Sensör')}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                        <Card>
                            <CardContent sx={{ textAlign: 'center' }}>
                                <Typography variant="h4" color="success.main">
                                    {stats?.activeSensors || 0}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {t('iot.active', 'Aktif')}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                        <Card>
                            <CardContent sx={{ textAlign: 'center' }}>
                                <Typography variant="h4" color="warning.main">
                                    {stats?.maintenanceSensors || 0}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {t('iot.maintenance', 'Bakımda')}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                        <Card>
                            <CardContent sx={{ textAlign: 'center' }}>
                                <Typography variant="h4" color="error.main">
                                    {stats?.alertCount || 0}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {t('iot.alert', 'Uyarı')}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Sensors by Type */}
                {Object.entries(sensorsByType).map(([type, typeSensors]) => (
                    typeSensors.length > 0 && (
                        <Box key={type} sx={{ mb: 4 }}>
                            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {type === 'temperature' && <TemperatureIcon sx={{ color: sensorColors.temperature }} />}
                                {type === 'occupancy' && <OccupancyIcon sx={{ color: sensorColors.occupancy }} />}
                                {type === 'energy' && <EnergyIcon sx={{ color: sensorColors.energy }} />}
                                {type === 'humidity' && <HumidityIcon sx={{ color: sensorColors.humidity }} />}
                                {t(`iot.${type}`)}
                            </Typography>
                            <Grid container spacing={3}>
                                {typeSensors.map(sensor => (
                                    <Grid item xs={12} sm={6} md={4} lg={3} key={sensor.id}>
                                        <SensorCard sensor={sensor} onViewDetails={handleViewDetails} />
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    )
                ))}

                {sensors.length === 0 && (
                    <Alert severity="info">
                        Henüz sensör bulunamadı. Sistem otomatik olarak demo sensörleri oluşturacaktır.
                    </Alert>
                )}

                {/* Sensor Detail Dialog */}
                <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
                    <DialogTitle>
                        {selectedSensor?.name} - Detaylı Veri
                    </DialogTitle>
                    <DialogContent>
                        <Box sx={{ mb: 2 }}>
                            <FormControl size="small" sx={{ minWidth: 120 }}>
                                <InputLabel>Toplama</InputLabel>
                                <Select
                                    value={aggregation}
                                    label="Toplama"
                                    onChange={(e) => setAggregation(e.target.value)}
                                >
                                    <MenuItem value="raw">Ham Veri</MenuItem>
                                    <MenuItem value="hourly">Saatlik</MenuItem>
                                    <MenuItem value="daily">Günlük</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>
                        <Box sx={{ height: 400 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={sensorData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                                    <XAxis
                                        dataKey={aggregation === 'raw' ? 'timestamp' : aggregation === 'hourly' ? 'hour' : 'day'}
                                        stroke={theme.palette.text.secondary}
                                        tickFormatter={(val) => {
                                            if (!val) return '';
                                            const date = new Date(val);
                                            return aggregation === 'raw'
                                                ? date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
                                                : date.toLocaleDateString('tr-TR', { month: 'short', day: 'numeric' });
                                        }}
                                    />
                                    <YAxis stroke={theme.palette.text.secondary} />
                                    <ChartTooltip contentStyle={{ backgroundColor: theme.palette.background.paper, color: theme.palette.text.primary }} />
                                    <Area
                                        type="monotone"
                                        dataKey={aggregation === 'raw' ? 'value' : 'avgValue'}
                                        stroke={sensorColors[selectedSensor?.type] || '#0ea5e9'}
                                        fill={sensorColors[selectedSensor?.type] || '#0ea5e9'}
                                        fillOpacity={0.3}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDialog}>{t('common.close')}</Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </Layout>
    );
};

export default IoTDashboard;
