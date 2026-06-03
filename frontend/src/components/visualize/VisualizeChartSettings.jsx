import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { RiSettings3Line, RiCloseLine } from '@remixicon/react';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { p360ControlClass } from '../layout/appNavStyles';
import { TOOLBAR_ICON } from '../layout/toolbarIconColors';
import { VizToolbarBtn } from './visualizeToolbarUi';
import { VIZ_KH } from '../../pages/visualizeKh';
import { Button } from '@/components/ui/button';
import {
  applySeriesColors,
  CHART_FONT_SIZE_OPTIONS,
  CHART_FONT_WEIGHT_OPTIONS,
  CHART_PALETTE_IDS,
  colorToPickerHex,
  DEFAULT_CHART_SETTINGS,
  resolveSeriesColor
} from '../../utils/visualizeChartSettings';
import { CHART_TYPE_IDS, supportsTrendLine, usesBarOptions, usesLineCurve } from '../../utils/visualizeChartTypes';

const SETTINGS_SELECT_ITEM =
  'rounded-none px-2 py-1.5 text-[11px] data-[selected]:bg-primary data-[selected]:text-primary-foreground';

export default function VisualizeChartSettings({
  settings,
  onChange,
  className,
  series = [],
  chartVariant = 'bar',
  onChartVariantChange,
  panel = 'trend',
  colorByFacility = false,
  sites = [],
  siteCode = '',
  compareSiteCodes = [],
  indicatorIds = [],
  periodKeys = [],
  catalog = [],
  scopeMode = 'rollup'
}) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('data'); // 'data' | 'legend' | 'series' | 'style' | 'limitValues' | 'parameters'
  const rootRef = useRef(null);
  const s = { ...DEFAULT_CHART_SETTINGS, ...settings };
  const coloredSeries = applySeriesColors(series, s);
  const showTrendPanel = panel === 'trend';

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const patch = (partial) => onChange?.({ ...s, ...partial });

  const setSeriesColor = (seriesId, hex) => {
    patch({ seriesColors: { ...s.seriesColors, [seriesId]: hex } });
  };

  const clearSeriesColor = (seriesId) => {
    const next = { ...s.seriesColors };
    delete next[seriesId];
    patch({ seriesColors: next });
  };

  const resetAllColors = () => patch({ seriesColors: {}, colorPalette: 'default' });

  const getSiteLabel = (code) => {
    const sObj = sites.find((x) => x.code === code);
    return sObj ? sObj.name : code;
  };

  const getIndicatorLabel = (id) => {
    const ind = catalog.find((x) => x.id === id);
    return ind ? (ind.shortName || ind.name || id) : id;
  };

  const getTabClass = (tabId) => {
    const isActive = activeTab === tabId;
    return cn(
      'inline-flex shrink-0 items-center justify-center gap-1.5 h-8 px-4 text-[11px] font-semibold transition-all relative rounded-t-[6px] select-none border-t border-l border-r outline-none cursor-pointer',
      isActive
        ? 'bg-card text-foreground border-border/80 z-10 -mb-[1px]'
        : 'bg-transparent text-white/70 border-transparent hover:bg-white/10 hover:text-white border-b-transparent'
    );
  };

  return (
    <div ref={rootRef} className={cn('relative shrink-0', className)}>
      <VizToolbarBtn
        icon={RiSettings3Line}
        iconClassName={TOOLBAR_ICON.slate}
        label={VIZ_KH.chartSettings}
        active={open}
        aria-expanded={open}
        onClick={() => setOpen(true)}
        title={VIZ_KH.chartSettingsTitle}
      />

      {open && createPortal(
        <div
          className="fixed inset-0 z-[150] flex items-center justify-center bg-black/50 p-3 backdrop-blur-[2px] sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="chart-options-title"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div
            className="flex max-h-[min(92vh,38rem)] w-full max-w-2xl flex-col overflow-hidden bg-card shadow-2xl shadow-black/15 border-none rounded-2xl"
            onMouseDown={(e) => e.stopPropagation()}
          >
            {/* Modal Header - Dark plum color consistency */}
            <div className="flex shrink-0 items-center justify-between gap-3 bg-[#2a1720] border-b border-white/10 px-4 py-3 text-white">
              <h2 id="chart-options-title" className="text-sm font-bold tracking-wide">
                Options (ជម្រើសគំនូសតាង)
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex size-7 shrink-0 items-center justify-center rounded-md cursor-pointer text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close"
              >
                <RiCloseLine className="size-4.5" />
              </button>
            </div>

            {/* Modal Tabs - Styled like App Navigation Bar tabs */}
            <div className="shrink-0 bg-[#2a1720] pt-2 px-3 border-b border-border/80">
              <nav className="flex min-w-0 flex-1 items-end gap-0.5 overflow-x-auto no-scrollbar relative -mb-[1px] z-10" aria-label="Settings Tabs">
                <button type="button" onClick={() => setActiveTab('data')} className={getTabClass('data')}>
                  Data
                </button>
                <button type="button" onClick={() => setActiveTab('legend')} className={getTabClass('legend')}>
                  Legend
                </button>
                <button type="button" onClick={() => setActiveTab('series')} className={getTabClass('series')}>
                  Series
                </button>
                <button type="button" onClick={() => setActiveTab('style')} className={getTabClass('style')}>
                  Style
                </button>
                <button type="button" onClick={() => setActiveTab('limitValues')} className={getTabClass('limitValues')}>
                  Limit values
                </button>
                <button type="button" onClick={() => setActiveTab('parameters')} className={getTabClass('parameters')}>
                  Parameters
                </button>
              </nav>
            </div>

            {/* Modal Content */}
            <div className="min-h-0 flex-1 overflow-y-auto p-5 bg-card">
              {activeTab === 'data' && (
                <div className="space-y-4">
                  <div className="block">
                    <span className="mb-1.5 block font-bold text-foreground text-xs">{VIZ_KH.chartType}</span>
                    <Select value={chartVariant} onValueChange={onChartVariantChange}>
                      <SelectTrigger className={cn(p360ControlClass, 'w-full rounded-none px-3')}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-none p-1">
                        {CHART_TYPE_IDS.map((id) => (
                          <SelectItem key={id} value={id} className={SETTINGS_SELECT_ITEM}>
                            {VIZ_KH[`chartType_${id}`] || id}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {supportsTrendLine(chartVariant) && (
                    <label className="flex items-center gap-2.5 cursor-pointer py-1 select-none">
                      <input
                        type="checkbox"
                        className="size-4 rounded-none border border-border accent-primary cursor-pointer"
                        checked={Boolean(s.showTrendLine)}
                        onChange={(e) => patch({ showTrendLine: e.target.checked })}
                      />
                      <span className="text-xs font-semibold text-foreground">{VIZ_KH.chartShowTrendLine}</span>
                    </label>
                  )}

                  <div className="block">
                    <span className="mb-1.5 block font-bold text-foreground text-xs">{VIZ_KH.chartXLabels}</span>
                    <select
                      value={s.xLabelAngle || 'auto'}
                      onChange={(e) => patch({ xLabelAngle: e.target.value })}
                      className={cn(p360ControlClass, 'w-full')}
                    >
                      <option value="auto">{VIZ_KH.chartXLabelsAuto}</option>
                      <option value="straight">{VIZ_KH.chartXLabelsStraight}</option>
                      <option value="slanted">{VIZ_KH.chartXLabelsSlanted}</option>
                    </select>
                  </div>

                  <div className="block">
                    <span className="mb-1.5 block font-bold text-foreground text-xs">
                      សូចនាករអតិបរមាលើគំនូសតាង (Max indicators on chart)
                    </span>
                    <select
                      value={String(s.maxChartSeries ?? 6)}
                      onChange={(e) => patch({ maxChartSeries: Number(e.target.value) })}
                      className={cn(p360ControlClass, 'w-full')}
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => (
                        <option key={n} value={n}>
                          {n} {n === 1 ? 'សូចនាករ (indicator)' : 'សូចនាករ (indicators)'}
                        </option>
                      ))}
                    </select>
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      កំណត់ចំនួនសូចនាករ/ស៊េរីច្រើនបំផុតដែលបង្ហាញស្ថិតក្នុងគំនូសតាងមួយ
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'legend' && (
                <div className="space-y-4">
                  <label className="flex items-center gap-2.5 cursor-pointer py-1 select-none">
                    <input
                      type="checkbox"
                      className="size-4 rounded-none border border-border accent-primary cursor-pointer"
                      checked={s.showLegend !== false}
                      onChange={(e) => patch({ showLegend: e.target.checked })}
                    />
                    <span className="text-xs font-semibold text-foreground">{VIZ_KH.chartShowLegend}</span>
                  </label>

                  <div className="space-y-2">
                    <span className="block font-bold text-foreground text-xs">{VIZ_KH.chartTooltipHover}</span>
                    <div className="flex flex-col gap-2">
                      <label className="flex items-center gap-2.5 cursor-pointer select-none">
                        <input
                          type="radio"
                          name="chart-tooltip-shared"
                          className="accent-primary size-4 cursor-pointer"
                          checked={s.tooltipShared !== false}
                          onChange={() => patch({ tooltipShared: true })}
                        />
                        <span className="text-xs font-medium text-foreground">{VIZ_KH.chartTooltipAll}</span>
                      </label>
                      <label className="flex items-center gap-2.5 cursor-pointer select-none">
                        <input
                          type="radio"
                          name="chart-tooltip-shared"
                          className="accent-primary size-4 cursor-pointer"
                          checked={s.tooltipShared === false}
                          onChange={() => patch({ tooltipShared: false })}
                        />
                        <span className="text-xs font-medium text-foreground">{VIZ_KH.chartTooltipSingle}</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'series' && (
                <div className="space-y-4">
                  <p className="text-xs text-muted-foreground">
                    {colorByFacility ? VIZ_KH.chartColorByFacility : VIZ_KH.chartColorByIndicator}
                  </p>

                  <div className="block">
                    <span className="mb-1.5 block font-bold text-foreground text-xs">{VIZ_KH.chartColorPalette}</span>
                    <select
                      value={s.colorPalette || 'default'}
                      onChange={(e) => patch({ colorPalette: e.target.value })}
                      className={cn(p360ControlClass, 'w-full')}
                    >
                      {CHART_PALETTE_IDS.map((id) => (
                        <option key={id} value={id}>
                          {VIZ_KH[`chartPalette_${id}`] || id}
                        </option>
                      ))}
                    </select>
                  </div>

                  {coloredSeries.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-foreground text-xs">{VIZ_KH.chartSeriesColors}</span>
                        <button
                          type="button"
                          className="text-[11px] text-primary hover:underline font-bold cursor-pointer"
                          onClick={resetAllColors}
                        >
                          {VIZ_KH.chartResetColors}
                        </button>
                      </div>
                      <ul className="max-h-56 space-y-1.5 overflow-y-auto border border-border/80 bg-muted/10 p-2.5 rounded-none no-scrollbar">
                        {coloredSeries.map((item, i) => {
                          const overridden = Boolean(s.seriesColors?.[item.id]);
                          const pickerVal = colorToPickerHex(
                            overridden ? s.seriesColors[item.id] : resolveSeriesColor(item.id, i, s)
                          );
                          return (
                            <li key={item.id} className="flex items-center gap-2 bg-card p-1 border border-border/40">
                              <span
                                className="size-3.5 shrink-0 border border-border/80 rounded-sm"
                                style={{ backgroundColor: item.color }}
                                aria-hidden
                              />
                              <span className="min-w-0 flex-1 truncate text-xs font-medium text-foreground" title={item.label}>
                                {item.label}
                              </span>
                              <input
                                type="color"
                                value={pickerVal}
                                onChange={(e) => setSeriesColor(item.id, e.target.value)}
                                className="h-6 w-10 shrink-0 cursor-pointer border border-border bg-background p-0 rounded-sm"
                                title={VIZ_KH.chartPickColor}
                              />
                              {overridden && (
                                <button
                                  type="button"
                                  className="shrink-0 px-1 text-xs text-muted-foreground hover:text-foreground font-bold cursor-pointer"
                                  onClick={() => clearSeriesColor(item.id)}
                                  title={VIZ_KH.chartResetOneColor}
                                >
                                  ↺
                                </button>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'style' && (
                <div className="space-y-5">
                  {/* Table Style Options */}
                  <div className="space-y-4 border-b border-border/40 pb-5">
                    <h3 className="text-xs font-bold text-primary uppercase tracking-wider">Table Options (ជម្រើសតារាង)</h3>
                    
                    <div className="block">
                      <span className="mb-1.5 block font-bold text-foreground text-xs">Table title (ចំណងជើងតារាង)</span>
                      <input
                        type="text"
                        value={s.tableTitle || ''}
                        onChange={(e) => patch({ tableTitle: e.target.value })}
                        placeholder="Add a title (បន្ថែមចំណងជើង)"
                        className={cn(p360ControlClass, 'w-full px-3 py-1.5')}
                      />
                    </div>

                    <div className="block">
                      <span className="mb-1.5 block font-bold text-foreground text-xs">Table subtitle (ចំណងជើងរងតារាង)</span>
                      <input
                        type="text"
                        value={s.tableSubtitle || ''}
                        onChange={(e) => patch({ tableSubtitle: e.target.value })}
                        placeholder="Add a subtitle (បន្ថែមចំណងជើងរង)"
                        className={cn(p360ControlClass, 'w-full px-3 py-1.5')}
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <div className="block">
                        <span className="mb-1.5 block font-bold text-foreground text-xs">Display density</span>
                        <select
                          value={s.displayDensity || 'normal'}
                          onChange={(e) => patch({ displayDensity: e.target.value })}
                          className={cn(p360ControlClass, 'w-full')}
                        >
                          <option value="comfortable">Comfortable</option>
                          <option value="normal">Normal</option>
                          <option value="compact">Compact</option>
                        </select>
                      </div>

                      <div className="block">
                        <span className="mb-1.5 block font-bold text-foreground text-xs">Font size</span>
                        <select
                          value={s.tableFontSize || 'normal'}
                          onChange={(e) => patch({ tableFontSize: e.target.value })}
                          className={cn(p360ControlClass, 'w-full')}
                        >
                          <option value="large">Large</option>
                          <option value="normal">Normal</option>
                          <option value="small">Small</option>
                        </select>
                      </div>

                      <div className="block">
                        <span className="mb-1.5 block font-bold text-foreground text-xs">Digit group separator</span>
                        <select
                          value={s.digitSeparator || 'space'}
                          onChange={(e) => patch({ digitSeparator: e.target.value })}
                          className={cn(p360ControlClass, 'w-full')}
                        >
                          <option value="space">Space</option>
                          <option value="comma">Comma</option>
                          <option value="none">None</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2 pt-1">
                      <label className="flex items-center gap-2.5 cursor-pointer py-0.5 select-none">
                        <input
                          type="checkbox"
                          className="size-4 rounded-none border border-border accent-primary cursor-pointer"
                          checked={Boolean(s.fixColumnHeaders)}
                          onChange={(e) => patch({ fixColumnHeaders: e.target.checked })}
                        />
                        <span className="text-xs font-semibold text-foreground">Fix column headers to top of table</span>
                      </label>

                      <label className="flex items-center gap-2.5 cursor-pointer py-0.5 select-none">
                        <input
                          type="checkbox"
                          className="size-4 rounded-none border border-border accent-primary cursor-pointer"
                          checked={Boolean(s.fixRowHeaders)}
                          onChange={(e) => patch({ fixRowHeaders: e.target.checked })}
                        />
                        <span className="text-xs font-semibold text-foreground">Fix row headers to left of table</span>
                      </label>
                    </div>
                  </div>

                  {/* Chart Style Options */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-primary uppercase tracking-wider">Chart Options (ជម្រើសគំនូសតាង)</h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="block">
                        <span className="mb-1.5 block font-bold text-foreground text-xs">{VIZ_KH.chartFontSize}</span>
                        <select
                          value={String(s.chartFontSize ?? 11)}
                          onChange={(e) => patch({ chartFontSize: Number(e.target.value) })}
                          className={cn(p360ControlClass, 'w-full')}
                        >
                          {CHART_FONT_SIZE_OPTIONS.map((n) => (
                            <option key={n} value={n}>
                              {n}px
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="block">
                        <span className="mb-1.5 block font-bold text-foreground text-xs">{VIZ_KH.chartFontWeight}</span>
                        <select
                          value={s.chartFontWeight || 'medium'}
                          onChange={(e) => patch({ chartFontWeight: e.target.value })}
                          className={cn(p360ControlClass, 'w-full')}
                        >
                          {CHART_FONT_WEIGHT_OPTIONS.map((id) => (
                            <option key={id} value={id}>
                              {VIZ_KH[`chartFont${id[0].toUpperCase()}${id.slice(1)}`] || id}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <label className="flex items-center gap-2.5 cursor-pointer py-1 select-none">
                      <input
                        type="checkbox"
                        className="size-4 rounded-none border border-border accent-primary cursor-pointer"
                        checked={s.showGrid !== false}
                        onChange={(e) => patch({ showGrid: e.target.checked })}
                      />
                      <span className="text-xs font-semibold text-foreground">{VIZ_KH.chartShowGrid}</span>
                    </label>

                    {usesBarOptions(chartVariant) ? (
                      <div className="block">
                        <span className="mb-1.5 block font-bold text-foreground text-xs">{VIZ_KH.chartBarWidth}</span>
                        <select
                          value={String(s.barMaxSize ?? 40)}
                          onChange={(e) => patch({ barMaxSize: Number(e.target.value) })}
                          className={cn(p360ControlClass, 'w-full')}
                        >
                          <option value="28">{VIZ_KH.chartBarNarrow}</option>
                          <option value="40">{VIZ_KH.chartBarMedium}</option>
                          <option value="56">{VIZ_KH.chartBarWide}</option>
                        </select>
                      </div>
                    ) : usesLineCurve(chartVariant) ? (
                      <div className="block">
                        <span className="mb-1.5 block font-bold text-foreground text-xs">{VIZ_KH.chartLineCurve}</span>
                        <select
                          value={s.lineCurve || 'monotone'}
                          onChange={(e) => patch({ lineCurve: e.target.value })}
                          className={cn(p360ControlClass, 'w-full')}
                        >
                          <option value="monotone">{VIZ_KH.chartCurveSmooth}</option>
                          <option value="linear">{VIZ_KH.chartCurveLinear}</option>
                          <option value="step">{VIZ_KH.chartCurveStep}</option>
                        </select>
                      </div>
                    ) : null}
                  </div>

                  {/* Labels Heading & Checkbox */}
                  <div className="space-y-2 pt-2 border-t border-border/40">
                    <span className="block font-bold text-foreground text-xs">Labels (ស្លាកសញ្ញា)</span>
                    <label className="flex items-center gap-2.5 cursor-pointer py-1 select-none">
                      <input
                        type="checkbox"
                        className="size-4 rounded-none border border-border accent-primary cursor-pointer"
                        checked={Boolean(s.showBarLabels)}
                        onChange={(e) => patch({ showBarLabels: e.target.checked })}
                      />
                      <span className="text-xs font-semibold text-foreground">{VIZ_KH.chartShowLabels}</span>
                    </label>
                  </div>
                </div>
              )}

              {activeTab === 'limitValues' && (
                <div className="space-y-4">
                  <label className="flex items-center gap-2.5 cursor-pointer py-1 select-none">
                    <input
                      type="checkbox"
                      className="size-4 rounded-none border border-border accent-primary cursor-pointer"
                      checked={s.yFromZero !== false}
                      onChange={(e) => patch({ yFromZero: e.target.checked })}
                    />
                    <span className="text-xs font-semibold text-foreground">{VIZ_KH.chartYFromZero}</span>
                  </label>

                  <div className="space-y-2">
                    <span className="block font-bold text-foreground text-xs">{VIZ_KH.chartYMax}</span>
                    <div className="flex flex-col gap-2">
                      <label className="flex items-center gap-2.5 cursor-pointer select-none">
                        <input
                          type="radio"
                          name="y-max-mode"
                          className="accent-primary size-4 cursor-pointer"
                          checked={s.yMaxMode !== 'manual'}
                          onChange={() => patch({ yMaxMode: 'auto' })}
                        />
                        <span className="text-xs font-medium text-foreground">{VIZ_KH.chartYMaxAuto}</span>
                      </label>
                      <label className="flex items-center gap-2.5 cursor-pointer select-none">
                        <input
                          type="radio"
                          name="y-max-mode"
                          className="accent-primary size-4 cursor-pointer"
                          checked={s.yMaxMode === 'manual'}
                          onChange={() => patch({ yMaxMode: 'manual' })}
                        />
                        <span className="text-xs font-medium text-foreground">{VIZ_KH.chartYMaxManual}</span>
                      </label>
                    </div>
                    {s.yMaxMode === 'manual' && (
                      <input
                        type="number"
                        min={1}
                        step={1}
                        value={s.yMaxManual ?? 1000}
                        onChange={(e) => patch({ yMaxManual: Number(e.target.value) || 1000 })}
                        className={cn(p360ControlClass, 'w-full tabular-nums')}
                      />
                    )}
                  </div>

                  <div className="block">
                    <span className="mb-1.5 block font-bold text-foreground text-xs">{VIZ_KH.chartYTicks}</span>
                    <select
                      value={String(s.yTicks ?? 5)}
                      onChange={(e) => patch({ yTicks: Number(e.target.value) })}
                      className={cn(p360ControlClass, 'w-full')}
                    >
                      {[4, 5, 6, 8].map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </div>

                  {showTrendPanel && usesBarOptions(chartVariant) && (
                    <label className="flex items-center gap-2.5 cursor-pointer py-1 select-none">
                      <input
                        type="checkbox"
                        className="size-4 rounded-none border border-border accent-primary cursor-pointer"
                        checked={Boolean(s.showBarLabels)}
                        onChange={(e) => patch({ showBarLabels: e.target.checked })}
                      />
                      <span className="text-xs font-semibold text-foreground">{VIZ_KH.chartShowLabels}</span>
                    </label>
                  )}
                </div>
              )}

              {activeTab === 'parameters' && (
                <div className="space-y-4 text-xs">
                  <div className="space-y-3">
                    <div className="border border-border/60 bg-muted/10 p-3 rounded-md">
                      <span className="block font-bold text-foreground mb-1">របៀបបង្ហាញទិន្នន័យ (Scope Mode)</span>
                      <span className="font-semibold text-primary">
                        {scopeMode === 'compare' ? 'ប្រៀបធៀបមូលដ្ឋានសុខាភិបាលច្រើន (Compare Sites)' : 'ទិន្នន័យបូកសរុប (Rollup Data)'}
                      </span>
                    </div>

                    <div className="border border-border/60 bg-muted/10 p-3 rounded-md">
                      <span className="block font-bold text-foreground mb-1">
                        {scopeMode === 'compare' ? 'មូលដ្ឋានសុខាភិបាលប្រៀបធៀប (Compare Facilities)' : 'មូលដ្ឋានសុខាភិបាល (Facility)'}
                      </span>
                      {scopeMode === 'compare' ? (
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {compareSiteCodes.map((code) => (
                            <span key={code} className="bg-card text-foreground px-2 py-0.5 border border-border/80 rounded font-medium">
                              {getSiteLabel(code)}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="font-medium text-foreground">{getSiteLabel(siteCode) || '—'}</span>
                      )}
                    </div>

                    <div className="border border-border/60 bg-muted/10 p-3 rounded-md">
                      <span className="block font-bold text-foreground mb-1">សូចនាករវិភាគ (Indicators)</span>
                      <div className="flex flex-col gap-1.5 mt-1">
                        {indicatorIds.map((id) => (
                          <div key={id} className="flex items-center gap-2">
                            <span className="size-1.5 shrink-0 bg-primary rounded-full" />
                            <span className="font-medium text-foreground">{getIndicatorLabel(id)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="border border-border/60 bg-muted/10 p-3 rounded-md">
                      <span className="block font-bold text-foreground mb-1">រយៈពេលវិភាគ (Periods)</span>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {periodKeys.map((k) => (
                          <span key={k} className="bg-card text-foreground px-2 py-0.5 border border-border/80 rounded font-mono font-medium">
                            {k}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex shrink-0 items-center justify-end gap-2 border-t border-border/80 bg-muted/20 px-4 py-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="min-w-[5.5rem] rounded-md font-bold text-xs h-8 cursor-pointer"
              >
                លាក់ (Hide)
              </Button>
              <Button
                type="button"
                onClick={() => setOpen(false)}
                className="min-w-[5.5rem] bg-primary text-primary-foreground hover:bg-primary/95 border border-primary rounded-md font-bold text-xs h-8 cursor-pointer"
              >
                ធ្វើបច្ចុប្បន្នភាព (Update)
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
