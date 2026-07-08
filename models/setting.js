'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Setting extends Model {
    static associate(models) {
      // define association here if needed
    }
  }
  
  Setting.init({
    key: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      primaryKey: true
    },
    value: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    type: {
      type: DataTypes.ENUM('string', 'number', 'boolean', 'json'),
      allowNull: false,
      defaultValue: 'string'
    },
    category: {
      type: DataTypes.ENUM('general', 'business', 'appearance', 'security', 'backup'),
      allowNull: false,
      defaultValue: 'general'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'Setting',
    tableName: 'Settings',
    timestamps: true
  });
  
  return Setting;
};
