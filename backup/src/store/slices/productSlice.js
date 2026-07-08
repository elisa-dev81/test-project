import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { productService } from '../../services/productService';
import { createInventoryForProduct } from './inventorySlice';

// Mock data removed - now using real API data

// Async thunks
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await productService.getAllProducts();
      return response.data || [];
    } catch (error) {
      return rejectWithValue('خطا در دریافت محصولات');
    }
  }
);

export const deleteProduct = createAsyncThunk(
  'products/deleteProduct',
  async (productId, { rejectWithValue }) => {
    try {
      await productService.deleteProduct(productId);
      return productId;
    } catch (error) {
      return rejectWithValue('خطا در حذف محصول');
    }
  }
);

export const addProduct = createAsyncThunk(
  'products/addProduct',
  async (productData, { rejectWithValue, dispatch }) => {
    try {
      const response = await productService.createProduct(productData);
      const newProduct = response.data;
      
      // Create inventory for the new product
      try {
        await dispatch(createInventoryForProduct(newProduct)).unwrap();
      } catch (inventoryError) {
        console.warn('Warning: Could not create inventory for new product:', inventoryError);
        // Don't fail the product creation if inventory creation fails
      }
      
      return newProduct;
    } catch (error) {
      return rejectWithValue('خطا در افزودن محصول');
    }
  }
);

export const updateProduct = createAsyncThunk(
  'products/updateProduct',
  async ({ id, productData }, { rejectWithValue }) => {
    try {
      const response = await productService.updateProduct(id, productData);
      return response.data;
    } catch (error) {
      return rejectWithValue('خطا در ویرایش محصول');
    }
  }
);

const initialState = {
  products: [],
  loading: false,
  error: null,
  selectedProduct: null,
  filters: {
    search: '',
    category: '',
    type: '',
    isActive: true
  }
};

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setSelectedProduct: (state, action) => {
      state.selectedProduct = action.payload;
    },
    clearSelectedProduct: (state) => {
      state.selectedProduct = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        search: '',
        category: '',
        type: '',
        isActive: true
      };
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch products
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete product
      .addCase(deleteProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products = state.products.filter(product => product.id !== action.payload);
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add product
      .addCase(addProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products.push(action.payload);
      })
      .addCase(addProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update product
      .addCase(updateProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.products.findIndex(product => product.id === action.payload.id);
        if (index !== -1) {
          state.products[index] = { ...state.products[index], ...action.payload };
        }
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setSelectedProduct,
  clearSelectedProduct,
  setFilters,
  clearFilters,
  clearError
} = productSlice.actions;

export default productSlice.reducer; 