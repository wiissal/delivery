const { createClient } = require('redis');
const config = require('./index');

const redisClient = createClient({
  socket: {
    host: config.redis.host,
    port: config.redis.port,
  },
});

redisClient.on('error', (err) => console.error(' Redis error:', err.message));
redisClient.on('connect', () => console.log(' Redis connected'));

const connectRedis = async () => {
  try {
    await redisClient.connect();
  } catch (error) {
    console.error(' Redis connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = { redisClient, connectRedis };
//export redis client for caching operation
//export connect redis to establish connection