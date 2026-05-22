/** Escape a cell for CSV (UTF-8 with BOM for Excel Khmer). */
export function csvCell(value) {
  if (value == null || value === '') return '';
  const s = String(value);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function rowsToCsv(columns, rows, { labelForKey = (k) => k, formatValue = (v) => v } = {}) {
  const header = columns.map((key) => csvCell(labelForKey(key))).join(',');
  const body = rows.map((row) =>
    columns.map((key) => csvCell(formatValue(row?.[key]))).join(',')
  );
  return [header, ...body].join('\r\n');
}

export function downloadCsv(filename, csvText) {
  const bom = '\uFEFF';
  const blob = new Blob([bom + csvText], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function safeExportFilename(title, fallback = 'report-detail') {
  const base = String(title || fallback)
    .replace(/[/\\?%*:|"<>]/g, '-')
    .replace(/\s+/g, '_')
    .slice(0, 100);
  return base || fallback;
}
