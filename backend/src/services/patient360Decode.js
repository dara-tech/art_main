/**
 * Field labels and coded-value meanings from schema dictionary (schema.txt).
 * Default display locale: Khmer (schema Description KH).
 */
const path = require('path');
const { loadFieldLabelsKhFromSchema } = require('./patient360SchemaKh');
const { loadValueMapsKhFromSchema } = require('./patient360SchemaValues');
const { VALUE_MAPS_KH: VALUE_MAPS_KH_MANUAL } = require('./patient360ValueMapsKh');

const SCHEMA_PATH = path.join(__dirname, '../../schema dictionary/schema.txt');
const FIELD_LABELS_KH = loadFieldLabelsKhFromSchema(SCHEMA_PATH);

/** Patient 360 status tab — schema.txt labels are death-specific; use neutral Khmer here */
const P360_STATUS_FIELD_LABELS_KH = {
  Cause: 'មូលហេតុ',
  Place: 'ទីកន្លែង',
  OPlace: 'ទីកន្លែងផ្សេងទៀត'
};
Object.assign(FIELD_LABELS_KH, P360_STATUS_FIELD_LABELS_KH);

/** tblavpatientstatus / tblcvpatientstatus Place codes */
const PLACE_STATUS_MAP_KH = {
  '-1': 'មិនបានជ្រើស',
  0: 'ផ្ទះ',
  1: 'មន្ទីរពេទ្យ',
  2: 'ផ្សេង'
};

/** Trailing site-type codes in transfer-out Cause (e.g. "Prey Kabas RH") */
const TRANSFER_SITE_SUFFIX_KH = {
  RH: 'មន្ទីរពេទ្យបញ្ជូន',
  PH: 'មន្ទីរពេទ្យខេត្ត',
  CH: 'មន្ទីរពេទ្យកុមារ',
  HC: 'មណ្ឌលសុខភាព',
  MC: 'មណ្ឌលសម្ភាពមាតា និងទារក',
  RHSS: 'មន្ទីរពេទ្យបញ្ជូន'
};

/** Field name aliases (query column → schema dictionary name) */
const FIELD_ALIASES = {
  DaArt: 'DaART',
  DaART: 'DaART',
  ARTnum: 'Artnum',
  Artnum: 'Artnum',
  Orefferred: 'Orefferred',
  Oreferred: 'Orefferred',
  DafirstVisit: 'DafirstVisit',
  DaFirstVisit: 'DafirstVisit',
  TBtreat: 'TBtreat',
  Tbtreat: 'Tbtreat',
  Function: 'Function'
};

