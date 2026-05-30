const { OUTCOME_STATUS_OPTIONS } = require('../constants/insightPrograms');

function sqlDate(value) {
  const s = String(value || '').trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const err = new Error('Invalid date format (YYYY-MM-DD required)');
    err.statusCode = 400;
    throw err;
  }
  return `'${s}'`;
}

function ageGroupExpr(birthCol, eventDateCol) {
  return `CASE
    WHEN ${birthCol} IS NULL THEN 'unknown'
    WHEN TIMESTAMPDIFF(YEAR, ${birthCol}, ${eventDateCol}) <= 14 THEN '0_14'
    ELSE '15plus'
  END`;
}

function sexExpr(sexCol) {
  return `IF(${sexCol} = 0, 'Female', 'Male')`;
}

const DIM_NULL = `NULL AS dim_referred, NULL AS dim_education, NULL AS dim_type_visit, NULL AS dim_has_vl, NULL AS dim_outcome_status`;

const VL_TEST_FILTER = `HIVLoad IS NOT NULL AND TRIM(HIVLoad) <> '' AND TRIM(HIVLoad) <> '-1'`;

function outcomeStatusIn(outcomeFilter) {
  const opt = OUTCOME_STATUS_OPTIONS.find((o) => o.id === outcomeFilter) || OUTCOME_STATUS_OPTIONS[0];
  return opt.statusCodes.join(', ');
}

function buildVlTestRows(programType, mainTable, start, end) {
  const s = sqlDate(start);
  const e = sqlDate(end);
  const age = ageGroupExpr('p.DaBirth', 't.event_date');
  const program = programType === 'Child' ? 'Child' : 'Adult';
  return `SELECT '${program}' AS program_type, ${sexExpr('p.Sex')} AS sex_label,
    ${age} AS age_group, p.ClinicID AS clinic_id, t.event_date,
    NULL AS dim_referred, NULL AS dim_education, NULL AS dim_type_visit,
    'yes' AS dim_has_vl, NULL AS dim_outcome_status
    FROM (
      SELECT TRIM(ClinicID) AS cid, COALESCE(Dat, DaCollect) AS event_date
      FROM tblpatienttest
      WHERE COALESCE(Dat, DaCollect) BETWEEN ${s} AND ${e} AND ${VL_TEST_FILTER}
    ) t
    INNER JOIN ${mainTable} p ON CONVERT(p.ClinicID, CHAR) = t.cid`;
}

function buildClinicalVisitRows(programType, visitTable, mainTable, start, end) {
  const s = sqlDate(start);
  const e = sqlDate(end);
  const age = ageGroupExpr('p.DaBirth', 'v.DatVisit');
  const program = programType === 'Child' ? 'Child' : 'Adult';
  return `SELECT '${program}' AS program_type, ${sexExpr('p.Sex')} AS sex_label,
    ${age} AS age_group, p.ClinicID AS clinic_id, v.DatVisit AS event_date,
    NULL AS dim_referred, NULL AS dim_education,
    CAST(IFNULL(v.TypeVisit, -1) AS CHAR) AS dim_type_visit,
    NULL AS dim_has_vl, NULL AS dim_outcome_status
    FROM (
      SELECT ClinicID, DatVisit, TypeVisit FROM ${visitTable} WHERE DatVisit BETWEEN ${s} AND ${e}
    ) v
    INNER JOIN ${mainTable} p ON p.ClinicID = v.ClinicID`;
}

function buildOutcomeRows(programType, mainTable, statusTable, outcomeFilter, start, end) {
  const s = sqlDate(start);
  const e = sqlDate(end);
  const age = ageGroupExpr('p.DaBirth', 's.Da');
  const program = programType === 'Child' ? 'Child' : 'Adult';
  const statusIn = outcomeStatusIn(outcomeFilter);
  return `SELECT '${program}' AS program_type, ${sexExpr('p.Sex')} AS sex_label,
    ${age} AS age_group, p.ClinicID AS clinic_id, s.Da AS event_date,
    NULL AS dim_referred, NULL AS dim_education, NULL AS dim_type_visit, NULL AS dim_has_vl,
    CAST(s.Status AS CHAR) AS dim_outcome_status
    FROM ${mainTable} p
    INNER JOIN ${statusTable} s ON p.ClinicID = s.ClinicID
    WHERE s.Da BETWEEN ${s} AND ${e} AND s.Status IN (${statusIn})`;
}

