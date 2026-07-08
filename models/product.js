'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Relationships
      Product.belongsTo(models.Category, {
        foreignKey: 'category_id',
        as: 'category'
      });
      Product.hasMany(models.Inventory, {
        foreignKey: 'product_id',
        as: 'inventories'
      });
    }
  }
  Product.init({
    name: DataTypes.STRING,
    description: DataTypes.TEXT,
    weight: DataTypes.DECIMAL,
    purity: DataTypes.INTEGER,
    making_wage: DataTypes.DECIMAL,
    wage: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0
    },
    category_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Product',
  });
  return Product;
};