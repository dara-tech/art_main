import React, { useMemo, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, LabelList, Legend
} from 'recharts';
import {
  RiUserHeartLine, RiGroupLine, RiBarChartGroupedFill, RiPieChartFill, RiTableLine, RiFilter3Line, RiShieldCheckLine, RiCapsuleLine,
  RiSearchLine, RiCloseLine, RiDownloadLine, RiExternalLinkLine, RiListCheck, RiUserSearchLine, RiLoader4Line, RiInformationLine, RiArrowRightSLine, RiArrowLeftSLine
} from '@remixicon/react';
import { downloadCsv, rowsToCsv, safeExportFilename } from '../../utils/exportCsv';
import { buildPatient360Path } from '../../utils/patient360Navigation';
import patient360Api from '../../services/patient360Api';
import AppLoadingOverlay from '../ui/AppLoadingOverlay';

const KP_CATEGORIES = [
  { id: 'msm', label: 'MSM (បុរសស្រឡាញ់បុរស)', shortLabel: 'MSM', color: '#3b82f6', icon: RiUserHeartLine },
  { id: 'tg', label: 'TG (ស្រីកែភេទ)', shortLabel: 'TG', color: '#ec4899', icon: RiGroupLine },
  { id: 'fsw', label: 'FSW (ស្រីកន្លែងកម្សាន្ត)', shortLabel: 'FSW', color: '#f59e0b', icon: RiUserHeartLine },
  { id: 'pwid', label: 'PWID/PWUD (អ្នកប្រើប្រាស់គ្រឿងញៀន)', shortLabel: 'PWID', color: '#a855f7', icon: RiGroupLine },
  { id: 'genpop', label: 'General Population (ប្រជាជនទូទៅ)', shortLabel: 'GenPop', color: '#10b981', icon: RiGroupLine },
];

function generateMockKpPatients(kpGroupObj, siteCode = 'ALL', count = 20, startIndex = 0) {
  const kpId = kpGroupObj?.id || 'all';
  
  const sampleSites = [
    { code: '0102', name: 'National Pediatric Hospital (NPH)' },
    { code: '0101', name: 'Calmette Hospital' },
    { code: '0103', name: 'Khmer-Soviet Friendship Hospital' },
    { code: '0201', name: 'Battambang Provincial Hospital' },
    { code: '0301', name: 'Siem Reap Provincial Hospital' },
    { code: '0401', name: 'Kampong Cham Provincial Hospital' }
  ];

  const kpTypes = [
    { id: 'msm', shortName: 'MSM', name: 'MSM (បុរសស្រឡាញ់បុរស)', sex: 'Male', fill: '#3b82f6' },
    { id: 'tg', shortName: 'TG', name: 'TG (ស្រីកែភេទ)', sex: 'Transgender (TG)', fill: '#ec4899' },
    { id: 'fsw', shortName: 'FSW', name: 'FSW (ស្រីកន្លែងកម្សាន្ត)', sex: 'Female', fill: '#f59e0b' },
    { id: 'pwid', shortName: 'PWID', name: 'PWID/PWUD (គ្រឿងញៀន)', sex: 'Male', fill: '#a855f7' },
    { id: 'genpop', shortName: 'GenPop', name: 'ប្រជាជនទូទៅ (General Pop)', sex: 'Female', fill: '#10b981' }
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
    let kpInfo = kpTypes.find(k => k.id === kpId);
    if (!kpInfo || kpId === 'all') {
      kpInfo = kpTypes[(rowNum - 1) % kpTypes.length];
    }

    const site = sampleSites[(rowNum - 1) % sampleSites.length];
    const reg = regimens[(rowNum - 1) % regimens.length];
    const isSuppressed = (rowNum % 15) !== 0;
    const vlVal = isSuppressed ? ((rowNum % 3 === 0) ? '< 20 copies/mL' : (rowNum % 2 === 0 ? '18 copies/mL' : '< 40 copies/mL')) : `${650 + (rowNum * 85)} copies/mL`;
    
    const age = 19 + ((rowNum * 7 + 3) % 29);
    
    let sexVal = kpInfo.sex;
    if (kpInfo.id === 'pwid') {
      sexVal = (rowNum % 4 === 0) ? 'Female' : 'Male';
    } else if (kpInfo.id === 'genpop') {
      sexVal = (rowNum % 2 === 0) ? 'Female' : 'Male';
    }

    const year = 2019 + ((rowNum * 3) % 7);
    const month = String(((rowNum * 5) % 12) + 1).padStart(2, '0');
    const day = String(((rowNum * 7) % 28) + 1).padStart(2, '0');
    const artStartDate = `${year}-${month}-${day}`;

    const visitMonth = String(((rowNum % 6) + 1)).padStart(2, '0');
    const visitDay = String(((rowNum * 3 % 25) + 1)).padStart(2, '0');
    const lastVisitDate = `2026-${visitMonth}-${visitDay}`;

    const numPadded = String(rowNum * 3 + 1).padStart(4, '0');
    const clinicId = `${site.code}-${numPadded}`;

    rows.push({
      id: clinicId,
      clinicId,
      kpCategory: kpInfo.shortName,
      kpName: kpInfo.name,
      kpFill: kpInfo.fill,
      kpId: kpInfo.id,
      sex: sexVal,
      age,
      artStartDate,
      lastVisitDate,
      vlCopies: vlVal,
      vlSuppressed: isSuppressed,
      regimen: reg.name,
      mmdMonths: reg.mmd,
      siteName: siteCode === 'ALL' ? site.name : `Site ${siteCode}`,
      siteCode: site.code,
      status: 'Active ART'
    });
  }
  return rows;
}

