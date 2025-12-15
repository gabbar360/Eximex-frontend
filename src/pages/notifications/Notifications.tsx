import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { getNotifications, markNotificationRead } from '../../features/notificationSlice';
import { useSocket } from '../../context/SocketContext';
import { HiBell, HiClock, HiCheckCircle, HiTrash, HiEye, HiMagnifyingGlass } from 'react-icons/hi2';
import { MdNotifications } from 'react-icons/md';
import PageMeta from '../../components/common/PageMeta';

const Notifications: React.FC = () => {
  const dispatch = useDispatch();
  const { markAsRead, markAllAsRead } = useSocket();
  const { notifications, loading, pagination } = useSelector((state: RootState) => state.notification || { notifications: [], loading: false, pagination: null });
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    dispatch(getNotifications({ page: currentPage, limit: 20 }) as any);
  }, [dispatch, currentPage]);

  const handleMarkAsRead = (notificationId: number) => {
    markAsRead(notificationId);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
    setTimeout(() => {
      dispatch(getNotifications({ page: 1, limit: 20 }) as any);
      setCurrentPage(1);
    }, 500);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'TASK_ASSIGNED':
        return <HiBell className="w-5 h-5 text-blue-500" />;
      case 'TASK_STATUS_UPDATED':
        return <HiClock className="w-5 h-5 text-orange-500" />;
      case 'TASK_COMPLETED':
        return <HiCheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return <HiBell className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };



  return (
    <>
      <PageMeta
        title="Notifications - EximEx | Stay Updated"
        description="View and manage your notifications. Stay updated with task assignments, status changes, and important updates."
      />
      <div className="min-h-screen bg-gray-50">
        <div className="p-2 lg:p-4">
          {/* Header */}
          <div className="mb-3">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-3 lg:p-4">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-slate-700 shadow-lg">
                    <MdNotifications className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-1">
                      Notifications
                    </h1>
                    <p className="text-slate-600">Stay updated with your tasks and activities</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  {notifications.length > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="inline-flex items-center justify-center px-4 sm:px-6 py-3 rounded-lg font-semibold text-white bg-red-600 hover:bg-red-700 shadow-lg text-sm sm:text-base whitespace-nowrap"
                    >
                      <HiTrash className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      Clear All
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Notifications List */}
          {loading ? (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-slate-600 mx-auto mb-4"></div>
              <p className="text-slate-600 font-medium">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/30 p-12 text-center">
              <div className="w-10 h-10 mx-auto mb-6 rounded-2xl bg-gradient-to-r from-slate-600 to-slate-700 flex items-center justify-center shadow-lg">
                <HiBell className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">No notifications</h3>
              <p className="text-slate-600 mb-6">You're all caught up! No new notifications to show.</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <div className="divide-y divide-gray-200">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 transition-colors ${
                      !notification.isRead ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-slate-800 mb-1">
                              {notification.title}
                            </h4>
                            <p className="text-sm text-slate-600 mb-2">
                              {notification.message}
                            </p>
                            
                            {notification.data && (
                              <div className="text-xs text-slate-500 space-y-1">
                                {notification.data.taskTitle && (
                                  <div>Task: <span className="font-medium text-slate-700">{notification.data.taskTitle}</span></div>
                                )}
                                {notification.data.priority && (
                                  <div>Priority: <span className={`font-medium ${
                                    notification.data.priority === 'HIGH' ? 'text-red-600' :
                                    notification.data.priority === 'MEDIUM' ? 'text-orange-600' : 'text-green-600'
                                  }`}>{notification.data.priority}</span></div>
                                )}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 ml-4">
                            <span className="text-xs text-slate-500">
                              {formatDate(notification.createdAt)}
                            </span>
                            {!notification.isRead && (
                              <button
                                onClick={() => handleMarkAsRead(notification.id)}
                                className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                                title="Mark as read"
                              >
                                <HiEye className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                        
                        {notification.sender && (
                          <div className="text-xs text-slate-500 mt-2">
                            From: <span className="font-medium text-slate-700">{notification.sender.name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="mt-6 flex justify-center">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed bg-white shadow-sm"
                >
                  Previous
                </button>
                
                <span className="px-4 py-2 text-sm text-slate-600 bg-white border border-gray-300 rounded-lg shadow-sm">
                  Page {currentPage} of {pagination.totalPages}
                </span>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.totalPages))}
                  disabled={currentPage === pagination.totalPages}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 bg-white shadow-sm"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Notifications;