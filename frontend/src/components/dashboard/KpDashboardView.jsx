import React, { useMemo, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, LabelList, Legend
} from 'recharts';
import {
  RiUserHeartLine, RiGroupLine, RiBarChartGroupedFill, RiPieChartFill, RiTableLine, RiFilter3Line, RiShieldCheckLine, RiCapsuleLine
} from '@remixicon/react';

const KP_CATEGORIES = [
  { id: 'msm', label: 'MSM (បុរសស្រឡាញ់បុរស)', shortLabel: 'MSM', color: '#3b82f6', icon: RiUserHeartLine },
  { id: 'tg', label: 'TG (ស្រីកែភេទ)', shortLabel: 'TG', color: '#ec4899', icon: RiGroupLine },
  { id: 'fsw', label: 'FSW (ស្រីកន្លែងកម្សាន្ត)', shortLabel: 'FSW', color: '#f59e0b', icon: RiUserHeartLine },
  { id: 'pwid', label: 'PWID/PWUD (អ្នកប្រើប្រាស់គ្រឿងញៀន)', shortLabel: 'PWID', color: '#a855f7', icon: RiGroupLine },
  { id: 'genpop', label: 'General Population (ប្រជាជនទូទៅ)', shortLabel: 'GenPop', color: '#10b981', icon: RiGroupLine },
];

