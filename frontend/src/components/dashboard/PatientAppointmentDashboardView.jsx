import React, { useMemo, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, LabelList
} from 'recharts';
import {
  RiUserHeartLine, RiGroupLine, RiBarChartGroupedFill, RiPieChartFill, RiTableLine, RiFilter3Line, RiShieldCheckLine, RiCapsuleLine,
  RiSearchLine, RiCloseLine, RiDownloadLine, RiExternalLinkLine, RiListCheck, RiUserSearchLine, RiLoader4Line, RiInformationLine, RiArrowRightSLine, RiArrowLeftSLine,
  RiCalendarCheckLine, RiCalendar2Line, RiTimeLine, RiAlertLine, RiUserReceivedLine, RiRefreshLine, RiBuilding4Line, RiBarChartFill
} from '@remixicon/react';
import { downloadCsv, rowsToCsv, safeExportFilename } from '../../utils/exportCsv';
import { buildPatient360Path } from '../../utils/patient360Navigation';
import AppLoadingOverlay from '../ui/AppLoadingOverlay';
import cn from 'clsx';

const APPOINTMENT_CATEGORIES = [
  { id: 'ontime', name: 'ការមកពិនិត្យតាមការណាត់ (On-Time Visit)', shortName: 'តាមការណាត់ (On-Time)', color: '#10b981', ratio: 0.801, risk: 'ទាប (Low Risk)', bufferText: 'គ្រប់គ្រាន់ (Sufficient)', icon: RiCalendarCheckLine },
  { id: 'early', name: 'មុនណាត់ (Early Visit)', shortName: 'មុនណាត់ (Early)', color: '#3b82f6', ratio: 0.060, risk: 'ទាបបំផុត (Minimal Risk)', bufferText: 'មានលើស (Excess Buffer)', icon: RiCalendar2Line },
  { id: 'late_buffer', name: 'យឺតនៅថ្នាំបម្រុង (Late < 28 Days)', shortName: 'យឺត < 28d', color: '#f59e0b', ratio: 0.070, risk: 'មធ្យម (Moderate Risk)', bufferText: 'មានថ្នាំបម្រុង (With Buffer)', icon: RiTimeLine },
  { id: 'late_no_buffer', name: 'យឺតអស់ថ្នាំបម្រុង (Late > 28 Days)', shortName: 'យឺត > 28d', color: '#ef4444', ratio: 0.040, risk: 'ខ្ពស់បំផុត (High Risk / IIT)', bufferText: 'អស់ថ្នាំបម្រុង (No Buffer)', icon: RiAlertLine },
  { id: 'returned', name: 'ការត្រឡប់មកវិញក្រោយបាត់បង់ (Returned to Care)', shortName: 'ត្រឡប់មកវិញ (Returned)', color: '#a855f7', ratio: 0.029, risk: 'តាមដានស្តារឡើងវិញ (Restored)', bufferText: 'ចាប់ផ្តើមឡើងវិញ (Restored)', icon: RiUserReceivedLine },
];

function generateMockAppointmentPatients(categoryObj, siteCode = 'ALL', count = 20, startIndex = 0) {
  const catId = categoryObj?.id || 'all';
  const sampleSites = [
    { code: '0102', name: 'National Pediatric Hospital (NPH)' },
    { code: '0101', name: 'Calmette Hospital' },
    { code: '0103', name: 'Khmer-Soviet Friendship Hospital' },
    { code: '0201', name: 'Battambang Provincial Hospital' },
    { code: '0301', name: 'Siem Reap Provincial Hospital' },
    { code: '0401', name: 'Kampong Cham Provincial Hospital' }
  ];

  const regimens = [
    { name: 'TLD (Tenofovir/Lamivudine/Dolutegravir)', mmd: '3 Months MMD' },
    { name: 'TLD (Tenofovir/Lamivudine/Dolutegravir)', mmd: '6 Months MMD' },
    { name: 'TLE (Tenofovir/Lamivudine/Efavirenz)', mmd: '3 Months MMD' },
    { name: 'ABC + 3TC + DTG', mmd: '3 Months MMD' },
  ];

  const rows = [];
  for (let i = 1; i <= count; i++) {
    const rowNum = startIndex + i;
    let catInfo = APPOINTMENT_CATEGORIES.find(c => c.id === catId);
    if (!catInfo || catId === 'all') {
      catInfo = APPOINTMENT_CATEGORIES[(rowNum - 1) % APPOINTMENT_CATEGORIES.length];
    }

    const site = sampleSites[(rowNum - 1) % sampleSites.length];
    const reg = regimens[(rowNum - 1) % regimens.length];
    
    let daysDiff = 0;
    let bufferPills = '10 គ្រាប់ (គ្រប់គ្រាន់)';
    let scheduledDate = '2026-06-15';
    let actualVisitDate = '2026-06-15';

    if (catInfo.id === 'ontime') {
      daysDiff = 0;
      bufferPills = '10 គ្រាប់ (គ្រប់គ្រាន់)';
      scheduledDate = `2026-06-${String((rowNum % 20) + 1).padStart(2, '0')}`;
      actualVisitDate = scheduledDate;
    } else if (catInfo.id === 'early') {
      daysDiff = - ( (rowNum % 5) + 1 );
      bufferPills = '15 គ្រាប់ (នៅសល់ច្រើន)';
      scheduledDate = `2026-06-${String((rowNum % 15) + 10).padStart(2, '0')}`;
      actualVisitDate = `2026-06-${String(Math.max(1, (rowNum % 15) + 10 + daysDiff)).padStart(2, '0')}`;
    } else if (catInfo.id === 'late_buffer') {
      daysDiff = (rowNum % 25) + 1; // 1 to 25 days late
      bufferPills = `${Math.max(1, 10 - Math.floor(daysDiff / 3))} គ្រាប់ (នៅមានថ្នាំបម្រុង)`;
      scheduledDate = `2026-05-${String((rowNum % 20) + 1).padStart(2, '0')}`;
      actualVisitDate = `2026-06-${String((rowNum % 20) + 1).padStart(2, '0')}`;
    } else if (catInfo.id === 'late_no_buffer') {
      daysDiff = 29 + (rowNum % 40); // > 28 days late
      bufferPills = '0 គ្រាប់ (អស់ថ្នាំបម្រុង / ហានិភ័យ)';
      scheduledDate = `2026-04-${String((rowNum % 20) + 1).padStart(2, '0')}`;
      actualVisitDate = `2026-06-${String((rowNum % 20) + 1).padStart(2, '0')}`;
    } else if (catInfo.id === 'returned') {
      daysDiff = 45 + (rowNum % 60);
      bufferPills = '0 គ្រាប់ (ស្តារការព្យាបាលឡើងវិញ)';
      scheduledDate = `2026-03-${String((rowNum % 20) + 1).padStart(2, '0')}`;
      actualVisitDate = `2026-06-${String((rowNum % 20) + 1).padStart(2, '0')}`;
    }

    const isSuppressed = (rowNum % 12) !== 0;
    const vlVal = isSuppressed ? ((rowNum % 3 === 0) ? '< 20 copies/mL' : '< 40 copies/mL') : `${720 + (rowNum * 95)} copies/mL`;
    const age = 20 + ((rowNum * 7 + 2) % 35);
    const sexVal = (rowNum % 2 === 0) ? 'Female' : 'Male';
    const numPadded = String(rowNum * 4 + 2).padStart(4, '0');
    const targetSiteCode = siteCode === 'ALL' ? site.code : siteCode;
    const clinicId = `${targetSiteCode}-${numPadded}`;

    rows.push({
      id: clinicId,
      clinicId,
      categoryKey: catInfo.id,
      categoryName: catInfo.shortName,
      fullCategoryName: catInfo.name,
      categoryColor: catInfo.color,
      sex: sexVal,
      age,
      scheduledDate,
      actualVisitDate,
      daysDiff,
      daysDiffText: daysDiff === 0 ? 'ចំថ្ងៃណាត់' : (daysDiff < 0 ? `មុន ${Math.abs(daysDiff)} ថ្ងៃ` : `យឺត ${daysDiff} ថ្ងៃ`),
      bufferPills,
      riskLevel: catInfo.risk,
      vlCopies: vlVal,
      vlSuppressed: isSuppressed,
      regimen: reg.name,
      mmdMonths: reg.mmd,
      siteName: siteCode === 'ALL' ? site.name : `Site ${siteCode}`,
      siteCode: targetSiteCode,
      status: catInfo.id === 'late_no_buffer' ? 'High Risk IIT' : (catInfo.id === 'returned' ? 'Restored Care' : 'Active ART')
    });
  }
  return rows;
}

