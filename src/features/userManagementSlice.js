import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { userService } from '../service/userService';

export const fetchUsers = createAsyncThunk(
  'userManagement/fetchUsers',
  async (params = {}, { rejectWithValue }) => {
    try {
      return await userService.getAllUsers(params);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchUserById = createAsyncThunk(
  'userManagement/fetchUserById',
  async (id, { rejectWithValue }) => {
    try {
      return await userService.getUser(id);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const createUser = createAsyncThunk(
  'userManagement/createUser',
  async (userData, { rejectWithValue }) => {
    try {
      return await userService.createUser(userData);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateUser = createAsyncThunk(
  'userManagement/updateUser',
  async ({ id, userData }, { rejectWithValue }) => {
    try {
      return await userService.updateUser(id, userData);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const deleteUser = createAsyncThunk(
  'userManagement/deleteUser',
  async (id, { rejectWithValue }) => {
    try {
      const result = await userService.deleteUser(id);
      return { ...result, deletedId: id };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const userManagementSlice = createSlice({
  name: 'userManagement',
  initialState: {
    users: [],
    selectedUser: null,
    loading: false,
    error: null,
    successMessage: null,
  },
  reducers: {
    setSelectedUser(state, { payload }) {
      state.selectedUser = payload;
    },
    clearSelectedUser(state) {
      state.selectedUser = null;
    },
    clearMessages(state) {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.users = payload?.data || payload || [];
      })
      .addCase(fetchUsers.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      .addCase(fetchUserById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserById.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.selectedUser = payload?.data || payload;
      })
      .addCase(fetchUserById.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      .addCase(createUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.users.unshift(payload?.data || payload);
        state.successMessage = payload?.message;
      })
      .addCase(createUser.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, { payload }) => {
        state.loading = false;
        const userData = payload?.data || payload;
        state.users = state.users.map((user) =>
          user.id === userData.id ? userData : user
        );
        state.successMessage = payload?.message;
      })
      .addCase(updateUser.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.users = state.users.filter(
          (user) => user.id !== payload.deletedId
        );
        state.successMessage = payload?.message;
      })
      .addCase(deleteUser.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      });
  },
});

export const { setSelectedUser, clearSelectedUser, clearMessages } =
  userManagementSlice.actions;
export default userManagementSlice.reducer;
