import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  RiAlertLine,
  RiCheckLine,
  RiCloseLine,
  RiCodeSSlashLine,
  RiSearchLine,
  RiShieldCheckLine
} from '@remixicon/react';
import { Button } from '@/components/ui/button';
import RunButton, { filterLabelClass } from '@/components/ui/RunButton';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import SiteSelectModal from '../components/sites/SiteSelectModal';
import AppPageShell from '../components/layout/AppPageShell';
import api from '../services/api';
import { useSites } from '../contexts/SitesContext';
import { filterSitesByUserScope, isFacilitySite, isFacilitySiteCode, pickDefaultSiteCode } from '../utils/siteSelection';
import { useAuth } from '../contexts/AuthContext';
import { DQA_KH, toDqaColumnLabelKh, toDqaIssueKh, toDqaTitleKh, toDqaValueKh } from './dqaKh';

function formatCell(value) {
  if (value == null || value === '') return '-';
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value);
}

const DQA_COLUMN_PRIORITY = [
  'issue_type',
  'clinicid',
  'ClinicID',
  'patient_type',
  'ART',
  'DaArt',
  'Tptdrugname',
  'tpt_source',
  'Date_Start_TPT',
  'Date_Stop_TPT',
  'Num_Month',
  'DafirstVisit',
  'DatVisit',
  'DaApp',
  'Sex',
  'Age',
  'OffIn',
  'last_vl_date',
  'appt_gap',
  'TPTdrug',
  'HIVLoad',
  'Dat',
  'DaCollect',
  'LClinicID',
  'TypeofReturn'
];

/** Map issue text → columns to highlight for row insight */
const ISSUE_HIGHLIGHT_BY_TYPE = {
  'Stop without start': ['Date_Stop_TPT', 'Date_Start_TPT'],
  'Stop before start': ['Date_Start_TPT', 'Date_Stop_TPT'],
  'Invalid start date': ['Date_Start_TPT'],
  'Invalid stop date': ['Date_Stop_TPT'],
  'Review start/stop': ['Date_Start_TPT', 'Date_Stop_TPT', 'Tptdrugname', 'tpt_source'],
  'Duplicate TPT start': ['Da1', 'Da2', 'Da3', 'Da4', 'DrugName'],
  'OffIn not set': ['OffIn'],
  'ART start before 2000': ['DaArt'],
  'No ART record': ['DafirstVisit', 'DaArt'],
  'Exit without initial form': ['exit_date', 'status'],
  'No visit on record': ['DafirstVisit', 'DatVisit'],
  'Missing sex': ['Sex', 'DatVisit'],
  'Visit without initial form': ['DatVisit'],
  'Invalid HIV positive date': ['DatVisit'],
  'TI missing ART date or number': ['DaArt', 'ART'],
  'ART without initial form': ['clinicid', 'ART', 'DaArt'],
  'Exit date before 2000': ['exit_date'],
  'Transfer in/out not set': ['OffIn'],
  'No VL on record': ['last_vl_date', 'DaArt', 'ART'],
  'No VL in 12 months': ['last_vl_date', 'DaArt'],
  'Visit interval over 80 days': ['DatVisit', 'DaApp', 'appt_gap'],
  'Duplicate ART number': ['ART', 'clinicid', 'LClinicID'],
  'Duplicate ART not lost-return': ['ART', 'clinicid', 'LClinicID', 'TypeofReturn'],
  'Child ART on adult table only': ['ART', 'DaArt'],
  'Exit with future appointment': ['exit_date', 'DaApp', 'DatVisit'],
  '6H TPT over 12 months without stop': ['Date_Start_TPT', 'Date_Stop_TPT', 'Tptdrugname'],
  'Form A TPT without visit TPT': ['Date_Start_TPT', 'TPTdrug'],
  'Birth date after first visit': ['DaBirth', 'DafirstVisit'],
  'VL result blank': ['HIVLoad', 'Dat', 'DaCollect'],
  'Transfer out without exit record': ['OffIn', 'DafirstVisit']
};

function orderDqaColumns(keys) {
  const seen = new Set();
  const ordered = [];
  for (const key of DQA_COLUMN_PRIORITY) {
    if (keys.includes(key) && !seen.has(key)) {
      ordered.push(key);
      seen.add(key);
    }
  }
  const rest = keys
    .filter((k) => !seen.has(k))
    .sort((a, b) => toDqaColumnLabelKh(a).localeCompare(toDqaColumnLabelKh(b), 'km'));
  return [...ordered, ...rest];
}

