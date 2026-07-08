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
            sx={{ mr: 2 }}
          >
            بازگشت
          </Button>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
            ویرایش دسته‌بندی
          </Typography>
        </Box>
      </Box>

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ color: '#d4af37' }}>
                  اطلاعات دسته‌بندی
                </Typography>
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
                  helperText="رنگ نمایشی دسته‌بندی"
                />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate(`/categories/${category.id}`)}
                  >
                    انصراف
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<Save />}
                    sx={{ backgroundColor: '#d4af37', '&:hover': { backgroundColor: '#b8941f' } }}
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
        message={successMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
};

export default EditCategory; 