import { useState, useEffect, useCallback } from 'react';
import {
    IconButton,
    Badge,
    Menu,
    MenuItem,
    Typography,
    Box,
    Divider,
    Button,
    ListItemIcon,
    ListItemText,
    CircularProgress
} from '@mui/material';
import {
    Notifications as NotificationsIcon,
    School as AcademicIcon,
    EventAvailable as AttendanceIcon,
    Restaurant as MealIcon,
    Event as EventIcon,
    Payment as PaymentIcon,
    Settings as SystemIcon,
    CheckCircle as ReadIcon,
    Circle as UnreadIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import notificationService from '../services/notificationService';
import socketService from '../services/socketService';

const categoryIcons = {
    academic: AcademicIcon,
    attendance: AttendanceIcon,
    meal: MealIcon,
    event: EventIcon,
    payment: PaymentIcon,
    system: SystemIcon
};

const NotificationBell = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);

    const fetchNotifications = useCallback(async () => {
        try {
            setLoading(true);
            const [notificationsResponse, unreadCountResponse] = await Promise.all([
                notificationService.getNotifications({ limit: 5 }),
                notificationService.getUnreadCount()
            ]);
            if (notificationsResponse.success) {
                setNotifications(notificationsResponse.data.notifications);
            }
            if (unreadCountResponse.success) {
                setUnreadCount(unreadCountResponse.data.unreadCount);
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNotifications();

        // Listen for real-time notifications
        const token = localStorage.getItem('token');
        if (token) {
            socketService.connect(token);
            socketService.onNotification(async (notification) => {
                setNotifications(prev => [notification, ...prev.slice(0, 4)]);
                // Fetch updated unread count from server
                try {
                    const unreadCountResponse = await notificationService.getUnreadCount();
                    if (unreadCountResponse.success) {
                        setUnreadCount(unreadCountResponse.data.unreadCount);
                    } else {
                        setUnreadCount(prev => prev + 1);
                    }
                } catch (error) {
                    console.error('Failed to fetch unread count:', error);
                    setUnreadCount(prev => prev + 1);
                }
            });
        }

        return () => {
            socketService.off('notification');
        };
    }, [fetchNotifications]);

    const handleOpen = (event) => {
        setAnchorEl(event.currentTarget);
        fetchNotifications();
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleNotificationClick = async (notification) => {
        if (!notification.isRead) {
            try {
                await notificationService.markAsRead(notification.id);
                setNotifications(prev =>
                    prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n)
                );
                // Fetch updated unread count from server
                try {
                    const unreadCountResponse = await notificationService.getUnreadCount();
                    if (unreadCountResponse.success) {
                        setUnreadCount(unreadCountResponse.data.unreadCount);
                    } else {
                        setUnreadCount(prev => Math.max(0, prev - 1));
                    }
                } catch (error) {
                    console.error('Failed to fetch unread count:', error);
                    setUnreadCount(prev => Math.max(0, prev - 1));
                }
            } catch (error) {
                console.error('Failed to mark as read:', error);
            }
        }

        if (notification.link) {
            navigate(notification.link);
        }
        handleClose();
    };

    const handleViewAll = () => {
        navigate('/notifications');
        handleClose();
    };

    const handleMarkAllRead = async () => {
        try {
            await notificationService.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            // Fetch updated unread count from server
            try {
                const unreadCountResponse = await notificationService.getUnreadCount();
                if (unreadCountResponse.success) {
                    setUnreadCount(unreadCountResponse.data.unreadCount);
                } else {
                    setUnreadCount(0);
                }
            } catch (error) {
                console.error('Failed to fetch unread count:', error);
                setUnreadCount(0);
            }
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    const getCategoryIcon = (category) => {
        const Icon = categoryIcons[category] || SystemIcon;
        return <Icon fontSize="small" />;
    };

    const getTypeColor = (type) => {
        const colors = {
            info: 'info.main',
            warning: 'warning.main',
            success: 'success.main',
            error: 'error.main'
        };
        return colors[type] || 'text.secondary';
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Şimdi';
        if (minutes < 60) return `${minutes} dk önce`;
        if (hours < 24) return `${hours} saat önce`;
        if (days < 7) return `${days} gün önce`;
        return date.toLocaleDateString('tr-TR');
    };

    return (
        <>
            <IconButton
                color="inherit"
                onClick={handleOpen}
                aria-label={t('nav.notifications')}
            >
                <Badge badgeContent={unreadCount} color="error">
                    <NotificationsIcon />
                </Badge>
            </IconButton>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                PaperProps={{
                    sx: {
                        width: 360,
                        maxHeight: 480,
                    }
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6">{t('notifications.title')}</Typography>
                    {unreadCount > 0 && (
                        <Button size="small" onClick={handleMarkAllRead}>
                            {t('notifications.markAllRead')}
                        </Button>
                    )}
                </Box>

                <Divider />

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                        <CircularProgress size={24} />
                    </Box>
                ) : notifications.length === 0 ? (
                    <Box sx={{ p: 3, textAlign: 'center' }}>
                        <Typography color="text.secondary">
                            {t('notifications.noNotifications')}
                        </Typography>
                    </Box>
                ) : (
                    notifications.map((notification) => (
                        <MenuItem
                            key={notification.id}
                            onClick={() => handleNotificationClick(notification)}
                            sx={{
                                py: 1.5,
                                backgroundColor: notification.isRead ? 'transparent' : 'action.hover',
                                '&:hover': {
                                    backgroundColor: 'action.selected'
                                }
                            }}
                        >
                            <ListItemIcon sx={{ color: getTypeColor(notification.type) }}>
                                {getCategoryIcon(notification.category)}
                            </ListItemIcon>
                            <ListItemText
                                primary={
                                    <Typography variant="body2" fontWeight={notification.isRead ? 400 : 600}>
                                        {notification.title}
                                    </Typography>
                                }
                                secondary={
                                    <Box>
                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                            {notification.message.substring(0, 50)}
                                            {notification.message.length > 50 ? '...' : ''}
                                        </Typography>
                                        <Typography variant="caption" color="text.disabled">
                                            {formatTime(notification.createdAt)}
                                        </Typography>
                                    </Box>
                                }
                            />
                            {!notification.isRead && (
                                <UnreadIcon sx={{ fontSize: 8, color: 'primary.main', ml: 1 }} />
                            )}
                        </MenuItem>
                    ))
                )}

                <Divider />

                <Box sx={{ p: 1 }}>
                    <Button fullWidth onClick={handleViewAll}>
                        Tüm Bildirimleri Gör
                    </Button>
                </Box>
            </Menu>
        </>
    );
};

export default NotificationBell;
