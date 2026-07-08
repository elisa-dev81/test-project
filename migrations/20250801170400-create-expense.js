'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Expenses', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT
      },
      amount: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false
      },
      category: {
        type: Sequelize.ENUM('rent', 'utilities', 'supplies', 'marketing', 'labor', 'equipment', 'maintenance', 'other'),
        allowNull: false
      },
      expense_date: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      payment_method: {
        type: Sequelize.ENUM('cash', 'card', 'check', 'transfer'),
        allowNull: false,
        defaultValue: 'cash'
      },
      receipt_number: {
        type: Sequelize.STRING
      },
      vendor_name: {
        type: Sequelize.STRING
      },
      vendor_phone: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.ENUM('pending', 'paid', 'cancelled'),
        allowNull: false,
        defaultValue: 'paid'
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
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Expenses');
  }
};