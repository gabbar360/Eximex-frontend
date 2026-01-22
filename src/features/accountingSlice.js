import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import accountingService from '../service/accountingService';

export const fetchLedger = createAsyncThunk(
  'accounting/fetchLedger',
  async (params = {}, { rejectWithValue }) => {
    try {
      return await accountingService.getLedger(params);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchProfitLoss = createAsyncThunk(
  'accounting/fetchProfitLoss',
  async (params = {}, { rejectWithValue }) => {
    try {
      return await accountingService.getProfitLoss(params);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchBalanceSheet = createAsyncThunk(
  'accounting/fetchBalanceSheet',
  async (params = {}, { rejectWithValue }) => {
    try {
      return await accountingService.getBalanceSheet(params);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const accountingSlice = createSlice({
  name: 'accounting',
  initialState: {
    ledger: null,
    profitLoss: null,
    balanceSheet: null,
    loading: false,
    error: null,
    successMessage: null,
  },
  reducers: {
    clearAccountingError(state) {
      state.error = null;
    },
    clearAccountingMessages(state) {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLedger.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLedger.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.ledger = payload.data || payload;
        state.successMessage = payload.message;
      })
      .addCase(fetchLedger.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      .addCase(fetchProfitLoss.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfitLoss.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.profitLoss = payload.data || payload;
        state.successMessage = payload.message;
      })
      .addCase(fetchProfitLoss.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      .addCase(fetchBalanceSheet.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBalanceSheet.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.balanceSheet = payload.data || payload;
        state.successMessage = payload.message;
      })
      .addCase(fetchBalanceSheet.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      });
  },
});

export const { clearAccountingError, clearAccountingMessages } =
  accountingSlice.actions;
export default accountingSlice.reducer;