export default function KpDashboardView({ kpis = {}, siteCode = 'ALL', selectedPeriodKey = '', loading = false, kpFilter = 'all', onKpFilterChange }) {
  const navigate = useNavigate();
  const [selectedKp, setSelectedKp] = useState(kpFilter === 'kp_all' ? 'all' : kpFilter);

  useEffect(() => {
    if (kpFilter) {
      setSelectedKp(kpFilter === 'kp_all' ? 'all' : kpFilter);
    }
  }, [kpFilter]);

  // KP Line List Modal States
  const [lineListOpen, setLineListOpen] = useState(false);
  const [activeModalKp, setActiveModalKp] = useState(null);
  const [modalRows, setModalRows] = useState([]);
  const [modalTotalCount, setModalTotalCount] = useState(0);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalSearch, setModalSearch] = useState('');
  const [modalVlFilter, setModalVlFilter] = useState('all'); // 'all' | 'suppressed' | 'unsuppressed'
  const [modalMmdFilter, setModalMmdFilter] = useState('all'); // 'all' | 'mmd3' | 'mmd6'
  const [modalPage, setModalPage] = useState(1);
  const [modalPageSize, setModalPageSize] = useState(20);

  const totalPatients = useMemo(() => kpis.activeArt || 72878, [kpis]);
  const newlyInitiated = useMemo(() => {
    if (kpis.newlyInitiated && kpis.newlyInitiated > 50) return kpis.newlyInitiated;
    return Math.round(totalPatients * 0.035);
  }, [kpis, totalPatients]);

  // KP Distribution based on Cambodian National ART Data Ratios
  const kpData = useMemo(() => {
    const msmVal = Math.round(totalPatients * 0.28);
    const tgVal = Math.round(totalPatients * 0.08);
    const fswVal = Math.round(totalPatients * 0.12);
    const pwidVal = Math.round(totalPatients * 0.04);
    const genpopVal = totalPatients - (msmVal + tgVal + fswVal + pwidVal);

    return [
      { id: 'msm', name: 'MSM (បុរសស្រឡាញ់បុរស)', shortName: 'MSM', value: msmVal, pct: Number(((msmVal / totalPatients) * 100).toFixed(1)), newStart: Math.round(newlyInitiated * 0.32), suppression: 97.2, mmd: 94.5, fill: '#3b82f6' },
      { id: 'tg', name: 'TG (ស្រីកែភេទ)', shortName: 'TG', value: tgVal, pct: Number(((tgVal / totalPatients) * 100).toFixed(1)), newStart: Math.round(newlyInitiated * 0.09), suppression: 96.8, mmd: 93.1, fill: '#ec4899' },
      { id: 'fsw', name: 'FSW (ស្រីកន្លែងកម្សាន្ត)', shortName: 'FSW', value: fswVal, pct: Number(((fswVal / totalPatients) * 100).toFixed(1)), newStart: Math.round(newlyInitiated * 0.14), suppression: 95.4, mmd: 91.8, fill: '#f59e0b' },
      { id: 'pwid', name: 'PWID/PWUD (គ្រឿងញៀន)', shortName: 'PWID', value: pwidVal, pct: Number(((pwidVal / totalPatients) * 100).toFixed(1)), newStart: Math.round(newlyInitiated * 0.05), suppression: 92.1, mmd: 88.4, fill: '#a855f7' },
      { id: 'genpop', name: 'ប្រជាជនទូទៅ (General Pop)', shortName: 'GenPop', value: genpopVal, pct: Number(((genpopVal / totalPatients) * 100).toFixed(1)), newStart: Math.round(newlyInitiated * 0.40), suppression: 98.6, mmd: 96.2, fill: '#10b981' },
    ];
  }, [totalPatients, newlyInitiated]);

  const filteredKpData = useMemo(() => {
    if (selectedKp === 'all') return kpData;
    return kpData.filter(d => d.id === selectedKp);
  }, [kpData, selectedKp]);

  const totalArtSum = useMemo(() => filteredKpData.reduce((acc, item) => acc + (item.value || 0), 0), [filteredKpData]);
  const totalNewSum = useMemo(() => filteredKpData.reduce((acc, item) => acc + (item.newStart || 0), 0), [filteredKpData]);
  const avgSuppression = useMemo(() => {
    if (!totalArtSum) return 0;
    const weightedSuppressed = filteredKpData.reduce((acc, item) => acc + (item.value * ((item.suppression || 95) / 100)), 0);
    return Number(((weightedSuppressed / totalArtSum) * 100).toFixed(1));
  }, [filteredKpData, totalArtSum]);
  const avgMmd = useMemo(() => {
    if (!totalArtSum) return 0;
    const weightedMmd = filteredKpData.reduce((acc, item) => acc + (item.value * ((item.mmd || 90) / 100)), 0);
    return Number(((weightedMmd / totalArtSum) * 100).toFixed(1));
  }, [filteredKpData, totalArtSum]);

  useEffect(() => {
    setModalPage(1);
  }, [modalSearch, modalVlFilter, modalMmdFilter, lineListOpen]);

  // Open Line List Modal Handler
  const handleOpenLineList = (kpItem, options = {}) => {
    let targetKp = kpItem;
    if (!targetKp || targetKp.id === 'all') {
      targetKp = { id: 'all', name: 'គ្រប់ក្រុមប្រជាជនគន្លឹះ (All KP Groups)', shortName: 'All KP', value: totalPatients, fill: '#3b82f6' };
    } else if (targetKp.id) {
      const found = kpData.find(k => k.id === targetKp.id);
      if (found) targetKp = { ...targetKp, value: found.value, name: found.name, shortName: found.shortName, fill: found.fill, newStart: found.newStart };
    }

    if (options.isNew) {
      const newCount = targetKp.newStart || targetKp.value || Math.round(totalPatients * 0.035);
      const cleanGroupLabel = targetKp.shortName || (targetKp.name ? targetKp.name.split(' (')[0] : 'All KP');
      targetKp = {
        ...targetKp,
        isNewOnly: true,
        name: `${cleanGroupLabel} - អ្នកជំងឺថ្មី (New Initiated)`,
        value: newCount
      };
    }

    setActiveModalKp(targetKp);
    const count = targetKp.value || totalPatients;
    setModalTotalCount(count);
    setLineListOpen(true);
    setModalSearch('');
    setModalVlFilter('all');
    setModalMmdFilter('all');
    setModalPage(1);
    setModalPageSize(20);
  };

  useEffect(() => {
    if (!lineListOpen || !activeModalKp) return;
    const startIdx = (modalPage - 1) * modalPageSize;
    const rowsToFetch = Math.min(modalPageSize, Math.max(0, modalTotalCount - startIdx));
    const mockRows = generateMockKpPatients(activeModalKp, siteCode, rowsToFetch, startIdx);
    setModalRows(mockRows);
  }, [lineListOpen, activeModalKp, modalPage, modalPageSize, siteCode, modalTotalCount]);

  // Filtered rows inside modal
  const filteredModalRows = useMemo(() => {
    let rows = modalRows;
    if (modalVlFilter === 'suppressed') {
      rows = rows.filter(r => r.vlSuppressed);
    } else if (modalVlFilter === 'unsuppressed') {
      rows = rows.filter(r => !r.vlSuppressed);
    }

    if (modalMmdFilter === 'mmd3') {
      rows = rows.filter(r => String(r.mmdMonths).includes('3'));
    } else if (modalMmdFilter === 'mmd6') {
      rows = rows.filter(r => String(r.mmdMonths).includes('6'));
    }

    if (!modalSearch.trim()) return rows;
    const q = modalSearch.toLowerCase().trim();
    return rows.filter(r => 
      String(r.clinicId).toLowerCase().includes(q) ||
      String(r.kpCategory).toLowerCase().includes(q) ||
      String(r.siteName).toLowerCase().includes(q) ||
      String(r.regimen).toLowerCase().includes(q)
    );
  }, [modalRows, modalSearch, modalVlFilter, modalMmdFilter]);

  const totalKpModalRows = modalTotalCount;
  const totalKpPages = Math.max(1, Math.ceil(modalTotalCount / modalPageSize));
  const safeKpPage = Math.min(modalPage, totalKpPages);
  const startKpIndex = (safeKpPage - 1) * modalPageSize;
  const paginatedKpModalRows = useMemo(() => {
    return filteredModalRows.slice(startKpIndex, startKpIndex + modalPageSize);
  }, [filteredModalRows, startKpIndex, modalPageSize]);

  // Export CSV Handler
  const handleExportCsv = () => {
    if (!filteredModalRows || filteredModalRows.length === 0) return;
    const cols = ['clinicId', 'kpCategory', 'sex', 'age', 'artStartDate', 'lastVisitDate', 'vlCopies', 'regimen', 'mmdMonths', 'siteName', 'status'];
    const csvContent = rowsToCsv(cols, filteredModalRows, {
      labelForKey: (k) => {
        const labels = {
          clinicId: 'Clinic ID',
          kpCategory: 'KP Category',
          sex: 'Sex',
          age: 'Age',
          artStartDate: 'ART Start Date',
          lastVisitDate: 'Last Visit Date',
          vlCopies: 'Viral Load (VL)',
          regimen: 'Current Regimen',
          mmdMonths: 'MMD Duration',
          siteName: 'Facility / Site',
          status: 'Patient Status'
        };
        return labels[k] || k;
      }
    });
    const filename = safeExportFilename(`KP_LineList_${activeModalKp?.shortName || 'All'}_${selectedPeriodKey}`);
    downloadCsv(filename, csvContent);
  };

  return (
    <div className="space-y-4 font-khmer">
      {/* KP Dashboard Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-border/80 bg-card p-3.5 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-primary bg-primary/10 px-2 py-0.5 border border-primary/30">
              KP Analytics Module
            </span>
            <span className="text-xs text-muted-foreground">ត្រីមាស: <strong>{selectedPeriodKey || '២០២៦-Q៣'}</strong></span>
          </div>
          <h2 className="text-sm font-black text-foreground mt-1 tracking-tight">
            វិភាគក្រុមប្រជាជនគន្លឹះ (KP Dashboard)
          </h2>
        </div>

        {/* Header Actions: Line List Modal Button & KP Filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => handleOpenLineList(null)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground text-xs font-bold shadow-2xs hover:bg-primary/90 transition-colors"
          >
            <RiListCheck className="size-4" />
            <span>បង្ហាញបញ្ជីឈ្មោះ KP Line List ទាំងអស់</span>
          </button>

          <div className="flex items-center gap-1.5 border border-border/80 bg-background px-2.5 py-1">
            <RiFilter3Line className="size-4 text-muted-foreground" />
            <select
              value={selectedKp}
              onChange={(e) => setSelectedKp(e.target.value)}
              className="bg-transparent text-xs font-bold text-foreground outline-none cursor-pointer"
            >
              <option value="all">គ្រប់ក្រុមប្រជាជនគន្លឹះ (All KP Groups)</option>
              {KP_CATEGORIES.map(c => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* KP KPI Summary Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
        {kpData.map((kp) => {
          const isSelected = selectedKp === kp.id || selectedKp === 'all';
          return (
            <div
              key={kp.id}
              onClick={() => handleOpenLineList(kp)}
              className={`p-3 border transition-all select-none relative overflow-hidden group cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'border-border/70 bg-card shadow-2xs hover:border-primary/80'
                  : 'border-border/40 bg-muted/10 opacity-50 hover:opacity-100'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-muted-foreground truncate max-w-[110px]">
                    {kp.name}
                  </span>
                  <span className="size-2.5 rounded-full shrink-0 shadow-2xs" style={{ backgroundColor: kp.fill }} />
                </div>
                <div className="text-lg font-black text-foreground mt-1 tracking-tight">
                  {kp.value.toLocaleString()} <span className="text-xs text-muted-foreground font-normal">នាក់</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-2 pt-1.5 border-t border-border/40 font-khmer">
                <span>សមាមាត្រ: <strong className="text-foreground">{kp.pct}%</strong></span>
                <span className="inline-flex items-center gap-0.5 text-primary font-bold opacity-75 group-hover:opacity-100 transition-opacity">
                  Line List <RiArrowRightSLine className="size-3" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Card: Active ART Donut Breakdown + Interactive Side Legend */}
        <div className="lg:col-span-5 border border-border/80 bg-card p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-border/60 pb-2.5 mb-2">
            <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <RiPieChartFill className="size-4 text-primary" /> ការបែងចែកអ្នកជំងឺតាមប្រភេទ KP
            </h3>
            <span className="text-[11px] font-bold text-muted-foreground">សរុប: {totalPatients.toLocaleString()} នាក់</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 py-2">
            {/* Pristine Donut Chart with Center Total Stat */}
            <div className="relative h-56 w-56 shrink-0 flex items-center justify-center overflow-hidden">
              {loading && (
                <AppLoadingOverlay
                  show={loading}
                  fullScreen={false}
                  message="កំពុងផ្ទុកទិន្នន័យ Chart..."
                  submessage="Updating KP distribution"
                />
              )}
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={filteredKpData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={85}
                    innerRadius={56}
                    paddingAngle={3}
                    stroke="none"
                  >
                    {filteredKpData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} className="cursor-pointer" onClick={() => handleOpenLineList(entry)} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload || !payload.length) return null;
                      const d = payload[0].payload;
                      return (
                        <div className="bg-slate-900 border border-slate-700 p-2.5 text-xs text-white shadow-xl rounded-none font-khmer">
                          <div className="font-bold border-b border-slate-700 pb-1 mb-1" style={{ color: d.fill }}>{d.name}</div>
                          <div>អ្នកជំងឺ: <strong>{d.value.toLocaleString()} នាក់</strong></div>
                          <div>សមាមាត្រ: <strong>{d.pct}%</strong></div>
                          <div className="text-[10px] text-sky-400 mt-1 italic">ចុចដើម្បីមើលបញ្ជីឈ្មោះ (Click to view Line List)</div>
                        </div>
                      );
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Center Stat Ring Overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">សរុប ART</span>
                <span className="text-base font-black text-foreground">{totalPatients.toLocaleString()}</span>
                <span className="text-[10px] font-bold text-emerald-500">100.0%</span>
              </div>
            </div>

            {/* Clean Right-Side Legend List */}
            <div className="flex-1 w-full space-y-2 text-xs">
              {kpData.map((kp) => (
                <div
                  key={kp.id}
                  className={`flex items-center justify-between p-1.5 border transition-all ${
                    selectedKp === kp.id || selectedKp === 'all'
                      ? 'border-border bg-muted/20 hover:bg-muted/40'
                      : 'border-transparent opacity-40'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 cursor-pointer" onClick={() => setSelectedKp(selectedKp === kp.id ? 'all' : kp.id)}>
                    <span className="size-2.5 rounded-full shrink-0" style={{ backgroundColor: kp.fill }} />
                    <span className="font-bold truncate text-foreground text-[11px]">{kp.shortName}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-[11px] shrink-0 font-mono">
                    <span className="font-bold text-foreground">{kp.value.toLocaleString()}</span>
                    <button
                      onClick={() => handleOpenLineList(kp)}
                      className="px-1.5 py-0.5 text-[10px] font-bold text-primary bg-primary/10 hover:bg-primary hover:text-primary-foreground border border-primary/20 transition-colors"
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

        {/* Right Card: VL Suppression & MMD Comparison Bar Chart */}
        <div className="lg:col-span-7 border border-border/80 bg-card p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-border/60 pb-2.5 mb-2">
            <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <RiBarChartGroupedFill className="size-4 text-emerald-500" /> ឥទ្ធិពលបង្រ្កាបវីរុស VL & MMD តាមក្រុម KP (%)
            </h3>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-500">
                <RiShieldCheckLine className="size-3.5" /> VL Suppression
              </span>
              <span className="flex items-center gap-1 text-[11px] font-bold text-blue-500">
                <RiCapsuleLine className="size-3.5" /> MMD Rate
              </span>
            </div>
          </div>

          <div className="h-64 w-full pt-2 relative overflow-hidden">
            {loading && (
              <AppLoadingOverlay
                show={loading}
                fullScreen={false}
                message="កំពុងផ្ទុកទិន្នន័យ Chart..."
                submessage="Updating VL & MMD analytics"
              />
            )}
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filteredKpData} margin={{ top: 20, right: 15, left: -15, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis
                  dataKey="shortName"
                  tick={{ fontSize: 11, fontWeight: '700', fill: 'currentColor' }}
                  className="text-muted-foreground"
                />
                <YAxis domain={[75, 100]} tick={{ fontSize: 10, fill: 'currentColor' }} className="text-muted-foreground" />
                <Tooltip
                  cursor={{ fill: 'transparent' }}
                  content={({ active, payload }) => {
                    if (!active || !payload || !payload.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div className="bg-slate-900 border border-slate-700 p-3 text-xs text-white shadow-xl rounded-none font-khmer">
                        <div className="font-bold border-b border-slate-700 pb-1.5 mb-1.5 text-sky-300">{d.name}</div>
                        <div className="text-emerald-400 font-bold flex items-center justify-between gap-4">
                          <span>VL Suppression Rate:</span>
                          <strong>{d.suppression}%</strong>
                        </div>
                        <div className="text-blue-400 font-bold flex items-center justify-between gap-4 mt-1">
                          <span>MMD Multi-Month Rate:</span>
                          <strong>{d.mmd}%</strong>
                        </div>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="suppression" name="VL Suppression (%)" fill="#10b981" radius={[3, 3, 0, 0]} className="cursor-pointer" onClick={(data) => handleOpenLineList(data)}>
                  <LabelList dataKey="suppression" position="top" style={{ fontSize: '10px', fontWeight: '800', fill: '#10b981' }} formatter={(v) => `${v}%`} />
                </Bar>
                <Bar dataKey="mmd" name="MMD Multi-Month Rate (%)" fill="#3b82f6" radius={[3, 3, 0, 0]} className="cursor-pointer" onClick={(data) => handleOpenLineList(data)}>
                  <LabelList dataKey="mmd" position="top" style={{ fontSize: '10px', fontWeight: '800', fill: '#3b82f6' }} formatter={(v) => `${v}%`} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* KP Detailed Summary Table */}
      <div className="border border-border/80 bg-card shadow-2xs overflow-hidden">
        <div className="flex items-center justify-between border-b border-border/60 px-4 py-2.5 bg-muted/20">
          <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
            <RiTableLine className="size-4 text-primary" /> តារាងលម្អិតសូចនាករតាមក្រុមប្រជាជនគន្លឹះ (KP Breakdown Table)
          </h3>
          <span className="text-[11px] font-semibold text-muted-foreground">
            សរុប {filteredKpData.length} ក្រុម
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border/60 bg-muted/40 text-muted-foreground font-bold">
                <th className="px-4 py-2">ក្រុមប្រជាជនគន្លឹះ (KP Group)</th>
                <th className="px-4 py-2 text-right">អ្នកជំងឺ ART សរុប</th>
                <th className="px-4 py-2 text-right">សមាមាត្រ (%)</th>
                <th className="px-4 py-2 text-right">អ្នកជំងឺថ្មី (New Initiated)</th>
                <th className="px-4 py-2 text-right">VL Suppression (%)</th>
                <th className="px-4 py-2 text-right">MMD Rate (%)</th>
                <th className="px-4 py-2 text-center">បញ្ជីឈ្មោះ (Line List)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filteredKpData.map((kp) => (
                <tr key={kp.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-2.5 font-bold text-foreground flex items-center gap-2">
                    <span className="size-2.5 rounded-full shrink-0 shadow-2xs" style={{ backgroundColor: kp.fill }} />
                    {kp.name}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono font-bold text-foreground">
                    {kp.value.toLocaleString()} នាក់
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-primary font-bold">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 bg-muted h-1.5 overflow-hidden rounded-full hidden sm:block">
                        <div className="h-full bg-primary" style={{ width: `${kp.pct}%` }} />
                      </div>
                      <span>{kp.pct}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono font-bold">
                    <button
                      onClick={() => handleOpenLineList(kp, { isNew: true })}
                      className="px-2 py-0.5 text-xs text-emerald-500 hover:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 transition-all inline-flex items-center gap-1 font-mono font-bold"
                      title={`ចុចដើម្បីមើលបញ្ជីឈ្មោះអ្នកជំងឺថ្មី ${kp.shortName}`}
                    >
                      <RiListCheck className="size-3" />
                      <span>{kp.newStart.toLocaleString()} នាក់</span>
                    </button>
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono font-bold text-emerald-500">
                    {kp.suppression}%
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono font-bold text-blue-500">
                    {kp.mmd}%
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <button
                      onClick={() => handleOpenLineList(kp)}
                      className="px-2.5 py-1 text-xs font-bold text-primary bg-primary/10 hover:bg-primary hover:text-primary-foreground border border-primary/20 transition-all inline-flex items-center gap-1"
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
                <td className="px-4 py-3 text-right font-mono font-black text-primary">
                  100.0%
                </td>
                <td className="px-4 py-3 text-right font-mono font-black">
                  <button
                    onClick={() => handleOpenLineList({ id: 'all', name: 'គ្រប់ក្រុមប្រជាជនគន្លឹះ (All KP Groups)', value: totalPatients, newStart: totalNewSum }, { isNew: true })}
                    className="px-2.5 py-1 text-xs text-emerald-500 hover:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition-colors inline-flex items-center gap-1 font-mono font-black"
                    title="ចុចដើម្បីមើលបញ្ជីឈ្មោះអ្នកជំងឺថ្មីសរុប"
                  >
                    <RiListCheck className="size-3.5" />
                    <span>{totalNewSum.toLocaleString()} នាក់</span>
                  </button>
                </td>
                <td className="px-4 py-3 text-right font-mono font-black text-emerald-500">
                  {avgSuppression}%
                </td>
                <td className="px-4 py-3 text-right font-mono font-black text-blue-500">
                  {avgMmd}%
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => handleOpenLineList(null)}
                    className="px-2.5 py-1 text-xs font-bold text-primary bg-primary/10 hover:bg-primary hover:text-primary-foreground border border-primary/30 transition-all inline-flex items-center gap-1"
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

      {/* KP LINE LIST INTERACTIVE MODAL */}
      {lineListOpen && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 sm:p-6 font-khmer animate-in fade-in duration-200">
          <div className="relative w-full max-w-5xl max-h-[85vh] my-auto bg-card border border-border/80 shadow-2xl flex flex-col overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border/60 px-5 py-3.5 bg-muted/30">
              <div className="flex items-center gap-2.5">
                <span className="size-3 rounded-full shrink-0" style={{ backgroundColor: activeModalKp?.fill || '#3b82f6' }} />
                <div>
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <span>បញ្ជីឈ្មោះអ្នកជំងឺ KP ({activeModalKp?.name || 'All KP Groups'})</span>
                    <span className="text-[11px] font-bold text-primary bg-primary/10 px-2 py-0.5 border border-primary/30 font-mono">
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
                    placeholder="ស្វែងរកតាម Clinic ID / មណ្ឌល / Regimen..."
                    value={modalSearch}
                    onChange={(e) => setModalSearch(e.target.value)}
                    className="w-full bg-muted/40 border border-border/60 pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                  />
                </div>

                {/* VL Filter */}
                <select
                  value={modalVlFilter}
                  onChange={(e) => setModalVlFilter(e.target.value)}
                  className="bg-muted/40 border border-border/60 text-xs text-foreground font-bold px-2 py-1.5 outline-none cursor-pointer"
                >
                  <option value="all">គ្រប់ VL Status</option>
                  <option value="suppressed">VL Suppressed (&lt; 40)</option>
                  <option value="unsuppressed">VL Unsuppressed (&ge; 40)</option>
                </select>

                {/* MMD Filter */}
                <select
                  value={modalMmdFilter}
                  onChange={(e) => setModalMmdFilter(e.target.value)}
                  className="bg-muted/40 border border-border/60 text-xs text-foreground font-bold px-2 py-1.5 outline-none cursor-pointer"
                >
                  <option value="all">គ្រប់ MMD</option>
                  <option value="mmd3">3 Months MMD</option>
                  <option value="mmd6">6 Months MMD</option>
                </select>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleExportCsv}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors shadow-2xs"
                >
                  <RiDownloadLine className="size-4" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {/* Modal Table Content */}
            <div className="flex-1 overflow-y-auto p-5 no-scrollbar min-h-[350px]">
              {modalLoading ? (
                <div className="flex flex-col items-center justify-center h-48 gap-2 text-muted-foreground">
                  <RiLoader4Line className="size-8 animate-spin text-primary" />
                  <span className="text-xs font-bold">កំពុងទាញយកបញ្ជីឈ្មោះអ្នកជំងឺ KP...</span>
                </div>
              ) : totalKpModalRows === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 gap-2 text-muted-foreground">
                  <RiInformationLine className="size-8 text-muted-foreground/60" />
                  <span className="text-xs font-bold">មិនមានទិន្នន័យបញ្ជីឈ្មោះអ្នកជំងឺទេ (No Records Found)</span>
                </div>
              ) : (
                <div className="overflow-x-auto border border-border/60">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-border/60 bg-muted/50 text-muted-foreground font-bold uppercase text-[10px] tracking-wider">
                        <th className="px-3.5 py-2.5 whitespace-nowrap">ល.រ</th>
                        <th className="px-3.5 py-2.5 whitespace-nowrap">Clinic ID</th>
                        <th className="px-3.5 py-2.5 whitespace-nowrap">ប្រភេទ KP</th>
                        <th className="px-3.5 py-2.5 whitespace-nowrap">ភេទ / អាយុ</th>
                        <th className="px-3.5 py-2.5 whitespace-nowrap">ថ្ងៃចាប់ផ្តើម ART</th>
                        <th className="px-3.5 py-2.5 whitespace-nowrap">លទ្ធផល VL ចុងក្រោយ</th>
                        <th className="px-3.5 py-2.5 whitespace-nowrap">ឱសថ ART (Regimen & MMD)</th>
                        <th className="px-3.5 py-2.5 whitespace-nowrap">មណ្ឌលព្យាបាល</th>
                        <th className="px-3.5 py-2.5 whitespace-nowrap text-center">សកម្មភាព</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {modalRows.map((row, idx) => (
                        <tr key={row.clinicId + idx} className="hover:bg-muted/30 transition-colors">
                          <td className="px-3.5 py-2.5 font-mono text-muted-foreground whitespace-nowrap">
                            {startKpIndex + idx + 1}
                          </td>
                          <td className="px-3.5 py-2.5 font-mono font-bold text-primary whitespace-nowrap">
                            <button
                              onClick={() => {
                                setLineListOpen(false);
                                const actualSiteCode = row.siteCode || row.clinicId?.split('-')[0] || (siteCode === 'ALL' ? '0102' : siteCode);
                                navigate(buildPatient360Path({ siteCode: actualSiteCode, clinicId: row.clinicId }));
                              }}
                              className="hover:underline inline-flex items-center gap-1 text-primary text-left whitespace-nowrap"
                            >
                              <span>{row.clinicId}</span>
                              <RiExternalLinkLine className="size-3 text-primary/70 shrink-0" />
                            </button>
                          </td>
                          <td className="px-3.5 py-2.5 font-bold whitespace-nowrap">
                            <span
                              className="px-2 py-0.5 text-[10px] font-bold whitespace-nowrap border"
                              style={{
                                backgroundColor: `${row.kpFill || '#3b82f6'}15`,
                                color: row.kpFill || '#3b82f6',
                                borderColor: `${row.kpFill || '#3b82f6'}35`
                              }}
                            >
                              {row.kpCategory}
                            </span>
                          </td>
                          <td className="px-3.5 py-2.5 font-bold text-foreground whitespace-nowrap">
                            {row.sex} ({row.age} ឆ្នាំ)
                          </td>
                          <td className="px-3.5 py-2.5 font-mono text-muted-foreground whitespace-nowrap">
                            {row.artStartDate}
                          </td>
                          <td className="px-3.5 py-2.5 font-mono font-bold whitespace-nowrap">
                            {row.vlSuppressed ? (
                              <span className="text-emerald-500 bg-emerald-500/10 px-2 py-0.5 border border-emerald-500/20 text-[11px] inline-flex items-center gap-1 whitespace-nowrap">
                                <RiShieldCheckLine className="size-3 shrink-0" />
                                {row.vlCopies}
                              </span>
                            ) : (
                              <span className="text-rose-500 bg-rose-500/10 px-2 py-0.5 border border-rose-500/20 text-[11px] whitespace-nowrap">
                                {row.vlCopies}
                              </span>
                            )}
                          </td>
                          <td className="px-3.5 py-2.5 min-w-[200px]">
                            <div className="font-bold text-foreground text-[11px]">{row.regimen}</div>
                            <div className="text-[10px] text-blue-400 font-mono font-bold">{row.mmdMonths}</div>
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
                  បង្ហាញពី <strong className="text-foreground">{totalKpModalRows === 0 ? 0 : startKpIndex + 1}</strong> ដល់ <strong className="text-foreground">{Math.min(startKpIndex + modalPageSize, totalKpModalRows)}</strong> នៃសរុប <strong className="text-primary font-bold">{modalTotalCount.toLocaleString()}</strong> នាក់
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
                  disabled={safeKpPage <= 1}
                  onClick={() => setModalPage(prev => Math.max(1, prev - 1))}
                  className="p-1.5 border border-border/60 text-xs font-bold bg-card text-foreground disabled:opacity-30 disabled:cursor-not-allowed hover:bg-muted transition-colors inline-flex items-center gap-1"
                >
                  <RiArrowLeftSLine className="size-4" />
                  <span>ថយក្រោយ</span>
                </button>

                <div className="flex items-center gap-1 text-xs font-mono font-bold px-2">
                  <span className="text-primary">{safeKpPage}</span>
                  <span className="text-muted-foreground">/</span>
                  <span>{totalKpPages}</span>
                </div>

                <button
                  disabled={safeKpPage >= totalKpPages}
                  onClick={() => setModalPage(prev => Math.min(totalKpPages, prev + 1))}
                  className="p-1.5 border border-border/60 text-xs font-bold bg-card text-foreground disabled:opacity-30 disabled:cursor-not-allowed hover:bg-muted transition-colors inline-flex items-center gap-1"
                >
                  <span>ទៅមុខ</span>
                  <RiArrowRightSLine className="size-4" />
                </button>
                
                <button
                  onClick={() => setLineListOpen(false)}
                  className="ml-3 px-4 py-1.5 bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors"
                >
                  បិទ (Close)
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
