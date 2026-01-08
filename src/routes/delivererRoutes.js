const express = require('express');
const router = express.Router();
const delivererController = require('../controllers/delivererController');

// GET all deliverers
router.get('/', delivererController.getAllDeliverers);

// GET available deliverers (with optional zone filter)
router.get('/available', delivererController.getAvailableDeliverers);

// GET deliverer by ID
router.get('/:id', delivererController.getDelivererById);

// POST create new deliverer
router.post('/', delivererController.createDeliverer);

// PUT update deliverer
router.put('/:id', delivererController.updateDeliverer);

// DELETE deliverer
router.delete('/:id', delivererController.deleteDeliverer);

module.exports = router;