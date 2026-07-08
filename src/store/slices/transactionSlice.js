import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import transactionService from '../../services/transactionService';

// Async thunks
export const fetchTransactions = createAsyncThunk(
  'transactions/fetchTransactions',
  async (params, { rejectWithValue }) => {
    try {
      const response = await transactionService.getTransactions(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'خطا در دریافت تراکنش‌ها');
    }
  }
);

export const fetchTransactionById = createAsyncThunk(
  'transactions/fetchTransactionById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await transactionService.getTransactionById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'خطا در دریافت تراکنش');
    }
  }
);

export const createTransaction = createAsyncThunk(
  'transactions/createTransaction',
  async (transactionData, { rejectWithValue }) => {
    try {
      const response = await transactionService.createTransaction(transactionData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'خطا در ایجاد تراکنش');
    }
  }
);

export const updateTransaction = createAsyncThunk(
  'transactions/updateTransaction',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await transactionService.updateTransaction(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'خطا در به‌روزرسانی تراکنش');
    }
  }
);

export const deleteTransaction = createAsyncThunk(
  'transactions/deleteTransaction',
  async (id, { rejectWithValue }) => {
    try {
      await transactionService.deleteTransaction(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'خطا در حذف تراکنش');
    }
  }
);

export const addPayment = createAsyncThunk(
  'transactions/addPayment',
  async ({ transactionId, paymentData }, { rejectWithValue }) => {
    try {
      const response = await transactionService.addPayment(transactionId, paymentData);
      return { transactionId, payment: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'خطا در ثبت پرداخت');
    }
  }
);

export const fetchTransactionSummary = createAsyncThunk(
  'transactions/fetchTransactionSummary',
  async (params, { rejectWithValue }) => {
    try {
      const response = await transactionService.getTransactionSummary(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'خطا در دریافت خلاصه تراکنش‌ها');
    }
  }
);

const initialState = {
  transactions: [],
  currentTransaction: null,
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
    type: '',
    status: '',
    customer: '',
    startDate: '',
    endDate: ''
  }
};

const transactionSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentTransaction: (state) => {
      state.currentTransaction = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    updateTransactionStatus: (state, action) => {
      const { id, status, paidAmount, remainingAmount } = action.payload;
      const transaction = state.transactions.find(t => t.id === id);
      if (transaction) {
        transaction.payment_status = status;
        transaction.paid_amount = paidAmount;
        transaction.remaining_amount = remainingAmount;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch transactions
      .addCase(fetchTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions = action.payload.transactions;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch transaction by ID
      .addCase(fetchTransactionById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransactionById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTransaction = action.payload;
      })
      .addCase(fetchTransactionById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create transaction
      .addCase(createTransaction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTransaction.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions.unshift(action.payload);
        state.currentTransaction = action.payload;
      })
      .addCase(createTransaction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update transaction
      .addCase(updateTransaction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTransaction.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.transactions.findIndex(t => t.id === action.payload.id);
        if (index !== -1) {
          state.transactions[index] = action.payload;
        }
        if (state.currentTransaction?.id === action.payload.id) {
          state.currentTransaction = action.payload;
        }
      })
      .addCase(updateTransaction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete transaction
      .addCase(deleteTransaction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTransaction.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions = state.transactions.filter(t => t.id !== action.payload);
        if (state.currentTransaction?.id === action.payload) {
          state.currentTransaction = null;
        }
      })
      .addCase(deleteTransaction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Add payment
      .addCase(addPayment.fulfilled, (state, action) => {
        const { transactionId } = action.payload;
        // The transaction status will be updated by the server response
        // We might want to refetch the transaction or update it locally
      })
      
      // Fetch transaction summary
      .addCase(fetchTransactionSummary.fulfilled, (state, action) => {
        state.summary = action.payload;
      });
  }
});

export const {
  clearError,
  clearCurrentTransaction,
  setFilters,
  clearFilters,
  updateTransactionStatus
} = transactionSlice.actions;

export default transactionSlice.reducer;