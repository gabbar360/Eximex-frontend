import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import productVariantService from '../service/productVariantService';

export const fetchProductVariants = createAsyncThunk(
  'productVariant/fetchProductVariants',
  async (params = {}, { rejectWithValue }) => {
    try {
      return await productVariantService.getAllProductVariants(params);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchProductVariantById = createAsyncThunk(
  'productVariant/fetchProductVariantById',
  async (id, { rejectWithValue }) => {
    try {
      return await productVariantService.getProductVariantById(id);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const createProductVariant = createAsyncThunk(
  'productVariant/createProductVariant',
  async (variantData, { rejectWithValue }) => {
    try {
      return await productVariantService.createProductVariant(variantData);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateProductVariant = createAsyncThunk(
  'productVariant/updateProductVariant',
  async ({ id, variantData }, { rejectWithValue }) => {
    try {
      return await productVariantService.updateProductVariant(id, variantData);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const deleteProductVariant = createAsyncThunk(
  'productVariant/deleteProductVariant',
  async (id, { rejectWithValue }) => {
    try {
      return await productVariantService.deleteProductVariant(id);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const productVariantSlice = createSlice({
  name: 'productVariant',
  initialState: {
    productVariants: [],
    selectedProductVariant: null,
    loading: false,
    error: null,
    successMessage: null,
  },
  reducers: {
    setSelectedProductVariant(state, { payload }) {
      state.selectedProductVariant = payload;
    },
    clearSelectedProductVariant(state) {
      state.selectedProductVariant = null;
    },
    clearMessages(state) {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductVariants.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductVariants.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.productVariants = payload?.data || payload || [];
      })
      .addCase(fetchProductVariants.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      .addCase(fetchProductVariantById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductVariantById.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.selectedProductVariant = payload?.data || payload;
      })
      .addCase(fetchProductVariantById.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      .addCase(createProductVariant.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProductVariant.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.productVariants.unshift(payload.data);
        state.successMessage = payload.message;
      })
      .addCase(createProductVariant.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      .addCase(updateProductVariant.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProductVariant.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.productVariants = state.productVariants.map((variant) =>
          variant.id === payload.data.id ? payload.data : variant
        );
        state.successMessage = payload.message;
      })
      .addCase(updateProductVariant.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      .addCase(deleteProductVariant.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProductVariant.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.productVariants = state.productVariants.filter(
          (variant) => variant.id !== payload.id
        );
        state.successMessage = payload.message;
      })
      .addCase(deleteProductVariant.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      });
  },
});

export const {
  setSelectedProductVariant,
  clearSelectedProductVariant,
  clearMessages,
} = productVariantSlice.actions;
export default productVariantSlice.reducer;
