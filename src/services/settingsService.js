import api from './api';

const settingsService = {
  // Get all settings or by category
  getSettings: async (category = null) => {
    try {
      const params = category ? { category } : {};
      const response = await api.get('/settings', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get single setting by key
  getSetting: async (key) => {
    try {
      const response = await api.get(`/settings/${key}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update single setting
  updateSetting: async (key, value) => {
    try {
      const response = await api.put(`/settings/${key}`, { value });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update multiple settings
  updateSettings: async (settings) => {
    try {
      const response = await api.put('/settings', { settings });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create new setting
  createSetting: async (key, value, type = 'string', category = 'general', description = '') => {
    try {
      const response = await api.post('/settings', {
        key,
        value,
        type,
        category,
        description
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete setting
  deleteSetting: async (key) => {
    try {
      const response = await api.delete(`/settings/${key}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Reset settings
  resetSettings: async (category = null) => {
    try {
      const data = category ? { category } : {};
      const response = await api.post('/settings/reset', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Helper function to format settings by category
  formatSettingsByCategory: (settings) => {
    const formatted = {
      general: {},
      business: {},
      appearance: {},
      security: {},
      backup: {}
    };

    // If settings.raw exists (from API response), use that for proper categorization
    if (settings.raw && Array.isArray(settings.raw)) {
      settings.raw.forEach(setting => {
        let value = setting.value;
        
        // Convert value based on type
        switch (setting.type) {
          case 'boolean':
            value = value === 'true';
            break;
          case 'number':
            value = parseFloat(value);
            break;
          case 'json':
            try {
              value = JSON.parse(value);
            } catch (e) {
              value = setting.value;
            }
            break;
        }
        
        formatted[setting.category][setting.key] = value;
      });
    } else {
      // Fallback: organize by key naming patterns
      Object.entries(settings.data || settings).forEach(([key, value]) => {
        if (key.startsWith('store_') || key === 'currency' || key === 'language' || key === 'timezone') {
          formatted.general[key] = value;
        } else if (key.includes('tax') || key.includes('discount') || key.includes('notification') || key.includes('backup') || key.includes('stock')) {
          formatted.business[key] = value;
        } else if (key.includes('theme') || key.includes('color') || key.includes('font') || key.includes('rtl') || key.includes('compact')) {
          formatted.appearance[key] = value;
        } else if (key.includes('session') || key.includes('password') || key.includes('auth') || key.includes('login') || key.includes('lock') || key.includes('audit')) {
          formatted.security[key] = value;
        } else {
          formatted.general[key] = value;
        }
      });
    }

    return formatted;
  },

  // Helper function to convert frontend format to backend format
  flattenSettings: (categorizedSettings) => {
    const flattened = {};
    
    Object.values(categorizedSettings).forEach(categorySettings => {
      Object.assign(flattened, categorySettings);
    });
    
    return flattened;
  }
};

export default settingsService;
