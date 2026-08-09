import React from 'react';
import { RiAlertLine, RiTableLine } from '@remixicon/react';

export default function PmtctDqaView({
  dqaMetrics,
  dqaCategoryFilter,
  setDqaCategoryFilter,
  infantIndicators,
  handleOpenIndicatorDetail
}) {
  return (
    <div className="border border-border/80 bg-card p-4 shadow-xs space-y-4 font-khmer">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-border/60 pb-2.5 gap-2">
        <div>
          <h3 className="text-xs font-bold text-rose-500 flex items-center gap-1.5">
            <RiAlertLine className="size-4 text-rose-500" /> សវនកម្មគុណភាពទិន្នន័យ DQA គ្រប់ដំណាក់កាល EID Cascade (All-Cascade DQA Audit)
          </h3>
          <p className="text-[10px] text-muted-foreground mt-0.5">DQA Detection Audit across all 18 EID Indicators and Cascade stages</p>
        </div>
        
        {/* CASCADE STAGE FILTER TABS */}
        <div className="flex items-center gap-1 bg-muted/40 p-1 border border-border/60 text-[10px] font-bold">
          <button
            onClick={() => setDqaCategoryFilter('ALL')}
            className={`px-2 py-0.5 transition-colors ${dqaCategoryFilter === 'ALL' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            គ្រប់ដំណាក់កាល ({dqaMetrics.fullIssueList.length})
          </button>
          <button
            onClick={() => setDqaCategoryFilter('enrollment')}
            className={`px-2 py-0.5 transition-colors ${dqaCategoryFilter === 'enrollment' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            ការចុះឈ្មោះ
          </button>
          <button
            onClick={() => setDqaCategoryFilter('prophylaxis')}
            className={`px-2 py-0.5 transition-colors ${dqaCategoryFilter === 'prophylaxis' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            ឱសថ Cotrim
          </button>
          <button
            onClick={() => setDqaCategoryFilter('testing')}
            className={`px-2 py-0.5 transition-colors ${dqaCategoryFilter === 'testing' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            តេស្ត PCR
          </button>
          <button
            onClick={() => setDqaCategoryFilter('outcomes')}
            className={`px-2 py-0.5 transition-colors ${dqaCategoryFilter === 'outcomes' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            លទ្ធផល/ចាកចេញ
          </button>
        </div>
      </div>

      {/* 10 SMART CASCADE DQA AUDIT CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
        {dqaMetrics.filteredIssues.map((issue) => (
          <div
            key={issue.id}
            onClick={() => handleOpenIndicatorDetail(infantIndicators.find(i => i.id === issue.indId))}
            className="border border-border/80 bg-card hover:border-primary/50 p-2.5 cursor-pointer transition-colors space-y-1 shadow-2xs group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-mono font-bold text-muted-foreground group-hover:text-primary">{issue.code}</span>
              <span className={`text-[8px] font-bold px-1 py-0.5 rounded-none ${issue.severity === 'High' ? 'bg-rose-500/20 text-rose-400' : issue.severity === 'Medium' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'}`}>
                {issue.severity}
              </span>
            </div>
            <div className="text-[11px] font-bold text-foreground truncate">{issue.label}</div>
            <div className="text-base font-extrabold text-foreground group-hover:text-primary">{issue.count.toLocaleString()} <span className="text-[9px] text-muted-foreground font-normal">ទារក</span></div>
          </div>
        ))}
      </div>

      {/* CASCADE DQA AUDIT TABLE */}
      <div className="border border-border/60 bg-card overflow-hidden">
        <div className="flex items-center justify-between border-b border-border/60 px-4 py-2.5 bg-muted/20">
          <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
            <RiTableLine className="size-4 text-primary" /> តារាងសវនកម្ម DQA គ្រប់សូចនាករទាំង ១៨ (All 18 Cascade Indicators DQA Audit Table)
          </h4>
          <span className="text-[10px] text-muted-foreground">ចុចលើជួរដេកដើម្បីទាញយកបញ្ជីឈ្មោះទារកក្នុង SQL</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border/60 bg-muted/40 text-muted-foreground font-bold">
                <th className="px-3.5 py-2">ល.រ</th>
                <th className="px-3.5 py-2">កូដ DQA</th>
                <th className="px-3.5 py-2">ដំណាក់កាល Cascade</th>
                <th className="px-3.5 py-2">សូចនាករ DQA audit (Cascade Indicator Audit)</th>
                <th className="px-3.5 py-2">កម្រិត (Severity)</th>
                <th className="px-3.5 py-2 text-right">ចំនួនករណី (Count)</th>
                <th className="px-3.5 py-2 text-right">សកម្មភាព (Action)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {dqaMetrics.filteredIssues.map((issue, idx) => (
                <tr
                  key={issue.id}
                  onClick={() => handleOpenIndicatorDetail(infantIndicators.find(i => i.id === issue.indId))}
                  className="hover:bg-primary/5 cursor-pointer transition-colors group"
                >
                  <td className="px-3.5 py-2 font-mono text-muted-foreground">{idx + 1}</td>
                  <td className="px-3.5 py-2 font-mono font-bold text-primary">{issue.code}</td>
                  <td className="px-3.5 py-2 font-semibold text-muted-foreground capitalize">{issue.stage}</td>
                  <td className="px-3.5 py-2 font-bold text-foreground group-hover:text-primary">{issue.label}</td>
                  <td>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 ${issue.severity === 'High' ? 'bg-rose-500/20 text-rose-400' : issue.severity === 'Medium' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'}`}>
                      {issue.severity}
                    </span>
                  </td>
                  <td className="px-3.5 py-2 text-right font-mono font-bold text-foreground">{issue.count.toLocaleString()} ទារក</td>
                  <td className="px-3.5 py-2 text-right text-primary font-bold text-[11px] group-hover:underline">
                    មើលទិន្នន័យ SQL ➔
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