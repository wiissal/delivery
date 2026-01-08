const { Worker, Queue } = require('bullmq');
const config = require('./config');
const { connectDatabase } = require('./config/database');
const connection = {
  host: config.redis.host,
  port: config.redis.port,
};

// Initialize the queue
const deliveryQueue = new Queue('deliveries', { connection });
// Worker to process delivery jobs
const worker = new Worker(
  'deliveries',
  async (job) => {
    console.log(`Processing job ${job.id} of type ${job.name}`);
    
    switch (job.name) {
      case 'calculate-route':
        await calculateRoute(job.data);
        break;
      case 'generate-receipt':
        await generateReceipt(job.data);
        break;
      default:
        console.warn(`Unknown job type: ${job.name}`);
    }
  },
  { connection }
);

// Job handler calculation
async function calculateRoute(data) {
  console.log(`Calculating route for delivery ${data.deliveryId}...`);
  
  // Simulate complex calculation 
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  console.log(` Route calculated for delivery ${data.deliveryId}`);
  console.log(`   From: ${data.pickupAddress}`);
  console.log(`   To: ${data.deliveryAddress}`);
}

// Job handler
async function generateReceipt(data) {
  console.log(` Generating receipt for delivery ${data.deliveryId}...`);
  
  // Simulate receipt generation
  await new Promise(resolve => setTimeout(resolve, 500));
  
  console.log(` Receipt generated for delivery ${data.deliveryId}`);
  console.log(`   Receipt #: REC-${Date.now()}`);
  console.log(`    Notification sent to customer`);
}

// Worker event handlers
worker.on('completed', (job) => {
  console.log(` Job ${job.id} completed successfully`);
});

worker.on('failed', (job, err) => {
  console.error(` Job ${job?.id} failed:`, err.message);
});

// Start worker
const startWorker = async () => {
  try {
    await connectDatabase();
    console.log(' Worker started and listening for jobs...');
    console.log(` Redis: ${config.redis.host}:${config.redis.port}`);
  } catch (error) {
    console.error('Failed to start worker:', error);
    process.exit(1);
  }
};

startWorker();

module.exports = { deliveryQueue };