function getHighlightColumns(row, allKeys) {
  const issue = String(row?.issue_type ?? '').trim();
  if (issue && ISSUE_HIGHLIGHT_BY_TYPE[issue]) {
    return new Set(ISSUE_HIGHLIGHT_BY_TYPE[issue].filter((k) => allKeys.includes(k)));
  }
  if (issue) {
    return new Set(
      allKeys.filter(
        (k) =>
          k !== 'issue_type' &&
          /^(Da|Date_|Dat|exit|OffIn|Tpt|ART|Status|DrugName)/i.test(k)
      )
    );
  }
  return new Set();
}

function renderDqaCell(col, value, { isIssueCol, isHighlight }) {
  const raw = formatCell(value);
  const text = raw === '-' ? raw : formatCell(toDqaValueKh(value, col));
  if (isIssueCol && text !== '-') {
    return (
      <span className="inline-flex items-start gap-1 border border-amber-600/35 bg-amber-100 px-2 py-0.5 text-[11px] font-semibold leading-snug text-amber-950">
        <RiAlertLine className="mt-0.5 size-3.5 shrink-0" />
        <span className="break-words">{text}</span>
      </span>
    );
  }
  if (isHighlight) {
    return <span className="font-medium text-amber-950">{text}</span>;
  }
  return text;
}

/** Page numbers for modal footer: 1, 2, … with ellipsis when many pages */
function buildDetailPageItems(currentPage, totalPages) {
  if (totalPages <= 1) return [];
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => ({ type: 'page', value: i + 1 }));
  }
  const items = [{ type: 'page', value: 1 }];
  const windowStart = Math.max(2, currentPage - 1);
  const windowEnd = Math.min(totalPages - 1, currentPage + 1);
  if (windowStart > 2) items.push({ type: 'ellipsis', value: '…' });
  for (let p = windowStart; p <= windowEnd; p += 1) {
    items.push({ type: 'page', value: p });
  }
  if (windowEnd < totalPages - 1) items.push({ type: 'ellipsis', value: '…' });
  items.push({ type: 'page', value: totalPages });
  return items;
}

function dqaCellClassName(col, { isIssueCol, isHighlight, hasIssue }) {
  return cn(
    'border-r border-border/50 px-2 py-1.5 align-top last:border-r-0',
    col === 'issue_type' && 'min-w-36 max-w-52 whitespace-normal',
    col === 'clinicid' && 'min-w-24',
    col !== 'issue_type' && col !== 'clinicid' && 'whitespace-nowrap',
    isIssueCol && 'bg-amber-100/60',
    isHighlight && !isIssueCol && 'bg-amber-200/45',
    hasIssue && (isIssueCol || isHighlight) && 'bg-amber-50/80'
  );
}

