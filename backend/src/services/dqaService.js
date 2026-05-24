const fs = require('fs');
const path = require('path');
const { siteDatabaseManager } = require('../config/siteDatabase');
const dqaVcctMappingService = require('./dqaVcctMappingService');

const BASE_DIR = path.resolve(__dirname, '../../queries/DQA');

function parseTitle(sql, filename) {
  const firstLine = String(sql || '')
    .split('\n')[0]
    .trim();
  if (firstLine.startsWith('--')) {
    const text = firstLine.replace(/^--\s*/, '');
    const match = text.match(/^DQA\s*\d+\s*:\s*(.+)$/i);
    return match ? match[1].trim() : text;
  }
  return filename.replace(/\.sql$/i, '');
}

function parseCheckNumber(filename) {
  const match = String(filename || '').match(/^(\d+)/);
  return match ? match[1].padStart(2, '0') : '';
}

function normalizeRows(rows) {
  if (!Array.isArray(rows)) return [];
  if (rows.length > 0 && !Array.isArray(rows[0])) return rows;
  return rows[0] || [];
}

class DqaService {
  constructor() {
    this.scripts = new Map();
    this.load();
  }

  load() {
    this.scripts.clear();
    if (!fs.existsSync(BASE_DIR)) return;
    const files = fs
      .readdirSync(BASE_DIR)
      .filter((f) => f.toLowerCase().endsWith('.sql') && !path.basename(f).startsWith('_'))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
    files.forEach((filename) => {
      const sql = fs.readFileSync(path.join(BASE_DIR, filename), 'utf8');
      const id = filename.replace(/\.sql$/i, '');
      this.scripts.set(id, {
        id,
        checkNumber: parseCheckNumber(filename),
        title: parseTitle(sql, filename),
        path: `backend/queries/DQA/${filename}`,
        sql
      });
    });
    this.registerProgrammaticChecks();
  }

  registerProgrammaticChecks() {
    const id = '30.vcct mapping issues';
    this.scripts.set(id, {
      id,
      checkNumber: '30',
      title: 'VCCT linked on ART but mapping issue (site / not found)',
      path: 'backend/src/services/dqaVcctMappingService.js',
      sql: dqaVcctMappingService.DOCUMENTATION_SQL,
      run: dqaVcctMappingService.runForSite
    });
  }

  listScripts() {
    return Array.from(this.scripts.values()).map(({ id, checkNumber, title, path }) => ({
      id,
      checkNumber,
      title,
      path
    }));
  }

  getQueryReference() {
    return this.listScripts().map((item) => ({
      ...item,
      sql: this.scripts.get(item.id)?.sql || ''
    }));
  }

  getScript(id) {
    const script = this.scripts.get(String(id || '').trim());
    if (!script) throw new Error(`DQA script not found: ${id}`);
    return script;
  }

  async executeOne(siteCode, id) {
    const startedAt = Date.now();
    const script = this.getScript(id);
    if (typeof script.run === 'function') {
      const rows = await script.run(siteCode);
      return {
        scriptId: script.id,
        title: script.title,
        path: script.path,
        rowCount: rows.length,
        rows,
        queryMs: Date.now() - startedAt
      };
    }
    const conn = await siteDatabaseManager.getSiteConnection(siteCode);
    const raw = await conn.query(script.sql, { type: conn.QueryTypes.SELECT });
    const rows = normalizeRows(raw);
    return {
      scriptId: script.id,
      title: script.title,
      path: script.path,
      rowCount: rows.length,
      rows,
      queryMs: Date.now() - startedAt
    };
  }

  applyFilters(rows, options = {}) {
    const search = String(options.search || '').toLowerCase();
    if (!search) return rows;
    return rows.filter((row) =>
      Object.values(row || {}).some((v) => String(v ?? '').toLowerCase().includes(search))
    );
  }

  paginateRows(rows, options = {}) {
    const page = Math.max(1, Number(options.page || 1));
    const limit = Math.min(500, Math.max(1, Number(options.limit || 50)));
    const totalCount = rows.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / limit));
    const offset = (page - 1) * limit;
    return {
      success: true,
      data: rows.slice(offset, offset + limit),
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };
  }

  async executeOnePaged(siteCode, id, options = {}) {
    const result = await this.executeOne(siteCode, id);
    const filtered = this.applyFilters(result.rows, options);
    const paged = this.paginateRows(filtered, options);
    return {
      ...result,
      rowCount: result.rows.length,
      filteredCount: filtered.length,
      ...paged
    };
  }

  async executeSummary(siteCode) {
    const ids = Array.from(this.scripts.keys()).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
    const settled = await Promise.allSettled(ids.map((id) => this.executeOne(siteCode, id)));
    return settled.map((result, idx) => {
      const id = ids[idx];
      const meta = this.scripts.get(id);
      if (result.status === 'fulfilled') {
        return {
          scriptId: id,
          title: meta?.title || id,
          path: meta?.path || '',
          rowCount: result.value.rowCount,
          queryMs: result.value.queryMs,
          error: null
        };
      }
      return {
        scriptId: id,
        title: meta?.title || id,
        path: meta?.path || '',
        rowCount: 0,
        queryMs: null,
        error: result.reason?.message || 'Failed to run DQA script'
      };
    });
  }
}

module.exports = new DqaService();
