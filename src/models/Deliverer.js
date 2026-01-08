const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Deliverer = sequelize.define('Deliverer', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  },
  vehicleType: {
    type: DataTypes.ENUM('bike', 'scooter', 'car', 'van'),
    allowNull: false,
    defaultValue: 'scooter',
  },
  maxCapacity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 10,
    comment: 'Maximum number of packages deliverer can handle',
  },
  currentCapacity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Current number of packages assigned',
  },
  isAvailable: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  currentZoneId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'zones',
      key: 'id',
    },
  },
}, {
  tableName: 'deliverers',
  timestamps: true,
});

module.exports = Deliverer;