const FIELD_LABELS = {
  ClinicID: 'Clinic ID',
  ART: 'ART number',
  ARTnum: 'ART number',
  Artnum: 'ART number',
  DaArt: 'ART start date',
  DaART: 'ART start date',
  DafirstVisit: 'First visit',
  DaFirstVisit: 'First visit',
  DaBirth: 'Date of birth',
  Sex: 'Sex',
  DaVisit: 'Visit date',
  DatVisit: 'Visit date',
  TypeVisit: 'Visit type',
  DaApp: 'Next appointment',
  DaCollect: 'Sample collected',
  DaArrival: 'Lab arrival',
  HIVLoad: 'Viral load',
  CD4: 'CD4',
  CD: 'CD%',
  CD8: 'CD8%',
  TestID: 'Lab test ID',
  DrugName: 'Drug',
  Dose: 'Dose',
  Status: 'Status',
  Da: 'Date',
  DaStatus: 'Status date',
  Cause: 'Cause',
  Place: 'Place',
  OPlace: 'Other place',
  Reason: 'Reason',
  WHO: 'WHO stage',
  TB: 'TB',
  TypeTB: 'TB type',
  TBtreat: 'TB treatment',
  DaTBtreat: 'TB treatment date',
  VLDetectable: 'VL detectable (adherence)',
  ReVL: 'VL test ordered',
  ReCD4: 'CD4 test ordered',
  Eligible: 'Eligible for ART',
  Function: 'Functional status',
  ARVreg: 'ARV regimen line',
  MissARV: 'Missed ARV doses',
  MissTime: 'Missed dose count',
  Miss1: 'Missed doses (1 month)',
  Miss3: 'Missed doses (3 days)',
  PregStatus: 'Pregnancy outcome',
  Womenstatus: 'Pregnant',
  TPT: 'TPT prophylaxis',
  TPTdrug: 'TPT drug',
  DaStartTPT: 'TPT start',
  DaEndTPT: 'TPT end',
  TbPast: 'Past TB',
  Tbtreat: 'TB treatment category',
  Referred: 'Referred from',
  Orefferred: 'Referred from (other)',
  Oreferred: 'Referred from (other)',
  LClinicID: 'Previous clinic ID',
  PclinicID: 'Pediatric clinic ID',
  MClinicID: 'Mother clinic ID',
  MArt: 'Mother ART number',
  VcctID: 'VCCT ID',
  DaHIV: 'HIV diagnosis date',
  TypeofReturn: 'Return type',
  Education: 'Education',
  Allergy: 'Drug allergy',
  DNAPcr: 'DNA PCR',
  Result: 'Test result',
  DaReceive: 'Sample received',
  DaRresult: 'Result date',
  DaBlood: 'Blood draw date',
  AsID: 'PNTT assessment ID',
  Agree: 'Agreed to risk assessment',
  SexHIV: 'Sex with HIV+ partner',
  Dat: 'Record date',
  Daupdate: 'Demographics updated',
  Marital: 'Marital status',
  Occupation: 'Occupation',
  Phone: 'Phone',
  Village: 'Village',
  Commune: 'Commune',
  District: 'District',
  Province: 'Province',
  Codes: 'Linked program code',
  Typecode: 'Link type',
  Faminily: 'Family member',
  HIVstatus: 'HIV status',
  StartARV: 'On ARV',
  Pregnant: 'Pregnancy timing',
  HTB: 'TB history',
  Doctore: 'Doctor code',
  Time: 'Appointment time',
  Att: 'Appointment attendance',
  Quantity: 'Quantity',
  Freq: 'Frequency',
  Form: 'Drug form',
  DaStart: 'Start date',
  DaStop: 'Stop date',
  Note: 'Note',
  FHIV: 'Father HIV',
  MHIV: 'Mother HIV',
  PMTCT: 'PMTCT',
  DaDelivery: 'Delivery date',
  Feeding: 'Infant feeding',
  Treatfail: 'Treatment failure suspected',
  TypeFail: 'Failure type',
  PTB: 'PTB contact',
  Malnutrition: 'Malnutrition',
  WH: 'Weight-for-height',
  TPTout: 'TPT outcome',
  TBout: 'TB outcome',
  ResultHIV: 'HIV confirmatory result',
  CrAGResult: 'CrAG result',
  ARVTreatHis: 'Prior ARV history flag',
  ResultTreat: 'TB treatment result',
  Inh: 'INH prophylaxis history',
  ChildStatus: 'Child family status',
  NumPart: 'Partner number',
  RePatient: 'Relationship to patient',
  StatusHIV: 'Partner HIV status',
  RegTreat: 'Partner on treatment',
  NumChild: 'Child number',
  PlanChild: 'Plan for child visit',
  PatientDate: 'Planned visit date',
  Weight: 'Weight',
  Height: 'Height',
  Temp: 'Temperature',
  Pulse: 'Pulse',
  Blood: 'Blood pressure',
  Vid: 'Visit ID',
  ARTnum: 'ART number',
  site_code: 'Site code',
  HCV: 'HCV',
  HCVlog: 'HCV log',
  HIVAb: 'HIV antibody',
  Phone1: 'Phone (alt)',
  AddCont1: 'Additional contact',
  NameNGO: 'NGO name',
  Occupation: 'Occupation',
  ResultTB: 'TB result',
  Rea: 'Can read',
  Write: 'Can write',
  Cough: 'Cough',
  Fever: 'Fever',
  Wlost: 'Weight loss',
  Drenching: 'Night sweats',
  Hospital: 'Hospitalization',
  ANCservice: 'ANC visit',
  CMTypeClient: 'Contraceptive method type',
  Nationality: 'Nationality',
  Diabete: 'Diabetes',
  Hyper: 'Hypertension',
  Anemia: 'Anemia',
  Renal: 'Renal disease',
  Liver: 'Liver disease',
  Abnormal: 'Abnormal lipids',
  NumPart: 'Partner #',
  NumChild: 'Child #',
  PlanChild: 'Child visit plan',
  Typecode: 'Program code type',
  Codes: 'Linked code',
  Clinic: 'Facility',
  Doctore: 'Doctor',
  TID: 'Test ID',
  Age: 'Age',
  HTB: 'TB history',
  Pregnant: 'Pregnancy timing',
  site_code: 'Site'
};

