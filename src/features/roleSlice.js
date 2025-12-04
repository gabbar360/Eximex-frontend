import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import roleService from '../service/roleService';

// Get all roles
export const getAllRoles = createAsyncThunk(
  'role/getAllRoles',
  async (params = {}, { rejectWithValue }) => {
    try {
      return await roleService.getAllRoles(params);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Create new role
export const createRole = createAsyncThunk(
  'role/createRole',
  async (roleData, { rejectWithValue }) => {
    try {
      return await roleService.createRole(roleData);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Update role
export const updateRole = createAsyncThunk(
  'role/updateRole',
  async ({ id, roleData }, { rejectWithValue }) => {
    try {
      return await roleService.updateRole(id, roleData);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Delete role
export const deleteRole = createAsyncThunk(
  'role/deleteRole',
  async (id, { rejectWithValue }) => {
    try {
      const result = await roleService.deleteRole(id);
      return { ...result, deletedId: id };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const roleSlice = createSlice({
  name: 'role',
  initialState: {
    roles: [],
    loading: false,
    error: null,
    successMessage: null,
    pagination: { total: 0, page: 1, limit: 10, totalPages: 0 },
  },
  reducers: {
    clearRoleError(state) {
      state.error = null;
    },
    clearRoleMessages(state) {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get all roles
      .addCase(getAllRoles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllRoles.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.roles = payload.data?.data || payload.data || [];
        state.pagination = payload.data?.pagination || {
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0,
        };
        state.successMessage = payload.message;
      })
      .addCase(getAllRoles.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })

      // Create role
      .addCase(createRole.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createRole.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.roles.push(payload?.data || payload);
        state.successMessage = payload?.message;
      })
      .addCase(createRole.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })

      // Update role
      .addCase(updateRole.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateRole.fulfilled, (state, { payload }) => {
        state.loading = false;
        const roleData = payload?.data || payload;
        const index = state.roles.findIndex((role) => role.id === roleData.id);
        if (index !== -1) {
          state.roles[index] = roleData;
        }
        state.successMessage = payload?.message;
      })
      .addCase(updateRole.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })

      // Delete role
      .addCase(deleteRole.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteRole.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.roles = state.roles.filter(
          (role) => role.id !== payload.deletedId
        );
        state.successMessage = payload?.message;
      })
      .addCase(deleteRole.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      });
  },
});

export const { clearRoleError, clearRoleMessages } = roleSlice.actions;
export default roleSlice.reducer;
