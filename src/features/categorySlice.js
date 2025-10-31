import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import categoryService from '../service/categoryService';

export const fetchCategories = createAsyncThunk(
  'category/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      return await categoryService.getAllCategories();
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const addCategory = createAsyncThunk(
  'category/addCategory',
  async (category, { rejectWithValue }) => {
    try {
      return await categoryService.createCategory(category);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateCategory = createAsyncThunk(
  'category/updateCategory',
  async ({ id, category }, { rejectWithValue }) => {
    try {
      return await categoryService.updateCategory(id, category);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const deleteCategory = createAsyncThunk(
  'category/deleteCategory',
  async (id, { rejectWithValue }) => {
    try {
      const response = await categoryService.deleteCategory(id);
      return response;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const getCategoryById = createAsyncThunk(
  'category/getCategoryById',
  async (id, { rejectWithValue }) => {
    try {
      return await categoryService.getCategoryById(id);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const getAllCategories = fetchCategories;

const categorySlice = createSlice({
  name: 'category',
  initialState: {
    categories: [],
    loading: false,
    error: null,
    selectedCategory: null,
  },
  reducers: {
    setSelectedCategory(state, { payload }) {
      state.selectedCategory = payload;
    },
    clearSelectedCategory(state) {
      state.selectedCategory = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.categories = payload?.data || [];
      })
      .addCase(fetchCategories.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      .addCase(addCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addCategory.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.categories.unshift(payload);
      })
      .addCase(addCategory.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      .addCase(updateCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCategory.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.categories = state.categories.map((c) =>
          c.id === payload.id ? payload : c
        );
      })
      .addCase(updateCategory.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      .addCase(deleteCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCategory.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.categories = state.categories.filter((c) => c.id !== payload.id);
      })
      .addCase(deleteCategory.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      });
  },
});

export const { setSelectedCategory, clearSelectedCategory } =
  categorySlice.actions;
export default categorySlice.reducer;
