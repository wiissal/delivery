const express = require('express');
const router = express.Router();
const zoneController = require('../controllers/zoneController');

// GET all zones
router.get('/', zoneController.getAllZones);

// GET zone by ID
router.get('/:id', zoneController.getZoneById);

// POST 
router.post('/', zoneController.createZone);

// PUT 
router.put('/:id', zoneController.updateZone);

// DELETE zone
router.delete('/:id', zoneController.deleteZone);

module.exports = router;