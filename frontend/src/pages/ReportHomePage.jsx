import { useEffect, useMemo, useRef, useState } from 'react';
import { RiDownloadLine, RiDraggable, RiSearchLine, RiSettings3Line } from '@remixicon/react';
import { AnimatePresence, motion } from 'motion/react';
import { toast } from 'sonner';
import { useSites } from '../contexts/SitesContext';
import { getPeriodByKey, listRecentQuarters } from '../utils/visualizePeriods';
import { infantReportApi, pnttReportApi, reportingApi } from '../services/reportingApi';
import { getAnalyticsStatus, getCountryAnalytics, getProvinceAnalytics, getAnalyticsSummary } from '../services/analyticsApi';
import ReportFilters from '../components/reports/ReportFilters';
import ReportResultsPanel from '../components/reports/ReportResultsPanel';
import { filterSitesByUserScope, isFacilitySite, pickDefaultSiteCode } from '../utils/siteSelection';
import { useAuth } from '../contexts/AuthContext';
import { downloadCsv, rowsToCsv, safeExportFilename } from '../utils/exportCsv';
import AppPageShell from '../components/layout/AppPageShell';
import Patient360Layout from '../components/patient360/Patient360Layout';

const DETAIL_EXPORT_PAGE_SIZE = 500;
const DETAIL_EXPORT_MAX = 50000;

const fmt = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

/** PNTT risk block row index → detail column (0/1/2 = ever / six months / never). Matches riskPnttNormalizer in backend pnttReportService.js */
const PNTT_RISK_DETAIL_FIELDS = [
  'SexHIV',
  'Wsex',
  'SexM',
  'SexTran',
  'Sex4',
  'Drug',
  'Pill',
  'SexMoney',
  'SexProvice',
  'WOut'
];

function recordFieldCaseInsensitive(record, field) {
  if (!record || field == null || field === '') return undefined;
  if (Object.prototype.hasOwnProperty.call(record, field)) return record[field];
  const lower = String(field).toLowerCase();
  const key = Object.keys(record).find((k) => k.toLowerCase() === lower);
  return key != null ? record[key] : undefined;
}

/** Match detail modal headline count to the aggregate cell the user clicked (not raw SQL row count). */
function detailCountFromAggregateRow(row, column) {
  if (!row || typeof row !== 'object') return null;
  const n = (v) => {
    const x = Number(v);
    return Number.isFinite(x) ? x : null;
  };
  if (column === 'ever') return n(row.ever);
  if (column === 'sixMonths') return n(row.sixMonths);
  if (column === 'never') return n(row.never);
  if (column === 'male') return n(row.male);
  if (column === 'female') return n(row.female);
  if (column === 'total') {
    // Prefer male + female so headline matches ប្រុស + ស្រី drill-downs (Tsex can include unknown sex).
    const m = n(row.male);
    const f = n(row.female);
    if (m != null && f != null) return m + f;
    const t = n(row.total);
    if (t != null) return t;
    return (Number(row.male) || 0) + (Number(row.female) || 0);
  }
  return null;
}

