import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import AppPageShell from '../components/layout/AppPageShell';
import Patient360Layout from '../components/patient360/Patient360Layout';
import Patient360ListToolbar from '../components/patient360/Patient360ListToolbar';
import Patient360ListTable from '../components/patient360/Patient360ListTable';
import Patient360ListColumnConfigModal from '../components/patient360/Patient360ListColumnConfigModal';
import Patient360ListFilterModal from '../components/patient360/Patient360ListFilterModal';
import {
  countActiveListFilters,
  normalizeListFilters,
  P360_LIST_FILTER_EMPTY
} from '../components/patient360/patient360ListFilters';
import {
  loadListColumnOrder,
  sanitizeColumnOrder,
  saveListColumnOrder
} from '../components/patient360/patient360ListColumns';
import { nextSortState } from '../components/patient360/patient360ListSort';
import Patient360Detail from './Patient360Detail';
import patient360Api from '../services/patient360Api';
import { getPatient360Dictionary } from '../services/patient360DictionaryCache';
import { useSites } from '../contexts/SitesContext';
import { filterSitesByUserScope, isFacilitySite, pickDefaultSiteCode } from '../utils/siteSelection';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { p360CardClass } from '../components/layout/appNavStyles';
import { P360_KH } from './patient360Kh';
import { parsePatient360SearchParams } from '../utils/patient360Navigation';
import {
  Patient360LoadingPanel,
  Patient360TableSkeleton
} from '../components/patient360/Patient360LoadingPanel';

const PROGRAM_FILTERS = [
  { id: '', label: P360_KH.list.allPrograms },
  { id: 'vcct', label: P360_KH.programs.vcct },
  { id: 'adult', label: P360_KH.programs.adult },
  { id: 'child', label: P360_KH.programs.child },
  { id: 'infant', label: P360_KH.programs.infant }
];

const PAGE_SIZE = 25;

