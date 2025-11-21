import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { shipmentService } from '../service/shipmentService';
import handleAxiosError from '../utils/handleAxiosError';

// Async thunks
export const createShipment = createAsyncThunk(
  'shipment/create',
  async (shipmentData, { rejectWithValue }) => {
    try {
      const { data } = await shipmentService.create(shipmentData);
      return data;
    } catch (error) {
      return rejectWithValue(handleAxiosError(error, 'shipment', 'create'));
    }
  }
);

export const getShipmentById = createAsyncThunk(
  'shipment/getById',
  async (shipmentId, { rejectWithValue }) => {
    try {
      const { data } = await shipmentService.getById(shipmentId);
      return data;
    } catch (error) {
      return rejectWithValue(handleAxiosError(error, 'shipment', 'fetch'));
    }
  }
);

export const getShipmentByOrderId = createAsyncThunk(
  'shipment/getByOrderId',
  async (orderId, { rejectWithValue }) => {
    try {
      const { data } = await shipmentService.getByOrderId(orderId);
      return data;
    } catch (error) {
      return rejectWithValue(handleAxiosError(error, 'shipment', 'fetch'));
    }
  }
);

export const updateShipment = createAsyncThunk(
  'shipment/update',
  async ({ shipmentId, shipmentData }, { rejectWithValue }) => {
    try {
      const { data } = await shipmentService.update(shipmentId, shipmentData);
      return data;
    } catch (error) {
      return rejectWithValue(handleAxiosError(error, 'shipment', 'update'));
    }
  }
);

export const getShipments = createAsyncThunk(
  'shipment/getAll',
  async ({ page = 1, limit = 10, filters = {} }, { rejectWithValue }) => {
    try {
      const { data } = await shipmentService.getAll({ page, limit, filters });
      return data;
    } catch (error) {
      return rejectWithValue(handleAxiosError(error, 'shipment', 'fetch'));
    }
  }
);

export const deleteShipment = createAsyncThunk(
  'shipment/delete',
  async (shipmentId, { rejectWithValue }) => {
    try {
      const { data } = await shipmentService.delete(shipmentId);
      return { shipmentId, ...data };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  shipments: [],
  currentShipment: null,
  loading: false,
  error: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  }
};

const shipmentSlice = createSlice({
  name: 'shipment',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentShipment: (state) => {
      state.currentShipment = null;
    },
    setCurrentShipment: (state, action) => {
      state.currentShipment = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Create shipment
      .addCase(createShipment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createShipment.fulfilled, (state, action) => {
        state.loading = false;
        state.shipments.unshift(action.payload.data);
        state.currentShipment = action.payload.data;
      })
      .addCase(createShipment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message || 'Failed to create shipment';
      })

      // Get shipment by ID
      .addCase(getShipmentById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getShipmentById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentShipment = action.payload.data;
      })
      .addCase(getShipmentById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message || 'Failed to fetch shipment';
      })

      // Get shipment by order ID
      .addCase(getShipmentByOrderId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getShipmentByOrderId.fulfilled, (state, action) => {
        state.loading = false;
        state.currentShipment = action.payload.data;
      })
      .addCase(getShipmentByOrderId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message || 'Failed to fetch shipment by order';
      })

      // Update shipment
      .addCase(updateShipment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateShipment.fulfilled, (state, action) => {
        state.loading = false;
        const updatedShipment = action.payload.data;
        const index = state.shipments.findIndex(s => s.id === updatedShipment.id);
        if (index !== -1) {
          state.shipments[index] = updatedShipment;
        }
        state.currentShipment = updatedShipment;
      })
      .addCase(updateShipment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message || 'Failed to update shipment';
      })

      // Get all shipments
      .addCase(getShipments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getShipments.fulfilled, (state, action) => {
        state.loading = false;
        state.shipments = action.payload.data.shipments;
        state.pagination = action.payload.data.pagination;
      })
      .addCase(getShipments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message || 'Failed to fetch shipments';
      })

      // Delete shipment
      .addCase(deleteShipment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteShipment.fulfilled, (state, action) => {
        state.loading = false;
        state.shipments = state.shipments.filter(s => s.id !== action.payload.shipmentId);
        if (state.currentShipment?.id === action.payload.shipmentId) {
          state.currentShipment = null;
        }
      })
      .addCase(deleteShipment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message || 'Failed to delete shipment';
      });
  }
});

export const { clearError, clearCurrentShipment, setCurrentShipment } = shipmentSlice.actions;
export default shipmentSlice.reducer;