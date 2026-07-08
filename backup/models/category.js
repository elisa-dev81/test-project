'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Category extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Self-referential relationship for parent/child categories
      Category.belongsTo(Category, {
        foreignKey: 'parent_id',
        as: 'parent'
      });
      Category.hasMany(Category, {
        foreignKey: 'parent_id',
        as: 'children'
      });
      // Relationship with products
      Category.hasMany(models.Product, {
        foreignKey: 'category_id',
        as: 'products'
      });
    }
  }
  Category.init({
    name: DataTypes.STRING,
    description: DataTypes.TEXT,
    parent_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Category',
  });
  return Category;
};