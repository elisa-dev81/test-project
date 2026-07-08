import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Snackbar,
} from '@mui/material';
import {
  ArrowBack,
  Save,
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { updateCategory } from '../../store/slices/categorySlice';

const EditCategory = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  
  const { categories, loading } = useSelector((state) => state.categories);

  const [category, setCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'all',
    color: '#d4af37',
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (categories.length > 0 && id) {
      const foundCategory = categories.find(c => c.id === parseInt(id));
      if (foundCategory) {
        setCategory(foundCategory);
        setFormData({
          name: foundCategory.name,
          description: foundCategory.description || '',
          type: foundCategory.type || 'all',
          color: foundCategory.color || '#d4af37',
        });
      }
    }
  }, [categories, id]);

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
    
    if (!validateForm()) {
      return;
    }

    try {
      await dispatch(updateCategory({ 
        id: category.id, 
        categoryData: formData 
      })).unwrap();
      setSuccessMessage('دسته‌بندی با موفقیت ویرایش شد!');
      setTimeout(() => {
        navigate(`/categories/${category.id}`);
      }, 2000);
    } catch (error) {
      console.error('Error updating category:', error);
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

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate(`/categories/${category.id}`)}
            sx={{ mr: 2, fontFamily: 'Vazirmatn, sans-serif' }}
          >
            بازگشت
          </Button>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', fontFamily: 'Vazirmatn, sans-serif' }}>
            ویرایش دسته‌بندی
          </Typography>
        </Box>
      </Box>

      <Card sx={{ maxWidth: 800, mx: 'auto' }}>
        <CardContent sx={{ p: 4 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: '50%',
                      backgroundColor: category.color || '#d4af37',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontSize: '1.5rem',
                      fontWeight: 'bold',
                      mr: 2
                    }}
                  >
                    {category.name.charAt(0)}
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#d4af37', fontFamily: 'Vazirmatn, sans-serif' }}>
                    ویرایش دسته‌بندی "{category.name}"
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="نام دسته‌بندی"
                  value={formData.name}
                  onChange={handleChange('name')}
                  error={!!errors.name}
                  helperText={errors.name}
                  required
                  sx={{ fontFamily: 'Vazirmatn, sans-serif' }}
                  InputLabelProps={{ sx: { fontFamily: 'Vazirmatn, sans-serif' } }}
                  InputProps={{ sx: { fontFamily: 'Vazirmatn, sans-serif' } }}
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
                  placeholder="توضیحات مربوط به این دسته‌بندی..."
                  sx={{ fontFamily: 'Vazirmatn, sans-serif' }}
                  InputLabelProps={{ sx: { fontFamily: 'Vazirmatn, sans-serif' } }}
                  InputProps={{ sx: { fontFamily: 'Vazirmatn, sans-serif' } }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>نوع محصولات</InputLabel>
                  <Select
                    value={formData.type}
                    onChange={handleChange('type')}
                    label="نوع محصولات"
                    sx={{ fontFamily: 'Vazirmatn, sans-serif' }}
                  >
                    <MenuItem value="all" sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>همه</MenuItem>
                    <MenuItem value="gold" sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>طلا</MenuItem>
                    <MenuItem value="silver" sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>نقره</MenuItem>
                    <MenuItem value="coin" sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>سکه</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3, pt: 3, borderTop: '1px solid #e0e0e0' }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate(`/categories/${category.id}`)}
                    sx={{ fontFamily: 'Vazirmatn, sans-serif', minWidth: 120 }}
                  >
                    انصراف
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<Save />}
                    sx={{ 
                      backgroundColor: '#d4af37', 
                      '&:hover': { backgroundColor: '#b8941f' },
                      fontFamily: 'Vazirmatn, sans-serif',
                      minWidth: 150
                    }}
                  >
                    ذخیره تغییرات
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>

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
    </Box>
  );
};

export default EditCategory; 