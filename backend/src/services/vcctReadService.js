/**
 * VCCT (HTS) — read-only lookups from synced vccts* tables. No INSERT/UPDATE/DELETE.
 */
const { getAggregateSequelize } = require('../config/aggregateDatabase');
const { siteDatabaseManager } = require('../config/siteDatabase');
const { decodeValue, getFieldLabel } = require('./patient360Decode');
const { buildVcctFormPages } = require('./vcctFormDisplay');

const LOOKUP_CACHE = new Map();
const LOOKUP_TTL_MS = 60 * 60 * 1000;

const BOOL_KH = { 0: 'ទេ', 1: 'បាទ', '-1': 'មិនបានជ្រើស' };
const SEX_KH = { 0: 'ស្រី', 1: 'ប្រុស', '-1': 'មិនបានជ្រើស' };
const PROGRAM_KH = { adult: 'មនុស្សពេញវ័យ', child: 'កុមារ' };

const EDUCATION_KH = {
  '-1': 'មិនបានជ្រើស',
  0: 'គ្មាន',
  1: 'បឋម',
  2: 'មធ្យម',
  3: 'បរិញ្ញាបត្រ'
};

const MARITAL_KH = {
  '-1': 'មិនបានជ្រើស',
  0: 'នៅលីវ',
  1: 'រៀបការ',
  2: 'ប័ណ្ណអាពាហ៍ពិពារ',
  3: 'មេម៉ាយ/ពោះម៉ាយ'
};

const POST_COUNSELING_KH = {
  '-1': 'មិនបានជ្រើស',
  0: 'ទេ',
  1: 'បាទ'
};

/** Legacy VCCT risk factor labels (risk1–risk18) — tbl VCCT form. */
const VCCT_RISK_LABELS_KH = {
  1: 'ធ្លាប់បញ្ចូលឈាម',
  2: 'អតិថិជន ឬដៃគូធ្វើដំណើរចល័ត',
  3: 'ឪពុកម្តាយផ្ទុកមេរោគអេដស៍',
  4: 'ដៃគូមុនស្លាប់ដោយសារជំងឺអេដស៍',
  5: 'ធ្លាប់រួមភេទតែជាមួយបុរស',
  6: 'ធ្លាប់រួមភេទតែជាមួយស្រី',
  7: 'ធ្លាប់រួមភេទជាមួយបុរសផង និងស្រីផង',
  8: 'ធ្លាប់រួមភេទជាមួយអ្នកប្លែងភេទ',
  9: 'ដៃគូមានដៃគូរួមភេទច្រើន (>2)',
  10: 'រួមភេទមិនប្រើស្រោមអនាម័យ',
  11: 'ដៃគូផ្ទុកមេរោគអេដស៍',
  12: 'ធ្លាប់លក់ ឬទិញផ្លូវភេទ',
  13: 'ធ្លាប់ចាក់គ្រឿងញៀន',
  14: 'ធ្លាប់ប្រើគ្រឿងញៀនរួមគ្នា',
  15: 'ធ្លាប់ប្រើថ្នាំបង្ការក្រោយប្រឈម (PEP)',
  16: 'ធ្លាប់ប្រើថ្នាំបង្ការមុនរួមភេទ (PrEP)',
  17: 'ធ្លាប់មានជំងឺកាមរោគ',
  18: 'ក្រោយរំលោភផ្លូវភេទ'
};

function buildStaticRiskMap() {
  const map = new Map();
  for (const [id, label] of Object.entries(VCCT_RISK_LABELS_KH)) {
    map.set(Number(id), label);
  }
  return map;
}

const VCCT_RISK_MAP = buildStaticRiskMap();

const SKIP_DISPLAY_KEYS = new Set([
  'sorted_at',
  'counselor_code_deprecated',
  'created_by_user_id',
  'updated_by_user_id'
]);

/** Khmer labels for vccts / related columns (all attributes shown in detail). */
const VCCT_FIELD_LABELS_KH = {
  vcct_id: 'លេខ VCCT',
  site_code: 'កូដកន្លែង VCCT',
  vcct_id_duplicated: 'លេខ VCCT ស្ទួន',
  registration_date: 'កាលបរិច្ឆេទចុះឈ្មោះ',
  pmrs_code: 'លេខ PMRS',
  hts_code: 'លេខ HTS',
  sex: 'ភេទ',
  dob: 'ថ្ងៃខែឆ្នាំកំណើត',
  marital_status_id: 'ស្ថានភាពអាពាហ៍ពិពារ',
  occupation_id: 'មុខរបរ',
  occupation_other: 'មុខរបរផ្សេង',
  education_id: 'កម្រិតវប្បធម៌',
  province_id: 'ខេត្ត',
  district_id: 'ស្រុក',
  commune_id: 'ឃុំ',
  village_id: 'ភូមិ',
  country_of_birth_id: 'ប្រទេសកំណើត',
  country_of_birth_other: 'ប្រទេសកំណើតផ្សេង',
  refer_from_id: 'បញ្ជូនមកពី',
  patient_type_id: 'ប្រភេទអតិថិជន',
  history_of_test: 'ប្រវត្តិតេស្ត',
  history_of_test_result: 'លទ្ធផលតេស្តពីមុន',
  history_partner_result1: 'លទ្ធផលដៃគូ ១',
  history_partner_result2: 'លទ្ធផលដៃគូ ២',
  is_agree_test_hiv: 'យល់ព្រមតេស្ត HIV',
  combo_result: 'លទ្ធផល Combo',
  hiv_result: 'លទ្ធផល HIV',
  is_agree_test_rtri: 'យល់ព្រមតេស្ត RTRI',
  rtri_result_id: 'លទ្ធផល RTRI',
  is_first_invalid: 'តេស្តដំបូងមិនត្រឹមត្រូវ',
  is_agree_test_vl: 'យល់ព្រមតេស្ត VL',
  vl_result: 'លទ្ធផល VL',
  rita_result: 'លទ្ធផល RITA',
  post_counseling_id: 'ប្រឹក្សាក្រោយតេស្ត',
  post_counseling_date: 'កាលបរិច្ឆេទប្រឹក្សាក្រោយតេស្ត',
  refer_to_service_id: 'បញ្ជូនទៅសេវា',
  refer_to_other: 'បញ្ជូនទៅសេវាផ្សេង',
  counselor_id: 'លេខអ្នកប្រឹក្សា',
  device_name: 'ឧបករណ៍',
  device_id: 'លេខឧបករណ៍',
  uuic: 'UUIC',
  created_at: 'បង្កើត',
  updated_at: 'ធ្វើបច្ចុប្បន្នភាព',
  line_control: 'បន្ទាត់គុណ',
  line_positive: 'បន្ទាត់វិជ្ជមាន',
  line_longterm: 'បន្ទាត់រយៈពេលវែង',
  cambo_ag: 'Cambo Ag',
  cambo_ab: 'Cambo Ab',
  test_date: 'កាលបរិច្ឆេទតេស្ត',
  result: 'លទ្ធផល',
  age: 'អាយុ',
  status_id: 'ស្ថានភាព'
};

