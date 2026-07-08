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
import { fetchProducts, selectTotalProductsValue } from '../../store/slices/productSlice';
import goldPriceService from '../../services/goldPriceApi';
import priceApiService from '../../services/priceApi';
import { formatCardNumber, formatPrice, formatWeight } from '../../utils/persianNumbers';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { products } = useSelector((state) => state.products);
  const { categories } = useSelector((state) => state.categories);
  const { inventory, lowStockItems, outOfStockItems } = useSelector((state) => state.inventory);
  const totalProductsValue = useSelector(selectTotalProductsValue);
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

  // محاسبه قیمت محصول بر اساس وزن و عیار (بدون اجرت ساخت)
  const calculateProductPrice = (weight, purity) => {
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
    
    // قیمت بدون اجرت ساخت برگردانده می‌شود
    return basePrice;
  };





  // محاسبه آمار از داده‌های موجود
  const stats = {
    totalProducts: products?.length || 0,
    totalCategories: categories?.length || 0,
    totalValue: totalProductsValue, // استفاده از Redux selector برای محاسبه قیمت کل محصولات
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
    <Card sx={{ 
      height: '100%', 
      position: 'relative',
      backgroundColor: '#ffffff',
      borderRadius: 4,
      boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
      border: '1px solid #f1f5f9',
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
      }
    }}>
      {loading && (
        <LinearProgress 
          sx={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0,
            borderRadius: '16px 16px 0 0',
            height: 3
          }} 
        />
      )}
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography 
            color="textSecondary" 
            variant="body2" 
            sx={{ 
              fontWeight: 500,
              fontSize: '0.875rem',
            }}
          >
            {title}
          </Typography>
          {trend && (
            <Chip
              icon={trend > 0 ? <TrendingUp sx={{ fontSize: 16 }} /> : <TrendingDown sx={{ fontSize: 16 }} />}
              label={`${Math.abs(trend)}%`}
              size="small"
              sx={{
                backgroundColor: trend > 0 ? '#d1fae5' : '#fee2e2',
                color: trend > 0 ? '#059669' : '#dc2626',
                fontWeight: 600,
                fontSize: '0.75rem',
                height: 24,
              }}
            />
          )}
        </Box>
        
        <Typography 
          variant="h4" 
          component="div" 
          sx={{ 
            fontWeight: 700, 
            color: '#1e293b',
            fontSize: '2rem',
            mb: 0.5
          }}
        >
          {typeof value === 'number' ? formatCardNumber(value) : value}
        </Typography>
        
        {subtitle && (
          <Typography 
            variant="caption" 
            color="textSecondary"
            sx={{ 
              fontWeight: 500,
            }}
          >
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  const QuickActionCard = ({ title, items, color = 'primary', actionButton }) => (
    <Card sx={{ 
      height: '100%',
      backgroundColor: '#ffffff',
      borderRadius: 4,
      boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
      border: '1px solid #f1f5f9',
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
      }
    }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 700,
              color: '#1e293b',
              fontSize: '1.125rem'
            }}
          >
            {title}
          </Typography>
          {actionButton && actionButton}
        </Box>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {items.map((item, index) => (
            <Box 
              key={index} 
              sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignments: 'center',
                p: 2,
                borderRadius: 2,
                backgroundColor: '#f8fafc',
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: '#f1f5f9',
                }
              }}
            >
              <Typography 
                variant="body2" 
                sx={{ 
                  fontWeight: 500,
                  fontSize: '0.875rem',
                  color: '#64748b'
                }}
              >
                {item.text}
              </Typography>
              <Chip 
                label={item.count} 
                size="small"
                sx={{ 
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  minWidth: 32,
                  height: 24,
                  backgroundColor: item.color === 'success' ? '#d1fae5' : 
                                  item.color === 'warning' ? '#fef3c7' :
                                  item.color === 'error' ? '#fee2e2' : '#dbeafe',
                  color: item.color === 'success' ? '#059669' : 
                         item.color === 'warning' ? '#d97706' :
                         item.color === 'error' ? '#dc2626' : '#2563eb',
                }}
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
    <Box sx={{ p: 3 }}>

      {/* Alerts */}
      {(lowStockItems.length > 0 || outOfStockItems.length > 0) && (
        <Box sx={{ mb: 3 }}>
          {outOfStockItems.length > 0 && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 1,
                borderRadius: 3,
                border: '1px solid #fee2e2',
              }}
            >
              {outOfStockItems.length} محصول موجودی تمام شده دارد
            </Alert>
          )}
          {lowStockItems.length > 0 && (
            <Alert 
              severity="warning"
              sx={{ 
                borderRadius: 3,
                border: '1px solid #fef3c7',
              }}
            >
              {lowStockItems.length} محصول موجودی کم دارد
            </Alert>
          )}
        </Box>
      )}

      <Grid container spacing={3}>
        {/* Summary Cards Row */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="کل محصولات"
            value={stats.totalProducts}
            subtitle="محصول ثبت شده"
            trend={5}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="وزن کل"
            value={formatWeight(stats.totalWeight || 0)}
            subtitle="گرم"
            trend={-2}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="ارزش موجودی"
            value={formatPrice(stats.totalValue)}
            subtitle="تومان"
            trend={8}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="دسته‌بندی‌ها"
            value={stats.totalCategories}
            subtitle="دسته‌بندی فعال"
            trend={3}
          />
        </Grid>

        {/* Quick Action Buttons Row */}
        <Grid item xs={12}>
          <Card sx={{ 
            backgroundColor: '#ffffff',
            borderRadius: 4,
            boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
            border: '1px solid #f1f5f9',
          }}>
            <CardContent sx={{ p: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Add />}
                    sx={{
                      py: 2,
                      borderRadius: 3,
                      borderColor: '#e2e8f0',
                      color: '#64748b',
                      '&:hover': {
                        borderColor: '#d4af37',
                        backgroundColor: '#fff8e1',
                        color: '#d4af37',
                      }
                    }}
                  >
                    افزودن
                  </Button>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<ShoppingCart />}
                    sx={{
                      py: 2,
                      borderRadius: 3,
                      borderColor: '#e2e8f0',
                      color: '#64748b',
                      '&:hover': {
                        borderColor: '#d4af37',
                        backgroundColor: '#fff8e1',
                        color: '#d4af37',
                      }
                    }}
                  >
                    خرید
                  </Button>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Visibility />}
                    sx={{
                      py: 2,
                      borderRadius: 3,
                      borderColor: '#e2e8f0',
                      color: '#64748b',
                      '&:hover': {
                        borderColor: '#d4af37',
                        backgroundColor: '#fff8e1',
                        color: '#d4af37',
                      }
                    }}
                  >
                    مشاهده
                  </Button>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Assessment />}
                    sx={{
                      py: 2,
                      borderRadius: 3,
                      borderColor: '#e2e8f0',
                      color: '#64748b',
                      '&:hover': {
                        borderColor: '#d4af37',
                        backgroundColor: '#fff8e1',
                        color: '#d4af37',
                      }
                    }}
                  >
                    گزارش
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Analysis Cards Row */}
        <Grid item xs={12} md={6}>
          <QuickActionCard
            title="وضعیت موجودی"
            actionButton={
              <Button 
                size="small" 
                sx={{ 
                  color: '#d4af37',
                  fontWeight: 600,
                  '&:hover': { backgroundColor: '#fff8e1' }
                }}
              >
                + افزودن
              </Button>
            }
            items={(() => {
              const getStockStatus = (productCount) => {
                if (productCount === 0) return 'out';
                if (productCount <= 2) return 'low';
                return 'ok';
              };

              const categoryStatuses = categories.map(category => {
                const productCount = products.filter(p => p.category_id === category.id).length;
                return getStockStatus(productCount);
              });

              const lowStockCount = categoryStatuses.filter(status => status === 'low').length;
              const outOfStockCount = categoryStatuses.filter(status => status === 'out').length;
              const goodStockCount = categoryStatuses.filter(status => status === 'ok').length;

              return [
                { text: 'موجودی مناسب', count: goodStockCount, color: 'success' },
                { text: 'موجودی کم', count: lowStockCount, color: 'warning' },
                { text: 'موجودی تمام شده', count: outOfStockCount, color: 'error' },
              ];
            })()}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <QuickActionCard
            title="دسته‌بندی محصولات"
            actionButton={
              <Button 
                size="small" 
                sx={{ 
                  color: '#d4af37',
                  fontWeight: 600,
                  '&:hover': { backgroundColor: '#fff8e1' }
                }}
              >
                مشاهده همه
              </Button>
            }
            items={categories.slice(0, 5).map(category => ({
              text: category.name,
              count: products.filter(p => p.category_id === category.id).length,
              color: 'success'
            }))}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 