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
  LinearProgress,
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  Delete,
  Inventory as InventoryIcon,
  AttachMoney,
  Warning,
  CheckCircle,
  Error,
  TrendingUp,
  TrendingDown,
  LocationOn,
  Schedule,
  Visibility,
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { deleteInventoryItem } from '../../store/slices/inventorySlice';

const InventoryDetail = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { productId } = useParams();
  
  const { inventory, loading } = useSelector((state) => state.inventory);
  const { products } = useSelector((state) => state.products);
  const { categories } = useSelector((state) => state.categories);

  const [inventoryItem, setInventoryItem] = useState(null);
  const [product, setProduct] = useState(null);
  const [category, setCategory] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (inventory.length > 0 && products.length > 0 && productId) {
      const foundItem = inventory.find(item => item.productId === parseInt(productId));
      if (foundItem) {
        setInventoryItem(foundItem);
        
        const foundProduct = products.find(p => p.id === foundItem.productId);
        if (foundProduct) {
          setProduct(foundProduct);
          
          const foundCategory = categories.find(c => c.id === foundProduct.category);
          if (foundCategory) {
            setCategory(foundCategory);
          }
        }
      }
    }
  }, [inventory, products, categories, productId]);

  const getStockStatus = (quantity, minQuantity = 5) => {
    if (quantity === 0) return { status: 'out', color: 'error', text: 'ناموجود', icon: <Error /> };
    if (quantity <= minQuantity) return { status: 'low', color: 'warning', text: 'کم موجودی', icon: <Warning /> };
    return { status: 'ok', color: 'success', text: 'موجود', icon: <CheckCircle /> };
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

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await dispatch(deleteInventoryItem(inventoryItem.productId)).unwrap();
      setSuccessMessage(`موجودی "${product?.name}" با موفقیت حذف شد`);
      setTimeout(() => {
        navigate('/inventory');
      }, 1500);
    } catch (error) {
      console.error('Error deleting inventory item:', error);
    } finally {
      setDeleteLoading(false);
      setDeleteDialogOpen(false);
    }
  };

  const stockStatus = inventoryItem ? getStockStatus(inventoryItem.quantity, inventoryItem.minStockLevel) : null;

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
          موجودی مورد نظر یافت نشد
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/inventory')}
            sx={{ mr: 2 }}
          >
            بازگشت
          </Button>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
            جزئیات موجودی
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="مشاهده محصول">
            <IconButton
              onClick={() => navigate(`/products/${product.id}`)}
              sx={{ color: 'primary.main' }}
            >
              <Visibility />
            </IconButton>
          </Tooltip>
          <Tooltip title="ویرایش موجودی">
            <IconButton
              onClick={() => navigate(`/inventory/${productId}/edit`)}
              sx={{ color: 'warning.main' }}
            >
              <Edit />
            </IconButton>
          </Tooltip>
          <Tooltip title="حذف موجودی">
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
        {/* Product Information */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  mx: 'auto',
                  mb: 2,
                  backgroundColor: '#f5f5f5',
                  color: '#666',
                  fontSize: '3rem',
                }}
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
                  label={getProductTypeLabel(product.type)}
                  color={getProductTypeColor(product.type)}
                />
                <Chip
                  label={category?.name || 'بدون دسته‌بندی'}
                  color="primary"
                />
              </Box>

              <Typography variant="h6" sx={{ color: '#d4af37', fontWeight: 'bold' }}>
                {inventoryItem.quantity} عدد
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Inventory Details */}
        <Grid item xs={12} md={8}>
          <Grid container spacing={3}>
            {/* Stock Status */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ color: '#d4af37', display: 'flex', alignItems: 'center' }}>
                    <InventoryIcon sx={{ mr: 1 }} />
                    وضعیت موجودی
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Chip
                      label={stockStatus.text}
                      color={stockStatus.color}
                      icon={stockStatus.icon}
                      size="large"
                    />
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#d4af37' }}>
                      {inventoryItem.quantity} عدد
                    </Typography>
                  </Box>

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="textSecondary">موجودی قابل فروش:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        {inventoryItem.availableQuantity} عدد
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="textSecondary">موجودی رزرو شده:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        {inventoryItem.reservedQuantity} عدد
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="textSecondary">حداقل موجودی:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        {inventoryItem.minStockLevel} عدد
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="textSecondary">حداکثر موجودی:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        {inventoryItem.maxStockLevel} عدد
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Financial Information */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ color: '#d4af37', display: 'flex', alignItems: 'center' }}>
                    <AttachMoney sx={{ mr: 1 }} />
                    اطلاعات مالی
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="body2" color="textSecondary">قیمت متوسط:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        {inventoryItem.averageCost?.toLocaleString('fa-IR')} تومان
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="body2" color="textSecondary">ارزش کل موجودی:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#27ae60' }}>
                        {inventoryItem.totalValue?.toLocaleString('fa-IR')} تومان
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="body2" color="textSecondary">نقطه سفارش مجدد:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        {inventoryItem.reorderPoint} عدد
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="body2" color="textSecondary">وضعیت سفارش:</Typography>
                      <Chip
                        label={inventoryItem.quantity <= inventoryItem.reorderPoint ? 'نیاز به سفارش' : 'موجودی کافی'}
                        color={inventoryItem.quantity <= inventoryItem.reorderPoint ? 'warning' : 'success'}
                        size="small"
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Additional Information */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ color: '#d4af37', display: 'flex', alignItems: 'center' }}>
                    <LocationOn sx={{ mr: 1 }} />
                    اطلاعات تکمیلی
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="textSecondary">محل نگهداری:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        {inventoryItem.location}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="textSecondary">آخرین شمارش:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        {inventoryItem.lastStockCount}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="textSecondary">تعداد آخرین شمارش:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        {inventoryItem.lastStockCountQuantity} عدد
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="textSecondary">یادداشت:</Typography>
                      <Typography variant="body1">
                        {inventoryItem.notes || 'یادداشتی ثبت نشده است.'}
                      </Typography>
                    </Grid>
                  </Grid>
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
                آیا از حذف موجودی "{product.name}" اطمینان دارید؟ این عملیات غیرقابل بازگشت است.
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

export default InventoryDetail; 