const fs = require('fs');

/**
 * Parse schema.txt markdown tables → { FieldName: Description KH }
 */
function loadFieldLabelsKhFromSchema(schemaPath) {
  const labels = {};
  if (!schemaPath || !fs.existsSync(schemaPath)) return labels;

  const lines = fs.readFileSync(schemaPath, 'utf8').split('\n');
  for (const line of lines) {
    if (!line.startsWith('|')) continue;
    if (line.includes('Field Name') || line.includes('---')) continue;

    const parts = line
      .split('|')
      .map((p) => p.trim())
      .filter((p) => p.length > 0);
    if (parts.length < 5) continue;

    const fieldRaw = parts[0];
    const kh = parts[parts.length - 1];
    if (!fieldRaw || !kh || kh === 'Description KH') continue;

    const fieldName = fieldRaw
      .replace(/\s*\(Primary\)\s*/gi, '')
      .replace(/\s*\(primary\)\s*/gi, '')
      .trim();

    if (fieldName && kh.length > 1) {
      labels[fieldName] = kh;
    }
  }
  return labels;
}

module.exports = { loadFieldLabelsKhFromSchema };
