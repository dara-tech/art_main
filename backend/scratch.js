const patient360Service = require('./src/services/patient360Service');
require('dotenv').config();

async function main() {
  const res = await patient360Service.getPatient360('0101', '3647', { program: 'adult', tab: 'summary' });
  console.log("Adult registration:", res.sections?.adult?.registration);
  process.exit(0);
}
main().catch(console.error);
