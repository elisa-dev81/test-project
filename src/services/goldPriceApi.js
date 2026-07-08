import axios from 'axios';

// URL های مختلف برای دریافت نرخ طلا
const GOLD_PRICE_APIS = {
  // API بک‌اند داخلی
  BACKEND_API: 'http://localhost:5001/api/gold-prices',
  
  // API داخلی نرخ طلا ایران
  IRAN_GOLD: 'https://api.gold.ir/v1/price',
  
  // API جهانی نرخ طلا
  WORLD_GOLD: 'https://api.metals.live/v1/spot/gold',
  
  // API پشتیبان
  BACKUP_API: 'https://api.exchangerate.host/latest?base=USD&symbols=XAU',
  
  // Mock API برای تست
  MOCK_API: 'https://jsonplaceholder.typicode.com/posts/1'
};

class GoldPriceService {
  constructor() {
    this.currentPrice = {
      gold24k: 0,
      gold22k: 0,
      gold21k: 0,
      gold18k: 0,
      silver: 0,
      lastUpdate: null,
      source: 'local'
    };
    
    this.updateInterval = null;
    this.subscribers = [];
  }

  // دریافت نرخ از API ایرانی
  async fetchIranGoldPrice() {
    try {
      // در اینجا باید API واقعی نرخ طلا ایران فراخوانی شود
      // فعلاً از داده‌های شبیه‌سازی شده استفاده می‌کنیم
      
      const mockResponse = {
        gold24k: 3250000 + Math.floor(Math.random() * 200000 - 100000), // نوسان ±100هزار تومان
        gold22k: 2970000 + Math.floor(Math.random() * 180000 - 90000),
        gold21k: 2845000 + Math.floor(Math.random() * 170000 - 85000),
        gold18k: 2437500 + Math.floor(Math.random() * 150000 - 75000),
        silver: 485000 + Math.floor(Math.random() * 50000 - 25000),
        lastUpdate: new Date().toISOString(),
        source: 'iran_api'
      };

      return mockResponse;
    } catch (error) {
      console.error('خطا در دریافت نرخ طلا از API ایران:', error);
      throw error;
    }
  }

  // دریافت نرخ جهانی طلا
  async fetchWorldGoldPrice() {
    try {
      // تبدیل نرخ جهانی به تومان
      const usdToIrr = 42000; // نرخ دلار (باید از API نرخ ارز گرفته شود)
      const goldPricePerOunce = 2050 + Math.floor(Math.random() * 100 - 50); // دلار
      const goldPricePerGram = goldPricePerOunce / 31.1035; // گرم
      const goldPriceInToman = goldPricePerGram * usdToIrr;

      return {
        gold24k: Math.floor(goldPriceInToman),
        gold22k: Math.floor(goldPriceInToman * 0.916),
        gold21k: Math.floor(goldPriceInToman * 0.875),
        gold18k: Math.floor(goldPriceInToman * 0.75),
        silver: Math.floor(goldPriceInToman * 0.015), // نسبت تقریبی نقره به طلا
        lastUpdate: new Date().toISOString(),
        source: 'world_api'
      };
    } catch (error) {
      console.error('خطا در دریافت نرخ جهانی طلا:', error);
      throw error;
    }
  }

  // دریافت نرخ از بک‌اند
  async fetchFromBackend() {
    try {
      const response = await axios.get(`${GOLD_PRICE_APIS.BACKEND_API}/latest`);
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error('خطا در دریافت داده از بک‌اند');
    } catch (error) {
      console.error('خطا در دریافت نرخ از بک‌اند:', error);
      throw error;
    }
  }

  // ذخیره نرخ در بک‌اند
  async saveToBackend(priceData) {
    try {
      const response = await axios.post(GOLD_PRICE_APIS.BACKEND_API, priceData);
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error('خطا در ذخیره داده در بک‌اند');
    } catch (error) {
      console.error('خطا در ذخیره نرخ در بک‌اند:', error);
      throw error;
    }
  }

  // دریافت نرخ با استفاده از چندین منبع
  async fetchGoldPrice() {
    try {
      // ابتدا سعی در دریافت از بک‌اند
      try {
        const backendPrice = await this.fetchFromBackend();
        this.currentPrice = backendPrice;
        this.notifySubscribers();
        return backendPrice;
      } catch (error) {
        console.warn('بک‌اند در دسترس نیست، تلاش برای API ایرانی...');
      }

      // سعی در دریافت از API ایرانی و ذخیره در بک‌اند
      try {
        const iranPrice = await this.fetchIranGoldPrice();
        this.currentPrice = iranPrice;
        
        // ذخیره در بک‌اند
        try {
          await this.saveToBackend(iranPrice);
        } catch (saveError) {
          console.warn('خطا در ذخیره نرخ ایرانی در بک‌اند:', saveError);
        }
        
        this.notifySubscribers();
        return iranPrice;
      } catch (error) {
        console.warn('API ایرانی در دسترس نیست، تلاش برای API جهانی...');
      }

      // در صورت عدم دسترسی، از API جهانی استفاده کن
      try {
        const worldPrice = await this.fetchWorldGoldPrice();
        this.currentPrice = worldPrice;
        
        // ذخیره در بک‌اند
        try {
          await this.saveToBackend(worldPrice);
        } catch (saveError) {
          console.warn('خطا در ذخیره نرخ جهانی در بک‌اند:', saveError);
        }
        
        this.notifySubscribers();
        return worldPrice;
      } catch (error) {
        console.warn('API جهانی در دسترس نیست، استفاده از نرخ پیش‌فرض...');
      }

      // در صورت عدم دسترسی به هیچ API، از نرخ پیش‌فرض استفاده کن
      return this.getDefaultPrice();

    } catch (error) {
      console.error('خطا در دریافت نرخ طلا:', error);
      return this.getDefaultPrice();
    }
  }

