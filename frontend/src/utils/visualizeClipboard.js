import { rowsToCsv } from './exportCsv';
import { buildVisualizeTableModel } from './visualizeResultsTable';

/** Tabular text (CSV) for paste into Excel / Sheets. */
export function buildVisualizeResultsClipboardText(results = [], catalog = [], scopeMode = 'rollup', labels = {}) {
  const { columns, rows } = buildVisualizeTableModel(results, catalog, scopeMode);
  if (!rows.length) return '';
  const keys = columns.map((c) => c.id);
  return rowsToCsv(keys, rows, {
    labelForKey: (k) => {
      const col = columns.find((c) => c.id === k);
      return col ? labels[col.labelKey] || k : k;
    },
    formatValue: (v) => v
  });
}
