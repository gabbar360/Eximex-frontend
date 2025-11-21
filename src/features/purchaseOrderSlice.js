import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import purchaseOrderService from '../service/purchaseOrderService';

export const fetchPurchaseOrders = createAsyncThunk(
  'purchaseOrder/fetchPurchaseOrders',
  async (params = {}, { rejectWithValue }) => {
    try {
      return await purchaseOrderService.getAllPurchaseOrders(params);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchPurchaseOrderById = createAsyncThunk(
  'purchaseOrder/fetchPurchaseOrderById',
  async (id, { rejectWithValue }) => {
    try {
      return await purchaseOrderService.getPurchaseOrderById(id);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const createPurchaseOrder = createAsyncThunk(
  'purchaseOrder/createPurchaseOrder',
  async (poData, { rejectWithValue }) => {
    try {
      return await purchaseOrderService.createPurchaseOrder(poData);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const updatePurchaseOrder = createAsyncThunk(
  'purchaseOrder/updatePurchaseOrder',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await purchaseOrderService.updatePurchaseOrder(id, data);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const deletePurchaseOrder = createAsyncThunk(
  'purchaseOrder/deletePurchaseOrder',
  async (id, { rejectWithValue }) => {
    try {
      return await purchaseOrderService.deletePurchaseOrder(id);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const downloadPurchaseOrderPDF = createAsyncThunk(
  'purchaseOrder/downloadPurchaseOrderPDF',
  async (id, { rejectWithValue }) => {
    try {
      return await purchaseOrderService.downloadPurchaseOrderPDF(id);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const getFormData = createAsyncThunk(
  'purchaseOrder/getFormData',
  async (_, { rejectWithValue }) => {
    try {
      return await purchaseOrderService.getFormData();
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const getPurchaseOrders = fetchPurchaseOrders;
export const getPurchaseOrderById = fetchPurchaseOrderById;

const purchaseOrderSlice = createSlice({
  name: 'purchaseOrder',
  initialState: {
    purchaseOrders: [],
    selectedPurchaseOrder: null,
    loading: false,
    error: null,
    successMessage: null,
  },
  reducers: {
    setSelectedPurchaseOrder(state, { payload }) {
      state.selectedPurchaseOrder = payload;
    },
    clearSelectedPurchaseOrder(state) {
      state.selectedPurchaseOrder = null;
    },
    clearMessages(state) {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPurchaseOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPurchaseOrders.fulfilled, (state, { payload }) => {
        state.loading = false;
        // Handle different response structures
        if (payload?.data?.purchaseOrders) {
          state.purchaseOrders = payload.data.purchaseOrders;
        } else if (payload?.purchaseOrders) {
          state.purchaseOrders = payload.purchaseOrders;
        } else {
          state.purchaseOrders = payload?.data || payload || [];
        }
      })
      .addCase(fetchPurchaseOrders.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      .addCase(fetchPurchaseOrderById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPurchaseOrderById.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.selectedPurchaseOrder = payload?.data || payload;
      })
      .addCase(fetchPurchaseOrderById.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      .addCase(createPurchaseOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPurchaseOrder.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.purchaseOrders.unshift(payload.data);
        state.successMessage = payload.message;
      })
      .addCase(createPurchaseOrder.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      .addCase(updatePurchaseOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePurchaseOrder.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.purchaseOrders = state.purchaseOrders.map((po) =>
          po.id === payload.data.id ? payload.data : po
        );
        state.successMessage = payload.message;
      })
      .addCase(updatePurchaseOrder.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      .addCase(deletePurchaseOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePurchaseOrder.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.purchaseOrders = state.purchaseOrders.filter((po) => po.id !== payload.id);
        state.successMessage = payload.message;
      })
      .addCase(deletePurchaseOrder.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      });
  },
});

export const { setSelectedPurchaseOrder, clearSelectedPurchaseOrder, clearMessages } =
  purchaseOrderSlice.actions;
export default purchaseOrderSlice.reducer;