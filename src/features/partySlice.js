import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import partyService from '../service/partyService';

export const fetchParties = createAsyncThunk(
  'party/fetchParties',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await partyService.getAllParties(params);
      return response;
    } catch (err) {
      console.error('Fetch parties error:', err);
      return rejectWithValue(err.message);
    }
  }
);

export const fetchPartyById = createAsyncThunk(
  'party/fetchPartyById',
  async (id, { rejectWithValue }) => {
    try {
      return await partyService.getPartyById(id);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const addParty = createAsyncThunk(
  'party/addParty',
  async (party, { rejectWithValue }) => {
    try {
      const response = await partyService.createParty(party);
      return response;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateParty = createAsyncThunk(
  'party/updateParty',
  async ({ id, party }, { rejectWithValue }) => {
    try {
      const response = await partyService.updateParty(id, party);
      return response;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const deleteParty = createAsyncThunk(
  'party/deleteParty',
  async (id, { rejectWithValue }) => {
    try {
      const response = await partyService.deleteParty(id);
      return { id, message: response.message };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const updatePartyStage = createAsyncThunk(
  'party/updatePartyStage',
  async ({ id, stage }, { rejectWithValue }) => {
    try {
      const response = await partyService.updatePartyStage(id, stage);
      return response;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const getAllParties = createAsyncThunk(
  'party/getAllParties',
  async (_, { rejectWithValue }) => {
    try {
      return await partyService.getAllParties();
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const getPartyById = createAsyncThunk(
  'party/getPartyById',
  async (id, { rejectWithValue }) => {
    try {
      return await partyService.getPartyById(id);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const createParty = createAsyncThunk(
  'party/createParty',
  async (partyData, { rejectWithValue }) => {
    try {
      return await partyService.createParty(partyData);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const partySlice = createSlice({
  name: 'party',
  initialState: {
    parties: [],
    loading: false,
    error: null,
    selectedParty: null,
    successMessage: null,
    pagination: {
      current: 1,
      pageSize: 10,
      total: 0,
    },
  },
  reducers: {
    setSelectedParty(state, { payload }) {
      state.selectedParty = payload;
    },
    clearSelectedParty(state) {
      state.selectedParty = null;
    },
    clearMessages(state) {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchParties.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchParties.fulfilled, (state, { payload }) => {
        state.loading = false;

        // Handle the response structure with data.data
        let parties = [];
        let pagination = { current: 1, pageSize: 10, total: 0 };

        if (payload?.data?.data && Array.isArray(payload.data.data)) {
          parties = payload.data.data;
          // Handle backend pagination data
          if (payload.data.pagination) {
            pagination = {
              current:
                payload.data.pagination.currentPage ||
                payload.data.pagination.page ||
                1,
              pageSize:
                payload.data.pagination.limit ||
                payload.data.pagination.pageSize ||
                10,
              total:
                payload.data.pagination.total ||
                payload.data.pagination.totalItems ||
                0,
            };
          }
        } else if (payload?.data && Array.isArray(payload.data)) {
          parties = payload.data;
        } else if (Array.isArray(payload)) {
          parties = payload;
        }

        state.parties = parties;
        state.pagination = pagination;
      })
      .addCase(fetchParties.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      .addCase(addParty.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addParty.fulfilled, (state, { payload }) => {
        state.loading = false;
        if (Array.isArray(state.parties)) {
          state.parties.unshift(payload.data);
        } else {
          state.parties = [payload.data];
        }
        state.successMessage = payload.message;
      })
      .addCase(addParty.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      .addCase(updateParty.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateParty.fulfilled, (state, { payload }) => {
        state.loading = false;
        if (Array.isArray(state.parties)) {
          state.parties = state.parties.map((p) =>
            p.id === payload.data.id ? payload.data : p
          );
        } else {
          state.parties = [];
        }
        state.successMessage = payload.message;
      })
      .addCase(updateParty.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      .addCase(updatePartyStage.pending, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(updatePartyStage.fulfilled, (state, { payload }) => {
        state.loading = false;
        if (Array.isArray(state.parties)) {
          state.parties = state.parties.map((p) =>
            p.id === payload.data.id ? payload.data : p
          );
        }
        state.successMessage = payload.message;
      })
      .addCase(updatePartyStage.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })

      .addCase(deleteParty.pending, (state) => {
        state.loading = false; // Don't show global loading for delete
        state.error = null;
      })
      .addCase(deleteParty.fulfilled, (state, { payload }) => {
        state.loading = false;
        if (Array.isArray(state.parties)) {
          state.parties = state.parties.filter((p) => p.id !== payload.id);
        } else {
          state.parties = [];
        }
        state.successMessage = payload.message;
      })
      .addCase(deleteParty.rejected, (state) => {
        state.loading = false;
        state.error = null; // Don't set global error for delete
      })
      .addCase(getAllParties.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllParties.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.parties = payload?.data?.data || payload?.data || payload || [];
      })
      .addCase(getAllParties.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      .addCase(getPartyById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPartyById.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.selectedParty = payload?.data || payload;
      })
      .addCase(getPartyById.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      .addCase(createParty.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createParty.fulfilled, (state, { payload }) => {
        state.loading = false;
        if (Array.isArray(state.parties)) {
          state.parties.unshift(payload?.data || payload);
        } else {
          state.parties = [payload?.data || payload];
        }
        state.successMessage = payload.message;
      })
      .addCase(createParty.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      });
  },
});

export const { setSelectedParty, clearSelectedParty, clearMessages } =
  partySlice.actions;
export default partySlice.reducer;
