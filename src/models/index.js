const Zone = require('./Zone');
const Deliverer = require('./Deliverer');
const Package = require('./Package');
const Delivery = require('./Delivery');

// Define relationships

// Zone has many Deliverers
Zone.hasMany(Deliverer, {
  foreignKey: 'currentZoneId',
  as: 'deliverers',
});
Deliverer.belongsTo(Zone, {
  foreignKey: 'currentZoneId',
  as: 'currentZone',
});

// Zone has many Packages
Zone.hasMany(Package, {
  foreignKey: 'zoneId',
  as: 'packages',
});
Package.belongsTo(Zone, {
  foreignKey: 'zoneId',
  as: 'zone',
});

// Deliverer has many Packages
Deliverer.hasMany(Package, {
  foreignKey: 'delivererId',
  as: 'packages',
});
Package.belongsTo(Deliverer, {
  foreignKey: 'delivererId',
  as: 'deliverer',
});

// Package has many Deliveries
Package.hasMany(Delivery, {
  foreignKey: 'packageId',
  as: 'deliveries',
});
Delivery.belongsTo(Package, {
  foreignKey: 'packageId',
  as: 'package',
});

// Deliverer has many Deliveries
Deliverer.hasMany(Delivery, {
  foreignKey: 'delivererId',
  as: 'deliveries',
});
Delivery.belongsTo(Deliverer, {
  foreignKey: 'delivererId',
  as: 'deliverer',
});

module.exports = {
  Zone,
  Deliverer,
  Package,
  Delivery,
};