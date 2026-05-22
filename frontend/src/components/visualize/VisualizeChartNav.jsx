import { useMemo } from 'react';
import {
  RiBarChart2Line,
  RiCalendarCheckLine,
  RiEqualizerLine,
  RiGuideLine,
  RiLineChartLine,
  RiUser3Line
} from '@remixicon/react';
import { cn } from '@/lib/utils';
import { APP_NAV_ICON, APP_NAV_MUTED, appNavItemClass, p360TabClass } from '../layout/appNavStyles';
import { VIZ_KH } from '../../pages/visualizeKh';
import {
  buildFacilityCompareTrendData,
  buildMultiTrendData,
  hasDemographicChartData,
  isCompareResults,
  listIndicatorsFromResults
} from '../../utils/visualizeChartData';
import { DEFAULT_CHART_SETTINGS } from '../../utils/visualizeChartSettings';
import { CHART_TYPE_IDS, isValidChartType, supportsTrendLine } from '../../utils/visualizeChartTypes';
import VisualizeIndicatorChecklist from './VisualizeIndicatorChecklist';
import VisualizeChartSettings from './VisualizeChartSettings';
import { VizToolbarBtn, VizToolbarSelect } from './visualizeToolbarUi';

const PANEL_ICONS = {
  trend: RiLineChartLine,
  snapshot: RiCalendarCheckLine,
  demographics: RiUser3Line
};

function ChartPanelTab({ id, active, onClick, label }) {
  const Icon = PANEL_ICONS[id];
  return (
    <button type="button" onClick={onClick} className={p360TabClass(active)} title={label}>
      {Icon ? <Icon className={APP_NAV_ICON} aria-hidden /> : null}
      <span>{label}</span>
    </button>
  );
}

/** Chart controls — row 2 of visualize toolbar. */
export default function VisualizeChartNav({
  results = [],
  panel,
  onPanelChange,
  variant,
  onVariantChange,
  chartIndicatorIds = [],
  onChartIndicatorIdsChange,
  chartSettings,
  onChartSettingsChange,
  catalog = [],
  scopeMode = 'rollup'
}) {
  const indicators = listIndicatorsFromResults(results, catalog);
  const showDemo = indicators.some((i) => hasDemographicChartData(results, i.id));
  const compareMode = scopeMode === 'compare' || isCompareResults(results);
  const chartSeries = useMemo(() => {
    if (!chartIndicatorIds.length || panel !== 'trend') return [];
    const built = compareMode
      ? buildFacilityCompareTrendData(results, chartIndicatorIds, catalog)
      : buildMultiTrendData(results, chartIndicatorIds, catalog);
    return built.series || [];
  }, [compareMode, results, chartIndicatorIds, catalog, panel]);

  if (!indicators.length) return null;

  return (
    <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
      <div className={cn(appNavItemClass(false), 'pointer-events-none border-transparent px-2')}>
        <RiEqualizerLine className={APP_NAV_ICON} aria-hidden />
        <span className={cn('hidden font-medium lg:inline', APP_NAV_MUTED)}>{VIZ_KH.chartControls}</span>
      </div>

      <div className="flex shrink-0 gap-0.5" role="tablist" aria-label={VIZ_KH.chartControls}>
        <ChartPanelTab
          id="trend"
          active={panel === 'trend'}
          onClick={() => onPanelChange('trend')}
          label={VIZ_KH.chartTrendShort}
        />
        <ChartPanelTab
          id="snapshot"
          active={panel === 'snapshot'}
          onClick={() => onPanelChange('snapshot')}
          label={VIZ_KH.chartSnapshotShort}
        />
        {showDemo ? (
          <ChartPanelTab
            id="demographics"
            active={panel === 'demographics'}
            onClick={() => onPanelChange('demographics')}
            label={VIZ_KH.chartDemographicsShort}
          />
        ) : null}
      </div>

      <VisualizeIndicatorChecklist
        results={results}
        catalog={catalog}
        selectedIds={chartIndicatorIds}
        onChange={onChartIndicatorIdsChange}
        single={panel === 'demographics'}
      />

      {panel === 'trend' || panel === 'snapshot' || panel === 'demographics' ? (
        <VisualizeChartSettings
          settings={chartSettings}
          onChange={onChartSettingsChange}
          series={chartSeries}
          chartVariant={variant}
          onChartVariantChange={onVariantChange}
          panel={panel}
        />
      ) : null}

      {panel === 'trend' ? (
        <>
          <VizToolbarSelect
            icon={RiBarChart2Line}
            label={VIZ_KH.chartTypeSelect}
            value={isValidChartType(variant) ? variant : 'bar'}
            title={VIZ_KH.chartType}
            onChange={(e) => {
              const next = e.target.value;
              onVariantChange?.(next);
              if (!supportsTrendLine(next) && chartSettings?.showTrendLine) {
                onChartSettingsChange?.({
                  ...DEFAULT_CHART_SETTINGS,
                  ...chartSettings,
                  showTrendLine: false
                });
              }
            }}
          >
            {CHART_TYPE_IDS.map((id) => (
              <option key={id} value={id}>
                {VIZ_KH[`chartType_${id}`] || id}
              </option>
            ))}
          </VizToolbarSelect>
          {supportsTrendLine(variant) ? (
            <VizToolbarBtn
              icon={RiGuideLine}
              label={VIZ_KH.chartTrendLine}
              active={Boolean(chartSettings?.showTrendLine)}
              onClick={() => {
                const s = { ...DEFAULT_CHART_SETTINGS, ...chartSettings };
                onChartSettingsChange?.({ ...s, showTrendLine: !s.showTrendLine });
              }}
              title={VIZ_KH.chartTrendLineHint}
            />
          ) : null}
        </>
      ) : null}
    </div>
  );
}
