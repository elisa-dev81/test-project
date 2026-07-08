'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class TransactionItem extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Relationships
      TransactionItem.belongsTo(models.Transaction, {
        foreignKey: 'transaction_id',
        as: 'transaction'
      });
      TransactionItem.belongsTo(models.Product, {
        foreignKey: 'product_id',
        as: 'product'
      });
      TransactionItem.belongsTo(models.Inventory, {
        foreignKey: 'inventory_id',
        as: 'inventory'
      });
    }
  }
  TransactionItem.init({
    transaction_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    product_id: DataTypes.INTEGER,
    inventory_id: DataTypes.INTEGER,
    item_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    item_description: DataTypes.TEXT,
    weight: {
      type: DataTypes.DECIMAL(10, 3),
      allowNull: false
    },
    purity: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    making_wage: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    },
    unit_price: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
    total_price: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    }
  }, {
    sequelize,
    modelName: 'TransactionItem',
  });
  return TransactionItem;
};