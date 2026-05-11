import { useEffect, useMemo, useState } from 'react';
import { RiLogoutBoxRLine } from '@remixicon/react';
import { RiDraggable, RiSearchLine, RiSettings3Line } from '@remixicon/react';
import { AnimatePresence, motion } from 'motion/react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import siteApi from '../services/siteApi';
import { infantReportApi, pnttReportApi, reportingApi } from '../services/reportingApi';
import ReportFilters from '../components/reports/ReportFilters';
import ReportResultsPanel from '../components/reports/ReportResultsPanel';

const fmt = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const INDICATOR_LABEL_MAP = {
  '1. Active ART patients in previous quarter': '1. ចំនួនអ្នកជំងឺ ART សកម្មដល់ចុងត្រីមាសមុន (Number of active ART patients in previous quarter)',
  '2. Active Pre-ART patients in previous quarter': '2. ចំនួនអ្នកជំងឺ Pre-ART សកម្មដល់ចុងត្រីមាសមុន (Number of active Pre-ART patients in previous quarter)',
  '3. Newly Enrolled': '3. ចំនួនអ្នកជំងឺចុះឈ្មោះថ្មី (Number of newly enrolled patients)',
  '4. Re-tested positive': '4. ចំនួនអ្នកជំងឺដែលវិជ្ជមានពីតេស្តបញ្ជាក់ (Number of patient re-tested positive)',
  '5. Newly Initiated': '5. ចំនួនអ្នកជំងឺចាប់ផ្តើមព្យាបាលដោយ ARV ថ្មី (Number of newly initiated ART)',
  '5.1.1. New ART started: Same day': '5.1.1. ក្នុងថ្ងៃតែមួយ (Same day – 0 day)',
  '5.1.2. New ART started: 1-7 days': '5.1.2. ពី ១ ទៅ ៧ ថ្ងៃ (1–7 days)',
  '5.1.3. New ART started: >7 days': '5.1.3. ច្រើនជាង ៧ ថ្ងៃ (>7 days)',
  '5.2. New ART started with TLD': '5.2. ចំនួនអ្នកជំងឺចាប់ផ្តើមព្យាបាលថ្មីដោយ TDF+3TC+DTG (Number of new ART started with TLD)',
  '6. Transfer-in patients': '6. ចំនួនអ្នកជំងឺដែលបានបញ្ជូនចូល (Number of transfer-in patients)',
  '7. Lost and Return': '7. ចំនួនអ្នកជំងឺដែលបានបោះបង់ហើយត្រឡប់មកវិញ (Number of Lost-Return patients)',
  '8.1. Dead': '8.1. ចំនួនអ្នកជំងឺដែលបានស្លាប់ (Dead)',
  '8.2. Lost to follow up (LTFU)': '8.2. ចំនួនអ្នកជំងឺដែលបានបោះបង់ (Lost to follow up – LTFU)',
  '8.3. Transfer-out': '8.3. ចំនួនអ្នកជំងឺដែលបានបញ្ជូនចេញ (Transfer-out)',
  '9. Active Pre-ART': '9. ចំនួនអ្នកជំងឺ Pre-ART សកម្មដល់ចុងត្រីមាសនេះ (Number of active Pre-ART patients in this quarter)',
  '10. Active ART patients in this quarter': '10. ចំនួនអ្នកជំងឺ ART សកម្មដល់ចុងត្រីមាសនេះ (Number of active ART patients in this quarter)',
  '10.1. Eligible MMD': '10.1. ចំនួនអ្នកជំងឺដែលសមស្របសម្រាប់ការផ្តល់ថ្នាំរយៈពេលវែង (Eligible for Multi Month Dispensing – MMD)',
  '10.2. MMD': '10.2. ចំនួនអ្នកជំងឺកំពុងទទួលថ្នាំរយៈពេលវែង (Number of patients received MMD)',
  '10.3. TLD': '10.3. ចំនួនអ្នកជំងឺកំពុងទទួលការព្យាបាលដោយ TLD (Number of patients received TLD)',
  '10.4. TPT Start': '10.4. ចំនួនអ្នកជំងឺដែលបានចាប់ផ្តើមការបង្ការជំងឺរបេង (Number of patients started TPT)',
  '10.5. TPT Complete': '10.5. ចំនួនអ្នកជំងឺដែលបានបញ្ចប់ការបង្ការជំងឺរបេង (Number of patients completed TPT)',
  '10.6. Eligible for VL test': '10.6. ចំនួនអ្នកជំងឺដែលសមស្របធ្វើតេស្ត Viral Load (Eligible for Viral Load test)',
  '10.7. VL tested in 12M': '10.7. ចំនួនអ្នកជំងឺធ្វើតេស្ត Viral Load ក្នុងរយៈពេល ១២ ខែចុងក្រោយ (Receive VL test in last 12 months)',
  '10.8. VL suppression': '10.8. ចំនួនអ្នកជំងឺដែលមានលទ្ធផល VL ចុងក្រោយតិចជាង 1000 copies (Last VL is suppressed)'
};

const formatIndicatorLabel = (name) => INDICATOR_LABEL_MAP[name] || name || '-';

const parseIndicatorParts = (label) => {
  const match = String(label || '').match(/^(\d+(?:\.\d+)*)/);
  if (!match) return null;
  return match[1].split('.').map((part) => Number(part));
};

