import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Visibility as ViewIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { productService } from '../../services/productService';
import { fetchCategories } from '../../store/slices/categorySlice';
import { fetchProducts, deleteProduct, selectTotalProductsValue } from '../../store/slices/productSlice';
import { selectGold18kPrice, setPricesSuccess } from '../../store/slices/priceSlice';

const Products = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // استفاده از Redux store برای دسته‌بندی‌ها و محصولات
  const { categories } = useSelector(state => state.categories);
  const { products, loading, error } = useSelector(state => state.products);
  
  // دریافت قیمت طلای 18 عیار از Redux store (از PriceBoard)
  const gold18kPrice = useSelector(selectGold18kPrice);
  
  // دریافت ارزش کل محصولات از Redux selector
  const totalProductsValue = useSelector(selectTotalProductsValue);
  
  const [deleteDialog, setDeleteDialog] = useState({ open: false, productId: null, productName: '' });

  // تابع دریافت مستقیم قیمت طلای 18 عیار از Alan Chand API (از طریق proxy)
  const fetchGold18kPrice = async () => {
    try {
      console.log('🔄 Fetching gold price from Alan Chand API...');
      const response = await fetch('http://localhost:5001/api/proxy/alan-chand');
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch price');
      }
      
      const data = result.data;
      
      // استخراج قیمت طلای 18 عیار
      const gold18kPrice = data['18ayar']?.price || 0;
      console.log('💰 Gold 18k price received:', gold18kPrice);
      
      if (gold18kPrice > 0) {
        // ذخیره در Redux store
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
      console.error('❌ Error fetching Alan Chand gold price:', error);
      // در صورت خطا، از قیمت پیش‌فرض استفاده کن
      const fallbackPrice = 7514000; // آخرین قیمت دریافت شده
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
      console.log('🔄 Using fallback price:', fallbackPrice);
    }
  };

  // دریافت محصولات و دسته‌بندی‌ها در هنگام لود صفحه
  useEffect(() => {
    console.log('🔄 useEffect triggered, gold18kPrice:', gold18kPrice);
    
    // دریافت دسته‌بندی‌ها و محصولات از Redux store
    if (categories.length === 0) {
      console.log('📂 Fetching categories...');
      dispatch(fetchCategories());
    }
    if (products.length === 0) {
      console.log('📦 Fetching products...');
      dispatch(fetchProducts());
    }
    
    // دریافت قیمت طلا اگر هنوز دریافت نشده باشد
    if (gold18kPrice === 0) {
      console.log('💰 Gold price is 0, fetching...');
      fetchGold18kPrice();
    } else {
      console.log('✅ Gold price already available:', gold18kPrice);
    }
  }, [dispatch, categories.length, products.length, gold18kPrice]);

  // محاسبه قیمت محصول بر اساس وزن و عیار (بدون اجرت ساخت)
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
    // قیمت بدون اجرت ساخت برگردانده می‌شود
  };



  // دریافت نام دسته‌بندی
  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'نامشخص';
  };

  // باز کردن دیالوگ حذف
  const openDeleteDialog = (productId, productName) => {
    setDeleteDialog({ open: true, productId, productName });
  };

  // بستن دیالوگ حذف
  const closeDeleteDialog = () => {
    setDeleteDialog({ open: false, productId: null, productName: '' });
  };

  // حذف محصول
  const handleDelete = async () => {
    try {
      await dispatch(deleteProduct(deleteDialog.productId));
      closeDeleteDialog();
    } catch (err) {
      closeDeleteDialog();
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontFamily: 'Vazirmatn', mb: 1 }}>
            محصولات
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip 
              label={gold18kPrice > 0 ? 
                `نرخ طلای 18 عیار: ${gold18kPrice.toLocaleString('fa-IR')} تومان` : 
                'در حال بارگذاری نرخ طلا...'
              }
              color={gold18kPrice > 0 ? "warning" : "default"}
              variant="outlined"
              sx={{ fontFamily: 'Vazirmatn' }}
            />
            <Chip 
              label={`ارزش کل موجودی: ${totalProductsValue.toLocaleString('fa-IR')} تومان`}
              color="primary"
              variant="filled"
              sx={{ 
                fontFamily: 'Vazirmatn',
                fontWeight: 'bold',
                backgroundColor: '#d4af37',
                color: 'white',
                '&:hover': {
                  backgroundColor: '#b8941f',
                }
              }}
            />
            <IconButton 
              size="small" 
              onClick={() => {
                console.log('🔄 Manual refresh clicked');
                fetchGold18kPrice();
              }}
              sx={{ color: 'warning.main' }}
              title="به‌روزرسانی قیمت طلا"
            >
              <RefreshIcon />
            </IconButton>
          </Box>
          {/* Debug info */}
          {process.env.NODE_ENV === 'development' && (
            <Typography variant="caption" sx={{ 
              fontFamily: 'Vazirmatn', 
              color: 'text.secondary',
              display: 'block',
              mt: 1
            }}>
              Debug: gold18kPrice = {gold18kPrice}
            </Typography>
          )}
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          sx={{ fontFamily: 'Vazirmatn' }}
          onClick={() => navigate('/products/add')}
        >
          افزودن محصول
        </Button>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      {/* Products Grid */}
      <Grid container spacing={3}>
        {products.length === 0 && !loading ? (
          <Grid item xs={12}>
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" color="text.secondary" sx={{ fontFamily: 'Vazirmatn' }}>
                هنوز هیچ محصولی اضافه نشده است
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                sx={{ mt: 2, fontFamily: 'Vazirmatn' }}
                onClick={() => navigate('/products/add')}
              >
                اولین محصول را اضافه کنید
              </Button>
            </Box>
          </Grid>
        ) : (
          products.map(product => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
              <Card sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: (theme) => theme.shadows[8]
                }
              }}>
                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
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
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontFamily: 'Vazirmatn' }}>
                      {product.description}
                    </Typography>
                  )}
                  
                  <Box sx={{ flexGrow: 1, mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'Vazirmatn' }}>
                        وزن:
                      </Typography>
                      <Typography variant="body2" sx={{ fontFamily: 'Vazirmatn', fontWeight: 'medium' }}>
                        {product.weight} گرم
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'Vazirmatn' }}>
                        عیار:
                      </Typography>
                      <Typography variant="body2" sx={{ fontFamily: 'Vazirmatn', fontWeight: 'medium' }}>
                        {product.purity}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'Vazirmatn' }}>
                        اجرت ساخت:
                      </Typography>
                      <Typography variant="body2" sx={{ fontFamily: 'Vazirmatn', fontWeight: 'medium' }}>
                        {product.making_wage}%
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'Vazirmatn' }}>
                        دستمزد:
                      </Typography>
                      <Typography variant="body2" sx={{ fontFamily: 'Vazirmatn', fontWeight: 'medium' }}>
                        {(product.wage || 0).toLocaleString('fa-IR')} تومان
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'Vazirmatn' }}>
                        قیمت:
                      </Typography>
                      <Typography variant="body2" sx={{ 
                        fontFamily: 'Vazirmatn', 
                        fontWeight: 'bold',
                        color: '#d4af37',
                        fontSize: '1.1rem'
                      }}>
                        {calculateProductPrice(product.weight, product.purity).toLocaleString('fa-IR')} تومان
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<ViewIcon />}
                      onClick={() => navigate(`/products/${product.id}`)}
                      sx={{ fontFamily: 'Vazirmatn', flex: 1 }}
                    >
                      مشاهده
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<EditIcon />}
                      onClick={() => navigate(`/products/${product.id}/edit`)}
                      sx={{ fontFamily: 'Vazirmatn', flex: 1 }}
                    >
                      ویرایش
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={() => openDeleteDialog(product.id, product.name)}
                      sx={{ fontFamily: 'Vazirmatn' }}
                    >
                      حذف
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={closeDeleteDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title" sx={{ fontFamily: 'Vazirmatn' }}>
          تأیید حذف محصول
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description" sx={{ fontFamily: 'Vazirmatn' }}>
            آیا مطمئن هستید که می‌خواهید محصول "{deleteDialog.productName}" را حذف کنید؟
            این عمل قابل بازگشت نیست.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog} sx={{ fontFamily: 'Vazirmatn' }}>
            انصراف
          </Button>
          <Button onClick={handleDelete} color="error" autoFocus sx={{ fontFamily: 'Vazirmatn' }}>
            حذف
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Products;