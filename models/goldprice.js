'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class GoldPrice extends Model {
    static associate(models) {
      // در آینده می‌توان روابط با سایر مدل‌ها تعریف کرد
    }

    // متد برای دریافت آخرین نرخ فعال
    static async getLatestPrice() {
      return await this.findOne({
        where: { isActive: true },
        order: [['createdAt', 'DESC']]
      });
    }

    // متد برای غیرفعال کردن نرخ‌های قدیمی
    static async deactivateOldPrices() {
      return await this.update(
        { isActive: false },
        { where: { isActive: true } }
      );
    }

    // متد برای ایجاد نرخ جدید
    static async createNewPrice(priceData) {
      // ابتدا نرخ‌های قدیمی را غیرفعال کن
      await this.deactivateOldPrices();
      
      // سپس نرخ جدید را ایجاد کن
      return await this.create({
        ...priceData,
        isActive: true
      });
    }

    // متد برای تبدیل داده به فرمت API
    toApiFormat() {
      return {
        gold24k: parseFloat(this.gold24k),
        gold22k: parseFloat(this.gold22k),
        gold18k: parseFloat(this.gold18k),
        silver: parseFloat(this.silver),
        source: this.source,
        lastUpdate: this.createdAt.toISOString()
      };
    }
  }

  GoldPrice.init({
    gold24k: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    gold22k: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    gold21k: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    gold18k: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    silver: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    source: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        isIn: [['iran_api', 'world_api', 'manual', 'default']]
      }
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'GoldPrice',
    tableName: 'GoldPrices',
    indexes: [
      {
      }
    ]
  });

  return GoldPrice;
};
