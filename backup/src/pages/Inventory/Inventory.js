import React, { useState, useEffect } from 'react';
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
} from '@mui/icons-material';
import { Snackbar, CircularProgress } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { updateInventory, deleteInventoryItem, initializeInventory } from '../../store/slices/inventorySlice';

const Inventory = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { inventory, loading } = useSelector((state) => state.inventory);
  const { products } = useSelector((state) => state.products);
  const { categories } = useSelector((state) => state.categories);

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

  const filteredInventory = inventory
    .map(item => {
      const product = getProductInfo(item.productId);
      const category = product ? getCategoryInfo(product.category) : null;
      return {
        ...item,
        product,
        category,
        stockStatus: getStockStatus(item.quantity, item.minQuantity),
      };
    })
    .filter((item) => {
      if (!item.product) return false;
      
      const matchesSearch = item.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.product.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || item.product.type === filterType;
      const matchesStatus = filterStatus === 'all' || item.stockStatus.status === filterStatus;
      
      return matchesSearch && matchesType && matchesStatus;
    })
    .sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'productName':
          aValue = a.product?.name || '';
          bValue = b.product?.name || '';
          break;
        case 'quantity':
          aValue = a.quantity || 0;
          bValue = b.quantity || 0;
          break;
        case 'totalValue':
          aValue = a.totalValue || 0;
          bValue = b.totalValue || 0;
          break;
        case 'unitPrice':
          aValue = a.unitPrice || 0;
          bValue = b.unitPrice || 0;
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

  const totalValue = inventory.reduce((sum, item) => sum + (item.totalValue || 0), 0);
  const totalQuantity = inventory.reduce((sum, item) => sum + (item.quantity || 0), 0);

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          موجودی
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={() => window.location.reload()}
          >
            به‌روزرسانی
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<Add />}
            onClick={async () => {
              try {
                await dispatch(initializeInventory()).unwrap();
                alert('موجودی برای همه محصولات ایجاد شد!');
              } catch (error) {
                alert(`خطا در ایجاد موجودی: ${error}`);
              }
            }}
          >
            ایجاد موجودی اولیه
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/inventory/add')}
            sx={{ backgroundColor: '#d4af37', '&:hover': { backgroundColor: '#b8941f' } }}
          >
            افزودن موجودی
          </Button>
        </Box>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography color="textSecondary" gutterBottom variant="body2">
                کل محصولات
              </Typography>
              <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color: '#d4af37' }}>
                {inventory.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography color="textSecondary" gutterBottom variant="body2">
                کل موجودی
              </Typography>
              <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color: '#2c3e50' }}>
                {totalQuantity.toLocaleString('fa-IR')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography color="textSecondary" gutterBottom variant="body2">
                ارزش کل
              </Typography>
              <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color: '#27ae60' }}>
                {(totalValue / 1000000).toFixed(1)}M
              </Typography>
              <Typography variant="body2" color="textSecondary">
                میلیون تومان
              </Typography>
            </CardContent>
          </Card>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography color="textSecondary" gutterBottom variant="body2">
                کم موجودی
              </Typography>
              <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color: '#e74c3c' }}>
                {getStatusCount('low') + getStatusCount('out')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
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
                  <MenuItem value="productName">نام محصول</MenuItem>
                  <MenuItem value="quantity">تعداد</MenuItem>
                  <MenuItem value="totalValue">ارزش کل</MenuItem>
                  <MenuItem value="unitPrice">قیمت واحد</MenuItem>
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
                    <TableCell>محصول</TableCell>
                    <TableCell>دسته‌بندی</TableCell>
                    <TableCell>نوع</TableCell>
                    <TableCell>موجودی</TableCell>
                    <TableCell>قیمت واحد</TableCell>
                    <TableCell>ارزش کل</TableCell>
                    <TableCell>وضعیت</TableCell>
                    <TableCell>عملیات</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredInventory.map((item) => (
                    <TableRow key={item.productId}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar
                            sx={{
                              width: 32,
                              height: 32,
                              backgroundColor: '#f5f5f5',
                              color: '#666',
                              fontSize: '0.8rem',
                            }}
                          >
                            {item.product?.name?.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                              {item.product?.name}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {item.product?.description}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {item.category?.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getProductTypeLabel(item.product?.type)}
                          color={getProductTypeColor(item.product?.type)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {item.quantity?.toLocaleString('fa-IR')} عدد
                        </Typography>
                        {item.minQuantity && (
                          <Typography variant="caption" color="textSecondary">
                            حداقل: {item.minQuantity}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {item.unitPrice?.toLocaleString('fa-IR')} تومان
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#27ae60' }}>
                          {item.totalValue?.toLocaleString('fa-IR')} تومان
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={item.stockStatus.text}
                          color={item.stockStatus.color}
                          size="small"
                          icon={item.stockStatus.icon}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Tooltip title="مشاهده جزئیات موجودی">
                            <IconButton
                              size="small"
                              onClick={() => navigate(`/inventory/${item.productId}`)}
                              sx={{ color: 'primary.main' }}
                            >
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="ویرایش موجودی">
                            <IconButton
                              size="small"
                              onClick={() => handleUpdate(item)}
                              sx={{ color: 'warning.main' }}
                            >
                              <Edit />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="حذف">
                            <IconButton
                              size="small"
                              onClick={() => handleDelete(item)}
                              sx={{ color: 'error.main' }}
                            >
                              <Delete />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
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