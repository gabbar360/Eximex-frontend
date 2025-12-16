import axiosInstance from '../utils/axiosInstance';

const notificationService = {
  // Get notifications
  getNotifications: async (params = {}) => {
    const response = await axiosInstance.get('/notifications', { params });
    return response.data;
  },

  // Get unread count
  getUnreadCount: async () => {
    const response = await axiosInstance.get('/notifications/unread-count');
    return response.data;
  },

  // Mark notification as read
  markAsRead: async (notificationId) => {
    const response = await axiosInstance.patch(`/notifications/${notificationId}/read`);
    return response.data;
  },

  // Delete notification
  deleteNotification: async (notificationId) => {
    const response = await axiosInstance.delete(`/notifications/${notificationId}`);
    return response.data;
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    const response = await axiosInstance.patch('/notifications/mark-all-read');
    return response.data;
  }
};

export default notificationService;