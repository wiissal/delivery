const { Deliverer, Zone } = require('../models');

// Get all deliverers
exports.getAllDeliverers = async (req, res) => {
  try {
    const deliverers = await Deliverer.findAll({
      include: [
        {
          model: Zone,
          as: 'currentZone',
          attributes: ['id', 'name', 'city'],
        },
      ],
      order: [['name', 'ASC']],
    });
    res.json(deliverers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get deliverer by ID
exports.getDelivererById = async (req, res) => {
  try {
    const deliverer = await Deliverer.findByPk(req.params.id, {
      include: [
        {
          model: Zone,
          as: 'currentZone',
        },
      ],
    });
    if (!deliverer) {
      return res.status(404).json({ error: 'Deliverer not found' });
    }
    res.json(deliverer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get available deliverers in a zone
exports.getAvailableDeliverers = async (req, res) => {
  try {
    const { zoneId } = req.query;
    const where = {
      isAvailable: true,
    };
    
    if (zoneId) {
      where.currentZoneId = zoneId;
    }
    
    const deliverers = await Deliverer.findAll({
      where,
      order: [['currentCapacity', 'ASC']],
    });
    res.json(deliverers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create new deliverer
exports.createDeliverer = async (req, res) => {
  try {
    const { name, phone, email, vehicleType, maxCapacity, currentZoneId } = req.body;
    const deliverer = await Deliverer.create({
      name,
      phone,
      email,
      vehicleType,
      maxCapacity,
      currentZoneId,
    });
    res.status(201).json(deliverer);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update deliverer
exports.updateDeliverer = async (req, res) => {
  try {
    const deliverer = await Deliverer.findByPk(req.params.id);
    if (!deliverer) {
      return res.status(404).json({ error: 'Deliverer not found' });
    }
    await deliverer.update(req.body);
    res.json(deliverer);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete deliverer
exports.deleteDeliverer = async (req, res) => {
  try {
    const deliverer = await Deliverer.findByPk(req.params.id);
    if (!deliverer) {
      return res.status(404).json({ error: 'Deliverer not found' });
    }
    await deliverer.destroy();
    res.json({ message: 'Deliverer deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};