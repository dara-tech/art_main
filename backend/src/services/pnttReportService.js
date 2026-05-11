const fs = require('fs');
const path = require('path');
const { siteDatabaseManager } = require('../config/siteDatabase');

const PNTT_SCRIPTS_DIR = path.join(__dirname, '../../queries/PNTT_AGGREGATE_SCRIPTS');
const PNTT_DETAIL_SCRIPTS_DIR = path.join(__dirname, '../../queries/PNTT_DETAIL_SCRIPTS');

/** MySQL drivers may return column aliases in different casing. */
function numFromRow(row, keys) {
  if (!row) return 0;
  for (const k of keys) {
    if (Object.prototype.hasOwnProperty.call(row, k) && row[k] != null && row[k] !== '') {
      const n = Number(row[k]);
      return Number.isFinite(n) ? n : 0;
    }
  }
  return 0;
}

function defaultPnttNormalizer(rows) {
  const r = rows && rows[0];
  if (!r) return [{ labelEn: '', labelKh: '', male: 0, female: 0, total: 0 }];
  const male = numFromRow(r, ['Male', 'male', 'MALE']);
  const female = numFromRow(r, ['Female', 'female', 'FEMALE']);
  const tsexKeys = ['Tsex', 'tsex', 'TSEX'];
  const hasTsex = tsexKeys.some(
    (k) => Object.prototype.hasOwnProperty.call(r, k) && r[k] != null && r[k] !== ''
  );
  const total = hasTsex ? numFromRow(r, tsexKeys) : male + female;
  return [{ labelEn: '', labelKh: '', male, female, total }];
}

function riskPnttNormalizer(rows) {
  const r = rows && rows[0];
  if (!r) return [];
  const keys = [
    ['R', 'R1', 'R2'],
    ['1R', '1R1', '1R2'],
    ['2R', '2R1', '2R2'],
    ['3R', '3R1', '3R2'],
    ['4R', '4R1', '4R2'],
    ['5R', '5R1', '5R2'],
    ['6R', '6R1', '6R2'],
    ['7R', '7R1', '7R2'],
    ['8R', '8R1', '8R2'],
    ['9R', '9R1', '9R2']
  ];
  const get = (key) => r[key] ?? r[key?.toLowerCase?.()] ?? 0;
  return keys.map(([everKey, sixMoKey, neverKey], i) => ({
    labelEn: `Risk factor ${i + 1}`,
    labelKh: '',
    ever: Number(get(everKey)),
    sixMonths: Number(get(sixMoKey)),
    never: Number(get(neverKey))
  }));
}

function labelFromScriptId(scriptId) {
  return scriptId.replace(/_aggregate$/, '').replace(/_/g, ' ').trim();
}

class PnttReportService {
  constructor() {
    this.queries = new Map();
    this.detailQueries = new Map();
    this.sectionDefs = [];
    this.loadQueries();
    this.loadDetailQueries();
    this.buildSectionDefs();
  }

  loadQueries() {
    if (!fs.existsSync(PNTT_SCRIPTS_DIR)) return;
    fs.readdirSync(PNTT_SCRIPTS_DIR)
      .filter((f) => f.endsWith('.sql'))
      .forEach((filename) => {
        const content = fs.readFileSync(path.join(PNTT_SCRIPTS_DIR, filename), 'utf8');
        this.queries.set(filename.replace('.sql', ''), content);
      });
  }

  loadDetailQueries() {
    if (!fs.existsSync(PNTT_DETAIL_SCRIPTS_DIR)) return;
    fs.readdirSync(PNTT_DETAIL_SCRIPTS_DIR)
      .filter((f) => f.endsWith('.sql'))
      .forEach((filename) => {
        const content = fs.readFileSync(path.join(PNTT_DETAIL_SCRIPTS_DIR, filename), 'utf8');
        this.detailQueries.set(filename.replace('.sql', ''), content);
      });
  }

  buildSectionDefs() {
    const scriptIds = Array.from(this.queries.keys()).sort((a, b) => {
      const numA = parseFloat((a.match(/^[\d.]+/) || [a])[0]) || 0;
      const numB = parseFloat((b.match(/^[\d.]+/) || [b])[0]) || 0;
      if (numA !== numB) return numA - numB;
      return String(a).localeCompare(b);
    });
    let sectionNumber = 0;
    scriptIds.forEach((scriptId) => {
      sectionNumber += 1;
      const detailScriptId = scriptId.replace(/_aggregate$/, '_details');
      const isRisk = /RISK_aggregate$/.test(scriptId);
      this.sectionDefs.push({
        scriptId,
        detailScriptId: this.detailQueries.has(detailScriptId) ? detailScriptId : null,
        sectionNumber,
        sectionLabelEn: labelFromScriptId(scriptId),
        sectionLabelKh: '',
        normalizer: isRisk ? riskPnttNormalizer : defaultPnttNormalizer
      });
    });
  }

