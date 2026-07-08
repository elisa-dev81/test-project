'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('GoldPrices', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      gold24k: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        comment: 'نرخ طلای 24 عیار (تومان)'
      },
      gold22k: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        comment: 'نرخ طلای 22 عیار (تومان)'
      },
      gold21k: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        comment: 'نرخ طلای 21 عیار (تومان)'
      },
      gold18k: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        comment: 'نرخ طلای 18 عیار (تومان)'
      },
      silver: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        comment: 'نرخ نقره (تومان)'
      },
      source: {
        type: Sequelize.STRING(50),
        allowNull: false,
        comment: 'منبع نرخ (iran_api, world_api, manual, default)'
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false,
        comment: 'آیا این نرخ فعال است'
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

    // ایجاد ایندکس برای جستجوی سریع آخرین نرخ فعال
    await queryInterface.addIndex('GoldPrices', ['isActive', 'createdAt'], {
      name: 'gold_prices_active_date_index'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('GoldPrices');
  }
};