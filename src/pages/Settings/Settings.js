import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Grid,
  Tabs,
  Tab,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  InputAdornment,
  CircularProgress,
  Snackbar,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  Badge,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Business,
  Palette,
  Security,
  Storage,
  Language,
  CurrencyExchange,
  Save,
  Refresh,
  Settings as SettingsIcon,
  CheckCircle,
  Warning,
  Info,
  DarkMode,
  LightMode,
  AutoAwesome,
  Lock,
  Visibility,
  VisibilityOff,
  Backup,
  Restore,
  Delete,
  Download,
  Upload,
  ExpandMore,
  Notifications,
  AccountCircle,
  Store,
  Phone,
  Email,
  LocationOn,
  Web,
  ColorLens,
  FontDownload,
  Translate,
  AttachMoney,
  Receipt,
  Inventory,
  Shield,
  Timer,
  Key,
  History,
  CloudUpload,
  CloudDownload
} from '@mui/icons-material';

const Settings = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState('panel1');
  
  const [settings, setSettings] = useState({
    // Store Info
    store_name: 'فروشگاه طلا و جواهر',
    store_description: 'فروشگاه تخصصی طلا، نقره و سکه',
    store_phone: '+98 21 1234 5678',
    store_email: 'info@goldshop.ir',
    store_address: 'تهران، خیابان ولیعصر، پلاک 123',
    store_website: 'https://goldshop.ir',
    
    // Appearance
    theme: 'light',
    primary_color: '#d4af37',
    secondary_color: '#2c3e50',
    font_size: 'medium',
    rtl_enabled: true,
    compact_mode: false,
    
    // Business
    currency: 'IRR',
    language: 'fa',
    timezone: 'Asia/Tehran',
    tax_rate: 9,
    discount_enabled: true,
    max_discount: 15,
    low_stock_threshold: 5,
    
    // Security
    session_timeout: 30,
    password_expiry: 90,
    two_factor_auth: false,
    login_attempts: 5,
    auto_lock: true,
    audit_log: true,
    
    // Notifications
    email_notifications: true,
    sms_notifications: false,
    push_notifications: true,
    backup_notifications: true
  });

  const handleChange = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      showSnackbar('تنظیمات با موفقیت ذخیره شد!', 'success');
    } catch (error) {
      showSnackbar('خطا در ذخیره تنظیمات', 'error');
    } finally {
      setSaving(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index} style={{ paddingTop: 20 }}>
      {value === index && children}
    </div>
  );

  const themeOptions = [
    { value: 'light', label: 'روشن', icon: <LightMode />, color: '#f5f5f5' },
    { value: 'dark', label: 'تاریک', icon: <DarkMode />, color: '#2c2c2c' },
    { value: 'auto', label: 'خودکار', icon: <AutoAwesome />, color: '#e3f2fd' }
  ];

  const languageOptions = [
    { value: 'fa', label: 'فارسی', flag: '🇮🇷' },
    { value: 'en', label: 'English', flag: '🇺🇸' },
    { value: 'ar', label: 'العربية', flag: '🇸🇦' }
  ];

  const currencyOptions = [
    { value: 'IRR', label: 'ریال ایران', symbol: 'ریال' },
    { value: 'USD', label: 'دلار آمریکا', symbol: '$' },
    { value: 'EUR', label: 'یورو', symbol: '€' }
  ];

  return (
    <Box sx={{ p: 3, backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      {/* Header */}
      <Paper elevation={3} sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'white', color: '#667eea', width: 56, height: 56 }}>
              <SettingsIcon sx={{ fontSize: 32 }} />
            </Avatar>
            <Box>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: 'white', fontFamily: 'Vazirmatn, sans-serif' }}>
                تنظیمات سیستم
              </Typography>
              <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)', fontFamily: 'Vazirmatn, sans-serif' }}>
                مدیریت تنظیمات فروشگاه و سیستم
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={() => window.location.reload()}
              sx={{ 
                color: 'white', 
                borderColor: 'white',
                '&:hover': { borderColor: 'white', backgroundColor: 'rgba(255,255,255,0.1)' },
                fontFamily: 'Vazirmatn, sans-serif'
              }}
            >
              بازنشانی
            </Button>
            <Button
              variant="contained"
              startIcon={saving ? <CircularProgress size={20} /> : <Save />}
              onClick={handleSave}
              disabled={saving}
              sx={{ 
                backgroundColor: '#4caf50',
                '&:hover': { backgroundColor: '#45a049' },
                fontFamily: 'Vazirmatn, sans-serif',
                px: 4
              }}
            >
              {saving ? 'در حال ذخیره...' : 'ذخیره تنظیمات'}
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Tabs */}
      <Paper elevation={2} sx={{ mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={(e, newValue) => setActiveTab(newValue)} 
          variant="scrollable" 
          scrollButtons="auto"
          sx={{ 
            '& .MuiTab-root': { 
              fontFamily: 'Vazirmatn, sans-serif',
              minHeight: 64,
              fontSize: '1rem'
            },
            '& .Mui-selected': {
              color: '#667eea'
            }
          }}
        >
          <Tab icon={<Store />} label="اطلاعات فروشگاه" />
          <Tab icon={<Palette />} label="ظاهر و تم" />
          <Tab icon={<CurrencyExchange />} label="تجاری و مالی" />
          <Tab icon={<Security />} label="امنیت" />
          <Tab icon={<Notifications />} label="اعلان‌ها" />
          <Tab icon={<Storage />} label="پشتیبان‌گیری" />
        </Tabs>
      </Paper>

      {/* Store Info Tab */}
      <TabPanel value={activeTab} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card elevation={3} sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Store sx={{ fontSize: 32, color: '#667eea' }} />
                  <Typography variant="h5" sx={{ fontWeight: 'bold', fontFamily: 'Vazirmatn, sans-serif' }}>
                    اطلاعات فروشگاه
                  </Typography>
                </Box>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="نام فروشگاه"
                      value={settings.store_name}
                      onChange={handleChange('store_name')}
                      InputLabelProps={{ sx: { fontFamily: 'Vazirmatn, sans-serif' } }}
                      InputProps={{ sx: { fontFamily: 'Vazirmatn, sans-serif' } }}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="شماره تلفن"
                      value={settings.store_phone}
                      onChange={handleChange('store_phone')}
                      InputLabelProps={{ sx: { fontFamily: 'Vazirmatn, sans-serif' } }}
                      InputProps={{ 
                        startAdornment: <InputAdornment position="start"><Phone /></InputAdornment>,
                        sx: { fontFamily: 'Vazirmatn, sans-serif' }
                      }}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="توضیحات فروشگاه"
                      value={settings.store_description}
                      onChange={handleChange('store_description')}
                      multiline
                      rows={3}
                      InputLabelProps={{ sx: { fontFamily: 'Vazirmatn, sans-serif' } }}
                      InputProps={{ sx: { fontFamily: 'Vazirmatn, sans-serif' } }}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="ایمیل"
                      value={settings.store_email}
                      onChange={handleChange('store_email')}
                      InputLabelProps={{ sx: { fontFamily: 'Vazirmatn, sans-serif' } }}
                      InputProps={{ 
                        startAdornment: <InputAdornment position="start"><Email /></InputAdornment>,
                        sx: { fontFamily: 'Vazirmatn, sans-serif' }
                      }}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="وب‌سایت"
                      value={settings.store_website}
                      onChange={handleChange('store_website')}
                      InputLabelProps={{ sx: { fontFamily: 'Vazirmatn, sans-serif' } }}
                      InputProps={{ 
                        startAdornment: <InputAdornment position="start"><Web /></InputAdornment>,
                        sx: { fontFamily: 'Vazirmatn, sans-serif' }
                      }}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="آدرس"
                      value={settings.store_address}
                      onChange={handleChange('store_address')}
                      multiline
                      rows={2}
                      InputLabelProps={{ sx: { fontFamily: 'Vazirmatn, sans-serif' } }}
                      InputProps={{ 
                        startAdornment: <InputAdornment position="start"><LocationOn /></InputAdornment>,
                        sx: { fontFamily: 'Vazirmatn, sans-serif' }
                      }}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card elevation={3} sx={{ borderRadius: 3, height: 'fit-content' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Info sx={{ fontSize: 28, color: '#667eea' }} />
                  <Typography variant="h6" sx={{ fontWeight: 'bold', fontFamily: 'Vazirmatn, sans-serif' }}>
                    راهنما
                  </Typography>
                </Box>
                
                <Typography variant="body2" color="textSecondary" sx={{ fontFamily: 'Vazirmatn, sans-serif', mb: 2 }}>
                  اطلاعات فروشگاه شما در فاکتورها، گزارشات و صفحات عمومی نمایش داده می‌شود.
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <CheckCircle sx={{ fontSize: 16, color: 'success.main' }} />
                  <Typography variant="body2" sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>
                    نام و آدرس در فاکتورها
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <CheckCircle sx={{ fontSize: 16, color: 'success.main' }} />
                  <Typography variant="body2" sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>
                    اطلاعات تماس در گزارشات
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircle sx={{ fontSize: 16, color: 'success.main' }} />
                  <Typography variant="body2" sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>
                    وب‌سایت در صفحات عمومی
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Appearance Tab */}
      <TabPanel value={activeTab} index={1}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card elevation={3} sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <ColorLens sx={{ fontSize: 32, color: '#667eea' }} />
                  <Typography variant="h5" sx={{ fontWeight: 'bold', fontFamily: 'Vazirmatn, sans-serif' }}>
                    تم و رنگ‌ها
                  </Typography>
                </Box>
                
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>تم</InputLabel>
                      <Select
                        value={settings.theme}
                        onChange={handleChange('theme')}
                        label="تم"
                        sx={{ fontFamily: 'Vazirmatn, sans-serif' }}
                      >
                        {themeOptions.map(option => (
                          <MenuItem key={option.value} value={option.value} sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              {option.icon}
                              {option.label}
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="رنگ اصلی"
                      value={settings.primary_color}
                      onChange={handleChange('primary_color')}
                      type="color"
                      InputLabelProps={{ sx: { fontFamily: 'Vazirmatn, sans-serif' } }}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="رنگ ثانویه"
                      value={settings.secondary_color}
                      onChange={handleChange('secondary_color')}
                      type="color"
                      InputLabelProps={{ sx: { fontFamily: 'Vazirmatn, sans-serif' } }}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>اندازه فونت</InputLabel>
                      <Select
                        value={settings.font_size}
                        onChange={handleChange('font_size')}
                        label="اندازه فونت"
                        sx={{ fontFamily: 'Vazirmatn, sans-serif' }}
                      >
                        <MenuItem value="small" sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>کوچک</MenuItem>
                        <MenuItem value="medium" sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>متوسط</MenuItem>
                        <MenuItem value="large" sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>بزرگ</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card elevation={3} sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <FontDownload sx={{ fontSize: 32, color: '#667eea' }} />
                  <Typography variant="h5" sx={{ fontWeight: 'bold', fontFamily: 'Vazirmatn, sans-serif' }}>
                    تنظیمات نمایش
                  </Typography>
                </Box>
                
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.rtl_enabled}
                          onChange={handleChange('rtl_enabled')}
                          color="primary"
                        />
                      }
                      label="فعال‌سازی راست به چپ (RTL)"
                      sx={{ '& .MuiFormControlLabel-label': { fontFamily: 'Vazirmatn, sans-serif' } }}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.compact_mode}
                          onChange={handleChange('compact_mode')}
                          color="primary"
                        />
                      }
                      label="حالت فشرده"
                      sx={{ '& .MuiFormControlLabel-label': { fontFamily: 'Vazirmatn, sans-serif' } }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Business Tab */}
      <TabPanel value={activeTab} index={2}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card elevation={3} sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Receipt sx={{ fontSize: 32, color: '#667eea' }} />
                  <Typography variant="h5" sx={{ fontWeight: 'bold', fontFamily: 'Vazirmatn, sans-serif' }}>
                    تنظیمات مالی
                  </Typography>
                </Box>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="نرخ مالیات (%)"
                      value={settings.tax_rate}
                      onChange={handleChange('tax_rate')}
                      type="number"
                      InputProps={{
                        endAdornment: <InputAdornment position="end">%</InputAdornment>,
                        sx: { fontFamily: 'Vazirmatn, sans-serif' }
                      }}
                      InputLabelProps={{ sx: { fontFamily: 'Vazirmatn, sans-serif' } }}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="حداکثر تخفیف (%)"
                      value={settings.max_discount}
                      onChange={handleChange('max_discount')}
                      type="number"
                      disabled={!settings.discount_enabled}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">%</InputAdornment>,
                        sx: { fontFamily: 'Vazirmatn, sans-serif' }
                      }}
                      InputLabelProps={{ sx: { fontFamily: 'Vazirmatn, sans-serif' } }}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.discount_enabled}
                          onChange={handleChange('discount_enabled')}
                          color="primary"
                        />
                      }
                      label="فعال‌سازی تخفیف"
                      sx={{ '& .MuiFormControlLabel-label': { fontFamily: 'Vazirmatn, sans-serif' } }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card elevation={3} sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Inventory sx={{ fontSize: 32, color: '#667eea' }} />
                  <Typography variant="h5" sx={{ fontWeight: 'bold', fontFamily: 'Vazirmatn, sans-serif' }}>
                    تنظیمات موجودی
                  </Typography>
                </Box>
                
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="آستانه کم موجودی"
                      value={settings.low_stock_threshold}
                      onChange={handleChange('low_stock_threshold')}
                      type="number"
                      InputProps={{
                        endAdornment: <InputAdornment position="end">عدد</InputAdornment>,
                        sx: { fontFamily: 'Vazirmatn, sans-serif' }
                      }}
                      InputLabelProps={{ sx: { fontFamily: 'Vazirmatn, sans-serif' } }}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Security Tab */}
      <TabPanel value={activeTab} index={3}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card elevation={3} sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Shield sx={{ fontSize: 32, color: '#667eea' }} />
                  <Typography variant="h5" sx={{ fontWeight: 'bold', fontFamily: 'Vazirmatn, sans-serif' }}>
                    تنظیمات امنیت
                  </Typography>
                </Box>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="مدت زمان نشست (دقیقه)"
                      value={settings.session_timeout}
                      onChange={handleChange('session_timeout')}
                      type="number"
                      InputProps={{
                        endAdornment: <InputAdornment position="end">دقیقه</InputAdornment>,
                        sx: { fontFamily: 'Vazirmatn, sans-serif' }
                      }}
                      InputLabelProps={{ sx: { fontFamily: 'Vazirmatn, sans-serif' } }}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="انقضای رمز عبور (روز)"
                      value={settings.password_expiry}
                      onChange={handleChange('password_expiry')}
                      type="number"
                      InputProps={{
                        endAdornment: <InputAdornment position="end">روز</InputAdornment>,
                        sx: { fontFamily: 'Vazirmatn, sans-serif' }
                      }}
                      InputLabelProps={{ sx: { fontFamily: 'Vazirmatn, sans-serif' } }}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.two_factor_auth}
                          onChange={handleChange('two_factor_auth')}
                          color="primary"
                        />
                      }
                      label="احراز هویت دو مرحله‌ای"
                      sx={{ '& .MuiFormControlLabel-label': { fontFamily: 'Vazirmatn, sans-serif' } }}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.auto_lock}
                          onChange={handleChange('auto_lock')}
                          color="primary"
                        />
                      }
                      label="قفل خودکار"
                      sx={{ '& .MuiFormControlLabel-label': { fontFamily: 'Vazirmatn, sans-serif' } }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card elevation={3} sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Notifications sx={{ fontSize: 32, color: '#667eea' }} />
                  <Typography variant="h5" sx={{ fontWeight: 'bold', fontFamily: 'Vazirmatn, sans-serif' }}>
                    تنظیمات اعلان‌ها
                  </Typography>
                </Box>
                
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.email_notifications}
                          onChange={handleChange('email_notifications')}
                          color="primary"
                        />
                      }
                      label="اعلان‌های ایمیل"
                      sx={{ '& .MuiFormControlLabel-label': { fontFamily: 'Vazirmatn, sans-serif' } }}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.sms_notifications}
                          onChange={handleChange('sms_notifications')}
                          color="primary"
                        />
                      }
                      label="اعلان‌های پیامک"
                      sx={{ '& .MuiFormControlLabel-label': { fontFamily: 'Vazirmatn, sans-serif' } }}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.push_notifications}
                          onChange={handleChange('push_notifications')}
                          color="primary"
                        />
                      }
                      label="اعلان‌های push"
                      sx={{ '& .MuiFormControlLabel-label': { fontFamily: 'Vazirmatn, sans-serif' } }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Notifications Tab */}
      <TabPanel value={activeTab} index={4}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card elevation={3} sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Notifications sx={{ fontSize: 32, color: '#667eea' }} />
                  <Typography variant="h5" sx={{ fontWeight: 'bold', fontFamily: 'Vazirmatn, sans-serif' }}>
                    مدیریت اعلان‌ها
                  </Typography>
                </Box>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <Card sx={{ p: 2, textAlign: 'center', border: '2px solid #e3f2fd' }}>
                      <Email sx={{ fontSize: 48, color: '#2196f3', mb: 2 }} />
                      <Typography variant="h6" sx={{ fontFamily: 'Vazirmatn, sans-serif', mb: 1 }}>
                        ایمیل
                      </Typography>
                      <Switch
                        checked={settings.email_notifications}
                        onChange={handleChange('email_notifications')}
                        color="primary"
                      />
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <Card sx={{ p: 2, textAlign: 'center', border: '2px solid #e8f5e8' }}>
                      <Phone sx={{ fontSize: 48, color: '#4caf50', mb: 2 }} />
                      <Typography variant="h6" sx={{ fontFamily: 'Vazirmatn, sans-serif', mb: 1 }}>
                        پیامک
                      </Typography>
                      <Switch
                        checked={settings.sms_notifications}
                        onChange={handleChange('sms_notifications')}
                        color="primary"
                      />
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <Card sx={{ p: 2, textAlign: 'center', border: '2px solid #fff3e0' }}>
                      <Notifications sx={{ fontSize: 48, color: '#ff9800', mb: 2 }} />
                      <Typography variant="h6" sx={{ fontFamily: 'Vazirmatn, sans-serif', mb: 1 }}>
                        Push
                      </Typography>
                      <Switch
                        checked={settings.push_notifications}
                        onChange={handleChange('push_notifications')}
                        color="primary"
                      />
                    </Card>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Backup Tab */}
      <TabPanel value={activeTab} index={5}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card elevation={3} sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Storage sx={{ fontSize: 32, color: '#667eea' }} />
                  <Typography variant="h5" sx={{ fontWeight: 'bold', fontFamily: 'Vazirmatn, sans-serif' }}>
                    مدیریت پشتیبان‌گیری
                  </Typography>
                </Box>
                
                <List>
                  <ListItem sx={{ border: '1px solid #e0e0e0', borderRadius: 2, mb: 2 }}>
                    <ListItemIcon>
                      <Backup sx={{ color: '#4caf50' }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="ایجاد پشتیبان"
                      secondary="ایجاد نسخه پشتیبان از تمام داده‌ها"
                      primaryTypographyProps={{ sx: { fontFamily: 'Vazirmatn, sans-serif' } }}
                      secondaryTypographyProps={{ sx: { fontFamily: 'Vazirmatn, sans-serif' } }}
                    />
                    <ListItemSecondaryAction>
                      <Button
                        variant="contained"
                        startIcon={<Download />}
                        sx={{ 
                          backgroundColor: '#4caf50',
                          '&:hover': { backgroundColor: '#45a049' },
                          fontFamily: 'Vazirmatn, sans-serif'
                        }}
                      >
                        ایجاد
                      </Button>
                    </ListItemSecondaryAction>
                  </ListItem>
                  
                  <ListItem sx={{ border: '1px solid #e0e0e0', borderRadius: 2, mb: 2 }}>
                    <ListItemIcon>
                      <Restore sx={{ color: '#2196f3' }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="بازیابی پشتیبان"
                      secondary="بازیابی داده‌ها از نسخه پشتیبان"
                      primaryTypographyProps={{ sx: { fontFamily: 'Vazirmatn, sans-serif' } }}
                      secondaryTypographyProps={{ sx: { fontFamily: 'Vazirmatn, sans-serif' } }}
                    />
                    <ListItemSecondaryAction>
                      <Button
                        variant="contained"
                        startIcon={<Upload />}
                        sx={{ 
                          backgroundColor: '#2196f3',
                          '&:hover': { backgroundColor: '#1976d2' },
                          fontFamily: 'Vazirmatn, sans-serif'
                        }}
                      >
                        بازیابی
                      </Button>
                    </ListItemSecondaryAction>
                  </ListItem>
                  
                  <ListItem sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
                    <ListItemIcon>
                      <Delete sx={{ color: '#f44336' }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="حذف پشتیبان‌های قدیمی"
                      secondary="حذف نسخه‌های پشتیبان قدیمی‌تر از 30 روز"
                      primaryTypographyProps={{ sx: { fontFamily: 'Vazirmatn, sans-serif' } }}
                      secondaryTypographyProps={{ sx: { fontFamily: 'Vazirmatn, sans-serif' } }}
                    />
                    <ListItemSecondaryAction>
                      <Button
                        variant="contained"
                        startIcon={<Delete />}
                        sx={{ 
                          backgroundColor: '#f44336',
                          '&:hover': { backgroundColor: '#d32f2f' },
                          fontFamily: 'Vazirmatn, sans-serif'
                        }}
                      >
                        حذف
                      </Button>
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card elevation={3} sx={{ borderRadius: 3, height: 'fit-content' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <CheckCircle sx={{ fontSize: 32, color: '#4caf50' }} />
                  <Typography variant="h6" sx={{ fontWeight: 'bold', fontFamily: 'Vazirmatn, sans-serif' }}>
                    وضعیت پشتیبان‌گیری
                  </Typography>
                </Box>
                
                <Box sx={{ textAlign: 'center', py: 2 }}>
                  <CheckCircle sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
                  <Typography variant="h6" gutterBottom sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>
                    آخرین پشتیبان
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>
                    امروز ساعت 14:30
                  </Typography>
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="body2" color="textSecondary" gutterBottom sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>
                  اندازه کل: 45.2 MB
                </Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>
                  تعداد پشتیبان‌ها: 3
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>
                  آخرین فایل: 15.8 MB
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ fontFamily: 'Vazirmatn, sans-serif' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Settings;
