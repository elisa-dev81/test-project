import React, { useState, useEffect, useMemo, memo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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
  Autocomplete,
  Tab,
  Tabs,
  CircularProgress,
} from '@mui/material';
import {
  Add,
  Delete,
  PictureAsPdf,
  TrendingUp,
  Receipt,
  ShoppingCart,
  Scale,
  Assessment,
  Refresh,
  Save,

  Print,
} from '@mui/icons-material';
import goldPriceService from '../../services/goldPriceApi';
import pdfService from '../../services/pdfService';
import transactionService from '../../services/transactionService';
import { fetchProducts, addProduct, deleteProduct } from '../../store/slices/productSlice';
import { processSale, processPurchase } from '../../store/slices/inventorySlice';

// Separate components to prevent re-creation on each render
const TabPanel = memo(({ children, value, index }) => (
  <div hidden={value !== index} style={{ paddingTop: 20 }}>
    {value === index && children}
  </div>
));

// Extracted InvoiceItemForm component to prevent re-creation
const InvoiceItemForm = memo(({ 
  activeTab, 
  products, 
  productsLoading, 
  productsError, 
  invoiceItem, 
  updateInvoiceItem, 
  setInvoiceItem,
  isProductInInvoice,
  calculateItemPrice,
  handleAddItem,
  dispatch,
  fetchProducts,
  inventory
}) => (
  <Card sx={{ mb: 3 }}>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontFamily: 'Vazirmatn, sans-serif', color: 'primary.main' }}>
          افزودن کالا
        </Typography>
        {activeTab === 0 && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<Refresh />}
            onClick={() => dispatch(fetchProducts())}
            disabled={productsLoading}
            sx={{ fontFamily: 'Vazirmatn, sans-serif' }}
          >
            به‌روزرسانی محصولات
          </Button>
        )}
      </Box>

      {activeTab === 0 && productsError && (
        <Alert severity="error" sx={{ mb: 2, fontFamily: 'Vazirmatn, sans-serif' }}>
          {productsError}
        </Alert>
      )}
      
      {activeTab === 0 && !productsLoading && products.length === 0 && (
        <Alert severity="info" sx={{ mb: 2, fontFamily: 'Vazirmatn, sans-serif' }}>
          هیچ محصولی یافت نشد. لطفاً ابتدا محصولات را در بخش مدیریت محصولات اضافه کنید.
        </Alert>
      )}
      
      <Grid container spacing={2}>
        <Grid item xs={12} md={3}>
          {activeTab === 0 ? (
            // Sales Invoice - Autocomplete from products
            <Autocomplete
              options={products.filter(product => !isProductInInvoice(product.id))}
              getOptionLabel={(option) => option.name}
              value={products.find(p => p.id === invoiceItem.productId) || null}
              onChange={(event, newValue) => {
                if (newValue) {
                  console.log('Selected product:', newValue);
                  setInvoiceItem(prev => ({
                    ...prev,
                    productId: parseInt(newValue.id),
                    productName: newValue.name,
                    weight: parseFloat(newValue.weight),
                    purity: parseInt(newValue.purity),
                  }));
                } else {
                  // Clear selection
                  setInvoiceItem(prev => ({
                    ...prev,
                    productId: '',
                    productName: '',
                    weight: 0,
                    purity: 18,
                  }));
                }
              }}
              loading={productsLoading}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="انتخاب محصول"
                  fullWidth
                  InputLabelProps={{ sx: { fontFamily: 'Vazirmatn, sans-serif' } }}
                  InputProps={{ 
                    ...params.InputProps, 
                    sx: { fontFamily: 'Vazirmatn, sans-serif' },
                    endAdornment: (
                      <>
                        {productsLoading ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                  error={!!productsError}
                  helperText={productsError}
                />
              )}
              renderOption={(props, option) => (
                <Box component="li" {...props}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                    <Typography sx={{ fontFamily: 'Vazirmatn, sans-serif', fontWeight: 'bold' }}>
                      {option.name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>
                      وزن: {option.weight} گرم | عیار: {option.purity}
                    </Typography>
                  </Box>
                </Box>
              )}
              noOptionsText="هیچ محصولی یافت نشد"
            />
          ) : (
            // Purchase Invoice - Simple TextField
            <TextField
              label="نام محصول"
              value={invoiceItem.productName || ''}
              onChange={(e) => updateInvoiceItem('productName', e.target.value)}
              fullWidth
              variant="outlined"
              InputLabelProps={{ sx: { fontFamily: 'Vazirmatn, sans-serif' } }}
              InputProps={{ sx: { fontFamily: 'Vazirmatn, sans-serif' } }}
            />
          )}
        </Grid>
        <Grid item xs={12} md={2}>
          <TextField
            label="وزن (گرم)"
            type="number"
            value={invoiceItem.weight || ''}
            onChange={(e) => updateInvoiceItem('weight', parseFloat(e.target.value) || 0)}
            fullWidth
            InputProps={{
              endAdornment: <InputAdornment position="end"><Scale /></InputAdornment>,
              sx: { fontFamily: 'Vazirmatn, sans-serif' }
            }}
            InputLabelProps={{ sx: { fontFamily: 'Vazirmatn, sans-serif' } }}
          />
        </Grid>
        <Grid item xs={12} md={2}>
          <FormControl fullWidth>
            <InputLabel sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>عیار</InputLabel>
            <Select
              value={invoiceItem.purity || 18}
              onChange={(e) => updateInvoiceItem('purity', e.target.value)}
              label="عیار"
              sx={{ fontFamily: 'Vazirmatn, sans-serif' }}
            >
              <MenuItem value={24} sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>24 عیار</MenuItem>
              <MenuItem value={22} sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>22 عیار</MenuItem>
              <MenuItem value={21} sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>21 عیار</MenuItem>
              <MenuItem value={18} sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>18 عیار</MenuItem>
              <MenuItem value={14} sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>14 عیار</MenuItem>
              <MenuItem value={925} sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>نقره 925</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={2}>
          <TextField
            label="تعداد"
            type="number"
            value={invoiceItem.quantity || ''}
            onChange={(e) => updateInvoiceItem('quantity', parseInt(e.target.value) || 1)}
            fullWidth
            InputLabelProps={{ sx: { fontFamily: 'Vazirmatn, sans-serif' } }}
            InputProps={{ sx: { fontFamily: 'Vazirmatn, sans-serif' } }}
          />
        </Grid>
        {activeTab === 0 && invoiceItem.productId && (
          <Grid item xs={12} md={2}>
            <TextField
              label="موجودی فعلی"
              value={(() => {
                const inventoryItem = inventory.find(item => item.productId === invoiceItem.productId);
                return inventoryItem ? inventoryItem.availableQuantity : 0;
              })()}
              disabled
              fullWidth
              InputLabelProps={{ sx: { fontFamily: 'Vazirmatn, sans-serif' } }}
              InputProps={{ 
                sx: { 
                  fontFamily: 'Vazirmatn, sans-serif',
                  color: (() => {
                    const inventoryItem = inventory.find(item => item.productId === invoiceItem.productId);
                    if (!inventoryItem || inventoryItem.availableQuantity === 0) return '#f44336';
                    if (inventoryItem.availableQuantity <= inventoryItem.minStockLevel) return '#ff9800';
                    return '#4caf50';
                  })()
                }
              }}
            />
          </Grid>
        )}
        <Grid item xs={12} md={2}>
          <TextField
            label="قیمت واحد"
            value={calculateItemPrice(invoiceItem.weight, invoiceItem.purity).toLocaleString('fa-IR')}
            disabled
            fullWidth
            InputProps={{
              endAdornment: <InputAdornment position="end">تومان</InputAdornment>,
              sx: { fontFamily: 'Vazirmatn, sans-serif' }
            }}
            InputLabelProps={{ sx: { fontFamily: 'Vazirmatn, sans-serif' } }}
          />
        </Grid>
        <Grid item xs={12} md={1}>
          <Button
            variant="contained"
            onClick={handleAddItem}
            sx={{ 
              height: '56px', 
              fontFamily: 'Vazirmatn, sans-serif',
              backgroundColor: '#4caf50',
              '&:hover': {
                backgroundColor: '#45a049'
              }
            }}
            fullWidth
          >
            <Add />
          </Button>
        </Grid>
      </Grid>
    </CardContent>
  </Card>
));

const SalesManagement = () => {
  const dispatch = useDispatch();
  
  // Redux selectors
  const { products, loading: productsLoading, error: productsError } = useSelector(state => state.products);
  const { inventory } = useSelector(state => state.inventory);
  
  // State management
  const [activeTab, setActiveTab] = useState(0);
  const [currentGoldPrice, setCurrentGoldPrice] = useState(0);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [supplierPhone, setSupplierPhone] = useState('');

  const [saleInvoice, setSaleInvoice] = useState({
    id: '',
    date: new Date().toISOString().split('T')[0],
    items: [],
    subtotal: 0,
    laborCost: 0,
    commission: 0,
    tax: 9,
    profit: 0,
    total: 0,
    paymentMethod: 'cash',
    notes: '',
  });
  
  const [purchaseInvoice, setPurchaseInvoice] = useState({
    id: '',
    date: new Date().toISOString().split('T')[0],
    items: [],
    subtotal: 0,
    discount: 0,
    total: 0,
    paymentMethod: 'cash',
    notes: '',
  });

  const [invoiceItem, setInvoiceItem] = useState({
    productId: '',
    productName: '',
    weight: 0,
    purity: 18,
    unitPrice: 0,
    quantity: 1,
    total: 0,
  });

  const [pdfDialogOpen, setPdfDialogOpen] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState(null);
  const [printDialogOpen, setPrintDialogOpen] = useState(false);
  const [currentPrintInvoice, setCurrentPrintInvoice] = useState(null);
  
  // Saved invoices for reports
  const [savedSaleInvoices, setSavedSaleInvoices] = useState([]);
  const [savedPurchaseInvoices, setSavedPurchaseInvoices] = useState([]);

  // Load invoices from database
  useEffect(() => {
    const loadInvoices = async () => {
      try {
        const salesResponse = await transactionService.getSales();
        const purchasesResponse = await transactionService.getPurchases();
        
        // Check if we have the right structure
        const salesTransactions = salesResponse.data?.transactions || [];
        const purchasesTransactions = purchasesResponse.data?.transactions || [];
        
        // Convert transaction_date to date for filtering
        const processedSales = salesTransactions.map(invoice => ({
          ...invoice,
          date: new Date(invoice.transaction_date).toISOString().split('T')[0],
          customerName: invoice.customer_name,
          customerPhone: invoice.customer_phone,
          total: parseFloat(invoice.total_amount)
        }));
        
        const processedPurchases = purchasesTransactions.map(invoice => ({
          ...invoice,
          date: new Date(invoice.transaction_date).toISOString().split('T')[0],
          supplierName: invoice.customer_name,
          supplierPhone: invoice.customer_phone,
          total: parseFloat(invoice.total_amount)
        }));
        
        setSavedSaleInvoices(processedSales);
        setSavedPurchaseInvoices(processedPurchases);
      } catch (error) {
        console.error('Error loading transactions:', error);
      }
    };

    loadInvoices();
  }, []);

  // Fetch products and gold price on component mount
  useEffect(() => {
    dispatch(fetchProducts());
    fetchGoldPrice();
    
    // Subscribe to gold price updates
    const unsubscribe = goldPriceService.subscribe((priceData) => {
      setCurrentGoldPrice(priceData.gold24k);
    });
    
    return () => {
      unsubscribe();
    };
  }, [dispatch]);

  const fetchGoldPrice = async () => {
    try {
      const priceData = await goldPriceService.fetchGoldPrice();
      setCurrentGoldPrice(priceData.gold24k);
    } catch (error) {
      console.error('خطا در دریافت نرخ طلا:', error);
      setCurrentGoldPrice(3200000); // fallback price
    }
  };

  // Calculate item price based on gold price
  const calculateItemPrice = (weight, purity) => {
    if (purity >= 900) {
      // Silver calculation (purity 925, 950, etc.)
      return goldPriceService.calculatePrice(weight, purity, 'silver');
    } else {
      // Gold calculation (purity 14, 18, 21, 22, 24)
      return goldPriceService.calculatePrice(weight, purity, 'gold');
    }
  };



  // Helper function to safely update state - simple functions
  const updateSaleInvoice = (field, value) => {
    setSaleInvoice(prev => ({ ...prev, [field]: value }));
  };

  const updatePurchaseInvoice = (field, value) => {
    setPurchaseInvoice(prev => ({ ...prev, [field]: value }));
  };

  const updateInvoiceItem = (field, value) => {
    setInvoiceItem(prev => ({ ...prev, [field]: value }));
  };

  // Customer info handlers - simple functions
  const handleCustomerNameChange = (e) => {
    setCustomerName(e.target.value);
  };

  const handleCustomerPhoneChange = (e) => {
    setCustomerPhone(e.target.value);
  };

  // Supplier info handlers
  const handleSupplierNameChange = (e) => {
    setSupplierName(e.target.value);
  };

  const handleSupplierPhoneChange = (e) => {
    setSupplierPhone(e.target.value);
  };

  // Check if product already exists in invoice
  const isProductInInvoice = (productIdOrName) => {
    const currentItems = activeTab === 0 ? saleInvoice.items : purchaseInvoice.items;
    if (activeTab === 0) {
      // Sales Invoice - check by productId
      return currentItems.some(item => item.productId === productIdOrName);
    } else {
      // Purchase Invoice - check by productName
      return currentItems.some(item => item.productName === productIdOrName);
    }
  };

  // Check inventory availability for sales
  const checkInventoryAvailability = (productId, requestedQuantity) => {
    const inventoryItem = inventory.find(item => item.productId === productId);
    
    if (!inventoryItem) {
      return {
        available: false,
        message: 'این محصول در موجودی یافت نشد. ابتدا باید آن را خریداری کنید.'
      };
    }
    
    if (inventoryItem.availableQuantity < requestedQuantity) {
      return {
        available: false,
        message: `موجودی کافی نیست. موجودی فعلی: ${inventoryItem.availableQuantity}، درخواستی: ${requestedQuantity}`
      };
    }
    
    return {
      available: true,
      message: 'موجودی کافی است'
    };
  };

  // Add item to invoice
  const handleAddItem = () => {
    if (!invoiceItem.productName) {
      alert('لطفاً نام محصول را وارد کنید');
      return;
    }
    
    if (invoiceItem.weight <= 0) {
      alert('لطفاً وزن محصول را وارد کنید');
      return;
    }
    
    if (invoiceItem.quantity <= 0) {
      alert('لطفاً تعداد محصول را وارد کنید');
      return;
    }

    // Check if product already exists in invoice
    if (activeTab === 0) {
      if (isProductInInvoice(invoiceItem.productId)) {
        alert('این محصول قبلاً در فاکتور اضافه شده است');
        return;
      }
      
      // For sales, check inventory availability
      const inventoryCheck = checkInventoryAvailability(invoiceItem.productId, invoiceItem.quantity);
      if (!inventoryCheck.available) {
        alert(inventoryCheck.message);
        return;
      }
    } else {
      if (isProductInInvoice(invoiceItem.productName)) {
        alert('این محصول قبلاً در فاکتور اضافه شده است');
        return;
      }
    }

    const basePrice = calculateItemPrice(invoiceItem.weight, invoiceItem.purity);
    const total = basePrice * invoiceItem.quantity;

    const newItem = {
      ...invoiceItem,
      id: Date.now(),
      productId: activeTab === 0 ? invoiceItem.productId : Date.now().toString(), // Use actual productId for sales
      unitPrice: basePrice,
      total: total,
    };

    if (activeTab === 0) {
      setSaleInvoice(prev => ({
        ...prev,
        items: [...prev.items, newItem]
      }));
    } else {
      setPurchaseInvoice(prev => ({
        ...prev,
        items: [...prev.items, newItem]
      }));
    }

    // Reset item form
    setInvoiceItem({
      productId: '',
      productName: '',
      weight: 0,
      purity: 18,
      unitPrice: 0,
      quantity: 1,
      total: 0,
    });
  };

  // Remove item from invoice
  const handleRemoveItem = (itemId) => {
    if (activeTab === 0) {
      setSaleInvoice(prev => ({
        ...prev,
        items: prev.items.filter(item => item.id !== itemId)
      }));
    } else {
      setPurchaseInvoice(prev => ({
        ...prev,
        items: prev.items.filter(item => item.id !== itemId)
      }));
    }
  };

  // Calculate invoice totals
  const calculateInvoiceTotal = (invoice, type = 'sale') => {
    const subtotal = invoice.items.reduce((sum, item) => sum + item.total, 0);
    
    if (type === 'sale') {
      const laborCost = invoice.laborCost || 0;
      const commission = invoice.commission || 0;
      const tax = (subtotal + laborCost + commission) * (invoice.tax / 100);
      const profit = invoice.profit || 0;
      const total = subtotal + laborCost + commission + tax + profit;
      
      return {
        subtotal,
        laborCost,
        commission,
        tax,
        profit,
        total
      };
    } else {
      const discount = invoice.discount || 0;
      const total = subtotal - discount;
      
      return {
        subtotal,
        discount,
        total
      };
    }
  };

  // Calculate totals directly - use useMemo to prevent unnecessary re-renders
  const saleTotals = useMemo(() => 
    calculateInvoiceTotal(saleInvoice, 'sale'), 
    [saleInvoice.items, saleInvoice.laborCost, saleInvoice.commission, saleInvoice.tax, saleInvoice.profit]
  );
  
  const purchaseTotals = useMemo(() => 
    calculateInvoiceTotal(purchaseInvoice, 'purchase'), 
    [purchaseInvoice.items, purchaseInvoice.discount]
  );

  // Update invoice state with calculated totals - REMOVED to prevent focus loss
  // useEffect(() => {
  //   setSaleInvoice(prev => ({ ...prev, ...saleTotals }));
  // }, [saleTotals]);

  // useEffect(() => {
  //   setPurchaseInvoice(prev => ({ ...prev, ...purchaseTotals }));
  // }, [purchaseTotals]);

  // Generate PDF invoice
  const handleGeneratePDF = async (invoice, type) => {
    try {
      setCurrentInvoice({ ...invoice, type });
      
      if (type === 'sale') {
        await pdfService.generateSaleInvoicePDF(invoice);
      } else {
        await pdfService.generatePurchaseInvoicePDF(invoice);
      }
      
      setPdfDialogOpen(true);
    } catch (error) {
      console.error('خطا در تولید PDF:', error);
      alert('خطا در تولید فایل PDF');
    }
  };

  // Delete sold products from product list
  const handleDeleteSoldProducts = async (saleItems) => {
    const deletedProducts = [];
    
    for (const item of saleItems) {
      // Only delete if this is a real product (has valid productId)
      if (item.productId && typeof item.productId === 'number') {
        try {
          console.log('Deleting sold product:', item.productName, 'with ID:', item.productId);
          await dispatch(deleteProduct(item.productId)).unwrap();
          deletedProducts.push(item.productName);
        } catch (error) {
          console.error('خطا در حذف محصول فروخته شده:', error);
          // Don't fail the whole process if one product deletion fails
        }
      }
    }
    
    if (deletedProducts.length > 0) {
      console.log('محصولات فروخته شده حذف شدند:', deletedProducts);
      // Refresh products list to reflect deletions
      await dispatch(fetchProducts());
    }
    
    return deletedProducts;
  };

  // Add new products from purchase invoice to product list
  const handleAddNewProducts = async (purchaseItems) => {
    const newProductsAdded = [];
    const updatedPurchaseItems = [...purchaseItems];
    
    for (let i = 0; i < purchaseItems.length; i++) {
      const item = purchaseItems[i];
      
      // Check if product already exists (by name, weight, and purity)
      const existingProduct = products.find(product => 
        product.name === item.productName &&
        product.weight === item.weight &&
        product.purity === item.purity
      );
      
      if (!existingProduct) {
        try {
          const newProductData = {
            name: item.productName,
            weight: item.weight,
            purity: item.purity,
            categoryId: 1, // Default category - you might want to make this selectable
            description: `محصول ایجاد شده از فاکتور خرید`,
            isActive: true
          };
          
          console.log('Adding new product:', newProductData);
          const newProduct = await dispatch(addProduct(newProductData)).unwrap();
          console.log('New product created with ID:', newProduct.id);
          
          // Update the purchase item with the correct productId
          updatedPurchaseItems[i] = {
            ...item,
            productId: newProduct.id
          };
          
          newProductsAdded.push(item.productName);
        } catch (error) {
          console.error('خطا در اضافه کردن محصول جدید:', error);
          // Don't fail the whole process if one product fails
        }
      } else {
        // Update the purchase item with the existing productId
        updatedPurchaseItems[i] = {
          ...item,
          productId: existingProduct.id
        };
      }
    }
    
    if (newProductsAdded.length > 0) {
      console.log('محصولات جدید اضافه شدند:', newProductsAdded);
      // Refresh products list to include new products
      await dispatch(fetchProducts());
    }
    
    return { newProductsAdded, updatedPurchaseItems };
  };

  // Save invoice
  const handleSaveInvoice = async (type) => {
    try {
      const invoice = type === 'sale' ? saleInvoice : purchaseInvoice;
      const customerInfo = type === 'sale' ? { customerName, customerPhone } : { supplierName, supplierPhone };
      
      // Validate required fields
      if (type === 'sale') {
        if (!customerName.trim()) {
          alert('لطفاً نام مشتری را وارد کنید');
          return;
        }
        if (!customerPhone.trim()) {
          alert('لطفاً شماره تلفن مشتری را وارد کنید');
          return;
        }
      } else {
        if (!supplierName.trim()) {
          alert('لطفاً نام تامین‌کننده را وارد کنید');
          return;
        }
        if (!supplierPhone.trim()) {
          alert('لطفاً شماره تلفن تامین‌کننده را وارد کنید');
          return;
        }
      }
      
      if (invoice.items.length === 0) {
        alert('لطفاً حداقل یک کالا به فاکتور اضافه کنید');
        return;
      }

      // Check if gold price is available
      if (!currentGoldPrice || currentGoldPrice === 0) {
        alert('لطفاً منتظر بمانید تا نرخ طلا دریافت شود');
        return;
      }

      // Additional validation for customer name
      const finalCustomerName = type === 'sale' ? customerInfo.customerName : customerInfo.supplierName;
      if (!finalCustomerName || finalCustomerName.trim() === '') {
        alert(`لطفاً نام ${type === 'sale' ? 'مشتری' : 'تامین‌کننده'} را وارد کنید`);
        return;
      }
      
      // Note: Inventory processing is now handled by the server
      
      // Create final invoice object
      const finalInvoice = {
        type: type === 'sale' ? 'sale' : 'purchase',
        customer_name: type === 'sale' ? (customerInfo.customerName || 'مشتری') : (customerInfo.supplierName || 'تامین‌کننده'),
        customer_phone: type === 'sale' ? (customerInfo.customerPhone || '') : (customerInfo.supplierPhone || ''),
        total_weight: invoice.items.reduce((sum, item) => sum + (parseFloat(item.weight) * parseInt(item.quantity)), 0),
        total_amount: type === 'sale' ? saleTotals.total : purchaseTotals.total,
        payment_method: invoice.paymentMethod || 'cash',
        payment_status: 'completed',
        paid_amount: type === 'sale' ? saleTotals.total : purchaseTotals.total,
        remaining_amount: 0,
        gold_price_18k: currentGoldPrice * 0.75, // 18k is 75% of 24k
        gold_price_24k: currentGoldPrice,
        discount_amount: type === 'purchase' ? (purchaseTotals.discount || 0) : 0,
        tax_amount: type === 'sale' ? (saleTotals.tax || 0) : 0,
        notes: invoice.notes || '',
        transaction_date: new Date(),
        items: invoice.items.map(item => ({
          product_id: item.productId && typeof item.productId === 'number' ? item.productId : null,
          item_name: item.productName || 'کالا',
          weight: parseFloat(item.weight) || 0,
          purity: parseInt(item.purity) || 18,
          making_wage: 0,
          unit_price: parseFloat(item.unitPrice) || 0,
          total_price: parseFloat(item.total) || 0,
          quantity: parseInt(item.quantity) || 1
        }))
      };
      
      // Save to database
      try {
        console.log('Final invoice to be saved:', finalInvoice);
        const response = await transactionService.createTransaction(finalInvoice);
        console.log(`Full response:`, response);
        console.log(`Response data:`, response.data);
        
        // Add the new invoice directly to the state
        const savedTransaction = response.data || response;
        const newInvoice = {
          ...savedTransaction,
          date: new Date().toISOString().split('T')[0],
          customerName: type === 'sale' ? customerName : undefined,
          customerPhone: type === 'sale' ? customerPhone : undefined,
          supplierName: type === 'purchase' ? supplierName : undefined,
          supplierPhone: type === 'purchase' ? supplierPhone : undefined,
          total: type === 'sale' ? saleTotals.total : purchaseTotals.total,
          items: invoice.items
        };
        
        if (type === 'sale') {
          setSavedSaleInvoices(prev => [...prev, newInvoice]);
          
          // حذف محصولات فروخته شده از لیست محصولات
          try {
            for (const item of invoice.items) {
              if (item.productId && typeof item.productId === 'number') {
                await dispatch(deleteProduct(item.productId)).unwrap();
                console.log(`محصول ${item.productName} از لیست محصولات حذف شد`);
              }
            }
            // به‌روزرسانی لیست محصولات
            await dispatch(fetchProducts());
          } catch (error) {
            console.error('خطا در حذف محصولات فروخته شده:', error);
          }
        } else {
          setSavedPurchaseInvoices(prev => [...prev, newInvoice]);
          
          // اضافه کردن محصولات خریداری شده به لیست محصولات
          try {
            for (const item of invoice.items) {
              // بررسی اینکه آیا محصول با همین مشخصات وجود دارد
              const existingProduct = products.find(product => 
                product.name === item.productName &&
                Math.abs(product.weight - item.weight) < 0.01 &&
                product.purity === item.purity
              );
              
              if (!existingProduct) {
                const newProductData = {
                  name: item.productName,
                  weight: parseFloat(item.weight),
                  purity: parseInt(item.purity),
                  category_id: 1, // دسته‌بندی پیش‌فرض
                  description: `محصول ایجاد شده از فاکتور خرید شماره ${savedTransaction.id}`,
                  making_wage: 0
                };
                
                console.log('Adding new product with data:', newProductData);
                const addedProduct = await dispatch(addProduct(newProductData)).unwrap();
                console.log(`محصول جدید ${item.productName} به لیست محصولات اضافه شد:`, addedProduct);
              } else {
                console.log(`محصول ${item.productName} قبلاً در لیست موجود است`);
              }
            }
            // به‌روزرسانی لیست محصولات
            await dispatch(fetchProducts());
          } catch (error) {
            console.error('خطا در اضافه کردن محصولات جدید:', error);
          }
        }
        
        // Show success message
        let successMessage = `فاکتور ${type === 'sale' ? 'فروش' : 'خرید'} با موفقیت ذخیره شد`;
        
        if (type === 'sale') {
          const deletedCount = invoice.items.filter(item => item.productId && typeof item.productId === 'number').length;
          if (deletedCount > 0) {
            successMessage += `\n${deletedCount} محصول فروخته شده از لیست محصولات حذف شد`;
          }
        } else {
          const newProductsCount = invoice.items.filter(item => {
            return !products.find(product => 
              product.name === item.productName &&
              Math.abs(product.weight - item.weight) < 0.01 &&
              product.purity === item.purity
            );
          }).length;
          if (newProductsCount > 0) {
            successMessage += `\n${newProductsCount} محصول جدید به لیست محصولات اضافه شد`;
          }
        }
        
        alert(successMessage);
      } catch (error) {
        console.error('Error saving transaction:', error);
        console.error('Error details:', error.response?.data || error.message);
        alert(`خطا در ذخیره فاکتور: ${error.message || 'خطای نامشخص'}`);
        return;
      }
      
      // Reset form after successful save
      if (type === 'sale') {
        setSaleInvoice({
          id: '',
          date: new Date().toISOString().split('T')[0],
          items: [],
          subtotal: 0,
          laborCost: 0,
          commission: 0,
          tax: 9,
          profit: 0,
          total: 0,
          paymentMethod: 'cash',
          notes: '',
        });
        setCustomerName('');
        setCustomerPhone('');
      } else {
        setPurchaseInvoice({
          id: '',
          date: new Date().toISOString().split('T')[0],
          items: [],
          subtotal: 0,
          discount: 0,
          total: 0,
          paymentMethod: 'cash',
          notes: '',
        });
        setSupplierName('');
        setSupplierPhone('');
      }
      
    } catch (error) {
      console.error('خطا در ذخیره فاکتور:', error);
      console.error('Error details:', error.response?.data || error.message);
      alert(`خطا در ذخیره فاکتور: ${error.message || 'خطای نامشخص'}`);
    }
  };

  // Open print dialog
  const handlePrintInvoice = (invoice, type) => {
    // Create invoice object with customer info for sales
    const invoiceWithInfo = {
      ...invoice,
      customerName: type === 'sale' ? customerName : undefined,
      customerPhone: type === 'sale' ? customerPhone : undefined,
      supplierName: type === 'purchase' ? supplierName : undefined,
      supplierPhone: type === 'purchase' ? supplierPhone : undefined,
    };
    
    setCurrentPrintInvoice({ 
      invoice: invoiceWithInfo, 
      type 
    });
    setPrintDialogOpen(true);
  };

  // Calculate today's reports
  const getTodayReports = () => {
    const today = new Date().toISOString().split('T')[0];
    
    // Filter today's invoices
    const todaySaleInvoices = savedSaleInvoices.filter(invoice => invoice.date === today);
    const todayPurchaseInvoices = savedPurchaseInvoices.filter(invoice => invoice.date === today);
    
    // Calculate totals
    const todaySalesCount = todaySaleInvoices.length;
    const todayPurchaseCount = todayPurchaseInvoices.length;
    
    // Sales = Money received from customers (Revenue)
    const todaySalesTotal = todaySaleInvoices.reduce((sum, invoice) => sum + invoice.total, 0);
    // Purchases = Money paid to suppliers (Expense) 
    const todayPurchaseTotal = todayPurchaseInvoices.reduce((sum, invoice) => sum + invoice.total, 0);
    
    // Net Income = Sales Revenue - Purchase Expenses
    // درآمد خالص = درآمد فروش - هزینه خرید
    const todayIncome = todaySalesTotal - todayPurchaseTotal;
    
    return {
      salesCount: todaySalesCount,
      purchaseCount: todayPurchaseCount,
      salesTotal: todaySalesTotal,
      purchaseTotal: todayPurchaseTotal,
      income: todayIncome
    };
  };



  // Render functions instead of inline components
  const renderTabPanel = (children, value, index) => (
    <div hidden={value !== index} style={{ paddingTop: 20 }}>
      {value === index && children}
    </div>
  );



  const InvoiceItemsTable = ({ items, onRemove }) => (
    <TableContainer component={Paper} sx={{ mb: 3 }}>
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
            <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif', fontWeight: 'bold' }}>کالا</TableCell>
            <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif', fontWeight: 'bold' }}>وزن</TableCell>
            <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif', fontWeight: 'bold' }}>عیار</TableCell>
            <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif', fontWeight: 'bold' }}>تعداد</TableCell>
            {activeTab === 0 && (
              <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif', fontWeight: 'bold' }}>موجودی</TableCell>
            )}
            <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif', fontWeight: 'bold' }}>قیمت واحد</TableCell>
            <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif', fontWeight: 'bold' }}>جمع</TableCell>
            <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif', fontWeight: 'bold' }}>عملیات</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((item) => {
            const inventoryItem = activeTab === 0 ? inventory.find(inv => inv.productId === item.productId) : null;
            const availableQuantity = inventoryItem ? inventoryItem.availableQuantity : 0;
            
            return (
              <TableRow key={item.id}>
                <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>{item.productName}</TableCell>
                <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>{item.weight} گرم</TableCell>
                <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>{item.purity}</TableCell>
                <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>{item.quantity}</TableCell>
                {activeTab === 0 && (
                  <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>
                    <Typography 
                      variant="body2" 
                      color={availableQuantity >= item.quantity ? 'success.main' : 'error.main'}
                      sx={{ fontWeight: 'medium' }}
                    >
                      {availableQuantity} عدد
                    </Typography>
                  </TableCell>
                )}
                <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>{item.unitPrice.toLocaleString('fa-IR')} تومان</TableCell>
                <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>{item.total.toLocaleString('fa-IR')} تومان</TableCell>
                <TableCell>
                  <IconButton onClick={() => onRemove(item.id)} color="error">
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', fontFamily: 'Vazirmatn, sans-serif' }}>
          مدیریت خرید و فروش
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Chip 
            icon={<TrendingUp />}
            label={`نرخ طلا: ${currentGoldPrice.toLocaleString('fa-IR')} تومان`}
            color="warning"
            sx={{ fontFamily: 'Vazirmatn, sans-serif' }}
          />
          <IconButton onClick={fetchGoldPrice} color="primary">
            <Refresh />
          </IconButton>
        </Box>
      </Box>

      {/* Tabs */}
      <Card sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab icon={<ShoppingCart />} label="فاکتور فروش" sx={{ fontFamily: 'Vazirmatn, sans-serif' }} />
          <Tab icon={<Receipt />} label="فاکتور خرید" sx={{ fontFamily: 'Vazirmatn, sans-serif' }} />
          <Tab icon={<Assessment />} label="گزارشات" sx={{ fontFamily: 'Vazirmatn, sans-serif' }} />
        </Tabs>
      </Card>

      {/* Sale Invoice Tab */}
      {renderTabPanel(
        <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
          {/* Header */}
          <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)', color: '#d32f2f' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontFamily: 'Vazirmatn, sans-serif', fontWeight: 'bold', mb: 1 }}>
                    فرم فاکتور فروش
                  </Typography>
                  <Typography variant="body1" sx={{ fontFamily: 'Vazirmatn, sans-serif', opacity: 0.9 }}>
                    شماره فاکتور: {saleInvoice.id || 'جدید'} | تاریخ: {saleInvoice.date}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Main Form */}
          <Card sx={{ mb: 4, boxShadow: 3, borderRadius: 2 }}>
            <CardContent>


              {/* Customer Information Section */}
              <Box sx={{ mb: 4 }}>
                                  <Typography variant="h6" gutterBottom sx={{ 
                    fontFamily: 'Vazirmatn, sans-serif', 
                    color: '#d32f2f',
                    borderBottom: '2px solid #ef5350',
                    pb: 1,
                    mb: 3
                  }}>
                    اطلاعات مشتری
                  </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="نام مشتری"
                      value={customerName}
                      onChange={handleCustomerNameChange}
                      fullWidth
                      variant="outlined"
                      InputLabelProps={{ sx: { fontFamily: 'Vazirmatn, sans-serif' } }}
                      InputProps={{ sx: { fontFamily: 'Vazirmatn, sans-serif' } }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="شماره تلفن"
                      type="tel"
                      value={customerPhone}
                      onChange={handleCustomerPhoneChange}
                      fullWidth
                      variant="outlined"
                      InputLabelProps={{ sx: { fontFamily: 'Vazirmatn, sans-serif' } }}
                      InputProps={{ 
                        sx: { fontFamily: 'Vazirmatn, sans-serif' },
                        inputProps: { pattern: '[0-9]*', inputMode: 'numeric' }
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>

              {/* Items Section */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom sx={{ 
                  fontFamily: 'Vazirmatn, sans-serif', 
                  color: '#d32f2f',
                  borderBottom: '2px solid #ef5350',
                  pb: 1,
                  mb: 3
                }}>
                  اقلام فاکتور
                </Typography>
                <InvoiceItemForm 
                  activeTab={activeTab}
                  products={products}
                  productsLoading={productsLoading}
                  productsError={productsError}
                  invoiceItem={invoiceItem}
                  updateInvoiceItem={updateInvoiceItem}
                  setInvoiceItem={setInvoiceItem}
                  isProductInInvoice={isProductInInvoice}
                  calculateItemPrice={calculateItemPrice}
                  handleAddItem={handleAddItem}
                  dispatch={dispatch}
                  fetchProducts={fetchProducts}
                  inventory={inventory}
                />
                
                {saleInvoice.items.length > 0 && (
                  <Box sx={{ mt: 3 }}>
                    <InvoiceItemsTable 
                      items={saleInvoice.items} 
                      onRemove={handleRemoveItem}
                    />
                  </Box>
                )}
              </Box>



              {/* Actions Section */}
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" gutterBottom sx={{ 
                  fontFamily: 'Vazirmatn, sans-serif', 
                  color: '#d32f2f',
                  borderBottom: '2px solid #ef5350',
                  pb: 1,
                  mb: 3
                }}>
                  عملیات
                </Typography>
                                  <Grid container spacing={2} justifyContent="center">
                    <Grid item xs={12} md={2}>
                      <Button
                        variant="contained"
                        startIcon={<Save />}
                        fullWidth
                        size="large"
                        onClick={() => handleSaveInvoice('sale')}
                        sx={{ 
                          background: 'linear-gradient(45deg, #ef5350 30%, #d32f2f 90%)',
                          color: 'white',
                          fontFamily: 'Vazirmatn, sans-serif',
                          fontWeight: 'bold',
                          '&:hover': {
                            background: 'linear-gradient(45deg, #d32f2f 30%, #ef5350 90%)'
                          }
                        }}
                      >
                        ذخیره فاکتور
                      </Button>
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <Button
                        variant="outlined"
                        startIcon={<PictureAsPdf />}
                        fullWidth
                        size="large"
                        sx={{ 
                          fontFamily: 'Vazirmatn, sans-serif',
                          borderColor: '#ef5350',
                          color: '#ef5350',
                          '&:hover': {
                            borderColor: '#d32f2f',
                            backgroundColor: 'rgba(239, 83, 80, 0.1)'
                          }
                        }}
                        onClick={() => handleGeneratePDF(saleInvoice, 'sale')}
                      >
                        تولید PDF
                      </Button>
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <Button
                        variant="outlined"
                        startIcon={<Print />}
                        fullWidth
                        size="large"
                        sx={{ 
                          fontFamily: 'Vazirmatn, sans-serif',
                          borderColor: '#ef5350',
                          color: '#ef5350',
                          '&:hover': {
                            borderColor: '#d32f2f',
                            backgroundColor: 'rgba(239, 83, 80, 0.1)'
                          }
                        }}
                        onClick={() => handlePrintInvoice(saleInvoice, 'sale')}
                      >
                        چاپ فاکتور
                      </Button>
                    </Grid>

                  </Grid>
              </Box>
            </CardContent>
          </Card>

          {/* Saved Sale Invoices */}
          {savedSaleInvoices.length > 0 && (
            <Card sx={{ mb: 3, boxShadow: 3, borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" sx={{ 
                  fontFamily: 'Vazirmatn, sans-serif',
                  fontWeight: 'bold',
                  color: '#d32f2f',
                  mb: 2,
                  borderBottom: '2px solid #ef5350',
                  pb: 1
                }}>
                  فاکتورهای فروش ذخیره شده
                </Typography>
                <TableContainer component={Paper} sx={{ boxShadow: 2 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#fff3e0' }}>
                        <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif', fontWeight: 'bold', color: '#e65100' }}>شماره فاکتور</TableCell>
                        <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif', fontWeight: 'bold', color: '#e65100' }}>نام مشتری</TableCell>
                        <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif', fontWeight: 'bold', color: '#e65100' }}>تلفن</TableCell>
                        <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif', fontWeight: 'bold', color: '#e65100' }}>مبلغ کل</TableCell>
                        <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif', fontWeight: 'bold', color: '#e65100' }}>تاریخ</TableCell>
                        <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif', fontWeight: 'bold', color: '#e65100' }}>عملیات</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {savedSaleInvoices.map((invoice) => (
                        <TableRow key={invoice.id} sx={{ '&:hover': { backgroundColor: '#fff8e1' } }}>
                          <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>{invoice.id}</TableCell>
                          <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>{invoice.customerName}</TableCell>
                          <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>{invoice.customerPhone}</TableCell>
                          <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif', fontWeight: 'bold', color: '#e67e22' }}>
                            {invoice.total.toLocaleString('fa-IR')} تومان
                          </TableCell>
                          <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>{invoice.date}</TableCell>
                          <TableCell>
                            <IconButton
                              size="small"
                              onClick={async () => {
                                if (window.confirm('آیا از حذف این فاکتور فروش اطمینان دارید؟')) {
                                  try {
                                    await transactionService.deleteTransaction(invoice.id);
                                    setSavedSaleInvoices(prev => prev.filter(item => item.id !== invoice.id));
                                    alert('فاکتور فروش با موفقیت حذف شد');
                                  } catch (error) {
                                    console.error('Error deleting sale invoice:', error);
                                    alert('خطا در حذف فاکتور فروش');
                                  }
                                }
                              }}
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
          )}

          {/* Invoice Preview */}
          {saleInvoice.items.length > 0 && (
            <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
              <CardContent>
                                  <Typography variant="h5" gutterBottom sx={{ 
                    fontFamily: 'Vazirmatn, sans-serif', 
                    color: '#d32f2f',
                    textAlign: 'center',
                    mb: 3,
                    borderBottom: '3px solid #ef5350',
                    pb: 2
                  }}>
                    فاکتور فروش
                  </Typography>
                <Box sx={{ 
                  border: '2px solid #e0e0e0', 
                  borderRadius: 2, 
                  p: 3,
                  background: '#fafafa'
                }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" sx={{ fontFamily: 'Vazirmatn, sans-serif', mb: 2 }}>
                        اطلاعات مشتری:
                      </Typography>
                      <Typography sx={{ fontFamily: 'Vazirmatn, sans-serif', mb: 1 }}>
                        نام: {customerName || 'وارد نشده'}
                      </Typography>
                      <Typography sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>
                        تلفن: {customerPhone || 'وارد نشده'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" sx={{ fontFamily: 'Vazirmatn, sans-serif', mb: 2 }}>
                        جزئیات فاکتور:
                      </Typography>
                      <Typography sx={{ fontFamily: 'Vazirmatn, sans-serif', mb: 1 }}>
                        تاریخ: {saleInvoice.date}
                      </Typography>
                      <Typography sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>
                        تعداد اقلام: {saleInvoice.items.length}
                      </Typography>
                    </Grid>
                  </Grid>
                  <Divider sx={{ my: 3 }} />
                  <Typography variant="h6" sx={{ fontFamily: 'Vazirmatn, sans-serif', mb: 2 }}>
                    اقلام فاکتور:
                  </Typography>
                  <TableContainer component={Paper} sx={{ mb: 3 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                          <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif', fontWeight: 'bold' }}>کالا</TableCell>
                          <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif', fontWeight: 'bold' }}>وزن</TableCell>
                          <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif', fontWeight: 'bold' }}>عیار</TableCell>
                          <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif', fontWeight: 'bold' }}>تعداد</TableCell>
                          <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif', fontWeight: 'bold' }}>قیمت واحد</TableCell>
                          <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif', fontWeight: 'bold' }}>جمع</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {saleInvoice.items.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>{item.productName}</TableCell>
                            <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>{item.weight} گرم</TableCell>
                            <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>{item.purity}</TableCell>
                            <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>{item.quantity}</TableCell>
                            <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>{item.unitPrice.toLocaleString('fa-IR')} تومان</TableCell>
                            <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>{item.total.toLocaleString('fa-IR')} تومان</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <Box sx={{ textAlign: 'left', mt: 2 }}>
                    <Typography variant="h6" sx={{ fontFamily: 'Vazirmatn, sans-serif', color: '#d32f2f', fontWeight: 'bold' }}>
                      مبلغ نهایی: {saleTotals.total.toLocaleString('fa-IR')} تومان
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          )}
        </Box>, 
        activeTab, 
        0
      )}

      {/* Purchase Invoice Tab */}
      {renderTabPanel(
        <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
          {/* Header */}
          <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)', color: '#2e7d32' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontFamily: 'Vazirmatn, sans-serif', fontWeight: 'bold', mb: 1 }}>
                    فرم فاکتور خرید
                  </Typography>
                  <Typography variant="body1" sx={{ fontFamily: 'Vazirmatn, sans-serif', opacity: 0.9 }}>
                    شماره فاکتور: {purchaseInvoice.id || 'جدید'} | تاریخ: {purchaseInvoice.date}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Main Form */}
          <Card sx={{ mb: 4, boxShadow: 3, borderRadius: 2 }}>
            <CardContent>


              {/* Supplier Information Section */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom sx={{ 
                  fontFamily: 'Vazirmatn, sans-serif', 
                  color: '#2e7d32',
                  borderBottom: '2px solid #4caf50',
                  pb: 1,
                  mb: 3
                }}>
                  اطلاعات تامین‌کننده
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="نام تامین‌کننده"
                      value={supplierName}
                      onChange={handleSupplierNameChange}
                      fullWidth
                      variant="outlined"
                      InputLabelProps={{ sx: { fontFamily: 'Vazirmatn, sans-serif' } }}
                      InputProps={{ sx: { fontFamily: 'Vazirmatn, sans-serif' } }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="شماره تلفن"
                      type="tel"
                      value={supplierPhone}
                      onChange={handleSupplierPhoneChange}
                      fullWidth
                      variant="outlined"
                      InputLabelProps={{ sx: { fontFamily: 'Vazirmatn, sans-serif' } }}
                      InputProps={{ 
                        sx: { fontFamily: 'Vazirmatn, sans-serif' },
                        inputProps: { pattern: '[0-9]*', inputMode: 'numeric' }
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>

              {/* Items Section */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom sx={{ 
                  fontFamily: 'Vazirmatn, sans-serif', 
                  color: '#2e7d32',
                  borderBottom: '2px solid #4caf50',
                  pb: 1,
                  mb: 3
                }}>
                  اقلام فاکتور
                </Typography>
                <InvoiceItemForm 
                  activeTab={activeTab}
                  products={products}
                  productsLoading={productsLoading}
                  productsError={productsError}
                  invoiceItem={invoiceItem}
                  updateInvoiceItem={updateInvoiceItem}
                  setInvoiceItem={setInvoiceItem}
                  isProductInInvoice={isProductInInvoice}
                  calculateItemPrice={calculateItemPrice}
                  handleAddItem={handleAddItem}
                  dispatch={dispatch}
                  fetchProducts={fetchProducts}
                  inventory={inventory}
                />
                
                {purchaseInvoice.items.length > 0 && (
                  <Box sx={{ mt: 3 }}>
                    <InvoiceItemsTable 
                      items={purchaseInvoice.items} 
                      onRemove={handleRemoveItem}
                    />
                  </Box>
                )}
              </Box>



              {/* Actions Section */}
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" gutterBottom sx={{ 
                  fontFamily: 'Vazirmatn, sans-serif', 
                  color: '#2e7d32',
                  borderBottom: '2px solid #4caf50',
                  pb: 1,
                  mb: 3
                }}>
                  عملیات
                </Typography>
                                <Grid container spacing={2} justifyContent="center">
                  <Grid item xs={12} md={4}>
                    <Button
                      variant="contained"
                      startIcon={<Save />}
                      fullWidth
                      size="large"
                      onClick={() => handleSaveInvoice('purchase')}
                      sx={{ 
                        background: 'linear-gradient(45deg, #4caf50 30%, #2e7d32 90%)',
                        color: 'white',
                        fontFamily: 'Vazirmatn, sans-serif',
                        fontWeight: 'bold',
                        '&:hover': {
                          background: 'linear-gradient(45deg, #2e7d32 30%, #4caf50 90%)'
                        }
                      }}
                    >
                      ذخیره فاکتور خرید
                    </Button>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Button
                      variant="outlined"
                      startIcon={<PictureAsPdf />}
                      fullWidth
                      size="large"
                      sx={{ 
                        fontFamily: 'Vazirmatn, sans-serif',
                        borderColor: '#4caf50',
                        color: '#4caf50',
                        '&:hover': {
                          borderColor: '#2e7d32',
                          backgroundColor: 'rgba(76, 175, 80, 0.1)'
                        }
                      }}
                      onClick={() => handleGeneratePDF(purchaseInvoice, 'purchase')}
                    >
                      تولید PDF
                    </Button>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Button
                      variant="outlined"
                      startIcon={<Print />}
                      fullWidth
                      size="large"
                      sx={{ 
                        fontFamily: 'Vazirmatn, sans-serif',
                        borderColor: '#4caf50',
                        color: '#4caf50',
                        '&:hover': {
                          borderColor: '#2e7d32',
                          backgroundColor: 'rgba(76, 175, 80, 0.1)'
                        }
                      }}
                      onClick={() => handlePrintInvoice(purchaseInvoice, 'purchase')}
                    >
                      چاپ فاکتور
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>

          {/* Saved Purchase Invoices */}
          {savedPurchaseInvoices.length > 0 && (
            <Card sx={{ mb: 3, boxShadow: 3, borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" sx={{ 
                  fontFamily: 'Vazirmatn, sans-serif',
                  fontWeight: 'bold',
                  color: '#2e7d32',
                  mb: 2,
                  borderBottom: '2px solid #4caf50',
                  pb: 1
                }}>
                  فاکتورهای خرید ذخیره شده
                </Typography>
                <TableContainer component={Paper} sx={{ boxShadow: 2 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#e8f5e8' }}>
                        <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif', fontWeight: 'bold', color: '#2e7d32' }}>شماره فاکتور</TableCell>
                        <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif', fontWeight: 'bold', color: '#2e7d32' }}>نام تامین‌کننده</TableCell>
                        <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif', fontWeight: 'bold', color: '#2e7d32' }}>تلفن</TableCell>
                        <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif', fontWeight: 'bold', color: '#2e7d32' }}>مبلغ کل</TableCell>
                        <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif', fontWeight: 'bold', color: '#2e7d32' }}>تاریخ</TableCell>
                        <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif', fontWeight: 'bold', color: '#2e7d32' }}>عملیات</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {savedPurchaseInvoices.map((invoice) => (
                        <TableRow key={invoice.id} sx={{ '&:hover': { backgroundColor: '#f1f8e9' } }}>
                          <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>{invoice.id}</TableCell>
                          <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>{invoice.supplierName}</TableCell>
                          <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>{invoice.supplierPhone}</TableCell>
                          <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif', fontWeight: 'bold', color: '#27ae60' }}>
                            {invoice.total.toLocaleString('fa-IR')} تومان
                          </TableCell>
                          <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>{invoice.date}</TableCell>
                          <TableCell>
                            <IconButton
                              size="small"
                              onClick={async () => {
                                if (window.confirm('آیا از حذف این فاکتور خرید اطمینان دارید؟')) {
                                  try {
                                    await transactionService.deleteTransaction(invoice.id);
                                    setSavedPurchaseInvoices(prev => prev.filter(item => item.id !== invoice.id));
                                    alert('فاکتور خرید با موفقیت حذف شد');
                                  } catch (error) {
                                    console.error('Error deleting purchase invoice:', error);
                                    alert('خطا در حذف فاکتور خرید');
                                  }
                                }
                              }}
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
          )}

          {/* Invoice Preview */}
          {purchaseInvoice.items.length > 0 && (
            <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
              <CardContent>
                                  <Typography variant="h5" gutterBottom sx={{ 
                    fontFamily: 'Vazirmatn, sans-serif', 
                    color: '#2e7d32',
                    textAlign: 'center',
                    mb: 3,
                    borderBottom: '3px solid #4caf50',
                    pb: 2
                  }}>
                    فاکتور خرید
                  </Typography>
                <Box sx={{ 
                  border: '2px solid #e0e0e0', 
                  borderRadius: 2, 
                  p: 3,
                  background: '#fafafa'
                }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" sx={{ fontFamily: 'Vazirmatn, sans-serif', mb: 2 }}>
                        اطلاعات تامین‌کننده:
                      </Typography>
                      <Typography sx={{ fontFamily: 'Vazirmatn, sans-serif', mb: 1 }}>
                        نام: {supplierName || 'وارد نشده'}
                      </Typography>
                      <Typography sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>
                        تلفن: {supplierPhone || 'وارد نشده'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" sx={{ fontFamily: 'Vazirmatn, sans-serif', mb: 2 }}>
                        جزئیات فاکتور:
                      </Typography>
                      <Typography sx={{ fontFamily: 'Vazirmatn, sans-serif', mb: 1 }}>
                        تاریخ: {purchaseInvoice.date}
                      </Typography>
                      <Typography sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>
                        تعداد اقلام: {purchaseInvoice.items.length}
                      </Typography>
                    </Grid>
                  </Grid>
                  <Divider sx={{ my: 3 }} />
                  <Typography variant="h6" sx={{ fontFamily: 'Vazirmatn, sans-serif', mb: 2 }}>
                    اقلام فاکتور:
                  </Typography>
                  <TableContainer component={Paper} sx={{ mb: 3 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                          <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif', fontWeight: 'bold' }}>کالا</TableCell>
                          <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif', fontWeight: 'bold' }}>وزن</TableCell>
                          <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif', fontWeight: 'bold' }}>عیار</TableCell>
                          <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif', fontWeight: 'bold' }}>تعداد</TableCell>
                          <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif', fontWeight: 'bold' }}>قیمت واحد</TableCell>
                          <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif', fontWeight: 'bold' }}>جمع</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {purchaseInvoice.items.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>{item.productName}</TableCell>
                            <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>{item.weight} گرم</TableCell>
                            <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>{item.purity}</TableCell>
                            <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>{item.quantity}</TableCell>
                            <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>{item.unitPrice.toLocaleString('fa-IR')} تومان</TableCell>
                            <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>{item.total.toLocaleString('fa-IR')} تومان</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <Box sx={{ textAlign: 'left', mt: 2 }}>
                    <Typography variant="h6" sx={{ fontFamily: 'Vazirmatn, sans-serif', color: '#2e7d32', fontWeight: 'bold' }}>
                      مبلغ نهایی: {purchaseTotals.total.toLocaleString('fa-IR')} تومان
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          )}
        </Box>, 
        activeTab, 
        1
      )}

      {/* Reports Tab */}
      {renderTabPanel(
        <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
          {/* Header */}
          <Typography variant="h4" component="h1" sx={{ 
            fontWeight: 'bold', 
            fontFamily: 'Vazirmatn, sans-serif',
            textAlign: 'center',
            mb: 4,
            color: '#2c3e50',
            borderBottom: '3px solid #3498db',
            pb: 2
          }}>
            گزارشات روزانه
          </Typography>
          
          {/* Today's Date */}
          <Typography variant="h6" sx={{ 
            fontFamily: 'Vazirmatn, sans-serif',
            textAlign: 'center',
            mb: 4,
            color: '#7f8c8d',
            backgroundColor: '#ecf0f1',
            py: 1,
            borderRadius: 2
          }}>
            {new Date().toLocaleDateString('fa-IR', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              weekday: 'long'
            })}
          </Typography>

          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
                         <Grid item xs={12} md={4}>
               <Card sx={{ 
                 boxShadow: 4,
                 borderRadius: 3,
                 background: 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)',
                 border: '2px solid #ff9800',
                 transition: 'transform 0.3s ease-in-out',
                 '&:hover': {
                   transform: 'translateY(-5px)',
                   boxShadow: 6
                 }
               }}>
                 <CardContent sx={{ textAlign: 'center', py: 3 }}>
                   <Typography variant="h6" gutterBottom sx={{ 
                     fontFamily: 'Vazirmatn, sans-serif', 
                     color: '#e65100',
                     fontWeight: 'bold',
                     mb: 2
                   }}>
                     فروش امروز
                   </Typography>
                   <Typography variant="h3" sx={{ 
                     color: '#e67e22', 
                     fontFamily: 'Vazirmatn, sans-serif', 
                     fontWeight: 'bold',
                     mb: 1
                   }}>
                     {getTodayReports().salesCount}
                   </Typography>
                   <Typography variant="body1" sx={{ 
                     fontFamily: 'Vazirmatn, sans-serif',
                     color: '#e65100',
                     fontWeight: 'medium'
                   }}>
                     فاکتور فروش
                   </Typography>
                   <Typography variant="h6" sx={{ 
                     fontFamily: 'Vazirmatn, sans-serif',
                     color: '#e67e22',
                     mt: 2,
                     fontWeight: 'bold'
                   }}>
                     {getTodayReports().salesTotal.toLocaleString('fa-IR')} تومان
                   </Typography>
                 </CardContent>
               </Card>
             </Grid>
            
                         <Grid item xs={12} md={4}>
               <Card sx={{ 
                 boxShadow: 4,
                 borderRadius: 3,
                 background: 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)',
                 border: '2px solid #4caf50',
                 transition: 'transform 0.3s ease-in-out',
                 '&:hover': {
                   transform: 'translateY(-5px)',
                   boxShadow: 6
                 }
               }}>
                 <CardContent sx={{ textAlign: 'center', py: 3 }}>
                   <Typography variant="h6" gutterBottom sx={{ 
                     fontFamily: 'Vazirmatn, sans-serif', 
                     color: '#2e7d32',
                     fontWeight: 'bold',
                     mb: 2
                   }}>
                     خرید امروز
                   </Typography>
                   <Typography variant="h3" sx={{ 
                     color: '#27ae60', 
                     fontFamily: 'Vazirmatn, sans-serif', 
                     fontWeight: 'bold',
                     mb: 1
                   }}>
                     {getTodayReports().purchaseCount}
                   </Typography>
                   <Typography variant="body1" sx={{ 
                     fontFamily: 'Vazirmatn, sans-serif',
                     color: '#2e7d32',
                     fontWeight: 'medium'
                   }}>
                     فاکتور خرید
                   </Typography>
                   <Typography variant="h6" sx={{ 
                     fontFamily: 'Vazirmatn, sans-serif',
                     color: '#27ae60',
                     mt: 2,
                     fontWeight: 'bold'
                   }}>
                     {getTodayReports().purchaseTotal.toLocaleString('fa-IR')} تومان
                   </Typography>
                 </CardContent>
               </Card>
             </Grid>
            
                         <Grid item xs={12} md={4}>
               <Card sx={{ 
                 boxShadow: 4,
                 borderRadius: 3,
                 background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                 border: '2px solid #2196f3',
                 transition: 'transform 0.3s ease-in-out',
                 '&:hover': {
                   transform: 'translateY(-5px)',
                   boxShadow: 6
                 }
               }}>
                 <CardContent sx={{ textAlign: 'center', py: 3 }}>
                   <Typography variant="h6" gutterBottom sx={{ 
                     fontFamily: 'Vazirmatn, sans-serif', 
                     color: '#1565c0',
                     fontWeight: 'bold',
                     mb: 2
                   }}>
                     درآمد خالص امروز
                   </Typography>
                   <Typography variant="h3" sx={{ 
                     color: '#1976d2', 
                     fontFamily: 'Vazirmatn, sans-serif', 
                     fontWeight: 'bold',
                     mb: 1
                   }}>
                     {getTodayReports().income >= 0 ? '+' : ''}{getTodayReports().income.toLocaleString('fa-IR')}
                   </Typography>
                   <Typography variant="body1" sx={{ 
                     fontFamily: 'Vazirmatn, sans-serif',
                     color: '#1565c0',
                     fontWeight: 'medium'
                   }}>
                     تومان
                   </Typography>
                   <Typography variant="body2" sx={{ 
                     fontFamily: 'Vazirmatn, sans-serif',
                     color: getTodayReports().income >= 0 ? '#27ae60' : '#e74c3c',
                     mt: 1,
                     fontWeight: 'bold'
                   }}>
                     {getTodayReports().income >= 0 ? 'سود' : 'زیان'}
                   </Typography>
                   <Typography variant="caption" sx={{ 
                     fontFamily: 'Vazirmatn, sans-serif',
                     color: '#666',
                     mt: 1,
                     display: 'block'
                   }}>
                     فروش - خرید
                   </Typography>
                 </CardContent>
               </Card>
             </Grid>
          </Grid>

          {/* Saved Invoices Section */}
          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" sx={{ 
              fontFamily: 'Vazirmatn, sans-serif',
              fontWeight: 'bold',
              textAlign: 'center',
              mb: 3,
              color: '#2c3e50',
              borderBottom: '2px solid #3498db',
              pb: 1
            }}>
              فاکتورهای ذخیره شده امروز
            </Typography>
            
            {/* Sale Invoices */}
            {savedSaleInvoices.filter(invoice => invoice.date === new Date().toISOString().split('T')[0]).length > 0 && (
              <Card sx={{ mb: 3, boxShadow: 3, borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ 
                    fontFamily: 'Vazirmatn, sans-serif',
                    fontWeight: 'bold',
                    color: '#e65100',
                    mb: 2,
                    borderBottom: '2px solid #ff9800',
                    pb: 1
                  }}>
                    فاکتورهای فروش
                  </Typography>
                  <TableContainer component={Paper} sx={{ boxShadow: 2 }}>
                    <Table size="small">
                                               <TableHead>
                           <TableRow sx={{ backgroundColor: '#fff3e0' }}>
                             <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif', fontWeight: 'bold', color: '#e65100' }}>شماره فاکتور</TableCell>
                             <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif', fontWeight: 'bold', color: '#e65100' }}>نام مشتری</TableCell>
                             <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif', fontWeight: 'bold', color: '#e65100' }}>تلفن</TableCell>
                             <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif', fontWeight: 'bold', color: '#e65100' }}>تعداد اقلام</TableCell>
                             <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif', fontWeight: 'bold', color: '#e65100' }}>مبلغ کل</TableCell>
                             <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif', fontWeight: 'bold', color: '#e65100' }}>تاریخ</TableCell>
                             <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif', fontWeight: 'bold', color: '#e65100' }}>عملیات</TableCell>
                           </TableRow>
                         </TableHead>
                      <TableBody>
                        {savedSaleInvoices
                          .filter(invoice => invoice.date === new Date().toISOString().split('T')[0])
                                                     .map((invoice) => (
                             <TableRow key={invoice.id} sx={{ '&:hover': { backgroundColor: '#fff8e1' } }}>
                               <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>{invoice.id}</TableCell>
                               <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>{invoice.customerName}</TableCell>
                               <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>{invoice.customerPhone}</TableCell>
                               <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>{invoice.items.length}</TableCell>
                               <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif', fontWeight: 'bold', color: '#e67e22' }}>
                                 {invoice.total.toLocaleString('fa-IR')} تومان
                               </TableCell>
                               <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>{invoice.date}</TableCell>
                               <TableCell>
                                 <IconButton
                                   size="small"
                                   onClick={async () => {
                                     if (window.confirm('آیا از حذف این فاکتور فروش اطمینان دارید؟')) {
                                       try {
                                         await transactionService.deleteTransaction(invoice.id);
                                         setSavedSaleInvoices(prev => prev.filter(item => item.id !== invoice.id));
                                         alert('فاکتور فروش با موفقیت حذف شد');
                                       } catch (error) {
                                         console.error('Error deleting sale invoice:', error);
                                         alert('خطا در حذف فاکتور فروش');
                                       }
                                     }
                                   }}
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
            )}
            
            {/* Purchase Invoices */}
            {savedPurchaseInvoices.filter(invoice => invoice.date === new Date().toISOString().split('T')[0]).length > 0 && (
              <Card sx={{ mb: 3, boxShadow: 3, borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ 
                    fontFamily: 'Vazirmatn, sans-serif',
                    fontWeight: 'bold',
                    color: '#2e7d32',
                    mb: 2,
                    borderBottom: '2px solid #4caf50',
                    pb: 1
                  }}>
                    فاکتورهای خرید
                  </Typography>
                  <TableContainer component={Paper} sx={{ boxShadow: 2 }}>
                    <Table size="small">
                                               <TableHead>
                           <TableRow sx={{ backgroundColor: '#e8f5e8' }}>
                             <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif', fontWeight: 'bold', color: '#2e7d32' }}>شماره فاکتور</TableCell>
                             <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif', fontWeight: 'bold', color: '#2e7d32' }}>نام تامین‌کننده</TableCell>
                             <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif', fontWeight: 'bold', color: '#2e7d32' }}>تلفن</TableCell>
                             <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif', fontWeight: 'bold', color: '#2e7d32' }}>تعداد اقلام</TableCell>
                             <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif', fontWeight: 'bold', color: '#2e7d32' }}>مبلغ کل</TableCell>
                             <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif', fontWeight: 'bold', color: '#2e7d32' }}>تاریخ</TableCell>
                             <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif', fontWeight: 'bold', color: '#2e7d32' }}>عملیات</TableCell>
                           </TableRow>
                         </TableHead>
                      <TableBody>
                        {savedPurchaseInvoices
                          .filter(invoice => invoice.date === new Date().toISOString().split('T')[0])
                                                     .map((invoice) => (
                             <TableRow key={invoice.id} sx={{ '&:hover': { backgroundColor: '#f1f8e9' } }}>
                               <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>{invoice.id}</TableCell>
                               <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>{invoice.supplierName}</TableCell>
                               <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>{invoice.supplierPhone}</TableCell>
                               <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>{invoice.items.length}</TableCell>
                               <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif', fontWeight: 'bold', color: '#27ae60' }}>
                                 {invoice.total.toLocaleString('fa-IR')} تومان
                               </TableCell>
                               <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>{invoice.date}</TableCell>
                               <TableCell>
                                 <IconButton
                                   size="small"
                                   onClick={async () => {
                                     if (window.confirm('آیا از حذف این فاکتور خرید اطمینان دارید؟')) {
                                       try {
                                         await transactionService.deleteTransaction(invoice.id);
                                         setSavedPurchaseInvoices(prev => prev.filter(item => item.id !== invoice.id));
                                         alert('فاکتور خرید با موفقیت حذف شد');
                                       } catch (error) {
                                         console.error('Error deleting purchase invoice:', error);
                                         alert('خطا در حذف فاکتور خرید');
                                       }
                                     }
                                   }}
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
            )}
            
            {/* No Invoices Message */}
            {savedSaleInvoices.filter(invoice => invoice.date === new Date().toISOString().split('T')[0]).length === 0 && 
             savedPurchaseInvoices.filter(invoice => invoice.date === new Date().toISOString().split('T')[0]).length === 0 && (
              <Card sx={{ 
                boxShadow: 3, 
                borderRadius: 2,
                background: 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)',
                border: '2px solid #9e9e9e'
              }}>
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="h6" sx={{ 
                    fontFamily: 'Vazirmatn, sans-serif',
                    color: '#616161',
                    fontWeight: 'bold'
                  }}>
                    هیچ فاکتوری برای امروز ذخیره نشده است
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    fontFamily: 'Vazirmatn, sans-serif',
                    color: '#757575',
                    mt: 1
                  }}>
                    فاکتورهای فروش و خرید امروز در اینجا نمایش داده خواهند شد
                  </Typography>
                </CardContent>
              </Card>
            )}
          </Box>
        </Box>, 
        activeTab, 
        2
      )}

      {/* PDF Generation Dialog */}
      <Dialog open={pdfDialogOpen} onClose={() => setPdfDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>
          تولید فاکتور PDF
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontFamily: 'Vazirmatn, sans-serif', mb: 2 }}>
            فاکتور {currentInvoice?.type === 'sale' ? 'فروش' : 'خرید'} آماده تولید است.
          </Typography>
          <Alert severity="info">
            <Typography sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>
              فایل PDF در پوشه دانلود ذخیره خواهد شد.
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPdfDialogOpen(false)} sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>
            انصراف
          </Button>
          <Button 
            variant="contained" 
            startIcon={<PictureAsPdf />}
            sx={{ 
              backgroundColor: '#d4af37',
              '&:hover': { backgroundColor: '#b8941f' },
              fontFamily: 'Vazirmatn, sans-serif'
            }}
            onClick={() => {
              console.log('تولید PDF:', currentInvoice);
              alert('فایل PDF تولید شد');
              setPdfDialogOpen(false);
            }}
          >
            تولید PDF
          </Button>
        </DialogActions>
      </Dialog>

      {/* Print Invoice Dialog */}
      <Dialog open={printDialogOpen} onClose={() => setPrintDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ fontFamily: 'Vazirmatn, sans-serif', textAlign: 'center' }}>
          چاپ فاکتور {currentPrintInvoice?.type === 'sale' ? 'فروش' : 'خرید'}
        </DialogTitle>
        <DialogContent>
          {currentPrintInvoice && currentPrintInvoice.invoice && (
            <Box sx={{ p: 2 }}>
              {/* Invoice Header */}
              <Box sx={{ 
                textAlign: 'center', 
                mb: 3, 
                p: 2, 
                border: '2px solid #e0e0e0', 
                borderRadius: 2,
                background: currentPrintInvoice.type === 'sale' ? '#fff5f5' : '#f0f8f0'
              }}>
                <Typography variant="h4" sx={{ 
                  fontFamily: 'Vazirmatn, sans-serif', 
                  fontWeight: 'bold',
                  color: currentPrintInvoice.type === 'sale' ? '#d32f2f' : '#2e7d32',
                  mb: 1
                }}>
                  فاکتور {currentPrintInvoice.type === 'sale' ? 'فروش' : 'خرید'}
                </Typography>
                <Typography variant="h6" sx={{ fontFamily: 'Vazirmatn, sans-serif', mb: 1 }}>
                  شماره: {currentPrintInvoice.invoice.id || 'جدید'}
                </Typography>
                <Typography variant="body1" sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>
                  تاریخ: {currentPrintInvoice.invoice.date}
                </Typography>
              </Box>

              {/* Customer/Supplier Info */}
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ 
                    p: 2, 
                    border: '1px solid #e0e0e0', 
                    borderRadius: 1,
                    background: '#fafafa'
                  }}>
                    <Typography variant="h6" sx={{ 
                      fontFamily: 'Vazirmatn, sans-serif', 
                      mb: 2,
                      color: currentPrintInvoice.type === 'sale' ? '#d32f2f' : '#2e7d32'
                    }}>
                      {currentPrintInvoice.type === 'sale' ? 'اطلاعات مشتری:' : 'اطلاعات تامین‌کننده:'}
                    </Typography>
                    <Typography sx={{ fontFamily: 'Vazirmatn, sans-serif', mb: 1 }}>
                      نام: {currentPrintInvoice.type === 'sale' ? 
                        (currentPrintInvoice.invoice.customerName || 'وارد نشده') : 
                        (currentPrintInvoice.invoice.supplierName || 'وارد نشده')}
                    </Typography>
                    <Typography sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>
                      تلفن: {currentPrintInvoice.type === 'sale' ? 
                        (currentPrintInvoice.invoice.customerPhone || 'وارد نشده') : 
                        (currentPrintInvoice.invoice.supplierPhone || 'وارد نشده')}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ 
                    p: 2, 
                    border: '1px solid #e0e0e0', 
                    borderRadius: 1,
                    background: '#fafafa'
                  }}>
                    <Typography variant="h6" sx={{ 
                      fontFamily: 'Vazirmatn, sans-serif', 
                      mb: 2,
                      color: currentPrintInvoice.type === 'sale' ? '#d32f2f' : '#2e7d32'
                    }}>
                      جزئیات فاکتور:
                    </Typography>
                    <Typography sx={{ fontFamily: 'Vazirmatn, sans-serif', mb: 1 }}>
                      تعداد اقلام: {currentPrintInvoice.invoice.items?.length || 0}
                    </Typography>
                    <Typography sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>
                      مبلغ کل: {currentPrintInvoice.type === 'sale' ? 
                        saleTotals.total.toLocaleString('fa-IR') : 
                        purchaseTotals.total.toLocaleString('fa-IR')} تومان
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              {/* Items Table */}
              {currentPrintInvoice.invoice.items && currentPrintInvoice.invoice.items.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ 
                    fontFamily: 'Vazirmatn, sans-serif', 
                    mb: 2,
                    color: currentPrintInvoice.type === 'sale' ? '#d32f2f' : '#2e7d32'
                  }}>
                    اقلام فاکتور:
                  </Typography>
                  <TableContainer component={Paper} sx={{ border: '1px solid #e0e0e0' }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                          <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif', fontWeight: 'bold' }}>کالا</TableCell>
                          <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif', fontWeight: 'bold' }}>وزن</TableCell>
                          <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif', fontWeight: 'bold' }}>عیار</TableCell>
                          <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif', fontWeight: 'bold' }}>تعداد</TableCell>
                          <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif', fontWeight: 'bold' }}>قیمت واحد</TableCell>
                          <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif', fontWeight: 'bold' }}>جمع</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {currentPrintInvoice.invoice.items.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>{item.productName}</TableCell>
                            <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>{item.weight} گرم</TableCell>
                            <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>{item.purity}</TableCell>
                            <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>{item.quantity}</TableCell>
                            <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>{item.unitPrice.toLocaleString('fa-IR')} تومان</TableCell>
                            <TableCell sx={{ fontFamily: 'Vazirmatn, sans-serif' }}>{item.total.toLocaleString('fa-IR')} تومان</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}

              {/* Total Amount */}
              <Box sx={{ 
                textAlign: 'left', 
                mt: 3, 
                p: 2, 
                border: '2px solid #e0e0e0', 
                borderRadius: 2,
                background: currentPrintInvoice.type === 'sale' ? '#fff5f5' : '#f0f8f0'
              }}>
                <Typography variant="h5" sx={{ 
                  fontFamily: 'Vazirmatn, sans-serif', 
                  fontWeight: 'bold',
                  color: currentPrintInvoice.type === 'sale' ? '#d32f2f' : '#2e7d32'
                }}>
                  مبلغ نهایی: {currentPrintInvoice.type === 'sale' ? 
                    saleTotals.total.toLocaleString('fa-IR') : 
                    purchaseTotals.total.toLocaleString('fa-IR')} تومان
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setPrintDialogOpen(false)} 
            sx={{ fontFamily: 'Vazirmatn, sans-serif' }}
          >
            انصراف
          </Button>
          <Button 
            variant="contained" 
            startIcon={<Print />}
            sx={{ 
              backgroundColor: currentPrintInvoice?.type === 'sale' ? '#ef5350' : '#4caf50',
              '&:hover': { 
                backgroundColor: currentPrintInvoice?.type === 'sale' ? '#d32f2f' : '#2e7d32' 
              },
              fontFamily: 'Vazirmatn, sans-serif'
            }}
            onClick={() => {
              window.print();
              setPrintDialogOpen(false);
            }}
          >
            چاپ فاکتور
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SalesManagement;