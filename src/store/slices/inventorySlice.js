import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Mock data for inventory - will be dynamically generated based on products
const generateMockInventory = (products) => {
  if (!products || products.length === 0) {
    return [];
  }
  
  return products.map((product, index) => ({
    id: index + 1,
    productId: product.id,
    quantity: Math.floor(Math.random() * 20) + 5, // Random quantity between 5-25
    reservedQuantity: Math.floor(Math.random() * 3), // Random reserved between 0-2
    availableQuantity: 0, // Will be calculated
    minStockLevel: 3,
    maxStockLevel: 50,
    reorderPoint: 5,
    lastStockCount: new Date().toISOString().split('T')[0],
    lastStockCountQuantity: 0, // Will be set to current quantity
    averageCost: Math.floor(product.weight * 2000000), // Rough calculation based on weight
    totalValue: 0, // Will be calculated
    location: `قفسه ${String.fromCharCode(65 + (index % 26))}-${index + 1}`,
    notes: 'موجودی اولیه'
  })).map(item => ({
    ...item,
    availableQuantity: item.quantity - item.reservedQuantity,
    lastStockCountQuantity: item.quantity,
    totalValue: item.quantity * item.averageCost
  }));
};

export const fetchInventory = createAsyncThunk(
  'inventory/fetchInventory',
  async (_, { rejectWithValue, getState }) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Get products from state to generate inventory
      const state = getState();
      const products = state.products.products;
      
      // If no products loaded yet, return empty array
      if (!products || products.length === 0) {
        return [];
      }
      
      // Generate inventory based on existing products
      const generatedInventory = generateMockInventory(products);
      
      return generatedInventory;
    } catch (error) {
      return rejectWithValue('خطا در دریافت موجودی');
    }
  }
);

export const updateInventory = createAsyncThunk(
  'inventory/updateInventory',
  async (inventoryData, { rejectWithValue, getState }) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Get current inventory item
      const state = getState();
      const currentItem = state.inventory.inventory.find(item => item.productId === inventoryData.productId);
      
      if (!currentItem) {
        return rejectWithValue('آیتم موجودی مورد نظر یافت نشد');
      }
      
      // Merge current data with updated data
      const updatedItem = {
        ...currentItem,
        ...inventoryData,
        totalValue: inventoryData.quantity * (currentItem.averageCost || 0),
        availableQuantity: inventoryData.quantity - (currentItem.reservedQuantity || 0),
      };
      
      return updatedItem;
    } catch (error) {
      return rejectWithValue('خطا در به‌روزرسانی موجودی');
    }
  }
);

export const addInventory = createAsyncThunk(
  'inventory/addInventory',
  async (inventoryData, { rejectWithValue, getState }) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Get product info for calculations
      const state = getState();
      const product = state.products.products.find(p => p.id === inventoryData.productId);
      
      if (!product) {
        return rejectWithValue('محصول مورد نظر یافت نشد');
      }
      
      // Create new inventory item
      const newInventoryItem = {
        id: Date.now(), // Generate unique ID
        productId: inventoryData.productId,
        quantity: parseInt(inventoryData.quantity),
        reservedQuantity: 0,
        availableQuantity: parseInt(inventoryData.quantity),
        minStockLevel: parseInt(inventoryData.minQuantity) || 5,
        maxStockLevel: parseInt(inventoryData.maxQuantity) || 50,
        reorderPoint: parseInt(inventoryData.minQuantity) || 5,
        lastStockCount: new Date().toISOString().split('T')[0],
        lastStockCountQuantity: parseInt(inventoryData.quantity),
        averageCost: parseFloat(inventoryData.unitPrice) || Math.floor(product.weight * 2000000),
        totalValue: parseInt(inventoryData.quantity) * (parseFloat(inventoryData.unitPrice) || Math.floor(product.weight * 2000000)),
        location: inventoryData.location || 'انبار اصلی',
        notes: inventoryData.notes || '',
      };
      
      return newInventoryItem;
    } catch (error) {
      return rejectWithValue('خطا در افزودن موجودی');
    }
  }
);

