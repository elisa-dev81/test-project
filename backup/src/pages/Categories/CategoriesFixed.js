import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Chip,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCategories, addCategory, updateCategory, deleteCategory } from '../../store/slices/categorySlice';

const CategoriesFixed = () => {
  const dispatch = useDispatch();
  const { categories, loading, error } = useSelector(state => state.categories);
  
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleAdd = () => {
    setFormData({ name: '', description: '' });
    setErrors({});
    setAddDialogOpen(true);
  };

  const handleEdit = (category) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      description: category.description || ''
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
        console.log('Adding new category:', categoryData);
        const result = await dispatch(addCategory(categoryData)).unwrap();
        console.log('Category added successfully:', result);
        
        // بستن dialog و پاک کردن form
        setAddDialogOpen(false);
        setFormData({ name: '', description: '' });
        
        // نمایش پیام موفقیت
        alert('دسته‌بندی با موفقیت اضافه شد!');
      } else if (editDialogOpen && selectedCategory) {
        console.log('Updating category:', selectedCategory.id, categoryData);
        const result = await dispatch(updateCategory({ 
          id: selectedCategory.id, 
          categoryData: categoryData 
        })).unwrap();
        console.log('Category updated successfully:', result);
        
        // بستن dialog و پاک کردن form
        setEditDialogOpen(false);
        setFormData({ name: '', description: '' });
        setSelectedCategory(null);
        
        // نمایش پیام موفقیت
        alert('دسته‌بندی با موفقیت ویرایش شد!');
      }
      
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
        alert('دسته‌بندی با موفقیت حذف شد!');
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 4,
        pb: 2,
        borderBottom: '2px solid #f0f0f0'
      }}>
        <Typography 
          variant="h4" 
          component="h1" 
          sx={{ 
            fontWeight: 'bold', 
            fontFamily: 'Vazirmatn',
            color: '#2c3e50'
          }}
        >
          مدیریت دسته‌بندی‌ها
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAdd}
          sx={{ 
            backgroundColor: '#d4af37', 
            '&:hover': { backgroundColor: '#b8941f' },
            fontFamily: 'Vazirmatn',
            px: 3,
            py: 1.5,
            borderRadius: 2,
            boxShadow: 2
          }}
        >
          افزودن دسته‌بندی جدید
        </Button>
      </Box>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 2, fontFamily: 'Vazirmatn' }}>
          {error}
        </Alert>
      )}

      {/* Categories Grid */}
      {categories.length > 0 ? (
        <Grid container spacing={3}>
          {categories.map((category) => (
            <Grid item xs={12} sm={6} md={4} key={category.id}>
                             <Card 
                 sx={{ 
                   height: '100%',
                   transition: 'all 0.3s ease',
                   borderRadius: 3,
                   border: '1px solid #e0e0e0',
                   '&:hover': {
                     transform: 'translateY(-8px)',
                     boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
                     borderColor: '#d4af37'
                   }
                 }}
               >
                 <CardContent sx={{ p: 3 }}>
                   <Box sx={{ 
                     display: 'flex', 
                     justifyContent: 'space-between', 
                     alignItems: 'flex-start', 
                     mb: 2 
                   }}>
                     <Typography 
                       variant="h6" 
                       component="h3" 
                       sx={{ 
                         fontWeight: 'bold',
                         fontFamily: 'Vazirmatn',
                         flex: 1,
                         color: '#2c3e50',
                         fontSize: '1.1rem'
                       }}
                     >
                       {category.name}
                     </Typography>
                     <Box sx={{ display: 'flex', gap: 0.5 }}>
                       <IconButton
                         size="small"
                         onClick={() => handleEdit(category)}
                         sx={{ 
                           color: '#d4af37',
                           backgroundColor: 'rgba(212, 175, 55, 0.1)',
                           '&:hover': {
                             backgroundColor: 'rgba(212, 175, 55, 0.2)',
                             transform: 'scale(1.1)'
                           },
                           transition: 'all 0.2s ease'
                         }}
                       >
                         <EditIcon fontSize="small" />
                       </IconButton>
                       <IconButton
                         size="small"
                         onClick={() => handleDelete(category)}
                         sx={{ 
                           color: '#e74c3c',
                           backgroundColor: 'rgba(231, 76, 60, 0.1)',
                           '&:hover': {
                             backgroundColor: 'rgba(231, 76, 60, 0.2)',
                             transform: 'scale(1.1)'
                           },
                           transition: 'all 0.2s ease'
                         }}
                       >
                         <DeleteIcon fontSize="small" />
                       </IconButton>
                     </Box>
                   </Box>
                  
                                     {category.description && (
                     <Typography 
                       variant="body2" 
                       color="text.secondary" 
                       sx={{ 
                         mb: 3,
                         fontFamily: 'Vazirmatn',
                         lineHeight: 1.6,
                         color: '#666',
                         fontSize: '0.9rem'
                       }}
                     >
                       {category.description}
                     </Typography>
                   )}
                   
                   <Box sx={{ 
                     display: 'flex', 
                     justifyContent: 'space-between', 
                     alignItems: 'center',
                     pt: 2,
                     borderTop: '1px solid #f0f0f0'
                   }}>
                     <Chip 
                       label={`${category.products?.length || 0} محصول`}
                       size="small"
                       sx={{ 
                         fontFamily: 'Vazirmatn',
                         backgroundColor: '#e8f5e8',
                         color: '#2e7d32',
                         fontWeight: 'bold'
                       }}
                     />
                     <Typography 
                       variant="caption" 
                       color="text.secondary"
                       sx={{ 
                         fontFamily: 'Vazirmatn',
                         color: '#888',
                         fontSize: '0.75rem'
                       }}
                     >
                       {new Date(category.createdAt).toLocaleDateString('fa-IR')}
                     </Typography>
                   </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
             ) : (
         <Box sx={{ 
           textAlign: 'center', 
           py: 8,
           backgroundColor: '#fafafa',
           borderRadius: 3,
           border: '2px dashed #e0e0e0'
         }}>
           <Typography 
             variant="h5" 
             color="text.secondary" 
             sx={{ 
               fontFamily: 'Vazirmatn', 
               mb: 3,
               color: '#666',
               fontWeight: 'normal'
             }}
           >
             هیچ دسته‌بندی موجود نیست
           </Typography>
           <Typography 
             variant="body2" 
             color="text.secondary" 
             sx={{ 
               fontFamily: 'Vazirmatn', 
               mb: 4,
               color: '#888'
             }}
           >
             برای شروع، اولین دسته‌بندی خود را ایجاد کنید
           </Typography>
           <Button
             variant="contained"
             startIcon={<AddIcon />}
             onClick={handleAdd}
             sx={{ 
               backgroundColor: '#d4af37', 
               '&:hover': { backgroundColor: '#b8941f' },
               fontFamily: 'Vazirmatn',
               px: 4,
               py: 1.5,
               borderRadius: 2,
               boxShadow: 2
             }}
           >
             افزودن اولین دسته‌بندی
           </Button>
         </Box>
       )}

      {/* Add Category Dialog */}
      <Dialog 
        open={addDialogOpen} 
        onClose={() => setAddDialogOpen(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
          }
        }}
      >
        <DialogTitle sx={{ 
          fontFamily: 'Vazirmatn',
          backgroundColor: '#f8f9fa',
          borderBottom: '1px solid #e0e0e0',
          color: '#2c3e50',
          fontWeight: 'bold'
        }}>
          افزودن دسته‌بندی جدید
        </DialogTitle>
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
                  sx={{ 
                    '& .MuiInputLabel-root': { fontFamily: 'Vazirmatn' },
                    '& .MuiInputBase-input': { fontFamily: 'Vazirmatn' }
                  }}
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
                  sx={{ 
                    '& .MuiInputLabel-root': { fontFamily: 'Vazirmatn' },
                    '& .MuiInputBase-input': { fontFamily: 'Vazirmatn' }
                  }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ 
            p: 3, 
            backgroundColor: '#f8f9fa',
            borderTop: '1px solid #e0e0e0'
          }}>
            <Button 
              onClick={() => setAddDialogOpen(false)} 
              disabled={submitLoading} 
              sx={{ 
                fontFamily: 'Vazirmatn',
                color: '#666',
                '&:hover': {
                  backgroundColor: 'rgba(0,0,0,0.04)'
                }
              }}
            >
              انصراف
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              disabled={submitLoading}
              sx={{ 
                backgroundColor: '#d4af37', 
                '&:hover': { backgroundColor: '#b8941f' }, 
                fontFamily: 'Vazirmatn',
                px: 4,
                py: 1,
                borderRadius: 2,
                boxShadow: 2
              }}
            >
              {submitLoading ? <CircularProgress size={20} /> : 'افزودن دسته‌بندی'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog 
        open={editDialogOpen} 
        onClose={() => setEditDialogOpen(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
          }
        }}
      >
        <DialogTitle sx={{ 
          fontFamily: 'Vazirmatn',
          backgroundColor: '#f8f9fa',
          borderBottom: '1px solid #e0e0e0',
          color: '#2c3e50',
          fontWeight: 'bold'
        }}>
          ویرایش دسته‌بندی
        </DialogTitle>
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
                  sx={{ 
                    '& .MuiInputLabel-root': { fontFamily: 'Vazirmatn' },
                    '& .MuiInputBase-input': { fontFamily: 'Vazirmatn' }
                  }}
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
                  sx={{ 
                    '& .MuiInputLabel-root': { fontFamily: 'Vazirmatn' },
                    '& .MuiInputBase-input': { fontFamily: 'Vazirmatn' }
                  }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ 
            p: 3, 
            backgroundColor: '#f8f9fa',
            borderTop: '1px solid #e0e0e0'
          }}>
            <Button 
              onClick={() => setEditDialogOpen(false)} 
              disabled={submitLoading} 
              sx={{ 
                fontFamily: 'Vazirmatn',
                color: '#666',
                '&:hover': {
                  backgroundColor: 'rgba(0,0,0,0.04)'
                }
              }}
            >
              انصراف
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              disabled={submitLoading}
              sx={{ 
                backgroundColor: '#d4af37', 
                '&:hover': { backgroundColor: '#b8941f' }, 
                fontFamily: 'Vazirmatn',
                px: 4,
                py: 1,
                borderRadius: 2,
                boxShadow: 2
              }}
            >
              {submitLoading ? <CircularProgress size={20} /> : 'ذخیره تغییرات'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={deleteDialogOpen} 
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
          }
        }}
      >
        <DialogTitle sx={{ 
          fontFamily: 'Vazirmatn',
          backgroundColor: '#fff5f5',
          borderBottom: '1px solid #fed7d7',
          color: '#c53030',
          fontWeight: 'bold'
        }}>
          ⚠️ تأیید حذف
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Typography sx={{ 
            fontFamily: 'Vazirmatn',
            color: '#2d3748',
            fontSize: '1rem',
            lineHeight: 1.6
          }}>
            آیا از حذف دسته‌بندی <strong>"{selectedCategory?.name}"</strong> اطمینان دارید؟
            <br />
            <span style={{ color: '#e53e3e', fontSize: '0.9rem' }}>
              این عملیات غیرقابل بازگشت است.
            </span>
          </Typography>
        </DialogContent>
        <DialogActions sx={{ 
          p: 3, 
          backgroundColor: '#fff5f5',
          borderTop: '1px solid #fed7d7'
        }}>
          <Button 
            onClick={() => setDeleteDialogOpen(false)} 
            sx={{ 
              fontFamily: 'Vazirmatn',
              color: '#666',
              '&:hover': {
                backgroundColor: 'rgba(0,0,0,0.04)'
              }
            }}
          >
            انصراف
          </Button>
          <Button 
            onClick={confirmDelete} 
            variant="contained" 
            sx={{ 
              fontFamily: 'Vazirmatn',
              backgroundColor: '#e53e3e',
              '&:hover': { backgroundColor: '#c53030' },
              px: 4,
              py: 1,
              borderRadius: 2,
              boxShadow: 2
            }}
          >
            حذف دسته‌بندی
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CategoriesFixed; 