  // ذخیره نرخ در دیتابیس (حذف شده - از دیتابیس استفاده می‌شود)
  savePrice(priceData) {
    // این متد دیگر استفاده نمی‌شود - داده‌ها در دیتابیس ذخیره می‌شوند
    console.log('نرخ طلا در دیتابیس ذخیره می‌شود:', priceData);
  }

  // بازیابی نرخ از دیتابیس (جایگزین localStorage)
  getSavedPrice() {
    // این متد دیگر از localStorage استفاده نمی‌کند
    // در صورت نیاز، باید از API بک‌اند برای دریافت آخرین نرخ استفاده شود
    console.log('برای دریافت نرخ ذخیره شده از API بک‌اند استفاده کنید');
    return null;
  }

  // نرخ پیش‌فرض
  getDefaultPrice() {
    return {
      gold24k: 3200000,
      gold22k: 2932000,
      gold21k: 2800000,
      gold18k: 2400000,
      silver: 480000,
      lastUpdate: new Date().toISOString(),
      source: 'default'
    };
  }

  // شروع به‌روزرسانی خودکار
  startAutoUpdate(interval = 5 * 60 * 1000) { // هر 5 دقیقه
    this.stopAutoUpdate(); // متوقف کردن به‌روزرسانی قبلی
    
    this.updateInterval = setInterval(async () => {
      try {
        await this.fetchGoldPrice();
      } catch (error) {
        console.error('خطا در به‌روزرسانی خودکار نرخ طلا:', error);
      }
    }, interval);
  }

  // متوقف کردن به‌روزرسانی خودکار
  stopAutoUpdate() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  // اشتراک در تغییرات نرخ
  subscribe(callback) {
    this.subscribers.push(callback);
    
    // بازگرداندن تابع لغو اشتراک
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }

  // اطلاع‌رسانی به مشترکین
  notifySubscribers() {
    this.subscribers.forEach(callback => {
      try {
        callback(this.currentPrice);
      } catch (error) {
        console.error('خطا در اطلاع‌رسانی به مشترک:', error);
      }
    });
  }

  // دریافت نرخ فعلی
  getCurrentPrice() {
    return this.currentPrice;
  }

  // محاسبه قیمت بر اساس وزن و عیار
  calculatePrice(weight, purity, type = 'gold') {
    if (type === 'gold') {
      let pricePerGram;
      
      switch (purity) {
        case 24:
          pricePerGram = this.currentPrice.gold24k;
          break;
        case 22:
          pricePerGram = this.currentPrice.gold22k;
          break;
        case 21:
          pricePerGram = this.currentPrice.gold21k;
          break;
        case 18:
          pricePerGram = this.currentPrice.gold18k;
          break;
        default:
          // محاسبه برای عیارهای دیگر
          pricePerGram = this.currentPrice.gold24k * (purity / 24);
      }
      
      return weight * pricePerGram;
    } else if (type === 'silver') {
      // برای نقره، معمولاً عیار 925 استفاده می‌شود
      const purityFactor = purity / 1000;
      return weight * this.currentPrice.silver * purityFactor;
    }
    
    return 0;
  }

  // دریافت تاریخچه تغییرات نرخ (شبیه‌سازی)
  getPriceHistory(days = 7) {
    const history = [];
    const basePrice = this.currentPrice.gold24k;
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      const variation = Math.floor(Math.random() * 200000 - 100000);
      const price = basePrice + variation;
      
      history.push({
        date: date.toISOString().split('T')[0],
        price: price,
        change: i === 0 ? 0 : variation
      });
    }
    
    return history;
  }

  // بررسی وضعیت اتصال به API
  async checkApiStatus() {
    const status = {
      iranApi: false,
      worldApi: false,
      lastCheck: new Date().toISOString()
    };

    try {
      await this.fetchIranGoldPrice();
      status.iranApi = true;
    } catch (error) {
      status.iranApi = false;
    }

    try {
      await this.fetchWorldGoldPrice();
      status.worldApi = true;
    } catch (error) {
      status.worldApi = false;
    }

    return status;
  }
}

// ایجاد نمونه singleton
const goldPriceService = new GoldPriceService();

// شروع به‌روزرسانی خودکار
goldPriceService.startAutoUpdate();

export default goldPriceService;