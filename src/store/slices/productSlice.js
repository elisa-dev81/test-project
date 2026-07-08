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

// Selectors
export const selectAllProducts = (state) => state.products.products;
export const selectProductsLoading = (state) => state.products.loading;
export const selectProductsError = (state) => state.products.error;

// Selector for total products count from categories
export const selectTotalProductsCount = (state) => {
  const products = state.products.products;
  const categories = state.categories.categories;
  
  if (!products || !categories || categories.length === 0) return 0;
  
  // محاسبه تعداد محصولات در هر دسته‌بندی و جمع کردن آن‌ها
  return categories.reduce((total, category) => {
    const categoryProductCount = products.filter(product => product.category_id === category.id).length;
    return total + categoryProductCount;
  }, 0);
};

// Selector for low stock categories (categories with less than 2 products)
export const selectLowStockCategoriesCount = (state) => {
  const products = state.products.products;
  const categories = state.categories.categories;
  
  if (!products || !categories || categories.length === 0) return 0;
  
  // شمارش دسته‌بندی‌هایی که کمتر از 2 محصول دارند
  return categories.filter(category => {
    const categoryProductCount = products.filter(product => product.category_id === category.id).length;
    return categoryProductCount < 2;
  }).length;
};

// Selector for calculating total products value (بدون اجرت ساخت)
export const selectTotalProductsValue = (state) => {
  const products = state.products.products;
  const gold18kPrice = state.prices?.prices?.iranian?.gold_gram?.gold_18k?.price || 0;
  
  if (!products || products.length === 0 || gold18kPrice === 0) return 0;
  
  return products.reduce((total, product) => {
    const weight = parseFloat(product.weight) || 0;
    const purity = parseInt(product.purity) || 18;
    
    let basePrice = 0;
    
    if (purity >= 900) {
      // محاسبه نقره (عیار 925، 950 و غیره)
      const purityFactor = purity / 1000;
      basePrice = weight * gold18kPrice * 0.015 * purityFactor; // نسبت نقره به طلا
    } else {
      // تشخیص نوع عیار
      let adjustedPurity;
      if (purity >= 100) {
        // عیار هزارگان (مثل 750, 585, 916, 999)
        adjustedPurity = (purity / 1000) * 24; // تبدیل به عیار 24گانه
      } else {
        // عیار 24گانه (مثل 18, 21, 22, 24)
        adjustedPurity = purity;
      }
      
      // استفاده از قیمت 18 عیار
      if (adjustedPurity === 18) {
        basePrice = weight * gold18kPrice;
      } else {
        // محاسبه بر اساس نسبت عیار
        const pricePerGram = gold18kPrice * (adjustedPurity / 18); // نسبت به 18 عیار
        basePrice = weight * pricePerGram;
      }
    }
    
    // قیمت بدون اجرت ساخت برگردانده می‌شود
    return total + basePrice;
  }, 0);
};

export default productSlice.reducer; 