const SECTION_TITLES_KH = {
  art: 'ព័ត៌មាន VCCT ក្នុង ART (ចុះឈ្មោះ)',
  artLinks: 'តភ្ជាប់កម្មវិធី VCCT (tblalink)',
  registration: 'ព័ត៌មាន VCCT (vccts — គ្រប់ចន្លោះ)',
  lineTest: 'លទ្ធផលបន្ទាត់ (vcct_line_test_results)',
  risks: 'ហានិភ័យ (vcct_risks)',
  reasons: 'មូលហេតុមករកសេវា (vcct_reason_to_services)',
  retests: 'តេស្តម្តងទៀត (vcct_retests)'
};

function escapeSqlLiteral(value) {
  return String(value ?? '').replace(/\\/g, '\\\\').replace(/'/g, "''");
}

function normalizeRows(rows) {
  if (!Array.isArray(rows)) return [];
  if (rows.length > 0 && !Array.isArray(rows[0])) return rows;
  return rows.flat();
}

async function selectArt(siteCode, sql) {
  const conn = await siteDatabaseManager.getSiteConnection(siteCode);
  const raw = await conn.query(sql, { type: conn.QueryTypes.SELECT });
  return normalizeRows(raw);
}

async function queryVcct(sql, replacements = {}) {
  const seq = getAggregateSequelize();
  const raw = await seq.query(sql, { replacements, type: seq.QueryTypes.SELECT });
  return normalizeRows(raw);
}

function parseVcctId(raw) {
  const s = String(raw ?? '').trim();
  if (!s || s === '0' || s === '-1') return null;
  const digits = s.replace(/\D/g, '');
  const n = Number(digits || s);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function normalizeVcctSiteCode(raw) {
  const s = String(raw ?? '').trim();
  if (!s) return null;
  return s.length <= 6 ? s : s.slice(0, 6);
}

function formatDate(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

function fieldLabel(key) {
  return VCCT_FIELD_LABELS_KH[key] || key.replace(/_/g, ' ');
}

function isVcctTypecode(typecode) {
  const t = String(typecode ?? '').trim().toLowerCase();
  return t === '2' || t === 'vcct' || t.includes('vcct');
}

function isDateKey(key) {
  return /date|_at$/i.test(key) || key === 'dob';
}

function isBoolKey(key) {
  return key.startsWith('is_') || /^line_/.test(key) || /^cambo_/.test(key);
}

async function getLookupMap(cacheKey, sql, idCol, labelCol) {
  const now = Date.now();
  const hit = LOOKUP_CACHE.get(cacheKey);
  if (hit && hit.expires > now) return hit.map;

  try {
    const rows = await queryVcct(sql);
    const map = new Map();
    for (const r of rows) {
      const id = r[idCol];
      const label = r[labelCol];
      if (id != null && label != null) {
        map.set(Number(id), String(label).trim());
      }
    }
    LOOKUP_CACHE.set(cacheKey, { map, expires: now + LOOKUP_TTL_MS });
    return map;
  } catch {
    const map = new Map();
    LOOKUP_CACHE.set(cacheKey, { map, expires: now + LOOKUP_TTL_MS });
    return map;
  }
}

async function getReasonLookupMap() {
  const cacheKey = 'vcct_reasons_by_id';
  const now = Date.now();
  const hit = LOOKUP_CACHE.get(cacheKey);
  if (hit && hit.expires > now) return hit.map;

  try {
    const rows = await queryVcct('SELECT id, reason FROM vcct_reasons ORDER BY id');
    const map = new Map();
    for (const r of rows) {
      const id = Number(r.id);
      const label = r.reason ? String(r.reason).trim() : '';
      if (Number.isFinite(id) && id > 0 && label) map.set(id, label);
    }
    LOOKUP_CACHE.set(cacheKey, { map, expires: now + LOOKUP_TTL_MS });
    return map;
  } catch {
    const map = new Map();
    LOOKUP_CACHE.set(cacheKey, { map, expires: now + LOOKUP_TTL_MS });
    return map;
  }
}

async function getHivLookupMap() {
  const cacheKey = 'hiv_full';
  const now = Date.now();
  const hit = LOOKUP_CACHE.get(cacheKey);
  if (hit && hit.expires > now) return hit.map;

  try {
    const rows = await queryVcct(
      'SELECT id, status_id, result_kh, result_en FROM vcct_hiv_results'
    );
    const map = new Map();
    for (const r of rows) {
      const label = String(r.result_kh || r.result_en || '').trim();
      if (!label) continue;
      if (r.status_id != null) map.set(Number(r.status_id), label);
      if (r.id != null) map.set(Number(r.id), label);
    }
    LOOKUP_CACHE.set(cacheKey, { map, expires: now + LOOKUP_TTL_MS });
    return map;
  } catch {
    const map = new Map();
    LOOKUP_CACHE.set(cacheKey, { map, expires: now + LOOKUP_TTL_MS });
    return map;
  }
}

async function getVlRitaLookupMaps() {
  const cacheKey = 'vl_rita';
  const now = Date.now();
  const hit = LOOKUP_CACHE.get(cacheKey);
  if (hit && hit.expires > now) return hit.data;

  const vl = new Map();
  const rita = new Map();
  try {
    const rows = await queryVcct(
      'SELECT status_id, result_vl, result_rita FROM vcct_vl_rita_results'
    );
    for (const r of rows) {
      const id = Number(r.status_id);
      if (!Number.isFinite(id)) continue;
      if (r.result_vl) vl.set(id, String(r.result_vl).trim());
      if (r.result_rita) rita.set(id, String(r.result_rita).trim());
    }
  } catch {
    /* optional table */
  }
  const data = { vl, rita };
  LOOKUP_CACHE.set(cacheKey, { data, expires: now + LOOKUP_TTL_MS });
  return data;
}

function mapLookup(map, raw) {
  if (raw == null || raw === '') return null;
  const n = Number(raw);
  if (Number.isFinite(n) && map?.has(n)) return map.get(n);
  return null;
}

function staticLookup(map, raw) {
  if (raw == null || raw === '') return null;
  const n = Number(raw);
  if (Object.prototype.hasOwnProperty.call(map, n)) return map[n];
  if (Object.prototype.hasOwnProperty.call(map, String(raw))) return map[String(raw)];
  return null;
}

function flagIndex(key, prefix) {
  if (!String(key).startsWith(prefix)) return null;
  const n = Number(String(key).slice(prefix.length));
  return Number.isFinite(n) && n > 0 ? n : null;
}

function flagChoiceLabel(key, prefix, ctx) {
  const idx = flagIndex(key, prefix);
  if (!idx) return fieldLabel(key);
  if (prefix === 'rs') return ctx.reasons.get(idx) || fieldLabel(key);
  return ctx.risks.get(idx) || fieldLabel(key);
}

async function getFormOptionLists() {
  const cacheKey = 'vcct_form_options';
  const now = Date.now();
  const hit = LOOKUP_CACHE.get(cacheKey);
  if (hit && hit.expires > now) return hit.lists;

  try {
    const [occupations, referFrom, patientTypes, referTo, reasons] = await Promise.all([
      queryVcct('SELECT id, occupation AS label FROM occupations ORDER BY id'),
      queryVcct('SELECT id, refer_name AS label FROM vcct_refer_froms ORDER BY id'),
      queryVcct('SELECT id, type_kh AS label FROM vcct_patient_types ORDER BY id'),
      queryVcct('SELECT id, service_kh AS label FROM vcct_refer_to_services ORDER BY id'),
      queryVcct('SELECT id, reason AS label FROM vcct_reasons ORDER BY id')
    ]);
    const lists = {
      occupationOptions: occupations.map((r) => ({ id: Number(r.id), label: String(r.label).trim() })),
      referFromOptions: referFrom.map((r) => ({ id: Number(r.id), label: String(r.label).trim() })),
      patientTypeOptions: patientTypes.map((r) => ({ id: Number(r.id), label: String(r.label).trim() })),
      referToOptions: referTo.map((r) => ({ id: Number(r.id), label: String(r.label).trim() })),
      reasonOptions: reasons.map((r) => ({ id: Number(r.id), label: String(r.label).trim() }))
    };
    LOOKUP_CACHE.set(cacheKey, { lists, expires: now + LOOKUP_TTL_MS });
    return lists;
  } catch {
    const lists = {
      occupationOptions: [],
      referFromOptions: [],
      patientTypeOptions: [],
      referToOptions: [],
      reasonOptions: []
    };
    LOOKUP_CACHE.set(cacheKey, { lists, expires: now + LOOKUP_TTL_MS });
    return lists;
  }
}

async function getLookupContext() {
  const [
    hiv,
    referFrom,
    referTo,
    patientType,
    rtri,
    occupation,
    province,
    district,
    commune,
    village,
    nationality,
    reasons,
    vlRita,
    formOptions
  ] = await Promise.all([
    getHivLookupMap(),
    getLookupMap('refer_from', 'SELECT id, refer_name FROM vcct_refer_froms', 'id', 'refer_name'),
    getLookupMap(
      'refer_to',
      'SELECT id, service_kh FROM vcct_refer_to_services',
      'id',
      'service_kh'
    ),
    getLookupMap(
      'patient_type',
      'SELECT id, type_kh FROM vcct_patient_types',
      'id',
      'type_kh'
    ),
    getLookupMap('rtri', 'SELECT id, result FROM vcct_rtri_results', 'id', 'result'),
    getLookupMap('occupation', 'SELECT id, occupation FROM occupations', 'id', 'occupation'),
    getLookupMap('province', 'SELECT id, province_kh FROM tblprovince', 'id', 'province_kh'),
    getLookupMap('district', 'SELECT id, district_kh FROM tbldistrict', 'id', 'district_kh'),
    getLookupMap('commune', 'SELECT id, commune_kh FROM tblcommune', 'id', 'commune_kh'),
    getLookupMap('village', 'SELECT id, village_kh FROM tblvillage', 'id', 'village_kh'),
    getLookupMap('nationality', 'SELECT Nid, Nationality FROM tblnationality', 'Nid', 'Nationality'),
    getReasonLookupMap(),
    getVlRitaLookupMaps(),
    getFormOptionLists()
  ]);
  return {
    hiv,
    referFrom,
    referTo,
    patientType,
    rtri,
    occupation,
    province,
    district,
    commune,
    village,
    nationality,
    reasons,
    risks: VCCT_RISK_MAP,
    vl: vlRita.vl,
    rita: vlRita.rita,
    ...formOptions
  };
}

function formatFieldValue(key, raw, ctx) {
  if (raw == null || raw === '') return null;
  const n = Number(raw);
  if (n === -1 && !String(key).startsWith('risk') && !String(key).startsWith('rs')) return null;

  if (isDateKey(key)) {
    const d = formatDate(raw);
    return d || String(raw);
  }

  if (key === 'sex') return SEX_KH[n] ?? String(raw);
  if (key === 'result' || key === 'hiv_result') return mapLookup(ctx.hiv, raw) || String(raw);
  if (isBoolKey(key)) return BOOL_KH[n] ?? BOOL_KH[String(raw)] ?? String(raw);

  if (key === 'history_of_test') return BOOL_KH[n] ?? String(raw);
  if (/^history_.*result/i.test(key) || key === 'combo_result') {
    return mapLookup(ctx.hiv, raw) || String(raw);
  }

  if (key === 'marital_status_id') return staticLookup(MARITAL_KH, raw) || String(raw);
  if (key === 'education_id') return staticLookup(EDUCATION_KH, raw) || String(raw);
  if (key === 'occupation_id') return mapLookup(ctx.occupation, raw) || String(raw);
  if (key === 'province_id') return mapLookup(ctx.province, raw) || String(raw);
  if (key === 'district_id') return mapLookup(ctx.district, raw) || String(raw);
  if (key === 'commune_id') return mapLookup(ctx.commune, raw) || String(raw);
  if (key === 'village_id') return mapLookup(ctx.village, raw) || String(raw);
  if (key === 'country_of_birth_id') return mapLookup(ctx.nationality, raw) || String(raw);
  if (key === 'post_counseling_id') return staticLookup(POST_COUNSELING_KH, raw) || String(raw);

  if (key === 'refer_from_id') return mapLookup(ctx.referFrom, raw) || String(raw);
  if (key === 'refer_to_service_id') return mapLookup(ctx.referTo, raw) || String(raw);
  if (key === 'patient_type_id') return mapLookup(ctx.patientType, raw) || String(raw);
  if (key === 'rtri_result_id') return mapLookup(ctx.rtri, raw) || String(raw);
  if (key === 'vl_result') return mapLookup(ctx.vl, raw) || String(raw);
  if (key === 'rita_result') return mapLookup(ctx.rita, raw) || String(raw);
  if (key === 'status_id') return mapLookup(ctx.patientType, raw) || mapLookup(ctx.hiv, raw) || String(raw);

  if (/^rs\d+$/.test(key)) {
    if (Number(raw) !== 1) return null;
    return flagChoiceLabel(key, 'rs', ctx);
  }
  if (/^risk\d+$/.test(key)) {
    if (Number(raw) !== 1) return null;
    return flagChoiceLabel(key, 'risk', ctx);
  }

  if (typeof raw === 'object') return JSON.stringify(raw);
  return String(raw).trim();
}

function recordToDisplayRows(record, ctx, { keyPrefix = '' } = {}) {
  if (!record || typeof record !== 'object') return [];
  const rows = [];
  const keys = Object.keys(record).sort();

  for (const key of keys) {
    if (SKIP_DISPLAY_KEYS.has(key)) continue;
    const fullKey = keyPrefix ? `${keyPrefix}${key}` : key;
    const value = formatFieldValue(key, record[key], ctx);
    if (value == null || value === '') continue;
    rows.push({
      key: fullKey,
      label: fieldLabel(key),
      value,
      raw: record[key]
    });
  }
  return rows;
}

function flagColumnsToRows(record, prefix, ctx) {
  if (!record) return [];
  const activeLabels = [];
  for (const [key, val] of Object.entries(record)) {
    if (!key.startsWith(prefix)) continue;
    if (Number(val) !== 1) continue;
    activeLabels.push(flagChoiceLabel(key, prefix, ctx));
  }
  if (!activeLabels.length) return [];
  return [
    {
      key: `${prefix}active`,
      label: prefix === 'risk' ? 'ហានិភ័យដែលជ្រើស' : 'មូលហេតុដែលជ្រើស',
      value: activeLabels.join(' · '),
      raw: activeLabels
    }
  ];
}

function formatRetestRow(row, ctx) {
  return {
    ...row,
    test_date: formatDate(row.test_date),
    sex_label: SEX_KH[Number(row.sex)] ?? row.sex,
    result: mapLookup(ctx.hiv, row.result) || String(row.result ?? ''),
    status_id: mapLookup(ctx.patientType, row.status_id) || mapLookup(ctx.hiv, row.status_id) || String(row.status_id ?? '')
  };
}

async function resolveVcctSiteCode(artSiteCode, artVcctCode) {
  const art = String(artSiteCode || '').trim();
  const fromArt = normalizeVcctSiteCode(artVcctCode);
  if (art) {
    const [row] = await queryVcct(
      `SELECT TRIM(vcct_site_code) AS vcctSite
       FROM tblsites
       WHERE art_site_code = :art
       LIMIT 1`,
      { art }
    );
    const mapped = row?.vcctSite ? String(row.vcctSite).trim() : '';
    if (mapped) return mapped;
  }
  return fromArt;
}

/** All VCCT site_code rows for a client ID (may span facilities). */
async function findVcctSitesById(vcctId) {
  const id = parseVcctId(vcctId);
  if (!id) return [];
  const rows = await queryVcct(
    `SELECT DISTINCT TRIM(site_code) AS site_code
     FROM vccts WHERE vcct_id = :vcctId`,
    { vcctId: id }
  );
  return rows.map((r) => String(r.site_code || '').trim()).filter(Boolean);
}

async function findVcctSitesByIds(vcctIds = []) {
  const ids = [...new Set((vcctIds || []).map(parseVcctId).filter(Boolean))];
  const map = new Map();
  if (!ids.length) return map;

  const CHUNK = 80;
  for (let i = 0; i < ids.length; i += CHUNK) {
    const chunk = ids.slice(i, i + CHUNK);
    const inList = chunk.join(',');
    const rows = await queryVcct(
      `SELECT vcct_id, TRIM(site_code) AS site_code
       FROM vccts WHERE vcct_id IN (${inList})`,
      {}
    );
    for (const r of rows || []) {
      const key = String(r.vcct_id);
      const site = String(r.site_code || '').trim();
      if (!site) continue;
      if (!map.has(key)) map.set(key, []);
      const list = map.get(key);
      if (!list.includes(site)) list.push(site);
    }
  }
  return map;
}

function pickVcctSiteFromCandidates({ defaultVcctSite, fromArtCode, actualSites = [] }) {
  const sites = [...actualSites];
  if (!sites.length) return defaultVcctSite || fromArtCode || null;
  if (sites.length === 1) return sites[0];
  if (fromArtCode && sites.includes(fromArtCode)) return fromArtCode;
  if (defaultVcctSite && sites.includes(defaultVcctSite)) return defaultVcctSite;
  return sites[0];
}

function classifyVcctMapping({ vcctId, defaultVcctSite, fromArtCode, actualSites = [] }) {
  const id = parseVcctId(vcctId);
  if (!id) {
    return {
      vcctSiteCode: null,
      defaultVcctSite: defaultVcctSite || null,
      actualVcctSites: [],
      vcctMappingStatus: 'none',
      vcctMappingInsight: null
    };
  }

  const expected = defaultVcctSite || fromArtCode || null;
  const sites = [...actualSites];
  const resolvedSite = pickVcctSiteFromCandidates({ defaultVcctSite, fromArtCode, actualSites: sites });

  if (!sites.length) {
    return {
      vcctSiteCode: expected,
      defaultVcctSite: defaultVcctSite || null,
      actualVcctSites: [],
      vcctMappingStatus: expected ? 'not_found' : 'unmapped',
      vcctMappingInsight: expected ? 'not_found' : 'unmapped'
    };
  }

  if (expected && sites.includes(expected)) {
    return {
      vcctSiteCode: expected,
      defaultVcctSite: defaultVcctSite || null,
      actualVcctSites: sites,
      vcctMappingStatus: 'ok',
      vcctMappingInsight: sites.length > 1 ? 'multi_site' : null
    };
  }

  if (fromArtCode && sites.includes(fromArtCode)) {
    return {
      vcctSiteCode: fromArtCode,
      defaultVcctSite: defaultVcctSite || null,
      actualVcctSites: sites,
      vcctMappingStatus: 'other_site',
      vcctMappingInsight: defaultVcctSite && defaultVcctSite !== fromArtCode ? 'art_code' : 'other_site'
    };
  }

  return {
    vcctSiteCode: resolvedSite,
    defaultVcctSite: defaultVcctSite || null,
    actualVcctSites: sites,
    vcctMappingStatus: 'other_site',
    vcctMappingInsight: sites.length > 1 ? 'multi_site' : 'other_site'
  };
}

async function resolveVcctSiteForRecord({ artSiteCode, artVcctCode, vcctId, vcctSiteOverride = null }) {
  const id = parseVcctId(vcctId);
  if (!id) {
    return classifyVcctMapping({
      vcctId: null,
      defaultVcctSite: null,
      fromArtCode: null,
      actualSites: []
    });
  }

  const defaultVcctSite =
    normalizeVcctSiteCode(vcctSiteOverride) ||
    (await resolveVcctSiteCode(artSiteCode, artVcctCode));
  const fromArtCode = normalizeVcctSiteCode(artVcctCode);
  const actualSites = await findVcctSitesById(id);
  return classifyVcctMapping({ vcctId: id, defaultVcctSite, fromArtCode, actualSites });
}

/** Batch VCCT site mapping insights for Patient 360 list rows. */
async function enrichListVcctInsights(artSiteCode, rows = []) {
  if (!rows?.length) return rows;

  const defaultVcctSite = await resolveVcctSiteCode(artSiteCode, null);
  const ids = rows.filter((r) => r.program !== 'infant').map((r) => parseVcctId(r.vcctId)).filter(Boolean);
  const siteMap = await findVcctSitesByIds(ids);

  return rows.map((row) => {
    if (row.program === 'infant') return row;
    const id = parseVcctId(row.vcctId);
    if (!id) {
      return {
        ...row,
        vcctSiteCode: null,
        defaultVcctSite: defaultVcctSite || null,
        actualVcctSites: [],
        vcctMappingStatus: 'none',
        vcctMappingInsight: null
      };
    }

    const fromArtCode = normalizeVcctSiteCode(row.vcctCode);
    const actualSites = siteMap.get(String(id)) || [];
    const mapping = classifyVcctMapping({
      vcctId: id,
      defaultVcctSite,
      fromArtCode,
      actualSites
    });

    return { ...row, ...mapping };
  });
}

function clinicIdSql(clinicId) {
  const cid = escapeSqlLiteral(clinicId);
  const n = Number(clinicId);
  return Number.isFinite(n) ? String(n) : `'${cid}'`;
}

async function loadArtVcctRecord(siteCode, clinicId, program) {
  const id = clinicIdSql(clinicId);
  if (program === 'child') {
    const [row] = await selectArt(
      siteCode,
      `SELECT * FROM tblcimain WHERE ClinicID = ${id} LIMIT 1`
    );
    return row || null;
  }
  if (program === 'infant') return null;
  const [row] = await selectArt(
    siteCode,
    `SELECT * FROM tblaimain WHERE ClinicID = ${id} LIMIT 1`
  );
  return row || null;
}

/** VCCT / referral-related ART columns shown first, then remaining registration fields. */
const ART_VCCT_PRIORITY_KEYS = [
  'VcctID',
  'Vcctcode',
  'DaHIV',
  'Referred',
  'Orefferred',
  'PclinicID',
  'OffIn',
  'SiteName',
  'SiteNameold',
  'LClinicID',
  'DafirstVisit',
  'DaFirstVisit',
  'DaART',
  'Artnum',
  'HTS'
];

function artRecordToRows(record, program) {
  if (!record || typeof record !== 'object') return [];
  const ctx = { program };
  const keys = [...ART_VCCT_PRIORITY_KEYS];
  if (program === 'child') keys.push('Feeding');
  Object.keys(record).forEach((k) => {
    if (/vcct/i.test(k) && !keys.includes(k)) keys.push(k);
  });

  const rows = [];
  for (const key of keys) {
    if (!Object.prototype.hasOwnProperty.call(record, key)) continue;
    const raw = record[key];
    if (raw == null || raw === '') continue;
    if (Number(raw) === -1 && key !== 'VcctID') continue;

    let value = decodeValue(key, raw, ctx);
    if (value == null || value === '') {
      value = isDateKey(key) ? formatDate(raw) : String(raw).trim();
    }
    if (!value) continue;

    rows.push({
      key: `art_${key}`,
      label: getFieldLabel(key),
      value,
      raw
    });
  }
  return rows;
}

function buildArtSections(artRecord, programLinks, program) {
  const sections = [];
  const artRows = artRecordToRows(artRecord, program);
  if (artRows.length) {
    sections.push({ id: 'art', title: SECTION_TITLES_KH.art, rows: artRows });
  }
  if (programLinks?.length) {
    sections.push({
      id: 'artLinks',
      title: SECTION_TITLES_KH.artLinks,
      tableRows: programLinks.map((r, i) => ({
        ...r,
        Dacreate: formatDate(r.Dacreate) || r.Dacreate,
        _key: String(i)
      }))
    });
  }
  return sections;
}

function mergeDisplaySections(artSections, vcctSections = []) {
  const displaySections = [...artSections, ...vcctSections];
  const displayRows = displaySections.flatMap((s) =>
    (s.rows || []).map((r) => ({ ...r, section: s.id }))
  );
  return { displaySections, displayRows };
}

async function resolveArtProgramLinks(siteCode, clinicId) {
  const id = clinicIdSql(clinicId);
  const rows = await selectArt(
    siteCode,
    `SELECT Codes, Typecode, Dacreate
     FROM tblalink
     WHERE ClinicID = ${id}
     ORDER BY Dacreate DESC
     LIMIT 20`
  );
  return (rows || []).filter((r) => isVcctTypecode(r.Typecode));
}

async function resolveVcctKeys(siteCode, clinicId, program = 'adult') {
  const registration = await loadArtVcctRecord(siteCode, clinicId, program);
  const links = await resolveArtProgramLinks(siteCode, clinicId);

  let vcctId = null;
  let linkSource = null;
  let linkCode = null;

  if (links.length) {
    vcctId = parseVcctId(links[0].Codes);
    if (vcctId) {
      linkSource = 'tblalink';
      linkCode = String(links[0].Codes || '').trim();
    }
  }

  if (!vcctId && registration) {
    const fromReg = parseVcctId(registration.VcctID);
    if (fromReg) {
      vcctId = fromReg;
      linkSource = 'registration';
      linkCode = String(registration.VcctID || '').trim();
    }
  }

  const artVcctCode = registration?.Vcctcode ? String(registration.Vcctcode).trim() : '';
  const vcctSiteCode = await resolveVcctSiteCode(siteCode, artVcctCode);

  return {
    vcctId,
    vcctSiteCode,
    linkSource,
    artVcctId: linkCode || (registration?.VcctID ? String(registration.VcctID).trim() : null),
    artVcctCode: artVcctCode || null,
    programLinks: links.slice(0, 5).map((r) => ({
      Codes: r.Codes,
      Typecode: r.Typecode,
      Dacreate: r.Dacreate
    }))
  };
}

async function loadVcctBundle(vcctId, vcctSiteCode, options = {}) {
  const site = String(vcctSiteCode || '').trim();
  if (!vcctId || !site) return null;
  const retestLimit = Math.min(200, Math.max(1, Number(options.retestLimit) || 15));

  const ctx = await getLookupContext();

  const [summaryRows, lineRows, riskRows, reasonRows, retests] = await Promise.all([
    queryVcct(
      `SELECT * FROM vccts WHERE vcct_id = :vcctId AND site_code = :site LIMIT 1`,
      { vcctId, site }
    ),
    queryVcct(
      `SELECT * FROM vcct_line_test_results WHERE vcct_id = :vcctId AND site_code = :site LIMIT 1`,
      { vcctId, site }
    ),
    queryVcct(
      `SELECT * FROM vcct_risks WHERE vcct_id = :vcctId AND site_code = :site LIMIT 1`,
      { vcctId, site }
    ),
    queryVcct(
      `SELECT * FROM vcct_reason_to_services WHERE vcct_id = :vcctId AND site_code = :site LIMIT 1`,
      { vcctId, site }
    ),
    queryVcct(
      `SELECT * FROM vcct_retests WHERE vcct_id = :vcctId AND site_code = :site ORDER BY test_date DESC LIMIT ${retestLimit}`,
      { vcctId, site }
    )
  ]);

  const summaryRow = summaryRows[0];
  const lineTest = lineRows[0];
  const risks = riskRows[0];
  const reasons = reasonRows[0];

  if (!summaryRow) return null;

  const summary = { ...summaryRow };
  if (summary.hiv_result != null) {
    summary.hiv_result_label = mapLookup(ctx.hiv, summary.hiv_result) || null;
  }
  if (summary.sex != null) {
    summary.sex_label = SEX_KH[Number(summary.sex)] ?? null;
  }

  const displaySections = [
    {
      id: 'registration',
      title: SECTION_TITLES_KH.registration,
      rows: recordToDisplayRows(summary, ctx)
    }
  ];

  if (lineTest) {
    displaySections.push({
      id: 'lineTest',
      title: SECTION_TITLES_KH.lineTest,
      rows: recordToDisplayRows(lineTest, ctx)
    });
  }

  if (risks) {
    displaySections.push({
      id: 'risks',
      title: SECTION_TITLES_KH.risks,
      rows: flagColumnsToRows(risks, 'risk', ctx)
    });
  }

  if (reasons) {
    displaySections.push({
      id: 'reasons',
      title: SECTION_TITLES_KH.reasons,
      rows: flagColumnsToRows(reasons, 'rs', ctx)
    });
  }

  if (retests?.length) {
    displaySections.push({
      id: 'retests',
      title: SECTION_TITLES_KH.retests,
      tableRows: retests.map((r) => formatRetestRow(r, ctx))
    });
  }

  const formPages = buildVcctFormPages({
    summary,
    lineTest: lineTest || null,
    risks: risks || null,
    reasons: reasons || null,
    retests: retests || [],
    ctx
  });

  return {
    summary,
    lineTest: lineTest || null,
    risks: risks || null,
    reasons: reasons || null,
    retests: retests || [],
    vcctDisplaySections: displaySections,
    formPages
  };
}

async function getSnapshotForPatient(siteCode, clinicId, program = 'adult', options = {}) {
  if (program === 'infant') {
    return {
      readOnly: true,
      linked: false,
      notApplicable: true,
      message: 'VCCT is not used for infant/EID records.'
    };
  }

  const [keys, artRecord] = await Promise.all([
    resolveVcctKeys(siteCode, clinicId, program),
    loadArtVcctRecord(siteCode, clinicId, program)
  ]);

  const artSections = buildArtSections(artRecord, keys.programLinks, program);

  const base = {
    readOnly: true,
    linked: false,
    linkSource: keys.linkSource,
    artVcctId: keys.artVcctId,
    artVcctCode: keys.artVcctCode,
    vcctId: keys.vcctId,
    vcctSiteCode: keys.vcctSiteCode,
    artProgramLinks: keys.programLinks,
    artRecord: artRecord || null
  };

  const withSections = (payload) => {
    const merged = mergeDisplaySections(artSections, payload.vcctDisplaySections || []);
    return {
      ...payload,
      displaySections: merged.displaySections,
      displayRows: merged.displayRows,
      formPages: payload.formPages || []
    };
  };

  if (!keys.vcctId) {
    return withSections({
      ...base,
      message: 'No VCCT client ID linked on this ART record.'
    });
  }

  const mapping = await resolveVcctSiteForRecord({
    artSiteCode: siteCode,
    artVcctCode: keys.artVcctCode,
    vcctId: keys.vcctId,
    vcctSiteOverride: keys.vcctSiteCode
  });

  let vcctSiteCode = mapping.vcctSiteCode || keys.vcctSiteCode;
  let bundle = vcctSiteCode
    ? await loadVcctBundle(keys.vcctId, vcctSiteCode, { retestLimit: options.retestLimit })
    : null;

  const mappingMeta = {
    vcctSiteCode: vcctSiteCode || null,
    defaultVcctSite: mapping.defaultVcctSite || null,
    actualVcctSites: mapping.actualVcctSites || [],
    vcctMappingStatus: mapping.vcctMappingStatus,
    vcctMappingInsight: mapping.vcctMappingInsight
  };

  if (!vcctSiteCode) {
    return withSections({
      ...base,
      ...mappingMeta,
      message: 'VCCT client ID found but VCCT site code could not be resolved (check tblsites.vcct_site_code or Vcctcode on ART record).'
    });
  }

  if (!bundle) {
    return withSections({
      ...base,
      ...mappingMeta,
      linked: false,
      message: `No VCCT record in vccts for ID ${keys.vcctId} at site ${vcctSiteCode}.`
    });
  }

  return withSections({
    ...base,
    ...mappingMeta,
    vcctSiteCode,
    linked: true,
    summary: bundle.summary,
    lineTest: bundle.lineTest,
    risks: bundle.risks,
    reasons: bundle.reasons,
    retests: bundle.retests,
    vcctDisplaySections: bundle.vcctDisplaySections,
    formPages: bundle.formPages
  });
}

async function findArtLinksForVcct(artSiteCode, vcctId) {
  const target = Number(vcctId);
  if (!Number.isFinite(target) || target <= 0) return [];

  const vid = escapeSqlLiteral(String(target));
  const scan = async (table, program) => {
    const rows = await selectArt(
      artSiteCode,
      `SELECT ClinicID, VcctID, Vcctcode, DaART, Artnum
       FROM ${table}
       WHERE TRIM(VcctID) <> '' AND (
         VcctID = '${vid}'
         OR CAST(TRIM(VcctID) AS UNSIGNED) = ${target}
       )
       LIMIT 20`
    );
    return (rows || []).map((r) => ({
        clinicId: String(r.ClinicID),
        program,
        programLabel: PROGRAM_KH[program] || program,
        vcctId: String(r.VcctID).trim(),
        vcctcode: r.Vcctcode ? String(r.Vcctcode).trim() : null,
        artnum: r.Artnum || null,
        daArt: formatDate(r.DaART) || r.DaART
      }));
  };

  const [adult, child] = await Promise.all([scan('tblaimain', 'adult'), scan('tblcimain', 'child')]);
  return [...adult, ...child];
}

async function listVcctPatients(artSiteCode, { page = 1, limit = 25, q = '' } = {}) {
  const pg = Math.max(1, Number(page) || 1);
  const lim = Math.min(100, Math.max(1, Number(limit) || 25));
  const offset = (pg - 1) * lim;
  const vcctSiteCode = await resolveVcctSiteCode(artSiteCode, null);

  if (!vcctSiteCode) {
    return {
      artSiteCode,
      vcctSiteCode: null,
      patients: [],
      pagination: {
        page: pg,
        limit: lim,
        totalCount: 0,
        totalPages: 1,
        hasPrev: false,
        hasNext: false
      },
      readOnly: true
    };
  }

  const search = String(q || '').trim();
  const replacements = { site: vcctSiteCode };
  let where = 'site_code = :site';

  if (search.length >= 1) {
    const digits = search.replace(/\D/g, '');
    const num = Number(digits);
    if (Number.isFinite(num) && num > 0 && String(num) === digits) {
      where +=
        ' AND (vcct_id = :vid OR pmrs_code LIKE :like OR hts_code LIKE :like OR uuic LIKE :like)';
      replacements.vid = num;
      replacements.like = `%${search}%`;
    } else {
      where += ' AND (pmrs_code LIKE :like OR hts_code LIKE :like OR uuic LIKE :like)';
      replacements.like = `%${search}%`;
    }
  }

  const [countRow] = await queryVcct(
    `SELECT COUNT(*) AS total FROM vccts WHERE ${where}`,
    replacements
  );
  const total = Number(countRow?.total || 0);
  const rows = await queryVcct(
    `SELECT vcct_id, site_code, registration_date, sex, dob, hiv_result, pmrs_code, hts_code, uuic
     FROM vccts WHERE ${where}
     ORDER BY registration_date DESC, vcct_id DESC
     LIMIT ${lim} OFFSET ${offset}`,
    replacements
  );

  const ctx = await getLookupContext();
  const patients = rows.map((r) => ({
    vcctId: r.vcct_id,
    siteCode: r.site_code,
    registrationDate: formatDate(r.registration_date),
    sex: r.sex,
    sexLabel: SEX_KH[Number(r.sex)] ?? null,
    dob: formatDate(r.dob),
    hivResult: r.hiv_result,
    hivResultLabel: ctx.hiv.get(Number(r.hiv_result)) || null,
    pmrsCode: r.pmrs_code,
    htsCode: r.hts_code,
    uuic: r.uuic
  }));

  const totalPages = Math.max(1, Math.ceil(total / lim) || 1);
  return {
    artSiteCode,
    vcctSiteCode,
    patients,
    pagination: {
      page: pg,
      limit: lim,
      totalCount: total,
      totalPages,
      hasPrev: pg > 1,
      hasNext: pg < totalPages
    },
    readOnly: true
  };
}

/** Standalone VCCT detail by vcct_id (VCCT page). */
async function getDetailByVcctId(artSiteCode, vcctId, vcctSiteCodeOverride = null) {
  const id = parseVcctId(vcctId);
  if (!id) {
    const err = new Error('Invalid VCCT ID');
    err.statusCode = 400;
    throw err;
  }

  const mapping = await resolveVcctSiteForRecord({
    artSiteCode,
    artVcctCode: null,
    vcctId: id,
    vcctSiteOverride: vcctSiteCodeOverride
  });

  const vcctSiteCode = mapping.vcctSiteCode;

  if (!vcctSiteCode) {
    return {
      readOnly: true,
      linked: false,
      vcctId: id,
      vcctSiteCode: null,
      artSiteCode,
      ...mapping,
      message: 'VCCT site code not configured for this ART facility (tblsites.vcct_site_code).'
    };
  }

  const [bundle, artLinks] = await Promise.all([
    loadVcctBundle(id, vcctSiteCode),
    findArtLinksForVcct(artSiteCode, id)
  ]);

  if (!bundle) {
    return {
      readOnly: true,
      linked: false,
      vcctId: id,
      vcctSiteCode,
      artSiteCode,
      artLinks,
      ...mapping,
      message: `No VCCT record for ID ${id} at site ${vcctSiteCode}.`,
      displaySections: [],
      displayRows: []
    };
  }

  const merged = mergeDisplaySections([], bundle.vcctDisplaySections);
  return {
    readOnly: true,
    linked: true,
    vcctId: id,
    vcctSiteCode,
    artSiteCode,
    artLinks,
    artVcctId: String(id),
    ...mapping,
    summary: bundle.summary,
    lineTest: bundle.lineTest,
    risks: bundle.risks,
    reasons: bundle.reasons,
    retests: bundle.retests,
    displaySections: merged.displaySections,
    displayRows: merged.displayRows,
    formPages: bundle.formPages || []
  };
}

function vcctTimelineDateKey(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

function pushVcctTimelineEvent(events, { date, program, label, detail, where }) {
  const key = vcctTimelineDateKey(date);
  if (!key) return;
  events.push({
    date: key,
    type: 'vcct',
    program,
    label: `VCCT — ${label}`,
    detail: detail || null,
    where: where || null
  });
}

function vcctSiteWhere(snap, rowSite) {
  const site = rowSite || snap?.vcctSiteCode;
  return site ? `@${String(site).trim()}` : null;
}

function formatVcctSummaryResult(summary, ctx) {
  if (!summary) return null;
  const parts = [];
  if (summary.hiv_result_label) parts.push(`HIV: ${summary.hiv_result_label}`);
  else if (summary.hiv_result != null) {
    parts.push(`HIV: ${mapLookup(ctx.hiv, summary.hiv_result) || summary.hiv_result}`);
  }
  if (summary.combo_result != null) {
    parts.push(`Combo: ${mapLookup(ctx.hiv, summary.combo_result) || summary.combo_result}`);
  }
  return parts.length ? parts.join(', ') : null;
}

/** Dated VCCT events for Patient 360 timeline (registration, counseling, line test, retests, ART DaHIV). */
async function buildVcctTimelineEvents(snap, program = 'adult', options = {}) {
  const events = [];
  if (!snap || snap.notApplicable) return events;

  const ctx = await getLookupContext();
  const artWhere =
    options.artSiteCode && String(options.artSiteCode).trim()
      ? `@${String(options.artSiteCode).trim()} (ART)`
      : 'ART';

  if (snap.artRecord?.DaHIV) {
    pushVcctTimelineEvent(events, {
      date: snap.artRecord.DaHIV,
      program,
      label: `${fieldLabel('DaHIV')} (ART)`,
      detail: { vcctId: snap.vcctId, source: 'art' },
      where: artWhere
    });
  }

  const summary = snap.summary;
  const vcctWhere = vcctSiteWhere(snap);

  if (summary?.registration_date) {
    const resultText = formatVcctSummaryResult(summary, ctx);
    pushVcctTimelineEvent(events, {
      date: summary.registration_date,
      program,
      label: resultText ? `ចុះឈ្មោះ (${resultText})` : 'ចុះឈ្មោះ',
      detail: {
        vcctId: snap.vcctId,
        vcctSiteCode: snap.vcctSiteCode,
        ...summary
      },
      where: vcctWhere
    });
  }

  if (summary?.post_counseling_date) {
    pushVcctTimelineEvent(events, {
      date: summary.post_counseling_date,
      program,
      label: fieldLabel('post_counseling_date'),
      detail: summary,
      where: vcctWhere
    });
  }

  if (snap.lineTest) {
    const lineDate = snap.lineTest.created_at || summary?.registration_date;
    pushVcctTimelineEvent(events, {
      date: lineDate,
      program,
      label: SECTION_TITLES_KH.lineTest,
      detail: snap.lineTest,
      where: vcctWhere
    });
  }

  for (const row of snap.retests || []) {
    const formatted = formatRetestRow(row, ctx);
    const resultText = formatted.result || row.result;
    pushVcctTimelineEvent(events, {
      date: row.test_date,
      program,
      label: resultText
        ? `${SECTION_TITLES_KH.retests} (${resultText})`
        : SECTION_TITLES_KH.retests,
      detail: formatted,
      where: vcctSiteWhere(snap, row.site_code || row.site_code_from)
    });
  }

  return events;
}

module.exports = {
  getSnapshotForPatient,
  getDetailByVcctId,
  listVcctPatients,
  enrichListVcctInsights,
  resolveVcctKeys,
  parseVcctId,
  normalizeVcctSiteCode,
  resolveVcctSiteCode,
  classifyVcctMapping,
  buildVcctTimelineEvents
};
