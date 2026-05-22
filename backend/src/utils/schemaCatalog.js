const fs = require('fs');
const path = require('path');

const SCHEMA_PATH = path.resolve(__dirname, '../../schema dictionary/schema.txt');

/** Tables we can run period analysis on today */
const TABLE_TO_PROGRAM = {
  tblaimain: 'enrollment',
  tblcimain: 'enrollment',
  tblaart: 'art',
  tblcart: 'art',
  tblavmain: 'visit',
  tblcvmain: 'visit',
  tblpatienttest: 'lab',
  tblavpatientstatus: 'outcome',
  tblcvpatientstatus: 'outcome'
};

const DATE_FIELD_HINTS = [
  'dafirstvisit',
  'dafirstvisit',
  'daart',
  'datvisit',
  'dat',
  'dacollect',
  'daarrival',
  'da',
  'dastart',
  'dastop',
  'davisit',
  'dahiv',
  'daonset',
  'datreat',
  'daresulttreat'
];

const CATALOG_PARSE_VERSION = 2;

let cached = null;
let cachedVersion = 0;

function resetSchemaCatalogCache() {
  cached = null;
  cachedVersion = 0;
}

function normalizeTableName(raw) {
  return String(raw || '')
    .trim()
    .toLowerCase()
    .replace(/^tbl/, 'tbl');
}

function extractTableNames(headerLine) {
  const afterNum = headerLine.replace(/^\d+\.\s*/, '');
  const names = [];
  const re = /tbl[a-z0-9_]+/gi;
  let m;
  while ((m = re.exec(afterNum)) !== null) {
    names.push(normalizeTableName(m[0]));
  }
  return [...new Set(names)];
}

function parseFieldRow(line) {
  const parts = line.split('|').map((p) => p.trim());
  if (parts.length < 5) return null;
  const fieldRaw = parts[1];
  if (!fieldRaw || fieldRaw === 'Field Name' || fieldRaw.startsWith('---')) return null;
  const fieldName = fieldRaw.replace(/\s*\(Primary\)\s*/i, '').trim();
  const type = parts[2] || '';
  const descEn = parts[4] || '';
  const descKh = parts[5] || parts[4] || '';
  const isDate = /date|datetime/i.test(type) || DATE_FIELD_HINTS.includes(fieldName.toLowerCase());
  return {
    name: fieldName,
    type,
    labelKh: descKh || descEn || fieldName,
    labelEn: descEn || fieldName,
    isDate
  };
}

function parseSchemaFile(content) {
  const sections = content.split(/\n(?=## \d+\.)/);
  const tables = [];

  sections.forEach((block) => {
    const lines = block.split('\n');
    const header = lines.find((l) => l.startsWith('## '));
    if (!header) return;

    const titleMatch = header.match(/^## \d+\.\s*(.+)$/);
    const titleLine = titleMatch ? titleMatch[1] : header;
    const tableNames = extractTableNames(titleLine);
    if (!tableNames.length) return;

    const parenKh = titleLine.match(/\(([^)]+)\)/);
    const titleKh = parenKh ? parenKh[1] : titleLine;

    const fields = [];
    lines.forEach((line) => {
      if (!line.trim().startsWith('|')) return;
      const field = parseFieldRow(line);
      if (field) fields.push(field);
    });

    const dateFields = fields.filter((f) => f.isDate).map((f) => f.name);

    tableNames.forEach((tableName) => {
      const programId = TABLE_TO_PROGRAM[tableName] || null;
      const entry = {
        id: tableName,
        name: tableName,
        titleKh,
        sectionTitle: titleLine,
        fields,
        dateFields,
        fieldCount: fields.length,
        analyzable: Boolean(programId),
        programId,
        hasClinicId: fields.some((f) => f.name.toLowerCase() === 'clinicid')
      };
      const existingIdx = tables.findIndex((t) => t.id === tableName);
      if (existingIdx >= 0) {
        const prev = tables[existingIdx];
        tables[existingIdx] = {
          ...prev,
          ...entry,
          analyzable: prev.analyzable || entry.analyzable,
          programId: prev.programId || entry.programId,
          fieldCount: Math.max(prev.fieldCount, entry.fieldCount)
        };
      } else {
        tables.push(entry);
      }
    });
  });

  return tables.sort((a, b) => a.name.localeCompare(b.name));
}

function loadSchemaCatalog() {
  if (cached && cachedVersion === CATALOG_PARSE_VERSION) return cached;
  try {
    const content = fs.readFileSync(SCHEMA_PATH, 'utf8');
    const tables = parseSchemaFile(content);
    cached = {
      tables,
      tableCount: tables.length,
      analyzableCount: tables.filter((t) => t.analyzable).length,
      source: 'schema dictionary/schema.txt'
    };
    cachedVersion = CATALOG_PARSE_VERSION;
  } catch (e) {
    cached = { tables: [], tableCount: 0, analyzableCount: 0, source: '', error: e.message };
    cachedVersion = CATALOG_PARSE_VERSION;
  }
  return cached;
}

function getTableById(tableId) {
  const catalog = loadSchemaCatalog();
  return catalog.tables.find((t) => t.id === normalizeTableName(tableId)) || null;
}

module.exports = {
  loadSchemaCatalog,
  getTableById,
  resetSchemaCatalogCache,
  TABLE_TO_PROGRAM
};