const VALUE_MAPS = {
  Sex: { '-1': 'Not selected', 0: 'Female', 1: 'Male' },
  TypeVisit: {
    '-1': 'Not selected',
    0: 'First visit',
    1: 'Early visit',
    2: 'On schedule',
    3: 'Late visit'
  },
  Status: {
    '-1': 'Not selected',
    0: 'Lost to follow-up',
    1: 'Dead',
    3: 'Transferred out'
  },
  'Drug Status': {
    '-1': 'Not selected',
    0: 'Start',
    1: 'Stop',
    2: 'Continue'
  },
  Referred: {
    '-1': 'Not selected',
    0: 'Self-referral',
    1: 'Home care / community',
    2: 'VCCT',
    3: 'PMTCT',
    4: 'TB program',
    5: 'Blood bank',
    6: 'Other'
  },
  TPT: { '-1': 'Not selected', 0: 'No', 1: 'Completed', 2: 'Ongoing' },
  TbPast: { '-1': 'Not selected', 0: 'Yes', 1: 'No', 2: 'Unknown' },
  Tbtreat: {
    '-1': 'Not selected',
    0: 'Cat 1',
    1: 'Cat 2',
    2: 'Cat 3',
    3: 'Cat 4',
    4: 'Unknown'
  },
  TypeTB: { '-1': 'Not selected', 0: 'PTB / BK+', 1: 'EP-TB / BK-' },
  TB: { '-1': 'Not selected', 0: 'PTB', 1: 'EPTB' },
  TBtreat_visit: { '-1': 'Not selected', 0: 'Start', 1: 'Stop', 2: 'Ongoing' },
  Eligible: { '-1': 'Not selected', 0: 'Yes', 1: 'No' },
  Function: {
    '-1': 'Not selected',
    0: 'Working',
    1: 'Ambulatory',
    2: 'Bed bound'
  },
  Function_child: {
    '-1': 'Not selected',
    0: 'Normally plays',
    1: 'Occasionally plays',
    2: 'Bed bound'
  },
  ARVreg: { '-1': 'Not selected', 0: '1st line', 1: '2nd line', 2: '3rd line' },
  MissARV: { '-1': 'Not selected', 0: 'No', 1: 'Yes' },
  VLDetectable: {
    '-1': 'Not selected',
    0: 'No',
    1: '1st counselling',
    2: '2nd counselling',
    3: '3rd counselling'
  },
  ReVL: { '-1': 'Not selected', 0: 'Yes', 1: 'No' },
  ReCD4: { '-1': 'Not selected', 0: 'Yes', 1: 'No' },
  Womenstatus: { '-1': 'Not selected', 0: 'Pregnant', 1: 'Not pregnant' },
  PregStatus: { '-1': 'Not selected', 0: 'Miscarriage', 1: 'Abortion' },
  TypeofReturn: { '-1': 'Not selected', 0: 'Inside clinic', 1: 'Outside clinic' },
  Education: {
    '-1': 'Not selected',
    0: 'None',
    1: 'Primary',
    2: 'High school',
    3: 'University'
  },
  Allergy: { '-1': 'Not selected', 0: 'Yes', 1: 'No', 2: 'Unknown' },
  ARVTreatHis: { '-1': 'Not selected', 0: 'Yes', 1: 'No' },
  ResultTreat: {
    '-1': 'Not selected',
    0: 'Ongoing',
    1: 'Cured',
    2: 'Completed',
    3: 'Failure',
    4: 'Lost to follow-up',
    5: 'Not evaluated'
  },
  Result: { '-1': 'Not selected', 0: 'Positive', 1: 'Negative' },
  DNAPcr: { '-1': 'Not selected', 0: 'Positive', 1: 'Negative' },
  FHIV: { '-1': 'Not selected', 0: 'Positive', 1: 'Negative', 2: 'Unknown' },
  MHIV: { '-1': 'Not selected', 0: 'Positive', 1: 'Negative', 2: 'Unknown' },
  Feeding: {
    '-1': 'Not selected',
    0: 'Exclusive formula',
    1: 'Exclusive breastfeeding',
    2: 'Mixed feeding',
    3: 'Unknown'
  },
  Treatfail: { '-1': 'Not selected', 0: 'Yes', 1: 'No' },
  TypeFail: {
    '-1': 'Not selected',
    0: 'Virological',
    1: 'Immunological',
    2: 'Clinical'
  },
  PTB: { '-1': 'Not selected', 0: 'Yes', 1: 'No' },
  Malnutrition: { '-1': 'Not selected', 0: 'No', 1: 'Yes' },
  WH: {
    '-1': 'Not selected',
    0: 'Mild malnutrition',
    1: 'Moderate malnutrition',
    2: 'Severe malnutrition'
  },
  Marital: {
    '-1': 'Not selected',
    0: 'Single',
    1: 'Married',
    2: 'Divorced',
    3: 'Widow(er)'
  },
  HIVstatus: { '-1': 'Not selected', 0: 'Negative', 1: 'Positive', 2: 'Unknown' },
  Faminily: { '-1': 'Not selected', 0: 'Mother', 1: 'Father', 2: 'Sibling' },
  StartARV: { '-1': 'Not selected', 0: 'Yes', 1: 'No', 2: 'Unknown' },
  Agree: { '-1': 'Not selected', 0: 'Yes', 1: 'No' },
  Time: { '-1': 'Not selected', 0: 'Morning', 1: 'Afternoon' },
  Att: { 0: 'First visit', 1: 'Early', 2: 'On schedule', 3: 'Late' },
  StatusHIV: {
    '-1': 'Not selected',
    0: 'Known HIV+',
    1: 'Rejected test',
    2: 'Agreed to test',
    3: 'Other'
  },
  RegTreat: { '-1': 'Not selected', 0: 'Yes', 1: 'No' },
  RePatient: {
    '-1': 'Not selected',
    0: 'Spouse/fiancé',
    1: 'Boy/girlfriend',
    2: 'Regular partner',
    3: 'Needle-sharing partner',
    4: 'Other'
  },
  TPTout: {
    '-1': 'Not selected',
    0: 'Complete',
    1: 'Lost to follow-up',
    2: 'TB',
    3: 'Stopped (side effects/other)'
  },
  TBout: {
    '-1': 'Not selected',
    0: 'Cured',
    1: 'Stopped',
    2: 'Failure',
    3: 'Lost to follow-up',
    4: 'Not rated'
  },
  ResultHIV: { '-1': 'Not selected', 0: 'Positive', 1: 'Negative' },
  CrAGResult: { '-1': 'Not selected', 0: 'Positive', 1: 'Negative' },
  ChildStatus: {
    '-1': 'Not selected',
    0: 'Both parents alive',
    1: 'Mother deceased',
    2: 'Father deceased',
    3: 'Both deceased'
  },
  OffIn: { '-1': 'Not selected', 0: 'No', 1: 'Yes' },
  SexHIV: { '-1': 'Not checked', 0: 'Yes', 1: 'Past 6 months', 2: 'No' },
  _boolean: {
    '-1': 'មិនបានជ្រើស',
    0: 'មិនបានធីក',
    1: 'បានធីក',
    false: 'មិនបានធីក',
    true: 'បានធីក',
    False: 'មិនបានធីក',
    True: 'បានធីក',
    N: 'មិនបានធីក',
    Y: 'បានធីក',
    n: 'មិនបានធីក',
    y: 'បានធីក'
  }
};

