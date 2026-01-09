const { Worker } = require('bullmq');
const config = require('./config');
const { connectDatabase } = require('./config/database');
const { Delivery, Package } = require('./models');

const connection = {
  host: config.redis.host,
  port: config.redis.port,
};

// Worker to process delivery jobs
const worker = new Worker(
  'deliveries',
  async (job) => {
    console.log(`\n Processing job ${job.id} of type: ${job.name}`);
    
    switch (job.name) {
      case 'calculate-route':
        await calculateRoute(job.data);
        break;
      case 'generate-receipt':
        await generateReceipt(job.data);
        break;
      default:
        console.warn(`  Unknown job type: ${job.name}`);
    }
  },
  { 
    connection,
    concurrency: 5, // Process 5 jobs simultaneously
  }
);

//Job Handler: Calculate optimal route (2 seconds as per brief)
async function calculateRoute(data) {
  console.log(`  Calculating route for delivery ${data.deliveryCode}...`);
  console.log(`   Delivery ID: ${data.deliveryId}`);
  console.log(`   From: ${data.pickupAddress}`);
  console.log(`   To: ${data.deliveryAddress}`);
  
  // Simulate complex calculation (2 seconds as specified in brief)
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const distance = Math.floor(Math.random() * 20) + 5; // Random 5-25 km
  const duration = Math.floor(distance * 3); // ~3 min per km
  
  console.log(` Route calculated successfully!`);
  console.log(`   Distance: ${distance} km`);
  console.log(`   Estimated time: ${duration} minutes`);
  
  // Could update delivery record with route info here
  try {
    await Delivery.update(
      { 
        notes: `Route: ${distance}km, Est. time: ${duration}min` 
      },
      { where: { id: data.deliveryId } }
    );
  } catch (error) {
    console.error('Failed to update delivery with route info:', error.message);
  }
}

// Job Handler: Generate receipt and notify
async function generateReceipt(data) {
  console.log(` Generating receipt for delivery ${data.deliveryCode}...`);
  console.log(`   Delivery ID: ${data.deliveryId}`);
  console.log(`   Recipient: ${data.recipientName}`);
  
  // Simulate receipt generation
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const receiptNumber = `REC-${Date.now()}`;
  
  console.log(` Receipt generated successfully!`);
  console.log(`   Receipt #: ${receiptNumber}`);
  console.log(`    Notification sent to: ${data.recipientPhone}`);
  console.log(`   SMS: "Your package is on the way! Tracking: ${data.deliveryCode}"`);
}

// Worker event handlers
worker.on('completed', (job) => {
  console.log(` Job ${job.id} completed successfully\n`);
});

worker.on('failed', (job, err) => {
  console.error(` Job ${job?.id} failed:`, err.message, '\n');
});

worker.on('error', (err) => {
  console.error(' Worker error:', err);
});

// Start worker
const startWorker = async () => {
  try {
    await connectDatabase();
    
   
    console.log(' Worker started successfully!');
    console.log(` Redis: ${config.redis.host}:${config.redis.port}`);
    console.log(` Queue: deliveries`);
    console.log(` Concurrency: 5`);
    console.log('Listening for jobs...\n');
  } catch (error) {
    console.error('Failed to start worker:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('\n SIGTERM received, shutting down worker gracefully...');
  await worker.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('\n  SIGINT received, shutting down worker gracefully...');
  await worker.close();
  process.exit(0);
});

// Start the worker
startWorker();

module.exports = worker;