const { sequelize } = require('../../config/database');
const { Package, Deliverer, Zone } = require('../../models');
const dispatcherService = require('../dispatcherService');

describe('Dispatcher Service', () => {
  
  let testZone;
  let testDeliverer;
  let testPackage;
  
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });
  
  afterAll(async () => {
    await sequelize.close();
  });
  
  beforeEach(async () => {
    // Clear all data
    await Package.destroy({ where: {}, force: true });
    await Deliverer.destroy({ where: {}, force: true });
    await Zone.destroy({ where: {}, force: true });
    
    // Create test zone
    testZone = await Zone.create({
      name: 'Test Zone',
      city: 'Casablanca'
    });
    
    // Create test deliverer
    testDeliverer = await Deliverer.create({
      name: 'Ahmed',
      phone: '0612345678',
      maxCapacity: 5,
      currentCapacity: 0,
      isAvailable: true,
      currentZoneId: testZone.id
    });
    
    // Create test package
    testPackage = await Package.create({
      trackingNumber: 'TRK123',
      senderName: 'Sender',
      senderPhone: '0611111111',
      recipientName: 'Recipient',
      recipientPhone: '0622222222',
      pickupAddress: 'Pickup Address',
      deliveryAddress: 'Delivery Address',
      status: 'pending',
      zoneId: testZone.id
    });
  });
  
  describe('Assign Package to Deliverer', () => {
    
    it('should assign package successfully', async () => {
      const result = await dispatcherService.assignPackageToDeliverer(
        testPackage.id,
        testDeliverer.id
      );
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      
      // Verify package is assigned
      await testPackage.reload();
      expect(testPackage.delivererId).toBe(testDeliverer.id);
      expect(testPackage.status).toBe('assigned');
      
      // Verify deliverer capacity increased
      await testDeliverer.reload();
      expect(testDeliverer.currentCapacity).toBe(1);
    });
    
    it('should fail if package not found', async () => {
      const result = await dispatcherService.assignPackageToDeliverer(
        99999,
        testDeliverer.id
      );
      
      expect(result.success).toBe(false);
      expect(result.code).toBe(404);
      expect(result.error).toContain('Package not found');
    });
    
    it('should fail if deliverer not found', async () => {
      const result = await dispatcherService.assignPackageToDeliverer(
        testPackage.id,
        99999
      );
      
      expect(result.success).toBe(false);
      expect(result.code).toBe(404);
      expect(result.error).toContain('Deliverer not found');
    });
    
    it('should fail if deliverer is not available', async () => {
      await testDeliverer.update({ isAvailable: false });
      
      const result = await dispatcherService.assignPackageToDeliverer(
        testPackage.id,
        testDeliverer.id
      );
      
      expect(result.success).toBe(false);
      expect(result.code).toBe(409);
      expect(result.error).toContain('not available');
    });
    
    it('should fail if deliverer at max capacity', async () => {
      await testDeliverer.update({ 
        currentCapacity: 5,
        maxCapacity: 5 
      });
      
      const result = await dispatcherService.assignPackageToDeliverer(
        testPackage.id,
        testDeliverer.id
      );
      
      expect(result.success).toBe(false);
      expect(result.code).toBe(409);
      expect(result.error).toContain('max capacity');
    });
    
    it('should fail if package already assigned', async () => {
      await testPackage.update({ status: 'assigned' });
      
      const result = await dispatcherService.assignPackageToDeliverer(
        testPackage.id,
        testDeliverer.id
      );
      
      expect(result.success).toBe(false);
      expect(result.code).toBe(409);
      expect(result.error).toContain('already assigned');
    });
  });
  
  describe('Race Condition Prevention', () => {
    
    it('should handle concurrent assignments safely', async () => {
      // Create deliverer with only 1 capacity left
      const deliverer = await Deliverer.create({
        name: 'Limited Capacity',
        phone: '0699999999',
        maxCapacity: 1,
        currentCapacity: 0,
        isAvailable: true,
        currentZoneId: testZone.id
      });
      
      // Create 3 packages
      const package1 = await Package.create({
        trackingNumber: 'TRK001',
        senderName: 'S1',
        senderPhone: '0611111111',
        recipientName: 'R1',
        recipientPhone: '0622222222',
        pickupAddress: 'Addr1',
        deliveryAddress: 'Addr1',
        status: 'pending',
        zoneId: testZone.id
      });
      
      const package2 = await Package.create({
        trackingNumber: 'TRK002',
        senderName: 'S2',
        senderPhone: '0611111112',
        recipientName: 'R2',
        recipientPhone: '0622222223',
        pickupAddress: 'Addr2',
        deliveryAddress: 'Addr2',
        status: 'pending',
        zoneId: testZone.id
      });
      
      const package3 = await Package.create({
        trackingNumber: 'TRK003',
        senderName: 'S3',
        senderPhone: '0611111113',
        recipientName: 'R3',
        recipientPhone: '0622222224',
        pickupAddress: 'Addr3',
        deliveryAddress: 'Addr3',
        status: 'pending',
        zoneId: testZone.id
      });
      
      // Try to assign all 3 simultaneously
      const results = await Promise.all([
        dispatcherService.assignPackageToDeliverer(package1.id, deliverer.id),
        dispatcherService.assignPackageToDeliverer(package2.id, deliverer.id),
        dispatcherService.assignPackageToDeliverer(package3.id, deliverer.id)
      ]);
      
      // Count successful assignments
      const successCount = results.filter(r => r.success).length;
      const failCount = results.filter(r => !r.success).length;
      
      // ONLY 1 should succeed, 2 should fail
      expect(successCount).toBe(1);
      expect(failCount).toBe(2);
      
      // Verify deliverer capacity is exactly 1
      await deliverer.reload();
      expect(deliverer.currentCapacity).toBe(1);
    });
  });
  
  describe('Find Best Deliverer', () => {
    
    it('should find deliverer with lowest capacity', async () => {
      // Create multiple deliverers with different capacities
      const deliverer1 = await Deliverer.create({
        name: 'D1',
        phone: '0611111111',
        maxCapacity: 10,
        currentCapacity: 5,
        isAvailable: true,
        currentZoneId: testZone.id
      });
      
      const deliverer2 = await Deliverer.create({
        name: 'D2',
        phone: '0622222222',
        maxCapacity: 10,
        currentCapacity: 2, // Lowest capacity
        isAvailable: true,
        currentZoneId: testZone.id
      });
      
      const deliverer3 = await Deliverer.create({
        name: 'D3',
        phone: '0633333333',
        maxCapacity: 10,
        currentCapacity: 7,
        isAvailable: true,
        currentZoneId: testZone.id
      });
      
      const best = await dispatcherService.findBestDeliverer(testZone.id);
      
      expect(best).toBeDefined();
      expect(best.id).toBe(deliverer2.id);
    });
    
    it('should return null if no available deliverer', async () => {
      await testDeliverer.update({ isAvailable: false });
      
      const best = await dispatcherService.findBestDeliverer(testZone.id);
      
      expect(best).toBeNull();
    });
  });
  
  describe('Auto Assign Package', () => {
    
    it('should auto-assign to best available deliverer', async () => {
      const result = await dispatcherService.autoAssignPackage(testPackage.id);
      
      expect(result.success).toBe(true);
      
      await testPackage.reload();
      expect(testPackage.delivererId).toBe(testDeliverer.id);
    });
    
    it('should fail if no deliverer available in zone', async () => {
      // Make deliverer unavailable
      await testDeliverer.update({ isAvailable: false });
      
      const result = await dispatcherService.autoAssignPackage(testPackage.id);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('No available deliverer');
    });
  });
});