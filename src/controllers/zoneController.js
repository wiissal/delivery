const { Zone } = require("../models");
const cacheService = require("../services/cacheService");

const CACHE_KEY_ALL_ZONES = "zones:all";
const CACHE_KEY_ZONE = "zones";

// Get all zones
exports.getAllZones = async (req, res) => {
  try {
    //we gonna try to get from cach first
    const cachedZones = await cacheService.get(CACHE_KEY_ALL_ZONES);
    if (cachedZones) {
      return res.json({
        data: cachedZones,
        source: "cache",
      });
    }
    //if not in cash we gonna get it from data base
    const zones = await Zone.findAll({
      where: { isActive: true },
      order: [["name", "ASC"]],
    });
    // Store in cache
    await cacheService.set(CACHE_KEY_ALL_ZONES, zones);
    res.json(zones);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get zone by ID
exports.getZoneById = async (req, res) => {
  try {
     const zoneId = req.params.id;
    const cacheKey = `${CACHE_KEY_ZONE}:${zoneId}`;
     // Try to get from cache first
    const cachedZone = await cacheService.get(cacheKey);
    
    if (cachedZone) {
      return res.json({
        data: cachedZone,
        source: "cache"
      });
    }
    // If not in cache, get from database
    const zone = await Zone.findByPk(zoneId);
    if (!zone) {
      return res.status(404).json({ error: "Zone not found" });
    }
     // Store in cache
    await cacheService.set(cacheKey, zone);
    
    res.json({
      data: zone,
      source: "database"
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create new zone
exports.createZone = async (req, res) => {
  try {
    
    const { name, city, coordinates } = req.body;
    const zone = await Zone.create({ name, city, coordinates });

    // Invalidate all zones cache
    await cacheService.delete(CACHE_KEY_ALL_ZONES);
    
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
      return res.status(404).json({ error: "Zone not found" });
    }
    await zone.update(req.body);
    // Invalidate cache for this zone and all zones
    await cacheService.delete(`${CACHE_KEY_ZONE}:${zoneId}`);
    await cacheService.delete(CACHE_KEY_ALL_ZONES);

    res.json(zone);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete zone (invalidate cache)
exports.deleteZone = async (req, res) => {
  try {
    const zoneId = req.params.id;
    const zone = await Zone.findByPk(zoneId);
    
    if (!zone) {
      return res.status(404).json({ error: 'Zone not found' });
    }
    
    await zone.update({ isActive: false });
    
    // Invalidate cache for this zone and all zones
    await cacheService.delete(`${CACHE_KEY_ZONE}:${zoneId}`);
    await cacheService.delete(CACHE_KEY_ALL_ZONES);
    
    res.json({ message: 'Zone deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
