import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
  Paper,
  Divider,
  Tooltip,
  Fade,
  Zoom,
  useTheme,
  alpha,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Refresh,
  Schedule,
  MonetizationOn,
  Diamond,
  AccountBalance,
  CurrencyBitcoin,
} from '@mui/icons-material';
import priceApiService from '../../services/priceApi';
import { setPricesSuccess, setPricesLoading, setPricesError } from '../../store/slices/priceSlice';

const PriceBoard = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const [prices, setPrices] = useState({
    metals: null,
    crypto: null,
    iranian: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  const fetchPrices = async () => {
    setLoading(true);
    setError(null);
    dispatch(setPricesLoading(true));
    
    try {
      const allPrices = await priceApiService.getAllPrices();
      setPrices(allPrices);
      setLastUpdate(allPrices.timestamp);
      
      // ذخیره در Redux برای استفاده در کامپوننت‌های دیگر
      dispatch(setPricesSuccess(allPrices));
      
    } catch (err) {
      console.error('Error fetching prices:', err);
      setError('خطا در دریافت قیمت‌ها. لطفاً دوباره تلاش کنید.');
      dispatch(setPricesError(err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const formatPrice = (price, currency = 'USD', unit = '') => {
    if (!price) return 'N/A';
    
    if (currency === 'IRR') {
      return new Intl.NumberFormat('fa-IR').format(price) + ' تومان';
    }
    
    if (unit === 'تومان') {
      return new Intl.NumberFormat('fa-IR').format(price) + ' تومان';
    }
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const formatChange = (change) => {
    if (!change) return null;
    
    const isPositive = change > 0;
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'flex-start' }}>
        {isPositive ? (
          <TrendingUp sx={{ color: 'success.main', fontSize: 20 }} />
        ) : (
          <TrendingDown sx={{ color: 'error.main', fontSize: 20 }} />
        )}
        <Typography
          variant="body2"
          sx={{
            color: isPositive ? 'success.main' : 'error.main',
            fontWeight: 600,
            fontFamily: 'Vazirmatn, sans-serif',
          }}
        >
          {isPositive ? '+' : ''}{Math.abs(change).toFixed(2)}%
        </Typography>
      </Box>
    );
  };

  const PriceCard = ({ 
    title, 
    price, 
    unit, 
    change, 
    icon, 
    cardColor = '#ffffff',
    accentColor = '#d4af37',
    delay = 0,
    extraInfo = null // اطلاعات اضافی برای Alan Chand API
  }) => (
    <Fade in={!loading} style={{ transitionDelay: loading ? '0ms' : `${delay}ms` }}>
      <Card 
        sx={{ 
          height: '100%',
          backgroundColor: cardColor,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 4,
          overflow: 'hidden',
          position: 'relative',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            borderColor: accentColor,
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            backgroundColor: accentColor,
          }
        }}
      >
        <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3 }}>
            <Box sx={{ flex: 1 }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontFamily: 'Vazirmatn, sans-serif', 
                  fontWeight: 600,
                  color: 'text.primary',
                  lineHeight: 1.3,
                }}
              >
                {title}
              </Typography>
            </Box>
            <Box
              sx={{
                backgroundColor: alpha(accentColor, 0.1),
                borderRadius: 2,
                p: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                ml: 2,
              }}
            >
              {React.cloneElement(icon, { 
                sx: { color: accentColor, fontSize: 28 } 
              })}
            </Box>
          </Box>
          
          {/* Price */}
          <Box sx={{ mb: 2, flex: 1 }}>
            <Typography 
              variant="h4" 
              sx={{ 
                fontFamily: 'Vazirmatn, sans-serif', 
                fontWeight: 700, 
                color: accentColor,
                lineHeight: 1.2,
                mb: 1,
              }}
            >
              {price}
            </Typography>
            
            {/* Unit */}
            <Typography 
              variant="body2" 
              sx={{ 
                fontFamily: 'Vazirmatn, sans-serif',
                color: 'text.secondary',
                fontWeight: 400,
              }}
            >
              {unit}
            </Typography>
          </Box>
          
          {/* Change */}
          {change && (
            <Box sx={{ mt: 'auto', pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
              {formatChange(change)}
            </Box>
          )}

          {/* Extra Info for Alan Chand API */}
          {extraInfo && (
            <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
              {extraInfo.bubble && extraInfo.bubble_per && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="caption" sx={{ fontFamily: 'Vazirmatn', color: 'text.secondary' }}>
                    حباب:
                  </Typography>
                  <Chip 
                    label={`${extraInfo.bubble_per.toFixed(1)}%`}
                    size="small"
                    color={extraInfo.bubble_per > 0 ? 'error' : 'success'}
                    sx={{ fontFamily: 'Vazirmatn' }}
                  />
                </Box>
              )}
              {extraInfo.high && extraInfo.low && (
                <Box sx={{ mb: 1 }}>
                  <Typography variant="caption" sx={{ fontFamily: 'Vazirmatn', color: 'text.secondary', display: 'block' }}>
                    بالاترین: {extraInfo.high.toLocaleString('fa-IR')}
                  </Typography>
                  <Typography variant="caption" sx={{ fontFamily: 'Vazirmatn', color: 'text.secondary', display: 'block' }}>
                    پایین‌ترین: {extraInfo.low.toLocaleString('fa-IR')}
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </CardContent>
      </Card>
    </Fade>
  );

  const SectionHeader = ({ title, icon, color = '#2c3e50' }) => (
    <Box sx={{ mb: 4 }}>
      <Paper 
        elevation={0}
        sx={{ 
          p: 3, 
          backgroundColor: alpha(color, 0.05),
          border: `1px solid ${alpha(color, 0.1)}`,
          borderRadius: 3,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              backgroundColor: color,
              borderRadius: 2,
              p: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {React.cloneElement(icon, { sx: { color: 'white', fontSize: 24 } })}
          </Box>
          <Typography 
            variant="h5" 
            sx={{ 
              fontFamily: 'Vazirmatn, sans-serif', 
              fontWeight: 700,
              color: color,
            }}
          >
            {title}
          </Typography>
        </Box>
      </Paper>
    </Box>
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 4 }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ mb: 5 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography 
              variant="h3" 
              sx={{ 
                fontFamily: 'Vazirmatn, sans-serif', 
                fontWeight: 800, 
                color: '#2c3e50',
                mb: 2,
              }}
            >
              تابلوی قیمت‌های لحظه‌ای
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                fontFamily: 'Vazirmatn, sans-serif',
                color: 'text.secondary',
                fontWeight: 400,
              }}
            >
              قیمت طلا، سکه، نقره و ارزهای دیجیتال
            </Typography>
          </Box>

          <Paper 
            elevation={1}
            sx={{ 
              p: 3, 
              borderRadius: 3,
              backgroundColor: '#f8f9fa',
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {lastUpdate && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Schedule sx={{ color: 'text.secondary' }} />
                  <Box>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        fontFamily: 'Vazirmatn, sans-serif',
                        color: 'text.secondary',
                        display: 'block',
                      }}
                    >
                      آخرین به‌روزرسانی
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontFamily: 'Vazirmatn, sans-serif',
                        fontWeight: 600,
                        color: 'text.primary',
                      }}
                    >
                      {lastUpdate.toLocaleTimeString('fa-IR')}
                    </Typography>
                  </Box>
                </Box>
              )}
              
              <Tooltip title="به‌روزرسانی قیمت‌ها">
                <IconButton 
                  onClick={fetchPrices} 
                  disabled={loading}
                  sx={{ 
                    backgroundColor: '#2c3e50',
                    color: 'white',
                    '&:hover': { 
                      backgroundColor: '#34495e',
                    },
                    '&:disabled': {
                      backgroundColor: 'action.disabled',
                      color: 'action.disabled',
                    }
                  }}
                >
                  <Refresh sx={{ 
                    animation: loading ? 'spin 1s linear infinite' : 'none' 
                  }} />
                </IconButton>
              </Tooltip>
            </Box>
          </Paper>
        </Box>

        {/* Error Alert */}
        {error && (
          <Fade in={!!error}>
            <Alert 
              severity="error" 
              sx={{ 
                mb: 4, 
                borderRadius: 3,
                fontFamily: 'Vazirmatn, sans-serif',
                border: '1px solid',
                borderColor: 'error.light',
              }}
              action={
                <IconButton color="inherit" size="small" onClick={fetchPrices}>
                  <Refresh />
                </IconButton>
              }
            >
              {error}
            </Alert>
          </Fade>
        )}

        {/* Loading State */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress size={60} sx={{ color: '#d4af37' }} />
          </Box>
        )}

        {/* Price Sections */}
        {!loading && (
          <Box>
            {/* International Metals from Alan Chand */}
            {prices.iranian?.international && (
              <>
                <SectionHeader 
                  title="بازار جهانی فلزات گرانبها" 
                  icon={<MonetizationOn />}
                  color="#c0392b"
                />
                
                <Grid container spacing={3} sx={{ mb: 6 }}>
                  {prices.iranian.international.gold_ounce && (
                    <Grid item xs={12} sm={6} md={4} lg={3}>
                      <PriceCard
                        title="طلای خام جهانی"
                        price={formatPrice(prices.iranian.international.gold_ounce.price, 'USD')}
                        unit={prices.iranian.international.gold_ounce.unit}
                        change={prices.iranian.international.gold_ounce.change}
                        icon={<Diamond />}
                        accentColor="#f39c12"
                        delay={100}
                      />
                    </Grid>
                  )}

                  {prices.iranian.international.silver_ounce && (
                    <Grid item xs={12} sm={6} md={4} lg={3}>
                      <PriceCard
                        title="نقره خام جهانی"
                        price={formatPrice(prices.iranian.international.silver_ounce.price, 'USD')}
                        unit={prices.iranian.international.silver_ounce.unit}
                        change={prices.iranian.international.silver_ounce.change}
                        icon={<Diamond />}
                        accentColor="#95a5a6"
                        delay={200}
                      />
                    </Grid>
                  )}
                </Grid>
              </>
            )}

            {/* Fallback to original metals API if Alan Chand doesn't have international data */}
            {!prices.iranian?.international && prices.metals && (
              <>
                <SectionHeader 
                  title="بازار جهانی فلزات گرانبها" 
                  icon={<MonetizationOn />}
                  color="#c0392b"
                />
                
                <Grid container spacing={3} sx={{ mb: 6 }}>
                  {prices.metals?.gold && (
                    <Grid item xs={12} sm={6} md={4} lg={3}>
                      <PriceCard
                        title="طلای خام جهانی"
                        price={formatPrice(prices.metals.gold.price)}
                        unit={`${prices.metals.gold.unit} / USD`}
                        change={prices.metals.gold.change24h}
                        icon={<Diamond />}
                        accentColor="#f39c12"
                        delay={100}
                      />
                    </Grid>
                  )}

                  {prices.metals?.silver && (
                    <Grid item xs={12} sm={6} md={4} lg={3}>
                      <PriceCard
                        title="نقره خام جهانی"
                        price={formatPrice(prices.metals.silver.price)}
                        unit={`${prices.metals.silver.unit} / USD`}
                        change={prices.metals.silver.change24h}
                        icon={<Diamond />}
                        accentColor="#95a5a6"
                        delay={200}
                      />
                    </Grid>
                  )}
                </Grid>
              </>
            )}

            {/* Cryptocurrencies */}
            <SectionHeader 
              title="ارزهای دیجیتال" 
              icon={<CurrencyBitcoin />}
              color="#8e44ad"
            />
            
            <Grid container spacing={3} sx={{ mb: 6 }}>
              {prices.crypto?.bitcoin && (
                <Grid item xs={12} sm={6} md={4} lg={3}>
                  <PriceCard
                    title="بیت‌کوین"
                    price={formatPrice(prices.crypto.bitcoin.usd)}
                    unit="USD"
                    change={prices.crypto.bitcoin.usd_24h_change}
                    icon={<CurrencyBitcoin />}
                    accentColor="#f39c12"
                    delay={300}
                  />
                </Grid>
              )}

              {prices.crypto?.ethereum && (
                <Grid item xs={12} sm={6} md={4} lg={3}>
                  <PriceCard
                    title="اتریوم"
                    price={formatPrice(prices.crypto.ethereum.usd)}
                    unit="USD"
                    change={prices.crypto.ethereum.usd_24h_change}
                    icon={<AccountBalance />}
                    accentColor="#3498db"
                    delay={400}
                  />
                </Grid>
              )}

              {prices.crypto?.tether && (
                <Grid item xs={12} sm={6} md={4} lg={3}>
                  <PriceCard
                    title="تتر"
                    price={formatPrice(prices.crypto.tether.usd)}
                    unit="USD"
                    change={prices.crypto.tether.usd_24h_change}
                    icon={<AccountBalance />}
                    accentColor="#27ae60"
                    delay={500}
                  />
                </Grid>
              )}
            </Grid>

            {/* Iranian Coins */}
            {prices.iranian?.coins && (
              <>
                <SectionHeader 
                  title="سکه‌های ایرانی" 
                  icon={<MonetizationOn />}
                  color="#d35400"
                />
                
                <Grid container spacing={3} sx={{ mb: 6 }}>
                  <Grid item xs={12} sm={6} md={4} lg={3}>
                    <PriceCard
                      title="سکه بهار آزادی"
                      price={formatPrice(prices.iranian.coins.sekeh_bahar?.price, 'IRR', 'تومان')}
                      unit={prices.iranian.coins.sekeh_bahar?.unit || "تومان"}
                      change={prices.iranian.coins.sekeh_bahar?.change}
                      icon={<MonetizationOn />}
                      accentColor="#e67e22"
                      delay={600}
                      extraInfo={{
                        bubble: prices.iranian.coins.sekeh_bahar?.bubble,
                        bubble_per: prices.iranian.coins.sekeh_bahar?.bubble_per,
                        high: prices.iranian.coins.sekeh_bahar?.high,
                        low: prices.iranian.coins.sekeh_bahar?.low,
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} md={4} lg={3}>
                    <PriceCard
                      title="سکه امامی (طرح جدید)"
                      price={formatPrice(prices.iranian.coins.sekeh_emami?.price, 'IRR', 'تومان')}
                      unit={prices.iranian.coins.sekeh_emami?.unit || "تومان"}
                      change={prices.iranian.coins.sekeh_emami?.change}
                      icon={<MonetizationOn />}
                      accentColor="#e67e22"
                      delay={700}
                      extraInfo={{
                        bubble: prices.iranian.coins.sekeh_emami?.bubble,
                        bubble_per: prices.iranian.coins.sekeh_emami?.bubble_per,
                        high: prices.iranian.coins.sekeh_emami?.high,
                        low: prices.iranian.coins.sekeh_emami?.low,
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} md={4} lg={3}>
                    <PriceCard
                      title="نیم سکه"
                      price={formatPrice(prices.iranian.coins.nim_sekeh?.price, 'IRR', 'تومان')}
                      unit={prices.iranian.coins.nim_sekeh?.unit || "تومان"}
                      change={prices.iranian.coins.nim_sekeh?.change}
                      icon={<MonetizationOn />}
                      accentColor="#d68910"
                      delay={800}
                      extraInfo={{
                        bubble: prices.iranian.coins.nim_sekeh?.bubble,
                        bubble_per: prices.iranian.coins.nim_sekeh?.bubble_per,
                        high: prices.iranian.coins.nim_sekeh?.high,
                        low: prices.iranian.coins.nim_sekeh?.low,
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} md={4} lg={3}>
                    <PriceCard
                      title="ربع سکه"
                      price={formatPrice(prices.iranian.coins.rob_sekeh?.price, 'IRR', 'تومان')}
                      unit={prices.iranian.coins.rob_sekeh?.unit || "تومان"}
                      change={prices.iranian.coins.rob_sekeh?.change}
                      icon={<MonetizationOn />}
                      accentColor="#d68910"
                      delay={900}
                      extraInfo={{
                        bubble: prices.iranian.coins.rob_sekeh?.bubble,
                        bubble_per: prices.iranian.coins.rob_sekeh?.bubble_per,
                        high: prices.iranian.coins.rob_sekeh?.high,
                        low: prices.iranian.coins.rob_sekeh?.low,
                      }}
                    />
                  </Grid>

                  {/* سکه گرمی */}
                  {prices.iranian.coins.sekeh_gerami && (
                    <Grid item xs={12} sm={6} md={4} lg={3}>
                      <PriceCard
                        title="سکه گرمی"
                        price={formatPrice(prices.iranian.coins.sekeh_gerami?.price, 'IRR', 'تومان')}
                        unit={prices.iranian.coins.sekeh_gerami?.unit || "تومان"}
                        change={prices.iranian.coins.sekeh_gerami?.change}
                        icon={<MonetizationOn />}
                        accentColor="#d68910"
                        delay={1000}
                        extraInfo={{
                          bubble: prices.iranian.coins.sekeh_gerami?.bubble,
                          bubble_per: prices.iranian.coins.sekeh_gerami?.bubble_per,
                          high: prices.iranian.coins.sekeh_gerami?.high,
                          low: prices.iranian.coins.sekeh_gerami?.low,
                        }}
                      />
                    </Grid>
                  )}
                </Grid>
              </>
            )}

            {/* Iranian Gold */}
            {prices.iranian?.gold_gram && (
              <>
                <SectionHeader 
                  title="طلای ایرانی" 
                  icon={<Diamond />}
                  color="#16a085"
                />
                
                <Grid container spacing={3} sx={{ mb: 6 }}>
                  <Grid item xs={12} sm={6} md={4} lg={3}>
                    <PriceCard
                      title="طلای 18 عیار"
                      price={formatPrice(prices.iranian.gold_gram.gold_18k?.price, 'IRR', 'تومان')}
                      unit={prices.iranian.gold_gram.gold_18k?.unit || "تومان به ازای هر گرم"}
                      change={prices.iranian.gold_gram.gold_18k?.change}
                      icon={<Diamond />}
                      accentColor="#1abc9c"
                      delay={1100}
                      extraInfo={{
                        bubble: prices.iranian.gold_gram.gold_18k?.bubble,
                        bubble_per: prices.iranian.gold_gram.gold_18k?.bubble_per,
                        high: prices.iranian.gold_gram.gold_18k?.high,
                        low: prices.iranian.gold_gram.gold_18k?.low,
                      }}
                    />
                  </Grid>

                  {/* آبشده (مثقال طلا) */}
                  {prices.iranian.gold_gram.abshodeh && (
                    <Grid item xs={12} sm={6} md={4} lg={3}>
                      <PriceCard
                        title="آبشده (مثقال طلا)"
                        price={formatPrice(prices.iranian.gold_gram.abshodeh?.price, 'IRR', 'تومان')}
                        unit={prices.iranian.gold_gram.abshodeh?.unit || "تومان به ازای مثقال"}
                        change={prices.iranian.gold_gram.abshodeh?.change}
                        icon={<Diamond />}
                        accentColor="#f39c12"
                        delay={1200}
                        extraInfo={{
                          bubble: prices.iranian.gold_gram.abshodeh?.bubble,
                          bubble_per: prices.iranian.gold_gram.abshodeh?.bubble_per,
                          high: prices.iranian.gold_gram.abshodeh?.high,
                          low: prices.iranian.gold_gram.abshodeh?.low,
                        }}
                      />
                    </Grid>
                  )}
                </Grid>
              </>
            )}


          </Box>
        )}

        {/* CSS for animations */}
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </Container>
    </Box>
  );
};

export default PriceBoard;