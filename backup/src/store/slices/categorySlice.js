import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { categoryService } from '../../services/categoryService';

export const fetchCategories = createAsyncThunk(
  'categories/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await categoryService.getAllCategories();
      return response.data; // استفاده از API واقعی
    } catch (error) {
      return rejectWithValue(error.message || 'خطا در دریافت دسته‌بندی‌ها');
    }
  }
);

export const addCategory = createAsyncThunk(
  'categories/addCategory',
  async (categoryData, { rejectWithValue }) => {
    try {
      console.log('Redux addCategory called with:', categoryData);
      const response = await categoryService.createCategory(categoryData);
      console.log('API response:', response);
      
      // اگر response مستقیماً data باشد (بدون wrapper)
      if (response && response.id) {
        return response;
      }
      // اگر response دارای wrapper باشد
      else if (response && response.success && response.data) {
        return response.data;
      } else {
        throw new Error('Invalid API response structure');
      }
    } catch (error) {
      console.error('Redux addCategory error:', error);
      return rejectWithValue(error.message || 'خطا در افزودن دسته‌بندی');
    }
  }
);

export const updateCategory = createAsyncThunk(
  'categories/updateCategory',
  async ({ id, categoryData }, { rejectWithValue }) => {
    try {
      const response = await categoryService.updateCategory(id, categoryData);
      return response.data; // استفاده از API واقعی
    } catch (error) {
      return rejectWithValue(error.message || 'خطا در ویرایش دسته‌بندی');
    }
  }
);

export const deleteCategory = createAsyncThunk(
  'categories/deleteCategory',
  async (categoryId, { rejectWithValue }) => {
    try {
      await categoryService.deleteCategory(categoryId);
      return categoryId;
    } catch (error) {
      return rejectWithValue(error.message || 'خطا در حذف دسته‌بندی');
    }
  }
);

const initialState = {
  categories: [],
  loading: false,
  error: null
};

const categorySlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch categories
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add category
      .addCase(addCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.categories.push(action.payload);
      })
      .addCase(addCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update category
      .addCase(updateCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.categories.findIndex(cat => cat.id === action.payload.id);
        if (index !== -1) {
          state.categories[index] = { ...state.categories[index], ...action.payload };
        }
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete category
      .addCase(deleteCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = state.categories.filter(cat => cat.id !== action.payload);
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = categorySlice.actions;
export default categorySlice.reducer; 