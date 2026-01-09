const { sequelize } = require('../../config/database');
const { Zone } = require('../index');

describe('Zone Model', () => {
  
  // Setup: Connect to test database
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });
  
  // Cleanup: Close connection
  afterAll(async () => {
    await sequelize.close();
  });
  
  // Clear data before each test
  beforeEach(async () => {
    await Zone.destroy({ where: {}, force: true });
  });
  
  describe('Create Zone', () => {
    
    it('should create a zone with valid data', async () => {
      const zoneData = {
        name: 'Sidi Maarif',
        city: 'Casablanca',
        coordinates: { lat: 33.5731, lng: -7.5898 }
      };
      
      const zone = await Zone.create(zoneData);
      
      expect(zone.id).toBeDefined();
      expect(zone.name).toBe('Sidi Maarif');
      expect(zone.city).toBe('Casablanca');
      expect(zone.isActive).toBe(true);
    });
    
    it('should fail without name', async () => {
      const zoneData = {
        city: 'Casablanca'
      };
      
      await expect(Zone.create(zoneData)).rejects.toThrow();
    });
    
    it('should fail with duplicate name', async () => {
      const zoneData = {
        name: 'Anfa',
        city: 'Casablanca'
      };
      
      await Zone.create(zoneData);
      
      await expect(Zone.create(zoneData)).rejects.toThrow();
    });
    
    it('should set default city to Casablanca', async () => {
      const zone = await Zone.create({ name: 'Gauthier' });
      
      expect(zone.city).toBe('Casablanca');
    });
  });
  
  describe('Find Zone', () => {
    
    it('should find zone by ID', async () => {
      const created = await Zone.create({ name: 'Maarif' });
      const found = await Zone.findByPk(created.id);
      
      expect(found).toBeDefined();
      expect(found.name).toBe('Maarif');
    });
    
    it('should find all active zones', async () => {
      await Zone.create({ name: 'Zone1', isActive: true });
      await Zone.create({ name: 'Zone2', isActive: true });
      await Zone.create({ name: 'Zone3', isActive: false });
      
      const zones = await Zone.findAll({ where: { isActive: true } });
      
      expect(zones.length).toBe(2);
    });
  });
  
  describe('Update Zone', () => {
    
    it('should update zone name', async () => {
      const zone = await Zone.create({ name: 'OldName' });
      
      await zone.update({ name: 'NewName' });
      
      expect(zone.name).toBe('NewName');
    });
    
    it('should soft delete zone', async () => {
      const zone = await Zone.create({ name: 'ToDelete' });
      
      await zone.update({ isActive: false });
      
      expect(zone.isActive).toBe(false);
    });
  });
});