function buildAdultRows(programId, outcomeFilter, start, end) {
  const s = sqlDate(start);
  const e = sqlDate(end);
  const age = (col) => ageGroupExpr('p.DaBirth', col);

  switch (programId) {
    case 'enrollment':
      return `SELECT 'Adult' AS program_type, ${sexExpr('p.Sex')} AS sex_label,
        ${age('p.DafirstVisit')} AS age_group, p.ClinicID AS clinic_id, p.DafirstVisit AS event_date,
        CAST(IFNULL(p.Referred, -1) AS CHAR) AS dim_referred,
        CAST(IFNULL(p.Education, -1) AS CHAR) AS dim_education,
        NULL AS dim_type_visit, NULL AS dim_has_vl, NULL AS dim_outcome_status
        FROM tblaimain p WHERE p.DafirstVisit BETWEEN ${s} AND ${e}`;
    case 'art':
      return `SELECT 'Adult' AS program_type, ${sexExpr('p.Sex')} AS sex_label,
        ${age('art.DaArt')} AS age_group, p.ClinicID AS clinic_id, art.DaArt AS event_date,
        ${DIM_NULL}
        FROM tblaimain p INNER JOIN tblaart art ON p.ClinicID = art.ClinicID
        WHERE art.DaArt BETWEEN ${s} AND ${e}`;
    case 'visit':
      return buildClinicalVisitRows('Adult', 'tblavmain', 'tblaimain', start, end);
    case 'lab':
      return buildVlTestRows('Adult', 'tblaimain', start, end);
    case 'outcome':
      return buildOutcomeRows('Adult', 'tblaimain', 'tblavpatientstatus', outcomeFilter, start, end);
    default:
      return null;
  }
}

function buildChildRows(programId, outcomeFilter, start, end) {
  const s = sqlDate(start);
  const e = sqlDate(end);
  const age = (col) => ageGroupExpr('p.DaBirth', col);

  switch (programId) {
    case 'enrollment':
      return `SELECT 'Child' AS program_type, ${sexExpr('p.Sex')} AS sex_label,
        ${age('p.DaFirstVisit')} AS age_group, p.ClinicID AS clinic_id, p.DaFirstVisit AS event_date,
        CAST(IFNULL(p.Referred, -1) AS CHAR) AS dim_referred,
        '-1' AS dim_education,
        NULL AS dim_type_visit, NULL AS dim_has_vl, NULL AS dim_outcome_status
        FROM tblcimain p WHERE p.DaFirstVisit BETWEEN ${s} AND ${e}`;
    case 'art':
      return `SELECT 'Child' AS program_type, ${sexExpr('p.Sex')} AS sex_label,
        ${age('art.DaArt')} AS age_group, p.ClinicID AS clinic_id, art.DaArt AS event_date,
        ${DIM_NULL}
        FROM tblcimain p INNER JOIN tblcart art ON p.ClinicID = art.ClinicID
        WHERE art.DaArt BETWEEN ${s} AND ${e}`;
    case 'visit':
      return buildClinicalVisitRows('Child', 'tblcvmain', 'tblcimain', start, end);
    case 'lab':
      return buildVlTestRows('Child', 'tblcimain', start, end);
    case 'outcome':
      return buildOutcomeRows('Child', 'tblcimain', 'tblcvpatientstatus', outcomeFilter, start, end);
    default:
      return null;
  }
}

function buildProgramInner(programId, outcomeFilter, population, period) {
  const { startDate, endDate } = period;
  const parts = [];
  if (population !== 'child') {
    const ad = buildAdultRows(programId, outcomeFilter, startDate, endDate);
    if (ad) parts.push(ad);
  }
  if (population !== 'adult') {
    const ch = buildChildRows(programId, outcomeFilter, startDate, endDate);
    if (ch) parts.push(ch);
  }
  if (!parts.length) {
    const err = new Error('No SQL for this population filter');
    err.statusCode = 400;
    throw err;
  }

  const inner = parts.join(' UNION ALL ');
  if (programId === 'visit' || programId === 'lab') {
    return `SELECT program_type, sex_label, age_group, clinic_id, MAX(event_date) AS event_date,
      MAX(dim_referred) AS dim_referred, MAX(dim_education) AS dim_education,
      MAX(dim_type_visit) AS dim_type_visit, MAX(dim_has_vl) AS dim_has_vl,
      MAX(dim_outcome_status) AS dim_outcome_status
      FROM (${inner}) AS raw
      GROUP BY program_type, sex_label, age_group, clinic_id`;
  }
  return inner;
}

