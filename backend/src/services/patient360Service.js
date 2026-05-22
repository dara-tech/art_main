/**
 * Patient 360° — read-only clinical profile (SELECT queries only; no INSERT/UPDATE/DELETE).
 */
const { siteDatabaseManager } = require('../config/siteDatabase');
const {
  enrichBlock,
  buildClinicalSummary,
  decodeValue,
  getFieldLabel
} = require('./patient360Decode');
const { decodeNationalityLabel } = require('./patient360Nationality');

const reasonMapCache = new Map();

async function getReasonMapForSite(siteCode) {
  if (!reasonMapCache.has(siteCode)) {
    const rows = await selectSite(siteCode, 'SELECT Rid, Reason FROM tblreason');
    const m = new Map();
    for (const r of rows) {
      if (r.Rid != null) m.set(String(r.Rid), String(r.Reason || '').trim());
    }
    reasonMapCache.set(siteCode, m);
  }
  return reasonMapCache.get(siteCode);
}

const PROGRAM_TYPE_KH = {
  adult: 'មនុស្សពេញវ័យ ART',
  child: 'កុមារ ART',
  infant: 'ទារក / EID',
  pntt: 'PNTT'
};

const LIMITS = {
  visits: Number(process.env.P360_VISIT_LIMIT || 40),
  labTests: Number(process.env.P360_TEST_LIMIT || 30),
  drugs: Number(process.env.P360_DRUG_LIMIT || 50),
  status: Number(process.env.P360_STATUS_LIMIT || 20),
  pntt: Number(process.env.P360_PNTT_LIMIT || 30),
  appointments: Number(process.env.P360_APPT_LIMIT || 30)
};

/** Rows loaded on first paint (summary) — keeps DB + JSON small */
const PEEK_LIMIT = Number(process.env.P360_PEEK_LIMIT || 5);
/** Timeline tab: smaller drug slices (avoids 3 heavy visit JOINs at full drug limit). */
const TIMELINE_DRUG_LIMIT = Number(process.env.P360_TIMELINE_DRUG_LIMIT || 25);

/** Which DB slices each UI tab needs */
const TAB_PARTS = {
  summary: ['registration', 'art', 'visits', 'labTests', 'patientStatus', 'pntt'],
  overview: ['registration', 'art', 'visits', 'labTests', 'patientStatus', 'pntt'],
  visits: ['visits'],
  labs: ['labTests', 'eidTests'],
  drugs: ['arvDrugs', 'tptDrugs', 'tbDrugs', 'oiDrugs'],
  history: ['allergies', 'arvTreatHistory', 'oiPast', 'family'],
  care: ['demographics', 'programLinks', 'appointments'],
  carePntt: ['pnttPartners', 'pnttChildren'],
  status: ['patientStatus'],
  timeline: ['registration', 'art', 'visits', 'patientStatus', 'labTests', 'arvDrugs', 'tptDrugs', 'tbDrugs', 'pntt']
};

function parseParts(parts) {
  if (!parts || parts === 'all' || parts === 'full') return null;
  const list = Array.isArray(parts) ? parts : String(parts).split(',');
  return new Set(list.map((p) => p.trim()).filter(Boolean));
}

function wantsPart(partSet, name) {
  return !partSet || partSet.has(name);
}

/** TAB_PARTS slice name → keys on in-memory program blocks */
const PART_BLOCK_KEYS = {
  registration: ['registration'],
  art: ['art'],
  visits: ['visits'],
  labTests: ['labTests'],
  eidTests: ['eidTests'],
  patientStatus: ['patientStatus'],
  arvDrugs: ['arvDrugs'],
  tptDrugs: ['tptDrugs'],
  tbDrugs: ['tbDrugs'],
  oiDrugs: ['oiDrugs'],
  allergies: ['allergies'],
  arvTreatHistory: ['arvTreatHistory'],
  oiPast: ['oiPast'],
  family: ['family'],
  demographics: ['demographics'],
  programLinks: ['programLinks'],
  appointments: ['appointments'],
  pntt: ['pntt'],
  pnttPartners: ['pnttPartners'],
  pnttChildren: ['pnttChildren']
};

/** Partial tab loads must not send empty [] for slices that were not fetched (frontend merge). */
function sliceBlockForParts(block, parts) {
  if (!block) return block;
  if (!parts || parts === 'all' || parts === 'full') return block;
  const list = Array.isArray(parts) ? parts : String(parts).split(',');
  const keys = new Set();
  for (const p of list.map((x) => x.trim()).filter(Boolean)) {
    const mapped = PART_BLOCK_KEYS[p];
    if (mapped) mapped.forEach((k) => keys.add(k));
    else keys.add(p);
  }
  const out = {};
  keys.forEach((k) => {
    if (Object.prototype.hasOwnProperty.call(block, k)) out[k] = block[k];
  });
  return out;
}

function lim(n, cap = 100) {
  return Math.max(1, Math.min(cap, n));
}

function normalizeRows(rows) {
  if (!Array.isArray(rows)) return [];
  if (rows.length > 0 && !Array.isArray(rows[0])) return rows;
  return rows[0] || [];
}

