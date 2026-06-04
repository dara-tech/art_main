import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import AppPageShell from '../components/layout/AppPageShell';
import Patient360ListToolbar from '../components/patient360/Patient360ListToolbar';
import Patient360ListTable from '../components/patient360/Patient360ListTable';
import Patient360VisitsTable from '../components/patient360/Patient360VisitsTable';
import Patient360Layout from '../components/patient360/Patient360Layout';
import Patient360ListColumnConfigModal from '../components/patient360/Patient360ListColumnConfigModal';
import {
  normalizeListFilters,
  P360_LIST_FILTER_EMPTY
} from '../components/patient360/patient360ListFilters';
import { loadListColumnOrder, sanitizeColumnOrder, saveListColumnOrder } from '../components/patient360/patient360ListColumns';
import { nextSortState } from '../components/patient360/patient360ListSort';
import patient360Api from '../services/patient360Api';
import { getPatient360Dictionary } from '../services/patient360DictionaryCache';
import { useSites } from '../contexts/SitesContext';
import { filterSitesByUserScope, isFacilitySite, pickDefaultSiteCode } from '../utils/siteSelection';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { p360CardClass, p360TabClass } from '../components/layout/appNavStyles';
import { P360_KH } from './patient360Kh';
import { Patient360TableSkeleton, Patient360LoadingPanel } from '../components/patient360/Patient360LoadingPanel';

const PAGE_SIZE = 25;

