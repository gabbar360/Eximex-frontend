import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import packingListService from '../service/packingListService';

export const fetchPackingLists = createAsyncThunk(
  'packingList/fetchPackingLists',
  async (params = {}, { rejectWithValue }) => {
    try {
      return await packingListService.getAllPackingLists(params);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchPackingListById = createAsyncThunk(
  'packingList/fetchPackingListById',
  async (id, { rejectWithValue }) => {
    try {
      return await packingListService.getPackingListById(id);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const createPackingList = createAsyncThunk(
  'packingList/createPackingList',
  async (packingData, { rejectWithValue }) => {
    try {
      return await packingListService.createPackingList(packingData);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const updatePackingList = createAsyncThunk(
  'packingList/updatePackingList',
  async ({ id, packingData }, { rejectWithValue }) => {
    try {
      return await packingListService.updatePackingList(id, packingData);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const deletePackingList = createAsyncThunk(
  'packingList/deletePackingList',
  async (id, { rejectWithValue }) => {
    try {
      return await packingListService.deletePackingList(id);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const downloadPackingListPdf = createAsyncThunk(
  'packingList/downloadPackingListPdf',
  async (id, { rejectWithValue }) => {
    try {
      return await packingListService.downloadPDF(id);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const downloadBLDraftPdf = createAsyncThunk(
  'packingList/downloadBLDraftPdf',
  async (id, { rejectWithValue }) => {
    try {
      return await packingListService.downloadBLDraftPDF(id);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const getPackingListById = fetchPackingListById;

const packingListSlice = createSlice({
  name: 'packingList',
  initialState: {
    packingLists: [],
    selectedPackingList: null,
    loading: false,
    error: null,
    successMessage: null,
  },
  reducers: {
    setSelectedPackingList(state, { payload }) {
      state.selectedPackingList = payload;
    },
    clearSelectedPackingList(state) {
      state.selectedPackingList = null;
    },
    clearMessages(state) {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPackingLists.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPackingLists.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.packingLists = payload?.data || payload || [];
      })
      .addCase(fetchPackingLists.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      .addCase(fetchPackingListById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPackingListById.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.selectedPackingList = payload?.data || payload;
      })
      .addCase(fetchPackingListById.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      .addCase(createPackingList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPackingList.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.packingLists.unshift(payload.data);
        state.successMessage = payload.message;
      })
      .addCase(createPackingList.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      .addCase(updatePackingList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePackingList.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.packingLists = state.packingLists.map((list) =>
          list.id === payload.data.id ? payload.data : list
        );
        state.successMessage = payload.message;
      })
      .addCase(updatePackingList.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      .addCase(deletePackingList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePackingList.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.packingLists = state.packingLists.filter(
          (list) => list.id !== payload.id
        );
        state.successMessage = payload.message;
      })
      .addCase(deletePackingList.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      });
  },
});

export const {
  setSelectedPackingList,
  clearSelectedPackingList,
  clearMessages,
} = packingListSlice.actions;
export default packingListSlice.reducer;
