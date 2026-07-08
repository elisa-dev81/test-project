import axios from 'axios';

// API endpoints for different price sources
const API_ENDPOINTS = {
  // Alan Chand API through backend proxy
  alan_chand: 'http://localhost:5000/api/proxy/alan-chand',
  
  // Free gold and silver API
  metals: 'https://api.metals.live/v1/spot',
  
  // CoinGecko for crypto prices (free)
  crypto: 'https://api.coingecko.com/api/v3/simple/price',
  
  // Iranian APIs (free alternatives)
  iranian_gold: 'https://call.tgju.org/ajax.json', // تجارت جو
  sarafi: 'https://api.navasan.tech/latest/?api_key=free', // نواسان (free tier)
  
  // Backup APIs
  alternative_crypto: 'https://api.coinlore.net/api/tickers/',
  alternative_gold: 'https://api.fcsapi.com/v1/forex/base_latest?symbol=XAUUSD&access_key=free',
};

class PriceApiService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  // Check if cached data is still valid
  isCacheValid(key) {
    const cached = this.cache.get(key);
    if (!cached) return false;
    return Date.now() - cached.timestamp < this.cacheTimeout;
  }

  // Get cached data
  getCached(key) {
    const cached = this.cache.get(key);
    return cached ? cached.data : null;
  }

  // Set cache
  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  // Fetch gold and silver prices (disabled due to CORS)
  async getMetalsPrices() {
    const cacheKey = 'metals';
    
    if (this.isCacheValid(cacheKey)) {
      return this.getCached(cacheKey);
    }

    // Skip external API call due to CORS, use fallback data
    console.log('⚠️ Metals API disabled due to CORS, using fallback data');
    const data = {
      gold: { price: 1950, currency: 'USD', unit: 'اونس', change24h: 0.5 },
      silver: { price: 24.5, currency: 'USD', unit: 'اونس', change24h: -0.3 },
    };
    
    this.setCache(cacheKey, data);
    return data;
  }

  // Fetch cryptocurrency prices (disabled due to CORS)
  async getCryptoPrices() {
    const cacheKey = 'crypto';
    
    if (this.isCacheValid(cacheKey)) {
      return this.getCached(cacheKey);
    }

    // Skip external API call due to CORS, use fallback data
    console.log('⚠️ Crypto API disabled due to CORS, using fallback data');
    const data = {
      bitcoin: { usd: 45000, usd_24h_change: 2.5 },
      ethereum: { usd: 2800, usd_24h_change: -1.2 },
      tether: { usd: 1.0, usd_24h_change: 0.01 },
      binancecoin: { usd: 320, usd_24h_change: 1.8 },
    };
    
    this.setCache(cacheKey, data);
    return data;
  }



  // Fetch Iranian gold and coin prices from Alan Chand API
  async getAlanChandPrices() {
    const cacheKey = 'alan_chand';
    
    if (this.isCacheValid(cacheKey)) {
      return this.getCached(cacheKey);
    }

    try {
      const response = await axios.get(API_ENDPOINTS.alan_chand, {
        timeout: 10000,
        headers: {
          'Accept': 'application/json',
        },
      });

      // Alan Chand API through proxy returns wrapped data
      const result = response.data;
      if (!result.success) {
        throw new Error(result.error || 'Proxy request failed');
      }
      const data = this.parseAlanChandResponse(result.data);
      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error fetching Alan Chand prices:', error);
      
      // Return cached data if available, otherwise try fallback
      const cached = this.getCached(cacheKey);
      if (cached) return cached;
      
      // Try fallback to old Iranian API
      return this.getIranianPricesAsFallback();
    }
  }

  // Fallback to old Iranian APIs (disabled due to CORS)
  async getIranianPricesAsFallback() {
    console.log('⚠️ Iranian fallback APIs disabled due to CORS, using mock data');
    return this.getMockIranianData();
  }

  // Fetch Iranian gold and coin prices (updated to use Alan Chand first)
  async getIranianPrices() {
    return this.getAlanChandPrices();
  }



  // Parse Alan Chand API response
  parseAlanChandResponse(data) {
    try {
      return {
        coins: {
          sekeh_emami: {
            price: data.sekkeh?.price || 0,
            change: data.sekkeh?.dayChange || 0,
            currency: 'IRR',
            unit: 'تومان',
            high: data.sekkeh?.high || 0,
            low: data.sekkeh?.low || 0,
            open: data.sekkeh?.open || 0,
            real_price: data.sekkeh?.real_price || 0,
            bubble: data.sekkeh?.bubble || 0,
            bubble_per: data.sekkeh?.bubble_per || 0,
            updated_at: data.sekkeh?.updated_at || '',
          },
          sekeh_bahar: {
            price: data.bahar?.price || 0,
            change: data.bahar?.dayChange || 0,
            currency: 'IRR',
            unit: 'تومان',
            high: data.bahar?.high || 0,
            low: data.bahar?.low || 0,
            open: data.bahar?.open || 0,
            real_price: data.bahar?.real_price || 0,
            bubble: data.bahar?.bubble || 0,
            bubble_per: data.bahar?.bubble_per || 0,
            updated_at: data.bahar?.updated_at || '',
          },
          nim_sekeh: {
            price: data.nim?.price || 0,
            change: data.nim?.dayChange || 0,
            currency: 'IRR',
            unit: 'تومان',
            high: data.nim?.high || 0,
            low: data.nim?.low || 0,
            open: data.nim?.open || 0,
            real_price: data.nim?.real_price || 0,
            bubble: data.nim?.bubble || 0,
            bubble_per: data.nim?.bubble_per || 0,
            updated_at: data.nim?.updated_at || '',
          },
          rob_sekeh: {
            price: data.rob?.price || 0,
            change: data.rob?.dayChange || 0,
            currency: 'IRR',
            unit: 'تومان',
            high: data.rob?.high || 0,
            low: data.rob?.low || 0,
            open: data.rob?.open || 0,
            real_price: data.rob?.real_price || 0,
            bubble: data.rob?.bubble || 0,
            bubble_per: data.rob?.bubble_per || 0,
            updated_at: data.rob?.updated_at || '',
          },
          sekeh_gerami: {
            price: data.sek?.price || 0,
            change: data.sek?.dayChange || 0,
            currency: 'IRR',
            unit: 'تومان',
            high: data.sek?.high || 0,
            low: data.sek?.low || 0,
            open: data.sek?.open || 0,
            real_price: data.sek?.real_price || 0,
            bubble: data.sek?.bubble || 0,
            bubble_per: data.sek?.bubble_per || 0,
            updated_at: data.sek?.updated_at || '',
          },
        },
        gold_gram: {
          gold_18k: {
            price: data['18ayar']?.price || 0,
            change: data['18ayar']?.dayChange || 0,
            currency: 'IRR',
            unit: 'تومان به ازای هر گرم',
            high: data['18ayar']?.high || 0,
            low: data['18ayar']?.low || 0,
            open: data['18ayar']?.open || 0,
            real_price: data['18ayar']?.real_price || 0,
            bubble: data['18ayar']?.bubble || 0,
            bubble_per: data['18ayar']?.bubble_per || 0,
            updated_at: data['18ayar']?.updated_at || '',
          },
          abshodeh: {
            price: data.abshodeh?.price || 0,
            change: data.abshodeh?.dayChange || 0,
            currency: 'IRR',
            unit: 'تومان به ازای مثقال',
            high: data.abshodeh?.high || 0,
            low: data.abshodeh?.low || 0,
            open: data.abshodeh?.open || 0,
            real_price: data.abshodeh?.real_price || 0,
            bubble: data.abshodeh?.bubble || 0,
            bubble_per: data.abshodeh?.bubble_per || 0,
            updated_at: data.abshodeh?.updated_at || '',
          },
        },
        international: {
          gold_ounce: {
            price: data.usd_xau?.price || 0,
            change: data.usd_xau?.dayChange || 0,
            currency: 'USD',
            unit: 'دلار به ازای انس',
            high: data.usd_xau?.high || 0,
            low: data.usd_xau?.low || 0,
            open: data.usd_xau?.open || 0,
            updated_at: data.usd_xau?.updated_at || '',
          },
          silver_ounce: {
            price: data.xag?.price || 0,
            change: data.xag?.dayChange || 0,
            currency: 'USD',
            unit: 'دلار به ازای انس',
            high: data.xag?.high || 0,
            low: data.xag?.low || 0,
            open: data.xag?.open || 0,
            updated_at: data.xag?.updated_at || '',
          },
        },
      };
    } catch (error) {
      console.error('Error parsing Alan Chand response:', error);
      console.log('🔄 Using mock Iranian data due to parsing error');
      return this.getMockIranianData();
    }
  }

  // Parse Iranian API response (Tejarat-e Joo format)
  parseIranianResponse(data) {
    try {
      return {
        coins: {
          sekeh_emami: {
            price: data.current?.golds?.sekeh_emami?.p || 14500000,
            change: data.current?.golds?.sekeh_emami?.d || 0,
            currency: 'IRR',
            unit: 'ریال',
          },
          sekeh_bahar: {
            price: data.current?.golds?.sekeh_bahar_azadi?.p || 15200000,
            change: data.current?.golds?.sekeh_bahar_azadi?.d || 0,
            currency: 'IRR',
            unit: 'ریال',
          },
          nim_sekeh: {
            price: data.current?.golds?.nim_sekeh?.p || 8500000,
            change: data.current?.golds?.nim_sekeh?.d || 0,
            currency: 'IRR',
            unit: 'ریال',
          },
          rob_sekeh: {
            price: data.current?.golds?.rob_sekeh?.p || 4800000,
            change: data.current?.golds?.rob_sekeh?.d || 0,
            currency: 'IRR',
            unit: 'ریال',
          },
        },
        gold_gram: {
          gold_18k: {
            price: data.current?.golds?.gold18?.p || 3200000,
            change: data.current?.golds?.gold18?.d || 0,
            currency: 'IRR',
            unit: 'ریال به ازای هر گرم',
          },
        },
      };
    } catch (error) {
      console.error('Error parsing Iranian response:', error);
      return this.getMockIranianData();
    }
  }

  // Parse alternative Iranian API response
  parseAlternativeIranianResponse(data) {
    // Implementation for alternative API format
    return this.getMockIranianData();
  }



  // Mock Iranian data for fallback (با قیمت‌های واقعی Alan Chand)
  getMockIranianData() {
    return {
      coins: {
        sekeh_emami: {
          price: 83200000,
          change: 0.6,
          currency: 'IRR',
          unit: 'تومان',
          high: 83400000,
          low: 82700000,
          open: 82700000,
          real_price: 73801930,
          bubble: 9398070,
          bubble_per: 12.73,
          updated_at: new Date().toISOString(),
        },
        sekeh_bahar: {
          price: 75000000,
          change: 0.67,
          currency: 'IRR',
          unit: 'تومان',
          high: 75200000,
          low: 74500000,
          open: 74500000,
          real_price: 73801930,
          bubble: 1198070,
          bubble_per: 1.62,
          updated_at: new Date().toISOString(),
        },
        nim_sekeh: {
          price: 44100000,
          change: 0.46,
          currency: 'IRR',
          unit: 'تومان',
          high: 44100000,
          low: 43900000,
          open: 43900000,
          real_price: 37045090,
          bubble: 7054910,
          bubble_per: 19.04,
          updated_at: new Date().toISOString(),
        },
        rob_sekeh: {
          price: 26000000,
          change: 1.56,
          currency: 'IRR',
          unit: 'تومان',
          high: 26000000,
          low: 25600000,
          open: 25600000,
          real_price: 18663510,
          bubble: 7336490,
          bubble_per: 39.31,
          updated_at: new Date().toISOString(),
        },
        sekeh_gerami: {
          price: 9740000,
          change: 1.25,
          currency: 'IRR',
          unit: 'تومان',
          high: 9740000,
          low: 9620000,
          open: 9620000,
          real_price: 312318970,
          bubble: -302578970,
          bubble_per: -96.88,
          updated_at: new Date().toISOString(),
        },
      },
      gold_gram: {
        gold_18k: {
          price: 7507000, // قیمت واقعی Alan Chand از API
          change: 0.54,
          currency: 'IRR',
          unit: 'تومان به ازای هر گرم',
          high: 7518000,
          low: 7467000,
          open: 7467000,
          real_price: 7554510,
          bubble: -47510,
          bubble_per: -0.63,
          updated_at: new Date().toISOString(),
        },
        abshodeh: {
          price: 32480000,
          change: 0.4,
          currency: 'IRR',
          unit: 'تومان به ازای مثقال',
          high: 32570000,
          low: 32350000,
          open: 32350000,
          real_price: 32622650,
          bubble: -142650,
          bubble_per: -0.44,
          updated_at: new Date().toISOString(),
        },
      },
      international: {
        gold_ounce: {
          price: 3360.07,
          change: -1.12,
          currency: 'USD',
          unit: 'دلار به ازای انس',
          high: 3400.25,
          low: 3358.28,
          open: 3398.17,
          updated_at: new Date().toISOString(),
        },
        silver_ounce: {
          price: 36.21,
          change: 0,
          currency: 'USD',
          unit: 'دلار به ازای انس',
          high: 36.21,
          low: 36.21,
          open: 36.21,
          updated_at: new Date().toISOString(),
        },
      },
    };
  }

  // Get all prices
  async getAllPrices() {
    try {
      const [metals, crypto, iranian] = await Promise.allSettled([
        this.getMetalsPrices(),
        this.getCryptoPrices(),
        this.getIranianPrices(),
      ]);

      return {
        metals: metals.status === 'fulfilled' ? metals.value : null,
        crypto: crypto.status === 'fulfilled' ? crypto.value : null,
        iranian: iranian.status === 'fulfilled' ? iranian.value : null,
        timestamp: new Date(),
      };
    } catch (error) {
      console.error('Error fetching all prices:', error);
      throw error;
    }
  }

  // Clear cache
  clearCache() {
    this.cache.clear();
  }
}

// Export singleton instance
export default new PriceApiService();