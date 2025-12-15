import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import notificationService from '../service/notificationService';

// Get notifications
export const getNotifications = createAsyncThunk(
  'notification/getNotifications',
  async (params = {}, { rejectWithValue }) => {
    try {
      return await notificationService.getNotifications(params);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Get unread count
export const getUnreadCount = createAsyncThunk(
  'notification/getUnreadCount',
  async (_, { rejectWithValue }) => {
    try {
      return await notificationService.getUnreadCount();
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Mark notification as read
export const markNotificationAsRead = createAsyncThunk(
  'notification/markAsRead',
  async (notificationId, { rejectWithValue }) => {
    try {
      await notificationService.markAsRead(notificationId);
      return notificationId;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Mark all notifications as read
export const markAllNotificationsAsRead = createAsyncThunk(
  'notification/markAllAsRead',
  async (_, { rejectWithValue }) => {
    try {
      await notificationService.markAllAsRead();
      return true;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const notificationSlice = createSlice({
  name: 'notification',
  initialState: {
    notifications: [],
    unreadCount: 0,
    loading: false,
    error: null,
    pagination: { total: 0, page: 1, limit: 20, totalPages: 0 },
  },
  reducers: {
    clearNotificationError(state) {
      state.error = null;
    },
    addNewNotification(state, { payload }) {
      state.notifications.unshift(payload);
      if (!payload.isRead) {
        state.unreadCount += 1;
      }
    },
    updateUnreadCount(state, { payload }) {
      state.unreadCount = payload;
    },
    markNotificationRead(state, { payload }) {
      const notification = state.notifications.find(n => n.id === payload);
      if (notification && !notification.isRead) {
        notification.isRead = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    markAllRead(state) {
      state.notifications = [];
      state.unreadCount = 0;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get notifications
      .addCase(getNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getNotifications.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.notifications = payload.data?.data || [];
        state.pagination = payload.data?.pagination || {};
      })
      .addCase(getNotifications.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })

      // Get unread count
      .addCase(getUnreadCount.fulfilled, (state, { payload }) => {
        state.unreadCount = payload.data?.count || 0;
      })

      // Mark as read
      .addCase(markNotificationAsRead.fulfilled, (state, { payload }) => {
        const notification = state.notifications.find(n => n.id === payload);
        if (notification && !notification.isRead) {
          notification.isRead = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })

      // Mark all as read (delete all)
      .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
        state.notifications = [];
        state.unreadCount = 0;
      });
  },
});

export const { 
  clearNotificationError, 
  addNewNotification, 
  updateUnreadCount,
  markNotificationRead,
  markAllRead
} = notificationSlice.actions;

export default notificationSlice.reducer;