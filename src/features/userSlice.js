import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import userService from '../service/userService';

export const getCompanyStaff = createAsyncThunk(
  'user/getCompanyStaff',
  async (_, { rejectWithValue }) => {
    try {
      return await userService.getCompanyStaff();
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const getAssignableData = createAsyncThunk(
  'user/getAssignableData',
  async ({ userId, entityType }, { rejectWithValue }) => {
    try {
      return await userService.getAssignableData(userId, entityType);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const assignData = createAsyncThunk(
  'user/assignData',
  async (
    { entityType, itemIds, fromUserId, toUserId },
    { rejectWithValue }
  ) => {
    try {
      return await userService.assignData(
        entityType,
        itemIds,
        fromUserId,
        toUserId
      );
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const createUser = createAsyncThunk(
  'user/createUser',
  async (userData, { rejectWithValue }) => {
    try {
      return await userService.createUser(userData);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateUser = createAsyncThunk(
  'user/updateUser',
  async ({ id, userData }, { rejectWithValue }) => {
    try {
      return await userService.updateUser(id, userData);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const deleteUser = createAsyncThunk(
  'user/deleteUser',
  async (id, { rejectWithValue }) => {
    try {
      return await userService.deleteUser(id);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const getAllUsers = createAsyncThunk(
  'user/getAllUsers',
  async (params = {}, { rejectWithValue }) => {
    try {
      return await userService.getAllUsers(params);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const deleteStaffAndReassign = createAsyncThunk(
  'user/deleteStaffAndReassign',
  async ({ staffId, reassignToUserId }, { rejectWithValue }) => {
    try {
      return await userService.deleteStaffAndReassign(
        staffId,
        reassignToUserId
      );
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const getUserDataSummary = createAsyncThunk(
  'user/getUserDataSummary',
  async (id, { rejectWithValue }) => {
    try {
      return await userService.getUserDataSummary(id);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const getCompanyDashboardStats = createAsyncThunk(
  'user/getCompanyDashboardStats',
  async (_, { rejectWithValue }) => {
    try {
      return await userService.getCompanyDashboardStats();
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const getSuperAdminDashboardStats = createAsyncThunk(
  'user/getSuperAdminDashboardStats',
  async (_, { rejectWithValue }) => {
    try {
      return await userService.getSuperAdminDashboardStats();
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const getUserStats = createAsyncThunk(
  'user/getUserStats',
  async (_, { rejectWithValue }) => {
    try {
      return await userService.getUserStats();
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const getAllUsersForSuperAdmin = createAsyncThunk(
  'user/getAllUsersForSuperAdmin',
  async (params = {}, { rejectWithValue }) => {
    try {
      return await userService.getAllUsersForSuperAdmin(params);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const toggleUserBlock = createAsyncThunk(
  'user/toggleUserBlock',
  async (userId, { rejectWithValue }) => {
    try {
      return await userService.toggleUserBlock(userId);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const getAllDatabaseData = createAsyncThunk(
  'user/getAllDatabaseData',
  async (params = {}, { rejectWithValue }) => {
    try {
      return await userService.getAllDatabaseData(params);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const resetUserPassword = createAsyncThunk(
  'user/resetUserPassword',
  async ({ userId, newPassword }, { rejectWithValue }) => {
    try {
      return await userService.resetUserPassword(userId, newPassword);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const getAllCompanies = createAsyncThunk(
  'user/getAllCompanies',
  async (params = {}, { rejectWithValue }) => {
    try {
      return await userService.getAllCompanies(params);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const getCompanyDetails = createAsyncThunk(
  'user/getCompanyDetails',
  async (companyId, { rejectWithValue }) => {
    try {
      return await userService.getCompanyDetails(companyId);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  'user/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      return await userService.getCurrentUser();
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState: {
    user: null,
    isAuthenticated: false,
  },
  reducers: {
    setUser(state, { payload }) {
      state.user = payload;
      state.isAuthenticated = true;
    },

    clearUser(state) {
      state.user = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
