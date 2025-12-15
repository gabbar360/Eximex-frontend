import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import taskManagementService from '../service/taskManagementService';

// Get tasks
export const getTasks = createAsyncThunk(
  'task/getTasks',
  async (params = {}, { rejectWithValue }) => {
    console.log('📦 Redux getTasks thunk called with params:', params);
    try {
      const result = await taskManagementService.getTasks(params);
      console.log('✅ Redux thunk success:', result);
      return result;
    } catch (err) {
      console.error('❌ Redux thunk error:', err);
      return rejectWithValue(err.message);
    }
  }
);

// Create task
export const createTask = createAsyncThunk(
  'task/createTask',
  async (taskData, { rejectWithValue }) => {
    try {
      return await taskManagementService.createTask(taskData);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Update complete task
export const updateTask = createAsyncThunk(
  'task/updateTask',
  async ({ taskId, taskData }, { rejectWithValue }) => {
    try {
      return await taskManagementService.updateTask(taskId, taskData);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Get task by ID
export const getTaskById = createAsyncThunk(
  'task/getTaskById',
  async (taskId, { rejectWithValue }) => {
    try {
      return await taskManagementService.getTaskById(taskId);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Delete task
export const deleteTask = createAsyncThunk(
  'task/deleteTask',
  async (taskId, { rejectWithValue }) => {
    try {
      await taskManagementService.deleteTask(taskId);
      return taskId;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Get staff list
export const getStaffList = createAsyncThunk(
  'task/getStaffList',
  async (_, { rejectWithValue }) => {
    try {
      return await taskManagementService.getStaffList();
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const taskManagementSlice = createSlice({
  name: 'taskManagement',
  initialState: {
    tasks: [],
    currentTask: null,
    staffList: [],
    loading: false,
    error: null,
    pagination: { total: 0, page: 1, limit: 10, totalPages: 0 },
  },
  reducers: {
    clearTaskError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get tasks
      .addCase(getTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTasks.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.tasks = payload.data?.data || [];
        state.pagination = payload.data?.pagination || {};
      })
      .addCase(getTasks.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })

      // Create task
      .addCase(createTask.fulfilled, (state, { payload }) => {
        state.tasks.unshift(payload.data);
      })

      // Update complete task
      .addCase(updateTask.fulfilled, (state, { payload }) => {
        const index = state.tasks.findIndex(task => task.id === payload.data.id);
        if (index !== -1) {
          state.tasks[index] = payload.data;
        }
        if (state.currentTask?.id === payload.data.id) {
          state.currentTask = payload.data;
        }
      })

      // Get task by ID
      .addCase(getTaskById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getTaskById.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.currentTask = payload.data;
      })
      .addCase(getTaskById.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })

      // Delete task
      .addCase(deleteTask.fulfilled, (state, { payload }) => {
        state.tasks = state.tasks.filter(task => task.id !== payload);
      })

      // Get staff list
      .addCase(getStaffList.fulfilled, (state, { payload }) => {
        state.staffList = payload.data || [];
      });
  },
});

export const { clearTaskError } = taskManagementSlice.actions;
export default taskManagementSlice.reducer;