const VALUE_MAPS_KH = loadValueMapsKhFromSchema(SCHEMA_PATH, VALUE_MAPS_KH_MANUAL, VALUE_MAPS);

const FIELD_VALUE_KEY = {
  Function: (program) => (program === 'child' ? 'Function_child' : 'Function'),
  TBtreat: (program, ctx) => (ctx === 'visit' ? 'TBtreat_visit' : 'Tbtreat'),
  Status: (program, ctx) => (ctx === 'drug' ? 'Drug Status' : 'Status')
};

function decodeValue(field, value, ctx = {}, locale = 'kh') {
  if (value == null || value === '') return null;

  const resolved = resolveFieldName(field);
  const keyResolver = FIELD_VALUE_KEY[resolved] || FIELD_VALUE_KEY[field];
  const mapKey =
    typeof keyResolver === 'function' ? keyResolver(ctx.program, ctx.section) : resolved;

  const khMap = VALUE_MAPS_KH[mapKey] || VALUE_MAPS_KH[resolved] || VALUE_MAPS_KH[field];
  const enMap = VALUE_MAPS[mapKey] || VALUE_MAPS[resolved] || VALUE_MAPS[field];
  const map = locale === 'en' ? enMap || khMap : khMap || enMap;

  if (map) {
    const k = String(value).trim();
    const hit = map[k] ?? map[Number(value)];
    if (hit != null) return hit;
  }

  const sv = String(value).trim();
  if (/^(true|false|0|1|y|n)$/i.test(sv)) {
    const boolMap = VALUE_MAPS_KH._boolean;
    return boolMap?.[sv] ?? boolMap?.[sv.toLowerCase()] ?? boolMap?.[Number(value)] ?? null;
  }

  if (Number(value) === -1) return 'មិនបានជ្រើស';

  return null;
}

