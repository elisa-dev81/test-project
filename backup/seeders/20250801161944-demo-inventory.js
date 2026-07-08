'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Inventories', [
      {
        product_id: 1,
        quantity: 2,
        purchase_price: 8500000,
        sale_price: 9350000,
        status: 'available',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        product_id: 2,
        quantity: 1,
        purchase_price: 6240000,
        sale_price: 6864000,
        status: 'available',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        product_id: 3,
        quantity: 3,
        purchase_price: 11600000,
        sale_price: 12760000,
        status: 'available',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        product_id: 4,
        quantity: 1,
        purchase_price: 16900000,
        sale_price: 18590000,
        status: 'available',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Inventories', null, {});
  }
};
