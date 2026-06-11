require('./src/config/loadEnv').loadBackendEnv();
const { getWarehouseSequelize } = require('./src/config/warehouseDatabase');
async function run() {
  const seq = getWarehouseSequelize();
  const [rows] = await seq.query('SELECT DISTINCT indicator FROM analytics_indicator_summary');
  console.log(rows.map(r => r.indicator));
  process.exit(0);
}
run();