export default function PatientAppointmentDashboardView({ kpis = {}, siteCode = 'ALL', selectedPeriodKey = '', loading = false, kpFilter = 'all' }) {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Appointment Line List Modal States
  const [lineListOpen, setLineListOpen] = useState(false);
  const [activeModalCat, setActiveModalCat] = useState(null);
  const [modalRows, setModalRows] = useState([]);
  const [modalTotalCount, setModalTotalCount] = useState(0);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalSearch, setModalSearch] = useState('');
  const [modalVlFilter, setModalVlFilter] = useState('all');
  const [modalPage, setModalPage] = useState(1);
  const [modalPageSize, setModalPageSize] = useState(20);

  const totalPatients = useMemo(() => kpis.activeArt || 72878, [kpis]);

  // Dynamic Appointment Metrics calculation
  const appointmentData = useMemo(() => {
    return APPOINTMENT_CATEGORIES.map(cat => {
      const val = Math.round(totalPatients * cat.ratio);
      return {
        ...cat,
        value: val,
        pct: Number(((val / totalPatients) * 100).toFixed(1))
      };
    });
  }, [totalPatients]);

  const filteredData = useMemo(() => {
    if (selectedCategory === 'all') return appointmentData;
    return appointmentData.filter(d => d.id === selectedCategory);
  }, [appointmentData, selectedCategory]);

  // Site Comparison States
  const [siteCompareMode, setSiteCompareMode] = useState('all'); // 'all' | 'top10' | 'high_risk'
  const [siteViewFormat, setSiteViewFormat] = useState('table'); // 'table' | 'chart'
  const [siteCompareSearch, setSiteCompareSearch] = useState('');

  const FACILITY_SITES_ROSTER = useMemo(() => [
    { site_code: '1201', site_name: 'National Pediatric Hospital (NPH)', province_name: 'Phnom Penh', base_share: 0.18 },
    { site_code: '1202', site_name: 'Calmette Hospital', province_name: 'Phnom Penh', base_share: 0.12 },
    { site_code: '1203', site_name: 'Khmer-Soviet Friendship Hospital (KSFH)', province_name: 'Phnom Penh', base_share: 0.15 },
    { site_code: '0201', site_name: 'Battambang Provincial Hospital', province_name: 'Battambang', base_share: 0.11 },
    { site_code: '1701', site_name: 'Siem Reap Provincial Hospital', province_name: 'Siem Reap', base_share: 0.09 },
    { site_code: '0101', site_name: 'Banteay Meanchey Hospital', province_name: 'Banteay Meanchey', base_share: 0.07 },
    { site_code: '0301', site_name: 'Kampong Cham Provincial Hospital', province_name: 'Kampong Cham', base_share: 0.06 },
    { site_code: '0802', site_name: 'Chey Chumneash Hospital (Takhmao)', province_name: 'Kandal', base_share: 0.05 },
    { site_code: '1801', site_name: 'Preah Sihanouk Provincial Hospital', province_name: 'Preah Sihanouk', base_share: 0.04 },
    { site_code: '2101', site_name: 'Takeo Provincial Hospital', province_name: 'Takeo', base_share: 0.035 },
    { site_code: '1401', site_name: 'Prey Veng Referral Hospital', province_name: 'Prey Veng', base_share: 0.03 },
    { site_code: '0501', site_name: 'Kampong Speu Referral Hospital', province_name: 'Kampong Speu', base_share: 0.025 },
    { site_code: '2001', site_name: 'Svay Rieng Provincial Hospital', province_name: 'Svay Rieng', base_share: 0.02 },
    { site_code: '0401', site_name: 'Kampong Chhnang Provincial Hospital', province_name: 'Kampong Chhnang', base_share: 0.015 },
    { site_code: '0701', site_name: 'Kampot Provincial Hospital', province_name: 'Kampot', base_share: 0.012 },
  ], []);

  const processedSiteRows = useMemo(() => {
    let list = FACILITY_SITES_ROSTER.map((s, idx) => {
      const siteTotal = Math.max(12, Math.round(totalPatients * s.base_share));
      const onTime = Math.round(siteTotal * (0.78 + (idx % 5) * 0.01));
      const early = Math.round(siteTotal * 0.06);
      const lateBuffer = Math.round(siteTotal * 0.07);
      const lateNoBuffer = Math.round(siteTotal * (0.03 + (idx % 3) * 0.012));
      const returned = Math.round(siteTotal * 0.029);

      const onTimePct = Number(((onTime / siteTotal) * 100).toFixed(1));
      const lateNoBufferPct = (lateNoBuffer / siteTotal) * 100;

      let risk = { label: 'ល្អប្រសើរ (On Track)', bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/30' };
      if (lateNoBufferPct > 4.5) {
        risk = { label: 'ហានិភ័យខ្ពស់ (High Risk)', bg: 'bg-rose-500/10', text: 'text-rose-500', border: 'border-rose-500/30' };
      } else if (lateBuffer > (siteTotal * 0.075)) {
        risk = { label: 'ត្រូវតាមដាន (Warning)', bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/30' };
      }

      return {
        ...s,
        total: siteTotal,
        onTime,
        onTimePct,
        early,
        lateBuffer,
        lateNoBuffer,
        lateNoBufferPct,
        returned,
        risk
      };
    });

    if (siteCompareMode === 'top10') {
      list = [...list].sort((a, b) => b.onTimePct - a.onTimePct).slice(0, 10);
    } else if (siteCompareMode === 'high_risk') {
      list = [...list].sort((a, b) => b.lateNoBufferPct - a.lateNoBufferPct);
    }

    if (siteCompareSearch.trim()) {
      const q = siteCompareSearch.toLowerCase();
      list = list.filter(s =>
        s.site_name.toLowerCase().includes(q) ||
        s.site_code.toLowerCase().includes(q) ||
        s.province_name.toLowerCase().includes(q)
      );
    }

    return list;
  }, [totalPatients, FACILITY_SITES_ROSTER, siteCompareMode, siteCompareSearch]);

  const totalArtSum = useMemo(() => filteredData.reduce((acc, item) => acc + (item.value || 0), 0), [filteredData]);

  useEffect(() => {
    setModalPage(1);
  }, [modalSearch, modalVlFilter, lineListOpen]);

  // Open Line List Modal Handler
  const handleOpenLineList = (catItem) => {
    let targetCat = catItem;
    if (!targetCat || targetCat.id === 'all') {
      targetCat = { id: 'all', name: 'គ្រប់ស្ថានភាពការណាត់ជួប (All Appointment Statuses)', shortName: 'All Appointments', value: totalPatients, color: '#3b82f6' };
    } else if (targetCat.id) {
      const found = appointmentData.find(c => c.id === targetCat.id);
      if (found) targetCat = { ...targetCat, value: found.value, name: found.name, shortName: found.shortName, color: found.color };
    }

    setActiveModalCat(targetCat);
    const count = targetCat.value || totalPatients;
    setModalTotalCount(count);
    setLineListOpen(true);
    setModalSearch('');
    setModalVlFilter('all');
    setModalPage(1);
    setModalPageSize(20);
  };

  useEffect(() => {
    if (!lineListOpen || !activeModalCat) return;
    const startIdx = (modalPage - 1) * modalPageSize;
    const rowsToFetch = Math.min(modalPageSize, Math.max(0, modalTotalCount - startIdx));
    const mockRows = generateMockAppointmentPatients(activeModalCat, siteCode, rowsToFetch, startIdx);
    setModalRows(mockRows);
  }, [lineListOpen, activeModalCat, modalPage, modalPageSize, siteCode, modalTotalCount]);

  // Filtered rows inside modal
  const filteredModalRows = useMemo(() => {
    let rows = modalRows;
    if (modalVlFilter === 'suppressed') {
      rows = rows.filter(r => r.vlSuppressed);
    } else if (modalVlFilter === 'unsuppressed') {
      rows = rows.filter(r => !r.vlSuppressed);
    }

    if (!modalSearch.trim()) return rows;
    const q = modalSearch.toLowerCase().trim();
    return rows.filter(r =>
      String(r.clinicId).toLowerCase().includes(q) ||
      String(r.categoryName).toLowerCase().includes(q) ||
      String(r.siteName).toLowerCase().includes(q) ||
      String(r.regimen).toLowerCase().includes(q)
    );
  }, [modalRows, modalSearch, modalVlFilter]);

  const totalAppointmentModalRows = modalTotalCount;
  const totalPages = Math.max(1, Math.ceil(modalTotalCount / modalPageSize));
  const safePage = Math.min(modalPage, totalPages);
  const startIndex = (safePage - 1) * modalPageSize;

  // Export CSV Handler
  const handleExportCsv = () => {
    if (!filteredModalRows || filteredModalRows.length === 0) return;
    const cols = ['clinicId', 'fullCategoryName', 'sex', 'age', 'scheduledDate', 'actualVisitDate', 'daysDiffText', 'bufferPills', 'riskLevel', 'vlCopies', 'siteName', 'status'];
    const csvContent = rowsToCsv(cols, filteredModalRows, {
      labelForKey: (k) => {
        const labels = {
          clinicId: 'Clinic ID',
          fullCategoryName: 'Appointment Status Category',
          sex: 'Sex',
          age: 'Age',
          scheduledDate: 'Scheduled Date',
          actualVisitDate: 'Actual Visit Date',
          daysDiffText: 'Days Difference',
          bufferPills: 'Buffer Pill Status',
          riskLevel: 'Risk Level',
          vlCopies: 'Viral Load (VL)',
          siteName: 'Facility / Site',
          status: 'Patient Status'
        };
        return labels[k] || k;
      }
    });
    const filename = safeExportFilename(`Appointment_Retention_LineList_${activeModalCat?.id || 'All'}_${selectedPeriodKey}`);
    downloadCsv(filename, csvContent);
  };

  return (
    <div className="space-y-4 font-khmer">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-border/80 bg-card p-3.5 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 border border-emerald-500/30">
              Patient Retention & Appointment Analytics
            </span>
            <span className="text-xs text-muted-foreground">ត្រីមាស: <strong>{selectedPeriodKey || '២០២៦-Q៣'}</strong></span>
          </div>
          <h2 className="text-sm font-black text-foreground mt-1 tracking-tight">
            តាមដានការណាត់ជួប & ត្រឡប់មកវិញ (Appointment & Retention)
          </h2>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => handleOpenLineList(null)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold shadow-2xs hover:bg-emerald-700 transition-colors"
          >
            <RiListCheck className="size-4" />
            <span>បង្ហាញបញ្ជីឈ្មោះតាមដានការណាត់ជួបទាំងអស់</span>
          </button>
        </div>
      </div>

      {/* 5 Executive KPI Indicator Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3">
        {appointmentData.map((cat) => {
          const IconComp = cat.icon || RiCalendarCheckLine;
          return (
            <div
              key={cat.id}
              onClick={() => handleOpenLineList(cat)}
              className="border border-border/70 bg-card p-3 shadow-2xs hover:border-emerald-500/80 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[11px] font-bold text-muted-foreground truncate">{cat.shortName}</span>
                  <div
                    className="flex size-6 items-center justify-center shrink-0"
                    style={{ backgroundColor: `${cat.color}15`, color: cat.color }}
                  >
                    <IconComp className="size-3.5" />
                  </div>
                </div>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-lg font-black text-foreground tracking-tight font-mono">
                    {cat.value.toLocaleString()}
                  </span>
                  <span className="text-[10px] font-bold" style={{ color: cat.color }}>{cat.pct}%</span>
                </div>
              </div>

              <div className="mt-2 pt-2 border-t border-border/40 flex items-center justify-between text-[10px]">
                <span className="text-muted-foreground group-hover:text-emerald-500 transition-colors flex items-center gap-1 font-bold truncate">
                  <RiListCheck className="size-3 shrink-0" />
                  <span className="truncate">មើលបញ្ជីឈ្មោះ</span>
                </span>
                <RiArrowRightSLine className="size-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-transform shrink-0" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Visual Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Card: Appointment Status Donut Chart */}
        <div className="lg:col-span-5 border border-border/80 bg-card p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-border/60 pb-2.5 mb-2">
            <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <RiPieChartFill className="size-4 text-emerald-500" /> ការបែងចែកស្ថានភាពការមកពិនិត្យតាមការណាត់
            </h3>
            <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 border border-emerald-500/20">
              សរុប {totalPatients.toLocaleString()} នាក់
            </span>
          </div>

          <div className="flex flex-col xl:flex-row items-center gap-3 py-2">
            <div className="relative h-48 w-48 sm:h-52 sm:w-52 shrink-0 flex items-center justify-center overflow-hidden">
              {loading && (
                <AppLoadingOverlay
                  show={loading}
                  fullScreen={false}
                  message="កំពុងផ្ទុកទិន្នន័យ Chart..."
                />
              )}
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={filteredData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={50}
                    paddingAngle={3}
                    stroke="none"
                  >
                    {filteredData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} className="cursor-pointer" onClick={() => handleOpenLineList(entry)} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload || !payload.length) return null;
                      const d = payload[0].payload;
                      return (
                        <div className="bg-slate-900 border border-slate-700 p-2.5 text-xs text-white shadow-xl font-khmer">
                          <div className="font-bold border-b border-slate-700 pb-1 mb-1" style={{ color: d.color }}>{d.name}</div>
                          <div>អ្នកជំងឺ: <strong>{d.value.toLocaleString()} នាក់</strong></div>
                          <div>សមាមាត្រ: <strong>{d.pct}%</strong></div>
                          <div className="text-[10px] text-sky-400 mt-1 italic">ចុចដើម្បីមើលបញ្ជីឈ្មោះ (Click to view Line List)</div>
                        </div>
                      );
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">សរុប ART</span>
                <span className="text-base font-black text-foreground font-mono">{totalPatients.toLocaleString()}</span>
                <span className="text-[10px] font-bold text-emerald-500">100.0%</span>
              </div>
            </div>

            <div className="flex-1 w-full min-w-0 space-y-1.5 text-xs">
              {appointmentData.map((cat) => (
                <div
                  key={cat.id}
                  className={`flex items-center justify-between p-1.5 border transition-all ${
                    selectedCategory === cat.id || selectedCategory === 'all'
                      ? 'border-border bg-muted/20 hover:bg-muted/40'
                      : 'border-transparent opacity-40'
                  }`}
                >
                  <div className="flex items-center gap-1.5 min-w-0 flex-1 cursor-pointer" onClick={() => setSelectedCategory(selectedCategory === cat.id ? 'all' : cat.id)}>
                    <span className="size-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                    <span className="font-bold truncate text-foreground text-[11px] min-w-0">{cat.shortName}</span>
                  </div>
                  
                  <div className="flex items-center gap-1.5 text-[11px] shrink-0 font-mono">
                    <span className="font-bold text-foreground">{cat.value.toLocaleString()}</span>
                    <button
                      onClick={() => handleOpenLineList(cat)}
                      className="px-1.5 py-0.5 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 hover:bg-emerald-500 hover:text-white border border-emerald-500/20 transition-colors shrink-0"
                      title="មើលបញ្ជីឈ្មោះ Line List"
                    >
                      Line List
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Card: Retention Status Bar Breakdown */}
        <div className="lg:col-span-7 border border-border/80 bg-card p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-border/60 pb-2.5 mb-2">
            <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <RiBarChartGroupedFill className="size-4 text-emerald-500" /> ប្រៀបធៀបចំនួនអ្នកជំងឺតាមប្រភេទការណាត់ជួប
            </h3>
            <span className="text-[11px] font-semibold text-muted-foreground">
              ៥ ប្រភេទការណាត់ជួប
            </span>
          </div>

          <div className="h-64 w-full pt-2 relative overflow-hidden">
            {loading && (
              <AppLoadingOverlay
                show={loading}
                fullScreen={false}
                message="កំពុងផ្ទុកទិន្នន័យ Chart..."
              />
            )}
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filteredData} margin={{ top: 20, right: 15, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis
                  dataKey="shortName"
                  tick={{ fontSize: 10, fontWeight: '700', fill: 'currentColor', fontFamily: 'inherit' }}
                  className="text-muted-foreground"
                />
                <YAxis tick={{ fontSize: 10, fill: 'currentColor', fontFamily: 'inherit' }} className="text-muted-foreground" />
                <Tooltip
                  cursor={{ fill: 'transparent' }}
                  content={({ active, payload }) => {
                    if (!active || !payload || !payload.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div className="bg-slate-900 border border-slate-700 p-3 text-xs text-white shadow-xl font-khmer rounded-none">
                        <div className="font-bold border-b border-slate-700 pb-1.5 mb-1.5 text-emerald-300">{d.name}</div>
                        <div className="text-emerald-400 font-bold flex items-center justify-between gap-4">
                          <span>ចំនួនអ្នកជំងឺ:</span>
                          <strong className="font-mono">{d.value.toLocaleString()} នាក់</strong>
                        </div>
                        <div className="text-blue-400 font-bold flex items-center justify-between gap-4 mt-1">
                          <span>សមាមាត្រ:</span>
                          <strong className="font-mono">{d.pct}%</strong>
                        </div>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="value" name="អ្នកជំងឺ" radius={[3, 3, 0, 0]} className="cursor-pointer" onClick={(data) => handleOpenLineList(data)}>
                  {filteredData.map((entry, idx) => (
                    <Cell key={`bar-${idx}`} fill={entry.color} />
                  ))}
                  <LabelList dataKey="value" position="top" style={{ fontSize: '10px', fontWeight: '800', fill: '#10b981', fontFamily: 'inherit' }} formatter={(v) => Number(v).toLocaleString()} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Appointment & Retention Detailed Breakdown Summary Table */}
      <div className="border border-border/80 bg-card shadow-2xs overflow-hidden">
        <div className="flex items-center justify-between border-b border-border/60 px-4 py-2.5 bg-muted/20">
          <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
            <RiTableLine className="size-4 text-emerald-500" /> តារាងលម្អិតសូចនាករតាមដានការណាត់ជួប (Appointment Status Breakdown Table)
          </h3>
          <span className="text-[11px] font-semibold text-muted-foreground">
            សរុប {filteredData.length} ប្រភេទ
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border/60 bg-muted/40 text-muted-foreground font-bold">
                <th className="px-4 py-2">ស្ថានភាពការណាត់ជួប (Appointment Category)</th>
                <th className="px-4 py-2 text-right">ចំនួនអ្នកជំងឺ (Patients)</th>
                <th className="px-4 py-2 text-right">សមាមាត្រ (%)</th>
                <th className="px-4 py-2 text-center">ស្ថានភាពថ្នាំបម្រុង (Buffer Status)</th>
                <th className="px-4 py-2 text-center">កម្រិតហានិភ័យ (Risk Level)</th>
                <th className="px-4 py-2 text-center">បញ្ជីឈ្មោះ (Line List)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filteredData.map((cat) => (
                <tr key={cat.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-2.5 font-bold text-foreground flex items-center gap-2">
                    <span className="size-2.5 rounded-full shrink-0 shadow-2xs" style={{ backgroundColor: cat.color }} />
                    {cat.name}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono font-bold text-foreground">
                    <button
                      onClick={() => handleOpenLineList(cat)}
                      className="hover:underline hover:text-emerald-500 transition-colors"
                    >
                      {cat.value.toLocaleString()} នាក់
                    </button>
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-emerald-500 font-bold">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 bg-muted h-1.5 overflow-hidden rounded-full hidden sm:block">
                        <div className="h-full bg-emerald-500" style={{ width: `${cat.pct}%` }} />
                      </div>
                      <span>{cat.pct}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-center font-bold text-muted-foreground">
                    <span className="px-2 py-0.5 text-[11px] bg-muted/60 border border-border/60">
                      {cat.bufferText}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-center font-bold">
                    <span
                      className="px-2 py-0.5 text-[11px] border"
                      style={{
                        backgroundColor: `${cat.color}15`,
                        color: cat.color,
                        borderColor: `${cat.color}35`
                      }}
                    >
                      {cat.risk}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <button
                      onClick={() => handleOpenLineList(cat)}
                      className="px-2.5 py-1 text-xs font-bold text-emerald-500 bg-emerald-500/10 hover:bg-emerald-500 hover:text-white border border-emerald-500/20 transition-all inline-flex items-center gap-1"
                    >
                      <RiListCheck className="size-3.5" />
                      <span>បង្ហាញបញ្ជីឈ្មោះ</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t-2 border-border/80 bg-muted/40 font-bold">
              <tr>
                <td className="px-4 py-3 text-foreground font-black">
                  សរុប (Total)
                </td>
                <td className="px-4 py-3 text-right font-mono font-black text-foreground">
                  {totalArtSum.toLocaleString()} នាក់
                </td>
                <td className="px-4 py-3 text-right font-mono font-black text-emerald-500">
                  100.0%
                </td>
                <td className="px-4 py-3 text-center text-muted-foreground font-bold">
                  តាមដានគ្រប់ដណ្តប់
                </td>
                <td className="px-4 py-3 text-center text-emerald-500 font-bold">
                  គ្រប់គ្រងបានល្អ
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => handleOpenLineList(null)}
                    className="px-2.5 py-1 text-xs font-bold text-emerald-500 bg-emerald-500/10 hover:bg-emerald-500 hover:text-white border border-emerald-500/30 transition-all inline-flex items-center gap-1"
                  >
                    <RiListCheck className="size-3.5" />
                    <span>បញ្ជីឈ្មោះសរុប</span>
                  </button>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Facility Sites Performance & Retention Risk Comparison Section */}
      <div className="border border-border/80 bg-card shadow-2xs overflow-hidden space-y-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-border/60 px-4 py-3 bg-muted/20 gap-2">
          <div>
            <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <RiBuilding4Line className="size-4 text-emerald-500" />
              ការប្រៀបធៀបតាមមន្ទីរពេទ្យ & ហានិភ័យ (Facility Sites Retention & Appointment Comparison)
            </h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              បង្ហាញសូចនាករមកតាមណាត់ យឺត និងហានិភ័យអស់ថ្នាំបម្រុងតាមមូលដ្ឋានមន្ទីរពេទ្យ ART
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Site Filter Tabs */}
            <div className="flex items-center bg-muted/60 p-0.5 border border-border">
              <button
                type="button"
                onClick={() => setSiteCompareMode('all')}
                className={cn(
                  'px-2.5 py-1 text-[11px] font-bold transition-all cursor-pointer rounded-none',
                  siteCompareMode === 'all'
                    ? 'bg-background text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                គ្រប់មន្ទីរពេទ្យ ({FACILITY_SITES_ROSTER.length})
              </button>
              <button
                type="button"
                onClick={() => setSiteCompareMode('top10')}
                className={cn(
                  'px-2.5 py-1 text-[11px] font-bold transition-all cursor-pointer rounded-none',
                  siteCompareMode === 'top10'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                Top Retention
              </button>
              <button
                type="button"
                onClick={() => setSiteCompareMode('high_risk')}
                className={cn(
                  'px-2.5 py-1 text-[11px] font-bold transition-all cursor-pointer rounded-none',
                  siteCompareMode === 'high_risk'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                យឺតអស់ថ្នាំ (High Risk)
              </button>
            </div>

            {/* View Format Toggle: Table vs Chart */}
            <div className="flex items-center bg-muted/60 p-0.5 border border-border">
              <button
                type="button"
                onClick={() => setSiteViewFormat('table')}
                className={cn(
                  'px-2 py-1 text-[11px] font-bold transition-all cursor-pointer rounded-none flex items-center gap-1',
                  siteViewFormat === 'table'
                    ? 'bg-background text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <RiTableLine className="size-3.5" />
                <span>តារាង / បញ្ជី</span>
              </button>
              <button
                type="button"
                onClick={() => setSiteViewFormat('chart')}
                className={cn(
                  'px-2 py-1 text-[11px] font-bold transition-all cursor-pointer rounded-none flex items-center gap-1',
                  siteViewFormat === 'chart'
                    ? 'bg-background text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <RiBarChartFill className="size-3.5" />
                <span>ក្រាហ្វ (Chart)</span>
              </button>
            </div>

            {/* Site Search */}
            <div className="relative">
              <RiSearchLine className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={siteCompareSearch}
                onChange={(e) => setSiteCompareSearch(e.target.value)}
                placeholder="ស្វែងរកមន្ទីរពេទ្យ..."
                className="h-7 w-40 border border-border bg-background pl-8 pr-2 text-xs outline-none rounded-none"
              />
            </div>
          </div>
        </div>

        {/* Visual Chart View Mode */}
        {siteViewFormat === 'chart' && (
          <div className="p-4 bg-card">
            <div className="flex items-center justify-between mb-3 text-xs">
              <span className="font-bold text-foreground">
                ក្រាហ្វប្រៀបធៀបតាមមន្ទីរពេទ្យ ({processedSiteRows.length} មូលដ្ឋាន)
              </span>
              <div className="flex items-center gap-3 text-[11px] font-bold">
                <span className="flex items-center gap-1 text-emerald-500">
                  <span className="size-2.5 bg-emerald-500 rounded-full" /> តាមការណាត់
                </span>
                <span className="flex items-center gap-1 text-amber-500">
                  <span className="size-2.5 bg-amber-500 rounded-full" /> យឺតនៅថ្នាំ
                </span>
                <span className="flex items-center gap-1 text-rose-500">
                  <span className="size-2.5 bg-rose-500 rounded-full" /> យឺតអស់ថ្នាំ
                </span>
                <span className="flex items-center gap-1 text-purple-500">
                  <span className="size-2.5 bg-purple-500 rounded-full" /> ត្រឡប់មកវិញ
                </span>
              </div>
            </div>
            <div className="h-80 w-full relative">
              {loading && (
                <AppLoadingOverlay
                  show={loading}
                  fullScreen={false}
                  message="កំពុងផ្ទុកទិន្នន័យ Chart..."
                />
              )}
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={processedSiteRows} margin={{ top: 20, right: 20, left: 10, bottom: 45 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis
                    dataKey="site_code"
                    tick={({ x, y, payload }) => {
                      const siteObj = processedSiteRows.find(s => s.site_code === payload.value);
                      return (
                        <g transform={`translate(${x},${y})`}>
                          <text x={0} y={0} dy={12} textAnchor="end" fill="currentColor" fontSize={10} fontWeight="700" fontFamily="inherit" transform="rotate(-35)">
                            {siteObj ? siteObj.site_name.slice(0, 16) : payload.value}
                          </text>
                        </g>
                      );
                    }}
                    className="text-muted-foreground"
                  />
                  <YAxis tick={{ fontSize: 10, fill: 'currentColor', fontFamily: 'inherit' }} className="text-muted-foreground" />
                  <Tooltip
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    content={({ active, payload }) => {
                      if (!active || !payload || !payload.length) return null;
                      const d = payload[0].payload;
                      return (
                        <div className="bg-slate-900 border border-slate-700 p-3 text-xs text-white shadow-xl font-khmer rounded-none">
                          <div className="font-bold border-b border-slate-700 pb-1.5 mb-1.5 text-emerald-300">
                            {d.site_name} ({d.site_code})
                          </div>
                          <div className="text-slate-300 flex justify-between gap-4">
                            <span>អ្នកជំងឺសរុប:</span>
                            <strong className="font-mono text-white">{d.total.toLocaleString()} នាក់</strong>
                          </div>
                          <div className="text-emerald-400 flex justify-between gap-4 mt-1">
                            <span>តាមការណាត់:</span>
                            <strong className="font-mono">{d.onTime.toLocaleString()} ({d.onTimePct}%)</strong>
                          </div>
                          <div className="text-amber-400 flex justify-between gap-4 mt-1">
                            <span>យឺតនៅថ្នាំបម្រុង:</span>
                            <strong className="font-mono">{d.lateBuffer.toLocaleString()} នាក់</strong>
                          </div>
                          <div className="text-rose-400 flex justify-between gap-4 mt-1">
                            <span>យឺតអស់ថ្នាំ (ហានិភ័យ):</span>
                            <strong className="font-mono">{d.lateNoBuffer.toLocaleString()} នាក់</strong>
                          </div>
                          <div className="text-purple-400 flex justify-between gap-4 mt-1">
                            <span>ត្រឡប់មកវិញ:</span>
                            <strong className="font-mono">{d.returned.toLocaleString()} នាក់</strong>
                          </div>
                        </div>
                      );
                    }}
                  />
                  <Bar dataKey="onTime" name="តាមការណាត់ (On-Time)" fill="#10b981" radius={[2, 2, 0, 0]} stackId="a" />
                  <Bar dataKey="lateBuffer" name="យឺតនៅថ្នាំបម្រុង" fill="#f59e0b" radius={[2, 2, 0, 0]} stackId="a" />
                  <Bar dataKey="lateNoBuffer" name="យឺតអស់ថ្នាំ (ហានិភ័យ)" fill="#ef4444" radius={[2, 2, 0, 0]} stackId="a" />
                  <Bar dataKey="returned" name="ត្រឡប់មកវិញ" fill="#a855f7" radius={[2, 2, 0, 0]} stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Table View Mode */}
        {siteViewFormat === 'table' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border/60 bg-muted/40 text-muted-foreground font-bold">
                <th className="px-3 py-2">មន្ទីរពេទ្យ (Facility Site & Code)</th>
                <th className="px-3 py-2">ខេត្ត (Province)</th>
                <th className="px-3 py-2 text-right">អ្នកជំងឺ ART សរុប</th>
                <th className="px-3 py-2 text-right">តាមការណាត់ (%)</th>
                <th className="px-3 py-2 text-right text-blue-500">មុនណាត់</th>
                <th className="px-3 py-2 text-right text-amber-500">{"យឺត < 28ថ្ងៃ"}</th>
                <th className="px-3 py-2 text-right text-rose-500">{"យឺត > 28ថ្ងៃ (អស់ថ្នាំ)"}</th>
                <th className="px-3 py-2 text-right text-purple-500">ត្រឡប់មកវិញ</th>
                <th className="px-3 py-2 text-center">កម្រិតហានិភ័យ (Risk)</th>
                <th className="px-3 py-2 text-center">បញ្ជីឈ្មោះ (Line List)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {processedSiteRows.map((site) => (
                <tr key={site.site_code} className="hover:bg-muted/30 transition-colors">
                  <td className="px-3 py-2.5 font-bold text-foreground">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 border border-border/50">
                        {site.site_code}
                      </span>
                      <span>{site.site_name}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-muted-foreground font-semibold">
                    {site.province_name}
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono font-bold text-foreground">
                    {site.total.toLocaleString()} នាក់
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono text-emerald-500 font-bold">
                    <div className="flex items-center justify-end gap-1.5">
                      <div className="w-12 bg-muted h-1.5 overflow-hidden rounded-full hidden sm:block">
                        <div className="h-full bg-emerald-500" style={{ width: `${site.onTimePct}%` }} />
                      </div>
                      <span>{site.onTime.toLocaleString()} ({site.onTimePct}%)</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono font-bold text-blue-500">
                    {site.early.toLocaleString()}
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono font-bold text-amber-500">
                    {site.lateBuffer.toLocaleString()}
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono font-black text-rose-500 bg-rose-500/5">
                    {site.lateNoBuffer.toLocaleString()}
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono font-bold text-purple-500">
                    {site.returned.toLocaleString()}
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <span className={cn("px-2 py-0.5 text-[10px] font-bold border", site.risk.bg, site.risk.text, site.risk.border)}>
                      {site.risk.label}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <button
                      type="button"
                      onClick={() => handleOpenLineList({ id: 'all', name: `បញ្ជីឈ្មោះ - ${site.site_name}`, value: site.total })}
                      className="px-2 py-0.5 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 hover:bg-emerald-500 hover:text-white border border-emerald-500/20 transition-all inline-flex items-center gap-1 cursor-pointer"
                    >
                      <RiListCheck className="size-3" />
                      <span>Line List</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </div>

      {/* APPOINTMENT LINE LIST INTERACTIVE MODAL */}
      {lineListOpen && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 sm:p-6 font-khmer animate-in fade-in duration-200">
          <div className="relative w-full max-w-5xl max-h-[85vh] my-auto bg-card border border-border/80 shadow-2xl flex flex-col overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border/60 px-5 py-3.5 bg-muted/30">
              <div className="flex items-center gap-2.5">
                <span className="size-3 rounded-full shrink-0" style={{ backgroundColor: activeModalCat?.color || '#10b981' }} />
                <div>
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <span>បញ្ជីឈ្មោះអ្នកជំងឺតាមដានការណាត់ជួប ({activeModalCat?.name || 'All Appointments'})</span>
                    <span className="text-[11px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 border border-emerald-500/30 font-mono">
                      {modalTotalCount.toLocaleString()} នាក់
                    </span>
                  </h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    ត្រីមាស: <strong>{selectedPeriodKey || '២០២៦-Q៣'}</strong> | មណ្ឌល: <strong>{siteCode}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setLineListOpen(false)}
                className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              >
                <RiCloseLine className="size-5" />
              </button>
            </div>

            {/* Modal Toolbar: Search, Filters & Export */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-2.5 border-b border-border/40 bg-card">
              <div className="flex items-center gap-2 w-full sm:w-auto flex-1 max-w-md">
                <div className="relative flex-1">
                  <RiSearchLine className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="ស្វែងរកតាម Clinic ID / មណ្ឌល / ស្ថានភាព..."
                    value={modalSearch}
                    onChange={(e) => setModalSearch(e.target.value)}
                    className="w-full bg-muted/40 border border-border/60 pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <select
                  value={modalVlFilter}
                  onChange={(e) => setModalVlFilter(e.target.value)}
                  className="bg-muted/40 border border-border/60 text-xs text-foreground font-bold px-2 py-1.5 outline-none cursor-pointer"
                >
                  <option value="all">គ្រប់ VL Status</option>
                  <option value="suppressed">VL Suppressed (&lt; 40)</option>
                  <option value="unsuppressed">VL Unsuppressed (&ge; 40)</option>
                </select>
              </div>

              <button
                onClick={handleExportCsv}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shrink-0"
              >
                <RiDownloadLine className="size-4" />
                <span>Export CSV</span>
              </button>
            </div>

            {/* Modal Table Content */}
            <div className="flex-1 overflow-y-auto p-5">
              {modalLoading ? (
                <div className="flex flex-col items-center justify-center h-48 gap-2 text-muted-foreground">
                  <RiLoader4Line className="size-8 animate-spin text-emerald-500" />
                  <span className="text-xs font-bold">កំពុងផ្ទុកបញ្ជីឈ្មោះ...</span>
                </div>
              ) : totalAppointmentModalRows === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 gap-2 text-muted-foreground">
                  <RiInformationLine className="size-8 text-muted-foreground/60" />
                  <span className="text-xs font-bold">មិនមានទិន្នន័យ (No Records Found)</span>
                </div>
              ) : (
                <div className="overflow-x-auto border border-border/60">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-border/60 bg-muted/50 text-muted-foreground font-bold uppercase text-[10px] tracking-wider">
                        <th className="px-3.5 py-2.5 whitespace-nowrap">ល.រ</th>
                        <th className="px-3.5 py-2.5 whitespace-nowrap">Clinic ID</th>
                        <th className="px-3.5 py-2.5 whitespace-nowrap">ស្ថានភាពការណាត់</th>
                        <th className="px-3.5 py-2.5 whitespace-nowrap">ថ្ងៃណាត់ជួប</th>
                        <th className="px-3.5 py-2.5 whitespace-nowrap">ថ្ងៃមកពិនិត្យជាក់ស្តែង</th>
                        <th className="px-3.5 py-2.5 whitespace-nowrap">ចំនួនថ្ងៃយឺត/មុន</th>
                        <th className="px-3.5 py-2.5 whitespace-nowrap">ថ្នាំបម្រុង remaining</th>
                        <th className="px-3.5 py-2.5 whitespace-nowrap">មណ្ឌលព្យាបាល</th>
                        <th className="px-3.5 py-2.5 whitespace-nowrap text-center">សកម្មភាព</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {modalRows.map((row, idx) => (
                        <tr key={row.clinicId + idx} className="hover:bg-muted/30 transition-colors">
                          <td className="px-3.5 py-2.5 font-mono text-muted-foreground whitespace-nowrap">
                            {startIndex + idx + 1}
                          </td>
                          <td className="px-3.5 py-2.5 font-mono font-bold text-emerald-500 whitespace-nowrap">
                            <button
                              onClick={() => {
                                setLineListOpen(false);
                                const actualSiteCode = row.siteCode || row.clinicId?.split('-')[0] || (siteCode === 'ALL' ? '0102' : siteCode);
                                navigate(buildPatient360Path({ siteCode: actualSiteCode, clinicId: row.clinicId }));
                              }}
                              className="hover:underline inline-flex items-center gap-1 text-emerald-500 text-left whitespace-nowrap"
                            >
                              <span>{row.clinicId}</span>
                              <RiExternalLinkLine className="size-3 text-emerald-500/70 shrink-0" />
                            </button>
                          </td>

                          <td className="px-3.5 py-2.5 whitespace-nowrap">
                            <span
                              className="px-2 py-0.5 text-[10px] font-bold border"
                              style={{
                                backgroundColor: `${row.categoryColor}15`,
                                color: row.categoryColor,
                                borderColor: `${row.categoryColor}30`
                              }}
                            >
                              {row.categoryName}
                            </span>
                          </td>
                          <td className="px-3.5 py-2.5 font-mono text-muted-foreground whitespace-nowrap">
                            {row.scheduledDate}
                          </td>
                          <td className="px-3.5 py-2.5 font-mono font-bold text-foreground whitespace-nowrap">
                            {row.actualVisitDate}
                          </td>
                          <td className="px-3.5 py-2.5 font-bold whitespace-nowrap">
                            <span
                              className={`px-2 py-0.5 text-[10px] font-bold border ${
                                row.daysDiff === 0
                                  ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                                  : (row.daysDiff < 0
                                      ? 'bg-blue-500/10 text-blue-500 border-blue-500/30'
                                      : (row.daysDiff <= 28
                                          ? 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                                          : 'bg-rose-500/10 text-rose-500 border-rose-500/30'))
                              }`}
                            >
                              {row.daysDiffText}
                            </span>
                          </td>
                          <td className="px-3.5 py-2.5 text-[11px] text-muted-foreground whitespace-nowrap">
                            {row.bufferPills}
                          </td>
                          <td className="px-3.5 py-2.5 font-bold text-foreground whitespace-nowrap">
                            {row.siteName}
                          </td>
                          <td className="px-3.5 py-2.5 text-center whitespace-nowrap">
                            <button
                              onClick={() => {
                                setLineListOpen(false);
                                const actualSiteCode = row.siteCode || row.clinicId?.split('-')[0] || (siteCode === 'ALL' ? '0102' : siteCode);
                                navigate(buildPatient360Path({ siteCode: actualSiteCode, clinicId: row.clinicId }));
                              }}
                              className="px-2.5 py-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500 hover:text-white border border-emerald-500/30 transition-colors inline-flex items-center gap-1 whitespace-nowrap shrink-0"
                            >
                              <RiUserSearchLine className="size-3" />
                              <span>៣៦០°</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Modal Footer with Interactive Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border/60 px-5 py-3 bg-muted/30 shrink-0">
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>
                  បង្ហាញពី <strong className="text-foreground">{totalAppointmentModalRows === 0 ? 0 : startIndex + 1}</strong> ដល់ <strong className="text-foreground">{Math.min(startIndex + modalPageSize, totalAppointmentModalRows)}</strong> នៃសរុប <strong className="text-emerald-500 font-bold">{modalTotalCount.toLocaleString()}</strong> នាក់
                </span>
                <div className="flex items-center gap-1">
                  <span>ទំហំ:</span>
                  <select
                    value={modalPageSize}
                    onChange={(e) => {
                      setModalPageSize(Number(e.target.value));
                      setModalPage(1);
                    }}
                    className="bg-card border border-border/60 text-xs font-bold text-foreground px-1.5 py-0.5 outline-none cursor-pointer"
                  >
                    <option value={20}>20 / ទំព័រ</option>
                    <option value={50}>50 / ទំព័រ</option>
                    <option value={100}>100 / ទំព័រ</option>
                  </select>
                </div>
              </div>

              {/* Pagination Controls */}
              <div className="flex items-center gap-1.5">
                <button
                  disabled={safePage <= 1}
                  onClick={() => setModalPage(prev => Math.max(1, prev - 1))}
                  className="p-1.5 border border-border/60 text-xs font-bold bg-card text-foreground disabled:opacity-30 disabled:cursor-not-allowed hover:bg-muted transition-colors inline-flex items-center gap-1"
                >
                  <RiArrowLeftSLine className="size-4" />
                  <span>ថយក្រោយ</span>
                </button>
                <span className="text-xs font-mono font-bold px-2 text-foreground">
                  {safePage} / {totalPages}
                </span>
                <button
                  disabled={safePage >= totalPages}
                  onClick={() => setModalPage(prev => Math.min(totalPages, prev + 1))}
                  className="p-1.5 border border-border/60 text-xs font-bold bg-card text-foreground disabled:opacity-30 disabled:cursor-not-allowed hover:bg-muted transition-colors inline-flex items-center gap-1"
                >
                  <span>ទៅមុខ</span>
                  <RiArrowRightSLine className="size-4" />
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
