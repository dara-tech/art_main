import { Fragment, useState } from 'react';
import { RiEyeLine, RiEyeOffLine, RiLoader4Line, RiListCheck, RiTimeLine } from '@remixicon/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import InfantReportTable from './InfantReportTable';
import PnttReportTable from './PnttReportTable';

export default function ReportResultsPanel({
  selectedSite,
  currentPeriod,
  reportType,
  runTimeMs,
  isAdultChild,
  loading,
  progress,
  previewRows,
  hasRows,
  adultChildRows,
  isSectionedReport,
  formatValue,
  onAdultChildCellClick,
  onInfantCellClick,
  onPnttCellClick
}) {
  const [showQueryMs, setShowQueryMs] = useState(false);
  const splitIndicatorLabel = (label) => {
    const text = String(label || '').trim();
    const match = text.match(/^(.*)\s\(([^()]*)\)\s*$/);
    if (!match) return { khmerPart: text, englishPart: '' };
    return { khmerPart: match[1].trim(), englishPart: match[2].trim() };
  };
  const reportTitle =
    reportType === 'adult-child'
      ? 'របាយការណ៍ Adult / Child'
      : reportType === 'infants'
        ? 'របាយការណ៍ទារក (Infant Report)'
        : reportType === 'pntt'
          ? 'របាយការណ៍ PNTT'
          : 'Report Portal';
  const reportLabel =
    reportType === 'adult-child'
      ? 'Adult / Child (មនុស្សពេញវ័យ និងកុមារ)'
      : reportType === 'infants'
        ? 'Infants (ទារក)'
        : 'PNTT';

  return (
    <div className="w-full overflow-hidden border border-border bg-card">
      <div className="w-full border-b border-border bg-muted px-6 pt-2 pb-4 text-center">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">{reportTitle}</h1>
      </div>
      <table className="w-full border-collapse text-sm">
        <tbody>
          <tr className="border-b border-border">
            <td className="w-1/4 border-b border-r border-border bg-muted px-4 py-3 font-semibold text-foreground">Facility:</td>
            <td className="w-1/4 border-b border-r border-border bg-background px-4 py-3 text-foreground">{selectedSite ? selectedSite.name : '-'}</td>
            <td className="w-1/4 border-b border-r border-border bg-muted px-4 py-3 font-semibold text-foreground">Site Code:</td>
            <td className="w-1/4 border-b border-border bg-background px-4 py-3 text-foreground">{selectedSite ? selectedSite.code : '-'}</td>
          </tr>
          <tr>
            <td className="border-r border-border bg-muted px-4 py-3 font-semibold text-foreground">Period:</td>
            <td className="border-r border-border bg-background px-4 py-3 text-foreground">
              {currentPeriod.startDate} to {currentPeriod.endDate}
            </td>
            <td className="border-r border-border bg-muted px-4 py-3 font-semibold text-foreground">Report:</td>
            <td className="bg-background px-4 py-3 text-foreground">
              {reportLabel}
            </td>
          </tr>
        </tbody>
      </table>

      <Separator />

      <div className="border-t border-border p-4">
        {loading && !hasRows ? (
          <div className="flex h-44 w-full items-center justify-center border border-border bg-muted/30">
            <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <RiLoader4Line className="size-4 animate-spin" />
              Loading report...
            </div>
          </div>
        ) : !hasRows ? (
          <div className="flex h-44 w-full items-center justify-center border border-border bg-muted/20 text-sm text-muted-foreground">
            No data yet. Choose site/period and click Run.
          </div>
        ) : isAdultChild ? (
          <div className="bg-card border border-border/50 overflow-hidden">
            <div className="max-h-[520px] overflow-auto">
              <table className="w-full border-collapse">
                <thead className="bg-muted border-b border-border/50 sticky top-0">
                  <tr>
                    <th className="w-[52%] px-4 py-3 text-left text-sm font-semibold text-foreground border-r border-border/50">សូចនាករ </th>
                    <th className="px-3 py-3 text-right text-sm font-semibold text-foreground w-24 border-r border-border/50">អាយុ</th>
                    <th className="px-3 py-3 text-right text-sm font-semibold text-foreground w-32 border-r border-border/50">ប្រុស</th>
                    <th className="px-3 py-3 text-right text-sm font-semibold text-foreground w-32 border-r border-border/50">ស្រី</th>
                    <th className="px-3 py-3 text-right text-sm font-semibold text-foreground w-32 border-r border-border/50">សរុប</th>
                    {showQueryMs && <th className="px-3 py-4 text-right text-sm font-bold text-foreground w-28">ms</th>}
                  </tr>
                </thead>
                <tbody className="bg-card divide-y divide-border/50">
                  {adultChildRows.map((item, idx) => (
                    <Fragment key={`${item.indicator}-${idx}`}>
                      <tr className="hover:bg-muted/20">
                        <td
                          rowSpan={3}
                          className="px-4 py-3 border-r border-border/50 align-middle text-sm font-medium cursor-pointer hover:bg-muted/40"
                          onClick={() => onAdultChildCellClick?.(item, 'all', 'all')}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              onAdultChildCellClick?.(item, 'all', 'all');
                            }
                          }}
                        >
                          {(() => {
                            const { khmerPart, englishPart } = splitIndicatorLabel(item.indicator);
                            return (
                              <div className="leading-relaxed">
                                <div>{khmerPart}</div>
                                {englishPart && <div className="text-muted-foreground">({englishPart})</div>}
                              </div>
                            );
                          })()}
                        </td>
                        <td className="px-3 py-3 border-r border-border/50 text-right text-sm">{item.younger.age}</td>
                        <td
                          className="px-3 py-3 border-r border-border/50 text-right tabular-nums cursor-pointer hover:bg-muted/40"
                          onClick={() => onAdultChildCellClick?.(item, 'younger', 'male')}
                        >
                          {formatValue(item.younger.male)}
                        </td>
                        <td
                          className="px-3 py-3 border-r border-border/50 text-right tabular-nums cursor-pointer hover:bg-muted/40"
                          onClick={() => onAdultChildCellClick?.(item, 'younger', 'female')}
                        >
                          {formatValue(item.younger.female)}
                        </td>
                        <td
                          className="px-3 py-3 border-r border-border/50 text-right tabular-nums font-medium cursor-pointer hover:bg-muted/40"
                          onClick={() => onAdultChildCellClick?.(item, 'younger', 'total')}
                        >
                          {formatValue(item.younger.total)}
                        </td>
                        {showQueryMs && (
                          <td rowSpan={3} className="px-3 py-3 text-right tabular-nums text-muted-foreground align-middle">
                            {item.queryMs != null ? formatValue(item.queryMs) : '-'}
                          </td>
                        )}
                      </tr>
                      <tr className="hover:bg-muted/20">
                        <td className="px-3 py-3 border-r border-border/50 text-right text-sm">{item.older.age}</td>
                        <td
                          className="px-3 py-3 border-r border-border/50 text-right tabular-nums cursor-pointer hover:bg-muted/40"
                          onClick={() => onAdultChildCellClick?.(item, 'older', 'male')}
                        >
                          {formatValue(item.older.male)}
                        </td>
                        <td
                          className="px-3 py-3 border-r border-border/50 text-right tabular-nums cursor-pointer hover:bg-muted/40"
                          onClick={() => onAdultChildCellClick?.(item, 'older', 'female')}
                        >
                          {formatValue(item.older.female)}
                        </td>
                        <td
                          className="px-3 py-3 border-r border-border/50 text-right tabular-nums font-medium cursor-pointer hover:bg-muted/40"
                          onClick={() => onAdultChildCellClick?.(item, 'older', 'total')}
                        >
                          {formatValue(item.older.total)}
                        </td>
                      </tr>
                      <tr className="bg-muted/60 hover:bg-muted/70">
                        <td className="px-3 py-3 border-r border-border/50 text-right text-sm font-semibold">{item.subtotal.age}</td>
                        <td
                          className="px-3 py-3 border-r border-border/50 text-right tabular-nums font-semibold text-blue-600 cursor-pointer hover:bg-muted/40"
                          onClick={() => onAdultChildCellClick?.(item, 'subtotal', 'male')}
                        >
                          {formatValue(item.subtotal.male)}
                        </td>
                        <td
                          className="px-3 py-3 border-r border-border/50 text-right tabular-nums font-semibold text-pink-600 cursor-pointer hover:bg-muted/40"
                          onClick={() => onAdultChildCellClick?.(item, 'subtotal', 'female')}
                        >
                          {formatValue(item.subtotal.female)}
                        </td>
                        <td
                          className="px-3 py-3 border-r border-border/50 text-right tabular-nums font-bold underline cursor-pointer hover:bg-muted/40"
                          onClick={() => onAdultChildCellClick?.(item, 'subtotal', 'total')}
                        >
                          {formatValue(item.subtotal.total)}
                        </td>
                      </tr>
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : isSectionedReport && reportType !== 'infants' && reportType !== 'pntt' ? (
          <div className="grid gap-3 md:grid-cols-2">
            {previewRows.map((section, idx) => {
              const sectionRows = Array.isArray(section.rows) ? section.rows : [];
              return (
                <div key={`${section.scriptId}-${idx}`} className="rounded-lg border bg-muted/15 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="truncate text-sm font-medium">{section.scriptId}</div>
                    <Badge variant="outline" className="rounded-none">{sectionRows.length} rows</Badge>
                  </div>
                  {section.error && (
                    <div className="mt-1 text-[11px] text-destructive">{section.error}</div>
                  )}
                  {typeof section.queryMs === 'number' && (
                    <div className="mt-1 text-[11px] text-muted-foreground">Query time: {section.queryMs} ms</div>
                  )}
                  <div className="mt-2 max-h-40 overflow-auto rounded-md bg-background p-2 text-xs text-muted-foreground">
                    <pre>{JSON.stringify(sectionRows.slice(0, 2), null, 2)}</pre>
                  </div>
                </div>
              );
            })}
          </div>
        ) : reportType === 'infants' &&
          hasRows &&
          typeof previewRows[0] === 'object' &&
          Object.prototype.hasOwnProperty.call(previewRows[0], 'sectionNumber') &&
          Object.prototype.hasOwnProperty.call(previewRows[0], 'rows') ? (
          <div className="overflow-x-auto border border-border">
            <InfantReportTable sections={previewRows} loading={loading} formatValue={formatValue} onCellClick={onInfantCellClick} />
          </div>
        ) : reportType === 'pntt' &&
          hasRows &&
          typeof previewRows[0] === 'object' &&
          Object.prototype.hasOwnProperty.call(previewRows[0], 'sectionNumber') &&
          Object.prototype.hasOwnProperty.call(previewRows[0], 'rows') ? (
          <div className="overflow-x-auto border border-border p-3">
            <PnttReportTable sections={previewRows} formatValue={formatValue} onCellClick={onPnttCellClick} />
          </div>
        ) : !isAdultChild &&
          hasRows &&
          typeof previewRows[0] === 'object' &&
          Object.prototype.hasOwnProperty.call(previewRows[0], 'sectionNumber') &&
          Object.prototype.hasOwnProperty.call(previewRows[0], 'rows') ? (
          <div className="overflow-x-auto border border-border">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-border bg-muted">
                  <th className="border-r border-border px-3 py-2 text-left font-semibold">Category</th>
                  <th className="border-r border-border px-3 py-2 text-right font-semibold">Male</th>
                  <th className="border-r border-border px-3 py-2 text-right font-semibold">Female</th>
                  <th className="px-3 py-2 text-right font-semibold">Total</th>
                </tr>
              </thead>
              <tbody>
                {previewRows.map((section, sectionIdx) => {
                  const rows = Array.isArray(section.rows) ? section.rows : [];
                  const rowCount = Math.max(rows.length, 1);
                  return rows.length > 0 ? (
                    rows.map((row, rowIdx) => (
                      <tr key={`${section.sectionNumber}-${rowIdx}`} className={row.isSubtotal ? 'bg-muted/40 font-semibold' : ''}>
                        {rowIdx === 0 && (
                          <td rowSpan={rowCount} className="border-r border-b border-border px-3 py-2 align-top font-medium">
                            {section.sectionNumber}. {section.sectionLabelEn || section.sectionLabelKh || `Section ${sectionIdx + 1}`}
                          </td>
                        )}
                        <td className="border-r border-b border-border px-3 py-2 text-right tabular-nums">{formatValue(row.male)}</td>
                        <td className="border-r border-b border-border px-3 py-2 text-right tabular-nums">{formatValue(row.female)}</td>
                        <td className="border-b border-border px-3 py-2 text-right tabular-nums">{formatValue(row.total)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr key={`${section.sectionNumber}-empty`}>
                      <td className="border-r border-b border-border px-3 py-2 align-top font-medium">
                        {section.sectionNumber}. {section.sectionLabelEn || section.sectionLabelKh || `Section ${sectionIdx + 1}`}
                      </td>
                      <td className="border-r border-b border-border px-3 py-2 text-right">0</td>
                      <td className="border-r border-b border-border px-3 py-2 text-right">0</td>
                      <td className="border-b border-border px-3 py-2 text-right">0</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="max-h-[520px] overflow-auto border border-border">
            <Table>
              <TableHeader className="sticky top-0 bg-muted">
                <TableRow>
                  {Object.keys(previewRows[0] || {}).map((key) => (
                    <TableHead key={key} className="text-foreground font-semibold">{key}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {previewRows.map((row, idx) => (
                  <TableRow key={idx}>
                    {Object.keys(previewRows[0] || {}).map((key) => (
                      <TableCell key={key}>{formatValue(row?.[key])}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
      <div className="flex items-center justify-end gap-2 border-t border-border px-4 py-3">
        {isAdultChild && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowQueryMs((v) => !v)}
            className="h-8 rounded-none px-3 text-xs inline-flex items-center gap-1.5"
          >
            {showQueryMs ? <RiEyeOffLine className="size-3.5" /> : <RiEyeLine className="size-3.5" />}
            {showQueryMs ? 'Hide ms' : 'Show ms'}
          </Button>
        )}
        {runTimeMs != null && (
          <Badge variant="outline" className="h-8 rounded-none px-3 text-xs inline-flex items-center gap-1.5">
            <RiTimeLine className="size-3.5" />
            {runTimeMs} ms
          </Badge>
        )}
        {isAdultChild && loading && progress.total > 0 && (
          <Badge variant="outline" className="h-8 rounded-none px-3 text-xs inline-flex items-center">
            {progress.completed}/{progress.total} indicators
          </Badge>
        )}
        <Badge variant="secondary" className="h-8 rounded-none px-3 text-xs inline-flex items-center gap-1.5">
          <RiListCheck className="size-3.5" />
          {previewRows.length.toLocaleString()} rows
        </Badge>
      </div>
    </div>
  );
}
