const { siteDatabaseManager } = require('../config/siteDatabase');
const { INSIGHT_EVENTS } = require('../constants/insightEvents');
const {
  INSIGHT_PROGRAMS,
  POPULATION_FILTER,
  OUTCOME_STATUS_OPTIONS,
  LEGACY_EVENT_TO_PROGRAM
} = require('../constants/insightPrograms');
const {
  buildProgramInner,
  buildAggregateSql,
  labelForRow
} = require('./insightProgramSql');
const { loadSchemaCatalog, getTableById } = require('../utils/schemaCatalog');

function normalizePeriod(period) {
  const startDate = String(period?.startDate || '').trim();
  const endDate = String(period?.endDate || '').trim();
  const key = String(period?.key || period?.label || `${startDate}_${endDate}`).trim();
  if (!startDate || !endDate) {
    const err = new Error('Period requires startDate and endDate');
    err.statusCode = 400;
    throw err;
  }
  return { key, label: String(period?.label || key).trim() || key, startDate, endDate };
}

function resolveAnalysisRequest(body = {}) {
  let programId = String(body.programId || '').trim();
  let outcomeFilter = String(body.outcomeFilter || 'all').trim();
  const legacyEventId = String(body.eventId || '').trim();
  const tableId = String(body.tableId || '').trim();

  if (!programId && tableId) {
    const tbl = getTableById(tableId);
    if (tbl?.programId) programId = tbl.programId;
    else if (tbl && !tbl.analyzable) {
      const err = new Error(`Table "${tableId}" is in the catalog but analysis SQL is not configured yet`);
      err.statusCode = 400;
      throw err;
    }
  }

  if (!programId && legacyEventId) {
    if (legacyEventId === 'exit_dead') {
      programId = 'outcome';
      outcomeFilter = 'dead';
    } else if (legacyEventId === 'exit_ltfu') {
      programId = 'outcome';
      outcomeFilter = 'ltfu';
    } else if (legacyEventId === 'exit_transfer_out') {
      programId = 'outcome';
      outcomeFilter = 'transfer_out';
    } else {
      programId = LEGACY_EVENT_TO_PROGRAM[legacyEventId] || '';
    }
  }

  const programMeta = INSIGHT_PROGRAMS.find((p) => p.id === programId);
  if (!programMeta) {
    const err = new Error('Select a program (data domain)');
    err.statusCode = 400;
    throw err;
  }

  const allowedDimensionIds = programMeta.dimensions.map((d) => d.id);
  const groupBy = (Array.isArray(body.groupBy) ? body.groupBy : []).filter((id) =>
    allowedDimensionIds.includes(id)
  );

  return {
    programId,
    programMeta,
    outcomeFilter: programId === 'outcome' ? outcomeFilter : 'all',
    population: String(body.program || body.population || 'both').trim(),
    groupBy,
    legacyEventId
  };
}

function getCatalog() {
  const schema = loadSchemaCatalog();
  return {
    /** DHIS2-style programs with dimensions per domain */
    insightPrograms: INSIGHT_PROGRAMS,
    populationFilter: POPULATION_FILTER,
    outcomeStatusOptions: OUTCOME_STATUS_OPTIONS,
    /** All tables + fields from schema dictionary (browse like DHIS2 metadata) */
    schemaTables: schema.tables,
    schemaMeta: {
      tableCount: schema.tableCount,
      analyzableCount: schema.analyzableCount,
      source: schema.source
    },
    /** Legacy flat list (still supported by API) */
    events: INSIGHT_EVENTS,
    programs: POPULATION_FILTER
  };
}

async function runAnalysis(siteCode, body = {}) {
  const period = normalizePeriod(body.period || {});
  const { programId, programMeta, outcomeFilter, population, groupBy } = resolveAnalysisRequest(body);

  if (!['both', 'adult', 'child'].includes(population)) {
    const err = new Error('population must be both, adult, or child');
    err.statusCode = 400;
    throw err;
  }

  const startedAt = Date.now();
  const conn = await siteDatabaseManager.getSiteConnection(siteCode);
  const QUERY_TIMEOUT_MS = Number(process.env.INSIGHT_QUERY_TIMEOUT_MS || 90000);

  async function runInsightQuery(sql) {
    await conn.query(`SET SESSION MAX_EXECUTION_TIME = ${QUERY_TIMEOUT_MS}`);
    return conn.query(sql, { type: conn.QueryTypes.SELECT });
  }

  const inner = buildProgramInner(programId, outcomeFilter, population, period);
  const allowedDimensionIds = programMeta.dimensions.map((d) => d.id);

  let total = 0;
  let breakdown = [];

  const totalRows = await runInsightQuery(
    `SELECT COUNT(DISTINCT clinic_id) AS cnt FROM (${inner}) AS events`
  );
  total = Number(totalRows[0]?.cnt) || 0;

  if (!groupBy.length) {
    breakdown = [{ key: 'total', label: 'សរុប', count: total }];
  } else {
    const sql = buildAggregateSql(inner, groupBy, allowedDimensionIds);
    const rows = await runInsightQuery(sql);
    breakdown = (rows || []).map((row, i) => ({
      key: `row_${i}`,
      label: labelForRow(row, groupBy),
      count: Number(row.cnt) || 0,
      raw: row
    }));
  }

  return {
    success: true,
    programId,
    program: programMeta,
    outcomeFilter: programId === 'outcome' ? outcomeFilter : undefined,
    population,
    period,
    groupBy,
    total,
    breakdown,
    queryMs: Date.now() - startedAt
  };
}

module.exports = {
  getCatalog,
  runAnalysis,
  normalizePeriod,
  resolveAnalysisRequest
};
