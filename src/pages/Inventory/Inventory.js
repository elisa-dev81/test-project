import React, { useState, useEffect } from 'react';
import { formatPrice, toPersianNumbers } from '../../utils/persianNumbers';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Tooltip,
  Fab,
  Alert,
  LinearProgress,
  Badge,
} from '@mui/material';
import {
  Search,
  Add,
  Edit,
  Delete,
  Visibility,
  Inventory as InventoryIcon,
  Sort,
  AttachMoney,
  Warning,
  CheckCircle,
  Error,
  TrendingUp,
  TrendingDown,
  Refresh,
  FilterList,
  Category,
} from '@mui/icons-material';
import { Snackbar, CircularProgress } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { updateInventory, deleteInventoryItem, initializeInventory } from '../../store/slices/inventorySlice';
import { selectTotalProductsCount, selectLowStockCategoriesCount, selectGold18kPrice } from '../../store/slices/productSlice';
import { selectGold18kPrice as selectGoldPriceFromPriceSlice } from '../../store/slices/priceSlice';

const Inventory = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { inventory, loading } = useSelector((state) => state.inventory);
  const { products } = useSelector((state) => state.products);
  const { categories } = useSelector((state) => state.categories);
  const totalProductsCount = useSelector(selectTotalProductsCount);
  const lowStockCategoriesCount = useSelector(selectLowStockCategoriesCount);
  const gold18kPrice = useSelector(selectGoldPriceFromPriceSlice);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('productName');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedItem, setSelectedItem] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    quantity: '',
    minQuantity: '',
    maxQuantity: '',
    unitPrice: '',
    location: '',
    notes: '',
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);

  // محاسبه قیمت محصول بر اساس وزن و عیار (بدون اجرت ساخت) - مانند کامپوننت محصولات
  const calculateProductPrice = (weight, purity) => {
    if (!gold18kPrice || gold18kPrice === 0) return 0;
    
    const numericWeight = parseFloat(weight) || 0;
    const numericPurity = parseInt(purity) || 18;
    
    if (numericPurity >= 900) {
      // محاسبه نقره (عیار 925، 950 و غیره)
      const purityFactor = numericPurity / 1000;
      return numericWeight * gold18kPrice * 0.015 * purityFactor; // نسبت نقره به طلا
    } else {
      // تشخیص نوع عیار
      let adjustedPurity;
      if (numericPurity >= 100) {
        // عیار هزارگان (مثل 750, 585, 916, 999)
        adjustedPurity = (numericPurity / 1000) * 24; // تبدیل به عیار 24گانه
      } else {
        // عیار 24گانه (مثل 18, 21, 22, 24)
        adjustedPurity = numericPurity;
      }
      
      // استفاده از قیمت 18 عیار
      if (adjustedPurity === 18) {
        return numericWeight * gold18kPrice;
      } else {
        // محاسبه بر اساس نسبت عیار
        const pricePerGram = gold18kPrice * (adjustedPurity / 18); // نسبت به 18 عیار
        return numericWeight * pricePerGram;
      }
    }
  };

  const getProductInfo = (productId) => {
    return products.find(product => product.id === productId);
  };

  const getCategoryInfo = (categoryId) => {
    return categories.find(category => category.id === categoryId);
  };

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

  // تابع برای گرفتن تعداد محصولات یک دسته‌بندی
  const getCategoryProductCount = (categoryId) => {
    return products.filter(product => product.category_id === categoryId).length;
  };

  // محاسبه ارزش کل محصولات یک دسته‌بندی
  const calculateCategoryTotalValue = (categoryId) => {
    const categoryProducts = products.filter(product => product.category_id === categoryId);
    return categoryProducts.reduce((total, product) => {
      const productPrice = calculateProductPrice(product.weight, product.purity);
      return total + productPrice;
    }, 0);
  };

  // تبدیل موجودی بر اساس دسته‌بندی‌ها به جای محصولات منفرد
  const filteredInventory = categories
    .map(category => {
      const productCount = getCategoryProductCount(category.id);
      const totalValue = calculateCategoryTotalValue(category.id);
      const averagePrice = productCount > 0 ? totalValue / productCount : 0;
      
      return {
        id: category.id,
        category,
        productCount, // تعداد محصولات دسته‌بندی (از کامپوننت دسته‌بندی)
        averagePrice, // میانگین قیمت محصولات دسته‌بندی
        totalValue, // ارزش کل دسته‌بندی
        stockStatus: getStockStatus(productCount, 2), // کم موجودی اگر کمتر از 2 محصول داشته باشد
      };
    })
    .filter((item) => {
      if (!item.category) return false;
      
      const matchesSearch = item.category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.category.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || item.category.type === filterType;
      const matchesStatus = filterStatus === 'all' || item.stockStatus.status === filterStatus;
      
      return matchesSearch && matchesType && matchesStatus;
    })
    .sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'productName':
        case 'categoryName':
          aValue = a.category?.name || '';
          bValue = b.category?.name || '';
          break;
        case 'quantity':
          aValue = a.productCount || 0;
          bValue = b.productCount || 0;
          break;
        case 'totalValue':
          aValue = a.totalValue || 0;
          bValue = b.totalValue || 0;
          break;
        case 'unitPrice':
          aValue = a.averagePrice || 0;
          bValue = b.averagePrice || 0;
          break;
        default:
          aValue = a[sortBy] || '';
          bValue = b[sortBy] || '';
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const handleUpdate = (item) => {
    setSelectedItem(item);
    setFormData({
      quantity: item.quantity || '',
      minQuantity: item.minStockLevel || '',
      maxQuantity: item.maxStockLevel || '',
      unitPrice: item.averageCost || '',
      location: item.location || '',
      notes: item.notes || '',
    });
    setErrors({});
    setUpdateDialogOpen(true);
  };

  const handleDelete = (item) => {
    setSelectedItem(item);
    setDeleteDialogOpen(true);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.quantity || parseFloat(formData.quantity) < 0) {
      newErrors.quantity = 'تعداد موجودی معتبر الزامی است';
    }

    if (formData.minQuantity && parseFloat(formData.minQuantity) < 0) {
      newErrors.minQuantity = 'حداقل موجودی معتبر الزامی است';
    }

    if (formData.maxQuantity && parseFloat(formData.maxQuantity) < parseFloat(formData.quantity)) {
      newErrors.maxQuantity = 'حداکثر موجودی باید بیشتر از موجودی فعلی باشد';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setUpdateLoading(true);
    try {
      const inventoryData = {
        productId: selectedItem.productId,
        quantity: parseInt(formData.quantity),
        minStockLevel: parseInt(formData.minQuantity),
        maxStockLevel: parseInt(formData.maxQuantity),
        averageCost: parseFloat(formData.unitPrice),
        location: formData.location,
        notes: formData.notes,
      };

      await dispatch(updateInventory(inventoryData)).unwrap();
      
      setSuccessMessage('موجودی با موفقیت به‌روزرسانی شد!');
      setUpdateDialogOpen(false);
      setSelectedItem(null);
      setFormData({
        quantity: '',
        minQuantity: '',
        maxQuantity: '',
        unitPrice: '',
        notes: '',
      });
    } catch (error) {
      console.error('Error updating inventory:', error);
    } finally {
      setUpdateLoading(false);
    }
  };

  const confirmDelete = async () => {
    setDeleteLoading(true);
    try {
      await dispatch(deleteInventoryItem(selectedItem.productId)).unwrap();
      setSuccessMessage(`موجودی "${selectedItem.product?.name}" با موفقیت حذف شد`);
      setDeleteDialogOpen(false);
      setSelectedItem(null);
    } catch (error) {
      console.error('Error deleting inventory item:', error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.value,
    });
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: '',
      });
    }
  };

  const getStatusCount = (status) => {
    return inventory.filter(item => {
      const stockStatus = getStockStatus(item.quantity, item.minQuantity);
      return stockStatus.status === status;
    }).length;
  };

  // محاسبه ارزش کل از مجموع ستون ارزش کل لیست موجودی
  const totalValueFromInventoryList = filteredInventory.reduce((sum, item) => {
    return sum + (item.totalValue || 0);
  }, 0);
  
  // محاسبه کل تعداد محصولات از دسته‌بندی‌ها
  const totalQuantity = categories.reduce((sum, category) => {
    const categoryProductCount = getCategoryProductCount(category.id);
    return sum + categoryProductCount;
  }, 0);

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          موجودی
        </Typography>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Typography color="textSecondary" gutterBottom variant="body2" sx={{ fontFamily: 'Vazirmatn' }}>
                کل محصولات
              </Typography>
              <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color: '#d4af37', fontFamily: 'Vazirmatn' }}>
                {inventory.length}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ fontFamily: 'Vazirmatn' }}>
                آیتم موجودی
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Typography color="textSecondary" gutterBottom variant="body2" sx={{ fontFamily: 'Vazirmatn' }}>
                کل موجودی
              </Typography>
              <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color: '#2c3e50', fontFamily: 'Vazirmatn' }}>
                {toPersianNumbers(totalProductsCount.toLocaleString('fa-IR'))}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ fontFamily: 'Vazirmatn' }}>
                محصول
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Typography color="textSecondary" gutterBottom variant="body2" sx={{ fontFamily: 'Vazirmatn' }}>
                کم موجودی
              </Typography>
              <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color: '#e74c3c', fontFamily: 'Vazirmatn' }}>
                {toPersianNumbers(lowStockCategoriesCount.toLocaleString('fa-IR'))}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ fontFamily: 'Vazirmatn' }}>
                دسته کم محصول
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Typography color="textSecondary" gutterBottom variant="body2" sx={{ fontFamily: 'Vazirmatn' }}>
                ارزش کل
              </Typography>
              <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color: '#27ae60', fontFamily: 'Vazirmatn' }}>
                {totalValueFromInventoryList >= 1000000 
                  ? `${(totalValueFromInventoryList / 1000000).toFixed(1)}M`
                  : toPersianNumbers(totalValueFromInventoryList.toLocaleString('fa-IR'))
                }
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ fontFamily: 'Vazirmatn' }}>
                {totalValueFromInventoryList >= 1000000 ? 'میلیون تومان' : 'تومان'}
              </Typography>
              <Typography variant="caption" color="textSecondary" sx={{ fontFamily: 'Vazirmatn', mt: 0.5 }}>
                از مجموع لیست موجودی
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Warning Alert for missing inventory */}
      {products.length > 0 && inventory.length === 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography sx={{ fontFamily: 'Vazirmatn, sans-serif', mb: 1 }}>
            هیچ موجودی برای محصولات تعریف نشده است.
          </Typography>
          <Button
            variant="outlined"
            size="small"
            onClick={async () => {
              try {
                await dispatch(initializeInventory()).unwrap();
                alert('موجودی برای همه محصولات ایجاد شد!');
              } catch (error) {
                alert(`خطا در ایجاد موجودی: ${error}`);
              }
            }}
            sx={{ fontFamily: 'Vazirmatn, sans-serif' }}
          >
            ایجاد موجودی اولیه
          </Button>
        </Alert>
      )}

      {/* Filters and Search */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="جستجو در موجودی..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>نوع محصول</InputLabel>
                <Select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  label="نوع محصول"
                >
                  <MenuItem value="all">همه</MenuItem>
                  <MenuItem value="gold">طلا</MenuItem>
                  <MenuItem value="silver">نقره</MenuItem>
                  <MenuItem value="coin">سکه</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>وضعیت</InputLabel>
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  label="وضعیت"
                >
                  <MenuItem value="all">همه</MenuItem>
                  <MenuItem value="ok">موجود</MenuItem>
                  <MenuItem value="low">کم موجودی</MenuItem>
                  <MenuItem value="out">ناموجود</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>مرتب‌سازی</InputLabel>
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  label="مرتب‌سازی"
                >
                  <MenuItem value="categoryName">نام دسته‌بندی</MenuItem>
                  <MenuItem value="quantity">تعداد محصولات</MenuItem>
                  <MenuItem value="totalValue">ارزش کل</MenuItem>
                  <MenuItem value="unitPrice">میانگین قیمت</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                startIcon={<Sort />}
              >
                {sortOrder === 'asc' ? 'صعودی' : 'نزولی'}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Inventory Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ color: '#d4af37' }}>
            لیست موجودی
          </Typography>
          
          {filteredInventory.length > 0 ? (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontFamily: 'Vazirmatn' }}>دسته‌بندی</TableCell>
                    <TableCell sx={{ fontFamily: 'Vazirmatn' }}>توضیحات</TableCell>
                    <TableCell sx={{ fontFamily: 'Vazirmatn' }}>تعداد محصولات</TableCell>
                    <TableCell sx={{ fontFamily: 'Vazirmatn' }}>میانگین قیمت</TableCell>
                    <TableCell sx={{ fontFamily: 'Vazirmatn' }}>ارزش کل</TableCell>
                    <TableCell sx={{ fontFamily: 'Vazirmatn' }}>وضعیت</TableCell>
                    <TableCell sx={{ fontFamily: 'Vazirmatn' }}>عملیات</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredInventory.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar
                            sx={{
                              width: 40,
                              height: 40,
                              backgroundColor: item.category?.color || '#d4af37',
                              color: '#fff',
                              fontSize: '1rem',
                            }}
                          >
                            {item.category?.name?.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 'bold', fontFamily: 'Vazirmatn' }}>
                              {item.category?.name}
                            </Typography>
                            <Typography variant="caption" color="textSecondary" sx={{ fontFamily: 'Vazirmatn' }}>
                              شناسه: {item.category?.id}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: 'Vazirmatn' }}>
                          {item.category?.description || 'بدون توضیحات'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', fontFamily: 'Vazirmatn' }}>
                          {item.productCount?.toLocaleString('fa-IR')} محصول
                        </Typography>
                        <Typography variant="caption" color="textSecondary" sx={{ fontFamily: 'Vazirmatn' }}>
                          از کامپوننت دسته‌بندی
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', fontFamily: 'Vazirmatn' }}>
                          {(item.averagePrice || 0).toLocaleString('fa-IR')} تومان
                        </Typography>
                        <Typography variant="caption" color="textSecondary" sx={{ fontFamily: 'Vazirmatn' }}>
                          میانگین محصولات
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#27ae60', fontFamily: 'Vazirmatn' }}>
                          {(item.totalValue || 0).toLocaleString('fa-IR')} تومان
                        </Typography>
                        <Typography variant="caption" color="textSecondary" sx={{ fontFamily: 'Vazirmatn' }}>
                          {item.productCount} × {(item.averagePrice || 0).toLocaleString('fa-IR')}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={item.stockStatus.text}
                          color={item.stockStatus.color}
                          size="small"
                          icon={item.stockStatus.icon}
                          sx={{ fontFamily: 'Vazirmatn' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Tooltip title="مشاهده محصولات دسته‌بندی">
                            <IconButton
                              size="small"
                              onClick={() => navigate(`/categories/${item.id}`)}
                              sx={{ color: 'primary.main' }}
                            >
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                  {/* سطر مجموع */}
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell colSpan={4} sx={{ textAlign: 'center', fontWeight: 'bold', fontFamily: 'Vazirmatn' }}>
                      مجموع کل
                    </TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#27ae60', fontFamily: 'Vazirmatn' }}>
                        {totalValueFromInventoryList.toLocaleString('fa-IR')} تومان
                      </Typography>
                    </TableCell>
                    <TableCell colSpan={2} sx={{ textAlign: 'center', fontFamily: 'Vazirmatn' }}>
                      {filteredInventory.length} دسته‌بندی
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" color="textSecondary" sx={{ mb: 2 }}>
                موردی یافت نشد
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => navigate('/inventory/add')}
                sx={{ backgroundColor: '#d4af37', '&:hover': { backgroundColor: '#b8941f' } }}
              >
                افزودن موجودی
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Update Inventory Dialog */}
      <Dialog open={updateDialogOpen} onClose={() => setUpdateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>ویرایش موجودی</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Typography variant="h6" gutterBottom>
              {selectedItem?.product?.name}
            </Typography>
            <Grid container spacing={2}>
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
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="قیمت واحد (تومان)"
                  value={formData.unitPrice}
                  onChange={handleChange('unitPrice')}
                  type="number"
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
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setUpdateDialogOpen(false)}
              disabled={updateLoading}
            >
              انصراف
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              disabled={updateLoading}
              startIcon={updateLoading ? <CircularProgress size={20} /> : null}
              sx={{ backgroundColor: '#d4af37', '&:hover': { backgroundColor: '#b8941f' } }}
            >
              {updateLoading ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>تأیید حذف</DialogTitle>
        <DialogContent>
          <Typography>
            آیا از حذف موجودی "{selectedItem?.product?.name}" اطمینان دارید؟
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteDialogOpen(false)}
            disabled={deleteLoading}
          >
            انصراف
          </Button>
          <Button 
            onClick={confirmDelete} 
            color="error" 
            variant="contained"
            disabled={deleteLoading}
            startIcon={deleteLoading ? <CircularProgress size={20} /> : <Delete />}
          >
            {deleteLoading ? 'در حال حذف...' : 'حذف'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          backgroundColor: '#d4af37',
          '&:hover': { backgroundColor: '#b8941f' }
        }}
        onClick={() => navigate('/inventory/add')}
      >
        <Add />
      </Fab>

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

export default Inventory; 