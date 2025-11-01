import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import orderService from '../service/orderService';

export const fetchOrders = createAsyncThunk(
  'order/fetchOrders',
  async (params = {}, { rejectWithValue }) => {
    try {
      return await orderService.getAllOrders(params);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchOrderById = createAsyncThunk(
  'order/fetchOrderById',
  async (id, { rejectWithValue }) => {
    try {
      return await orderService.getOrderById(id);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const createOrder = createAsyncThunk(
  'order/createOrder',
  async (orderData, { rejectWithValue }) => {
    try {
      return await orderService.createOrder(orderData);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const createOrderFromPi = createAsyncThunk(
  'order/createOrderFromPi',
  async (piId, { rejectWithValue }) => {
    try {
      return await orderService.createOrderFromPi(piId);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateOrder = createAsyncThunk(
  'order/updateOrder',
  async ({ id, orderData }, { rejectWithValue }) => {
    try {
      return await orderService.updateOrder(id, orderData);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateOrderStatus = createAsyncThunk(
  'order/updateOrderStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      return await orderService.updateOrderStatus(id, status);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const updatePaymentStatus = createAsyncThunk(
  'order/updatePaymentStatus',
  async ({ id, paymentStatus }, { rejectWithValue }) => {
    try {
      return await orderService.updatePaymentStatus(id, paymentStatus);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const deleteOrder = createAsyncThunk(
  'order/deleteOrder',
  async (id, { rejectWithValue }) => {
    try {
      return await orderService.deleteOrder(id);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const downloadOrderInvoice = createAsyncThunk(
  'order/downloadOrderInvoice',
  async (id, { rejectWithValue }) => {
    try {
      return await orderService.downloadOrderInvoicePdf(id);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const downloadOrderInvoicePdf = downloadOrderInvoice;

export const getOrderById = fetchOrderById;

const orderSlice = createSlice({
  name: 'order',
  initialState: {
    orders: [],
    selectedOrder: null,
    loading: false,
    error: null,
    successMessage: null,
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      pages: 0,
    },
  },
  reducers: {
    setSelectedOrder(state, { payload }) {
      state.selectedOrder = payload;
    },
    clearSelectedOrder(state) {
      state.selectedOrder = null;
    },
    clearMessages(state) {
      state.error = null;
      state.successMessage = null;
    },
    setPagination(state, { payload }) {
      state.pagination = payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.orders = payload?.data?.orders || payload?.orders || payload?.data || [];
        state.pagination = payload?.data?.pagination || payload?.pagination || state.pagination;
      })
      .addCase(fetchOrders.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      .addCase(fetchOrderById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.selectedOrder = payload;
      })
      .addCase(fetchOrderById.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.orders.unshift(payload.data);
        state.successMessage = payload.message;
      })
      .addCase(createOrder.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      .addCase(createOrderFromPi.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrderFromPi.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.orders.unshift(payload.data);
        state.successMessage = payload.message;
      })
      .addCase(createOrderFromPi.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      .addCase(updateOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOrder.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.orders = state.orders.map((order) =>
          order.id === payload.data.id ? payload.data : order
        );
        state.successMessage = payload.message;
      })
      .addCase(updateOrder.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      .addCase(updateOrderStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.orders = state.orders.map((order) =>
          order.id === payload.data.id ? payload.data : order
        );
        state.successMessage = payload.message;
      })
      .addCase(updateOrderStatus.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      .addCase(updatePaymentStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePaymentStatus.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.orders = state.orders.map((order) =>
          order.id === payload.data.id ? payload.data : order
        );
        state.successMessage = payload.message;
      })
      .addCase(updatePaymentStatus.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      .addCase(deleteOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteOrder.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.orders = state.orders.filter((order) => order.id !== payload.id);
        state.successMessage = payload.message;
      })
      .addCase(deleteOrder.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      });
  },
});

export const { setSelectedOrder, clearSelectedOrder, clearMessages, setPagination } =
  orderSlice.actions;
export default orderSlice.reducer;