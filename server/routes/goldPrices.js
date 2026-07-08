const express = require('express');
const router = express.Router();
const goldPriceController = require('../controllers/goldPriceController');

// دریافت آخرین نرخ طلا
router.get('/latest', goldPriceController.getLatestPrice);

// ایجاد نرخ جدید
router.post('/', goldPriceController.createPrice);

// دریافت تاریخچه نرخ‌ها
router.get('/history', goldPriceController.getPriceHistory);

// محاسبه قیمت
router.post('/calculate', goldPriceController.calculatePrice);

module.exports = router;