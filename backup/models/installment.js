'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Installment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Relationships
      Installment.belongsTo(models.Transaction, {
        foreignKey: 'transaction_id',
        as: 'transaction'
      });
    }
  }
  Installment.init({
    transaction_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    installment_number: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
    due_date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    paid_date: DataTypes.DATE,
    paid_amount: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0
    },
    status: {
      type: DataTypes.ENUM('pending', 'paid', 'overdue', 'cancelled'),
      allowNull: false,
      defaultValue: 'pending'
    },
    late_fee: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0
    },
    notes: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Installment',
  });
  return Installment;
};