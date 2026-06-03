import { useCallback } from 'react';
import {
  RiBarChartBoxLine,
  RiBarChartGroupedLine,
  RiClipboardLine,
  RiDownloadLine,
  RiGitMergeLine,
  RiListCheck2,
  RiLoader4Line,
  RiRefreshLine,
  RiStackLine,
  RiTable2
} from '@remixicon/react';
import { toast } from 'sonner';
import SiteSelectModal from '../sites/SiteSelectModal';
import QuarterSelectModal from './QuarterSelectModal';
import VisualizeCompareSitesModal, { VIZ_COMPARE_MAX } from './VisualizeCompareSitesModal';
import { cn } from '@/lib/utils';
import { APP_NAV_ICON, APP_NAV_TEXT, appNavItemClass } from '../layout/appNavStyles';
import { VIZ_KH } from '../../pages/visualizeKh';
import { TOOLBAR_ICON } from '../layout/toolbarIconColors';
import { Patient360NavBar, Patient360NavRow } from '../patient360/Patient360NavBar';
import VisualizeChartNav from './VisualizeChartNav';
import { VizToolbarBtn } from './visualizeToolbarUi';
import { copyTextToClipboard } from '../../utils/copyToClipboard';
import { buildVisualizeResultsClipboardText } from '../../utils/visualizeClipboard';
import { downloadCsv, safeExportFilename } from '../../utils/exportCsv';

export const VIZ_NAV_ROWS = 2;

