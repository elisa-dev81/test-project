import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Grid,
  Paper,
  Divider,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Button,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Calculate,
  TrendingUp,
  Info,
  Refresh,
  Diamond,
  Build,
  MonetizationOn,
  Assessment,
} from '@mui/icons-material';
import priceApiService from '../../services/priceApi';

const GoldCalculator = () => {
  // States for inputs
  const [weight, setWeight] = useState('');
  const [goldPrice, setGoldPrice] = useState('');
  const [craftingCost, setCraftingCost] = useState('200000');
  const [profitPercent, setProfitPercent] = useState('7');
  const [vatPercent, setVatPercent] = useState('9');
  const [mithqalPrice, setMithqalPrice] = useState('');
  
  // Calculation results
  const [calculation, setCalculation] = useState(null);
  
  // Loading states
  const [loadingPrice, setLoadingPrice] = useState(false);

  // Fetch current gold price
  const fetchCurrentGoldPrice = async () => {
    setLoadingPrice(true);
    try {
      const prices = await priceApiService.getAllPrices();
      if (prices.iranian?.gold_gram?.gold_18k?.price) {
        const pricePerGram = prices.iranian.gold_gram.gold_18k.price;
        setGoldPrice(pricePerGram.toString());
      }
    } catch (error) {
      console.error('Error fetching gold price:', error);
    } finally {
      setLoadingPrice(false);
    }
  };

  // Calculate price from mithqal
  const calculateFromMithqal = () => {
    if (mithqalPrice) {
      const pricePerGram = parseFloat(mithqalPrice) / 4.3318;
      setGoldPrice(Math.round(pricePerGram).toString());
    }
  };

  // Calculate final price
  const calculateFinalPrice = () => {
    const weightNum = parseFloat(weight);
    const goldPriceNum = parseFloat(goldPrice);
    const craftingCostNum = parseFloat(craftingCost);
    const profitPercentNum = parseFloat(profitPercent) / 100;
    const vatPercentNum = parseFloat(vatPercent) / 100;

    if (!weightNum || !goldPriceNum) {
      setCalculation(null);
      return;
    }

    // محاسبه بر اساس فرمول
    const baseGoldCost = goldPriceNum * weightNum;
    const totalCraftingCost = craftingCostNum * weightNum;
    const subtotal = baseGoldCost + totalCraftingCost;
    const withProfit = subtotal * (1 + profitPercentNum);
    const finalPrice = withProfit * (1 + vatPercentNum);

    const result = {
      weight: weightNum,
      goldPricePerGram: goldPriceNum,
      baseGoldCost,
      craftingCostPerGram: craftingCostNum,
      totalCraftingCost,
      subtotal,
      profitAmount: withProfit - subtotal,
      withProfit,
      vatAmount: finalPrice - withProfit,
      finalPrice,
      profitPercent: profitPercentNum * 100,
      vatPercent: vatPercentNum * 100,
    };

    setCalculation(result);
  };

  // Auto calculate when inputs change
  useEffect(() => {
    calculateFinalPrice();
  }, [weight, goldPrice, craftingCost, profitPercent, vatPercent]);

  // Format number for display
  const formatNumber = (num) => {
    return new Intl.NumberFormat('fa-IR').format(Math.round(num));
  };

  const ResultRow = ({ label, value, isTotal = false, color = 'text.primary' }) => (
    <Box 
      sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        py: isTotal ? 2 : 1,
        borderTop: isTotal ? '2px solid' : 'none',
        borderColor: isTotal ? 'primary.main' : 'transparent',
        backgroundColor: isTotal ? 'primary.light' : 'transparent',
        px: isTotal ? 2 : 0,
        borderRadius: isTotal ? 2 : 0,
        mb: isTotal ? 1 : 0,
      }}
    >
      <Typography 
        variant={isTotal ? "h6" : "body2"} 
        sx={{ 
          fontFamily: 'Vazirmatn, sans-serif',
          fontWeight: isTotal ? 700 : 500,
          color: color,
        }}
      >
        {label}
      </Typography>
      <Typography 
        variant={isTotal ? "h6" : "body2"} 
        sx={{ 
          fontFamily: 'Vazirmatn, sans-serif',
          fontWeight: isTotal ? 700 : 600,
          color: color,
        }}
      >
        {formatNumber(value)} تومان
      </Typography>
    </Box>
  );

  return (
    <Box sx={{ p: 4 }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography 
          variant="h4" 
          sx={{ 
            fontFamily: 'Vazirmatn, sans-serif', 
            fontWeight: 800, 
            color: '#d35400',
            mb: 2,
          }}
        >
          محاسبه‌گر قیمت طلا
        </Typography>
        <Typography 
          variant="h6" 
          sx={{ 
            fontFamily: 'Vazirmatn, sans-serif',
            color: 'text.secondary',
            fontWeight: 400,
          }}
        >
          محاسبه دقیق قیمت نهایی طلای ساخته شده
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Input Section */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ height: 'fit-content' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontFamily: 'Vazirmatn, sans-serif',
                  fontWeight: 700,
                  color: '#d35400',
                  mb: 3,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <Calculate />
                اطلاعات محاسبه
              </Typography>

              <Grid container spacing={3}>
                {/* Weight Input */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="وزن طلا"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    type="number"
                    InputProps={{
                      endAdornment: <InputAdornment position="end">گرم</InputAdornment>,
                      sx: { fontFamily: 'Vazirmatn, sans-serif' }
                    }}
                    InputLabelProps={{ sx: { fontFamily: 'Vazirmatn, sans-serif' } }}
                    placeholder="مثال: 10"
                  />
                </Grid>

                {/* Current Gold Price Section */}
                <Grid item xs={12}>
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <Diamond sx={{ color: '#f39c12' }} />
                      <Typography 
                        variant="subtitle1" 
                        sx={{ fontFamily: 'Vazirmatn, sans-serif', fontWeight: 600 }}
                      >
                        قیمت طلای 18 عیار
                      </Typography>
                      <Tooltip title="دریافت قیمت فعلی از بازار">
                        <IconButton 
                          size="small" 
                          onClick={fetchCurrentGoldPrice}
                          disabled={loadingPrice}
                        >
                          <Refresh sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                    
                    <TextField
                      fullWidth
                      label="قیمت هر گرم طلای 18 عیار"
                      value={goldPrice}
                      onChange={(e) => setGoldPrice(e.target.value)}
                      type="number"
                      InputProps={{
                        endAdornment: <InputAdornment position="end">تومان</InputAdornment>,
                        sx: { fontFamily: 'Vazirmatn, sans-serif' }
                      }}
                      InputLabelProps={{ sx: { fontFamily: 'Vazirmatn, sans-serif' } }}
                      placeholder="مثال: 2500000"
                    />
                  </Box>

                  {/* Mithqal to Gram Converter */}
                  <Paper sx={{ p: 2, backgroundColor: '#f8f9fa', border: '1px solid #e9ecef' }}>
                    <Typography 
                      variant="caption" 
                      sx={{ fontFamily: 'Vazirmatn, sans-serif', fontWeight: 600, color: '#6c757d' }}
                    >
                      تبدیل از مظنه (مثقال 17 عیار):
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                      <TextField
                        size="small"
                        label="مظنه (تومان)"
                        value={mithqalPrice}
                        onChange={(e) => setMithqalPrice(e.target.value)}
                        type="number"
                        InputLabelProps={{ sx: { fontFamily: 'Vazirmatn, sans-serif' } }}
                        sx={{ flex: 1 }}
                      />
                      <Button 
                        variant="outlined" 
                        size="small"
                        onClick={calculateFromMithqal}
                        sx={{ fontFamily: 'Vazirmatn, sans-serif' }}
                      >
                        تبدیل
                      </Button>
                    </Box>
                  </Paper>
                </Grid>

                {/* Crafting Cost */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="اجرت ساخت (هر گرم)"
                    value={craftingCost}
                    onChange={(e) => setCraftingCost(e.target.value)}
                    type="number"
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><Build /></InputAdornment>,
                      endAdornment: <InputAdornment position="end">تومان</InputAdornment>,
                      sx: { fontFamily: 'Vazirmatn, sans-serif' }
                    }}
                    InputLabelProps={{ sx: { fontFamily: 'Vazirmatn, sans-serif' } }}
                  />
                </Grid>

                {/* Profit Percentage */}
                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <InputLabel sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>درصد سود</InputLabel>
                    <Select
                      value={profitPercent}
                      onChange={(e) => setProfitPercent(e.target.value)}
                      label="درصد سود"
                      sx={{ fontFamily: 'Vazirmatn, sans-serif' }}
                    >
                      {[0, 1, 2, 3, 4, 5, 6, 7].map(percent => (
                        <MenuItem key={percent} value={percent} sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>
                          {percent}%
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* VAT Percentage */}
                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <InputLabel sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>مالیات ارزش افزوده</InputLabel>
                    <Select
                      value={vatPercent}
                      onChange={(e) => setVatPercent(e.target.value)}
                      label="مالیات ارزش افزوده"
                      sx={{ fontFamily: 'Vazirmatn, sans-serif' }}
                    >
                      <MenuItem value="0" sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>0%</MenuItem>
                      <MenuItem value="9" sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>9%</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              {/* Formula Info */}
              <Alert 
                severity="info" 
                sx={{ mt: 3, fontFamily: 'Vazirmatn, sans-serif' }}
                icon={<Info />}
              >
                <Typography variant="body2" sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>
                  <strong>فرمول محاسبه:</strong><br />
                  قیمت نهایی = (قیمت خام طلا + اجرت ساخت) × (1 + درصد سود) × (1 + مالیات ارزش افزوده)
                </Typography>
              </Alert>
            </CardContent>
          </Card>
        </Grid>

        {/* Results Section */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ height: 'fit-content' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontFamily: 'Vazirmatn, sans-serif',
                  fontWeight: 700,
                  color: '#27ae60',
                  mb: 3,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <Assessment />
                نتایج محاسبه
              </Typography>

              {calculation ? (
                <Box>
                  {/* Breakdown */}
                  <Paper sx={{ p: 3, mb: 3, backgroundColor: '#f8f9fa' }}>
                    <ResultRow 
                      label="قیمت خام طلا" 
                      value={calculation.baseGoldCost}
                    />
                    <ResultRow 
                      label="اجرت ساخت کل" 
                      value={calculation.totalCraftingCost}
                    />
                    <Divider sx={{ my: 1 }} />
                    <ResultRow 
                      label="جمع (خام + اجرت)" 
                      value={calculation.subtotal}
                    />
                    <ResultRow 
                      label={`سود طلافروش (${calculation.profitPercent}%)`}
                      value={calculation.profitAmount}
                      color="info.main"
                    />
                    <ResultRow 
                      label="مبلغ با سود" 
                      value={calculation.withProfit}
                    />
                    <ResultRow 
                      label={`مالیات ارزش افزوده (${calculation.vatPercent}%)`}
                      value={calculation.vatAmount}
                      color="warning.main"
                    />
                  </Paper>

                  {/* Final Result */}
                  <Paper 
                    sx={{ 
                      p: 3, 
                      background: 'linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)',
                      color: 'white',
                      textAlign: 'center',
                    }}
                  >
                    <Typography 
                      variant="h6" 
                      sx={{ fontFamily: 'Vazirmatn, sans-serif', mb: 1 }}
                    >
                      قیمت نهایی
                    </Typography>
                    <Typography 
                      variant="h4" 
                      sx={{ fontFamily: 'Vazirmatn, sans-serif', fontWeight: 800 }}
                    >
                      {formatNumber(calculation.finalPrice)} تومان
                    </Typography>
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 1 }}>
                      <Chip 
                        label={`${calculation.weight} گرم`}
                        sx={{ color: 'white', borderColor: 'white' }}
                        variant="outlined"
                      />
                      <Chip 
                        label={`${formatNumber(calculation.finalPrice / calculation.weight)} تومان/گرم`}
                        sx={{ color: 'white', borderColor: 'white' }}
                        variant="outlined"
                      />
                    </Box>
                  </Paper>
                </Box>
              ) : (
                <Paper 
                  sx={{ 
                    p: 4, 
                    textAlign: 'center',
                    backgroundColor: '#f8f9fa',
                    border: '2px dashed #dee2e6',
                  }}
                >
                  <Calculate sx={{ fontSize: 48, color: '#6c757d', mb: 2 }} />
                  <Typography 
                    variant="h6" 
                    sx={{ fontFamily: 'Vazirmatn, sans-serif', color: '#6c757d' }}
                  >
                    وزن و قیمت طلا را وارد کنید
                  </Typography>
                </Paper>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default GoldCalculator;