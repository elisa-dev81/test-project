import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  IconButton,
  Chip,
  LinearProgress,
  Alert,
  Button,
  Divider,
  Avatar,
  ListItem,
  ListItemAvatar,
  ListItemText,
  List,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Inventory,
  Assessment,
  AttachMoney,
  Refresh,
  Warning,
  CheckCircle,
  QrCode,
  Scale,
  Diamond,
  MonetizationOn,
  Category,
  Add,
  Visibility,
  ShoppingCart,
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCategories } from '../../store/slices/categorySlice';
import { fetchProducts } from '../../store/slices/productSlice';
import goldPriceService from '../../services/goldPriceApi';
import priceApiService from '../../services/priceApi';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { products } = useSelector((state) => state.products);
  const { categories } = useSelector((state) => state.categories);
  const { inventory, lowStockItems, outOfStockItems } = useSelector((state) => state.inventory);
  const [currentGoldPrice, setCurrentGoldPrice] = useState(0);
  const [alanChandPrices, setAlanChandPrices] = useState(null);

  // دریافت قیمت طلا از Alan Chand
  const fetchAlanChandPrices = useCallback(async () => {
    console.log('🔄 Fetching Alan Chand prices...');
    try {
      const iranianPrices = await priceApiService.getAlanChandPrices();
      setAlanChandPrices(iranianPrices);
      
      // استفاده از قیمت 18 عیار Alan Chand برای محاسبات
      if (iranianPrices?.gold_gram?.gold_18k?.price) {
        // تبدیل قیمت 18 عیار به 24 عیار
        const gold18Price = iranianPrices.gold_gram.gold_18k.price;
        const gold24Price = gold18Price * (24 / 18); // 7495000 * 1.33 = ~10000000
        setCurrentGoldPrice(gold24Price);
        
        console.log('✅ Alan Chand Prices Updated - Gold 18k:', gold18Price.toLocaleString('fa-IR'), 'تومان');
        console.log('✅ Gold 24k price calculated:', gold24Price.toLocaleString('fa-IR'), 'تومان');
      }
    } catch (error) {
      console.error('خطا در دریافت نرخ Alan Chand:', error);
      // در صورت خطا، از سرویس قدیمی استفاده کن
      fetchGoldPriceFallback();
    }
  }, []);

  useEffect(() => {
    // دریافت دسته‌بندی‌ها از دیتابیس
    if (categories.length === 0) {
      dispatch(fetchCategories());
    }
    // محصولات از App.js بارگذاری می‌شوند، نیازی به بارگذاری مجدد نیست
    
    // دریافت قیمت طلا از Alan Chand
    fetchAlanChandPrices();
    
    // Subscribe to old gold price updates as fallback
    const unsubscribe = goldPriceService.subscribe((priceData) => {
      setCurrentGoldPrice(priceData.gold24k);
    });
    
    return () => {
      unsubscribe();
    };
  }, [dispatch, categories.length, fetchAlanChandPrices]);

  // Fallback: دریافت قیمت طلا از سرویس قدیمی
  const fetchGoldPriceFallback = async () => {
    try {
      const priceData = await goldPriceService.fetchGoldPrice();
      setCurrentGoldPrice(priceData.gold24k);
    } catch (error) {
      console.error('خطا در دریافت نرخ طلا:', error);
      setCurrentGoldPrice(3200000); // fallback price
    }
  };

  // محاسبه قیمت محصول بر اساس وزن و عیار (با استفاده از Alan Chand)
  const calculateProductPrice = (weight, purity, makingWage = 0) => {
    console.log('🧮 Calculating price - weight:', weight, 'purity:', purity, 'currentGoldPrice:', currentGoldPrice);
    let basePrice = 0;
    
    if (purity >= 900) {
      // محاسبه نقره (عیار 925، 950 و غیره)
      const purityFactor = purity / 1000; // تبدیل به درصد صحیح
      basePrice = weight * currentGoldPrice * 0.015 * purityFactor; // نسبت نقره به طلا
    } else {
      // تشخیص نوع عیار
      let adjustedPurity;
      let pricePerGram;
      
      if (purity >= 100) {
        // عیار هزارگان (مثل 750, 585, 916, 999)
        adjustedPurity = (purity / 1000) * 24; // تبدیل به عیار 24گانه
      } else {
        // عیار 24گانه (مثل 18, 21, 22, 24)
        adjustedPurity = purity;
      }
      
      // استفاده از قیمت‌های واقعی Alan Chand اگر در دسترس باشد
      if (alanChandPrices?.gold_gram?.gold_18k?.price && adjustedPurity === 18) {
        // استفاده مستقیم از قیمت 18 عیار Alan Chand
        pricePerGram = alanChandPrices.gold_gram.gold_18k.price;
        console.log('💰 Using Alan Chand 18k price:', pricePerGram.toLocaleString('fa-IR'), 'تومان');
      } else {
        // محاسبه بر اساس نسبت عیار از قیمت 24 عیار
        pricePerGram = currentGoldPrice * (adjustedPurity / 24);
        console.log('📊 Using calculated price:', pricePerGram.toLocaleString('fa-IR'), 'تومان');
      }
      
      basePrice = weight * pricePerGram;
    }
    
    // اضافه کردن اجرت ساخت
    return basePrice + (basePrice * makingWage / 100);
  };

  // محاسبه قیمت کل تمام محصولات
  const calculateTotalProductsValue = () => {
    if (!products || products.length === 0) return 0;
    
    return products.reduce((total, product) => {
      const productPrice = calculateProductPrice(
        parseFloat(product.weight) || 0, 
        parseInt(product.purity) || 18,
        parseFloat(product.making_wage) || 0
      );
      return total + productPrice;
    }, 0);
  };



  // محاسبه آمار از داده‌های موجود
  const stats = {
    totalProducts: products?.length || 0,
    totalCategories: categories?.length || 0,
    totalValue: calculateTotalProductsValue(), // استفاده از محاسبه قیمت کل محصولات
    totalWeight: products?.reduce((sum, item) => sum + (parseFloat(item.weight) || 0), 0) || 0,
    lowStockCount: lowStockItems?.length || 0,
    outOfStockCount: outOfStockItems?.length || 0,
    todaySales: 0,
    todayRevenue: 0,
    productsWithBarcode: products?.filter(p => p.barcode)?.length || 0,
    goldProducts: products?.filter(p => p.type === 'gold')?.length || 0,
    silverProducts: products?.filter(p => p.type === 'silver')?.length || 0,
    coinProducts: products?.filter(p => p.type === 'coin')?.length || 0,
    jewelryProducts: products?.filter(p => p.type === 'jewelry')?.length || 0
  };

  const StatCard = ({ title, value, icon, color, trend, subtitle, loading = false }) => (
    <Card sx={{ height: '100%', position: 'relative' }}>
      <CardContent>
        {loading && (
          <LinearProgress 
            sx={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              right: 0,
              borderRadius: '4px 4px 0 0'
            }} 
          />
        )}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography color="textSecondary" gutterBottom variant="body2" sx={{ fontFamily: 'Vazirmatn' }}>
              {title}
            </Typography>
            <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color, fontFamily: 'Vazirmatn' }}>
              {typeof value === 'number' ? value.toLocaleString('fa-IR') : value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1, fontFamily: 'Vazirmatn' }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              backgroundColor: `${color}20`,
              borderRadius: '50%',
              p: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </Box>
        </Box>
        {trend && (
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
            {trend > 0 ? (
              <TrendingUp sx={{ color: 'success.main', fontSize: 16 }} />
            ) : (
              <TrendingDown sx={{ color: 'error.main', fontSize: 16 }} />
            )}
            <Typography
              variant="body2"
              sx={{
                color: trend > 0 ? 'success.main' : 'error.main',
                ml: 0.5,
              }}
            >
              {Math.abs(trend)}% از ماه گذشته
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  const QuickActionCard = ({ title, items, color = 'primary' }) => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ color: `${color}.main` }}>
          {title}
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {items.map((item, index) => (
            <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2">{item.text}</Typography>
              <Chip 
                label={item.count} 
                color={item.color || color} 
                size="small" 
                variant={item.variant || 'filled'}
              />
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );

  const RecentActivityCard = ({ title, activities }) => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {activities.map((activity, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: activity.color || 'primary.main',
                }}
              />
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="body2">{activity.text}</Typography>
                <Typography variant="caption" color="textSecondary">
                  {activity.time}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', fontFamily: 'Vazirmatn, sans-serif' }}>
          داشبورد
        </Typography>
        <IconButton>
          <Refresh />
        </IconButton>
      </Box>

      {/* Alerts */}
      {(lowStockItems.length > 0 || outOfStockItems.length > 0) && (
        <Box sx={{ mb: 3 }}>
          {outOfStockItems.length > 0 && (
            <Alert severity="error" sx={{ mb: 1 }}>
              {outOfStockItems.length} محصول موجودی تمام شده دارد
            </Alert>
          )}
          {lowStockItems.length > 0 && (
            <Alert severity="warning">
              {lowStockItems.length} محصول موجودی کم دارد
            </Alert>
          )}
        </Box>
      )}

      <Grid container spacing={3}>
        {/* بخش اول: آمار کلی */}
        <Grid item xs={12}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, fontFamily: 'Vazirmatn, sans-serif', color: '#d4af37' }}>
            آمار کلی
          </Typography>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="کل محصولات ثبت شده"
            value={stats.totalProducts}
            icon={<Inventory sx={{ color: '#d4af37' }} />}
            color="#d4af37"
            subtitle="محصول"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="وزن کل محصولات"
            value={`${(stats.totalWeight || 0).toFixed(1)}`}
            subtitle="گرم"
            icon={<Scale sx={{ color: '#8e44ad' }} />}
            color="#8e44ad"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="ارزش کل موجودی"
            value={stats.totalValue >= 1000000 
              ? `${(stats.totalValue / 1000000).toFixed(1)}M` 
              : stats.totalValue.toLocaleString('fa-IR')
            }
            subtitle={stats.totalValue >= 1000000 ? "میلیون تومان" : "تومان"}
            icon={<AttachMoney sx={{ color: '#2c3e50' }} />}
            color="#2c3e50"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="تعداد دسته‌بندی‌ها"
            value={stats.totalCategories}
            icon={<Category sx={{ color: '#3498db' }} />}
            color="#3498db"
            subtitle="دسته‌بندی"
          />
        </Grid>

        {/* بخش دوم: مدیریت موجودی */}
        <Grid item xs={12}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, mt: 3, fontFamily: 'Vazirmatn, sans-serif', color: '#d4af37' }}>
            مدیریت موجودی
          </Typography>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="محصولات کم موجودی"
            value={stats.lowStockCount}
            icon={<Warning sx={{ color: '#f39c12' }} />}
            color="#f39c12"
            subtitle="نیاز به تأمین"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="محصولات تمام شده"
            value={stats.outOfStockCount}
            icon={<Warning sx={{ color: '#e74c3c' }} />}
            color="#e74c3c"
            subtitle="نیاز فوری"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="محصولات با بارکد"
            value={stats.productsWithBarcode}
            icon={<QrCode sx={{ color: '#16a085' }} />}
            color="#16a085"
            subtitle="QR/Barcode"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="فروش امروز"
            value={stats.todaySales}
            icon={<ShoppingCart sx={{ color: '#27ae60' }} />}
            color="#27ae60"
            subtitle={`${(stats.todayRevenue / 1000000).toFixed(1)}M تومان`}
          />
        </Grid>

        {/* بخش سوم: تحلیل محصولات */}
        <Grid item xs={12}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, mt: 3, fontFamily: 'Vazirmatn, sans-serif', color: '#d4af37' }}>
            تحلیل محصولات
          </Typography>
        </Grid>

        <Grid item xs={12} md={3}>
          <QuickActionCard
            title="وضعیت موجودی"
            color="warning"
            items={[
              { text: 'موجودی کم', count: lowStockItems.length, color: 'warning' },
              { text: 'موجودی تمام شده', count: outOfStockItems.length, color: 'error' },
              { text: 'موجودی مناسب', count: stats.totalProducts - lowStockItems.length - outOfStockItems.length, color: 'success' },
            ]}
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <QuickActionCard
            title="انواع محصولات"
            color="primary"
            items={[
              { text: 'طلا', count: stats.goldProducts, color: 'warning' },
              { text: 'نقره', count: stats.silverProducts, color: 'info' },
              { text: 'سکه', count: stats.coinProducts, color: 'secondary' },
              { text: 'جواهرات', count: stats.jewelryProducts, color: 'primary' },
            ]}
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <QuickActionCard
            title="دسته‌بندی محصولات"
            color="info"
            items={[
              { text: 'حلقه', count: products.filter(p => p.subType === 'ring').length },
              { text: 'گردنبند', count: products.filter(p => p.subType === 'necklace').length },
              { text: 'دستبند', count: products.filter(p => p.subType === 'bracelet').length },
              { text: 'گوشواره', count: products.filter(p => p.subType === 'earring').length },
            ]}
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <QuickActionCard
            title="کنترل کیفیت"
            color="success"
            items={[
              { text: 'دارای بارکد', count: stats.productsWithBarcode, color: 'success' },
              { text: 'فاقد بارکد', count: stats.totalProducts - stats.productsWithBarcode, color: 'warning' },
              { text: 'دارای تصویر', count: products.filter(p => p.image).length, color: 'info' },
              { text: 'تکمیل مشخصات', count: products.filter(p => p.weight && p.purity && p.price).length, color: 'primary' },
            ]}
          />
        </Grid>

        {/* بخش چهارم: مدیریت سریع */}
        <Grid item xs={12}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, mt: 3, fontFamily: 'Vazirmatn, sans-serif', color: '#d4af37' }}>
            مدیریت سریع
          </Typography>
        </Grid>

        {/* Quick Actions Panel */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontFamily: 'Vazirmatn, sans-serif' }}>
                عملیات سریع
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button 
                  variant="outlined" 
                  startIcon={<Add />} 
                  fullWidth
                  sx={{ fontFamily: 'Vazirmatn, sans-serif', justifyContent: 'flex-start' }}
                >
                  افزودن محصول جدید
                </Button>
                <Button 
                  variant="outlined" 
                  startIcon={<QrCode />} 
                  fullWidth
                  sx={{ fontFamily: 'Vazirmatn, sans-serif', justifyContent: 'flex-start' }}
                >
                  ایجاد بارکد/QR Code
                </Button>
                <Button 
                  variant="outlined" 
                  startIcon={<Inventory />} 
                  fullWidth
                  sx={{ fontFamily: 'Vazirmatn, sans-serif', justifyContent: 'flex-start' }}
                >
                  بررسی موجودی
                </Button>
                <Button 
                  variant="outlined" 
                  startIcon={<Assessment />} 
                  fullWidth
                  sx={{ fontFamily: 'Vazirmatn, sans-serif', justifyContent: 'flex-start' }}
                >
                  گزارش فروش
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={4}>
          <RecentActivityCard
            title="فعالیت‌های اخیر"
            activities={[
              { text: 'محصول جدید: حلقه طلا 18 عیار (کد: G001)', time: '2 ساعت پیش', color: 'success.main' },
              { text: 'به‌روزرسانی موجودی: گردنبند نقره (وزن: 15.5 گرم)', time: '4 ساعت پیش', color: 'info.main' },
              { text: 'هشدار موجودی کم: دستبند طلا 22 عیار', time: '6 ساعت پیش', color: 'warning.main' },
              { text: 'تولید بارکد برای: سکه طلا نیم بهار', time: '8 ساعت پیش', color: 'primary.main' },
              { text: 'حذف محصول: گوشواره آنتیک قدیمی', time: '1 روز پیش', color: 'error.main' },
            ]}
          />
        </Grid>

        {/* System Status */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>
                وضعیت سیستم
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>اتصال به سرور</Typography>
                  <Chip label="آنلاین" color="success" size="small" icon={<CheckCircle />} sx={{ fontFamily: 'Vazirmatn, sans-serif' }} />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>پشتیبان‌گیری اتوماتیک</Typography>
                  <Chip label="فعال" color="info" size="small" sx={{ fontFamily: 'Vazirmatn, sans-serif' }} />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>به‌روزرسانی قیمت طلا</Typography>
                  <Chip label="30 دقیقه پیش" color="success" size="small" sx={{ fontFamily: 'Vazirmatn, sans-serif' }} />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>کنترل موجودی</Typography>
                  <Chip label="فعال" color="warning" size="small" sx={{ fontFamily: 'Vazirmatn, sans-serif' }} />
                </Box>
                <Divider />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>فضای ذخیره</Typography>
                  <Chip label="75% استفاده شده" color="warning" size="small" sx={{ fontFamily: 'Vazirmatn, sans-serif' }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 