function resolveFieldName(field) {
  return FIELD_ALIASES[field] || field;
}

function getFieldLabel(field, locale = 'kh') {
  const key = resolveFieldName(field);
  if (locale === 'en') return FIELD_LABELS[key] || FIELD_LABELS_KH[key] || field;
  return (
    P360_STATUS_FIELD_LABELS_KH[key] ||
    FIELD_LABELS_KH[key] ||
    FIELD_LABELS[key] ||
    FIELD_LABELS_KH[field] ||
    FIELD_LABELS[field] ||
    field
  );
}

/**
 * Transfer-out Cause often stores destination site (e.g. "-- Prey Kabas RH"), not tblreason Rid.
 */
function decodeTransferDestination(causeStr) {
  let text = String(causeStr).trim().replace(/^\s*--+?\s*/, '').trim();
  if (!text) return null;

  const suffixMatch = text.match(/^(.+?)\s+([A-Za-z]{2,5})$/);
  if (suffixMatch) {
    const name = suffixMatch[1].trim();
    const code = suffixMatch[2].toUpperCase();
    const suffixKh = TRANSFER_SITE_SUFFIX_KH[code];
    if (suffixKh) return `${name} — ${suffixKh}`;
  }
  return text;
}

/**
 * Cause is often "Rid/suffix" (e.g. 1801/SI) — resolve Rid via tblreason.Reason.
 * Status 3 (transferred out) uses Cause for destination site name instead.
 */
function decodeCauseField(causeRaw, reasonByRid = null, status = null) {
  if (causeRaw == null || causeRaw === '') return null;
  const causeStr = String(causeRaw).trim();
  const statusNum = status != null && status !== '' ? Number(status) : NaN;

  if (statusNum === 3 || /^\s*--\s*/.test(causeStr)) {
    return decodeTransferDestination(causeStr);
  }

  if (!reasonByRid || typeof reasonByRid.get !== 'function') return causeStr;

  const normalized = causeStr.replace(/\s*--\s*/g, '/');
  const parts = normalized.split('/').map((s) => s.trim()).filter(Boolean);
  const ridPart = parts[0];
  if (!ridPart || !/^\d+$/.test(ridPart)) return causeStr;

  const reason = reasonByRid.get(ridPart);
  if (!reason) return causeStr;

  const suffix = parts[1];
  if (suffix && !/^\d+$/.test(suffix)) return `${reason} — ${suffix}`;
  return reason;
}