export default function VisualizeToolbar({
  sites,
  siteCode,
  onSiteChange,
  scopeMode = 'rollup',
  onScopeModeChange,
  compareSiteCodes = [],
  onCompareSiteCodesChange,
  maxCompareFacilities = VIZ_COMPARE_MAX,
  indicatorCount,
  periodKeys = [],
  onPeriodKeysChange,
  onOpenIndicators,
  loading,
  onRun,
  progress,
  resultView = 'table',
  onResultViewChange,
  results = [],
  chartPanel,
  onChartPanelChange,
  chartVariant,
  onChartVariantChange,
  chartIndicatorIds = [],
  onChartIndicatorIdsChange,
  chartSettings,
  onChartSettingsChange,
  catalog = [],
  indicatorIds = []
}) {
  const canRun =
    indicatorCount > 0 &&
    periodKeys.length > 0 &&
    !loading &&
    (scopeMode === 'compare' ? compareSiteCodes.length > 0 : Boolean(siteCode));
  const showChartNav = resultView === 'chart' && results.length > 0;
  const navRows = showChartNav ? VIZ_NAV_ROWS : 1;
  const canCopy = results.length > 0 && !loading;

  const handleCopyResults = useCallback(
    async (e) => {
      e?.preventDefault?.();
      e?.stopPropagation?.();
      if (!results.length) {
        toast.error(VIZ_KH.copyClipboardEmpty);
        return;
      }
      const text = buildVisualizeResultsClipboardText(results, catalog, scopeMode, VIZ_KH);
      if (!text) {
        toast.error(VIZ_KH.copyClipboardEmpty);
        return;
      }
      const ok = await copyTextToClipboard(text);
      if (ok) toast.success(VIZ_KH.copyClipboardSuccess);
      else toast.error(VIZ_KH.copyClipboardFailed);
    },
    [results, catalog, scopeMode]
  );

  const handleExportExcel = useCallback(
    (e) => {
      e?.preventDefault?.();
      e?.stopPropagation?.();
      if (!results.length) {
        toast.error(VIZ_KH.copyClipboardEmpty);
        return;
      }
      const text = buildVisualizeResultsClipboardText(results, catalog, scopeMode, VIZ_KH);
      if (!text) {
        toast.error(VIZ_KH.copyClipboardEmpty);
        return;
      }
      const cleanText = text.startsWith('\uFEFF') ? text.slice(1) : text;
      const periodStr = periodKeys.join('_');
      const filename = safeExportFilename(`visualize_report_${scopeMode}_${periodStr}`);
      downloadCsv(filename, cleanText);
    },
    [results, catalog, scopeMode, periodKeys]
  );

  const indicatorCountFix =
    typeof indicatorCount === 'number' ? indicatorCount : 0;

  return (
    <Patient360NavBar ariaLabel={VIZ_KH.pageTitle} rowCount={navRows}>
      <Patient360NavRow tone="filters" className="gap-2">
        <div
          className={cn(appNavItemClass(false), 'pointer-events-none border-transparent px-2')}
          title={VIZ_KH.pageTitle}
        >
          <RiBarChartGroupedLine className={cn(APP_NAV_ICON, TOOLBAR_ICON.brand)} aria-hidden />
          <span className="sr-only">{VIZ_KH.pageTitle}</span>
        </div>

        <div className="flex shrink-0 gap-0.5" role="group" aria-label={VIZ_KH.scopeModeLabel}>
          <VizToolbarBtn
            icon={RiStackLine}
            iconClassName={TOOLBAR_ICON.blue}
            label={VIZ_KH.scopeRollup}
            shortLabel={VIZ_KH.scopeRollupShort}
            active={scopeMode === 'rollup'}
            onClick={() => onScopeModeChange?.('rollup')}
            title={VIZ_KH.scopeRollupHint}
          />
          <VizToolbarBtn
            icon={RiGitMergeLine}
            iconClassName={TOOLBAR_ICON.violet}
            label={VIZ_KH.scopeCompare}
            active={scopeMode === 'compare'}
            onClick={() => onScopeModeChange?.('compare')}
            title={VIZ_KH.scopeCompareHint}
          />
        </div>

        {scopeMode === 'compare' ? (
          <VisualizeCompareSitesModal
            sites={sites}
            value={compareSiteCodes}
            onChange={onCompareSiteCodesChange}
            disabled={loading}
            className="w-42 shrink-0 sm:w-52"
            maxSites={maxCompareFacilities}
          />
        ) : (
          <SiteSelectModal
            sites={sites}
            value={siteCode}
            onChange={onSiteChange}
            label={VIZ_KH.facility}
            facilityOnly={false}
            showLabel={false}
            compact
            className="w-42 shrink-0 sm:w-48"
            modalText={VIZ_KH.siteModal}
          />
        )}
        <QuarterSelectModal
          value={periodKeys}
          onChange={onPeriodKeysChange}
          disabled={loading}
          className="w-36 shrink-0 sm:w-44"
        />

        <VizToolbarBtn
          icon={RiListCheck2}
          iconClassName={TOOLBAR_ICON.amber}
          label={`${VIZ_KH.pickIndicators} (${indicatorCountFix})`}
          shortLabel={`${VIZ_KH.indicatorsShort} (${indicatorCountFix})`}
          onClick={onOpenIndicators}
          title={VIZ_KH.pickIndicators}
          showLabel
        />

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <span className="mx-0.5 hidden h-5 w-px shrink-0 bg-border/80 md:inline" aria-hidden />

          <div className="flex shrink-0 gap-0.5" role="group" aria-label={VIZ_KH.resultViewLabel}>
            <VizToolbarBtn
              icon={RiTable2}
              iconClassName={TOOLBAR_ICON.slate}
              label={VIZ_KH.viewTable}
              shortLabel={VIZ_KH.viewTableShort}
              active={resultView === 'table'}
              onClick={() => onResultViewChange?.('table')}
              aria-pressed={resultView === 'table'}
            />
            <VizToolbarBtn
              icon={RiBarChartBoxLine}
              iconClassName={TOOLBAR_ICON.emerald}
              label={VIZ_KH.viewChart}
              shortLabel={VIZ_KH.viewChartShort}
              active={resultView === 'chart'}
              onClick={() => onResultViewChange?.('chart')}
              aria-pressed={resultView === 'chart'}
            />
          </div>

          <VizToolbarBtn
            icon={RiClipboardLine}
            iconClassName={TOOLBAR_ICON.cyan}
            label={VIZ_KH.copyClipboard}
            shortLabel={VIZ_KH.copyClipboard}
            disabled={!canCopy}
            onClick={handleCopyResults}
            title={VIZ_KH.copyClipboardTitle}
          />

          <VizToolbarBtn
            icon={RiDownloadLine}
            iconClassName={TOOLBAR_ICON.blue}
            label={VIZ_KH.exportExcel}
            shortLabel={VIZ_KH.exportExcel}
            disabled={!canCopy}
            onClick={handleExportExcel}
            title={VIZ_KH.exportExcelTitle}
          />

          {loading && progress?.total > 0 ? (
            <span className={cn('shrink-0 tabular-nums text-[11px] text-muted-foreground')} role="status">
              {progress.completed}/{progress.total}
            </span>
          ) : null}

          <VizToolbarBtn
            icon={loading ? RiLoader4Line : RiRefreshLine}
            iconClassName={loading ? TOOLBAR_ICON.brand : TOOLBAR_ICON.teal}
            label={loading ? VIZ_KH.running : VIZ_KH.run}
            disabled={!canRun}
            onClick={onRun}
            title={VIZ_KH.run}
            className={loading ? '[&_svg]:animate-spin' : undefined}
          />
        </div>
      </Patient360NavRow>

      {showChartNav ? (
        <Patient360NavRow tone="plain" className="gap-2 overflow-visible">
          <VisualizeChartNav
            results={results}
            panel={chartPanel}
            onPanelChange={onChartPanelChange}
            variant={chartVariant}
            onVariantChange={onChartVariantChange}
            chartIndicatorIds={chartIndicatorIds}
            onChartIndicatorIdsChange={onChartIndicatorIdsChange}
            chartSettings={chartSettings}
            onChartSettingsChange={onChartSettingsChange}
            catalog={catalog}
            scopeMode={scopeMode}
            sites={sites}
            siteCode={siteCode}
            compareSiteCodes={compareSiteCodes}
            indicatorIds={indicatorIds}
            periodKeys={periodKeys}
          />
        </Patient360NavRow>
      ) : null}
    </Patient360NavBar>
  );
}
