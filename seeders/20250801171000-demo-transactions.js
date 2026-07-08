'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transactions = [
      {
        transaction_number: 'S' + Date.now().toString().slice(-8),
        type: 'sale',
        customer_name: 'احمد محمدی',
        customer_phone: '09123456789',
        total_weight: 12.5,
        total_amount: 25500000.00,
        payment_method: 'cash',
        payment_status: 'completed',
        paid_amount: 25500000.00,
        remaining_amount: 0,
        gold_price_18k: 2400000,
        gold_price_24k: 3200000,
        discount_amount: 0,
        tax_amount: 0,
        notes: 'فروش دستبند طلا 18 عیار',
        transaction_date: new Date('2025-01-15'),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        transaction_number: 'P' + (Date.now() + 1).toString().slice(-8),
        type: 'purchase',
        customer_name: 'فاطمه رضایی',
        customer_phone: '09112345678',
        total_weight: 8.3,
        total_amount: 14200000.00,
        payment_method: 'cash',
        payment_status: 'completed',
        paid_amount: 14200000.00,
        remaining_amount: 0,
        gold_price_18k: 2400000,
        gold_price_24k: 3200000,
        discount_amount: 0,
        tax_amount: 0,
        notes: 'خرید گردنبند طلا از مشتری',
        transaction_date: new Date('2025-01-16'),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        transaction_number: 'S' + (Date.now() + 2).toString().slice(-8),
        type: 'sale',
        customer_name: 'علی کریمی',
        customer_phone: '09133456789',
        total_weight: 20.1,
        total_amount: 35800000.00,
        payment_method: 'cash',
        payment_status: 'completed',
        paid_amount: 35800000.00,
        remaining_amount: 0,
        gold_price_18k: 2400000,
        gold_price_24k: 3200000,
        discount_amount: 0,
        tax_amount: 0,
        notes: 'فروش ست طلا شامل گردنبند و گوشواره',
        transaction_date: new Date('2025-01-17'),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await queryInterface.bulkInsert('Transactions', transactions);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Transactions', null, {});
  }
};