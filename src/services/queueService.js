const { Queue } = require('bullmq');
const config = require('../config');

const connection = {
  host: config.redis.host,
  port: config.redis.port,
};

class QueueService {
  constructor() {
    this._queue = null;
  }

  // Lazy initialization - only create queue when needed
  get queue() {
    if (!this._queue) {
      this._queue = new Queue('deliveries', { connection });
    }
    return this._queue;
  }

  // Add route calculation job
  async addRouteCalculationJob(deliveryData) {
    try {
      const job = await this.queue.add(
        'calculate-route',
        {
          deliveryId: deliveryData.id,
          deliveryCode: deliveryData.deliveryCode,
          pickupAddress: deliveryData.pickupAddress,
          deliveryAddress: deliveryData.deliveryAddress,
        },
        {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
        }
      );
      
      console.log(`📦 Route calculation job added: ${job.id}`);
      return job;
    } catch (error) {
      console.error('❌ Failed to add route calculation job:', error.message);
      throw error;
    }
  }
  
  // Add receipt generation job
  async addReceiptGenerationJob(deliveryData) {
    try {
      const job = await this.queue.add(
        'generate-receipt',
        {
          deliveryId: deliveryData.id,
          deliveryCode: deliveryData.deliveryCode,
          recipientName: deliveryData.recipientName,
          recipientPhone: deliveryData.recipientPhone,
        },
        {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 1000,
          },
        }
      );
      
      console.log(`📄 Receipt generation job added: ${job.id}`);
      return job;
    } catch (error) {
      console.error('❌ Failed to add receipt generation job:', error.message);
      throw error;
    }
  }
  
  // Add both jobs for a delivery
  async processDelivery(deliveryData) {
    try {
      await this.addRouteCalculationJob(deliveryData);
      await this.addReceiptGenerationJob(deliveryData);
      
      console.log(`✅ Jobs queued for delivery ${deliveryData.deliveryCode}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to process delivery jobs:', error.message);
      return false;
    }
  }
  
  // Get queue stats
  async getQueueStats() {
    try {
      const waiting = await this.queue.getWaitingCount();
      const active = await this.queue.getActiveCount();
      const completed = await this.queue.getCompletedCount();
      const failed = await this.queue.getFailedCount();
      
      return {
        waiting,
        active,
        completed,
        failed,
        total: waiting + active + completed + failed,
      };
    } catch (error) {
      console.error('❌ Failed to get queue stats:', error.message);
      return null;
    }
  }

  // Close queue connection
  async close() {
    if (this._queue) {
      await this._queue.close();
      this._queue = null;
    }
  }
}

module.exports = new QueueService();