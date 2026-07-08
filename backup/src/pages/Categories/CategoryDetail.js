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
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { deleteCategory } from '../../store/slices/categorySlice';

const CategoryDetail = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  
  const { categories, loading } = useSelector((state) => state.categories);
  const { products } = useSelector((state) => state.products);

  const [category, setCategory] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (categories.length > 0 && id) {
      const foundCategory = categories.find(c => c.id === parseInt(id));
      if (foundCategory) {
        setCategory(foundCategory);
      }
    }
  }, [categories, id]);

  const getCategoryProducts = (categoryId) => {
    return products.filter(product => product.category === categoryId);
  };

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
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
            جزئیات دسته‌بندی
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="ویرایش دسته‌بندی">
            <IconButton
              onClick={() => navigate(`/categories/${category.id}/edit`)}
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
                  label={getCategoryTypeLabel(category.type)}
                  color={getCategoryTypeColor(category.type)}
                />
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
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="textSecondary">نوع محصولات:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        {getCategoryTypeLabel(category.type)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="textSecondary">وضعیت:</Typography>
                      <Chip
                        label={category.isActive ? 'فعال' : 'غیرفعال'}
                        color={category.isActive ? 'success' : 'default'}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="textSecondary">ترتیب نمایش:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        {category.sortOrder}
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
                    <Button
                      variant="outlined"
                      startIcon={<Add />}
                      onClick={() => navigate('/products/add')}
                      size="small"
                    >
                      افزودن محصول
                    </Button>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  
                  {categoryProducts.length > 0 ? (
                    <Grid container spacing={2}>
                      {categoryProducts.slice(0, 6).map((product) => (
                        <Grid item xs={12} sm={6} md={4} key={product.id}>
                          <Card sx={{ height: '100%' }}>
                            <CardContent>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <Avatar
                                  sx={{
                                    width: 40,
                                    height: 40,
                                    mr: 1,
                                    backgroundColor: '#f5f5f5',
                                    color: '#666',
                                  }}
                                >
                                  {product.name.charAt(0)}
                                </Avatar>
                                <Box sx={{ flexGrow: 1 }}>
                                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                    {product.name}
                                  </Typography>
                                  <Typography variant="caption" color="textSecondary">
                                    {product.type === 'gold' ? 'طلا' : product.type === 'silver' ? 'نقره' : 'سکه'}
                                  </Typography>
                                </Box>
                              </Box>
                              <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                                {product.sellingPrice?.toLocaleString('fa-IR')} تومان
                              </Typography>
                              <Button
                                size="small"
                                startIcon={<Visibility />}
                                onClick={() => navigate(`/products/${product.id}`)}
                                fullWidth
                              >
                                مشاهده جزئیات
                              </Button>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                      {categoryProducts.length > 6 && (
                        <Grid item xs={12}>
                          <Box sx={{ textAlign: 'center', mt: 2 }}>
                            <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                              و {categoryProducts.length - 6} محصول دیگر...
                            </Typography>
                            <Button
                              variant="outlined"
                              onClick={() => navigate('/products')}
                            >
                              مشاهده همه محصولات
                            </Button>
                          </Box>
                        </Grid>
                      )}
                    </Grid>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="h6" color="textSecondary" sx={{ mb: 2 }}>
                        محصولی در این دسته‌بندی وجود ندارد
                      </Typography>
                      <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => navigate('/products/add')}
                        sx={{ backgroundColor: '#d4af37', '&:hover': { backgroundColor: '#b8941f' } }}
                      >
                        افزودن اولین محصول
                      </Button>
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
          <Card sx={{ maxWidth: 400, mx: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                تأیید حذف
              </Typography>
              <Typography sx={{ mb: 3 }}>
                آیا از حذف دسته‌بندی "{category.name}" اطمینان دارید؟ این عملیات غیرقابل بازگشت است.
              </Typography>
              {categoryProducts.length > 0 && (
                <Alert severity="warning" sx={{ mb: 3 }}>
                  این دسته‌بندی دارای {categoryProducts.length} محصول است و قابل حذف نیست.
                </Alert>
              )}
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
                  disabled={categoryProducts.length > 0 || deleteLoading}
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

export default CategoryDetail; 