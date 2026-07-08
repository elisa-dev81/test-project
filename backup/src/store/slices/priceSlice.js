import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  prices: {
    metals: null,
    crypto: null,
    iranian: null,
  },
  loading: false,
  error: null,
  lastUpdate: null,
};

const priceSlice = createSlice({
  name: 'prices',
  initialState,
  reducers: {
    setPricesLoading: (state, action) => {
      state.loading = action.payload;
    },
    setPricesSuccess: (state, action) => {
      state.prices = action.payload;
      state.loading = false;
      state.error = null;
      state.lastUpdate = new Date().toISOString();
    },
    setPricesError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    // Action برای دریافت قیمت طلای 18 عیار
    setGold18kPrice: (state, action) => {
      if (!state.prices.iranian) {
        state.prices.iranian = { gold_gram: {} };
      }
      if (!state.prices.iranian.gold_gram) {
        state.prices.iranian.gold_gram = {};
      }
      state.prices.iranian.gold_gram.gold_18k = action.payload;
    },
  },
});

export const {
  setPricesLoading,
  setPricesSuccess,
  setPricesError,
  setGold18kPrice,
} = priceSlice.actions;

// Selector برای گرفتن قیمت طلای 18 عیار
export const selectGold18kPrice = (state) => 
  state.prices?.prices?.iranian?.gold_gram?.gold_18k?.price || 0;

export const selectPricesLoading = (state) => state.prices.loading;
export const selectPricesError = (state) => state.prices.error;

export default priceSlice.reducer;











