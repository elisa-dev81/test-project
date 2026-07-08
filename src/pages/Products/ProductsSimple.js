import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  MenuItem,
  Chip,
  Fab
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Visibility as ViewIcon } from '@mui/icons-material';
import { fetchCategories } from '../../store/slices/categorySlice';
import { fetchProducts, addProduct, updateProduct, deleteProduct } from '../../store/slices/productSlice';
import { productService } from '../../services/productService';
import { selectGold18kPrice, setPricesSuccess } from '../../store/slices/priceSlice';

const ProductsSimple = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { categories } = useSelector(state => state.categories);
  const { products, loading } = useSelector(state => state.products);
  
  // دریافت قیمت طلای 18 عیار از Redux store
  const gold18kPrice = useSelector(selectGold18kPrice);
  
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    weight: '',
    purity: '',
    making_wage: '',
    wage: '',
    category_id: ''
  });

  // تابع دریافت مستقیم قیمت طلای 18 عیار از Alan Chand API
  const fetchGold18kPrice = async () => {
    try {
      console.log('🔄 ProductsSimple: Fetching gold price from Alan Chand API...');
      const response = await fetch('http://localhost:5001/api/proxy/alan-chand');
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch price');
      }
      
      const data = result.data;
      const gold18kPrice = data['18ayar']?.price || 0;
      console.log('💰 ProductsSimple: Gold 18k price received:', gold18kPrice);
      
      if (gold18kPrice > 0) {
        const priceData = {
          iranian: {
            gold_gram: {
              gold_18k: {
                price: gold18kPrice,
                change: data['18ayar']?.dayChange || 0,
                currency: 'IRR',
                unit: 'تومان به ازای هر گرم',
                high: data['18ayar']?.high || 0,
                low: data['18ayar']?.low || 0,
                open: data['18ayar']?.open || 0,
                updated_at: data['18ayar']?.updated_at || '',
              }
            }
          },
          timestamp: new Date().toISOString(),
        };
        dispatch(setPricesSuccess(priceData));
      }
    } catch (error) {
      console.error('❌ ProductsSimple: Error fetching Alan Chand gold price:', error);
      const fallbackPrice = 7516000;
      const priceData = {
        iranian: {
          gold_gram: {
            gold_18k: {
              price: fallbackPrice,
              change: 0,
              currency: 'IRR',
              unit: 'تومان به ازای هر گرم',
              updated_at: new Date().toISOString(),
            }
          }
        },
        timestamp: new Date().toISOString(),
      };
      dispatch(setPricesSuccess(priceData));
      console.log('🔄 ProductsSimple: Using fallback price:', fallbackPrice);
    }
  };

  // لود کردن داده‌ها
  useEffect(() => {
    console.log('🔄 ProductsSimple: useEffect triggered, gold18kPrice:', gold18kPrice);
    
    if (categories.length === 0) {
      dispatch(fetchCategories());
    }
    
    if (gold18kPrice === 0) {
      console.log('💰 ProductsSimple: Gold price is 0, fetching...');
      fetchGold18kPrice();
    } else {
      console.log('✅ ProductsSimple: Gold price already available:', gold18kPrice);
    }
  }, [dispatch, categories.length, gold18kPrice]);

  // محاسبه قیمت محصول بر اساس وزن و عیار (با قیمت از Redux)
  const calculateProductPrice = (weight, purity) => {
    if (purity >= 900) {
      // محاسبه نقره (عیار 925، 950 و غیره)
      const purityFactor = purity / 1000;
      return weight * gold18kPrice * 0.015 * purityFactor; // نسبت نقره به طلا
    } else {
      // تشخیص نوع عیار
      let adjustedPurity;
      if (purity >= 100) {
        // عیار هزارگان (مثل 750, 585, 916, 999)
        adjustedPurity = (purity / 1000) * 24; // تبدیل به عیار 24گانه
      } else {
        // عیار 24گانه (مثل 18, 21, 22, 24)
        adjustedPurity = purity;
      }
      
      // استفاده از قیمت 18 عیار از Redux
      if (adjustedPurity === 18) {
        return weight * gold18kPrice;
      } else {
        // محاسبه بر اساس نسبت عیار
        const pricePerGram = gold18kPrice * (adjustedPurity / 18); // نسبت به 18 عیار
        return weight * pricePerGram;
      }
    }
  };

  // دریافت نام دسته‌بندی
  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'نامشخص';
  };

  // باز کردن dialog افزودن
  const handleAdd = () => {
    setFormData({
      name: '',
      description: '',
      weight: '',
      purity: '',
      making_wage: '',
      wage: '',
      category_id: ''
    });
    setError('');
    setAddDialogOpen(true);
  };

  // باز کردن dialog ویرایش
  const handleEdit = (product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      weight: product.weight.toString(),
      purity: product.purity.toString(),
      making_wage: product.making_wage.toString(),
      category_id: product.category_id.toString()
    });
    setError('');
    setEditDialogOpen(true);
  };

  // باز کردن dialog حذف
  const handleDelete = (product) => {
    setSelectedProduct(product);
    setDeleteDialogOpen(true);
  };

  // تغییر فیلدها
  const handleChange = (field) => (event) => {
    setFormData({ ...formData, [field]: event.target.value });
  };

  // ارسال فرم
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.weight || !formData.purity || !formData.making_wage || !formData.category_id) {
      setError('تمام فیلدهای ضروری را پر کنید');
      return;
    }

    setSubmitLoading(true);
    setError('');

    try {
      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        weight: parseFloat(formData.weight),
        purity: parseInt(formData.purity),
        making_wage: parseFloat(formData.making_wage),
        wage: parseFloat(formData.wage),
        category_id: parseInt(formData.category_id)
      };

      if (addDialogOpen) {
        await dispatch(addProduct(productData));
        setAddDialogOpen(false);
        alert('محصول با موفقیت اضافه شد!');
      } else if (editDialogOpen && selectedProduct) {
        await dispatch(updateProduct({ id: selectedProduct.id, productData }));
        setEditDialogOpen(false);
        alert('محصول با موفقیت ویرایش شد!');
      }
      
      setFormData({
        name: '',
        description: '',
        weight: '',
        purity: '',
        making_wage: '',
        category_id: ''
      });
      setSelectedProduct(null);
    } catch (error) {
      console.error('Error saving product:', error);
      setError(error.message || 'خطا در ذخیره محصول');
    } finally {
      setSubmitLoading(false);
    }
  };

  // حذف محصول
  const confirmDelete = async () => {
    if (!selectedProduct) return;
    
    setSubmitLoading(true);
    try {
      await dispatch(deleteProduct(selectedProduct.id));
      setDeleteDialogOpen(false);
      setSelectedProduct(null);
      alert('محصول با موفقیت حذف شد!');
    } catch (error) {
      console.error('Error deleting product:', error);
      setError(error.message || 'خطا در حذف محصول');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontFamily: 'Vazirmatn', fontWeight: 'bold', mb: 1 }}>
            محصولات
          </Typography>
          <Chip 
            label={gold18kPrice > 0 ? `نرخ طلای 18 عیار: ${gold18kPrice.toLocaleString('fa-IR')} تومان` : 'در حال بارگذاری نرخ طلا...'}
            color={gold18kPrice > 0 ? "warning" : "default"}
            variant="outlined"
            sx={{ fontFamily: 'Vazirmatn' }}
          />
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAdd}
          sx={{ fontFamily: 'Vazirmatn' }}
        >
          افزودن محصول
        </Button>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 4, fontFamily: 'Vazirmatn' }}>
          {error}
        </Alert>
      )}

      {/* Loading */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Products Grid */}
      <Grid container spacing={3}>
        {products.map((product) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
            <Card sx={{ 
              height: '100%',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 4
              }
            }}>
              <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontFamily: 'Vazirmatn', fontWeight: 'bold' }}>
                    {product.name}
                  </Typography>
                  <Chip 
                    label={getCategoryName(product.category_id)} 
                    size="small" 
                    color="primary" 
                    variant="outlined"
                    sx={{ fontFamily: 'Vazirmatn' }}
                  />
                </Box>
                
                {product.description && (
                  <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'Vazirmatn', mb: 2 }}>
                    {product.description}
                  </Typography>
                )}
                
                <Box sx={{ flexGrow: 1, mb: 3 }}>
                  <Typography variant="body2" sx={{ fontFamily: 'Vazirmatn', mb: 1 }}>
                    <strong>وزن:</strong> {product.weight} گرم
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'Vazirmatn', mb: 1 }}>
                    <strong>عیار:</strong> {product.purity}
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'Vazirmatn', mb: 1 }}>
                    <strong>اجرت ساخت:</strong> {product.making_wage}%
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'Vazirmatn', mb: 1 }}>
                    <strong>دستمزد:</strong> {(product.wage || 0).toLocaleString('fa-IR')} تومان
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    fontFamily: 'Vazirmatn',
                    fontWeight: 'bold',
                    color: '#d4af37',
                    fontSize: '1.1rem'
                  }}>
                    <strong>قیمت:</strong> {calculateProductPrice(product.weight, product.purity).toLocaleString('fa-IR')} تومان
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={() => handleEdit(product)}
                    sx={{ fontFamily: 'Vazirmatn', flex: 1 }}
                  >
                    ویرایش
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => handleDelete(product)}
                    sx={{ fontFamily: 'Vazirmatn' }}
                  >
                    حذف
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Empty State */}
      {!loading && products.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary" sx={{ fontFamily: 'Vazirmatn', mb: 2 }}>
            هنوز هیچ محصولی اضافه نشده است
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAdd}
            sx={{ fontFamily: 'Vazirmatn' }}
          >
            اولین محصول را اضافه کنید
          </Button>
        </Box>
      )}

      {/* Add/Edit Dialog */}
      <Dialog 
        open={addDialogOpen || editDialogOpen} 
        onClose={() => { setAddDialogOpen(false); setEditDialogOpen(false); }}
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle sx={{ fontFamily: 'Vazirmatn' }}>
          {addDialogOpen ? 'افزودن محصول جدید' : 'ویرایش محصول'}
        </DialogTitle>
        
        <form onSubmit={handleSubmit}>
          <DialogContent>
            {error && (
              <Alert severity="error" sx={{ mb: 2, fontFamily: 'Vazirmatn' }}>
                {error}
              </Alert>
            )}
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="نام محصول"
                  value={formData.name}
                  onChange={handleChange('name')}
                  required
                  sx={{ '& .MuiInputLabel-root': { fontFamily: 'Vazirmatn' } }}
                  InputProps={{ sx: { fontFamily: 'Vazirmatn' } }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="توضیحات"
                  value={formData.description}
                  onChange={handleChange('description')}
                  multiline
                  rows={2}
                  sx={{ '& .MuiInputLabel-root': { fontFamily: 'Vazirmatn' } }}
                  InputProps={{ sx: { fontFamily: 'Vazirmatn' } }}
                />
              </Grid>
              
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="وزن (گرم)"
                  type="number"
                  value={formData.weight}
                  onChange={handleChange('weight')}
                  required
                  inputProps={{ step: '0.01', min: '0' }}
                  sx={{ '& .MuiInputLabel-root': { fontFamily: 'Vazirmatn' } }}
                  InputProps={{ sx: { fontFamily: 'Vazirmatn' } }}
                />
              </Grid>
              
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="عیار"
                  type="number"
                  value={formData.purity}
                  onChange={handleChange('purity')}
                  required
                  inputProps={{ min: '0', max: '999' }}
                  sx={{ '& .MuiInputLabel-root': { fontFamily: 'Vazirmatn' } }}
                  InputProps={{ sx: { fontFamily: 'Vazirmatn' } }}
                />
              </Grid>
              
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="اجرت ساخت (%)"
                  type="number"
                  value={formData.making_wage}
                  onChange={handleChange('making_wage')}
                  required
                  inputProps={{ step: '0.1', min: '0' }}
                  sx={{ '& .MuiInputLabel-root': { fontFamily: 'Vazirmatn' } }}
                  InputProps={{ sx: { fontFamily: 'Vazirmatn' } }}
                />
              </Grid>
              
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="دستمزد (تومان)"
                  type="number"
                  value={formData.wage}
                  onChange={handleChange('wage')}
                  required
                  inputProps={{ step: '1000', min: '0' }}
                  sx={{ '& .MuiInputLabel-root': { fontFamily: 'Vazirmatn' } }}
                  InputProps={{ sx: { fontFamily: 'Vazirmatn' } }}
                />
              </Grid>
              
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  select
                  label="دسته‌بندی"
                  value={formData.category_id}
                  onChange={handleChange('category_id')}
                  required
                  sx={{ '& .MuiInputLabel-root': { fontFamily: 'Vazirmatn' } }}
                  SelectProps={{ sx: { fontFamily: 'Vazirmatn' } }}
                >
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id} sx={{ fontFamily: 'Vazirmatn' }}>
                      {category.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
          </DialogContent>
          
          <DialogActions>
            <Button 
              onClick={() => { setAddDialogOpen(false); setEditDialogOpen(false); }}
              disabled={submitLoading}
              sx={{ fontFamily: 'Vazirmatn' }}
            >
              انصراف
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              disabled={submitLoading}
              sx={{ fontFamily: 'Vazirmatn' }}
            >
              {submitLoading ? <CircularProgress size={24} /> : (addDialogOpen ? 'افزودن' : 'ذخیره')}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle sx={{ fontFamily: 'Vazirmatn' }}>تأیید حذف</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontFamily: 'Vazirmatn' }}>
            آیا از حذف محصول "{selectedProduct?.name}" اطمینان دارید؟
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteDialogOpen(false)}
            disabled={submitLoading}
            sx={{ fontFamily: 'Vazirmatn' }}
          >
            انصراف
          </Button>
          <Button 
            onClick={confirmDelete} 
            color="error" 
            variant="contained"
            disabled={submitLoading}
            sx={{ fontFamily: 'Vazirmatn' }}
          >
            {submitLoading ? <CircularProgress size={24} /> : 'حذف'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={handleAdd}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
};

export default ProductsSimple;