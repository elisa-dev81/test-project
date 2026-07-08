import api from './api';

export const inventoryService = {
  // دریافت همه موجودی‌ها
  getAllInventory: async () => {
    return await api.get('/inventory');
  },

  // دریافت یک موجودی با شناسه
  getInventoryById: async (id) => {
    return await api.get(`/inventory/${id}`);
  },

  // ایجاد موجودی جدید
  createInventory: async (inventoryData) => {
    return await api.post('/inventory', inventoryData);
  },

  // به‌روزرسانی موجودی
  updateInventory: async (id, inventoryData) => {
    return await api.put(`/inventory/${id}`, inventoryData);
  },

  // حذف موجودی
  deleteInventory: async (id) => {
    return await api.delete(`/inventory/${id}`);
  }
};