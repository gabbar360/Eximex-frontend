import { io } from 'socket.io-client';
import { toast } from 'react-toastify';
import { store } from '../redux-store/store';
import { addNotification, markNotificationAsRead, markAllNotificationsAsRead, setNotifications, setUnreadCount } from '../features/notificationSlice';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  connect(token) {
    if (this.socket?.connected) {
      return;
    }

    const serverUrl = import.meta.env.VITE_API_URL;
    console.log('🔌 Connecting to socket server', serverUrl);
    
    this.socket = io(serverUrl, {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true
    });

    this.setupEventListeners();
  }

  setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      this.isConnected = true;
      
      // Auto-fetch data on connection
      setTimeout(() => {
        this.getUnreadCount();
        this.getNotifications({ page: 1, limit: 20 });
      }, 1000);
    });

    this.socket.on('disconnect', (reason) => {
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      this.isConnected = false;
    });

    // Listen for new notifications
    this.socket.on('new_notification', (notification) => {
      store.dispatch(addNotification(notification));
      
      // Auto-refresh unread count
      this.getUnreadCount();
      
      // Show browser notification if permission granted
      this.showBrowserNotification(notification);
      
      // Show toast notification
      toast.info(`🔔 ${notification.title}`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    });

    // Listen for notification marked as read
    this.socket.on('notification_marked_read', ({ notificationId }) => {
      store.dispatch(markNotificationAsRead(notificationId));
    });

    // Listen for all notifications marked as read
    this.socket.on('all_notifications_marked_read', () => {
      store.dispatch(markAllNotificationsAsRead());
    });

    // Listen for notifications data
    this.socket.on('notifications_data', (data) => {
      store.dispatch(setNotifications(data));
    });

    // Listen for unread count data
    this.socket.on('unread_count_data', (data) => {
      store.dispatch(setUnreadCount(data.count));
    });

    // Listen for errors
    this.socket.on('notifications_error', (error) => {
      // Silent error handling
    });

    this.socket.on('unread_count_error', (error) => {
      // Silent error handling
    });
  }

  showBrowserNotification(notification) {
    if ('Notification' in window && Notification.permission === 'granted') {
      const options = {
        body: notification.message,
        icon: '/favicon.png',
        badge: '/favicon.png',
        tag: `notification-${notification.id}`,
        requireInteraction: notification.priority === 'HIGH' || notification.priority === 'URGENT',
        silent: false
      };

      const browserNotification = new Notification(notification.title, options);
      
      // Auto close after 5 seconds for non-urgent notifications
      if (notification.priority !== 'HIGH' && notification.priority !== 'URGENT') {
        setTimeout(() => {
          browserNotification.close();
        }, 5000);
      }

      browserNotification.onclick = () => {
        window.focus();
        browserNotification.close();
        // You can add navigation logic here based on notification type
      };
    }
  }

  // Mark notification as read
  markNotificationAsRead(notificationId) {
    if (this.socket?.connected) {
      this.socket.emit('mark_notification_read', { notificationId });
    }
  }

  // Mark all notifications as read
  markAllNotificationsAsRead() {
    if (this.socket?.connected) {
      this.socket.emit('mark_all_notifications_read');
    }
  }

  // Get notifications via socket
  getNotifications({ page = 1, limit = 20, unreadOnly = false } = {}) {
    if (this.socket?.connected) {
      this.socket.emit('get_notifications', { page, limit, unreadOnly });
    }
  }

  // Get unread count via socket
  getUnreadCount() {
    if (this.socket?.connected) {
      this.socket.emit('get_unread_count');
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Request notification permission
  static async requestNotificationPermission() {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }
}

export default new SocketService();