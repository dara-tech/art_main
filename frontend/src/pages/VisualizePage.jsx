import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { listIndicatorsFromResults } from '../utils/visualizeChartData';
import { DEFAULT_CHART_SETTINGS } from '../utils/visualizeChartSettings';
import { toast } from 'sonner';
import AppPageShell from '../components/layout/AppPageShell';
import Patient360Layout from '../components/patient360/Patient360Layout';
import VisualizeToolbar from '../components/visualize/VisualizeToolbar';
import { VIZ_COMPARE_MAX } from '../components/visualize/VisualizeCompareSitesModal';
import VisualizePickerModal from '../components/visualize/VisualizePickerModal';
import VisualizeResults from '../components/visualize/VisualizeResults';
import { Patient360LoadingPanel } from '../components/patient360/Patient360LoadingPanel';
import { useSites } from '../contexts/SitesContext';
import { useAuth } from '../contexts/AuthContext';
import {
  filterSitesByUserScope,
  inferCompareSelectionLevel,
  inferSiteLevelFromCode,
  isFacilitySite,
  isFacilitySiteCode,
  pickDefaultSiteCode
} from '../utils/siteSelection';
import { listRecentQuarters, resolvePeriodKeys } from '../utils/visualizePeriods';
import { VISUALIZE_PRESETS } from '../constants/indicatorLabels';
import visualizeApi from '../services/visualizeApi';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { p360CardClass } from '../components/layout/appNavStyles';
import { VIZ_KH } from './visualizeKh';
import { P360_FROM_VISUALIZE_STATE } from '../utils/patient360Navigation';
import { loadVisualizeSession, saveVisualizeSession } from '../utils/visualizeSession';

const DEFAULT_INDICATOR_IDS = VISUALIZE_PRESETS.vl.ids;

function collectVisualizeSnapshot(state, { pendingRestore = false } = {}) {
  return {
    scopeMode: state.scopeMode,
    siteCode: state.siteCode,
    compareSiteCodes: state.compareSiteCodes,
    indicatorIds: state.indicatorIds,
    periodKeys: state.periodKeys,
    results: state.results,
    progress: state.progress,
    resultView: state.resultView,
    chartPanel: state.chartPanel,
    chartVariant: state.chartVariant,
    chartIndicatorIds: state.chartIndicatorIds,
    chartSettings: state.chartSettings,
    pendingRestore
  };
}

function applyVisualizeSnapshot(snap, setters) {
  const {
    setScopeMode,
    setSiteCode,
    setCompareSiteCodes,
    setIndicatorIds,
    setPeriodKeys,
    setResults,
    setProgress,
    setResultView,
    setChartPanel,
    setChartVariant,
    setChartIndicatorIds,
    setChartSettings
  } = setters;
  setScopeMode(snap.scopeMode === 'compare' ? 'compare' : 'rollup');
  if (snap.siteCode) setSiteCode(snap.siteCode);
  if (Array.isArray(snap.compareSiteCodes)) setCompareSiteCodes(snap.compareSiteCodes);
  if (Array.isArray(snap.indicatorIds)) setIndicatorIds(snap.indicatorIds);
  if (Array.isArray(snap.periodKeys)) setPeriodKeys(snap.periodKeys);
  setResults(snap.results);
  if (snap.progress) setProgress(snap.progress);
  if (snap.resultView) setResultView(snap.resultView);
  if (snap.chartPanel) setChartPanel(snap.chartPanel);
  if (snap.chartVariant) setChartVariant(snap.chartVariant);
  if (Array.isArray(snap.chartIndicatorIds)) setChartIndicatorIds(snap.chartIndicatorIds);
  if (snap.chartSettings) setChartSettings({ ...DEFAULT_CHART_SETTINGS, ...snap.chartSettings });
}

