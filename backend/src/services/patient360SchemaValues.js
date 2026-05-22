const fs = require('fs');

/** Common English coded labels → Khmer */
const EN_PHRASE_KH = {
  'not selected': 'មិនបានជ្រើស',
  'not check': 'មិនបានពិនិត្យ',
  'not checked': 'មិនបានពិនិត្យ',
  'not evaluated': 'មិនវាយតម្លៃ',
  yes: 'បាទ',
  no: 'ទេ',
  female: 'ស្រី',
  male: 'ប្រុស',
  unknown: 'មិនដឹង',
  positive: 'វិជ្ជមាន',
  negative: 'អវិជ្ជមាន',
  none: 'គ្មាន',
  primary: 'បឋមសិក្សា',
  'high school': 'វិទ្យាល័យ',
  university: 'សាកលវិទ្យាល័យ',
  'inside clinic': 'ក្នុងមណ្ឌល',
  'outside clinic': 'ក្រៅមណ្ឌល',
  'self-referral': 'មកដោយខ្លួនឯង',
  'home care and community': 'សេវាថែទាំជាមួយសហគមន៍',
  'home care / community': 'សេវាថែទាំជាមួយសហគមន៍',
  'tb program': 'កម្មវិធីរបេង',
  'blood bank': 'ធនាគារឈាម',
  other: 'ផ្សេងទៀត',
  completed: 'បញ្ចប់',
  'on going': 'កំពុងព្យាបាល',
  'on schedule': 'ទាន់ពេល',
  ongoing: 'កំពុងព្យាបាល',
  cured: 'ជាសះ',
  completed: 'បញ្ចប់',
  failure: 'បរាជ័យ',
  'lost to follow up': 'បោះបង់',
  'lost to follow-up': 'បោះបង់',
  start: 'ចាប់ផ្តើម',
  stop: 'ឈប់',
  continue: 'បន្ត',
  pregnant: 'មានផ្ទៃពោះ',
  'not pregnant': 'មិនមានផ្ទៃពោះ',
  miscarriage: 'រលូត',
  abortion: 'រំលូត',
  morning: 'ព្រឹក',
  afternoon: 'រសៀល',
  'first visit': 'មកដំបូង',
  'early visit': 'មុនពេលណាត់',
  'late visit': 'យឺត',
  early: 'មុនពេល',
  late: 'យឺត',
  working: 'ធ្វើការ',
  ambulatory: 'ដើរបាន',
  'bed bound': 'គ្រាប់',
  'normally plays': 'លេងធម្មតា',
  'occasionally plays': 'លេងពេកណាស់',
  '1st line': 'ជួរទី១',
  '2nd line': 'ជួរទី២',
  '3rd line': 'ជួរទី៣',
  '1st counselling': 'ព្រឹត្តិការលើកទី១',
  '2nd counselling': 'ព្រឹត្តិការលើកទី២',
  '3rd counselling': 'ព្រឹត្តិការលើកទី៣',
  single: 'នៅលីវ',
  married: 'រៀបការ',
  divorced: 'លែង',
  'widow(er)': 'មេម៉ាយ/មេម៉ាយ',
  mother: 'ម្តាយ',
  father: 'ប៉ា',
  sibling: 'បងប្អូន',
  'both parents alive': 'ឪពុកម្តាយរស់ទាំងពីរ',
  'mother deceased': 'ម្តាយស្លាប់',
  'father deceased': 'ប៉ាស្លាប់',
  'both deceased': 'ឪពុកម្តាយស្លាប់ទាំងពីរ',
  'spouse/fiancé': 'ប្តី/ប្រពន្ធ',
  'spouse/fiance': 'ប្តី/ប្រពន្ធ',
  'girl/boyfriend': 'គូស្នេហ',
  'regular partner': 'ដៃគូទៀងទាក់',
  'needle sharing partner': 'ដៃគូប្រើម្ជុលរួម',
  'known hiv status': 'ដឹងស្ថានភាព HIV',
  'reject hiv testing': 'បដិសេធតេស្ត',
  'agree for hiv test': 'យល់ព្រមតេស្ត',
  'exclusive formula': 'ទឹកដោះគោល',
  'exclusive breastfeeding': 'ដោះដោយផ្តាច់',
  'mixed feeding': 'លាយ',
  virological: 'ជីវវិទ្យា',
  immunological: 'ភាពសុះសឹង',
  clinical: 'គ្លីនិក',
  'mild malnutrition': 'ខ្វះអាហាររូបត្ថម្ភស្រាប់',
  'moderate malnutrition': 'ខ្វះអាហាររូបត្ថម្ភមធ្យម',
  'severe malnutrition': 'ខ្វះអាហាររូបត្ថម្ភធ្ងន់',
  ptb: 'របេងសួត',
  'ep-tb': 'របេងក្រៅសួត',
  'bk+': 'BK+',
  'bk-': 'BK-',
  cat1: 'Cat 1',
  cat2: 'Cat 2',
  cat3: 'Cat 3',
  cat4: 'Cat 4',
  '6months': '៦ខែកន្លងមក',
  '6 months': '៦ខែកន្លងមក',
  'past 6 months': '៦ខែកន្លងមក',
  inactive: 'អសកម្ម',
  active: 'សកម្ម',
  new: 'ថ្មី',
  'new but used to': 'ថ្មីប៉ុន្តែធ្លាប់ប្រើ',
  'new but used to': 'ថ្មីប៉ុន្តែធ្លាប់ប្រើ',
  old: 'ចាស់',
  'referred by patient': 'អ្នកជំងឺបញ្ជូន',
  'referred by service provider': 'អ្នកផ្តល់សេវាបញ្ជូន',
  'referred with condition': 'បញ្ជូនតាមលក្ខខណ្ឌ',
  'referred by patient and service provider': 'បញ្ជូនដោយអ្នកជំងឺ និងអ្នកផ្តល់សេវា',
  'referred by patient': 'បញ្ជូនដោយអ្នកជំងឺ',
  'referred by service provider': 'បញ្ជូនដោយអ្នកផ្តល់សេវា',
  'referred with condition': 'បញ្ជូនតាមលក្ខខណ្ឌ',
  'suspend because of ipv': 'ផ្អាកដោយសារអំពើហិង្សាក្នុងគ្រួសារ',
  'hts/vcct': 'HTS/VCCT',
  'hiv self testing': 'តេស្ត HIV ដោយខ្លួនឯង',
  'suspend because of ipv': 'ផ្អាកដោយសារអំពើហិង្សាក្នុងគ្រួសារ',
  'first visit': 'មកដំបូង',
  'early visit': 'មុនពេលណាត់',
  'late visit': 'យឺត',
  'on schedule': 'ទាន់ពេល',
  'not rated': 'មិនវាយតម្លៃ',
  'stopped (side effects/other)': 'ឈប់ (ផលគំហើញ/ផ្សេង)',
  'transferred out': 'ផ្ទេរចេញ',
  'lost to follow-up': 'បោះបង់',
  dead: 'ស្លាប់',
  'lost to follow up': 'បោះបង់',
  'inside clinic': 'ក្នុងមណ្ឌល',
  'outside clinic': 'ក្រៅមណ្ឌល',
  phone: 'ទូរស័ព្ទ',
  visit: 'មកពិនិត្យ',
  'phone &visit': 'ទូរស័ព្ទ និងមកពិនិត្យ',
  'hts/vcct': 'HTS/VCCT',
  'hiv self testing': 'តេស្ត HIV ដោយខ្លួនឯង',
  'known hiv+': 'ដឹង HIV+',
  'rejected test': 'បដិសេធតេស្ត',
  'agreed to test': 'យល់ព្រមតេស្ត',
  'register on treatment': 'បានចុះឈ្មោះព្យាបាល',
  stage1: 'ដំណាក់ ១',
  stage2: 'ដំណាក់ ២',
  stage3: 'ដំណាក់ ៣',
  stage4: 'ដំណាក់ ៤',
  'plan for child visit': 'ផែនការនាំកុមារមកពិនិត្យ',
  'referred by patient': 'បញ្ជូនដោយអ្នកជំងឺ',
  'referred by service provider': 'បញ្ជូនដោយអ្នកផ្តល់សេវា',
  phone: 'ទូរស័ព្ទ',
  visit: 'មកពិនិត្យ',
  'phone &visit': 'ទូរស័ព្ទ និងមកពិនិត្យ',
  agree: 'យល់ព្រម',
  'not agree': 'មិនយល់ព្រម',
  uncheck: 'មិនបានធីក',
  check: 'បានធីក',
  false: 'មិនបានធីក',
  true: 'បានធីក'
};

