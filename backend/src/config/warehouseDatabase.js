const { Sequelize } = require('sequelize');
const { loadBackendEnv } = require('./loadEnv');

loadBackendEnv();

let warehouseSequelize = null;

function getWarehouseSequelize() {
  if (warehouseSequelize) return warehouseSequelize;

  warehouseSequelize = new Sequelize(
    process.env.WAREHOUSE_DB_NAME || process.env.DB_NAME,
    process.env.WAREHOUSE_DB_USER || process.env.DB_USER,
    process.env.WAREHOUSE_DB_PASSWORD || process.env.DB_PASSWORD,
    {
      host: process.env.WAREHOUSE_DB_HOST || process.env.DB_HOST,
      port: Number(process.env.WAREHOUSE_DB_PORT || process.env.DB_PORT || 3306),
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

  return warehouseSequelize;
}

async function resetWarehouseSequelize() {
  if (warehouseSequelize) {
    try {
      await warehouseSequelize.close();
    } catch (err) {
      console.error('Failed to close warehouse connection:', err);
    }
    warehouseSequelize = null;
  }
}

module.exports = { getWarehouseSequelize, resetWarehouseSequelize };
