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
  AttachMoney,
  Category,
  Business,
  Scale,
  Diamond,
  Visibility,
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { deleteProduct } from '../../store/slices/productSlice';

const ProductDetail = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  
  const { products, loading } = useSelector((state) => state.products);
  const { categories } = useSelector((state) => state.categories);
  const { inventory } = useSelector((state) => state.inventory);

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

  const getInventoryInfo = (productId) => {
    const inventoryItem = inventory.find(item => item.productId === productId);
    return inventoryItem || { quantity: 0, totalValue: 0 };
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'نامشخص';
  };

  const getProductTypeColor = (type) => {
    switch (type) {
      case 'gold': return 'warning';
      case 'silver': return 'info';
      case 'coin': return 'success';
      default: return 'default';
    }
  };

  const getStockStatus = (quantity) => {
    if (quantity === 0) return { status: 'out', color: 'error', text: 'ناموجود' };
    if (quantity <= 5) return { status: 'low', color: 'warning', text: 'کم موجودی' };
    return { status: 'ok', color: 'success', text: 'موجود' };
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

  const inventoryInfo = getInventoryInfo(product.id);
  const stockStatus = getStockStatus(inventoryInfo.quantity);

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
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
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
              
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                {product.name}
              </Typography>
              
              <Typography variant="body1" color="textSecondary" sx={{ mb: 2 }}>
                {product.description}
              </Typography>

              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 2 }}>
                <Chip
                  label={product.type === 'gold' ? 'طلا' : product.type === 'silver' ? 'نقره' : 'سکه'}
                  color={getProductTypeColor(product.type)}
                />
                <Chip
                  label={stockStatus.text}
                  color={stockStatus.color}
                />
              </Box>

              <Typography variant="h4" sx={{ color: '#d4af37', fontWeight: 'bold' }}>
                {product.sellingPrice?.toLocaleString('fa-IR')} تومان
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Product Details */}
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
                      <Typography variant="body2" color="textSecondary">کد محصول:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        {product.sku}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="textSecondary">بارکد:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        {product.barcode}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="textSecondary">دسته‌بندی:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        {getCategoryName(product.categoryId)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="textSecondary">زیر نوع:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        {product.subType === 'ring' ? 'حلقه' : 
                         product.subType === 'necklace' ? 'گردنبند' : 
                         product.subType === 'bracelet' ? 'دستبند' : 
                         product.subType === 'earring' ? 'گوشواره' : 
                         product.subType === 'chain' ? 'زنجیر' : 
                         product.subType === 'gold_coin' ? 'سکه طلا' : 
                         product.subType === 'silver_coin' ? 'سکه نقره' : 
                         product.subType === 'collector_coin' ? 'سکه کلکسیونی' : product.subType}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Specifications */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ color: '#d4af37', display: 'flex', alignItems: 'center' }}>
                    <Scale sx={{ mr: 1 }} />
                    مشخصات فنی
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="textSecondary">وزن:</Typography>
                      <Typography variant="body2">{product.weight} گرم</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="textSecondary">عیار:</Typography>
                      <Typography variant="body2">{product.purity} عیار</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="textSecondary">سایز:</Typography>
                      <Typography variant="body2">{product.size}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="textSecondary">رنگ:</Typography>
                      <Typography variant="body2">{product.color}</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Pricing Information */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ color: '#d4af37', display: 'flex', alignItems: 'center' }}>
                    <AttachMoney sx={{ mr: 1 }} />
                    اطلاعات قیمت
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="textSecondary">قیمت خرید:</Typography>
                      <Typography variant="body2">{product.purchasePrice?.toLocaleString('fa-IR')} تومان</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="textSecondary">قیمت فروش:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#d4af37' }}>
                        {product.sellingPrice?.toLocaleString('fa-IR')} تومان
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="textSecondary">قیمت تمام شده:</Typography>
                      <Typography variant="body2">{product.costPrice?.toLocaleString('fa-IR')} تومان</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="textSecondary">دستمزد:</Typography>
                      <Typography variant="body2">{product.workmanship?.toLocaleString('fa-IR')} تومان</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Inventory Information */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ color: '#d4af37', display: 'flex', alignItems: 'center' }}>
                    <Inventory sx={{ mr: 1 }} />
                    اطلاعات موجودی
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="textSecondary">موجودی فعلی:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {inventoryInfo.quantity} عدد
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="textSecondary">ارزش کل موجودی:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {inventoryInfo.totalValue?.toLocaleString('fa-IR')} تومان
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="textSecondary">حداقل موجودی:</Typography>
                      <Typography variant="body2">{product.minStockLevel} عدد</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="textSecondary">وضعیت:</Typography>
                      <Chip
                        label={stockStatus.text}
                        color={stockStatus.color}
                        size="small"
                      />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Additional Information */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                                     <Typography variant="h6" gutterBottom sx={{ color: '#d4af37', display: 'flex', alignItems: 'center' }}>
                     <Business sx={{ mr: 1 }} />
                     اطلاعات تکمیلی
                   </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="textSecondary">برند:</Typography>
                      <Typography variant="body2">{product.brand}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="textSecondary">مدل:</Typography>
                      <Typography variant="body2">{product.model}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="textSecondary">وضعیت:</Typography>
                      <Chip
                        label={product.isActive ? 'فعال' : 'غیرفعال'}
                        color={product.isActive ? 'success' : 'default'}
                        size="small"
                      />
                    </Box>
                    {product.specifications && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="textSecondary">سنگ:</Typography>
                        <Typography variant="body2">{product.specifications.stone}</Typography>
                      </Box>
                    )}
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