const { GoldPrice } = require('../../models');

// دریافت آخرین نرخ طلا
const getLatestPrice = async (req, res) => {
  try {
    const latestPrice = await GoldPrice.getLatestPrice();
    
    if (!latestPrice) {
      return res.status(404).json({
        success: false,
        message: 'نرخ طلا یافت نشد'
      });
    }

    res.json({
      success: true,
      data: latestPrice.toApiFormat()
    });
  } catch (error) {
    console.error('خطا در دریافت نرخ طلا:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در دریافت نرخ طلا',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ایجاد نرخ جدید
const createPrice = async (req, res) => {
  try {
    const { gold24k, gold22k, gold21k, gold18k, silver, source = 'manual' } = req.body;

    // اعتبارسنجی داده‌های ورودی
    if (!gold24k || !gold22k || !gold21k || !gold18k || !silver) {
      return res.status(400).json({
        success: false,
        message: 'تمام فیلدهای نرخ الزامی هستند'
      });
    }

    const newPrice = await GoldPrice.createNewPrice({
      gold24k,
      gold22k,
      gold21k,
      gold18k,
      silver,
      source
    });

    res.status(201).json({
      success: true,
      message: 'نرخ طلا با موفقیت ذخیره شد',
      data: newPrice.toApiFormat()
    });
  } catch (error) {
    console.error('خطا در ذخیره نرخ طلا:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در ذخیره نرخ طلا',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// دریافت تاریخچه نرخ‌ها
const getPriceHistory = async (req, res) => {
  try {
    const { limit = 10, page = 1 } = req.query;
    const offset = (page - 1) * limit;

    const prices = await GoldPrice.findAndCountAll({
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const formattedPrices = prices.rows.map(price => price.toApiFormat());

    res.json({
      success: true,
      data: {
        prices: formattedPrices,
        pagination: {
          total: prices.count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(prices.count / limit)
        }
      }
    });
  } catch (error) {
    console.error('خطا در دریافت تاریخچه نرخ طلا:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در دریافت تاریخچه نرخ طلا',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// محاسبه قیمت بر اساس وزن و عیار
const calculatePrice = async (req, res) => {
  try {
    const { weight, purity, type = 'gold' } = req.body;

    if (!weight || !purity) {
      return res.status(400).json({
        success: false,
        message: 'وزن و عیار الزامی هستند'
      });
    }

    const latestPrice = await GoldPrice.getLatestPrice();
    
    if (!latestPrice) {
      return res.status(404).json({
        success: false,
        message: 'نرخ طلا یافت نشد'
      });
    }

    let pricePerGram;
    
    if (type === 'gold') {
      switch (purity) {
        case 24:
          pricePerGram = parseFloat(latestPrice.gold24k);
          break;
        case 22:
          pricePerGram = parseFloat(latestPrice.gold22k);
          break;
        case 21:
          pricePerGram = parseFloat(latestPrice.gold21k);
          break;
        case 18:
          pricePerGram = parseFloat(latestPrice.gold18k);
          break;
        default:
          // محاسبه برای عیارهای دیگر
          pricePerGram = parseFloat(latestPrice.gold24k) * (purity / 24);
      }
    } else if (type === 'silver') {
      const purityFactor = purity / 1000;
      pricePerGram = parseFloat(latestPrice.silver) * purityFactor;
    } else {
      return res.status(400).json({
        success: false,
        message: 'نوع فلز نامعتبر است'
      });
    }

    const totalPrice = weight * pricePerGram;

    res.json({
      success: true,
      data: {
        weight,
        purity,
        type,
        pricePerGram,
        totalPrice,
        priceSource: latestPrice.toApiFormat()
      }
    });
  } catch (error) {
    console.error('خطا در محاسبه قیمت:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در محاسبه قیمت',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getLatestPrice,
  createPrice,
  getPriceHistory,
  calculatePrice
};