import React from 'react';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, LabelList } from 'recharts';
import { RiBarChartGroupedFill } from '@remixicon/react';

export default function PmtctTestingView({ testingStageData, handleOpenIndicatorDetail }) {
  return (
    <div className="border border-border/80 bg-card p-4 shadow-xs space-y-3">
      <div className="flex items-center justify-between border-b border-border/60 pb-2">
        <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
          <RiBarChartGroupedFill className="size-4 text-pink-500" /> Smart Chart: ការប្រៀបធៀបតេស្ត DNA PCR ដំបូង និង តេស្តបញ្ជាក់ (Initial vs Confirmatory PCR Tests)
        </h3>
        <span className="text-[10px] font-bold text-pink-500 bg-pink-500/10 px-2 py-0.5">ចុចលើរបារដើម្បីមើលបញ្ជីឈ្មោះទារក</span>
      </div>
      <div className="h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={testingStageData} margin={{ top: 25, right: 15, left: -15, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
            <XAxis dataKey="stage" tick={{ fontSize: 9, fontWeight: '700', fill: 'currentColor' }} className="text-muted-foreground" />
            <YAxis tick={{ fontSize: 10, fill: 'currentColor' }} className="text-muted-foreground" />
            <Tooltip
              cursor={{ fill: 'rgba(236,72,153,0.1)' }}
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                const d = payload[0].payload;
                return (
                  <div className="bg-slate-900 border border-slate-700 p-2.5 text-xs text-white shadow-xl font-khmer">
                    <div className="font-bold border-b border-slate-700 pb-1 mb-1 text-pink-400">{d.stage}</div>
                    <div>តេស្តដំបូង (Initial): <strong className="text-sky-400">{d.initial.toLocaleString()} ទារក</strong></div>
                    <div>តេស្តបញ្ជាក់ (Confirmatory): <strong className="text-rose-400">{d.confirm.toLocaleString()} ទារក</strong></div>
                  </div>
                );
              }}
            />
            <Bar dataKey="initial" name="តេស្តដំបូង (Initial)" fill="#3b82f6" radius={[4, 4, 0, 0]} onClick={(entry) => handleOpenIndicatorDetail(entry.initInd)} className="cursor-pointer">
              <LabelList dataKey="initial" position="center" style={{ fontSize: '9px', fontWeight: '800', fill: '#ffffff' }} formatter={(v) => (v > 0 ? v.toLocaleString() : '')} />
            </Bar>
            <Bar dataKey="confirm" name="តេស្តបញ្ជាក់ (Confirmatory)" fill="#f43f5e" radius={[4, 4, 0, 0]} onClick={(entry) => handleOpenIndicatorDetail(entry.confInd)} className="cursor-pointer">
              <LabelList dataKey="confirm" position="center" style={{ fontSize: '9px', fontWeight: '800', fill: '#ffffff' }} formatter={(v) => (v > 0 ? v.toLocaleString() : '')} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}