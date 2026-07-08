import api from './api';

const transactionService = {
  // Get all transactions with filtering and pagination
  getTransactions: async (params = {}) => {
    try {
      const response = await api.get('/transactions', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get transaction by ID
  getTransactionById: async (id) => {
    try {
      const response = await api.get(`/transactions/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create new transaction
  createTransaction: async (transactionData) => {
    try {
      const response = await api.post('/transactions', transactionData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Update transaction
  updateTransaction: async (id, transactionData) => {
    try {
      const response = await api.put(`/transactions/${id}`, transactionData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete transaction
  deleteTransaction: async (id) => {
    try {
      const response = await api.delete(`/transactions/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Add payment to transaction
  addPayment: async (transactionId, paymentData) => {
    try {
      const response = await api.post(`/transactions/${transactionId}/payments`, paymentData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get transaction summary
  getTransactionSummary: async (params = {}) => {
    try {
      const response = await api.get('/transactions/summary', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get sales transactions
  getSales: async (params = {}) => {
    try {
      const response = await api.get('/transactions', { 
        params: { ...params, type: 'sale' }
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Get purchase transactions
  getPurchases: async (params = {}) => {
    try {
      const response = await api.get('/transactions', { 
        params: { ...params, type: 'purchase' }
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Generate transaction number
  generateTransactionNumber: (type) => {
    const prefix = type === 'purchase' ? 'P' : 'S';
    const timestamp = Date.now().toString().slice(-8);
    return `${prefix}${timestamp}`;
  },

  // Calculate transaction totals
  calculateTransactionTotals: (items) => {
    let totalWeight = 0;
    let totalAmount = 0;

    items.forEach(item => {
      totalWeight += parseFloat(item.weight || 0) * parseInt(item.quantity || 1);
      totalAmount += parseFloat(item.total_price || 0);
    });

    return {
      totalWeight: totalWeight.toFixed(3),
      totalAmount: totalAmount.toFixed(2)
    };
  },

  // Calculate item price based on weight, purity, gold price and making wage
  calculateItemPrice: (weight, purity, goldPrice, makingWage = 0) => {
    const purityFactor = purity / 24; // Convert purity to factor (18k = 0.75)
    const goldValue = parseFloat(weight) * purityFactor * parseFloat(goldPrice);
    const totalPrice = goldValue + parseFloat(makingWage);
    return totalPrice.toFixed(2);
  }
};

export default transactionService;