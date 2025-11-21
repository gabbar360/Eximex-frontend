import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import piService from '../service/piService';

export const fetchPiInvoices = createAsyncThunk(
  'pi/fetchPiInvoices',
  async (params = {}, { rejectWithValue }) => {
    try {
      return await piService.getAllPiInvoices(params);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchPiInvoiceById = createAsyncThunk(
  'pi/fetchPiInvoiceById',
  async (id, { rejectWithValue }) => {
    try {
      return await piService.getPiInvoiceById(id);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchPiInvoiceHistory = createAsyncThunk(
  'pi/fetchPiInvoiceHistory',
  async (id, { rejectWithValue }) => {
    try {
      return await piService.getPiInvoiceHistory(id);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const createPiInvoice = createAsyncThunk(
  'pi/createPiInvoice',
  async (piData, { rejectWithValue }) => {
    try {
      return await piService.createPiInvoice(piData);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const updatePiInvoice = createAsyncThunk(
  'pi/updatePiInvoice',
  async ({ id, piData }, { rejectWithValue }) => {
    try {
      return await piService.updatePiInvoice(id, piData);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const updatePiStatus = createAsyncThunk(
  'pi/updatePiStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const result = await piService.updatePiStatus(id, status);
      return { id, status, ...result };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const deletePiInvoice = createAsyncThunk(
  'pi/deletePiInvoice',
  async (id, { rejectWithValue }) => {
    try {
      return await piService.deletePiInvoice(id);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const downloadPiInvoicePdf = createAsyncThunk(
  'pi/downloadPiInvoicePdf',
  async (id, { rejectWithValue }) => {
    try {
      return await piService.downloadPiInvoicePdf(id);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const updatePiAmount = createAsyncThunk(
  'pi/updatePiAmount',
  async ({ id, amountData }, { rejectWithValue }) => {
    try {
      return await piService.updatePiAmount(id, amountData);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const emailInvoice = createAsyncThunk(
  'pi/emailInvoice',
  async ({ id, email }, { rejectWithValue }) => {
    try {
      return await piService.emailInvoice(id, email);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const getAllPiInvoices = createAsyncThunk(
  'pi/getAllPiInvoices',
  async (_, { rejectWithValue }) => {
    try {
      return await piService.getAllPiInvoices();
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const getPiInvoiceById = fetchPiInvoiceById;

const piSlice = createSlice({
  name: 'pi',
  initialState: {
    piInvoices: [],
    selectedPi: null,
    piHistory: [],
    loading: false,
    error: null,
    successMessage: null,
    pagination: {
      current: 1,
      pageSize: 10,
      total: 0,
    },
  },
  reducers: {
    setSelectedPi(state, { payload }) {
      state.selectedPi = payload;
    },
    clearSelectedPi(state) {
      state.selectedPi = null;
    },
    clearMessages(state) {
      state.error = null;
      state.successMessage = null;
    },
    clearPiHistory(state) {
      state.piHistory = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPiInvoices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPiInvoices.fulfilled, (state, { payload }) => {
        state.loading = false;
        const responseData = payload?.data || payload;
        state.piInvoices = responseData?.piInvoices || responseData || [];
        state.pagination = {
          current: responseData?.pagination?.page || 1,
          pageSize: responseData?.pagination?.limit || 10,
          total: responseData?.pagination?.total || 0,
        };
      })
      .addCase(fetchPiInvoices.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      .addCase(fetchPiInvoiceById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPiInvoiceById.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.selectedPi = payload?.data || payload;
      })
      .addCase(fetchPiInvoiceById.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      .addCase(fetchPiInvoiceHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPiInvoiceHistory.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.piHistory = payload || [];
      })
      .addCase(fetchPiInvoiceHistory.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      .addCase(createPiInvoice.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPiInvoice.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.piInvoices.unshift(payload.data);
        state.successMessage = payload.message;
      })
      .addCase(createPiInvoice.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      .addCase(updatePiInvoice.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePiInvoice.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.piInvoices = state.piInvoices.map((pi) =>
          pi.id === payload.data.id ? payload.data : pi
        );
        state.successMessage = payload.message;
      })
      .addCase(updatePiInvoice.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      .addCase(updatePiStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePiStatus.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.piInvoices = state.piInvoices.map((pi) =>
          pi.id === payload.id ? { ...pi, status: payload.status } : pi
        );
        state.successMessage = 'Status updated successfully';
      })
      .addCase(updatePiStatus.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      .addCase(deletePiInvoice.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePiInvoice.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.piInvoices = state.piInvoices.filter((pi) => pi.id !== payload.id);
        state.successMessage = payload.message;
      })
      .addCase(deletePiInvoice.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      .addCase(emailInvoice.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(emailInvoice.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.successMessage = payload.message || 'Email sent successfully';
      })
      .addCase(emailInvoice.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      .addCase(updatePiAmount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePiAmount.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.successMessage = payload.message || 'Amount updated successfully';
      })
      .addCase(updatePiAmount.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      .addCase(getAllPiInvoices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllPiInvoices.fulfilled, (state, { payload }) => {
        state.loading = false;
        const responseData = payload?.data || payload;
        state.piInvoices = responseData?.piInvoices || responseData || [];
        state.pagination = {
          current: responseData?.pagination?.page || 1,
          pageSize: responseData?.pagination?.limit || 10,
          total: responseData?.pagination?.total || 0,
        };
      })
      .addCase(getAllPiInvoices.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      });
  },
});

export const { setSelectedPi, clearSelectedPi, clearMessages, clearPiHistory } =
  piSlice.actions;
export default piSlice.reducer;