const { labelKhForPnttScript } = require('../constants/pnttIndicatorLabels');
const indicatorsService = require('./indicatorsService');
const infantReportService = require('./infantReportService');
const { SECTION_DEFS: INFANT_SECTION_DEFS } = require('./infantReportService');
const pnttReportService = require('./pnttReportService');
const { runPool } = require('../utils/asyncPool');
const { resolveFacilityCodesByHierarchy } = require('../utils/reportAggregation');

const VISUALIZE_CONCURRENCY = Number(process.env.VISUALIZE_CONCURRENCY || 2);
/** 0 = no cap on periods per run */
const VISUALIZE_MAX_PERIODS = Number(process.env.VISUALIZE_MAX_PERIODS || 0);
const VISUALIZE_MAX_INDICATORS = Number(process.env.VISUALIZE_MAX_INDICATORS || 0);
const VISUALIZE_MAX_RUNS = Number(process.env.VISUALIZE_MAX_RUNS || 0);
const VISUALIZE_MAX_COMPARE_FACILITIES = Number(process.env.VISUALIZE_MAX_COMPARE_FACILITIES || 8);
const VISUALIZE_MAX_ROLLUP_FACILITIES = Number(process.env.VISUALIZE_MAX_ROLLUP_FACILITIES || 80);

const PROGRAM = {
  ART: 'adult-child',
  INFANT: 'infant',
  PNTT: 'pntt'
};

const indicatorRegistry = new Map();

function parseIndicatorId(indicatorId) {
  const id = String(indicatorId || '').trim();
  if (id.startsWith('infant:')) return { program: PROGRAM.INFANT, key: id.slice(7) };
  if (id.startsWith('pntt:')) return { program: PROGRAM.PNTT, key: id.slice(5) };
  return { program: PROGRAM.ART, key: id };
}

function chapterFromIndicatorId(id) {
  const { key, program } = parseIndicatorId(id);
  if (program === PROGRAM.INFANT || program === PROGRAM.PNTT) {
    const def = indicatorRegistry.get(id);
    return def?.chapter || 'other';
  }
  const m = String(key).match(/^(\d+(?:\.\d+)?)/);
  return m ? m[1] : 'other';
}

function buildIndicatorRegistry() {
  indicatorRegistry.clear();
  for (const id of indicatorsService.queries.keys()) {
    indicatorRegistry.set(id, { program: PROGRAM.ART, key: id });
  }
  for (const def of INFANT_SECTION_DEFS) {
    const id = `infant:${def.scriptId}`;
    indicatorRegistry.set(id, { program: PROGRAM.INFANT, key: def.scriptId, def });
  }
  for (const def of pnttReportService.sectionDefs || []) {
    const id = `pntt:${def.scriptId}`;
    indicatorRegistry.set(id, { program: PROGRAM.PNTT, key: def.scriptId, def });
  }
}

buildIndicatorRegistry();

function normalizePeriod(period) {
  const startDate = String(period?.startDate || '').trim();
  const endDate = String(period?.endDate || '').trim();
  const previousEndDate = String(period?.previousEndDate || '').trim();
  const key = String(period?.key || period?.label || `${startDate}_${endDate}`).trim();
  if (!startDate || !endDate || !previousEndDate) {
    const err = new Error('Each period needs startDate, endDate, and previousEndDate');
    err.statusCode = 400;
    throw err;
  }
  return { key, label: String(period?.label || key).trim() || key, startDate, endDate, previousEndDate };
}

function queryParamsFromPeriod(period) {
  return {
    StartDate: period.startDate,
    EndDate: period.endDate,
    PreviousEndDate: period.previousEndDate,
    dead_code: 1,
    lost_code: 0,
    transfer_in_code: 1,
    transfer_out_code: 3,
    mmd_eligible_code: 0,
    mmd_drug_quantity: 60,
    vl_suppression_threshold: 1000,
    tld_regimen_formula: '3TC + DTG + TDF',
    tpt_drug_list: "'Isoniazid','3HP','6H'",
    ReengageDays: 28,
    GraceDays: 14
  };
}

function reportParamsFromPeriod(period) {
  return {
    startDate: period.startDate,
    endDate: period.endDate,
    previousEndDate: period.previousEndDate
  };
}

