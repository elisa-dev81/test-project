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
  CircularProgress,
} from '@mui/material';
import {
  Search,
  Add,
  Edit,
  Delete,
  Visibility,
  Category,
  Sort,
  Inventory,
  AttachMoney,
  Warning,
  CheckCircle,
  Error,
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchCategories, addCategory, updateCategory, deleteCategory } from '../../store/slices/categorySlice';

const Categories = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { categories, loading } = useSelector((state) => state.categories);
  const { products } = useSelector((state) => state.products);

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'all',
    color: '#d4af37',
  });
  const [errors, setErrors] = useState({});
  const [submitLoading, setSubmitLoading] = useState(false);

  // لود کردن دسته‌بندی‌ها در هنگام بارگذاری صفحه
  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const getProductCount = (categoryId) => {
    return products.filter(product => product.category === categoryId).length;
  };

  const filteredCategories = categories
    .filter((category) => {
      return category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
             category.description?.toLowerCase().includes(searchTerm.toLowerCase());
    })
    .sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'productCount') {
        aValue = getProductCount(a.id);
        bValue = getProductCount(b.id);
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const getCategoryTypeColor = (type) => {
    switch (type) {
      case 'gold': return 'warning';
      case 'silver': return 'info';
      case 'coin': return 'success';
      case 'all': return 'default';
      default: return 'default';
    }
  };

  const getCategoryTypeLabel = (type) => {
    switch (type) {
      case 'gold': return 'طلا';
      case 'silver': return 'نقره';
      case 'coin': return 'سکه';
      case 'all': return 'همه';
      default: return type;
    }
  };

  const handleAdd = () => {
    setFormData({
      name: '',
      description: '',
      type: 'all',
      color: '#d4af37',
    });
    setErrors({});
    setAddDialogOpen(true);
  };

  const handleEdit = (category) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      type: category.type || 'all',
      color: category.color || '#d4af37',
    });
    setErrors({});
    setEditDialogOpen(true);
  };

  const handleDelete = (category) => {
    setSelectedCategory(category);
    setDeleteDialogOpen(true);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'نام دسته‌بندی الزامی است';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted!', { formData, addDialogOpen, editDialogOpen });
    
    if (!validateForm()) {
      console.log('Form validation failed');
      return;
    }

    setSubmitLoading(true);
    setErrors({});

    try {
      // فقط فیلدهای مورد نیاز API را ارسال کن
      const categoryData = {
        name: formData.name.trim(),
        description: formData.description.trim()
      };

      if (addDialogOpen) {
        // افزودن دسته‌بندی جدید
        console.log('Adding new category:', categoryData);
        const result = await dispatch(addCategory(categoryData)).unwrap();
        console.log('Category added successfully:', result);
      } else if (editDialogOpen && selectedCategory) {
        // ویرایش دسته‌بندی موجود
        console.log('Updating category:', selectedCategory.id, categoryData);
        const result = await dispatch(updateCategory({ 
          id: selectedCategory.id, 
          categoryData: categoryData 
        })).unwrap();
        console.log('Category updated successfully:', result);
      }
      
      // بستن dialog و پاک کردن form
      setAddDialogOpen(false);
      setEditDialogOpen(false);
      setFormData({
        name: '',
        description: '',
        type: 'all',
        color: '#d4af37',
      });
      setSelectedCategory(null);
      
      // نمایش پیام موفقیت
      alert(addDialogOpen ? 'دسته‌بندی با موفقیت اضافه شد!' : 'دسته‌بندی با موفقیت ویرایش شد!');
      
    } catch (error) {
      console.error('Error saving category:', error);
      setErrors({ submit: error.message || 'خطا در ذخیره دسته‌بندی' });
    } finally {
      setSubmitLoading(false);
    }
  };

  const confirmDelete = async () => {
    try {
      if (selectedCategory) {
        await dispatch(deleteCategory(selectedCategory.id)).unwrap();
        setDeleteDialogOpen(false);
        setSelectedCategory(null);
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      setErrors({ submit: error.message || 'خطا در حذف دسته‌بندی' });
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

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          دسته‌بندی‌ها
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleAdd}
          sx={{ backgroundColor: '#d4af37', '&:hover': { backgroundColor: '#b8941f' } }}
        >
          افزودن دسته‌بندی
        </Button>
      </Box>

      {/* Filters and Search */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="جستجو در دسته‌بندی‌ها..."
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
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>مرتب‌سازی</InputLabel>
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  label="مرتب‌سازی"
                >
                  <MenuItem value="name">نام</MenuItem>
                  <MenuItem value="productCount">تعداد محصولات</MenuItem>
                  <MenuItem value="createdAt">تاریخ ایجاد</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
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

      {/* Categories Grid */}
      <Grid container spacing={3}>
        {filteredCategories.map((category) => {
          const productCount = getProductCount(category.id);
          
          return (
            <Grid item xs={12} sm={6} md={4} lg={3} key={category.id}>
              <Card sx={{ height: '100%', position: 'relative' }}>
                <CardContent>
                  {/* Category Icon */}
                  <Box sx={{ textAlign: 'center', mb: 2 }}>
                    <Avatar
                      sx={{
                        width: 80,
                        height: 80,
                        mx: 'auto',
                        backgroundColor: category.color || '#d4af37',
                        color: '#fff',
                        fontSize: '2rem',
                      }}
                    >
                      {category.name.charAt(0)}
                    </Avatar>
                  </Box>

                  {/* Category Info */}
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                    {category.name}
                  </Typography>
                  
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 2, textAlign: 'center' }}>
                    {category.description}
                  </Typography>

                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                    <Chip
                      label={getCategoryTypeLabel(category.type)}
                      color={getCategoryTypeColor(category.type)}
                      size="small"
                    />
                  </Box>

                  <Typography variant="h6" sx={{ color: '#d4af37', fontWeight: 'bold', textAlign: 'center', mb: 1 }}>
                    {productCount} محصول
                  </Typography>

                  {/* Actions */}
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                    <Tooltip title="مشاهده محصولات">
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/categories/${category.id}/products`)}
                        sx={{ color: 'primary.main' }}
                      >
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="ویرایش">
                      <IconButton
                        size="small"
                        onClick={() => handleEdit(category)}
                        sx={{ color: 'warning.main' }}
                      >
                        <Edit />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="حذف">
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(category)}
                        sx={{ color: 'error.main' }}
                        disabled={productCount > 0}
                      >
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Empty State */}
      {filteredCategories.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="textSecondary" sx={{ mb: 2 }}>
            دسته‌بندی‌ای یافت نشد
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAdd}
            sx={{ backgroundColor: '#d4af37', '&:hover': { backgroundColor: '#b8941f' } }}
          >
            افزودن اولین دسته‌بندی
          </Button>
        </Box>
      )}

      {/* Add Category Dialog */}
      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontFamily: 'Vazirmatn' }}>افزودن دسته‌بندی جدید</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            {errors.submit && (
              <Alert severity="error" sx={{ mb: 2, fontFamily: 'Vazirmatn' }}>
                {errors.submit}
              </Alert>
            )}
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="نام دسته‌بندی"
                  value={formData.name}
                  onChange={handleChange('name')}
                  error={!!errors.name}
                  helperText={errors.name}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="توضیحات"
                  value={formData.description}
                  onChange={handleChange('description')}
                  multiline
                  rows={3}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>نوع محصولات</InputLabel>
                  <Select
                    value={formData.type}
                    onChange={handleChange('type')}
                    label="نوع محصولات"
                  >
                    <MenuItem value="all">همه</MenuItem>
                    <MenuItem value="gold">طلا</MenuItem>
                    <MenuItem value="silver">نقره</MenuItem>
                    <MenuItem value="coin">سکه</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="رنگ"
                  value={formData.color}
                  onChange={handleChange('color')}
                  type="color"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAddDialogOpen(false)} disabled={submitLoading} sx={{ fontFamily: 'Vazirmatn' }}>
              انصراف
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              disabled={submitLoading}
              sx={{ backgroundColor: '#d4af37', '&:hover': { backgroundColor: '#b8941f' }, fontFamily: 'Vazirmatn' }}
            >
              {submitLoading ? <CircularProgress size={24} /> : 'افزودن'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>ویرایش دسته‌بندی</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="نام دسته‌بندی"
                  value={formData.name}
                  onChange={handleChange('name')}
                  error={!!errors.name}
                  helperText={errors.name}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="توضیحات"
                  value={formData.description}
                  onChange={handleChange('description')}
                  multiline
                  rows={3}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>نوع محصولات</InputLabel>
                  <Select
                    value={formData.type}
                    onChange={handleChange('type')}
                    label="نوع محصولات"
                  >
                    <MenuItem value="all">همه</MenuItem>
                    <MenuItem value="gold">طلا</MenuItem>
                    <MenuItem value="silver">نقره</MenuItem>
                    <MenuItem value="coin">سکه</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="رنگ"
                  value={formData.color}
                  onChange={handleChange('color')}
                  type="color"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialogOpen(false)} disabled={submitLoading} sx={{ fontFamily: 'Vazirmatn' }}>
              انصراف
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              disabled={submitLoading}
              sx={{ backgroundColor: '#d4af37', '&:hover': { backgroundColor: '#b8941f' }, fontFamily: 'Vazirmatn' }}
            >
              {submitLoading ? <CircularProgress size={24} /> : 'ذخیره تغییرات'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>تأیید حذف</DialogTitle>
        <DialogContent>
          <Typography>
            آیا از حذف دسته‌بندی "{selectedCategory?.name}" اطمینان دارید؟
          </Typography>
          {selectedCategory && getProductCount(selectedCategory.id) > 0 && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              این دسته‌بندی دارای {getProductCount(selectedCategory.id)} محصول است و قابل حذف نیست.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>انصراف</Button>
          <Button 
            onClick={confirmDelete} 
            color="error" 
            variant="contained"
            disabled={selectedCategory && getProductCount(selectedCategory.id) > 0}
          >
            حذف
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
        onClick={handleAdd}
      >
        <Add />
      </Fab>
    </Box>
  );
};

export default Categories; 