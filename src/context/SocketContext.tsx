import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { useDispatch } from 'react-redux';
import { addNewNotification, updateUnreadCount, markNotificationRead, markAllRead, getNotifications, getUnreadCount } from '../features/notificationSlice';
import { NotificationSound, showBrowserNotification } from '../utils/notificationSound';

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  createdAt: string;
  sender?: {
    name: string;
    email: string;
  };
}

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  markAsRead: (notificationId: number) => void;
  markAllAsRead: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: React.ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const { user, token } = useAuth();
  const dispatch = useDispatch();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');

    
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    
    if (user && (token || accessToken)) {
      const socketToken = token || accessToken;
      const socketUrl = import.meta.env.VITE_SOCKET_URL;

      
      const newSocket = io(socketUrl, {
        auth: {
          token: socketToken
        },
        transports: ['polling', 'websocket'],
        forceNew: true,
        reconnection: true,
        timeout: 20000
      });

      newSocket.on('connect', () => {
        setIsConnected(true);
      });

      newSocket.on('disconnect', () => {
        setIsConnected(false);
      });

      newSocket.on('new_notification', (notification: Notification) => {
        dispatch(addNewNotification(notification));
        
        // Play notification sound
        NotificationSound.play();
        
        // Show browser notification
        showBrowserNotification(
          notification.title,
          notification.message,
          '/favicon.ico'
        );
      });

      newSocket.on('unread_notifications_count', (count: number) => {
        dispatch(updateUnreadCount(count));
      });

      newSocket.on('connect_error', () => {});

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [user, token, dispatch]);

  const markAsRead = (notificationId: number) => {
    if (socket) {
      socket.emit('mark_notification_read', notificationId);
      dispatch(markNotificationRead(notificationId));
    }
  };

  const markAllAsRead = () => {
    if (socket) {
      socket.emit('mark_all_notifications_read');
      dispatch(markAllRead());
    }
  };

  const value: SocketContextType = {
    socket,
    isConnected,
    markAsRead,
    markAllAsRead
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};