'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Payment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Relationships
      Payment.belongsTo(models.Transaction, {
        foreignKey: 'transaction_id',
        as: 'transaction'
      });
    }
  }
  Payment.init({
    transaction_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    payment_number: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
    payment_method: {
      type: DataTypes.ENUM('cash', 'card', 'check', 'installment'),
      allowNull: false
    },
    payment_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    reference_number: DataTypes.STRING,
    notes: DataTypes.TEXT,
    status: {
      type: DataTypes.ENUM('pending', 'confirmed', 'cancelled'),
      allowNull: false,
      defaultValue: 'confirmed'
    }
  }, {
    sequelize,
    modelName: 'Payment',
  });
  return Payment;
};