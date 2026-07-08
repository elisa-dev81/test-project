'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Products', 'wage', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0,
      comment: 'دستمزد محصول به تومان'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Products', 'wage');
  }
};
