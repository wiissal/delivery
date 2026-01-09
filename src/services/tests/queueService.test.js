const queueService = require('../queueService');
const { redisClient } = require('../../config/redis');

describe('Queue Service', () => {
  
  beforeAll(async () => {
    // Connect to Redis
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
  });
  
  afterAll(async () => {
    // Close Redis connection
    await redisClient.quit();
  });
  
  beforeEach(async () => {
    // Clear queue before each test
    const { Queue } = require('bullmq');
    const config = require('../../config');
    
    const queue = new Queue('deliveries', {
      connection: {
        host: config.redis.host,
        port: config.redis.port,
      }
    });
    
    await queue.obliterate({ force: true });
    await queue.close();
  });
  
  describe('Add Route Calculation Job', () => {
    
    it('should add route calculation job successfully', async () => {
      const deliveryData = {
        id: 1,
        deliveryCode: 'DEL-123',
        pickupAddress: '123 Pickup St',
        deliveryAddress: '456 Delivery Ave'
      };
      
      const job = await queueService.addRouteCalculationJob(deliveryData);
      
      expect(job).toBeDefined();
      expect(job.id).toBeDefined();
      expect(job.name).toBe('calculate-route');
      expect(job.data.deliveryId).toBe(1);
    });
    
    it('should include all required data in job', async () => {
      const deliveryData = {
        id: 1,
        deliveryCode: 'DEL-123',
        pickupAddress: '123 Pickup St',
        deliveryAddress: '456 Delivery Ave'
      };
      
      const job = await queueService.addRouteCalculationJob(deliveryData);
      
      expect(job.data).toMatchObject({
        deliveryId: 1,
        deliveryCode: 'DEL-123',
        pickupAddress: '123 Pickup St',
        deliveryAddress: '456 Delivery Ave'
      });
    });
  });
  
  describe('Add Receipt Generation Job', () => {
    
    it('should add receipt generation job successfully', async () => {
      const deliveryData = {
        id: 1,
        deliveryCode: 'DEL-123',
        recipientName: 'Ahmed',
        recipientPhone: '0612345678'
      };
      
      const job = await queueService.addReceiptGenerationJob(deliveryData);
      
      expect(job).toBeDefined();
      expect(job.id).toBeDefined();
      expect(job.name).toBe('generate-receipt');
      expect(job.data.recipientName).toBe('Ahmed');
    });
  });
  
  describe('Process Delivery', () => {
    
    it('should add both jobs for delivery', async () => {
      const deliveryData = {
        id: 1,
        deliveryCode: 'DEL-123',
        pickupAddress: '123 Pickup St',
        deliveryAddress: '456 Delivery Ave',
        recipientName: 'Ahmed',
        recipientPhone: '0612345678'
      };
      
      const result = await queueService.processDelivery(deliveryData);
      
      expect(result).toBe(true);
      
      // Verify jobs were added
      const stats = await queueService.getQueueStats();
      expect(stats.waiting).toBeGreaterThanOrEqual(2);
    });
  });
  
  describe('Get Queue Stats', () => {
    
    it('should return queue statistics', async () => {
      const stats = await queueService.getQueueStats();
      
      expect(stats).toBeDefined();
      expect(stats).toHaveProperty('waiting');
      expect(stats).toHaveProperty('active');
      expect(stats).toHaveProperty('completed');
      expect(stats).toHaveProperty('failed');
      expect(stats).toHaveProperty('total');
    });
    
    it('should count jobs correctly', async () => {
      // Add 3 jobs
      const deliveryData = {
        id: 1,
        deliveryCode: 'DEL-123',
        pickupAddress: 'Addr1',
        deliveryAddress: 'Addr2',
        recipientName: 'Test',
        recipientPhone: '0612345678'
      };
      
      await queueService.addRouteCalculationJob(deliveryData);
      await queueService.addRouteCalculationJob(deliveryData);
      await queueService.addReceiptGenerationJob(deliveryData);
      
      const stats = await queueService.getQueueStats();
      
      expect(stats.waiting).toBe(3);
    });
  });
  
  describe('Job Retry Logic', () => {
    
    it('should configure retry attempts', async () => {
      const deliveryData = {
        id: 1,
        deliveryCode: 'DEL-123',
        pickupAddress: 'Addr1',
        deliveryAddress: 'Addr2'
      };
      
      const job = await queueService.addRouteCalculationJob(deliveryData);
      
      expect(job.opts.attempts).toBe(3);
      expect(job.opts.backoff).toBeDefined();
    });
  });
});