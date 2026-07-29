const fs = require('fs');
const path = require('path');
const { siteDatabaseManager } = require('../config/siteDatabase');
const { runPool } = require('../utils/asyncPool');

const INDICATOR_CONCURRENCY = Number(process.env.INDICATOR_CONCURRENCY || 3);

const BASE_DIR = path.resolve(__dirname, '../../queries/indicators');

function processQuery(query, params) {
  let out = query || '';
  out = out.replace(/SET\s+@[A-Za-z0-9_]+\s*=\s*[^;]+;?\s*/gi, '');
  Object.entries(params).forEach(([key, value]) => {
    const re = new RegExp(`(:${key}|@${key})\\b`, 'g');
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

  getQuery(id) {
    const filePath = path.join(BASE_DIR, `${id}.sql`);
    if (fs.existsSync(filePath)) {
      const sql = fs.readFileSync(filePath, 'utf8');
      this.queries.set(id, sql);
      return sql;
    }
    return this.queries.get(id) || null;
  }

  /** Load a detail-only SQL file added after server start (e.g. viz_compare_patient_status). */
  loadDetailQueryIfPresent(id) {
    if (this.detailQueries.has(id)) return true;
    const filePath = path.join(BASE_DIR, `${id}_details.sql`);
    if (!fs.existsSync(filePath)) return false;
    const sql = fs.readFileSync(filePath, 'utf8');
    this.detailQueries.set(id, sql);
    return true;
  }

  getDetailQuery(id) {
    const filePath = path.join(BASE_DIR, `${id}_details.sql`);
    if (fs.existsSync(filePath)) {
      const sql = fs.readFileSync(filePath, 'utf8');
      this.detailQueries.set(id, sql);
      return sql;
    }
    let sql = this.detailQueries.get(id);
    if (!sql && this.loadDetailQueryIfPresent(id)) {
      sql = this.detailQueries.get(id);
    }
    // Safe fallback: Map legacy 10.x detail queries to 11.x if 10.x is not found
    if (!sql && id && String(id).startsWith('10.')) {
      const fallbackId = '11.' + String(id).slice(3);
      sql = this.getDetailQuery(fallbackId);
    }
    return sql || null;
  }

  async executeAll(siteCode, params, indicatorsToRun = []) {
    const startedAt = Date.now();
    let ids = Array.from(this.queries.keys()).sort();
    
    if (Array.isArray(indicatorsToRun) && indicatorsToRun.length > 0) {
      ids = ids.filter(id => indicatorsToRun.includes(id));
    }
    
    const data = await runPool(ids, INDICATOR_CONCURRENCY, async (id) => {
      try {
        return await this.executeOne(siteCode, id, params);
      } catch (error) {
        return { Indicator: id, TOTAL: 0, error: error?.message || 'Failed to execute indicator' };
      }
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
    const sql = this.getQuery(id);
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
      aggregateSql: processQuery(this.getQuery(id) || '', params),
      detailPath: this.detailQueries.has(id) || fs.existsSync(path.join(BASE_DIR, `${id}_details.sql`)) ? `backend/queries/indicators/${id}_details.sql` : null,
      detailSql: (this.getDetailQuery(id) ? processQuery(this.getDetailQuery(id), params) : null)
    }));
  }

  async fetchDetailRowsFromDb(siteCode, id, params) {
    const sql = this.getDetailQuery(id);
    if (!sql) throw new Error(`Indicator detail query not found: ${id}`);
    const scopedSql = processQuery(sql, params);
    const conn = await siteDatabaseManager.getSiteConnection(siteCode);
    return conn.query(scopedSql, { type: conn.QueryTypes.SELECT });
  }

  applyDetailFilters(rows, options = {}) {
    const search = String(options.search || '').toLowerCase();
    const ageGroup = options.ageGroup || '';
    const gender = options.gender || '';
    const minAge = options.minAge ? Number(options.minAge) : null;
    const maxAge = options.maxAge ? Number(options.maxAge) : null;

    let filtered = rows;
    if (gender) {
      const targetG = String(gender).toLowerCase();
      filtered = filtered.filter((r) => {
        const sex = String(r.sex_display || r.Sex || r.sex || '').toLowerCase();
        if (targetG === 'female' || targetG === 'f') return sex === 'female' || sex === 'f' || sex === '0' || sex === 'ស្រី';
        if (targetG === 'male' || targetG === 'm') return sex === 'male' || sex === 'm' || sex === '1' || sex === 'ប្រុស';
        return sex === targetG;
      });
    }
    if (ageGroup === '0-14' || ageGroup === '<=14') {
      filtered = filtered.filter((r) => classifyDetailAgeGroup(r) === '0-14');
    } else if (ageGroup === '15+' || ageGroup === '>14') {
      filtered = filtered.filter((r) => classifyDetailAgeGroup(r) === '>14');
    } else {
      if (minAge !== null && !Number.isNaN(minAge)) {
        filtered = filtered.filter((r) => {
          const ageClass = classifyDetailAgeGroup(r);
          if (ageClass === '>14') return true;
          const a = Number(r.age ?? r.Age);
          return Number.isFinite(a) ? a >= minAge : true;
        });
      }
      if (maxAge !== null && !Number.isNaN(maxAge)) {
        filtered = filtered.filter((r) => {
          const ageClass = classifyDetailAgeGroup(r);
          if (ageClass === '0-14') return true;
          const a = Number(r.age ?? r.Age);
          return Number.isFinite(a) ? a <= maxAge : true;
        });
      }
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
