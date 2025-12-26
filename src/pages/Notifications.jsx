import { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Container,
    Typography,
    CircularProgress,
    Alert,
    Card,
    CardContent,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Chip,
    Button,
    ButtonGroup,
    Divider,
    Tabs,
    Tab,
    Menu,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import {
    School as AcademicIcon,
    EventAvailable as AttendanceIcon,
    Restaurant as MealIcon,
    Event as EventIcon,
    Payment as PaymentIcon,
    Settings as SystemIcon,
    Delete as DeleteIcon,
    CheckCircle as ReadIcon,
    Circle as UnreadIcon,
    MoreVert as MoreIcon,
    FilterList as FilterIcon,
    DoneAll as DoneAllIcon,
    DeleteSweep as ClearIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import Layout from '../components/Layout';
import notificationService from '../services/notificationService';

const categoryIcons = {
    academic: AcademicIcon,
    attendance: AttendanceIcon,
    meal: MealIcon,
    event: EventIcon,
    payment: PaymentIcon,
    system: SystemIcon
};

const typeColors = {
    info: 'info',
    warning: 'warning',
    success: 'success',
    error: 'error'
};

const Notifications = () => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [pagination, setPagination] = useState({});
    const [unreadCount, setUnreadCount] = useState(0);
    const [filter, setFilter] = useState({ category: '', isRead: '' });
    const [currentTab, setCurrentTab] = useState(0);
    const [menuAnchor, setMenuAnchor] = useState(null);
    const [selectedNotification, setSelectedNotification] = useState(null);
    const [confirmDialog, setConfirmDialog] = useState({ open: false, action: null });
    const [page, setPage] = useState(1);

    const fetchNotifications = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = { page, limit: 20 };
            if (filter.category) params.category = filter.category;
            if (filter.isRead !== '') params.isRead = filter.isRead;

            const response = await notificationService.getNotifications(params);
            if (response.success) {
                setNotifications(response.data.notifications);
                setPagination(response.data.pagination);
                setUnreadCount(response.data.unreadCount);
            }
        } catch (err) {
            setError(err.message || 'Bildirimler yüklenirken hata oluştu');
        } finally {
            setLoading(false);
        }
    }, [page, filter]);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const handleTabChange = (event, newValue) => {
        setCurrentTab(newValue);
        if (newValue === 0) {
            setFilter(prev => ({ ...prev, isRead: '' }));
        } else if (newValue === 1) {
            setFilter(prev => ({ ...prev, isRead: 'false' }));
        } else {
            setFilter(prev => ({ ...prev, isRead: 'true' }));
        }
        setPage(1);
    };

    const handleCategoryFilter = (category) => {
        setFilter(prev => ({ ...prev, category: prev.category === category ? '' : category }));
        setPage(1);
    };

    const handleMarkAsRead = async (id) => {
        try {
            await notificationService.markAsRead(id);
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, isRead: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Mark as read error:', error);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await notificationService.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Mark all as read error:', error);
        }
    };

    const handleDelete = async (id) => {
        try {
            await notificationService.deleteNotification(id);
            setNotifications(prev => prev.filter(n => n.id !== id));
        } catch (error) {
            console.error('Delete error:', error);
        }
        setMenuAnchor(null);
    };

    const handleClearRead = async () => {
        try {
            await notificationService.clearReadNotifications();
            setNotifications(prev => prev.filter(n => !n.isRead));
            setConfirmDialog({ open: false, action: null });
        } catch (error) {
            console.error('Clear read error:', error);
        }
    };

    const openMenu = (event, notification) => {
        setMenuAnchor(event.currentTarget);
        setSelectedNotification(notification);
    };

    const closeMenu = () => {
        setMenuAnchor(null);
        setSelectedNotification(null);
    };

    const getCategoryIcon = (category) => {
        const Icon = categoryIcons[category] || SystemIcon;
        return <Icon />;
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Şimdi';
        if (minutes < 60) return `${minutes} dakika önce`;
        if (hours < 24) return `${hours} saat önce`;
        if (days < 7) return `${days} gün önce`;
        return date.toLocaleDateString('tr-TR');
    };

    const categories = ['academic', 'attendance', 'meal', 'event', 'payment', 'system'];

    return (
        <Layout>
            <Container maxWidth="md" sx={{ py: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h4" fontWeight="bold">
                        {t('notifications.title')}
                    </Typography>
                    <Box>
                        <Button
                            startIcon={<DoneAllIcon />}
                            onClick={handleMarkAllRead}
                            disabled={unreadCount === 0}
                            sx={{ mr: 1 }}
                        >
                            {t('notifications.markAllRead')}
                        </Button>
                        <Button
                            startIcon={<ClearIcon />}
                            color="error"
                            onClick={() => setConfirmDialog({ open: true, action: 'clear' })}
                        >
                            {t('notifications.clearRead')}
                        </Button>
                    </Box>
                </Box>

                <Card sx={{ mb: 3 }}>
                    <Tabs value={currentTab} onChange={handleTabChange} variant="fullWidth">
                        <Tab
                            label={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    {t('common.all')}
                                    <Chip size="small" label={pagination.totalItems || 0} />
                                </Box>
                            }
                        />
                        <Tab
                            label={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    {t('notifications.unread')}
                                    <Chip size="small" label={unreadCount} color="primary" />
                                </Box>
                            }
                        />
                        <Tab label={t('notifications.read')} />
                    </Tabs>
                </Card>

                {/* Category Filters */}
                <Box sx={{ mb: 3, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <FilterIcon color="action" />
                    {categories.map(category => (
                        <Chip
                            key={category}
                            label={t(`notifications.categories.${category}`)}
                            onClick={() => handleCategoryFilter(category)}
                            color={filter.category === category ? 'primary' : 'default'}
                            variant={filter.category === category ? 'filled' : 'outlined'}
                            size="small"
                        />
                    ))}
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : notifications.length === 0 ? (
                    <Card>
                        <CardContent sx={{ textAlign: 'center', py: 6 }}>
                            <Typography color="text.secondary">
                                {t('notifications.noNotifications')}
                            </Typography>
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <List disablePadding>
                            {notifications.map((notification, index) => (
                                <Box key={notification.id}>
                                    <ListItem
                                        sx={{
                                            py: 2,
                                            backgroundColor: notification.isRead ? 'transparent' : 'action.hover',
                                            cursor: 'pointer',
                                            '&:hover': { backgroundColor: 'action.selected' }
                                        }}
                                        onClick={() => !notification.isRead && handleMarkAsRead(notification.id)}
                                    >
                                        <ListItemIcon sx={{ color: `${typeColors[notification.type]}.main` }}>
                                            {getCategoryIcon(notification.category)}
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Typography fontWeight={notification.isRead ? 400 : 600}>
                                                        {notification.title}
                                                    </Typography>
                                                    {!notification.isRead && (
                                                        <UnreadIcon sx={{ fontSize: 8, color: 'primary.main' }} />
                                                    )}
                                                </Box>
                                            }
                                            secondary={
                                                <Box>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {notification.message}
                                                    </Typography>
                                                    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                                                        <Chip
                                                            size="small"
                                                            label={t(`notifications.categories.${notification.category}`)}
                                                            variant="outlined"
                                                        />
                                                        <Typography variant="caption" color="text.disabled">
                                                            {formatTime(notification.createdAt)}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            }
                                        />
                                        <ListItemSecondaryAction>
                                            <IconButton onClick={(e) => openMenu(e, notification)}>
                                                <MoreIcon />
                                            </IconButton>
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                    {index < notifications.length - 1 && <Divider />}
                                </Box>
                            ))}
                        </List>

                        {/* Pagination */}
                        {pagination.totalPages > 1 && (
                            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                                <ButtonGroup>
                                    <Button
                                        disabled={page === 1}
                                        onClick={() => setPage(p => p - 1)}
                                    >
                                        Önceki
                                    </Button>
                                    <Button disabled>
                                        {page} / {pagination.totalPages}
                                    </Button>
                                    <Button
                                        disabled={page === pagination.totalPages}
                                        onClick={() => setPage(p => p + 1)}
                                    >
                                        Sonraki
                                    </Button>
                                </ButtonGroup>
                            </Box>
                        )}
                    </Card>
                )}

                {/* Context Menu */}
                <Menu
                    anchorEl={menuAnchor}
                    open={Boolean(menuAnchor)}
                    onClose={closeMenu}
                >
                    {selectedNotification && !selectedNotification.isRead && (
                        <MenuItem onClick={() => { handleMarkAsRead(selectedNotification.id); closeMenu(); }}>
                            <ListItemIcon><ReadIcon fontSize="small" /></ListItemIcon>
                            <ListItemText>{t('notifications.markAsRead')}</ListItemText>
                        </MenuItem>
                    )}
                    <MenuItem onClick={() => handleDelete(selectedNotification?.id)}>
                        <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
                        <ListItemText>{t('notifications.delete')}</ListItemText>
                    </MenuItem>
                </Menu>

                {/* Confirm Dialog */}
                <Dialog open={confirmDialog.open} onClose={() => setConfirmDialog({ open: false, action: null })}>
                    <DialogTitle>Okunmuş Bildirimleri Temizle</DialogTitle>
                    <DialogContent>
                        <Typography>
                            Tüm okunmuş bildirimleri silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setConfirmDialog({ open: false, action: null })}>
                            {t('common.cancel')}
                        </Button>
                        <Button color="error" onClick={handleClearRead}>
                            {t('common.delete')}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </Layout>
    );
};

export default Notifications;