export default function VisualizePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { sites: registrySites } = useSites();
  const sites = useMemo(
    () => filterSitesByUserScope(registrySites || [], user),
    [registrySites, user]
  );
  const facilitySites = useMemo(() => sites.filter(isFacilitySite), [sites]);

  const [scopeMode, setScopeMode] = useState('rollup');
  const [siteCode, setSiteCode] = useState(() => pickDefaultSiteCode(facilitySites.length ? facilitySites : sites));
  const [compareSiteCodes, setCompareSiteCodes] = useState(() => {
    const d = pickDefaultSiteCode(facilitySites.length ? facilitySites : sites);
    return d ? [d] : [];
  });
  const [catalog, setCatalog] = useState([]);
  const [vizLimits, setVizLimits] = useState({ maxCompareFacilities: VIZ_COMPARE_MAX });
  const [indicatorIds, setIndicatorIds] = useState(DEFAULT_INDICATOR_IDS);
  const [periodKeys, setPeriodKeys] = useState(() => {
    const q = listRecentQuarters(1)[0];
    return q ? [q.key] : [];
  });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [progress, setProgress] = useState({ completed: 0, total: 0 });
  const [pickerMode, setPickerMode] = useState(null);
  const [resultView, setResultView] = useState('table');
  const [chartPanel, setChartPanel] = useState('trend');
  const [chartVariant, setChartVariant] = useState('bar');
  const [chartIndicatorIds, setChartIndicatorIds] = useState([]);
  const [chartSettings, setChartSettings] = useState(() => ({ ...DEFAULT_CHART_SETTINGS }));
  const restoreRanRef = useRef(false);

  const persistVisualizeSession = useCallback(
    (pendingRestore = false) => {
      if (!results.length) return;
      saveVisualizeSession(
        collectVisualizeSnapshot(
          {
            scopeMode,
            siteCode,
            compareSiteCodes,
            indicatorIds,
            periodKeys,
            results,
            progress,
            resultView,
            chartPanel,
            chartVariant,
            chartIndicatorIds,
            chartSettings
          },
          { pendingRestore }
        )
      );
    },
    [
      scopeMode,
      siteCode,
      compareSiteCodes,
      indicatorIds,
      periodKeys,
      results,
      progress,
      resultView,
      chartPanel,
      chartVariant,
      chartIndicatorIds,
      chartSettings
    ]
  );

  useEffect(() => {
    if (restoreRanRef.current) return;
    const snap = loadVisualizeSession();
    if (!snap?.results?.length) return;
    restoreRanRef.current = true;
    applyVisualizeSnapshot(snap, {
      setScopeMode,
      setSiteCode,
      setCompareSiteCodes,
      setIndicatorIds,
      setPeriodKeys,
      setResults,
      setProgress,
      setResultView,
      setChartPanel,
      setChartVariant,
      setChartIndicatorIds,
      setChartSettings
    });
    const fromBack = Boolean(location.state?.restoreVisualize);
    if (fromBack || snap.pendingRestore) {
      toast.success(VIZ_KH.visualizeRestored);
    }
    if (fromBack) {
      navigate('/visualize', { replace: true, state: {} });
    }
    saveVisualizeSession(collectVisualizeSnapshot(snap, { pendingRestore: false }));
  }, [location.state?.restoreVisualize, navigate]);

  useEffect(() => {
    if (!results.length || loading) return;
    saveVisualizeSession(
      collectVisualizeSnapshot({
        scopeMode,
        siteCode,
        compareSiteCodes,
        indicatorIds,
        periodKeys,
        results,
        progress,
        resultView,
        chartPanel,
        chartVariant,
        chartIndicatorIds,
        chartSettings
      })
    );
  }, [
    scopeMode,
    siteCode,
    compareSiteCodes,
    indicatorIds,
    periodKeys,
    results,
    progress,
    resultView,
    chartPanel,
    chartVariant,
    chartIndicatorIds,
    chartSettings,
    loading
  ]);

  useEffect(() => {
    const handleConfigChange = () => {
      const globalMax = Number(localStorage.getItem('app-max-chart-series')) || 6;
      setChartSettings(prev => ({
        ...prev,
        maxChartSeries: globalMax
      }));
    };
    window.addEventListener('app-max-chart-series-changed', handleConfigChange);
    return () => window.removeEventListener('app-max-chart-series-changed', handleConfigChange);
  }, []);

  useEffect(() => {
    const list = listIndicatorsFromResults(results, catalog);
    if (!list.length) {
      setChartIndicatorIds([]);
      return;
    }
    setChartIndicatorIds((prev) => {
      const kept = prev.filter((id) => list.some((i) => i.id === id));
      if (kept.length) return kept;
      return list.slice(0, 3).map((i) => i.id);
    });
  }, [results, catalog, scopeMode]);

  useEffect(() => {
    visualizeApi
      .getCatalog()
      .then((res) => {
        const list = res?.indicators || [];
        setCatalog(list);
        if (res?.limits?.maxCompareFacilities) {
          setVizLimits(res.limits);
        }
        if (list.length) {
          setIndicatorIds((prev) => {
            const kept = prev.filter((id) => list.some((c) => c.id === id));
            return kept.length ? kept : DEFAULT_INDICATOR_IDS.filter((id) => list.some((c) => c.id === id));
          });
        }
      })
      .catch(() => {
        toast.error(VIZ_KH.toastRunFailed);
      })
      .finally(() => setCatalogLoading(false));
  }, []);

  const periods = useMemo(() => resolvePeriodKeys(periodKeys), [periodKeys]);

  const handleNavigateToPatient360 = useCallback(
    (path) => {
      persistVisualizeSession(true);
      navigate(path, { state: P360_FROM_VISUALIZE_STATE });
    },
    [navigate, persistVisualizeSession]
  );

  const siteLevel = useMemo(() => {
    if (scopeMode === 'compare') {
      return inferCompareSelectionLevel(compareSiteCodes) === 'province' ? 'province' : 'facility';
    }
    return inferSiteLevelFromCode(siteCode, sites);
  }, [scopeMode, siteCode, sites, compareSiteCodes]);

  const handleScopeModeChange = useCallback(
    (mode) => {
      setScopeMode(mode);
      if (mode === 'compare') {
        const code = String(siteCode || '').trim();
        if (code && isFacilitySiteCode(sites, code)) {
          setCompareSiteCodes((prev) => (prev.includes(code) ? prev : [code, ...prev].slice(0, 8)));
        }
      } else if (compareSiteCodes.length === 1) {
        setSiteCode(compareSiteCodes[0]);
      }
    },
    [siteCode, sites, compareSiteCodes]
  );

  const runVisualize = useCallback(async () => {
    if (!indicatorIds.length || !periods.length) return;
    if (scopeMode === 'compare' && !compareSiteCodes.length) return;
    if (scopeMode === 'rollup' && !siteCode) return;
    setLoading(true);
    setResults([]);
    const estTotal =
      indicatorIds.length *
      periods.length *
      (scopeMode === 'compare' ? compareSiteCodes.length : 1);
    setProgress({ completed: 0, total: estTotal });
    const acc = [];
    const useAnalytics = localStorage.getItem('app-use-analytics') === 'true';
    try {
      await visualizeApi.streamRun(
        {
          scopeMode,
          siteCode: scopeMode === 'compare' ? compareSiteCodes[0] : siteCode,
          siteLevel,
          compareSiteCodes: scopeMode === 'compare' ? compareSiteCodes : undefined,
          indicatorIds,
          periods,
          useAnalytics
        },
        {
          onStart: (p) => setProgress({ completed: 0, total: Number(p.total) || 0 }),
          onResult: (p) => {
            if (p?.data) acc.push(p.data);
            setResults([...acc]);
            setProgress({ completed: Number(p.completed) || 0, total: Number(p.total) || 0 });
          },
          onDone: () => setProgress((g) => ({ ...g, completed: g.total }))
        }
      );
    } catch (e) {
      toast.error(e.message || VIZ_KH.toastRunFailed);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [scopeMode, siteCode, siteLevel, compareSiteCodes, indicatorIds, periods]);

  const toolbar = (
    <VisualizeToolbar
      sites={sites}
      siteCode={siteCode}
      onSiteChange={setSiteCode}
      scopeMode={scopeMode}
      onScopeModeChange={handleScopeModeChange}
      compareSiteCodes={compareSiteCodes}
      onCompareSiteCodesChange={setCompareSiteCodes}
      maxCompareFacilities={vizLimits.maxCompareFacilities || VIZ_COMPARE_MAX}
      indicatorIds={indicatorIds}
      indicatorCount={indicatorIds.length}
      periodKeys={periodKeys}
      onPeriodKeysChange={setPeriodKeys}
      onOpenIndicators={() => setPickerMode('indicators')}
      loading={loading || catalogLoading}
      onRun={runVisualize}
      progress={progress}
      resultView={resultView}
      onResultViewChange={setResultView}
      results={results}
      chartPanel={chartPanel}
      onChartPanelChange={setChartPanel}
      chartVariant={chartVariant}
      onChartVariantChange={setChartVariant}
      chartIndicatorIds={chartIndicatorIds}
      onChartIndicatorIdsChange={setChartIndicatorIds}
      chartSettings={chartSettings}
      onChartSettingsChange={setChartSettings}
      catalog={catalog}
    />
  );

  return (
    <>
      {toolbar}
      <Patient360Layout lockViewport>
        <AppPageShell wide className="flex min-h-0 min-w-0 w-full max-w-full flex-1 flex-col !p-0">
          <Card className={cn(p360CardClass, 'flex min-h-0 min-w-0 w-full max-w-full flex-1 flex-col bg-card')}>
            <CardContent className="relative flex min-h-0 min-w-0 w-full max-w-full flex-1 flex-col p-0">
              {loading && !results.length ? (
                <div className="absolute inset-0 z-30 flex items-center justify-center bg-background/35 backdrop-blur-[3px]">
                  <Patient360LoadingPanel label={VIZ_KH.running} className="border-0 bg-transparent" minHeight="min-h-0" />
                </div>
              ) : null}
              <div
                className={cn(
                  'flex min-h-0 flex-1 flex-col',
                  loading && results.length && 'pointer-events-none opacity-75'
                )}
              >
                <VisualizeResults
                  results={results}
                  view={resultView}
                  chartPanel={chartPanel}
                  chartVariant={chartVariant}
                  chartIndicatorIds={chartIndicatorIds}
                  chartSettings={chartSettings}
                  catalog={catalog}
                  scopeMode={scopeMode}
                  siteCode={scopeMode === 'compare' ? compareSiteCodes[0] : siteCode}
                  siteLevel={siteLevel}
                  compareSiteCodes={compareSiteCodes}
                  sites={sites}
                  periods={periods}
                  onNavigateToPatient360={handleNavigateToPatient360}
                  onBeforeNavigateToPatient360={() => persistVisualizeSession(true)}
                />
              </div>
            </CardContent>
          </Card>
        </AppPageShell>
      </Patient360Layout>

      <VisualizePickerModal
        open={pickerMode != null}
        onClose={() => setPickerMode(null)}
        catalog={catalog}
        catalogLoading={catalogLoading}
        selectedIds={indicatorIds}
        onApply={({ indicatorIds: ids }) => {
          if (ids) setIndicatorIds(ids);
        }}
      />
    </>
  );
}
