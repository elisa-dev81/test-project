import api from './api';

export const categoryService = {
  // دریافت همه دسته‌بندی‌ها
  getAllCategories: async () => {
    return await api.get('/categories');
  },

  // دریافت یک دسته‌بندی با شناسه
  getCategoryById: async (id) => {
    return await api.get(`/categories/${id}`);
  },

  // ایجاد دسته‌بندی جدید
  createCategory: async (categoryData) => {
    return await api.post('/categories', categoryData);
  },

  // به‌روزرسانی دسته‌بندی
  updateCategory: async (id, categoryData) => {
    return await api.put(`/categories/${id}`, categoryData);
  },

  // حذف دسته‌بندی
  deleteCategory: async (id) => {
    return await api.delete(`/categories/${id}`);
  }
};