import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import productService from '../service/productService';

export const fetchProducts = createAsyncThunk(
  'product/fetchProducts',
  async (params = {}, { rejectWithValue }) => {
    try {
      // Set default limit to 100 to show more products
      const queryParams = { limit: 100, ...params };
      return await productService.getAllProducts(queryParams);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const addProduct = createAsyncThunk(
  'product/addProduct',
  async (product, { rejectWithValue }) => {
    try {
      console.log('Redux thunk: Calling createProduct with:', product);
      const response = await productService.createProduct(product);
      console.log('Redux thunk: createProduct response:', response);
      return response;
    } catch (err) {
      console.error('Redux thunk: createProduct error:', err);
      return rejectWithValue(err.message);
    }
  }
);

export const updateProduct = createAsyncThunk(
  'product/updateProduct',
  async ({ id, product }, { rejectWithValue }) => {
    try {
      const response = await productService.updateProduct(id, product);
      return response;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const deleteProduct = createAsyncThunk(
  'product/deleteProduct',
  async (id, { rejectWithValue }) => {
    try {
      const response = await productService.deleteProduct(id);
      return response;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const getProductById = createAsyncThunk(
  'product/getProductById',
  async (id, { rejectWithValue }) => {
    try {
      return await productService.getProductById(id);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const productSlice = createSlice({
  name: 'product',
  initialState: {
    products: [],
    loading: false,
    error: null,
    selectedProduct: null,
  },
  reducers: {
    setSelectedProduct(state, { payload }) {
      state.selectedProduct = payload;
    },
    clearSelectedProduct(state) {
      state.selectedProduct = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.products = payload?.data || [];
      })
      .addCase(fetchProducts.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      .addCase(addProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addProduct.fulfilled, (state, { payload }) => {
        state.loading = false;
        // Handle both response formats (data.data or direct data)
        const productData = payload?.data?.data || payload?.data || payload;
        state.products.unshift(productData);
      })
      .addCase(addProduct.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      .addCase(updateProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.products = state.products.map((p) =>
          p.id === payload.id ? payload : p
        );
      })
      .addCase(updateProduct.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      .addCase(deleteProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProduct.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.products = state.products.filter((p) => p.id !== payload.id);
      })
      .addCase(deleteProduct.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      });
  },
});

export const { setSelectedProduct, clearSelectedProduct } =
  productSlice.actions;
export default productSlice.reducer;
