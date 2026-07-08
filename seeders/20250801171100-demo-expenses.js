'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const expenses = [
      {
        title: 'اجاره ماهانه مغازه',
        description: 'اجاره ماه دی 1403',
        amount: 15000000.00,
        category: 'rent',
        expense_date: new Date('2025-01-01'),
        payment_method: 'cash',
        receipt_number: 'R001',
        vendor_name: 'محمد صاحب ملک',
        vendor_phone: '09121234567',
        status: 'paid',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'قبض برق',
        description: 'قبض برق دو ماهه',
        amount: 850000.00,
        category: 'utilities',
        expense_date: new Date('2025-01-05'),
        payment_method: 'card',
        receipt_number: 'E001',
        vendor_name: 'شرکت برق',
        status: 'paid',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'خرید لوازم بسته‌بندی',
        description: 'جعبه‌های هدیه و کیسه‌های مخصوص',
        amount: 2500000.00,
        category: 'supplies',
        expense_date: new Date('2025-01-10'),
        payment_method: 'cash',
        receipt_number: 'S001',
        vendor_name: 'فروشگاه بسته‌بندی',
        vendor_phone: '09135555555',
        status: 'paid',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'تعمیر دستگاه ترازو',
        description: 'کالیبراسیون و تعمیر ترازو دیجیتال',
        amount: 1200000.00,
        category: 'maintenance',
        expense_date: new Date('2025-01-12'),
        payment_method: 'cash',
        receipt_number: 'M001',
        vendor_name: 'تعمیرگاه ترازو',
        vendor_phone: '09126666666',
        status: 'paid',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'دستمزد کارگر',
        description: 'دستمزد هفتگی کارگر مغازه',
        amount: 3500000.00,
        category: 'labor',
        expense_date: new Date('2025-01-15'),
        payment_method: 'cash',
        vendor_name: 'محسن کارگر',
        vendor_phone: '09144444444',
        status: 'paid',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await queryInterface.bulkInsert('Expenses', expenses);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Expenses', null, {});
  }
};