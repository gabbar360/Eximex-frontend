import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import packagingService from '../service/packagingService';

export const fetchPackagingUnits = createAsyncThunk(
  'packaging/fetchPackagingUnits',
  async (_, { rejectWithValue }) => {
    try {
      return await packagingService.getAllPackagingUnits();
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchAllPackagingUnits = fetchPackagingUnits;

export const createPackagingUnits = createAsyncThunk(
  'packaging/createPackagingUnits',
  async (_, { rejectWithValue }) => {
    try {
      return await packagingService.createPackagingUnits();
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const createPackagingHierarchy = createAsyncThunk(
  'packaging/createPackagingHierarchy',
  async ({ categoryId, packagingLevels }, { rejectWithValue }) => {
    try {
      return await packagingService.createPackagingHierarchy(
        categoryId,
        packagingLevels
      );
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchPackagingHierarchy = createAsyncThunk(
  'packaging/fetchPackagingHierarchy',
  async (categoryId, { rejectWithValue }) => {
    try {
      return await packagingService.getPackagingHierarchy(categoryId);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const packagingSlice = createSlice({
  name: 'packaging',
  initialState: {
    packagingUnits: [],
    packagingHierarchy: null,
    loading: false,
    error: null,
    successMessage: null,
  },
  reducers: {
    setPackagingHierarchy(state, { payload }) {
      state.packagingHierarchy = payload;
    },
    clearPackagingHierarchy(state) {
      state.packagingHierarchy = null;
    },
    clearMessages(state) {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPackagingUnits.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPackagingUnits.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.packagingUnits = payload?.data || payload || [];
      })
      .addCase(fetchPackagingUnits.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      .addCase(createPackagingUnits.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPackagingUnits.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.successMessage = payload.message;
      })
      .addCase(createPackagingUnits.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      .addCase(createPackagingHierarchy.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPackagingHierarchy.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.successMessage = payload.message;
      })
      .addCase(createPackagingHierarchy.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      .addCase(fetchPackagingHierarchy.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPackagingHierarchy.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.packagingHierarchy = payload?.data || payload;
      })
      .addCase(fetchPackagingHierarchy.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      });
  },
});

export const { setPackagingHierarchy, clearPackagingHierarchy, clearMessages } =
  packagingSlice.actions;
export default packagingSlice.reducer;