const compareIndicatorLabel = (a, b) => {
  const aParts = parseIndicatorParts(a?.Indicator);
  const bParts = parseIndicatorParts(b?.Indicator);

  if (!aParts && !bParts) return String(a?.Indicator || '').localeCompare(String(b?.Indicator || ''));
  if (!aParts) return 1;
  if (!bParts) return -1;

  const len = Math.max(aParts.length, bParts.length);
  for (let i = 0; i < len; i += 1) {
    const av = aParts[i];
    const bv = bParts[i];
    if (av == null) return -1;
    if (bv == null) return 1;
    if (av !== bv) return av - bv;
  }
  return String(a?.Indicator || '').localeCompare(String(b?.Indicator || ''));
};

const DEFAULT_DETAIL_COLUMNS = [
  'clinicid',
  'art_number',
  'Artnum',
  'sex_display',
  'Sex',
  'age',
  'Age',
  'DafirstVisit',
  'DaArt',
  'Status'
];

const DETAIL_COLUMN_LABELS = {
  clinicid: 'Clinic ID',
  art_number: 'ART Number',
  Artnum: 'ART Number',
  ART: 'ART Number',
  Sex: 'Sex',
  sex: 'Sex',
  sex_display: 'Sex',
  age: 'Age',
  Age: 'Age',
  patient_type: 'Patient Type',
  typepatients: 'Patient Type',
  DaBirth: 'Date of Birth',
  DafirstVisit: 'First Visit Date',
  DaArt: 'ART Start Date',
  Startartstatus: 'ART Status',
  OffIn: 'Registration Type',
  transfer_status: 'Transfer Status',
  Status: 'Status'
};

const toDetailColumnLabel = (key) => DETAIL_COLUMN_LABELS[key] || key;
const isFacilitySite = (site) => {
  if (!site) return false;
  const codeDigits = String(site.code || '').replace(/\D/g, '');
  const name = String(site.name || '').toLowerCase();
  // Exclude country/province summary rows when possible.
  if (!codeDigits || codeDigits.length < 4) return false;
  if (codeDigits.endsWith('00')) return false;
  if (name.includes('cambodia') || name.includes('province')) return false;
  return true;
};

function buildPeriod(periodType, selectedDate, selectedMonth, selectedQuarter, selectedYear) {
  let start;
  let end;

  if (periodType === 'day') {
    start = new Date(`${selectedDate}T00:00:00`);
    end = new Date(start);
  } else if (periodType === 'month') {
    const [y, m] = selectedMonth.split('-').map(Number);
    start = new Date(y, m - 1, 1);
    end = new Date(y, m, 0);
  } else if (periodType === 'quarter') {
    const q = Number(selectedQuarter);
    const startMonth = (q - 1) * 3;
    start = new Date(Number(selectedYear), startMonth, 1);
    end = new Date(Number(selectedYear), startMonth + 3, 0);
  } else {
    start = new Date(Number(selectedYear), 0, 1);
    end = new Date(Number(selectedYear), 11, 31);
  }

  const previousEnd = new Date(start);
  previousEnd.setDate(previousEnd.getDate() - 1);

  return {
    startDate: fmt(start),
    endDate: fmt(end),
    previousEndDate: fmt(previousEnd)
  };
}

