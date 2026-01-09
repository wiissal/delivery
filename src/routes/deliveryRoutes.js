const express = require('express');
const router = express.Router();
const deliveryController = require('../controllers/deliveryController');

// GET all deliveries 
router.get('/', deliveryController.getAllDeliveries);

// GET queue statistics
router.get('/queue/stats', deliveryController.getQueueStats);

// GET delivery by ID
router.get('/:id', deliveryController.getDeliveryById);

// POST create new delivery
router.post('/', deliveryController.createDelivery);

// PUT update delivery status
router.put('/:id/status', deliveryController.updateDeliveryStatus);

// DELETE delivery
router.delete('/:id', deliveryController.deleteDelivery);

module.exports = router;