const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Package = sequelize.define('Package', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  trackingNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  senderName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  senderPhone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  recipientName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  recipientPhone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  pickupAddress: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  deliveryAddress: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  weight: {
    type: DataTypes.FLOAT,
    allowNull: true,
    comment: 'Weight in kg',
  },
  status: {
    type: DataTypes.ENUM('pending', 'assigned', 'in_transit', 'delivered', 'cancelled'),
    allowNull: false,
    defaultValue: 'pending',
  },
  zoneId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'zones',
      key: 'id',
    },
  },
  delivererId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'deliverers',
      key: 'id',
    },
  },
}, {
  tableName: 'packages',
  timestamps: true,
});

module.exports = Package;