function pickTotal(row) {
  if (!row || typeof row !== 'object') return 0;
  if (row.TOTAL != null && row.TOTAL !== '') return Number(row.TOTAL) || 0;
  if (row.total != null && row.total !== '') return Number(row.total) || 0;
  const nums = Object.values(row).filter((v) => typeof v === 'number' || (typeof v === 'string' && /^\d+$/.test(v)));
  return nums.length ? Number(nums[0]) || 0 : 0;
}

function pickTotalFromReportRows(rows = []) {
  const list = Array.isArray(rows) ? rows : [];
  const sub = list.find((r) => r.isSubtotal);
  if (sub) return Number(sub.total) || 0;
  return list.reduce((sum, r) => sum + (Number(r.total) || 0), 0);
}

function extractDemographicsFromReportRows(rows = []) {
  const list = Array.isArray(rows) ? rows.filter((r) => !r.isSubtotal && !r.error) : [];
  const male = list.reduce((s, r) => s + (Number(r.male) || 0), 0);
  const female = list.reduce((s, r) => s + (Number(r.female) || 0), 0);
  const hasBreakdown = male + female > 0;
  return {
    hasBreakdown,
    male014: male,
    female014: female,
    maleOver14: 0,
    femaleOver14: 0,
    maleTotal: male,
    femaleTotal: female,
    age014: male + female,
    age15plus: 0
  };
}

/** Indicator SQL uses Male_0_14, Female_0_14, Male_over_14, Female_over_14 (see Report Home). */
function numField(row, ...names) {
  if (!row || typeof row !== 'object') return null;
  for (const name of names) {
    if (row[name] != null && row[name] !== '') {
      const n = Number(row[name]);
      return Number.isFinite(n) ? n : 0;
    }
  }
  const byLower = new Map(Object.entries(row).map(([k, v]) => [String(k).toLowerCase(), v]));
  for (const name of names) {
    const v = byLower.get(String(name).toLowerCase());
    if (v != null && v !== '') {
      const n = Number(v);
      return Number.isFinite(n) ? n : 0;
    }
  }
  return null;
}

function extractDemographics(row) {
  const male014 = numField(row, 'Male_0_14') ?? 0;
  const female014 = numField(row, 'Female_0_14') ?? 0;
  const maleOver14 = numField(row, 'Male_over_14') ?? 0;
  const femaleOver14 = numField(row, 'Female_over_14') ?? 0;
  const hasBreakdown = Object.keys(row || {}).some((k) =>
    /^(Male_0_14|Female_0_14|Male_over_14|Female_over_14)$/i.test(k)
  );
  return {
    hasBreakdown,
    male014,
    female014,
    maleOver14,
    femaleOver14,
    maleTotal: male014 + maleOver14,
    femaleTotal: female014 + femaleOver14,
    age014: male014 + female014,
    age15plus: maleOver14 + femaleOver14
  };
}

function infantLabel(def) {
  const kh = String(def.sectionLabelKh || '').trim();
  const en = String(def.sectionLabelEn || '').trim();
  if (kh) return `${def.sectionNumber}. ${kh}`;
  return `${def.sectionNumber}. ${en || def.scriptId}`;
}

function pnttLabel(def) {
  const fromMap = labelKhForPnttScript(def.scriptId);
  if (fromMap) return fromMap;
  const kh = String(def.sectionLabelKh || '').trim();
  const en = String(def.sectionLabelEn || '').trim();
  if (kh) return `${def.sectionNumber}. ${kh}`;
  if (en) return `${def.sectionNumber}. ${en}`;
  return `${def.sectionNumber}. ${String(def.scriptId).replace(/_aggregate$/, '').replace(/_/g, ' ')}`;
}

