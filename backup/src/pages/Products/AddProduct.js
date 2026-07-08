import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  MenuItem,
  Alert,
  CircularProgress,
  Link
} from '@mui/material';
import { Add as AddIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { productService } from '../../services/productService';
import { fetchCategories } from '../../store/slices/categorySlice';

const AddProduct = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // استفاده از Redux store
  const { categories, loading: categoriesLoading, error: categoriesError } = useSelector(state => state.categories);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    weight: '',
    purity: '',
    making_wage: '',
    category_id: ''
  });

  // دریافت دسته‌بندی‌ها از Redux store در هنگام لود صفحه
  useEffect(() => {
    if (categories.length === 0) {
      dispatch(fetchCategories());
    }
  }, [dispatch, categories.length]);

  // تابع refresh برای دریافت مجدد دسته‌بندی‌ها
  const handleRefreshCategories = () => {
    dispatch(fetchCategories());
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // تبدیل مقادیر عددی
      const productData = {
        ...formData,
        weight: parseFloat(formData.weight),
        purity: parseInt(formData.purity),
        making_wage: parseFloat(formData.making_wage),
        category_id: parseInt(formData.category_id)
      };

      await productService.createProduct(productData);
      // نمایش پیام موفقیت و برگشت به صفحه محصولات
      alert('محصول با موفقیت اضافه شد!');
      navigate('/products');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" sx={{ mb: 4, fontFamily: 'Vazirmatn' }}>
          افزودن محصول جدید
        </Typography>

        {(error || categoriesError) && (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error || categoriesError}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              name="name"
              label="نام محصول"
              value={formData.name}
              onChange={handleChange}
              required
              fullWidth
              sx={{ '& .MuiInputLabel-root': { fontFamily: 'Vazirmatn' } }}
              InputProps={{ sx: { fontFamily: 'Vazirmatn' } }}
            />

            <TextField
              name="description"
              label="توضیحات"
              value={formData.description}
              onChange={handleChange}
              multiline
              rows={4}
              fullWidth
              sx={{ '& .MuiInputLabel-root': { fontFamily: 'Vazirmatn' } }}
              InputProps={{ sx: { fontFamily: 'Vazirmatn' } }}
            />

            <TextField
              name="weight"
              label="وزن (گرم)"
              type="number"
              value={formData.weight}
              onChange={handleChange}
              required
              fullWidth
              inputProps={{ step: '0.01', min: '0' }}
              sx={{ '& .MuiInputLabel-root': { fontFamily: 'Vazirmatn' } }}
              InputProps={{ sx: { fontFamily: 'Vazirmatn' } }}
            />

            <TextField
              name="purity"
              label="عیار"
              type="number"
              value={formData.purity}
              onChange={handleChange}
              required
              fullWidth
              inputProps={{ min: '0', max: '999' }}
              sx={{ '& .MuiInputLabel-root': { fontFamily: 'Vazirmatn' } }}
              InputProps={{ sx: { fontFamily: 'Vazirmatn' } }}
            />

            <TextField
              name="making_wage"
              label="اجرت ساخت (درصد)"
              type="number"
              value={formData.making_wage}
              onChange={handleChange}
              required
              fullWidth
              inputProps={{ step: '0.1', min: '0' }}
              sx={{ '& .MuiInputLabel-root': { fontFamily: 'Vazirmatn' } }}
              InputProps={{ sx: { fontFamily: 'Vazirmatn' } }}
            />

            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle1" sx={{ fontFamily: 'Vazirmatn' }}>
                  دسته‌بندی
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<RefreshIcon />}
                    onClick={handleRefreshCategories}
                    disabled={categoriesLoading}
                    sx={{ fontFamily: 'Vazirmatn' }}
                  >
                    {categoriesLoading ? 'در حال بارگذاری...' : 'بروزرسانی'}
                  </Button>
                  {categories.length === 0 && (
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<AddIcon />}
                      onClick={() => window.open('/categories', '_blank')}
                      sx={{ fontFamily: 'Vazirmatn' }}
                    >
                      ایجاد دسته‌بندی
                    </Button>
                  )}
                </Box>
              </Box>
              
              <TextField
                name="category_id"
                label="انتخاب دسته‌بندی"
                select
                value={formData.category_id}
                onChange={handleChange}
                required
                fullWidth
                sx={{ '& .MuiInputLabel-root': { fontFamily: 'Vazirmatn' } }}
                SelectProps={{ sx: { fontFamily: 'Vazirmatn' } }}
                helperText={categories.length === 0 ? "ابتدا باید دسته‌بندی ایجاد کنید" : "یک دسته‌بندی انتخاب کنید"}
                error={categories.length === 0}
                disabled={categories.length === 0}
              >
                {categories.length === 0 ? (
                  <MenuItem disabled sx={{ fontFamily: 'Vazirmatn' }}>
                    هیچ دسته‌بندی موجود نیست
                  </MenuItem>
                ) : (
                  categories.map(category => (
                    <MenuItem key={category.id} value={category.id} sx={{ fontFamily: 'Vazirmatn' }}>
                      {category.name}
                    </MenuItem>
                  ))
                )}
              </TextField>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                type="button"
                variant="outlined"
                onClick={() => navigate('/products')}
                disabled={loading}
                sx={{ fontFamily: 'Vazirmatn' }}
              >
                انصراف
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                sx={{ fontFamily: 'Vazirmatn' }}
              >
                {loading ? <CircularProgress size={24} /> : 'ذخیره'}
              </Button>
            </Box>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default AddProduct;