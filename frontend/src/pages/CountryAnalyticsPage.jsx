import { useEffect, useMemo, useRef, useState, Fragment } from 'react';
import {
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiArrowDownSLine,
  RiArrowUpSLine,
  RiDatabase2Line,
  RiDownloadLine,
  RiLoader4Line,
  RiSearchLine,
  RiRefreshLine,
  RiCheckboxCircleLine,
  RiCloseCircleLine,
  RiHistoryLine,
  RiDeleteBinLine,
  RiSettings3Line,
  RiAlertLine
} from '@remixicon/react';
import { AnimatePresence, motion } from 'motion/react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { INDICATOR_LABEL_MAP } from './ReportHomePage';
import {
  getAnalyticsStatus,
  getCountryAnalytics,
  getProvinceAnalytics,
  getEtlHistory,
  triggerAnalyticsRefresh,
  clearAnalyticsData,
  getIndicatorReference
} from '../services/analyticsApi';
import { downloadCsv, rowsToCsv } from '../utils/exportCsv';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';

// Layout & navigation components
import Patient360Layout from '../components/patient360/Patient360Layout';
import AppPageShell from '../components/layout/AppPageShell';
import QuarterSelectModal from '../components/visualize/QuarterSelectModal';
import DatabaseConnectionModal from '../components/database/DatabaseConnectionModal';
import { getPeriodByKey, listRecentQuarters } from '../utils/visualizePeriods';
import { Patient360NavBar, Patient360NavRow } from '../components/patient360/Patient360NavBar';
import { VizToolbarBtn } from '../components/visualize/visualizeToolbarUi';
import { TOOLBAR_ICON } from '../components/layout/toolbarIconColors';
import {
  APP_NAV_ICON,
  p360CardClass,
  p360ControlClass,
  vizKpiCardClass
} from '../components/layout/appNavStyles';
import cn from 'clsx';

