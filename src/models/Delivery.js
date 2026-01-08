const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Delivery = sequelize.define('Delivery', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  deliveryCode: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  packageId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'packages',
      key: 'id',
    },
  },
  delivererId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'deliverers',
      key: 'id',
    },
  },
  status: {
    type: DataTypes.ENUM('scheduled', 'in_progress', 'completed', 'failed'),
    allowNull: false,
    defaultValue: 'scheduled',
  },
  scheduledAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  startedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'deliveries',
  timestamps: true,
});

module.exports = Delivery;