function enrichPatientStatusRow(row, reasonByRid = null) {
  if (!row || typeof row !== 'object') return row;
  const ctx = { section: 'patientStatus' };
  const out = enrichRow(row, ctx);

  if (row.Status != null && row.Status !== '') {
    const statusText = decodeValue('Status', row.Status, ctx);
    if (statusText != null) out.Status_label = statusText;
  }

  if (row.Place != null && row.Place !== '') {
    if (Number(row.Place) === 2) {
      const other = row.OPlace != null ? String(row.OPlace).trim() : '';
      out.Place_label = other || PLACE_STATUS_MAP_KH[2];
    } else {
      const placeText = PLACE_STATUS_MAP_KH[String(row.Place)] ?? PLACE_STATUS_MAP_KH[Number(row.Place)];
      if (placeText != null) out.Place_label = placeText;
      else if (Number(row.Place) === -1) out.Place_label = PLACE_STATUS_MAP_KH['-1'];
    }
  }

  const causeText = decodeCauseField(row.Cause, reasonByRid, row.Status);
  if (causeText != null) out.Cause_label = causeText;

  return out;
}

function getMergedFieldLabels(locale = 'kh') {
  const merged = { ...FIELD_LABELS, ...FIELD_LABELS_KH };
  for (const [alias, target] of Object.entries(FIELD_ALIASES)) {
    if (FIELD_LABELS_KH[target] && !merged[alias]) merged[alias] = FIELD_LABELS_KH[target];
    if (FIELD_LABELS[target] && !merged[alias]) merged[alias] = FIELD_LABELS[target];
  }
  if (locale === 'kh') {
    return Object.fromEntries(
      Object.keys(merged).map((k) => [k, FIELD_LABELS_KH[k] || FIELD_LABELS_KH[FIELD_ALIASES[k]] || FIELD_LABELS[k] || k])
    );
  }
  return merged;
}

function fieldHasValueMap(field) {
  const resolved = resolveFieldName(field);
  if (VALUE_MAPS_KH[resolved] || VALUE_MAPS_KH[field]) return true;
  if (FIELD_VALUE_KEY[resolved] || FIELD_VALUE_KEY[field]) return true;
  if (resolved === 'WHO') return true;
  return false;
}

/** Only decode columns with known coded maps — avoids doubling row size on every field. */
function enrichRow(row, ctx = {}) {
  if (!row || typeof row !== 'object') return row;
  const out = { ...row };
  for (const [key, val] of Object.entries(row)) {
    if (key.endsWith('_label') || key.endsWith('_display')) continue;
    if (val == null || val === '') continue;
    if (!fieldHasValueMap(key)) continue;
    const text = decodeValue(key, val, ctx);
    if (text != null) out[`${key}_label`] = text;
  }
  return out;
}

function enrichRows(rows, ctx = {}) {
  return (rows || []).map((r) => enrichRow(r, ctx));
}

function enrichBlock(block, program, options = {}) {
  if (!block) return block;
  const ctx = { program };
  const reasonByRid = options.reasonByRid || null;
  return {
    ...block,
    registration: block.registration ? enrichRow(block.registration, ctx) : null,
    art: enrichRows(block.art, ctx),
    visits: enrichRows(block.visits, { ...ctx, section: 'visit' }),
    patientStatus: (block.patientStatus || []).map((r) => enrichPatientStatusRow(r, reasonByRid)),
    labTests: enrichRows(block.labTests, ctx),
    eidTests: enrichRows(block.eidTests, ctx),
    arvDrugs: enrichRows(block.arvDrugs, { ...ctx, section: 'drug' }),
    tptDrugs: enrichRows(block.tptDrugs, { ...ctx, section: 'drug' }),
    tbDrugs: enrichRows(block.tbDrugs, { ...ctx, section: 'drug' }),
    oiDrugs: enrichRows(block.oiDrugs, { ...ctx, section: 'drug' }),
    allergies: enrichRows(block.allergies, ctx),
    arvTreatHistory: enrichRows(block.arvTreatHistory, ctx),
    demographics: enrichRows(block.demographics, ctx),
    programLinks: enrichRows(block.programLinks, ctx),
    family: enrichRows(block.family, ctx),
    oiPast: enrichRows(block.oiPast, ctx),
    appointments: enrichRows(block.appointments, ctx),
    pntt: enrichRows(block.pntt, ctx),
    pnttPartners: enrichRows(block.pnttPartners, ctx),
    pnttChildren: enrichRows(block.pnttChildren, ctx)
  };
}

