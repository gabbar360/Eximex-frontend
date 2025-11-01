import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import vgmService from '../service/vgmService';

export const fetchVgmDocuments = createAsyncThunk(
  'vgm/fetchVgmDocuments',
  async (params = {}, { rejectWithValue }) => {
    try {
      return await vgmService.getAllVgmDocuments(params);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchVgmById = createAsyncThunk(
  'vgm/fetchVgmById',
  async (id, { rejectWithValue }) => {
    try {
      return await vgmService.getVgmById(id);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const createVgm = createAsyncThunk(
  'vgm/createVgm',
  async (vgmData, { rejectWithValue }) => {
    try {
      return await vgmService.createVgm(vgmData);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateVgm = createAsyncThunk(
  'vgm/updateVgm',
  async ({ id, vgmData }, { rejectWithValue }) => {
    try {
      return await vgmService.updateVgm(id, vgmData);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const deleteVgm = createAsyncThunk(
  'vgm/deleteVgm',
  async (id, { rejectWithValue }) => {
    try {
      return await vgmService.deleteVgm(id);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const downloadVgmPdf = createAsyncThunk(
  'vgm/downloadVgmPdf',
  async (id, { rejectWithValue }) => {
    try {
      return await vgmService.downloadVgmPdf(id);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const vgmSlice = createSlice({
  name: 'vgm',
  initialState: {
    vgmDocuments: [],
    selectedVgm: null,
    loading: false,
    error: null,
    successMessage: null,
  },
  reducers: {
    setSelectedVgm(state, { payload }) {
      state.selectedVgm = payload;
    },
    clearSelectedVgm(state) {
      state.selectedVgm = null;
    },
    clearMessages(state) {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVgmDocuments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVgmDocuments.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.vgmDocuments = payload?.data || payload || [];
      })
      .addCase(fetchVgmDocuments.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      .addCase(fetchVgmById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVgmById.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.selectedVgm = payload?.data || payload;
      })
      .addCase(fetchVgmById.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      .addCase(createVgm.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createVgm.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.vgmDocuments.unshift(payload.data);
        state.successMessage = payload.message;
      })
      .addCase(createVgm.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      .addCase(updateVgm.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateVgm.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.vgmDocuments = state.vgmDocuments.map((vgm) =>
          vgm.id === payload.data.id ? payload.data : vgm
        );
        state.successMessage = payload.message;
      })
      .addCase(updateVgm.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      .addCase(deleteVgm.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteVgm.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.vgmDocuments = state.vgmDocuments.filter((vgm) => vgm.id !== payload.id);
        state.successMessage = payload.message;
      })
      .addCase(deleteVgm.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      });
  },
});

export const { setSelectedVgm, clearSelectedVgm, clearMessages } = vgmSlice.actions;
export default vgmSlice.reducer;