import { useEffect, useRef, useState } from 'react';
import { RiSettings3Line } from '@remixicon/react';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { APP_NAV_TEXT, P360_TABLE_TEXT, appNavItemClass, p360ControlClass } from '../layout/appNavStyles';
import { TOOLBAR_ICON } from '../layout/toolbarIconColors';
import { ToolbarAnchoredPanel, VizToolbarBtn } from './visualizeToolbarUi';
import { VIZ_KH } from '../../pages/visualizeKh';
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

function SectionTitle({ children }) {
  return (
    <p className={cn('mb-2 mt-3 border-t border-border/60 pt-3 font-medium text-foreground first:mt-0 first:border-0 first:pt-0', P360_TABLE_TEXT)}>
      {children}
    </p>
  );
}

export default function VisualizeChartSettings({
  settings,
  onChange,
  className,
  series = [],
  chartVariant = 'bar',
  onChartVariantChange,
  panel = 'trend',
  colorByFacility = false
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const anchorRef = useRef(null);
  const panelRef = useRef(null);
  const s = { ...DEFAULT_CHART_SETTINGS, ...settings };
  const coloredSeries = applySeriesColors(series, s);
  const showTrendPanel = panel === 'trend';

  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (e) => {
      if (
        rootRef.current?.contains(e.target) ||
        panelRef.current?.contains(e.target) ||
        anchorRef.current?.contains(e.target)
      ) {
        return;
      }
      setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
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

  return (
    <div ref={rootRef} className={cn('relative shrink-0', className)}>
      <div ref={anchorRef}>
        <VizToolbarBtn
          icon={RiSettings3Line}
          iconClassName={TOOLBAR_ICON.slate}
          label={VIZ_KH.chartSettings}
          active={open}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          title={VIZ_KH.chartSettingsTitle}
        />
      </div>
      <ToolbarAnchoredPanel
        open={open}
        anchorRef={anchorRef}
        panelRef={panelRef}
        width={288}
        className="max-h-[min(80vh,28rem)] overflow-y-auto border border-border/80 bg-popover p-3 shadow-lg"
      >
        <div role="dialog" aria-label={VIZ_KH.chartSettingsTitle}>
          {showTrendPanel ? (
            <>
              <SectionTitle>{VIZ_KH.chartOptionsSection}</SectionTitle>

              <div className={cn('mb-2 block', P360_TABLE_TEXT)}>
                <span className="mb-1 block text-muted-foreground">{VIZ_KH.chartType}</span>
                <Select value={chartVariant} onValueChange={onChartVariantChange}>
                  <SelectTrigger className={cn(p360ControlClass, 'w-full rounded-none px-2')}>
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

              {supportsTrendLine(chartVariant) ? (
                <label className={cn('mb-2 flex items-center gap-2', P360_TABLE_TEXT)}>
                  <input
                    type="checkbox"
                    className="size-3.5 rounded-none border border-border accent-primary"
                    checked={Boolean(s.showTrendLine)}
                    onChange={(e) => patch({ showTrendLine: e.target.checked })}
                  />
                  <span>{VIZ_KH.chartShowTrendLine}</span>
                </label>
              ) : null}

              <label className={cn('mb-2 block', P360_TABLE_TEXT)}>
                <span className="mb-1 block text-muted-foreground">{VIZ_KH.chartXLabels}</span>
                <select
                  value={s.xLabelAngle || 'auto'}
                  onChange={(e) => patch({ xLabelAngle: e.target.value })}
                  className={cn(p360ControlClass, 'w-full')}
                >
                  <option value="auto">{VIZ_KH.chartXLabelsAuto}</option>
                  <option value="straight">{VIZ_KH.chartXLabelsStraight}</option>
                  <option value="slanted">{VIZ_KH.chartXLabelsSlanted}</option>
                </select>
              </label>

              {usesBarOptions(chartVariant) ? (
                <label className={cn('mb-2 block', P360_TABLE_TEXT)}>
                  <span className="mb-1 block text-muted-foreground">{VIZ_KH.chartBarWidth}</span>
                  <select
                    value={String(s.barMaxSize ?? 40)}
                    onChange={(e) => patch({ barMaxSize: Number(e.target.value) })}
                    className={cn(p360ControlClass, 'w-full')}
                  >
                    <option value="28">{VIZ_KH.chartBarNarrow}</option>
                    <option value="40">{VIZ_KH.chartBarMedium}</option>
                    <option value="56">{VIZ_KH.chartBarWide}</option>
                  </select>
                </label>
              ) : usesLineCurve(chartVariant) ? (
                <label className={cn('mb-2 block', P360_TABLE_TEXT)}>
                  <span className="mb-1 block text-muted-foreground">{VIZ_KH.chartLineCurve}</span>
                  <select
                    value={s.lineCurve || 'monotone'}
                    onChange={(e) => patch({ lineCurve: e.target.value })}
                    className={cn(p360ControlClass, 'w-full')}
                  >
                    <option value="monotone">{VIZ_KH.chartCurveSmooth}</option>
                    <option value="linear">{VIZ_KH.chartCurveLinear}</option>
                    <option value="step">{VIZ_KH.chartCurveStep}</option>
                  </select>
                </label>
              ) : null}

              <SectionTitle>{VIZ_KH.chartColorsSection}</SectionTitle>
              <p className={cn('mb-2 text-muted-foreground', P360_TABLE_TEXT)}>
                {colorByFacility ? VIZ_KH.chartColorByFacility : VIZ_KH.chartColorByIndicator}
              </p>

              <label className={cn('mb-2 block', P360_TABLE_TEXT)}>
                <span className="mb-1 block text-muted-foreground">{VIZ_KH.chartColorPalette}</span>
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
              </label>

              {coloredSeries.length ? (
                <div className="mb-2 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className={cn('text-muted-foreground', P360_TABLE_TEXT)}>{VIZ_KH.chartSeriesColors}</span>
                    <button
                      type="button"
                      className={cn('text-[10px] text-primary hover:underline', P360_TABLE_TEXT)}
                      onClick={resetAllColors}
                    >
                      {VIZ_KH.chartResetColors}
                    </button>
                  </div>
                  <ul className="max-h-36 space-y-1 overflow-y-auto border border-border/60 bg-muted/10 p-1.5">
                    {coloredSeries.map((item, i) => {
                      const overridden = Boolean(s.seriesColors?.[item.id]);
                      const pickerVal = colorToPickerHex(
                        overridden ? s.seriesColors[item.id] : resolveSeriesColor(item.id, i, s)
                      );
                      return (
                        <li key={item.id} className="flex items-center gap-1.5">
                          <span
                            className="size-3 shrink-0 border border-border/80"
                            style={{ backgroundColor: item.color }}
                            aria-hidden
                          />
                          <span className={cn('min-w-0 flex-1 truncate text-[10px]', P360_TABLE_TEXT)} title={item.label}>
                            {item.label}
                          </span>
                          <input
                            type="color"
                            value={pickerVal}
                            onChange={(e) => setSeriesColor(item.id, e.target.value)}
                            className="h-6 w-8 shrink-0 cursor-pointer border border-border/80 bg-background p-0"
                            title={VIZ_KH.chartPickColor}
                          />
                          {overridden ? (
                            <button
                              type="button"
                              className={cn('shrink-0 px-1 text-[10px] text-muted-foreground hover:text-foreground', P360_TABLE_TEXT)}
                              onClick={() => clearSeriesColor(item.id)}
                              title={VIZ_KH.chartResetOneColor}
                            >
                              ↺
                            </button>
                          ) : null}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ) : null}
            </>
          ) : null}

          <SectionTitle>{VIZ_KH.chartDisplaySection}</SectionTitle>

          <SectionTitle>{VIZ_KH.chartTextSection}</SectionTitle>

          <label className={cn('mb-2 block', P360_TABLE_TEXT)}>
            <span className="mb-1 block text-muted-foreground">{VIZ_KH.chartFontSize}</span>
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
          </label>

          <label className={cn('mb-3 block border-b border-border/60 pb-3', P360_TABLE_TEXT)}>
            <span className="mb-1 block text-muted-foreground">{VIZ_KH.chartFontWeight}</span>
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
          </label>

          <fieldset className="mb-3 space-y-1.5 border-b border-border/60 pb-3">
            <legend className={cn('mb-1 text-muted-foreground', P360_TABLE_TEXT)}>{VIZ_KH.chartTooltipHover}</legend>
            <label className={cn('flex items-center gap-2', P360_TABLE_TEXT)}>
              <input
                type="radio"
                name="chart-tooltip-shared"
                checked={s.tooltipShared !== false}
                onChange={() => patch({ tooltipShared: true })}
              />
              <span>{VIZ_KH.chartTooltipAll}</span>
            </label>
            <label className={cn('flex items-center gap-2', P360_TABLE_TEXT)}>
              <input
                type="radio"
                name="chart-tooltip-shared"
                checked={s.tooltipShared === false}
                onChange={() => patch({ tooltipShared: false })}
              />
              <span>{VIZ_KH.chartTooltipSingle}</span>
            </label>
          </fieldset>

          <label className={cn('mb-3 flex items-center gap-2 border-b border-border/60 pb-3', P360_TABLE_TEXT)}>
            <input
              type="checkbox"
              className="size-3.5 rounded-none border border-border accent-primary"
              checked={Boolean(s.showLegend)}
              onChange={(e) => patch({ showLegend: e.target.checked })}
            />
            <span>{VIZ_KH.chartShowLegend}</span>
          </label>

          <p className={cn('mb-2 font-medium text-foreground', P360_TABLE_TEXT)}>{VIZ_KH.chartYAxis}</p>

          <label className={cn('mb-2 flex items-center gap-2', P360_TABLE_TEXT)}>
            <input
              type="checkbox"
              className="size-3.5 rounded-none border border-border accent-primary"
              checked={s.yFromZero !== false}
              onChange={(e) => patch({ yFromZero: e.target.checked })}
            />
            <span>{VIZ_KH.chartYFromZero}</span>
          </label>

          <fieldset className="mb-2 space-y-1.5">
            <legend className={cn('mb-1 text-muted-foreground', APP_NAV_TEXT)}>{VIZ_KH.chartYMax}</legend>
            <label className={cn('flex items-center gap-2', P360_TABLE_TEXT)}>
              <input
                type="radio"
                name="y-max-mode"
                checked={s.yMaxMode !== 'manual'}
                onChange={() => patch({ yMaxMode: 'auto' })}
              />
              <span>{VIZ_KH.chartYMaxAuto}</span>
            </label>
            <label className={cn('flex items-center gap-2', P360_TABLE_TEXT)}>
              <input
                type="radio"
                name="y-max-mode"
                checked={s.yMaxMode === 'manual'}
                onChange={() => patch({ yMaxMode: 'manual' })}
              />
              <span>{VIZ_KH.chartYMaxManual}</span>
            </label>
            {s.yMaxMode === 'manual' ? (
              <input
                type="number"
                min={1}
                step={1}
                value={s.yMaxManual ?? 1000}
                onChange={(e) => patch({ yMaxManual: Number(e.target.value) || 1000 })}
                className={cn(p360ControlClass, 'mt-1 w-full tabular-nums')}
              />
            ) : null}
          </fieldset>

          <label className={cn('mb-2 flex items-center gap-2', P360_TABLE_TEXT)}>
            <span className="shrink-0 text-muted-foreground">{VIZ_KH.chartYTicks}</span>
            <select
              value={String(s.yTicks ?? 5)}
              onChange={(e) => patch({ yTicks: Number(e.target.value) })}
              className={cn(p360ControlClass, 'min-w-0 flex-1')}
            >
              {[4, 5, 6, 8].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>

          <label className={cn('mb-2 flex items-center gap-2', P360_TABLE_TEXT)}>
            <input
              type="checkbox"
              className="size-3.5 rounded-none border border-border accent-primary"
              checked={s.showGrid !== false}
              onChange={(e) => patch({ showGrid: e.target.checked })}
            />
            <span>{VIZ_KH.chartShowGrid}</span>
          </label>

          {showTrendPanel && usesBarOptions(chartVariant) ? (
            <label className={cn('flex items-center gap-2', P360_TABLE_TEXT)}>
              <input
                type="checkbox"
                className="size-3.5 rounded-none border border-border accent-primary"
                checked={Boolean(s.showBarLabels)}
                onChange={(e) => patch({ showBarLabels: e.target.checked })}
              />
              <span>{VIZ_KH.chartShowLabels}</span>
            </label>
          ) : null}
        </div>
      </ToolbarAnchoredPanel>
    </div>
  );
}
