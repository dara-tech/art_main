import React from 'react';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, LabelList } from 'recharts';
import { RiBuilding4Line } from '@remixicon/react';

export default function PmtctSitesPerformanceView({ inlineBreakdownChartData, handleBreakdownBarClick }) {
  return (
    <div className="border border-border/80 bg-card p-4 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
        <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
          <RiBuilding4Line className="size-4 text-emerald-500" /> សមត្ថកិច្ចមន្ទីរពេទ្យ EID (Infant EID Sites Performance Ranking)
        </h3>
        <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5">EID Sites Ranking</span>
      </div>
      <div className="h-80 w-full">
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
                  </div>
                );
              }}
            />
            <Bar dataKey="value" name="សរុបទារក (Total)" fill="#10b981" radius={[4, 4, 0, 0]} onClick={(entry) => handleBreakdownBarClick(entry)} className="cursor-pointer">
              <LabelList dataKey="value" position="top" style={{ fontSize: '10px', fontWeight: '800', fill: 'currentColor' }} formatter={(v) => (v > 0 ? v.toLocaleString() : '')} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}