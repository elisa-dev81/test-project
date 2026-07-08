'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Products', [
      {
        name: 'گردنبند طرح قلب',
        description: 'گردنبند طلا طرح قلب با زنجیر ۴۵ سانتی',
        weight: 4.25,
        purity: 18,
        making_wage: 15,
        category_id: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'انگشتر سولیتر',
        description: 'انگشتر طلا تک نگین الماس',
        weight: 3.12,
        purity: 18,
        making_wage: 20,
        category_id: 5,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'دستبند کارتیه',
        description: 'دستبند طلا طرح کارتیه با قفل محکم',
        weight: 5.80,
        purity: 18,
        making_wage: 12,
        category_id: 4,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'انگشتر مردانه عقیق',
        description: 'انگشتر طلا مردانه با نگین عقیق یمنی اصل',
        weight: 8.45,
        purity: 18,
        making_wage: 10,
        category_id: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Products', null, {});
  }
};
