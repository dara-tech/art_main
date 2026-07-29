import React from 'react';
import { createPortal } from 'react-dom';
import { RiCloseLine, RiBarChartBoxLine } from '@remixicon/react';
import {
  ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  LabelList, Cell, Legend,
} from 'recharts';

/**
 * ChartDetailModal — Reusable zoom-in chart detail modal.
 * Props:
 *   open, onClose, title, subtitle, data, dataKey, bars, layout, isPct, isStacked, unit, tableColumns
 */
export default function ChartDetailModal({
  open,
  onClose,
  title = 'ក្រាហ្វលម្អិត',
  subtitle = '',
  data = [],
  dataKey = 'val',
  bars = null,
  layout = 'horizontal',
  isPct = false,
  isStacked = false,
  unit = '',
  tableColumns = [],
}) {
  if (!open) return null;

  const fmtVal = (v) => {
    if (v === null || v === undefined) return '—';
    if (isPct) return `${Number(v).toFixed(1)}%`;
    return Number(v).toLocaleString() + (unit ? ` ${unit}` : '');
  };

  const numData = data.map((r) => ({ ...r, [dataKey]: Number(r[dataKey] ?? 0) }));
  const total = numData.reduce((s, r) => s + r[dataKey], 0);
  const max = numData.length ? Math.max(...numData.map((r) => r[dataKey])) : 0;
  const min = numData.length ? Math.min(...numData.map((r) => r[dataKey])) : 0;
  const avg = numData.length ? total / numData.length : 0;

  const PALETTE = [
    '#3b82f6','#10b981','#f59e0b','#8b5cf6',
    '#ec4899','#06b6d4','#84cc16','#f97316',
    '#6366f1','#14b8a6','#ef4444','#a855f7',
  ];

  const resolvedBars = bars ?? [{ key: dataKey, name: title, fill: null }];
  const chartMargin = layout === 'vertical'
    ? { top: 8, right: 64, left: 8, bottom: 8 }
    : { top: 20, right: 20, left: -10, bottom: 56 };

  const modalContent = (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/92 backdrop-blur-md animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative bg-slate-950 border border-slate-700/80 shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden rounded-none mx-3"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-700/80 px-5 py-3.5 bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center bg-blue-500/15 border border-blue-500/30 text-blue-400 rounded-none">
              <RiBarChartBoxLine className="size-4" />
            </div>
            <div>
              <div className="text-sm font-black text-white leading-tight">{title}</div>
              {subtitle && <div className="text-[10px] text-slate-400 mt-0.5">{subtitle}</div>}
            </div>
          </div>
          <button type="button" onClick={onClose}
            className="flex size-8 items-center justify-center border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors cursor-pointer rounded-none">
            <RiCloseLine className="size-4" />
          </button>
        </div>

        {/* Summary strip */}
        <div className="shrink-0 grid grid-cols-4 divide-x divide-slate-800 border-b border-slate-800/80">
          {[
            { label: 'ចំនួន', value: numData.length, accent: 'text-white' },
            { label: 'ខ្ពស់បំផុត', value: fmtVal(max), accent: 'text-emerald-400' },
            { label: 'ទាបបំផុត', value: fmtVal(min), accent: 'text-rose-400' },
            { label: isPct ? 'មធ្យម' : 'សរុប', value: isPct ? fmtVal(avg) : fmtVal(total), accent: 'text-blue-400' },
          ].map(({ label, value, accent }) => (
            <div key={label} className="px-4 py-2.5 text-center">
              <div className="text-[10px] text-slate-500 mb-0.5">{label}</div>
              <div className={`text-sm font-black ${accent}`}>{value}</div>
            </div>
          ))}
        </div>

        {/* Zoomed chart */}
        <div className="px-5 pt-4 pb-2 shrink-0" style={{ height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={numData} layout={layout} margin={chartMargin} barCategoryGap="18%" barGap={4}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.12}
                {...(layout === 'vertical' ? { horizontal: false } : { vertical: false })} />
              {layout === 'vertical' ? (
                <>
                  <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis dataKey="name" type="category"
                    tick={{ fill: '#cbd5e1', fontSize: 10, fontFamily: "'Kantumruy Pro','Hanuman',sans-serif" }}
                    tickLine={false} axisLine={false} width={120} />
                </>
              ) : (
                <>
                  <XAxis dataKey="name"
                    tick={{ fill: '#94a3b8', fontSize: 9, fontFamily: "'Kantumruy Pro','Hanuman',sans-serif" }}
                    angle={-38} textAnchor="end" interval={0} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} axisLine={false} />
                </>
              )}
              <Tooltip cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const row = payload[0]?.payload || {};
                  return (
                    <div className="bg-slate-900 border border-slate-700 px-3 py-2.5 text-xs text-white shadow-2xl font-khmer rounded-none min-w-[160px]">
                      <div className="font-bold text-sky-300 border-b border-slate-700/60 pb-1.5 mb-1.5 text-[11px]">{row.name}</div>
                      {payload.map((item) => (
                        <div key={item.dataKey} className="flex items-center justify-between gap-3">
                          <span className="text-slate-400">{item.name}:</span>
                          <strong style={{ color: item.fill || item.color }}>
                            {isPct ? `${item.value}%` : Number(item.value).toLocaleString() + (unit ? ` ${unit}` : '')}
                          </strong>
                        </div>
                      ))}
                    </div>
                  );
                }}
              />
              {resolvedBars.length > 1 && <Legend wrapperStyle={{ fontSize: 10, paddingTop: 8 }} />}
              {resolvedBars.map((barDef, bIdx) => (
                <Bar key={barDef.key} dataKey={barDef.key} name={barDef.name}
                  fill={barDef.fill || PALETTE[bIdx % PALETTE.length]}
                  stackId={isStacked ? 'a' : undefined}
                  radius={layout === 'vertical' ? [0, 4, 4, 0] : [3, 3, 0, 0]}>
                  {!barDef.fill && resolvedBars.length === 1 &&
                    numData.map((row, idx) => (
                      <Cell key={`cell-${idx}`} fill={row.fill || PALETTE[idx % PALETTE.length]} />
                    ))
                  }
                  <LabelList dataKey={barDef.key}
                    position={layout === 'vertical' ? 'right' : 'top'}
                    style={{ fill: '#e2e8f0', fontSize: 9, fontWeight: '800' }}
                    formatter={(v) => isPct ? `${v}%` : Number(v).toLocaleString()} />
                </Bar>
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Detail table */}
        <div className="flex-1 overflow-y-auto border-t border-slate-700/60 text-xs">
          <table className="w-full">
            <thead className="sticky top-0 bg-slate-900/95 z-10">
              <tr className="border-b border-slate-700/60">
                <th className="text-left px-4 py-2 text-slate-400 font-semibold w-8">#</th>
                <th className="text-left px-4 py-2 text-slate-400 font-semibold">ឈ្មោះ</th>
                {resolvedBars.map((b) => (
                  <th key={b.key} className="text-right px-4 py-2 text-slate-400 font-semibold">{b.name}</th>
                ))}
                {tableColumns.map((col) => (
                  <th key={col.key} className="text-right px-4 py-2 text-slate-400 font-semibold">{col.label}</th>
                ))}
                {!isPct && resolvedBars.length === 1 && (
                  <th className="text-right px-4 py-2 text-slate-400 font-semibold">ចំណែក %</th>
                )}
              </tr>
            </thead>
            <tbody>
              {numData.map((row, idx) => {
                const primaryVal = row[dataKey];
                const pct = total > 0 ? ((primaryVal / total) * 100).toFixed(1) : '0.0';
                return (
                  <tr key={idx}
                    className={`border-b border-slate-800/60 hover:bg-slate-800/40 transition-colors ${idx % 2 === 1 ? 'bg-slate-900/30' : ''}`}>
                    <td className="px-4 py-2 text-slate-500 font-mono">{idx + 1}</td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <span className="inline-block w-2 h-2 rounded-full shrink-0"
                          style={{ background: row.fill || PALETTE[idx % PALETTE.length] }} />
                        <span className="text-slate-200 font-medium">{row.name}</span>
                      </div>
                    </td>
                    {resolvedBars.map((b) => (
                      <td key={b.key} className="px-4 py-2 text-right font-bold text-white">
                        {isPct ? `${row[b.key]}%` : Number(row[b.key] ?? 0).toLocaleString() + (unit ? ` ${unit}` : '')}
                      </td>
                    ))}
                    {tableColumns.map((col) => (
                      <td key={col.key} className="px-4 py-2 text-right text-slate-300">
                        {col.format ? col.format(row[col.key], row) : (row[col.key] ?? '—')}
                      </td>
                    ))}
                    {!isPct && resolvedBars.length === 1 && (
                      <td className="px-4 py-2 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <div className="h-1.5 rounded-full bg-slate-700 w-14 overflow-hidden">
                            <div className="h-full rounded-full"
                              style={{ width: `${pct}%`, background: row.fill || PALETTE[idx % PALETTE.length] }} />
                          </div>
                          <span className="text-slate-400 font-mono text-[10px]">{pct}%</span>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="shrink-0 flex items-center justify-between px-5 py-2 border-t border-slate-700/60 bg-slate-900/60 text-[10px] text-slate-500">
          <span>ចុចខាងក្រៅដើម្បីបិទ</span>
          <span>{isPct ? `មធ្យម: ${fmtVal(avg)}` : `សរុប: ${fmtVal(total)}`}</span>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