function normEn(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/\s*\/\s*/g, '/')
    .trim();
}

function parseCodedValuesFromColumn(valuesCol) {
  if (!valuesCol) return null;
  const col = String(valuesCol);

  const boolMatch = col.match(/boolean\s*\(([^)]+)\)/i);
  if (boolMatch) {
    const map = {
      '-1': 'មិនបានជ្រើស',
      0: 'មិនបានធីក',
      1: 'បានធីក',
      false: 'មិនបានធីក',
      true: 'បានធីក',
      False: 'មិនបានធីក',
      True: 'បានធីក'
    };
    boolMatch[1].split(',').forEach((pair) => {
      const m = pair.trim().match(/^([^=]+)\s*=\s*(.+)$/i);
      if (!m) return;
      const k = normEn(m[1]);
      const v = normEn(m[2]);
      if (k.includes('false') || k.includes('uncheck')) map[0] = 'មិនបានធីក';
      if (k.includes('true') || k.includes('check')) map[1] = 'បានធីក';
      if (v) map[k] = EN_PHRASE_KH[v] || map[k];
    });
    return map;
  }

  if (!/-?\d+\s*=/.test(col)) return null;

  const map = {};
  const re = /(-?\d+)\s*=\s*([^,|]+?)(?=,\s*-?\d+\s*=|[|]|$)/gi;
  let m;
  while ((m = re.exec(col)) !== null) {
    map[m[1]] = m[2]
      .trim()
      .replace(/\)+$/g, '')
      .trim();
  }
  return Object.keys(map).length ? map : null;
}

