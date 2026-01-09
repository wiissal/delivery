const { Package, Zone, Deliverer } = require('../models');
const dispatcherService = require('../services/dispatcherService');

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
    const pkg = await Package.findByPk(req.params.id, {
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
    if (!pkg) {
      return res.status(404).json({ error: 'Package not found' });
    }
    res.json(pkg);
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
    
    const pkg = await Package.create({
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
    
    res.status(201).json(pkg);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update package
exports.updatePackage = async (req, res) => {
  try {
    const pkg = await Package.findByPk(req.params.id);
    if (!pkg) {
      return res.status(404).json({ error: 'Package not found' });
    }
    await pkg.update(req.body);
    res.json(pkg);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Assign package to deliverer (WITH SMART DISPATCHER)
exports.assignPackage = async (req, res) => {
  try {
    const packageId = req.params.id;
    const { delivererId } = req.body;
    
    // Use smart dispatcher with transaction locking
    const result = await dispatcherService.assignPackageToDeliverer(
      packageId, 
      delivererId
    );
    
    if (!result.success) {
      return res.status(result.code).json({ 
        error: result.error 
      });
    }
    
    res.status(201).json({
      message: 'Package assigned successfully',
      data: result.data
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Auto-assign package to best available deliverer
exports.autoAssignPackage = async (req, res) => {
  try {
    const packageId = req.params.id;
    
    // Use smart dispatcher to find and assign best deliverer
    const result = await dispatcherService.autoAssignPackage(packageId);
    
    if (!result.success) {
      return res.status(result.code).json({ 
        error: result.error 
      });
    }
    
    res.status(201).json({
      message: 'Package auto-assigned successfully',
      data: result.data
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete package
exports.deletePackage = async (req, res) => {
  try {
    const pkg = await Package.findByPk(req.params.id);
    if (!pkg) {
      return res.status(404).json({ error: 'Package not found' });
    }
    await pkg.destroy();
    res.json({ message: 'Package deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};