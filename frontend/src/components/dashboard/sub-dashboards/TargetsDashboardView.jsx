import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts';

export default function TargetsDashboardView({
  kpis,
  selectedPeriodKey,
  quarterlyTrendData
}) {
  return (
    <>
      {/* Expanded UNAIDS 95-95-95 Target Widget */}
      <div className="border border-border/80 bg-card p-5 rounded-none shadow-xs shrink-0 space-y-4">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div>
            <span className="text-sm font-black text-foreground uppercase tracking-wide">UNAIDS National 95-95-95 Target Progress Evaluation</span>
            <p className="text-xs text-muted-foreground mt-0.5">National HIV Cascade Evaluation & Viral Load Suppression Targets</p>
          </div>
          <span className="px-2.5 py-1 text-xs font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/30">
            National Target Status: On Track
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border border-blue-500/20 bg-blue-500/5 p-4 rounded-none space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-bold text-foreground">1st 95: Diagnosed & Enrolled</span>
              <span className="font-black text-blue-500 text-base">{kpis.first95}%</span>
            </div>
            <div className="h-2.5 w-full bg-muted overflow-hidden rounded-none">
              <div className="h-full bg-blue-500" style={{ width: `${kpis.first95}%` }} />
            </div>
            <p className="text-[11px] text-muted-foreground">Estimated HIV diagnosed individuals enrolled into care.</p>
          </div>

          <div className="border border-emerald-500/20 bg-emerald-500/5 p-4 rounded-none space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-bold text-foreground">2nd 95: Active on ART Coverage</span>
              <span className="font-black text-emerald-500 text-base">{kpis.second95}%</span>
            </div>
            <div className="h-2.5 w-full bg-muted overflow-hidden rounded-none">
              <div className="h-full bg-emerald-500" style={{ width: `${kpis.second95}%` }} />
            </div>
            <p className="text-[11px] text-muted-foreground">Active ART patients currently receiving sustained treatment.</p>
          </div>

          <div className="border border-violet-500/20 bg-violet-500/5 p-4 rounded-none space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-bold text-foreground">3rd 95: Viral Load Suppression</span>
              <span className="font-black text-violet-500 text-base">{kpis.third95}%</span>
            </div>
            <div className="h-2.5 w-full bg-muted overflow-hidden rounded-none">
              <div className="h-full bg-violet-500" style={{ width: `${kpis.third95}%` }} />
            </div>
            <p className="text-[11px] text-muted-foreground">Patients with suppressed viral load (&lt;1000 copies/mL).</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border/40 text-xs">
          <div className="flex items-center justify-between p-3 bg-muted/20 border border-border/40">
            <span className="font-semibold text-foreground">6-Month ART Retention Rate:</span>
            <strong className="text-emerald-500 text-sm font-bold">{kpis.retentionRate}%</strong>
          </div>
          <div className="flex items-center justify-between p-3 bg-muted/20 border border-border/40">
            <span className="font-semibold text-foreground">Viral Load Testing Coverage:</span>
            <strong className="text-blue-500 text-sm font-bold">{kpis.vlCoverageRate}%</strong>
          </div>
        </div>
      </div>

      {/* 4-Quarter Trajectory Area Chart */}
      <div className="border border-border/80 bg-card p-4 rounded-none shadow-xs shrink-0">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-foreground">និន្នាការកើនឡើងរបស់អ្នកជំងឺ ៤ ត្រីមាស (4-Quarter Active ART & VL Suppression Trajectory)</span>
          <span className="text-[10px] text-muted-foreground">Q4 2025 – Q3 2026</span>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={quarterlyTrendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorSuppressed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="period" tick={{ fontSize: 10, fill: 'currentColor' }} />
              <YAxis tick={{ fontSize: 10, fill: 'currentColor' }} />
              <Tooltip
                contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: 0, fontSize: '11px' }}
                formatter={(val) => Number(val).toLocaleString()}
              />
              <Area type="monotone" dataKey="activeArt" name="Active ART" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorActive)" />
              <Area type="monotone" dataKey="suppressed" name="VL Suppressed" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorSuppressed)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
}
