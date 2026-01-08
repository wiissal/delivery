const { redisClient } = require('../config/redis');
const config = require('../config');

const CACHE_PREFIX = 'logistima:';
const DEFAULT_TTL = 3600; // 1 hour

class CacheService {
  
  // Generate cache key
  generateKey(type, identifier = '') {
    return `${CACHE_PREFIX}${type}${identifier ? ':' + identifier : ''}`;
  }
  
  // Set cache
  async set(key, value, ttl = DEFAULT_TTL) {
    try {
      const cacheKey = this.generateKey(key);
      await redisClient.setEx(cacheKey, ttl, JSON.stringify(value));
      console.log(` Cache SET: ${cacheKey}`);
      return true;
    } catch (error) {
      console.error(' Cache SET error:', error.message);
      return false;
    }
  }
  
  // Get cache
  async get(key) {
    try {
      const cacheKey = this.generateKey(key);
      const data = await redisClient.get(cacheKey);
      
      if (data) {
        console.log(` Cache HIT: ${cacheKey}`);
        return JSON.parse(data);
      }
      
      console.log(` Cache MISS: ${cacheKey}`);
      return null;
    } catch (error) {
      console.error(' Cache GET error:', error.message);
      return null;
    }
  }
  
  // Delete cache
  async delete(key) {
    try {
      const cacheKey = this.generateKey(key);
      await redisClient.del(cacheKey);
      console.log(` Cache DELETE: ${cacheKey}`);
      return true;
    } catch (error) {
      console.error(' Cache DELETE error:', error.message);
      return false;
    }
  }
  
  // Delete multiple keys by pattern
  async deletePattern(pattern) {
    try {
      const cachePattern = this.generateKey(pattern);
      const keys = await redisClient.keys(cachePattern + '*');
      
      if (keys.length > 0) {
        await redisClient.del(keys);
        console.log(` Cache DELETE pattern: ${cachePattern}* (${keys.length} keys)`);
      }
      
      return true;
    } catch (error) {
      console.error(' Cache DELETE pattern error:', error.message);
      return false;
    }
  }
  
  // Clear all cache
  async clear() {
    try {
      const keys = await redisClient.keys(`${CACHE_PREFIX}*`);
      
      if (keys.length > 0) {
        await redisClient.del(keys);
        console.log(` Cache CLEARED: ${keys.length} keys deleted`);
      }
      
      return true;
    } catch (error) {
      console.error('Cache CLEAR error:', error.message);
      return false;
    }
  }
}

module.exports = new CacheService();