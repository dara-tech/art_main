import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import AppPageShell from '../components/layout/AppPageShell';
import Patient360Layout from '../components/patient360/Patient360Layout';
import VcctListToolbar from '../components/vcct/VcctListToolbar';
import VcctListTable from '../components/vcct/VcctListTable';
import VcctDetail from './VcctDetail';
import {
  Patient360LoadingPanel,
  Patient360TableSkeleton
} from '../components/patient360/Patient360LoadingPanel';
import vcctApi from '../services/vcctApi';
import { useSites } from '../contexts/SitesContext';
import { useAuth } from '../contexts/AuthContext';
import { filterSitesByUserScope, isFacilitySite, pickDefaultSiteCode, resolveVcctSiteFromRegistry } from '../utils/siteSelection';
import { parseVcctSearchParams } from '../utils/vcctNavigation';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { p360CardClass } from '../components/layout/appNavStyles';
import { P360_KH } from './patient360Kh';
import { VCCT_KH } from './vcctKh';

const PAGE_SIZE = 25;

function parseVcctParams(searchParams) {
  return parseVcctSearchParams(searchParams);
}

export default function VcctPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const deepLink = parseVcctParams(searchParams);
  const { user } = useAuth();
  const { sites: registrySites, refresh: refreshSites } = useSites();
  const sites = useMemo(
    () => filterSitesByUserScope(registrySites || [], user),
    [registrySites, user]
  );
  const facilitySites = useMemo(() => sites.filter(isFacilitySite), [sites]);
  const siteOptions = useMemo(
    () => (facilitySites.length ? facilitySites : sites),
    [facilitySites, sites]
  );

  const [siteCode, setSiteCode] = useState(() => {
    if (deepLink?.site) return deepLink.site;
    return pickDefaultSiteCode(facilitySites.length ? facilitySites : sites);
  });

  const vcctSiteMapping = useMemo(
    () => resolveVcctSiteFromRegistry(siteOptions, siteCode),
    [siteOptions, siteCode]
  );
  const mappedVcctSiteCode = vcctSiteMapping.code;
  const skipVcctLoad = vcctSiteMapping.known && !mappedVcctSiteCode;
  const refreshedVcctSites = useRef(false);

  useEffect(() => {
    if (refreshedVcctSites.current || !siteOptions.length) return;
    if (siteOptions.some((s) => 'vcctSiteCode' in s)) return;
    refreshedVcctSites.current = true;
    refreshSites();
  }, [siteOptions, refreshSites]);

  const [listQ, setListQ] = useState('');
  const [page, setPage] = useState(1);
  const [patients, setPatients] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [vcctSiteCode, setVcctSiteCode] = useState(null);
  const [listLoading, setListLoading] = useState(false);
  const [listReady, setListReady] = useState(false);

  const [selected, setSelected] = useState(() =>
    deepLink
      ? { vcctId: deepLink.vcctId, vcctSiteCode: deepLink.vcctSiteCode }
      : null
  );

  const loadList = useCallback(async () => {
    if (!siteCode) return;
    if (skipVcctLoad) {
      setPatients([]);
      setPagination({
        page: 1,
        limit: PAGE_SIZE,
        totalCount: 0,
        totalPages: 1,
        hasPrev: false,
        hasNext: false
      });
      setVcctSiteCode(null);
      setListLoading(false);
      setListReady(true);
      return;
    }
    setListLoading(true);
    try {
      const res = await vcctApi.listPatients(siteCode, {
        page,
        limit: PAGE_SIZE,
        q: listQ.trim().length >= 1 ? listQ.trim() : undefined
      });
      setPatients(res.patients || []);
      setPagination(res.pagination || null);
      setVcctSiteCode(res.vcctSiteCode || mappedVcctSiteCode || null);
    } catch (e) {
      toast.error(e.response?.data?.message || e.message || VCCT_KH.toast.loadFailed);
      setPatients([]);
      setPagination(null);
      setVcctSiteCode(mappedVcctSiteCode || null);
    } finally {
      setListLoading(false);
      setListReady(true);
    }
  }, [siteCode, page, listQ, skipVcctLoad, mappedVcctSiteCode]);

  useEffect(() => {
    if (selected) return undefined;
    if (!siteCode) {
      setListReady(true);
      return undefined;
    }
    if (skipVcctLoad) {
      setPatients([]);
      setPagination({
        page: 1,
        limit: PAGE_SIZE,
        totalCount: 0,
        totalPages: 1,
        hasPrev: false,
        hasNext: false
      });
      setVcctSiteCode(null);
      setListLoading(false);
      setListReady(true);
      return undefined;
    }
    const timer = setTimeout(() => loadList(), 200);
    return () => clearTimeout(timer);
  }, [loadList, selected, siteCode, skipVcctLoad]);

  useEffect(() => {
    setPage(1);
    setListReady(false);
  }, [siteCode, listQ]);

  useEffect(() => {
    const parsed = parseVcctParams(searchParams);
    if (!parsed?.vcctId) return;
    if (parsed.site) setSiteCode((prev) => (parsed.site === prev ? prev : parsed.site));
    setSelected({ vcctId: parsed.vcctId, vcctSiteCode: parsed.vcctSiteCode });
  }, [searchParams]);

  const openPatient = (row) => {
    const next = {
      vcctId: String(row.vcctId),
      vcctSiteCode: row.siteCode || vcctSiteCode || null
    };
    setSelected(next);
    const params = new URLSearchParams();
    if (siteCode) params.set('site', siteCode);
    params.set('vcctId', next.vcctId);
    if (next.vcctSiteCode) params.set('vcctSite', next.vcctSiteCode);
    setSearchParams(params, { replace: false });
  };

  const listPending = !skipVcctLoad && (listLoading || (Boolean(siteCode) && !listReady));
  const toolbarVcctSiteCode = mappedVcctSiteCode || vcctSiteCode;

  if (selected) {
    return (
      <VcctDetail
        key={`${siteCode}-${selected.vcctId}-${selected.vcctSiteCode || ''}`}
        siteCode={siteCode}
        vcctId={selected.vcctId}
        vcctSiteCode={selected.vcctSiteCode}
        onBack={() => {
          setSelected(null);
          setSearchParams({}, { replace: true });
          setListReady(false);
        }}
      />
    );
  }

  const total = pagination?.totalCount;
  const totalPages = pagination?.totalPages ?? 0;
  const hasTotal = total != null && total >= 0;

  const toolbar = (
    <VcctListToolbar
      sites={siteOptions}
      siteCode={siteCode}
      onSiteChange={setSiteCode}
      listQ={listQ}
      onListQChange={(q) => {
        setListQ(q);
        setPage(1);
        setListReady(false);
      }}
      onSearchEnter={() => {
        setPage(1);
        loadList();
      }}
      listPending={listPending}
      onRefresh={() => {
        setPage(1);
        loadList();
      }}
      pagination={pagination}
      page={page}
      onPageChange={setPage}
      patientsCount={patients.length}
      total={total}
      hasTotal={hasTotal}
      totalPages={totalPages}
      vcctSiteCode={toolbarVcctSiteCode}
    />
  );

  const showNoVcctSite = skipVcctLoad;

  return (
    <>
      {toolbar}
      <Patient360Layout lockViewport>
        <AppPageShell wide className="flex min-h-0 min-w-0 w-full max-w-full flex-1 flex-col !p-0">
          <Card className={cn(p360CardClass, 'flex min-h-0 min-w-0 w-full max-w-full flex-1 flex-col bg-card')}>
            <CardContent className="relative flex min-h-0 min-w-0 w-full max-w-full flex-1 flex-col border-0 border-t-0 p-0 pt-0">
              {showNoVcctSite ? (
                <p className="flex min-h-[12rem] flex-1 items-center justify-center px-6 py-10 text-center text-amber-800 dark:text-amber-400">
                  {VCCT_KH.list.noVcctSite}
                </p>
              ) : listPending && !patients.length ? (
                <div className="relative flex min-h-0 flex-1 flex-col">
                  <div className="min-h-0 flex-1 blur-[2px] opacity-60 pointer-events-none select-none">
                    <Patient360TableSkeleton rows={12} cols={8} />
                  </div>
                  <div className="absolute inset-0 z-30 flex items-center justify-center bg-background/35 backdrop-blur-[3px]">
                    <Patient360LoadingPanel
                      label={P360_KH.loadingList}
                      className="border-0 bg-transparent shadow-none"
                      minHeight="min-h-0"
                    />
                  </div>
                </div>
              ) : (
                <>
                  {listLoading && patients.length ? (
                    <div className="absolute inset-0 z-30 flex items-center justify-center bg-background/35 backdrop-blur-[3px]">
                      <Patient360LoadingPanel
                        label={P360_KH.loadingList}
                        className="border-0 bg-transparent shadow-none"
                        minHeight="min-h-0"
                      />
                    </div>
                  ) : null}
                  <div
                    className={cn(
                      'flex min-h-0 min-w-0 flex-1 flex-col',
                      listLoading && patients.length && 'pointer-events-none blur-[1px] opacity-75'
                    )}
                  >
                    <VcctListTable
                      patients={patients}
                      onOpenPatient={openPatient}
                      scrollBody
                      fillHeight
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </AppPageShell>
      </Patient360Layout>
    </>
  );
}
