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
  Inventory,
  Scale,
  Diamond,
  Visibility,
  Error,
  Warning,
  CheckCircle,
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { deleteProduct } from '../../store/slices/productSlice';
import { selectGold18kPrice } from '../../store/slices/priceSlice';


const ProductDetail = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  
  const { products, loading } = useSelector((state) => state.products);
  const { categories } = useSelector((state) => state.categories);

  const gold18kPrice = useSelector(selectGold18kPrice);

  const [product, setProduct] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');


  useEffect(() => {
    if (products.length > 0 && id) {
      const foundProduct = products.find(p => p.id === parseInt(id));
      if (foundProduct) {
        setProduct(foundProduct);
      }
    }
  }, [products, id]);



  // محاسبه قیمت محصول بر اساس وزن و عیار
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

  // محاسبه قیمت تمام شده = قیمت محصول + اجرت + دستمزد
  const calculateCostPrice = (product) => {
    if (!product) return 0;
    
    const basePrice = calculateProductPrice(product.weight, product.purity);
    const makingWageAmount = basePrice * (parseFloat(product.making_wage || 0) / 100);
    const wage = parseFloat(product.wage || 0);
    
    return basePrice + makingWageAmount + wage;
  };



  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'نامشخص';
  };

  const getStockStatus = (quantity, minQuantity = 5) => {
    if (quantity === 0) return { status: 'out', color: 'error', text: 'ناموجود', icon: <Error /> };
    if (quantity <= minQuantity) return { status: 'low', color: 'warning', text: 'کم موجودی', icon: <Warning /> };
    return { status: 'ok', color: 'success', text: 'موجود', icon: <CheckCircle /> };
  };





  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await dispatch(deleteProduct(product.id)).unwrap();
      setSuccessMessage(`محصول "${product.name}" با موفقیت حذف شد`);
      setTimeout(() => {
        navigate('/products');
      }, 1500);
    } catch (error) {
      console.error('Error deleting product:', error);
    } finally {
      setDeleteLoading(false);
      setDeleteDialogOpen(false);
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/products')}
            sx={{ mr: 2 }}
          >
            بازگشت
          </Button>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', fontFamily: 'Vazirmatn' }}>
            جزئیات محصول
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="ویرایش محصول">
            <IconButton
              onClick={() => navigate(`/products/${product.id}/edit`)}
              sx={{ color: 'warning.main' }}
            >
              <Edit />
            </IconButton>
          </Tooltip>
          <Tooltip title="حذف محصول">
            <IconButton
              onClick={() => setDeleteDialogOpen(true)}
              sx={{ color: 'error.main' }}
            >
              <Delete />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Product Image and Basic Info */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar
                sx={{
                  width: 200,
                  height: 200,
                  mx: 'auto',
                  mb: 2,
                  backgroundColor: '#f5f5f5',
                  color: '#666',
                  fontSize: '3rem',
                }}
                src={product.images?.[0]}
              >
                {product.name.charAt(0)}
              </Avatar>
              
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', fontFamily: 'Vazirmatn' }}>
                {product.name}
              </Typography>
              
              <Typography variant="body1" color="textSecondary" sx={{ mb: 2, fontFamily: 'Vazirmatn' }}>
                {product.description}
              </Typography>



              <Typography variant="h4" sx={{ color: '#d4af37', fontWeight: 'bold', fontFamily: 'Vazirmatn' }}>
                {product.sellingPrice?.toLocaleString('fa-IR')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Product Details */}
        <Grid item xs={12} md={8}>
          <Grid container spacing={3}>


            {/* Specifications */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ color: '#d4af37', display: 'flex', alignItems: 'center', fontFamily: 'Vazirmatn' }}>
                    <Scale sx={{ mr: 1 }} />
                    مشخصات فنی
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="textSecondary" sx={{ fontFamily: 'Vazirmatn' }}>وزن:</Typography>
                      <Typography variant="body2" sx={{ fontFamily: 'Vazirmatn' }}>{product.weight} گرم</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="textSecondary" sx={{ fontFamily: 'Vazirmatn' }}>عیار:</Typography>
                      <Typography variant="body2" sx={{ fontFamily: 'Vazirmatn' }}>{product.purity} عیار</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="textSecondary" sx={{ fontFamily: 'Vazirmatn' }}>اجرت ساخت:</Typography>
                      <Typography variant="body2" sx={{ fontFamily: 'Vazirmatn' }}>{product.making_wage}%</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="textSecondary" sx={{ fontFamily: 'Vazirmatn' }}>دستمزد:</Typography>
                      <Typography variant="body2" sx={{ fontFamily: 'Vazirmatn' }}>{(product.wage || 0).toLocaleString('fa-IR')} تومان</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Pricing Information */}


            {/* Inventory Information */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ color: '#d4af37', display: 'flex', alignItems: 'center', fontFamily: 'Vazirmatn' }}>
                    <Inventory sx={{ mr: 1 }} />
                    اطلاعات موجودی
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="textSecondary" sx={{ fontFamily: 'Vazirmatn' }}>قیمت خالص:</Typography>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', fontFamily: 'Vazirmatn' }}>
                          {calculateProductPrice(product.weight, product.purity).toLocaleString('fa-IR')} تومان
                        </Typography>
                        <Typography variant="caption" color="textSecondary" sx={{ fontFamily: 'Vazirmatn' }}>
                          بدون اجرت و دستمزد
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="textSecondary" sx={{ fontFamily: 'Vazirmatn' }}>قیمت تمام شده:</Typography>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#d4af37', fontFamily: 'Vazirmatn' }}>
                          {calculateCostPrice(product).toLocaleString('fa-IR')} تومان
                        </Typography>
                        <Typography variant="caption" color="textSecondary" sx={{ fontFamily: 'Vazirmatn' }}>
                          قیمت خالص + اجرت + دستمزد
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="textSecondary" sx={{ fontFamily: 'Vazirmatn' }}>وضعیت:</Typography>
                      <Chip
                        label={(() => {
                          // پیدا کردن تعداد محصولات در همین دسته‌بندی
                          const categoryProductsCount = products.filter(p => p.category_id === product.category_id).length;
                          const stockStatus = getStockStatus(categoryProductsCount, 2);
                          return stockStatus.text;
                        })()}
                        color={(() => {
                          const categoryProductsCount = products.filter(p => p.category_id === product.category_id).length;
                          const stockStatus = getStockStatus(categoryProductsCount, 2);
                          return stockStatus.color;
                        })()}
                        size="small"
                        icon={(() => {
                          const categoryProductsCount = products.filter(p => p.category_id === product.category_id).length;
                          const stockStatus = getStockStatus(categoryProductsCount, 2);
                          return stockStatus.icon;
                        })()}
                        sx={{ fontFamily: 'Vazirmatn' }}
                      />
                    </Box>

                  </Box>
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
          <Card sx={{ maxWidth: 400, mx: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                تأیید حذف
              </Typography>
              <Typography sx={{ mb: 3 }}>
                آیا از حذف محصول "{product.name}" اطمینان دارید؟ این عملیات غیرقابل بازگشت است.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  onClick={() => setDeleteDialogOpen(false)}
                  disabled={deleteLoading}
                >
                  انصراف
                </Button>
                <Button
                  onClick={handleDelete}
                  color="error"
                  variant="contained"
                  disabled={deleteLoading}
                  startIcon={deleteLoading ? <CircularProgress size={20} /> : <Delete />}
                >
                  {deleteLoading ? 'در حال حذف...' : 'حذف'}
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
        message={successMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
};

export default ProductDetail; 