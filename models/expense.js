'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Expense extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Define associations here if needed
    }
  }
  Expense.init({
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: DataTypes.TEXT,
    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
    category: {
      type: DataTypes.ENUM('rent', 'utilities', 'supplies', 'marketing', 'labor', 'equipment', 'maintenance', 'other'),
      allowNull: false
    },
    expense_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    payment_method: {
      type: DataTypes.ENUM('cash', 'card', 'check', 'transfer'),
      allowNull: false,
      defaultValue: 'cash'
    },
    receipt_number: DataTypes.STRING,
    vendor_name: DataTypes.STRING,
    vendor_phone: DataTypes.STRING,
    status: {
      type: DataTypes.ENUM('pending', 'paid', 'cancelled'),
      allowNull: false,
      defaultValue: 'paid'
    }
  }, {
    sequelize,
    modelName: 'Expense',
  });
  return Expense;
};