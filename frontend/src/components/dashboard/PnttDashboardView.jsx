import React, { useMemo, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, LabelList, Legend
} from 'recharts';
import {
  RiHeartPulseLine, RiGroupLine, RiBarChartGroupedFill, RiPieChartFill, RiTableLine, RiFilter3Line, RiShieldCheckLine, RiCapsuleLine,
  RiSearchLine, RiCloseLine, RiDownloadLine, RiExternalLinkLine, RiListCheck, RiUserSearchLine, RiLoader4Line, RiInformationLine,
  RiArrowRightSLine, RiArrowLeftSLine, RiUserHeartLine, RiUserAddLine, RiCheckDoubleLine, RiAlertLine
} from '@remixicon/react';
import { downloadCsv, rowsToCsv, safeExportFilename } from '../../utils/exportCsv';
import { buildPatient360Path } from '../../utils/patient360Navigation';
import patient360Api from '../../services/patient360Api';

// Mock/Default PNTT Indicators for Cambodian National HIV Program
const PNTT_CASCADE_STEPS = [
  { key: 'interviewed', label: 'សម្ភាសន៍ PNS', value: 2450, fill: '#3b82f6' },
  { key: 'agreed', label: 'យល់ព្រម PNS', value: 2210, fill: '#06b6d4' },
  { key: 'elicited', label: 'ដៃគូដែលបានផ្តល់ឈ្មោះ', value: 3180, fill: '#8b5cf6' },
  { key: 'tested', label: 'ដៃគូបានធ្វើតេស្ត', value: 2840, fill: '#10b981' },
  { key: 'positive', label: 'ដៃគូ HIV វិជ្ជមាន', value: 312, fill: '#f59e0b' },
  { key: 'linked', label: 'ចូលព្យាបាល ART', value: 298, fill: '#ec4899' }
];

const PNTT_REFERRAL_METHODS = [
  { key: 'provider', name: 'Provider Referral', label: 'គ្រូពេទ្យជួយទាក់ទង', value: 48, fill: '#3b82f6' },
  { key: 'contract', name: 'Contract Referral', label: 'កិច្ចសន្យាប្រគល់ភារកិច្ច', value: 28, fill: '#10b981' },
  { key: 'client', name: 'Client Referral', label: 'អ្នកជំងឺទាក់ទងផ្ទាល់', value: 16, fill: '#f59e0b' },
  { key: 'dual', name: 'Dual Referral', label: 'រួមគ្នាទាក់ទង', value: 8, fill: '#8b5cf6' }
];

const CHILDREN_INDEX_STEPS = [
  { key: 'eligible_children', label: 'កូនត្រូវធ្វើតេស្ត', value: 1250, fill: '#6366f1' },
  { key: 'tested_children', label: 'កូនបានធ្វើតេស្ត', value: 1120, fill: '#10b981' },
  { key: 'positive_children', label: 'កូន HIV វិជ្ជមាន', value: 42, fill: '#ef4444' },
  { key: 'art_children', label: 'កូនចូល ART', value: 41, fill: '#ec4899' }
];

function generateMockPnttRows(categoryKey, siteCode) {
  const rows = [];
  const siteCodeVal = (!siteCode || siteCode === 'ALL' || siteCode === '__CAMBODIA__') ? '0102' : siteCode;
  const count = categoryKey === 'positive' || categoryKey === 'positive_children' ? 35 : 100;

  const referralTypes = ['Provider Referral', 'Client Referral', 'Contract Referral', 'Dual Referral'];
  const testResults = (categoryKey === 'positive' || categoryKey === 'positive_children')
    ? ['HIV Positive']
    : ['HIV Negative', 'HIV Negative', 'HIV Negative', 'HIV Positive'];

  for (let i = 1; i <= count; i++) {
    const pId = String(i).padStart(4, '0');
    const clinicId = `${siteCodeVal}-${pId}`;
    const isChild = categoryKey.includes('child');
    const age = isChild ? Math.floor(Math.random() * 14) + 1 : Math.floor(Math.random() * 35) + 18;
    const sexVal = isChild ? (i % 2 === 0 ? 'M' : 'F') : (i % 2 === 0 ? 'M' : 'F');
    const result = testResults[i % testResults.length];
    const isPos = result === 'HIV Positive';

    rows.push({
      clinicId,
      siteCode: siteCodeVal,
      siteName: `Site ${siteCodeVal}`,
      sex: sexVal,
      age,
      interviewDate: '2026-06-15',
      referralMethod: referralTypes[i % referralTypes.length],
      partnerCount: isChild ? 0 : (i % 3) + 1,
      childrenCount: isChild ? 1 : (i % 2),
      hivResult: result,
      artStatus: isPos ? 'Enrolled ART' : 'Not Applicable',
      status: 'Active PNTT'
    });
  }
  return rows;
}

