/**
 * Nationality codes (Nid) → labels from tblnationality (reference table, not site-scoped).
 */
const { getAggregateSequelize } = require('../config/aggregateDatabase');

/** English nationality name → Khmer display */
const NATIONALITY_NAME_KH = {
  cambodian: 'កម្ពុជា',
  khmer: 'ខ្មែរ',
  thai: 'ថៃ',
  vietnamese: 'វៀតណាម',
  laotian: 'ឡាវ',
  lao: 'ឡាវ',
  chinese: 'ចិន',
  burmese: 'Myanmar',
  myanmar: 'Myanmar',
  american: 'អាមេរិក',
  french: 'បារាំង',
  british: 'អង់គ្លេស',
  english: 'អង់គ្លេស',
  korean: 'កូរ៉េ',
  japanese: 'ជប៉ុន',
  indian: 'ឥណ្ឌា',
  indonesian: 'ឥណ្ឌូណេស៊ី',
  malaysian: 'ម៉ាឡេស៊ី',
  filipino: 'ហ្វីលីពីន',
  australian: 'អូស្ត្រាលី',
  russian: 'រុស្ស៊ី'
};

let mapsPromise = null;

function toKhName(englishName) {
  const key = String(englishName || '')
    .toLowerCase()
    .trim();
  return NATIONALITY_NAME_KH[key] || englishName;
}

async function loadNationalityMapsFromDb() {
  const seq = getAggregateSequelize();
  const rows = await seq.query(
    'SELECT Nid, Nationality FROM tblnationality ORDER BY Nid',
    { type: seq.QueryTypes.SELECT }
  );
  const en = { '-1': 'Not selected' };
  const kh = { '-1': 'មិនបានជ្រើស' };
  for (const row of rows) {
    const id = String(row.Nid);
    const name = String(row.Nationality || '').trim();
    if (!name) continue;
    en[id] = name;
    kh[id] = toKhName(name);
  }
  return { en, kh };
}

/**
 * Merge Nid → label maps into patient360Decode (call once at server start).
 */
async function registerNationalityValueMaps() {
  if (!mapsPromise) {
    mapsPromise = loadNationalityMapsFromDb().catch((err) => {
      mapsPromise = null;
      throw err;
    });
  }
  const { en, kh } = await mapsPromise;
  const decode = require('./patient360Decode');
  if (!decode.VALUE_MAPS.Nationality) decode.VALUE_MAPS.Nationality = {};
  if (!decode.VALUE_MAPS_KH.Nationality) decode.VALUE_MAPS_KH.Nationality = {};
  Object.assign(decode.VALUE_MAPS.Nationality, en);
  Object.assign(decode.VALUE_MAPS_KH.Nationality, kh);
  return { count: Object.keys(kh).length };
}

function decodeNationalityLabel(nid, locale = 'kh') {
  if (nid == null || nid === '' || Number(nid) === -1) return null;
  const { VALUE_MAPS_KH, VALUE_MAPS } = require('./patient360Decode');
  const key = String(nid).trim();
  const map = locale === 'en' ? VALUE_MAPS.Nationality : VALUE_MAPS_KH.Nationality;
  return map?.[key] ?? map?.[Number(nid)] ?? null;
}

module.exports = {
  registerNationalityValueMaps,
  decodeNationalityLabel,
  toKhName,
  NATIONALITY_NAME_KH
};
