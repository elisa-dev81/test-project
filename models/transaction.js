'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Transaction extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Relationships
      Transaction.hasMany(models.TransactionItem, {
        foreignKey: 'transaction_id',
        as: 'items'
      });
      Transaction.hasMany(models.Payment, {
        foreignKey: 'transaction_id',
        as: 'payments'
      });
      Transaction.hasMany(models.Installment, {
        foreignKey: 'transaction_id',
        as: 'installments'
      });
    }
  }
  Transaction.init({
    transaction_number: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('purchase', 'sale'),
      allowNull: false
    },
    customer_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    customer_phone: DataTypes.STRING,
    customer_address: DataTypes.TEXT,
    total_weight: {
      type: DataTypes.DECIMAL(10, 3),
      allowNull: false,
      defaultValue: 0
    },
    total_amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0
    },
    payment_method: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'cash',
      validate: {
        isIn: [['cash', 'card', 'check', 'transfer', 'unpaid', 'installment', 'exchange']]
      }
    },
    payment_status: {
      type: DataTypes.ENUM('pending', 'partial', 'completed'),
      allowNull: false,
      defaultValue: 'pending'
    },
    paid_amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0
    },
    remaining_amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0
    },
    gold_price_18k: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
    gold_price_24k: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
    discount_amount: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0
    },
    tax_amount: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0
    },
    notes: DataTypes.TEXT,
    transaction_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'Transaction',
  });
  return Transaction;
};