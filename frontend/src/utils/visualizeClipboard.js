import { rowsToCsv } from './exportCsv';
import { buildVisualizeTableModel } from './visualizeResultsTable';

/** Tabular text (CSV) for paste into Excel / Sheets. */
export function buildVisualizeResultsClipboardText(results = [], catalog = [], scopeMode = 'rollup', labels = {}) {
  const { columns, rows } = buildVisualizeTableModel(results, catalog, scopeMode);
  if (!rows.length) return '';
  const keys = columns.map((c) => c.id);
  const csv = rowsToCsv(keys, rows, {
    labelForKey: (k) => {
      const col = columns.find((c) => c.id === k);
      return col ? labels[col.labelKey] || k : k;
    },
    formatValue: (v) => v
  });
  // UTF-8 BOM so Excel pastes Khmer column headers correctly (text only, never chart/HTML).
  return csv ? `\uFEFF${csv}` : '';
}
