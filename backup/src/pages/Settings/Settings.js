import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Switch,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Alert,
  CircularProgress,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Save,
  Refresh,
  Business,
  Email,
  Phone,
  LocationOn,
  Security,
  Palette,
  Backup,
  Restore,
  Delete,
  CheckCircle,
  Store,
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
// Import actions when needed
// import { saveSettings, resetSettings, createBackup, restoreBackup } from '../../store/slices/settingsSlice';

const Settings = () => {
  // const dispatch = useDispatch(); // Uncomment when using Redux actions
  // const { current: settings, loading, success, error } = useSelector((state) => state.settings); // Uncomment when using Redux
  const [activeTab, setActiveTab] = useState(0);
  const [backupDialogOpen, setBackupDialogOpen] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);
  const [localSuccess, setLocalSuccess] = useState(false);

  // General Settings
  const [generalSettings, setGeneralSettings] = useState({
    storeName: 'فروشگاه طلا و جواهر',
    storeDescription: 'فروشگاه تخصصی طلا، نقره و سکه',
    phone: '+98 21 1234 5678',
    email: 'info@goldshop.ir',
    address: 'تهران، خیابان ولیعصر، پلاک 123',
    website: 'https://goldshop.ir',
    currency: 'IRR',
    language: 'fa',
    timezone: 'Asia/Tehran',
  });

  // Business Settings
  const [businessSettings, setBusinessSettings] = useState({
    taxRate: 9,
    discountEnabled: true,
    maxDiscount: 15,
    lowStockThreshold: 5,
    autoBackup: true,
    backupFrequency: 'daily',
    notificationsEnabled: true,
    emailNotifications: true,
    smsNotifications: false,
  });

  // Appearance Settings
  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: 'light',
    primaryColor: '#d4af37',
    secondaryColor: '#2c3e50',
    fontSize: 'medium',
    rtlEnabled: true,
    compactMode: false,
  });

  // Security Settings
  const [securitySettings, setSecuritySettings] = useState({
    sessionTimeout: 30,
    passwordExpiry: 90,
    twoFactorAuth: false,
    loginAttempts: 5,
    autoLock: true,
    auditLog: true,
  });

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleGeneralChange = (field) => (event) => {
    setGeneralSettings({
      ...generalSettings,
      [field]: event.target.value,
    });
  };

  const handleBusinessChange = (field) => (event) => {
    setBusinessSettings({
      ...businessSettings,
      [field]: event.target.type === 'checkbox' ? event.target.checked : event.target.value,
    });
  };

  const handleAppearanceChange = (field) => (event) => {
    setAppearanceSettings({
      ...appearanceSettings,
      [field]: event.target.type === 'checkbox' ? event.target.checked : event.target.value,
    });
  };

  const handleSecurityChange = (field) => (event) => {
    setSecuritySettings({
      ...securitySettings,
      [field]: event.target.type === 'checkbox' ? event.target.checked : event.target.value,
    });
  };

  const handleSave = async () => {
    setLocalLoading(true);
    try {
      // Here you would dispatch actions to save settings
      console.log('Saving settings:', {
        general: generalSettings,
        business: businessSettings,
        appearance: appearanceSettings,
        security: securitySettings,
      });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setLocalSuccess(true);
      setTimeout(() => setLocalSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setLocalLoading(false);
    }
  };

  const handleBackup = async () => {
    setLocalLoading(true);
    try {
      // Here you would dispatch a backup action
      console.log('Creating backup...');
      
      // Simulate backup process
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      setBackupDialogOpen(false);
      setLocalSuccess(true);
      setTimeout(() => setLocalSuccess(false), 3000);
    } catch (error) {
      console.error('Error creating backup:', error);
    } finally {
      setLocalLoading(false);
    }
  };

  const handleRestore = async () => {
    setLocalLoading(true);
    try {
      // Here you would dispatch a restore action
      console.log('Restoring from backup...');
      
      // Simulate restore process
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      setLocalSuccess(true);
      setTimeout(() => setLocalSuccess(false), 3000);
    } catch (error) {
      console.error('Error restoring backup:', error);
    } finally {
      setLocalLoading(false);
    }
  };

  const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index} style={{ paddingTop: 20 }}>
      {value === index && children}
    </div>
  );

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', fontFamily: 'Vazirmatn, sans-serif' }}>
          تنظیمات
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={() => window.location.reload()}
            sx={{ fontFamily: 'Vazirmatn, sans-serif' }}
          >
            بازنشانی
          </Button>
          <Button
            variant="contained"
            startIcon={localLoading ? <CircularProgress size={20} /> : <Save />}
            onClick={handleSave}
            disabled={localLoading}
            sx={{ 
              backgroundColor: '#d4af37', 
              '&:hover': { backgroundColor: '#b8941f' },
              fontFamily: 'Vazirmatn, sans-serif'
            }}
          >
            {localLoading ? 'در حال ذخیره...' : 'ذخیره تنظیمات'}
          </Button>
        </Box>
      </Box>

      {localSuccess && (
        <Alert severity="success" sx={{ mb: 3, fontFamily: 'Vazirmatn, sans-serif' }}>
          تنظیمات با موفقیت ذخیره شد!
        </Alert>
      )}

      {/* Tabs */}
      <Card sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
          <Tab icon={<Business />} label="عمومی" sx={{ fontFamily: 'Vazirmatn, sans-serif' }} />
          <Tab icon={<Store />} label="تجاری" sx={{ fontFamily: 'Vazirmatn, sans-serif' }} />
          <Tab icon={<Palette />} label="ظاهری" sx={{ fontFamily: 'Vazirmatn, sans-serif' }} />
          <Tab icon={<Security />} label="امنیت" sx={{ fontFamily: 'Vazirmatn, sans-serif' }} />
          <Tab icon={<Backup />} label="پشتیبان‌گیری" sx={{ fontFamily: 'Vazirmatn, sans-serif' }} />
        </Tabs>
      </Card>

      {/* General Settings */}
      <TabPanel value={activeTab} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: '#d4af37', fontFamily: 'Vazirmatn, sans-serif' }}>
                  اطلاعات فروشگاه
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="نام فروشگاه"
                      value={generalSettings.storeName}
                      onChange={handleGeneralChange('storeName')}
                      InputLabelProps={{ sx: { fontFamily: 'Vazirmatn, sans-serif' } }}
                      InputProps={{ sx: { fontFamily: 'Vazirmatn, sans-serif' } }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="توضیحات فروشگاه"
                      value={generalSettings.storeDescription}
                      onChange={handleGeneralChange('storeDescription')}
                      multiline
                      rows={2}
                      InputLabelProps={{ sx: { fontFamily: 'Vazirmatn, sans-serif' } }}
                      InputProps={{ sx: { fontFamily: 'Vazirmatn, sans-serif' } }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="شماره تلفن"
                      value={generalSettings.phone}
                      onChange={handleGeneralChange('phone')}
                      InputProps={{
                        startAdornment: <InputAdornment position="start"><Phone /></InputAdornment>,
                        sx: { fontFamily: 'Vazirmatn, sans-serif' }
                      }}
                      InputLabelProps={{ sx: { fontFamily: 'Vazirmatn, sans-serif' } }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="ایمیل"
                      value={generalSettings.email}
                      onChange={handleGeneralChange('email')}
                      InputProps={{
                        startAdornment: <InputAdornment position="start"><Email /></InputAdornment>,
                        sx: { fontFamily: 'Vazirmatn, sans-serif' }
                      }}
                      InputLabelProps={{ sx: { fontFamily: 'Vazirmatn, sans-serif' } }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="آدرس"
                      value={generalSettings.address}
                      onChange={handleGeneralChange('address')}
                      multiline
                      rows={2}
                      InputProps={{
                        startAdornment: <InputAdornment position="start"><LocationOn /></InputAdornment>,
                        sx: { fontFamily: 'Vazirmatn, sans-serif' }
                      }}
                      InputLabelProps={{ sx: { fontFamily: 'Vazirmatn, sans-serif' } }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="وب‌سایت"
                      value={generalSettings.website}
                      onChange={handleGeneralChange('website')}
                      InputLabelProps={{ sx: { fontFamily: 'Vazirmatn, sans-serif' } }}
                      InputProps={{ sx: { fontFamily: 'Vazirmatn, sans-serif' } }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: '#d4af37', fontFamily: 'Vazirmatn, sans-serif' }}>
                  تنظیمات سیستم
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>واحد پول</InputLabel>
                      <Select
                        value={generalSettings.currency}
                        onChange={handleGeneralChange('currency')}
                        label="واحد پول"
                        sx={{ fontFamily: 'Vazirmatn, sans-serif' }}
                      >
                        <MenuItem value="IRR" sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>ریال ایران</MenuItem>
                        <MenuItem value="USD" sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>دلار آمریکا</MenuItem>
                        <MenuItem value="EUR" sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>یورو</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>زبان</InputLabel>
                      <Select
                        value={generalSettings.language}
                        onChange={handleGeneralChange('language')}
                        label="زبان"
                        sx={{ fontFamily: 'Vazirmatn, sans-serif' }}
                      >
                        <MenuItem value="fa" sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>فارسی</MenuItem>
                        <MenuItem value="en" sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>English</MenuItem>
                        <MenuItem value="ar" sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>العربية</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>منطقه زمانی</InputLabel>
                      <Select
                        value={generalSettings.timezone}
                        onChange={handleGeneralChange('timezone')}
                        label="منطقه زمانی"
                        sx={{ fontFamily: 'Vazirmatn, sans-serif' }}
                      >
                        <MenuItem value="Asia/Tehran" sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>تهران (UTC+3:30)</MenuItem>
                        <MenuItem value="UTC" sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>UTC</MenuItem>
                        <MenuItem value="America/New_York" sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>نیویورک (UTC-5)</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Business Settings */}
      <TabPanel value={activeTab} index={1}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: '#d4af37', fontFamily: 'Vazirmatn, sans-serif' }}>
                  تنظیمات مالی
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="نرخ مالیات (%)"
                      value={businessSettings.taxRate}
                      onChange={handleBusinessChange('taxRate')}
                      type="number"
                      InputProps={{
                        endAdornment: <InputAdornment position="end">%</InputAdornment>,
                        sx: { fontFamily: 'Vazirmatn, sans-serif' }
                      }}
                      InputLabelProps={{ sx: { fontFamily: 'Vazirmatn, sans-serif' } }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="حداکثر تخفیف (%)"
                      value={businessSettings.maxDiscount}
                      onChange={handleBusinessChange('maxDiscount')}
                      type="number"
                      disabled={!businessSettings.discountEnabled}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">%</InputAdornment>,
                        sx: { fontFamily: 'Vazirmatn, sans-serif' }
                      }}
                      InputLabelProps={{ sx: { fontFamily: 'Vazirmatn, sans-serif' } }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={businessSettings.discountEnabled}
                          onChange={handleBusinessChange('discountEnabled')}
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
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: '#d4af37', fontFamily: 'Vazirmatn, sans-serif' }}>
                  تنظیمات موجودی
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="آستانه کم موجودی"
                      value={businessSettings.lowStockThreshold}
                      onChange={handleBusinessChange('lowStockThreshold')}
                      type="number"
                      InputProps={{
                        endAdornment: <InputAdornment position="end">عدد</InputAdornment>,
                        sx: { fontFamily: 'Vazirmatn, sans-serif' }
                      }}
                      InputLabelProps={{ sx: { fontFamily: 'Vazirmatn, sans-serif' } }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>فرکانس پشتیبان‌گیری</InputLabel>
                      <Select
                        value={businessSettings.backupFrequency}
                        onChange={handleBusinessChange('backupFrequency')}
                        label="فرکانس پشتیبان‌گیری"
                        disabled={!businessSettings.autoBackup}
                        sx={{ fontFamily: 'Vazirmatn, sans-serif' }}
                      >
                        <MenuItem value="daily" sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>روزانه</MenuItem>
                        <MenuItem value="weekly" sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>هفتگی</MenuItem>
                        <MenuItem value="monthly" sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>ماهانه</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={businessSettings.autoBackup}
                          onChange={handleBusinessChange('autoBackup')}
                        />
                      }
                      label="پشتیبان‌گیری خودکار"
                      sx={{ '& .MuiFormControlLabel-label': { fontFamily: 'Vazirmatn, sans-serif' } }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: '#d4af37', fontFamily: 'Vazirmatn, sans-serif' }}>
                  تنظیمات اعلان‌ها
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={businessSettings.notificationsEnabled}
                          onChange={handleBusinessChange('notificationsEnabled')}
                        />
                      }
                      label="فعال‌سازی اعلان‌ها"
                      sx={{ '& .MuiFormControlLabel-label': { fontFamily: 'Vazirmatn, sans-serif' } }}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={businessSettings.emailNotifications}
                          onChange={handleBusinessChange('emailNotifications')}
                          disabled={!businessSettings.notificationsEnabled}
                        />
                      }
                      label="اعلان‌های ایمیل"
                      sx={{ '& .MuiFormControlLabel-label': { fontFamily: 'Vazirmatn, sans-serif' } }}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={businessSettings.smsNotifications}
                          onChange={handleBusinessChange('smsNotifications')}
                          disabled={!businessSettings.notificationsEnabled}
                        />
                      }
                      label="اعلان‌های پیامک"
                      sx={{ '& .MuiFormControlLabel-label': { fontFamily: 'Vazirmatn, sans-serif' } }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Appearance Settings */}
      <TabPanel value={activeTab} index={2}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: '#d4af37', fontFamily: 'Vazirmatn, sans-serif' }}>
                  تم و رنگ‌ها
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>تم</InputLabel>
                      <Select
                        value={appearanceSettings.theme}
                        onChange={handleAppearanceChange('theme')}
                        label="تم"
                        sx={{ fontFamily: 'Vazirmatn, sans-serif' }}
                      >
                        <MenuItem value="light" sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>روشن</MenuItem>
                        <MenuItem value="dark" sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>تیره</MenuItem>
                        <MenuItem value="auto" sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>خودکار</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="رنگ اصلی"
                      value={appearanceSettings.primaryColor}
                      onChange={handleAppearanceChange('primaryColor')}
                      type="color"
                      InputLabelProps={{ sx: { fontFamily: 'Vazirmatn, sans-serif' } }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="رنگ ثانویه"
                      value={appearanceSettings.secondaryColor}
                      onChange={handleAppearanceChange('secondaryColor')}
                      type="color"
                      InputLabelProps={{ sx: { fontFamily: 'Vazirmatn, sans-serif' } }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>اندازه فونت</InputLabel>
                      <Select
                        value={appearanceSettings.fontSize}
                        onChange={handleAppearanceChange('fontSize')}
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
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: '#d4af37', fontFamily: 'Vazirmatn, sans-serif' }}>
                  تنظیمات نمایش
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={appearanceSettings.rtlEnabled}
                          onChange={handleAppearanceChange('rtlEnabled')}
                        />
                      }
                      label="فعال‌سازی RTL"
                      sx={{ '& .MuiFormControlLabel-label': { fontFamily: 'Vazirmatn, sans-serif' } }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={appearanceSettings.compactMode}
                          onChange={handleAppearanceChange('compactMode')}
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

      {/* Security Settings */}
      <TabPanel value={activeTab} index={3}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: '#d4af37', fontFamily: 'Vazirmatn, sans-serif' }}>
                  تنظیمات جلسه
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="مدت زمان جلسه (دقیقه)"
                      value={securitySettings.sessionTimeout}
                      onChange={handleSecurityChange('sessionTimeout')}
                      type="number"
                      InputProps={{
                        endAdornment: <InputAdornment position="end">دقیقه</InputAdornment>,
                        sx: { fontFamily: 'Vazirmatn, sans-serif' }
                      }}
                      InputLabelProps={{ sx: { fontFamily: 'Vazirmatn, sans-serif' } }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="انقضای رمز عبور (روز)"
                      value={securitySettings.passwordExpiry}
                      onChange={handleSecurityChange('passwordExpiry')}
                      type="number"
                      InputProps={{
                        endAdornment: <InputAdornment position="end">روز</InputAdornment>,
                        sx: { fontFamily: 'Vazirmatn, sans-serif' }
                      }}
                      InputLabelProps={{ sx: { fontFamily: 'Vazirmatn, sans-serif' } }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="تعداد تلاش ورود"
                      value={securitySettings.loginAttempts}
                      onChange={handleSecurityChange('loginAttempts')}
                      type="number"
                      InputLabelProps={{ sx: { fontFamily: 'Vazirmatn, sans-serif' } }}
                      InputProps={{ sx: { fontFamily: 'Vazirmatn, sans-serif' } }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: '#d4af37', fontFamily: 'Vazirmatn, sans-serif' }}>
                  امنیت پیشرفته
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={securitySettings.twoFactorAuth}
                          onChange={handleSecurityChange('twoFactorAuth')}
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
                          checked={securitySettings.autoLock}
                          onChange={handleSecurityChange('autoLock')}
                        />
                      }
                      label="قفل خودکار"
                      sx={{ '& .MuiFormControlLabel-label': { fontFamily: 'Vazirmatn, sans-serif' } }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={securitySettings.auditLog}
                          onChange={handleSecurityChange('auditLog')}
                        />
                      }
                      label="ثبت فعالیت‌ها"
                      sx={{ '& .MuiFormControlLabel-label': { fontFamily: 'Vazirmatn, sans-serif' } }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Backup Settings */}
      <TabPanel value={activeTab} index={4}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: '#d4af37', fontFamily: 'Vazirmatn, sans-serif' }}>
                  مدیریت پشتیبان‌گیری
                </Typography>
                
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <Backup />
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
                        onClick={() => setBackupDialogOpen(true)}
                        sx={{ 
                          backgroundColor: '#d4af37', 
                          '&:hover': { backgroundColor: '#b8941f' },
                          fontFamily: 'Vazirmatn, sans-serif'
                        }}
                      >
                        ایجاد پشتیبان
                      </Button>
                    </ListItemSecondaryAction>
                  </ListItem>
                  
                  <Divider />
                  
                  <ListItem>
                    <ListItemIcon>
                      <Restore />
                    </ListItemIcon>
                    <ListItemText
                      primary="بازیابی پشتیبان"
                      secondary="بازیابی داده‌ها از نسخه پشتیبان"
                      primaryTypographyProps={{ sx: { fontFamily: 'Vazirmatn, sans-serif' } }}
                      secondaryTypographyProps={{ sx: { fontFamily: 'Vazirmatn, sans-serif' } }}
                    />
                    <ListItemSecondaryAction>
                      <Button
                        variant="outlined"
                        onClick={handleRestore}
                        disabled={localLoading}
                        sx={{ fontFamily: 'Vazirmatn, sans-serif' }}
                      >
                        بازیابی
                      </Button>
                    </ListItemSecondaryAction>
                  </ListItem>
                  
                  <Divider />
                  
                  <ListItem>
                    <ListItemIcon>
                      <Delete />
                    </ListItemIcon>
                    <ListItemText
                      primary="حذف پشتیبان‌های قدیمی"
                      secondary="حذف نسخه‌های پشتیبان قدیمی‌تر از 30 روز"
                      primaryTypographyProps={{ sx: { fontFamily: 'Vazirmatn, sans-serif' } }}
                      secondaryTypographyProps={{ sx: { fontFamily: 'Vazirmatn, sans-serif' } }}
                    />
                    <ListItemSecondaryAction>
                      <Button
                        variant="outlined"
                        color="error"
                        sx={{ fontFamily: 'Vazirmatn, sans-serif' }}
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
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: '#d4af37', fontFamily: 'Vazirmatn, sans-serif' }}>
                  وضعیت پشتیبان‌گیری
                </Typography>
                
                <Box sx={{ textAlign: 'center', py: 2 }}>
                  <CheckCircle sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
                  <Typography variant="h6" gutterBottom sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>
                    آخرین پشتیبان
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>
                    2 ساعت پیش
                  </Typography>
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="body2" color="textSecondary" gutterBottom sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>
                  اندازه فایل: 15.2 MB
                </Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>
                  تعداد رکوردها: 1,234
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>
                  وضعیت: موفق
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Backup Dialog */}
      <Dialog open={backupDialogOpen} onClose={() => setBackupDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>ایجاد پشتیبان</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>
            آیا از ایجاد نسخه پشتیبان از تمام داده‌ها اطمینان دارید؟
          </Typography>
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>
              این عملیات ممکن است چند دقیقه طول بکشد.
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBackupDialogOpen(false)} sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>انصراف</Button>
          <Button 
            onClick={handleBackup} 
            variant="contained"
            disabled={localLoading}
            sx={{ 
              backgroundColor: '#d4af37', 
              '&:hover': { backgroundColor: '#b8941f' },
              fontFamily: 'Vazirmatn, sans-serif'
            }}
          >
            {localLoading ? 'در حال ایجاد...' : 'ایجاد پشتیبان'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Settings;