import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { RiClipboardLine } from '@remixicon/react';
import { cn } from '@/lib/utils';
import {
  P360_TABLE_BODY_ROW_INNER,
  P360_TABLE_TEXT,
  p360ControlClass,
  vizDeltaDownClass,
  vizDeltaUpClass,
  vizKpiCardClass
} from '../layout/appNavStyles';
import { VIZ_KH } from '../../pages/visualizeKh';
import Patient360DataTable from '../patient360/Patient360DataTable';
import {
  detailColumnLabel,
  formatDetailCellValue
} from '../../utils/indicatorDetailRecords';
import { fetchAllVisualizePatientRecords, fetchAllPatientStatusSnapshot } from '../../utils/visualizeDetailRecords';
import { copyTextToClipboard } from '../../utils/copyToClipboard';
import { rowsToCsv } from '../../utils/exportCsv';
import {
  comparePatientLists,
  defaultComparePeriodPair,
  enrichCompareWithTptReasons,
  isTptCompleteIndicator,
  listAllComparePeriodOptions,
  periodLabelForKey,
  resolveCompareChronology,
  resolveResultRawForPeriod,
  splitCompareByChronology
} from '../../utils/visualizePeriodCompare';
import {
  buildPatient360Target,
  P360_FROM_VISUALIZE_STATE,
  resolveClinicIdFromRow
} from '../../utils/patient360Navigation';

const DIFF_TABS = ['dropped', 'added'];

/** Columns for TPT 10.5 period compare (no full indicator detail row). */
const TPT_COMPARE_COLUMN_IDS = [
  'clinicid',
  'compare_in_105_older',
  'compare_in_105_newer',
  'compare_patient_status_older',
  'compare_patient_status_newer',
  'compare_patient_status_date_older',
  'compare_patient_status_date_newer',
  'compare_reason'
];

function fillKh(template, vars) {
  return String(template).replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ''));
}

