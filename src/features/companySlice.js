import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getCompanies, getCompanyById, createCompany as createCompanyService, updateCompany as updateCompanyService } from '../service/company';

export const fetchCompanies = createAsyncThunk(
  'company/fetchCompanies',
  async (params = {}, { rejectWithValue }) => {
    try {
      return await getCompanies(params);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchCompanyById = createAsyncThunk(
  'company/fetchCompanyById',
  async (id, { rejectWithValue }) => {
    try {
      return await getCompanyById(id);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const createCompany = createAsyncThunk(
  'company/createCompany',
  async (companyData, { rejectWithValue }) => {
    try {
      return await createCompanyService(companyData);
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const updateCompany = createAsyncThunk(
  'company/updateCompany',
  async ({ id, companyData }, { rejectWithValue }) => {
    try {
      return await updateCompanyService(id, companyData);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const getAllCompanies = fetchCompanies;
export const getCompanyDetails = fetchCompanyById;



const companySlice = createSlice({
  name: 'company',
  initialState: {
    companies: [],
    selectedCompany: null,
    loading: false,
    error: null,
    successMessage: null,
  },
  reducers: {
    setSelectedCompany(state, { payload }) {
      state.selectedCompany = payload;
    },
    clearSelectedCompany(state) {
      state.selectedCompany = null;
    },
    clearMessages(state) {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCompanies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCompanies.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.companies = payload?.data || payload || [];
      })
      .addCase(fetchCompanies.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      .addCase(fetchCompanyById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCompanyById.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.selectedCompany = payload?.data || payload;
      })
      .addCase(fetchCompanyById.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      .addCase(createCompany.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCompany.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.companies.unshift(payload.data);
        state.successMessage = payload.message;
      })
      .addCase(createCompany.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      .addCase(updateCompany.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCompany.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.companies = state.companies.map((company) =>
          company.id === payload.data.id ? payload.data : company
        );
        state.successMessage = payload.message;
      })
      .addCase(updateCompany.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })

  },
});

export const { setSelectedCompany, clearSelectedCompany, clearMessages } =
  companySlice.actions;
export default companySlice.reducer;