// Action to create inventory for new products
export const createInventoryForProduct = createAsyncThunk(
  'inventory/createInventoryForProduct',
  async (product, { rejectWithValue, getState }) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Check if inventory already exists for this product
      const state = getState();
      const existingInventory = state.inventory.inventory.find(item => item.productId === product.id);
      
      if (existingInventory) {
        return rejectWithValue('موجودی برای این محصول قبلاً وجود دارد');
      }
      
      // Create new inventory item for the product
      const newInventoryItem = {
        id: Date.now(),
        productId: product.id,
        quantity: Math.floor(Math.random() * 20) + 5, // Random quantity between 5-25
        reservedQuantity: Math.floor(Math.random() * 3), // Random reserved between 0-2
        availableQuantity: 0, // Will be calculated
        minStockLevel: 3,
        maxStockLevel: 50,
        reorderPoint: 5,
        lastStockCount: new Date().toISOString().split('T')[0],
        lastStockCountQuantity: 0, // Will be set to current quantity
        averageCost: Math.floor(product.weight * 2000000), // Rough calculation based on weight
        totalValue: 0, // Will be calculated
        location: `قفسه ${String.fromCharCode(65 + (Math.random() * 26))}-${Math.floor(Math.random() * 100) + 1}`,
        notes: 'موجودی خودکار ایجاد شده'
      };
      
      // Calculate derived values
      newInventoryItem.availableQuantity = newInventoryItem.quantity - newInventoryItem.reservedQuantity;
      newInventoryItem.lastStockCountQuantity = newInventoryItem.quantity;
      newInventoryItem.totalValue = newInventoryItem.quantity * newInventoryItem.averageCost;
      
      return newInventoryItem;
    } catch (error) {
      return rejectWithValue('خطا در ایجاد موجودی برای محصول جدید');
    }
  }
);

// Action to initialize inventory for all products
export const initializeInventory = createAsyncThunk(
  'inventory/initializeInventory',
  async (_, { rejectWithValue, getState }) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const state = getState();
      const products = state.products.products;
      
      if (!products || products.length === 0) {
        return rejectWithValue('هیچ محصولی یافت نشد');
      }
      
      // Generate inventory for all products
      const generatedInventory = generateMockInventory(products);
      
      return generatedInventory;
    } catch (error) {
      return rejectWithValue('خطا در ایجاد موجودی اولیه');
    }
  }
);

export const deleteInventoryItem = createAsyncThunk(
  'inventory/deleteInventoryItem',
  async (productId, { rejectWithValue }) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      return productId;
    } catch (error) {
      return rejectWithValue('خطا در حذف موجودی');
    }
  }
);

export const processSale = createAsyncThunk(
  'inventory/processSale',
  async (saleItems, { rejectWithValue, getState }) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const state = getState();
      const updatedItems = [];
      
      for (const saleItem of saleItems) {
        const inventoryItem = state.inventory.inventory.find(item => item.productId === saleItem.productId);
        
        if (!inventoryItem) {
          return rejectWithValue(`محصول "${saleItem.productName}" در موجودی یافت نشد`);
        }
        
        if (inventoryItem.availableQuantity < saleItem.quantity) {
          return rejectWithValue(`موجودی کافی برای محصول "${saleItem.productName}" وجود ندارد. موجودی: ${inventoryItem.availableQuantity}، درخواستی: ${saleItem.quantity}`);
        }
        
        // Calculate new quantities
        const newQuantity = inventoryItem.quantity - saleItem.quantity;
        const newAvailableQuantity = inventoryItem.availableQuantity - saleItem.quantity;
        
        const updatedItem = {
          ...inventoryItem,
          quantity: newQuantity,
          availableQuantity: newAvailableQuantity,
          totalValue: newQuantity * (inventoryItem.averageCost || 0),
        };
        
        updatedItems.push(updatedItem);
      }
      
      return updatedItems;
    } catch (error) {
      return rejectWithValue('خطا در پردازش فروش');
    }
  }
);