function CompareSummaryCard({ periodALabel, periodBLabel, countA, countB, dropped, added, dropCounts }) {
  const stats = [
    { key: 'a', label: periodALabel || 'A', value: countA, valueClass: 'text-foreground' },
    { key: 'b', label: periodBLabel || 'B', value: countB, valueClass: 'text-foreground' },
    { key: 'dropped', label: VIZ_KH.chartCompareCardDropped, value: dropped, valueClass: vizDeltaDownClass },
    { key: 'added', label: VIZ_KH.chartCompareCardAdded, value: added, valueClass: vizDeltaUpClass }
  ];

  const breakdown = [
    { key: 'dead', label: VIZ_KH.chartCompareCardDead, value: dropCounts?.dead ?? 0 },
    { key: 'ltfu', label: VIZ_KH.chartCompareCardLtfu, value: dropCounts?.ltfu ?? 0 },
    { key: 'transfer', label: VIZ_KH.chartCompareCardTransfer, value: dropCounts?.transfer ?? 0 },
    { key: 'active', label: VIZ_KH.chartCompareCardActive, value: dropCounts?.active ?? 0 }
  ].filter((item) => item.value > 0);

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.key} className={vizKpiCardClass}>
            <p className={cn('truncate text-muted-foreground', P360_TABLE_TEXT)} title={stat.label}>
              {stat.label}
            </p>
            <p className={cn('text-base font-semibold tabular-nums leading-tight', stat.valueClass)}>
              {Number(stat.value).toLocaleString('km-KH')}
            </p>
          </div>
        ))}
      </div>
      {breakdown.length > 0 ? (
        <div className={cn(vizKpiCardClass, P360_TABLE_TEXT)}>
          <span className="text-muted-foreground">{VIZ_KH.chartCompareCardDropBreakdown}: </span>
          {breakdown.map((item, idx) => (
            <span key={item.key}>
              {idx > 0 ? <span className="text-muted-foreground/60"> · </span> : null}
              <span className="text-muted-foreground">{item.label}</span>{' '}
              <span className="font-semibold tabular-nums text-foreground">
                {item.value.toLocaleString('km-KH')}
              </span>
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function pickOtherPeriod(allOptions, currentKey, excludeKey) {
  const others = allOptions.filter((p) => p.key !== excludeKey);
  if (!others.length) return currentKey;
  if (currentKey !== excludeKey) return currentKey;
  return others[others.length - 1].key;
}

export default function VisualizePeriodComparePanel({
  detail,
  results = [],
  periods = [],
  catalog = [],
  pageContext = {},
  indicatorId,
  onNavigateToPatient360,
  onBeforeNavigateToPatient360,
  onClose
}) {
  const navigate = useNavigate();
  const clickedPeriodKey = detail?.raw?.periodKey;

  const allPeriodOptions = useMemo(
    () => listAllComparePeriodOptions(periods, results, detail?.raw),
    [periods, results, detail?.raw]
  );

  const canCompare = allPeriodOptions.length >= 2;

  const [periodAKey, setPeriodAKey] = useState('');
  const [periodBKey, setPeriodBKey] = useState('');
  const [diffTab, setDiffTab] = useState('dropped');
  const [loading, setLoading] = useState(false);
  const [loadProgress, setLoadProgress] = useState(null);
  const [error, setError] = useState('');
  const [compareResult, setCompareResult] = useState(null);

  useEffect(() => {
    setCompareResult(null);
    setError('');
    setDiffTab('dropped');
    if (!allPeriodOptions.length) {
      setPeriodAKey('');
      setPeriodBKey('');
      return;
    }
    const { periodA, periodB } = defaultComparePeriodPair(allPeriodOptions, clickedPeriodKey, '');
    setPeriodAKey(periodA);
    setPeriodBKey(periodB);
  }, [clickedPeriodKey, allPeriodOptions]);

  const periodALabel = periodLabelForKey(periods, periodAKey) || periodAKey;
  const periodBLabel = periodLabelForKey(periods, periodBKey) || periodBKey;

  const runCompare = useCallback(async () => {
    if (!detail?.raw || !periodAKey || !periodBKey || periodAKey === periodBKey || !canCompare) {
      if (periodAKey && periodBKey && periodAKey === periodBKey) {
        toast.message(VIZ_KH.chartCompareSamePeriod);
      }
      return;
    }
    setLoading(true);
    setError('');
    setCompareResult(null);
    setLoadProgress(null);
    try {
      const rawA = resolveResultRawForPeriod(results, detail.raw, periodAKey);
      const rawB = resolveResultRawForPeriod(results, detail.raw, periodBKey);
      if (!rawA || !rawB) throw new Error(VIZ_KH.chartDetailLoadFailed);

      const opts = { catalog, pageContext, periods, onProgress: setLoadProgress };
      const fetchAll = (raw) => fetchAllVisualizePatientRecords({ ...opts, raw });
      const [rowsA, rowsB] = await Promise.all([fetchAll(rawA), fetchAll(rawB)]);

      let result = comparePatientLists(rowsA, rowsB);
      const chronology = resolveCompareChronology(periodAKey, periodBKey, periods);
      const split = splitCompareByChronology(result, chronology);
      result = { ...result, chronology, dropped: split.dropped, added: split.added };

      if (isTptCompleteIndicator(rawA.indicatorId)) {
        result = await enrichCompareWithTptReasons({
          compareResult: result,
          results,
          baseRaw: detail.raw,
          periodAKey,
          periodBKey,
          periods,
          pageContext,
          fetchAllPatientStatus: ({ raw, pageContext: ctx, periods: periodList }) =>
            fetchAllPatientStatusSnapshot({
              raw,
              pageContext: ctx,
              periods: periodList,
              onProgress: setLoadProgress
            }),
          labels: VIZ_KH
        });
      }

      setCompareResult(result);
    } catch (e) {
      setError(e?.response?.data?.error || e?.message || VIZ_KH.chartDetailLoadFailed);
      setCompareResult(null);
    } finally {
      setLoading(false);
      setLoadProgress(null);
    }
  }, [
    detail,
    periodAKey,
    periodBKey,
    results,
    catalog,
    pageContext,
    periods,
    canCompare
  ]);

  useEffect(() => {
    if (!canCompare || !periodAKey || !periodBKey || periodAKey === periodBKey) return;
    runCompare();
  }, [periodAKey, periodBKey, canCompare, runCompare]);

  const handlePeriodAChange = (nextA) => {
    setPeriodAKey(nextA);
    if (nextA === periodBKey) {
      setPeriodBKey(pickOtherPeriod(allPeriodOptions, periodBKey, nextA));
    }
  };

  const handlePeriodBChange = (nextB) => {
    setPeriodBKey(nextB);
    if (nextB === periodAKey) {
      setPeriodAKey(pickOtherPeriod(allPeriodOptions, periodAKey, nextB));
    }
  };

  const chrono = compareResult?.chronology;

  const useTptCompareColumns = Boolean(
    chrono && isTptCompleteIndicator(indicatorId || detail?.raw?.indicatorId)
  );

  const activeRows = useMemo(() => {
    if (!compareResult) return [];
    if (diffTab === 'added') {
      return compareResult.added ?? compareResult.onlyInPeriodA ?? [];
    }
    return compareResult.dropped ?? compareResult.onlyInPeriodB ?? [];
  }, [compareResult, diffTab]);

  const includeSiteCol = useMemo(
    () =>
      !useTptCompareColumns &&
      (activeRows.some((r) => r.site_code) || pageContext.scopeMode === 'compare'),
    [activeRows, pageContext.scopeMode, useTptCompareColumns]
  );

  const exportColumnIds = useMemo(() => {
    if (useTptCompareColumns) {
      const ids = [...TPT_COMPARE_COLUMN_IDS];
      if (includeSiteCol) ids.splice(1, 0, 'site_code');
      return ids;
    }
    if (!activeRows.length) return ['clinicid'];
    const keys = new Set(['clinicid']);
    if (includeSiteCol) keys.add('site_code');
    for (const row of activeRows) {
      Object.keys(row).forEach((k) => {
        if (!k.startsWith('_') && row[k] != null && row[k] !== '') keys.add(k);
      });
    }
    return [...keys];
  }, [useTptCompareColumns, includeSiteCol, activeRows]);

  const linkKeys = new Set(['clinicid']);

  const openPatient360 = useCallback(
    (row) => {
      const target = buildPatient360Target(row, {
        detail,
        pageContext,
        indicatorId,
        section: useTptCompareColumns ? 'status' : undefined
      });
      if (!target?.path) {
        toast.error(VIZ_KH.chartDetailNoClinicId);
        return;
      }
      onBeforeNavigateToPatient360?.();
      onClose?.();
      if (onNavigateToPatient360) {
        onNavigateToPatient360(target.path);
      } else {
        navigate(target.path, { state: P360_FROM_VISUALIZE_STATE });
      }
    },
    [
      detail,
      pageContext,
      indicatorId,
      useTptCompareColumns,
      onNavigateToPatient360,
      onBeforeNavigateToPatient360,
      onClose,
      navigate
    ]
  );

  const columns = useMemo(() => {
    if (useTptCompareColumns && chrono) {
      const defs = [
        {
          id: 'clinicid',
          label: detailColumnLabel('clinicid'),
          width: 72,
          mono: true,
          getValue: (row) => formatDetailCellValue(row.clinicid ?? row.ClinicID)
        },
        ...(includeSiteCol
          ? [
              {
                id: 'site_code',
                label: detailColumnLabel('site_code'),
                width: 64,
                mono: true,
                getValue: (row) => formatDetailCellValue(row.site_code)
              }
            ]
          : []),
        {
          id: 'compare_in_105_older',
          label: fillKh(VIZ_KH.chartCompare105At, { period: chrono.olderLabel }),
          width: 110,
          getValue: (row) => row.compare_in_105_older || '—'
        },
        {
          id: 'compare_in_105_newer',
          label: fillKh(VIZ_KH.chartCompare105At, { period: chrono.newerLabel }),
          width: 110,
          getValue: (row) => row.compare_in_105_newer || '—'
        },
        {
          id: 'compare_patient_status_older',
          label: fillKh(VIZ_KH.chartComparePatientStatusAt, { period: chrono.olderLabel }),
          width: 140,
          getValue: (row) => row.compare_patient_status_older || '—'
        },
        {
          id: 'compare_patient_status_newer',
          label: fillKh(VIZ_KH.chartComparePatientStatusAt, { period: chrono.newerLabel }),
          width: 140,
          getValue: (row) => row.compare_patient_status_newer || '—'
        },
        {
          id: 'compare_patient_status_date_older',
          label: fillKh(VIZ_KH.chartComparePatientStatusDateAt, { period: chrono.olderLabel }),
          width: 96,
          mono: true,
          getValue: (row) => row.compare_patient_status_date_older || '—'
        },
        {
          id: 'compare_patient_status_date_newer',
          label: fillKh(VIZ_KH.chartComparePatientStatusDateAt, { period: chrono.newerLabel }),
          width: 96,
          mono: true,
          getValue: (row) => row.compare_patient_status_date_newer || '—'
        },
        {
          id: 'compare_reason',
          label: VIZ_KH.chartCompareReason,
          width: 220,
          getValue: (row) => row.compare_reason || '—'
        }
      ];

      return defs.map((col) => {
        if (!linkKeys.has(col.id)) return col;
        return {
          ...col,
          renderCell: (row, text) => {
            if (!resolveClinicIdFromRow(row) || text === '—') {
              return (
                <span className={cn(P360_TABLE_BODY_ROW_INNER, col.mono && 'font-mono tabular-nums')}>{text}</span>
              );
            }
            return (
              <button
                type="button"
                className={cn(
                  P360_TABLE_BODY_ROW_INNER,
                  'font-medium text-primary underline-offset-2 hover:underline',
                  col.mono && 'font-mono tabular-nums'
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  openPatient360(row);
                }}
              >
                {text}
              </button>
            );
          }
        };
      });
    }

    const keys = exportColumnIds.filter((k) => k !== 'site_code' || includeSiteCol);
    return keys.map((key) => {
        const col = {
          id: key,
          label: detailColumnLabel(key),
          width:
            key === 'clinicid' ? 72 : key === 'site_code' ? 64 : key === 'art_number' || key === 'Artnum' ? 96 : 108,
          mono: ['clinicid', 'Artnum', 'art_number', 'ART', 'HIVLoad', 'VLValue'].includes(key),
          getValue: (row) => formatDetailCellValue(row[key])
        };
        if (linkKeys.has(key)) {
          col.renderCell = (row, text) => {
            if (!resolveClinicIdFromRow(row) || text === '—') {
              return (
                <span className={cn(P360_TABLE_BODY_ROW_INNER, col.mono && 'font-mono tabular-nums')}>{text}</span>
              );
            }
            return (
              <button
                type="button"
                className={cn(
                  P360_TABLE_BODY_ROW_INNER,
                  'font-medium text-primary underline-offset-2 hover:underline',
                  col.mono && 'font-mono tabular-nums'
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  openPatient360(row);
                }}
              >
                {text}
              </button>
            );
          };
        }
        return col;
      });
  }, [
    useTptCompareColumns,
    chrono,
    exportColumnIds,
    includeSiteCol,
    detail,
    pageContext,
    indicatorId,
    openPatient360,
    onBeforeNavigateToPatient360,
    onClose
  ]);

  const tableRows = useMemo(
    () => activeRows.map((row, idx) => ({ ...row, _key: `${diffTab}-${idx}-${row.clinicid || idx}` })),
    [activeRows, diffTab]
  );

  const labelForExportKey = (k) => {
    if (k === 'compare_reason') return VIZ_KH.chartCompareReason;
    if (k === 'compare_in_105_older' && chrono) {
      return fillKh(VIZ_KH.chartCompare105At, { period: chrono.olderLabel });
    }
    if (k === 'compare_in_105_newer' && chrono) {
      return fillKh(VIZ_KH.chartCompare105At, { period: chrono.newerLabel });
    }
    if (k === 'compare_patient_status_older' && chrono) {
      return fillKh(VIZ_KH.chartComparePatientStatusAt, { period: chrono.olderLabel });
    }
    if (k === 'compare_patient_status_newer' && chrono) {
      return fillKh(VIZ_KH.chartComparePatientStatusAt, { period: chrono.newerLabel });
    }
    if (k === 'compare_patient_status_date_older' && chrono) {
      return fillKh(VIZ_KH.chartComparePatientStatusDateAt, { period: chrono.olderLabel });
    }
    if (k === 'compare_patient_status_date_newer' && chrono) {
      return fillKh(VIZ_KH.chartComparePatientStatusDateAt, { period: chrono.newerLabel });
    }
    return detailColumnLabel(k);
  };

  const handleCopyTab = async () => {
    if (!activeRows.length) {
      toast.error(VIZ_KH.copyClipboardEmpty);
      return;
    }
    const keys = exportColumnIds;
    const csv = rowsToCsv(keys, activeRows, {
      labelForKey: labelForExportKey,
      formatValue: (v) => formatDetailCellValue(v)
    });
    const ok = await copyTextToClipboard(csv);
    if (ok) toast.success(VIZ_KH.chartCompareCopySuccess);
    else toast.error(VIZ_KH.copyClipboardFailed);
  };

  if (!allPeriodOptions.length) {
    return (
      <p className={cn('px-5 py-10 text-muted-foreground', P360_TABLE_TEXT)}>{VIZ_KH.chartCompareNoOptions}</p>
    );
  }

  if (!canCompare) {
    return (
      <p className={cn('px-5 py-10 text-muted-foreground', P360_TABLE_TEXT)}>{VIZ_KH.chartCompareNeedTwoPeriods}</p>
    );
  }

  const droppedCount = compareResult?.dropped?.length ?? compareResult?.countOnlyB ?? 0;
  const addedCount = compareResult?.added?.length ?? compareResult?.countOnlyA ?? 0;

  const periodSelect = (id, label, value, onChange) => (
    <label key={id} className={cn('min-w-[8.5rem] flex-1 sm:max-w-[11rem]', P360_TABLE_TEXT)}>
      <span className="mb-0.5 block text-[10px] text-muted-foreground">{label}</span>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(p360ControlClass, 'h-8 w-full')}
        disabled={loading}
      >
        {allPeriodOptions.map((p) => (
          <option key={p.key} value={p.key}>
            {p.label}
          </option>
        ))}
      </select>
    </label>
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex shrink-0 flex-wrap items-end gap-2 border-b border-border/80 bg-muted/15 px-5 py-2">
        {periodSelect('viz-compare-period-a', VIZ_KH.chartComparePeriodA, periodAKey, handlePeriodAChange)}
        {periodSelect('viz-compare-period-b', VIZ_KH.chartComparePeriodB, periodBKey, handlePeriodBChange)}
        <button
          type="button"
          className={cn(p360ControlClass, 'h-8 shrink-0 px-3 hover:bg-muted')}
          disabled={loading || !periodAKey || !periodBKey || periodAKey === periodBKey}
          onClick={runCompare}
        >
          {VIZ_KH.chartCompareRun}
        </button>
      </div>

      {loading ? (
        <div
          className={cn(
            'flex flex-1 flex-col items-center justify-center gap-2 py-12 text-muted-foreground',
            P360_TABLE_TEXT
          )}
        >
          <span className="size-5 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground" />
          <span>{VIZ_KH.chartCompareLoading}</span>
          {loadProgress?.total ? (
            <span className="tabular-nums text-[10px]">
              {loadProgress.loaded.toLocaleString('km-KH')} / {loadProgress.total.toLocaleString('km-KH')}
            </span>
          ) : null}
        </div>
      ) : error ? (
        <p className={cn('px-5 py-10 text-destructive', P360_TABLE_TEXT)}>{error}</p>
      ) : compareResult ? (
        <>
          <div className="shrink-0 border-b border-border/80 bg-muted/10 px-5 py-2">
            <CompareSummaryCard
              periodALabel={periodALabel}
              periodBLabel={periodBLabel}
              countA={compareResult.countA}
              countB={compareResult.countB}
              dropped={droppedCount}
              added={addedCount}
              dropCounts={compareResult.dropReasonCounts}
            />
            <div className="mt-2 flex flex-wrap gap-0.5 border-t border-border/70 pt-2" role="tablist">
              {DIFF_TABS.map((id) => {
                const count = id === 'dropped' ? droppedCount : addedCount;
                const label =
                  id === 'dropped' && chrono
                    ? fillKh(VIZ_KH.chartCompareDropped, { n: count, newer: chrono.newerLabel })
                    : chrono
                      ? fillKh(VIZ_KH.chartCompareAdded, { n: count, newer: chrono.newerLabel })
                      : id === 'dropped'
                        ? fillKh(VIZ_KH.chartCompareDropped, { n: count, newer: '' })
                        : fillKh(VIZ_KH.chartCompareAdded, { n: count, newer: '' });
                return (
                  <button
                    key={id}
                    type="button"
                    role="tab"
                    aria-selected={diffTab === id}
                    className={cn(
                      p360ControlClass,
                      'h-7 px-2.5',
                      diffTab === id && 'border-primary/50 bg-primary/10 text-foreground'
                    )}
                    onClick={() => setDiffTab(id)}
                  >
                    {label}
                  </button>
                );
              })}
              <button
                type="button"
                className={cn(p360ControlClass, 'ml-auto inline-flex h-7 items-center gap-1 px-2.5')}
                onClick={handleCopyTab}
                disabled={!activeRows.length}
                title={VIZ_KH.chartCompareCopyTab}
              >
                <RiClipboardLine className="size-3.5" aria-hidden />
                {VIZ_KH.chartCompareCopyTab}
              </button>
            </div>
            <p className={cn('mt-1.5 text-[10px] text-muted-foreground', P360_TABLE_TEXT)}>
              {diffTab === 'dropped' && chrono
                ? fillKh(VIZ_KH.chartCompareDroppedHint, {
                    older: chrono.olderLabel,
                    newer: chrono.newerLabel
                  })
                : chrono
                  ? fillKh(VIZ_KH.chartCompareAddedHint, {
                      older: chrono.olderLabel,
                      newer: chrono.newerLabel
                    })
                  : null}
            </p>
          </div>

          <div className="min-h-0 flex-1 overflow-hidden px-5 pb-2 pt-2">
            {!activeRows.length ? (
              <p className={cn('py-10 text-center text-muted-foreground', P360_TABLE_TEXT)}>
                {VIZ_KH.chartCompareNoDiff}
              </p>
            ) : (
              <Patient360DataTable
                columns={columns}
                rows={tableRows}
                getRowKey={(r) => r._key}
                scrollBody
                fillHeight
                stickyHeader
                compactBodyRows
                className="h-full min-h-0 flex-1 border border-border/80 shadow-sm"
                emptyMessage={VIZ_KH.chartCompareNoDiff}
              />
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
