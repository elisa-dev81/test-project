import React, { useState, useEffect } from 'react';
import transactionService from '../../services/transactionService';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  InputAdornment,
  Switch,
  FormControlLabel,
  Tab,
  Tabs,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  LinearProgress,
  Badge,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Add,
  Delete,
  Edit,
  Print,
  PictureAsPdf,
  AccountBalance,
  CreditCard,
  MonetizationOn,
  TrendingUp,
  TrendingDown,
  Receipt,
  Assessment,
  Save,
  Refresh,
  Search,
  FilterList,
  DateRange,
  AttachMoney,
  AccountBalanceWallet,
  Payment,
  SwapVert,
  ExpandMore,
  CheckCircle,
  Warning,
  Error,
  Info,
  Cash,
  CreditScore,
  Visibility,
} from '@mui/icons-material';

const FinanceManagement = () => {
  // State management
  const [activeTab, setActiveTab] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [customers, setCustomers] = useState([
    { id: 1, name: 'احمد محمدی', phone: '09123456789', balance: -2500000 },
    { id: 2, name: 'فاطمه حسینی', phone: '09123456788', balance: 1200000 },
    { id: 3, name: 'علی رضایی', phone: '09123456787', balance: -800000 },
  ]);
  
  const [dailyCash, setDailyCash] = useState({
    opening: 5000000,
    current: 5000000,
    receipts: 0,
    payments: 0,
    closing: 0,
    date: new Date().toISOString().split('T')[0]
  });

  // Load transactions from database
  const [savedSaleInvoices, setSavedSaleInvoices] = useState([]);
  const [savedPurchaseInvoices, setSavedPurchaseInvoices] = useState([]);

  const [newTransaction, setNewTransaction] = useState({
    type: 'receipt', // receipt, payment
    amount: 0,
    description: '',
    paymentMethod: 'cash', // cash, card, check, transfer
    category: 'sales', // sales, purchase, expense, other
    customerId: '',
    customerName: '',
    checkNumber: '',
    bankName: '',
    checkDate: '',
    transferReference: '',
    notes: '',
    date: new Date().toISOString().split('T')[0]
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [reportData, setReportData] = useState({
    totalReceipts: 0,
    totalPayments: 0,
    netProfit: 0,
    salesRevenue: 0,
    expenses: 0,
    cashFlow: 0
  });

  // Calculate cash box balance from invoices
  const calculateCashBoxBalance = () => {
    // Calculate total sales from all sale invoices
    const totalSales = savedSaleInvoices.reduce((sum, invoice) => sum + (invoice.total || 0), 0);
    
    // Calculate total purchases from all purchase invoices
    const totalPurchases = savedPurchaseInvoices.reduce((sum, invoice) => sum + (invoice.total || 0), 0);
    
    // Cash box balance = Sales - Purchases
    const cashBoxBalance = totalSales - totalPurchases;
    
    return {
      totalSales,
      totalPurchases,
      cashBoxBalance
    };
  };

  // Initialize data
  useEffect(() => {
    loadMockData();
    calculateDailyCash();
    generateReports();
  }, []);

  const loadMockData = () => {
    const mockTransactions = [
      {
        id: 1,
        type: 'receipt',
        amount: 3500000,
        description: 'فروش حلقه طلا',
        paymentMethod: 'cash',
        category: 'sales',
        date: '2024-01-15',
        customerName: 'احمد محمدی',
        time: '10:30'
      },
      {
        id: 2,
        type: 'payment',
        amount: 1200000,
        description: 'خرید مواد اولیه',
        paymentMethod: 'transfer',
        category: 'purchase',
        date: '2024-01-15',
        transferReference: 'REF123456',
        time: '14:20'
      },
      {
        id: 3,
        type: 'receipt',
        amount: 2800000,
        description: 'فروش گردنبند',
        paymentMethod: 'card',
        category: 'sales',
        date: '2024-01-15',
        customerName: 'فاطمه حسینی',
        time: '16:45'
      }
    ];
    setTransactions(mockTransactions);
  };

  const calculateDailyCash = () => {
    const todayTransactions = transactions.filter(t => 
      t.date === new Date().toISOString().split('T')[0]
    );
    
    const receipts = todayTransactions
      .filter(t => t.type === 'receipt' && t.paymentMethod === 'cash')
      .reduce((sum, t) => sum + t.amount, 0);
      
    const payments = todayTransactions
      .filter(t => t.type === 'payment' && t.paymentMethod === 'cash')
      .reduce((sum, t) => sum + t.amount, 0);

    setDailyCash(prev => ({
      ...prev,
      receipts,
      payments,
      current: prev.opening + receipts - payments,
      closing: prev.opening + receipts - payments
    }));
  };

  const generateReports = () => {
    let filteredTransactions = transactions;
    
    // Filter by selected period
    const today = new Date();
    if (selectedPeriod === 'today') {
      filteredTransactions = transactions.filter(t => 
        t.date === today.toISOString().split('T')[0]
      );
    } else if (selectedPeriod === 'week') {
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      filteredTransactions = transactions.filter(t => 
        new Date(t.date) >= weekAgo
      );
    } else if (selectedPeriod === 'month') {
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
      filteredTransactions = transactions.filter(t => 
        new Date(t.date) >= monthAgo
      );
    }

    const totalReceipts = filteredTransactions
      .filter(t => t.type === 'receipt')
      .reduce((sum, t) => sum + t.amount, 0);
      
    const totalPayments = filteredTransactions
      .filter(t => t.type === 'payment')
      .reduce((sum, t) => sum + t.amount, 0);
      
    const salesRevenue = filteredTransactions
      .filter(t => t.type === 'receipt' && t.category === 'sales')
      .reduce((sum, t) => sum + t.amount, 0);
      
    const expenses = filteredTransactions
      .filter(t => t.type === 'payment' && (t.category === 'expense' || t.category === 'purchase'))
      .reduce((sum, t) => sum + t.amount, 0);

    setReportData({
      totalReceipts,
      totalPayments,
      netProfit: totalReceipts - totalPayments,
      salesRevenue,
      expenses,
      cashFlow: totalReceipts - totalPayments
    });
  };

  useEffect(() => {
    calculateDailyCash();
    generateReports();
  }, [transactions, selectedPeriod]);

  // Load transactions from database
  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const salesResponse = await transactionService.getSales();
        const purchasesResponse = await transactionService.getPurchases();
        
        setSavedSaleInvoices(salesResponse.data.transactions || []);
        setSavedPurchaseInvoices(purchasesResponse.data.transactions || []);
      } catch (error) {
        console.error('Error loading transactions:', error);
      }
    };

    loadTransactions();
  }, []);

  const handleAddTransaction = () => {
    if (!newTransaction.amount || newTransaction.amount <= 0) {
      alert('لطفاً مبلغ معتبر وارد کنید');
      return;
    }

    const transaction = {
      ...newTransaction,
      id: Date.now(),
      time: new Date().toLocaleTimeString('fa-IR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      amount: parseFloat(newTransaction.amount)
    };

    setTransactions(prev => [transaction, ...prev]);
    
    // Reset form
    setNewTransaction({
      type: 'receipt',
      amount: 0,
      description: '',
      paymentMethod: 'cash',
      category: 'sales',
      customerId: '',
      customerName: '',
      checkNumber: '',
      bankName: '',
      checkDate: '',
      transferReference: '',
      notes: '',
      date: new Date().toISOString().split('T')[0]
    });
    
    setDialogOpen(false);
  };

  const handleDeleteTransaction = (id) => {
    if (window.confirm('آیا از حذف این تراکنش اطمینان دارید؟')) {
      setTransactions(prev => prev.filter(t => t.id !== id));
    }
  };

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'cash': return <MonetizationOn />;
      case 'card': return <CreditCard />;
      case 'check': return <Receipt />;
      case 'transfer': return <AccountBalance />;
      default: return <Payment />;
    }
  };

  const getPaymentMethodColor = (method) => {
    switch (method) {
      case 'cash': return '#27ae60';
      case 'card': return '#3498db';
      case 'check': return '#f39c12';
      case 'transfer': return '#9b59b6';
      default: return '#95a5a6';
    }
  };

  const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index} style={{ paddingTop: 20 }}>
      {value === index && children}
    </div>
  );

  const StatCard = ({ title, value, icon, color, subtitle, trend }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography color="textSecondary" gutterBottom variant="body2" sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>
              {title}
            </Typography>
            <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color, fontFamily: 'Vazirmatn, sans-serif' }}>
              {typeof value === 'number' ? value.toLocaleString('fa-IR') : value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1, fontFamily: 'Vazirmatn, sans-serif' }}>
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
                fontFamily: 'Vazirmatn, sans-serif'
              }}
            >
              {Math.abs(trend)}% از دوره قبل
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', fontFamily: 'Vazirmatn, sans-serif' }}>
          امور مالی
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setDialogOpen(true)}
            sx={{ 
              backgroundColor: '#d4af37',
              '&:hover': { backgroundColor: '#b8941f' },
              fontFamily: 'Vazirmatn, sans-serif'
            }}
          >
            تراکنش جدید
          </Button>
          <IconButton onClick={generateReports} color="primary">
            <Refresh />
          </IconButton>
        </Box>
      </Box>

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="مانده صندوق"
            value={`${(calculateCashBoxBalance().cashBoxBalance / 1000000).toFixed(1)}M`}
            subtitle={`${calculateCashBoxBalance().cashBoxBalance.toLocaleString('fa-IR')} تومان`}
            icon={<AccountBalanceWallet sx={{ color: '#d4af37' }} />}
            color="#d4af37"
            trend={calculateCashBoxBalance().cashBoxBalance >= 0 ? 5 : -5}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="دریافت امروز"
            value={`${(dailyCash.receipts / 1000000).toFixed(1)}M`}
            subtitle="میلیون تومان"
            icon={<TrendingUp sx={{ color: '#27ae60' }} />}
            color="#27ae60"
            trend={12}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="پرداخت امروز"
            value={`${(dailyCash.payments / 1000000).toFixed(1)}M`}
            subtitle="میلیون تومان"
            icon={<TrendingDown sx={{ color: '#e74c3c' }} />}
            color="#e74c3c"
            trend={-8}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="سود خالص"
            value={`${(reportData.netProfit / 1000000).toFixed(1)}M`}
            subtitle="میلیون تومان"
            icon={<Assessment sx={{ color: '#3498db' }} />}
            color="#3498db"
            trend={15}
          />
        </Grid>
      </Grid>

      {/* Invoice Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="مجموع فاکتورهای فروش"
            value={`${(calculateCashBoxBalance().totalSales / 1000000).toFixed(1)}M`}
            subtitle={`${calculateCashBoxBalance().totalSales.toLocaleString('fa-IR')} تومان`}
            icon={<TrendingUp sx={{ color: '#27ae60' }} />}
            color="#27ae60"
            trend={10}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="مجموع فاکتورهای خرید"
            value={`${(calculateCashBoxBalance().totalPurchases / 1000000).toFixed(1)}M`}
            subtitle={`${calculateCashBoxBalance().totalPurchases.toLocaleString('fa-IR')} تومان`}
            icon={<TrendingDown sx={{ color: '#e74c3c' }} />}
            color="#e74c3c"
            trend={-8}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="تعداد فاکتورها"
            value={`${savedSaleInvoices.length + savedPurchaseInvoices.length}`}
            subtitle={`فروش: ${savedSaleInvoices.length} | خرید: ${savedPurchaseInvoices.length}`}
            icon={<Receipt sx={{ color: '#9b59b6' }} />}
            color="#9b59b6"
            trend={5}
          />
        </Grid>
      </Grid>

      {/* Tabs */}
      <Card sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab icon={<SwapVert />} label="تراکنش‌ها" sx={{ fontFamily: 'Vazirmatn, sans-serif' }} />
          <Tab icon={<AccountBalanceWallet />} label="صندوق روزانه" sx={{ fontFamily: 'Vazirmatn, sans-serif' }} />
          <Tab icon={<Assessment />} label="گزارشات مالی" sx={{ fontFamily: 'Vazirmatn, sans-serif' }} />
          <Tab icon={<CreditScore />} label="بدهی مشتریان" sx={{ fontFamily: 'Vazirmatn, sans-serif' }} />
        </Tabs>
      </Card>

      {/* Transactions Tab */}
      <TabPanel value={activeTab} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>
                    تراکنش‌های اخیر
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <FormControl size="small">
                      <InputLabel sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>دوره</InputLabel>
                      <Select
                        value={selectedPeriod}
                        onChange={(e) => setSelectedPeriod(e.target.value)}
                        label="دوره"
                        sx={{ fontFamily: 'Vazirmatn, sans-serif', minWidth: 120 }}
                      >
                        <MenuItem value="today" sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>امروز</MenuItem>
                        <MenuItem value="week" sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>این هفته</MenuItem>
                        <MenuItem value="month" sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>این ماه</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                </Box>
                
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif', fontWeight: 'bold' }}>تاریخ/ساعت</TableCell>
                        <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif', fontWeight: 'bold' }}>نوع</TableCell>
                        <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif', fontWeight: 'bold' }}>مبلغ</TableCell>
                        <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif', fontWeight: 'bold' }}>روش پرداخت</TableCell>
                        <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif', fontWeight: 'bold' }}>شرح</TableCell>
                        <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif', fontWeight: 'bold' }}>مشتری</TableCell>
                        <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif', fontWeight: 'bold' }}>عملیات</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {transactions.slice(0, 10).map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>
                            {new Date(transaction.date).toLocaleDateString('fa-IR')}
                            <br />
                            <Typography variant="caption" color="textSecondary">
                              {transaction.time}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={transaction.type === 'receipt' ? 'دریافت' : 'پرداخت'}
                              color={transaction.type === 'receipt' ? 'success' : 'error'}
                              size="small"
                              sx={{ fontFamily: 'Vazirmatn, sans-serif' }}
                            />
                          </TableCell>
                          <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>
                            <Typography 
                              sx={{ 
                                color: transaction.type === 'receipt' ? '#27ae60' : '#e74c3c',
                                fontWeight: 'bold'
                              }}
                            >
                              {transaction.amount.toLocaleString('fa-IR')} تومان
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Avatar
                                sx={{
                                  bgcolor: getPaymentMethodColor(transaction.paymentMethod),
                                  width: 24,
                                  height: 24
                                }}
                              >
                                {getPaymentMethodIcon(transaction.paymentMethod)}
                              </Avatar>
                              <Typography variant="body2" sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>
                                {transaction.paymentMethod === 'cash' && 'نقدی'}
                                {transaction.paymentMethod === 'card' && 'کارت'}
                                {transaction.paymentMethod === 'check' && 'چک'}
                                {transaction.paymentMethod === 'transfer' && 'انتقال'}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>
                            {transaction.description}
                          </TableCell>
                          <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>
                            {transaction.customerName || '-'}
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <IconButton size="small" color="primary">
                                <Edit />
                              </IconButton>
                              <IconButton 
                                size="small" 
                                color="error"
                                onClick={() => handleDeleteTransaction(transaction.id)}
                              >
                                <Delete />
                              </IconButton>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Daily Cash Tab */}
      <TabPanel value={activeTab} index={1}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontFamily: 'Vazirmatn, sans-serif', color: 'primary.main' }}>
                  صندوق روزانه
                </Typography>
                <Typography variant="subtitle2" color="textSecondary" sx={{ fontFamily: 'Vazirmatn, sans-serif', mb: 2 }}>
                  تاریخ: {new Date().toLocaleDateString('fa-IR')}
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      label="مانده ابتدای روز"
                      value={dailyCash.opening.toLocaleString('fa-IR')}
                      disabled
                      fullWidth
                      InputProps={{
                        endAdornment: <InputAdornment position="end">تومان</InputAdornment>,
                        sx: { fontFamily: 'Vazirmatn, sans-serif' }
                      }}
                      InputLabelProps={{ sx: { fontFamily: 'Vazirmatn, sans-serif' } }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="کل دریافت‌ها (نقدی)"
                      value={dailyCash.receipts.toLocaleString('fa-IR')}
                      disabled
                      fullWidth
                      InputProps={{
                        endAdornment: <InputAdornment position="end">تومان</InputAdornment>,
                        sx: { fontFamily: 'Vazirmatn, sans-serif', color: '#27ae60' }
                      }}
                      InputLabelProps={{ sx: { fontFamily: 'Vazirmatn, sans-serif' } }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="کل پرداخت‌ها (نقدی)"
                      value={dailyCash.payments.toLocaleString('fa-IR')}
                      disabled
                      fullWidth
                      InputProps={{
                        endAdornment: <InputAdornment position="end">تومان</InputAdornment>,
                        sx: { fontFamily: 'Vazirmatn, sans-serif', color: '#e74c3c' }
                      }}
                      InputLabelProps={{ sx: { fontFamily: 'Vazirmatn, sans-serif' } }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <TextField
                      label="مانده فعلی صندوق"
                      value={dailyCash.current.toLocaleString('fa-IR')}
                      disabled
                      fullWidth
                      sx={{
                        '& .MuiInputBase-input': {
                          fontWeight: 'bold',
                          fontSize: '1.2rem',
                          color: '#d4af37'
                        }
                      }}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">تومان</InputAdornment>,
                        sx: { fontFamily: 'Vazirmatn, sans-serif' }
                      }}
                      InputLabelProps={{ sx: { fontFamily: 'Vazirmatn, sans-serif' } }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontFamily: 'Vazirmatn, sans-serif', color: 'primary.main' }}>
                  تفکیک روش‌های پرداخت
                </Typography>
                
                {['cash', 'card', 'check', 'transfer'].map((method) => {
                  const methodTransactions = transactions.filter(t => 
                    t.paymentMethod === method && 
                    t.date === new Date().toISOString().split('T')[0]
                  );
                  const receipts = methodTransactions.filter(t => t.type === 'receipt').reduce((sum, t) => sum + t.amount, 0);
                  const payments = methodTransactions.filter(t => t.type === 'payment').reduce((sum, t) => sum + t.amount, 0);
                  
                  return (
                    <Box key={method} sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Avatar
                          sx={{
                            bgcolor: getPaymentMethodColor(method),
                            width: 32,
                            height: 32
                          }}
                        >
                          {getPaymentMethodIcon(method)}
                        </Avatar>
                        <Typography variant="subtitle1" sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>
                          {method === 'cash' && 'نقدی'}
                          {method === 'card' && 'کارت'}
                          {method === 'check' && 'چک'}
                          {method === 'transfer' && 'انتقال بانکی'}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 1 }}>
                        <Typography variant="body2" sx={{ fontFamily: 'Vazirmatn, sans-serif', color: '#27ae60' }}>
                          دریافت: {receipts.toLocaleString('fa-IR')}
                        </Typography>
                        <Typography variant="body2" sx={{ fontFamily: 'Vazirmatn, sans-serif', color: '#e74c3c' }}>
                          پرداخت: {payments.toLocaleString('fa-IR')}
                        </Typography>
                      </Box>
                      <Divider sx={{ mt: 1 }} />
                    </Box>
                  );
                })}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Financial Reports Tab */}
      <TabPanel value={activeTab} index={2}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>
                    گزارش سود و زیان
                  </Typography>
                  <FormControl size="small">
                    <InputLabel sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>دوره</InputLabel>
                    <Select
                      value={selectedPeriod}
                      onChange={(e) => setSelectedPeriod(e.target.value)}
                      label="دوره"
                      sx={{ fontFamily: 'Vazirmatn, sans-serif', minWidth: 120 }}
                    >
                      <MenuItem value="today" sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>امروز</MenuItem>
                      <MenuItem value="week" sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>این هفته</MenuItem>
                      <MenuItem value="month" sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>این ماه</MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" sx={{ fontFamily: 'Vazirmatn, sans-serif', color: '#27ae60', mb: 2 }}>
                      درآمدها
                    </Typography>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>فروش محصولات:</Typography>
                      <Typography sx={{ fontFamily: 'Vazirmatn, sans-serif', fontWeight: 'bold' }}>
                        {reportData.salesRevenue.toLocaleString('fa-IR')} تومان
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>سایر درآمدها:</Typography>
                      <Typography sx={{ fontFamily: 'Vazirmatn, sans-serif', fontWeight: 'bold' }}>
                        {(reportData.totalReceipts - reportData.salesRevenue).toLocaleString('fa-IR')} تومان
                      </Typography>
                    </Box>
                    <Divider />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1, fontWeight: 'bold' }}>
                      <Typography sx={{ fontFamily: 'Vazirmatn, sans-serif', fontWeight: 'bold' }}>کل درآمد:</Typography>
                      <Typography sx={{ fontFamily: 'Vazirmatn, sans-serif', fontWeight: 'bold', color: '#27ae60' }}>
                        {reportData.totalReceipts.toLocaleString('fa-IR')} تومان
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" sx={{ fontFamily: 'Vazirmatn, sans-serif', color: '#e74c3c', mb: 2 }}>
                      هزینه‌ها
                    </Typography>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>خرید مواد اولیه:</Typography>
                      <Typography sx={{ fontFamily: 'Vazirmatn, sans-serif', fontWeight: 'bold' }}>
                        {reportData.expenses.toLocaleString('fa-IR')} تومان
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>سایر هزینه‌ها:</Typography>
                      <Typography sx={{ fontFamily: 'Vazirmatn, sans-serif', fontWeight: 'bold' }}>
                        {(reportData.totalPayments - reportData.expenses).toLocaleString('fa-IR')} تومان
                      </Typography>
                    </Box>
                    <Divider />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                      <Typography sx={{ fontFamily: 'Vazirmatn, sans-serif', fontWeight: 'bold' }}>کل هزینه:</Typography>
                      <Typography sx={{ fontFamily: 'Vazirmatn, sans-serif', fontWeight: 'bold', color: '#e74c3c' }}>
                        {reportData.totalPayments.toLocaleString('fa-IR')} تومان
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'center', 
                      alignItems: 'center',
                      p: 3,
                      backgroundColor: reportData.netProfit >= 0 ? '#e8f5e8' : '#ffe8e8',
                      borderRadius: 2
                    }}>
                      <Typography variant="h4" sx={{ 
                        fontFamily: 'Vazirmatn, sans-serif', 
                        fontWeight: 'bold',
                        color: reportData.netProfit >= 0 ? '#27ae60' : '#e74c3c'
                      }}>
                        {reportData.netProfit >= 0 ? 'سود: ' : 'زیان: '}
                        {Math.abs(reportData.netProfit).toLocaleString('fa-IR')} تومان
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Customer Debts Tab */}
      <TabPanel value={activeTab} index={3}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>
                  بدهی و طلب مشتریان
                </Typography>
                
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif', fontWeight: 'bold' }}>نام مشتری</TableCell>
                        <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif', fontWeight: 'bold' }}>شماره تلفن</TableCell>
                        <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif', fontWeight: 'bold' }}>مانده حساب</TableCell>
                        <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif', fontWeight: 'bold' }}>وضعیت</TableCell>
                        <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif', fontWeight: 'bold' }}>عملیات</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {customers.map((customer) => (
                        <TableRow key={customer.id}>
                          <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>
                            {customer.name}
                          </TableCell>
                          <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>
                            {customer.phone}
                          </TableCell>
                          <TableCell>
                            <Typography
                              sx={{
                                fontFamily: 'Vazirmatn, sans-serif',
                                fontWeight: 'bold',
                                color: customer.balance >= 0 ? '#27ae60' : '#e74c3c'
                              }}
                            >
                              {customer.balance >= 0 ? '+' : ''}
                              {customer.balance.toLocaleString('fa-IR')} تومان
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {customer.balance < 0 ? (
                              <Chip
                                label="بدهکار"
                                color="error"
                                size="small"
                                icon={<Warning />}
                                sx={{ fontFamily: 'Vazirmatn, sans-serif' }}
                              />
                            ) : customer.balance > 0 ? (
                              <Chip
                                label="طلبکار"
                                color="success"
                                size="small"
                                icon={<CheckCircle />}
                                sx={{ fontFamily: 'Vazirmatn, sans-serif' }}
                              />
                            ) : (
                              <Chip
                                label="تسویه"
                                color="info"
                                size="small"
                                icon={<Info />}
                                sx={{ fontFamily: 'Vazirmatn, sans-serif' }}
                              />
                            )}
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={<Payment />}
                                sx={{ fontFamily: 'Vazirmatn, sans-serif' }}
                              >
                                تسویه
                              </Button>
                              <IconButton size="small" color="primary">
                                <Visibility />
                              </IconButton>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Add Transaction Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>
          افزودن تراکنش جدید
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>نوع تراکنش</InputLabel>
                <Select
                  value={newTransaction.type}
                  onChange={(e) => setNewTransaction(prev => ({ ...prev, type: e.target.value }))}
                  label="نوع تراکنش"
                  sx={{ fontFamily: 'Vazirmatn, sans-serif' }}
                >
                  <MenuItem value="receipt" sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>دریافت</MenuItem>
                  <MenuItem value="payment" sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>پرداخت</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="مبلغ"
                type="number"
                value={newTransaction.amount}
                onChange={(e) => setNewTransaction(prev => ({ ...prev, amount: e.target.value }))}
                fullWidth
                InputProps={{
                  endAdornment: <InputAdornment position="end">تومان</InputAdornment>,
                  sx: { fontFamily: 'Vazirmatn, sans-serif' }
                }}
                InputLabelProps={{ sx: { fontFamily: 'Vazirmatn, sans-serif' } }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>روش پرداخت</InputLabel>
                <Select
                  value={newTransaction.paymentMethod}
                  onChange={(e) => setNewTransaction(prev => ({ ...prev, paymentMethod: e.target.value }))}
                  label="روش پرداخت"
                  sx={{ fontFamily: 'Vazirmatn, sans-serif' }}
                >
                  <MenuItem value="cash" sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>نقدی</MenuItem>
                  <MenuItem value="card" sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>کارت</MenuItem>
                  <MenuItem value="check" sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>چک</MenuItem>
                  <MenuItem value="transfer" sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>انتقال بانکی</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>دسته‌بندی</InputLabel>
                <Select
                  value={newTransaction.category}
                  onChange={(e) => setNewTransaction(prev => ({ ...prev, category: e.target.value }))}
                  label="دسته‌بندی"
                  sx={{ fontFamily: 'Vazirmatn, sans-serif' }}
                >
                  <MenuItem value="sales" sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>فروش</MenuItem>
                  <MenuItem value="purchase" sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>خرید</MenuItem>
                  <MenuItem value="expense" sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>هزینه</MenuItem>
                  <MenuItem value="other" sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>سایر</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="شرح تراکنش"
                value={newTransaction.description}
                onChange={(e) => setNewTransaction(prev => ({ ...prev, description: e.target.value }))}
                fullWidth
                multiline
                rows={2}
                InputLabelProps={{ sx: { fontFamily: 'Vazirmatn, sans-serif' } }}
                InputProps={{ sx: { fontFamily: 'Vazirmatn, sans-serif' } }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="نام مشتری"
                value={newTransaction.customerName}
                onChange={(e) => setNewTransaction(prev => ({ ...prev, customerName: e.target.value }))}
                fullWidth
                InputLabelProps={{ sx: { fontFamily: 'Vazirmatn, sans-serif' } }}
                InputProps={{ sx: { fontFamily: 'Vazirmatn, sans-serif' } }}
              />
            </Grid>
            
            {newTransaction.paymentMethod === 'check' && (
              <>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="شماره چک"
                    value={newTransaction.checkNumber}
                    onChange={(e) => setNewTransaction(prev => ({ ...prev, checkNumber: e.target.value }))}
                    fullWidth
                    InputLabelProps={{ sx: { fontFamily: 'Vazirmatn, sans-serif' } }}
                    InputProps={{ sx: { fontFamily: 'Vazirmatn, sans-serif' } }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="نام بانک"
                    value={newTransaction.bankName}
                    onChange={(e) => setNewTransaction(prev => ({ ...prev, bankName: e.target.value }))}
                    fullWidth
                    InputLabelProps={{ sx: { fontFamily: 'Vazirmatn, sans-serif' } }}
                    InputProps={{ sx: { fontFamily: 'Vazirmatn, sans-serif' } }}
                  />
                </Grid>
              </>
            )}
            
            {newTransaction.paymentMethod === 'transfer' && (
              <Grid item xs={12} md={6}>
                <TextField
                  label="شماره مرجع"
                  value={newTransaction.transferReference}
                  onChange={(e) => setNewTransaction(prev => ({ ...prev, transferReference: e.target.value }))}
                  fullWidth
                  InputLabelProps={{ sx: { fontFamily: 'Vazirmatn, sans-serif' } }}
                  InputProps={{ sx: { fontFamily: 'Vazirmatn, sans-serif' } }}
                />
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>
            انصراف
          </Button>
          <Button
            onClick={handleAddTransaction}
            variant="contained"
            sx={{
              backgroundColor: '#d4af37',
              '&:hover': { backgroundColor: '#b8941f' },
              fontFamily: 'Vazirmatn, sans-serif'
            }}
          >
            ذخیره
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FinanceManagement;