export const processPurchase = createAsyncThunk(
  'inventory/processPurchase',
  async (purchaseItems, { rejectWithValue, getState }) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const state = getState();
      const updatedItems = [];
      
      for (const purchaseItem of purchaseItems) {
        const inventoryItem = state.inventory.inventory.find(item => item.productId === purchaseItem.productId);
        
        if (!inventoryItem) {
          // If inventory doesn't exist for this product, create a new one
          const newInventoryItem = {
            id: Date.now() + Math.random(),
            productId: purchaseItem.productId,
            quantity: purchaseItem.quantity,
            reservedQuantity: 0,
            availableQuantity: purchaseItem.quantity,
            minStockLevel: 3,
            maxStockLevel: 50,
            reorderPoint: 5,
            lastStockCount: new Date().toISOString().split('T')[0],
            lastStockCountQuantity: purchaseItem.quantity,
            averageCost: purchaseItem.unitPrice || 0,
            totalValue: purchaseItem.quantity * (purchaseItem.unitPrice || 0),
            location: 'انبار اصلی',
            notes: `خرید جدید - ${new Date().toLocaleDateString('fa-IR')}`
          };
          
          updatedItems.push(newInventoryItem);
        } else {
          // Update existing inventory
          const newQuantity = inventoryItem.quantity + purchaseItem.quantity;
          const newAvailableQuantity = inventoryItem.availableQuantity + purchaseItem.quantity;
          
          // Update average cost (weighted average)
          const totalCost = (inventoryItem.quantity * inventoryItem.averageCost) + (purchaseItem.quantity * (purchaseItem.unitPrice || inventoryItem.averageCost));
          const newAverageCost = totalCost / newQuantity;
          
          const updatedItem = {
            ...inventoryItem,
            quantity: newQuantity,
            availableQuantity: newAvailableQuantity,
            averageCost: newAverageCost,
            totalValue: newQuantity * newAverageCost,
            lastStockCount: new Date().toISOString().split('T')[0],
            lastStockCountQuantity: newQuantity,
            notes: `${inventoryItem.notes} | خرید: ${purchaseItem.quantity} - ${new Date().toLocaleDateString('fa-IR')}`
          };
          
          updatedItems.push(updatedItem);
        }
      }
      
      return updatedItems;
    } catch (error) {
      return rejectWithValue('خطا در پردازش خرید');
    }
  }
);

