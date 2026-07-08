'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Settings', {
      key: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        primaryKey: true
      },
      value: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      type: {
        type: Sequelize.ENUM('string', 'number', 'boolean', 'json'),
        allowNull: false,
        defaultValue: 'string'
      },
      category: {
        type: Sequelize.ENUM('general', 'business', 'appearance', 'security', 'backup'),
        allowNull: false,
        defaultValue: 'general'
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Insert default settings
    await queryInterface.bulkInsert('Settings', [
      // General Settings
      {
        key: 'store_name',
        value: 'فروشگاه طلا و جواهر',
        type: 'string',
        category: 'general',
        description: 'نام فروشگاه',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        key: 'store_description',
        value: 'فروشگاه تخصصی طلا، نقره و سکه',
        type: 'string',
        category: 'general',
        description: 'توضیحات فروشگاه',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        key: 'store_phone',
        value: '+98 21 1234 5678',
        type: 'string',
        category: 'general',
        description: 'شماره تلفن فروشگاه',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        key: 'store_email',
        value: 'info@goldshop.ir',
        type: 'string',
        category: 'general',
        description: 'ایمیل فروشگاه',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        key: 'store_address',
        value: 'تهران، خیابان ولیعصر، پلاک 123',
        type: 'string',
        category: 'general',
        description: 'آدرس فروشگاه',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        key: 'store_website',
        value: 'https://goldshop.ir',
        type: 'string',
        category: 'general',
        description: 'وب‌سایت فروشگاه',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        key: 'currency',
        value: 'IRR',
        type: 'string',
        category: 'general',
        description: 'واحد پول',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        key: 'language',
        value: 'fa',
        type: 'string',
        category: 'general',
        description: 'زبان سیستم',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        key: 'timezone',
        value: 'Asia/Tehran',
        type: 'string',
        category: 'general',
        description: 'منطقه زمانی',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // Business Settings
      {
        key: 'tax_rate',
        value: '9',
        type: 'number',
        category: 'business',
        description: 'نرخ مالیات درصد',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        key: 'discount_enabled',
        value: 'true',
        type: 'boolean',
        category: 'business',
        description: 'فعال‌سازی تخفیف',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        key: 'max_discount',
        value: '15',
        type: 'number',
        category: 'business',
        description: 'حداکثر تخفیف درصد',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        key: 'low_stock_threshold',
        value: '5',
        type: 'number',
        category: 'business',
        description: 'آستانه کم موجودی',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        key: 'auto_backup',
        value: 'true',
        type: 'boolean',
        category: 'business',
        description: 'پشتیبان‌گیری خودکار',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        key: 'backup_frequency',
        value: 'daily',
        type: 'string',
        category: 'business',
        description: 'فرکانس پشتیبان‌گیری',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        key: 'notifications_enabled',
        value: 'true',
        type: 'boolean',
        category: 'business',
        description: 'فعال‌سازی اعلان‌ها',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        key: 'email_notifications',
        value: 'true',
        type: 'boolean',
        category: 'business',
        description: 'اعلان‌های ایمیل',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        key: 'sms_notifications',
        value: 'false',
        type: 'boolean',
        category: 'business',
        description: 'اعلان‌های پیامک',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // Appearance Settings
      {
        key: 'theme',
        value: 'light',
        type: 'string',
        category: 'appearance',
        description: 'تم سیستم',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        key: 'primary_color',
        value: '#d4af37',
        type: 'string',
        category: 'appearance',
        description: 'رنگ اصلی',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        key: 'secondary_color',
        value: '#2c3e50',
        type: 'string',
        category: 'appearance',
        description: 'رنگ ثانویه',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        key: 'font_size',
        value: 'medium',
        type: 'string',
        category: 'appearance',
        description: 'اندازه فونت',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        key: 'rtl_enabled',
        value: 'true',
        type: 'boolean',
        category: 'appearance',
        description: 'فعال‌سازی RTL',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        key: 'compact_mode',
        value: 'false',
        type: 'boolean',
        category: 'appearance',
        description: 'حالت فشرده',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // Security Settings
      {
        key: 'session_timeout',
        value: '30',
        type: 'number',
        category: 'security',
        description: 'مدت زمان جلسه دقیقه',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        key: 'password_expiry',
        value: '90',
        type: 'number',
        category: 'security',
        description: 'انقضای رمز عبور روز',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        key: 'two_factor_auth',
        value: 'false',
        type: 'boolean',
        category: 'security',
        description: 'احراز هویت دو مرحله‌ای',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        key: 'login_attempts',
        value: '5',
        type: 'number',
        category: 'security',
        description: 'تعداد تلاش ورود',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        key: 'auto_lock',
        value: 'true',
        type: 'boolean',
        category: 'security',
        description: 'قفل خودکار',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        key: 'audit_log',
        value: 'true',
        type: 'boolean',
        category: 'security',
        description: 'ثبت فعالیت‌ها',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Settings');
  }
};