export default function ReportHomePage({ onLogout }) {
  const now = new Date();
  const [sites, setSites] = useState([]);
  const [siteCode, setSiteCode] = useState('');
  const [reportType, setReportType] = useState('adult-child');
  const [periodType, setPeriodType] = useState('quarter');
  const [selectedDate, setSelectedDate] = useState(fmt(now));
  const [selectedMonth, setSelectedMonth] = useState(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`);
  const [selectedQuarter, setSelectedQuarter] = useState(String(Math.floor(now.getMonth() / 3) + 1));
  const [selectedYear, setSelectedYear] = useState(String(now.getFullYear()));
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [runTimeMs, setRunTimeMs] = useState(null);
  const [progress, setProgress] = useState({ completed: 0, total: 0 });
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailTitle, setDetailTitle] = useState('');
  const [detailRows, setDetailRows] = useState([]);
  const [detailError, setDetailError] = useState('');
  const [detailPage, setDetailPage] = useState(1);
  const [detailLimit] = useState(25);
  const [detailTotal, setDetailTotal] = useState(0);
  const [detailTotalPages, setDetailTotalPages] = useState(1);
  const [detailFilter, setDetailFilter] = useState(null);
  const [showColumnConfig, setShowColumnConfig] = useState(false);
  const [selectedDetailColumns, setSelectedDetailColumns] = useState([]);
  const [detailColumnSearch, setDetailColumnSearch] = useState('');
  const [dragColumnKey, setDragColumnKey] = useState('');
  const [detailSortKey, setDetailSortKey] = useState('');
  const [detailSortDirection, setDetailSortDirection] = useState('asc');

  useEffect(() => {
    siteApi
      .getAllSites()
      .then((data) => {
        const allSites = data || [];
        setSites(allSites);
        const firstFacility = allSites.find(isFacilitySite) || allSites[0];
        if (firstFacility?.code) setSiteCode(String(firstFacility.code));
      })
      .catch((e) => toast.error(e.response?.data?.error || e.message || 'Failed to load sites'));
  }, []);

  const canRun = useMemo(() => Boolean(siteCode), [siteCode]);
  const selectedSite = useMemo(() => sites.find((s) => String(s.code) === String(siteCode)), [siteCode, sites]);
  const effectiveSiteCode = useMemo(() => (siteCode === '__CAMBODIA__' ? 'all' : siteCode), [siteCode]);
  const selectedSiteLevel = useMemo(() => {
    if (siteCode === '__CAMBODIA__') return 'country';
    const digits = String(siteCode || '').replace(/\D/g, '');
    const name = String(selectedSite?.name || '').toLowerCase();
    if (name.includes('cambodia')) return 'country';
    if (digits.length <= 2) return 'province';
    if (digits.length >= 4 && digits.endsWith('00')) return 'province';
    return 'facility';
  }, [selectedSite, siteCode]);
  const siteCodeSet = useMemo(() => new Set(sites.map((s) => String(s.code))), [sites]);
  const facilitySites = useMemo(() => sites.filter(isFacilitySite), [sites]);
  const getAggregateFacilityCodes = (rawSiteCode) => {
    const value = String(rawSiteCode || '').trim();
    const digits = value.replace(/\D/g, '');
    if (!value) return [];
    if (value === '__CAMBODIA__') return facilitySites.map((s) => String(s.code));

    const matchedSite = sites.find((s) => String(s.code) === value);
    if (matchedSite && isFacilitySite(matchedSite)) return [value];

    if (matchedSite && String(matchedSite.name || '').toLowerCase().includes('cambodia')) {
      return facilitySites.map((s) => String(s.code));
    }

    // Primary strategy: map children via tblsite/parent linkage from registry rows.
    const childByTblsite = facilitySites.filter((site) => {
      const parentCandidates = [
        site?.tblsite,
        site?.tblSite,
        site?.parent_tblsite,
        site?.parentTblsite,
        site?.parent_code,
        site?.parentCode
      ]
        .map((v) => String(v ?? '').trim())
        .filter(Boolean);
      return parentCandidates.includes(value);
    });
    if (childByTblsite.length > 0) return childByTblsite.map((s) => String(s.code));

    if (/^\d{2}$/.test(digits)) {
      return facilitySites
        .map((s) => String(s.code))
        .filter((code) => code.replace(/\D/g, '').startsWith(digits));
    }

    if (/^\d{4}$/.test(digits) && digits.endsWith('00')) {
      const prefix = digits.slice(0, 2);
      return facilitySites
        .map((s) => String(s.code))
        .filter((code) => code.replace(/\D/g, '').startsWith(prefix));
    }

    return [];
  };
  const getCandidateSiteCodes = (rawSiteCode) => {
    const value = String(rawSiteCode || '').trim();
    if (!value) return [];
    const digits = value.replace(/\D/g, '');
    const candidates = [value];
    const hasExact = siteCodeSet.has(value);
    // Province nodes can be represented as 2-digit or 4-digit aggregate codes depending on backend.
    if (!hasExact) {
      if (/^\d{4}$/.test(digits) && digits.endsWith('00')) candidates.push(digits.slice(0, 2));
      if (/^\d{2}$/.test(digits)) candidates.push(`${digits}00`);
    }
    return [...new Set(candidates.filter(Boolean))];
  };
  const currentPeriod = useMemo(
    () => buildPeriod(periodType, selectedDate, selectedMonth, selectedQuarter, selectedYear),
    [periodType, selectedDate, selectedMonth, selectedQuarter, selectedYear]
  );
  const isAdultChild = reportType === 'adult-child';
  const previewRows = Array.isArray(rows) ? rows.slice(0, 120) : [];
  const availableYears = useMemo(() => {
    const y = now.getFullYear();
    return Array.from({ length: 8 }, (_, i) => String(y - 5 + i));
  }, [now]);
  const formatValue = (v) => {
    if (typeof v === 'number') return v.toLocaleString();
    const asNum = Number(v);
    if (!Number.isNaN(asNum) && String(v).trim() !== '') return asNum.toLocaleString();
    return v == null ? '-' : String(v);
  };
  const getSex = (record) => {
    const sex = record?.sex_display || record?.sex || record?.Sex;
    if (sex === 1 || String(sex).toLowerCase() === 'male' || String(sex).toLowerCase() === 'm') return 'male';
    if (sex === 0 || String(sex).toLowerCase() === 'female' || String(sex).toLowerCase() === 'f') return 'female';
    return 'unknown';
  };
  const getAge = (record) => {
    const v = record?.age ?? record?.Age;
    const n = Number(v);
    return Number.isNaN(n) ? null : n;
  };
  const indicatorApiMap = {
    '1. Active ART patients in previous quarter': '01_active_art_previous',
    '2. Active Pre-ART patients in previous quarter': '02_active_pre_art_previous',
    '3. Newly Enrolled': '03_newly_enrolled',
    '4. Re-tested positive': '04_retested_positive',
    '5. Newly Initiated': '05_newly_initiated',
    '5.1.1. New ART started: Same day': '05.1.1_art_same_day',
    '5.1.2. New ART started: 1-7 days': '05.1.2_art_1_7_days',
    '5.1.3. New ART started: >7 days': '05.1.3_art_over_7_days',
    '5.2. New ART started with TLD': '05.2_art_with_tld',
    '6. Transfer-in patients': '06_transfer_in',
    '7. Lost and Return': '07_lost_and_return',
    '8.1. Dead': '08.1_dead',
    '8.2. Lost to follow up (LTFU)': '08.2_lost_to_followup',
    '8.3. Transfer-out': '08.3_transfer_out',
    '9. Active Pre-ART': '09_active_pre_art',
    '10. Active ART patients in this quarter': '10_active_art_current',
    '10.1. Eligible MMD': '10.1_eligible_mmd',
    '10.2. MMD': '10.2_mmd',
    '10.3. TLD': '10.3_tld',
    '10.4. TPT Start': '10.4_tpt_start',
    '10.5. TPT Complete': '10.5_tpt_complete',
    '10.6. Eligible for VL test': '10.6_eligible_vl_test',
    '10.7. VL tested in 12M': '10.7_vl_tested_12m',
    '10.8. VL suppression': '10.8_vl_suppression'
  };
  const getDetailScriptId = (section, rowIdx = 0) => {
    if (!section) return null;
    if (Array.isArray(section.detailScriptIds) && section.detailScriptIds[rowIdx]) return section.detailScriptIds[rowIdx];
    return section.detailScriptId || section.scriptId || null;
  };

  const hasRows = previewRows.length > 0;
  const adultChildRows = useMemo(() => {
    if (!isAdultChild) return [];
    const sortedRows = [...previewRows].sort(compareIndicatorLabel);
    return sortedRows.map((row) => {
      const male014 = Number(row?.Male_0_14 ?? 0);
      const female014 = Number(row?.Female_0_14 ?? 0);
      const maleOver14 = Number(row?.Male_over_14 ?? 0);
      const femaleOver14 = Number(row?.Female_over_14 ?? 0);
      const subtotalMale = male014 + maleOver14;
      const subtotalFemale = female014 + femaleOver14;
      return {
        rawIndicator: row?.Indicator || '',
        indicator: formatIndicatorLabel(row?.Indicator),
        younger: { age: '0-14', male: male014, female: female014, total: male014 + female014 },
        older: { age: '>14', male: maleOver14, female: femaleOver14, total: maleOver14 + femaleOver14 },
        subtotal: { age: 'សរុប', male: subtotalMale, female: subtotalFemale, total: subtotalMale + subtotalFemale },
        queryMs: row?.queryMs
      };
    });
  }, [isAdultChild, previewRows]);

  const fetchDetailPage = async (filter, page = 1) => {
    if (!effectiveSiteCode || !filter?.rawIndicator) return;
    const indicatorKey = indicatorApiMap[filter.rawIndicator] || filter.rawIndicator;
    setDetailLoading(true);
    setDetailError('');
    try {
      const params = {
        siteCode: effectiveSiteCode,
        siteLevel: selectedSiteLevel,
        ...currentPeriod,
        page,
        limit: detailLimit
      };
      if (filter.gender === 'male' || filter.gender === 'female') params.gender = filter.gender;
      if (filter.ageGroup === 'younger') params.ageGroup = '0-14';
      if (filter.ageGroup === 'older') params.ageGroup = '>14';

      const response = await reportingApi.getIndicatorDetails(indicatorKey, params);
      const list = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : [];
      const normalized = list.map((record) => ({
        ...record,
        sex_display: record?.sex_display || (getSex(record) === 'male' ? 'Male' : getSex(record) === 'female' ? 'Female' : 'Unknown'),
        age: getAge(record)
      }));
      setDetailRows(normalized);
      const totalCount = Number(response?.pagination?.totalCount ?? normalized.length ?? 0);
      const totalPages = Number(response?.pagination?.totalPages ?? Math.max(1, Math.ceil(totalCount / detailLimit)));
      setDetailTotal(totalCount);
      setDetailTotalPages(totalPages > 0 ? totalPages : 1);
      setDetailPage(Number(response?.pagination?.page ?? page));
    } catch (e) {
      setDetailError(e?.response?.data?.error || e?.message || 'Failed to load details');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleAdultChildCellClick = async (item, ageGroup, gender) => {
    if (!effectiveSiteCode || !item?.rawIndicator) return;
    const filter = { rawIndicator: item.rawIndicator, ageGroup, gender };
    setDetailFilter(filter);
    setDetailTitle(`${item.indicator} - ${ageGroup}/${gender}`);
    setDetailOpen(true);
    setDetailRows([]);
    setDetailTotal(0);
    setDetailTotalPages(1);
    setDetailPage(1);
    await fetchDetailPage(filter, 1);
  };
  const handleInfantCellClick = async (section, row, rowIdx, column) => {
    const scriptId = getDetailScriptId(section, rowIdx);
    if (!effectiveSiteCode || !scriptId) return;
    setDetailTitle(`${section?.sectionNumber || ''}. ${section?.sectionLabelKh || section?.sectionLabelEn || 'Infant Detail'}`);
    setDetailOpen(true);
    setDetailLoading(true);
    setDetailRows([]);
    setDetailError('');
    setDetailTotal(0);
    setDetailTotalPages(1);
    setDetailPage(1);
    try {
      const response = await infantReportApi.getInfantReportDetails({
        siteCode: effectiveSiteCode,
        siteLevel: selectedSiteLevel,
        scriptId,
        ...currentPeriod
      });
      const list = Array.isArray(response?.data) ? response.data : [];
      const filtered = list.filter((record) => {
        const sex = getSex(record);
        if (column === 'male') return sex === 'male';
        if (column === 'female') return sex === 'female';
        return true;
      });
      setDetailRows(filtered);
      setDetailTotal(filtered.length);
    } catch (e) {
      setDetailError(e?.response?.data?.error || e?.message || 'Failed to load infant details');
    } finally {
      setDetailLoading(false);
    }
  };
  const handlePnttCellClick = async (section, row, rowIdx, column) => {
    const scriptId = getDetailScriptId(section, rowIdx);
    if (!effectiveSiteCode || !scriptId) return;
    setDetailTitle(`${section?.sectionNumber || ''}. ${section?.sectionLabelKh || section?.sectionLabelEn || 'PNTT Detail'}`);
    setDetailOpen(true);
    setDetailLoading(true);
    setDetailRows([]);
    setDetailError('');
    setDetailTotal(0);
    setDetailTotalPages(1);
    setDetailPage(1);
    try {
      const response = await pnttReportApi.getPnttReportDetails({
        siteCode: effectiveSiteCode,
        siteLevel: selectedSiteLevel,
        scriptId,
        ...currentPeriod
      });
      const list = Array.isArray(response?.data) ? response.data : [];
      const filtered = list.filter((record) => {
        if (column === 'ever' || column === 'sixMonths' || column === 'never') return Number(record?.[column]) === 1;
        const sex = getSex(record);
        if (column === 'male') return sex === 'male';
        if (column === 'female') return sex === 'female';
        return true;
      });
      setDetailRows(filtered);
      setDetailTotal(filtered.length);
    } catch (e) {
      setDetailError(e?.response?.data?.error || e?.message || 'Failed to load PNTT details');
    } finally {
      setDetailLoading(false);
    }
  };

  const availableDetailColumns = useMemo(() => Object.keys(detailRows[0] || {}), [detailRows]);
  const detailColumnGroups = useMemo(() => {
    const groups = new Map();
    availableDetailColumns.forEach((key) => {
      const label = toDetailColumnLabel(key);
      if (!groups.has(label)) groups.set(label, { label, keys: [] });
      groups.get(label).keys.push(key);
    });
    return Array.from(groups.values());
  }, [availableDetailColumns]);
  const visibleColumnGroups = useMemo(
    () => detailColumnGroups.filter((group) => group.label.toLowerCase().includes(detailColumnSearch.trim().toLowerCase())),
    [detailColumnGroups, detailColumnSearch]
  );

  useEffect(() => {
    if (!availableDetailColumns.length) {
      setSelectedDetailColumns([]);
      return;
    }
    const preferred = DEFAULT_DETAIL_COLUMNS.filter((key) => availableDetailColumns.includes(key));
    const ordered = preferred.length > 0 ? preferred : availableDetailColumns;
    const defaults = [];
    const seenLabels = new Set();
    for (const key of ordered) {
      const label = toDetailColumnLabel(key);
      if (seenLabels.has(label)) continue;
      seenLabels.add(label);
      defaults.push(key);
      if (defaults.length >= 8) break;
    }
    setSelectedDetailColumns(defaults);
  }, [availableDetailColumns]);

  const detailColumns = useMemo(() => {
    if (selectedDetailColumns.length > 0) {
      const seenLabels = new Set();
      return selectedDetailColumns.filter((key) => {
        const label = toDetailColumnLabel(key);
        if (seenLabels.has(label)) return false;
        seenLabels.add(label);
        return true;
      });
    }
    const keys = Object.keys(detailRows[0] || {});
    const preferred = DEFAULT_DETAIL_COLUMNS.filter((key) => keys.includes(key));
    if (preferred.length > 0) return preferred.filter((key, idx, arr) => arr.findIndex((k) => toDetailColumnLabel(k) === toDetailColumnLabel(key)) === idx);
    return keys.slice(0, 8);
  }, [detailRows, selectedDetailColumns]);
  const moveSelectedColumn = (fromKey, toKey) => {
    if (!fromKey || !toKey || fromKey === toKey) return;
    setSelectedDetailColumns((prev) => {
      const next = [...prev];
      const fromIdx = next.indexOf(fromKey);
      const toIdx = next.indexOf(toKey);
      if (fromIdx === -1 || toIdx === -1) return prev;
      const [moved] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, moved);
      return next;
    });
  };
  const sortedDetailRows = useMemo(() => {
    if (!detailSortKey) return detailRows;
    const rowsCopy = [...detailRows];
    rowsCopy.sort((a, b) => {
      const av = a?.[detailSortKey];
      const bv = b?.[detailSortKey];
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      const an = Number(av);
      const bn = Number(bv);
      let cmp;
      if (!Number.isNaN(an) && !Number.isNaN(bn)) cmp = an - bn;
      else cmp = String(av).localeCompare(String(bv), undefined, { numeric: true, sensitivity: 'base' });
      return detailSortDirection === 'asc' ? cmp : -cmp;
    });
    return rowsCopy;
  }, [detailRows, detailSortDirection, detailSortKey]);
  const isSectionedReport =
    !isAdultChild &&
    hasRows &&
    typeof previewRows[0] === 'object' &&
    Object.prototype.hasOwnProperty.call(previewRows[0], 'scriptId') &&
    Object.prototype.hasOwnProperty.call(previewRows[0], 'rows');

  useEffect(() => {
    setRows([]);
    setRunTimeMs(null);
    setProgress({ completed: 0, total: 0 });
  }, [reportType]);

  const runReport = async () => {
    if (!effectiveSiteCode) return;
    setLoading(true);
    setRows([]);
    setRunTimeMs(null);
    setProgress({ completed: 0, total: 0 });
    const startedAt = performance.now();
    try {
      const sumObjectNumericFields = (target, source) => {
        const next = { ...(target || {}) };
        for (const [key, rawValue] of Object.entries(source || {})) {
          const value = Number(rawValue);
          const hasNumeric = rawValue != null && rawValue !== '' && !Number.isNaN(value);
          if (hasNumeric) {
            const prev = Number(next[key] ?? 0);
            next[key] = (Number.isNaN(prev) ? 0 : prev) + value;
          } else if (next[key] == null || next[key] === '') {
            next[key] = rawValue;
          }
        }
        return next;
      };
      const mergeAdultChildRows = (allRows) => {
        const byIndicator = new Map();
        allRows.flat().forEach((row) => {
          const key = String(row?.Indicator || '');
          if (!key) return;
          byIndicator.set(key, sumObjectNumericFields(byIndicator.get(key), row));
        });
        return Array.from(byIndicator.values());
      };
      const mergeAdultChildAccumulator = (accMap, row) => {
        const key = String(row?.Indicator || '');
        if (!key) return accMap;
        const next = new Map(accMap);
        next.set(key, sumObjectNumericFields(next.get(key), row));
        return next;
      };
      const mergeSectionedRows = (allRows) => {
        const sections = new Map();
        allRows.flat().forEach((section) => {
          const sectionKey = String(section?.scriptId || section?.sectionNumber || section?.sectionLabelEn || Math.random());
          const existing = sections.get(sectionKey);
          if (!existing) {
            sections.set(sectionKey, {
              ...section,
              rows: Array.isArray(section?.rows) ? section.rows.map((r) => ({ ...r })) : []
            });
            return;
          }
          existing.rows = (existing.rows || []).map((row, idx) =>
            sumObjectNumericFields(row, (Array.isArray(section?.rows) ? section.rows[idx] : null) || {})
          );
        });
        return Array.from(sections.values());
      };

      const candidateSiteCodes = getCandidateSiteCodes(effectiveSiteCode);
      const aggregateFacilityCodes = getAggregateFacilityCodes(effectiveSiteCode);
      let success = false;
      if (reportType === 'adult-child') {
        if (selectedSiteLevel === 'country') {
          let attemptRowCount = 0;
          setRows([]);
          setProgress({ completed: 0, total: 0 });
          await reportingApi.streamAllIndicators({ siteCode: effectiveSiteCode, siteLevel: 'country', ...currentPeriod }, {
            onMessage: (payload) => {
              if (payload.type === 'start') {
                setProgress({ completed: 0, total: Number(payload.total) || 0 });
              }
            },
            onIndicator: (payload) => {
              attemptRowCount += 1;
              setRows((prev) => [...prev, payload.data].filter(Boolean));
              setProgress({
                completed: Number(payload.completed) || 0,
                total: Number(payload.total) || 0
              });
            },
            onIndicatorError: (payload) => {
              setProgress({
                completed: Number(payload.completed) || 0,
                total: Number(payload.total) || 0
              });
            },
            onDone: (payload) => {
              setRunTimeMs(Number(payload.durationMs) || Math.round(performance.now() - startedAt));
            }
          });
          if (attemptRowCount > 0) success = true;
        }
        if (selectedSiteLevel !== 'facility' && aggregateFacilityCodes.length > 0) {
          if (success) {
            setRunTimeMs((prev) => prev ?? Math.round(performance.now() - startedAt));
          } else {
          let aggregatedByIndicator = new Map();
          setRows([]);
          setProgress({ completed: 0, total: 0 });
          for (let i = 0; i < aggregateFacilityCodes.length; i += 1) {
            const facilityCode = aggregateFacilityCodes[i];
            await reportingApi.streamAllIndicators({ siteCode: facilityCode, siteLevel: 'facility', ...currentPeriod }, {
              onMessage: (payload) => {
                if (payload.type === 'start') {
                  const indicatorsPerFacility = Number(payload.total) || 0;
                  if (indicatorsPerFacility > 0) {
                    setProgress({
                      completed: i * indicatorsPerFacility,
                      total: aggregateFacilityCodes.length * indicatorsPerFacility
                    });
                  }
                }
              },
              onIndicator: (payload) => {
                if (payload?.data) {
                  aggregatedByIndicator = mergeAdultChildAccumulator(aggregatedByIndicator, payload.data);
                  setRows(Array.from(aggregatedByIndicator.values()));
                  success = true;
                }
                const indicatorsPerFacility = Number(payload.total) || 0;
                if (indicatorsPerFacility > 0) {
                  setProgress({
                    completed: i * indicatorsPerFacility + (Number(payload.completed) || 0),
                    total: aggregateFacilityCodes.length * indicatorsPerFacility
                  });
                }
              },
              onIndicatorError: (payload) => {
                const indicatorsPerFacility = Number(payload.total) || 0;
                if (indicatorsPerFacility > 0) {
                  setProgress({
                    completed: i * indicatorsPerFacility + (Number(payload.completed) || 0),
                    total: aggregateFacilityCodes.length * indicatorsPerFacility
                  });
                }
              }
            });
          }
          }
        }
        for (const candidateSiteCode of candidateSiteCodes) {
          if (success) break;
          let attemptRowCount = 0;
          setRows([]);
          setProgress({ completed: 0, total: 0 });
          await reportingApi.streamAllIndicators({ siteCode: candidateSiteCode, siteLevel: selectedSiteLevel, ...currentPeriod }, {
            onMessage: (payload) => {
              if (payload.type === 'start') {
                setProgress({ completed: 0, total: Number(payload.total) || 0 });
              }
            },
            onIndicator: (payload) => {
              attemptRowCount += 1;
              setRows((prev) => [...prev, payload.data].filter(Boolean));
              setProgress({
                completed: Number(payload.completed) || 0,
                total: Number(payload.total) || 0
              });
            },
            onIndicatorError: (payload) => {
              setProgress({
                completed: Number(payload.completed) || 0,
                total: Number(payload.total) || 0
              });
              toast.error(`Indicator ${payload.indicatorId} failed: ${payload.error}`);
            },
            onDone: (payload) => {
              setRunTimeMs(Number(payload.durationMs) || Math.round(performance.now() - startedAt));
            }
          });
          if (attemptRowCount > 0) {
            success = true;
            break;
          }
        }
        setRunTimeMs((prev) => prev ?? Math.round(performance.now() - startedAt));
      } else if (reportType === 'infants') {
        if (selectedSiteLevel === 'country') {
          const result = await infantReportApi.getInfantReport({ siteCode: effectiveSiteCode, siteLevel: 'country', ...currentPeriod });
          const rowsFromCountry = result?.data || [];
          if (rowsFromCountry.length > 0) {
            setRows(rowsFromCountry);
            success = true;
          }
        }
        if (selectedSiteLevel !== 'facility' && aggregateFacilityCodes.length > 0) {
          if (success) {
            setRunTimeMs(Math.round(performance.now() - startedAt));
          } else {
          const collected = [];
          setProgress({ completed: 0, total: aggregateFacilityCodes.length });
          for (let i = 0; i < aggregateFacilityCodes.length; i += 1) {
            const facilityCode = aggregateFacilityCodes[i];
            const result = await infantReportApi.getInfantReport({ siteCode: facilityCode, siteLevel: 'facility', ...currentPeriod });
            const rowsForFacility = result.data || [];
            if (rowsForFacility.length > 0) {
              collected.push(rowsForFacility);
              setRows(mergeSectionedRows(collected));
              success = true;
            }
            setProgress({ completed: i + 1, total: aggregateFacilityCodes.length });
          }
          }
        } else {
          for (const candidateSiteCode of candidateSiteCodes) {
            const result = await infantReportApi.getInfantReport({ siteCode: candidateSiteCode, siteLevel: selectedSiteLevel, ...currentPeriod });
            const nextRows = result.data || [];
            if (nextRows.length > 0) {
              setRows(nextRows);
              success = true;
              break;
            }
          }
        }
        setRunTimeMs(Math.round(performance.now() - startedAt));
      } else {
        if (selectedSiteLevel === 'country') {
          const result = await pnttReportApi.getPnttReport({ siteCode: effectiveSiteCode, siteLevel: 'country', ...currentPeriod });
          const rowsFromCountry = result?.data || [];
          if (rowsFromCountry.length > 0) {
            setRows(rowsFromCountry);
            success = true;
          }
        }
        if (selectedSiteLevel !== 'facility' && aggregateFacilityCodes.length > 0) {
          if (success) {
            setRunTimeMs(Math.round(performance.now() - startedAt));
          } else {
          const collected = [];
          setProgress({ completed: 0, total: aggregateFacilityCodes.length });
          for (let i = 0; i < aggregateFacilityCodes.length; i += 1) {
            const facilityCode = aggregateFacilityCodes[i];
            const result = await pnttReportApi.getPnttReport({ siteCode: facilityCode, siteLevel: 'facility', ...currentPeriod });
            const rowsForFacility = result.data || [];
            if (rowsForFacility.length > 0) {
              collected.push(rowsForFacility);
              setRows(mergeSectionedRows(collected));
              success = true;
            }
            setProgress({ completed: i + 1, total: aggregateFacilityCodes.length });
          }
          }
        } else {
          for (const candidateSiteCode of candidateSiteCodes) {
            const result = await pnttReportApi.getPnttReport({ siteCode: candidateSiteCode, siteLevel: selectedSiteLevel, ...currentPeriod });
            const nextRows = result.data || [];
            if (nextRows.length > 0) {
              setRows(nextRows);
              success = true;
              break;
            }
          }
        }
        setRunTimeMs(Math.round(performance.now() - startedAt));
      }
      if (!success) {
        setRows([]);
        toast.error('No data found for selected site level and period');
      }
    } catch (e) {
      toast.error(e.response?.data?.error || e.message || 'Report failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background mx-auto lg:max-w-[300mm] px-4 sm:px-6 py-4 sm:py-6">
      <div className="space-y-4">
        <div className="fixed right-4 top-4 z-50">
          <Button variant="outline" size="sm" onClick={onLogout} className="rounded-none bg-card">
            <RiLogoutBoxRLine className="size-4" />
          </Button>
        </div>
        <ReportFilters
          sites={sites}
          siteCode={siteCode}
          setSiteCode={setSiteCode}
          reportType={reportType}
          setReportType={setReportType}
          periodType={periodType}
          setPeriodType={setPeriodType}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          selectedMonth={selectedMonth}
          setSelectedMonth={setSelectedMonth}
          selectedQuarter={selectedQuarter}
          setSelectedQuarter={setSelectedQuarter}
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
          availableYears={availableYears}
          canRun={canRun}
          loading={loading}
          runReport={runReport}
          onLogout={onLogout}
        />
        <ReportResultsPanel
          selectedSite={selectedSite}
          currentPeriod={currentPeriod}
          reportType={reportType}
          runTimeMs={runTimeMs}
          isAdultChild={isAdultChild}
          loading={loading}
          progress={progress}
          previewRows={previewRows}
          hasRows={hasRows}
          adultChildRows={adultChildRows}
          isSectionedReport={isSectionedReport}
          formatValue={formatValue}
          onAdultChildCellClick={handleAdultChildCellClick}
          onInfantCellClick={handleInfantCellClick}
          onPnttCellClick={handlePnttCellClick}
        />
        <AnimatePresence>
          {detailOpen && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-[2px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              onClick={() => {
                setDetailOpen(false);
                setDetailFilter(null);
              }}
            >
            <motion.div
              className="flex max-h-[88vh] w-full max-w-6xl flex-col overflow-hidden border border-border bg-card shadow-2xl"
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between border-b border-border bg-muted/30 px-4 py-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-foreground">{detailTitle}</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {detailTotal.toLocaleString()} records
                  </div>
                </div>
                <button
                  type="button"
                  className="ml-3 border border-border px-2.5 py-1 text-xs font-medium hover:bg-muted"
                  onClick={() => {
                    setDetailOpen(false);
                    setDetailFilter(null);
                  }}
                >
                  Close
                </button>
              </div>
              <div className="flex items-center justify-between border-b border-border px-4 py-2">
                <div className="text-xs text-muted-foreground">Column settings</div>
                <button
                  type="button"
                  className="inline-flex h-7 w-7 items-center justify-center border border-border hover:bg-muted"
                  onClick={() => setShowColumnConfig((v) => !v)}
                  title={showColumnConfig ? 'Hide column settings' : 'Show column settings'}
                  aria-label={showColumnConfig ? 'Hide column settings' : 'Show column settings'}
                >
                  <RiSettings3Line className="size-4" />
                </button>
              </div>
              {showColumnConfig && (
                <div className="border-b border-border bg-muted/20 px-4 py-3">
                  {detailColumns.length > 0 && (
                    <div className="mb-3">
                      <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                        Selected columns (drag to reorder)
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {detailColumns.map((key) => (
                          <button
                            key={`drag-${key}`}
                            type="button"
                            draggable
                            onDragStart={() => setDragColumnKey(key)}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={() => {
                              moveSelectedColumn(dragColumnKey, key);
                              setDragColumnKey('');
                            }}
                            className="inline-flex cursor-grab items-center gap-1.5 border border-border bg-background px-2 py-1 text-xs active:cursor-grabbing"
                          >
                            <RiDraggable className="size-3.5 text-muted-foreground" />
                            {toDetailColumnLabel(key)}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="relative mb-2">
                    <RiSearchLine className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                    <input
                      value={detailColumnSearch}
                      onChange={(e) => setDetailColumnSearch(e.target.value)}
                      placeholder="Search columns..."
                      className="h-8 w-full border border-input bg-background pl-8 pr-2 text-xs"
                    />
                  </div>
                  <div className="grid max-h-32 grid-cols-2 gap-2 overflow-auto md:grid-cols-4">
                    {visibleColumnGroups.map((group) => {
                      const checked = group.keys.every((k) => selectedDetailColumns.includes(k));
                      return (
                        <label key={group.label} className="flex items-center gap-2 text-xs text-foreground">
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded-none border border-border accent-primary"
                            checked={checked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedDetailColumns((prev) => [...prev, ...group.keys.filter((k) => !prev.includes(k))]);
                              } else {
                                setSelectedDetailColumns((prev) => prev.filter((k) => !group.keys.includes(k)));
                              }
                            }}
                          />
                          <span>{group.label}</span>
                        </label>
                      );
                    })}
                    {visibleColumnGroups.length === 0 && (
                      <div className="col-span-full py-2 text-xs text-muted-foreground">No columns found.</div>
                    )}
                  </div>
                </div>
              )}
              <div className="min-h-0 flex-1 overflow-auto p-4">
                {detailLoading ? (
                  <div className="flex min-h-52 items-center justify-center">
                    <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="size-4 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground" />
                      Loading details...
                    </div>
                  </div>
                ) : detailError ? (
                  <div className="text-sm text-destructive">{detailError}</div>
                ) : detailRows.length === 0 ? (
                  <div className="text-sm text-muted-foreground">No detail records found.</div>
                ) : (
                  <div className="overflow-auto border border-border">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="sticky top-0 z-10 border-b border-border bg-muted">
                        {detailColumns.map((key) => (
                          <th
                            key={key}
                            className="border-r border-border px-2 py-2 text-left font-semibold last:border-r-0 cursor-pointer select-none hover:bg-muted/80"
                            onClick={() => {
                              if (detailSortKey === key) {
                                setDetailSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
                              } else {
                                setDetailSortKey(key);
                                setDetailSortDirection('asc');
                              }
                            }}
                          >
                            <span className="inline-flex items-center gap-1">
                              {toDetailColumnLabel(key)}
                              {detailSortKey === key && (
                                <span className="text-[10px] text-muted-foreground">
                                  {detailSortDirection === 'asc' ? '▲' : '▼'}
                                </span>
                              )}
                            </span>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sortedDetailRows.map((row, idx) => (
                        <tr key={idx} className="border-b border-border/50">
                          {detailColumns.map((key) => (
                            <td key={`${idx}-${key}`} className="border-r border-border/50 px-2 py-2 align-top last:border-r-0">
                              {formatValue(row?.[key])}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between border-t border-border bg-muted/20 px-4 py-2">
                <div className="text-xs text-muted-foreground">Page {detailPage} / {detailTotalPages}</div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="h-7 border border-border px-3 text-xs disabled:opacity-50"
                    disabled={detailLoading || detailPage <= 1}
                    onClick={() => fetchDetailPage(detailFilter, detailPage - 1)}
                  >
                    Prev
                  </button>
                  <button
                    type="button"
                    className="h-7 border border-border px-3 text-xs disabled:opacity-50"
                    disabled={detailLoading || detailPage >= detailTotalPages}
                    onClick={() => fetchDetailPage(detailFilter, detailPage + 1)}
                  >
                    Next
                  </button>
                </div>
              </div>
            </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
