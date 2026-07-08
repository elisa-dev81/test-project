import api from './api';

const expenseService = {
  // Get all expenses with filtering and pagination
  getExpenses: async (params = {}) => {
    try {
      const response = await api.get('/expenses', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get expense by ID
  getExpenseById: async (id) => {
    try {
      const response = await api.get(`/expenses/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create new expense
  createExpense: async (expenseData) => {
    try {
      const response = await api.post('/expenses', expenseData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update expense
  updateExpense: async (id, expenseData) => {
    try {
      const response = await api.put(`/expenses/${id}`, expenseData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete expense
  deleteExpense: async (id) => {
    try {
      const response = await api.delete(`/expenses/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get expense summary
  getExpenseSummary: async (params = {}) => {
    try {
      const response = await api.get('/expenses/summary', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get expenses by category
  getExpensesByCategory: async (category, params = {}) => {
    try {
      const response = await api.get('/expenses', { 
        params: { ...params, category }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get expense categories with translations
  getExpenseCategories: () => {
    return [
      { value: 'rent', label: 'اجاره' },
      { value: 'utilities', label: 'هزینه‌های عمومی' },
      { value: 'supplies', label: 'لوازم' },
      { value: 'marketing', label: 'بازاریابی' },
      { value: 'labor', label: 'نیروی کار' },
      { value: 'equipment', label: 'تجهیزات' },
      { value: 'maintenance', label: 'تعمیر و نگهداری' },
      { value: 'other', label: 'سایر' }
    ];
  },

  // Get payment methods with translations
  getPaymentMethods: () => {
    return [
      { value: 'cash', label: 'نقدی' },
      { value: 'card', label: 'کارت' },
      { value: 'check', label: 'چک' },
      { value: 'transfer', label: 'انتقال' }
    ];
  },

  // Get expense status options with translations
  getExpenseStatuses: () => {
    return [
      { value: 'pending', label: 'در انتظار' },
      { value: 'paid', label: 'پرداخت شده' },
      { value: 'cancelled', label: 'لغو شده' }
    ];
  },

  // Format expense data for display
  formatExpenseForDisplay: (expense) => {
    const categories = expenseService.getExpenseCategories();
    const paymentMethods = expenseService.getPaymentMethods();
    const statuses = expenseService.getExpenseStatuses();

    const categoryLabel = categories.find(cat => cat.value === expense.category)?.label || expense.category;
    const paymentMethodLabel = paymentMethods.find(method => method.value === expense.payment_method)?.label || expense.payment_method;
    const statusLabel = statuses.find(status => status.value === expense.status)?.label || expense.status;

    return {
      ...expense,
      categoryLabel,
      paymentMethodLabel,
      statusLabel,
      formattedAmount: new Intl.NumberFormat('fa-IR').format(expense.amount),
      formattedDate: new Date(expense.expense_date).toLocaleDateString('fa-IR')
    };
  }
};

export default expenseService;