const path = require('path');
const dotenv = require('dotenv');

function loadBackendEnv() {
  const envPath = path.resolve(__dirname, '../../.env');
  dotenv.config({ path: envPath });
}

module.exports = { loadBackendEnv };
