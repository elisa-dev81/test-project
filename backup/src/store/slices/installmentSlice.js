import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import installmentService from '../../services/installmentService';

// Async thunks
export const fetchInstallments = createAsyncThunk(
  'installments/fetchInstallments',
  async (params, { rejectWithValue }) => {
    try {
      const response = await installmentService.getInstallments(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'خطا در دریافت اقساط');
    }
  }
);

export const fetchInstallmentById = createAsyncThunk(
  'installments/fetchInstallmentById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await installmentService.getInstallmentById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'خطا در دریافت قسط');
    }
  }
);

export const payInstallment = createAsyncThunk(
  'installments/payInstallment',
  async ({ id, paymentData }, { rejectWithValue }) => {
    try {
      const response = await installmentService.payInstallment(id, paymentData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'خطا در پرداخت قسط');
    }
  }
);

export const updateInstallment = createAsyncThunk(
  'installments/updateInstallment',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await installmentService.updateInstallment(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'خطا در به‌روزرسانی قسط');
    }
  }
);

export const fetchOverdueInstallments = createAsyncThunk(
  'installments/fetchOverdueInstallments',
  async (_, { rejectWithValue }) => {
    try {
      const response = await installmentService.getOverdueInstallments();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'خطا در دریافت اقساط معوقه');
    }
  }
);

export const fetchInstallmentSummary = createAsyncThunk(
  'installments/fetchInstallmentSummary',
  async (_, { rejectWithValue }) => {
    try {
      const response = await installmentService.getInstallmentSummary();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'خطا در دریافت خلاصه اقساط');
    }
  }
);

const initialState = {
  installments: [],
  currentInstallment: null,
  overdueInstallments: [],
  summary: null,
  pagination: {
    current_page: 1,
    total_pages: 1,
    total_records: 0,
    per_page: 10
  },
  loading: false,
  error: null,
  filters: {
    status: '',
    overdue: false
  }
};

const installmentSlice = createSlice({
  name: 'installments',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentInstallment: (state) => {
      state.currentInstallment = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    markInstallmentAsPaid: (state, action) => {
      const { id, paidAmount, paidDate } = action.payload;
      const installment = state.installments.find(i => i.id === id);
      if (installment) {
        installment.status = 'paid';
        installment.paid_amount = paidAmount;
        installment.paid_date = paidDate;
      }
      
      // Also update in overdue installments if present
      const overdueIndex = state.overdueInstallments.findIndex(i => i.id === id);
      if (overdueIndex !== -1) {
        state.overdueInstallments.splice(overdueIndex, 1);
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch installments
      .addCase(fetchInstallments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInstallments.fulfilled, (state, action) => {
        state.loading = false;
        state.installments = action.payload.installments;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchInstallments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch installment by ID
      .addCase(fetchInstallmentById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInstallmentById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentInstallment = action.payload;
      })
      .addCase(fetchInstallmentById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Pay installment
      .addCase(payInstallment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(payInstallment.fulfilled, (state, action) => {
        state.loading = false;
        const installment = action.payload;
        const index = state.installments.findIndex(i => i.id === installment.id);
        if (index !== -1) {
          state.installments[index] = installment;
        }
        if (state.currentInstallment?.id === installment.id) {
          state.currentInstallment = installment;
        }
        
        // Remove from overdue if it was there
        state.overdueInstallments = state.overdueInstallments.filter(i => i.id !== installment.id);
      })
      .addCase(payInstallment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update installment
      .addCase(updateInstallment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateInstallment.fulfilled, (state, action) => {
        state.loading = false;
        const installment = action.payload;
        const index = state.installments.findIndex(i => i.id === installment.id);
        if (index !== -1) {
          state.installments[index] = installment;
        }
        if (state.currentInstallment?.id === installment.id) {
          state.currentInstallment = installment;
        }
      })
      .addCase(updateInstallment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch overdue installments
      .addCase(fetchOverdueInstallments.fulfilled, (state, action) => {
        state.overdueInstallments = action.payload;
      })
      
      // Fetch installment summary
      .addCase(fetchInstallmentSummary.fulfilled, (state, action) => {
        state.summary = action.payload;
      });
  }
});

export const {
  clearError,
  clearCurrentInstallment,
  setFilters,
  clearFilters,
  markInstallmentAsPaid
} = installmentSlice.actions;

export default installmentSlice.reducer;