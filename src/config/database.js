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
    console.log(' Database connection established successfully');
    
    // Sync models (force sync in production only once to create tables)
    await sequelize.sync({ alter: true });
    console.log(' Database models synchronized');
    
  } catch (error) {
    console.error(' Unable to connect to the database:', error.message);
    throw error;
  }
};

module.exports = { sequelize, connectDatabase };