function buildClinicalSummary(sections) {
  const highlights = [];
  const alerts = [];
  const adult = sections.adult;
  const child = sections.child;
  const infant = sections.infant;
  const reg = adult?.registration || child?.registration || infant?.registration;

  if (reg) {
    if (reg.Referred != null && reg.Referred !== -1) {
      highlights.push({
        label: getFieldLabel('Referred'),
        value: reg.Referred_label || decodeValue('Referred', reg.Referred) || reg.Referred
      });
    }
    if (reg.TPT != null || reg.TPTdrug != null) {
      highlights.push({
        label: `${getFieldLabel('TPT')} (ចុះឈ្មោះ)`,
        value: reg.TPT_label || reg.TPTdrug_label || reg.TPT || reg.TPTdrug
      });
    }
    if (reg.DaHIV) highlights.push({ label: getFieldLabel('DaHIV'), value: reg.DaHIV });
    if (reg.LClinicID) highlights.push({ label: getFieldLabel('LClinicID'), value: reg.LClinicID });
    if (reg.PclinicID) highlights.push({ label: getFieldLabel('PclinicID'), value: reg.PclinicID });
    if (reg.MClinicID) highlights.push({ label: getFieldLabel('MClinicID'), value: reg.MClinicID });
  }

  const latestVisit = adult?.visits?.[0] || child?.visits?.[0] || infant?.visits?.[0];
  if (latestVisit) {
    if (latestVisit.WHO != null && latestVisit.WHO !== -1) {
      highlights.push({
        label: `${getFieldLabel('WHO')} ចុងក្រោយ`,
        value: latestVisit.WHO_label || decodeValue('WHO', latestVisit.WHO) || latestVisit.WHO
      });
    }
    if (latestVisit.VLDetectable != null && Number(latestVisit.VLDetectable) > 0) {
      alerts.push({
        level: 'warning',
        text: `${getFieldLabel('VLDetectable')} — ${latestVisit.VLDetectable_label || latestVisit.VLDetectable}`
      });
    }
    if (latestVisit.MissARV === 1 || latestVisit.Miss1 === 1 || latestVisit.Miss3 === 1) {
      alerts.push({
        level: 'warning',
        text: 'របាយថ្ងៃពិនិត្យចុងក្រោយ៖ ភ្លេចលេបថ្នាំ ARV'
      });
    }
    if (latestVisit.DaApp) {
      highlights.push({ label: getFieldLabel('DaApp'), value: latestVisit.DaApp });
    }
  }

  const latestLab = adult?.labTests?.[0] || child?.labTests?.[0];
  if (latestLab?.HIVLoad) {
    highlights.push({ label: `${getFieldLabel('HIVLoad')} ចុងក្រោយ`, value: latestLab.HIVLoad });
  }
  if (latestLab?.CD4) {
    highlights.push({ label: `${getFieldLabel('CD4')} ចុងក្រោយ`, value: latestLab.CD4 });
  }

  const latestStatus = adult?.patientStatus?.[0] || child?.patientStatus?.[0];
  if (latestStatus) {
    alerts.push({
      level: 'critical',
      text: `កំណត់លទ្ធផល៖ ${latestStatus.Status_label || latestStatus.Status} (${latestStatus.Da || latestStatus.DaStatus})`
    });
  }

  const latestEid = infant?.eidTests?.[0];
  if (latestEid) {
    highlights.push({
      label: `${getFieldLabel('Result')} EID ចុងក្រោយ`,
      value: latestEid.Result_label || latestEid.Result
    });
  }

  return { highlights, alerts };
}

function exportDictionary(locale = 'kh', { slim = false } = {}) {
  const base = {
    locale,
    fieldLabels: getMergedFieldLabels(locale),
    valueMaps: VALUE_MAPS_KH,
    valueMapFieldCount: Object.keys(VALUE_MAPS_KH).length
  };
  if (slim) return base;
  return {
    ...base,
    fieldLabelsKh: FIELD_LABELS_KH,
    fieldLabelsEn: FIELD_LABELS
  };
}

module.exports = {
  getFieldLabel,
  getMergedFieldLabels,
  decodeValue,
  decodeCauseField,
  enrichRow,
  enrichRows,
  enrichPatientStatusRow,
  enrichBlock,
  buildClinicalSummary,
  exportDictionary,
  FIELD_LABELS_KH,
  VALUE_MAPS,
  VALUE_MAPS_KH,
  VALUE_MAPS_KH_MANUAL
};
