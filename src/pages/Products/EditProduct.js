import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  CircularProgress,
  InputAdornment,
  Snackbar,
} from '@mui/material';
import { ArrowBack, Save, Edit } from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { updateProduct } from '../../store/slices/productSlice';

const EditProduct = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  
  const { products, loading } = useSelector((state) => state.products);
  const { categories } = useSelector((state) => state.categories);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: '',
    subType: '',
    category: '',
    price: '',
    weight: '',
    purity: '',
    brand: '',
    model: '',
    year: '',
    condition: 'new',
    image: '',
  });

  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [product, setProduct] = useState(null);

  useEffect(() => {
    if (products.length > 0 && id) {
      const foundProduct = products.find(p => p.id === parseInt(id));
      if (foundProduct) {
        setProduct(foundProduct);
        setFormData({
          name: foundProduct.name || '',
          description: foundProduct.description || '',
          type: foundProduct.type || '',
          subType: foundProduct.subType || '',
          category: foundProduct.categoryId || foundProduct.category || '',
          price: foundProduct.sellingPrice || foundProduct.price || '',
          weight: foundProduct.weight || '',
          purity: foundProduct.purity || '',
          brand: foundProduct.brand || '',
          model: foundProduct.model || '',
          year: foundProduct.year || '',
          condition: foundProduct.condition || 'new',
          image: foundProduct.image || '',
        });
      }
    }
  }, [products, id]);

  const handleChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.value,
    });
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: '',
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'نام محصول الزامی است';
    }

    if (!formData.type) {
      newErrors.type = 'نوع محصول الزامی است';
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'قیمت معتبر الزامی است';
    }

    if (!formData.category) {
      newErrors.category = 'دسته‌بندی الزامی است';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await dispatch(updateProduct({ 
        id: id, 
        productData: formData 
      })).unwrap();
      
      setSuccess(true);
      setSuccessMessage('محصول با موفقیت ویرایش شد!');
      setTimeout(() => {
        navigate(`/products/${id}`);
      }, 2000);
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  const getSubTypeOptions = () => {
    switch (formData.type) {
      case 'gold':
        return [
          { value: 'ring', label: 'حلقه' },
          { value: 'necklace', label: 'گردنبند' },
          { value: 'bracelet', label: 'دستبند' },
          { value: 'earring', label: 'گوشواره' },
          { value: 'chain', label: 'زنجیر' },
        ];
      case 'silver':
        return [
          { value: 'ring', label: 'حلقه' },
          { value: 'necklace', label: 'گردنبند' },
          { value: 'bracelet', label: 'دستبند' },
          { value: 'earring', label: 'گوشواره' },
          { value: 'chain', label: 'زنجیر' },
        ];
      case 'coin':
        return [
          { value: 'gold_coin', label: 'سکه طلا' },
          { value: 'silver_coin', label: 'سکه نقره' },
          { value: 'collector_coin', label: 'سکه کلکسیونی' },
        ];
      default:
        return [];
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!product) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 3 }}>
          محصول مورد نظر یافت نشد
        </Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/products')}
        >
          بازگشت به محصولات
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(`/products/${id}`)}
          sx={{ mr: 2 }}
        >
          بازگشت
        </Button>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          ویرایش محصول
        </Typography>
      </Box>

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          محصول با موفقیت ویرایش شد! در حال بازگشت به صفحه جزئیات...
        </Alert>
      )}

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Basic Information */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ color: '#d4af37' }}>
                  اطلاعات پایه
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="نام محصول"
                  value={formData.name}
                  onChange={handleChange('name')}
                  error={!!errors.name}
                  helperText={errors.name}
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth error={!!errors.type} required>
                  <InputLabel>نوع محصول</InputLabel>
                  <Select
                    value={formData.type}
                    onChange={handleChange('type')}
                    label="نوع محصول"
                  >
                    <MenuItem value="gold">طلا</MenuItem>
                    <MenuItem value="silver">نقره</MenuItem>
                    <MenuItem value="coin">سکه</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>زیر نوع</InputLabel>
                  <Select
                    value={formData.subType}
                    onChange={handleChange('subType')}
                    label="زیر نوع"
                    disabled={!formData.type}
                  >
                    {getSubTypeOptions().map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth error={!!errors.category} required>
                  <InputLabel>دسته‌بندی</InputLabel>
                  <Select
                    value={formData.category}
                    onChange={handleChange('category')}
                    label="دسته‌بندی"
                  >
                    {categories.map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="توضیحات"
                  value={formData.description}
                  onChange={handleChange('description')}
                  multiline
                  rows={3}
                />
              </Grid>

              {/* Pricing and Specifications */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ color: '#d4af37', mt: 2 }}>
                  قیمت و مشخصات
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="قیمت (تومان)"
                  value={formData.price}
                  onChange={handleChange('price')}
                  type="number"
                  error={!!errors.price}
                  helperText={errors.price}
                  required
                  InputProps={{
                    startAdornment: <InputAdornment position="start">تومان</InputAdornment>,
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="وزن (گرم)"
                  value={formData.weight}
                  onChange={handleChange('weight')}
                  type="number"
                  InputProps={{
                    endAdornment: <InputAdornment position="end">گرم</InputAdornment>,
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="عیار"
                  value={formData.purity}
                  onChange={handleChange('purity')}
                  placeholder="مثال: 18"
                  InputProps={{
                    endAdornment: <InputAdornment position="end">عیار</InputAdornment>,
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>وضعیت</InputLabel>
                  <Select
                    value={formData.condition}
                    onChange={handleChange('condition')}
                    label="وضعیت"
                  >
                    <MenuItem value="new">نو</MenuItem>
                    <MenuItem value="used">کارکرده</MenuItem>
                    <MenuItem value="vintage">قدیمی</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Additional Information */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ color: '#d4af37', mt: 2 }}>
                  اطلاعات تکمیلی
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="برند"
                  value={formData.brand}
                  onChange={handleChange('brand')}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="مدل"
                  value={formData.model}
                  onChange={handleChange('model')}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="سال ساخت"
                  value={formData.year}
                  onChange={handleChange('year')}
                  type="number"
                  placeholder="مثال: 1400"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="تصویر محصول (URL)"
                  value={formData.image}
                  onChange={handleChange('image')}
                  placeholder="https://example.com/image.jpg"
                />
              </Grid>

              {/* Submit Button */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate(`/products/${id}`)}
                    disabled={loading}
                  >
                    انصراف
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                    disabled={loading}
                    sx={{ backgroundColor: '#d4af37', '&:hover': { backgroundColor: '#b8941f' } }}
                  >
                    {loading ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>

      {/* Success Message */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={4000}
        onClose={() => setSuccessMessage('')}
        message={successMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
};

export default EditProduct; 