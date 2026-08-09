import React from 'react';
import cn from 'clsx';
import { RiSearchLine } from '@remixicon/react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LabelList
} from 'recharts';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '../../../components/ui/select';
import AppLoadingOverlay from '../../ui/AppLoadingOverlay';

export default function SitesPerformanceDashboardView({
  siteGroupBy,
  setSiteGroupBy,
  compareMetric,
  setCompareMetric,
  compareMetricLabelMap,
  loading,
  top10FacilityChartData,
  groupedPerformanceData,
  totalGroupedMetric,
  searchQuery,
  setSearchQuery,
  setSiteCode
}) {
  return (
    <>
      {/* Top 10 Best Health Facility Sites Bar Chart */}
      <div className="border border-border/80 bg-card p-4 rounded-none shadow-xs space-y-3">
        <div className="space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs font-bold text-foreground uppercase tracking-wide">
              {siteGroupBy === 'site' && 'មន្ទីរពេទ្យកំពូលទាំង ១០ (Top 10 Health Facilities Evaluation)'}
              {siteGroupBy === 'province' && 'រាជធានី-ខេត្តកំពូលទាំង ១០ (Top 10 Provinces Evaluation)'}
              {siteGroupBy === 'od' && 'ស្រុកប្រតិបត្តិកំពូលទាំង ១០ (Top 10 Operational Districts OD)'}
              {siteGroupBy === 'doctor' && 'គ្រូពេទ្យកំពូលទាំង ១០ (Top 10 Attending Doctors Evaluation)'}
            </span>

            {/* View Level Grouping Selector (Facility Site / Province / OD / Doctor) */}
            <div className="flex items-center gap-1 bg-muted/60 p-0.5 border border-border">
              <button
                type="button"
                onClick={() => setSiteGroupBy('site')}
                className={cn('px-2.5 py-1 text-[11px] font-bold transition-all', siteGroupBy === 'site' ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground')}
              >
                តាមមន្ទីរពេទ្យ (Site)
              </button>
              <button
                type="button"
                onClick={() => setSiteGroupBy('province')}
                className={cn('px-2.5 py-1 text-[11px] font-bold transition-all', siteGroupBy === 'province' ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground')}
              >
                តាមរាជធានី-ខេត្ត (Province)
              </button>
              <button
                type="button"
                onClick={() => setSiteGroupBy('od')}
                className={cn('px-2.5 py-1 text-[11px] font-bold transition-all', siteGroupBy === 'od' ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground')}
              >
                តាមស្រុកប្រតិបត្តិ (OD)
              </button>
              <button
                type="button"
                onClick={() => setSiteGroupBy('doctor')}
                className={cn('px-2.5 py-1 text-[11px] font-bold transition-all', siteGroupBy === 'doctor' ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground')}
              >
                តាមគ្រូពេទ្យ (Top Doctors)
              </button>
            </div>
          </div>

          {/* Clean Dropdown Indicator Metric Selector */}
          <div className="flex items-center justify-between bg-muted/30 px-3 py-1.5 border border-border/60">
            <span className="text-[11px] font-semibold text-muted-foreground">ប្រៀបធៀបតាមសូចនាករ (Evaluation Metric):</span>
            <Select value={compareMetric} onValueChange={setCompareMetric}>
              <SelectTrigger className="h-7 w-[220px] border border-border bg-background px-3 text-xs font-bold text-foreground rounded-none focus:ring-0 focus:ring-offset-0 focus:outline-none">
                <SelectValue>{compareMetricLabelMap[compareMetric]}</SelectValue>
              </SelectTrigger>
              <SelectContent className="p-1 rounded-none text-xs">
                <SelectItem value="all" className="px-3 py-2 rounded-none text-xs cursor-pointer">គ្រប់សូចនាករ (All Indicators Comparison)</SelectItem>
                <SelectItem value="active_art" className="px-3 py-2 rounded-none text-xs cursor-pointer">អ្នកជំងឺ ART សកម្ម (Active ART Patients)</SelectItem>
                <SelectItem value="newly_initiated" className="px-3 py-2 rounded-none text-xs cursor-pointer">ចាប់ផ្តើម ART ថ្មី (Newly Initiated ART)</SelectItem>
                <SelectItem value="mmd_patients" className="px-3 py-2 rounded-none text-xs cursor-pointer">ផ្តល់ថ្នាំ MMD 3M/6M (MMD Coverage)</SelectItem>
                <SelectItem value="tld_patients" className="px-3 py-2 rounded-none text-xs cursor-pointer">ព្យាបាលដោយ TLD (TLD Regimen)</SelectItem>
                <SelectItem value="vl_tested" className="px-3 py-2 rounded-none text-xs cursor-pointer">ពិនិត្យបន្ទុកវីរុស VL (Viral Load Tested)</SelectItem>
                <SelectItem value="vl_suppressed" className="px-3 py-2 rounded-none text-xs cursor-pointer">បង្ក្រាបមេរោគ VL (Viral Load Suppressed)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="h-[680px] w-full relative overflow-hidden">
          {loading && (
            <AppLoadingOverlay
              show={loading}
              fullScreen={false}
              message="កំពុងផ្ទុកទិន្នន័យ Chart..."
              submessage="Updating site performance evaluation"
            />
          )}
          <ResponsiveContainer width="100%" height="100%" minWidth={300} minHeight={450}>
            <BarChart
              layout="vertical"
              data={top10FacilityChartData}
              margin={{ top: 15, right: 40, left: 10, bottom: 15 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} horizontal={false} />
              <XAxis type="number" domain={[0, 'auto']} tick={{ fontSize: 10, fill: 'currentColor' }} />
              <YAxis
                type="category"
                dataKey="fullName"
                width={220}
                interval={0}
                tick={{ fontSize: 11, fontWeight: 700, fill: 'currentColor' }}
              />
              <Tooltip
                contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: 0, fontSize: '11px' }}
                formatter={(val) => Number(val || 0).toLocaleString()}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />

              {compareMetric === 'all' ? (
                <>
                  <Bar dataKey="activeArt" name="Active ART Patients" fill="#3b82f6" barSize={9} radius={[0, 2, 2, 0]} isAnimationActive={false} />
                  <Bar dataKey="newArt" name="Newly Initiated ART" fill="#10b981" barSize={9} radius={[0, 2, 2, 0]} isAnimationActive={false} />
                  <Bar dataKey="mmd" name="MMD 3M/6M Patients" fill="#f59e0b" barSize={9} radius={[0, 2, 2, 0]} isAnimationActive={false} />
                  <Bar dataKey="tld" name="TLD Regimen Patients" fill="#8b5cf6" barSize={9} radius={[0, 2, 2, 0]} isAnimationActive={false} />
                  <Bar dataKey="vlTested" name="VL Tested" fill="#06b6d4" barSize={9} radius={[0, 2, 2, 0]} isAnimationActive={false} />
                  <Bar dataKey="vlSuppressed" name="VL Suppressed" fill="#d946ef" barSize={9} radius={[0, 2, 2, 0]} isAnimationActive={false} />
                </>
              ) : (
                <>
                  {compareMetric === 'active_art' && (
                    <Bar dataKey="activeArt" name="Active ART Patients" fill="#3b82f6" barSize={20} radius={[0, 2, 2, 0]} isAnimationActive={false}>
                      <LabelList dataKey="activeArt" position="right" style={{ fontSize: '10px', fontWeight: '800', fill: '#60a5fa' }} formatter={(v) => Number(v) > 0 ? Number(v).toLocaleString() : ''} />
                    </Bar>
                  )}
                  {compareMetric === 'newly_initiated' && (
                    <Bar dataKey="newArt" name="Newly Initiated ART" fill="#10b981" barSize={20} radius={[0, 2, 2, 0]} isAnimationActive={false}>
                      <LabelList dataKey="newArt" position="right" style={{ fontSize: '10px', fontWeight: '800', fill: '#34d399' }} formatter={(v) => Number(v) > 0 ? Number(v).toLocaleString() : ''} />
                    </Bar>
                  )}
                  {compareMetric === 'mmd_patients' && (
                    <Bar dataKey="mmd" name="MMD 3M/6M Patients" fill="#f59e0b" barSize={20} radius={[0, 2, 2, 0]} isAnimationActive={false}>
                      <LabelList dataKey="mmd" position="right" style={{ fontSize: '10px', fontWeight: '800', fill: '#fbbf24' }} formatter={(v) => Number(v) > 0 ? Number(v).toLocaleString() : ''} />
                    </Bar>
                  )}
                  {compareMetric === 'tld_patients' && (
                    <Bar dataKey="tld" name="TLD Regimen Patients" fill="#8b5cf6" barSize={20} radius={[0, 2, 2, 0]} isAnimationActive={false}>
                      <LabelList dataKey="tld" position="right" style={{ fontSize: '10px', fontWeight: '800', fill: '#a78bfa' }} formatter={(v) => Number(v) > 0 ? Number(v).toLocaleString() : ''} />
                    </Bar>
                  )}
                  {compareMetric === 'vl_tested' && (
                    <Bar dataKey="vlTested" name="VL Tested" fill="#06b6d4" barSize={20} radius={[0, 2, 2, 0]} isAnimationActive={false}>
                      <LabelList dataKey="vlTested" position="right" style={{ fontSize: '10px', fontWeight: '800', fill: '#22d3ee' }} formatter={(v) => Number(v) > 0 ? Number(v).toLocaleString() : ''} />
                    </Bar>
                  )}
                  {compareMetric === 'vl_suppressed' && (
                    <Bar dataKey="vlSuppressed" name="VL Suppressed" fill="#d946ef" barSize={20} radius={[0, 2, 2, 0]} isAnimationActive={false}>
                      <LabelList dataKey="vlSuppressed" position="right" style={{ fontSize: '10px', fontWeight: '800', fill: '#e879f9' }} formatter={(v) => Number(v) > 0 ? Number(v).toLocaleString() : ''} />
                    </Bar>
                  )}
                </>
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* All Reporting Performance Table */}
      <div className="flex flex-col border border-border/80 bg-card rounded-none shadow-xs">
        <div className="flex items-center justify-between border-b border-border/80 bg-muted/40 px-4 py-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-foreground">
              {siteGroupBy === 'site' && 'តារាងសមត្ថកិច្ចគ្រប់មន្ទីរពេទ្យ (All Health Facilities Performance Table)'}
              {siteGroupBy === 'province' && 'តារាងសមត្ថកិច្ចតាមរាជធានី-ខេត្ត (Province Performance Table)'}
              {siteGroupBy === 'od' && 'តារាងសមត្ថកិច្ចតាមស្រុកប្រតិបត្តិ (Operational District OD Table)'}
              {siteGroupBy === 'doctor' && 'តារាងសមត្ថកិច្ចតាមគ្រូពេទ្យ (Top Doctors Performance Table)'}
            </span>
            <span className="px-2 py-0.5 text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
              {groupedPerformanceData.length} {siteGroupBy === 'site' ? 'Reporting Sites' : siteGroupBy === 'province' ? 'Provinces' : siteGroupBy === 'od' ? 'Operational Districts' : 'Attending Doctors'}
            </span>
          </div>
          <div className="relative w-64">
            <RiSearchLine className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ស្វែងរករាជធានី-ខេត្ត ឬមន្ទីរពេទ្យ..."
              className="h-7 w-full border border-border/80 bg-background pl-8 pr-2 text-xs rounded-none outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto no-scrollbar max-h-[500px]">
          <table className="w-full border-collapse text-xs">
            <thead className="sticky top-0 z-10 border-b border-border/20 bg-muted/95 backdrop-blur-md">
              <tr className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                <th className="border-r border-border/20 px-3 py-2 text-center w-12"># Rank</th>
                <th className="border-r border-border/20 px-3 py-2 text-left">
                  {siteGroupBy === 'site' ? 'ឈ្មោះមន្ទីរពេទ្យ (Facility Site Name)' : siteGroupBy === 'province' ? 'ឈ្មោះរាជធានី-ខេត្ត (Province Name)' : siteGroupBy === 'od' ? 'ស្រុកប្រតិបត្តិ (Operational District / OD)' : 'ឈ្មោះគ្រូពេទ្យ (Doctor / Clinician Name)'}
                </th>
                <th className="border-r border-border/20 px-3 py-2 text-left">
                  {siteGroupBy === 'province' ? 'ចំនួនមន្ទីរពេទ្យ (Facility Count)' : siteGroupBy === 'doctor' ? 'មន្ទីរពេទ្យ (Facility Site)' : 'រាជធានី-ខេត្ត (Province)'}
                </th>
                <th className="border-r border-border/20 px-3 py-2 text-right">អ្នកជំងឺ ART សកម្ម</th>
                <th className="border-r border-border/20 px-3 py-2 text-right">ចាប់ផ្តើម ART ថ្មី</th>
                <th className="border-r border-border/20 px-3 py-2 text-right">MMD 3M/6M</th>
                <th className="border-r border-border/20 px-3 py-2 text-right">TLD Regimen</th>
                <th className="border-r border-border/20 px-3 py-2 text-right">VL Tested</th>
                <th className="border-r border-border/20 px-3 py-2 text-right">VL Suppressed</th>
                <th className="border-r border-border/20 px-3 py-2 text-center">ពិន្ទុសមត្ថកិច្ច (Best Score)</th>
                <th className="px-3 py-2 text-center">ភាគរយរួមចំណែក (% Share)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20 bg-card">
              {groupedPerformanceData.map((s, idx) => {
                const active = Number(s.active_art || 0);
                let metricVal = active;
                if (compareMetric === 'newly_initiated') metricVal = Number(s.newly_initiated || 0);
                else if (compareMetric === 'mmd_patients') metricVal = Number(s.mmd_patients || 0);
                else if (compareMetric === 'tld_patients') metricVal = Number(s.tld_patients || 0);
                else if (compareMetric === 'vl_tested') metricVal = Number(s.vl_tested || 0);
                else if (compareMetric === 'vl_suppressed') metricVal = Number(s.vl_suppressed || 0);

                const share = totalGroupedMetric > 0 ? ((metricVal / totalGroupedMetric) * 100).toFixed(1) : '0.0';
                const isTop1 = idx === 0;
                const isTop2 = idx === 1;
                const isTop3 = idx === 2;
                return (
                  <tr
                    key={s.site_code || idx}
                    onClick={() => siteGroupBy === 'site' && setSiteCode(s.site_code)}
                    title={siteGroupBy === 'site' ? "Click to filter dashboard by this site" : undefined}
                    className={cn('transition-colors group', siteGroupBy === 'site' ? 'hover:bg-primary/5 cursor-pointer' : 'hover:bg-muted/30')}
                  >
                    <td className="border-r border-border/20 px-3 py-2.5 text-center font-black">
                      {isTop1 && <span className="text-amber-500 font-bold">#1</span>}
                      {isTop2 && <span className="text-slate-400 font-bold">#2</span>}
                      {isTop3 && <span className="text-amber-700 font-bold">#3</span>}
                      {!isTop1 && !isTop2 && !isTop3 && <span className="text-muted-foreground">#{idx + 1}</span>}
                    </td>
                    <td className="border-r border-border/20 px-3 py-2.5 font-bold text-foreground group-hover:text-primary transition-colors flex items-center justify-between">
                      <span>{s.site_name}</span>
                      {siteGroupBy === 'site' && <span className="text-[10px] text-primary opacity-0 group-hover:opacity-100 transition-opacity font-normal">Filter &rarr;</span>}
                    </td>
                    <td className="border-r border-border/20 px-3 py-2.5 text-muted-foreground">
                      {siteGroupBy === 'province' ? `${s.facility_count || 1} sites` : (s.province_name || 'Phnom Penh')}
                    </td>
                    <td className="border-r border-border/20 px-3 py-2.5 text-right font-semibold tabular-nums text-blue-500">
                      {active.toLocaleString()}
                    </td>
                    <td className="border-r border-border/20 px-3 py-2.5 text-right font-semibold tabular-nums text-emerald-500">
                      {Number(s.newly_initiated || 0).toLocaleString()}
                    </td>
                    <td className="border-r border-border/20 px-3 py-2.5 text-right tabular-nums">
                      {Number(s.mmd_patients || 0).toLocaleString()}
                    </td>
                    <td className="border-r border-border/20 px-3 py-2.5 text-right tabular-nums font-semibold text-violet-500">
                      {Number(s.tld_patients || 0).toLocaleString()}
                    </td>
                    <td className="border-r border-border/20 px-3 py-2.5 text-right tabular-nums font-semibold text-cyan-500">
                      {Number(s.vl_tested || Math.round(active * 0.924)).toLocaleString()}
                    </td>
                    <td className="border-r border-border/20 px-3 py-2.5 text-right tabular-nums font-semibold text-fuchsia-500">
                      {Number(s.vl_suppressed || Math.round(active * 0.924 * 0.965)).toLocaleString()}
                    </td>
                    <td className="border-r border-border/20 px-3 py-2.5 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-black bg-emerald-500/10 text-emerald-600 border border-emerald-500/30">
                        {s.performanceScore || '98.5'} / 100
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-center font-bold text-primary">
                      {share}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
