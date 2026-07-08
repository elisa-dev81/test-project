import api from './api';

export const productService = {
  // دریافت همه محصولات
  getAllProducts: async () => {
    return await api.get('/products');
  },

  // دریافت یک محصول با شناسه
  getProductById: async (id) => {
    return await api.get(`/products/${id}`);
  },

  // ایجاد محصول جدید
  createProduct: async (productData) => {
    return await api.post('/products', productData);
  },

  // به‌روزرسانی محصول
  updateProduct: async (id, productData) => {
    return await api.put(`/products/${id}`, productData);
  },

  // حذف محصول
  deleteProduct: async (id) => {
    return await api.delete(`/products/${id}`);
  }
};