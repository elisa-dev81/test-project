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
  Chip,
  Avatar,
} from '@mui/material';
import { ArrowBack, Save, Add, Inventory } from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addInventory } from '../../store/slices/inventorySlice';

const AddInventory = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { products } = useSelector((state) => state.products);
  const { categories } = useSelector((state) => state.categories);
  const { inventory, loading } = useSelector((state) => state.inventory);

  const [formData, setFormData] = useState({
    productId: '',
    quantity: '',
    minQuantity: '',
    maxQuantity: '',
    unitPrice: '',
    location: '',
    notes: '',
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  // Debug: Log formData changes
  useEffect(() => {
    console.log('FormData changed:', formData);
  }, [formData]);

  // Get products that don't have inventory yet
  const availableProducts = products.filter(product => {
    const hasInventory = inventory.some(item => item.productId === product.id);
    return !hasInventory;
  });

  // Debug: Log available products
  console.log('Available products:', availableProducts);
  console.log('All products:', products);
  console.log('Inventory:', inventory);

  const getProductInfo = (productId) => {
    return products.find(product => product.id === productId);
  };

  const getCategoryInfo = (categoryId) => {
    return categories.find(category => category.id === categoryId);
  };

  const getProductTypeColor = (type) => {
    switch (type) {
      case 'gold': return 'warning';
      case 'silver': return 'info';
      case 'coin': return 'success';
      default: return 'default';
    }
  };

  const getProductTypeLabel = (type) => {
    switch (type) {
      case 'gold': return 'طلا';
      case 'silver': return 'نقره';
      case 'coin': return 'سکه';
      default: return type;
    }
  };

  const handleChange = (field) => (event) => {
    const value = event.target.value;
    console.log(`Changing ${field} to:`, value);
    
    setFormData({
      ...formData,
      [field]: value,
    });
    
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: '',
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.productId) {
      newErrors.productId = 'انتخاب محصول الزامی است';
    }

    if (!formData.quantity || parseFloat(formData.quantity) < 0) {
      newErrors.quantity = 'تعداد موجودی معتبر الزامی است';
    }

    if (formData.minQuantity && parseFloat(formData.minQuantity) < 0) {
      newErrors.minQuantity = 'حداقل موجودی معتبر الزامی است';
    }

    if (formData.maxQuantity && parseFloat(formData.maxQuantity) < parseFloat(formData.quantity)) {
      newErrors.maxQuantity = 'حداکثر موجودی باید بیشتر از موجودی فعلی باشد';
    }

    if (formData.unitPrice && parseFloat(formData.unitPrice) < 0) {
      newErrors.unitPrice = 'قیمت واحد معتبر الزامی است';
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
      await dispatch(addInventory(formData)).unwrap();
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/inventory');
      }, 2000);
    } catch (error) {
      console.error('Error adding inventory:', error);
    }
  };

  const selectedProduct = getProductInfo(formData.productId);
  const selectedCategory = selectedProduct ? getCategoryInfo(selectedProduct.categoryId || selectedProduct.category) : null;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/inventory')}
          sx={{ mr: 2 }}
        >
          بازگشت
        </Button>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          افزودن موجودی جدید
        </Typography>
      </Box>

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          موجودی با موفقیت اضافه شد! در حال بازگشت به صفحه موجودی...
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Form */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: '#d4af37' }}>
                اطلاعات موجودی
              </Typography>
              
              <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <FormControl fullWidth error={!!errors.productId} required>
                      <InputLabel>انتخاب محصول</InputLabel>
                      <Select
                        value={formData.productId || ''}
                        onChange={handleChange('productId')}
                        label="انتخاب محصول"
                        displayEmpty
                        renderValue={(value) => {
                          if (!value) return 'انتخاب کنید';
                          const product = availableProducts.find(p => p.id === value);
                          return product ? product.name : 'انتخاب کنید';
                        }}
                      >
                        {availableProducts.length > 0 ? (
                          availableProducts.map((product) => (
                            <MenuItem key={product.id} value={product.id}>
                              {product.name}
                            </MenuItem>
                          ))
                        ) : (
                          <MenuItem disabled>هیچ محصولی برای افزودن موجودی وجود ندارد</MenuItem>
                        )}
                      </Select>
                                             {errors.productId && (
                         <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                           {errors.productId}
                         </Typography>
                       )}
                       {availableProducts.length === 0 && (
                         <Typography variant="caption" color="warning" sx={{ mt: 1 }}>
                           تمام محصولات دارای موجودی هستند. ابتدا محصول جدیدی اضافه کنید.
                         </Typography>
                       )}
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="تعداد موجودی"
                      value={formData.quantity}
                      onChange={handleChange('quantity')}
                      type="number"
                      error={!!errors.quantity}
                      helperText={errors.quantity}
                      required
                      InputProps={{
                        endAdornment: <InputAdornment position="end">عدد</InputAdornment>,
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="حداقل موجودی"
                      value={formData.minQuantity}
                      onChange={handleChange('minQuantity')}
                      type="number"
                      error={!!errors.minQuantity}
                      helperText={errors.minQuantity}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">عدد</InputAdornment>,
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="حداکثر موجودی"
                      value={formData.maxQuantity}
                      onChange={handleChange('maxQuantity')}
                      type="number"
                      error={!!errors.maxQuantity}
                      helperText={errors.maxQuantity}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">عدد</InputAdornment>,
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="قیمت واحد (تومان)"
                      value={formData.unitPrice}
                      onChange={handleChange('unitPrice')}
                      type="number"
                      error={!!errors.unitPrice}
                      helperText={errors.unitPrice}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">تومان</InputAdornment>,
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="محل نگهداری"
                      value={formData.location}
                      onChange={handleChange('location')}
                      placeholder="مثال: انبار اصلی، قفسه A1"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="یادداشت"
                      value={formData.notes}
                      onChange={handleChange('notes')}
                      multiline
                      rows={3}
                      placeholder="توضیحات اضافی درباره موجودی..."
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
                      <Button
                        variant="outlined"
                        onClick={() => navigate('/inventory')}
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
                        {loading ? 'در حال ذخیره...' : 'ذخیره موجودی'}
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </form>
            </CardContent>
          </Card>
        </Grid>

        {/* Product Preview */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: '#d4af37' }}>
                اطلاعات محصول
              </Typography>
              
              {selectedProduct ? (
                <Box>
                  <Box sx={{ textAlign: 'center', mb: 2 }}>
                    <Avatar
                      sx={{
                        width: 80,
                        height: 80,
                        mx: 'auto',
                        backgroundColor: '#f5f5f5',
                        color: '#666',
                        fontSize: '2rem',
                      }}
                    >
                      {selectedProduct.name.charAt(0)}
                    </Avatar>
                  </Box>

                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                    {selectedProduct.name}
                  </Typography>

                  <Typography variant="body2" color="textSecondary" sx={{ mb: 2, textAlign: 'center' }}>
                    {selectedProduct.description}
                  </Typography>

                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                    <Chip
                      label={getProductTypeLabel(selectedProduct.type)}
                      color={getProductTypeColor(selectedProduct.type)}
                      size="small"
                    />
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                    <Chip
                      label={selectedCategory?.name || 'بدون دسته‌بندی'}
                      variant="outlined"
                      size="small"
                    />
                  </Box>

                                     <Typography variant="h6" sx={{ color: '#d4af37', fontWeight: 'bold', textAlign: 'center' }}>
                     {selectedProduct.sellingPrice?.toLocaleString('fa-IR')} تومان
                   </Typography>

                  {selectedProduct.weight && (
                    <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', mt: 1 }}>
                      وزن: {selectedProduct.weight} گرم
                    </Typography>
                  )}

                  {selectedProduct.purity && (
                    <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center' }}>
                      عیار: {selectedProduct.purity}
                    </Typography>
                  )}
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Inventory sx={{ fontSize: 60, color: '#ccc', mb: 2 }} />
                  <Typography variant="body1" color="textSecondary">
                    ابتدا یک محصول انتخاب کنید
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Available Products Count */}
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: '#d4af37' }}>
                محصولات قابل افزودن
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                {availableProducts.length}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center' }}>
                محصول بدون موجودی
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AddInventory; 