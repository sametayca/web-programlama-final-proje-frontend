import { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Typography,
    Card,
    CardContent,
    Switch,
    FormControlLabel,
    Divider,
    Button,
    Alert,
    CircularProgress,
    Grid,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow
} from '@mui/material';
import {
    Email as EmailIcon,
    Notifications as PushIcon,
    Sms as SmsIcon,
    Save as SaveIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import Layout from '../components/Layout';
import notificationService from '../services/notificationService';

const NotificationSettings = () => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [preferences, setPreferences] = useState({
        email: {
            academic: true,
            attendance: true,
            meal: false,
            event: true,
            payment: true,
            system: true
        },
        push: {
            academic: true,
            attendance: true,
            meal: true,
            event: true,
            payment: true,
            system: false
        },
        sms: {
            attendance: true,
            payment: false
        }
    });

    useEffect(() => {
        const fetchPreferences = async () => {
            try {
                const response = await notificationService.getPreferences();
                if (response.success) {
                    setPreferences(response.data);
                }
            } catch (err) {
                setError('Tercihler yüklenirken hata oluştu');
            } finally {
                setLoading(false);
            }
        };
        fetchPreferences();
    }, []);

    const handleChange = (channel, category) => {
        setPreferences(prev => ({
            ...prev,
            [channel]: {
                ...prev[channel],
                [category]: !prev[channel][category]
            }
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const response = await notificationService.updatePreferences(preferences);
            if (response.success) {
                toast.success('Bildirim tercihleri güncellendi');
            }
        } catch (err) {
            toast.error('Tercihler kaydedilirken hata oluştu');
        } finally {
            setSaving(false);
        }
    };

    const categories = [
        { key: 'academic', label: t('notifications.categories.academic') },
        { key: 'attendance', label: t('notifications.categories.attendance') },
        { key: 'meal', label: t('notifications.categories.meal') },
        { key: 'event', label: t('notifications.categories.event') },
        { key: 'payment', label: t('notifications.categories.payment') },
        { key: 'system', label: t('notifications.categories.system') }
    ];

    const smsCategories = [
        { key: 'attendance', label: t('notifications.categories.attendance') },
        { key: 'payment', label: t('notifications.categories.payment') }
    ];

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
            <Container maxWidth="md" sx={{ py: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h4" fontWeight="bold">
                        {t('notifications.settings')}
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                        onClick={handleSave}
                        disabled={saving}
                    >
                        {t('common.save')}
                    </Button>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}

                <Alert severity="info" sx={{ mb: 3 }}>
                    Bildirim tercihlerinizi aşağıdan yönetebilirsiniz. Her kategori için e-posta, push ve SMS bildirimlerini ayrı ayrı açıp kapatabilirsiniz.
                </Alert>

                <Card>
                    <CardContent>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Kategori</TableCell>
                                        <TableCell align="center">
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                                                <EmailIcon fontSize="small" />
                                                {t('notifications.emailNotifications')}
                                            </Box>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                                                <PushIcon fontSize="small" />
                                                {t('notifications.pushNotifications')}
                                            </Box>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                                                <SmsIcon fontSize="small" />
                                                {t('notifications.smsNotifications')}
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {categories.map(category => (
                                        <TableRow key={category.key}>
                                            <TableCell>
                                                <Typography fontWeight={500}>
                                                    {category.label}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Switch
                                                    checked={preferences.email[category.key] || false}
                                                    onChange={() => handleChange('email', category.key)}
                                                    color="primary"
                                                />
                                            </TableCell>
                                            <TableCell align="center">
                                                <Switch
                                                    checked={preferences.push[category.key] || false}
                                                    onChange={() => handleChange('push', category.key)}
                                                    color="primary"
                                                />
                                            </TableCell>
                                            <TableCell align="center">
                                                {smsCategories.find(s => s.key === category.key) ? (
                                                    <Switch
                                                        checked={preferences.sms[category.key] || false}
                                                        onChange={() => handleChange('sms', category.key)}
                                                        color="primary"
                                                    />
                                                ) : (
                                                    <Typography variant="caption" color="text.disabled">
                                                        -
                                                    </Typography>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </CardContent>
                </Card>

                <Box sx={{ mt: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                        * SMS bildirimleri sadece kritik durumlar için kullanılır (yoklama uyarıları ve ödeme bildirimleri)
                    </Typography>
                </Box>
            </Container>
        </Layout>
    );
};

export default NotificationSettings;
