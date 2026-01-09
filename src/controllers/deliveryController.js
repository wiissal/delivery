const { Delivery, Package, Deliverer } = require('../models');

// Get all deliveries
exports.getAllDeliveries = async (req, res) => {
  try {
    const { status } = req.query;
    const where = {};
    
    if (status) {
      where.status = status;
    }
    
    const deliveries = await Delivery.findAll({
      where,
      include: [
        {
          model: Package,
          as: 'package',
          attributes: ['id', 'trackingNumber', 'recipientName', 'deliveryAddress'],
        },
        {
          model: Deliverer,
          as: 'deliverer',
          attributes: ['id', 'name', 'phone'],
        },
      ],
      order: [['scheduledAt', 'DESC']],
    });
    res.json(deliveries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get delivery by ID
exports.getDeliveryById = async (req, res) => {
  try {
    const delivery = await Delivery.findByPk(req.params.id, {
      include: [
        {
          model: Package,
          as: 'package',
        },
        {
          model: Deliverer,
          as: 'deliverer',
        },
      ],
    });
    if (!delivery) {
      return res.status(404).json({ error: 'Delivery not found' });
    }
    res.json(delivery);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create new delivery (TRIGGER BACKGROUND JOBS)
exports.createDelivery = async (req, res) => {
  try {
    const { packageId, delivererId, scheduledAt, notes } = req.body;
    
    // Get package details for jobs
    const package = await Package.findByPk(packageId);
    if (!package) {
      return res.status(404).json({ error: 'Package not found' });
    }
    
    // Generate delivery code
    const deliveryCode = `DEL-${Date.now()}`;
    
    // Create delivery
    const delivery = await Delivery.create({
      deliveryCode,
      packageId,
      delivererId,
      scheduledAt,
      notes,
    });
    
    // Trigger background jobs (route calculation + receipt generation)
    await queueService.processDelivery({
      id: delivery.id,
      deliveryCode: delivery.deliveryCode,
      pickupAddress: package.pickupAddress,
      deliveryAddress: package.deliveryAddress,
      recipientName: package.recipientName,
      recipientPhone: package.recipientPhone,
    });
    
    res.status(201).json({
      message: 'Delivery created and jobs queued',
      delivery,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update delivery status
exports.updateDeliveryStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const delivery = await Delivery.findByPk(req.params.id);
    
    if (!delivery) {
      return res.status(404).json({ error: 'Delivery not found' });
    }
    
    const updates = { status };
    
    // Update timestamps based on status
    if (status === 'in_progress' && !delivery.startedAt) {
      updates.startedAt = new Date();
    }
    
    if (status === 'completed' && !delivery.completedAt) {
      updates.completedAt = new Date();
      
      // Update package status
      await Package.update(
        { status: 'delivered' },
        { where: { id: delivery.packageId } }
      );
    }
    
    await delivery.update(updates);
    res.json(delivery);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get queue statistics
exports.getQueueStats = async (req, res) => {
  try {
    const stats = await queueService.getQueueStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete delivery
exports.deleteDelivery = async (req, res) => {
  try {
    const delivery = await Delivery.findByPk(req.params.id);
    if (!delivery) {
      return res.status(404).json({ error: 'Delivery not found' });
    }
    await delivery.destroy();
    res.json({ message: 'Delivery deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};