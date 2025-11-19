import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import userPermissionService from '../service/userPermissionService';

export const fetchUserPermissions = createAsyncThunk(
  'userPermission/fetchUserPermissions',
  async (userId, { rejectWithValue }) => {
    try {
      return await userPermissionService.getUserPermissions(userId);
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch user permissions');
    }
  }
);

export const setUserPermissions = createAsyncThunk(
  'userPermission/setUserPermissions',
  async ({ userId, permissions }, { rejectWithValue }) => {
    try {
      const response = await userPermissionService.setUserPermissions(userId, permissions);
      return response;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateUserPermissions = createAsyncThunk(
  'userPermission/updateUserPermissions',
  async ({ userId, permissions, submenuPermissions }, { rejectWithValue }) => {
    try {
      const response = await userPermissionService.updateUserPermissions(
        userId, 
        permissions, 
        submenuPermissions
      );
      return response;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const deleteUserPermissions = createAsyncThunk(
  'userPermission/deleteUserPermissions',
  async ({ userId, menuItemIds }, { rejectWithValue }) => {
    try {
      const response = await userPermissionService.deleteUserPermissions(userId, menuItemIds);
      return { userId, response };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchUserWithPermissions = createAsyncThunk(
  'userPermission/fetchUserWithPermissions',
  async (userId, { rejectWithValue }) => {
    try {
      return await userPermissionService.getUserWithPermissions(userId);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchAllUsersWithPermissions = createAsyncThunk(
  'userPermission/fetchAllUsersWithPermissions',
  async (_, { rejectWithValue }) => {
    try {
      return await userPermissionService.getAllUsersWithPermissions();
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch users with permissions');
    }
  }
);

export const fetchUserSidebarMenu = createAsyncThunk(
  'userPermission/fetchUserSidebarMenu',
  async (_, { rejectWithValue }) => {
    try {
      return await userPermissionService.getUserSidebarMenu();
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch sidebar menu');
    }
  }
);

const userPermissionSlice = createSlice({
  name: 'userPermission',
  initialState: {
    userPermissions: null,
    allUsersPermissions: [],
    userWithPermissions: null,
    sidebarMenu: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearUserPermissions(state) {
      state.userPermissions = null;
    },
    clearError(state) {
      state.error = null;
    },
    setSidebarMenu(state, { payload }) {
      state.sidebarMenu = payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch user permissions
      .addCase(fetchUserPermissions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserPermissions.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.userPermissions = payload?.data || payload;
      })
      .addCase(fetchUserPermissions.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      // Set user permissions
      .addCase(setUserPermissions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(setUserPermissions.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(setUserPermissions.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      // Update user permissions
      .addCase(updateUserPermissions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserPermissions.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updateUserPermissions.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      // Delete user permissions
      .addCase(deleteUserPermissions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUserPermissions.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(deleteUserPermissions.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      // Fetch user with permissions
      .addCase(fetchUserWithPermissions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserWithPermissions.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.userWithPermissions = payload?.data || payload;
      })
      .addCase(fetchUserWithPermissions.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      // Fetch all users with permissions
      .addCase(fetchAllUsersWithPermissions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllUsersWithPermissions.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.allUsersPermissions = payload?.data || payload || [];
      })
      .addCase(fetchAllUsersWithPermissions.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      // Fetch user sidebar menu
      .addCase(fetchUserSidebarMenu.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserSidebarMenu.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.sidebarMenu = payload?.data || payload || [];
      })
      .addCase(fetchUserSidebarMenu.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      });
  },
});

export const { clearUserPermissions, clearError, setSidebarMenu } = userPermissionSlice.actions;
export default userPermissionSlice.reducer;