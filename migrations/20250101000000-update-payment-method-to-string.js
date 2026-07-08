'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Change the payment_method column from ENUM to STRING
    await queryInterface.changeColumn('Transactions', 'payment_method', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'cash'
    });
  },

  async down(queryInterface, Sequelize) {
    // Revert back to ENUM
    await queryInterface.changeColumn('Transactions', 'payment_method', {
      type: Sequelize.ENUM('cash', 'card', 'installment', 'exchange'),
      allowNull: false,
      defaultValue: 'cash'
    });
  }
};
