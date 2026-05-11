const fs = require('fs');
const path = require('path');
const { siteDatabaseManager } = require('../config/siteDatabase');

function loadSqlMap(dirPath) {
  const map = new Map();
  if (!fs.existsSync(dirPath)) return map;
  fs.readdirSync(dirPath)
    .filter((f) => f.endsWith('.sql'))
    .forEach((file) => {
      map.set(file.replace('.sql', ''), fs.readFileSync(path.join(dirPath, file), 'utf8'));
    });
  return map;
}

function processQuery(query, params) {
  let out = query;
  Object.entries(params).forEach(([key, value]) => {
    const re = new RegExp(`:${key}\\b`, 'g');
    const v = typeof value === 'string' ? `'${value.replace(/'/g, "''")}'` : value;
    out = out.replace(re, v);
  });

  // Prevent multi-statement execution issues from setup blocks.
  return out
    .split('\n')
    .filter((line) => !line.trim().toUpperCase().startsWith('SET '))
    .join('\n')
    .replace(/@\w+/g, 'NULL');
}

class ScriptReportService {
  constructor({ aggregateDir, detailDir }) {
    this.aggregate = loadSqlMap(aggregateDir);
    this.detail = loadSqlMap(detailDir);
  }

  async runAggregate(siteCode, scriptId, params) {
    const query = this.aggregate.get(scriptId);
    if (!query) return { rows: [], error: `Script not found: ${scriptId}` };
    const rows = await siteDatabaseManager.executeSiteQuery(siteCode, processQuery(query, params));
    return { rows };
  }

  async runDetail(siteCode, scriptId, params) {
    const query = this.detail.get(scriptId);
    if (!query) return { rows: [], error: `Detail script not found: ${scriptId}` };
    const rows = await siteDatabaseManager.executeSiteQuery(siteCode, processQuery(query, params));
    return { rows };
  }

  aggregateIds() {
    return Array.from(this.aggregate.keys()).sort();
  }
}

module.exports = { ScriptReportService };
