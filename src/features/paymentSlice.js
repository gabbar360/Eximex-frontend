import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import paymentService from '../service/paymentService';

export const fetchPayments = createAsyncThunk(
  'payment/fetchPayments',
  async (params = {}, { rejectWithValue }) => {
    try {
      return await paymentService.getAllPayments(params);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchPaymentById = createAsyncThunk(
  'payment/fetchPaymentById',
  async (id, { rejectWithValue }) => {
    try {
      return await paymentService.getPaymentById(id);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const createPayment = createAsyncThunk(
  'payment/createPayment',
  async (paymentData, { rejectWithValue }) => {
    try {
      return await paymentService.createPayment(paymentData);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const updatePayment = createAsyncThunk(
  'payment/updatePayment',
  async ({ id, paymentData }, { rejectWithValue }) => {
    try {
      return await paymentService.updatePayment(id, paymentData);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const deletePayment = createAsyncThunk(
  'payment/deletePayment',
  async (id, { rejectWithValue }) => {
    try {
      return await paymentService.deletePayment(id);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const paymentSlice = createSlice({
  name: 'payment',
  initialState: {
    payments: [],
    selectedPayment: null,
    loading: false,
    error: null,
    successMessage: null,
  },
  reducers: {
    setSelectedPayment(state, { payload }) {
      state.selectedPayment = payload;
    },
    clearSelectedPayment(state) {
      state.selectedPayment = null;
    },
    clearMessages(state) {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPayments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPayments.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.payments = payload?.data || payload || [];
      })
      .addCase(fetchPayments.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      .addCase(fetchPaymentById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPaymentById.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.selectedPayment = payload?.data || payload;
      })
      .addCase(fetchPaymentById.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      .addCase(createPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPayment.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.payments.unshift(payload.data);
        state.successMessage = payload.message;
      })
      .addCase(createPayment.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      .addCase(updatePayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePayment.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.payments = state.payments.map((payment) =>
          payment.id === payload.data.id ? payload.data : payment
        );
        state.successMessage = payload.message;
      })
      .addCase(updatePayment.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      .addCase(deletePayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePayment.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.payments = state.payments.filter((payment) => payment.id !== payload.id);
        state.successMessage = payload.message;
      })
      .addCase(deletePayment.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      });
  },
});

export const { setSelectedPayment, clearSelectedPayment, clearMessages } = paymentSlice.actions;
export default paymentSlice.reducer;