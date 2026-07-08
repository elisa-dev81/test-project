import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Avatar,
  Divider,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Snackbar,
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  Delete,
  Category,
  Inventory,
  Visibility,
  Add,
  Warning,
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { deleteCategory } from '../../store/slices/categorySlice';
import { selectGold18kPrice } from '../../store/slices/priceSlice';
import transactionService from '../../services/transactionService';

const CategoryDetail = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  
  const { categories, loading } = useSelector((state) => state.categories);
  const { products } = useSelector((state) => state.products);
  const gold18kPrice = useSelector(selectGold18kPrice);

  const [category, setCategory] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [productPurchasePrices, setProductPurchasePrices] = useState({});
  const [pricesLoading, setPricesLoading] = useState(false);

  useEffect(() => {
    if (categories.length > 0 && id) {
      const foundCategory = categories.find(c => c.id === parseInt(id));
      if (foundCategory) {
        setCategory(foundCategory);
        // بارگذاری قیمت‌های خرید محصولات این دسته‌بندی
        loadPurchasePricesForCategory(foundCategory.id);
      }
    }
  }, [categories, id]);

  const getCategoryProducts = (categoryId) => {
    return products.filter(product => product.category_id === categoryId);
  };

  // دریافت قیمت‌های خرید برای محصولات این دسته‌بندی
  const loadPurchasePricesForCategory = async (categoryId) => {
    setPricesLoading(true);
    try {
      const categoryProducts = products.filter(product => product.category_id === categoryId);
      
      if (categoryProducts.length === 0) {
        setPricesLoading(false);
        return;
      }

      // دریافت فاکتورهای خرید
      const purchaseResponse = await transactionService.getPurchases();
      const purchases = purchaseResponse?.data?.data || [];
      
      console.log('Debug CategoryDetail - Category ID:', categoryId);
      console.log('Debug CategoryDetail - Purchases:', purchases.length);
      console.log('Debug CategoryDetail - Category products:', categoryProducts.length);

      const pricesMap = {};

      // برای هر محصول در این دسته‌بندی، آخرین قیمت خرید را پیدا کن
      categoryProducts.forEach(product => {
        let latestPurchasePrice = 0;
        let latestPurchaseDate = new Date(0);

        purchases.forEach(transaction => {
          if (transaction.items) {
            transaction.items.forEach(item => {
              if (item.product_id === product.id || item.product_id === parseInt(product.id)) {
                const transactionDate = new Date(transaction.transaction_date);
                if (transactionDate > latestPurchaseDate) {
                  latestPurchaseDate = transactionDate;
                  latestPurchasePrice = parseFloat(item.unit_price || 0);
                }
              }
            });
          }
        });

        pricesMap[product.id] = latestPurchasePrice;
      });

      setProductPurchasePrices(pricesMap);
    } catch (error) {
      console.error('Error loading purchase prices for category:', error);
    } finally {
      setPricesLoading(false);
    }
  };

  // محاسبه قیمت محصول بر اساس وزن و عیار (مانند کامپوننت محصولات)
  const calculateProductPrice = (weight, purity) => {
    if (!gold18kPrice || gold18kPrice === 0) return 0;
    
    const numericWeight = parseFloat(weight) || 0;
    const numericPurity = parseInt(purity) || 18;
    
    if (numericPurity >= 900) {
      // محاسبه نقره (عیار 925، 950 و غیره)
      const purityFactor = numericPurity / 1000;
      return numericWeight * gold18kPrice * 0.015 * purityFactor;
    } else {
      // تشخیص نوع عیار
      let adjustedPurity;
      if (numericPurity >= 100) {
        // عیار هزارگان (مثل 750, 585, 916, 999)
        adjustedPurity = (numericPurity / 1000) * 24;
      } else {
        // عیار 24گانه (مثل 18, 21, 22, 24)
        adjustedPurity = numericPurity;
      }
      
      // استفاده از قیمت 18 عیار
      if (adjustedPurity === 18) {
        return numericWeight * gold18kPrice;
      } else {
        // محاسبه بر اساس نسبت عیار
        const pricePerGram = gold18kPrice * (adjustedPurity / 18);
        return numericWeight * pricePerGram;
      }
    }
  };



  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await dispatch(deleteCategory(category.id)).unwrap();
      setSuccessMessage(`دسته‌بندی "${category.name}" با موفقیت حذف شد`);
      setTimeout(() => {
        navigate('/categories');
      }, 1500);
    } catch (error) {
      console.error('Error deleting category:', error);
      setErrorMessage(`خطا در حذف دسته‌بندی: ${error.message || 'خطای نامشخص'}`);
    } finally {
      setDeleteLoading(false);
      setDeleteDialogOpen(false);
    }
  };

  const handleEdit = () => {
    try {
      navigate(`/categories/${category.id}/edit`);
    } catch (error) {
      console.error('Error navigating to edit page:', error);
      setErrorMessage('خطا در باز کردن صفحه ویرایش');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!category) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 3 }}>
          دسته‌بندی مورد نظر یافت نشد
        </Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/categories')}
        >
          بازگشت به دسته‌بندی‌ها
        </Button>
      </Box>
    );
  }

  const categoryProducts = getCategoryProducts(category.id);

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/categories')}
            sx={{ mr: 2 }}
          >
            بازگشت
          </Button>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', fontFamily: 'Vazirmatn' }}>
            جزئیات دسته‌بندی
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="ویرایش دسته‌بندی">
            <IconButton
              onClick={handleEdit}
              sx={{ color: 'warning.main' }}
            >
              <Edit />
            </IconButton>
          </Tooltip>
          <Tooltip title="حذف دسته‌بندی">
            <IconButton
              onClick={() => setDeleteDialogOpen(true)}
              sx={{ color: 'error.main' }}
              disabled={categoryProducts.length > 0}
            >
              <Delete />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Category Information */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  mx: 'auto',
                  mb: 2,
                  backgroundColor: category.color || '#d4af37',
                  color: '#fff',
                  fontSize: '3rem',
                }}
              >
                {category.name.charAt(0)}
              </Avatar>
              
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                {category.name}
              </Typography>
              
              <Typography variant="body1" color="textSecondary" sx={{ mb: 2 }}>
                {category.description}
              </Typography>

              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 2 }}>
                <Chip
                  label={`${categoryProducts.length} محصول`}
                  color="primary"
                />
              </Box>

              <Typography variant="h6" sx={{ color: '#d4af37', fontWeight: 'bold' }}>
                {categoryProducts.length} محصول
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Category Details */}
        <Grid item xs={12} md={8}>
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ color: '#d4af37', display: 'flex', alignItems: 'center' }}>
                    <Category sx={{ mr: 1 }} />
                    اطلاعات پایه
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="textSecondary">نام دسته‌بندی:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        {category.name}
                      </Typography>
                    </Grid>



                    <Grid item xs={12}>
                      <Typography variant="body2" color="textSecondary">توضیحات:</Typography>
                      <Typography variant="body1">
                        {category.description || 'توضیحی برای این دسته‌بندی ثبت نشده است.'}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Products List */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ color: '#d4af37', display: 'flex', alignItems: 'center' }}>
                      <Inventory sx={{ mr: 1 }} />
                      محصولات این دسته‌بندی
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  
                  {categoryProducts.length > 0 ? (
                    <Grid container spacing={2}>
                      {categoryProducts.map((product) => {
                        const calculatedPrice = calculateProductPrice(product.weight, product.purity);
                        
                        return (
                          <Grid item xs={12} sm={6} md={4} key={product.id}>
                            <Card sx={{ 
                              height: '100%', 
                              cursor: 'pointer',
                              transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                              '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: (theme) => theme.shadows[4]
                              }
                            }}
                            onClick={() => navigate(`/products/${product.id}`)}
                            >
                              <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                  <Avatar
                                    sx={{
                                      width: 50,
                                      height: 50,
                                      mr: 1.5,
                                      backgroundColor: '#d4af37',
                                      color: '#fff',
                                      fontWeight: 'bold'
                                    }}
                                  >
                                    {product.name.charAt(0)}
                                  </Avatar>
                                  <Box sx={{ flexGrow: 1 }}>
                                    <Typography variant="body1" sx={{ fontWeight: 'bold', fontFamily: 'Vazirmatn' }}>
                                      {product.name}
                                    </Typography>
                                    <Typography variant="caption" color="textSecondary" sx={{ fontFamily: 'Vazirmatn' }}>
                                      شناسه: {product.id}
                                    </Typography>
                                  </Box>
                                </Box>

                                <Box sx={{ mb: 1 }}>
                                  <Typography variant="body2" color="textSecondary" sx={{ fontFamily: 'Vazirmatn' }}>
                                    وزن: {product.weight} گرم | عیار: {product.purity}
                                  </Typography>
                                </Box>

                                <Box sx={{ mb: 2 }}>
                                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#d4af37', fontFamily: 'Vazirmatn' }}>
                                    قیمت محاسبه شده: {calculatedPrice.toLocaleString('fa-IR')} تومان
                                  </Typography>
                                  <Typography variant="caption" color="textSecondary" sx={{ fontFamily: 'Vazirmatn' }}>
                                    محاسبه شده از قیمت طلا
                                  </Typography>
                                  
                                  {pricesLoading ? (
                                    <Typography variant="caption" color="textSecondary" sx={{ fontFamily: 'Vazirmatn', display: 'block', mt: 1 }}>
                                      در حال بارگذاری قیمت خرید...
                                    </Typography>
                                  ) : productPurchasePrices[product.id] > 0 ? (
                                    <>
                                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#e74c3c', fontFamily: 'Vazirmatn', mt: 1 }}>
                                        قیمت خرید: {productPurchasePrices[product.id].toLocaleString('fa-IR')} تومان
                                      </Typography>
                                      <Typography variant="caption" color="textSecondary" sx={{ fontFamily: 'Vazirmatn' }}>
                                        از آخرین فاکتور خرید
                                      </Typography>
                                    </>
                                  ) : (
                                    <Typography variant="caption" color="textSecondary" sx={{ fontFamily: 'Vazirmatn', display: 'block', mt: 1 }}>
                                      قیمت خرید: فاکتور خریدی ثبت نشده
                                    </Typography>
                                  )}
                                </Box>

                                <Button
                                  size="small"
                                  startIcon={<Visibility />}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/products/${product.id}`);
                                  }}
                                  fullWidth
                                  variant="outlined"
                                  sx={{ fontFamily: 'Vazirmatn' }}
                                >
                                  مشاهده جزئیات
                                </Button>
                              </CardContent>
                            </Card>
                          </Grid>
                        );
                      })}
                    </Grid>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="h6" color="textSecondary" sx={{ mb: 2 }}>
                        محصولی در این دسته‌بندی وجود ندارد
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* Delete Confirmation Dialog */}
      {deleteDialogOpen && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <Card sx={{ maxWidth: 450, mx: 2, width: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar
                  sx={{
                    bgcolor: 'error.main',
                    mr: 2,
                    width: 40,
                    height: 40
                  }}
                >
                  <Delete />
                </Avatar>
                <Typography variant="h6" sx={{ fontFamily: 'Vazirmatn, sans-serif', fontWeight: 'bold' }}>
                  تأیید حذف دسته‌بندی
                </Typography>
              </Box>
              
              <Typography sx={{ mb: 3, fontFamily: 'Vazirmatn, sans-serif' }}>
                آیا از حذف دسته‌بندی <strong>"{category.name}"</strong> اطمینان دارید؟
              </Typography>
              
              <Typography variant="body2" color="textSecondary" sx={{ mb: 3, fontFamily: 'Vazirmatn, sans-serif' }}>
                این عملیات غیرقابل بازگشت است و تمام اطلاعات مربوط به این دسته‌بندی حذف خواهد شد.
              </Typography>
              
              {categoryProducts.length > 0 && (
                <Alert 
                  severity="warning" 
                  sx={{ mb: 3, fontFamily: 'Vazirmatn, sans-serif' }}
                  icon={<Warning />}
                >
                  <Typography variant="body2" sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>
                    این دسته‌بندی دارای <strong>{categoryProducts.length} محصول</strong> است و قابل حذف نیست.
                    ابتدا تمام محصولات این دسته‌بندی را حذف کنید.
                  </Typography>
                </Alert>
              )}
              
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
                <Button
                  onClick={() => setDeleteDialogOpen(false)}
                  disabled={deleteLoading}
                  variant="outlined"
                  sx={{ fontFamily: 'Vazirmatn, sans-serif' }}
                >
                  انصراف
                </Button>
                <Button
                  onClick={handleDelete}
                  color="error"
                  variant="contained"
                  disabled={categoryProducts.length > 0 || deleteLoading}
                  startIcon={deleteLoading ? <CircularProgress size={20} /> : <Delete />}
                  sx={{ fontFamily: 'Vazirmatn, sans-serif' }}
                >
                  {deleteLoading ? 'در حال حذف...' : 'حذف دسته‌بندی'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Success Message */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={4000}
        onClose={() => setSuccessMessage('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSuccessMessage('')} 
          severity="success" 
          sx={{ width: '100%', fontFamily: 'Vazirmatn, sans-serif' }}
        >
          {successMessage}
        </Alert>
      </Snackbar>

      {/* Error Message */}
      <Snackbar
        open={!!errorMessage}
        autoHideDuration={6000}
        onClose={() => setErrorMessage('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setErrorMessage('')} 
          severity="error" 
          sx={{ width: '100%', fontFamily: 'Vazirmatn, sans-serif' }}
        >
          {errorMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CategoryDetail; 