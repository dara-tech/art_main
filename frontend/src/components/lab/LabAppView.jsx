import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  RiTestTubeLine,
  RiSearchLine,
  RiRefreshLine,
  RiDownloadLine,
  RiExternalLinkLine,
  RiShieldCheckLine,
  RiAlertLine,
  RiCheckDoubleLine,
  RiServerLine,
  RiKey2Line,
  RiCalendarEventLine,
  RiFilter3Line,
  RiBuilding4Line,
  RiUserSearchLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiArrowUpSLine,
  RiArrowDownSLine,
  RiDatabase2Line
} from '@remixicon/react';
import { fetchLabTestResults } from '../../services/labApi';
import { downloadCsv, rowsToCsv, safeExportFilename } from '../../utils/exportCsv';
import { buildPatient360Path } from '../../utils/patient360Navigation';
import { useSites } from '../../contexts/SitesContext';
import SiteSelectModal from '../sites/SiteSelectModal';
import QuarterSelectModal from '../visualize/QuarterSelectModal';
import { getPeriodByKey } from '../../utils/visualizePeriods';
import { Patient360NavBar, Patient360NavRow } from '../patient360/Patient360NavBar';
import Patient360Layout from '../patient360/Patient360Layout';
import AppLoadingOverlay from '../ui/AppLoadingOverlay';
import cn from 'clsx';

/** Convert YYYY-MM-DD → Lab API timestamp (start of day / end of day). */
function toLabTimestamp(isoDate, endOfDay = false) {
  const compact = String(isoDate || '').replace(/-/g, '');
  if (compact.length !== 8) return '';
  return `${compact}${endOfDay ? '235959' : '000000'}`;
}

