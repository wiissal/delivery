const { Zone } = require('../models');

// Get all zones
exports.getAllZones = async (req, res) => {
  try {
    const zones = await Zone.findAll({
      where: { isActive: true },
      order: [['name', 'ASC']],
    });
    res.json(zones);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get zone by ID
exports.getZoneById = async (req, res) => {
  try {
    const zone = await Zone.findByPk(req.params.id);
    if (!zone) {
      return res.status(404).json({ error: 'Zone not found' });
    }
    res.json(zone);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create new zone
exports.createZone = async (req, res) => {
  try {
    const { name, city, coordinates } = req.body;
    const zone = await Zone.create({ name, city, coordinates });
    res.status(201).json(zone);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update zone
exports.updateZone = async (req, res) => {
  try {
    const zone = await Zone.findByPk(req.params.id);
    if (!zone) {
      return res.status(404).json({ error: 'Zone not found' });
    }
    await zone.update(req.body);
    res.json(zone);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete zone
exports.deleteZone = async (req, res) => {
  try {
    const zone = await Zone.findByPk(req.params.id);
    if (!zone) {
      return res.status(404).json({ error: 'Zone not found' });
    }
    await zone.update({ isActive: false });
    res.json({ message: 'Zone deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};