const initialState = {
  inventory: [],
  loading: false,
  error: null,
  lowStockItems: [],
  outOfStockItems: []
};

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateLowStockItems: (state) => {
      state.lowStockItems = state.inventory.filter(item => 
        item.availableQuantity <= item.minStockLevel && item.availableQuantity > 0
      );
    },
    updateOutOfStockItems: (state) => {
      state.outOfStockItems = state.inventory.filter(item => 
        item.availableQuantity === 0
      );
    },
    // Create missing inventory for products
    createMissingInventory: (state, action) => {
      const products = action.payload;
      const existingProductIds = state.inventory.map(item => item.productId);
      
      products.forEach(product => {
        if (!existingProductIds.includes(product.id)) {
          const newInventoryItem = {
            id: Date.now() + Math.random(),
            productId: product.id,
            quantity: Math.floor(Math.random() * 20) + 5,
            reservedQuantity: Math.floor(Math.random() * 3),
            availableQuantity: 0,
            minStockLevel: 3,
            maxStockLevel: 50,
            reorderPoint: 5,
            lastStockCount: new Date().toISOString().split('T')[0],
            lastStockCountQuantity: 0,
            averageCost: Math.floor(product.weight * 2000000),
            totalValue: 0,
            location: `قفسه ${String.fromCharCode(65 + (Math.random() * 26))}-${Math.floor(Math.random() * 100) + 1}`,
            notes: 'موجودی خودکار ایجاد شده'
          };
          
          newInventoryItem.availableQuantity = newInventoryItem.quantity - newInventoryItem.reservedQuantity;
          newInventoryItem.lastStockCountQuantity = newInventoryItem.quantity;
          newInventoryItem.totalValue = newInventoryItem.quantity * newInventoryItem.averageCost;
          
          state.inventory.push(newInventoryItem);
        }
      });
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch inventory
      .addCase(fetchInventory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInventory.fulfilled, (state, action) => {
        state.loading = false;
        state.inventory = action.payload;
        // Update low stock and out of stock items
        inventorySlice.caseReducers.updateLowStockItems(state);
        inventorySlice.caseReducers.updateOutOfStockItems(state);
      })
      .addCase(fetchInventory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update inventory
      .addCase(updateInventory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateInventory.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.inventory.findIndex(item => item.productId === action.payload.productId);
        if (index !== -1) {
          state.inventory[index] = { ...state.inventory[index], ...action.payload };
        }
        // Update low stock and out of stock items
        inventorySlice.caseReducers.updateLowStockItems(state);
        inventorySlice.caseReducers.updateOutOfStockItems(state);
      })
      .addCase(updateInventory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add inventory
      .addCase(addInventory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addInventory.fulfilled, (state, action) => {
        state.loading = false;
        state.inventory.push(action.payload);
        // Update low stock and out of stock items
        inventorySlice.caseReducers.updateLowStockItems(state);
        inventorySlice.caseReducers.updateOutOfStockItems(state);
      })
      .addCase(addInventory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete inventory item
      .addCase(deleteInventoryItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteInventoryItem.fulfilled, (state, action) => {
        state.loading = false;
        state.inventory = state.inventory.filter(item => item.productId !== action.payload);
        // Update low stock and out of stock items
        inventorySlice.caseReducers.updateLowStockItems(state);
        inventorySlice.caseReducers.updateOutOfStockItems(state);
      })
      .addCase(deleteInventoryItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Process sale
      .addCase(processSale.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(processSale.fulfilled, (state, action) => {
        state.loading = false;
        // Update all inventory items that were affected by the sale
        action.payload.forEach(updatedItem => {
          const index = state.inventory.findIndex(item => item.productId === updatedItem.productId);
          if (index !== -1) {
            state.inventory[index] = updatedItem;
          }
        });
        // Update low stock and out of stock items
        inventorySlice.caseReducers.updateLowStockItems(state);
        inventorySlice.caseReducers.updateOutOfStockItems(state);
      })
      .addCase(processSale.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Process purchase
      .addCase(processPurchase.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(processPurchase.fulfilled, (state, action) => {
        state.loading = false;
        // Update all inventory items that were affected by the purchase
        action.payload.forEach(updatedItem => {
          const index = state.inventory.findIndex(item => item.productId === updatedItem.productId);
          if (index !== -1) {
            // Update existing item
            state.inventory[index] = updatedItem;
          } else {
            // Add new item
            state.inventory.push(updatedItem);
          }
        });
        // Update low stock and out of stock items
        inventorySlice.caseReducers.updateLowStockItems(state);
        inventorySlice.caseReducers.updateOutOfStockItems(state);
      })
      .addCase(processPurchase.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create inventory for new product
      .addCase(createInventoryForProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createInventoryForProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.inventory.push(action.payload);
        // Update low stock and out of stock items
        inventorySlice.caseReducers.updateLowStockItems(state);
        inventorySlice.caseReducers.updateOutOfStockItems(state);
      })
      .addCase(createInventoryForProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Initialize inventory
      .addCase(initializeInventory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(initializeInventory.fulfilled, (state, action) => {
        state.loading = false;
        state.inventory = action.payload;
        // Update low stock and out of stock items
        inventorySlice.caseReducers.updateLowStockItems(state);
        inventorySlice.caseReducers.updateOutOfStockItems(state);
      })
      .addCase(initializeInventory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, updateLowStockItems, updateOutOfStockItems, createMissingInventory } = inventorySlice.actions;
export default inventorySlice.reducer; 