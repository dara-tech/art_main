const fs = require('fs');
const path = require('path');
const { siteDatabaseManager } = require('../config/siteDatabase');

const BASE_DIR = path.resolve(__dirname, '../../queries/indicators');

function processQuery(query, params) {
  let out = query;
  Object.entries(params).forEach(([key, value]) => {
    const re = new RegExp(`:${key}\\b`, 'g');
    const v = typeof value === 'string' ? `'${value.replace(/'/g, "''")}'` : value;
    out = out.replace(re, v);
  });
  return out;
}

function classifyDetailAgeGroup(row) {
  const r = row || {};
  const typepatients = String(r.typepatients ?? r.TypePatients ?? '').trim();
  const patientType = String(r.patient_type ?? r.patientType ?? '').trim().toLowerCase();

  // Prefer the same grouping labels the aggregate queries use.
  if (typepatients === '≤14' || typepatients === '<=14' || typepatients === '0-14') return '0-14';
  if (typepatients === '15+' || typepatients === '>14') return '>14';
  if (patientType === 'child') return '0-14';
  if (patientType === 'adult') return '>14';

  const age = Number(r.age ?? r.Age);
  if (Number.isFinite(age)) return age <= 14 ? '0-14' : '>14';
  return '';
}

class IndicatorsService {
  constructor() {
    this.queries = new Map();
    this.detailQueries = new Map();
    this.load();
  }

  reload() {
    this.queries.clear();
    this.detailQueries.clear();
    this.load();
  }

  load() {
    const files = fs.readdirSync(BASE_DIR).filter((f) => f.endsWith('.sql') && f !== 'variables.sql');
    files.forEach((filename) => {
      const sql = fs.readFileSync(path.join(BASE_DIR, filename), 'utf8');
      const id = filename.replace('.sql', '');
      if (id.endsWith('_details')) {
        const base = id.replace('_details', '');
        this.detailQueries.set(base, sql);
      } else {
        this.queries.set(id, sql);
      }
    });
  }

  async executeAll(siteCode, params) {
    const startedAt = Date.now();
    const ids = Array.from(this.queries.keys()).sort();
    const settled = await Promise.allSettled(ids.map((id) => this.executeOne(siteCode, id, params)));

    const data = settled.map((result, idx) => {
      if (result.status === 'fulfilled') return result.value;
      return { Indicator: ids[idx], TOTAL: 0, error: result.reason?.message || 'Failed to execute indicator' };
    });

    return {
      success: true,
      data,
      timestamp: new Date().toISOString(),
      durationMs: Date.now() - startedAt
    };
  }

  async executeOne(siteCode, id, params) {
    const startedAt = Date.now();
    const sql = this.queries.get(id);
    if (!sql) throw new Error(`Indicator query not found: ${id}`);
    const scopedSql = processQuery(sql, params);
    const conn = await siteDatabaseManager.getSiteConnection(siteCode);
    const rows = await conn.query(scopedSql, { type: conn.QueryTypes.SELECT });
    const base = rows[0] || { Indicator: id, TOTAL: 0 };
    return { ...base, queryMs: Date.now() - startedAt };
  }

  getQueryReference(params) {
    const ids = Array.from(this.queries.keys()).sort();
    return ids.map((id) => ({
      indicatorId: id,
      aggregatePath: `backend/queries/indicators/${id}.sql`,
      aggregateSql: processQuery(this.queries.get(id), params),
      detailPath: this.detailQueries.has(id) ? `backend/queries/indicators/${id}_details.sql` : null,
      detailSql: this.detailQueries.has(id) ? processQuery(this.detailQueries.get(id), params) : null
    }));
  }

  async fetchDetailRowsFromDb(siteCode, id, params) {
    const sql = this.detailQueries.get(id);
    if (!sql) throw new Error(`Indicator detail query not found: ${id}`);
    const scopedSql = processQuery(sql, params);
    const conn = await siteDatabaseManager.getSiteConnection(siteCode);
    return conn.query(scopedSql, { type: conn.QueryTypes.SELECT });
  }

  applyDetailFilters(rows, options = {}) {
    const search = String(options.search || '').toLowerCase();
    const ageGroup = options.ageGroup || '';
    const gender = options.gender || '';

    let filtered = rows;
    if (gender) {
      filtered = filtered.filter((r) => {
        const sex = String(r.sex_display || '').toLowerCase();
        return sex === String(gender).toLowerCase();
      });
    }
    if (ageGroup === '0-14') filtered = filtered.filter((r) => classifyDetailAgeGroup(r) === '0-14');
    if (ageGroup === '15+' || ageGroup === '>14') {
      filtered = filtered.filter((r) => classifyDetailAgeGroup(r) === '>14');
    }
    if (search) {
      filtered = filtered.filter((r) =>
        Object.values(r || {}).some((v) => String(v || '').toLowerCase().includes(search))
      );
    }
    return filtered;
  }

  paginateDetailRows(filtered, options = {}) {
    const page = Number(options.page || 1);
    const limit = Number(options.limit || 50);
    const totalCount = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / limit));
    const offset = (page - 1) * limit;
    const data = filtered.slice(offset, offset + limit);
    return {
      success: true,
      data,
      pagination: { page, limit, totalCount, totalPages, hasNext: page < totalPages, hasPrev: page > 1 }
    };
  }

  async executeDetails(siteCode, id, params, options = {}) {
    const rows = await this.fetchDetailRowsFromDb(siteCode, id, params);
    const filtered = this.applyDetailFilters(rows, options);
    return this.paginateDetailRows(filtered, options);
  }

  /**
   * Province/country (multi-facility): run detail SQL per facility, merge raw rows, then filter + page.
   */
  async executeDetailsMerged(siteCodes, id, params, options = {}) {
    const codes = Array.isArray(siteCodes) ? [...new Set(siteCodes.map(String))].filter(Boolean) : [];
    if (!codes.length) {
      return this.paginateDetailRows([], options);
    }
    const merged = [];
    const errors = [];
    for (const code of codes) {
      try {
        const rows = await this.fetchDetailRowsFromDb(code, id, params);
        for (const row of rows || []) merged.push({ ...row, site_code: row?.site_code ?? code });
      } catch (e) {
        errors.push(e?.message || String(e));
      }
    }
    if (!merged.length && errors.length) {
      throw new Error(errors[0] || 'Failed to load indicator details');
    }
    const filtered = this.applyDetailFilters(merged, options);
    return this.paginateDetailRows(filtered, options);
  }
}

module.exports = new IndicatorsService();
