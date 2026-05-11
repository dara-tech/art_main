import { Fragment } from 'react';

export default function InfantReportTable({ sections = [], loading = false, formatValue, onCellClick }) {
  if (loading) {
    return (
      <div className="border border-border p-10 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
        <p className="mt-3 text-sm text-muted-foreground">Loading infant report...</p>
      </div>
    );
  }

  if (!sections.length) {
    return (
      <div className="border border-border p-8 text-center">
        <p className="text-sm text-muted-foreground">No data for the selected period.</p>
        <p className="mt-1 text-xs text-muted-foreground">Select a site and quarter above.</p>
      </div>
    );
  }

  return (
    <table className="w-full border-collapse  text-sm" style={{ tableLayout: 'fixed' }}>
      <thead>
        <tr className=" bg-muted">
          <th className="w-[50%] border-r border-border/60 px-3 py-2.5 text-left font-bold text-foreground">ប្រភេទ</th>
          <th className="w-[20%] border-r border-border/60 px-3 py-2.5 text-left font-bold text-foreground">អាយុ</th>
          <th className="w-[10%] border-r border-border/60 px-3 py-2.5 text-center font-bold text-foreground">ប្រុស</th>
          <th className="w-[10%] border-r border-border/60 px-3 py-2.5 text-center font-bold text-foreground">ស្រី</th>
          <th className="w-[10%] px-3 py-2.5 text-center font-bold text-foreground">សរុប</th>
        </tr>
      </thead>
      <tbody>
        {sections.map((section, sectionIdx) => {
          const sectionRows = Array.isArray(section.rows) ? section.rows : [];
          const hasSubRows = sectionRows.some((r) => r.labelKh || r.labelEn);
          const rowCount = sectionRows.length || 1;

          if (!sectionRows.length) {
            return (
              <tr key={`section-${section.sectionNumber}-empty`} className="hover:bg-muted/25 transition-colors">
                <td className="border-r border-b border-border/50 px-3 py-2 text-foreground font-semibold" colSpan={2}>
                  {section.sectionNumber}. {section.sectionLabelEn || section.sectionLabelKh}
                </td>
                <td className="border-r border-b border-border/50 px-3 py-2 text-right tabular-nums">0</td>
                <td className="border-r border-b border-border/50 px-3 py-2 text-right tabular-nums">0</td>
                <td className="border-b border-border/50 px-3 py-2 text-right tabular-nums">0</td>
              </tr>
            );
          }

          return (
            <Fragment key={`section-${section.sectionNumber}`}>
              {sectionRows.map((row, rowIdx) => {
                const isSubtotal = row.isSubtotal;
                const isZebra = !isSubtotal && (sectionIdx + rowIdx) % 2 === 1;
                const rowClass = isSubtotal ? 'bg-muted font-semibold' : `${isZebra ? 'bg-muted/15 ' : ''}hover:bg-muted/20`;

                return (
                  <tr key={`${section.sectionNumber}-${rowIdx}`} className={`${rowClass} transition-colors`}>
                    {hasSubRows && rowIdx === 0 ? (
                      <td className="w-[50%] border-r border-b border-border/50 px-3 py-2 align-top font-semibold text-foreground wrap-break-word" rowSpan={rowCount}>
                        <span className="block">
                          {section.sectionNumber}. {section.sectionLabelKh || section.sectionLabelEn}
                        </span>
                      </td>
                    ) : null}

                    {!hasSubRows && rowIdx === 0 ? (
                      <td className="w-[70%] border-r border-b border-border/50 px-3 py-2 align-top font-semibold text-foreground wrap-break-word" colSpan={2}>
                        <span className="block">
                          {section.sectionNumber}. {section.sectionLabelKh || section.sectionLabelEn}
                        </span>
                        {row.error ? <div className="mt-0.5 text-xs text-destructive">{row.error}</div> : null}
                      </td>
                    ) : null}

                    {hasSubRows ? (
                      <td className="w-[20%] border-r border-b border-border/50 px-2 py-2 align-middle text-xs text-foreground">
                        {row.labelKh || row.labelEn || '—'}
                      </td>
                    ) : null}

                    <td
                      className="border-r border-b border-border/50 px-3 py-2 text-right text-lg tabular-nums text-blue-600 cursor-pointer hover:bg-muted/40"
                      onClick={() => onCellClick?.(section, row, rowIdx, 'male')}
                    >
                      {formatValue(row.male ?? 0)}
                    </td>
                    <td
                      className="border-r border-b border-border/50 px-3 py-2 text-right text-lg tabular-nums text-pink-600 cursor-pointer hover:bg-muted/40"
                      onClick={() => onCellClick?.(section, row, rowIdx, 'female')}
                    >
                      {formatValue(row.female ?? 0)}
                    </td>
                    <td
                      className={`border-b border-border/50 px-3 py-2 text-right text-lg tabular-nums text-foreground cursor-pointer hover:bg-muted/40 ${isSubtotal ? 'font-bold underline' : ''}`}
                      onClick={() => onCellClick?.(section, row, rowIdx, 'total')}
                    >
                      {formatValue(row.total ?? 0)}
                    </td>
                  </tr>
                );
              })}
            </Fragment>
          );
        })}
      </tbody>
    </table>
  );
}