export default function CountryAnalyticsPage({ onLogout }) {
  const { user } = useAuth();
  
  // Single period key selection state using listRecentQuarters as default
  const [selectedPeriodKey, setSelectedPeriodKey] = useState(() => {
    const q = listRecentQuarters(1)[0];
    return q ? q.key : `${new Date().getFullYear()}-Q1`;
  });

  // Data state
  const [countryRows, setCountryRows] = useState([]);
  const [provinceRows, setProvinceRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastLoadedPeriod, setLastLoadedPeriod] = useState(null);

  // ETL warehouse status state
  const [statusLoading, setStatusLoading] = useState(false);
  const [warehouseStatus, setWarehouseStatus] = useState({
    hasData: false,
    lastRefreshed: null,
    etlRunning: false,
    etlProgress: null,
    recentHistory: []
  });
  const [showHistory, setShowHistory] = useState(false);
  const [historyList, setHistoryList] = useState([]);

  // Clean Warehouse state
  const [cleanModalOpen, setCleanModalOpen] = useState(false);
  const [cleanOption, setCleanOption] = useState('period'); // 'period', 'indicator', 'all'
  const [cleanIndicator, setCleanIndicator] = useState('');
  const [clearing, setClearing] = useState(false);

  // Settings Modal state
  const [connectionModalOpen, setConnectionModalOpen] = useState(false);

  // Missing indicators state
  const [checkingMissing, setCheckingMissing] = useState(false);
  const [missingIndicatorsModalOpen, setMissingIndicatorsModalOpen] = useState(false);
  const [missingIndicatorsList, setMissingIndicatorsList] = useState([]);

  const handleCheckMissingIndicators = async () => {
    setCheckingMissing(true);
    try {
      const res = await getIndicatorReference();
      if (!res.success) throw new Error('Failed to load indicators');
      const missing = [];
      res.data.forEach(d => {
        const id = d.indicatorId;
        const sql = d.aggregateSql || '';
        
        // Extract the exact 'Indicator' label string used in the SQL query
        const match = sql.match(/['"]([^'"]+)['"]\s+AS\s+Indicator/i);
        const expectedLabel = match ? match[1].trim() : id.trim();
        
        // Check if the label OR the raw ID exists in the loaded warehouse data
        const isPresent = countryRows.some(r => {
          const rInd = String(r.indicator).trim();
          return rInd === expectedLabel || rInd === id;
        });
        
        if (!isPresent) {
          missing.push(id);
        }
      });
      
      if (missing.length === 0) {
        toast.success('All indicators are already present in the analytics warehouse for this period!');
      } else {
        setMissingIndicatorsList(missing);
        setMissingIndicatorsModalOpen(true);
      }
    } catch (e) {
      toast.error('Failed to check missing indicators: ' + e.message);
    } finally {
      setCheckingMissing(false);
    }
  };

  // Search & Expand state
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedIndicators, setExpandedIndicators] = useState(new Set());

  // Derived current period label matching database warehouse format
  const currentPeriod = useMemo(() => {
    const p = getPeriodByKey(selectedPeriodKey);
    if (!p) {
      return {
        periodType: 'quarter',
        year: String(new Date().getFullYear()),
        quarter: '1',
        periodLabel: `${new Date().getFullYear()}-Q1`
      };
    }

    const periodType = p.kind;
    const year = String(p.year);

    if (periodType === 'quarter') {
      const quarter = String(p.key.split('-Q')[1]);
      return {
        periodType,
        year,
        quarter,
        periodLabel: p.key // e.g. "YYYY-Q1"
      };
    } else if (periodType === 'month') {
      const formattedMonth = `${p.year}-${String(p.month).padStart(2, '0')}`;
      return {
        periodType,
        year,
        month: formattedMonth,
        periodLabel: formattedMonth // e.g. "YYYY-MM"
      };
    } else {
      return {
        periodType,
        year,
        periodLabel: year // e.g. "YYYY"
      };
    }
  }, [selectedPeriodKey]);

  // Fetch Warehouse status & ETL status
  const fetchWarehouseStatus = async (silent = false) => {
    if (!silent) setStatusLoading(true);
    try {
      const res = await getAnalyticsStatus(currentPeriod);
      if (res.success) {
        setWarehouseStatus({
          hasData: res.hasData,
          lastRefreshed: res.lastRefreshed,
          etlRunning: res.etlRunning,
          etlProgress: res.etlProgress,
          recentHistory: res.recentHistory || []
        });
      }
    } catch (e) {
      console.error('Failed to fetch warehouse status:', e);
    } finally {
      if (!silent) setStatusLoading(false);
    }
  };

  // Poll ETL status if ETL is running
  useEffect(() => {
    fetchWarehouseStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPeriod.periodLabel]);

  useEffect(() => {
    let timer = null;
    if (warehouseStatus.etlRunning) {
      timer = setInterval(() => {
        fetchWarehouseStatus(true);
      }, 4000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [warehouseStatus.etlRunning, currentPeriod.periodLabel]);

  // Fetch report data
  const runAnalytics = async () => {
    setLoading(true);
    setExpandedIndicators(new Set());
    try {
      await fetchWarehouseStatus(true);

      const [countryData, provinceData] = await Promise.all([
        getCountryAnalytics(currentPeriod),
        getProvinceAnalytics(currentPeriod)
      ]);

      if (countryData.success && provinceData.success) {
        setCountryRows(countryData.data || []);
        setProvinceRows(provinceData.data || []);
        setLastLoadedPeriod(currentPeriod.periodLabel);
        if (countryData.data?.length === 0) {
          toast.info('No pre-aggregated warehouse data found for this period. Try refreshing the warehouse.');
        } else {
          toast.success('Analytics data loaded successfully.');
        }
      } else {
        toast.error('Failed to parse analytics datasets.');
      }
    } catch (e) {
      toast.error(e.response?.data?.error || e.message || 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  // Trigger manual ETL warehouse refresh
  const handleRefreshWarehouse = async () => {
    if (warehouseStatus.etlRunning) {
      toast.warning('Refresh already in progress.');
      return;
    }
    try {
      const res = await triggerAnalyticsRefresh(currentPeriod);
      if (res.success) {
        toast.success(res.message || 'Warehouse pre-aggregation started.');
        setWarehouseStatus(prev => ({ ...prev, etlRunning: true }));
      } else {
        toast.error('Could not initiate warehouse refresh.');
      }
    } catch (e) {
      toast.error(e.response?.data?.error || e.message || 'Refresh failed');
    }
  };

  // Clear analytics database data
  const handleClearAnalytics = async () => {
    setClearing(true);
    try {
      const payload = {
        ...currentPeriod,
        clearAll: cleanOption === 'all'
      };
      if (cleanOption === 'indicator') {
        if (!cleanIndicator) {
          toast.error('Please select an indicator to clean.');
          setClearing(false);
          return;
        }
        payload.indicator = cleanIndicator;
      }
      
      const res = await clearAnalyticsData(payload);
      if (res.success) {
        toast.success(res.message || 'Analytics warehouse data cleared successfully.');
        
        // If we cleared the current period or everything, reset loaded tables on screen
        if (cleanOption === 'all' || currentPeriod.periodLabel === lastLoadedPeriod) {
          if (cleanOption === 'indicator') {
            // Only remove the specific indicator from the UI instead of clearing all
            setCountryRows(prev => prev.filter(r => r.indicator !== cleanIndicator));
            setProvinceRows(prev => prev.filter(r => r.indicator !== cleanIndicator));
          } else {
            setCountryRows([]);
            setProvinceRows([]);
            setLastLoadedPeriod(null);
          }
        }
        
        // Update the warehouse status instantly
        await fetchWarehouseStatus(true);
        setCleanModalOpen(false);
      } else {
        toast.error(res.error || 'Failed to clear warehouse analytics.');
      }
    } catch (e) {
      toast.error(e.response?.data?.error || e.message || 'An error occurred during clearing.');
    } finally {
      setClearing(false);
    }
  };

  // Load ETL logs history
  const loadEtlHistory = async () => {
    try {
      const res = await getEtlHistory({ limit: 15 });
      if (res.success) {
        setHistoryList(res.data || []);
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to load ETL log history.');
    }
  };

  useEffect(() => {
    if (showHistory) {
      loadEtlHistory();
    }
  }, [showHistory]);

  const toggleAll = () => {
    if (expandedIndicators.size === filteredRows.length) {
      setExpandedIndicators(new Set());
    } else {
      setExpandedIndicators(new Set(filteredRows.map(r => r.indicator)));
    }
  };

  const toggleRow = (indicator) => {
    const next = new Set(expandedIndicators);
    if (next.has(indicator)) {
      next.delete(indicator);
    } else {
      next.add(indicator);
    }
    setExpandedIndicators(next);
  };

  const splitIndicatorLabel = (label) => {
    const text = String(label || '').trim();
    const match = text.match(/^(.*)\s\(([^()]*)\)\s*$/);
    if (!match) return { khmerPart: text, englishPart: '' };
    return { khmerPart: match[1].trim(), englishPart: match[2].trim() };
  };

  const getTranslatedLabel = (indicator) => {
    return INDICATOR_LABEL_MAP[indicator] || indicator || '-';
  };

  const formatVal = (v) => {
    if (v == null || v === '') return '0';
    const num = Number(v);
    return Number.isNaN(num) ? '0' : num.toLocaleString();
  };

  // Calculate totals and statistics
  const kpiStats = useMemo(() => {
    const stats = {
      activeArt: 0,
      newlyInitiated: 0,
      tptStart: 0,
      vlTested: 0,
      vlSuppressed: 0
    };

    countryRows.forEach(row => {
      const ind = String(row.indicator).toLowerCase();
      const total = Number(row.Male_0_14 || 0) + Number(row.Female_0_14 || 0) + Number(row.Male_over_14 || 0) + Number(row.Female_over_14 || 0);

      if (ind.includes('active art patients') && (ind.includes('this quarter') || ind.includes('end of this quarter'))) {
        stats.activeArt = total;
      } else if (ind.includes('5. newly initiated')) {
        stats.newlyInitiated = total;
      } else if (ind.includes('8. number of patients started tpt in this quarter')) {
        stats.tptStart = total;
      } else if (ind.includes('vl tested in 12m')) {
        stats.vlTested = total;
      } else if (ind.includes('vl suppression')) {
        stats.vlSuppressed = total;
      }
    });

    const suppressionRate = stats.vlTested > 0 ? (stats.vlSuppressed / stats.vlTested) * 100 : 0;

    return {
      activeArt: stats.activeArt,
      newlyInitiated: stats.newlyInitiated,
      tptStart: stats.tptStart,
      suppressionRate
    };
  }, [countryRows]);

  const filteredRows = useMemo(() => {
    return countryRows.filter(row => {
      const label = getTranslatedLabel(row.indicator).toLowerCase();
      const rawLabel = String(row.indicator).toLowerCase();
      const q = searchQuery.toLowerCase();
      return label.includes(q) || rawLabel.includes(q);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countryRows, searchQuery]);

  const handleExportCSV = () => {
    if (!countryRows.length) {
      toast.warning('No data to export.');
      return;
    }
    const cols = ['Indicator', 'Male_0_14', 'Female_0_14', 'Male_over_14', 'Female_over_14', 'Grand_Total', 'Site_Count'];
    const exportData = countryRows.map(row => {
      const grandTotal = Number(row.Male_0_14 || 0) + Number(row.Female_0_14 || 0) + Number(row.Male_over_14 || 0) + Number(row.Female_over_14 || 0);
      return {
        Indicator: getTranslatedLabel(row.indicator),
        Male_0_14: row.Male_0_14,
        Female_0_14: row.Female_0_14,
        Male_over_14: row.Male_over_14,
        Female_over_14: row.Female_over_14,
        Grand_Total: grandTotal,
        Site_Count: row.site_count
      };
    });
    const csvContent = rowsToCsv(cols, exportData);
    downloadCsv(`warehouse-analytics-${currentPeriod.periodLabel}.csv`, csvContent);
  };

  // Styled subnav toolbar (consistent with វិភាគ / VisualizeToolbar.jsx)
  const toolbar = (
    <Patient360NavBar ariaLabel="វិភាគឃ្លាំងទិន្នន័យ" rowCount={1}>
      <Patient360NavRow tone="filters" className="gap-2">
        {/* Page Title Icon Badge */}
        <div className="inline-flex shrink-0 items-center justify-center gap-1.5 px-2 text-[11px] font-semibold text-foreground">
          <RiDatabase2Line className={cn(APP_NAV_ICON, TOOLBAR_ICON.brand)} />
          <span className="hidden md:inline">វិភាគឃ្លាំង</span>
          <span className="md:hidden">ឃ្លាំង</span>
        </div>

        <Separator orientation="vertical" className="h-4" />

        <QuarterSelectModal
          value={[selectedPeriodKey]}
          onChange={(keys) => {
            if (keys && keys.length > 0) {
              setSelectedPeriodKey(keys[keys.length - 1]);
            }
          }}
          disabled={loading}
          className="w-40 shrink-0 sm:w-48"
        />

        {/* Run Analytics Button */}
        <VizToolbarBtn
          icon={loading ? RiLoader4Line : RiDatabase2Line}
          iconClassName={loading ? TOOLBAR_ICON.brand : TOOLBAR_ICON.teal}
          label={loading ? 'កំពុងទាញ...' : 'ទាញទិន្នន័យ (Run)'}
          shortLabel={loading ? 'ទាញ...' : 'Run'}
          disabled={loading}
          onClick={runAnalytics}
          className={loading ? '[&_svg]:animate-spin' : undefined}
        />

        <Separator orientation="vertical" className="h-4" />

        {/* Export CSV Button */}
        <VizToolbarBtn
          icon={RiDownloadLine}
          iconClassName={TOOLBAR_ICON.blue}
          label="ទាញយក CSV"
          shortLabel="CSV"
          disabled={loading || countryRows.length === 0}
          onClick={handleExportCSV}
        />

        {/* Refresh Warehouse Button */}
        <VizToolbarBtn
          icon={warehouseStatus.etlRunning ? RiLoader4Line : RiRefreshLine}
          iconClassName={warehouseStatus.etlRunning ? TOOLBAR_ICON.brand : TOOLBAR_ICON.amber}
          label={warehouseStatus.etlRunning ? 'កំពុងសមកាលកម្ម...' : 'សមកាលកម្ម (Sync)'}
          shortLabel={warehouseStatus.etlRunning ? 'សមកាល...' : 'Sync'}
          disabled={warehouseStatus.etlRunning || statusLoading}
          onClick={handleRefreshWarehouse}
          className={warehouseStatus.etlRunning ? '[&_svg]:animate-spin' : undefined}
        />

        {/* Clean Button */}
        <VizToolbarBtn
          icon={RiDeleteBinLine}
          iconClassName="text-rose-500 hover:text-rose-600"
          label="សម្អាត (Clean)"
          shortLabel="សម្អាត"
          disabled={loading || statusLoading || warehouseStatus.etlRunning}
          onClick={() => {
            setCleanOption('period');
            setCleanModalOpen(true);
          }}
        />

        <Separator orientation="vertical" className="h-4" />

        {/* Setting Button to set connection database */}
        <VizToolbarBtn
          icon={RiSettings3Line}
          iconClassName="text-slate-500 hover:text-slate-600"
          label="ការកំណត់ទិន្នន័យ (Database Settings)"
          shortLabel="កំណត់ DB"
          onClick={() => {
            setConnectionModalOpen(true);
          }}
        />

        {/* Check Missing Indicators Button */}
        <VizToolbarBtn
          icon={checkingMissing ? RiLoader4Line : RiAlertLine}
          iconClassName={checkingMissing ? TOOLBAR_ICON.brand : "text-orange-500 hover:text-orange-600"}
          label="ពិនិត្យសូចនាករដែលខ្វះ (Check Missing Indicators)"
          shortLabel="ខ្វះ"
          disabled={loading || statusLoading || checkingMissing || !warehouseStatus.hasData}
          onClick={handleCheckMissingIndicators}
          className={checkingMissing ? '[&_svg]:animate-spin' : undefined}
        />

        {/* Status indicator on the right */}
        <div className="ml-auto inline-flex shrink-0 items-center gap-1.5 text-[10px] text-muted-foreground mr-1">
          <span className={cn('inline-block size-2 rounded-full', warehouseStatus.etlRunning ? 'bg-amber-500 animate-pulse' : warehouseStatus.hasData ? 'bg-emerald-500' : 'bg-destructive')} />
          <span className="hidden sm:inline">
            {warehouseStatus.etlRunning ? 'Syncing...' : warehouseStatus.hasData ? 'Warehouse Sync OK' : 'Empty Warehouse'}
          </span>
        </div>
      </Patient360NavRow>
    </Patient360NavBar>
  );

  return (
    <>
      {toolbar}
      <Patient360Layout lockViewport>
        <AppPageShell wide className="flex min-h-0 min-w-0 w-full max-w-full flex-1 flex-col !p-0">
          <Card className={cn(p360CardClass, 'flex min-h-0 min-w-0 w-full max-w-full flex-1 flex-col bg-card')}>
            <CardContent className="relative flex min-h-0 min-w-0 w-full max-w-full flex-1 flex-col p-0">
              
              {/* Spinner loader layout */}
              {loading && !countryRows.length ? (
                <div className="absolute inset-0 z-30 flex items-center justify-center bg-background/35 backdrop-blur-[2px]">
                  <div className="inline-flex items-center gap-2 text-xs text-muted-foreground bg-card px-4 py-3 border shadow-md">
                    <RiLoader4Line className="size-4 animate-spin text-primary" />
                    កំពុងផ្ទុកទិន្នន័យវិភាគ...
                  </div>
                </div>
              ) : null}

              {/* Main content scrollable panel */}
              <div className="flex-1 overflow-auto p-4 space-y-4">
                
                {/* Sync Status / Info Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-muted-foreground border-b pb-3">
                  <div>
                    {warehouseStatus.lastRefreshed ? (
                      <>ឃ្លាំងសមកាលកម្មចុងក្រោយ (Last sync): <strong className="text-foreground">{new Date(warehouseStatus.lastRefreshed).toLocaleString()}</strong></>
                    ) : (
                      <span>Warehouse has no synchronized records for {currentPeriod.periodLabel}.</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowHistory(h => !h)}
                      className="text-[10px] h-6 px-2 gap-1 text-muted-foreground hover:text-foreground hover:bg-muted/50 border"
                    >
                      <RiHistoryLine className="size-3" />
                      Sync Logs history
                    </Button>
                  </div>
                </div>

                {/* Real-time progress bar panel if ETL is active */}
                {warehouseStatus.etlProgress && warehouseStatus.etlProgress.active && (
                  <div className="bg-amber-50/50 border border-amber-200/80 p-3 rounded-none space-y-2 shadow-xs">
                    <div className="flex items-center justify-between text-xs text-amber-800 font-bold">
                      <span className="flex items-center gap-1.5">
                        <RiLoader4Line className="size-3.5 animate-spin text-amber-600" />
                        កំពុងសមកាលកម្មទិន្នន័យឃ្លាំងសូចនាករ (Indicator Warehouse Synchronization in Progress...)
                      </span>
                      <span className="tabular-nums font-extrabold text-amber-700">
                        {warehouseStatus.etlProgress.totalSites > 0
                          ? `${Math.round((warehouseStatus.etlProgress.completedSites / warehouseStatus.etlProgress.totalSites) * 100)}%`
                          : '0%'}
                      </span>
                    </div>

                    {/* Progress bar wrapper */}
                    <div className="w-full bg-amber-100 h-1.5 overflow-hidden">
                      <div
                        className="bg-amber-500 h-full transition-all duration-300"
                        style={{
                          width: `${warehouseStatus.etlProgress.totalSites > 0
                            ? (warehouseStatus.etlProgress.completedSites / warehouseStatus.etlProgress.totalSites) * 100
                            : 0}%`
                        }}
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row sm:justify-between text-[11px] text-amber-800/95 gap-2 font-medium">
                      <div>
                        មន្ទីរពេទ្យបានបញ្ចប់ (Sites Completed): <strong className="text-amber-950 font-bold">{warehouseStatus.etlProgress.completedSites} / {warehouseStatus.etlProgress.totalSites}</strong>
                      </div>
                      <div>
                        ទិន្នន័យសរុប (Total rows upserted): <strong className="text-amber-950 font-bold">{formatVal(warehouseStatus.etlProgress.processedRows)}</strong>
                      </div>
                      <div className="truncate max-w-sm">
                        កំពុងដំណើរការ (Last site): <strong className="text-amber-950 font-bold animate-pulse">{warehouseStatus.etlProgress.lastProcessedSite || 'Initializing...'}</strong>
                      </div>
                    </div>
                  </div>
                )}

                {/* Sync Logs list collapse panel */}
                <AnimatePresence>
                  {showHistory && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden bg-muted/20 border rounded-lg p-3"
                    >
                      <div className="text-[11px] font-bold text-muted-foreground mb-2">Recent Synchronizations</div>
                      {historyList.length === 0 ? (
                        <div className="text-[10px] text-muted-foreground py-1">No log records found. Click logs to reload.</div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse text-[10px]">
                            <thead>
                              <tr className="border-b bg-muted/40 text-left font-semibold text-muted-foreground">
                                <th className="p-1.5">Triggered At</th>
                                <th className="p-1.5">Period</th>
                                <th className="p-1.5 text-right">Facilities</th>
                                <th className="p-1.5 text-right">Records</th>
                                <th className="p-1.5 text-right">Duration</th>
                                <th className="p-1.5 text-center">Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {historyList.slice(0, 5).map((log) => (
                                <tr key={log.id} className="border-b last:border-b-0">
                                  <td className="p-1.5 tabular-nums">{new Date(log.started_at).toLocaleString()}</td>
                                  <td className="p-1.5">{log.period_label}</td>
                                  <td className="p-1.5 text-right tabular-nums">{log.site_count}</td>
                                  <td className="p-1.5 text-right tabular-nums">{log.row_count}</td>
                                  <td className="p-1.5 text-right tabular-nums">{(log.duration_ms / 1000).toFixed(1)}s</td>
                                  <td className="p-1.5 text-center">
                                    {log.status === 'success' ? (
                                      <span className="text-emerald-600 font-semibold">Success</span>
                                    ) : log.status === 'failed' ? (
                                      <span className="text-destructive font-semibold" title={log.error_msg}>Failed</span>
                                    ) : (
                                      <span className="text-amber-500 font-semibold animate-pulse">Running</span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* KPI Card row utilizing vizKpiCardClass for 100% aesthetic consistency */}
                {countryRows.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className={cn(vizKpiCardClass, 'rounded-none border')}>
                      <div className="text-[10px] font-bold text-muted-foreground uppercase leading-none">Active ART Patients</div>
                      <div className="mt-2 text-lg font-black text-violet-600 tracking-tight">{formatVal(kpiStats.activeArt)}</div>
                      <div className="text-[9px] text-muted-foreground mt-0.5">Sustained this quarter</div>
                    </div>
                    
                    <div className={cn(vizKpiCardClass, 'rounded-none border')}>
                      <div className="text-[10px] font-bold text-muted-foreground uppercase leading-none">Newly Initiated</div>
                      <div className="mt-2 text-lg font-black text-emerald-600 tracking-tight">{formatVal(kpiStats.newlyInitiated)}</div>
                      <div className="text-[9px] text-muted-foreground mt-0.5">Newly enrolled in ARV</div>
                    </div>
                    
                    <div className={cn(vizKpiCardClass, 'rounded-none border')}>
                      <div className="text-[10px] font-bold text-muted-foreground uppercase leading-none">TPT Initiations</div>
                      <div className="mt-2 text-lg font-black text-sky-600 tracking-tight">{formatVal(kpiStats.tptStart)}</div>
                      <div className="text-[9px] text-muted-foreground mt-0.5">Started TB prophylaxis</div>
                    </div>
                    
                    <div className={cn(vizKpiCardClass, 'rounded-none border')}>
                      <div className="text-[10px] font-bold text-muted-foreground uppercase leading-none">Viral Load Suppression</div>
                      <div className="mt-2 text-lg font-black text-amber-600 tracking-tight">
                        {kpiStats.suppressionRate > 0 ? `${kpiStats.suppressionRate.toFixed(1)}%` : '0%'}
                      </div>
                      <div className="text-[9px] text-muted-foreground mt-0.5">VL suppression rate</div>
                    </div>
                  </div>
                )}

                {/* Table details searchable container */}
                <div className="border border-border/80 bg-card rounded-none overflow-hidden">
                  <div className="p-3 border-b flex flex-col md:flex-row gap-3 items-stretch md:items-center md:justify-between bg-muted/15">
                    <div className="relative flex-1">
                      <RiSearchLine className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                      <input
                        type="text"
                        placeholder="ស្វែងរកសូចនាករ... (Search indicators by code or label)"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-background border rounded-none pl-8 pr-3 h-8 text-[11px] focus:outline-none focus:ring-1 focus:ring-ring"
                      />
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={toggleAll}
                        disabled={filteredRows.length === 0}
                        className="text-[11px] h-8 px-2.5 rounded-none font-medium"
                      >
                        {expandedIndicators.size === filteredRows.length ? 'Collapse All' : 'Expand All'}
                      </Button>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    {loading && !countryRows.length ? (
                      <div className="flex min-h-64 items-center justify-center p-8 text-center text-xs text-muted-foreground">
                        Loading reports...
                      </div>
                    ) : filteredRows.length === 0 ? (
                      <div className="flex min-h-48 items-center justify-center text-[11px] text-muted-foreground p-8 text-center">
                        {countryRows.length === 0 ? (
                          <div>
                            No warehouse analytics records loaded for <strong className="text-foreground">{currentPeriod.periodLabel}</strong>.<br />
                            Select period parameters and click <strong>ទាញទិន្នន័យ (Run)</strong> inside toolbar.
                          </div>
                        ) : (
                          'No indicators match your filter query.'
                        )}
                      </div>
                    ) : (
                      <table className="w-full border-collapse text-[11px]">
                        <thead>
                          <tr className="border-b border-border/20 bg-muted/50 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider text-left">
                            <th className="p-2.5 w-8"></th>
                            <th className="p-2.5 min-w-[280px]">សូចនាករ (Indicator Name)</th>
                            <th className="p-2.5 text-right">ប្រុស ០-១៤</th>
                            <th className="p-2.5 text-right">ស្រី ០-១៤</th>
                            <th className="p-2.5 text-right">ប្រុស &gt;១៤</th>
                            <th className="p-2.5 text-right">ស្រី &gt;១៤</th>
                            <th className="p-2.5 text-right">សរុប (Total)</th>
                            <th className="p-2.5 text-right pr-4">មន្ទីរពេទ្យ (Sites)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/20">
                          {filteredRows.map((row, idx) => {
                            const isExpanded = expandedIndicators.has(row.indicator);
                            const grandTotal = Number(row.Male_0_14 || 0) + Number(row.Female_0_14 || 0) + Number(row.Male_over_14 || 0) + Number(row.Female_over_14 || 0);
                            
                            // Filter matching province records for drill down
                            const matchingProvinces = provinceRows.filter(p => p.indicator === row.indicator);

                            return (
                              <Fragment key={`${row.indicator}-${idx}`}>
                                <tr
                                  onClick={() => toggleRow(row.indicator)}
                                  className="hover:bg-muted/20 transition-colors duration-150 cursor-pointer group"
                                >
                                  <td className="p-2.5 text-center">
                                    {isExpanded ? (
                                      <RiArrowUpSLine className="size-4 text-primary transition" />
                                    ) : (
                                      <RiArrowDownSLine className="size-4 text-muted-foreground group-hover:text-foreground transition" />
                                    )}
                                  </td>
                                  <td className="p-2.5 font-semibold text-foreground">
                                    {(() => {
                                      const translated = getTranslatedLabel(row.indicator);
                                      const { khmerPart, englishPart } = splitIndicatorLabel(translated);
                                      return (
                                        <div className="leading-snug">
                                          <div className="text-foreground group-hover:text-primary transition-colors">{khmerPart}</div>
                                          {englishPart && (
                                            <div className="text-[10px] text-muted-foreground mt-0.5">({englishPart})</div>
                                          )}
                                        </div>
                                      );
                                    })()}
                                  </td>
                                  <td className="p-2.5 text-right tabular-nums text-report-male/85 font-medium">{formatVal(row.Male_0_14)}</td>
                                  <td className="p-2.5 text-right tabular-nums text-report-female/85 font-medium">{formatVal(row.Female_0_14)}</td>
                                  <td className="p-2.5 text-right tabular-nums text-report-male/95 font-medium">{formatVal(row.Male_over_14)}</td>
                                  <td className="p-2.5 text-right tabular-nums text-report-female/95 font-medium">{formatVal(row.Female_over_14)}</td>
                                  <td className="p-2.5 text-right tabular-nums font-black text-foreground underline decoration-border/60 bg-muted/5">{formatVal(grandTotal)}</td>
                                  <td className="p-2.5 text-right tabular-nums font-medium text-muted-foreground">{formatVal(row.site_count)}</td>
                                </tr>

                                {/* Collapsible Province Drill-Down Row */}
                                {isExpanded && (
                                  <tr>
                                    <td colSpan={8} className="bg-muted/5 p-0 border-t border-b">
                                      <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="px-4 py-3 space-y-2 overflow-hidden"
                                      >
                                        <div className="flex items-center justify-between">
                                          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                            Province Breakdown for: {row.indicator.split('. ')[1] || row.indicator}
                                          </div>
                                          <div className="text-[10px] text-muted-foreground">
                                            Proportion of total metrics reported per province
                                          </div>
                                        </div>

                                        {matchingProvinces.length === 0 ? (
                                          <div className="text-xs text-muted-foreground p-3 border border-dashed rounded-none bg-background/50 text-center">
                                            No province details loaded. Ensure ETL sync completed successfully.
                                          </div>
                                        ) : (
                                          <div className="border rounded-none overflow-hidden bg-background shadow-inner">
                                            <table className="w-full text-[10px] border-collapse">
                                              <thead>
                                                <tr className="border-b border-border/20 bg-muted/30 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider text-left">
                                                  <th className="p-2 pl-3">Province</th>
                                                  <th className="p-2 text-right">Male 0-14</th>
                                                  <th className="p-2 text-right">Female 0-14</th>
                                                  <th className="p-2 text-right">Male &gt;14</th>
                                                  <th className="p-2 text-right">Female &gt;14</th>
                                                  <th className="p-2 text-right font-bold text-foreground">Total</th>
                                                  <th className="p-2 text-right">Share (%)</th>
                                                  <th className="p-2 text-right pr-3">Reporting Sites</th>
                                                </tr>
                                              </thead>
                                              <tbody className="divide-y divide-border/60">
                                                {matchingProvinces.map((prov, pIdx) => {
                                                  const provTotal = Number(prov.Male_0_14 || 0) + Number(prov.Female_0_14 || 0) + Number(prov.Male_over_14 || 0) + Number(prov.Female_over_14 || 0);
                                                  const pct = grandTotal > 0 ? (provTotal / grandTotal) * 100 : 0;
                                                  return (
                                                    <tr key={`${prov.province_id}-${pIdx}`} className="hover:bg-muted/20 transition-colors duration-150">
                                                      <td className="p-2 pl-3 font-semibold text-foreground">{prov.province_name || `Province ${prov.province_id}`}</td>
                                                      <td className="p-2 text-right tabular-nums">{formatVal(prov.Male_0_14)}</td>
                                                      <td className="p-2 text-right tabular-nums">{formatVal(prov.Female_0_14)}</td>
                                                      <td className="p-2 text-right tabular-nums">{formatVal(prov.Male_over_14)}</td>
                                                      <td className="p-2 text-right tabular-nums">{formatVal(prov.Female_over_14)}</td>
                                                      <td className="p-2 text-right tabular-nums font-bold text-foreground bg-muted/5">{formatVal(provTotal)}</td>
                                                      <td className="p-2 text-right tabular-nums font-medium text-primary bg-primary/5">{pct.toFixed(1)}%</td>
                                                      <td className="p-2 text-right tabular-nums pr-3 text-muted-foreground">{formatVal(prov.site_count)}</td>
                                                    </tr>
                                                  );
                                                })}
                                              </tbody>
                                            </table>
                                          </div>
                                        )}
                                      </motion.div>
                                    </td>
                                  </tr>
                                )}
                              </Fragment>
                            );
                          })}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>

                {/* Footer metadata info */}
                {lastLoadedPeriod && (
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground border-t pt-2.5">
                    <div>
                      Currently displaying pre-aggregated warehouse data for period: <strong className="text-foreground">{lastLoadedPeriod}</strong>
                    </div>
                    <div>
                      Total indicators: <strong className="text-foreground">{filteredRows.length}</strong>
                    </div>
                  </div>
                )}

              </div>
            </CardContent>
          </Card>
        </AppPageShell>
      </Patient360Layout>

      {/* Clean Confirmation Modal */}
      {cleanModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/45 p-4 animate-in fade-in duration-200" role="dialog" aria-modal="true">
          <div className="flex max-h-[min(88vh,42rem)] w-full max-w-md flex-col overflow-hidden bg-card shadow-2xl border" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="flex shrink-0 items-start gap-3 border-b border-border/80 bg-muted/35 px-5 py-3">
              <div className="min-w-0 flex-1">
                <h2 className="text-sm font-bold text-foreground">សម្អាតទិន្នន័យឃ្លាំងវិភាគ (Clean Warehouse Analytics)</h2>
              </div>
              <button
                type="button"
                className="inline-flex h-7 w-7 shrink-0 items-center justify-center border border-border/80 bg-background/80 hover:bg-muted text-muted-foreground hover:text-foreground"
                onClick={() => setCleanModalOpen(false)}
                disabled={clearing}
                aria-label="Close"
              >
                <RiCloseCircleLine className="size-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 space-y-4 text-[11px] leading-relaxed">
              <p className="text-muted-foreground">
                ការសម្អាតទិន្នន័យឃ្លាំងវិភាគ នឹងលុបទិន្នន័យដែលបានសមកាលកម្មរួចជាបណ្តោះអាសន្ន។ អ្នកអាចទាញសមកាលកម្មឡើងវិញបានគ្រប់ពេល។
                <br />
                <span className="text-[10px] text-muted-foreground mt-1 block">
                  (Clearing analytics warehouse data deletes previously pre-aggregated values. You can run synchronization again at any time.)
                </span>
              </p>

              <div className="space-y-2 border border-border/80 p-3 bg-muted/10">
                <label className="flex items-center gap-3 cursor-pointer font-semibold text-foreground py-1">
                  <input
                    type="radio"
                    name="cleanOption"
                    checked={cleanOption === 'period'}
                    onChange={() => setCleanOption('period')}
                    disabled={clearing}
                    className="size-4 accent-primary"
                  />
                  <div>
                    <div>សម្អាតតែគ្រានេះ (Clean Selected Period)</div>
                    <div className="text-[10px] text-muted-foreground font-normal mt-0.5">
                      លុបទិន្នន័យសរុបសម្រាប់តែរយៈពេល <strong>{currentPeriod.periodLabel}</strong> នេះប៉ុណ្ណោះ។
                    </div>
                  </div>
                </label>

                <Separator className="my-2" />

                <label className="flex items-start gap-3 cursor-pointer font-semibold text-foreground py-1">
                  <input
                    type="radio"
                    name="cleanOption"
                    checked={cleanOption === 'indicator'}
                    onChange={() => setCleanOption('indicator')}
                    disabled={clearing}
                    className="size-4 accent-primary mt-1"
                  />
                  <div className="flex-1">
                    <div>សម្អាតសូចនាករជាក់លាក់ (Clean Specific Indicator)</div>
                    <div className="text-[10px] text-muted-foreground font-normal mt-0.5 mb-2">
                      លុបទិន្នន័យតែមួយសូចនាករដែលជ្រើសរើសសម្រាប់រយៈពេល <strong>{currentPeriod.periodLabel}</strong>។
                    </div>
                    {cleanOption === 'indicator' && (
                      <select
                        className="w-full border p-1.5 text-[11px]"
                        value={cleanIndicator}
                        onChange={(e) => setCleanIndicator(e.target.value)}
                        disabled={clearing}
                      >
                        <option value="">ជ្រើសរើសសូចនាករ (Select indicator)...</option>
                        {countryRows.map(r => (
                          <option key={r.indicator} value={r.indicator}>{r.indicator}</option>
                        ))}
                      </select>
                    )}
                  </div>
                </label>

                <Separator className="my-2" />

                <label className="flex items-center gap-3 cursor-pointer font-semibold text-foreground py-1">
                  <input
                    type="radio"
                    name="cleanOption"
                    checked={cleanOption === 'all'}
                    onChange={() => setCleanOption('all')}
                    disabled={clearing}
                    className="size-4 accent-destructive"
                  />
                  <div>
                    <div className="text-destructive font-bold">សម្អាតឃ្លាំងទាំងមូល (Clean All Data)</div>
                    <div className="text-[10px] text-muted-foreground font-normal mt-0.5">
                      លុបទិន្នន័យសរុបទាំងអស់ពីតារាងឃ្លាំងវិភាគ (Truncate table)។
                    </div>
                  </div>
                </label>
              </div>

              {cleanOption === 'all' && (
                <div className="p-2.5 bg-rose-50 border border-rose-100 text-rose-800 text-[10px] leading-snug">
                  <strong>⚠️ ព្រមាន (Warning):</strong> ជម្រើសនេះនឹងលុបគ្រប់ត្រីមាស និងគ្រប់ខែទាំងអស់ពីឃ្លាំងទិន្នន័យ។
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex shrink-0 justify-end gap-2 border-t border-border/80 bg-muted/20 px-5 py-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCleanModalOpen(false)}
                disabled={clearing}
                className="text-[11px] h-8 rounded-none px-3 font-medium"
              >
                បោះបង់ (Cancel)
              </Button>
              <Button
                type="button"
                variant={cleanOption === 'all' ? 'destructive' : 'default'}
                size="sm"
                onClick={handleClearAnalytics}
                disabled={clearing}
                className="text-[11px] h-8 rounded-none px-3 font-semibold gap-1"
              >
                {clearing ? (
                  <>
                    <RiLoader4Line className="size-3.5 animate-spin" />
                    កំពុងសម្អាត...
                  </>
                ) : (
                  <>
                    <RiDeleteBinLine className="size-3.5" />
                    យល់ព្រមសម្អាត (Confirm)
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Missing Indicators Modal */}
      {missingIndicatorsModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/45 p-4 animate-in fade-in duration-200" role="dialog" aria-modal="true">
          <div className="flex max-h-[min(88vh,42rem)] w-full max-w-md flex-col overflow-hidden bg-card shadow-2xl border" onClick={(e) => e.stopPropagation()}>
            <div className="flex shrink-0 items-start gap-3 border-b border-orange-200/50 bg-orange-50/50 px-5 py-3">
              <div className="min-w-0 flex-1">
                <h2 className="text-sm font-bold text-orange-700 flex items-center gap-2">
                  <RiAlertLine className="size-4" />
                  សូចនាករដែលខ្វះ (Missing Indicators)
                </h2>
              </div>
              <button
                type="button"
                className="inline-flex h-7 w-7 shrink-0 items-center justify-center border border-border/80 bg-background/80 hover:bg-muted text-muted-foreground hover:text-foreground"
                onClick={() => setMissingIndicatorsModalOpen(false)}
                aria-label="Close"
              >
                <RiCloseCircleLine className="size-4" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 space-y-4 text-[12px] leading-relaxed">
              <p className="text-muted-foreground">
                សូចនាករចំនួន <strong className="text-foreground">{missingIndicatorsList.length}</strong> មិនទាន់មានទិន្នន័យក្នុងឃ្លាំងសម្រាប់រយៈពេល <strong>{currentPeriod.periodLabel}</strong> នេះទេ៖
              </p>
              <div className="flex flex-wrap gap-2 p-3 bg-muted/20 border border-border/50 max-h-48 overflow-y-auto">
                {missingIndicatorsList.map(id => (
                  <Badge key={id} variant="secondary" className="font-mono text-[10px] rounded-none border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100">
                    {id}
                  </Badge>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground mt-2">
                តើអ្នកចង់ធ្វើសមកាលកម្មទាញយកទិន្នន័យសម្រាប់តែសូចនាករដែលខ្វះទាំងនេះមែនទេ?
                <br />
                <span className="opacity-80">(Do you want to sync these missing indicators now?)</span>
              </p>
            </div>

            <div className="flex shrink-0 justify-end gap-2 border-t border-border/80 bg-muted/20 px-5 py-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setMissingIndicatorsModalOpen(false)}
                className="text-[11px] h-8 rounded-none px-3 font-medium"
              >
                បោះបង់ (Cancel)
              </Button>
              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={() => {
                  setMissingIndicatorsModalOpen(false);
                  toast.info('កំពុងទាញយកទិន្នន័យ... (Starting sync)');
                  triggerAnalyticsRefresh({ ...currentPeriod, indicators: missingIndicatorsList })
                    .then(() => fetchWarehouseStatus())
                    .catch(err => toast.error('បរាជ័យ (Failed): ' + err.message));
                }}
                className="text-[11px] h-8 rounded-none px-3 font-semibold gap-1 bg-orange-600 hover:bg-orange-700 text-white"
              >
                <RiRefreshLine className="size-3.5" />
                សមកាលកម្ម (Sync Missing)
              </Button>
            </div>
          </div>
        </div>
      )}

      <DatabaseConnectionModal
        open={connectionModalOpen}
        onClose={() => setConnectionModalOpen(false)}
      />
    </>
  );
}
