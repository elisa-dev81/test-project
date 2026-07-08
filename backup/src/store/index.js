import { configureStore } from '@reduxjs/toolkit';
import productReducer from './slices/productSlice';
import categoryReducer from './slices/categorySlice';
import inventoryReducer from './slices/inventorySlice';
import settingsReducer from './slices/settingsSlice';
import transactionReducer from './slices/transactionSlice';
import expenseReducer from './slices/expenseSlice';
import installmentReducer from './slices/installmentSlice';
import priceReducer from './slices/priceSlice';

export const store = configureStore({
  reducer: {
    products: productReducer,
    categories: categoryReducer,
    inventory: inventoryReducer,
    settings: settingsReducer,
    transactions: transactionReducer,
    expenses: expenseReducer,
    installments: installmentReducer,
    prices: priceReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
}); 