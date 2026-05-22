const fs = require('fs');
const path = require('path');
const { exportDictionary } = require('./patient360Decode');
const { registerNationalityValueMaps } = require('./patient360Nationality');

const SCHEMA_PATH = path.join(__dirname, '../../schema dictionary/schema.txt');

let cached = null;
let cachedMtime = 0;

function schemaMtime() {
  try {
    return fs.statSync(SCHEMA_PATH).mtimeMs;
  } catch {
    return 0;
  }
}

/** In-memory dictionary — built once per schema file change, not per patient request. */
async function getPatient360Dictionary(locale = 'kh') {
  await registerNationalityValueMaps().catch(() => {});
  const mtime = schemaMtime();
  if (!cached || cachedMtime !== mtime) {
    const dict = exportDictionary(locale);
    cached = {
      locale: dict.locale,
      version: String(Math.floor(mtime)),
      fieldLabels: dict.fieldLabels,
      valueMaps: dict.valueMaps
    };
    cachedMtime = mtime;
  }
  return cached;
}

module.exports = { getPatient360Dictionary, SCHEMA_PATH };