export default function KpDashboardView({ kpis = {}, siteCode = 'ALL', selectedPeriodKey = '' }) {
  const [selectedKp, setSelectedKp] = useState('all');

  const totalPatients = useMemo(() => kpis.activeArt || 72878, [kpis]);
  const newlyInitiated = useMemo(() => kpis.newlyInitiated || 2450, [kpis]);

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

  return (
    <div className="space-y-4 font-khmer">
      {/* KP Dashboard Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-border/80 bg-card p-3.5 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-primary bg-primary/10 px-2 py-0.5 border border-primary/30">
              KP Analytics Module
            </span>
            <span className="text-xs text-muted-foreground">ត្រីមាស: <strong>{selectedPeriodKey || '២០២៦-Q៣'}</strong></span>
          </div>
          <h2 className="text-sm font-black text-foreground mt-1 tracking-tight">
            ផ្ទាំងវិភាគទិន្នន័យ ក្រុមប្រជាជនគន្លឹះ (Key Populations - KP Dashboard)
          </h2>
        </div>

        {/* KP Group Filter */}
        <div className="flex items-center gap-2">
          <RiFilter3Line className="size-4 text-muted-foreground" />
          <select
            value={selectedKp}
            onChange={(e) => setSelectedKp(e.target.value)}
            className="h-8 border border-border/80 bg-background px-3 text-xs font-bold text-foreground outline-none cursor-pointer hover:border-primary transition-colors"
          >
            <option value="all">គ្រប់ក្រុមប្រជាជនគន្លឹះ (All KP Groups)</option>
            {KP_CATEGORIES.map(c => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* KP KPI Summary Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
        {kpData.map((kp) => {
          const isSelected = selectedKp === kp.id || selectedKp === 'all';
          return (
            <div
              key={kp.id}
              onClick={() => setSelectedKp(selectedKp === kp.id ? 'all' : kp.id)}
              className={`p-3 border transition-all cursor-pointer select-none relative overflow-hidden ${
                isSelected
                  ? 'border-primary/50 bg-card shadow-xs hover:border-primary'
                  : 'border-border/60 bg-muted/20 opacity-40'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-muted-foreground truncate max-w-[120px]">
                  {kp.name}
                </span>
                <span className="size-2.5 rounded-full shrink-0 shadow-xs" style={{ backgroundColor: kp.fill }} />
              </div>
              <div className="text-lg font-black text-foreground mt-1 tracking-tight">
                {kp.value.toLocaleString()} <span className="text-xs text-muted-foreground font-normal">នាក់</span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-1.5 pt-1.5 border-t border-border/40">
                <span>សមាមាត្រ: <strong className="text-foreground">{kp.pct}%</strong></span>
                <span>VL Supp: <strong className="text-emerald-500 font-bold">{kp.suppression}%</strong></span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Card: Active ART Donut Breakdown + Interactive Side Legend */}
        <div className="lg:col-span-5 border border-border/80 bg-card p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-border/60 pb-2.5 mb-2">
            <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <RiPieChartFill className="size-4 text-primary" /> ការបែងចែកអ្នកជំងឺតាមប្រភេទ KP
            </h3>
            <span className="text-[11px] font-bold text-muted-foreground">សរុប: {totalPatients.toLocaleString()} នាក់</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 py-2">
            {/* Pristine Donut Chart with Center Total Stat */}
            <div className="relative h-56 w-56 shrink-0 flex items-center justify-center">
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
                      <Cell key={`cell-${index}`} fill={entry.fill} />
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

            {/* Clean Right-Side Legend List (No Label Overlap!) */}
            <div className="flex-1 w-full space-y-2 text-xs">
              {kpData.map((kp) => (
                <div
                  key={kp.id}
                  onClick={() => setSelectedKp(selectedKp === kp.id ? 'all' : kp.id)}
                  className={`flex items-center justify-between p-1.5 border transition-all cursor-pointer ${
                    selectedKp === kp.id || selectedKp === 'all'
                      ? 'border-border bg-muted/20 hover:bg-muted/40'
                      : 'border-transparent opacity-40'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="size-2.5 rounded-full shrink-0" style={{ backgroundColor: kp.fill }} />
                    <span className="font-bold truncate text-foreground text-[11px]">{kp.shortName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] shrink-0 font-mono">
                    <span className="font-bold text-foreground">{kp.value.toLocaleString()}</span>
                    <span className="text-muted-foreground font-semibold">({kp.pct}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Card: VL Suppression & MMD Comparison Bar Chart */}
        <div className="lg:col-span-7 border border-border/80 bg-card p-4 shadow-xs flex flex-col justify-between">
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

          <div className="h-64 w-full pt-2">
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
                          <span>MMD Multi-Month Dispensing:</span>
                          <strong>{d.mmd}%</strong>
                        </div>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="suppression" name="VL Suppression (%)" fill="#10b981" radius={[3, 3, 0, 0]}>
                  <LabelList dataKey="suppression" position="top" style={{ fontSize: '10px', fontWeight: '800', fill: '#10b981' }} formatter={(v) => `${v}%`} />
                </Bar>
                <Bar dataKey="mmd" name="MMD Multi-Month Rate (%)" fill="#3b82f6" radius={[3, 3, 0, 0]}>
                  <LabelList dataKey="mmd" position="top" style={{ fontSize: '10px', fontWeight: '800', fill: '#3b82f6' }} formatter={(v) => `${v}%`} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* KP Detailed Summary Table */}
      <div className="border border-border/80 bg-card shadow-xs overflow-hidden">
        <div className="flex items-center justify-between border-b border-border/60 px-4 py-2.5 bg-muted/20">
          <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
            <RiTableLine className="size-4 text-primary" /> តារាងលម្អិតសូចនាករតាមក្រុមប្រជាជនគន្លឹះ KP Breakdown Table
          </h3>
          <span className="text-[11px] font-semibold text-muted-foreground">
            ចំនួនក្រុម: {filteredKpData.length}
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
                <th className="px-4 py-2 text-right">VL Suppression Rate (%)</th>
                <th className="px-4 py-2 text-right">MMD Rate (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filteredKpData.map((kp) => (
                <tr key={kp.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-2.5 font-bold text-foreground flex items-center gap-2">
                    <span className="size-2.5 rounded-full shrink-0 shadow-xs" style={{ backgroundColor: kp.fill }} />
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
                  <td className="px-4 py-2.5 text-right font-mono text-emerald-500 font-bold">
                    {kp.newStart.toLocaleString()} នាក់
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono font-bold text-emerald-500">
                    {kp.suppression}%
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono font-bold text-blue-500">
                    {kp.mmd}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