function getCatalog() {
  const out = [];
  for (const id of Array.from(indicatorsService.queries.keys()).sort()) {
    out.push({
      id,
      program: PROGRAM.ART,
      chapter: chapterFromIndicatorId(id),
      hasDetails: indicatorsService.detailQueries.has(id),
      detailScriptId: indicatorsService.detailQueries.has(id) ? id : null,
      label: null
    });
  }
  for (const def of INFANT_SECTION_DEFS) {
    const id = `infant:${def.scriptId}`;
    out.push({
      id,
      program: PROGRAM.INFANT,
      chapter: String(def.sectionNumber),
      hasDetails: Boolean(def.detailScriptId || def.detailScriptIds?.length),
      detailScriptId: def.detailScriptId || def.detailScriptIds?.[0] || null,
      label: infantLabel(def)
    });
  }
  for (const def of pnttReportService.sectionDefs || []) {
    const id = `pntt:${def.scriptId}`;
    out.push({
      id,
      program: PROGRAM.PNTT,
      chapter: String(def.sectionNumber),
      hasDetails: Boolean(def.detailScriptId),
      detailScriptId: def.detailScriptId || null,
      label: pnttLabel(def)
    });
  }
  return out;
}

function sumRunPayloads(payloads = []) {
  const list = payloads.filter(Boolean);
  if (!list.length) return null;
  let total = 0;
  let male014 = 0;
  let female014 = 0;
  let maleOver14 = 0;
  let femaleOver14 = 0;
  let hasBreakdown = false;
  let queryMs = 0;
  for (const p of list) {
    total += Number(p.total) || 0;
    if (p.hasBreakdown) {
      hasBreakdown = true;
      male014 += Number(p.male014) || 0;
      female014 += Number(p.female014) || 0;
      maleOver14 += Number(p.maleOver14) || 0;
      femaleOver14 += Number(p.femaleOver14) || 0;
    }
    queryMs += Number(p.queryMs) || 0;
  }
  const maleTotal = male014 + maleOver14;
  const femaleTotal = female014 + femaleOver14;
  return {
    indicator: list[0].indicator,
    total,
    hasBreakdown,
    male014,
    female014,
    maleOver14,
    femaleOver14,
    male: maleTotal,
    female: femaleTotal,
    age014: male014 + female014,
    age15plus: maleOver14 + femaleOver14,
    queryMs: queryMs || null
  };
}

function buildScopeMeta(ctx, sites = []) {
  const scopeMode = ctx.scopeMode === 'compare' ? 'compare' : 'rollup';
  const siteLevel = String(ctx.siteLevel || 'facility').toLowerCase();
  const siteCode = String(ctx.siteCode || '').trim();
  let scopeLabel = siteCode;
  if (siteLevel === 'country') scopeLabel = 'Cambodia';
  else if (siteLevel === 'province') {
    const site = (sites || []).find((s) => String(s.code) === siteCode);
    scopeLabel = site?.province || site?.name || siteCode;
  } else if (scopeMode === 'compare') {
    scopeLabel = `${ctx.compareSiteCodes?.length || 0} facilities`;
  } else {
    const site = (sites || []).find((s) => String(s.code) === siteCode);
    scopeLabel = site ? `${site.code} - ${site.name}` : siteCode;
  }
  return {
    scopeMode,
    siteLevel,
    siteCode,
    scopeLabel,
    aggregated: scopeMode === 'rollup' && (siteLevel === 'province' || siteLevel === 'country'),
    compareSiteCodes: scopeMode === 'compare' ? ctx.compareSiteCodes || [] : []
  };
}

function resolveExecutionScope(ctx) {
  const sites = ctx.sites || [];
  const scopeMode = ctx.scopeMode === 'compare' ? 'compare' : 'rollup';
  const siteLevel = String(ctx.siteLevel || 'facility').toLowerCase();
  const siteCode = String(ctx.siteCode || '').trim();

  if (scopeMode === 'compare') {
    const facilityCodes = [...new Set((ctx.compareSiteCodes || []).map(String).filter(Boolean))];
    return {
      scopeMode: 'compare',
      siteLevel: 'facility',
      siteCode,
      facilityCodes,
      useAll: false,
      facilityMultiplier: facilityCodes.length
    };
  }

  if (siteLevel === 'country') {
    return {
      scopeMode: 'rollup',
      siteLevel,
      siteCode,
      facilityCodes: [],
      useAll: true,
      facilityMultiplier: 1
    };
  }

  if (siteLevel === 'facility') {
    return {
      scopeMode: 'rollup',
      siteLevel,
      siteCode,
      facilityCodes: [siteCode],
      useAll: false,
      facilityMultiplier: 1
    };
  }

  const facilityCodes =
    ctx.resolvedSiteCodes?.length > 0
      ? ctx.resolvedSiteCodes
      : resolveFacilityCodesByHierarchy(sites, siteCode, siteLevel);

  return {
    scopeMode: 'rollup',
    siteLevel,
    siteCode,
    facilityCodes,
    useAll: false,
    facilityMultiplier: Math.max(1, facilityCodes.length)
  };
}

