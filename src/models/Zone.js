const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Zone = sequelize.define('Zone', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  city: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Casablanca',
  },
  coordinates: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Store lat/lng as JSON',
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'zones',
  timestamps: true,
});

module.exports = Zone;