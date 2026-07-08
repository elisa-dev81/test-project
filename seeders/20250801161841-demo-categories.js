'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Categories', [
      {
        name: 'طلای زنانه',
        description: 'انواع طلا و جواهرات زنانه',
        parent_id: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'طلای مردانه',
        description: 'انواع طلا و جواهرات مردانه',
        parent_id: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'گردنبند',
        description: 'انواع گردنبند زنانه',
        parent_id: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'دستبند',
        description: 'انواع دستبند زنانه',
        parent_id: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'انگشتر',
        description: 'انواع انگشتر زنانه و مردانه',
        parent_id: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Categories', null, {});
  }
};