function facilityLabelFor(sites, code) {
  const site = (sites || []).find((s) => String(s.code) === String(code));
  return site ? `${site.code} - ${site.name}` : String(code);
}

function validateRunInput({ siteCode, periods, indicatorIds, facilityMultiplier = 1 }) {
  const site = String(siteCode || '').trim();
  if (!site) {
    const err = new Error('siteCode is required');
    err.statusCode = 400;
    throw err;
  }
  const periodList = (Array.isArray(periods) ? periods : []).map(normalizePeriod);
  const idList = [...new Set((Array.isArray(indicatorIds) ? indicatorIds : []).map(String).filter(Boolean))];
  if (!periodList.length) {
    const err = new Error('Select at least one period');
    err.statusCode = 400;
    throw err;
  }
  if (!idList.length) {
    const err = new Error('Select at least one indicator');
    err.statusCode = 400;
    throw err;
  }
  if (VISUALIZE_MAX_PERIODS > 0 && periodList.length > VISUALIZE_MAX_PERIODS) {
    const err = new Error(`Maximum ${VISUALIZE_MAX_PERIODS} periods per run`);
    err.statusCode = 400;
    throw err;
  }
  if (VISUALIZE_MAX_INDICATORS > 0 && idList.length > VISUALIZE_MAX_INDICATORS) {
    const err = new Error(`Maximum ${VISUALIZE_MAX_INDICATORS} indicators per run`);
    err.statusCode = 400;
    throw err;
  }
  const mult = Math.max(1, Number(facilityMultiplier) || 1);
  const totalRuns = periodList.length * idList.length * mult;
  if (VISUALIZE_MAX_RUNS > 0 && totalRuns > VISUALIZE_MAX_RUNS) {
    const err = new Error(`Too many runs (${totalRuns}). Max ${VISUALIZE_MAX_RUNS} (periods × indicators × sites).`);
    err.statusCode = 400;
    throw err;
  }
  for (const id of idList) {
    if (!indicatorRegistry.has(id)) {
      const err = new Error(`Unknown indicator: ${id}`);
      err.statusCode = 400;
      throw err;
    }
  }
  return { siteCode: site, periods: periodList, indicatorIds: idList, totalRuns };
}

async function runArt(siteCode, indicatorId, period) {
  const params = queryParamsFromPeriod(period);
  const row = await indicatorsService.executeOne(siteCode, indicatorId, params);
  const demo = extractDemographics(row);
  return {
    indicator: row?.Indicator || indicatorId,
    total: pickTotal(row),
    hasBreakdown: demo.hasBreakdown,
    male014: demo.male014,
    female014: demo.female014,
    maleOver14: demo.maleOver14,
    femaleOver14: demo.femaleOver14,
    male: demo.maleTotal,
    female: demo.femaleTotal,
    age014: demo.age014,
    age15plus: demo.age15plus,
    queryMs: row?.queryMs ?? null,
    raw: row
  };
}

async function runInfant(siteCode, indicatorId, period) {
  const { key } = parseIndicatorId(indicatorId);
  const def = INFANT_SECTION_DEFS.find((d) => d.scriptId === key);
  if (!def) throw new Error(`Infant indicator not found: ${key}`);
  const section = await infantReportService.buildSection(siteCode, reportParamsFromPeriod(period), def);
  const rows = section.rows || [];
  const errRow = rows.find((r) => r.error);
  if (errRow) throw new Error(errRow.error);
  const demo = extractDemographicsFromReportRows(rows);
  return {
    indicator: infantLabel(def),
    total: pickTotalFromReportRows(rows),
    hasBreakdown: demo.hasBreakdown,
    male014: demo.male014,
    female014: demo.female014,
    maleOver14: demo.maleOver14,
    femaleOver14: demo.femaleOver14,
    male: demo.maleTotal,
    female: demo.femaleTotal,
    age014: demo.age014,
    age15plus: demo.age15plus,
    queryMs: null,
    raw: rows
  };
}

