import React, { useState, useEffect, useRef } from 'react';
import { HiBell, HiCheck, HiCheckCircle } from 'react-icons/hi2';
import { useSocket } from '../../context/SocketContext';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getNotifications, getUnreadCount, markNotificationAsRead, markAllNotificationsAsRead, deleteNotification } from '../../features/notificationSlice';
import { NotificationSound } from '../../utils/notificationSound';

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

const NotificationBell: React.FC = () => {
  const { markAsRead, markAllAsRead } = useSocket();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { notifications, unreadCount, loading } = useSelector((state: any) => state.notification);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  

  
  // Fetch initial notifications and unread count
  useEffect(() => {
    dispatch(getNotifications({ limit: 20 }));
    dispatch(getUnreadCount());
  }, [dispatch]);

  // Play sound when unread count changes
  useEffect(() => {
    if (unreadCount > 0) {
      NotificationSound.play();
    }
  }, [unreadCount]);



  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = () => {
    if (loading) return;
    dispatch(getNotifications({ limit: 20 }));
  };

  const handleBellClick = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      fetchNotifications();
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    // Navigate to task-management page
    navigate('/task-management');
    // Delete notification from database
    dispatch(deleteNotification(notification.id));
    // Close dropdown
    setIsOpen(false);
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllNotificationsAsRead());
    markAllAsRead();
    setIsOpen(false);
  };

  const handleViewAllNotifications = () => {
    navigate('/notifications');
    setIsOpen(false);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'TASK_ASSIGNED':
        return '📋';
      case 'TASK_STATUS_UPDATED':
        return '🔄';
      case 'TASK_COMPLETED':
        return '✅';
      case 'TASK_OVERDUE':
        return '⚠️';
      default:
        return '🔔';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon */}
      <button
        onClick={handleBellClick}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
      >
        <HiBell className={`w-6 h-6 ${unreadCount > 0 ? 'animate-bounce' : ''}`} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className={`${
            window.innerWidth < 1024 ? 'fixed inset-x-4 top-16' : 'absolute right-0 mt-2'
          } w-auto sm:w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 max-h-96 overflow-hidden`}>
          {/* Header */}
          <div className="px-3 sm:px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs sm:text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 flex items-center gap-1 px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <HiCheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Clear All</span> ({unreadCount})
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-blue-600 mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-6 text-center">
                <HiBell className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 sm:p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${
                    !notification.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className="text-lg sm:text-2xl flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className={`text-xs sm:text-sm font-medium ${
                          !notification.isRead ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
                        }`}>
                          {notification.title}
                        </h4>
                        {!notification.isRead && (
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between mt-1 sm:mt-2">
                        <span className="text-xs text-gray-500 dark:text-gray-500">
                          {formatTimeAgo(notification.createdAt)}
                        </span>
                        {notification.sender && (
                          <span className="text-xs text-gray-500 dark:text-gray-500 truncate ml-2">
                            by {notification.sender.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-3 sm:px-4 py-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <button 
                onClick={handleViewAllNotifications}
                className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
              >
                <span className="hidden sm:inline">View all notifications</span>
                <span className="sm:hidden">View all</span>
              </button>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs sm:text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-medium flex items-center gap-1 px-2 sm:px-3 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <HiCheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Clear All</span>
                  <span className="sm:hidden">Clear</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;