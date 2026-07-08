import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Snackbar,
  InputAdornment,
} from '@mui/material';
import { ArrowBack, Save, Inventory as InventoryIcon } from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { updateInventory } from '../../store/slices/inventorySlice';

const EditInventory = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { productId } = useParams();
  
  const { inventory, loading } = useSelector((state) => state.inventory);
  const { products } = useSelector((state) => state.products);

  const [formData, setFormData] = useState({
    quantity: '',
    minStockLevel: '',
    location: '',
    notes: '',
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [inventoryItem, setInventoryItem] = useState(null);
  const [product, setProduct] = useState(null);

  useEffect(() => {
    if (inventory.length > 0 && products.length > 0 && productId) {
      const foundItem = inventory.find(item => item.productId === parseInt(productId));
      if (foundItem) {
        setInventoryItem(foundItem);
        
        const foundProduct = products.find(p => p.id === foundItem.productId);
        if (foundProduct) {
          setProduct(foundProduct);
          
          setFormData({
            quantity: foundItem.quantity || '',
            minStockLevel: foundItem.minStockLevel || foundProduct.minStockLevel || '',
            location: foundItem.location || '',
            notes: foundItem.notes || '',
          });
        }
      }
    }
  }, [inventory, products, productId]);

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

    if (!formData.quantity || parseInt(formData.quantity) < 0) {
      newErrors.quantity = 'تعداد موجودی معتبر الزامی است';
    }

    if (!formData.minStockLevel || parseInt(formData.minStockLevel) < 0) {
      newErrors.minStockLevel = 'حداقل موجودی معتبر الزامی است';
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
      const inventoryData = {
        productId: parseInt(productId),
        quantity: parseInt(formData.quantity),
        minStockLevel: parseInt(formData.minStockLevel),
        location: formData.location,
        notes: formData.notes,
      };

      await dispatch(updateInventory(inventoryData)).unwrap();
      
      setSuccessMessage('موجودی با موفقیت ویرایش شد!');
      setTimeout(() => {
        navigate(`/inventory/${productId}`);
      }, 2000);
    } catch (error) {
      console.error('Error updating inventory:', error);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!inventoryItem || !product) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 3 }}>
          آیتم موجودی مورد نظر یافت نشد
        </Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/inventory')}
        >
          بازگشت به موجودی
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
          onClick={() => navigate(`/inventory/${productId}`)}
          sx={{ mr: 2 }}
        >
          بازگشت
        </Button>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          ویرایش موجودی
        </Typography>
      </Box>

      {/* Product Info */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ color: '#d4af37', display: 'flex', alignItems: 'center' }}>
            <InventoryIcon sx={{ mr: 1 }} />
            اطلاعات محصول
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            <strong>نام محصول:</strong> {product.name}
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            <strong>نوع:</strong> {product.type === 'gold' ? 'طلا' : product.type === 'silver' ? 'نقره' : 'سکه'}
          </Typography>
          <Typography variant="body1">
            <strong>قیمت:</strong> {product.sellingPrice?.toLocaleString()} تومان
          </Typography>
        </CardContent>
      </Card>

      {/* Edit Form */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ color: '#d4af37', mb: 3 }}>
            ویرایش اطلاعات موجودی
          </Typography>

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="تعداد موجودی"
                  type="number"
                  value={formData.quantity}
                  onChange={handleChange('quantity')}
                  error={!!errors.quantity}
                  helperText={errors.quantity}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">عدد</InputAdornment>,
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="حداقل موجودی"
                  type="number"
                  value={formData.minStockLevel}
                  onChange={handleChange('minStockLevel')}
                  error={!!errors.minStockLevel}
                  helperText={errors.minStockLevel}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">عدد</InputAdornment>,
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

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="توضیحات"
                  value={formData.notes}
                  onChange={handleChange('notes')}
                  multiline
                  rows={3}
                  placeholder="توضیحات اضافی درباره موجودی..."
                />
              </Grid>

              {/* Submit Button */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate(`/inventory/${productId}`)}
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

export default EditInventory; 