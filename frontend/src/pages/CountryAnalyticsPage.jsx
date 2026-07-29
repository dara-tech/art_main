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
  RiAlertLine,
  RiDownloadCloud2Line,
  RiFilter3Line,
  RiListCheck,
  RiCodeSSlashLine
} from '@remixicon/react';
import { AnimatePresence, motion } from 'motion/react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { INDICATOR_LABEL_MAP } from './ReportHomePage';
import {
  getAnalyticsStatus,
  getCountryAnalytics,
  getProvinceAnalytics,
  getAnalyticsSummary,
  getEtlHistory,
  triggerAnalyticsRefresh,
  clearAnalyticsData,
  getIndicatorReference,
  getSitesSyncStatus
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
import AppLoadingOverlay, { AppSpinner } from '@/components/ui/AppLoadingOverlay';
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

const ALL_WAREHOUSE_INDICATORS = [
  { id: '01_active_art_previous', name: '1. ចំនួនអ្នកជំងឺ ART សកម្មដល់ចុងត្រីមាសមុន (Active ART previous)' },
  { id: '02_active_pre_art_previous', name: '2. ចំនួនអ្នកជំងឺ Pre-ART សកម្មដល់ចុងត្រីមាសមុន (Active Pre-ART previous)' },
  { id: '03_newly_enrolled', name: '3. ចំនួនអ្នកជំងឺចុះឈ្មោះថ្មី (Newly Enrolled)' },
  { id: '04_retested_positive', name: '4. ចំនួនអ្នកជំងឺដែលវិជ្ជមានពីតេស្តបញ្ជាក់ (Re-tested positive)' },
  { id: '05_newly_initiated', name: '5. ចំនួនអ្នកជំងឺចាប់ផ្តើមព្យាបាលដោយ ARV ថ្មី (Newly Initiated)' },
  { id: '05.1.1_art_same_day', name: '5.1.1. ក្នុងថ្ងៃតែមួយ (Same day)' },
  { id: '05.1.2_art_1_7_days', name: '5.1.2. ពី ១ ទៅ ៧ ថ្ងៃ (1-7 days)' },
  { id: '05.1.3_art_over_7_days', name: '5.1.3. ច្រើនជាង ៧ ថ្ងៃ (>7 days)' },
  { id: '05.2_art_with_tld', name: '5.2. ចាប់ផ្តើម ART ដោយ TLD (Started with TLD)' },
  { id: '05.3_art_pregnant', name: '5.3. ចំនួនអ្នកជំងឺ ART ថ្មីដែលមានផ្ទៃពោះ (Pregnant)' },
  { id: '06_transfer_in', name: '6. បញ្ជូនចូល (Transfer-in)' },
  { id: '07_lost_and_return', name: '7. បោះបង់ហើយត្រឡប់ (Lost & Return)' },
  { id: '08_tpt_new_start', name: '8. ចំនួនអ្នកជំងឺចាប់ផ្តើម TPT ក្នុងត្រីមាសនេះ (Started TPT)' },
  { id: '09.1_dead', name: '9.1. ស្លាប់ (Dead)' },
  { id: '09.2_lost_to_followup', name: '9.2. បោះបង់ (LTFU)' },
  { id: '09.3_transfer_out', name: '9.3. ផ្ទេរចេញ (Transfer-out)' },
  { id: '10_active_pre_art', name: '10. Pre-ART សកម្ម (Active Pre-ART)' },
  { id: '11_active_art_current', name: '11. ART សកម្ម (Active ART)' },
  { id: '11.1_eligible_mmd', name: '11.1. សមស្រប MMD (Eligible MMD)' },
  { id: '11.2_mmd', name: '11.2. MMD' },
  { id: '11.3_tld', name: '11.3. TLD' },
  { id: '11.4_tpt_start', name: '11.4. ចាប់ផ្តើម TPT (TPT Start)' },
  { id: '11.5_tpt_complete', name: '11.5. បញ្ចប់ TPT (TPT Complete)' },
  { id: '11.5.1_started_art_over_6m', name: '11.5.1. ចាប់ផ្តើម ART > 6M' },
  { id: '11.6_eligible_vl_test', name: '11.6. សមស្របតេស្ត VL (Eligible VL)' },
  { id: '11.7_vl_tested_12m', name: '11.7. VL ក្នុង 12M' },
  { id: '11.8_vl_suppression', name: '11.8. VL បង្ក្រាប (VL suppression)' },
  { id: '11.9_eligible_eac_high_vl', name: '11.9. សមស្រប EAC' },
  { id: '11.10_eac_session_1', name: '11.10. EAC 1' },
  { id: '11.11_eac_session_2', name: '11.11. EAC 2' },
  { id: '11.12_eac_session_3', name: '11.12. EAC 3' },
  { id: '11.13_vl_followup_6m_after_eac', name: '11.13. VL តាមដាន ≤6M' },
  { id: '11.14_vl_followup_6m_apart_high_vl', name: '11.14. VL តាមដាន ≥6M' }
];

const INDICATOR_PRESET_BUNDLES = [
  {
    id: 'newly',
    label: 'Newly Enrolled & Initiated',
    ids: ['03_newly_enrolled', '05_newly_initiated', '05.1.1_art_same_day', '05.1.2_art_1_7_days', '05.1.3_art_over_7_days', '05.2_art_with_tld', '05.3_art_pregnant']
  },
  {
    id: 'active',
    label: 'Active & Retention',
    ids: ['01_active_art_previous', '02_active_pre_art_previous', '10_active_pre_art', '11_active_art_current']
  },
  {
    id: 'vl',
    label: 'Viral Load & EAC',
    ids: ['11.6_eligible_vl_test', '11.7_vl_tested_12m', '11.8_vl_suppression', '11.9_eligible_eac_high_vl', '11.10_eac_session_1', '11.11_eac_session_2', '11.12_eac_session_3', '11.13_vl_followup_6m_after_eac', '11.14_vl_followup_6m_apart_high_vl']
  },
  {
    id: 'tpt',
    label: 'TPT Care Cascade',
    ids: ['08_tpt_new_start', '11.4_tpt_start', '11.5_tpt_complete', '11.5.1_started_art_over_6m']
  },
  {
    id: 'exits',
    label: 'Exits & LTFU',
    ids: ['09.1_dead', '09.2_lost_to_followup', '09.3_transfer_out']
  }
];

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
  const [deletingIndicator, setDeletingIndicator] = useState(null);
  const [selectedIndicators, setSelectedIndicators] = useState(new Set()); // bulk select
  const [bulkDeleting, setBulkDeleting] = useState(false);

  // Settings Modal state
  const [connectionModalOpen, setConnectionModalOpen] = useState(false);

  // Facility site breakdown state (Level 2 drill-down)
  const [expandedProvinces, setExpandedProvinces] = useState(new Set());
  const [siteBreakdownMap, setSiteBreakdownMap] = useState({});
  const [loadingProvinceSites, setLoadingProvinceSites] = useState({});

  const toggleProvinceRow = async (indicator, provinceId, provinceName) => {
    const targetProv = provinceId || provinceName;
    const key = `${indicator}:${targetProv}`;
    const next = new Set(expandedProvinces);
    if (next.has(key)) {
      next.delete(key);
      setExpandedProvinces(next);
      return;
    }

    next.add(key);
    setExpandedProvinces(next);

    if (!siteBreakdownMap[key]) {
      setLoadingProvinceSites((prev) => ({ ...prev, [key]: true }));
      try {
        const res = await getAnalyticsSummary({
          ...currentPeriod,
          provinceId: targetProv
        });
        if (res.success && Array.isArray(res.data)) {
          const normTarget = String(indicator || '').toLowerCase().replace(/[^a-z0-9]/g, '');
          const siteRowsForIndicator = res.data.filter((r) => {
            const rInd = String(r.indicator || r.Indicator || '');
            const normR = rInd.toLowerCase().replace(/[^a-z0-9]/g, '');
            return rInd === indicator || normR === normTarget || (normR && normTarget && (normR.includes(normTarget) || normTarget.includes(normR)));
          });
          setSiteBreakdownMap((prev) => ({ ...prev, [key]: siteRowsForIndicator }));
        }
      } catch (e) {
        console.error('Failed to load site breakdown for province:', e);
      } finally {
        setLoadingProvinceSites((prev) => ({ ...prev, [key]: false }));
      }
    }
  };

  // Sync Specific Indicators state
  const [selectedSyncIndicators, setSelectedSyncIndicators] = useState([]);
  const [syncIndicatorsModalOpen, setSyncIndicatorsModalOpen] = useState(false);
  const [syncIndicatorSearch, setSyncIndicatorSearch] = useState('');

  // SQL Inspection state
  const [sqlModalOpen, setSqlModalOpen] = useState(false);
  const [viewingSqlItem, setViewingSqlItem] = useState(null);
  const [loadingSql, setLoadingSql] = useState(false);

  const handleInspectSql = async (indicatorRow) => {
    setLoadingSql(true);
    setSqlModalOpen(true);
    try {
      const res = await getIndicatorReference();
      if (res.success && Array.isArray(res.data)) {
        const match = res.data.find(d => {
          const sql = d.aggregateSql || '';
          const m = sql.match(/['"]([^'"]+)['"]\s+AS\s+Indicator/i);
          const label = m ? m[1].trim() : d.indicatorId;
          return label === indicatorRow.indicator || d.indicatorId === indicatorRow.indicator || d.indicatorId === indicatorRow.rawIndicator;
        });
        setViewingSqlItem(match || { indicatorId: indicatorRow.indicator, aggregateSql: '-- SQL query reference not available.' });
      }
    } catch (e) {
      toast.error('Failed to load SQL reference: ' + e.message);
    } finally {
      setLoadingSql(false);
    }
  };

  // Delete a single indicator row from the warehouse for the current period
  const handleDeleteIndicator = async (indicatorText) => {
    if (deletingIndicator) return;
    setDeletingIndicator(indicatorText);
    try {
      await clearAnalyticsData({ ...currentPeriod, indicator: indicatorText });
      setCountryRows((prev) => prev.filter((r) => (r.indicator || r.Indicator) !== indicatorText));
      setSelectedIndicators((prev) => { const n = new Set(prev); n.delete(indicatorText); return n; });
      toast.success(`Deleted indicator: ${indicatorText.split('. ')[0] || indicatorText}`);
    } catch (e) {
      toast.error('Failed to delete indicator: ' + e.message);
    } finally {
      setDeletingIndicator(null);
    }
  };

  // Bulk delete all selected indicators
  const handleBulkDelete = async () => {
    if (bulkDeleting || selectedIndicators.size === 0) return;
    setBulkDeleting(true);
    const toDelete = Array.from(selectedIndicators);
    let successCount = 0;
    try {
      await Promise.all(
        toDelete.map((ind) =>
          clearAnalyticsData({ ...currentPeriod, indicator: ind })
            .then(() => { successCount += 1; })
            .catch((e) => console.warn('[BulkDelete] Failed for', ind, e.message))
        )
      );
      setCountryRows((prev) => prev.filter((r) => !selectedIndicators.has(r.indicator || r.Indicator)));
      setSelectedIndicators(new Set());
      toast.success(`Deleted ${successCount} of ${toDelete.length} indicators.`);
    } catch (e) {
      toast.error('Bulk delete error: ' + e.message);
    } finally {
      setBulkDeleting(false);
    }
  };

  const toggleSelectRow = (indicatorText) => {
    setSelectedIndicators((prev) => {
      const n = new Set(prev);
      if (n.has(indicatorText)) n.delete(indicatorText);
      else n.add(indicatorText);
      return n;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIndicators.size === filteredRows.length && filteredRows.length > 0) {
      setSelectedIndicators(new Set());
    } else {
      setSelectedIndicators(new Set(filteredRows.map((r) => r.indicator)));
    }
  };

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

  // Manage sites state
  const [managingSites, setManagingSites] = useState(false);
  const [manageSitesModalOpen, setManageSitesModalOpen] = useState(false);
  const [sitesList, setSitesList] = useState([]);
  const [siteActionLoading, setSiteActionLoading] = useState(null); // 'sync-1234' or 'clear-1234'

  const handleOpenManageSites = async () => {
    setManagingSites(true);
    try {
      const res = await getSitesSyncStatus(currentPeriod);
      if (!res.success) throw new Error('Failed to load sites status');
      setSitesList(res.data || []);
      setManageSitesModalOpen(true);
    } catch (e) {
      toast.error('Failed to load sites status: ' + e.message);
    } finally {
      setManagingSites(false);
    }
  };

  const handleSyncSite = async (siteCode) => {
    setSiteActionLoading(`sync-${siteCode}`);
    try {
      const payload = {
        ...currentPeriod,
        siteCodes: [siteCode],
        ...(selectedSyncIndicators.length > 0 ? { indicators: selectedSyncIndicators } : {})
      };
      const res = await triggerAnalyticsRefresh(payload);
      if (res.success) {
        toast.success(`Started sync for site ${siteCode}.`);
        setWarehouseStatus(prev => ({ ...prev, etlRunning: true }));
        // Optimistically update the list
        setSitesList(prev => prev.map(s => s.code === siteCode ? { ...s, isSynced: true } : s));
      } else {
        toast.error('Could not initiate targeted warehouse refresh.');
      }
    } catch (e) {
      toast.error(e.response?.data?.error || e.message || 'Targeted refresh failed');
    } finally {
      setSiteActionLoading(null);
    }
  };

  const handleClearSite = async (siteCode) => {
    setSiteActionLoading(`clear-${siteCode}`);
    try {
      const payload = {
        ...currentPeriod,
        siteCode
      };
      const res = await clearAnalyticsData(payload);
      if (res.success) {
        toast.success(`Cleared analytics data for site ${siteCode}.`);
        // Update the list
        setSitesList(prev => prev.map(s => s.code === siteCode ? { ...s, isSynced: false } : s));
      } else {
        toast.error('Could not clear site analytics.');
      }
    } catch (e) {
      toast.error(e.response?.data?.error || e.message || 'Clear site failed');
    } finally {
      setSiteActionLoading(null);
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

  const wasEtlRunningRef = useRef(false);

  useEffect(() => {
    let timer = null;
    if (warehouseStatus.etlRunning) {
      wasEtlRunningRef.current = true;
      timer = setInterval(() => {
        fetchWarehouseStatus(true);
      }, 3000);
    } else if (wasEtlRunningRef.current) {
      wasEtlRunningRef.current = false;
      runAnalytics();
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
      const payload = {
        ...currentPeriod,
        ...(selectedSyncIndicators.length > 0 ? { indicators: selectedSyncIndicators } : {})
      };
      const res = await triggerAnalyticsRefresh(payload);
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

  // Trigger batch ETL for multiple periods
  const handleBatchSync = async (keys) => {
    if (warehouseStatus.etlRunning) {
      toast.warning('Refresh already in progress.');
      return;
    }
    try {
      const payload = {
        periods: keys,
        ...(selectedSyncIndicators.length > 0 ? { indicators: selectedSyncIndicators } : {})
      };
      const res = await triggerAnalyticsRefresh(payload);
      if (res.success) {
        toast.success(res.message || `Batch sync started for ${keys.length} periods.`);
        setWarehouseStatus(prev => ({ ...prev, etlRunning: true }));
      } else {
        toast.error('Could not initiate batch warehouse refresh.');
      }
    } catch (e) {
      toast.error(e.response?.data?.error || e.message || 'Batch refresh failed');
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

  const handleBatchExportCSV = async (keys) => {
    if (!keys || keys.length === 0) return;
    
    toast.info(`កំពុងទាញយកទិន្នន័យសម្រាប់ ${keys.length} ត្រីមាស/ខែ...`);
    
    try {
      let allExportData = [];
      const emptyPeriods = [];
      const cols = ['Period', 'Indicator', 'Male_0_14', 'Female_0_14', 'Male_over_14', 'Female_over_14', 'Grand_Total', 'Site_Count'];
      
      for (const key of keys) {
        const period = getPeriodByKey(key);
        if (!period) continue;
        
        const res = await getCountryAnalytics({ periodLabel: period.periodLabel, periodType: period.periodType });
        if (res?.success && res.data && res.data.length > 0) {
          const rows = res.data.map(row => {
            const grandTotal = Number(row.Male_0_14 || 0) + Number(row.Female_0_14 || 0) + Number(row.Male_over_14 || 0) + Number(row.Female_over_14 || 0);
            return {
              Period: period.periodLabel,
              Indicator: getTranslatedLabel(row.indicator),
              Male_0_14: row.Male_0_14,
              Female_0_14: row.Female_0_14,
              Male_over_14: row.Male_over_14,
              Female_over_14: row.Female_over_14,
              Grand_Total: grandTotal,
              Site_Count: row.site_count
            };
          });
          allExportData = allExportData.concat(rows);
        } else {
          emptyPeriods.push(period.periodLabel);
        }
      }
      
      if (allExportData.length === 0) {
        toast.warning('គ្មានទិន្នន័យសម្រាប់ទាញយកទេ។ សូមប្រាកដថាអ្នកបាន "សមកាលកម្មច្រើន (Batch Sync)" រួចរាល់។');
        return;
      }
      
      if (emptyPeriods.length > 0) {
        toast.warning(`មិនមានទិន្នន័យសម្រាប់: ${emptyPeriods.join(', ')} (សូមសមកាលកម្មជាមុនសិន)`);
      }
      
      const csvContent = rowsToCsv(cols, allExportData);
      downloadCsv(`warehouse-batch-export.csv`, csvContent);
      toast.success(`ទាញយកជោគជ័យ (${allExportData.length} ជួរ)`);
    } catch (err) {
      toast.error('Failed to batch export: ' + err.message);
    }
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
          singleSelect={true}
          disabled={loading}
          className="w-40 shrink-0 sm:w-48"
        />

        {/* Run Analytics Button */}
        <VizToolbarBtn
          icon={loading ? RiLoader4Line : RiDatabase2Line}
          iconClassName={loading ? TOOLBAR_ICON.brand : TOOLBAR_ICON.teal}
          label={loading ? 'ទាញ...' : 'Run'}
          showLabel={true}
          disabled={loading}
          onClick={runAnalytics}
          className={loading ? '[&_svg]:animate-spin' : undefined}
        />

        <Separator orientation="vertical" className="h-4" />

        {/* Export CSV Button */}
        <VizToolbarBtn
          icon={RiDownloadLine}
          iconClassName={TOOLBAR_ICON.blue}
          label="Export CSV"
          showLabel={true}
          disabled={loading || countryRows.length === 0}
          onClick={handleExportCSV}
        />

        {/* Batch Export CSV Button */}
        <QuarterSelectModal
          value={[]}
          onChange={(keys) => {
            if (keys && keys.length > 0) {
              handleBatchExportCSV(keys);
            }
          }}
          disabled={loading}
          customTrigger={
            <div className={loading ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-pointer'}>
              <VizToolbarBtn
                icon={RiDownloadCloud2Line}
                iconClassName={TOOLBAR_ICON.teal}
                label="Export"
                showLabel={true}
                disabled={loading}
                className="pointer-events-none"
              />
            </div>
          }
        />

        {/* Indicator Sync Filter Button */}
        <VizToolbarBtn
          icon={RiFilter3Line}
          iconClassName={selectedSyncIndicators.length > 0 ? 'text-purple-600 font-bold' : TOOLBAR_ICON.purple}
          label={selectedSyncIndicators.length === 0 ? 'Indicators: All' : `Indicators (${selectedSyncIndicators.length})`}
          showLabel={true}
          disabled={warehouseStatus.etlRunning || statusLoading}
          onClick={() => setSyncIndicatorsModalOpen(true)}
          title="Select specific indicators to sync in warehouse"
        />

        {/* Refresh Warehouse Button */}
        <VizToolbarBtn
          icon={warehouseStatus.etlRunning ? RiLoader4Line : RiRefreshLine}
          iconClassName={warehouseStatus.etlRunning ? TOOLBAR_ICON.brand : TOOLBAR_ICON.amber}
          label={warehouseStatus.etlRunning ? 'Syncing...' : 'Sync'}
          showLabel={true}
          disabled={warehouseStatus.etlRunning || statusLoading}
          onClick={handleRefreshWarehouse}
          className={warehouseStatus.etlRunning ? '[&_svg]:animate-spin' : undefined}
        />

        {/* Batch Sync Button */}
        <QuarterSelectModal
          value={[]}
          onChange={(keys) => {
            if (keys && keys.length > 0) {
              handleBatchSync(keys);
            }
          }}
          disabled={warehouseStatus.etlRunning || statusLoading}
          customTrigger={
            <div className={warehouseStatus.etlRunning || statusLoading ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-pointer'}>
              <VizToolbarBtn
                icon={warehouseStatus.etlRunning ? RiLoader4Line : RiHistoryLine}
                iconClassName={warehouseStatus.etlRunning ? TOOLBAR_ICON.brand : TOOLBAR_ICON.blue}
                label={warehouseStatus.etlRunning ? 'Syncing...' : 'Sync'}
                showLabel={true}
                disabled={warehouseStatus.etlRunning || statusLoading}
                className={warehouseStatus.etlRunning ? '[&_svg]:animate-spin pointer-events-none' : 'pointer-events-none'}
              />
            </div>
          }
        />

        {/* Clean Button */}
        <VizToolbarBtn
          icon={RiDeleteBinLine}
          iconClassName="text-rose-500 hover:text-rose-600"
          label="Clean"
          showLabel={true}
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
          label="DB Settings"
          showLabel={true}
          onClick={() => {
            setConnectionModalOpen(true);
          }}
        />

        {/* Check Missing Indicators Button */}
        <VizToolbarBtn
          icon={checkingMissing ? RiLoader4Line : RiAlertLine}
          iconClassName={checkingMissing ? TOOLBAR_ICON.brand : "text-orange-500 hover:text-orange-600"}
          label={checkingMissing ? 'Checking...' : 'Missing'}
          showLabel={true}
          disabled={loading || statusLoading || checkingMissing || !warehouseStatus.hasData}
          onClick={handleCheckMissingIndicators}
          className={checkingMissing ? '[&_svg]:animate-spin' : undefined}
        />

        {/* Manage Sites Button */}
        <VizToolbarBtn
          icon={managingSites ? RiLoader4Line : RiDatabase2Line}
          iconClassName={managingSites ? TOOLBAR_ICON.brand : "text-sky-500 hover:text-sky-600"}
          label={managingSites ? 'Loading...' : 'Manage Sites'}
          showLabel={true}
          disabled={loading || statusLoading || managingSites || warehouseStatus.etlRunning}
          onClick={handleOpenManageSites}
          className={managingSites ? '[&_svg]:animate-spin' : undefined}
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
              
              {/* Spinner loader overlay */}
              {loading && !countryRows.length ? (
                <AppLoadingOverlay message="កំពុងផ្ទុកទិន្នន័យវិភាគ..." submessage="Loading warehouse analytics reports..." />
              ) : null}

              {/* Main content scrollable panel */}
              <div className="flex-1 overflow-auto p-4 space-y-4">
                
                {/* Smart Missing Data / Quick Sync Action Banner */}
                {(!warehouseStatus.hasData || (missingIndicatorsList && missingIndicatorsList.length > 0)) && (
                  <div className="bg-purple-500/10 border border-purple-500/30 p-3 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-foreground animate-in fade-in duration-150">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-purple-500/20 text-purple-600 font-bold">
                        <RiAlertLine className="size-4" />
                      </div>
                      <div>
                        <div className="font-bold text-foreground">
                          {!warehouseStatus.hasData
                            ? `ឃ្លាំងទិន្នន័យមិនទាន់មានទិន្នន័យ Sync សម្រាប់ ${currentPeriod.periodLabel}`
                            : `${missingIndicatorsList.length} សូចនាករមិនទាន់មានក្នុងឃ្លាំងទិន្នន័យ (${missingIndicatorsList.length} missing indicator(s))`}
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">
                          {!warehouseStatus.hasData
                            ? 'ចុច [Sync Full Period] ដើម្បីទាញទិន្នន័យ pre-aggregate ទាំងអស់ក្នុងឃ្លាំង'
                            : `ចុច [Sync Missing] ដើម្បីទាញយកតែ ${missingIndicatorsList.length} សូចនាករដែលខ្វះ`}
                        </div>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {missingIndicatorsList && missingIndicatorsList.length > 0 && (
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedSyncIndicators(missingIndicatorsList);
                            handleRefreshWarehouse();
                          }}
                          disabled={warehouseStatus.etlRunning}
                          className="h-7 text-xs bg-purple-600 hover:bg-purple-700 text-white font-bold px-3 rounded cursor-pointer"
                        >
                          <RiRefreshLine className="size-3.5 mr-1" />
                          Sync {missingIndicatorsList.length} Missing Indicators
                        </Button>
                      )}
                      <Button
                        size="sm"
                        onClick={handleRefreshWarehouse}
                        disabled={warehouseStatus.etlRunning}
                        className="h-7 text-xs bg-primary text-primary-foreground hover:bg-primary/90 font-bold px-3 rounded cursor-pointer"
                      >
                        <RiDatabase2Line className="size-3.5 mr-1" />
                        Sync Full Period ({currentPeriod.periodLabel})
                      </Button>
                    </div>
                  </div>
                )}

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
                            {/* Select-all checkbox */}
                            <th className="p-2.5 w-8" onClick={(e) => e.stopPropagation()}>
                              <input
                                type="checkbox"
                                className="accent-primary cursor-pointer"
                                checked={filteredRows.length > 0 && selectedIndicators.size === filteredRows.length}
                                ref={(el) => { if (el) el.indeterminate = selectedIndicators.size > 0 && selectedIndicators.size < filteredRows.length; }}
                                onChange={toggleSelectAll}
                              />
                            </th>
                            <th className="p-2.5 w-8"></th>
                            <th className="p-2.5 min-w-[280px]">សូចនាករ (Indicator Name)</th>
                            <th className="p-2.5 text-right">ប្រុស ០-១៤</th>
                            <th className="p-2.5 text-right">ស្រី ០-១៤</th>
                            <th className="p-2.5 text-right">ប្រុស &gt;១៤</th>
                            <th className="p-2.5 text-right">ស្រី &gt;១៤</th>
                            <th className="p-2.5 text-right">សរុប (Total)</th>
                            <th className="p-2.5 text-right pr-4">មន្ទីរពេទ្យ (Sites)</th>
                            <th className="p-2.5 w-8"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/20">
                          {filteredRows.map((row, idx) => {
                            const isExpanded = expandedIndicators.has(row.indicator);
                            const isSelected = selectedIndicators.has(row.indicator);
                            const grandTotal = Number(row.Male_0_14 || 0) + Number(row.Female_0_14 || 0) + Number(row.Male_over_14 || 0) + Number(row.Female_over_14 || 0);
                            
                            // Filter matching province records for drill down
                            const matchingProvinces = provinceRows.filter(p => p.indicator === row.indicator);

                            return (
                              <Fragment key={`${row.indicator}-${idx}`}>
                                <tr
                                  onClick={() => toggleRow(row.indicator)}
                                  className={cn(
                                    'transition-colors duration-150 cursor-pointer group',
                                    isSelected ? 'bg-primary/8 hover:bg-primary/12' : 'hover:bg-muted/20'
                                  )}
                                >
                                  {/* Checkbox cell */}
                                  <td className="p-2.5 text-center" onClick={(e) => e.stopPropagation()}>
                                    <input
                                      type="checkbox"
                                      className="accent-primary cursor-pointer"
                                      checked={isSelected}
                                      onChange={() => toggleSelectRow(row.indicator)}
                                    />
                                  </td>
                                  {/* Expand/collapse icon */}
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
                                  {/* Row Actions: Inspect SQL & Delete */}
                                  <td
                                    className="p-1 text-center"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <div className="inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                                      <button
                                        type="button"
                                        title={`Inspect SQL query for: ${row.indicator}`}
                                        onClick={() => handleInspectSql(row)}
                                        className="p-1 rounded hover:bg-purple-500/15 text-purple-400 hover:text-purple-600 transition-colors cursor-pointer"
                                      >
                                        <RiCodeSSlashLine className="size-3.5" />
                                      </button>
                                      <button
                                        type="button"
                                        title={`Delete indicator: ${row.indicator}`}
                                        onClick={() => handleDeleteIndicator(row.indicator)}
                                        disabled={deletingIndicator === row.indicator}
                                        className="p-1 rounded hover:bg-red-500/15 text-red-400 hover:text-red-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                      >
                                        {deletingIndicator === row.indicator
                                          ? <RiLoader4Line className="size-3.5 animate-spin" />
                                          : <RiDeleteBinLine className="size-3.5" />}
                                      </button>
                                    </div>
                                  </td>
                                </tr>

                                {/* Collapsible Province Drill-Down Row */}
                                {isExpanded && (
                                  <tr>
                                    <td colSpan={9} className="bg-muted/5 p-0 border-t border-b">
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
                                                  const provKey = `${row.indicator}:${prov.province_id}`;
                                                  const isProvExpanded = expandedProvinces.has(provKey);
                                                  const siteRows = siteBreakdownMap[provKey] || [];
                                                  const isLoadingSites = loadingProvinceSites[provKey];
                                                  const provTotal = Number(prov.Male_0_14 || 0) + Number(prov.Female_0_14 || 0) + Number(prov.Male_over_14 || 0) + Number(prov.Female_over_14 || 0);
                                                  const pct = grandTotal > 0 ? (provTotal / grandTotal) * 100 : 0;

                                                  return (
                                                    <Fragment key={`${prov.province_id}-${pIdx}`}>
                                                      <tr
                                                        onClick={() => toggleProvinceRow(row.indicator, prov.province_id)}
                                                        className="hover:bg-muted/30 transition-colors duration-150 cursor-pointer group/prov"
                                                        title="Click to view facility site breakdown for this province"
                                                      >
                                                        <td className="p-2 pl-3 font-semibold text-foreground flex items-center gap-1.5">
                                                          {isProvExpanded ? (
                                                            <RiArrowUpSLine className="size-3.5 text-primary" />
                                                          ) : (
                                                            <RiArrowDownSLine className="size-3.5 text-muted-foreground group-hover/prov:text-foreground" />
                                                          )}
                                                          <span>{prov.province_name || `Province ${prov.province_id}`}</span>
                                                        </td>
                                                        <td className="p-2 text-right tabular-nums">{formatVal(prov.Male_0_14)}</td>
                                                        <td className="p-2 text-right tabular-nums">{formatVal(prov.Female_0_14)}</td>
                                                        <td className="p-2 text-right tabular-nums">{formatVal(prov.Male_over_14)}</td>
                                                        <td className="p-2 text-right tabular-nums">{formatVal(prov.Female_over_14)}</td>
                                                        <td className="p-2 text-right tabular-nums font-bold text-foreground bg-muted/5">{formatVal(provTotal)}</td>
                                                        <td className="p-2 text-right tabular-nums font-medium text-primary bg-primary/5">{pct.toFixed(1)}%</td>
                                                        <td className="p-2 text-right tabular-nums pr-3 text-muted-foreground">
                                                          <span className="inline-flex items-center gap-1 text-sky-600 font-semibold bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200 group-hover/prov:bg-sky-100 transition-colors">
                                                            {formatVal(prov.site_count)} sites
                                                          </span>
                                                        </td>
                                                      </tr>

                                                      {/* Level 2 Sub-Drilldown: Facility Sites Table */}
                                                      {isProvExpanded && (
                                                        <tr>
                                                          <td colSpan={8} className="bg-sky-50/25 p-2 pl-6 border-b border-t border-sky-100">
                                                            <div className="space-y-1.5">
                                                              <div className="flex items-center justify-between text-[9px] font-bold text-sky-800 uppercase tracking-wider">
                                                                <span>Facility Sites Breakdown — {prov.province_name || prov.province_id}</span>
                                                                <span>{isLoadingSites ? 'Loading sites...' : `${siteRows.length} facility sites reporting`}</span>
                                                              </div>

                                                              {isLoadingSites ? (
                                                                <div className="p-3 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
                                                                  <AppSpinner size="xs" />
                                                                  Loading facility site breakdown for {prov.province_name}...
                                                                </div>
                                                              ) : siteRows.length === 0 ? (
                                                                <div className="p-2 text-center text-[10px] text-muted-foreground italic bg-background/50 border rounded">
                                                                  No individual facility site records found for this indicator in {prov.province_name}.
                                                                </div>
                                                              ) : (
                                                                <div className="border border-sky-200/80 rounded overflow-hidden bg-background shadow-xs">
                                                                  <table className="w-full text-[9px] border-collapse">
                                                                    <thead>
                                                                      <tr className="bg-sky-100/60 border-b border-sky-200 text-sky-900 font-bold uppercase tracking-wider text-left">
                                                                        <th className="p-1.5 pl-2.5 w-20">Code</th>
                                                                        <th className="p-1.5">Facility Site Name</th>
                                                                        <th className="p-1.5 text-right">Male 0-14</th>
                                                                        <th className="p-1.5 text-right">Female 0-14</th>
                                                                        <th className="p-1.5 text-right">Male &gt;14</th>
                                                                        <th className="p-1.5 text-right">Female &gt;14</th>
                                                                        <th className="p-1.5 text-right font-black text-foreground pr-2.5">Total</th>
                                                                      </tr>
                                                                    </thead>
                                                                    <tbody className="divide-y divide-sky-100">
                                                                      {siteRows.map((siteRow, sIdx) => {
                                                                        const siteTotal = Number(siteRow.male_0_14 || siteRow.Male_0_14 || 0) +
                                                                          Number(siteRow.female_0_14 || siteRow.Female_0_14 || 0) +
                                                                          Number(siteRow.male_over_14 || siteRow.Male_over_14 || 0) +
                                                                          Number(siteRow.female_over_14 || siteRow.Female_over_14 || 0);

                                                                        return (
                                                                          <tr key={`${siteRow.site_code}-${sIdx}`} className="hover:bg-sky-50/50 transition-colors">
                                                                            <td className="p-1.5 pl-2.5 font-mono text-muted-foreground font-semibold">{siteRow.site_code}</td>
                                                                            <td className="p-1.5 font-medium text-foreground">{siteRow.site_name || `Site ${siteRow.site_code}`}</td>
                                                                            <td className="p-1.5 text-right tabular-nums">{formatVal(siteRow.male_0_14 || siteRow.Male_0_14)}</td>
                                                                            <td className="p-1.5 text-right tabular-nums">{formatVal(siteRow.female_0_14 || siteRow.Female_0_14)}</td>
                                                                            <td className="p-1.5 text-right tabular-nums">{formatVal(siteRow.male_over_14 || siteRow.Male_over_14)}</td>
                                                                            <td className="p-1.5 text-right tabular-nums">{formatVal(siteRow.female_over_14 || siteRow.Female_over_14)}</td>
                                                                            <td className="p-1.5 text-right tabular-nums font-bold text-foreground bg-muted/10 pr-2.5">{formatVal(siteTotal)}</td>
                                                                          </tr>
                                                                        );
                                                                      })}
                                                                    </tbody>
                                                                  </table>
                                                                </div>
                                                              )}
                                                            </div>
                                                          </td>
                                                        </tr>
                                                      )}
                                                    </Fragment>
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

      {/* Floating Bulk Action Bar */}
      <AnimatePresence>
        {selectedIndicators.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 60 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 flex items-center gap-3 rounded-2xl border border-border/60 bg-card/95 px-5 py-3 shadow-2xl backdrop-blur-md"
          >
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
                {selectedIndicators.size}
              </span>
              <span>indicator{selectedIndicators.size !== 1 ? 's' : ''} selected</span>
            </div>
            <Separator orientation="vertical" className="h-5" />
            <button
              onClick={() => setSelectedIndicators(new Set())}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Deselect all
            </button>
            <button
              onClick={handleBulkDelete}
              disabled={bulkDeleting}
              className="flex items-center gap-1.5 rounded-lg bg-red-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-600 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {bulkDeleting
                ? <RiLoader4Line className="size-3.5 animate-spin" />
                : <RiDeleteBinLine className="size-3.5" />}
              {bulkDeleting ? 'Deleting...' : `Delete ${selectedIndicators.size} row${selectedIndicators.size !== 1 ? 's' : ''}`}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

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
                  <strong>ព្រមាន (Warning):</strong> ជម្រើសនេះនឹងលុបគ្រប់ត្រីមាស និងគ្រប់ខែទាំងអស់ពីឃ្លាំងទិន្នន័យ។
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

      {/* Manage Sites Modal */}
      {manageSitesModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/45 p-4 animate-in fade-in duration-200" role="dialog" aria-modal="true">
          <div className="flex max-h-[min(92vh,48rem)] w-full max-w-2xl flex-col overflow-hidden bg-card shadow-2xl border" onClick={(e) => e.stopPropagation()}>
            <div className="flex shrink-0 items-start gap-3 border-b border-border bg-muted/30 px-5 py-4">
              <div className="min-w-0 flex-1">
                <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                  <RiDatabase2Line className="size-5 text-sky-600" />
                  គ្រប់គ្រងមន្ទីរពេទ្យ (Manage Sites)
                </h2>
                <p className="text-[11px] text-muted-foreground mt-1">
                  រយៈពេលវិភាគ: <strong>{currentPeriod.periodLabel}</strong> (Total Sites: {sitesList.length})
                </p>
              </div>
              <button
                type="button"
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center border border-border/80 bg-background/80 hover:bg-muted text-muted-foreground hover:text-foreground"
                onClick={() => setManageSitesModalOpen(false)}
                aria-label="Close"
              >
                <RiCloseCircleLine className="size-5" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-0">
              <table className="w-full text-left text-[11px]">
                <thead className="sticky top-0 bg-muted/80 backdrop-blur border-b border-border text-muted-foreground font-semibold">
                  <tr>
                    <th className="px-4 py-2">Site Code</th>
                    <th className="px-4 py-2">Site Name</th>
                    <th className="px-4 py-2">Province</th>
                    <th className="px-4 py-2 text-center">Status</th>
                    <th className="px-4 py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {sitesList.map(site => (
                    <tr key={site.code} className="hover:bg-muted/30">
                      <td className="px-4 py-2.5 font-mono text-muted-foreground">{site.code}</td>
                      <td className="px-4 py-2.5 font-medium">{site.name}</td>
                      <td className="px-4 py-2.5">{site.province}</td>
                      <td className="px-4 py-2.5 text-center">
                        {site.isSynced ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                            <RiCheckboxCircleLine className="size-3" />
                            Synced
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                            <RiAlertLine className="size-3" />
                            Missing
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <div className="flex justify-end gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-6 px-2 text-[10px] rounded border-border"
                            disabled={siteActionLoading === `sync-${site.code}` || warehouseStatus.etlRunning}
                            onClick={() => handleSyncSite(site.code)}
                          >
                            {siteActionLoading === `sync-${site.code}` ? <RiLoader4Line className="size-3 animate-spin mr-1" /> : <RiRefreshLine className="size-3 mr-1 text-sky-600" />}
                            Sync
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-6 px-2 text-[10px] rounded border-border text-destructive hover:text-destructive hover:bg-destructive/10"
                            disabled={!site.isSynced || siteActionLoading === `clear-${site.code}` || warehouseStatus.etlRunning}
                            onClick={() => handleClearSite(site.code)}
                          >
                            {siteActionLoading === `clear-${site.code}` ? <RiLoader4Line className="size-3 animate-spin mr-1" /> : <RiDeleteBinLine className="size-3 mr-1" />}
                            Clear
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex shrink-0 justify-end gap-2 border-t border-border bg-muted/20 px-5 py-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setManageSitesModalOpen(false)}
                className="text-[11px] h-8 rounded-none px-4 font-medium bg-background"
              >
                បិទ (Close)
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Indicator Selection Modal for Warehouse Sync */}
      {syncIndicatorsModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/45 p-4 animate-in fade-in duration-200" role="dialog" aria-modal="true">
          <div className="flex max-h-[min(90vh,42rem)] w-full max-w-xl flex-col overflow-hidden bg-card shadow-2xl border" onClick={(e) => e.stopPropagation()}>
            <div className="flex shrink-0 items-center justify-between border-b border-border bg-muted/30 px-5 py-3.5">
              <div>
                <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                  <RiFilter3Line className="size-5 text-purple-600" />
                  ជ្រើសរើសសូចនាករសម្រាប់ Sync (Select Indicators)
                </h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {selectedSyncIndicators.length === 0
                    ? 'Currently syncing ALL indicators. Select specific indicators below to target.'
                    : `Targeted ${selectedSyncIndicators.length} of ${ALL_WAREHOUSE_INDICATORS.length} indicators for sync.`}
                </p>
              </div>
              <button
                type="button"
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center border border-border/80 bg-background/80 hover:bg-muted text-muted-foreground hover:text-foreground"
                onClick={() => setSyncIndicatorsModalOpen(false)}
                aria-label="Close"
              >
                <RiCloseCircleLine className="size-5" />
              </button>
            </div>

            <div className="p-4 border-b border-border bg-muted/10 flex flex-col gap-2.5">
              <div className="relative flex items-center">
                <RiSearchLine className="absolute left-3 size-4 text-muted-foreground" />
                <input
                  type="text"
                  value={syncIndicatorSearch}
                  onChange={(e) => setSyncIndicatorSearch(e.target.value)}
                  placeholder="Search indicators..."
                  className="w-full bg-background border border-border rounded-none py-1.5 pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Quick Category Preset Pills */}
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mr-0.5">Presets:</span>
                {INDICATOR_PRESET_BUNDLES.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setSelectedSyncIndicators(preset.ids)}
                    className="text-[10px] font-semibold bg-card hover:bg-purple-500/20 hover:text-purple-600 text-foreground px-2 py-0.5 rounded border border-border/70 transition-colors cursor-pointer"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-[11px] text-muted-foreground font-medium">
                  {selectedSyncIndicators.length === 0 ? 'Status: All Indicators (Default)' : `Status: ${selectedSyncIndicators.length} Selected`}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedSyncIndicators(ALL_WAREHOUSE_INDICATORS.map(ind => ind.id))}
                    className="text-[11px] font-bold text-primary hover:underline cursor-pointer"
                  >
                    Select All
                  </button>
                  <span className="text-muted-foreground">|</span>
                  <button
                    type="button"
                    onClick={() => setSelectedSyncIndicators([])}
                    className="text-[11px] font-bold text-rose-500 hover:underline cursor-pointer"
                  >
                    Clear (All)
                  </button>
                </div>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-4 flex flex-col gap-2">
              {ALL_WAREHOUSE_INDICATORS.filter(ind =>
                ind.name.toLowerCase().includes(syncIndicatorSearch.toLowerCase()) ||
                ind.id.toLowerCase().includes(syncIndicatorSearch.toLowerCase())
              ).map((ind) => {
                const isChecked = selectedSyncIndicators.includes(ind.id);
                return (
                  <label
                    key={ind.id}
                    className={cn(
                      "flex items-start gap-3 p-2.5 rounded border transition-all cursor-pointer select-none",
                      isChecked ? "bg-purple-500/10 border-purple-500/40 text-foreground font-semibold" : "bg-card border-border/60 hover:bg-muted/40 text-foreground/85"
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {
                        if (isChecked) {
                          setSelectedSyncIndicators(selectedSyncIndicators.filter(id => id !== ind.id));
                        } else {
                          setSelectedSyncIndicators([...selectedSyncIndicators, ind.id]);
                        }
                      }}
                      className="mt-0.5 rounded border-border text-primary focus:ring-primary focus:ring-offset-0 cursor-pointer"
                    />
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-xs leading-snug">{ind.name}</span>
                      <span className="text-[10px] text-muted-foreground font-mono mt-0.5">{ind.id}.sql</span>
                    </div>
                  </label>
                );
              })}
            </div>

            <div className="flex shrink-0 items-center justify-between border-t border-border bg-muted/20 px-5 py-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSyncIndicatorsModalOpen(false)}
                className="text-[11px] h-8 rounded-none px-3 font-medium bg-background"
              >
                Close
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSyncIndicatorsModalOpen(false)}
                  className="text-[11px] h-8 rounded-none px-3 font-medium"
                >
                  Save Selection
                </Button>

                <Button
                  type="button"
                  size="sm"
                  disabled={warehouseStatus.etlRunning}
                  onClick={() => {
                    setSyncIndicatorsModalOpen(false);
                    handleRefreshWarehouse();
                  }}
                  className="text-[11px] h-8 rounded-none px-4 font-bold bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-1.5 cursor-pointer"
                >
                  {warehouseStatus.etlRunning ? (
                    <RiLoader4Line className="size-3.5 animate-spin" />
                  ) : (
                    <RiRefreshLine className="size-3.5" />
                  )}
                  {selectedSyncIndicators.length === 0
                    ? 'Sync All Indicators'
                    : `Sync Selected (${selectedSyncIndicators.length})`}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SQL Inspection Audit Modal */}
      {sqlModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/45 p-4 animate-in fade-in duration-200" role="dialog" aria-modal="true">
          <div className="flex max-h-[min(90vh,46rem)] w-full max-w-3xl flex-col overflow-hidden bg-card shadow-2xl border" onClick={(e) => e.stopPropagation()}>
            <div className="flex shrink-0 items-center justify-between border-b border-border bg-muted/30 px-5 py-3.5">
              <div>
                <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                  <RiCodeSSlashLine className="size-5 text-purple-600" />
                  SQL Query Reference Inspection
                </h2>
                <p className="text-[11px] text-muted-foreground mt-0.5 font-mono">
                  {viewingSqlItem?.indicatorId || 'SQL Reference'}
                </p>
              </div>
              <button
                type="button"
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center border border-border/80 bg-background/80 hover:bg-muted text-muted-foreground hover:text-foreground"
                onClick={() => setSqlModalOpen(false)}
                aria-label="Close"
              >
                <RiCloseCircleLine className="size-5" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-4 space-y-4">
              {loadingSql ? (
                <div className="flex min-h-48 items-center justify-center text-xs text-muted-foreground">
                  <RiLoader4Line className="size-4 animate-spin mr-2 text-primary" />
                  Loading SQL query reference...
                </div>
              ) : (
                <>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground">Aggregate SQL Query (`{viewingSqlItem?.aggregatePath || `${viewingSqlItem?.indicatorId}.sql`}`)</span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(viewingSqlItem?.aggregateSql || '');
                          toast.success('SQL query copied to clipboard!');
                        }}
                        className="text-[10px] font-bold text-primary hover:underline cursor-pointer"
                      >
                        Copy SQL
                      </button>
                    </div>
                    <pre className="p-3 bg-muted/40 border border-border text-[11px] font-mono text-foreground overflow-x-auto rounded leading-relaxed select-all max-h-72">
                      {viewingSqlItem?.aggregateSql || '-- Aggregate SQL reference not available.'}
                    </pre>
                  </div>

                  {viewingSqlItem?.detailSql && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-foreground">Detail Drill-Down SQL Query (`{viewingSqlItem?.detailPath || `${viewingSqlItem?.indicatorId}_details.sql`}`)</span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(viewingSqlItem?.detailSql || '');
                            toast.success('Detail SQL query copied to clipboard!');
                          }}
                          className="text-[10px] font-bold text-primary hover:underline cursor-pointer"
                        >
                          Copy Detail SQL
                        </button>
                      </div>
                      <pre className="p-3 bg-muted/40 border border-border text-[11px] font-mono text-foreground overflow-x-auto rounded leading-relaxed select-all max-h-72">
                        {viewingSqlItem?.detailSql}
                      </pre>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="flex shrink-0 justify-end gap-2 border-t border-border bg-muted/20 px-5 py-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSqlModalOpen(false)}
                className="text-[11px] h-8 rounded-none px-4 font-medium bg-background"
              >
                Close
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