function translateEnMapToKh(enMap, lexicon) {
  const kh = {};
  for (const [code, enLabel] of Object.entries(enMap)) {
    const key = normEn(enLabel);
    kh[code] = lexicon[key] || lexicon[key.replace(/\s*\([^)]*\)/, '')] || enLabel;
  }
  return kh;
}

function buildLexiconFromManual(manualKhMaps, manualEnMaps) {
  const lex = { ...EN_PHRASE_KH };
  for (const field of Object.keys(manualEnMaps || {})) {
    const en = manualEnMaps[field];
    const kh = manualKhMaps[field];
    if (!en || !kh) continue;
    for (const code of Object.keys(en)) {
      const phrase = normEn(en[code]);
      if (phrase && kh[code]) lex[phrase] = kh[code];
    }
  }
  return lex;
}

function mergeValueMaps(base, override) {
  const out = { ...base };
  for (const [field, map] of Object.entries(override || {})) {
    out[field] = { ...(out[field] || {}), ...map };
  }
  return out;
}

/**
 * Parse schema.txt → per-field Khmer value maps (schema + manual overrides).
 */
function loadValueMapsKhFromSchema(schemaPath, manualKhMaps = {}, manualEnMaps = {}) {
  const lexicon = buildLexiconFromManual(manualKhMaps, manualEnMaps);
  const fromSchema = {};

  if (!schemaPath || !fs.existsSync(schemaPath)) {
    return mergeValueMaps(fromSchema, manualKhMaps);
  }

  const lines = fs.readFileSync(schemaPath, 'utf8').split('\n');
  for (const line of lines) {
    if (!line.startsWith('|')) continue;
    if (line.includes('Field Name') || line.includes('---')) continue;

    const parts = line
      .split('|')
      .map((p) => p.trim())
      .filter((p) => p.length > 0);
    if (parts.length < 5) continue;

    const fieldName = parts[0]
      .replace(/\s*\(Primary\)\s*/gi, '')
      .replace(/\s*\(primary\)\s*/gi, '')
      .trim();
    const valuesCol = parts[2];
    const enMap = parseCodedValuesFromColumn(valuesCol);
    if (!fieldName || !enMap) continue;

    fromSchema[fieldName] = translateEnMapToKh(enMap, lexicon);
  }

  return mergeValueMaps(fromSchema, manualKhMaps);
}

module.exports = {
  loadValueMapsKhFromSchema,
  parseCodedValuesFromColumn,
  EN_PHRASE_KH
};
