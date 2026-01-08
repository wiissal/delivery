const { Package, Zone, Deliverer } = require('../models');

// Get all packages
exports.getAllPackages = async (req, res) => {
  try {
    const { status } = req.query;
    const where = {};
    
    if (status) {
      where.status = status;
    }
    
    const packages = await Package.findAll({
      where,
      include: [
        {
          model: Zone,
          as: 'zone',
          attributes: ['id', 'name', 'city'],
        },
        {
          model: Deliverer,
          as: 'deliverer',
          attributes: ['id', 'name', 'phone'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });
    res.json(packages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get package by ID
exports.getPackageById = async (req, res) => {
  try {
    const package = await Package.findByPk(req.params.id, {
      include: [
        {
          model: Zone,
          as: 'zone',
        },
        {
          model: Deliverer,
          as: 'deliverer',
        },
      ],
    });
    if (!package) {
      return res.status(404).json({ error: 'Package not found' });
    }
    res.json(package);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create new package
exports.createPackage = async (req, res) => {
  try {
    const {
      trackingNumber,
      senderName,
      senderPhone,
      recipientName,
      recipientPhone,
      pickupAddress,
      deliveryAddress,
      weight,
      zoneId,
    } = req.body;
    
    const package = await Package.create({
      trackingNumber,
      senderName,
      senderPhone,
      recipientName,
      recipientPhone,
      pickupAddress,
      deliveryAddress,
      weight,
      zoneId,
    });
    
    res.status(201).json(package);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update package
exports.updatePackage = async (req, res) => {
  try {
    const package = await Package.findByPk(req.params.id);
    if (!package) {
      return res.status(404).json({ error: 'Package not found' });
    }
    await package.update(req.body);
    res.json(package);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Assign package to deliverer (Smart Dispatcher will be here later)
exports.assignPackage = async (req, res) => {
  try {
    const { delivererId } = req.body;
    const package = await Package.findByPk(req.params.id);
    
    if (!package) {
      return res.status(404).json({ error: 'Package not found' });
    }
    
    if (package.status !== 'pending') {
      return res.status(400).json({ error: 'Package already assigned' });
    }
    
    const deliverer = await Deliverer.findByPk(delivererId);
    if (!deliverer) {
      return res.status(404).json({ error: 'Deliverer not found' });
    }
    
    // Check capacity
    if (deliverer.currentCapacity >= deliverer.maxCapacity) {
      return res.status(409).json({ error: 'Deliverer at max capacity' });
    }
    
    // Assign package
    await package.update({
      delivererId,
      status: 'assigned',
    });
    
    // Update deliverer capacity
    await deliverer.increment('currentCapacity');
    
    res.json(package);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete package
exports.deletePackage = async (req, res) => {
  try {
    const package = await Package.findByPk(req.params.id);
    if (!package) {
      return res.status(404).json({ error: 'Package not found' });
    }
    await package.destroy();
    res.json({ message: 'Package deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};