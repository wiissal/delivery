const { Sequelize } = require('sequelize');
const config = require('./index');

const sequelize = new Sequelize({
  dialect: 'postgres',
  host: config.database.host,
  port: config.database.port,
  database: config.database.name,
  username: config.database.user,
  password: config.database.password,
  logging: config.nodeEnv === 'development' ? console.log : false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

const connectDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log(' Database connected successfully');
    
    // Sync models in development
    if (config.nodeEnv === 'development') {
      await sequelize.sync({ alter: true });
      console.log(' Database models synchronized');
    }
  } catch (error) {
    console.error(' Database connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDatabase };