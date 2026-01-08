const express = require('express');
const router = express.Router();
const packageController = require('../controllers/packageController');

// GET all packages 
router.get('/', packageController.getAllPackages);

// GET package by ID
router.get('/:id', packageController.getPackageById);

// POST 
router.post('/', packageController.createPackage);

// PUT 
router.put('/:id', packageController.updatePackage);

// PUT 
router.put('/:id/assign', packageController.assignPackage);

// DELETE package
router.delete('/:id', packageController.deletePackage);

module.exports = router;