export default function DqaPage({ onLogout }) {
  const { user } = useAuth();
  const { sites: registrySites } = useSites();
  const [sites, setSites] = useState([]);
  const [scripts, setScripts] = useState([]);
  const [siteCode, setSiteCode] = useState('');
  const [summary, setSummary] = useState([]);
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedScript, setSelectedScript] = useState(null);
  const [detailRows, setDetailRows] = useState([]);
  const [detailPagination, setDetailPagination] = useState(null);
  const [detailSearch, setDetailSearch] = useState('');
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');
  const [sqlPreview, setSqlPreview] = useState(null);
  const [rowsModalOpen, setRowsModalOpen] = useState(false);
  const [sqlModalOpen, setSqlModalOpen] = useState(false);
  const [detailPage, setDetailPage] = useState(1);

  useEffect(() => {
    let active = true;
    setLoadingMeta(true);
    setError('');
    Promise.all([api.get('/apiv1/dqa/scripts'), api.get('/apiv1/dqa/query-reference')])
      .then(([scriptsRes, refRes]) => {
        if (!active) return;
        const siteRows = filterSitesByUserScope(registrySites || [], user);
        setSites(siteRows);
        const scriptRows = Array.isArray(scriptsRes?.data?.data) ? scriptsRes.data.data : [];
        const refRows = Array.isArray(refRes?.data?.data) ? refRes.data.data : [];
        const sqlById = new Map(refRows.map((r) => [r.id, r.sql]));
        setScripts(
          scriptRows.map((s) => ({
            ...s,
            sql: sqlById.get(s.id) || ''
          }))
        );
        const defaultCode = pickDefaultSiteCode(siteRows);
        if (defaultCode) setSiteCode(defaultCode);
      })
      .catch((e) => {
        if (!active) return;
        setError(e?.response?.data?.error || e?.message || 'Failed to load DQA');
      })
      .finally(() => {
        if (active) setLoadingMeta(false);
      });
    return () => {
      active = false;
    };
  }, [registrySites, user]);

  const filteredScripts = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return scripts;
    return scripts.filter(
      (s) =>
        String(s.checkNumber || '').includes(q) ||
        String(s.title || '').toLowerCase().includes(q) ||
        String(s.id || '').toLowerCase().includes(q)
    );
  }, [scripts, search]);

  const summaryById = useMemo(() => new Map(summary.map((r) => [r.scriptId, r])), [summary]);

  const runSummary = useCallback(async () => {
    if (!siteCode) {
      setError('Select a facility site first');
      return;
    }
    if (!isFacilitySiteCode(sites, siteCode)) {
      setError('DQA requires a single facility site (not country or province)');
      return;
    }
    setLoadingSummary(true);
    setError('');
    setSummary([]);
    try {
      const res = await api.get('/apiv1/dqa/summary', { params: { siteCode } });
      setSummary(Array.isArray(res?.data?.data) ? res.data.data : []);
    } catch (e) {
      setError(e?.response?.data?.error || e?.message || 'Failed to run DQA summary');
    } finally {
      setLoadingSummary(false);
    }
  }, [siteCode, sites]);

  const loadDetail = useCallback(
    async (script, page = 1, searchTerm = detailSearch) => {
      if (!siteCode || !script?.id) return;
      setDetailLoading(true);
      setDetailError('');
      try {
        const res = await api.get(`/apiv1/dqa/run/${encodeURIComponent(script.id)}`, {
          params: { siteCode, page, limit: 50, search: searchTerm || undefined }
        });
        setDetailRows(Array.isArray(res?.data?.data) ? res.data.data : []);
        setDetailPagination(res?.data?.pagination || null);
        setSelectedScript(script);
        setDetailPage(page);
      } catch (e) {
        setDetailError(e?.response?.data?.error || e?.message || 'Failed to load DQA results');
        setDetailRows([]);
        setDetailPagination(null);
      } finally {
        setDetailLoading(false);
      }
    },
    [siteCode, detailSearch]
  );

  const closeRowsModal = useCallback(() => {
    setRowsModalOpen(false);
    setSelectedScript(null);
    setDetailRows([]);
    setDetailPagination(null);
    setDetailSearch('');
    setDetailPage(1);
    setDetailError('');
  }, []);

  const closeSqlModal = useCallback(() => {
    setSqlModalOpen(false);
    setSqlPreview(null);
  }, []);

  const openRowsModal = useCallback(
    (script) => {
      setSqlModalOpen(false);
      setSqlPreview(null);
      setRowsModalOpen(true);
      setDetailSearch('');
      loadDetail(script, 1, '');
    },
    [loadDetail]
  );

  const openSqlModal = useCallback((script) => {
    setRowsModalOpen(false);
    setSelectedScript(null);
    setDetailRows([]);
    setDetailPagination(null);
    setSqlPreview(script);
    setSqlModalOpen(true);
  }, []);

  useEffect(() => {
    if (!rowsModalOpen && !sqlModalOpen) return undefined;
    const onKeyDown = (e) => {
      if (e.key !== 'Escape') return;
      if (rowsModalOpen) closeRowsModal();
      else if (sqlModalOpen) closeSqlModal();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [rowsModalOpen, sqlModalOpen, closeRowsModal, closeSqlModal]);

  const detailColumns = useMemo(() => {
    if (!detailRows.length) return [];
    return orderDqaColumns(Object.keys(detailRows[0]));
  }, [detailRows]);

  const detailIssueSummary = useMemo(() => {
    const counts = new Map();
    for (const row of detailRows) {
      const issue = String(row?.issue_type ?? '').trim() || '(no issue label)';
      counts.set(issue, (counts.get(issue) || 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [detailRows]);

  const totalIssues = useMemo(
    () => summary.reduce((sum, row) => sum + (Number(row.rowCount) || 0), 0),
    [summary]
  );

  const detailPageItems = useMemo(() => {
    if (!detailPagination?.totalPages || detailPagination.totalPages <= 1) return [];
    return buildDetailPageItems(detailPagination.page, detailPagination.totalPages);
  }, [detailPagination]);

  return (
    <AppPageShell>
    <Card className="rounded-none border-border/80 py-0 shadow-xl shadow-black/6 gap-0 overflow-hidden">
      <div className="h-1.5 w-full bg-primary" />
      <CardHeader className="border-b border-border/80 bg-muted/65 px-4 pb-3 pt-4">
        <CardTitle className="inline-flex items-center gap-2">
          <RiShieldCheckLine className="size-5" />
          {DQA_KH.pageTitle}
        </CardTitle>
        <CardDescription className="mt-1">{DQA_KH.pageDescription}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 p-0">
        <div className="border-b border-border/80 bg-muted/20 p-4 sm:p-5">
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
            <SiteSelectModal
              sites={sites}
              value={siteCode}
              onChange={setSiteCode}
              facilityOnly
              label={DQA_KH.facility}
              modalText={DQA_KH.siteModal}
              disabled={loadingMeta}
            />
            <div className="grid gap-2">
              <span className={`${filterLabelClass} opacity-0 select-none`}>{DQA_KH.run}</span>
              <RunButton
                disabled={!siteCode || loadingMeta || !isFacilitySiteCode(sites, siteCode)}
                loading={loadingSummary}
                onClick={runSummary}
                label={DQA_KH.run}
                loadingLabel={DQA_KH.running}
              />
            </div>
          </div>
          {summary.length > 0 && (
            <div className="mt-3 text-xs text-muted-foreground">
              {summary.length} {DQA_KH.summaryScripts} · {totalIssues} {DQA_KH.summaryIssueRows}
            </div>
          )}
        </div>

        <div className="space-y-4 p-4">

        {loadingMeta ? (
          <div className="border border-border/80 bg-muted/20 px-4 py-6 text-sm text-muted-foreground">
            {DQA_KH.loadingScripts}
          </div>
        ) : error ? (
          <div className="border border-destructive/30 bg-destructive/10 px-4 py-4 text-sm text-destructive">
            {error}
          </div>
        ) : (
          <>
            <div className="relative">
              <RiSearchLine className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={DQA_KH.filterChecksPlaceholder}
                className="h-10 w-full rounded-none border border-border/80 bg-background pl-10 pr-3 text-sm shadow-sm"
              />
            </div>

            <div className="overflow-auto border border-border/80">
              <table className="w-full min-w-[640px] text-left text-xs">
                <thead className="border-b border-border/80 bg-muted/40">
                  <tr>
                    <th className="w-12 px-3 py-2 font-semibold">{DQA_KH.table.number}</th>
                    <th className="px-3 py-2 font-semibold">{DQA_KH.table.check}</th>
                    <th className="w-24 px-3 py-2 text-right font-semibold">{DQA_KH.table.issues}</th>
                    <th className="w-28 px-3 py-2 text-right font-semibold">{DQA_KH.table.ms}</th>
                    <th className="w-40 px-3 py-2 text-right font-semibold">{DQA_KH.table.actions}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredScripts.map((script) => {
                    const row = summaryById.get(script.id);
                    const count = row?.rowCount;
                    const hasRun = row != null;
                    const hasIssues = hasRun && count > 0;
                    const isOk = hasRun && count === 0;
                    return (
                      <tr key={script.id} className="border-b border-border/50 hover:bg-muted/15">
                        <td className="px-3 py-2.5 font-mono text-xs text-muted-foreground">
                          {script.checkNumber || '—'}
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="font-medium text-foreground">{toDqaTitleKh(script.title)}</div>
                          {row?.error ? (
                            <div className="mt-1 text-[10px] text-destructive">{row.error}</div>
                          ) : null}
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          {!hasRun ? (
                            <span className="text-muted-foreground">—</span>
                          ) : hasIssues ? (
                            <button
                              type="button"
                              className="inline-flex items-center gap-1 font-semibold text-amber-700 hover:underline"
                              onClick={() => openRowsModal(script)}
                            >
                              <RiAlertLine className="size-3.5" />
                              {count}
                            </button>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-emerald-700">
                              <RiCheckLine className="size-3.5" />
                              0
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2.5 text-right text-muted-foreground">
                          {row?.queryMs != null ? row.queryMs : '—'}
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="flex justify-end gap-1">
                            <Button
                              type="button"
                              variant="outline"
                              className={cn(
                                'h-9 gap-1 rounded-none px-2.5 text-xs',
                                'border-border/80 shadow-sm'
                              )}
                              onClick={() => openSqlModal(script)}
                            >
                              <RiCodeSSlashLine className="size-3.5" />
                              {DQA_KH.sql}
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              className={cn(
                                'h-9 gap-1 rounded-none px-2.5 text-xs',
                                'border-border/80 shadow-sm'
                              )}
                              disabled={!siteCode || (hasRun && !hasIssues && !row?.error)}
                              onClick={() => openRowsModal(script)}
                            >
                              {DQA_KH.rows}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
        </div>

      </CardContent>
    </Card>

      <AnimatePresence>
        {sqlModalOpen && sqlPreview && (
          <motion.div
            className="fixed inset-0 z-100 flex items-center justify-center bg-black/55 p-4 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            onClick={closeSqlModal}
          >
            <motion.div
              className="flex max-h-[88vh] w-full max-w-4xl flex-col overflow-hidden bg-card shadow-2xl shadow-black/15"
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between border-b border-border/80 bg-muted/35 px-4 py-3">
                <div className="min-w-0 pr-4">
                  <div className="text-xs font-semibold text-muted-foreground">
                    DQA {sqlPreview.checkNumber || ''} · SQL
                  </div>
                  <div className="mt-0.5 text-sm font-semibold text-foreground">
                    {toDqaTitleKh(sqlPreview.title)}
                  </div>
                </div>
                <button
                  type="button"
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center border border-border/80 bg-background hover:bg-muted"
                  onClick={closeSqlModal}
                  aria-label={DQA_KH.close}
                >
                  <RiCloseLine className="size-5" />
                </button>
              </div>
              <div className="min-h-0 flex-1 overflow-auto p-4">
                <pre className="border border-border/80 bg-muted/10 p-3 text-[11px] leading-5">
                  <code>{sqlPreview.sql}</code>
                </pre>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {rowsModalOpen && selectedScript && (
          <motion.div
            className="fixed inset-0 z-100 flex items-center justify-center bg-black/55 p-4 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            onClick={closeRowsModal}
          >
            <motion.div
              className="flex max-h-[88vh] w-full max-w-6xl flex-col overflow-hidden bg-card shadow-2xl shadow-black/15"
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between border-b border-border/80 bg-muted/35 px-4 py-3">
                <div className="min-w-0 pr-4">
                  <div className="text-xs font-semibold text-muted-foreground">
                    DQA {selectedScript.checkNumber || ''} · {siteCode}
                  </div>
                  <div className="mt-0.5 truncate text-sm font-semibold text-foreground">
                    {toDqaTitleKh(selectedScript.title)}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {detailLoading
                      ? 'Loading…'
                      : detailPagination
                        ? `${detailPagination.totalCount} issue row${detailPagination.totalCount === 1 ? '' : 's'} (page ${detailPagination.page} of ${detailPagination.totalPages})`
                        : detailError
                          ? 'Failed to load'
                          : 'No rows'}
                  </div>
                  {!detailLoading && detailIssueSummary.length > 0 ? (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {detailIssueSummary.map(([issue, n]) => (
                        <span
                          key={issue}
                          className="inline-flex items-center gap-1 border border-amber-600/30 bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-900"
                          title={issue}
                        >
                          <RiAlertLine className="size-3 shrink-0" />
                          <span className="max-w-[200px] truncate">{toDqaIssueKh(issue)}</span>
                          <span className="text-amber-700/90">({n})</span>
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
                <button
                  type="button"
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center border border-border/80 bg-background hover:bg-muted"
                  onClick={closeRowsModal}
                  aria-label={DQA_KH.close}
                >
                  <RiCloseLine className="size-5" />
                </button>
              </div>

              <div className="border-b border-border/80 px-4 py-2.5">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative min-w-[200px] flex-1">
                    <RiSearchLine className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                    <input
                      value={detailSearch}
                      onChange={(e) => setDetailSearch(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') loadDetail(selectedScript, 1, e.target.value);
                      }}
                      placeholder={`${DQA_KH.search}…`}
                      className="h-8 w-full border border-border/80 bg-background pl-8 pr-2 text-xs shadow-sm"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-8 rounded-none border-border/80 px-3 text-xs shadow-sm"
                    onClick={() => loadDetail(selectedScript, 1, detailSearch)}
                  >
                    {DQA_KH.search}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-8 gap-1 rounded-none border-border/80 px-3 text-xs shadow-sm"
                    onClick={() => openSqlModal(selectedScript)}
                  >
                    <RiCodeSSlashLine className="size-3.5" />
                    {DQA_KH.viewSql}
                  </Button>
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-auto p-4">
                {detailLoading ? (
                  <div className="py-8 text-center text-sm text-muted-foreground">Loading rows…</div>
                ) : detailError ? (
                  <div className="py-8 text-center text-sm text-destructive">{detailError}</div>
                ) : detailRows.length === 0 ? (
                  <div className="py-8 text-center text-sm text-muted-foreground">No matching rows.</div>
                ) : (
                  <>
                    <p className="mb-2 text-[11px] text-muted-foreground">
                      {DQA_KH.rowInsightHint}
                    </p>
                    <div className="overflow-auto border border-border/80">
                      <table className="w-full min-w-max border-separate border-spacing-0 text-left text-[11px]">
                        <thead className="sticky top-0 z-10 border-b border-border/80 bg-muted/50">
                          <tr>
                            {detailColumns.map((col) => (
                              <th
                                key={col}
                                className={cn(
                                  'border-r border-border/50 px-2 py-1.5 font-semibold last:border-r-0',
                                  col === 'issue_type' &&
                                    'min-w-36 max-w-52 whitespace-normal bg-amber-100/90 text-amber-950',
                                  col === 'clinicid' && 'min-w-24 whitespace-nowrap',
                                  col !== 'issue_type' && col !== 'clinicid' && 'whitespace-nowrap'
                                )}
                              >
                                {toDqaColumnLabelKh(col)}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {detailRows.map((row, idx) => {
                            const highlightCols = getHighlightColumns(row, detailColumns);
                            const hasIssue = Boolean(String(row?.issue_type ?? '').trim());
                            return (
                              <tr
                                key={idx}
                                className={cn(
                                  'border-b border-border/40',
                                  hasIssue ? 'bg-amber-50/30 hover:bg-amber-50/50' : 'hover:bg-muted/10'
                                )}
                              >
                                {detailColumns.map((col) => {
                                  const isIssueCol = col === 'issue_type';
                                  const isHighlight = highlightCols.has(col);
                                  return (
                                    <td
                                      key={col}
                                      className={dqaCellClassName(col, {
                                        isIssueCol,
                                        isHighlight,
                                        hasIssue
                                      })}
                                    >
                                      {renderDqaCell(col, row[col], {
                                        isIssueCol,
                                        isHighlight
                                      })}
                                    </td>
                                  );
                                })}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>

              {detailPagination && detailPagination.totalPages > 1 ? (
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/80 bg-muted/25 px-4 py-3">
                  <span className="text-xs text-muted-foreground">
                    {detailPagination.totalCount} {DQA_KH.summaryIssueRows} · {detailPagination.page}/
                    {detailPagination.totalPages}
                  </span>
                  <div className="flex flex-wrap items-center gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      className="h-8 min-w-9 rounded-none border-border/80 px-2 text-xs shadow-sm"
                      disabled={!detailPagination.hasPrev || detailLoading}
                      onClick={() => loadDetail(selectedScript, detailPage - 1, detailSearch)}
                      aria-label={DQA_KH.previous}
                    >
                      {DQA_KH.previous}
                    </Button>
                    {detailPageItems.map((item, idx) =>
                      item.type === 'ellipsis' ? (
                        <span
                          key={`ellipsis-${idx}`}
                          className="inline-flex h-8 min-w-8 items-center justify-center text-xs text-muted-foreground"
                        >
                          …
                        </span>
                      ) : (
                        <Button
                          key={item.value}
                          type="button"
                          variant={item.value === detailPagination.page ? 'default' : 'outline'}
                          className={cn(
                            'h-8 min-w-8 rounded-none border-border/80 px-2 text-xs shadow-sm',
                            item.value === detailPagination.page &&
                              'bg-primary text-primary-foreground hover:opacity-95'
                          )}
                          disabled={detailLoading || item.value === detailPagination.page}
                          onClick={() => loadDetail(selectedScript, item.value, detailSearch)}
                        >
                          {item.value}
                        </Button>
                      )
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      className="h-8 min-w-9 rounded-none border-border/80 px-2 text-xs shadow-sm"
                      disabled={!detailPagination.hasNext || detailLoading}
                      onClick={() => loadDetail(selectedScript, detailPage + 1, detailSearch)}
                      aria-label={DQA_KH.next}
                    >
                      {DQA_KH.next}
                    </Button>
                  </div>
                </div>
              ) : null}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppPageShell>
  );
}
