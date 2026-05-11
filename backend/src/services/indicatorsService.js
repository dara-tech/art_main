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

class IndicatorsService {
  constructor() {
    this.queries = new Map();
    this.detailQueries = new Map();
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

  async executeDetails(siteCode, id, params, options = {}) {
    const sql = this.detailQueries.get(id);
    if (!sql) throw new Error(`Indicator detail query not found: ${id}`);
    const scopedSql = processQuery(sql, params);
    const conn = await siteDatabaseManager.getSiteConnection(siteCode);
    const rows = await conn.query(scopedSql, { type: conn.QueryTypes.SELECT });

    const page = Number(options.page || 1);
    const limit = Number(options.limit || 50);
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
    if (ageGroup === '0-14') filtered = filtered.filter((r) => Number(r.age || 0) <= 14);
    if (ageGroup === '15+') filtered = filtered.filter((r) => Number(r.age || 0) >= 15);
    if (search) {
      filtered = filtered.filter((r) =>
        Object.values(r || {}).some((v) => String(v || '').toLowerCase().includes(search))
      );
    }

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
}

module.exports = new IndicatorsService();
