const { runEtlMulti } = require('./src/services/analyticsEtlService');
async function test() {
  await runEtlMulti({ periodKeys: ['2025-M01', '2025-M02'], triggeredBy: 'manual' });
  console.log('DONE');
  process.exit(0);
}
test();