export const INDICATOR_LABEL_MAP = {
  '1. Active ART patients in previous quarter': '1. ចំនួនអ្នកជំងឺ ART សកម្មដល់ចុងត្រីមាសមុន (Number of active ART patients in previous quarter)',
  '2. Active Pre-ART patients in previous quarter': '2. ចំនួនអ្នកជំងឺ Pre-ART សកម្មដល់ចុងត្រីមាសមុន (Number of active Pre-ART patients in previous quarter)',
  '3. Newly Enrolled': '3. ចំនួនអ្នកជំងឺចុះឈ្មោះថ្មី (Number of newly enrolled patients)',
  '4. Re-tested positive': '4. ចំនួនអ្នកជំងឺដែលវិជ្ជមានពីតេស្តបញ្ជាក់ (Number of patient re-tested positive)',
  '5. Newly Initiated': '5. ចំនួនអ្នកជំងឺចាប់ផ្តើមព្យាបាលដោយ ARV ថ្មី (Number of newly initiated ART)',
  '5.1.1. New ART started: Same day': '5.1.1. ក្នុងថ្ងៃតែមួយ (Same day – 0 day)',
  '5.1.2. New ART started: 1-7 days': '5.1.2. ពី ១ ទៅ ៧ ថ្ងៃ (1–7 days)',
  '5.1.3. New ART started: >7 days': '5.1.3. ច្រើនជាង ៧ ថ្ងៃ (>7 days)',
  '5.2. New ART started with TLD': '5.2. ចំនួនអ្នកជំងឺចាប់ផ្តើមព្យាបាលថ្មីដោយ TDF+3TC+DTG (Number of new ART started with TLD)',
  '5.3. New ART patients who are pregnant': '5.3. ចំនួនអ្នកជំងឺ ART ថ្មីដែលមានផ្ទៃពោះ (Number of new ART patients who are pregnant)',
  '6. Transfer-in patients': '6. ចំនួនអ្នកជំងឺដែលបានបញ្ជូនចូល (Number of transfer-in patients)',
  '7. Lost and Return': '7. ចំនួនអ្នកជំងឺដែលបានបោះបង់ហើយត្រឡប់មកវិញ (Number of Lost-Return patients)',
  '8. Number of patients started TPT in this quarter': '8. ចំនួនអ្នកជំងឺចាប់ផ្តើម TPT ក្នុងត្រីមាសនេះ (Number of patients started TPT in this quarter)',
  '9. Number of patients who left the service': '9. ចំនួនអ្នកជំងឺដែលបានចាកចេញពីសេវា (Number of patients who left the service)',
  '9.1. Dead': '9.1. ចំនួនអ្នកជំងឺដែលបានស្លាប់ (Dead)',
  '9.2. Lost to follow up (LTFU)': '9.2. ចំនួនអ្នកជំងឺដែលបានបោះបង់ (Lost to follow up – LTFU)',
  '9.3. Transferred-out': '9.3. ចំនួនអ្នកជំងឺដែលបានបញ្ជូនចេញ (Transfer-out)',
  '9.3. Transfer-out': '9.3. ចំនួនអ្នកជំងឺដែលបានបញ្ជូនចេញ (Transfer-out)',
  '10. Active Pre-ART patients at end of this quarter': '10. ចំនួនអ្នកជំងឺ Pre-ART សកម្មដល់ចុងត្រីមាសនេះ (Active Pre-ART patients at end of this quarter)',
  '10. Active ART patients in this quarter': '10. ចំនួនអ្នកជំងឺ ART សកម្មដល់ចុងត្រីមាសនេះ (Number of active ART patients in this quarter)',
  '10.1. Eligible MMD': '10.1. ចំនួនអ្នកជំងឺដែលសមស្របសម្រាប់ការផ្តល់ថ្នាំរយៈពេលវែង (Eligible for Multi Month Dispensing – MMD)',
  '10.2. MMD': '10.2. ចំនួនអ្នកជំងឺកំពុងទទួលថ្នាំរយៈពេលវែង (Number of patients received MMD)',
  '10.3. TLD': '10.3. ចំនួនអ្នកជំងឺកំពុងទទួលការព្យាបាលដោយ TLD (Number of patients received TLD)',
  '10.4. TPT Start': '10.4. ចំនួនអ្នកជំងឺដែលបានចាប់ផ្តើមការបង្ការជំងឺរបេង (Number of patients started TPT)',
  '10.5. TPT Complete': '10.5. ចំនួនអ្នកជំងឺដែលបានបញ្ចប់ការបង្ការជំងឺរបេង (Number of patients completed TPT)',
  '10.5.1. Started ART > 6 months': '10.5.1. ចាប់ផ្តើម ART > ៦ ខែ (Started ART > 6 months)',
  '10.6. Eligible for VL test': '10.6. ចំនួនអ្នកជំងឺដែលសមស្របធ្វើតេស្ត Viral Load (Eligible for Viral Load test)',
  '10.7. VL tested in 12M': '10.7. ចំនួនអ្នកជំងឺធ្វើតេស្ត Viral Load ក្នុងរយៈពេល ១២ ខែចុងក្រោយ (Receive VL test in last 12 months)',
  '10.8. VL suppression': '10.8. ចំនួនអ្នកជំងឺដែលមានលទ្ធផល VL ចុងក្រោយតិចជាង 1000 copies (Last VL is suppressed)',
  '11. Active ART patients at end of this quarter': '11. ចំនួនអ្នកជំងឺ ART សកម្មដល់ចុងត្រីមាសនេះ (Number of active ART patients at end of this quarter)',
  '11.1. Eligible MMD': '11.1. ចំនួនអ្នកជំងឺដែលសមស្របសម្រាប់ការផ្តល់ថ្នាំរយៈពេលវែង (Eligible for Multi Month Dispensing – MMD)',
  '11.2. MMD': '11.2. ចំនួនអ្នកជំងឺកំពុងទទួលថ្នាំរយៈពេលវែង (Number of patients received MMD)',
  '11.3. TLD': '11.3. ចំនួនអ្នកជំងឺកំពុងទទួលការព្យាបាលដោយ TLD (Number of patients received TLD)',
  '11.4. TPT Start': '11.4. ចំនួនអ្នកជំងឺដែលបានចាប់ផ្តើមការបង្ការជំងឺរបេង (Number of patients started TPT)',
  '11.5. TPT Complete': '11.5. ចំនួនអ្នកជំងឺដែលបានបញ្ចប់ការបង្ការជំងឺរបេង (Number of patients completed TPT)',
  '11.5.1. Started ART > 6 months': '11.5.1. ចាប់ផ្តើម ART > ៦ ខែ (Started ART > 6 months)',
  '(old) 11.4. TPT Start': '(old) 11.4. ចំនួនអ្នកជំងឺដែលបានចាប់ផ្តើមការបង្ការជំងឺរបេង — វិធីចាស់ (Number of patients started TPT — legacy logic)',
  '(old) 11.5. TPT Complete': '(old) 11.5. ចំនួនអ្នកជំងឺដែលបានបញ្ចប់ការបង្ការជំងឺរបេង — វិធីចាស់ (Number of patients completed TPT — legacy logic)',
  '11.6. Eligible for VL test': '11.6. ចំនួនអ្នកជំងឺដែលសមស្របធ្វើតេស្ត Viral Load (Eligible for Viral Load test)',
  '11.7. VL tested in 12M': '11.7. ចំនួនអ្នកជំងឺធ្វើតេស្ត Viral Load ក្នុងរយៈពេល ១២ ខែចុងក្រោយ (Receive VL test in last 12 months)',
  '11.8. VL suppression': '11.8. ចំនួនអ្នកជំងឺដែលមានលទ្ធផល VL ចុងក្រោយតិចជាង 1000 copies (Last VL is suppressed)',
  '11.9. Eligible for EAC (VL 40+)': '11.9. ចំនួនអ្នកជំងឺសមស្របប្រឹក្សាប្រកប (VL 40-999 ឬ ≥1000) (Eligible for EAC)',
  '11.10. EAC session 1 (EAC1)': '11.10. ចំនួនអ្នកជំងឺទទួល EAC លើកទី១ (EAC session 1)',
  '11.11. EAC session 2 (EAC2)': '11.11. ចំនួនអ្នកជំងឺទទួល EAC លើកទី២ (EAC session 2)',
  '11.12. EAC session 3 (EAC3)': '11.12. ចំនួនអ្នកជំងឺទទួល EAC លើកទី៣ (EAC session 3)',
  '11.13. VL follow-up within 6 months after EAC': '11.13. ចំនួនអ្នកជំងឺធ្វើតេស្ត VL តាមដានក្នុង ៦ ខែបន្ទាប់ពី EAC (Follow-up VL within 6 months after EAC)',
  '11.14. VL follow-up 6+ months after high VL': '11.14. ចំនួនអ្នកជំងឺធ្វើតេស្ត VL តាមដាន ≥៦ ខែបន្ទាប់ពី VL ខ្ពស់ (Follow-up VL 6+ months after high VL)'
};

const formatIndicatorLabel = (name) => INDICATOR_LABEL_MAP[name] || name || '-';

const parseIndicatorParts = (label) => {
  const cleanLabel = String(label || '').replace(/^[^\d]+/, '');
  const match = cleanLabel.match(/^(\d+(?:\.\d+)*)/);
  if (!match) return null;
  return match[1].split('.').map((part) => Number(part));
};

const compareIndicatorLabel = (a, b) => {
  const aLabel = a?.Indicator || '';
  const bLabel = b?.Indicator || '';
  const aParts = parseIndicatorParts(aLabel);
  const bParts = parseIndicatorParts(bLabel);

  if (!aParts && !bParts) return aLabel.localeCompare(bLabel);
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

  const aIsOld = aLabel.startsWith('(old)');
  const bIsOld = bLabel.startsWith('(old)');
  if (aIsOld !== bIsOld) {
    return aIsOld ? 1 : -1;
  }

  return aLabel.localeCompare(bLabel);
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
  Status: 'Status',
  Tptdrugname: 'TPT Drug',
  dateStart: 'TPT Start Date',
  Datestop: 'TPT Stop Date',
  duration: 'TPT Duration (months)',
  tpt_source: 'TPT Source',
  tptstatus: 'TPT Status',
  step: 'Indicator',
  MMDStatus: 'MMD Status',
  TLDStatus: 'TLD Status',
  TypeofReturn: 'Return Type'
};

const toDetailColumnLabel = (key) => DETAIL_COLUMN_LABELS[key] || key;

/** Matches province picker synthetic codes (e.g. 0100) in ReportFilters. */
const PROVINCE_NAME_BY_PREFIX = {
  '01': 'Banteay Meanchey',
  '02': 'Battambang',
  '03': 'Kampong Cham',
  '04': 'Kampong Chhnang',
  '05': 'Kampong Speu',
  '06': 'Kampong Thom',
  '07': 'Kampot',
  '08': 'Kandal',
  '09': 'Koh Kong',
  '10': 'Kratie',
  '11': 'Mondulkiri',
  '12': 'Phnom Penh',
  '13': 'Preah Vihear',
  '14': 'Prey Veng',
  '15': 'Pursat',
  '16': 'Ratanakiri',
  '17': 'Siem Reap',
  '18': 'Preah Sihanouk',
  '19': 'Stung Treng',
  '20': 'Svay Rieng',
  '21': 'Takeo',
  '22': 'Oddar Meanchey',
  '23': 'Kep',
  '24': 'Pailin',
  '25': 'Tbong Khmum'
};

