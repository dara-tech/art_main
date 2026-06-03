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
import { APP_NAV_ICON, appNavItemClass, p360TabClass } from '../layout/appNavStyles';
import { TOOLBAR_ICON } from '../layout/toolbarIconColors';
import { VIZ_KH } from '../../pages/visualizeKh';
import {
  buildFacilityCompareTrendData,
  buildMultiTrendData,
  hasDemographicChartData,
  isMultiFacilityCompare,
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

const PANEL_ICON_COLOR = {
  trend: TOOLBAR_ICON.emerald,
  snapshot: TOOLBAR_ICON.blue,
  demographics: TOOLBAR_ICON.amber
};

function ChartPanelTab({ id, active, onClick, label }) {
  const Icon = PANEL_ICONS[id];
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(p360TabClass(active), 'px-2')}
      title={label}
      aria-label={label}
    >
      {Icon ? (
        <Icon className={cn(APP_NAV_ICON, PANEL_ICON_COLOR[id] || TOOLBAR_ICON.zinc)} aria-hidden />
      ) : null}
      <span className="sr-only">{label}</span>
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
  scopeMode = 'rollup',
  sites = [],
  siteCode = '',
  compareSiteCodes = [],
  indicatorIds = [],
  periodKeys = []
}) {
  const indicators = listIndicatorsFromResults(results, catalog);
  const showDemo = indicators.some((i) => hasDemographicChartData(results, i.id));
  const facilityCompare = isMultiFacilityCompare(results);
  const chartSeries = useMemo(() => {
    if (!chartIndicatorIds.length || panel !== 'trend') return [];
    const built = facilityCompare
      ? buildFacilityCompareTrendData(results, chartIndicatorIds, catalog)
      : buildMultiTrendData(results, chartIndicatorIds, catalog);
    return built.series || [];
  }, [facilityCompare, results, chartIndicatorIds, catalog, panel]);

  if (!indicators.length) return null;

  return (
    <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2 overflow-visible">
      <div
        className={cn(appNavItemClass(false), 'pointer-events-none border-transparent px-2')}
        title={VIZ_KH.chartControls}
      >
        <RiEqualizerLine className={cn(APP_NAV_ICON, TOOLBAR_ICON.zinc)} aria-hidden />
        <span className="sr-only">{VIZ_KH.chartControls}</span>
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
        maxSeries={Number(chartSettings?.maxChartSeries) || 6}
      />

      {panel === 'trend' ? (
        <>
          <VizToolbarSelect
            icon={RiBarChart2Line}
            iconClassName={TOOLBAR_ICON.violet}
            label={VIZ_KH.chartTypeSelect}
            value={isValidChartType(variant) ? variant : 'bar'}
            title={VIZ_KH.chartType}
            onValueChange={(next) => {
              onVariantChange?.(next);
              if (!supportsTrendLine(next) && chartSettings?.showTrendLine) {
                onChartSettingsChange?.({
                  ...DEFAULT_CHART_SETTINGS,
                  ...chartSettings,
                  showTrendLine: false
                });
              }
            }}
            options={CHART_TYPE_IDS.map((id) => ({
              value: id,
              label: VIZ_KH[`chartType_${id}`] || id
            }))}
          />
          {supportsTrendLine(variant) ? (
            <VizToolbarBtn
              icon={RiGuideLine}
              iconClassName={TOOLBAR_ICON.orange}
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

      {panel === 'trend' || panel === 'snapshot' || panel === 'demographics' ? (
        <div className="ml-auto flex shrink-0 items-center">
          <VisualizeChartSettings
            settings={chartSettings}
            onChange={onChartSettingsChange}
            series={chartSeries}
            colorByFacility={facilityCompare}
            chartVariant={variant}
            onChartVariantChange={onVariantChange}
            panel={panel}
            sites={sites}
            siteCode={siteCode}
            compareSiteCodes={compareSiteCodes}
            indicatorIds={indicatorIds}
            periodKeys={periodKeys}
            catalog={catalog}
            scopeMode={scopeMode}
          />
        </div>
      ) : null}
    </div>
  );
}
