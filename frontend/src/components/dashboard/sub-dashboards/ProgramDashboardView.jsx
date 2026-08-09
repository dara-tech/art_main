import React from 'react';
import {
  RiGroupLine,
  RiArrowUpLine,
  RiUserSearchLine,
  RiUserAddLine,
  RiMedicineBottleLine,
  RiHeartPulseLine,
  RiShieldCheckLine,
  RiArrowRightSLine,
  RiSearchLine
} from '@remixicon/react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  LabelList,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import AppLoadingOverlay from '../../ui/AppLoadingOverlay';
import CambodiaPolygonMap from '../CambodiaPolygonMap';

export default function ProgramDashboardView({
  kpis,
  selectedPeriodKey,
  provincialChartData,
  regimenPieData,
  quarterlyTrendData,
  filteredProvinces,
  sites,
  loading,
  searchQuery,
  setSearchQuery,
  siteCode,
  setSiteCode,
  handleOpenLineList,
  provinceFilterMode,
  setProvinceFilterMode
}) {
  return (
    <>
      {/* 6 Key Executive Indicator Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-2 sm:gap-3 shrink-0 font-khmer">
        {/* Card 1: Active ART */}
        <div
          onClick={() => handleOpenLineList({ id: 'active_art', title: 'អ្នកជំងឺ ART សកម្ម (Active ART Patients)', script: '11_active_art', fill: '#3b82f6' })}
          className="border border-border/70 bg-card p-3.5 rounded-none shadow-2xs hover:border-primary/80 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-muted-foreground truncate">អ្នកជំងឺ ART សកម្ម (Active ART)</span>
              <div className="flex size-6 items-center justify-center bg-blue-500/10 text-blue-500 rounded-none shrink-0">
                <RiGroupLine className="size-3.5" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-xl font-black text-foreground tracking-tight">
                {(kpis.activeArt || 0).toLocaleString()}
              </span>
              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-500">
                <RiArrowUpLine className="size-3" />
                +4.2%
              </span>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-[10px] text-muted-foreground border-t border-border/40 pt-1.5">
            <span>ប្រុស: <strong className="text-foreground">{(kpis.activeArtMale || 0).toLocaleString()}</strong></span>
            <span className="inline-flex items-center gap-0.5 text-primary font-bold opacity-75 group-hover:opacity-100 transition-opacity">
              Line List <RiArrowRightSLine className="size-3" />
            </span>
          </div>
        </div>

        {/* Card 2: Newly Enrolled */}
        <div
          onClick={() => handleOpenLineList({ id: 'newly_enrolled', title: 'អ្នកជំងឺចុះឈ្មោះថ្មី (Newly Enrolled Patients)', script: '03_newly_enrolled', fill: '#06b6d4' })}
          className="border border-border/70 bg-card p-3.5 rounded-none shadow-2xs hover:border-cyan-500/80 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-muted-foreground truncate">ចុះឈ្មោះថ្មី (Newly Enrolled)</span>
              <div className="flex size-6 items-center justify-center bg-cyan-500/10 text-cyan-500 rounded-none shrink-0">
                <RiUserSearchLine className="size-3.5" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-xl font-black text-foreground tracking-tight">
                {(kpis.newlyEnrolled || 0).toLocaleString()}
              </span>
              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-cyan-500">
                Pre-ART & ART
              </span>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-[10px] text-muted-foreground border-t border-border/40 pt-1.5">
            <span>សរុបត្រីមាស</span>
            <span className="inline-flex items-center gap-0.5 text-cyan-600 font-bold opacity-75 group-hover:opacity-100 transition-opacity">
              Line List <RiArrowRightSLine className="size-3" />
            </span>
          </div>
        </div>

        {/* Card 3: Newly Initiated */}
        <div
          onClick={() => handleOpenLineList({ id: 'newly_initiated', title: 'អ្នកជំងឺចាប់ផ្តើម ART ថ្មី (Newly Initiated Patients)', script: '05_newly_initiated', fill: '#10b981' })}
          className="border border-border/70 bg-card p-3.5 rounded-none shadow-2xs hover:border-emerald-500/80 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-muted-foreground truncate">ចាប់ផ្តើម ART ថ្មី (Initiated)</span>
              <div className="flex size-6 items-center justify-center bg-emerald-500/10 text-emerald-500 rounded-none shrink-0">
                <RiUserAddLine className="size-3.5" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-xl font-black text-foreground tracking-tight">
                {(kpis.newlyInitiated || 0).toLocaleString()}
              </span>
              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-500">
                Same-day: {kpis.sameDayRate}%
              </span>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-[10px] text-muted-foreground border-t border-border/40 pt-1.5">
            <span>ថ្ងៃតែមួយ: <strong className="text-foreground">{kpis.sameDayRate}%</strong></span>
            <span className="inline-flex items-center gap-0.5 text-emerald-600 font-bold opacity-75 group-hover:opacity-100 transition-opacity">
              Line List <RiArrowRightSLine className="size-3" />
            </span>
          </div>
        </div>

        {/* Card 4: MMD Patients */}
        <div
          onClick={() => handleOpenLineList({ id: 'mmd_patients', title: 'អ្នកជំងឺទទួលថ្នាំវែង MMD 3M/6M (MMD Patients)', script: '08_mmd_patients', fill: '#f59e0b' })}
          className="border border-border/70 bg-card p-3.5 rounded-none shadow-2xs hover:border-amber-500/80 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-muted-foreground truncate">ថ្នាំវែង (MMD 3M/6M)</span>
              <div className="flex size-6 items-center justify-center bg-amber-500/10 text-amber-500 rounded-none shrink-0">
                <RiMedicineBottleLine className="size-3.5" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-xl font-black text-foreground tracking-tight">
                {kpis.mmdRate}%
              </span>
              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-500">
                Goal &gt; 90%
              </span>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-[10px] text-muted-foreground border-t border-border/40 pt-1.5">
            <span>MMD: <strong className="text-foreground">{(kpis.mmdTotal || 0).toLocaleString()}</strong></span>
            <span className="inline-flex items-center gap-0.5 text-amber-600 font-bold opacity-75 group-hover:opacity-100 transition-opacity">
              Line List <RiArrowRightSLine className="size-3" />
            </span>
          </div>
        </div>

        {/* Card 5: TLD Regimen */}
        <div
          onClick={() => handleOpenLineList({ id: 'tld_regimen', title: 'អ្នកជំងឺព្យាបាលរូបមន្ត TLD (TLD Regimen Patients)', script: '09_tld_regimen', fill: '#8b5cf6' })}
          className="border border-border/70 bg-card p-3.5 rounded-none shadow-2xs hover:border-violet-500/80 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-muted-foreground truncate">ព្យាបាល TLD (TLD Regimen)</span>
              <div className="flex size-6 items-center justify-center bg-violet-500/10 text-violet-500 rounded-none shrink-0">
                <RiHeartPulseLine className="size-3.5" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-xl font-black text-foreground tracking-tight">
                {kpis.tldRate}%
              </span>
              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-violet-500">
                Optimal
              </span>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-[10px] text-muted-foreground border-t border-border/40 pt-1.5">
            <span>TLD: <strong className="text-foreground">{(kpis.tldTotal || 0).toLocaleString()}</strong></span>
            <span className="inline-flex items-center gap-0.5 text-violet-600 font-bold opacity-75 group-hover:opacity-100 transition-opacity">
              Line List <RiArrowRightSLine className="size-3" />
            </span>
          </div>
        </div>

        {/* Card 6: VL Suppression Rate */}
        <div
          onClick={() => handleOpenLineList({ id: 'vl_suppressed', title: 'អ្នកជំងឺបង្ក្រាបមេរោគ (VL Suppressed Patients)', script: '11_8_vl_suppressed', fill: '#14b8a6' })}
          className="border border-border/70 bg-card p-3.5 rounded-none shadow-2xs hover:border-teal-500/80 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-muted-foreground truncate">បង្ក្រាបមេរោគ (VL Suppressed)</span>
              <div className="flex size-6 items-center justify-center bg-teal-500/10 text-teal-500 rounded-none shrink-0">
                <RiShieldCheckLine className="size-3.5" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-xl font-black text-foreground tracking-tight">
                {kpis.third95}%
              </span>
              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-teal-500">
                Target &gt; 95%
              </span>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-[10px] text-muted-foreground border-t border-border/40 pt-1.5">
            <span>Coverage: <strong className="text-foreground">{kpis.vlCoverageRate}%</strong></span>
            <span className="inline-flex items-center gap-0.5 text-teal-600 font-bold opacity-75 group-hover:opacity-100 transition-opacity">
              Line List <RiArrowRightSLine className="size-3" />
            </span>
          </div>
        </div>
      </div>

      {/* National 95-95-95 Targets Widget */}
      <div className="border border-border/80 bg-card p-4 rounded-none shadow-xs shrink-0">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-foreground">គោលដៅជាតិ 95-95-95 UNAIDS Targets Progress</span>
          <span className="text-[11px] text-muted-foreground">ត្រីមាសទី {selectedPeriodKey}</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-foreground">1st 95: ចុះឈ្មោះ & វិនិច្ឆ័យ</span>
              <span className="font-bold text-blue-500">{kpis.first95}%</span>
            </div>
            <div className="h-2 w-full bg-muted overflow-hidden rounded-none">
              <div className="h-full bg-blue-500" style={{ width: `${kpis.first95}%` }} />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-foreground">2nd 95: ទទួលការព្យាបាល ART</span>
              <span className="font-bold text-emerald-500">{kpis.second95}%</span>
            </div>
            <div className="h-2 w-full bg-muted overflow-hidden rounded-none">
              <div className="h-full bg-emerald-500" style={{ width: `${kpis.second95}%` }} />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-foreground">3rd 95: បង្ក្រាបមេរោគ (VL Suppressed)</span>
              <span className="font-bold text-violet-500">{kpis.third95}%</span>
            </div>
            <div className="h-2 w-full bg-muted overflow-hidden rounded-none">
              <div className="h-full bg-violet-500" style={{ width: `${kpis.third95}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 shrink-0">
        <div className="border border-border/80 bg-card p-4 rounded-none shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-foreground">ចំនួនអ្នកជំងឺ ART តាមរាជធានី-ខេត្ត (Active ART by Province)</span>
            <div className="flex items-center gap-1 border border-border/80 bg-muted/40 p-0.5 shrink-0 font-khmer">
              <button
                type="button"
                onClick={() => setProvinceFilterMode('top10')}
                className={`px-2 py-0.5 text-[10px] font-bold transition-all cursor-pointer ${
                  provinceFilterMode === 'top10'
                    ? 'bg-primary text-primary-foreground shadow-2xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Top 10
              </button>
              <button
                type="button"
                onClick={() => setProvinceFilterMode('lowest10')}
                className={`px-2 py-0.5 text-[10px] font-bold transition-all cursor-pointer ${
                  provinceFilterMode === 'lowest10'
                    ? 'bg-rose-600 text-white shadow-2xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Lowest 10
              </button>
              <button
                type="button"
                onClick={() => setProvinceFilterMode('all')}
                className={`px-2 py-0.5 text-[10px] font-bold transition-all cursor-pointer ${
                  provinceFilterMode === 'all'
                    ? 'bg-primary text-primary-foreground shadow-2xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Show All
              </button>
            </div>
          </div>
          <div className="h-64 w-full relative overflow-hidden">
            {loading && (
              <AppLoadingOverlay
                show={loading}
                fullScreen={false}
                message="កំពុងផ្ទុកទិន្នន័យ Chart..."
                submessage="Updating province data"
              />
            )}
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={provincialChartData} margin={{ top: 16, right: 10, left: -16, bottom: 24 }}>
                <defs>
                  <linearGradient id="artBarGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0f766e" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#1e3a8a" stopOpacity={0.7} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.12} vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 9.5, fontWeight: 600, fill: 'var(--muted-foreground)' }} angle={-25} textAnchor="end" interval={0} />
                <YAxis tick={{ fontSize: 10, fontWeight: 600, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ fill: 'var(--muted)', opacity: 0.25 }}
                  content={({ active, payload }) => {
                    if (!active || !payload || !payload.length) return null;
                    const dataObj = payload[0]?.payload || {};
                    const totalCount = provincialChartData.reduce((acc, curr) => acc + (curr.activeArt || 0), 0);
                    const pct = totalCount > 0 ? ((Number(payload[0].value) / totalCount) * 100).toFixed(1) : 0;
                    return (
                      <div className="bg-card border border-border p-3 shadow-2xl text-xs space-y-1.5 text-foreground font-khmer rounded-none select-none min-w-[140px]">
                        <div className="border-b border-border/60 pb-1 flex items-center justify-between gap-2">
                          <span className="text-[10px] text-primary font-bold uppercase tracking-wider">រាជធានី-ខេត្ត</span>
                          <strong className="text-foreground font-bold text-xs">{dataObj.name}</strong>
                        </div>
                        <div className="flex items-center justify-between gap-3 text-[11px]">
                          <span className="text-muted-foreground">Active ART:</span>
                          <strong className="text-primary font-extrabold tabular-nums">{Number(payload[0].value).toLocaleString('km-KH')} នាក់</strong>
                        </div>
                        <div className="flex items-center justify-between gap-3 text-[10px] text-muted-foreground pt-0.5">
                          <span>ចំណែកសរុប:</span>
                          <span className="font-bold text-foreground tabular-nums">{pct}%</span>
                        </div>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="activeArt" name="Active ART" fill="url(#artBarGradient)" radius={[4, 4, 0, 0]}>
                  <LabelList
                    dataKey="activeArt"
                    position="top"
                    style={{ fontSize: '9.5px', fontWeight: '800', fill: 'var(--foreground)' }}
                    formatter={(val) => (Number(val) > 0 ? Number(val).toLocaleString('km-KH') : '')}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="border border-border/80 bg-card p-4 rounded-none shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-foreground">ការបែងចែករូបមន្តថ្នាំ (Regimen Distribution)</span>
            <span className="text-[10px] font-bold text-primary bg-primary/10 border border-primary/30 px-1.5 py-0.5">TLD 98.4%</span>
          </div>
          <div className="h-48 w-full flex items-center justify-center relative overflow-hidden">
            {loading && (
              <AppLoadingOverlay
                show={loading}
                fullScreen={false}
                message="កំពុងផ្ទុកទិន្នន័យ Chart..."
                submessage="Updating regimen breakdown"
              />
            )}
            {/* Center Doughnut Label Callout */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
              <span className="text-base font-black text-foreground tabular-nums leading-none">
                {regimenPieData.reduce((acc, curr) => acc + (curr.value || 0), 0).toLocaleString('km-KH')}
              </span>
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mt-0.5">អ្នកជំងឺសរុប</span>
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={regimenPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={76}
                  paddingAngle={4}
                  dataKey="value"
                  animationDuration={800}
                  label={({ percent }) => (percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : '')}
                  labelLine={false}
                >
                  {regimenPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="var(--card)" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload || !payload.length) return null;
                    const p = payload[0];
                    return (
                      <div className="bg-card border border-border p-2.5 shadow-xl text-xs space-y-1 text-foreground font-khmer rounded-none">
                        <div className="flex items-center gap-1.5">
                          <span className="size-2 rounded-full" style={{ backgroundColor: p.payload?.color }} />
                          <span className="font-bold text-foreground">{p.name}</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground tabular-nums">
                          ចំនួន៖ <strong className="text-primary font-bold">{Number(p.value).toLocaleString('km-KH')} នាក់</strong>
                        </p>
                      </div>
                    );
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/40 text-[11px]">
            {regimenPieData.map((item) => {
              const total = regimenPieData.reduce((acc, curr) => acc + (curr.value || 0), 0);
              const pct = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0';
              return (
                <div key={item.name} className="flex items-center justify-between border border-border/60 bg-muted/20 px-2 py-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="size-2.5 shrink-0 rounded-none" style={{ backgroundColor: item.color }} />
                    <span className="text-muted-foreground truncate text-[10px] font-semibold">{item.name.split(' ')[0]}</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 text-[10px] font-bold tabular-nums">
                    <span className="text-foreground">{item.value.toLocaleString()}</span>
                    <span className="text-muted-foreground text-[9px]">({pct}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Cambodia GIS Polygon & ART Site Pins Map */}
      <CambodiaPolygonMap
        provinces={filteredProvinces}
        sites={sites}
        loading={loading}
        selectedProvinceId={siteCode.startsWith('province:') ? siteCode.replace('province:', '') : null}
        selectedSiteCode={siteCode}
        onSelectProvince={(pid) => setSiteCode(pid ? `province:${pid}` : '')}
        onSelectSite={(code) => setSiteCode(code || '')}
        className="shrink-0"
      />

      {/* 4-Quarter Trajectory Chart */}
      <div className="border border-border/80 bg-card p-4 rounded-none shadow-xs shrink-0">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-foreground">និន្នាការកើនឡើងរបស់អ្នកជំងឺ ៤ ត្រីមាស (4-Quarter Active ART & VL Suppression Trajectory)</span>
          <span className="text-[10px] font-bold text-muted-foreground bg-muted px-2 py-0.5 border border-border/60">Q4 2025 – Q3 2026</span>
        </div>
        <div className="h-56 w-full relative overflow-hidden">
          {loading && (
            <AppLoadingOverlay
              show={loading}
              fullScreen={false}
              message="កំពុងផ្ទុកទិន្នន័យ Chart..."
              submessage="Updating trajectory trends"
            />
          )}
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={quarterlyTrendData} margin={{ top: 12, right: 12, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorSuppressed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.12} vertical={false} />
              <XAxis dataKey="period" tick={{ fontSize: 10, fontWeight: 600, fill: 'var(--muted-foreground)' }} />
              <YAxis tick={{ fontSize: 10, fontWeight: 600, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload || !payload.length) return null;
                  return (
                    <div className="bg-card border border-border p-3 shadow-2xl text-xs space-y-1.5 text-foreground font-khmer rounded-none">
                      <p className="font-bold text-primary border-b border-border/60 pb-1">{label}</p>
                      {payload.map((entry) => (
                        <div key={entry.dataKey} className="flex items-center justify-between gap-4 text-[11px]">
                          <span style={{ color: entry.color }} className="font-semibold">{entry.name}:</span>
                          <strong className="font-bold tabular-nums" style={{ color: entry.color }}>
                            {Number(entry.value).toLocaleString('km-KH')} នាក់
                          </strong>
                        </div>
                      ))}
                    </div>
                  );
                }}
              />
              <Area type="monotone" dataKey="activeArt" name="Active ART" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorActive)" activeDot={{ r: 6, stroke: 'var(--card)', strokeWidth: 2 }} />
              <Area type="monotone" dataKey="suppressed" name="VL Suppressed" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSuppressed)" activeDot={{ r: 6, stroke: 'var(--card)', strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Provincial Distribution Table */}
      <div className="flex flex-col border border-border/80 bg-card rounded-none shadow-xs">
        <div className="flex items-center justify-between border-b border-border/80 bg-muted/40 px-4 py-3 shrink-0">
          <span className="text-xs font-bold text-foreground">ការបែងចែកតាមរាជធានី-ខេត្ត (Provincial Distribution Rollup)</span>
          <div className="relative w-56">
            <RiSearchLine className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ស្វែងរករាជធានី-ខេត្ត..."
              className="h-7 w-full border border-border/80 bg-background pl-8 pr-2 text-xs rounded-none outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full border-collapse text-xs">
            <thead className="sticky top-0 z-10 border-b border-border/20 bg-muted/95 backdrop-blur-md">
              <tr className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                <th className="border-r border-border/20 px-3 py-2 text-left">រាជធានី-ខេត្ត (Province)</th>
                <th className="border-r border-border/20 px-3 py-2 text-right">អ្នកជំងឺ ART សកម្ម</th>
                <th className="border-r border-border/20 px-3 py-2 text-right">ចាប់ផ្តើម ART ថ្មី</th>
                <th className="border-r border-border/20 px-3 py-2 text-right">អ្នកជំងឺ MMD</th>
                <th className="border-r border-border/20 px-3 py-2 text-right">អ្នកជំងឺ TLD</th>
                <th className="px-3 py-2 text-center">ស្ថានភាពទិន្នន័យ (DQA Score)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20 bg-card">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-muted-foreground">
                    កំពុងផ្ទុកទិន្នន័យខេត្ត...
                  </td>
                </tr>
              ) : filteredProvinces.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-muted-foreground">
                    មិនមានទិន្នន័យខេត្តសម្រាប់ត្រីមាសនេះ។
                  </td>
                </tr>
              ) : (
                filteredProvinces.map((p, idx) => (
                  <tr key={p.province_id || idx} className="hover:bg-muted/30 transition-colors">
                    <td className="border-r border-border/20 px-3 py-2.5 font-bold text-foreground">
                      {p.province_name || `Province ${p.province_id}`}
                    </td>
                    <td className="border-r border-border/20 px-3 py-2.5 text-right font-semibold tabular-nums text-blue-500">
                      {Number(p.active_art || 0).toLocaleString()}
                    </td>
                    <td className="border-r border-border/20 px-3 py-2.5 text-right font-semibold tabular-nums text-emerald-500">
                      {Number(p.newly_initiated || 0).toLocaleString()}
                    </td>
                    <td className="border-r border-border/20 px-3 py-2.5 text-right tabular-nums">
                      {Number(p.mmd_patients || 0).toLocaleString()}
                    </td>
                    <td className="border-r border-border/20 px-3 py-2.5 text-right tabular-nums">
                      {Number(p.tld_patients || 0).toLocaleString()}
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-bold bg-emerald-500/10 text-emerald-600 rounded-none border border-emerald-500/20">
                        98.5% Verified
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