function escapeSqlLiteral(value) {
  return String(value ?? '').replace(/'/g, "''");
}

function validateSiteCode(siteCode) {
  const code = String(siteCode || '').trim();
  if (!/^\d{4}$/.test(code)) {
    const err = new Error('siteCode must be a 4-digit facility code');
    err.statusCode = 400;
    throw err;
  }
  return code;
}

function validateClinicId(clinicId) {
  const id = String(clinicId || '').trim();
  if (!id || !/^[A-Za-z0-9]{1,12}$/.test(id)) {
    const err = new Error('clinicId must be 1–12 alphanumeric characters');
    err.statusCode = 400;
    throw err;
  }
  return id;
}

async function selectSite(siteCode, sql) {
  const conn = await siteDatabaseManager.getSiteConnection(siteCode);
  const raw = await conn.query(sql, { type: conn.QueryTypes.SELECT });
  return normalizeRows(raw);
}

function formatSex(value) {
  return decodeValue('Sex', value) || (value != null && value !== '' ? String(value) : null);
}

function toDateKey(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

function pushTimeline(events, { date, type, program, label, detail }) {
  const key = toDateKey(date);
  if (!key) return;
  events.push({ date: key, type, program, label, detail: detail || null });
}

function buildTimeline(sections) {
  const events = [];

  const addProgram = (program, block) => {
    if (!block) return;
    const reg = block.registration;
    if (reg) {
      const first =
        reg.DafirstVisit || reg.DaFirstVisit || reg.Dafirstvisit || reg.first_visit_date;
      pushTimeline(events, {
        date: first,
        type: 'registration',
        program,
        label: `${getFieldLabel('DafirstVisit')} (ចុះឈ្មោះ)`,
        detail: reg
      });
      if (reg.DaART || reg.DaArt) {
        pushTimeline(events, {
          date: reg.DaART || reg.DaArt,
          type: 'art_intent',
          program,
          label: `${getFieldLabel('DaART')} ក្នុងចុះឈ្មោះ`,
          detail: { artnum: reg.Artnum || reg.ARTnum }
        });
      }
    }
    (block.art || []).forEach((row) => {
      pushTimeline(events, {
        date: row.DaArt || row.DaART,
        type: 'art_start',
        program,
        label: `${getFieldLabel('DaArt')} (${row.ART || row.art || ''})`,
        detail: row
      });
    });
    (block.visits || []).forEach((row) => {
      pushTimeline(events, {
        date: row.DatVisit || row.DaVisit || row.Daupdate,
        type: 'visit',
        program,
        label: `${getFieldLabel('TypeVisit')} (${row.TypeVisit_label || row.TypeVisit || '-'})`,
        detail: row
      });
    });
    (block.patientStatus || []).forEach((row) => {
      pushTimeline(events, {
        date: row.Da || row.DaStatus,
        type: 'status',
        program,
        label: `${getFieldLabel('Status')} (${row.Status_label || row.Status})`,
        detail: row
      });
    });
    (block.labTests || []).forEach((row) => {
      pushTimeline(events, {
        date: row.DaCollect || row.Dat || row.DaArrival,
        type: 'lab',
        program,
        label: `ពិសោធន៍ — ${getFieldLabel('HIVLoad')}: ${row.HIVLoad || '-'}, ${getFieldLabel('CD4')}: ${row.CD4 || '-'}`,
        detail: row
      });
    });
    (block.arvDrugs || []).forEach((row) => {
      const statusText = row.Status_label || decodeValue('Status', row.Status, { section: 'drug' });
      pushTimeline(events, {
        date: row.Da,
        type: 'drug_arv',
        program,
        label: `ARV — ${row.DrugName} (${statusText || row.Status})`,
        detail: row
      });
    });
    (block.tptDrugs || []).forEach((row) => {
      const statusText = row.Status_label || decodeValue('Status', row.Status, { section: 'drug' });
      pushTimeline(events, {
        date: row.Da,
        type: 'drug_tpt',
        program,
        label: `TPT — ${row.DrugName} (${statusText || row.Status})`,
        detail: row
      });
    });
    (block.pntt || []).forEach((row) => {
      pushTimeline(events, {
        date: row.DaVisit,
        type: 'pntt',
        program,
        label: 'ពិនិត្យ PNTT',
        detail: row
      });
    });
    (block.tbDrugs || []).forEach((row) => {
      pushTimeline(events, {
        date: row.Da,
        type: 'drug_tb',
        program,
        label: `ថ្នាំរបេង — ${row.DrugName}`,
        detail: row
      });
    });
    (block.eidTests || []).forEach((row) => {
      pushTimeline(events, {
        date: row.DaReceive || row.DaRresult || row.DaBlood,
        type: 'eid',
        program,
        label: `តេស្ត EID — ${getFieldLabel('Result')}: ${row.Result_label || row.Result || '-'}`,
        detail: row
      });
    });
  };

  Object.entries(sections).forEach(([program, block]) => addProgram(program, block));

  return events.sort((a, b) => String(b.date).localeCompare(String(a.date)));
}

function sectionCounts(block) {
  if (!block) return {};
  return {
    visits: (block.visits || []).length,
    labTests: (block.labTests || []).length,
    arvDrugs: (block.arvDrugs || []).length,
    tptDrugs: (block.tptDrugs || []).length,
    tbDrugs: (block.tbDrugs || []).length,
    patientStatus: (block.patientStatus || []).length,
    art: (block.art || []).length,
    pntt: (block.pntt || []).length,
    eidTests: (block.eidTests || []).length,
    allergies: (block.allergies || []).length,
    arvTreatHistory: (block.arvTreatHistory || []).length,
    demographics: (block.demographics || []).length,
    programLinks: (block.programLinks || []).length,
    oiDrugs: (block.oiDrugs || []).length,
    appointments: (block.appointments || []).length,
    family: (block.family || []).length,
    oiPast: (block.oiPast || []).length,
    pnttPartners: (block.pnttPartners || []).length,
    pnttChildren: (block.pnttChildren || []).length
  };
}

/** Program detection — one simple query per table (UNION breaks under site-scope rewrite). */
async function detectPrograms(siteCode, clinicId) {
  const cid = escapeSqlLiteral(clinicId);
  const cidNum = Number(clinicId);
  const numeric =
    (Number.isFinite(cidNum) && String(cidNum) === clinicId.replace(/^0+/, '')) ||
    /^\d+$/.test(clinicId);

  const checks = [];
  if (numeric) {
    checks.push(
      selectSite(
        siteCode,
        `SELECT 'adult' AS program FROM tblaimain WHERE ClinicID = ${cidNum} LIMIT 1`
      )
    );
    checks.push(
      selectSite(
        siteCode,
        `SELECT 'pntt' AS program FROM tblapntt WHERE ClinicID = ${cidNum} LIMIT 1`
      )
    );
  }
  checks.push(
    selectSite(
      siteCode,
      `SELECT 'child' AS program FROM tblcimain WHERE ClinicID = '${cid}' LIMIT 1`
    ),
    selectSite(
      siteCode,
      `SELECT 'infant' AS program FROM tbleimain WHERE ClinicID = '${cid}' LIMIT 1`
    )
  );

  const results = await Promise.all(checks);
  const programs = [...new Set(results.flat().map((r) => r.program).filter(Boolean))];
  const order = ['adult', 'child', 'infant', 'pntt'];
  return order.filter((p) => programs.includes(p));
}

function parseKnownPrograms(raw) {
  if (!raw) return null;
  const list = String(raw)
    .split(',')
    .map((p) => p.trim().toLowerCase())
    .filter((p) => ['adult', 'child', 'infant', 'pntt'].includes(p));
  return list.length ? [...new Set(list)] : null;
}

/** Tab badges only — 3 COUNTs instead of 8 full-table scans on summary load. */
async function countAdultTabBadges(siteCode, clinicId) {
  const cid = Number(clinicId);
  const cidStr = escapeSqlLiteral(clinicId);
  const [row] = await selectSite(
    siteCode,
    `SELECT
      (SELECT COUNT(*) FROM tblavmain WHERE ClinicID = ${cid}) AS visits,
      (SELECT COUNT(*) FROM tblpatienttest WHERE TRIM(ClinicID) = '${cidStr}') AS labTests,
      (SELECT COUNT(*) FROM tblavpatientstatus WHERE ClinicID = ${cid}) AS patientStatus`
  );
  return {
    visits: Number(row?.visits || 0),
    labTests: Number(row?.labTests || 0),
    patientStatus: Number(row?.patientStatus || 0)
  };
}

async function countChildTabBadges(siteCode, clinicId) {
  const cid = escapeSqlLiteral(clinicId);
  const [row] = await selectSite(
    siteCode,
    `SELECT
      (SELECT COUNT(*) FROM tblcvmain WHERE ClinicID = '${cid}') AS visits,
      (SELECT COUNT(*) FROM tblpatienttest WHERE TRIM(ClinicID) = '${cid}') AS labTests,
      (SELECT COUNT(*) FROM tblcvpatientstatus WHERE ClinicID = '${cid}') AS patientStatus`
  );
  return {
    visits: Number(row?.visits || 0),
    labTests: Number(row?.labTests || 0),
    patientStatus: Number(row?.patientStatus || 0)
  };
}

async function countInfantTabBadges(siteCode, clinicId) {
  const cid = escapeSqlLiteral(clinicId);
  const [row] = await selectSite(
    siteCode,
    `SELECT
      (SELECT COUNT(*) FROM tblevmain WHERE ClinicID = '${cid}') AS visits,
      (SELECT COUNT(*) FROM tbletest WHERE ClinicID = '${cid}') AS eidTests,
      (SELECT COUNT(*) FROM tblevpatientstatus WHERE ClinicID = '${cid}') AS patientStatus`
  );
  return {
    visits: Number(row?.visits || 0),
    eidTests: Number(row?.eidTests || 0),
    patientStatus: Number(row?.patientStatus || 0),
    labTests: Number(row?.eidTests || 0)
  };
}

async function loadAdult(siteCode, clinicId, parts = null, opts = {}) {
  const cid = Number(clinicId);
  const partSet = parseParts(parts);
  const peek = opts.peek === true;
  const drugCap = opts.timelineTab ? lim(TIMELINE_DRUG_LIMIT) : lim(LIMITS.drugs);
  const visitCap = wantsPart(partSet, 'visits')
    ? peek
      ? PEEK_LIMIT
      : LIMITS.visits
    : 0;
  const labCap = wantsPart(partSet, 'labTests')
    ? peek
      ? PEEK_LIMIT
      : LIMITS.labTests
    : 0;
  const statusCap = wantsPart(partSet, 'patientStatus')
    ? peek
      ? PEEK_LIMIT
      : LIMITS.status
    : 0;
  const limHist = lim(LIMITS.status, 30);

  const block = {
    registration: null,
    art: [],
    visits: [],
    patientStatus: [],
    labTests: [],
    arvDrugs: [],
    tptDrugs: [],
    tbDrugs: [],
    allergies: [],
    arvTreatHistory: [],
    demographics: [],
    programLinks: [],
    oiDrugs: [],
    appointments: []
  };

  const jobs = [];

  if (wantsPart(partSet, 'registration')) {
    jobs.push(
      selectSite(
        siteCode,
        `SELECT ClinicID, DafirstVisit, DaBirth, Sex, DaART, Artnum, LClinicID, TypeofReturn, TPT, TPTdrug, DaStartTPT, DaEndTPT,
                VcctID, Vcctcode, DaHIV, PclinicID, SiteName, TbPast, TypeTB, Tbtreat, ResultTB, ResultTreat, DaResultTreat,
                ARVTreatHis, Education, Referred, Orefferred, Allergy, Daonset, Datreat, Nationality, Diabete, Hyper, Anemia
         FROM tblaimain WHERE ClinicID = ${cid} LIMIT 1`
      ).then(([registration]) => {
        block.registration = registration
          ? {
              ...registration,
              sexLabel: formatSex(registration.Sex),
              patientType: PROGRAM_TYPE_KH.adult
            }
          : null;
      })
    );
  }

  if (wantsPart(partSet, 'art')) {
    jobs.push(
      selectSite(
        siteCode,
        `SELECT ClinicID, ART, DaArt FROM tblaart WHERE ClinicID = ${cid} ORDER BY DaArt DESC LIMIT ${lim(LIMITS.status)}`
      ).then((rows) => {
        block.art = rows;
      })
    );
  }

  if (wantsPart(partSet, 'visits')) {
    jobs.push(
      selectSite(
        siteCode,
        `SELECT Vid, ClinicID, ARTnum, DatVisit, TypeVisit, Weight, Height, Temp, Pulse, Blood,
                WHO, TB, TypeTB, TBtreat, DaTBtreat, VLDetectable, ReVL, ReCD4, Eligible, \`Function\`,
                ARVreg, MissARV, MissTime, DaApp, TestID, PregStatus, Womenstatus, TPTout, TBout
         FROM tblavmain WHERE ClinicID = ${cid} ORDER BY DatVisit DESC LIMIT ${lim(visitCap)}`
      ).then((rows) => {
        block.visits = rows;
      })
    );
  }

  if (wantsPart(partSet, 'patientStatus')) {
    jobs.push(
      selectSite(
        siteCode,
        `SELECT ClinicID, Status, Da, Cause, Place, OPlace FROM tblavpatientstatus
         WHERE ClinicID = ${cid} ORDER BY Da DESC LIMIT ${lim(statusCap)}`
      ).then((rows) => {
        block.patientStatus = rows;
      })
    );
  }

  if (wantsPart(partSet, 'labTests')) {
    jobs.push(
      selectSite(
        siteCode,
        `SELECT TestID, ClinicID, Dat, DaCollect, DaArrival, HIVLoad, CD4, CD, CD8, HCV, HCVlog, HIVAb
         FROM tblpatienttest WHERE TRIM(ClinicID) = '${escapeSqlLiteral(clinicId)}'
         ORDER BY DaCollect DESC, Dat DESC LIMIT ${lim(labCap)}`
      ).then((rows) => {
        block.labTests = rows;
      })
    );
  }

  if (wantsPart(partSet, 'tbDrugs')) {
    jobs.push(
      selectSite(
        siteCode,
        `SELECT d.DrugName, d.Dose, d.Status, d.Da, d.Reason, v.DatVisit
         FROM tblavmain v
         INNER JOIN tblavtbdrug d ON d.Vid = v.Vid AND d.site_code = v.site_code
         WHERE v.ClinicID = ${cid}
         ORDER BY d.Da DESC LIMIT ${drugCap}`
      ).then((rows) => {
        block.tbDrugs = rows;
      })
    );
  }

  if (wantsPart(partSet, 'arvDrugs')) {
    jobs.push(
      selectSite(
        siteCode,
        `SELECT d.DrugName, d.Dose, d.Status, d.Da, d.Reason, v.DatVisit, v.ARTnum
         FROM tblavmain v
         INNER JOIN tblavarvdrug d ON d.Vid = v.Vid AND d.site_code = v.site_code
         WHERE v.ClinicID = ${cid}
         ORDER BY d.Da DESC LIMIT ${drugCap}`
      ).then((rows) => {
        block.arvDrugs = rows;
      })
    );
  }

  if (wantsPart(partSet, 'tptDrugs')) {
    jobs.push(
      selectSite(
        siteCode,
        `SELECT d.DrugName, d.Dose, d.Status, d.Da, d.Reason, v.DatVisit
         FROM tblavmain v
         INNER JOIN tblavtptdrug d ON d.Vid = v.Vid AND d.site_code = v.site_code
         WHERE v.ClinicID = ${cid} AND d.DrugName != 'B6'
         ORDER BY d.Da DESC LIMIT ${drugCap}`
      ).then((rows) => {
        block.tptDrugs = rows;
      })
    );
  }

  if (wantsPart(partSet, 'allergies')) {
    jobs.push(
      selectSite(
        siteCode,
        `SELECT DrugName, Allergy, Da FROM tblaiallergy WHERE ClinicID = ${cid} ORDER BY Da DESC LIMIT ${limHist}`
      ).then((rows) => {
        block.allergies = rows;
      })
    );
  }

  if (wantsPart(partSet, 'arvTreatHistory')) {
    jobs.push(
      selectSite(
        siteCode,
        `SELECT DrugName, Clinic, DaStart, DaStop, Note FROM tblaiarvtreathis WHERE ClinicID = ${cid}
         ORDER BY DaStart DESC LIMIT ${limHist}`
      ).then((rows) => {
        block.arvTreatHistory = rows;
      })
    );
  }

  if (wantsPart(partSet, 'demographics')) {
    const demLim = peek ? 1 : limHist;
    jobs.push(
      selectSite(
        siteCode,
        `SELECT Daupdate, Marital, Occupation, Phone, Village, Commune, District, Province, Phone1, AddCont1, NameNGO
         FROM tblaumain WHERE ClinicID = ${cid} ORDER BY Daupdate DESC LIMIT ${demLim}`
      ).then((rows) => {
        block.demographics = rows;
      })
    );
  }

  if (wantsPart(partSet, 'programLinks')) {
    jobs.push(
      selectSite(
        siteCode,
        `SELECT Codes, Typecode FROM tblalink WHERE ClinicID = ${cid} LIMIT ${limHist}`
      ).then((rows) => {
        block.programLinks = rows;
      })
    );
  }

  if (wantsPart(partSet, 'oiDrugs')) {
    jobs.push(
      selectSite(
        siteCode,
        `SELECT d.DrugName, d.Dose, d.Status, d.Da, v.DatVisit
         FROM tblavmain v INNER JOIN tblavoidrug d ON d.Vid = v.Vid AND d.site_code = v.site_code
         WHERE v.ClinicID = ${cid} ORDER BY d.Da DESC LIMIT ${lim(LIMITS.drugs)}`
      ).then((rows) => {
        block.oiDrugs = rows;
      })
    );
  }

  if (wantsPart(partSet, 'appointments')) {
    jobs.push(
      selectSite(
        siteCode,
        `SELECT DatVisit, DaApp, NULL AS Att
         FROM tblavmain WHERE ClinicID = ${cid}
         ORDER BY DatVisit DESC LIMIT ${lim(LIMITS.appointments)}`
      ).then((rows) => {
        block.appointments = (rows || []).filter(
          (r) => r.DaApp && !String(r.DaApp).startsWith('1900-01-01')
        );
      })
    );
  }

  await Promise.all(jobs);
  return partSet ? sliceBlockForParts(block, parts) : block;
}

async function loadChild(siteCode, clinicId, parts = null, opts = {}) {
  const partSet = parseParts(parts);
  if (partSet) {
    return loadChildPartial(siteCode, clinicId, partSet, opts);
  }
  return loadChildAll(siteCode, clinicId);
}

async function loadChildPartial(siteCode, clinicId, partSet, opts = {}) {
  const cid = escapeSqlLiteral(clinicId);
  const peek = opts.peek === true;
  const visitCap = wantsPart(partSet, 'visits')
    ? peek
      ? PEEK_LIMIT
      : LIMITS.visits
    : 0;
  const labCap = wantsPart(partSet, 'labTests')
    ? peek
      ? PEEK_LIMIT
      : LIMITS.labTests
    : 0;
  const block = {
    registration: null,
    art: [],
    visits: [],
    patientStatus: [],
    labTests: [],
    arvDrugs: [],
    tptDrugs: [],
    tbDrugs: [],
    family: [],
    demographics: [],
    programLinks: [],
    appointments: [],
    oiPast: [],
    allergies: []
  };
  const jobs = [];
  if (wantsPart(partSet, 'registration')) {
    jobs.push(
      selectSite(
        siteCode,
        `SELECT ClinicID, DaFirstVisit, DaBirth, Sex, DaART, Artnum, LClinicID, TPTdrug, DaStartTPT, DaEndTPT,
                SiteName, TbPast, TypeTB, Tbtreat, Referred, OffIn, VcctID, Feeding
         FROM tblcimain WHERE ClinicID = '${cid}' LIMIT 1`
      ).then(([registration]) => {
        block.registration = registration
          ? {
              ...registration,
              sexLabel: formatSex(registration.Sex),
              patientType: PROGRAM_TYPE_KH.child
            }
          : null;
      })
    );
  }
  if (wantsPart(partSet, 'art')) {
    jobs.push(
      selectSite(
        siteCode,
        `SELECT ClinicID, ART, DaArt FROM tblcart WHERE ClinicID = '${cid}' ORDER BY DaArt DESC LIMIT ${lim(LIMITS.status)}`
      ).then((rows) => {
        block.art = rows;
      })
    );
  }
  if (wantsPart(partSet, 'visits')) {
    jobs.push(
      selectSite(
        siteCode,
        `SELECT Vid, ClinicID, ARTnum, DatVisit, TypeVisit, Weight, Height, Temp, Pulse, Blood,
                WHO, PTB, VLDetectable, ReVL, Eligible, \`Function\`, Treatfail, DaApp, Miss1, Miss3
         FROM tblcvmain WHERE ClinicID = '${cid}' ORDER BY DatVisit DESC LIMIT ${lim(visitCap)}`
      ).then((rows) => {
        block.visits = rows;
      })
    );
  }
  if (wantsPart(partSet, 'patientStatus')) {
    jobs.push(
      selectSite(
        siteCode,
        `SELECT ClinicID, Status, Da, Cause FROM tblcvpatientstatus
         WHERE ClinicID = '${cid}' ORDER BY Da DESC LIMIT ${lim(peek ? PEEK_LIMIT : LIMITS.status)}`
      ).then((rows) => {
        block.patientStatus = rows;
      })
    );
  }
  if (wantsPart(partSet, 'labTests')) {
    jobs.push(
      selectSite(
        siteCode,
        `SELECT TestID, ClinicID, Dat, DaCollect, HIVLoad, CD4
         FROM tblpatienttest WHERE TRIM(ClinicID) = '${cid}'
         ORDER BY DaCollect DESC LIMIT ${lim(labCap)}`
      ).then((rows) => {
        block.labTests = rows;
      })
    );
  }
  if (wantsPart(partSet, 'arvDrugs')) {
    jobs.push(
      selectSite(
        siteCode,
        `SELECT d.DrugName, d.Dose, d.Status, d.Da, v.DatVisit
         FROM tblcvmain v
         INNER JOIN tblcvarvdrug d ON d.Vid = v.Vid AND d.site_code = v.site_code
         WHERE v.ClinicID = '${cid}'
         ORDER BY d.Da DESC LIMIT ${lim(LIMITS.drugs)}`
      ).then((rows) => {
        block.arvDrugs = rows;
      })
    );
  }
  if (wantsPart(partSet, 'tptDrugs')) {
    jobs.push(
      selectSite(
        siteCode,
        `SELECT d.DrugName, d.Dose, d.Status, d.Da, v.DatVisit
         FROM tblcvmain v
         INNER JOIN tblcvtptdrug d ON d.Vid = v.Vid AND d.site_code = v.site_code
         WHERE v.ClinicID = '${cid}' AND d.DrugName != 'B6'
         ORDER BY d.Da DESC LIMIT ${lim(LIMITS.drugs)}`
      ).then((rows) => {
        block.tptDrugs = rows;
      })
    );
  }
  if (wantsPart(partSet, 'tbDrugs')) {
    jobs.push(
      selectSite(
        siteCode,
        `SELECT d.DrugName, d.Dose, d.Status, d.Da, v.DatVisit
         FROM tblcvmain v
         INNER JOIN tblcvtbdrug d ON d.Vid = v.Vid AND d.site_code = v.site_code
         WHERE v.ClinicID = '${cid}'
         ORDER BY d.Da DESC LIMIT ${lim(LIMITS.drugs)}`
      ).then((rows) => {
        block.tbDrugs = rows;
      })
    );
  }
  if (wantsPart(partSet, 'allergies')) {
    jobs.push(
      selectSite(
        siteCode,
        `SELECT DrugName, Allergy, DATE(updated_at) AS Da FROM tblciallergy WHERE ClinicID = '${cid}' ORDER BY updated_at DESC LIMIT ${lim(LIMITS.status, 30)}`
      ).then((rows) => {
        block.allergies = rows;
      })
    );
  }
  if (wantsPart(partSet, 'family')) {
    jobs.push(
      selectSite(
        siteCode,
        `SELECT Faminily, Age, HIVstatus, Status, StartARV, Pregnant, HTB, SiteName
         FROM tblcifamily WHERE ClinicID = '${cid}' LIMIT ${lim(LIMITS.status, 30)}`
      ).then((rows) => {
        block.family = rows;
      })
    );
  }
  if (wantsPart(partSet, 'demographics')) {
    const demLim = peek ? 1 : lim(LIMITS.status, 30);
    jobs.push(
      selectSite(
        siteCode,
        `SELECT Daupdate, Village, Commune, District, Province, Phone, ChildStatus, Education, AddContact
         FROM tblcumain WHERE ClinicID = '${cid}' ORDER BY Daupdate DESC LIMIT ${demLim}`
      ).then((rows) => {
        block.demographics = rows;
      })
    );
  }
  if (wantsPart(partSet, 'programLinks')) {
    jobs.push(
      selectSite(
        siteCode,
        `SELECT Codes, Typecode FROM tblclink WHERE ClinicID = '${cid}' LIMIT ${lim(LIMITS.status, 30)}`
      ).then((rows) => {
        block.programLinks = rows;
      })
    );
  }
  if (wantsPart(partSet, 'appointments')) {
    jobs.push(
      selectSite(
        siteCode,
        `SELECT DatVisit, DaApp, NULL AS Att
         FROM tblcvmain WHERE ClinicID = '${cid}'
         ORDER BY DatVisit DESC LIMIT ${lim(LIMITS.appointments)}`
      ).then((rows) => {
        block.appointments = rows;
      })
    );
  }
  if (wantsPart(partSet, 'oiPast')) {
    jobs.push(
      selectSite(
        siteCode,
        `SELECT DrugName, Clinic, DaStart, DaStop, Note FROM tblciothpast WHERE ClinicID = '${cid}'
         ORDER BY DaStart DESC LIMIT ${lim(LIMITS.status, 30)}`
      ).then((rows) => {
        block.oiPast = rows;
      })
    );
  }
  await Promise.all(jobs);
  return sliceBlockForParts(block, [...partSet]);
}

async function loadChildAll(siteCode, clinicId) {
  const cid = escapeSqlLiteral(clinicId);

  const [registration] = await selectSite(
    siteCode,
    `SELECT ClinicID, DaFirstVisit, DaBirth, Sex, DaART, Artnum, LClinicID, TPTdrug, DaStartTPT, DaEndTPT,
            SiteName, TbPast, TypeTB, Tbtreat, Referred, OffIn, VcctID, Feeding
     FROM tblcimain WHERE ClinicID = '${cid}' LIMIT 1`
  );

  const art = await selectSite(
    siteCode,
    `SELECT ClinicID, ART, DaArt FROM tblcart WHERE ClinicID = '${cid}' ORDER BY DaArt DESC LIMIT ${lim(LIMITS.status)}`
  );

  const visits = await selectSite(
    siteCode,
    `SELECT Vid, ClinicID, ARTnum, DatVisit, TypeVisit, Weight, Height, Temp, Pulse, Blood,
            WHO, PTB, VLDetectable, ReVL, Eligible, \`Function\`, Treatfail, DaApp, Miss1, Miss3
     FROM tblcvmain WHERE ClinicID = '${cid}' ORDER BY DatVisit DESC LIMIT ${lim(LIMITS.visits)}`
  );

  const patientStatus = await selectSite(
    siteCode,
    `SELECT ClinicID, Status, Da, Cause FROM tblcvpatientstatus
     WHERE ClinicID = '${cid}' ORDER BY Da DESC LIMIT ${lim(LIMITS.status)}`
  );

  const labTests = await selectSite(
    siteCode,
    `SELECT TestID, ClinicID, Dat, DaCollect, HIVLoad, CD4
     FROM tblpatienttest WHERE TRIM(ClinicID) = '${cid}'
     ORDER BY DaCollect DESC LIMIT ${lim(LIMITS.labTests)}`
  );

  const arvDrugs = await selectSite(
    siteCode,
    `SELECT d.DrugName, d.Dose, d.Status, d.Da, v.DatVisit
     FROM tblcvmain v
     INNER JOIN tblcvarvdrug d ON d.Vid = v.Vid AND d.site_code = v.site_code
     WHERE v.ClinicID = '${cid}'
     ORDER BY d.Da DESC LIMIT ${lim(LIMITS.drugs)}`
  );

  const tptDrugs = await selectSite(
    siteCode,
    `SELECT d.DrugName, d.Dose, d.Status, d.Da, v.DatVisit
     FROM tblcvmain v
     INNER JOIN tblcvtptdrug d ON d.Vid = v.Vid AND d.site_code = v.site_code
     WHERE v.ClinicID = '${cid}' AND d.DrugName != 'B6'
     ORDER BY d.Da DESC LIMIT ${lim(LIMITS.drugs)}`
  );

  const tbDrugs = await selectSite(
    siteCode,
    `SELECT d.DrugName, d.Dose, d.Status, d.Da, v.DatVisit
     FROM tblcvmain v
     INNER JOIN tblcvtbdrug d ON d.Vid = v.Vid AND d.site_code = v.site_code
     WHERE v.ClinicID = '${cid}'
     ORDER BY d.Da DESC LIMIT ${lim(LIMITS.drugs)}`
  );

  const limHist = Math.max(1, Math.min(30, LIMITS.status));
  const [family, demographics, programLinks, oiPast, allergies] = await Promise.all([
    selectSite(
      siteCode,
      `SELECT Faminily, Age, HIVstatus, Status, StartARV, Pregnant, HTB, SiteName
       FROM tblcifamily WHERE ClinicID = '${cid}' LIMIT ${limHist}`
    ),
    selectSite(
      siteCode,
      `SELECT Daupdate, Village, Commune, District, Province, Phone, ChildStatus, Education, AddContact
       FROM tblcumain WHERE ClinicID = '${cid}' ORDER BY Daupdate DESC LIMIT ${limHist}`
    ),
    selectSite(
      siteCode,
      `SELECT Codes, Typecode FROM tblclink WHERE ClinicID = '${cid}' LIMIT ${limHist}`
    ),
    selectSite(
      siteCode,
      `SELECT DrugName, Clinic, DaStart, DaStop, Note FROM tblciothpast WHERE ClinicID = '${cid}'
       ORDER BY DaStart DESC LIMIT ${limHist}`
    ),
    selectSite(
      siteCode,
      `SELECT DrugName, Allergy, DATE(updated_at) AS Da FROM tblciallergy WHERE ClinicID = '${cid}' ORDER BY updated_at DESC LIMIT ${limHist}`
    )
  ]);

  return {
    registration: registration
      ? { ...registration, sexLabel: formatSex(registration.Sex), patientType: PROGRAM_TYPE_KH.child }
      : null,
    art,
    visits,
    patientStatus,
    labTests,
    arvDrugs,
    tptDrugs,
    tbDrugs,
    family,
    demographics,
    programLinks,
    oiPast,
    allergies
  };
}

async function loadInfant(siteCode, clinicId, parts = null, opts = {}) {
  const partSet = parseParts(parts);
  if (partSet) {
    return loadInfantPartial(siteCode, clinicId, partSet, opts);
  }
  return loadInfantAll(siteCode, clinicId);
}

async function loadInfantPartial(siteCode, clinicId, partSet, opts = {}) {
  const cid = escapeSqlLiteral(clinicId);
  const peek = opts.peek === true;
  const block = {
    registration: null,
    art: [],
    visits: [],
    patientStatus: [],
    eidTests: [],
    labTests: [],
    arvDrugs: [],
    tptDrugs: [],
    tbDrugs: []
  };
  const jobs = [];
  if (wantsPart(partSet, 'registration')) {
    jobs.push(
      selectSite(
        siteCode,
        `SELECT ClinicID, DafirstVisit, DaBirth, Sex, MArt, MClinicID, PMTCT, DaDelivery, DeliveryStatus,
                FHIV, MHIV, MLastvl, DaMLastvl, KnownHIV, Received, Syrup, Cotrim, EOClinicID, SiteName,
                Village, Commune, District, Province
         FROM tbleimain WHERE ClinicID = '${cid}' LIMIT 1`
      ).then(([registration]) => {
        block.registration = registration
          ? {
              ...registration,
              sexLabel: formatSex(registration.Sex),
              patientType: PROGRAM_TYPE_KH.infant
            }
          : null;
      })
    );
  }
  if (wantsPart(partSet, 'visits')) {
    jobs.push(
      selectSite(
        siteCode,
        `SELECT Vid, ClinicID, DatVisit, TypeVisit, Weight, Height, DaApp, DNA, DaResult, Antibody,
                DaAntibody, TestID, Feeding, Temp, Pulse
         FROM tblevmain WHERE ClinicID = '${cid}' ORDER BY DatVisit DESC LIMIT ${lim(peek ? PEEK_LIMIT : LIMITS.visits)}`
      ).then((rows) => {
        block.visits = rows;
      })
    );
  }
  if (wantsPart(partSet, 'eidTests') || wantsPart(partSet, 'labTests')) {
    jobs.push(
      selectSite(
        siteCode,
        `SELECT TID, ClinicID, DNAPcr, DaPcrArr, DaBlood, DaReceive, DaAnalys, Result, DaRresult, LabID
         FROM tbletest WHERE ClinicID = '${cid}' ORDER BY DaReceive DESC LIMIT ${lim(peek ? PEEK_LIMIT : LIMITS.labTests)}`
      ).then((rows) => {
        block.eidTests = rows;
      })
    );
  }
  if (wantsPart(partSet, 'patientStatus')) {
    jobs.push(
      selectSite(
        siteCode,
        `SELECT ClinicID, Status, DaStatus, Vid FROM tblevpatientstatus
         WHERE ClinicID = '${cid}' ORDER BY DaStatus DESC LIMIT ${lim(peek ? PEEK_LIMIT : LIMITS.status)}`
      ).then((rows) => {
        block.patientStatus = rows;
      })
    );
  }
  if (wantsPart(partSet, 'arvDrugs')) {
    jobs.push(
      selectSite(
        siteCode,
        `SELECT d.DrugName, d.Dose, d.Status, d.Da, v.DatVisit
         FROM tblevmain v
         INNER JOIN tblevarvdrug d ON d.Vid = v.Vid AND d.site_code = v.site_code
         WHERE v.ClinicID = '${cid}'
         ORDER BY d.Da DESC LIMIT ${lim(LIMITS.drugs)}`
      ).then((rows) => {
        block.arvDrugs = rows;
      })
    );
  }
  await Promise.all(jobs);
  return sliceBlockForParts(block, [...partSet]);
}

async function loadInfantAll(siteCode, clinicId) {
  const cid = escapeSqlLiteral(clinicId);
  const lim = (n) => Math.max(1, Math.min(100, n));

  const [registration] = await selectSite(
    siteCode,
    `SELECT ClinicID, DafirstVisit, DaBirth, Sex, MArt, MClinicID, PMTCT, DaDelivery, DeliveryStatus,
            FHIV, MHIV, MLastvl, DaMLastvl, KnownHIV, Received, Syrup, Cotrim, EOClinicID, SiteName,
            Village, Commune, District, Province
     FROM tbleimain WHERE ClinicID = '${cid}' LIMIT 1`
  );

  const art = [];

  const visits = await selectSite(
    siteCode,
    `SELECT Vid, ClinicID, DatVisit, TypeVisit, Weight, Height, DaApp, DNA, DaResult, Antibody,
            DaAntibody, TestID, Feeding, Temp, Pulse
     FROM tblevmain WHERE ClinicID = '${cid}' ORDER BY DatVisit DESC LIMIT ${lim(LIMITS.visits)}`
  );

  const eidTests = await selectSite(
    siteCode,
    `SELECT TID, ClinicID, DNAPcr, DaPcrArr, DaBlood, DaReceive, DaAnalys, Result, DaRresult, LabID
     FROM tbletest WHERE ClinicID = '${cid}' ORDER BY DaReceive DESC LIMIT ${lim(LIMITS.labTests)}`
  );

  const arvDrugs = await selectSite(
    siteCode,
    `SELECT d.DrugName, d.Dose, d.Status, d.Da, v.DatVisit
     FROM tblevmain v
     INNER JOIN tblevarvdrug d ON d.Vid = v.Vid AND d.site_code = v.site_code
     WHERE v.ClinicID = '${cid}'
     ORDER BY d.Da DESC LIMIT ${lim(LIMITS.drugs)}`
  );

  const patientStatus = await selectSite(
    siteCode,
    `SELECT ClinicID, Status, DaStatus, Vid FROM tblevpatientstatus
     WHERE ClinicID = '${cid}' ORDER BY DaStatus DESC LIMIT ${lim(LIMITS.status)}`
  );

  return {
    registration: registration
      ? { ...registration, sexLabel: formatSex(registration.Sex), patientType: PROGRAM_TYPE_KH.infant }
      : null,
    art,
    visits,
    patientStatus,
    eidTests,
    labTests: [],
    arvDrugs,
    tptDrugs: [],
    tbDrugs: []
  };
}

async function loadPnttRows(siteCode, clinicId) {
  const cid = Number(clinicId);
  if (!Number.isFinite(cid)) return [];
  const lim = Math.max(1, Math.min(100, LIMITS.pntt));
  return selectSite(
    siteCode,
    `SELECT ClinicID, DaVisit, SexHIV, Drug, Pill, Agree, AsID, Wsex, SexM, SexTran, Sex4, SexMoney
     FROM tblapntt WHERE ClinicID = ${cid} ORDER BY DaVisit DESC LIMIT ${lim}`
  );
}

async function loadPnttExtras(siteCode, clinicId, pnttRows) {
  const cid = Number(clinicId);
  if (!Number.isFinite(cid) || !pnttRows?.length) {
    return { pnttPartners: [], pnttChildren: [] };
  }
  const lim = 25;
  const pnttPartners = await selectSite(
    siteCode,
    `SELECT AsID, NumPart, Age, Sex, RePatient, StatusHIV, Result, RegTreat, ClinicID, ArtNumber, PatientDate
     FROM tblapnttpart WHERE ClinicID = ${cid} ORDER BY NumPart LIMIT ${lim}`
  );
  const asIds = [...new Set(pnttRows.map((r) => r.AsID).filter((id) => id != null && id !== ''))];
  let pnttChildren = [];
  if (asIds.length) {
    const idList = asIds.map((id) => Number(id)).filter(Number.isFinite).join(',');
    if (idList) {
      pnttChildren = await selectSite(
        siteCode,
        `SELECT APID, NumChild, Age, Sex, PlanChild, PatientDate, Village, Commune, District, Province, Phone
         FROM tblapnttchild WHERE APID IN (${idList}) ORDER BY NumChild LIMIT ${lim}`
      );
    }
  }
  return { pnttPartners, pnttChildren };
}

const LIST_PAGE_DEFAULT = Number(process.env.P360_LIST_PAGE_SIZE || 25);
const LIST_PAGE_MAX = 100;
/** Skip slow COUNT(*) on union by default; use LIMIT+1 for hasNext. Set P360_LIST_COUNT=1 to always count. */
const LIST_COUNT_DEFAULT = process.env.P360_LIST_COUNT === '1';

/** Frontend list column id → SQL alias in patient_union */
const LIST_SORT_COLUMNS = {
  clinicId: 'clinicId',
  program: 'program',
  sex: 'Sex',
  patientStatus: 'patientStatus',
  patientStatusDate: 'patientStatusDa',
  province: 'Province',
  country: 'Nationality',
  dob: 'dateOfBirth',
  art: 'artNumber',
  daArt: 'daArt',
  firstVisit: 'firstVisit'
};

function buildListOrderBy(sortBy, sortDir) {
  const col = LIST_SORT_COLUMNS[String(sortBy || '').trim()];
  const dir = String(sortDir || '').toLowerCase() === 'desc' ? 'DESC' : 'ASC';
  if (!col) return 'program ASC, clinicId ASC';
  return `${col} IS NULL, ${col} ${dir}, program ASC, clinicId ASC`;
}

function listWhereClauses(searchQ, filters = {}) {
  const q = escapeSqlLiteral(String(searchQ || '').trim());
  const hasSearch = q.length >= 2;
  const sexRaw = filters.sex;
  const sexNum = sexRaw === '0' || sexRaw === 0 || sexRaw === '1' || sexRaw === 1 ? Number(sexRaw) : null;
  const sexClause = (col) => (sexNum === 0 || sexNum === 1 ? `${col} = ${sexNum}` : '1=1');

  const prov = escapeSqlLiteral(String(filters.province || '').trim());
  const hasProv = prov.length >= 1;
  const provLike = `%${prov}%`;
  const adultProv = hasProv
    ? `EXISTS (SELECT 1 FROM tblaumain u WHERE u.ClinicID = m.ClinicID AND u.site_code = m.site_code AND TRIM(u.Province) LIKE '${provLike}')`
    : '1=1';
  const childProv = hasProv
    ? `EXISTS (SELECT 1 FROM tblcumain u WHERE CAST(u.ClinicID AS CHAR) = CAST(c.ClinicID AS CHAR) AND u.site_code = c.site_code AND TRIM(u.Province) LIKE '${provLike}')`
    : '1=1';
  const infantProv = hasProv ? `TRIM(i.Province) LIKE '${provLike}'` : '1=1';

  const adultSearch = hasSearch
    ? `(CAST(m.ClinicID AS CHAR) LIKE '%${q}%' OR m.Artnum LIKE '%${q}%')`
    : '1=1';
  const childSearch = hasSearch
    ? `(CAST(c.ClinicID AS CHAR) LIKE '%${q}%' OR c.Artnum LIKE '%${q}%')`
    : '1=1';
  const infantSearch = hasSearch ? `(i.ClinicID LIKE '%${q}%' OR i.MArt LIKE '%${q}%')` : '1=1';

  const statusRaw = filters.patientStatus;
  const statusNum =
    statusRaw === '0' || statusRaw === 0 || statusRaw === '1' || statusRaw === 1 || statusRaw === '3' || statusRaw === 3
      ? Number(statusRaw)
      : null;
  const adultStatus =
    statusNum != null
      ? `(SELECT s.Status FROM tblavpatientstatus s WHERE s.ClinicID = m.ClinicID ORDER BY s.Da DESC LIMIT 1) = ${statusNum}`
      : '1=1';
  const childStatus =
    statusNum != null
      ? `(SELECT s.Status FROM tblcvpatientstatus s WHERE s.ClinicID = c.ClinicID ORDER BY s.Da DESC LIMIT 1) = ${statusNum}`
      : '1=1';
  const infantStatus =
    statusNum != null
      ? `(SELECT s.Status FROM tblevpatientstatus s WHERE s.ClinicID = i.ClinicID ORDER BY s.DaStatus DESC LIMIT 1) = ${statusNum}`
      : '1=1';

  return {
    adult: `(${adultSearch}) AND (${sexClause('m.Sex')}) AND (${adultProv}) AND (${adultStatus})`,
    child: `(${childSearch}) AND (${sexClause('c.Sex')}) AND (${childProv}) AND (${childStatus})`,
    infant: `(${infantSearch}) AND (${sexClause('i.Sex')}) AND (${infantProv}) AND (${infantStatus})`
  };
}

function listLatestStatusSql(program, clinicRef) {
  if (program === 'adult') {
    return `(SELECT s.Status FROM tblavpatientstatus s WHERE s.ClinicID = ${clinicRef} ORDER BY s.Da DESC LIMIT 1) AS patientStatus,
            (SELECT s.Da FROM tblavpatientstatus s WHERE s.ClinicID = ${clinicRef} ORDER BY s.Da DESC LIMIT 1) AS patientStatusDa`;
  }
  if (program === 'child') {
    return `(SELECT s.Status FROM tblcvpatientstatus s WHERE s.ClinicID = ${clinicRef} ORDER BY s.Da DESC LIMIT 1) AS patientStatus,
            (SELECT s.Da FROM tblcvpatientstatus s WHERE s.ClinicID = ${clinicRef} ORDER BY s.Da DESC LIMIT 1) AS patientStatusDa`;
  }
  return `(SELECT s.Status FROM tblevpatientstatus s WHERE s.ClinicID = ${clinicRef} ORDER BY s.DaStatus DESC LIMIT 1) AS patientStatus,
          (SELECT s.DaStatus FROM tblevpatientstatus s WHERE s.ClinicID = ${clinicRef} ORDER BY s.DaStatus DESC LIMIT 1) AS patientStatusDa`;
}

/** Lite union = no province subquery (fast). Province filled in enrichListProvinces(). */
function buildListUnionSql(programFilter, searchQ, { lite = false, filters = {} } = {}) {
  const w = listWhereClauses(searchQ, filters);
  const branches = [];

  if (!programFilter || programFilter === 'adult') {
    const provinceCol = lite
      ? 'NULL AS Province'
      : `(SELECT u.Province FROM tblaumain u
          WHERE u.ClinicID = m.ClinicID AND u.site_code = m.site_code
          ORDER BY u.Daupdate DESC LIMIT 1) AS Province`;
    const statusCols = listLatestStatusSql('adult', 'm.ClinicID');
    branches.push(
      `SELECT 'adult' AS program, CAST(m.ClinicID AS CHAR) AS clinicId, m.DafirstVisit AS firstVisit,
              m.DaBirth AS dateOfBirth, m.Sex, m.Artnum AS artNumber, m.DaART AS daArt,
              m.Nationality, ${provinceCol}, ${statusCols}
       FROM tblaimain m WHERE ${w.adult}`
    );
  }
  if (!programFilter || programFilter === 'child') {
    const provinceCol = lite
      ? 'NULL AS Province'
      : `(SELECT u.Province FROM tblcumain u
          WHERE CAST(u.ClinicID AS CHAR) = CAST(c.ClinicID AS CHAR) AND u.site_code = c.site_code
          ORDER BY u.Daupdate DESC LIMIT 1) AS Province`;
    const statusCols = listLatestStatusSql('child', 'c.ClinicID');
    branches.push(
      `SELECT 'child' AS program, CAST(c.ClinicID AS CHAR) AS clinicId, c.DaFirstVisit AS firstVisit,
              c.DaBirth AS dateOfBirth, c.Sex, c.Artnum AS artNumber, c.DaART AS daArt,
              c.Nationality, ${provinceCol}, ${statusCols}
       FROM tblcimain c WHERE ${w.child}`
    );
  }
  if (!programFilter || programFilter === 'infant') {
    const statusCols = listLatestStatusSql('infant', 'i.ClinicID');
    branches.push(
      `SELECT 'infant' AS program, i.ClinicID AS clinicId, i.DafirstVisit AS firstVisit,
              i.DaBirth AS dateOfBirth, i.Sex, i.MArt AS artNumber, NULL AS daArt,
              NULL AS Nationality, i.Province, ${statusCols}
       FROM tbleimain i WHERE ${w.infant}`
    );
  }

  return branches.length ? branches.join(' UNION ALL ') : '';
}

/** Fast COUNT: sum per main table (no union, no province subquery). */
async function countListPatientsFast(siteCode, programFilter, searchQ, filters = {}) {
  const w = listWhereClauses(searchQ, filters);
  const jobs = [];
  if (!programFilter || programFilter === 'adult') {
    jobs.push(
      selectSite(siteCode, `SELECT COUNT(*) AS c FROM tblaimain m WHERE ${w.adult}`).then(
        ([r]) => Number(r?.c || 0)
      )
    );
  }
  if (!programFilter || programFilter === 'child') {
    jobs.push(
      selectSite(siteCode, `SELECT COUNT(*) AS c FROM tblcimain c WHERE ${w.child}`).then(
        ([r]) => Number(r?.c || 0)
      )
    );
  }
  if (!programFilter || programFilter === 'infant') {
    jobs.push(
      selectSite(siteCode, `SELECT COUNT(*) AS c FROM tbleimain i WHERE ${w.infant}`).then(
        ([r]) => Number(r?.c || 0)
      )
    );
  }
  const parts = await Promise.all(jobs);
  return parts.reduce((a, b) => a + b, 0);
}

/** Latest province for a page of rows only (max ~26 ids per program). */
async function enrichListProvinces(siteCode, rows) {
  if (!rows?.length) return rows;

  const byProgram = { adult: [], child: [] };
  rows.forEach((r) => {
    if (r.program === 'adult') byProgram.adult.push(escapeSqlLiteral(String(r.clinicId)));
    if (r.program === 'child') byProgram.child.push(escapeSqlLiteral(String(r.clinicId)));
  });

  const provinceMap = new Map();

  if (byProgram.adult.length) {
    const inList = byProgram.adult.map((id) => `'${id}'`).join(',');
    const demoRows = await selectSite(
      siteCode,
      `SELECT CAST(u.ClinicID AS CHAR) AS clinicId, u.Province
       FROM tblaumain u
       INNER JOIN (
         SELECT ClinicID, site_code, MAX(Daupdate) AS maxDa
         FROM tblaumain
         WHERE CAST(ClinicID AS CHAR) IN (${inList})
         GROUP BY ClinicID, site_code
       ) latest
         ON latest.ClinicID = u.ClinicID
        AND latest.site_code = u.site_code
        AND latest.maxDa = u.Daupdate`
    );
    demoRows.forEach((d) => {
      if (d.Province) provinceMap.set(`adult:${d.clinicId}`, String(d.Province).trim());
    });
  }

  if (byProgram.child.length) {
    const inList = byProgram.child.map((id) => `'${id}'`).join(',');
    const demoRows = await selectSite(
      siteCode,
      `SELECT CAST(u.ClinicID AS CHAR) AS clinicId, u.Province
       FROM tblcumain u
       INNER JOIN (
         SELECT ClinicID, site_code, MAX(Daupdate) AS maxDa
         FROM tblcumain
         WHERE CAST(ClinicID AS CHAR) IN (${inList})
         GROUP BY ClinicID, site_code
       ) latest
         ON latest.ClinicID = u.ClinicID
        AND latest.site_code = u.site_code
        AND latest.maxDa = u.Daupdate`
    );
    demoRows.forEach((d) => {
      if (d.Province) provinceMap.set(`child:${d.clinicId}`, String(d.Province).trim());
    });
  }

  return rows.map((r) => {
    if (r.Province) return r;
    const p = provinceMap.get(`${r.program}:${String(r.clinicId)}`);
    return p ? { ...r, Province: p } : r;
  });
}

function formatListPatient(row) {
  const natRaw = row.Nationality;
  const nationalityLabel =
    natRaw != null && natRaw !== '' && Number(natRaw) !== -1
      ? decodeNationalityLabel(natRaw) ||
        decodeValue('Nationality', natRaw) ||
        null
      : null;
  const statusRaw = row.patientStatus;
  const statusLabel =
    statusRaw != null && statusRaw !== '' && Number(statusRaw) !== -1
      ? decodeValue('Status', statusRaw) || null
      : null;
  return {
    clinicId: String(row.clinicId ?? '').trim(),
    program: row.program,
    programLabel: PROGRAM_TYPE_KH[row.program] || row.program,
    firstVisit: row.firstVisit,
    dateOfBirth: row.dateOfBirth,
    sex: row.Sex,
    sexLabel: formatSex(row.Sex),
    artNumber: row.artNumber,
    daArt: row.daArt,
    province: row.Province ? String(row.Province).trim() || null : null,
    nationality: natRaw,
    nationalityLabel,
    patientStatus: statusRaw,
    patientStatusLabel: statusLabel,
    patientStatusDate: row.patientStatusDa || null
  };
}

/**
 * Paginated registry from tblaimain / tblcimain / tbleimain (read-only).
 */
async function listPatients(siteCode, options = {}) {
  const site = validateSiteCode(siteCode);
  const page = Math.max(1, Number(options.page) || 1);
  const limit = Math.min(LIST_PAGE_MAX, Math.max(1, Number(options.limit) || LIST_PAGE_DEFAULT));
  const offset = (page - 1) * limit;
  const program = options.program ? String(options.program).toLowerCase() : '';
  if (program && !['adult', 'child', 'infant'].includes(program)) {
    const err = new Error('program must be adult, child, infant, or omitted');
    err.statusCode = 400;
    throw err;
  }

  const listFilters = {
    sex: options.sex,
    province: options.province,
    patientStatus: options.patientStatus
  };
  const unionLite = buildListUnionSql(program || null, options.q, { lite: true, filters: listFilters });
  if (!unionLite) {
    return {
      siteCode: site,
      patients: [],
      pagination: {
        page,
        limit,
        totalCount: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
        countPending: false
      }
    };
  }

  const wantTotal =
    options.includeTotal === true ||
    options.includeTotal === '1' ||
    LIST_COUNT_DEFAULT;

  const fetchLimit = wantTotal ? limit : limit + 1;
  const orderBy = buildListOrderBy(options.sortBy, options.sortDir);
  const dataSql = `SELECT program, clinicId, firstVisit, dateOfBirth, Sex, artNumber, daArt, Province, Nationality,
            patientStatus, patientStatusDa
     FROM (${unionLite}) AS patient_union
     ORDER BY ${orderBy}
     LIMIT ${fetchLimit} OFFSET ${offset}`;

  let rows;
  let totalCount = null;
  let totalPages = null;
  let hasNext = false;

  if (wantTotal) {
    const [rawRows, total] = await Promise.all([
      selectSite(site, dataSql),
      countListPatientsFast(site, program || null, options.q, listFilters)
    ]);
    rows = rawRows;
    totalCount = total;
    totalPages = totalCount ? Math.ceil(totalCount / limit) : 0;
    hasNext = page < totalPages;
  } else {
    const rawRows = await selectSite(site, dataSql);
    hasNext = rawRows.length > limit;
    rows = hasNext ? rawRows.slice(0, limit) : rawRows;
  }

  const withProvince = await enrichListProvinces(site, rows);

  return {
    siteCode: site,
    patients: withProvince.map(formatListPatient),
    pagination: {
      page,
      limit,
      totalCount,
      totalPages,
      hasNext,
      hasPrev: page > 1,
      countSkipped: !wantTotal
    }
  };
}

async function searchPatients(siteCode, query, limit = 20) {
  const q = escapeSqlLiteral(String(query || '').trim());
  if (q.length < 2) return [];

  const lim = Math.max(1, Math.min(50, Number(limit) || 20));
  const rows = [];

  if (/^\d+$/.test(q)) {
    const adult = await selectSite(
      siteCode,
      `SELECT CAST(ClinicID AS CHAR) AS clinicId, 'adult' AS program, Artnum AS art, DafirstVisit AS firstVisit, Sex
       FROM tblaimain WHERE CAST(ClinicID AS CHAR) LIKE '${q}%'
       ORDER BY ClinicID LIMIT ${lim}`
    );
    rows.push(...adult);
    const pntt = await selectSite(
      siteCode,
      `SELECT CAST(ClinicID AS CHAR) AS clinicId, 'pntt' AS program, NULL AS art, DaVisit AS firstVisit, NULL AS Sex
       FROM tblapntt WHERE CAST(ClinicID AS CHAR) LIKE '${q}%'
       ORDER BY ClinicID LIMIT ${lim}`
    );
    rows.push(...pntt);
  }

  const adultArt = await selectSite(
    siteCode,
    `SELECT CAST(ClinicID AS CHAR) AS clinicId, 'adult' AS program, Artnum AS art, DafirstVisit AS firstVisit, Sex
     FROM tblaimain WHERE Artnum LIKE '%${q}%'
     ORDER BY ClinicID LIMIT ${lim}`
  );
  rows.push(...adultArt);

  const child = await selectSite(
    siteCode,
    `SELECT ClinicID AS clinicId, 'child' AS program, Artnum AS art, DaFirstVisit AS firstVisit, Sex
     FROM tblcimain WHERE ClinicID LIKE '${q}%' OR Artnum LIKE '%${q}%'
     ORDER BY ClinicID LIMIT ${lim}`
  );
  rows.push(...child);

  const infant = await selectSite(
    siteCode,
    `SELECT ClinicID AS clinicId, 'infant' AS program, MArt AS art, DafirstVisit AS firstVisit, Sex
     FROM tbleimain WHERE ClinicID LIKE '${q}%' OR MArt LIKE '%${q}%'
     ORDER BY ClinicID LIMIT ${lim}`
  );
  rows.push(...infant);

  const seen = new Set();
  return rows
    .filter((r) => {
      const key = `${r.program}:${r.clinicId}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, lim)
    .map((r) => ({
      clinicId: String(r.clinicId),
      program: r.program,
      programLabel: PROGRAM_TYPE_KH[r.program] || r.program,
      art: r.art,
      firstVisit: r.firstVisit,
      sexLabel: formatSex(r.Sex)
    }));
}

function resolveTabParts(tab, mode, { programs = [] } = {}) {
  if (mode === 'full' || tab === 'full') return 'all';
  const key = tab && TAB_PARTS[tab] ? tab : 'summary';
  let parts = [...(TAB_PARTS[key] || TAB_PARTS.summary)];
  if (tab === 'care' && programs.includes('pntt')) {
    parts = [...parts, ...(TAB_PARTS.carePntt || [])];
  }
  return parts;
}

async function loadProgramBlock(site, clinic, program, parts, opts = {}) {
  if (program === 'adult') return loadAdult(site, clinic, parts, opts);
  if (program === 'child') return loadChild(site, clinic, parts, opts);
  if (program === 'infant') return loadInfant(site, clinic, parts, opts);
  return null;
}

async function loadCounts(site, clinic, programs) {
  const counts = {};
  await Promise.all(
    programs.map(async (p) => {
      if (p === 'adult') counts.adult = await countAdultTabBadges(site, clinic);
      else if (p === 'child') counts.child = await countChildTabBadges(site, clinic);
      else if (p === 'infant') counts.infant = await countInfantTabBadges(site, clinic);
      else counts[p] = {};
    })
  );
  return counts;
}

async function loadPnttPartnersOnly(siteCode, clinicId) {
  const cid = Number(clinicId);
  if (!Number.isFinite(cid)) return [];
  return selectSite(
    siteCode,
    `SELECT AsID, NumPart, Age, Sex, RePatient, StatusHIV, Result, RegTreat, ClinicID, ArtNumber, PatientDate
     FROM tblapnttpart WHERE ClinicID = ${cid} ORDER BY NumPart LIMIT 25`
  );
}

async function attachPntt(site, clinic, sections, programs, parts, peek) {
  const partList = Array.isArray(parts) ? parts : null;
  const wantPntt = !parts || parts === 'all' || partList?.includes('pntt');
  const wantPartners = partList?.includes('pnttPartners');
  const wantChildren = partList?.includes('pnttChildren');
  if (!wantPntt && !wantPartners && !wantChildren) return sections;

  const apply = (slice) => {
    const target = sections.adult || sections.child || null;
    if (target) {
      Object.entries(slice).forEach(([k, v]) => {
        if (v !== undefined) target[k] = v;
      });
    } else {
      sections.pntt = { ...(sections.pntt || {}), ...slice };
    }
    if (programs.includes('pntt') && !sections.pntt && target) {
      if (slice.pntt) sections.pntt = { pntt: slice.pntt };
      if (slice.pnttPartners) sections.pntt = { ...(sections.pntt || {}), pnttPartners: slice.pnttPartners };
      if (slice.pnttChildren) sections.pntt = { ...(sections.pntt || {}), pnttChildren: slice.pnttChildren };
    }
  };

  if (wantPntt) {
    const pnttRows = await loadPnttRows(site, clinic);
    if (!pnttRows.length && !wantPartners && !wantChildren) return sections;
    const lim = peek ? PEEK_LIMIT : LIMITS.pntt;
    const pnttSlice = pnttRows.slice(0, lim);
    const pnttExtras = await loadPnttExtras(site, clinic, pnttSlice);
    apply(sliceBlockForParts({ pntt: pnttSlice, ...pnttExtras }, parts));
    return sections;
  }

  const slice = {};
  if (wantPartners) slice.pnttPartners = await loadPnttPartnersOnly(site, clinic);
  if (wantChildren) {
    const pnttRows = await loadPnttRows(site, clinic);
    if (pnttRows.length) {
      const extras = await loadPnttExtras(site, clinic, pnttRows.slice(0, 5));
      slice.pnttChildren = extras.pnttChildren || [];
    }
  }
  if (Object.keys(slice).length) apply(sliceBlockForParts(slice, parts));
  return sections;
}

function buildProfilePayload({
  site,
  clinic,
  programs,
  enrichedSections,
  countsByProgram,
  tab,
  partial,
  program
}) {
  const primary =
    enrichedSections.adult?.registration ||
    enrichedSections.child?.registration ||
    enrichedSections.infant?.registration;

  const timeline =
    tab === 'timeline' || tab === 'full'
      ? buildTimeline(enrichedSections)
      : [];

  const clinical = buildClinicalSummary(enrichedSections);

  const latestDemo =
    enrichedSections.adult?.demographics?.[0] ||
    enrichedSections.child?.demographics?.[0];
  const province =
    (latestDemo?.Province && String(latestDemo.Province).trim()) ||
    (primary?.Province && String(primary.Province).trim()) ||
    null;
  const nationalityLabel =
    primary?.Nationality_label ||
    decodeNationalityLabel(primary?.Nationality) ||
    decodeValue('Nationality', primary?.Nationality) ||
    null;

  return {
    readOnly: true,
    locale: 'kh',
    siteCode: site,
    clinicId: clinic,
    programs,
    loadMode: tab || 'summary',
    partial: partial === true,
    program: program || null,
    summary: {
      clinicId: clinic,
      patientType:
        primary?.patientType ||
        programs.map((p) => PROGRAM_TYPE_KH[p] || p).join(', '),
      sex: primary?.sexLabel || null,
      dateOfBirth: primary?.DaBirth || null,
      firstVisit: primary?.DafirstVisit || primary?.DaFirstVisit || null,
      artNumber:
        primary?.Artnum || primary?.MArt || enrichedSections.adult?.art?.[0]?.ART || null,
      linkedClinicId: primary?.LClinicID || primary?.MClinicID || null,
      tpt: primary?.TPT_label || (primary?.TPT != null ? String(primary.TPT) : null),
      daArt: primary?.DaART || primary?.DaArt || null,
      referred: primary?.Referred_label || null,
      allergy: primary?.Allergy_label || null,
      province,
      nationality: nationalityLabel
    },
    clinical,
    sections: enrichedSections,
    timeline,
    timelineAll: timeline,
    countsByProgram,
    limits: { ...LIMITS, peek: PEEK_LIMIT }
  };
}

/**
 * @param {object} options
 * @param {string} [options.tab] summary | visits | labs | drugs | history | care | status | timeline | full
 * @param {string} [options.program] adult | child | infant — required for tab loads (except summary/full)
 * @param {string} [options.mode] alias of tab
 */
async function getPatient360(siteCode, clinicId, options = {}) {
  const site = validateSiteCode(siteCode);
  const clinic = validateClinicId(clinicId);
  const tab = String(options.tab || options.mode || 'summary').toLowerCase();
  const programFilter = options.program ? String(options.program).toLowerCase() : null;
  const knownPrograms = parseKnownPrograms(options.programs || options.knownPrograms);
  const isPartial = tab !== 'summary' && tab !== 'overview' && tab !== 'full';

  let programs = knownPrograms;
  if (!programs?.length || (isPartial && programFilter && !programs.includes(programFilter))) {
    programs = await detectPrograms(site, clinic);
  }
  if (!programs.length) {
    const err = new Error(`No patient found for Clinic ID ${clinic} at site ${site}`);
    err.statusCode = 404;
    throw err;
  }

  const parts = resolveTabParts(tab, tab, { programs });
  const peek = tab === 'summary' || tab === 'overview';
  const loadOpts = { peek, timelineTab: tab === 'timeline' };

  if (isPartial && (!programFilter || !programs.includes(programFilter))) {
    const err = new Error('program is required when loading a tab (e.g. program=adult)');
    err.statusCode = 400;
    throw err;
  }

  const targetPrograms = isPartial
    ? [programFilter]
    : programs.filter((p) => p !== 'pntt');

  const sections = {};
  await Promise.all(
    targetPrograms.map(async (program) => {
      if (program === 'pntt') return;
      const block = await loadProgramBlock(site, clinic, program, parts, loadOpts);
      if (!block) return;
      const slice = isPartial ? sliceBlockForParts(block, parts) : block;
      sections[program] = isPartial
        ? { ...(sections[program] || {}), ...slice }
        : slice;
    })
  );

  await attachPntt(site, clinic, sections, programs, parts, peek);

  const reasonByRid = await getReasonMapForSite(site);
  const enrichedSections = Object.fromEntries(
    Object.entries(sections).map(([program, block]) => [
      program,
      enrichBlock(block, program, { reasonByRid })
    ])
  );

  const countsByProgram = await loadCounts(
    site,
    clinic,
    programs.filter((p) => p !== 'pntt')
  );

  return buildProfilePayload({
    site,
    clinic,
    programs,
    enrichedSections,
    countsByProgram,
    tab,
    partial: isPartial,
    program: programFilter
  });
}

module.exports = {
  getPatient360,
  listPatients,
  searchPatients,
  validateSiteCode,
  validateClinicId,
  LIMITS,
  PEEK_LIMIT,
  TAB_PARTS,
  LIST_PAGE_DEFAULT
};
