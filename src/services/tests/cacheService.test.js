const cacheService = require('../cacheService');
const { redisClient } = require('../../config/redis');

describe('Cache Service', () => {
  
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
    // Clear all cache before each test
    await cacheService.clear();
  });
  
  describe('Set and Get Cache', () => {
    
    it('should set and get cache successfully', async () => {
      const key = 'test:key';
      const value = { name: 'Test', id: 1 };
      
      await cacheService.set(key, value);
      const result = await cacheService.get(key);
      
      expect(result).toEqual(value);
    });
    
    it('should return null for non-existent key', async () => {
      const result = await cacheService.get('non:existent');
      
      expect(result).toBeNull();
    });
    
    it('should cache complex objects', async () => {
      const complexData = {
        id: 1,
        name: 'Zone',
        coordinates: { lat: 33.5, lng: -7.5 },
        active: true,
        tags: ['tag1', 'tag2']
      };
      
      await cacheService.set('complex', complexData);
      const result = await cacheService.get('complex');
      
      expect(result).toEqual(complexData);
    });
  });
  
  describe('Delete Cache', () => {
    
    it('should delete cache by key', async () => {
      const key = 'test:delete';
      
      await cacheService.set(key, { data: 'test' });
      await cacheService.delete(key);
      
      const result = await cacheService.get(key);
      expect(result).toBeNull();
    });
  });
  
  describe('Delete Pattern', () => {
    
    it('should delete multiple keys by pattern', async () => {
      await cacheService.set('zones:1', { id: 1 });
      await cacheService.set('zones:2', { id: 2 });
      await cacheService.set('zones:3', { id: 3 });
      await cacheService.set('deliverers:1', { id: 1 });
      
      await cacheService.deletePattern('zones');
      
      const zone1 = await cacheService.get('zones:1');
      const zone2 = await cacheService.get('zones:2');
      const deliverer = await cacheService.get('deliverers:1');
      
      expect(zone1).toBeNull();
      expect(zone2).toBeNull();
      expect(deliverer).not.toBeNull();
    });
  });
  
  describe('Clear Cache', () => {
    
    it('should clear all cache', async () => {
      await cacheService.set('key1', { data: 1 });
      await cacheService.set('key2', { data: 2 });
      await cacheService.set('key3', { data: 3 });
      
      await cacheService.clear();
      
      const result1 = await cacheService.get('key1');
      const result2 = await cacheService.get('key2');
      
      expect(result1).toBeNull();
      expect(result2).toBeNull();
    });
  });
  
  describe('Cache Key Generation', () => {
    
    it('should generate cache key with prefix', () => {
      const key = cacheService.generateKey('zones', '1');
      
      expect(key).toBe('logistima:zones:1');
    });
    
    it('should generate cache key without identifier', () => {
      const key = cacheService.generateKey('zones:all');
      
      expect(key).toBe('logistima:zones:all');
    });
  });
  
  describe('TTL Support', () => {
    
    it('should expire cache after TTL', async () => {
      const key = 'test:ttl';
      const ttl = 1; // 1 second
      
      await cacheService.set(key, { data: 'test' }, ttl);
      
      // Should exist immediately
      let result = await cacheService.get(key);
      expect(result).not.toBeNull();
      
      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Should be expired
      result = await cacheService.get(key);
      expect(result).toBeNull();
    }, 10000); // Increase timeout for this test
  });
});