export default function LabAppView() {
  const navigate = useNavigate();
  const { sites = [] } = useSites();

  // Navigation & Global Toolbar States (Consistent with Dashboard UI)
  const [siteCode, setSiteCode] = useState('ALL');

  // Derive current quarter from today's date
  const getCurrentQuarterDefaults = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1; // 1-12
    const quarter = Math.ceil(month / 3); // 1-4
    const period = getPeriodByKey(`${year}-Q${quarter}`);
    return {
      periodKey: period?.key || `${year}-Q${quarter}`,
      start: toLabTimestamp(period?.startDate),
      end: toLabTimestamp(period?.endDate, true),
    };
  };

  const initDefaults = getCurrentQuarterDefaults();
  const [selectedPeriodKey, setSelectedPeriodKey] = useState(initDefaults.periodKey);
  const [customRange, setCustomRange] = useState(null);

  // Lab Query Parameters & Server States
  const [startParam, setStartParam] = useState(initDefaults.start);
  const [endParam, setEndParam] = useState(initDefaults.end);
  const [testType, setTestType] = useState('hiv');
  const [serverHost, setServerHost] = useState('public'); // 'public' | 'lan'
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Data & API states
  const [labData, setLabData] = useState([]);
  const [apiMeta, setApiMeta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Pagination
  const PAGE_SIZE = 25;
  const [currentPage, setCurrentPage] = useState(1);

  // Table sort: click header to toggle asc/desc
  const [sortKey, setSortKey] = useState('sample_id');
  const [sortDir, setSortDir] = useState('asc');

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    setCurrentPage(1);
  };

  const getSortValue = (row, key) => {
    switch (key) {
      case 'sample_id':
        return String(row.sample_id || '');
      case 'patient_id':
        return String(row.patient_id || '');
      case 'test_name':
        return String(row.test_name || '');
      case 'date':
        return String(row.result_date || row.sample_date || '');
      case 'result_value':
        return String(row.result_value || '');
      case 'facility_name':
        return String(row.facility_name || '');
      case 'status':
        return String(row.status || '');
      default:
        return '';
    }
  };

  // Handle Period Navigation (-1 or +1 Quarter) — only when on a quarter key
  const handleNavigatePeriod = (direction) => {
    if (customRange) return;
    const match = selectedPeriodKey.match(/^(\d{4})-Q([1-4])$/i);
    if (match) {
      let year = Number(match[1]);
      let quarter = Number(match[2]) + direction;
      if (quarter > 4) { year += 1; quarter = 1; }
      else if (quarter < 1) { year -= 1; quarter = 4; }
      applyPeriod(`${year}-Q${quarter}`);
    }
  };

  // Sync period key → start/end params (quarter / month / year)
  const applyPeriod = (key) => {
    const period = getPeriodByKey(key);
    if (!period) return;
    setSelectedPeriodKey(period.key);
    setCustomRange(null);
    setStartParam(toLabTimestamp(period.startDate));
    setEndParam(toLabTimestamp(period.endDate, true));
  };

  // Custom date range from QuarterSelectModal → Lab API timestamps
  const handleCustomRange = ({ startDate, endDate }) => {
    if (!startDate || !endDate) return;
    setCustomRange({ startDate, endDate });
    setSelectedPeriodKey(`custom:${startDate}:${endDate}`);
    setStartParam(toLabTimestamp(startDate));
    setEndParam(toLabTimestamp(endDate, true));
  };

  // Sync Lab Results from backend API proxy
  const loadLabData = async (overrideHost) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetchLabTestResults({
        start: startParam,
        end: endParam,
        type: testType,
        host: overrideHost || serverHost
      });

      if (res && res.success) {
        setLabData(Array.isArray(res.data) ? res.data : []);
        setApiMeta(res);
      } else {
        setLabData([]);
        setErrorMsg(res?.error || res?.message || 'Failed to fetch Lab test results');
      }
    } catch (err) {
      console.error('Error fetching Lab API:', err);
      setLabData([]);
      setErrorMsg(err.message || 'Network error fetching Lab endpoint');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLabData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startParam, endParam, testType]);

  // Shortcut presets for user queries
  const handleApplyPreset = (presetKey) => {
    if (presetKey === 'range1') {
      setStartParam('20240901130000');
      setEndParam('20240902235959');
      setTestType('hiv');
    } else if (presetKey === 'range2') {
      setStartParam('20240903110000');
      setEndParam('20240903140000');
      setTestType('hiv');
    } else if (presetKey === 'vl_all') {
      setStartParam('20240901000000');
      setEndParam('20240930235959');
      setTestType('viral_load');
    }
  };

  // Filter dataset by siteCode, searchQuery, and statusFilter
  const filteredResults = useMemo(() => {
    const safeList = Array.isArray(labData) ? labData : [];
    let list = safeList;

    // Filter by Site Selector (Consistent with Dashboard site filter)
    if (siteCode && siteCode !== 'ALL' && siteCode !== '__CAMBODIA__') {
      if (siteCode.startsWith('province:')) {
        const provId = siteCode.replace('province:', '');
        list = list.filter(r => String(r.clinic_code || '').startsWith(provId));
      } else {
        list = list.filter(r => String(r.clinic_code || '') === String(siteCode));
      }
    }

    if (statusFilter === 'positive') {
      list = list.filter(r => r.flagged || String(r.result_value).toLowerCase().includes('positive'));
    } else if (statusFilter === 'negative') {
      list = list.filter(r => !r.flagged && (String(r.result_value).toLowerCase().includes('negative') || String(r.result_value).includes('<')));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(r =>
        String(r.patient_id || '').toLowerCase().includes(q) ||
        String(r.sample_id || '').toLowerCase().includes(q) ||
        String(r.facility_name || '').toLowerCase().includes(q) ||
        String(r.test_name || '').toLowerCase().includes(q) ||
        String(r.result_value || '').toLowerCase().includes(q)
      );
    }

    const dir = sortDir === 'asc' ? 1 : -1;
    list = [...list].sort((a, b) => {
      const av = getSortValue(a, sortKey).toLowerCase();
      const bv = getSortValue(b, sortKey).toLowerCase();
      if (av < bv) return -1 * dir;
      if (av > bv) return 1 * dir;
      return 0;
    });

    return list;
  }, [labData, siteCode, searchQuery, statusFilter, sortKey, sortDir]);

  // Reset page when filters change
  useEffect(() => { setCurrentPage(1); }, [labData, siteCode, searchQuery, statusFilter]);

  // Paginated slice
  const totalPages = Math.max(1, Math.ceil(filteredResults.length / PAGE_SIZE));
  const pagedResults = filteredResults.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // Executive KPI Summaries
  const kpis = useMemo(() => {
    const total = filteredResults.length;
    const positive = filteredResults.filter(r => r.flagged || String(r.result_value).toLowerCase().includes('positive')).length;
    const negative = filteredResults.filter(r => !r.flagged && (String(r.result_value).toLowerCase().includes('negative') || String(r.result_value).includes('<'))).length;
    const pending = filteredResults.filter(r => r.status === 'PENDING' || r.status === 'PROCESSING').length;

    return { total, positive, negative, pending };
  }, [filteredResults]);

  // Export CSV
  const handleExportCsv = () => {
    if (!filteredResults.length) return;
    const exportRows = filteredResults.map((r, i) => ({
      No: i + 1,
      Sample_ID: r.sample_id,
      Patient_ID: r.patient_id,
      Clinic_Code: r.clinic_code,
      Facility_Name: r.facility_name,
      Province: r.province,
      Test_Category: r.category,
      Test_Name: r.test_name,
      Result_Value: r.result_value,
      Unit: r.unit || '',
      Flagged_High_Risk: r.flagged ? 'YES' : 'NO',
      Status: r.status,
      Sample_Date: r.sample_date,
      Result_Date: r.result_date,
      Tested_By: r.tested_by
    }));

    const csvStr = rowsToCsv(exportRows);
    const fname = safeExportFilename(`MPI_Lab_Results_${siteCode}_${testType}_${startParam}`);
    downloadCsv(csvStr, fname);
  };

  return (
    <Patient360Layout
      lockViewport={true}
      className="font-khmer"
      toolbar={
        <Patient360NavBar ariaLabel="Lab App Navigation" rowCount={1}>
          <Patient360NavRow tone="filters" className="gap-2 justify-between px-3 sm:px-5">
            <div className="flex flex-1 min-w-0 items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-0.5">

            {/* Site / Facility Selector */}
            <SiteSelectModal
              sites={sites}
              value={siteCode}
              onChange={setSiteCode}
              label="Site"
              facilityOnly={false}
              showLabel={false}
              compact
              className="w-36 shrink sm:w-48 min-w-[120px]"
            />

            {/* Period / Quarter Selector Controls */}
            <div className="flex items-center gap-0.5 shrink-0">
              <button
                type="button"
                title="Previous Period"
                onClick={() => handleNavigatePeriod(-1)}
                className="flex h-8 w-6 sm:w-7 items-center justify-center border border-border/80 bg-background text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-50"
                disabled={loading || Boolean(customRange)}
              >
                <RiArrowLeftSLine className="size-3.5 sm:size-4" />
              </button>
              <QuarterSelectModal
                value={customRange ? [] : [selectedPeriodKey]}
                onChange={(keys) => {
                  if (keys && keys[0]) applyPeriod(keys[0]);
                }}
                allowCustomRange
                customValue={customRange}
                onCustomRange={handleCustomRange}
                singleSelect
                disabled={loading}
                className="w-32 shrink sm:w-44 min-w-[100px]"
              />
              <button
                type="button"
                title="Next Period"
                onClick={() => handleNavigatePeriod(1)}
                className="flex h-8 w-6 sm:w-7 items-center justify-center border border-border/80 bg-background text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-50"
                disabled={loading || Boolean(customRange)}
              >
                <RiArrowRightSLine className="size-3.5 sm:size-4" />
              </button>
            </div>


            {/* Test Type Select — match Site/Period left padding (native select adds extra inset) */}
            <div className="relative shrink-0">
              <select
                value={testType}
                onChange={(e) => setTestType(e.target.value)}
                className="h-8 w-28 sm:w-36 appearance-none border border-border/80 bg-background pl-3 pr-7 text-xs font-bold text-foreground outline-none cursor-pointer focus:border-emerald-500"
              >
                <option value="hiv">HIV Rapid Test</option>
                <option value="viral_load">Viral Load</option>
                <option value="cd4">CD4 Count</option>
                <option value="all">គ្រប់ប្រភេទតេស្ត</option>
              </select>
              <RiArrowDownSLine
                className="pointer-events-none absolute right-1.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
            </div>

            {/* Host Server Selector — icon only; click toggles Public ↔ LAN */}
            <button
              type="button"
              title={serverHost === 'lan'
                ? 'LAN (192.168.0.27) — click for Public'
                : 'Public (36.37.175.123) — click for LAN'}
              aria-label={serverHost === 'lan' ? 'Lab host: LAN' : 'Lab host: Public'}
              onClick={() => setServerHost((h) => (h === 'public' ? 'lan' : 'public'))}
              className={cn(
                'flex h-8 w-8 shrink-0 items-center justify-center border border-border/80 bg-background transition-colors cursor-pointer',
                serverHost === 'lan'
                  ? 'text-amber-500 hover:bg-amber-500/10'
                  : 'text-sky-500 hover:bg-sky-500/10'
              )}
            >
              <RiServerLine className="size-4" />
            </button>

            {/* Sync Refresh Button */}
            <button
              type="button"
              onClick={() => loadLabData()}
              disabled={loading}
              className="flex h-8 items-center gap-1.5 border border-emerald-600 bg-emerald-600 px-3 text-xs font-bold text-white hover:bg-emerald-700 transition-colors shrink-0 cursor-pointer disabled:opacity-50"
            >
              <RiRefreshLine className={cn("size-3.5", loading && "animate-spin")} />
              <span className="hidden sm:inline">Sync API</span>
            </button>
          </div>
        </Patient360NavRow>
      </Patient360NavBar>
      }
    >
      {/* Main Container Content — relative so overlay sits below nav, flex container to fit remaining viewport exactly */}
      <div className="flex-1 flex flex-col min-h-0 px-3 sm:px-5 py-4 gap-4 relative">
        <AppLoadingOverlay
          show={loading}
          fullScreen={false}
          blur
          message="កំពុងទាញយកទិន្នន័យ..."
          subtitle="MPI Lab Server API"
        />

        {/* Lab Results Table — flex layout to take up remaining height */}
        <div className="flex-1 flex flex-col min-h-0 border border-border/80 bg-card shadow-2xs overflow-hidden">

          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border/60 px-4 py-2.5 bg-muted/20 shrink-0 gap-2">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <RiTestTubeLine className="size-4 text-emerald-500" />
                បញ្ជីលទ្ធផលតេស្តបន្ទប់ពិសោធន៍ (Lab Test Results Line List)
              </h3>
              <span className="text-[11px] font-bold text-muted-foreground bg-muted px-2 py-0.5">
                សរុប {filteredResults.length} កំណត់ត្រា
              </span>
            </div>

            <button
              type="button"
              onClick={handleExportCsv}
              disabled={!filteredResults.length}
              className="px-2.5 py-1 text-xs font-bold text-emerald-600 bg-emerald-500/10 hover:bg-emerald-600 hover:text-white border border-emerald-500/20 transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
            >
              <RiDownloadLine className="size-3.5" />
              <span>ទាញយក CSV</span>
            </button>
          </div>

          <div className="flex-1 overflow-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="sticky top-0 bg-card z-10 shadow-xs">
                <tr className="border-b border-border/60 bg-muted/60 text-muted-foreground font-bold">
                  {[
                    { key: 'sample_id', label: 'Sample', title: 'Sample ID', align: 'left' },
                    { key: 'patient_id', label: 'Patient', title: 'Patient Code', align: 'left' },
                    { key: 'test_name', label: 'តេស្ត', title: 'ឈ្មោះតេស្ត', align: 'left' },
                    { key: 'date', label: 'ថ្ងៃ', title: 'កាលបរិច្ឆេទ', align: 'center' },
                    { key: 'result_value', label: 'លទ្ធផល', title: 'លទ្ធផល', align: 'right' },
                    { key: 'facility_name', label: 'មន្ទីរ', title: 'មន្ទីរពិសោធន៍', align: 'left' },
                    { key: 'status', label: 'ស្ថាន', title: 'ស្ថានភាព', align: 'center' },
                  ].map((col) => {
                    const active = sortKey === col.key;
                    return (
                      <th
                        key={col.key}
                        className={cn(
                          'px-2 py-2 bg-card',
                          col.align === 'center' && 'text-center',
                          col.align === 'right' && 'text-right'
                        )}
                        title={col.title}
                        aria-sort={active ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
                      >
                        <button
                          type="button"
                          onClick={() => handleSort(col.key)}
                          className={cn(
                            'inline-flex items-center gap-0.5 cursor-pointer select-none hover:text-foreground transition-colors',
                            col.align === 'center' && 'justify-center w-full',
                            col.align === 'right' && 'justify-end w-full',
                            active && 'text-foreground'
                          )}
                        >
                          <span>{col.label}</span>
                          {active ? (
                            sortDir === 'asc' ? (
                              <RiArrowUpSLine className="size-3.5 shrink-0 text-emerald-500" aria-hidden />
                            ) : (
                              <RiArrowDownSLine className="size-3.5 shrink-0 text-emerald-500" aria-hidden />
                            )
                          ) : (
                            <span className="inline-block size-3.5 shrink-0 opacity-0 group-hover:opacity-40" aria-hidden />
                          )}
                        </button>
                      </th>
                    );
                  })}
                  <th className="px-2 py-2 text-center bg-card" title="សកម្មភាព">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {pagedResults.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground font-bold" style={{ fontFamily: 'inherit' }}>
                      មិនមានទិន្នន័យលទ្ធផលតេស្តសម្រាប់ Query នេះទេ។
                    </td>
                  </tr>
                ) : (
                  pagedResults.map((row) => (
                    <tr key={row.sample_id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-2 py-2 font-mono text-muted-foreground">
                        {row.sample_id}
                      </td>
                      <td className="px-2 py-2 font-mono font-bold text-foreground">
                        {row.patient_id}
                      </td>
                      <td className="px-2 py-2 font-bold text-foreground" style={{ fontFamily: 'inherit' }}>
                        {row.test_name}
                      </td>
                      <td className="px-2 py-2 text-center font-mono text-muted-foreground">
                        {(row.result_date || row.sample_date || '').slice(0, 10)}
                      </td>
                      <td className="px-2 py-2 text-right font-mono font-bold">
                        <span className={cn(
                          row.flagged ? "text-rose-500 font-black" : "text-emerald-500 font-semibold"
                        )} style={{ fontFamily: 'inherit' }}>
                          {row.result_value} {row.unit}
                        </span>
                      </td>
                      <td className="px-2 py-2 text-foreground font-medium" style={{ fontFamily: 'inherit' }}>
                        {row.facility_name}
                      </td>
                      <td className="px-2 py-2 text-center text-muted-foreground text-[11px]">
                        {row.status}
                      </td>
                      <td className="px-2 py-2 text-center">
                        <button
                          type="button"
                          onClick={() => navigate(buildPatient360Path(row.patient_id))}
                          className="text-[11px] font-bold text-emerald-500 hover:text-emerald-600 transition-colors inline-flex items-center gap-1 cursor-pointer hover:underline"
                          title="មើលព័ត៌មានអ្នកជំងឺ Patient 360"
                        >
                          <RiUserSearchLine className="size-3.5" />
                          <span>360</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {filteredResults.length > 0 && (
            <div className="flex items-center justify-between border-t border-border/60 px-4 py-2.5 bg-muted/10">
              <span className="text-[11px] text-muted-foreground" style={{ fontFamily: 'inherit' }}>
                ទំព័រ <strong className="text-foreground">{currentPage}</strong> / <strong className="text-foreground">{totalPages}</strong>
                {' '}· សរុប <strong className="text-foreground">{filteredResults.length}</strong> កំណត់ត្រា
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="h-7 w-7 flex items-center justify-center border border-border/80 bg-card hover:bg-muted text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  <RiArrowLeftSLine className="size-4" />
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const start = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
                  const page = start + i;
                  if (page > totalPages) return null;
                  return (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setCurrentPage(page)}
                      className={cn(
                        "h-7 w-7 flex items-center justify-center border text-[11px] font-bold transition-colors cursor-pointer",
                        page === currentPage
                          ? "bg-emerald-500 border-emerald-500 text-white"
                          : "border-border/80 bg-card hover:bg-muted text-foreground"
                      )}
                    >
                      {page}
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="h-7 w-7 flex items-center justify-center border border-border/80 bg-card hover:bg-muted text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  <RiArrowRightSLine className="size-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Patient360Layout>
  );
}
