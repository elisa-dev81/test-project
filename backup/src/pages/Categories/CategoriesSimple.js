import React, { useState, useEffect } from 'react';
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
  Fab
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { fetchCategories, addCategory, updateCategory, deleteCategory } from '../../store/slices/categorySlice';

const CategoriesSimple = () => {
  const dispatch = useDispatch();
  const { categories, loading } = useSelector((state) => state.categories);

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  // لود کردن دسته‌بندی‌ها
  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // باز کردن dialog افزودن
  const handleAdd = () => {
    setFormData({ name: '', description: '' });
    setError('');
    setAddDialogOpen(true);
  };

  // باز کردن dialog ویرایش
  const handleEdit = (category) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      description: category.description || ''
    });
    setError('');
    setEditDialogOpen(true);
  };

  // باز کردن dialog حذف
  const handleDelete = (category) => {
    setSelectedCategory(category);
    setDeleteDialogOpen(true);
  };

  // تغییر فیلدها
  const handleChange = (field) => (event) => {
    setFormData({ ...formData, [field]: event.target.value });
  };

  // ارسال فرم
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('نام دسته‌بندی الزامی است');
      return;
    }

    setSubmitLoading(true);
    setError('');

    try {
      if (addDialogOpen) {
        await dispatch(addCategory(formData)).unwrap();
        setAddDialogOpen(false);
        alert('دسته‌بندی با موفقیت اضافه شد!');
      } else if (editDialogOpen && selectedCategory) {
        await dispatch(updateCategory({ 
          id: selectedCategory.id, 
          categoryData: formData 
        })).unwrap();
        setEditDialogOpen(false);
        alert('دسته‌بندی با موفقیت ویرایش شد!');
      }
      
      setFormData({ name: '', description: '' });
      setSelectedCategory(null);
    } catch (error) {
      console.error('Error saving category:', error);
      setError(error || 'خطا در ذخیره دسته‌بندی');
    } finally {
      setSubmitLoading(false);
    }
  };

  // حذف دسته‌بندی
  const confirmDelete = async () => {
    if (!selectedCategory) return;
    
    setSubmitLoading(true);
    try {
      await dispatch(deleteCategory(selectedCategory.id)).unwrap();
      setDeleteDialogOpen(false);
      setSelectedCategory(null);
      alert('دسته‌بندی با موفقیت حذف شد!');
    } catch (error) {
      console.error('Error deleting category:', error);
      setError(error || 'خطا در حذف دسته‌بندی');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontFamily: 'Vazirmatn', fontWeight: 'bold' }}>
          دسته‌بندی‌ها
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAdd}
          sx={{ fontFamily: 'Vazirmatn' }}
        >
          افزودن دسته‌بندی
        </Button>
      </Box>

      {/* Loading */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Categories Grid */}
      <Grid container spacing={3}>
        {categories.map((category) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={category.id}>
            <Card sx={{ 
              height: '100%',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 4
              }
            }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontFamily: 'Vazirmatn', fontWeight: 'bold', mb: 2 }}>
                  {category.name}
                </Typography>
                
                {category.description && (
                  <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'Vazirmatn', mb: 3 }}>
                    {category.description}
                  </Typography>
                )}

                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={() => handleEdit(category)}
                    sx={{ fontFamily: 'Vazirmatn' }}
                  >
                    ویرایش
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => handleDelete(category)}
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
      {!loading && categories.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary" sx={{ fontFamily: 'Vazirmatn', mb: 2 }}>
            هنوز هیچ دسته‌بندی‌ای اضافه نشده است
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAdd}
            sx={{ fontFamily: 'Vazirmatn' }}
          >
            اولین دسته‌بندی را اضافه کنید
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
          {addDialogOpen ? 'افزودن دسته‌بندی جدید' : 'ویرایش دسته‌بندی'}
        </DialogTitle>
        
        <form onSubmit={handleSubmit}>
          <DialogContent>
            {error && (
              <Alert severity="error" sx={{ mb: 2, fontFamily: 'Vazirmatn' }}>
                {error}
              </Alert>
            )}
            
            <TextField
              fullWidth
              label="نام دسته‌بندی"
              value={formData.name}
              onChange={handleChange('name')}
              required
              margin="normal"
              sx={{ '& .MuiInputLabel-root': { fontFamily: 'Vazirmatn' } }}
              InputProps={{ sx: { fontFamily: 'Vazirmatn' } }}
            />
            
            <TextField
              fullWidth
              label="توضیحات"
              value={formData.description}
              onChange={handleChange('description')}
              multiline
              rows={3}
              margin="normal"
              sx={{ '& .MuiInputLabel-root': { fontFamily: 'Vazirmatn' } }}
              InputProps={{ sx: { fontFamily: 'Vazirmatn' } }}
            />
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
            آیا از حذف دسته‌بندی "{selectedCategory?.name}" اطمینان دارید؟
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

export default CategoriesSimple;