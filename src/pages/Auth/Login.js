import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  IconButton,
  InputAdornment,
  Alert,
  Divider,
  Paper,
  Fade,
  Slide,
  Container,
  Grid,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Person,
  Lock,
  Email,
  Phone,
  Business,
  LocationOn,
  AccountCircle,
  Login as LoginIcon,
  PersonAdd,
  Home,
  Security,
  Diamond,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Login form state
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
  });

  // Register form state
  const [registerForm, setRegisterForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    businessName: '',
    address: '',
    password: '',
    confirmPassword: '',
  });

  const handleLoginChange = (field) => (event) => {
    setLoginForm({
      ...loginForm,
      [field]: event.target.value,
    });
    setError('');
  };

  const handleRegisterChange = (field) => (event) => {
    setRegisterForm({
      ...registerForm,
      [field]: event.target.value,
    });
    setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Validate form
      if (!loginForm.email || !loginForm.password) {
        throw new Error('لطفاً تمام فیلدها را پر کنید');
      }

      // Simulate successful login
      setSuccess('ورود با موفقیت انجام شد!');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);

    } catch (error) {
      setError(error.message || 'خطا در ورود به سیستم');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Validate form
      if (!registerForm.fullName || !registerForm.email || !registerForm.password || !registerForm.confirmPassword) {
        throw new Error('لطفاً تمام فیلدهای الزامی را پر کنید');
      }

      if (registerForm.password !== registerForm.confirmPassword) {
        throw new Error('رمز عبور و تکرار آن یکسان نیستند');
      }

      if (registerForm.password.length < 6) {
        throw new Error('رمز عبور باید حداقل ۶ کاراکتر باشد');
      }

      // Simulate successful registration
      setSuccess('ثبت‌نام با موفقیت انجام شد! حالا می‌توانید وارد شوید');
      setTimeout(() => {
        setIsLogin(true);
        setRegisterForm({
          fullName: '',
          email: '',
          phone: '',
          businessName: '',
          address: '',
          password: '',
          confirmPassword: '',
        });
      }, 1500);

    } catch (error) {
      setError(error.message || 'خطا در ثبت‌نام');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setSuccess('');
  };

  return (
         <Box
       className="login-background"
       sx={{
         minHeight: '100vh',
         background: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.5)), url('/gold-background.jpg')`,
         backgroundSize: 'cover',
         backgroundPosition: 'center',
         backgroundRepeat: 'no-repeat',
         backgroundAttachment: 'fixed',
         display: 'flex',
         alignItems: 'center',
         justifyContent: 'center',
         p: 2,
       }}
     >
      <Container maxWidth="md">
        <Grid container spacing={4} alignItems="center">
          {/* Left side - Welcome text */}
          <Grid item xs={12} md={6}>
            <Fade in timeout={1000}>
              <Box sx={{ color: 'white', textAlign: 'center', mb: { xs: 4, md: 0 } }}>
                <Diamond sx={{ fontSize: 80, color: '#d4af37', mb: 2 }} />
                <Typography
                  variant="h2"
                  sx={{
                    fontWeight: 'bold',
                    fontFamily: 'Vazirmatn, sans-serif',
                    mb: 2,
                    textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                  }}
                >
                  فروشگاه طلا و جواهر
                </Typography>
                <Typography
                  variant="h5"
                  sx={{
                    fontFamily: 'Vazirmatn, sans-serif',
                    mb: 3,
                    opacity: 0.9,
                    textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                  }}
                >
                  مدیریت حرفه‌ای کسب و کار شما
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    fontFamily: 'Vazirmatn, sans-serif',
                    opacity: 0.8,
                    textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                  }}
                >
                  سیستم مدیریتی کامل برای فروشگاه‌های طلا و جواهر
                </Typography>
              </Box>
            </Fade>
          </Grid>

          {/* Right side - Login/Register form */}
          <Grid item xs={12} md={6}>
            <Slide direction="left" in timeout={800}>
                             <Card className="glass-card" sx={{ maxWidth: 500, mx: 'auto' }}>
                <CardContent sx={{ p: 4 }}>
                  {/* Header */}
                  <Box sx={{ textAlign: 'center', mb: 4 }}>
                                         <Box className="circle-icon">
                                             {isLogin ? (
                         <LoginIcon sx={{ fontSize: 40, color: 'white' }} />
                       ) : (
                         <PersonAdd sx={{ fontSize: 40, color: 'white' }} />
                       )}
                    </Box>
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 'bold',
                        fontFamily: 'Vazirmatn, sans-serif',
                        color: '#2c3e50',
                        mb: 1,
                      }}
                    >
                      {isLogin ? 'ورود به سیستم' : 'ثبت‌نام'}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: 'Vazirmatn, sans-serif',
                        color: 'text.secondary',
                      }}
                    >
                      {isLogin
                        ? 'برای دسترسی به پنل مدیریت وارد شوید'
                        : 'حساب کاربری جدید ایجاد کنید'}
                    </Typography>
                  </Box>

                  {/* Error/Success messages */}
                  {error && (
                    <Alert severity="error" sx={{ mb: 3, fontFamily: 'Vazirmatn, sans-serif' }}>
                      {error}
                    </Alert>
                  )}
                  {success && (
                    <Alert severity="success" sx={{ mb: 3, fontFamily: 'Vazirmatn, sans-serif' }}>
                      {success}
                    </Alert>
                  )}

                  {/* Login Form */}
                  {isLogin ? (
                    <Box component="form" onSubmit={handleLogin}>
                                             <TextField
                         fullWidth
                         label="ایمیل"
                         type="email"
                         value={loginForm.email}
                         onChange={handleLoginChange('email')}
                         className="gold-input"
                         sx={{ mb: 3, fontFamily: 'Vazirmatn, sans-serif' }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Email sx={{ color: '#d4af37' }} />
                            </InputAdornment>
                          ),
                        }}
                        InputLabelProps={{ sx: { fontFamily: 'Vazirmatn, sans-serif' } }}
                      />
                      <TextField
                        fullWidth
                        label="رمز عبور"
                        type={showPassword ? 'text' : 'password'}
                        value={loginForm.password}
                        onChange={handleLoginChange('password')}
                        sx={{ mb: 4, fontFamily: 'Vazirmatn, sans-serif' }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Lock sx={{ color: '#d4af37' }} />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => setShowPassword(!showPassword)}
                                edge="end"
                              >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                        InputLabelProps={{ sx: { fontFamily: 'Vazirmatn, sans-serif' } }}
                      />
                                             <Button
                         type="submit"
                         fullWidth
                         variant="contained"
                         disabled={loading}
                         sx={{
                           py: 1.5,
                           background: 'linear-gradient(135deg, #d4af37, #b8941f)',
                           '&:hover': {
                             background: 'linear-gradient(135deg, #b8941f, #a0851a)',
                             transform: 'translateY(-2px)',
                             boxShadow: '0 8px 20px rgba(212, 175, 55, 0.4)',
                           },
                           fontFamily: 'Vazirmatn, sans-serif',
                           fontSize: '1.1rem',
                           fontWeight: 'bold',
                           borderRadius: 12,
                           transition: 'all 0.3s ease',
                           boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3)',
                         }}
                       >
                         {loading ? 'در حال ورود...' : 'ورود'}
                       </Button>
                    </Box>
                  ) : (
                    /* Register Form */
                    <Box component="form" onSubmit={handleRegister}>
                      <TextField
                        fullWidth
                        label="نام و نام خانوادگی"
                        value={registerForm.fullName}
                        onChange={handleRegisterChange('fullName')}
                        sx={{ mb: 2, fontFamily: 'Vazirmatn, sans-serif' }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Person sx={{ color: '#d4af37' }} />
                            </InputAdornment>
                          ),
                        }}
                        InputLabelProps={{ sx: { fontFamily: 'Vazirmatn, sans-serif' } }}
                      />
                      <TextField
                        fullWidth
                        label="ایمیل"
                        type="email"
                        value={registerForm.email}
                        onChange={handleRegisterChange('email')}
                        sx={{ mb: 2, fontFamily: 'Vazirmatn, sans-serif' }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Email sx={{ color: '#d4af37' }} />
                            </InputAdornment>
                          ),
                        }}
                        InputLabelProps={{ sx: { fontFamily: 'Vazirmatn, sans-serif' } }}
                      />
                      <TextField
                        fullWidth
                        label="شماره تلفن"
                        value={registerForm.phone}
                        onChange={handleRegisterChange('phone')}
                        sx={{ mb: 2, fontFamily: 'Vazirmatn, sans-serif' }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Phone sx={{ color: '#d4af37' }} />
                            </InputAdornment>
                          ),
                        }}
                        InputLabelProps={{ sx: { fontFamily: 'Vazirmatn, sans-serif' } }}
                      />
                      <TextField
                        fullWidth
                        label="نام فروشگاه"
                        value={registerForm.businessName}
                        onChange={handleRegisterChange('businessName')}
                        sx={{ mb: 2, fontFamily: 'Vazirmatn, sans-serif' }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Business sx={{ color: '#d4af37' }} />
                            </InputAdornment>
                          ),
                        }}
                        InputLabelProps={{ sx: { fontFamily: 'Vazirmatn, sans-serif' } }}
                      />
                      <TextField
                        fullWidth
                        label="آدرس"
                        value={registerForm.address}
                        onChange={handleRegisterChange('address')}
                        sx={{ mb: 2, fontFamily: 'Vazirmatn, sans-serif' }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LocationOn sx={{ color: '#d4af37' }} />
                            </InputAdornment>
                          ),
                        }}
                        InputLabelProps={{ sx: { fontFamily: 'Vazirmatn, sans-serif' } }}
                      />
                      <TextField
                        fullWidth
                        label="رمز عبور"
                        type={showPassword ? 'text' : 'password'}
                        value={registerForm.password}
                        onChange={handleRegisterChange('password')}
                        sx={{ mb: 2, fontFamily: 'Vazirmatn, sans-serif' }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Lock sx={{ color: '#d4af37' }} />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => setShowPassword(!showPassword)}
                                edge="end"
                              >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                        InputLabelProps={{ sx: { fontFamily: 'Vazirmatn, sans-serif' } }}
                      />
                      <TextField
                        fullWidth
                        label="تکرار رمز عبور"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={registerForm.confirmPassword}
                        onChange={handleRegisterChange('confirmPassword')}
                        sx={{ mb: 4, fontFamily: 'Vazirmatn, sans-serif' }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Security sx={{ color: '#d4af37' }} />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                edge="end"
                              >
                                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                        InputLabelProps={{ sx: { fontFamily: 'Vazirmatn, sans-serif' } }}
                      />
                                             <Button
                         type="submit"
                         fullWidth
                         variant="contained"
                         disabled={loading}
                         sx={{
                           py: 1.5,
                           background: 'linear-gradient(135deg, #d4af37, #b8941f)',
                           '&:hover': {
                             background: 'linear-gradient(135deg, #b8941f, #a0851a)',
                             transform: 'translateY(-2px)',
                             boxShadow: '0 8px 20px rgba(212, 175, 55, 0.4)',
                           },
                           fontFamily: 'Vazirmatn, sans-serif',
                           fontSize: '1.1rem',
                           fontWeight: 'bold',
                           borderRadius: 12,
                           transition: 'all 0.3s ease',
                           boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3)',
                         }}
                       >
                         {loading ? 'در حال ثبت‌نام...' : 'ثبت‌نام'}
                       </Button>
                    </Box>
                  )}

                  {/* Divider */}
                  <Divider sx={{ my: 3 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: 'Vazirmatn, sans-serif',
                        color: 'text.secondary',
                        px: 2,
                      }}
                    >
                      یا
                    </Typography>
                  </Divider>

                  {/* Toggle mode button */}
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={toggleMode}
                    sx={{
                      fontFamily: 'Vazirmatn, sans-serif',
                      borderColor: '#d4af37',
                      color: '#d4af37',
                      '&:hover': {
                        borderColor: '#b8941f',
                        backgroundColor: 'rgba(212, 175, 55, 0.1)',
                      },
                    }}
                  >
                    {isLogin ? 'حساب کاربری ندارید؟ ثبت‌نام کنید' : 'قبلاً ثبت‌نام کرده‌اید؟ وارد شوید'}
                  </Button>

                  {/* Back to home */}
                  <Box sx={{ textAlign: 'center', mt: 3 }}>
                    <Button
                      startIcon={<Home />}
                      onClick={() => navigate('/')}
                      sx={{
                        fontFamily: 'Vazirmatn, sans-serif',
                        color: 'text.secondary',
                        '&:hover': {
                          color: '#d4af37',
                        },
                      }}
                    >
                      بازگشت به صفحه اصلی
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Slide>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Login;