const provinceIdFromSelection = (value) => {
  const raw = String(value || '').trim();
  return raw.startsWith('province:') ? raw.slice('province:'.length).trim() : '';
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
  const { user } = useAuth();
  const { sites: registrySites } = useSites();
  const now = new Date();
  const [sites, setSites] = useState([]);
  const [siteCode, setSiteCode] = useState('');
  const [reportType, setReportType] = useState('adult-child');
  const [selectedPeriodKey, setSelectedPeriodKey] = useState(() => {
    const q = listRecentQuarters(1)[0];
    return q ? q.key : `${new Date().getFullYear()}-Q1`;
  });
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [runTimeMs, setRunTimeMs] = useState(null);
  const [progress, setProgress] = useState({ completed: 0, total: 0 });
  const [dataSource, setDataSource] = useState(null);
  const [useAnalyticsSetting, setUseAnalyticsSetting] = useState(() => localStorage.getItem('app-use-analytics') === 'true');

  useEffect(() => {
    const handleSettingChange = () => {
      setUseAnalyticsSetting(localStorage.getItem('app-use-analytics') === 'true');
    };
    window.addEventListener('app-use-analytics-changed', handleSettingChange);
    return () => window.removeEventListener('app-use-analytics-changed', handleSettingChange);
  }, []);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailTitle, setDetailTitle] = useState('');
  const [detailRows, setDetailRows] = useState([]);
  const [detailError, setDetailError] = useState('');
  const [detailPage, setDetailPage] = useState(1);
  const [detailLimit] = useState(25);
  const [detailTotal, setDetailTotal] = useState(0);
  const [detailCountFootnote, setDetailCountFootnote] = useState('');
  const [detailTotalPages, setDetailTotalPages] = useState(1);
  const [detailFilter, setDetailFilter] = useState(null);
  const [showColumnConfig, setShowColumnConfig] = useState(false);
  const [selectedDetailColumns, setSelectedDetailColumns] = useState([]);
  const [detailColumnSearch, setDetailColumnSearch] = useState('');
  const [detailRowSearch, setDetailRowSearch] = useState('');
  const detailRowSearchRef = useRef('');
  const [dragColumnKey, setDragColumnKey] = useState('');
  const [detailSortKey, setDetailSortKey] = useState('');
  const [detailSortDirection, setDetailSortDirection] = useState('asc');
  const [detailExporting, setDetailExporting] = useState(false);
  const [detailMinAge, setDetailMinAge] = useState('');
  const [detailMaxAge, setDetailMaxAge] = useState('');
  const detailMinAgeRef = useRef('');
  const detailMaxAgeRef = useRef('');

  useEffect(() => {
    const scoped = filterSitesByUserScope(registrySites || [], user);
    setSites(scoped);
    const defaultCode = pickDefaultSiteCode(scoped);
    if (defaultCode) setSiteCode(defaultCode);
  }, [registrySites, user]);

  const canRun = useMemo(() => Boolean(siteCode), [siteCode]);
  const selectedSite = useMemo(() => sites.find((s) => String(s.code) === String(siteCode)), [siteCode, sites]);
  const effectiveSiteCode = useMemo(() => (siteCode === '__CAMBODIA__' ? 'all' : siteCode), [siteCode]);
  const selectedSiteLevel = useMemo(() => {
    if (siteCode === '__CAMBODIA__') return 'country';
    if (provinceIdFromSelection(siteCode)) return 'province';
    const digits = String(siteCode || '').replace(/\D/g, '');
    const name = String(selectedSite?.name || '').toLowerCase();
    if (name.includes('cambodia') && digits.length < 4) return 'country';
    if (digits.length <= 2) return 'province';
    if (digits.length >= 4 && digits.endsWith('00')) return 'province';
    return 'facility';
  }, [selectedSite, siteCode]);

  const reportHeaderMeta = useMemo(() => {
    const codeStr = siteCode != null && siteCode !== '' ? String(siteCode) : '';
    if (selectedSite) {
      const scopeLabel =
        selectedSiteLevel === 'country' ? 'Country' : selectedSiteLevel === 'province' ? 'Province' : 'Facility';
      const scopeValue = selectedSite.name || selectedSite.fullName || '-';
      const siteCodeValue = selectedSite.code != null ? String(selectedSite.code) : codeStr || '-';
      return { scopeLabel: `${scopeLabel}:`, scopeValue, siteCodeValue };
    }
    if (siteCode === '__CAMBODIA__') {
      return { scopeLabel: 'Country:', scopeValue: 'Cambodia', siteCodeValue: 'all' };
    }
    if (selectedSiteLevel === 'province' && codeStr) {
      const selectedProvinceId = provinceIdFromSelection(codeStr);
      if (selectedProvinceId) {
        const provinceSite = sites.find((site) => String(site?.province_id ?? '') === selectedProvinceId && String(site?.province || '').trim());
        const scopeValue = provinceSite?.province || `Province ${selectedProvinceId}`;
        return { scopeLabel: 'Province:', scopeValue, siteCodeValue: selectedProvinceId };
      }
      const digits = codeStr.replace(/\D/g, '');
      const prefix = digits.length >= 2 ? digits.slice(0, 2) : '';
      const scopeValue = PROVINCE_NAME_BY_PREFIX[prefix] || (prefix ? `Province ${prefix}` : '-');
      return { scopeLabel: 'Province:', scopeValue, siteCodeValue: codeStr };
    }
    return {
      scopeLabel: 'Facility:',
      scopeValue: '-',
      siteCodeValue: codeStr || '-'
    };
  }, [selectedSite, selectedSiteLevel, siteCode, sites]);

  const siteCodeSet = useMemo(() => new Set(sites.map((s) => String(s.code))), [sites]);
  const facilitySites = useMemo(() => sites.filter(isFacilitySite), [sites]);
  const getAggregateFacilityCodes = (rawSiteCode) => {
    const value = String(rawSiteCode || '').trim();
    const digits = value.replace(/\D/g, '');
    const selectedProvinceId = provinceIdFromSelection(value);
    if (!value) return [];
    if (value === '__CAMBODIA__') return facilitySites.map((s) => String(s.code));
    if (selectedProvinceId) {
      return facilitySites
        .filter((site) => String(site?.province_id ?? '').trim() === selectedProvinceId)
        .map((site) => String(site.code));
    }

    const matchedSite = sites.find((s) => String(s.code) === value);
    if (matchedSite && isFacilitySite(matchedSite)) return [value];

    if (matchedSite && String(matchedSite.name || '').toLowerCase().includes('cambodia') && digits.length < 4) {
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
    if (provinceIdFromSelection(value)) return [value];
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
  const currentPeriod = useMemo(() => {
    const p = getPeriodByKey(selectedPeriodKey);
    if (!p) {
      return {
        startDate: '2026-01-01',
        endDate: '2026-03-31',
        previousEndDate: '2025-12-31',
        kind: 'quarter',
        year: 2026,
        quarter: 1,
        periodLabel: '2026-Q1'
      };
    }
    return {
      ...p,
      periodLabel: p.key
    };
  }, [selectedPeriodKey]);
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
  /** Detail modal: plain numbers (no thousands separators or accounting parentheses). */
  const formatDetailCellValue = (v) => {
    if (v == null || v === '') return '-';
    if (typeof v === 'number') return Number.isFinite(v) ? String(v) : '-';
    const raw = String(v).trim();
    if (raw === '') return '-';
    let normalized = raw;
    const paren = /^\s*\(\s*([^)]+)\s*\)\s*$/.exec(raw);
    if (paren) normalized = `-${paren[1].replace(/,/g, '')}`;
    else normalized = raw.replace(/,/g, '');
    const n = Number(normalized);
    if (Number.isFinite(n) && normalized !== '' && normalized !== '-') return String(n);
    return raw;
  };
  const getSex = (record) => {
    const sex = record?.sex_display || record?.sex || record?.Sex;
    if (sex === 1 || String(sex).toLowerCase() === 'male' || String(sex).toLowerCase() === 'm') return 'male';
    if (sex === 0 || String(sex).toLowerCase() === 'female' || String(sex).toLowerCase() === 'f') return 'female';
    return 'unknown';
  };

  /** PNTT aggregates count partner Sex, child Sex, or index patient Sex depending on script; detail SQL uses different column names. */
  const getPnttDetailCountSex = (record, section) => {
    const sid = String(section?.scriptId || '');
    const rawFrom = (displayKeys, codeKeys) => {
      for (const k of displayKeys) {
        const v = recordFieldCaseInsensitive(record, k);
        if (v !== undefined && v !== null && v !== '') return v;
      }
      for (const k of codeKeys) {
        const v = recordFieldCaseInsensitive(record, k);
        if (v !== undefined && v !== null && v !== '') return v;
      }
      return undefined;
    };
    let raw;
    // Filenames use OLD_CHILD_REG / OLD_PART_REG (no "CHILD_" / "PART_" substring); match stable PNTT_* tokens.
    const isChildScript =
      sid.includes('PNTT_OLD_CHILD') ||
      sid.includes('PNTT_NEW_CHILD') ||
      sid.includes('_CHILD_') ||
      sid.includes('CHILD_');
    const isPartScript =
      sid.includes('PNTT_OLD_PART') ||
      sid.includes('PNTT_NEW_PART') ||
      sid.includes('_PART_') ||
      sid.includes('PART_');
    if (isChildScript) {
      raw = rawFrom(['child_sex_display'], ['child_sex']);
    } else if (isPartScript) {
      raw = rawFrom(['partner_sex_display'], ['partner_sex']);
    } else {
      raw = rawFrom(
        ['sex_display', 'index_sex_display', 'caregiver_sex_display'],
        ['sex', 'Sex', 'index_sex', 'caregiver_sex']
      );
    }
    if (raw === undefined) return 'unknown';
    if (raw === 1 || String(raw).toLowerCase() === 'male' || String(raw).toLowerCase() === 'm') return 'male';
    if (raw === 0 || String(raw).toLowerCase() === 'female' || String(raw).toLowerCase() === 'f') return 'female';
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
    '5.3. New ART patients who are pregnant': '05.3_art_pregnant',
    '6. Transfer-in patients': '06_transfer_in',
    '7. Lost and Return': '07_lost_and_return',
    '8. Number of patients started TPT in this quarter': '08_tpt_new_start',
    '9. Number of patients who left the service': '09.1_dead',
    '9.1. Dead': '09.1_dead',
    '9.2. Lost to follow up (LTFU)': '09.2_lost_to_followup',
    '9.3. Transferred-out': '09.3_transfer_out',
    '9.3. Transfer-out': '09.3_transfer_out',
    '10. Active Pre-ART patients at end of this quarter': '10_active_pre_art',
    '10.1. Eligible MMD': '11.1_eligible_mmd',
    '10.2. MMD': '11.2_mmd',
    '10.3. TLD': '11.3_tld',
    '10.4. TPT Start': '11.4_tpt_start',
    '10.5. TPT Complete': '11.5_tpt_complete',
    '10.5.1. Started ART > 6 months': '11.5.1_started_art_over_6m',
    '10.6. Eligible for VL test': '11.6_eligible_vl_test',
    '10.7. VL tested in 12M': '11.7_vl_tested_12m',
    '10.8. VL suppression': '11.8_vl_suppression',
    '11. Active ART patients at end of this quarter': '11_active_art_current',
    '11.1. Eligible MMD': '11.1_eligible_mmd',
    '11.2. MMD': '11.2_mmd',
    '11.3. TLD': '11.3_tld',
    '11.4. TPT Start': '11.4_tpt_start',
    '11.5. TPT Complete': '11.5_tpt_complete',
    '(old) 11.4. TPT Start': '11.4_tpt_start_old',
    '(old) 11.5. TPT Complete': '11.5_tpt_complete_old',
    '11.5.1. Started ART > 6 months': '11.5.1_started_art_over_6m',
    '11.6. Eligible for VL test': '11.6_eligible_vl_test',
    '11.7. VL tested in 12M': '11.7_vl_tested_12m',
    '11.8. VL suppression': '11.8_vl_suppression',
    '11.9. Eligible for EAC (VL 40+)': '11.9_eligible_eac_high_vl',
    '11.9. Eligible for EAC (VL >=1000)': '11.9_eligible_eac_high_vl',
    '11.10. EAC session 1 (EAC1)': '11.10_eac_session_1',
    '11.11. EAC session 2 (EAC2)': '11.11_eac_session_2',
    '11.12. EAC session 3 (EAC3)': '11.12_eac_session_3',
    '11.13. VL follow-up within 6 months after EAC': '11.13_vl_followup_6m_after_eac',
    '11.14. VL follow-up 6+ months after high VL': '11.14_vl_followup_6m_apart_high_vl'
  };
  const getDetailScriptId = (section, rowIdx = 0) => {
    if (!section) return null;
    if (Array.isArray(section.detailScriptIds) && section.detailScriptIds[rowIdx]) return section.detailScriptIds[rowIdx];
    return section.detailScriptId || section.scriptId || null;
  };

  const hasRows = previewRows.length > 0;
  const adultChildRows = useMemo(() => {
    if (!isAdultChild) return [];
    // Deduplicate rows by indicator number prefix before display.
    // Prefer rows with full-text indicator (no underscores) and higher totals.
    const getIndKey = (row) => {
      const ind = String(row?.Indicator || '');
      const numKey = ind.match(/^([\d.]+)/)?.[1];
      return numKey ?? ind.toLowerCase().replace(/\s+/g, '_');
    };
    const deduped = new Map();
    for (const row of previewRows) {
      const key = getIndKey(row);
      const existing = deduped.get(key);
      const ind = String(row?.Indicator || '');
      const indHasUnderscore = /^[a-z0-9]+_/.test(ind); // script-ID format
      const rowTotal = Number(row?.TOTAL || 0) + Number(row?.Male_0_14 || 0) + Number(row?.Female_0_14 || 0) + Number(row?.Male_over_14 || 0) + Number(row?.Female_over_14 || 0);
      const existTotal = existing ? (Number(existing?.TOTAL || 0) + Number(existing?.Male_0_14 || 0) + Number(existing?.Female_0_14 || 0) + Number(existing?.Male_over_14 || 0) + Number(existing?.Female_over_14 || 0)) : -1;
      if (!existing || (!indHasUnderscore && rowTotal >= existTotal)) {
        deduped.set(key, row);
      }
    }
    const sortedRows = Array.from(deduped.values()).sort(compareIndicatorLabel);
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

  const resolveIndicatorScriptId = (rawIndicator) => {
    const raw = String(rawIndicator || '').trim();
    if (indicatorApiMap[raw]) return indicatorApiMap[raw];
    const entry = Object.entries(indicatorApiMap).find(([label]) => raw.startsWith(label) || label.startsWith(raw));
    if (entry) return entry[1];
    const num = raw.match(/^(\d+(?:\.\d+)*)/)?.[1];
    if (num) {
      const byNum = Object.entries(indicatorApiMap).find(([label]) => label.startsWith(`${num}.`));
      if (byNum) return byNum[1];
    }
    return raw.replace(/\s+/g, '_').toLowerCase();
  };

  const normalizeDetailRecord = (record) => ({
    ...record,
    sex_display:
      record?.sex_display ||
      (getSex(record) === 'male' ? 'Male' : getSex(record) === 'female' ? 'Female' : 'Unknown'),
    age: getAge(record)
  });

  const buildDetailRequestParams = (filter, page, limit, searchText, minAgeVal = detailMinAge, maxAgeVal = detailMaxAge) => {
    const params = {
      siteCode: effectiveSiteCode,
      siteLevel: selectedSiteLevel,
      ...currentPeriod,
      page,
      limit
    };
    const q = String(searchText || '').trim();
    if (q) params.search = q;
    if (filter?.gender === 'male' || filter?.gender === 'female') params.gender = filter.gender;
    if (filter?.ageGroup === 'younger') params.ageGroup = '0-14';
    if (filter?.ageGroup === 'older') params.ageGroup = '>14';

    const minA = String(minAgeVal || '').trim();
    const maxA = String(maxAgeVal || '').trim();
    if (minA) params.minAge = minA;
    if (maxA) params.maxAge = maxA;

    return params;
  };

  const fetchAllDetailRecords = async (filter, searchText = '', minAgeVal = detailMinAge, maxAgeVal = detailMaxAge) => {
    const indicatorKey = resolveIndicatorScriptId(filter.rawIndicator);
    const all = [];
    let page = 1;
    let totalPages = 1;
    do {
      const params = buildDetailRequestParams(filter, page, DETAIL_EXPORT_PAGE_SIZE, searchText, minAgeVal, maxAgeVal);
      const response = await reportingApi.getIndicatorDetails(indicatorKey, params);
      const list = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : [];
      all.push(...list.map(normalizeDetailRecord));
      totalPages = Number(response?.pagination?.totalPages ?? 1);
      page += 1;
    } while (page <= totalPages && all.length < DETAIL_EXPORT_MAX);
    return all;
  };

  const sortDetailRowsForExport = (rows) => {
    if (!detailSortKey) return rows;
    const rowsCopy = [...rows];
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
  };

  const handleExportAllDetails = async () => {
    if (!detailColumns.length) {
      toast.error('No columns selected for export.');
      return;
    }
    const exportCount = detailFilter ? detailTotal : sortedDetailRows.length;
    if (!exportCount) {
      toast.error('No records to export.');
      return;
    }
    setDetailExporting(true);
    try {
      let rows;
      if (detailFilter) {
        rows = await fetchAllDetailRecords(detailFilter, detailRowSearch);
        if (detailTotal > DETAIL_EXPORT_MAX) {
          toast.warning(`Exported first ${DETAIL_EXPORT_MAX.toLocaleString()} of ${detailTotal.toLocaleString()} records.`);
        }
      } else {
        rows = sortDetailRowsForExport(filteredDetailRows);
      }
      rows = sortDetailRowsForExport(rows);
      const csv = rowsToCsv(detailColumns, rows, {
        labelForKey: toDetailColumnLabel,
        formatValue: formatDetailCellValue
      });
      downloadCsv(safeExportFilename(detailTitle), csv);
      toast.success(`Exported ${rows.length.toLocaleString()} record(s)`);
    } catch (e) {
      toast.error(e?.response?.data?.error || e?.message || 'Export failed');
    } finally {
      setDetailExporting(false);
    }
  };

  const fetchDetailPage = async (filter, page = 1, searchText = detailRowSearch, minAgeVal = detailMinAge, maxAgeVal = detailMaxAge) => {
    if (!effectiveSiteCode || !filter?.rawIndicator) return;
    const indicatorKey = resolveIndicatorScriptId(filter.rawIndicator);
    setDetailLoading(true);
    setDetailError('');
    setDetailCountFootnote('');
    try {
      const params = buildDetailRequestParams(filter, page, detailLimit, searchText, minAgeVal, maxAgeVal);
      const response = await reportingApi.getIndicatorDetails(indicatorKey, params);
      const list = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : [];
      const normalized = list.map(normalizeDetailRecord);
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
    setDetailRowSearch('');
    detailRowSearchRef.current = '';
    setDetailMinAge('');
    detailMinAgeRef.current = '';
    setDetailMaxAge('');
    detailMaxAgeRef.current = '';
    setDetailCountFootnote('');
    setDetailTitle(`${item.indicator} - ${ageGroup}/${gender}`);
    setDetailOpen(true);
    setDetailRows([]);
    setDetailTotal(0);
    setDetailTotalPages(1);
    setDetailPage(1);
    await fetchDetailPage(filter, 1, '', '', '');
  };
  const handleInfantCellClick = async (section, row, rowIdx, column) => {
    const scriptId = getDetailScriptId(section, rowIdx);
    if (!effectiveSiteCode || !scriptId) return;
    setDetailFilter(null);
    setDetailRowSearch('');
    detailRowSearchRef.current = '';
    setDetailTitle(`${section?.sectionNumber || ''}. ${section?.sectionLabelKh || section?.sectionLabelEn || 'Infant Detail'}`);
    setDetailOpen(true);
    setDetailLoading(true);
    setDetailRows([]);
    setDetailError('');
    setDetailCountFootnote('');
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
      const fromAgg = detailCountFromAggregateRow(row, column);
      const loaded = filtered.length;
      setDetailRows(filtered);
      setDetailTotal(fromAgg != null ? fromAgg : loaded);
      setDetailCountFootnote(fromAgg != null && loaded !== fromAgg ? `${loaded} row(s) in list` : '');
    } catch (e) {
      setDetailError(e?.response?.data?.error || e?.message || 'Failed to load infant details');
    } finally {
      setDetailLoading(false);
    }
  };
  const handlePnttCellClick = async (section, row, rowIdx, column) => {
    const scriptId = getDetailScriptId(section, rowIdx);
    if (!effectiveSiteCode || !scriptId) return;
    setDetailFilter(null);
    setDetailRowSearch('');
    detailRowSearchRef.current = '';
    setDetailTitle(`${section?.sectionNumber || ''}. ${section?.sectionLabelKh || section?.sectionLabelEn || 'PNTT Detail'}`);
    setDetailOpen(true);
    setDetailLoading(true);
    setDetailRows([]);
    setDetailError('');
    setDetailCountFootnote('');
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
        if (column === 'ever' || column === 'sixMonths' || column === 'never') {
          const field = PNTT_RISK_DETAIL_FIELDS[rowIdx];
          if (field == null) return false;
          const bucket = column === 'ever' ? 0 : column === 'sixMonths' ? 1 : 2;
          const raw = recordFieldCaseInsensitive(record, field);
          if (raw === undefined || raw === null || raw === '') return false;
          const n = Number(raw);
          return Number.isFinite(n) && n === bucket;
        }
        const sex = getPnttDetailCountSex(record, section);
        if (column === 'male') return sex === 'male';
        if (column === 'female') return sex === 'female';
        // Total headline uses male + female; list must match (exclude unknown / missing sex rows).
        if (column === 'total') {
          const m = Number(row?.male);
          const f = Number(row?.female);
          if (Number.isFinite(m) && Number.isFinite(f)) return sex === 'male' || sex === 'female';
        }
        return true;
      });
      const withDisplay = filtered.map((r) => {
        const grp = getPnttDetailCountSex(r, section);
        return {
          ...r,
          sex_display:
            recordFieldCaseInsensitive(r, 'sex_display') ??
            recordFieldCaseInsensitive(r, 'partner_sex_display') ??
            recordFieldCaseInsensitive(r, 'child_sex_display') ??
            recordFieldCaseInsensitive(r, 'index_sex_display') ??
            recordFieldCaseInsensitive(r, 'caregiver_sex_display') ??
            (grp === 'male' ? 'Male' : grp === 'female' ? 'Female' : 'Unknown')
        };
      });
      const fromAgg = detailCountFromAggregateRow(row, column);
      const loaded = withDisplay.length;
      setDetailRows(withDisplay);
      setDetailTotal(fromAgg != null ? fromAgg : loaded);
      setDetailCountFootnote(fromAgg != null && loaded !== fromAgg ? `${loaded} row(s) in list` : '');
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
  const filteredDetailRows = useMemo(() => {
    const q = detailRowSearch.trim().toLowerCase();
    if (!q || detailFilter) return detailRows;
    return detailRows.filter((row) =>
      Object.values(row || {}).some((v) => String(v ?? '').toLowerCase().includes(q))
    );
  }, [detailRows, detailRowSearch, detailFilter]);

  useEffect(() => {
    if (!detailOpen || !detailFilter) return;
    if (
      detailRowSearch === detailRowSearchRef.current &&
      detailMinAge === detailMinAgeRef.current &&
      detailMaxAge === detailMaxAgeRef.current
    ) return;

    detailRowSearchRef.current = detailRowSearch;
    detailMinAgeRef.current = detailMinAge;
    detailMaxAgeRef.current = detailMaxAge;

    const timer = setTimeout(() => {
      fetchDetailPage(detailFilter, 1, detailRowSearch, detailMinAge, detailMaxAge);
    }, 400);
    return () => clearTimeout(timer);
  }, [detailRowSearch, detailMinAge, detailMaxAge, detailOpen, detailFilter]);

  const sortedDetailRows = useMemo(() => {
    if (!detailSortKey) return filteredDetailRows;
    const rowsCopy = [...filteredDetailRows];
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
  }, [filteredDetailRows, detailSortDirection, detailSortKey]);

  const detailListCount = detailFilter ? detailTotal : sortedDetailRows.length;
  const detailListFootnote =
    !detailFilter && detailRowSearch.trim() && filteredDetailRows.length !== detailRows.length
      ? `Showing ${filteredDetailRows.length} of ${detailRows.length} loaded`
      : '';
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
    setDataSource(null);
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
          const existingRows = Array.isArray(existing.rows) ? existing.rows : [];
          const incomingRows = Array.isArray(section?.rows) ? section.rows : [];
          const rowCount = Math.max(existingRows.length, incomingRows.length);
          existing.rows = Array.from({ length: rowCount }, (_, idx) =>
            sumObjectNumericFields(existingRows[idx] || {}, incomingRows[idx] || {})
          );
        });
        return Array.from(sections.values());
      };

      const streamSectionedReport = async (streamFn, streamSiteCode, streamSiteLevel) => {
        const acc = [];
        await streamFn(
          { siteCode: streamSiteCode, siteLevel: streamSiteLevel, ...currentPeriod },
          {
            onMessage: (payload) => {
              if (payload.type === 'start') {
                setProgress({ completed: 0, total: Number(payload.total) || 0 });
              }
            },
            onSection: (payload) => {
              acc.push(payload.data);
              setRows([...acc]);
              setProgress({
                completed: Number(payload.completed) || 0,
                total: Number(payload.total) || 0
              });
            },
            onDone: (payload) => {
              const ms = Number(payload.durationMs);
              if (Number.isFinite(ms) && ms >= 0) setRunTimeMs(ms);
            }
          }
        );
        return acc.length;
      };

      const candidateSiteCodes = getCandidateSiteCodes(effectiveSiteCode);
      const aggregateFacilityCodes = getAggregateFacilityCodes(effectiveSiteCode);
      let success = false;
      if (reportType === 'adult-child') {
        // Try to load from pre-aggregated analytics warehouse first (if not daily and analytics toggle is enabled)
        if (currentPeriod.kind !== 'day' && useAnalyticsSetting) {
          try {
            const apiPeriod = {
              periodType: currentPeriod.kind === 'year' ? 'year' : currentPeriod.kind === 'quarter' ? 'quarter' : 'month',
              year: String(currentPeriod.year),
              quarter: String(currentPeriod.quarter || '1'),
              month: currentPeriod.kind === 'month' ? `${currentPeriod.year}-${String(currentPeriod.month).padStart(2, '0')}` : undefined
            };
            const status = await getAnalyticsStatus(apiPeriod);
            if (status && status.hasData) {
              let warehouseRows = [];
              if (selectedSiteLevel === 'country') {
                const res = await getCountryAnalytics(apiPeriod);
                if (res?.success) warehouseRows = res.data || [];
              } else if (selectedSiteLevel === 'province') {
                const res = await getProvinceAnalytics(apiPeriod);
                if (res?.success) {
                  warehouseRows = (res.data || []).filter(
                    (r) => String(r.province_id || r.provinceId || '') === String(effectiveSiteCode)
                  );
                }
              } else if (selectedSiteLevel === 'facility') {
                const res = await getAnalyticsSummary({ ...apiPeriod, siteCode: effectiveSiteCode });
                if (res?.success) warehouseRows = res.data || [];
              }

              if (warehouseRows.length > 0) {
                const normalizedWarehouseRows = warehouseRows.map((r) => ({
                  Indicator: r?.Indicator ?? r?.indicator ?? '',
                  Male_0_14: Number(r?.Male_0_14 ?? r?.male_0_14 ?? 0),
                  Female_0_14: Number(r?.Female_0_14 ?? r?.female_0_14 ?? 0),
                  Male_over_14: Number(r?.Male_over_14 ?? r?.male_over_14 ?? 0),
                  Female_over_14: Number(r?.Female_over_14 ?? r?.female_over_14 ?? 0),
                })).map((r) => ({
                  ...r,
                  // Compute TOTAL from 4 age/sex columns — warehouse has no TOTAL column
                  TOTAL: r.Male_0_14 + r.Female_0_14 + r.Male_over_14 + r.Female_over_14
                }));

                const injectIndicator9 = (items) => {
                  if (!Array.isArray(items)) return items;
                  const alreadyHas = items.some((r) => String(r?.Indicator || '').startsWith('9. Number of patients who left'));
                  if (alreadyHas) return items;
                  
                  const numericFields = ['TOTAL', 'Male_0_14', 'Female_0_14', 'Male_over_14', 'Female_over_14'];
                  const row = { Indicator: '9. Number of patients who left the service' };
                  numericFields.forEach((f) => { row[f] = 0; });
                  
                  let found = false;
                  items.forEach((r) => {
                    const ind = String(r?.Indicator || '');
                    const isDead = ind.startsWith('9.1') || ind.startsWith('8.2') || /dead/i.test(ind);
                    const isLtfu = ind.startsWith('9.2') || ind.startsWith('8.3') || /LTFU|lost to follow/i.test(ind);
                    const isTo = ind.startsWith('9.3') || ind.startsWith('8.4') || /transfer.?out/i.test(ind);
                    if (isDead || isLtfu || isTo) {
                      found = true;
                      numericFields.forEach((f) => {
                        row[f] = (row[f] || 0) + (Number(r[f]) || 0);
                      });
                    }
                  });
                  return found ? [...items, row] : items;
                };

                // Deduplicate by indicator number prefix (e.g. "1.", "11.") — keep row with highest total
                const dedupeByIndicator = (items) => {
                  const seen = new Map();
                  for (const row of items) {
                    const ind = String(row?.Indicator || '');
                    // Extract leading indicator number like "1.", "11.2."
                    const numKey = ind.match(/^([\d.]+)/)?.[1] ?? ind.toLowerCase().replace(/\s+/g, '_');
                    const existing = seen.get(numKey);
                    const rowTotal = (row.TOTAL || 0) + (row.Male_0_14 || 0) + (row.Female_0_14 || 0) + (row.Male_over_14 || 0) + (row.Female_over_14 || 0);
                    const existTotal = existing ? ((existing.TOTAL || 0) + (existing.Male_0_14 || 0) + (existing.Female_0_14 || 0) + (existing.Male_over_14 || 0) + (existing.Female_over_14 || 0)) : -1;
                    // Prefer warehouse full-text indicator over raw script IDs (script IDs have underscores)
                    const indHasUnderscore = /^[a-z0-9]+_/.test(ind);
                    if (!existing || (!indHasUnderscore && rowTotal >= existTotal)) {
                      seen.set(numKey, row);
                    }
                  }
                  return Array.from(seen.values());
                };
                const finalRows = injectIndicator9(dedupeByIndicator(normalizedWarehouseRows));
                setRows(finalRows);
                setRunTimeMs(Math.round(performance.now() - startedAt));
                setProgress({ completed: finalRows.length, total: finalRows.length });
                toast.success('⚡ បានទាញយកពីឃ្លាំងទិន្នន័យ (Loaded from Warehouse)');
                setDataSource('warehouse');
                success = true;
              }
            }
          } catch (err) {
            console.warn('[Report] Failed to check/fetch warehouse data, falling back to live queries:', err);
          }
        }

        if (selectedSiteLevel === 'country' && !success) {
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
        if (selectedSiteLevel !== 'facility' && aggregateFacilityCodes.length > 0 && !success) {
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
        if (!success) for (const candidateSiteCode of candidateSiteCodes) {
          if (success) break;
          let attemptRowCount = 0;
          setRows([]);
          setProgress({ completed: 0, total: 0 });
          try {
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
          } catch (streamErr) {
            console.warn('[Report] Stream error for site', candidateSiteCode, streamErr?.message || streamErr);
            if (attemptRowCount === 0) {
              toast.error('Connection to clinical database was interrupted. Please try again.');
            }
          }
          if (attemptRowCount > 0) {
            success = true;
            break;
          }
        }
        setRunTimeMs((prev) => prev ?? Math.round(performance.now() - startedAt));
      } else if (reportType === 'infants') {
        if (selectedSiteLevel === 'country') {
          setRows([]);
          setProgress({ completed: 0, total: 0 });
          const n = await streamSectionedReport(infantReportApi.streamInfantReport, effectiveSiteCode, 'country');
          if (n > 0) success = true;
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
            if (selectedSiteLevel === 'facility') {
              setRows([]);
              setProgress({ completed: 0, total: 0 });
              const n = await streamSectionedReport(infantReportApi.streamInfantReport, candidateSiteCode, 'facility');
              if (n > 0) {
                success = true;
                break;
              }
            } else {
              const result = await infantReportApi.getInfantReport({
                siteCode: candidateSiteCode,
                siteLevel: selectedSiteLevel,
                ...currentPeriod
              });
              const nextRows = result.data || [];
              if (nextRows.length > 0) {
                setRows(nextRows);
                success = true;
                break;
              }
            }
          }
        }
        setRunTimeMs((prev) => prev ?? Math.round(performance.now() - startedAt));
      } else {
        if (selectedSiteLevel === 'country') {
          setRows([]);
          setProgress({ completed: 0, total: 0 });
          const n = await streamSectionedReport(pnttReportApi.streamPnttReport, effectiveSiteCode, 'country');
          if (n > 0) success = true;
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
            if (selectedSiteLevel === 'facility') {
              setRows([]);
              setProgress({ completed: 0, total: 0 });
              const n = await streamSectionedReport(pnttReportApi.streamPnttReport, candidateSiteCode, 'facility');
              if (n > 0) {
                success = true;
                break;
              }
            } else {
              const result = await pnttReportApi.getPnttReport({
                siteCode: candidateSiteCode,
                siteLevel: selectedSiteLevel,
                ...currentPeriod
              });
              const nextRows = result.data || [];
              if (nextRows.length > 0) {
                setRows(nextRows);
                success = true;
                break;
              }
            }
          }
        }
        setRunTimeMs((prev) => prev ?? Math.round(performance.now() - startedAt));
      }
      if (success) {
        if (!dataSource) {
          setDataSource('live');
        }
      } else {
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
    <>
      <ReportFilters
        sites={sites}
        siteCode={siteCode}
        setSiteCode={setSiteCode}
        reportType={reportType}
        setReportType={setReportType}
        selectedPeriodKey={selectedPeriodKey}
        setSelectedPeriodKey={setSelectedPeriodKey}
        canRun={canRun}
        loading={loading}
        runReport={runReport}
      />
      <Patient360Layout lockViewport className="flex flex-col h-full">
        <AppPageShell wide className="flex h-full min-h-0 min-w-0 w-full max-w-full flex-1 flex-col !p-0">
          <div className="flex flex-1 min-h-0 flex-col space-y-3 p-3 sm:p-4 md:p-5 h-full">
            <ReportResultsPanel
          reportHeaderMeta={reportHeaderMeta}
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
          dataSource={dataSource}
          useAnalyticsSetting={useAnalyticsSetting}
        />
        <AnimatePresence>
          {detailOpen && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-[2px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              onClick={() => {
                setDetailOpen(false);
                setDetailFilter(null);
                setDetailRowSearch('');
                detailRowSearchRef.current = '';
                setDetailMinAge('');
                detailMinAgeRef.current = '';
                setDetailMaxAge('');
                detailMaxAgeRef.current = '';
                setDetailCountFootnote('');
              }}
            >
            <motion.div
              className="flex max-h-[88vh] w-full max-w-6xl flex-col overflow-hidden bg-card shadow-2xl shadow-black/15 border border-border rounded-none"
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between border-b border-border/80 bg-muted/35 px-4 py-3">
                <div className="min-w-0">
                  <div className="truncate text-xs font-semibold text-foreground">{detailTitle}</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {detailFilter ? (
                      <>
                        {formatDetailCellValue(detailTotal)} records
                        {detailTotalPages > 1 ? ` (page ${detailPage} of ${detailTotalPages})` : ''}
                      </>
                    ) : (
                      <>
                        {formatDetailCellValue(detailTotal)} in report
                        {detailCountFootnote ? (
                          <span className="text-muted-foreground/90"> · {detailCountFootnote}</span>
                        ) : null}
                      </>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  className="ml-3 border border-border/80 bg-background px-2.5 py-1 text-xs font-medium shadow-sm hover:bg-muted rounded-none"
                  onClick={() => {
                    setDetailOpen(false);
                    setDetailFilter(null);
                    setDetailRowSearch('');
                    detailRowSearchRef.current = '';
                    setDetailMinAge('');
                    detailMinAgeRef.current = '';
                    setDetailMaxAge('');
                    detailMaxAgeRef.current = '';
                    setDetailCountFootnote('');
                  }}
                >
                  Close
                </button>
              </div>
              <div className="border-b border-border/80 px-4 py-2.5">
                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                  <div className="relative flex-1">
                    <RiSearchLine className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                    <input
                      value={detailRowSearch}
                      onChange={(e) => setDetailRowSearch(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && detailFilter) {
                          detailRowSearchRef.current = detailRowSearch;
                          fetchDetailPage(detailFilter, 1, detailRowSearch, detailMinAge, detailMaxAge);
                        }
                      }}
                      placeholder="Search records (clinic ID, ART, TPT drug, status, source...)"
                      className="h-8 w-full border border-border/80 bg-background pl-8 pr-2 text-xs shadow-sm rounded-none"
                    />
                  </div>
                  {detailFilter && (
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-muted-foreground whitespace-nowrap">Age range:</label>
                      <input
                        type="number"
                        min="0"
                        placeholder="Min"
                        value={detailMinAge}
                        onChange={(e) => setDetailMinAge(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            detailMinAgeRef.current = e.target.value;
                            fetchDetailPage(detailFilter, 1, detailRowSearch, e.target.value, detailMaxAge);
                          }
                        }}
                        className="h-8 w-16 border border-border/80 bg-background px-2 text-xs shadow-sm rounded-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <span className="text-xs text-muted-foreground">-</span>
                      <input
                        type="number"
                        min="0"
                        placeholder="Max"
                        value={detailMaxAge}
                        onChange={(e) => setDetailMaxAge(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            detailMaxAgeRef.current = e.target.value;
                            fetchDetailPage(detailFilter, 1, detailRowSearch, detailMinAge, e.target.value);
                          }
                        }}
                        className="h-8 w-16 border border-border/80 bg-background px-2 text-xs shadow-sm rounded-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      {(detailMinAge || detailMaxAge) && (
                        <button
                          type="button"
                          onClick={() => {
                            setDetailMinAge('');
                            detailMinAgeRef.current = '';
                            setDetailMaxAge('');
                            detailMaxAgeRef.current = '';
                            fetchDetailPage(detailFilter, 1, detailRowSearch, '', '');
                          }}
                          className="h-8 border border-border/80 bg-background px-2 text-[10px] text-muted-foreground shadow-sm hover:bg-muted rounded-none"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  )}
                </div>
                {detailListFootnote ? (
                  <div className="mt-1 text-[11px] text-muted-foreground">{detailListFootnote}</div>
                ) : null}
              </div>
              <div className="flex items-center justify-between gap-2 border-b border-border/80 px-4 py-2.5">
                <div className="text-xs text-muted-foreground">Column settings</div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="inline-flex h-7 items-center gap-1 border border-border/80 bg-background px-2.5 text-xs font-medium shadow-sm hover:bg-muted disabled:opacity-50 rounded-none"
                    disabled={detailLoading || detailExporting || detailListCount === 0}
                    onClick={handleExportAllDetails}
                    title="Download all matching records as CSV"
                  >
                    {detailExporting ? (
                      <span className="size-3.5 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground" />
                    ) : (
                      <RiDownloadLine className="size-3.5" aria-hidden />
                    )}
                    {detailExporting ? 'Exporting…' : 'Export all'}
                  </button>
                  <button
                    type="button"
                    className="inline-flex h-7 w-7 items-center justify-center border border-border/80 bg-background hover:bg-muted rounded-none"
                    onClick={() => setShowColumnConfig((v) => !v)}
                    title={showColumnConfig ? 'Hide column settings' : 'Show column settings'}
                    aria-label={showColumnConfig ? 'Hide column settings' : 'Show column settings'}
                  >
                    <RiSettings3Line className="size-4" />
                  </button>
                </div>
              </div>
              {showColumnConfig && (
                <div className="border-b border-border/80 bg-muted/20 px-4 py-3">
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
                            className="inline-flex cursor-grab items-center gap-1.5 border border-border/80 bg-background px-2 py-1 text-xs shadow-sm active:cursor-grabbing rounded-none"
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
                      className="h-8 w-full border border-border/80 bg-background pl-8 pr-2 text-xs shadow-sm rounded-none"
                    />
                  </div>
                  <div className="grid max-h-32 grid-cols-2 gap-2 overflow-auto md:grid-cols-4 no-scrollbar">
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
              <div className="min-h-0 flex-1 overflow-auto p-4 no-scrollbar">
                {detailLoading ? (
                  <div className="flex min-h-52 items-center justify-center">
                    <div className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="size-4 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground" />
                      Loading details...
                    </div>
                  </div>
                ) : detailError ? (
                  <div className="text-xs text-destructive">{detailError}</div>
                ) : sortedDetailRows.length === 0 ? (
                  <div className="text-xs text-muted-foreground">
                    {detailRowSearch.trim() ? 'No records match your search.' : 'No detail records found.'}
                  </div>
                ) : (
                  <div className="overflow-auto border border-border/20 shadow-sm rounded-none no-scrollbar">
                  <table className="w-full border-collapse text-xs">
                    <thead>
                      <tr className="sticky top-0 z-10 border-b border-border/20 bg-muted/95 backdrop-blur-md text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                        {detailColumns.map((key) => (
                          <th
                            key={key}
                            className="cursor-pointer select-none border-r border-border/20 px-2 py-2 text-left last:border-r-0 hover:bg-muted/20 transition-colors duration-150"
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
                          <tr key={idx} className="border-b border-border/20 hover:bg-muted/20 transition-colors duration-150">
                            {detailColumns.map((key) => (
                              <td key={`${idx}-${key}`} className="border-r border-border/20 px-2 py-2 align-top last:border-r-0">
                                {formatDetailCellValue(row?.[key])}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between border-t border-border/80 bg-muted/20 px-4 py-2.5">
                <div className="text-xs text-muted-foreground">
                  {detailFilter ? (
                    <>Page {detailPage} / {detailTotalPages}</>
                  ) : (
                    <>{formatDetailCellValue(detailListCount)} record(s)</>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {detailFilter ? (
                    <>
                      <button
                        type="button"
                        className="h-7 border border-border/80 bg-background px-3 text-xs shadow-sm disabled:opacity-50 rounded-none"
                        disabled={detailLoading || detailPage <= 1}
                        onClick={() => fetchDetailPage(detailFilter, detailPage - 1, detailRowSearch)}
                      >
                        Prev
                      </button>
                      <button
                        type="button"
                        className="h-7 border border-border/80 bg-background px-3 text-xs shadow-sm disabled:opacity-50 rounded-none"
                        disabled={detailLoading || detailPage >= detailTotalPages}
                        onClick={() => fetchDetailPage(detailFilter, detailPage + 1, detailRowSearch)}
                      >
                        Next
                      </button>
                    </>
                  ) : null}
                </div>
              </div>
            </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppPageShell>
  </Patient360Layout>
</>
  );
}
