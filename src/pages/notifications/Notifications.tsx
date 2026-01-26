import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  getNotifications,
  markAllNotificationsAsRead,
  deleteNotification,
} from '../../features/notificationSlice';
import PageMeta from '../../components/common/PageMeta';
import {
  HiBell,
  HiCheckCircle,
  HiTrash,
  HiMagnifyingGlass,
  HiSparkles,
  HiArrowLeft,
} from 'react-icons/hi2';
import {
  MdNotifications,
  MdMessage,
  MdAccessTime,
  MdPerson,
} from 'react-icons/md';
import { Pagination } from 'antd';
import { useDebounce } from '../../utils/useDebounce';

const Notifications: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { notifications, loading, unreadCount, pagination } = useSelector(
    (state: {
      notification: {
        notifications: Record<string, unknown>[];
        loading: boolean;
        unreadCount: number;
        pagination: { total: number };
      };
    }) => state.notification
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    dispatch(getNotifications({ page: currentPage, limit: pageSize }));
  }, [dispatch, currentPage]);

  const { debouncedCallback: debouncedSearch } = useDebounce(
    (value: string) => {
      dispatch(getNotifications({ page: 1, limit: pageSize, search: value }));
    },
    500
  );

  const handleSearch = useCallback(
    (value: string) => {
      setSearchTerm(value);
      setCurrentPage(1);
      debouncedSearch(value);
    },
    [debouncedSearch]
  );

  const handleMarkAllAsRead = () => {
    dispatch(markAllNotificationsAsRead());
    toast.success('All notifications cleared');
  };

  const handleDeleteClick = (id: number) => {
    setConfirmDelete(id);
  };

  const handleConfirmDelete = async () => {
    if (!confirmDelete) return;

    try {
      await dispatch(deleteNotification(confirmDelete) as Record<string, unknown>).unwrap();
      setConfirmDelete(null);
      toast.success('Notification deleted successfully');
    } catch {
      toast.error('Failed to delete notification');
    }
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

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'TASK_ASSIGNED':
        return 'bg-blue-100 text-blue-800';
      case 'TASK_STATUS_UPDATED':
        return 'bg-yellow-100 text-yellow-800';
      case 'TASK_COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'TASK_OVERDUE':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const filteredNotifications = notifications.filter((notification: {
    title: string;
    message: string;
    type: string;
  }) => {
    if (!searchTerm) return true;
    return (
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.type.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <>
      <PageMeta
        title="Notifications - EximEx | Stay Updated"
        description="View all your notifications and stay updated with important alerts and messages."
      />
      <div className="min-h-screen bg-gray-50">
        <div className="p-2 lg:p-4">
          {/* Header */}
          <div className="mb-3">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-3 lg:p-4">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => navigate(-1)}
                    className="p-3 rounded-lg bg-slate-700 text-white hover:bg-slate-800 shadow-lg transition-colors duration-200"
                    title="Go back"
                  >
                    <HiArrowLeft className="w-6 h-6" />
                  </button>
                  <div className="p-3 rounded-lg bg-slate-700 shadow-lg">
                    <HiBell className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-1">
                      Notifications
                    </h1>
                    <p className="text-slate-600">
                      {unreadCount > 0
                        ? `${unreadCount} unread notifications`
                        : 'All caught up!'}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1 sm:flex-none">
                    <HiMagnifyingGlass className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search notifications..."
                      className="pl-12 pr-4 py-3 w-full sm:w-72 rounded-lg border border-gray-300 bg-white focus:border-slate-500 focus:ring-2 focus:ring-slate-200 transition-all duration-300 text-sm placeholder-gray-500 shadow-sm"
                      value={searchTerm}
                      onChange={(e) => handleSearch(e.target.value)}
                    />
                  </div>

                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="inline-flex items-center justify-center px-4 sm:px-6 py-3 rounded-lg font-semibold text-white bg-red-600 hover:bg-red-700 shadow-lg text-sm sm:text-base whitespace-nowrap"
                    >
                      <HiCheckCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      Clear All ({unreadCount})
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
              <p className="text-slate-600 font-medium">
                Loading notifications...
              </p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/30 p-12 text-center">
              <div className="w-10 h-10 mx-auto mb-6 rounded-2xl bg-gradient-to-r from-slate-600 to-slate-700 flex items-center justify-center shadow-lg">
                <HiBell className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">
                {searchTerm ? 'No notifications found' : 'No notifications yet'}
              </h3>
              <p className="text-slate-600">
                {searchTerm
                  ? 'Try a different search term.'
                  : "You'll see notifications here when there's something new"}
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              {/* Desktop Table View */}
              <div className="hidden lg:block">
                {/* Table Header */}
                <div className="bg-gray-50 border-b border-gray-200 p-4">
                  <div className="grid grid-cols-6 gap-3 text-sm font-semibold text-slate-700">
                    <div className="flex items-center gap-2">
                      <MdNotifications className="w-4 h-4 text-slate-600" />
                      <span>Type</span>
                    </div>
                    <div className="flex items-center gap-2 col-span-2">
                      <MdMessage className="w-4 h-4 text-slate-600" />
                      <span>Message</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MdPerson className="w-4 h-4 text-slate-600" />
                      <span>From</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MdAccessTime className="w-4 h-4 text-slate-600" />
                      <span>Time</span>
                    </div>
                    <div className="flex items-center justify-end gap-2">
                      <HiSparkles className="w-4 h-4 text-slate-600" />
                      <span>Actions</span>
                    </div>
                  </div>
                </div>
                <div className="divide-y divide-gray-100">
                  {filteredNotifications.map((notification: {
                    id: number;
                    type: string;
                    title: string;
                    message: string;
                    isRead: boolean;
                    createdAt: string;
                    sender?: { name: string };
                  }) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 transition-colors ${
                        !notification.isRead
                          ? 'bg-blue-50/50 border-l-4 border-l-blue-500'
                          : ''
                      }`}
                    >
                      <div className="grid grid-cols-6 gap-3 items-center">
                        {/* Type Column */}
                        <div className="flex items-center gap-2">
                          <span className="text-xl">
                            {getNotificationIcon(notification.type)}
                          </span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(notification.type)}`}
                          >
                            {notification.type.replace('_', ' ')}
                          </span>
                        </div>

                        {/* Message Column */}
                        <div className="col-span-2">
                          <h3
                            className={`font-semibold text-sm mb-1 ${
                              !notification.isRead
                                ? 'text-gray-900'
                                : 'text-gray-700'
                            }`}
                          >
                            {notification.title}
                          </h3>
                          <p className="text-gray-600 text-sm line-clamp-2">
                            {notification.message}
                          </p>
                        </div>

                        {/* From Column */}
                        <div className="text-slate-700 text-sm">
                          {notification.sender?.name || '-'}
                        </div>

                        {/* Time Column */}
                        <div className="flex items-center gap-2">
                          <span className="text-slate-700 text-sm">
                            {formatTimeAgo(notification.createdAt)}
                          </span>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>

                        {/* Actions Column */}
                        <div className="flex items-center justify-end">
                          <button
                            onClick={() => handleDeleteClick(notification.id)}
                            className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-red-600 transition-all duration-300"
                          >
                            <HiTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden divide-y divide-gray-100">
                {filteredNotifications.map((notification: {
                  id: number;
                  type: string;
                  title: string;
                  message: string;
                  isRead: boolean;
                  createdAt: string;
                  sender?: { name: string };
                }) => (
                  <div
                    key={notification.id}
                    className={`p-4 ${
                      !notification.isRead
                        ? 'bg-blue-50/50 border-l-4 border-l-blue-500'
                        : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">
                          {getNotificationIcon(notification.type)}
                        </span>
                        <div>
                          <h3
                            className={`font-semibold text-sm ${
                              !notification.isRead
                                ? 'text-gray-900'
                                : 'text-gray-700'
                            }`}
                          >
                            {notification.title}
                          </h3>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(notification.type)}`}
                          >
                            {notification.type.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">
                          {formatTimeAgo(notification.createdAt)}
                        </span>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                        <button
                          onClick={() => handleDeleteClick(notification.id)}
                          className="p-1.5 rounded text-slate-500 hover:text-red-600"
                        >
                          <HiTrash className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm mb-2">
                      {notification.message}
                    </p>

                    {notification.sender && (
                      <p className="text-xs text-gray-500">
                        From: {notification.sender.name}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pagination */}
          {pagination?.total > 0 && (
            <div className="flex justify-center mt-6">
              <Pagination
                current={currentPage}
                total={pagination.total}
                pageSize={pageSize}
                onChange={(page) => {
                  setCurrentPage(page);
                  dispatch(
                    getNotifications({
                      page,
                      limit: pageSize,
                      search: searchTerm,
                    })
                  );
                }}
              />
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {confirmDelete && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-60 p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-8 border border-gray-200">
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-lg bg-red-600 flex items-center justify-center shadow-lg">
                  <HiTrash className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">
                  Delete Notification
                </h3>
                <p className="text-slate-600">
                  Are you sure you want to delete this notification? This action
                  cannot be undone.
                </p>
              </div>
              <div className="flex items-center justify-center space-x-3">
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="px-6 py-3 rounded-lg border border-gray-300 text-slate-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-6 py-3 rounded-lg bg-red-600 text-white hover:bg-red-700 shadow-lg"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Notifications;
