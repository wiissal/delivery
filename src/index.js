const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const config = require('./config');
const { connectDatabase } = require('./config/database');
const { connectRedis } = require('./config/redis');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'LogistiMa API',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.get('/api', (req, res) => {
  res.json({ 
    message: 'LogistiMa API v1.0',
    endpoints: {
      zones: '/api/zones',
      deliverers: '/api/deliverers',
      packages: '/api/packages',
      deliveries: '/api/deliveries'
    }
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

// Start server
const startServer = async () => {
  try {
    await connectDatabase();
    await connectRedis();
    
    app.listen(config.port, () => {
      console.log(` Server running on port ${config.port}`);
      console.log(` Environment: ${config.nodeEnv}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();