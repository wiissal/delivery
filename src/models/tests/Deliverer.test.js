const { sequelize } = require('../../config/database');
const { Deliverer, Zone } = require('../index');

describe('Deliverer Model', () => {
  
  let testZone;
  
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });
  
  afterAll(async () => {
    await sequelize.close();
  });
  
  beforeEach(async () => {
    await Deliverer.destroy({ where: {}, force: true });
    await Zone.destroy({ where: {}, force: true });
    
    // Create a test zone
    testZone = await Zone.create({
      name: 'Test Zone',
      city: 'Casablanca'
    });
  });
  
  describe('Create Deliverer', () => {
    
    it('should create deliverer with valid data', async () => {
      const delivererData = {
        name: 'Ahmed',
        phone: '06 00 00000',
        email: 'ahmed@test.com',
        vehicleType: 'scooter',
        maxCapacity: 10,
        currentZoneId: testZone.id
      };
      
      const deliverer = await Deliverer.create(delivererData);
      
      expect(deliverer.id).toBeDefined();
      expect(deliverer.name).toBe('Ahmed');
      expect(deliverer.currentCapacity).toBe(0);
      expect(deliverer.isAvailable).toBe(true);
    });
    
    it('should fail without required fields', async () => {
      const delivererData = {
        email: 'test@test.com'
      };
      
      await expect(Deliverer.create(delivererData)).rejects.toThrow();
    });
    
    it('should set default values', async () => {
      const deliverer = await Deliverer.create({
        name: 'Test',
        phone: '06 00 00000'
      });
      
      expect(deliverer.vehicleType).toBe('scooter');
      expect(deliverer.maxCapacity).toBe(10);
      expect(deliverer.currentCapacity).toBe(0);
      expect(deliverer.isAvailable).toBe(true);
    });
    
    it('should fail with duplicate phone', async () => {
      const data = {
        name: 'Deliverer 1',
        phone: '06 00 00000'
      };
      
      await Deliverer.create(data);
      
      await expect(Deliverer.create({
        name: 'Deliverer 2',
        phone: '06 00 00000'
      })).rejects.toThrow();
    });
  });
  
  describe('Deliverer Capacity', () => {
    
    it('should track current capacity', async () => {
      const deliverer = await Deliverer.create({
        name: 'Test',
        phone: '06 00 00000',
        maxCapacity: 5,
        currentCapacity: 0
      });
      
      await deliverer.increment('currentCapacity');
      await deliverer.reload();
      
      expect(deliverer.currentCapacity).toBe(1);
    });
    
    it('should check if deliverer has capacity', async () => {
      const deliverer = await Deliverer.create({
        name: 'Test',
        phone: '06 00 00000',
        maxCapacity: 3,
        currentCapacity: 2
      });
      
      const hasCapacity = deliverer.currentCapacity < deliverer.maxCapacity;
      
      expect(hasCapacity).toBe(true);
    });
    
    it('should identify when at max capacity', async () => {
      const deliverer = await Deliverer.create({
        name: 'Test',
        phone: '06 00 00000',
        maxCapacity: 3,
        currentCapacity: 3
      });
      
      const hasCapacity = deliverer.currentCapacity < deliverer.maxCapacity;
      
      expect(hasCapacity).toBe(false);
    });
  });
  
  describe('Deliverer Zone Association', () => {
    
    it('should associate deliverer with zone', async () => {
      const deliverer = await Deliverer.create({
        name: 'Test',
        phone: '06 00 00000',
        currentZoneId: testZone.id
      });
      
      const delivererWithZone = await Deliverer.findByPk(deliverer.id, {
        include: { model: Zone, as: 'currentZone' }
      });
      
      expect(delivererWithZone.currentZone).toBeDefined();
      expect(delivererWithZone.currentZone.name).toBe('Test Zone');
    });
  });
  
  describe('Update Deliverer', () => {
    
    it('should update availability', async () => {
      const deliverer = await Deliverer.create({
        name: 'Test',
        phone: '06 00 00000',
        isAvailable: true
      });
      
      await deliverer.update({ isAvailable: false });
      
      expect(deliverer.isAvailable).toBe(false);
    });
  });
});