export default function ClinicalFormsListPage() {
  const navigate = useNavigate();
  const { program } = useParams(); // 'adult', 'child', 'infant'
  const { user } = useAuth();
  
  const { sites: registrySites } = useSites();
  const sites = useMemo(() => filterSitesByUserScope(registrySites || [], user), [registrySites, user]);
  const facilitySites = useMemo(() => sites.filter(isFacilitySite), [sites]);
  
  const [siteCode, setSiteCode] = useState(() => pickDefaultSiteCode(facilitySites.length ? facilitySites : sites));
  const [listFilters, setListFilters] = useState(P360_LIST_FILTER_EMPTY);
  const [page, setPage] = useState(1);
  const [patients, setPatients] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [listLoading, setListLoading] = useState(false);
  const [listReady, setListReady] = useState(false);
  const [columnOrder, setColumnOrder] = useState(() => loadListColumnOrder(''));
  const [columnConfigOpen, setColumnConfigOpen] = useState(false);
  const [listSort, setListSort] = useState({ key: 'firstVisit', dir: 'desc' });
  const [activeTab, setActiveTab] = useState('intake'); // 'intake' or 'visits'

  useEffect(() => {
    getPatient360Dictionary().catch(() => {});
  }, []);

  const loadList = useCallback(async () => {
    if (!siteCode) return;
    setListLoading(true);
    const f = normalizeListFilters(listFilters);
    try {
      if (activeTab === 'intake') {
        const res = await patient360Api.listPatients(siteCode, {
          page,
          limit: PAGE_SIZE,
          program: program, // Force the program to match the URL route
          q: f.q.trim().length >= 2 ? f.q.trim() : undefined,
          sex: f.sex || undefined,
          province: f.province || undefined,
          patientStatus: f.patientStatus || undefined,
          sortBy: listSort.key || undefined,
          sortDir: listSort.key ? listSort.dir : undefined
        });
        setPatients(res.patients || []);
        setPagination(res.pagination || null);
      } else {
        const res = await patient360Api.listVisits(siteCode, {
          page,
          limit: PAGE_SIZE,
          program: program,
          q: f.q.trim().length >= 2 ? f.q.trim() : undefined,
          sortBy: listSort.key || undefined,
          sortDir: listSort.key ? listSort.dir : undefined
        });
        setPatients(res.visits || []);
        setPagination(res.pagination || null);
      }
    } catch (e) {
      toast.error(e.response?.data?.message || e.message || P360_KH.toast.searchFailed);
      setPatients([]);
      setPagination(null);
    } finally {
      setListLoading(false);
      setListReady(true);
    }
  }, [siteCode, page, listFilters, listSort, program, activeTab]);

  useEffect(() => {
    const timer = setTimeout(() => loadList(), 200);
    return () => clearTimeout(timer);
  }, [loadList]);

  useEffect(() => {
    setPage(1);
    setListReady(false);
  }, [siteCode, program, activeTab, listFilters.sex, listFilters.province, listFilters.patientStatus]);

  const onListSortColumn = useCallback((columnId) => {
    setListSort((prev) => nextSortState(prev, columnId));
    setPage(1);
    setListReady(false);
  }, []);

  useEffect(() => {
    setColumnOrder((prev) => sanitizeColumnOrder(prev, program));
  }, [program]);

  useEffect(() => {
    saveListColumnOrder(columnOrder);
  }, [columnOrder]);

  const handleRowClick = useCallback((patient) => {
    if (activeTab === 'intake') {
      navigate(`/forms/${program}/${patient.clinicId}/intake`);
    } else {
      navigate(`/forms/${program}/${patient.clinicId}/visits?vid=${patient.vid}`);
    }
  }, [navigate, activeTab, program]);

  const titlePrefix = program === 'adult' ? 'មនុស្សពេញវ័យ' : program === 'child' ? 'កុមារ' : 'ទារក';
  const pageTitle = `ទម្រង់អ្នកជំងឺ ${titlePrefix}`;

  return (
    <AppPageShell wide title={pageTitle} className="flex h-[calc(100vh-2.5rem)] min-w-0 w-full max-w-full flex-col !p-0 overflow-hidden">
      <Card className={cn(p360CardClass, 'flex min-h-0 min-w-0 w-full max-w-full flex-1 flex-col bg-card border-0 rounded-none shadow-none')}>
        <CardContent className="relative flex min-h-0 min-w-0 w-full max-w-full flex-1 flex-col border-0 border-t-0 p-0 pt-0">
          <Patient360ListToolbar
            tabs={
              <>
                <button
                  type="button"
                  onClick={() => setActiveTab('intake')}
                  className={p360TabClass(activeTab === 'intake')}
                >
                  បញ្ជីចុះឈ្មោះថ្មី (Intake List)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('visits')}
                  className={p360TabClass(activeTab === 'visits')}
                >
                  បញ្ជីពិនិត្យ (Visit List)
                </button>
              </>
            }
            sites={facilitySites.length ? facilitySites : sites}
            siteCode={siteCode}
            onSiteChange={setSiteCode}
            listQ={listFilters.q}
            onListQChange={(q) => {
              setListFilters((f) => ({ ...f, q }));
              setPage(1);
              setListReady(false);
            }}
            onSearchEnter={() => {
              setPage(1);
              loadList();
            }}
            programFilter={program}
            onProgramFilterChange={() => {}} // Disabled in this view
            programFilters={[]} // No program filters shown, since it's hardcoded by the route
            listPending={listLoading || !listReady}
            onRefresh={() => loadList()}
            pagination={pagination}
            page={page}
            onPageChange={(updater) => setPage(updater)}
            patientsCount={patients?.length || 0}
            total={pagination?.total || 0}
            hasTotal={pagination?.total !== undefined}
            totalPages={pagination?.totalPages || 0}
            onOpenColumnConfig={() => setColumnConfigOpen(true)}
            onOpenFilter={() => {}}
            activeFilterCount={0}
          />
          
          <Patient360Layout lockViewport>
            <div className="flex-1 flex flex-col min-h-0 relative">
              {(!listReady && listLoading) && !patients.length ? (
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
                    {activeTab === 'intake' ? (
                      <Patient360ListTable
                        patients={patients}
                        programFilter={program}
                        columnOrder={columnOrder}
                        sortKey={listSort.key}
                        sortDirection={listSort.dir}
                        onSortColumn={onListSortColumn}
                        onOpenPatient={handleRowClick}
                        scrollBody
                        fillHeight
                      />
                    ) : (
                      <Patient360VisitsTable
                        visits={patients}
                        programFilter={program}
                        sortKey={listSort.key}
                        sortDirection={listSort.dir}
                        onSortColumn={onListSortColumn}
                        onOpenVisit={handleRowClick}
                        scrollBody
                        fillHeight
                      />
                    )}
                  </div>
                </>
              )}
            </div>
          </Patient360Layout>
        </CardContent>
      </Card>

      {activeTab === 'intake' && (
        <Patient360ListColumnConfigModal
          open={columnConfigOpen}
          onClose={() => setColumnConfigOpen(false)}
          programFilter={program}
          columnOrder={columnOrder}
          onColumnOrderChange={setColumnOrder}
        />
      )}
    </AppPageShell>
  );
}
