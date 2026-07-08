const { Setting } = require('../../models');

// Get all settings or by category
exports.getSettings = async (req, res) => {
  try {
    const { category } = req.query;
    
    let whereClause = { is_active: true };
    if (category) {
      whereClause.category = category;
    }
    
    const settings = await Setting.findAll({
      where: whereClause,
      order: [['key', 'ASC']]
    });
    
    // Convert to key-value object for easier frontend use
    const settingsObject = {};
    settings.forEach(setting => {
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
        default:
          // string - keep as is
          break;
      }
      
      settingsObject[setting.key] = value;
    });
    
    res.json({
      success: true,
      data: settingsObject,
      raw: settings // Include raw data for admin purposes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطا در دریافت تنظیمات',
      error: error.message
    });
  }
};

// Get single setting by key
exports.getSetting = async (req, res) => {
  try {
    const { key } = req.params;
    
    const setting = await Setting.findOne({
      where: { key, is_active: true }
    });
    
    if (!setting) {
      return res.status(404).json({
        success: false,
        message: 'تنظیم مورد نظر یافت نشد'
      });
    }
    
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
    
    res.json({
      success: true,
      data: {
        key: setting.key,
        value: value,
        type: setting.type,
        category: setting.category,
        description: setting.description
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطا در دریافت تنظیم',
      error: error.message
    });
  }
};

// Update single setting
exports.updateSetting = async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;
    
    const setting = await Setting.findOne({ where: { key } });
    
    if (!setting) {
      return res.status(404).json({
        success: false,
        message: 'تنظیم مورد نظر یافت نشد'
      });
    }
    
    // Convert value to string for storage
    let stringValue;
    switch (setting.type) {
      case 'boolean':
        stringValue = value ? 'true' : 'false';
        break;
      case 'number':
        stringValue = value.toString();
        break;
      case 'json':
        stringValue = JSON.stringify(value);
        break;
      default:
        stringValue = value.toString();
        break;
    }
    
    await setting.update({ value: stringValue });
    
    res.json({
      success: true,
      message: 'تنظیم با موفقیت به‌روزرسانی شد',
      data: {
        key: setting.key,
        value: value,
        type: setting.type,
        category: setting.category
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'خطا در به‌روزرسانی تنظیم',
      error: error.message
    });
  }
};

// Update multiple settings
exports.updateSettings = async (req, res) => {
  try {
    const { settings } = req.body;
    
    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'فرمت تنظیمات نامعتبر است'
      });
    }
    
    const updates = [];
    const errors = [];
    
    for (const [key, value] of Object.entries(settings)) {
      try {
        const setting = await Setting.findOne({ where: { key } });
        
        if (!setting) {
          errors.push(`تنظیم ${key} یافت نشد`);
          continue;
        }
        
        // Convert value to string for storage
        let stringValue;
        switch (setting.type) {
          case 'boolean':
            stringValue = value ? 'true' : 'false';
            break;
          case 'number':
            stringValue = value.toString();
            break;
          case 'json':
            stringValue = JSON.stringify(value);
            break;
          default:
            stringValue = value.toString();
            break;
        }
        
        await setting.update({ value: stringValue });
        updates.push({
          key: key,
          value: value,
          type: setting.type,
          category: setting.category
        });
      } catch (error) {
        errors.push(`خطا در به‌روزرسانی ${key}: ${error.message}`);
      }
    }
    
    res.json({
      success: true,
      message: `${updates.length} تنظیم با موفقیت به‌روزرسانی شد`,
      data: {
        updated: updates,
        errors: errors
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطا در به‌روزرسانی تنظیمات',
      error: error.message
    });
  }
};

// Create new setting
exports.createSetting = async (req, res) => {
  try {
    const { key, value, type = 'string', category = 'general', description } = req.body;
    
    // Check if setting already exists
    const existingSetting = await Setting.findOne({ where: { key } });
    if (existingSetting) {
      return res.status(400).json({
        success: false,
        message: 'تنظیم با این کلید از قبل وجود دارد'
      });
    }
    
    // Convert value to string for storage
    let stringValue;
    switch (type) {
      case 'boolean':
        stringValue = value ? 'true' : 'false';
        break;
      case 'number':
        stringValue = value.toString();
        break;
      case 'json':
        stringValue = JSON.stringify(value);
        break;
      default:
        stringValue = value.toString();
        break;
    }
    
    const setting = await Setting.create({
      key,
      value: stringValue,
      type,
      category,
      description
    });
    
    res.status(201).json({
      success: true,
      message: 'تنظیم جدید با موفقیت ایجاد شد',
      data: {
        key: setting.key,
        value: value,
        type: setting.type,
        category: setting.category,
        description: setting.description
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'خطا در ایجاد تنظیم جدید',
      error: error.message
    });
  }
};

// Delete setting
exports.deleteSetting = async (req, res) => {
  try {
    const { key } = req.params;
    
    const setting = await Setting.findOne({ where: { key } });
    
    if (!setting) {
      return res.status(404).json({
        success: false,
        message: 'تنظیم مورد نظر یافت نشد'
      });
    }
    
    // Instead of hard delete, just deactivate
    await setting.update({ is_active: false });
    
    res.json({
      success: true,
      message: 'تنظیم با موفقیت حذف شد'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطا در حذف تنظیم',
      error: error.message
    });
  }
};

// Reset settings to default
exports.resetSettings = async (req, res) => {
  try {
    const { category } = req.body;
    
    let whereClause = {};
    if (category) {
      whereClause.category = category;
    }
    
    // This is a simple reset - in a real scenario, you'd have default values stored
    await Setting.update(
      { is_active: false },
      { where: whereClause }
    );
    
    res.json({
      success: true,
      message: 'تنظیمات با موفقیت بازنشانی شد'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطا در بازنشانی تنظیمات',
      error: error.message
    });
  }
};