  processQuery(query, params) {
    const startDate = (params.startDate || '2025-01-01').replace(/'/g, "''");
    const endDate = (params.endDate || '2025-03-31').replace(/'/g, "''");
    const previousEndDate = params.previousEndDate ? `'${String(params.previousEndDate).replace(/'/g, "''")}'` : 'NULL';
    let single = query
      .replace(/SET\s+@StartDate\s*=\s*'[^']*';?\s*/gi, '')
      .replace(/SET\s+@EndDate\s*=\s*'[^']*';?\s*/gi, '')
      .replace(/SET\s+@PreviousEndDate\s*=\s*[^;]+;?\s*/gi, '');
    return single.replace(/@StartDate/g, `'${startDate}'`).replace(/@EndDate/g, `'${endDate}'`).replace(/@PreviousEndDate/g, previousEndDate).trim();
  }

  async runScript(siteCode, scriptId, params) {
    const query = this.queries.get(scriptId);
    if (!query) return { rows: [], error: `Script ${scriptId} not found` };
    try {
      const rows = await siteDatabaseManager.executeSiteQuery(siteCode, this.processQuery(query, params));
      return { rows: Array.isArray(rows) ? rows : [], error: null };
    } catch (err) {
      return { rows: [], error: err.message };
    }
  }

  async runDetailScript(siteCode, scriptId, params) {
    const requestedScriptId = String(scriptId || '').trim();
    const detailScriptId = requestedScriptId.endsWith('_aggregate')
      ? requestedScriptId.replace(/_aggregate$/, '_details')
      : requestedScriptId;
    const query = this.detailQueries.get(detailScriptId) || this.detailQueries.get(requestedScriptId);
    if (!query) {
      // Some aggregate scripts intentionally do not have patient-level detail SQL.
      return { rows: [], error: null };
    }
    try {
      const rows = await siteDatabaseManager.executeSiteQuery(siteCode, this.processQuery(query, params));
      return { rows: Array.isArray(rows) ? rows : [], error: null };
    } catch (err) {
      return { rows: [], error: err.message };
    }
  }

  async buildSection(siteCode, fullParams, def) {
    try {
      const res = await this.runScript(siteCode, def.scriptId, fullParams);
      if (res.error) {
        return {
          scriptId: def.scriptId,
          sectionNumber: def.sectionNumber,
          sectionLabelEn: def.sectionLabelEn,
          sectionLabelKh: def.sectionLabelKh,
          detailScriptId: def.detailScriptId,
          rows: [{ labelEn: 'Error', labelKh: 'កំហុស', male: 0, female: 0, total: 0, error: res.error }]
        };
      }
      return {
        scriptId: def.scriptId,
        sectionNumber: def.sectionNumber,
        sectionLabelEn: def.sectionLabelEn,
        sectionLabelKh: def.sectionLabelKh,
        detailScriptId: def.detailScriptId,
        rows: def.normalizer(res.rows)
      };
    } catch (err) {
      return {
        scriptId: def.scriptId,
        sectionNumber: def.sectionNumber,
        sectionLabelEn: def.sectionLabelEn,
        sectionLabelKh: def.sectionLabelKh,
        detailScriptId: def.detailScriptId,
        rows: [{ labelEn: 'Error', labelKh: 'កំហុស', male: 0, female: 0, total: 0, error: err.message }]
      };
    }
  }

  async getReportData(siteCode, params) {
    const fullParams = {
      startDate: params.startDate || '2025-01-01',
      endDate: params.endDate || '2025-03-31',
      previousEndDate: params.previousEndDate || '2024-12-31'
    };
    const sections = await Promise.all(this.sectionDefs.map((def) => this.buildSection(siteCode, fullParams, def)));
    return { success: true, data: sections };
  }

  /**
   * NDJSON stream: { type: 'start', total }, { type: 'section', data, completed, total }, { type: 'done', durationMs }
   */
  async streamReportToResponse(res, siteCode, params) {
    const startedAt = Date.now();
    const fullParams = {
      startDate: params.startDate || '2025-01-01',
      endDate: params.endDate || '2025-03-31',
      previousEndDate: params.previousEndDate || '2024-12-31'
    };
    const total = this.sectionDefs.length;
    const write = (obj) => {
      res.write(`${JSON.stringify(obj)}\n`);
    };
    write({ type: 'start', total });
    let completed = 0;
    for (const def of this.sectionDefs) {
      const section = await this.buildSection(siteCode, fullParams, def);
      completed += 1;
      write({ type: 'section', data: section, completed, total });
    }
    write({ type: 'done', durationMs: Date.now() - startedAt });
  }
}

module.exports = new PnttReportService();
