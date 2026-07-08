import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, Alert } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCategories, addCategory } from '../../store/slices/categorySlice';

const CategoriesTest = () => {
  const dispatch = useDispatch();
  const { categories, loading, error } = useSelector(state => state.categories);
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Submitting:', { name, description });
    
    if (!name.trim()) {
      setSubmitError('نام الزامی است');
      return;
    }

    setSubmitLoading(true);
    setSubmitError('');

    try {
      const categoryData = {
        name: name.trim(),
        description: description.trim()
      };

      console.log('Sending data:', categoryData);
      const result = await dispatch(addCategory(categoryData)).unwrap();
      console.log('Success:', result);
      
      // Clear form
      setName('');
      setDescription('');
      alert('دسته‌بندی با موفقیت اضافه شد!');
      
    } catch (error) {
      console.error('Error:', error);
      setSubmitError(error.message || 'خطا در افزودن دسته‌بندی');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontFamily: 'Vazirmatn' }}>
        تست افزودن دسته‌بندی
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2, fontFamily: 'Vazirmatn' }}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            label="نام دسته‌بندی"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            sx={{ fontFamily: 'Vazirmatn' }}
          />
        </Box>
        
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            label="توضیحات"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            rows={3}
            sx={{ fontFamily: 'Vazirmatn' }}
          />
        </Box>

        {submitError && (
          <Alert severity="error" sx={{ mb: 2, fontFamily: 'Vazirmatn' }}>
            {submitError}
          </Alert>
        )}

        <Button
          type="submit"
          variant="contained"
          disabled={submitLoading}
          sx={{ fontFamily: 'Vazirmatn' }}
        >
          {submitLoading ? 'در حال ارسال...' : 'افزودن دسته‌بندی'}
        </Button>
      </form>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" sx={{ mb: 2, fontFamily: 'Vazirmatn' }}>
          دسته‌بندی‌های موجود ({categories.length}):
        </Typography>
        {categories.map(category => (
          <Box key={category.id} sx={{ mb: 1, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
            <Typography sx={{ fontFamily: 'Vazirmatn' }}>
              <strong>{category.name}</strong>
              {category.description && ` - ${category.description}`}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default CategoriesTest; 