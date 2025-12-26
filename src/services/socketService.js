import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';

class SocketService {
    constructor() {
        this.socket = null;
        this.listeners = new Map();
    }

    // Connect to WebSocket server
    connect(token) {
        if (this.socket?.connected) {
            return this.socket;
        }

        this.socket = io(SOCKET_URL, {
            auth: { token },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000
        });

        this.socket.on('connect', () => {
            console.log('🔌 WebSocket connected');
        });

        this.socket.on('disconnect', (reason) => {
            console.log('🔌 WebSocket disconnected:', reason);
        });

        this.socket.on('connect_error', (error) => {
            console.error('WebSocket connection error:', error.message);
        });

        return this.socket;
    }

    // Disconnect from WebSocket server
    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
        this.listeners.clear();
    }

    // Subscribe to notifications
    onNotification(callback) {
        if (this.socket) {
            this.socket.on('notification', callback);
            this.listeners.set('notification', callback);
        }
    }

    // Subscribe to sensor readings
    subscribeSensor(sensorId) {
        if (this.socket) {
            this.socket.emit('subscribe:sensor', sensorId);
        }
    }

    // Unsubscribe from sensor readings
    unsubscribeSensor(sensorId) {
        if (this.socket) {
            this.socket.emit('unsubscribe:sensor', sensorId);
        }
    }

    // Subscribe to all sensors (admin)
    subscribeAllSensors() {
        if (this.socket) {
            this.socket.emit('subscribe:all-sensors');
        }
    }

    // Listen to sensor readings
    onSensorReading(callback) {
        if (this.socket) {
            this.socket.on('sensor:reading', callback);
            this.listeners.set('sensor:reading', callback);
        }
    }

    // Listen to sensor alerts
    onSensorAlert(callback) {
        if (this.socket) {
            this.socket.on('sensor:alert', callback);
            this.listeners.set('sensor:alert', callback);
        }
    }

    // Subscribe to attendance session (faculty)
    subscribeAttendance(sessionId) {
        if (this.socket) {
            this.socket.emit('subscribe:attendance', sessionId);
        }
    }

    // Unsubscribe from attendance session
    unsubscribeAttendance(sessionId) {
        if (this.socket) {
            this.socket.emit('unsubscribe:attendance', sessionId);
        }
    }

    // Listen to attendance updates
    onAttendanceUpdate(callback) {
        if (this.socket) {
            this.socket.on('attendance:update', callback);
            this.listeners.set('attendance:update', callback);
        }
    }

    // Remove specific listener
    off(event) {
        if (this.socket && this.listeners.has(event)) {
            this.socket.off(event, this.listeners.get(event));
            this.listeners.delete(event);
        }
    }

    // Check if connected
    isConnected() {
        return this.socket?.connected || false;
    }

    // Get socket instance
    getSocket() {
        return this.socket;
    }
}

export default new SocketService();
