import React from 'react';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, LabelList } from 'recharts';
import { RiBarChartGroupedFill, RiBuilding4Line } from '@remixicon/react';
import AppLoadingOverlay from '../../ui/AppLoadingOverlay';

export default function PmtctCascadeView({
  loading,
  eidCascadeData,
  selectedCascadeIndex,
  currentHierarchyLevel,
  handleCascadeBarClick,
  handleBreakdownBarClick,
  inlineBreakdownChartData
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      {/* Chart 1: MAIN INFANT EID CASCADE STACKED BAR CHART */}
      <div className="relative lg:col-span-6 border border-border/80 bg-card p-4 shadow-xs flex flex-col justify-between overflow-hidden">
        {loading && (
          <AppLoadingOverlay
            show={loading}
            fullScreen={false}
            message="កំពុងផ្ទុកទិន្នន័យ Chart..."
            submessage="Updating Infant EID Cascade"
          />
        )}
        <div className="flex items-center justify-between border-b border-border/60 pb-2.5 mb-2">
          <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
            <RiBarChartGroupedFill className="size-4 text-blue-500" /> Smart Chart: គំនូសតាងលំហូរពិនិត្យទារក EID (Infant Cascade Stacked)
          </h3>
          <div className="flex items-center gap-2 text-[10px] font-bold">
            <span className="flex items-center gap-1 text-blue-500"><span className="size-2 bg-blue-500 rounded-full inline-block" /> &lt;2m</span>
            <span className="flex items-center gap-1 text-emerald-500"><span className="size-2 bg-emerald-500 rounded-full inline-block" /> &gt;=2m</span>
          </div>
        </div>
        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={eidCascadeData} margin={{ top: 25, right: 15, left: -15, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="name" tick={{ fontSize: 9, fontWeight: '700', fill: 'currentColor' }} className="text-muted-foreground" />
              <YAxis tick={{ fontSize: 10, fill: 'currentColor' }} className="text-muted-foreground" />
              <Tooltip
                cursor={{ fill: 'rgba(59,130,246,0.1)' }}
                content={({ active, payload }) => {
                  if (!active || !payload || !payload.length) return null;
                  const d = payload[0].payload;
                  return (
                    <div className="bg-slate-900 border border-slate-700 p-2.5 text-xs text-white shadow-xl font-khmer">
                      <div className="font-bold border-b border-slate-700 pb-1 mb-1 text-sky-300">{d.name} ({d.subtitle})</div>
                      <div>អាយុ &lt; 2m: <strong className="text-sky-400">{d.less2m.toLocaleString()} ទារក</strong></div>
                      <div>អាយុ &gt;= 2m: <strong className="text-emerald-400">{d.great2m.toLocaleString()} ទារក</strong></div>
                      <div className="pt-1 mt-1 border-t border-slate-800 text-slate-300 font-bold">សរុប: {d.value.toLocaleString()} ទារក</div>
                      <div className="text-[10px] text-sky-300 mt-1">ចុចលើរបារនេះដើម្បីប្តូរព័ត៌មានបំបែកតាមមណ្ឌលខាងស្តាំ</div>
                    </div>
                  );
                }}
              />
              <Bar
                dataKey="less2m"
                name="អាយុ < 2m"
                stackId="cascadeStack"
                fill="#3b82f6"
                radius={[0, 0, 0, 0]}
                onClick={(entry, index) => handleCascadeBarClick(entry, index)}
                className="cursor-pointer"
              >
                <LabelList dataKey="less2m" position="center" style={{ fontSize: '9px', fontWeight: '800', fill: '#ffffff' }} formatter={(v) => (v > 0 ? v.toLocaleString() : '')} />
              </Bar>
              <Bar
                dataKey="great2m"
                name="អាយុ >= 2m"
                stackId="cascadeStack"
                fill="#10b981"
                radius={[4, 4, 0, 0]}
                onClick={(entry, index) => handleCascadeBarClick(entry, index)}
                className="cursor-pointer"
              >
                <LabelList dataKey="great2m" position="center" style={{ fontSize: '9px', fontWeight: '800', fill: '#ffffff' }} formatter={(v) => (v > 0 ? v.toLocaleString() : '')} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: INLINE BREAKDOWN STACKED BAR CHART */}
      <div className="relative lg:col-span-6 border border-border/80 bg-card p-4 shadow-xs flex flex-col justify-between overflow-hidden">
        {loading && (
          <AppLoadingOverlay
            show={loading}
            fullScreen={false}
            message="កំពុងផ្ទុកទិន្នន័យ Breakdown Chart..."
            submessage="Updating Real Gender Figures"
          />
        )}
        <div className="flex items-center justify-between border-b border-border/60 pb-2.5 mb-2">
          <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
            <RiBuilding4Line className="size-4 text-emerald-500" />
            {currentHierarchyLevel === 'country'
              ? `បំបែកតាមខេត្ត & ភេទ (Province Stacked by Sex) — ${eidCascadeData[selectedCascadeIndex]?.name}`
              : currentHierarchyLevel === 'province'
              ? `បំបែកតាមមណ្ឌល & ភេទ (Site Stacked by Sex) — ${eidCascadeData[selectedCascadeIndex]?.name}`
              : `បំបែកតាមក្រុមអាយុ (Age & Sex Stacked)`}
          </h3>
          <div className="flex items-center gap-2 text-[10px] font-bold">
            <span className="flex items-center gap-1 text-sky-500"><span className="size-2 bg-sky-500 rounded-full inline-block" /> ប្រុស (Male)</span>
            <span className="flex items-center gap-1 text-pink-500"><span className="size-2 bg-pink-500 rounded-full inline-block" /> ស្រី (Female)</span>
          </div>
        </div>
        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={inlineBreakdownChartData} margin={{ top: 25, right: 15, left: -15, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="name" tick={{ fontSize: 9, fontWeight: '700', fill: 'currentColor' }} className="text-muted-foreground" />
              <YAxis tick={{ fontSize: 10, fill: 'currentColor' }} className="text-muted-foreground" />
              <Tooltip
                cursor={{ fill: 'rgba(16,185,129,0.1)' }}
                content={({ active, payload }) => {
                  if (!active || !payload || !payload.length) return null;
                  const d = payload[0].payload;
                  return (
                    <div className="bg-slate-900 border border-slate-700 p-2.5 text-xs text-white shadow-xl font-khmer">
                      <div className="font-bold border-b border-slate-700 pb-1 mb-1 text-emerald-400">{d.name}</div>
                      <div>ប្រុស (Male): <strong className="text-sky-400">{(d.male || 0).toLocaleString()} ទារក</strong></div>
                      <div>ស្រី (Female): <strong className="text-pink-400">{(d.female || 0).toLocaleString()} ទារក</strong></div>
                      <div className="pt-1 mt-1 border-t border-slate-800 text-slate-300 font-bold">សរុប: {(d.value || 0).toLocaleString()} ទារក</div>
                      <div className="text-[10px] text-emerald-300 mt-1">ចុចលើរបារដើម្បីមើលបញ្ជីឈ្មោះទារកក្នុងមណ្ឌលនេះ</div>
                    </div>
                  );
                }}
              />
              <Bar dataKey="male" name="ប្រុស (Male)" stackId="sexStack" fill="#0284c7" radius={[0, 0, 0, 0]}>
                <LabelList dataKey="male" position="center" style={{ fontSize: '9px', fontWeight: '800', fill: '#ffffff' }} formatter={(v) => (v > 0 ? v.toLocaleString() : '')} />
              </Bar>
              <Bar
                dataKey="female"
                name="ស្រី (Female)"
                stackId="sexStack"
                fill="#ec4899"
                radius={[4, 4, 0, 0]}
                onClick={(entry) => handleBreakdownBarClick(entry)}
                className="cursor-pointer"
              >
                <LabelList dataKey="female" position="center" style={{ fontSize: '9px', fontWeight: '800', fill: '#ffffff' }} formatter={(v) => (v > 0 ? v.toLocaleString() : '')} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}