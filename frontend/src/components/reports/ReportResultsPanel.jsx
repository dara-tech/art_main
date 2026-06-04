import { Fragment, useEffect, useState } from 'react';
import { RiEyeLine, RiEyeOffLine, RiLoader4Line, RiListCheck, RiTimeLine } from '@remixicon/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import InfantReportTable from './InfantReportTable';
import PnttReportTable from './PnttReportTable';

export default function ReportResultsPanel({
  reportHeaderMeta,
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
  onPnttCellClick,
  dataSource,
  useAnalyticsSetting
}) {
  const [showQueryMs, setShowQueryMs] = useState(false);
  const [showEacIndicators, setShowEacIndicators] = useState(false);
  const [sectionLoadElapsedMs, setSectionLoadElapsedMs] = useState(0);
  const isSectionReport = reportType === 'infants' || reportType === 'pntt';
  const sectionReportLoading = Boolean(loading && isSectionReport);

  const [enabledReportIndicators, setEnabledReportIndicators] = useState(() => {
    try {
      const stored = localStorage.getItem('app-enabled-report-indicators');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    const handleConfigChange = () => {
      try {
        const stored = localStorage.getItem('app-enabled-report-indicators');
        setEnabledReportIndicators(stored ? JSON.parse(stored) : []);
      } catch (e) {
        setEnabledReportIndicators([]);
      }
    };
    window.addEventListener('app-enabled-report-indicators-changed', handleConfigChange);
    return () => window.removeEventListener('app-enabled-report-indicators-changed', handleConfigChange);
  }, []);

  useEffect(() => {
    if (!sectionReportLoading) {
      setSectionLoadElapsedMs(0);
      return undefined;
    }
    const t0 = performance.now();
    const id = window.setInterval(() => {
      setSectionLoadElapsedMs(Math.round(performance.now() - t0));
    }, 100);
    return () => clearInterval(id);
  }, [sectionReportLoading]);
  const splitIndicatorLabel = (label) => {
    const text = String(label || '').trim();
    let numberPrefix = '';
    let mainText = text;
    
    const numMatch = text.match(/^((?:\(old\)\s*)?\d+(?:\.\d+)*\.?)\s+(.*)/i);
    if (numMatch) {
      numberPrefix = numMatch[1].trim().replace(/\.$/, '');
      mainText = numMatch[2].trim();
    }
    
    const match = mainText.match(/^(.*)\s\(([^()]*)\)\s*$/);
    if (!match) return { numberPrefix, khmerPart: mainText, englishPart: '' };
    return { numberPrefix, khmerPart: match[1].trim(), englishPart: match[2].trim() };
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
    <div className="w-full overflow-hidden border border-border/80 bg-card shadow-xl shadow-black/6">
      <div className="h-1.5 w-full bg-primary" />
      <div className="w-full border-b border-border/80 bg-muted/65 px-3 py-3 text-center sm:px-4">
        <h1 className="text-base font-bold tracking-tight text-foreground sm:text-lg">{reportTitle}</h1>
      </div>
      <table className="w-full border-collapse text-xs">
        <tbody>
          <tr className="border-b border-border/80">
            <td className="w-1/4 border-b border-r border-border/80 bg-muted/55 px-3 py-2.5 font-semibold text-foreground">
              {reportHeaderMeta?.scopeLabel ?? 'Facility:'}
            </td>
            <td className="w-1/4 border-b border-r border-border/80 bg-background px-3 py-2.5 text-foreground">
              {reportHeaderMeta?.scopeValue ?? '-'}
            </td>
            <td className="w-1/4 border-b border-r border-border/80 bg-muted/55 px-3 py-2.5 font-semibold text-foreground">Site Code:</td>
            <td className="w-1/4 border-b border-border/80 bg-background px-3 py-2.5 text-foreground">
              {reportHeaderMeta?.siteCodeValue ?? '-'}
            </td>
          </tr>
          <tr>
            <td className="border-r border-border/80 bg-muted/55 px-3 py-2.5 font-semibold text-foreground">Period:</td>
            <td className="border-r border-border/80 bg-background px-3 py-2.5 text-foreground">
              {currentPeriod.startDate} to {currentPeriod.endDate}
            </td>
            <td className="border-r border-border/80 bg-muted/55 px-3 py-2.5 font-semibold text-foreground">Report:</td>
            <td className="bg-background px-3 py-2.5 text-foreground">
              {reportLabel}
            </td>
          </tr>
        </tbody>
      </table>

      <Separator />

      <div className="border-t border-border/80 p-3 sm:p-4">
        {loading && !hasRows ? (
          <div className="flex h-44 w-full items-center justify-center border border-border/80 bg-muted/25 shadow-inner">
            <div className="inline-flex items-center gap-2 text-xs text-muted-foreground">
              <RiLoader4Line className="size-4 animate-spin" />
              Loading report...
            </div>
          </div>
        ) : !hasRows ? (
          <div className="flex h-44 w-full items-center justify-center border border-border/80 bg-muted/20 text-xs text-muted-foreground shadow-inner">
            No data yet. Choose site/period and click Run.
          </div>
        ) : isAdultChild ? (
          <div className="overflow-hidden border border-border/80 bg-card shadow-sm">
            <div className="max-h-[520px] overflow-auto">
              <table className="w-full border-collapse">
                <thead className="sticky top-0 border-b border-border/20 bg-muted/95 backdrop-blur-md">
                  <tr className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    <th className="w-10 whitespace-nowrap border-r border-border/20 px-2 py-2 text-center"></th>
                    <th className="w-16 whitespace-nowrap border-r border-border/20 px-2 py-2 text-center"></th>
                    <th className="w-[45%] border-r border-border/20 px-3 py-2 text-left">សូចនាករ </th>
                    <th className="w-24 border-r border-border/20 px-3 py-2 text-right">អាយុ</th>
                    <th className="w-32 border-r border-border/20 px-3 py-2 text-right">ប្រុស</th>
                    <th className="w-32 border-r border-border/20 px-3 py-2 text-right">ស្រី</th>
                    <th className="w-32 border-r border-border/20 px-3 py-2 text-right">សរុប</th>
                    {showQueryMs && <th className="w-28 px-3 py-2 text-right font-semibold">ms</th>}
                  </tr>
                </thead>
                <tbody className="bg-card divide-y divide-border/20">
                  {(() => {
                    const visibleRows = adultChildRows.filter((item) => {
                      const label = String(item.indicator || '');
                      if (label.startsWith('10.4.1') || label.startsWith('11.4.1')) return false;
                      
                      if (enabledReportIndicators && enabledReportIndicators.length > 0) {
                        if (!enabledReportIndicators.includes(item.rawIndicator)) return false;
                      }

                      if (showEacIndicators) return true;
                      return !['11.9.', '11.10.', '11.11.', '11.12.', '11.13.', '11.14.'].some(prefix => label.startsWith(prefix));
                    });
                    
                    const rowsWithMeta = visibleRows.map((item, idx) => {
                      const { numberPrefix, khmerPart, englishPart } = splitIndicatorLabel(item.indicator);
                      let mainNum = `no-num-${idx}`;
                      if (numberPrefix) {
                        const m = numberPrefix.match(/\d+/);
                        if (m) mainNum = m[0];
                        if (numberPrefix.includes('(old)')) mainNum = `(old) ${mainNum}`;
                      }
                      return { ...item, idx, numberPrefix, khmerPart, englishPart, mainNum };
                    });
                    
                    let currentMainNum = null;
                    let currentGroupStartIdx = -1;
                    for (let i = 0; i < rowsWithMeta.length; i++) {
                      const row = rowsWithMeta[i];
                      if (row.mainNum !== currentMainNum) {
                        currentMainNum = row.mainNum;
                        currentGroupStartIdx = i;
                        row.isFirstInGroup = true;
                        row.groupSpan = 1;
                      } else {
                        row.isFirstInGroup = false;
                        rowsWithMeta[currentGroupStartIdx].groupSpan += 1;
                      }
                    }
                    
                    return rowsWithMeta.map((item) => {
                      const { idx, numberPrefix, khmerPart, englishPart, isFirstInGroup, groupSpan, mainNum } = item;
                    return (
                      <Fragment key={`${item.indicator}-${idx}`}>
                        <tr className="hover:bg-muted/20 transition-colors duration-150">
                          {isFirstInGroup && (
                            <td
                              rowSpan={groupSpan * 3}
                              colSpan={groupSpan === 1 ? 2 : 1}
                              className="border-r border-border/20 px-2 py-2 text-center align-middle text-[11px] font-bold text-muted-foreground bg-muted/5"
                            >
                              {mainNum.startsWith('no-num') ? (idx + 1) : mainNum}
                            </td>
                          )}
                          {(!isFirstInGroup || groupSpan > 1) && (
                            <td
                              rowSpan={3}
                              className="whitespace-nowrap border-r border-border/20 px-2 py-2 text-center align-middle text-[11px] font-bold text-muted-foreground bg-muted/5"
                            >
                              {numberPrefix === mainNum ? '' : (numberPrefix || '-')}
                            </td>
                          )}
                          <td
                            rowSpan={3}
                            className="cursor-pointer border-r border-border/20 px-3 py-2 align-middle text-xs font-medium hover:bg-muted/30 transition-colors duration-150"
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
                              <div className="leading-snug">
                                <div>{khmerPart}</div>
                                {englishPart && (
                                  <div className="text-[11px] text-muted-foreground">({englishPart})</div>
                                )}
                              </div>
                            </td>
                            <td className="border-r border-border/20 px-3 py-2 text-right text-xs">{item.younger.age}</td>
                          <td
                            className="cursor-pointer border-r border-border/20 px-3 py-2 text-right text-xs tabular-nums hover:bg-muted/30 transition-colors duration-150"
                            onClick={() => onAdultChildCellClick?.(item, 'younger', 'male')}
                          >
                            {formatValue(item.younger.male)}
                          </td>
                          <td
                            className="cursor-pointer border-r border-border/20 px-3 py-2 text-right text-xs tabular-nums hover:bg-muted/30 transition-colors duration-150"
                            onClick={() => onAdultChildCellClick?.(item, 'younger', 'female')}
                          >
                            {formatValue(item.younger.female)}
                          </td>
                          <td
                            className="cursor-pointer border-r border-border/20 px-3 py-2 text-right text-xs font-medium tabular-nums hover:bg-muted/30 transition-colors duration-150"
                            onClick={() => onAdultChildCellClick?.(item, 'younger', 'total')}
                          >
                            {formatValue(item.younger.total)}
                          </td>
                          {showQueryMs && (
                            <td rowSpan={3} className="border-border/20 px-3 py-2 align-middle text-right text-xs tabular-nums text-muted-foreground">
                              {item.queryMs != null ? formatValue(item.queryMs) : '-'}
                            </td>
                          )}
                        </tr>
                        <tr className="hover:bg-muted/20 transition-colors duration-150">
                          <td className="border-r border-border/20 px-3 py-2 text-right text-xs">{item.older.age}</td>
                          <td
                            className="cursor-pointer border-r border-border/20 px-3 py-2 text-right text-xs tabular-nums hover:bg-muted/30 transition-colors duration-150"
                            onClick={() => onAdultChildCellClick?.(item, 'older', 'male')}
                          >
                            {formatValue(item.older.male)}
                          </td>
                          <td
                            className="cursor-pointer border-r border-border/20 px-3 py-2 text-right text-xs tabular-nums hover:bg-muted/30 transition-colors duration-150"
                            onClick={() => onAdultChildCellClick?.(item, 'older', 'female')}
                          >
                            {formatValue(item.older.female)}
                          </td>
                          <td
                            className="cursor-pointer border-r border-border/20 px-3 py-2 text-right text-xs font-medium tabular-nums hover:bg-muted/30 transition-colors duration-150"
                            onClick={() => onAdultChildCellClick?.(item, 'older', 'total')}
                          >
                            {formatValue(item.older.total)}
                          </td>
                        </tr>
                        <tr className="bg-muted/10 hover:bg-muted/20 transition-colors duration-150">
                          <td className="border-r border-border/20 px-3 py-2 text-right text-xs font-semibold">{item.subtotal.age}</td>
                          <td
                            className="cursor-pointer border-r border-border/20 px-3 py-2 text-right text-xs font-semibold tabular-nums text-report-male hover:bg-muted/30 transition-colors duration-150"
                            onClick={() => onAdultChildCellClick?.(item, 'subtotal', 'male')}
                          >
                            {formatValue(item.subtotal.male)}
                          </td>
                          <td
                            className="cursor-pointer border-r border-border/20 px-3 py-2 text-right text-xs font-semibold tabular-nums text-report-female hover:bg-muted/30 transition-colors duration-150"
                            onClick={() => onAdultChildCellClick?.(item, 'subtotal', 'female')}
                          >
                            {formatValue(item.subtotal.female)}
                          </td>
                          <td
                            className="cursor-pointer border-r border-border/20 px-3 py-2 text-right text-xs font-bold tabular-nums underline hover:bg-muted/30 transition-colors duration-150"
                            onClick={() => onAdultChildCellClick?.(item, 'subtotal', 'total')}
                          >
                            {formatValue(item.subtotal.total)}
                          </td>
                        </tr>
                    </Fragment>
                    );
                  });
                })()}
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
                    <div className="truncate text-xs font-medium">{section.scriptId}</div>
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
          <div className="overflow-x-auto border border-border/80 shadow-sm">
            <InfantReportTable sections={previewRows} loading={loading} formatValue={formatValue} onCellClick={onInfantCellClick} />
          </div>
        ) : reportType === 'pntt' &&
          hasRows &&
          typeof previewRows[0] === 'object' &&
          Object.prototype.hasOwnProperty.call(previewRows[0], 'sectionNumber') &&
          Object.prototype.hasOwnProperty.call(previewRows[0], 'rows') ? (
          <div className="overflow-x-auto border border-border/80 p-3 shadow-sm">
            <PnttReportTable sections={previewRows} loading={loading} formatValue={formatValue} onCellClick={onPnttCellClick} />
          </div>
        ) : !isAdultChild &&
          hasRows &&
          typeof previewRows[0] === 'object' &&
          Object.prototype.hasOwnProperty.call(previewRows[0], 'sectionNumber') &&
          Object.prototype.hasOwnProperty.call(previewRows[0], 'rows') ? (
          <div className="overflow-x-auto border border-border/20">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="border-b border-border/20 bg-muted/15 text-[10px] font-semibold text-muted-foreground/85 uppercase tracking-wider">
                  <th className="border-r border-border/20 px-3 py-2 text-left font-semibold">Category</th>
                  <th className="border-r border-border/20 px-3 py-2 text-right font-semibold">Male</th>
                  <th className="border-r border-border/20 px-3 py-2 text-right font-semibold">Female</th>
                  <th className="px-3 py-2 text-right font-semibold">Total</th>
                </tr>
              </thead>
              <tbody>
                {previewRows.map((section, sectionIdx) => {
                  const rows = Array.isArray(section.rows) ? section.rows : [];
                  const rowCount = Math.max(rows.length, 1);
                  return rows.length > 0 ? (
                    rows.map((row, rowIdx) => (
                      <tr key={`${section.sectionNumber}-${rowIdx}`} className={row.isSubtotal ? 'bg-muted/10 font-semibold' : ''}>
                        {rowIdx === 0 && (
                          <td rowSpan={rowCount} className="border-r border-b border-border/20 px-3 py-2 align-top font-medium">
                            {section.sectionNumber}. {section.sectionLabelEn || section.sectionLabelKh || `Section ${sectionIdx + 1}`}
                          </td>
                        )}
                        <td className="border-r border-b border-border/20 px-3 py-2 text-right tabular-nums">{formatValue(row.male)}</td>
                        <td className="border-r border-b border-border/20 px-3 py-2 text-right tabular-nums">{formatValue(row.female)}</td>
                        <td className="border-b border-border/20 px-3 py-2 text-right tabular-nums">{formatValue(row.total)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr key={`${section.sectionNumber}-empty`}>
                      <td className="border-r border-b border-border/20 px-3 py-2 align-top font-medium">
                        {section.sectionNumber}. {section.sectionLabelEn || section.sectionLabelKh || `Section ${sectionIdx + 1}`}
                      </td>
                      <td className="border-r border-b border-border/20 px-3 py-2 text-right">0</td>
                      <td className="border-r border-b border-border/20 px-3 py-2 text-right">0</td>
                      <td className="border-b border-border/20 px-3 py-2 text-right">0</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="max-h-[520px] overflow-auto border border-border/20">
            <Table>
              <TableHeader className="sticky top-0 bg-muted/15">
                <TableRow>
                  {Object.keys(previewRows[0] || {}).map((key) => (
                    <TableHead key={key} className="text-muted-foreground/85 font-semibold text-[10px] uppercase tracking-wider">{key}</TableHead>
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
          <div className="flex items-center gap-2 mr-auto">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowQueryMs((v) => !v)}
              className="h-8 rounded-md px-3 text-xs inline-flex items-center gap-1.5"
            >
              {showQueryMs ? <RiEyeOffLine className="size-3.5" /> : <RiEyeLine className="size-3.5" />}
              {showQueryMs ? 'Hide ms' : 'Show ms'}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowEacIndicators((v) => !v)}
              className="h-8 rounded-md px-3 text-xs inline-flex items-center gap-1.5"
            >
              {showEacIndicators ? <RiEyeOffLine className="size-3.5" /> : <RiEyeLine className="size-3.5" />}
              {showEacIndicators ? 'Hide EAC (11.9-11.14)' : 'Show EAC (11.9-11.14)'}
            </Button>
          </div>
        )}
        {isAdultChild && loading && progress.total > 0 && (
          <Badge variant="outline" className="h-8 rounded-md border-border px-3 text-xs inline-flex items-center bg-background">
            {progress.completed}/{progress.total} indicators
          </Badge>
        )}
        {isSectionReport && (sectionReportLoading || runTimeMs != null) && (
          <div
            className={cn(
              'inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-background px-3 text-xs font-normal text-foreground tabular-nums',
              sectionReportLoading && 'shadow-sm'
            )}
          >
            <RiTimeLine className="size-3.5 shrink-0 text-muted-foreground" />
            {sectionReportLoading ? sectionLoadElapsedMs : runTimeMs} ms
          </div>
        )}
        {!isSectionReport && runTimeMs != null && (
          <Badge variant="outline" className="h-8 rounded-md border-border px-3 text-xs inline-flex items-center gap-1.5 bg-background">
            <RiTimeLine className="size-3.5" />
            {runTimeMs} ms
          </Badge>
        )}
        <div
          className={cn(
            'inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-normal text-foreground tabular-nums',
            isSectionReport
              ? 'border-0 bg-[#f5f2eb] text-foreground dark:bg-[#2c2822] dark:text-foreground'
              : 'border border-transparent bg-secondary text-secondary-foreground'
          )}
        >
          <RiListCheck className="size-3.5 shrink-0 opacity-80" />
          {previewRows.length.toLocaleString()} rows
        </div>
      </div>
    </div>
  );
}
