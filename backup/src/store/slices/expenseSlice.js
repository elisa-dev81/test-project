import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import expenseService from '../../services/expenseService';

// Async thunks
export const fetchExpenses = createAsyncThunk(
  'expenses/fetchExpenses',
  async (params, { rejectWithValue }) => {
    try {
      const response = await expenseService.getExpenses(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'خطا در دریافت هزینه‌ها');
    }
  }
);

export const fetchExpenseById = createAsyncThunk(
  'expenses/fetchExpenseById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await expenseService.getExpenseById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'خطا در دریافت هزینه');
    }
  }
);

export const createExpense = createAsyncThunk(
  'expenses/createExpense',
  async (expenseData, { rejectWithValue }) => {
    try {
      const response = await expenseService.createExpense(expenseData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'خطا در ایجاد هزینه');
    }
  }
);

export const updateExpense = createAsyncThunk(
  'expenses/updateExpense',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await expenseService.updateExpense(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'خطا در به‌روزرسانی هزینه');
    }
  }
);

export const deleteExpense = createAsyncThunk(
  'expenses/deleteExpense',
  async (id, { rejectWithValue }) => {
    try {
      await expenseService.deleteExpense(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'خطا در حذف هزینه');
    }
  }
);

export const fetchExpenseSummary = createAsyncThunk(
  'expenses/fetchExpenseSummary',
  async (params, { rejectWithValue }) => {
    try {
      const response = await expenseService.getExpenseSummary(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'خطا در دریافت خلاصه هزینه‌ها');
    }
  }
);

const initialState = {
  expenses: [],
  currentExpense: null,
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
    category: '',
    status: '',
    startDate: '',
    endDate: ''
  }
};

const expenseSlice = createSlice({
  name: 'expenses',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentExpense: (state) => {
      state.currentExpense = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch expenses
      .addCase(fetchExpenses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExpenses.fulfilled, (state, action) => {
        state.loading = false;
        state.expenses = action.payload.expenses;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchExpenses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch expense by ID
      .addCase(fetchExpenseById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExpenseById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentExpense = action.payload;
      })
      .addCase(fetchExpenseById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create expense
      .addCase(createExpense.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createExpense.fulfilled, (state, action) => {
        state.loading = false;
        state.expenses.unshift(action.payload);
        state.currentExpense = action.payload;
      })
      .addCase(createExpense.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update expense
      .addCase(updateExpense.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateExpense.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.expenses.findIndex(e => e.id === action.payload.id);
        if (index !== -1) {
          state.expenses[index] = action.payload;
        }
        if (state.currentExpense?.id === action.payload.id) {
          state.currentExpense = action.payload;
        }
      })
      .addCase(updateExpense.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete expense
      .addCase(deleteExpense.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteExpense.fulfilled, (state, action) => {
        state.loading = false;
        state.expenses = state.expenses.filter(e => e.id !== action.payload);
        if (state.currentExpense?.id === action.payload) {
          state.currentExpense = null;
        }
      })
      .addCase(deleteExpense.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch expense summary
      .addCase(fetchExpenseSummary.fulfilled, (state, action) => {
        state.summary = action.payload;
      });
  }
});

export const {
  clearError,
  clearCurrentExpense,
  setFilters,
  clearFilters
} = expenseSlice.actions;

export default expenseSlice.reducer;