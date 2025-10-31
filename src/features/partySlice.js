import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import partyService from '../service/partyService';

export const fetchParties = createAsyncThunk(
  'party/fetchParties',
  async (_, { rejectWithValue }) => {
    try {
      return await partyService.getAllParties();
    } catch (err) {
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
      return rejectWithValue(err.message);
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

const partySlice = createSlice({
  name: 'party',
  initialState: {
    parties: [],
    loading: false,
    error: null,
    selectedParty: null,
    successMessage: null,
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
        state.parties = payload || [];
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
        state.parties.unshift(payload.data);
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
        state.parties = state.parties.map((p) =>
          p.id === payload.data.id ? payload.data : p
        );
        state.successMessage = payload.message;
      })
      .addCase(updateParty.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      .addCase(deleteParty.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteParty.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.parties = state.parties.filter((p) => p.id !== payload.id);
        state.successMessage = payload.message;
      })
      .addCase(deleteParty.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      });
  },
});

export const { setSelectedParty, clearSelectedParty, clearMessages } =
  partySlice.actions;
export default partySlice.reducer;