export default function Patient360Page() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialDeepLink = parsePatient360SearchParams(searchParams);
  const { user } = useAuth();
  const { sites: registrySites } = useSites();
  const sites = useMemo(
    () => filterSitesByUserScope(registrySites || [], user),
    [registrySites, user]
  );
  const facilitySites = useMemo(() => sites.filter(isFacilitySite), [sites]);
  const [siteCode, setSiteCode] = useState(() => {
    if (initialDeepLink?.site) return initialDeepLink.site;
    return pickDefaultSiteCode(facilitySites.length ? facilitySites : sites);
  });
  const [listFilters, setListFilters] = useState(P360_LIST_FILTER_EMPTY);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [patients, setPatients] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [listLoading, setListLoading] = useState(false);
  const [listReady, setListReady] = useState(false);
  const [selected, setSelected] = useState(() =>
    initialDeepLink?.clinicId
      ? {
          clinicId: initialDeepLink.clinicId,
          program: initialDeepLink.program,
          section: initialDeepLink.tab
        }
      : null
  );
  const [columnOrder, setColumnOrder] = useState(() => loadListColumnOrder(''));
  const [columnConfigOpen, setColumnConfigOpen] = useState(false);
  const [listSort, setListSort] = useState({ key: 'firstVisit', dir: 'desc' });

  useEffect(() => {
    getPatient360Dictionary().catch(() => {});
  }, []);

  useEffect(() => {
    const parsed = parsePatient360SearchParams(searchParams);
    if (!parsed?.clinicId) return;
    if (parsed.site) {
      setSiteCode((prev) => (parsed.site === prev ? prev : parsed.site));
    }
    setSelected((prev) => {
      const next = {
        clinicId: parsed.clinicId,
        program: parsed.program,
        section: parsed.tab
      };
      if (
        prev?.clinicId === next.clinicId &&
        prev?.program === next.program &&
        prev?.section === next.section
      ) {
        return prev;
      }
      return next;
    });
  }, [searchParams]);

  const programFilter = listFilters.program;
  const listQ = listFilters.q;
  const activeFilterCount = countActiveListFilters(listFilters);

  const loadList = useCallback(async () => {
    if (!siteCode) return;
    setListLoading(true);
    const f = normalizeListFilters(listFilters);
    try {
      const res = await patient360Api.listPatients(siteCode, {
        page,
        limit: PAGE_SIZE,
        program: f.program || undefined,
        q: f.q.trim().length >= 2 ? f.q.trim() : undefined,
        sex: f.sex || undefined,
        province: f.province || undefined,
        patientStatus: f.patientStatus || undefined,
        sortBy: listSort.key || undefined,
        sortDir: listSort.key ? listSort.dir : undefined
      });
      setPatients(res.patients || []);
      setPagination(res.pagination || null);
    } catch (e) {
      toast.error(e.response?.data?.message || e.message || P360_KH.toast.searchFailed);
      setPatients([]);
      setPagination(null);
    } finally {
      setListLoading(false);
      setListReady(true);
    }
  }, [siteCode, page, listFilters, listSort]);

  useEffect(() => {
    if (selected) return undefined;
    const timer = setTimeout(() => loadList(), 200);
    return () => clearTimeout(timer);
  }, [loadList, selected]);

  useEffect(() => {
    setPage(1);
    setListReady(false);
  }, [siteCode, listFilters.program, listFilters.sex, listFilters.province, listFilters.patientStatus]);

  const onListSortColumn = useCallback((columnId) => {
    setListSort((prev) => nextSortState(prev, columnId));
    setPage(1);
    setListReady(false);
  }, []);

  useEffect(() => {
    setColumnOrder((prev) => sanitizeColumnOrder(prev, programFilter));
  }, [programFilter]);

  useEffect(() => {
    saveListColumnOrder(columnOrder);
  }, [columnOrder]);

  const listPending = listLoading || (Boolean(siteCode) && !listReady);

  const openPatient = (row) => {
    setSelected({ clinicId: row.clinicId, program: row.program, section: 'overview' });
  };

  if (selected) {
    return (
      <Patient360Detail
        key={`${siteCode}-${selected.clinicId}-${selected.section || 'overview'}`}
        siteCode={siteCode}
        clinicId={selected.clinicId}
        initialProgram={selected.program}
        initialSection={selected.section || 'overview'}
        onBack={() => {
          if (location.state?.returnTo) {
            navigate(location.state.returnTo, {
              state: { restoreVisualize: true }
            });
            return;
          }
          setSelected(null);
          if (searchParams.get('clinicId')) {
            setSearchParams({}, { replace: true });
          }
        }}
      />
    );
  }

  const total = pagination?.totalCount;
  const totalPages = pagination?.totalPages ?? 0;
  const hasTotal = total != null && total >= 0;

  const toolbar = (
    <Patient360ListToolbar
      sites={facilitySites.length ? facilitySites : sites}
      siteCode={siteCode}
      onSiteChange={setSiteCode}
      listQ={listQ}
      onListQChange={(q) => {
        setListFilters((f) => ({ ...f, q }));
        setPage(1);
        setListReady(false);
      }}
      onSearchEnter={() => {
        setPage(1);
        loadList();
      }}
      programFilter={programFilter}
      onProgramFilterChange={(program) => {
        if (program === 'vcct') {
          navigate('/vcct');
        } else {
          setListFilters((f) => ({ ...f, program }));
        }
      }}
      programFilters={PROGRAM_FILTERS}
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
      onOpenColumnConfig={() => setColumnConfigOpen(true)}
      onOpenFilter={() => setFilterModalOpen(true)}
      activeFilterCount={activeFilterCount}
    />
  );

  return (
    <>
      {toolbar}
      <Patient360Layout lockViewport>
      <AppPageShell wide className="flex min-h-0 min-w-0 w-full max-w-full flex-1 flex-col !p-0">
          <Card className={cn(p360CardClass, 'flex min-h-0 min-w-0 w-full max-w-full flex-1 flex-col bg-card')}>
          <CardContent className="relative flex min-h-0 min-w-0 w-full max-w-full flex-1 flex-col border-0 border-t-0 p-0 pt-0">
            {listPending && !patients.length ? (
              <div className="relative flex min-h-0 flex-1 flex-col">
                <div className="min-h-0 flex-1 blur-[2px] opacity-60 pointer-events-none select-none">
                  <Patient360TableSkeleton rows={12} cols={columnOrder.length || 9} />
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
                  <Patient360ListTable
                    patients={patients}
                    programFilter={programFilter}
                    columnOrder={columnOrder}
                    sortKey={listSort.key}
                    sortDirection={listSort.dir}
                    onSortColumn={onListSortColumn}
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
      <Patient360ListColumnConfigModal
        open={columnConfigOpen}
        onClose={() => setColumnConfigOpen(false)}
        programFilter={programFilter}
        columnOrder={columnOrder}
        onColumnOrderChange={setColumnOrder}
      />
      <Patient360ListFilterModal
        open={filterModalOpen}
        onClose={() => setFilterModalOpen(false)}
        filters={listFilters}
        programFilters={PROGRAM_FILTERS}
        onApply={(next) => {
          setListFilters(next);
          setPage(1);
          setListReady(false);
        }}
      />
    </>
  );
}