export default function PnttDashboardView({ kpis = {}, siteCode = 'ALL', selectedPeriodKey = '' }) {
  const navigate = useNavigate();

  // Line List Modal State
  const [lineListOpen, setLineListOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [modalRows, setModalRows] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalSearch, setModalSearch] = useState('');
  const [modalResultFilter, setModalResultFilter] = useState('all');
  const [modalPage, setModalPage] = useState(1);
  const [modalPageSize, setModalPageSize] = useState(10);

  useEffect(() => {
    setModalPage(1);
  }, [modalSearch, modalResultFilter, lineListOpen]);

  const handleOpenLineList = (step) => {
    setActiveCategory(step);
    setLineListOpen(true);
    setModalLoading(true);
    setModalSearch('');
    setModalResultFilter('all');
    setTimeout(() => {
      setModalRows(generateMockPnttRows(step.key || 'all', siteCode));
      setModalLoading(false);
    }, 200);
  };

  const filteredModalRows = useMemo(() => {
    let rows = modalRows;
    if (modalResultFilter === 'positive') {
      rows = rows.filter(r => r.hivResult === 'HIV Positive');
    } else if (modalResultFilter === 'negative') {
      rows = rows.filter(r => r.hivResult === 'HIV Negative');
    }

    if (!modalSearch.trim()) return rows;
    const q = modalSearch.toLowerCase().trim();
    return rows.filter(r =>
      String(r.clinicId).toLowerCase().includes(q) ||
      String(r.siteName).toLowerCase().includes(q) ||
      String(r.referralMethod).toLowerCase().includes(q)
    );
  }, [modalRows, modalSearch, modalResultFilter]);

  const totalModalRows = filteredModalRows.length;
  const totalPages = Math.max(1, Math.ceil(totalModalRows / modalPageSize));
  const safePage = Math.min(modalPage, totalPages);
  const startIndex = (safePage - 1) * modalPageSize;
  const paginatedModalRows = useMemo(() => {
    return filteredModalRows.slice(startIndex, startIndex + modalPageSize);
  }, [filteredModalRows, startIndex, modalPageSize]);

  const handleExportCsv = () => {
    if (!filteredModalRows || filteredModalRows.length === 0) return;
    const cols = ['clinicId', 'sex', 'age', 'interviewDate', 'referralMethod', 'partnerCount', 'childrenCount', 'hivResult', 'artStatus', 'siteName'];
    const csvContent = rowsToCsv(cols, filteredModalRows, {
      labelForKey: (k) => {
        const labels = {
          clinicId: 'Clinic ID',
          sex: 'Sex',
          age: 'Age',
          interviewDate: 'Interview Date',
          referralMethod: 'Referral Method',
          partnerCount: 'Partners Elicited',
          childrenCount: 'Children Elicited',
          hivResult: 'HIV Result',
          artStatus: 'ART Status',
          siteName: 'Facility / Site'
        };
        return labels[k] || k;
      }
    });
    const filename = safeExportFilename(`PNTT_LineList_${activeCategory?.key || 'All'}_${selectedPeriodKey}`);
    downloadCsv(filename, csvContent);
  };

  return (
    <div className="space-y-4 font-khmer">
      {/* PNTT EXECUTIVE KPI CARDS HEADER */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-2 sm:gap-3">
        {PNTT_CASCADE_STEPS.map((step) => (
          <div
            key={step.key}
            onClick={() => handleOpenLineList(step)}
            className="border border-border/70 bg-card p-3 rounded-none shadow-2xs hover:border-primary/80 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-muted-foreground truncate">{step.label}</span>
                <div
                  className="flex size-6 items-center justify-center rounded-none shrink-0"
                  style={{ backgroundColor: `${step.fill}15`, color: step.fill }}
                >
                  <RiUserHeartLine className="size-3.5" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-xl font-black text-foreground tracking-tight">
                  {step.value.toLocaleString()}
                </span>
                <span className="text-[10px] font-bold text-muted-foreground">នាក់</span>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-border/40 flex items-center justify-between text-[10px]">
              <span className="text-muted-foreground group-hover:text-primary transition-colors flex items-center gap-1 font-bold">
                <RiListCheck className="size-3" />
                <span>បញ្ជីឈ្មោះ</span>
              </span>
              <RiArrowRightSLine className="size-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        ))}
      </div>

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* PNTT PARTNER CASCADE BAR CHART */}
        <div className="lg:col-span-2 border border-border/70 bg-card p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-border/60 pb-2.5 mb-3">
            <div>
              <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <RiBarChartGroupedFill className="size-4 text-primary" />
                <span>លំហូរការសម្ភាសន៍ & ធ្វើតេស្តដៃគូ PNTT (Partner Services Cascade)</span>
              </h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                ទិន្នន័យដៃគូរបស់អ្នកជំងឺ HIV ដែលបានសម្ភាសន៍ យល់ព្រម ធ្វើតេស្ត និងចូលព្យាបាល ART
              </p>
            </div>
            <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 border border-primary/20">
              ត្រីមាស: {selectedPeriodKey || '២០២៦-Q៣'}
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={PNTT_CASCADE_STEPS} margin={{ top: 20, right: 15, left: -15, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="label" tick={{ fontSize: 10, fontWeight: '700', fill: 'currentColor' }} className="text-muted-foreground" />
                <YAxis tick={{ fontSize: 10, fill: 'currentColor' }} className="text-muted-foreground" />
                <Tooltip
                  cursor={{ fill: 'rgba(59, 130, 246, 0.08)' }}
                  content={({ active, payload }) => {
                    if (!active || !payload || !payload.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div className="bg-popover border border-border p-2.5 shadow-xl text-xs font-khmer space-y-1">
                        <div className="font-bold text-foreground">{d.label}</div>
                        <div className="text-primary font-mono font-bold">{d.value.toLocaleString()} នាក់</div>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="value" radius={[2, 2, 0, 0]}>
                  {PNTT_CASCADE_STEPS.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                  <LabelList dataKey="value" position="top" formatter={(v) => v.toLocaleString()} style={{ fontSize: '10px', fontWeight: 'bold', fill: 'currentColor' }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* PNTT REFERRAL METHODS BREAKDOWN (OPTIMIZED FLEX RESPONSIVE LAYOUT) */}
        <div className="border border-border/70 bg-card p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-border/60 pb-2.5 mb-3">
            <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <RiPieChartFill className="size-4 text-cyan-500" />
              <span>ការបែងចែកតាមវិធីសាស្ត្រ PNTT (Referral Methods)</span>
            </h3>
            <span className="text-[11px] font-bold text-muted-foreground font-mono">
              សរុប: 100 នាក់
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {/* Donut Chart with Center Text */}
            <div className="relative flex items-center justify-center h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={PNTT_REFERRAL_METHODS}
                    dataKey="value"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                  >
                    {PNTT_REFERRAL_METHODS.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload || !payload.length) return null;
                      const d = payload[0].payload;
                      return (
                        <div className="bg-popover border border-border p-2 shadow-md text-xs font-khmer">
                          <div className="font-bold text-foreground">{d.name} ({d.label})</div>
                          <div className="text-cyan-400 font-mono font-bold">{d.value} នាក់ ({d.value}%)</div>
                        </div>
                      );
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Donut Center Label Overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none font-khmer text-center">
                <span className="text-[10px] font-bold text-muted-foreground">សរុប PNTT</span>
                <span className="text-xl font-black text-foreground font-mono leading-tight">100</span>
                <span className="text-[10px] font-extrabold text-emerald-500 font-mono">100.0%</span>
              </div>
            </div>

            {/* Interactive Legend Items List */}
            <div className="space-y-1.5 font-khmer pt-1 border-t border-border/40">
              {PNTT_REFERRAL_METHODS.map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between border border-border/60 bg-muted/20 hover:bg-muted/40 px-2.5 py-1.5 transition-colors gap-2"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="size-2.5 rounded-full shrink-0" style={{ backgroundColor: item.fill }} />
                    <span className="text-xs font-bold text-foreground truncate" title={item.name}>{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-mono font-black text-foreground">{item.value}</span>
                    <button
                      onClick={() => handleOpenLineList({ key: item.key, label: item.name })}
                      className="px-2 py-0.5 text-[10px] font-mono font-bold text-blue-400 bg-blue-500/10 hover:bg-blue-500 hover:text-white border border-blue-500/30 transition-all cursor-pointer inline-flex items-center gap-1"
                    >
                      <span>Line List</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* BIOLOGICAL CHILDREN INDEX TESTING SECTION */}
      <div className="border border-border/70 bg-card p-4 shadow-2xs space-y-3">
        <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
          <div>
            <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <RiUserAddLine className="size-4 text-emerald-500" />
              <span>ការធ្វើតេស្តកូនជីវសាស្ត្ររបស់អ្នកជំងឺ HIV (Biological Children Index Testing)</span>
            </h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              ទិន្នន័យកូនរបស់អ្នកជំងឺដែលបានធ្វើតេស្តរកវីរុស HIV និងការភ្ជាប់ទៅការព្យាបាល ART
            </p>
          </div>
          <button
            onClick={() => handleOpenLineList({ key: 'eligible_children', label: 'កូនជីវសាស្ត្រ' })}
            className="px-2.5 py-1 text-xs font-bold text-emerald-500 bg-emerald-500/10 hover:bg-emerald-500 hover:text-white border border-emerald-500/20 transition-all inline-flex items-center gap-1"
          >
            <RiListCheck className="size-3.5" />
            <span>មើលបញ្ជីឈ្មោះកូន</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {CHILDREN_INDEX_STEPS.map((step) => (
            <div
              key={step.key}
              onClick={() => handleOpenLineList(step)}
              className="border border-border/60 bg-muted/20 p-3 shadow-2xs hover:border-emerald-500/60 transition-all cursor-pointer group"
            >
              <div className="text-[10px] font-bold text-muted-foreground">{step.label}</div>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-lg font-black text-foreground font-mono">{step.value.toLocaleString()}</span>
                <span className="text-[10px] font-bold text-muted-foreground">នាក់</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PNTT LINE LIST INTERACTIVE MODAL */}
      {lineListOpen && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 sm:p-6 font-khmer animate-in fade-in duration-200">
          <div className="relative w-full max-w-5xl max-h-[85vh] my-auto bg-card border border-border/80 shadow-2xl flex flex-col overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border/60 px-5 py-3.5 bg-muted/30">
              <div className="flex items-center gap-2.5">
                <span className="size-3 rounded-full shrink-0" style={{ backgroundColor: activeCategory?.fill || '#3b82f6' }} />
                <div>
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <span>បញ្ជីឈ្មោះអ្នកជំងឺ PNTT ({activeCategory?.label || 'PNTT Line List'})</span>
                    <span className="text-[11px] font-bold text-primary bg-primary/10 px-2 py-0.5 border border-primary/30">
                      {totalModalRows} នាក់
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
                    placeholder="ស្វែងរកតាម Clinic ID / មណ្ឌល / វិធីសាស្ត្រ..."
                    value={modalSearch}
                    onChange={(e) => setModalSearch(e.target.value)}
                    className="w-full bg-muted/40 border border-border/60 pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                  />
                </div>

                {/* HIV Result Filter */}
                <select
                  value={modalResultFilter}
                  onChange={(e) => setModalResultFilter(e.target.value)}
                  className="bg-muted/40 border border-border/60 text-xs text-foreground font-bold px-2 py-1.5 outline-none cursor-pointer"
                >
                  <option value="all">គ្រប់លទ្ធផល HIV</option>
                  <option value="positive">HIV វិជ្ជមាន (Positive)</option>
                  <option value="negative">HIV អវិជ្ជមាន (Negative)</option>
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
                  <span className="text-xs font-bold">កំពុងទាញយកបញ្ជីឈ្មោះ PNTT...</span>
                </div>
              ) : totalModalRows === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 gap-2 text-muted-foreground">
                  <RiInformationLine className="size-8 text-muted-foreground/60" />
                  <span className="text-xs font-bold">មិនមានទិន្នន័យបញ្ជីឈ្មោះ PNTT ទេ (No Records Found)</span>
                </div>
              ) : (
                <div className="overflow-x-auto border border-border/60">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-border/60 bg-muted/50 text-muted-foreground font-bold uppercase text-[10px] tracking-wider">
                        <th className="px-3.5 py-2.5 whitespace-nowrap">ល.រ</th>
                        <th className="px-3.5 py-2.5 whitespace-nowrap">Clinic ID</th>
                        <th className="px-3.5 py-2.5 whitespace-nowrap">ភេទ / អាយុ</th>
                        <th className="px-3.5 py-2.5 whitespace-nowrap">ថ្ងៃសម្ភាសន៍</th>
                        <th className="px-3.5 py-2.5 whitespace-nowrap">វិធីសាស្ត្រទាក់ទង</th>
                        <th className="px-3.5 py-2.5 whitespace-nowrap">ចំនួនដៃគូ/កូន</th>
                        <th className="px-3.5 py-2.5 whitespace-nowrap">លទ្ធផល HIV</th>
                        <th className="px-3.5 py-2.5 whitespace-nowrap">មណ្ឌលព្យាបាល</th>
                        <th className="px-3.5 py-2.5 whitespace-nowrap text-center">សកម្មភាព</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {paginatedModalRows.map((row, idx) => (
                        <tr key={row.clinicId + idx} className="hover:bg-muted/30 transition-colors">
                          <td className="px-3.5 py-2.5 font-mono text-muted-foreground whitespace-nowrap">
                            {startIndex + idx + 1}
                          </td>
                          <td className="px-3.5 py-2.5 font-mono font-bold text-primary whitespace-nowrap">
                            <button
                              onClick={() => {
                                setLineListOpen(false);
                                const actualSiteCode = row.siteCode || row.clinicId?.split('-')[0] || (siteCode === 'ALL' ? '0102' : siteCode);
                                navigate(buildPatient360Path({ siteCode: actualSiteCode, clinicId: row.clinicId, section: 'care' }));
                              }}
                              className="hover:underline inline-flex items-center gap-1 text-primary text-left whitespace-nowrap"
                            >
                              <span>{row.clinicId}</span>
                              <RiExternalLinkLine className="size-3 text-primary/70 shrink-0" />
                            </button>
                          </td>
                          <td className="px-3.5 py-2.5 font-bold text-foreground whitespace-nowrap">
                            {row.sex} ({row.age} ឆ្នាំ)
                          </td>
                          <td className="px-3.5 py-2.5 font-mono text-muted-foreground whitespace-nowrap">
                            {row.interviewDate}
                          </td>
                          <td className="px-3.5 py-2.5 font-bold whitespace-nowrap">
                            <span className="px-2 py-0.5 text-[10px] font-bold bg-cyan-500/10 text-cyan-500 border border-cyan-500/20">
                              {row.referralMethod}
                            </span>
                          </td>
                          <td className="px-3.5 py-2.5 font-mono text-foreground whitespace-nowrap">
                            ដៃគូ: {row.partnerCount} | កូន: {row.childrenCount}
                          </td>
                          <td className="px-3.5 py-2.5 font-mono font-bold whitespace-nowrap">
                            {row.hivResult === 'HIV Positive' ? (
                              <span className="text-rose-500 bg-rose-500/10 px-2 py-0.5 border border-rose-500/20 text-[11px]">
                                {row.hivResult}
                              </span>
                            ) : (
                              <span className="text-emerald-500 bg-emerald-500/10 px-2 py-0.5 border border-emerald-500/20 text-[11px]">
                                {row.hivResult}
                              </span>
                            )}
                          </td>
                          <td className="px-3.5 py-2.5 font-bold text-foreground whitespace-nowrap">
                            {row.siteName}
                          </td>
                          <td className="px-3.5 py-2.5 text-center whitespace-nowrap">
                            <button
                              onClick={() => {
                                setLineListOpen(false);
                                const actualSiteCode = row.siteCode || row.clinicId?.split('-')[0] || (siteCode === 'ALL' ? '0102' : siteCode);
                                navigate(buildPatient360Path({ siteCode: actualSiteCode, clinicId: row.clinicId, section: 'care' }));
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
                  បង្ហាញពី <strong className="text-foreground">{totalModalRows === 0 ? 0 : startIndex + 1}</strong> ដល់ <strong className="text-foreground">{Math.min(startIndex + modalPageSize, totalModalRows)}</strong> នៃសរុប <strong className="text-primary font-bold">{totalModalRows}</strong> នាក់
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
                    <option value={10}>10 / ទំព័រ</option>
                    <option value={20}>20 / ទំព័រ</option>
                    <option value={50}>50 / ទំព័រ</option>
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

                <div className="flex items-center gap-1 text-xs font-mono font-bold px-2">
                  <span className="text-primary">{safePage}</span>
                  <span className="text-muted-foreground">/</span>
                  <span>{totalPages}</span>
                </div>

                <button
                  disabled={safePage >= totalPages}
                  onClick={() => setModalPage(prev => Math.min(totalPages, prev + 1))}
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