async function runPntt(siteCode, indicatorId, period) {
  const { key } = parseIndicatorId(indicatorId);
  const def = (pnttReportService.sectionDefs || []).find((d) => d.scriptId === key);
  if (!def) throw new Error(`PNTT indicator not found: ${key}`);
  const section = await pnttReportService.buildSection(siteCode, reportParamsFromPeriod(period), def);
  const rows = section.rows || [];
  const errRow = rows.find((r) => r.error);
  if (errRow) throw new Error(errRow.error);
  const demo = extractDemographicsFromReportRows(rows);
  return {
    indicator: pnttLabel(def),
    total: pickTotalFromReportRows(rows),
    hasBreakdown: demo.hasBreakdown,
    male014: demo.male014,
    female014: demo.female014,
    maleOver14: demo.maleOver14,
    femaleOver14: demo.femaleOver14,
    male: demo.maleTotal,
    female: demo.femaleTotal,
    age014: demo.age014,
    age15plus: demo.age15plus,
    queryMs: null,
    raw: rows
  };
}

async function runOne(siteCode, indicatorId, period) {
  const { program } = parseIndicatorId(indicatorId);
  const startedAt = Date.now();
  const dbSite = siteCode === 'country' ? 'all' : siteCode;
  let payload;
  if (program === PROGRAM.INFANT) {
    payload = await runInfant(dbSite, indicatorId, period);
  } else if (program === PROGRAM.PNTT) {
    payload = await runPntt(dbSite, indicatorId, period);
  } else {
    payload = await runArt(dbSite, indicatorId, period);
  }
  return {
    periodKey: period.key,
    periodLabel: period.label,
    startDate: period.startDate,
    endDate: period.endDate,
    previousEndDate: period.previousEndDate,
    indicatorId,
    program,
    ...payload,
    queryMs: payload.queryMs ?? Date.now() - startedAt
  };
}

function errorResult(period, indicatorId, message, extra = {}) {
  return {
    periodKey: period.key,
    periodLabel: period.label,
    indicatorId,
    indicator: indicatorId,
    total: 0,
    error: message || 'Failed',
    ...extra
  };
}

async function runOneScoped(exec, period, indicatorId, meta) {
  try {
    const data = await exec();
    return { ok: true, data: { ...data, ...meta } };
  } catch (error) {
    return { ok: false, data: errorResult(period, indicatorId, error?.message || 'Failed', meta) };
  }
}

async function runAggregatedRollup(facilityCodes, indicatorId, period, useAll) {
  if (useAll) {
    return runOne('country', indicatorId, period);
  }
  if (!facilityCodes.length) {
    throw new Error('No facilities found for this scope');
  }
  if (facilityCodes.length === 1) {
    return runOne(facilityCodes[0], indicatorId, period);
  }
  const parts = await runPool(facilityCodes, VISUALIZE_CONCURRENCY, async (fc) => {
    try {
      return { ok: true, data: await runOne(fc, indicatorId, period) };
    } catch (error) {
      return { ok: false, error: error?.message || 'Failed' };
    }
  });
  const okParts = parts.filter((p) => p.ok).map((p) => p.data);
  if (!okParts.length) {
    throw new Error(parts[0]?.error || 'All facilities failed');
  }
  const merged = sumRunPayloads(okParts);
  return {
    periodKey: period.key,
    periodLabel: period.label,
    startDate: period.startDate,
    endDate: period.endDate,
    previousEndDate: period.previousEndDate,
    indicatorId,
    program: parseIndicatorId(indicatorId).program,
    ...merged,
    facilityCount: facilityCodes.length
  };
}

function buildTasks(execScope, periods, indicatorIds) {
  const tasks = [];
  if (execScope.scopeMode === 'compare') {
    for (const facilityCode of execScope.facilityCodes) {
      for (const period of periods) {
        for (const indicatorId of indicatorIds) {
          tasks.push({ kind: 'compare', facilityCode, period, indicatorId });
        }
      }
    }
    return tasks;
  }
  for (const period of periods) {
    for (const indicatorId of indicatorIds) {
      tasks.push({
        kind: 'rollup',
        period,
        indicatorId,
        facilityCodes: execScope.facilityCodes,
        useAll: execScope.useAll
      });
    }
  }
  return tasks;
}

