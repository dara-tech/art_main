const { Sequelize } = require('sequelize');
const { loadBackendEnv } = require('./loadEnv');

loadBackendEnv();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    dialect: 'mysql',
    logging: false,
    dialectOptions: {
      connectTimeout: 15000
    }
  }
);

async function testConnection() {
  await sequelize.authenticate();
}

module.exports = { sequelize, testConnection };
