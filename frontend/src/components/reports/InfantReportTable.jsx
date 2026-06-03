import { Fragment } from 'react';

export default function InfantReportTable({ sections = [], loading = false, formatValue, onCellClick }) {
  if (loading && !sections.length) {
    return (
      <div className="border border-border p-10 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
        <p className="mt-3 text-xs text-muted-foreground">Loading infant report...</p>
      </div>
    );
  }

  if (!sections.length) {
    return (
      <div className="border border-border p-8 text-center">
        <p className="text-xs text-muted-foreground">No data for the selected period.</p>
        <p className="mt-1 text-xs text-muted-foreground">Select a site and quarter above.</p>
      </div>
    );
  }

  return (
    <table className="w-full border-collapse text-xs" style={{ tableLayout: 'fixed' }}>
      <thead>
        <tr className="border-b border-border/20 bg-muted/50 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider text-left">
          <th className="w-[50%] border-r border-border/20 px-3 py-2 text-left">ប្រភេទ</th>
          <th className="w-[20%] border-r border-border/20 px-3 py-2 text-left">អាយុ</th>
          <th className="w-[10%] border-r border-border/20 px-3 py-2 text-center">ប្រុស</th>
          <th className="w-[10%] border-r border-border/20 px-3 py-2 text-center">ស្រី</th>
          <th className="w-[10%] px-3 py-2 text-center">សរុប</th>
        </tr>
      </thead>
      <tbody>
        {sections.map((section, sectionIdx) => {
          const sectionRows = Array.isArray(section.rows) ? section.rows : [];
          const hasSubRows = sectionRows.some((r) => r.labelKh || r.labelEn);
          const rowCount = sectionRows.length || 1;

          if (!sectionRows.length) {
            return (
              <tr key={`section-${section.sectionNumber}-empty`} className="hover:bg-muted/20 transition-colors duration-150">
                <td className="border-r border-b border-border/20 px-3 py-2 text-foreground font-semibold" colSpan={2}>
                  {section.sectionNumber}. {section.sectionLabelEn || section.sectionLabelKh}
                </td>
                <td className="border-r border-b border-border/20 px-3 py-2 text-right tabular-nums">0</td>
                <td className="border-r border-b border-border/20 px-3 py-2 text-right tabular-nums">0</td>
                <td className="border-b border-border/20 px-3 py-2 text-right tabular-nums">0</td>
              </tr>
            );
          }

          return (
            <Fragment key={`section-${section.sectionNumber}`}>
              {sectionRows.map((row, rowIdx) => {
                const isSubtotal = row.isSubtotal;
                const isZebra = !isSubtotal && (sectionIdx + rowIdx) % 2 === 1;
                const rowClass = isSubtotal ? 'bg-muted/10 font-semibold' : `${isZebra ? 'bg-muted/5 ' : ''}hover:bg-muted/20 transition-colors duration-150`;

                return (
                  <tr key={`${section.sectionNumber}-${rowIdx}`} className={`${rowClass}`}>
                    {hasSubRows && rowIdx === 0 ? (
                      <td className="w-[50%] border-r border-b border-border/20 px-3 py-2 align-top font-semibold text-foreground wrap-break-word" rowSpan={rowCount}>
                        <span className="block">
                          {section.sectionNumber}. {section.sectionLabelKh || section.sectionLabelEn}
                        </span>
                      </td>
                    ) : null}

                    {!hasSubRows && rowIdx === 0 ? (
                      <td className="w-[70%] border-r border-b border-border/20 px-3 py-2 align-top font-semibold text-foreground wrap-break-word" colSpan={2}>
                        <span className="block">
                          {section.sectionNumber}. {section.sectionLabelKh || section.sectionLabelEn}
                        </span>
                        {row.error ? <div className="mt-0.5 text-xs text-destructive">{row.error}</div> : null}
                      </td>
                    ) : null}

                    {hasSubRows ? (
                      <td className="w-[20%] border-r border-b border-border/20 px-2 py-2 align-middle text-xs text-foreground">
                        {row.labelKh || row.labelEn || '—'}
                      </td>
                    ) : null}

                    <td
                      className="cursor-pointer border-r border-b border-border/20 px-3 py-2 text-right text-sm tabular-nums text-report-male hover:bg-muted/30 transition-colors duration-150"
                      onClick={() => onCellClick?.(section, row, rowIdx, 'male')}
                    >
                      {formatValue(row.male ?? 0)}
                    </td>
                    <td
                      className="cursor-pointer border-r border-b border-border/20 px-3 py-2 text-right text-sm tabular-nums text-report-female hover:bg-muted/30 transition-colors duration-150"
                      onClick={() => onCellClick?.(section, row, rowIdx, 'female')}
                    >
                      {formatValue(row.female ?? 0)}
                    </td>
                    <td
                      className={`cursor-pointer border-b border-border/20 px-3 py-2 text-right text-sm tabular-nums text-foreground hover:bg-muted/30 transition-colors duration-150 ${isSubtotal ? 'font-bold underline' : ''}`}
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
