require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');

// Import routes
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const inventoryRoutes = require('./routes/inventory');
const transactionRoutes = require('./routes/transactions');
const expenseRoutes = require('./routes/expenses');
const installmentRoutes = require('./routes/installments');
const goldPriceRoutes = require('./routes/goldPrices');

const app = express();

// CORS Configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// Basic security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/installments', installmentRoutes);
app.use('/api/gold-prices', goldPriceRoutes);

// Proxy route for Alan Chand API to bypass CORS
app.get('/api/proxy/alan-chand', async (req, res) => {
  try {
    console.log('📡 Proxying request to Alan Chand API...');
    const response = await axios.get('https://api.alanchand.com/?type=golds&token=P1ClTaG9myrMKbUut1JS', {
      timeout: 10000,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Gold-Shop-App/1.0'
      }
    });
    
    console.log('✅ Alan Chand API response received');
    res.json({
      success: true,
      data: response.data,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Proxy error for Alan Chand API:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch data from Alan Chand API',
      message: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'خطای سرور',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log(`Database: ${process.env.DB_NAME} at ${process.env.DB_HOST}`);
});