async function executeTask(task, execScope, sites, scopeMeta) {
  const baseMeta = {
    scopeMode: scopeMeta.scopeMode,
    siteLevel: scopeMeta.siteLevel,
    scopeLabel: scopeMeta.scopeLabel,
    aggregated: scopeMeta.aggregated && task.kind === 'rollup'
  };

  if (task.kind === 'compare') {
    const facilityCode = task.facilityCode;
    const facilityLabel = facilityLabelFor(sites, facilityCode);
    return runOneScoped(
      () => runOne(facilityCode, task.indicatorId, task.period),
      task.period,
      task.indicatorId,
      { ...baseMeta, facilityCode, facilityLabel, aggregated: false }
    );
  }

  const data = await runAggregatedRollup(
    task.facilityCodes,
    task.indicatorId,
    task.period,
    task.useAll
  );
  return {
    ok: true,
    data: {
      ...data,
      ...baseMeta,
      facilityCode: null,
      facilityLabel: null
    }
  };
}

async function runBatch(ctx, input) {
  const execScope = resolveExecutionScope(ctx);
  const scopeMeta = buildScopeMeta(ctx, ctx.sites);
  const { periods, indicatorIds, totalRuns } = validateRunInput({
    ...input,
    siteCode: ctx.siteCode,
    facilityMultiplier: execScope.facilityMultiplier
  });
  const tasks = buildTasks(execScope, periods, indicatorIds);
  const startedAt = Date.now();
  const results = await runPool(tasks, VISUALIZE_CONCURRENCY, async (task) => {
    const out = await executeTask(task, execScope, ctx.sites, scopeMeta);
    if (out.ok) return out;
    return out;
  });

  return {
    success: true,
    readOnly: true,
    siteCode: ctx.siteCode,
    siteLevel: scopeMeta.siteLevel,
    scopeMode: scopeMeta.scopeMode,
    scopeLabel: scopeMeta.scopeLabel,
    aggregated: scopeMeta.aggregated,
    compareSiteCodes: scopeMeta.compareSiteCodes,
    periods: periods.map((p) => ({ key: p.key, label: p.label, startDate: p.startDate, endDate: p.endDate })),
    indicatorIds,
    results: results.map((r) => r.data),
    totalRuns,
    durationMs: Date.now() - startedAt
  };
}

async function runBatchStream(ctx, input, write) {
  const execScope = resolveExecutionScope(ctx);
  const scopeMeta = buildScopeMeta(ctx, ctx.sites);
  const { periods, indicatorIds, totalRuns } = validateRunInput({
    ...input,
    siteCode: ctx.siteCode,
    facilityMultiplier: execScope.facilityMultiplier
  });
  const tasks = buildTasks(execScope, periods, indicatorIds);

  const startedAt = Date.now();
  let completed = 0;
  write({
    type: 'start',
    total: totalRuns,
    scopeMode: scopeMeta.scopeMode,
    scopeLabel: scopeMeta.scopeLabel,
    timestamp: new Date().toISOString()
  });

  await runPool(tasks, VISUALIZE_CONCURRENCY, async (task) => {
    try {
      const out = await executeTask(task, execScope, ctx.sites, scopeMeta);
      completed += 1;
      write({ type: 'result', completed, total: totalRuns, data: out.data });
    } catch (error) {
      completed += 1;
      write({
        type: 'result',
        completed,
        total: totalRuns,
        data: errorResult(task.period, task.indicatorId, error?.message || 'Failed', {
          scopeMode: scopeMeta.scopeMode,
          scopeLabel: scopeMeta.scopeLabel,
          facilityCode: task.facilityCode || null,
          facilityLabel: task.facilityCode ? facilityLabelFor(ctx.sites, task.facilityCode) : null
        })
      });
    }
  });

  write({
    type: 'done',
    completed,
    total: totalRuns,
    durationMs: Date.now() - startedAt,
    timestamp: new Date().toISOString()
  });
}

module.exports = {
  getCatalog,
  validateRunInput,
  runBatch,
  runBatchStream,
  PROGRAM,
  VISUALIZE_MAX_PERIODS,
  VISUALIZE_MAX_INDICATORS,
  VISUALIZE_MAX_RUNS,
  VISUALIZE_MAX_COMPARE_FACILITIES,
  VISUALIZE_MAX_ROLLUP_FACILITIES
};