const DIM_SQL = {
  sex: 'sex_label',
  age_group: 'age_group',
  program: 'program_type',
  referred: 'dim_referred',
  education: 'dim_education',
  type_visit: 'dim_type_visit',
  has_vl: 'dim_has_vl',
  outcome_status: 'dim_outcome_status'
};

function buildAggregateSql(inner, groupBy, allowedIds) {
  const dims = (Array.isArray(groupBy) ? groupBy : []).filter((d) => allowedIds.includes(d) && DIM_SQL[d]);
  const selectCols = ['COUNT(DISTINCT clinic_id) AS cnt'];
  const groupCols = [];
  dims.forEach((d) => {
    selectCols.unshift(DIM_SQL[d]);
    groupCols.push(DIM_SQL[d]);
  });
  if (!groupCols.length) {
    return `SELECT COUNT(DISTINCT clinic_id) AS cnt FROM (${inner}) AS events`;
  }
  return `SELECT ${selectCols.join(', ')} FROM (${inner}) AS events GROUP BY ${groupCols.join(', ')} ORDER BY ${groupCols.join(', ')}`;
}

const REFERRED_LABELS = {
  '-1': 'មិនបានជ្រើស',
  '0': 'ខ្លួនឯង',
  '1': 'HC / Community',
  '2': 'VCCT',
  '3': 'PMTCT',
  '4': 'TB',
  '5': 'Blood bank',
  '6': 'ផ្សេងៗ'
};

const EDUCATION_LABELS = {
  '-1': 'មិនបានជ្រើស',
  '0': 'គ្មាន',
  '1': 'បឋម',
  '2': 'មធ្យម',
  '3': 'បរិញ្ញាបត្រ'
};

const OUTCOME_LABELS = {
  '0': 'បោះបង់ (LTFU)',
  '1': 'ស្លាប់',
  '3': 'ផ្ទេរចេញ'
};

function labelForRow(row, groupBy) {
  const parts = [];
  if (groupBy.includes('program') && row.program_type) {
    parts.push(row.program_type === 'Child' ? 'កុមារ' : 'មនុស្សពេញវ័យ');
  }
  if (groupBy.includes('sex') && row.sex_label) {
    parts.push(row.sex_label === 'Female' ? 'ស្រី' : 'ប្រុស');
  }
  if (groupBy.includes('age_group') && row.age_group) {
    parts.push(row.age_group === '0_14' ? '≤១៤' : row.age_group === '15plus' ? '១៥+' : row.age_group);
  }
  if (groupBy.includes('referred') && row.dim_referred != null) {
    parts.push(REFERRED_LABELS[String(row.dim_referred)] || `Referred ${row.dim_referred}`);
  }
  if (groupBy.includes('education') && row.dim_education != null) {
    parts.push(EDUCATION_LABELS[String(row.dim_education)] || `Education ${row.dim_education}`);
  }
  if (groupBy.includes('type_visit') && row.dim_type_visit != null) {
    parts.push(`Visit type ${row.dim_type_visit}`);
  }
  if (groupBy.includes('has_vl') && row.dim_has_vl) {
    parts.push(row.dim_has_vl === 'yes' ? 'មាន VL' : 'គ្មាន VL');
  }
  if (groupBy.includes('outcome_status') && row.dim_outcome_status != null) {
    parts.push(OUTCOME_LABELS[String(row.dim_outcome_status)] || `Status ${row.dim_outcome_status}`);
  }
  return parts.length ? parts.join(' · ') : 'សរុប';
}

module.exports = {
  buildProgramInner,
  buildAggregateSql,
  labelForRow,
  DIM_SQL
};
