import { createSlice } from '@reduxjs/toolkit';

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    notifications: [],
    unreadCount: 0,
    loading: false,
    error: null,
    pagination: {
      page: 1,
      limit: 20,
      total: 0,
      pages: 0
    }
  },
  reducers: {
    clearNotificationError(state) {
      state.error = null;
    },
    addNotification(state, { payload }) {
      // Add new notification to the beginning of the list
      state.notifications.unshift(payload);
      
      // Update unread count if notification is unread
      if (!payload.isRead) {
        state.unreadCount += 1;
      }
    },
    markNotificationAsRead(state, { payload: notificationId }) {
      const notification = state.notifications.find(n => n.id === notificationId);
      if (notification && !notification.isRead) {
        notification.isRead = true;
        notification.readAt = new Date().toISOString();
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    markAllNotificationsAsRead(state) {
      state.notifications.forEach(notification => {
        if (!notification.isRead) {
          notification.isRead = true;
          notification.readAt = new Date().toISOString();
        }
      });
      state.unreadCount = 0;
    },
    resetNotifications(state) {
      state.notifications = [];
      state.unreadCount = 0;
      state.pagination = {
        page: 1,
        limit: 20,
        total: 0,
        pages: 0
      };
    },
    setNotifications(state, { payload }) {
      state.notifications = payload.notifications;
      state.pagination = payload.pagination;
      state.loading = false;
    },
    setUnreadCount(state, { payload }) {
      state.unreadCount = payload;
    }
  },

});

export const {
  clearNotificationError,
  addNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  resetNotifications,
  setNotifications,
  setUnreadCount
} = notificationSlice.actions;

export default notificationSlice.reducer;