import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { RiCloseLine, RiInformationLine, RiSearchLine } from '@remixicon/react';
import { cn } from '@/lib/utils';
import { P360_TABLE_BODY_ROW_INNER, P360_TABLE_TEXT, p360ControlClass } from '../layout/appNavStyles';
import { VIZ_KH } from '../../pages/visualizeKh';
import { P360_KH } from '../../pages/patient360Kh';
import Patient360DataTable from '../patient360/Patient360DataTable';
import {
  detailColumnLabel,
  formatDetailCellValue,
  pickDetailColumnKeys
} from '../../utils/indicatorDetailRecords';
import { fetchVisualizePatientRecords } from '../../utils/visualizeDetailRecords';
import {
  buildPatient360Target,
  indicatorToP360Section,
  P360_FROM_VISUALIZE_STATE
} from '../../utils/patient360Navigation';
import VisualizePeriodComparePanel from './VisualizePeriodComparePanel';

const LABEL_KEYS = {
  male014: 'male014',
  female014: 'female014',
  maleOver14: 'maleOver14',
  femaleOver14: 'femaleOver14'
};

const DEMO_ROW_IDS = new Set(['male014', 'female014', 'maleOver14', 'femaleOver14']);

const PAGE_SIZE = 25;

export default function VisualizeChartDetailModal({
  open,
  detail,
  onClose,
  results = [],
  catalog = [],
  periods = [],
  pageContext = {},
  onNavigateToPatient360,
  onBeforeNavigateToPatient360
}) {
  const navigate = useNavigate();
  const [sectionMode, setSectionMode] = useState('list');
  const [patientRows, setPatientRows] = useState([]);
  const [patientLoading, setPatientLoading] = useState(false);
  const [patientError, setPatientError] = useState('');
  const [patientPage, setPatientPage] = useState(1);
  const [patientTotal, setPatientTotal] = useState(0);
  const [patientTotalPages, setPatientTotalPages] = useState(1);
  const [patientSearch, setPatientSearch] = useState('');
  const [serverPaged, setServerPaged] = useState(true);

  const { totalValue, demoRows } = useMemo(() => {
    const rows = detail?.rows || [];
    const totalRow = rows.find((r) => r.id === 'total');
    return {
      totalValue: totalRow?.value ?? '—',
      demoRows: rows.filter((r) => DEMO_ROW_IDS.has(r.id))
    };
  }, [detail?.rows]);

  const loadPatients = useCallback(
    async (page, search) => {
      if (!detail?.raw || !detail?.hasPatientList) return;
      setPatientLoading(true);
      setPatientError('');
      try {
        const { rows, pagination, serverPaged: sp } = await fetchVisualizePatientRecords({
          raw: detail.raw,
          catalog,
          pageContext,
          periods,
          page,
          limit: PAGE_SIZE,
          search
        });
        setPatientRows(rows);
        setPatientTotal(Number(pagination?.totalCount ?? rows.length));
        setPatientTotalPages(Math.max(1, Number(pagination?.totalPages ?? 1)));
        setPatientPage(Number(pagination?.page ?? page));
        setServerPaged(Boolean(sp));
      } catch (e) {
        setPatientError(e?.response?.data?.error || e?.message || VIZ_KH.chartDetailLoadFailed);
        setPatientRows([]);
        setPatientTotal(0);
        setPatientTotalPages(1);
      } finally {
        setPatientLoading(false);
      }
    },
    [detail, catalog, pageContext, periods]
  );

  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      setSectionMode('list');
      return;
    }
    if (!detail?.hasPatientList) {
      setPatientRows([]);
      setPatientError('');
      setPatientSearch('');
      setPatientPage(1);
      return;
    }
    if (sectionMode === 'list') loadPatients(1, '');
  }, [
    open,
    sectionMode,
    detail?.raw?.indicatorId,
    detail?.raw?.periodKey,
    detail?.raw?.facilityCode,
    detail?.hasPatientList,
    loadPatients
  ]);

  useEffect(() => {
    if (!open || !detail?.hasPatientList) return undefined;
    if (!serverPaged && patientSearch) {
      const t = setTimeout(() => loadPatients(1, patientSearch), 300);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [patientSearch, serverPaged, open, detail?.hasPatientList, loadPatients]);

  const includeSiteCol = useMemo(
    () => patientRows.some((r) => r.site_code) || pageContext.scopeMode === 'compare',
    [patientRows, pageContext.scopeMode]
  );

  const indicatorId = detail?.indicatorId || detail?.raw?.indicatorId;

  const p360Section = indicatorToP360Section(indicatorId);

  const goPatient360 = useCallback(
    (row) => {
      const target = buildPatient360Target(row, { detail, pageContext, indicatorId });
      if (!target?.path) {
        toast.error(VIZ_KH.chartDetailNoClinicId);
        return;
      }
      onClose?.();
      onBeforeNavigateToPatient360?.();
      if (onNavigateToPatient360) {
        onNavigateToPatient360(target.path);
      } else {
        navigate(target.path);
      }
    },
    [detail, pageContext, indicatorId, onClose, onBeforeNavigateToPatient360, onNavigateToPatient360, navigate]
  );

  const patientColumnKeys = useMemo(
    () => pickDetailColumnKeys(patientRows, { includeSite: includeSiteCol, indicatorId }),
    [patientRows, includeSiteCol, indicatorId]
  );

  const linkKeys = new Set(['clinicid', 'art_number', 'Artnum', 'ART']);

  const patientColumns = useMemo(
    () =>
      patientColumnKeys.map((key) => {
        const col = {
          id: key,
          label: detailColumnLabel(key),
          width:
            key === 'clinicid'
              ? 72
              : key === 'site_code'
                ? 64
                : key === 'art_number' || key === 'Artnum' || key === 'ART'
                  ? 96
                  : 108,
          mono:
            key === 'clinicid' ||
            key === 'Artnum' ||
            key === 'art_number' ||
            key === 'ART' ||
            key === 'HIVLoad' ||
            key === 'VLValue',
          getValue: (row) => formatDetailCellValue(row[key])
        };
        if (linkKeys.has(key)) {
          col.renderCell = (row, text) => {
            const target = buildPatient360Target(row, { detail, pageContext, indicatorId });
            if (!target?.path || text === '—') {
              return (
                <span className={cn(P360_TABLE_BODY_ROW_INNER, col.mono && 'font-mono tabular-nums')}>
                  {text}
                </span>
              );
            }
            return (
              <Link
                to={target.path}
                state={P360_FROM_VISUALIZE_STATE}
                className={cn(
                  P360_TABLE_BODY_ROW_INNER,
                  'font-medium text-primary underline-offset-2 hover:underline',
                  col.mono && 'font-mono tabular-nums'
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  onBeforeNavigateToPatient360?.();
                  onClose?.();
                }}
              >
                {text}
              </Link>
            );
          };
        }
        return col;
      }),
    [patientColumnKeys, detail, pageContext, indicatorId, onClose]
  );

  const patientTableRows = useMemo(
    () => patientRows.map((row, idx) => ({ ...row, _key: `${idx}-${row.clinicid || row.Artnum || idx}` })),
    [patientRows]
  );

  if (!open || !detail) return null;

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadPatients(1, patientSearch);
  };

  const recordCountLabel = patientLoading
    ? '…'
    : `${patientTotal.toLocaleString('km-KH')} ${VIZ_KH.chartDetailRecordCount}`;

  return createPortal(
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="viz-chart-detail-title"
      onClick={onClose}
    >
      <div
        className="flex h-[min(88vh,42rem)] w-full max-w-5xl flex-col overflow-hidden bg-card shadow-2xl shadow-black/15"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-start gap-3 border-b border-border/80 bg-muted/35 px-5 py-3">
          <RiInformationLine className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
          <div className="min-w-0 flex-1">
            <h2 id="viz-chart-detail-title" className="text-base font-semibold leading-tight text-foreground">
              {VIZ_KH.chartDetailTitle}
            </h2>
            <p className="mt-0.5 line-clamp-2 text-xs leading-snug text-muted-foreground" title={detail.title}>
              {detail.title}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <div className="text-right">
              <p className={cn('text-[10px] text-muted-foreground', P360_TABLE_TEXT)}>{VIZ_KH.total}</p>
              <p className="text-xl font-semibold tabular-nums leading-none text-primary">{totalValue}</p>
            </div>
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center border border-border/80 bg-background/80 hover:bg-muted"
              onClick={onClose}
              aria-label={VIZ_KH.chartDetailClose}
            >
              <RiCloseLine className="size-5" />
            </button>
          </div>
        </div>

        {demoRows.length ? (
          <div className="flex shrink-0 divide-x divide-border/70 border-b border-border/80 bg-muted/10">
            {demoRows.map((row) => (
              <div key={row.id} className="min-w-0 flex-1 px-3 py-2 text-center">
                <p className={cn('truncate text-[10px] text-muted-foreground', P360_TABLE_TEXT)}>
                  {VIZ_KH[LABEL_KEYS[row.labelKey] || row.labelKey]}
                </p>
                <p className={cn('mt-0.5 tabular-nums font-medium text-foreground', P360_TABLE_TEXT)}>{row.value}</p>
              </div>
            ))}
          </div>
        ) : null}

        <section className="flex min-h-0 flex-1 flex-col">
          {!detail.hasPatientList ? (
            <p className={cn('px-5 py-10 text-muted-foreground', P360_TABLE_TEXT)}>{VIZ_KH.chartDetailNoDrilldown}</p>
          ) : (
            <>
              <div
                className="flex shrink-0 gap-0.5 border-b border-border/80 bg-muted/10 px-5 py-1.5"
                role="tablist"
                aria-label={VIZ_KH.chartDetailTitle}
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={sectionMode === 'list'}
                  className={cn(
                    p360ControlClass,
                    'h-7 px-3',
                    sectionMode === 'list' && 'border-primary/50 bg-primary/10 text-foreground'
                  )}
                  onClick={() => setSectionMode('list')}
                >
                  {VIZ_KH.chartDetailTabList}
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={sectionMode === 'compare'}
                  className={cn(
                    p360ControlClass,
                    'h-7 px-3',
                    sectionMode === 'compare' && 'border-primary/50 bg-primary/10 text-foreground'
                  )}
                  onClick={() => setSectionMode('compare')}
                >
                  {VIZ_KH.chartDetailTabCompare}
                </button>
              </div>

              {sectionMode === 'compare' ? (
                <VisualizePeriodComparePanel
                  detail={detail}
                  results={results}
                  periods={periods}
                  catalog={catalog}
                  pageContext={pageContext}
                  indicatorId={indicatorId}
                  onNavigateToPatient360={onNavigateToPatient360}
                  onBeforeNavigateToPatient360={onBeforeNavigateToPatient360}
                  onClose={onClose}
                />
              ) : null}

              {sectionMode === 'list' ? (
              <>
              <form
                onSubmit={handleSearchSubmit}
                className="flex shrink-0 flex-wrap items-center gap-2 border-b border-border/80 px-5 py-2"
              >
                {/* <span className={cn('shrink-0 font-medium text-foreground', P360_TABLE_TEXT)}>
                  {VIZ_KH.chartDetailPatients}
                </span>
                <span className={cn('shrink-0 text-muted-foreground tabular-nums', P360_TABLE_TEXT)}>
                  ({recordCountLabel})
                </span> */}
                <div className="relative min-h-8 min-w-[12rem] flex-1">
                  <RiSearchLine
                    className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
                    aria-hidden
                  />
                  <input
                    type="search"
                    value={patientSearch}
                    onChange={(e) => setPatientSearch(e.target.value)}
                    placeholder={VIZ_KH.chartDetailSearch}
                    className={cn(p360ControlClass, 'h-8 w-full pl-8')}
                  />
                </div>
                <button
                  type="submit"
                  className={cn(p360ControlClass, 'h-8 shrink-0 px-3 hover:bg-muted')}
                  disabled={patientLoading}
                >
                  {VIZ_KH.chartDetailSearchBtn}
                </button>
              </form>
              {/* <p className={cn('shrink-0 border-b border-border/60 px-5 pb-2 text-muted-foreground', P360_TABLE_TEXT)}>
                {VIZ_KH.chartDetailOpenProfile}
                {p360Section !== 'overview' ? (
                  <span className="text-foreground/80">
                    {' '}
                    → {P360_KH.tabs[p360Section] || p360Section}
                  </span>
                ) : null}
              </p> */}

              <div className="min-h-0 flex-1 overflow-hidden px-5 pb-2 pt-0">
                {patientLoading ? (
                  <div
                    className={cn(
                      'flex h-full min-h-[14rem] items-center justify-center text-muted-foreground',
                      P360_TABLE_TEXT
                    )}
                  >
                    <span className="inline-flex items-center gap-2">
                      <span className="size-4 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground" />
                      {VIZ_KH.chartDetailLoading}
                    </span>
                  </div>
                ) : patientError ? (
                  <div className={cn('py-10 text-destructive', P360_TABLE_TEXT)}>{patientError}</div>
                ) : !patientTableRows.length ? (
                  <div className={cn('py-10 text-muted-foreground', P360_TABLE_TEXT)}>{VIZ_KH.chartDetailNoPatients}</div>
                ) : (
                  <Patient360DataTable
                    columns={patientColumns}
                    rows={patientTableRows}
                    getRowKey={(r) => r._key}
                    onRowClick={goPatient360}
                    scrollBody
                    fillHeight
                    stickyHeader
                    compactBodyRows
                    className="h-full min-h-0 flex-1 border border-border/80 shadow-sm"
                    emptyMessage={VIZ_KH.chartDetailNoPatients}
                  />
                )}
              </div>

              <div className="flex shrink-0 items-center justify-between gap-2 border-t border-border/80 bg-muted/20 px-5 py-2">
                <span className={cn('text-muted-foreground', P360_TABLE_TEXT)}>
                  {patientTotalPages > 1
                    ? `${VIZ_KH.chartDetailPage} ${patientPage} / ${patientTotalPages}`
                    : recordCountLabel}
                </span>
                {patientTotalPages > 1 ? (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={patientLoading || patientPage <= 1}
                      onClick={() => loadPatients(patientPage - 1, patientSearch)}
                      className={cn(p360ControlClass, 'h-7 px-3 disabled:opacity-40')}
                    >
                      {VIZ_KH.chartDetailPrev}
                    </button>
                    <button
                      type="button"
                      disabled={patientLoading || patientPage >= patientTotalPages}
                      onClick={() => loadPatients(patientPage + 1, patientSearch)}
                      className={cn(p360ControlClass, 'h-7 px-3 disabled:opacity-40')}
                    >
                      {VIZ_KH.chartDetailNext}
                    </button>
                  </div>
                ) : null}
              </div>
              </>
              ) : null}
            </>
          )}
        </section>
      </div>
    </div>,
    document.body
  );
}
