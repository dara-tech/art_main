const { Sequelize } = require('sequelize');
const { loadBackendEnv } = require('./loadEnv');

loadBackendEnv();

let aggregateSequelize = null;

function getAggregateSequelize() {
  if (aggregateSequelize) return aggregateSequelize;

  aggregateSequelize = new Sequelize(
    process.env.AGGREGATE_DB_NAME || process.env.DB_NAME,
    process.env.AGGREGATE_DB_USER || process.env.DB_USER,
    process.env.AGGREGATE_DB_PASSWORD || process.env.DB_PASSWORD,
    {
      host: process.env.AGGREGATE_DB_HOST || process.env.DB_HOST,
      port: Number(process.env.AGGREGATE_DB_PORT || process.env.DB_PORT || 3306),
      dialect: 'mysql',
      logging: false,
      pool: {
        max: Number(process.env.DB_POOL_MAX || 3),
        min: 0,
        idle: 10000,
        acquire: 30000
      },
      dialectOptions: {
        connectTimeout: 15000,
        multipleStatements: true
      }
    }
  );

  return aggregateSequelize;
}

async function resetAggregateSequelize() {
  if (aggregateSequelize) {
    try {
      await aggregateSequelize.close();
    } catch (err) {
      console.error('Failed to close aggregate connection:', err);
    }
    aggregateSequelize = null;
  }
}

module.exports = { getAggregateSequelize, resetAggregateSequelize };
