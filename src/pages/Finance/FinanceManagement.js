import React, { useState, useEffect } from 'react';
import transactionService from '../../services/transactionService';
import customerDebtService from '../../services/customerDebtService';
import installmentService from '../../services/installmentService';
import { formatPrice, toPersianNumbers } from '../../utils/persianNumbers';
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
  const [customers, setCustomers] = useState([]);
  const [customerDebts, setCustomerDebts] = useState([]);
  const [unpaidInvoices, setUnpaidInvoices] = useState([]);
  const [debtSummary, setDebtSummary] = useState({
    total_customers_with_debt: 0,
    total_debt_amount: 0,
    total_paid_amount: 0,
    average_debt_per_customer: 0,
    customers_with_overdue: 0,
    total_unpaid_transactions: 0
  });
  const [overdueCustomers, setOverdueCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [installmentDialogOpen, setInstallmentDialogOpen] = useState(false);
  const [customerDetailDialogOpen, setCustomerDetailDialogOpen] = useState(false);
  const [paymentData, setPaymentData] = useState({
    amount: 0,
    payment_method: 'cash',
    notes: ''
  });
  const [newInstallment, setNewInstallment] = useState({
    number_of_installments: 3,
    start_date: new Date().toISOString().split('T')[0],
    notes: ''
  });
  
  const [dailyCash, setDailyCash] = useState({
    opening: 0,
    current: 0,
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
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [reportData, setReportData] = useState({
    totalReceipts: 0,
    totalPayments: 0,
    netProfit: 0,
    salesRevenue: 0,
    expenses: 0,
    cashFlow: 0
  });

  const [dailyWagesAndCharges, setDailyWagesAndCharges] = useState({
    totalWages: 0,
    totalMakingCharges: 0,
    total: 0
  });

  // Calculate cash box balance from invoices
  const calculateCashBoxBalance = () => {
    const today = new Date().toISOString().split('T')[0];
    
    // Calculate today's sales from sale invoices
    const todaySales = savedSaleInvoices
      .filter(invoice => invoice.transaction_date && new Date(invoice.transaction_date).toISOString().split('T')[0] === today)
      .reduce((sum, invoice) => sum + (parseFloat(invoice.total_amount) || 0), 0);
    
    // Calculate today's purchases from purchase invoices
    const todayPurchases = savedPurchaseInvoices
      .filter(invoice => invoice.transaction_date && new Date(invoice.transaction_date).toISOString().split('T')[0] === today)
      .reduce((sum, invoice) => sum + (parseFloat(invoice.total_amount) || 0), 0);
    
    // Calculate total sales from all sale invoices (for overall balance)
    const totalSales = savedSaleInvoices.reduce((sum, invoice) => sum + (parseFloat(invoice.total_amount) || 0), 0);
    
    // Calculate total purchases from all purchase invoices
    const totalPurchases = savedPurchaseInvoices.reduce((sum, invoice) => sum + (parseFloat(invoice.total_amount) || 0), 0);
    
    // Cash box balance = Total Sales - Total Purchases
    const cashBoxBalance = totalSales - totalPurchases;
    
    return {
      todaySales,
      todayPurchases,
      totalSales,
      totalPurchases,
      cashBoxBalance
    };
  };

  // Calculate payment method breakdown from actual transaction data
  const calculatePaymentMethodBreakdown = () => {
    const today = new Date().toISOString().split('T')[0];
    
    const breakdown = {};
    
    // Initialize breakdown for all payment methods
    ['cash', 'card', 'check', 'transfer', 'unpaid'].forEach(method => {
      breakdown[method] = {
        receipts: 0,
        payments: 0
      };
    });
    
    // Calculate from transactions array (which contains both sales and purchases)
    // Filter transactions for today and also check if date matches in different formats
    const todayTransactions = transactions.filter(transaction => {
      const transactionDate = transaction.date;
      const todayDate = today;
      
      // Check exact match first
      if (transactionDate === todayDate) return true;
      
      // If no match, try to parse and compare dates
      try {
        const transDate = new Date(transactionDate).toISOString().split('T')[0];
        return transDate === todayDate;
      } catch (e) {
        return false;
      }
    });
    
    todayTransactions.forEach(transaction => {
      const method = transaction.paymentMethod || 'cash';
      if (breakdown[method]) {
        if (transaction.type === 'receipt') {
          // This is a sale (receipt)
          breakdown[method].receipts += parseFloat(transaction.total) || 0;
        } else if (transaction.type === 'payment') {
          // This is a purchase (payment)
          breakdown[method].payments += parseFloat(transaction.total) || 0;
        }
      }
    });
    
    // Debug log
    console.log('Today date:', today);
    console.log('Today transactions count:', todayTransactions.length);
    console.log('Final breakdown:', breakdown);
    
    return breakdown;
  };

  // Calculate total wages and making charges from today's purchase invoices
  const calculateTodayWagesAndCharges = () => {
    const today = new Date().toISOString().split('T')[0];
    
    let totalWages = 0;
    let totalMakingCharges = 0;
    
    console.log('=== DEBUG: calculateTodayWagesAndCharges ===');
    console.log('Today date:', today);
    console.log('Total purchase invoices:', savedPurchaseInvoices.length);
    
    // Calculate from purchase invoices for today
    const todayInvoices = savedPurchaseInvoices.filter(invoice => {
      const invoiceDate = new Date(invoice.transaction_date || new Date()).toISOString().split('T')[0];
      const isToday = invoiceDate === today;
      console.log(`Invoice ${invoice.id}: date=${invoiceDate}, isToday=${isToday}`);
      return isToday;
    });
    
    console.log('Today purchase invoices:', todayInvoices.length);
    
    todayInvoices.forEach(invoice => {
      console.log(`Processing invoice ${invoice.id}:`, invoice);
      
      if (invoice.items && Array.isArray(invoice.items)) {
        console.log(`Invoice ${invoice.id} has ${invoice.items.length} items`);
        
        invoice.items.forEach((item, index) => {
          console.log(`Item ${index}:`, item);
          
          // Now we have both wage and making_wage fields
          const wage = parseFloat(item.wage || 0);
          const makingWage = parseFloat(item.making_wage || 0);
          
          console.log(`Item ${index} - wage: ${wage}, making_wage: ${makingWage}`);
          
          // Add wages (دستمزد)
          totalWages += wage;
          
          // Add making charges (اجرت ساخت)
          totalMakingCharges += makingWage;
        });
      } else {
        console.log(`Invoice ${invoice.id} has no items or items is not an array:`, invoice.items);
      }
    });
    
    const result = {
      totalWages,
      totalMakingCharges,
      total: totalWages + totalMakingCharges
    };
    
    console.log('Final result:', result);
    console.log('=== END DEBUG ===');
    
    return result;
  };

  // Initialize data
  useEffect(() => {
    // Set initial opening balance to calculated fund balance
    const { cashBoxBalance } = calculateCashBoxBalance();
    setDailyCash(prev => ({
      ...prev,
      opening: cashBoxBalance,
      current: cashBoxBalance,
      closing: cashBoxBalance
    }));
    
    // Set initial wages and charges
    const wagesAndCharges = calculateTodayWagesAndCharges();
    setDailyWagesAndCharges(wagesAndCharges);
    
    calculateDailyCash();
    generateReports();
  }, []);

  // Reset daily data at midnight
  useEffect(() => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const timeUntilMidnight = tomorrow.getTime() - now.getTime();
    
    const resetTimer = setTimeout(() => {
      // Calculate fund balance from invoices for opening balance
      const { cashBoxBalance } = calculateCashBoxBalance();
      
      // Reset daily cash data with calculated fund balance
      setDailyCash(prev => ({
        ...prev,
        opening: cashBoxBalance, // Set opening balance to calculated fund balance
        receipts: 0,
        payments: 0,
        current: cashBoxBalance,
        closing: cashBoxBalance,
        date: new Date().toISOString().split('T')[0]
      }));
      
      // Regenerate reports (this will also recalculate wages and charges for the new day)
      generateReports();
    }, timeUntilMidnight);
    
    return () => clearTimeout(resetTimer);
  }, []);



  const calculateDailyCash = () => {
    const todayTransactions = transactions.filter(t => 
      t.date === new Date().toISOString().split('T')[0]
    );
    
    const receipts = todayTransactions
      .filter(t => t.type === 'receipt' && t.paymentMethod === 'cash')
      .reduce((sum, t) => sum + (t.total || 0), 0);
      
    const payments = todayTransactions
      .filter(t => t.type === 'payment' && t.paymentMethod === 'cash')
      .reduce((sum, t) => sum + (t.total || 0), 0);

    // Use today's sales and purchases from invoices
    const todaySalesFromInvoices = calculateCashBoxBalance().todaySales;
    const todayPurchasesFromInvoices = calculateCashBoxBalance().todayPurchases;
    
    // Calculate fund balance for opening balance
    const { cashBoxBalance } = calculateCashBoxBalance();

    setDailyCash(prev => ({
      ...prev,
      opening: cashBoxBalance, // Set opening balance to calculated fund balance
      receipts: todaySalesFromInvoices, // Use today's sales as receipts
      payments: todayPurchasesFromInvoices, // Use today's purchases as payments
      current: cashBoxBalance + todaySalesFromInvoices - todayPurchasesFromInvoices,
      closing: cashBoxBalance + todaySalesFromInvoices - todayPurchasesFromInvoices
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
      .reduce((sum, t) => sum + (t.total || 0), 0);
      
    const totalPayments = filteredTransactions
      .filter(t => t.type === 'payment')
      .reduce((sum, t) => sum + (t.total || 0), 0);
      
    const salesRevenue = filteredTransactions
      .filter(t => t.type === 'receipt' && t.category === 'sales')
      .reduce((sum, t) => sum + (t.total || 0), 0);
      
    const expenses = filteredTransactions
      .filter(t => t.type === 'payment' && (t.category === 'expense' || t.category === 'purchase'))
      .reduce((sum, t) => sum + (t.total || 0), 0);

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
    // Recalculate opening balance when transactions change
    const { cashBoxBalance } = calculateCashBoxBalance();
    setDailyCash(prev => ({
      ...prev,
      opening: cashBoxBalance,
      current: cashBoxBalance + prev.receipts - prev.payments,
      closing: cashBoxBalance + prev.receipts - prev.payments
    }));
    
    // Update daily wages and charges
    const wagesAndCharges = calculateTodayWagesAndCharges();
    setDailyWagesAndCharges(wagesAndCharges);
    
    calculateDailyCash();
    generateReports();
  }, [transactions, selectedPeriod]);

  // Load customer debts data
  const loadCustomerDebts = async () => {
    try {
      const [debtsResponse, summaryResponse, overdueResponse] = await Promise.all([
        customerDebtService.getCustomerDebts(),
        customerDebtService.getDebtSummary(),
        customerDebtService.getOverdueCustomers()
      ]);
      
      setCustomerDebts(debtsResponse.data || []);
      setDebtSummary(summaryResponse.data || {});
      setOverdueCustomers(overdueResponse.data || []);
      
      // Collect all unpaid invoices from all customers
      const allUnpaidInvoices = [];
      debtsResponse.data.forEach(customer => {
        customer.transactions.forEach(transaction => {
          if (transaction.payment_method === 'unpaid' || transaction.remaining_amount > 0) {
            allUnpaidInvoices.push({
              ...transaction,
              customer_name: customer.customer_name,
              customer_phone: customer.customer_phone
            });
          }
        });
      });
      
      // Sort unpaid invoices by date (newest first)
      const sortedUnpaidInvoices = allUnpaidInvoices.sort((a, b) => 
        new Date(b.transaction_date) - new Date(a.transaction_date)
      );
      
      setUnpaidInvoices(sortedUnpaidInvoices);
      
      // Set formatted customers for backward compatibility
      // Filter to only show customers with unpaid transactions or remaining amounts
      const customersWithUnpaidTransactions = debtsResponse.data.filter(customer => 
        customer.transactions.some(transaction => 
          transaction.payment_method === 'unpaid' || transaction.remaining_amount > 0
        )
      );
      
      const formattedCustomers = customersWithUnpaidTransactions.map((customer, index) => ({
        id: index + 1,
        name: customer.customer_name,
        phone: customer.customer_phone,
        balance: -customer.remaining_amount, // Negative because it's debt
        totalDebt: customer.total_debt,
        totalPaid: customer.total_paid,
        remainingAmount: customer.remaining_amount,
        transactionCount: customer.transaction_count,
        lastTransactionDate: customer.last_transaction_date,
        transactions: customer.transactions || [],
        hasUnpaidTransactions: customer.transactions.some(transaction => transaction.payment_method === 'unpaid' || transaction.remaining_amount > 0),
        unpaidTransactionCount: customer.transactions.filter(transaction => transaction.payment_method === 'unpaid' || transaction.remaining_amount > 0).length,
        unpaidAmount: customer.transactions
          .filter(transaction => transaction.payment_method === 'unpaid' || transaction.remaining_amount > 0)
          .reduce((sum, transaction) => sum + (transaction.remaining_amount || transaction.total_amount), 0)
      }));
      
      setCustomers(formattedCustomers);
    } catch (error) {
      console.error('Error loading customer debts:', error);
    }
  };

  // Handle customer payment
  const handlePayCustomerDebt = async () => {
    if (!selectedCustomer || !paymentData.amount || paymentData.amount <= 0) {
      alert('لطفاً مبلغ معتبر وارد کنید');
      return;
    }

    try {
      console.log('=== Payment Debug Info ===');
      console.log('Selected Customer:', selectedCustomer);
      console.log('Payment Data:', paymentData);
      
      // If we have a specific invoice selected, use that; otherwise use the oldest unpaid transaction
      let targetTransaction;
      
      if (selectedCustomer.selectedInvoice) {
        // Use the specific invoice that was clicked
        targetTransaction = selectedCustomer.selectedInvoice;
      } else {
        // Find the oldest unpaid transaction for this customer
        targetTransaction = selectedCustomer.transactions
          .filter(t => t.remaining_amount > 0 || t.payment_method === 'unpaid')
          .sort((a, b) => new Date(a.transaction_date) - new Date(b.transaction_date))[0];
      }

      if (!targetTransaction) {
        alert('تراکنش قابل پرداخت یافت نشد');
        return;
      }

      console.log('Target Transaction:', targetTransaction);
      
      // Calculate remaining amount and check if this is a full payment
      const totalAmount = Math.abs(targetTransaction.remaining_amount || targetTransaction.total_amount || 0);
      const paymentAmount = parseFloat(paymentData.amount);
      const isFullPayment = paymentAmount >= totalAmount;
      
      console.log('Total Amount:', totalAmount);
      console.log('Payment Amount:', paymentAmount);
      console.log('Is Full Payment:', isFullPayment);

      const paymentPayload = {
        amount: paymentAmount,
        payment_method: paymentData.payment_method,
        notes: paymentData.notes,
        payment_date: new Date().toISOString(),
        is_full_payment: isFullPayment,
        // If it's a full payment and the transaction was unpaid, change payment_method
        update_payment_method: isFullPayment && targetTransaction.payment_method === 'unpaid'
      };
      
      console.log('Payment Payload:', paymentPayload);
      
      const response = await customerDebtService.payCustomerDebt(targetTransaction.id, paymentPayload);
      console.log('Payment Response:', response);

      setPaymentDialogOpen(false);
      setSelectedCustomer(null);
      setPaymentData({ amount: 0, payment_method: 'cash', notes: '' });
      
      // Reload data
      await loadCustomerDebts();
      
      if (isFullPayment) {
        alert('پرداخت کامل انجام شد - فاکتور از لیست پرداخت نشده حذف شد');
      } else {
        alert('پرداخت جزئی با موفقیت ثبت شد');
      }
      
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('خطا در ثبت پرداخت');
    }
  };

  // Handle creating installment plan
  const handleCreateInstallmentPlan = async () => {
    if (!selectedCustomer || !newInstallment.number_of_installments) {
      alert('لطفاً اطلاعات اقساط را کامل کنید');
      return;
    }

    try {
      // If we have a specific invoice selected, use that; otherwise find the transaction with highest remaining amount
      let targetTransaction;
      
      if (selectedCustomer.selectedInvoice) {
        // Use the specific invoice that was clicked
        targetTransaction = selectedCustomer.selectedInvoice;
      } else {
        // Find the transaction with highest remaining amount
        targetTransaction = selectedCustomer.transactions
          .filter(t => t.remaining_amount > 0 || t.payment_method === 'unpaid')
          .sort((a, b) => (b.remaining_amount || b.total_amount) - (a.remaining_amount || a.total_amount))[0];
      }

      if (!targetTransaction) {
        alert('تراکنش قابل اقساط یافت نشد');
        return;
      }

      const installmentAmount = Math.abs(targetTransaction.remaining_amount || targetTransaction.total_amount || 0);

      await customerDebtService.createInstallmentPlan(targetTransaction.id, {
        number_of_installments: parseInt(newInstallment.number_of_installments),
        start_date: newInstallment.start_date,
        amount: installmentAmount,
        notes: newInstallment.notes
      });

      setInstallmentDialogOpen(false);
      setSelectedCustomer(null);
      setNewInstallment({
        number_of_installments: 3,
        start_date: new Date().toISOString().split('T')[0],
        notes: ''
      });
      
      // Reload data
      await loadCustomerDebts();
      alert('برنامه اقساط با موفقیت ایجاد شد');
      
    } catch (error) {
      console.error('Error creating installment plan:', error);
      alert('خطا در ایجاد برنامه اقساط');
    }
  };

  // Search customers
  const handleSearchCustomers = async (searchValue) => {
    setSearchTerm(searchValue);
    
    if (!searchValue.trim()) {
      loadCustomerDebts();
      return;
    }
    
    try {
      const response = await customerDebtService.searchCustomers(searchValue);
      
      // Filter to only show customers with unpaid transactions or remaining amounts
      const customersWithUnpaidTransactions = response.data.filter(customer => 
        customer.transactions.some(transaction => 
          transaction.payment_method === 'unpaid' || transaction.remaining_amount > 0
        )
      );
      
      // Collect all unpaid invoices and filter by search term
      const allUnpaidInvoices = [];
      customersWithUnpaidTransactions.forEach(customer => {
        customer.transactions.forEach(transaction => {
          if (transaction.payment_method === 'unpaid' || transaction.remaining_amount > 0) {
            allUnpaidInvoices.push({
              ...transaction,
              customer_name: customer.customer_name,
              customer_phone: customer.customer_phone
            });
          }
        });
      });
      
      // Filter unpaid invoices by search term (customer name, phone, or transaction number)
      const filteredUnpaidInvoices = allUnpaidInvoices.filter(invoice => 
        invoice.customer_name.toLowerCase().includes(searchValue.toLowerCase()) ||
        (invoice.customer_phone && invoice.customer_phone.includes(searchValue)) ||
        (invoice.transaction_number && invoice.transaction_number.toLowerCase().includes(searchValue.toLowerCase()))
      );
      
      // Sort filtered unpaid invoices by date (newest first)
      const sortedFilteredInvoices = filteredUnpaidInvoices.sort((a, b) => 
        new Date(b.transaction_date) - new Date(a.transaction_date)
      );
      
      setUnpaidInvoices(sortedFilteredInvoices);
      
      const formattedCustomers = customersWithUnpaidTransactions.map((customer, index) => ({
        id: index + 1,
        name: customer.customer_name,
        phone: customer.customer_phone,
        balance: -customer.remaining_amount,
        totalDebt: customer.total_debt,
        totalPaid: customer.total_paid,
        remainingAmount: customer.remaining_amount,
        transactionCount: customer.transaction_count,
        lastTransactionDate: customer.last_transaction_date,
        transactions: customer.transactions || [],
        hasUnpaidTransactions: customer.transactions.some(transaction => transaction.payment_method === 'unpaid' || transaction.remaining_amount > 0),
        unpaidTransactionCount: customer.transactions.filter(transaction => transaction.payment_method === 'unpaid' || transaction.remaining_amount > 0).length,
        unpaidAmount: customer.transactions
          .filter(transaction => transaction.payment_method === 'unpaid' || transaction.remaining_amount > 0)
          .reduce((sum, transaction) => sum + (transaction.remaining_amount || transaction.total_amount), 0)
      }));
      
      setCustomers(formattedCustomers);
    } catch (error) {
      console.error('Error searching customers:', error);
    }
  };

  // View customer details
  const handleViewCustomerDetails = (customer) => {
    setSelectedCustomer(customer);
    setCustomerDetailDialogOpen(true);
  };

  // Load transactions from database
  const loadTransactions = async () => {
    try {
      const salesResponse = await transactionService.getSales();
      const purchasesResponse = await transactionService.getPurchases();
      
      // Check if we have the right structure
      const salesTransactions = salesResponse.data?.transactions || [];
      const purchasesTransactions = purchasesResponse.data?.transactions || [];
      
      // Convert transaction_date to date for filtering and add proper structure
      const processedSales = salesTransactions.map(invoice => {
        // Extract product names from invoice items
        let productNames = [];
        if (invoice.items && Array.isArray(invoice.items)) {
          productNames = invoice.items.map(item => item.item_name || 'محصول').filter(name => name);
        }
        
        const productDescription = productNames.length > 0 
          ? `فروش: ${productNames.join('، ')}`
          : `فاکتور فروش شماره ${invoice.id}`;
        
        return {
          ...invoice,
          id: invoice.id || Date.now(),
          date: new Date(invoice.transaction_date || new Date()).toISOString().split('T')[0],
          customerName: invoice.customer_name || '',
          customerPhone: invoice.customer_phone || '',
          total: parseFloat(invoice.total_amount) || 0,
          type: 'receipt', // Sales are receipts (money coming in)
          paymentMethod: invoice.payment_method || 'cash',
          description: productDescription,
          category: 'sales',
          time: new Date(invoice.transaction_date || new Date()).toLocaleTimeString('fa-IR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })
        };
      });
      
      const processedPurchases = purchasesTransactions.map(invoice => {
        // Extract product names from invoice items
        let productNames = [];
        if (invoice.items && Array.isArray(invoice.items)) {
          productNames = invoice.items.map(item => item.item_name || 'محصول').filter(name => name);
        }
        
        const productDescription = productNames.length > 0 
          ? `خرید: ${productNames.join('، ')}`
          : `فاکتور خرید شماره ${invoice.id}`;
        
        return {
          ...invoice,
          id: invoice.id || Date.now(),
          date: new Date(invoice.transaction_date || new Date()).toISOString().split('T')[0],
          supplierName: invoice.customer_name || '',
          supplierPhone: invoice.customer_phone || '',
          total: parseFloat(invoice.total_amount) || 0,
          type: 'payment', // Purchases are payments (money going out)
          paymentMethod: invoice.payment_method || 'cash',
          description: productDescription,
          category: 'purchase',
          time: new Date(invoice.transaction_date || new Date()).toLocaleTimeString('fa-IR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })
        };
      });
      
      setSavedSaleInvoices(processedSales);
      setSavedPurchaseInvoices(processedPurchases);
      
      // Combine all transactions for the transactions tab
      const allTransactions = [...processedSales, ...processedPurchases];
      console.log('All transactions loaded:', allTransactions);
      console.log('Processed sales:', processedSales);
      console.log('Processed purchases:', processedPurchases);
      setTransactions(allTransactions);
      
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  useEffect(() => {
    loadTransactions();
    loadCustomerDebts();
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

  const handleEditTransaction = (transaction) => {
    if (!transaction) return;
    
    setEditingTransaction({
      id: transaction.id || Date.now(),
      type: transaction.type || 'receipt',
      amount: transaction.total || 0,
      description: transaction.description || '',
      paymentMethod: transaction.paymentMethod || 'cash',
      category: transaction.category || 'sales',
      customerId: transaction.customerId || '',
      customerName: transaction.customerName || transaction.supplierName || '',
      checkNumber: transaction.checkNumber || '',
      bankName: transaction.bankName || '',
      checkDate: transaction.checkDate || '',
      transferReference: transaction.transferReference || '',
      notes: transaction.notes || '',
      date: transaction.date || new Date().toISOString().split('T')[0]
    });
    setEditDialogOpen(true);
  };

  const handleUpdateTransaction = async () => {
    if (!editingTransaction || !editingTransaction.amount || editingTransaction.amount <= 0) {
      alert('لطفاً مبلغ معتبر وارد کنید');
      return;
    }

    try {
      // Update the transaction in the database
      const updatedTransactionData = {
        total_amount: parseFloat(editingTransaction.amount),
        payment_method: editingTransaction.paymentMethod,
        notes: editingTransaction.notes,
        customer_name: editingTransaction.customerName,
        // Add other fields as needed
      };

      await transactionService.updateTransaction(editingTransaction.id, updatedTransactionData);

      // Update the transaction in local state
      setTransactions(prev => prev.map(t => 
        t.id === editingTransaction.id 
          ? {
              ...t,
              total: parseFloat(editingTransaction.amount),
              paymentMethod: editingTransaction.paymentMethod,
              description: editingTransaction.description,
              customerName: editingTransaction.customerName,
              supplierName: editingTransaction.customerName,
              notes: editingTransaction.notes
            }
          : t
      ));

      // Also update in saved invoices
      setSavedSaleInvoices(prev => prev.map(invoice => 
        invoice.id === editingTransaction.id 
          ? {
              ...invoice,
              total: parseFloat(editingTransaction.amount),
              payment_method: editingTransaction.paymentMethod,
              customer_name: editingTransaction.customerName,
              notes: editingTransaction.notes
            }
          : invoice
      ));

      setSavedPurchaseInvoices(prev => prev.map(invoice => 
        invoice.id === editingTransaction.id 
          ? {
              ...invoice,
              total: parseFloat(editingTransaction.amount),
              payment_method: editingTransaction.paymentMethod,
              customer_name: editingTransaction.customerName,
              notes: editingTransaction.notes
            }
          : invoice
      ));

      setEditDialogOpen(false);
      setEditingTransaction(null);
      alert('تراکنش با موفقیت ویرایش شد');
    } catch (error) {
      console.error('Error updating transaction:', error);
      alert('خطا در ویرایش تراکنش');
    }
  };

  const handleDeleteTransaction = async (id) => {
    if (window.confirm('آیا از حذف این تراکنش اطمینان دارید؟')) {
      try {
        await transactionService.deleteTransaction(id);
        setTransactions(prev => prev.filter(t => t.id !== id));
        
        // Also remove from saved invoices
        setSavedSaleInvoices(prev => prev.filter(invoice => invoice.id !== id));
        setSavedPurchaseInvoices(prev => prev.filter(invoice => invoice.id !== id));
        
        alert('تراکنش با موفقیت حذف شد');
      } catch (error) {
        console.error('Error deleting transaction:', error);
        alert('خطا در حذف تراکنش');
      }
    }
  };

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'cash': return <MonetizationOn />;
      case 'card': return <CreditCard />;
      case 'check': return <Receipt />;
      case 'transfer': return <AccountBalance />;
      case 'unpaid': return <Warning />;
      default: return <Payment />;
    }
  };

  const getPaymentMethodColor = (method) => {
    switch (method) {
      case 'cash': return '#27ae60';
      case 'card': return '#3498db';
      case 'check': return '#f39c12';
      case 'transfer': return '#9b59b6';
      case 'unpaid': return '#e74c3c';
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
              {typeof value === 'number' ? toPersianNumbers(value.toLocaleString('fa-IR')) : value}
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

  // تابع حذف فاکتور
  const handleDeleteInvoice = async (invoice, type) => {
    if (window.confirm(`آیا از حذف این فاکتور ${type === 'sale' ? 'فروش' : 'خرید'} اطمینان دارید؟`)) {
      try {
        await transactionService.deleteTransaction(invoice.id);
        
        // حذف از state محلی
        if (type === 'sale') {
          setSavedSaleInvoices(prev => prev.filter(item => item.id !== invoice.id));
        } else {
          setSavedPurchaseInvoices(prev => prev.filter(item => item.id !== invoice.id));
        }
        
        alert(`فاکتور ${type === 'sale' ? 'فروش' : 'خرید'} با موفقیت حذف شد`);
      } catch (error) {
        console.error('Error deleting invoice:', error);
        alert('خطا در حذف فاکتور');
      }
    }
  };

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
          <IconButton onClick={() => {
            loadTransactions();
            generateReports();
          }} color="primary">
            <Refresh />
          </IconButton>
        </Box>
      </Box>

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="مانده صندوق"
            value={`${toPersianNumbers((calculateCashBoxBalance().cashBoxBalance / 1000000).toFixed(3))} میلیون تومان`}
            subtitle={formatPrice(calculateCashBoxBalance().cashBoxBalance)}
            icon={<AccountBalanceWallet sx={{ color: '#d4af37' }} />}
            color="#d4af37"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="دریافت امروز"
            value={`${toPersianNumbers((calculateCashBoxBalance().todaySales / 1000000).toFixed(3))} میلیون تومان`}
            subtitle="مجموع فاکتورهای فروش امروز"
            icon={<TrendingUp sx={{ color: '#27ae60' }} />}
            color="#27ae60"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="پرداخت امروز"
            value={`${toPersianNumbers((calculateCashBoxBalance().todayPurchases / 1000000).toFixed(3))} میلیون تومان`}
            subtitle="مجموع فاکتورهای خرید امروز"
            icon={<TrendingDown sx={{ color: '#e74c3c' }} />}
            color="#e74c3c"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="سود خالص امروز"
            value={`${toPersianNumbers((dailyWagesAndCharges.total / 1000000).toFixed(3))} میلیون تومان`}
            subtitle="مجموع دستمزد و اجرت فاکتورهای خرید امروز"
            icon={<Assessment sx={{ color: '#3498db' }} />}
            color="#3498db"
          />
        </Grid>
      </Grid>

      {/* Invoice Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="مجموع فاکتورهای فروش"
            value={`${toPersianNumbers((calculateCashBoxBalance().totalSales / 1000000).toFixed(3))} میلیون تومان`}
            subtitle={formatPrice(calculateCashBoxBalance().totalSales)}
            icon={<TrendingUp sx={{ color: '#27ae60' }} />}
            color="#27ae60"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="مجموع فاکتورهای خرید"
            value={`${toPersianNumbers((calculateCashBoxBalance().totalPurchases / 1000000).toFixed(3))} میلیون تومان`}
            subtitle={formatPrice(calculateCashBoxBalance().totalPurchases)}
            icon={<TrendingDown sx={{ color: '#e74c3c' }} />}
            color="#e74c3c"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="تعداد فاکتورها"
            value={`${toPersianNumbers(savedSaleInvoices.length + savedPurchaseInvoices.length)}`}
            subtitle={`فروش: ${toPersianNumbers(savedSaleInvoices.length)} | خرید: ${toPersianNumbers(savedPurchaseInvoices.length)}`}
            icon={<Receipt sx={{ color: '#9b59b6' }} />}
            color="#9b59b6"
          />
        </Grid>
      </Grid>

      {/* Tabs */}
      <Card sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab icon={<SwapVert />} label="تراکنش‌ها" sx={{ fontFamily: 'Vazirmatn, sans-serif' }} />
          <Tab icon={<AccountBalanceWallet />} label="صندوق روزانه" sx={{ fontFamily: 'Vazirmatn, sans-serif' }} />
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
                        <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif', fontWeight: 'bold' }}>شماره فاکتور</TableCell>
                        <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif', fontWeight: 'bold' }}>نوع</TableCell>
                        <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif', fontWeight: 'bold' }}>نام مشتری/تامین‌کننده</TableCell>
                        <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif', fontWeight: 'bold' }}>شرح</TableCell>
                        <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif', fontWeight: 'bold' }}>مبلغ کل</TableCell>
                        <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif', fontWeight: 'bold' }}>تاریخ</TableCell>
                        <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif', fontWeight: 'bold' }}>عملیات</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {/* نمایش فاکتورهای فروش */}
                      {savedSaleInvoices.slice(0, 10).map((invoice) => (
                        <TableRow key={`sale-${invoice.id}`} sx={{ '&:hover': { backgroundColor: '#fff8e1' } }}>
                          <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>
                            {toPersianNumbers(invoice.id)}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label="فروش"
                              color="success"
                              size="small"
                              sx={{ fontFamily: 'Vazirmatn, sans-serif' }}
                            />
                          </TableCell>
                          <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>
                            {invoice.customerName || '-'}
                          </TableCell>
                          <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>
                            {invoice.items && invoice.items.length > 0 
                              ? invoice.items.map(item => item.item_name).join(', ')
                              : 'بدون شرح'
                            }
                          </TableCell>
                          <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>
                            <Typography sx={{ fontWeight: 'bold', color: '#e67e22' }}>
                              {toPersianNumbers(invoice.total.toLocaleString('fa-IR'))} تومان
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>
                            {invoice.date}
                          </TableCell>
                          <TableCell>
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => handleDeleteInvoice(invoice, 'sale')}
                              title="حذف فاکتور"
                              sx={{ 
                                color: '#e74c3c',
                                '&:hover': { 
                                  backgroundColor: 'rgba(231, 76, 60, 0.1)',
                                  color: '#c0392b'
                                }
                              }}
                            >
                              <Delete />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                      
                      {/* نمایش فاکتورهای خرید */}
                      {savedPurchaseInvoices.slice(0, 10).map((invoice) => (
                        <TableRow key={`purchase-${invoice.id}`} sx={{ '&:hover': { backgroundColor: '#f1f8e9' } }}>
                          <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>
                            {toPersianNumbers(invoice.id)}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label="خرید"
                              color="error"
                              size="small"
                              sx={{ fontFamily: 'Vazirmatn, sans-serif' }}
                            />
                          </TableCell>
                          <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>
                            {invoice.supplierName || '-'}
                          </TableCell>
                          <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>
                            {invoice.items && invoice.items.length > 0 
                              ? invoice.items.map(item => item.item_name).join(', ')
                              : 'بدون شرح'
                            }
                          </TableCell>
                          <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>
                            <Typography sx={{ fontWeight: 'bold', color: '#27ae60' }}>
                              {toPersianNumbers(invoice.total.toLocaleString('fa-IR'))} تومان
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>
                            {invoice.date}
                          </TableCell>
                          <TableCell>
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => handleDeleteInvoice(invoice, 'purchase')}
                              title="حذف فاکتور"
                              sx={{ 
                                color: '#e74c3c',
                                '&:hover': { 
                                  backgroundColor: 'rgba(231, 76, 60, 0.1)',
                                  color: '#c0392b'
                                }
                              }}
                            >
                              <Delete />
                            </IconButton>
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
                      label="مانده کل صندوق (از فاکتورها)"
                      value={`${(calculateCashBoxBalance().cashBoxBalance / 1000000).toFixed(3)} میلیون تومان`}
                      disabled
                      fullWidth
                      sx={{
                        '& .MuiInputBase-input': {
                          fontWeight: 'bold',
                          fontSize: '1.2rem',
                          color: calculateCashBoxBalance().cashBoxBalance >= 0 ? '#27ae60' : '#e74c3c'
                        }
                      }}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">میلیون تومان</InputAdornment>,
                        sx: { fontFamily: 'Vazirmatn, sans-serif' }
                      }}
                      InputLabelProps={{ sx: { fontFamily: 'Vazirmatn, sans-serif' } }}
                    />
                    <Typography variant="caption" sx={{ fontFamily: 'Vazirmatn, sans-serif', color: 'textSecondary', mt: 1, display: 'block' }}>
                      محاسبه شده از: مجموع فاکتورهای فروش - مجموع فاکتورهای خرید
                    </Typography>
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
                
                {['cash', 'card', 'check', 'transfer', 'unpaid'].map((method) => {
                  const breakdown = calculatePaymentMethodBreakdown();
                  const methodData = breakdown[method] || { receipts: 0, payments: 0 };
                  
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
                          {method === 'unpaid' && 'پرداخت نشده'}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 1 }}>
                        <Typography variant="body2" sx={{ fontFamily: 'Vazirmatn, sans-serif', color: '#27ae60' }}>
                          دریافت: {methodData.receipts.toLocaleString('fa-IR')}
                        </Typography>
                        <Typography variant="body2" sx={{ fontFamily: 'Vazirmatn, sans-serif', color: '#e74c3c' }}>
                          پرداخت: {methodData.payments.toLocaleString('fa-IR')}
                        </Typography>
                      </Box>
                      <Divider sx={{ mt: 1 }} />
                    </Box>
                  );
                })}
                
                {/* Summary of payment methods */}
                <Box sx={{ mt: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontFamily: 'Vazirmatn, sans-serif', fontWeight: 'bold', mb: 1 }}>
                    خلاصه روش‌های پرداخت امروز:
                  </Typography>
                  {(() => {
                    const breakdown = calculatePaymentMethodBreakdown();
                    const totalReceipts = Object.values(breakdown).reduce((sum, method) => sum + method.receipts, 0);
                    const totalPayments = Object.values(breakdown).reduce((sum, method) => sum + method.payments, 0);
                    
                    return (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" sx={{ fontFamily: 'Vazirmatn, sans-serif', color: '#27ae60', fontWeight: 'bold' }}>
                          کل دریافت: {totalReceipts.toLocaleString('fa-IR')} تومان
                        </Typography>
                        <Typography variant="body2" sx={{ fontFamily: 'Vazirmatn, sans-serif', color: '#e74c3c', fontWeight: 'bold' }}>
                          کل پرداخت: {totalPayments.toLocaleString('fa-IR')} تومان
                        </Typography>
                      </Box>
                    );
                  })()}
                </Box>
              </CardContent>
            </Card>
          </Grid>
          

        </Grid>
      </TabPanel>

      {/* Customer Debts Tab */}
      <TabPanel value={activeTab} index={2}>
        <Grid container spacing={3}>
          {/* Debt Summary Cards */}
          <Grid item xs={12}>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="مشتریان بدهکار"
                  value={debtSummary.total_customers_with_debt || 0}
                  subtitle="مشتریان با فاکتور پرداخت نشده"
                  icon={<CreditScore sx={{ color: '#e74c3c' }} />}
                  color="#e74c3c"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="کل مبلغ بدهی"
                  value={`${((debtSummary.total_debt_amount || 0) / 1000000).toFixed(1)} میلیون`}
                  subtitle={`${(debtSummary.total_debt_amount || 0).toLocaleString('fa-IR')} تومان`}
                  icon={<AttachMoney sx={{ color: '#e74c3c' }} />}
                  color="#e74c3c"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="فاکتورهای پرداخت نشده"
                  value={debtSummary.total_unpaid_transactions || 0}
                  subtitle="تعداد فاکتورهای بدون پرداخت"
                  icon={<Receipt sx={{ color: '#e67e22' }} />}
                  color="#e67e22"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="میانگین بدهی"
                  value={`${((debtSummary.average_debt_per_customer || 0) / 1000000).toFixed(1)} میلیون`}
                  subtitle={`${(debtSummary.average_debt_per_customer || 0).toLocaleString('fa-IR')} تومان`}
                  icon={<Assessment sx={{ color: '#f39c12' }} />}
                  color="#f39c12"
                />
              </Grid>
            </Grid>
          </Grid>

          {/* Customer Management */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>
                    مدیریت بدهی مشتریان و فاکتورهای پرداخت نشده
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <TextField
                      size="small"
                      placeholder="جستجو مشتری یا شماره فاکتور"
                      value={searchTerm}
                      onChange={(e) => handleSearchCustomers(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Search />
                          </InputAdornment>
                        ),
                        sx: { fontFamily: 'Vazirmatn, sans-serif' }
                      }}
                      sx={{ minWidth: 250 }}
                    />
                    <IconButton onClick={loadCustomerDebts} color="primary">
                      <Refresh />
                    </IconButton>
                  </Box>
                </Box>
                
                <TableContainer sx={{ maxHeight: 600 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif', fontWeight: 'bold' }}>مشتری</TableCell>
                        <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif', fontWeight: 'bold' }}>شماره فاکتور</TableCell>
                        <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif', fontWeight: 'bold' }}>مبلغ فاکتور</TableCell>
                        <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif', fontWeight: 'bold' }}>تاریخ فاکتور</TableCell>
                        <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif', fontWeight: 'bold' }}>عملیات</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {unpaidInvoices.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} align="center" sx={{ fontFamily: 'Vazirmatn, sans-serif', py: 4 }}>
                            <Typography variant="body1" color="textSecondary">
                              هیچ فاکتور پرداخت نشده‌ای یافت نشد
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        unpaidInvoices.map((invoice, index) => (
                          <TableRow key={`${invoice.id}-${index}`} hover>
                            <TableCell>
                              <Box>
                                <Typography variant="body2" sx={{ fontFamily: 'Vazirmatn, sans-serif', fontWeight: 'bold' }}>
                                  {invoice.customer_name}
                                </Typography>
                                <Typography variant="caption" color="textSecondary" sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>
                                  {invoice.customer_phone || 'بدون شماره تلفن'}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontFamily: 'Vazirmatn, sans-serif', fontWeight: 'bold' }}>
                                {invoice.transaction_number}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography
                                variant="body2"
                                sx={{
                                  fontFamily: 'Vazirmatn, sans-serif',
                                  fontWeight: 'bold',
                                  color: '#e74c3c'
                                }}
                              >
                                {Math.abs(invoice.total_amount || 0).toLocaleString('fa-IR')} تومان
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>
                                {new Date(invoice.transaction_date).toLocaleDateString('fa-IR')}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', gap: 0.5 }}>
                                <IconButton 
                                  size="small" 
                                  color="success"
                                  onClick={() => {
                                    // Find customer for this invoice
                                    const customer = customers.find(c => c.name === invoice.customer_name);
                                    if (customer) {
                                      // Set selectedCustomer with specific invoice data
                                      const customerWithInvoice = {
                                        ...customer,
                                        selectedInvoice: invoice
                                      };
                                      setSelectedCustomer(customerWithInvoice);
                                      setPaymentData(prev => ({ 
                                        ...prev, 
                                        amount: Math.abs(invoice.remaining_amount || invoice.total_amount || 0)
                                      }));
                                      setPaymentDialogOpen(true);
                                    } else {
                                      alert('مشتری یافت نشد');
                                    }
                                  }}
                                  title="دریافت پرداخت"
                                >
                                  <Payment />
                                </IconButton>
                                <IconButton 
                                  size="small" 
                                  color="info"
                                  onClick={() => {
                                    // Find customer for this invoice
                                    const customer = customers.find(c => c.name === invoice.customer_name);
                                    if (customer) {
                                      // Set selectedCustomer with specific invoice data
                                      const customerWithInvoice = {
                                        ...customer,
                                        selectedInvoice: invoice
                                      };
                                      setSelectedCustomer(customerWithInvoice);
                                      setInstallmentDialogOpen(true);
                                    } else {
                                      alert('مشتری یافت نشد');
                                    }
                                  }}
                                  title="ایجاد برنامه اقساط"
                                >
                                  <AccountBalance />
                                </IconButton>
                                <IconButton 
                                  size="small" 
                                  color="primary"
                                  onClick={() => {
                                    // Find customer for this invoice and show details
                                    const customer = customers.find(c => c.name === invoice.customer_name);
                                    if (customer) {
                                      handleViewCustomerDetails(customer);
                                    }
                                  }}
                                  title="مشاهده جزئیات مشتری"
                                >
                                  <Visibility />
                                </IconButton>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>



          {/* Unpaid Transactions Alert */}
          {debtSummary.total_unpaid_transactions > 0 && (
            <Grid item xs={12}>
              <Alert 
                severity="error" 
                sx={{ fontFamily: 'Vazirmatn, sans-serif' }}
                action={
                  <Button color="inherit" size="small" sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>
                    مشاهده جزئیات
                  </Button>
                }
              >
                <Typography sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>
                  <strong>{debtSummary.total_unpaid_transactions} فاکتور</strong> با روش پرداخت "پرداخت نشده" وجود دارد.
                  مجموع مبلغ: <strong>{(debtSummary.total_debt_amount || 0).toLocaleString('fa-IR')} تومان</strong>
                </Typography>
              </Alert>
            </Grid>
          )}


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
                   value={newTransaction.type === 'receipt' ? 'sales' : 'purchase'}
                   disabled
                   label="دسته‌بندی"
                   sx={{ fontFamily: 'Vazirmatn, sans-serif' }}
                 >
                   <MenuItem value="sales" sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>فروش</MenuItem>
                   <MenuItem value="purchase" sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>خرید</MenuItem>
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

       {/* Edit Transaction Dialog */}
       <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
         <DialogTitle sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>
           ویرایش تراکنش
         </DialogTitle>
         <DialogContent>
           <Grid container spacing={2} sx={{ mt: 1 }}>
             <Grid item xs={12} md={6}>
               <FormControl fullWidth>
                 <InputLabel sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>نوع تراکنش</InputLabel>
                 <Select
                   value={editingTransaction?.type || 'receipt'}
                   disabled
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
                 value={editingTransaction?.amount || 0}
                 onChange={(e) => setEditingTransaction(prev => ({ ...prev, amount: e.target.value }))}
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
                   value={editingTransaction?.paymentMethod || 'cash'}
                   onChange={(e) => setEditingTransaction(prev => ({ ...prev, paymentMethod: e.target.value }))}
                   label="روش پرداخت"
                   sx={{ fontFamily: 'Vazirmatn, sans-serif' }}
                 >
                   <MenuItem value="cash" sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>نقدی</MenuItem>
                   <MenuItem value="card" sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>کارت</MenuItem>
                   <MenuItem value="check" sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>چک</MenuItem>
                   <MenuItem value="transfer" sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>انتقال بانکی</MenuItem>
                   <MenuItem value="unpaid" sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>پرداخت نشده</MenuItem>
                 </Select>
               </FormControl>
             </Grid>
             <Grid item xs={12} md={6}>
               <FormControl fullWidth>
                 <InputLabel sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>دسته‌بندی</InputLabel>
                 <Select
                   value={editingTransaction?.category || 'sales'}
                   disabled
                   label="دسته‌بندی"
                   sx={{ fontFamily: 'Vazirmatn, sans-serif' }}
                 >
                   <MenuItem value="sales" sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>فروش</MenuItem>
                   <MenuItem value="purchase" sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>خرید</MenuItem>
                 </Select>
               </FormControl>
             </Grid>
             <Grid item xs={12}>
               <TextField
                 label="شرح تراکنش"
                 value={editingTransaction?.description || ''}
                 onChange={(e) => setEditingTransaction(prev => ({ ...prev, description: e.target.value }))}
                 fullWidth
                 multiline
                 rows={2}
                 InputLabelProps={{ sx: { fontFamily: 'Vazirmatn, sans-serif' } }}
                 InputProps={{ sx: { fontFamily: 'Vazirmatn, sans-serif' } }}
               />
             </Grid>
             <Grid item xs={12} md={6}>
               <TextField
                 label="نام مشتری/تامین‌کننده"
                 value={editingTransaction?.customerName || ''}
                 onChange={(e) => setEditingTransaction(prev => ({ ...prev, customerName: e.target.value }))}
                 fullWidth
                 InputLabelProps={{ sx: { fontFamily: 'Vazirmatn, sans-serif' } }}
                 InputProps={{ sx: { fontFamily: 'Vazirmatn, sans-serif' } }}
               />
             </Grid>
             <Grid item xs={12} md={6}>
               <TextField
                 label="توضیحات اضافی"
                 value={editingTransaction?.notes || ''}
                 onChange={(e) => setEditingTransaction(prev => ({ ...prev, notes: e.target.value }))}
                 fullWidth
                 multiline
                 rows={2}
                 InputLabelProps={{ sx: { fontFamily: 'Vazirmatn, sans-serif' } }}
                 InputProps={{ sx: { fontFamily: 'Vazirmatn, sans-serif' } }}
               />
             </Grid>
             
             {editingTransaction?.paymentMethod === 'check' && (
               <>
                 <Grid item xs={12} md={6}>
                   <TextField
                     label="شماره چک"
                     value={editingTransaction?.checkNumber || ''}
                     onChange={(e) => setEditingTransaction(prev => ({ ...prev, checkNumber: e.target.value }))}
                     fullWidth
                     InputLabelProps={{ sx: { fontFamily: 'Vazirmatn, sans-serif' } }}
                     InputProps={{ sx: { fontFamily: 'Vazirmatn, sans-serif' } }}
                   />
                 </Grid>
                 <Grid item xs={12} md={6}>
                   <TextField
                     label="نام بانک"
                     value={editingTransaction?.bankName || ''}
                     onChange={(e) => setEditingTransaction(prev => ({ ...prev, bankName: e.target.value }))}
                     fullWidth
                     InputLabelProps={{ sx: { fontFamily: 'Vazirmatn, sans-serif' } }}
                     InputProps={{ sx: { fontFamily: 'Vazirmatn, sans-serif' } }}
                   />
                 </Grid>
               </>
             )}
             
             {editingTransaction?.paymentMethod === 'transfer' && (
               <Grid item xs={12} md={6}>
                 <TextField
                   label="شماره مرجع"
                   value={editingTransaction?.transferReference || ''}
                   onChange={(e) => setEditingTransaction(prev => ({ ...prev, transferReference: e.target.value }))}
                   fullWidth
                   InputLabelProps={{ sx: { fontFamily: 'Vazirmatn, sans-serif' } }}
                   InputProps={{ sx: { fontFamily: 'Vazirmatn, sans-serif' } }}
                 />
               </Grid>
             )}
           </Grid>
         </DialogContent>
         <DialogActions>
           <Button 
             onClick={() => {
               setEditDialogOpen(false);
               setEditingTransaction(null);
             }} 
             sx={{ fontFamily: 'Vazirmatn, sans-serif' }}
           >
             انصراف
           </Button>
           <Button
             onClick={handleUpdateTransaction}
             variant="contained"
             sx={{
               backgroundColor: '#2196f3',
               '&:hover': { backgroundColor: '#1976d2' },
               fontFamily: 'Vazirmatn, sans-serif'
             }}
           >
             بروزرسانی
           </Button>
         </DialogActions>
       </Dialog>

       {/* Payment Dialog */}
       <Dialog open={paymentDialogOpen} onClose={() => setPaymentDialogOpen(false)} maxWidth="sm" fullWidth>
         <DialogTitle sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>
           دریافت پرداخت از {selectedCustomer?.name}
           {selectedCustomer?.selectedInvoice && (
             <Typography variant="subtitle2" sx={{ fontFamily: 'Vazirmatn, sans-serif', color: 'text.secondary' }}>
               فاکتور شماره: {selectedCustomer.selectedInvoice.transaction_number}
             </Typography>
           )}
         </DialogTitle>
         <DialogContent>
           <Grid container spacing={2} sx={{ mt: 1 }}>
             {selectedCustomer?.selectedInvoice ? (
               <Grid item xs={12}>
                 <Typography variant="body2" sx={{ fontFamily: 'Vazirmatn, sans-serif', mb: 1 }}>
                   <strong>فاکتور شماره:</strong> {selectedCustomer.selectedInvoice.transaction_number}
                 </Typography>
                 <Typography variant="body2" sx={{ fontFamily: 'Vazirmatn, sans-serif', mb: 1 }}>
                   <strong>تاریخ فاکتور:</strong> {new Date(selectedCustomer.selectedInvoice.transaction_date).toLocaleDateString('fa-IR')}
                 </Typography>
                                   <Typography variant="body2" sx={{ fontFamily: 'Vazirmatn, sans-serif', mb: 2 }}>
                    <strong>مبلغ قابل پرداخت:</strong> <span style={{ color: '#e74c3c', fontWeight: 'bold' }}>
                      {Math.abs(selectedCustomer.selectedInvoice.remaining_amount || selectedCustomer.selectedInvoice.total_amount || 0).toLocaleString('fa-IR')} تومان
                    </span>
                  </Typography>
               </Grid>
             ) : (
               <Grid item xs={12}>
                 <Typography variant="body2" sx={{ fontFamily: 'Vazirmatn, sans-serif', mb: 2 }}>
                   مانده بدهی: <strong>{(selectedCustomer?.remainingAmount || 0).toLocaleString('fa-IR')} تومان</strong>
                 </Typography>
               </Grid>
             )}
             <Grid item xs={12}>
               <TextField
                 label="مبلغ پرداخت"
                 type="number"
                 value={paymentData.amount}
                 onChange={(e) => setPaymentData(prev => ({ ...prev, amount: e.target.value }))}
                 fullWidth
                 InputProps={{
                   endAdornment: <InputAdornment position="end">تومان</InputAdornment>,
                   sx: { fontFamily: 'Vazirmatn, sans-serif' }
                 }}
                 InputLabelProps={{ sx: { fontFamily: 'Vazirmatn, sans-serif' } }}
               />
             </Grid>
             <Grid item xs={12}>
               <FormControl fullWidth>
                 <InputLabel sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>روش پرداخت</InputLabel>
                 <Select
                   value={paymentData.payment_method}
                   onChange={(e) => setPaymentData(prev => ({ ...prev, payment_method: e.target.value }))}
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
             <Grid item xs={12}>
               <TextField
                 label="توضیحات"
                 value={paymentData.notes}
                 onChange={(e) => setPaymentData(prev => ({ ...prev, notes: e.target.value }))}
                 fullWidth
                 multiline
                 rows={2}
                 InputLabelProps={{ sx: { fontFamily: 'Vazirmatn, sans-serif' } }}
                 InputProps={{ sx: { fontFamily: 'Vazirmatn, sans-serif' } }}
               />
             </Grid>
           </Grid>
         </DialogContent>
         <DialogActions>
           <Button 
             onClick={() => {
               setPaymentDialogOpen(false);
               setSelectedCustomer(null);
               setPaymentData({ amount: 0, payment_method: 'cash', notes: '' });
             }}
             sx={{ fontFamily: 'Vazirmatn, sans-serif' }}
           >
             انصراف
           </Button>
           <Button
             onClick={handlePayCustomerDebt}
             variant="contained"
             sx={{
               backgroundColor: '#27ae60',
               '&:hover': { backgroundColor: '#219a52' },
               fontFamily: 'Vazirmatn, sans-serif'
             }}
           >
             ثبت پرداخت
           </Button>
         </DialogActions>
       </Dialog>

       {/* Installment Plan Dialog */}
       <Dialog open={installmentDialogOpen} onClose={() => setInstallmentDialogOpen(false)} maxWidth="sm" fullWidth>
         <DialogTitle sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>
           ایجاد برنامه اقساط برای {selectedCustomer?.name}
           {selectedCustomer?.selectedInvoice && (
             <Typography variant="subtitle2" sx={{ fontFamily: 'Vazirmatn, sans-serif', color: 'text.secondary' }}>
               فاکتور شماره: {selectedCustomer.selectedInvoice.transaction_number}
             </Typography>
           )}
         </DialogTitle>
         <DialogContent>
           <Grid container spacing={2} sx={{ mt: 1 }}>
             {selectedCustomer?.selectedInvoice ? (
               <Grid item xs={12}>
                 <Typography variant="body2" sx={{ fontFamily: 'Vazirmatn, sans-serif', mb: 1 }}>
                   <strong>فاکتور شماره:</strong> {selectedCustomer.selectedInvoice.transaction_number}
                 </Typography>
                 <Typography variant="body2" sx={{ fontFamily: 'Vazirmatn, sans-serif', mb: 1 }}>
                   <strong>تاریخ فاکتور:</strong> {new Date(selectedCustomer.selectedInvoice.transaction_date).toLocaleDateString('fa-IR')}
                 </Typography>
                                   <Typography variant="body2" sx={{ fontFamily: 'Vazirmatn, sans-serif', mb: 2 }}>
                    <strong>مبلغ قابل اقساط:</strong> <span style={{ color: '#e74c3c', fontWeight: 'bold' }}>
                      {Math.abs(selectedCustomer.selectedInvoice.remaining_amount || selectedCustomer.selectedInvoice.total_amount || 0).toLocaleString('fa-IR')} تومان
                    </span>
                  </Typography>
               </Grid>
             ) : (
               <Grid item xs={12}>
                 <Typography variant="body2" sx={{ fontFamily: 'Vazirmatn, sans-serif', mb: 2 }}>
                   مانده بدهی: <strong>{(selectedCustomer?.remainingAmount || 0).toLocaleString('fa-IR')} تومان</strong>
                 </Typography>
               </Grid>
             )}
             <Grid item xs={12}>
               <TextField
                 label="تعداد اقساط"
                 type="number"
                 value={newInstallment.number_of_installments}
                 onChange={(e) => setNewInstallment(prev => ({ ...prev, number_of_installments: e.target.value }))}
                 fullWidth
                 InputProps={{ sx: { fontFamily: 'Vazirmatn, sans-serif' } }}
                 InputLabelProps={{ sx: { fontFamily: 'Vazirmatn, sans-serif' } }}
               />
             </Grid>
             <Grid item xs={12}>
               <TextField
                 label="تاریخ شروع"
                 type="date"
                 value={newInstallment.start_date}
                 onChange={(e) => setNewInstallment(prev => ({ ...prev, start_date: e.target.value }))}
                 fullWidth
                 InputLabelProps={{ 
                   shrink: true,
                   sx: { fontFamily: 'Vazirmatn, sans-serif' }
                 }}
                 InputProps={{ sx: { fontFamily: 'Vazirmatn, sans-serif' } }}
               />
             </Grid>
             <Grid item xs={12}>
               <TextField
                 label="توضیحات"
                 value={newInstallment.notes}
                 onChange={(e) => setNewInstallment(prev => ({ ...prev, notes: e.target.value }))}
                 fullWidth
                 multiline
                 rows={2}
                 InputLabelProps={{ sx: { fontFamily: 'Vazirmatn, sans-serif' } }}
                 InputProps={{ sx: { fontFamily: 'Vazirmatn, sans-serif' } }}
               />
             </Grid>
             {newInstallment.number_of_installments > 0 && (
               <Grid item xs={12}>
                 <Box sx={{ p: 2, backgroundColor: '#f5f5f5', borderRadius: 2 }}>
                   <Typography variant="body2" sx={{ fontFamily: 'Vazirmatn, sans-serif', mb: 1 }}>
                     <strong>پیش‌نمایش اقساط:</strong>
                   </Typography>
                   <Typography variant="body2" sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>
                     مبلغ هر قسط: {(() => {
                       const totalAmount = selectedCustomer?.selectedInvoice 
                         ? Math.abs(selectedCustomer.selectedInvoice.remaining_amount || selectedCustomer.selectedInvoice.total_amount || 0)
                         : Math.abs(selectedCustomer?.remainingAmount || 0);
                       return Math.ceil(totalAmount / parseInt(newInstallment.number_of_installments || 1)).toLocaleString('fa-IR');
                     })()} تومان
                   </Typography>
                 </Box>
               </Grid>
             )}
           </Grid>
         </DialogContent>
         <DialogActions>
           <Button 
             onClick={() => {
               setInstallmentDialogOpen(false);
               setSelectedCustomer(null);
               setNewInstallment({
                 number_of_installments: 3,
                 start_date: new Date().toISOString().split('T')[0],
                 notes: ''
               });
             }}
             sx={{ fontFamily: 'Vazirmatn, sans-serif' }}
           >
             انصراف
           </Button>
           <Button
             onClick={handleCreateInstallmentPlan}
             variant="contained"
             sx={{
               backgroundColor: '#3498db',
               '&:hover': { backgroundColor: '#2980b9' },
               fontFamily: 'Vazirmatn, sans-serif'
             }}
           >
             ایجاد برنامه اقساط
           </Button>
         </DialogActions>
       </Dialog>

       {/* Customer Detail Dialog */}
       <Dialog open={customerDetailDialogOpen} onClose={() => setCustomerDetailDialogOpen(false)} maxWidth="md" fullWidth>
         <DialogTitle sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>
           جزئیات بدهی {selectedCustomer?.name}
         </DialogTitle>
         <DialogContent>
           <Grid container spacing={3} sx={{ mt: 1 }}>
             {/* Customer Info */}
             <Grid item xs={12} md={6}>
               <Card variant="outlined">
                 <CardContent>
                   <Typography variant="h6" gutterBottom sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>
                     اطلاعات مشتری
                   </Typography>
                   <Typography sx={{ fontFamily: 'Vazirmatn, sans-serif', mb: 1 }}>
                     <strong>نام:</strong> {selectedCustomer?.name}
                   </Typography>
                   <Typography sx={{ fontFamily: 'Vazirmatn, sans-serif', mb: 1 }}>
                     <strong>تلفن:</strong> {selectedCustomer?.phone || 'نامشخص'}
                   </Typography>
                   <Typography sx={{ fontFamily: 'Vazirmatn, sans-serif', mb: 1 }}>
                     <strong>تعداد فاکتورها:</strong> {selectedCustomer?.transactionCount}
                   </Typography>
                   <Typography sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>
                     <strong>آخرین خرید:</strong> {selectedCustomer?.lastTransactionDate ? 
                       new Date(selectedCustomer.lastTransactionDate).toLocaleDateString('fa-IR') : 'نامشخص'}
                   </Typography>
                 </CardContent>
               </Card>
             </Grid>

             {/* Financial Summary */}
             <Grid item xs={12} md={6}>
               <Card variant="outlined">
                 <CardContent>
                   <Typography variant="h6" gutterBottom sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>
                     خلاصه مالی
                   </Typography>
                   <Typography sx={{ fontFamily: 'Vazirmatn, sans-serif', mb: 1 }}>
                     <strong>کل خریدها:</strong> {(selectedCustomer?.totalDebt || 0).toLocaleString('fa-IR')} تومان
                   </Typography>
                   <Typography sx={{ fontFamily: 'Vazirmatn, sans-serif', mb: 1, color: '#27ae60' }}>
                     <strong>پرداخت شده:</strong> {(selectedCustomer?.totalPaid || 0).toLocaleString('fa-IR')} تومان
                   </Typography>
                   <Typography sx={{ fontFamily: 'Vazirmatn, sans-serif', mb: 1, color: '#e74c3c' }}>
                     <strong>مانده بدهی:</strong> {(selectedCustomer?.remainingAmount || 0).toLocaleString('fa-IR')} تومان
                   </Typography>
                   <Box sx={{ mt: 2 }}>
                     <Typography variant="body2" sx={{ fontFamily: 'Vazirmatn, sans-serif', mb: 1 }}>
                       درصد پرداخت
                     </Typography>
                     <LinearProgress
                       variant="determinate"
                       value={selectedCustomer?.totalDebt > 0 ? 
                         Math.min(((selectedCustomer.totalPaid / selectedCustomer.totalDebt) * 100), 100) : 0
                       }
                       sx={{ 
                         height: 10, 
                         borderRadius: 5,
                         backgroundColor: '#f0f0f0',
                         '& .MuiLinearProgress-bar': {
                           backgroundColor: '#3498db'
                         }
                       }}
                     />
                   </Box>
                 </CardContent>
               </Card>
             </Grid>

             {/* Transactions List */}
             <Grid item xs={12}>
               <Card variant="outlined">
                 <CardContent>
                   <Typography variant="h6" gutterBottom sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>
                     فاکتورهای بدهکار
                   </Typography>
                   <TableContainer>
                     <Table size="small">
                       <TableHead>
                         <TableRow>
                           <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif', fontWeight: 'bold' }}>شماره فاکتور</TableCell>
                           <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif', fontWeight: 'bold' }}>تاریخ</TableCell>
                           <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif', fontWeight: 'bold' }}>مبلغ کل</TableCell>
                           <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif', fontWeight: 'bold' }}>پرداخت شده</TableCell>
                           <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif', fontWeight: 'bold' }}>مانده</TableCell>
                           <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif', fontWeight: 'bold' }}>وضعیت</TableCell>
                         </TableRow>
                       </TableHead>
                       <TableBody>
                         {selectedCustomer?.transactions?.filter(t => t.remaining_amount > 0).map((transaction, index) => (
                           <TableRow key={index}>
                             <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>
                               {transaction.transaction_number}
                             </TableCell>
                             <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>
                               {new Date(transaction.transaction_date).toLocaleDateString('fa-IR')}
                             </TableCell>
                             <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>
                               {transaction.total_amount.toLocaleString('fa-IR')} تومان
                             </TableCell>
                             <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif', color: '#27ae60' }}>
                               {transaction.paid_amount.toLocaleString('fa-IR')} تومان
                             </TableCell>
                             <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif', color: '#e74c3c' }}>
                               {transaction.remaining_amount.toLocaleString('fa-IR')} تومان
                             </TableCell>
                             <TableCell>
                               <Chip
                                 label={transaction.payment_status === 'partial' ? 'پرداخت جزئی' : 'پرداخت نشده'}
                                 color={transaction.payment_status === 'partial' ? 'warning' : 'error'}
                                 size="small"
                                 sx={{ fontFamily: 'Vazirmatn, sans-serif' }}
                               />
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
         </DialogContent>
         <DialogActions>
           <Button 
             onClick={() => {
               setCustomerDetailDialogOpen(false);
               setSelectedCustomer(null);
             }}
             sx={{ fontFamily: 'Vazirmatn, sans-serif' }}
           >
             بستن
           </Button>
           <Button
             onClick={() => {
               setCustomerDetailDialogOpen(false);
               setPaymentDialogOpen(true);
             }}
             variant="contained"
             sx={{
               backgroundColor: '#27ae60',
               '&:hover': { backgroundColor: '#219a52' },
               fontFamily: 'Vazirmatn, sans-serif'
             }}
           >
             دریافت پرداخت
           </Button>
         </DialogActions>
       </Dialog>
    </Box>
  );
};

export default FinanceManagement;

