import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import AppPageShell from '../components/layout/AppPageShell';
import Patient360Layout from '../components/patient360/Patient360Layout';
import patient360Api from '../services/patient360Api';
import { getPatient360Dictionary } from '../services/patient360DictionaryCache';
import { Card, CardContent } from '@/components/ui/card';
import Patient360SubNav from '../components/patient360/Patient360SubNav';
import Patient360ProfileSummaryCard, {
  Patient360AlertBanner
} from '../components/patient360/Patient360ProfileSummaryCard';
import Patient360TimelineCard from '../components/patient360/Patient360TimelineCard';
import Patient360DataTable from '../components/patient360/Patient360DataTable';
import { columnWidthForField } from '../components/patient360/patient360ColumnWidths';
import { cn } from '@/lib/utils';
import { APP_NAV_MUTED, P360_TABLE_PAD, P360_TABLE_TEXT, p360CardClass } from '../components/layout/appNavStyles';
import { P360_KH } from './patient360Kh';
import { Patient360LoadingPanel } from '../components/patient360/Patient360LoadingPanel';
import Patient360VcctPanel from '../components/patient360/Patient360VcctPanel';

const PEEK_VISITS = 5;

const SECTION_TABS = [
  { id: 'overview', label: P360_KH.tabs.overview },
  { id: 'visits', label: P360_KH.tabs.visits, countKey: 'visits' },
  { id: 'labs', label: P360_KH.tabs.labs, countKey: 'labTests' },
  { id: 'drugs', label: P360_KH.tabs.drugs },
  { id: 'history', label: P360_KH.tabs.history },
  { id: 'care', label: P360_KH.tabs.care },
  { id: 'status', label: P360_KH.tabs.status, countKey: 'patientStatus' },
  { id: 'timeline', label: P360_KH.tabs.timeline }
];

const SKIP_REG_KEYS = new Set(['sexLabel', 'patientType', 'site_code', 'created_at', 'updated_at', 'synced_at']);

/** Overview-only fields not already in the sub-nav strip */
const REG_OVERVIEW_KEYS = [
  'DafirstVisit',
  'DaFirstVisit',
  'DaART',
  'DaArt',
  'TPT',
  'Referred',
  'Allergy',
  'Phone',
  'Province',
  'Nationality',
  'kpType',
  'KPType',
  'KpType',
  'kp_type',
  'RiskGroup',
  'riskGroup'
];

function fieldLabel(dict, key) {
  return dict?.fieldLabels?.[key] || key;
}

function lookupValueLabel(fieldDictionary, key, raw) {
  if (raw == null || raw === '') return null;
  const maps = fieldDictionary?.valueMaps;
  if (!maps) return null;
  const m = maps[key];
  if (!m) return null;
  return m[String(raw)] ?? m[Number(raw)] ?? null;
}

function cellDisplay(row, key, fieldDictionary) {
  const decoded = row?.[`${key}_label`];
  if (decoded != null && decoded !== '') return String(decoded);
  const raw = row?.[key];
  const fromDict = lookupValueLabel(fieldDictionary, key, raw);
  if (fromDict != null && fromDict !== '') return String(fromDict);
  if (Number(raw) === -1) return 'មិនបានជ្រើស';
  return formatCell(raw);
}

function formatCell(value) {
  if (value == null || value === '') return '—';
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  const s = String(value);
  if (s.startsWith('1900-01-01')) return '—';
  return s.length >= 10 ? s.slice(0, 10) : s;
}

function columnKeys(rows, preferred = []) {
  if (!rows?.length) return preferred;
  const keys = new Set();
  rows.forEach((row) =>
    Object.keys(row || {}).forEach((k) => {
      if (!k.endsWith('_label')) keys.add(k);
    })
  );
  if (preferred.length) {
    const filtered = preferred.filter((k) => keys.has(k));
    if (filtered.length) return filtered;
  }
  const ordered = [];
  [...keys].sort().forEach((k) => ordered.push(k));
  return ordered;
}

const STATUS_COLUMNS_BY_PROGRAM = {
  adult: ['Da', 'Status', 'Cause', 'Place', 'OPlace'],
  child: ['Da', 'Status', 'Cause'],
  infant: ['DaStatus', 'Status', 'Vid']
};

function peekColumnLabel(fieldDictionary, key, headerOverrides) {
  return headerOverrides?.[key] || P360_KH.peekHeaders?.[key] || fieldLabel(fieldDictionary, key);
}

function columnAlign(key) {
  if (/^(CD4|CD8|VL|Result|Num|Weight|Height|Age|WHO|TestID|ARTnum)$/i.test(String(key))) {
    return 'right';
  }
  return 'left';
}

/** One table/list fills the card; scroll inside it (care/labs/drugs/history scroll the whole panel) */
const SINGLE_FILL_TABS = new Set(['visits', 'status', 'timeline']);

const CARE_BLOCK_KEYS = [
  'demographics',
  'programLinks',
  'appointments',
  'pnttPartners',
  'pnttChildren'
];

function anyBlockRows(block, keys) {
  return keys.some((k) => {
    if (k === 'vcctSnapshot') {
      const snap = block?.vcctSnapshot;
      if (snap?.notApplicable) return false;
      if (snap?.displaySections?.some((s) => s.rows?.length || s.tableRows?.length)) return true;
      return Boolean(snap?.linked || snap?.artVcctId || snap?.message);
    }
    return Array.isArray(block?.[k]) && block[k].length > 0;
  });
}

function statusCauseColumnHeader(rows) {
  const sc = P360_KH.statusCause;
  if (!rows?.length) return sc.default;
  const statuses = rows.map((r) => Number(r?.Status));
  if (statuses.every((s) => s === 3)) return sc.transfer;
  if (statuses.every((s) => s === 1)) return sc.death;
  if (statuses.some((s) => s === 1 || s === 3)) return sc.mixed;
  return sc.default;
}

function SectionTable({
  caption,
  rows,
  preferredColumns,
  count,
  limit,
  fieldDictionary,
  headerOverrides,
  hideIfEmpty,
  fillHeight = false
}) {
  if (!rows?.length) {
    if (hideIfEmpty) return null;
    return (
      <p
        className={cn(
          'flex min-h-[12rem] items-center justify-center',
          P360_TABLE_PAD,
          P360_TABLE_TEXT,
          'text-muted-foreground'
        )}
      >
        {caption ? `${caption}: ` : ''}
        {P360_KH.table.noRecords}
      </p>
    );
  }
  const cols = columnKeys(rows, preferredColumns);
  if (!cols.length) {
    return (
      <p className={cn('py-8 text-center', P360_TABLE_PAD, P360_TABLE_TEXT, APP_NAV_MUTED)}>
        {P360_KH.table.noRecords}
      </p>
    );
  }
  const capped = limit != null && count >= limit;
  const columns = cols.map((key) => {
    const label = peekColumnLabel(fieldDictionary, key, headerOverrides);
    return {
      id: key,
      label,
      width: columnWidthForField(key, label, cols.length),
      align: columnAlign(key),
      getValue: (row) => cellDisplay(row, key, fieldDictionary)
    };
  });

  const useScrollBody = fillHeight || cols.length >= 4;

  return (
    <div className={cn(fillHeight ? 'flex min-h-0 flex-1 flex-col' : 'space-y-2')}>
      {caption ? (
        <div
          className={cn(
            'flex min-h-8 shrink-0 items-center gap-2',
            P360_TABLE_PAD,
            P360_TABLE_TEXT,
            'text-muted-foreground'
          )}
        >
          <span className="font-medium text-foreground/80">{caption}</span>
          <span>
            {count ?? rows.length}
            {capped ? `/${limit}+` : ''}
          </span>
        </div>
      ) : null}
      <Patient360DataTable
        columns={columns}
        rows={rows}
        getRowKey={(_, idx) => idx}
        scrollBody={useScrollBody}
        fillHeight={fillHeight}
        className={fillHeight ? 'min-h-0 flex-1' : 'min-w-0 w-full max-w-full'}
      />
    </div>
  );
}

export default function Patient360Detail({
  siteCode,
  clinicId,
  initialProgram,
  initialSection = 'overview',
  onBack
}) {
  const [profile, setProfile] = useState(null);
  const [fieldDictionary, setFieldDictionary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sectionLoading, setSectionLoading] = useState(false);
  const [activeProgram, setActiveProgram] = useState(initialProgram || 'adult');
  const [activeSection, setActiveSection] = useState('overview');
  const loadedTabsRef = useRef({});
  const tabFetchSeqRef = useRef(0);
  const inFlightTabRef = useRef(null);
  const profileRef = useRef(null);
  const ensureTabLoadedRef = useRef(async () => {});
  const profileReadyRef = useRef(false);
  const skipNextTabEffectRef = useRef(false);
  const activeProgramRef = useRef(activeProgram);

  useEffect(() => {
    profileRef.current = profile;
  }, [profile]);

  useEffect(() => {
    activeProgramRef.current = activeProgram;
  }, [activeProgram]);

  useEffect(() => {
    getPatient360Dictionary()
      .then((dict) => setFieldDictionary(dict))
      .catch(() => {});
  }, []);

  const mergeProfileSection = useCallback((prev, res) => {
    const prog = res.program || activeProgramRef.current;
    const prevBlock = prev?.sections?.[prog] || {};
    const nextBlock = res.sections?.[prog] || {};
    const mergedBlock = { ...prevBlock };
    Object.entries(nextBlock).forEach(([key, value]) => {
      if (value === undefined) return;
      if (value === null && prevBlock[key] != null) return;
      if (Array.isArray(value)) {
        const prevArr = prevBlock[key];
        if (Array.isArray(prevArr) && prevArr.length > 0 && value.length === 0) return;
      }
      mergedBlock[key] = value;
    });
    return {
      ...prev,
      siteCode: res.siteCode ?? prev?.siteCode,
      clinicId: res.clinicId ?? prev?.clinicId,
      programs: res.programs ?? prev?.programs,
      summary: res.summary ?? prev?.summary,
      limits: res.limits ?? prev?.limits,
      sections: {
        ...prev?.sections,
        [prog]: mergedBlock
      },
      countsByProgram: { ...(prev?.countsByProgram || {}), ...(res.countsByProgram || {}) },
      timeline: res.timeline?.length ? res.timeline : prev?.timeline,
      timelineAll: res.timelineAll?.length ? res.timelineAll : prev?.timelineAll,
      clinical:
        res.clinical?.alerts?.length || res.clinical?.highlights?.length
          ? res.clinical
          : prev?.clinical
    };
  }, []);

  const ensureTabLoaded = useCallback(
    async (tab, program) => {
      const profileNow = profileRef.current;
      if (!profileNow || !siteCode || !clinicId || !program) return;
      if (tab === 'summary' || tab === 'overview') return;
      const loadKey = `${program}:${tab}`;
      if (loadedTabsRef.current[program]?.[tab]) {
        const block = profileNow.sections?.[program];
        const needsStatusRefetch =
          tab === 'status' &&
          !(block?.patientStatus?.length > 0) &&
          (profileNow.countsByProgram?.[program]?.patientStatus ?? 0) > 0;
        if (!needsStatusRefetch) {
          setSectionLoading(false);
          return;
        }
        loadedTabsRef.current[program] = {
          ...(loadedTabsRef.current[program] || {}),
          [tab]: false
        };
      }

      if (inFlightTabRef.current === loadKey) return;

      inFlightTabRef.current = loadKey;
      const seq = tabFetchSeqRef.current;
      setSectionLoading(true);
      try {
        const res = await patient360Api.getProfile(siteCode, clinicId, {
          tab,
          program,
          programs: profileNow.programs
        });
        setProfile((prev) => mergeProfileSection(prev, res));
        loadedTabsRef.current[program] = {
          ...(loadedTabsRef.current[program] || {}),
          [tab]: true
        };
      } catch (e) {
        if (seq === tabFetchSeqRef.current) {
          loadedTabsRef.current[program] = {
            ...(loadedTabsRef.current[program] || {}),
            [tab]: false
          };
          toast.error(e.response?.data?.message || e.message || P360_KH.toast.notFound);
        }
      } finally {
        if (inFlightTabRef.current === loadKey) inFlightTabRef.current = null;
        if (seq === tabFetchSeqRef.current) setSectionLoading(false);
      }
    },
    [siteCode, clinicId, mergeProfileSection]
  );

  ensureTabLoadedRef.current = ensureTabLoaded;

  // Stable deps only — never `profile` or `loading` (size must not change; profile merge must not re-trigger).
  useEffect(() => {
    if (!profileReadyRef.current || !profileRef.current) return;
    if (activeSection === 'overview') return;
    if (skipNextTabEffectRef.current) {
      skipNextTabEffectRef.current = false;
      return;
    }
    ensureTabLoadedRef.current(activeSection, activeProgram);
  }, [activeSection, activeProgram, clinicId]);

  const loadProfile = useCallback(async () => {
    const cid = String(clinicId || '').trim();
    if (!siteCode || !cid) return;
    profileReadyRef.current = false;
    setLoading(true);
    setProfile(null);
    loadedTabsRef.current = {};
    inFlightTabRef.current = null;
    tabFetchSeqRef.current += 1;
    try {
      const res = await patient360Api.getProfile(siteCode, cid, { tab: 'summary' });
      const first =
        initialProgram && res.programs?.includes(initialProgram)
          ? initialProgram
          : res.programs?.find((p) => p !== 'pntt') || res.programs?.[0] || 'adult';
      loadedTabsRef.current[first] = { summary: true, overview: true };
      profileRef.current = res;
      profileReadyRef.current = true;
      setProfile(res);
      setActiveProgram(first);
      const tab =
        initialSection && initialSection !== 'overview' ? initialSection : 'overview';
      if (tab !== 'overview') {
        skipNextTabEffectRef.current = true;
        void ensureTabLoadedRef.current(tab, first);
      }
      setActiveSection(tab);
    } catch (e) {
      toast.error(e.response?.data?.message || e.message || P360_KH.toast.notFound);
    } finally {
      setLoading(false);
    }
  }, [siteCode, clinicId, initialProgram, initialSection]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const programKeys = useMemo(() => {
    if (!profile?.programs) return [];
    const hasArt = profile.programs.some((p) => ['adult', 'child', 'infant'].includes(p));
    return profile.programs.filter((p) => !(p === 'pntt' && hasArt));
  }, [profile]);

  const block = useMemo(() => {
    if (!profile?.sections) return null;
    if (activeProgram === 'pntt') return profile.sections.pntt || { pntt: profile.sections.adult?.pntt };
    return profile.sections[activeProgram];
  }, [profile, activeProgram]);

  const counts = profile?.countsByProgram?.[activeProgram] || {};
  const limits = profile?.limits || {};
  const timelineForProgram = useMemo(() => {
    const all = profile?.timelineAll || profile?.timeline || [];
    return all.filter((ev) => ev.program === activeProgram || (activeProgram === 'adult' && ev.program === 'pntt'));
  }, [profile, activeProgram]);

  const isPnttOnly = activeProgram === 'pntt' && !profile?.sections?.adult;
  const clinical = profile?.clinical;
  const summary = profile?.summary;

  const tabCount = (key) => {
    if (!key) return null;
    const n = counts[key];
    return n != null && n > 0 ? n : null;
  };

  const singleFillTab =
    SINGLE_FILL_TABS.has(activeSection) &&
    (activeSection === 'timeline' || !isPnttOnly);

  const toolbar = (
    <Patient360SubNav
      clinicId={clinicId}
      onBack={onBack}
      summary={summary}
      programKeys={profile ? programKeys : []}
      activeProgram={activeProgram}
      onProgramChange={(p) => {
        tabFetchSeqRef.current += 1;
        inFlightTabRef.current = null;
        setSectionLoading(false);
        delete loadedTabsRef.current[p];
        setActiveProgram(p);
        setActiveSection('overview');
      }}
      tabs={profile ? SECTION_TABS : []}
      activeSection={activeSection}
      onSectionChange={(section) => {
        tabFetchSeqRef.current += 1;
        inFlightTabRef.current = null;
        setSectionLoading(false);
        setActiveSection(section);
      }}
      tabCount={tabCount}
      sectionLoading={sectionLoading}
      profileLoading={loading}
    />
  );

  return (
    <>
      {toolbar}
      <Patient360Layout lockViewport>
      <AppPageShell wide className="flex min-h-0 min-w-0 w-full max-w-full flex-1 flex-col !p-0">
        <Card className={cn(p360CardClass, 'flex min-h-0 min-w-0 w-full max-w-full flex-1 flex-col bg-card')}>
          <CardContent className="flex min-h-0 min-w-0 w-full max-w-full flex-1 flex-col gap-0 border-0 border-t-0 p-0 pt-0">
          {profile ? (
            <>
              <div className="relative flex min-h-0 flex-1 flex-col">
              <div
                className={cn(
                  'flex min-h-0 flex-1 flex-col px-0 py-0',
                  singleFillTab ? 'gap-3 overflow-hidden' : 'gap-4 overflow-y-auto overscroll-contain',
                  sectionLoading && 'pointer-events-none opacity-40'
                )}
              >
                  {activeSection !== 'overview' && clinical?.alerts?.length ? (
                    <Patient360AlertBanner alerts={clinical.alerts} className="shrink-0" />
                  ) : null}

                  {activeSection === 'overview' ? (
                    <div className="space-y-4">
                      <Patient360ProfileSummaryCard
                        alerts={clinical?.alerts || []}
                        registration={block?.registration}
                        fieldDictionary={fieldDictionary}
                        overviewKeys={REG_OVERVIEW_KEYS}
                        skipKeys={SKIP_REG_KEYS}
                        formatValue={cellDisplay}
                      />
                      {(activeProgram === 'adult' || activeProgram === 'child') && block?.vcctSnapshot ? (
                        <Patient360VcctPanel snapshot={block.vcctSnapshot} artSiteCode={siteCode} />
                      ) : null}
                      {!isPnttOnly ? (
                        <SectionTable
                          caption={P360_KH.blocks.art}
                          rows={block?.art}
                          preferredColumns={['ART', 'DaArt']}
                          count={counts.art}
                          hideIfEmpty
                          fieldDictionary={fieldDictionary}
                        />
                      ) : null}
                      {(block?.pntt?.length || isPnttOnly) ? (
                        <SectionTable
                          caption={P360_KH.blocks.pntt}
                          rows={block?.pntt}
                          preferredColumns={['DaVisit', 'SexHIV', 'Drug', 'Agree']}
                          count={counts.pntt}
                          limit={limits.pntt}
                          hideIfEmpty
                          fieldDictionary={fieldDictionary}
                        />
                      ) : null}
                      {!isPnttOnly && block?.visits?.length ? (
                        <SectionTable
                          caption={P360_KH.tabs.visits}
                          rows={block.visits.slice(0, PEEK_VISITS)}
                          preferredColumns={['DatVisit', 'TypeVisit', 'Weight', 'WHO', 'VLDetectable', 'DaApp']}
                          count={counts.visits}
                          limit={limits.visits}
                          fieldDictionary={fieldDictionary}
                        />
                      ) : null}
                    </div>
                  ) : null}

                  {activeSection === 'visits' && !isPnttOnly ? (
                    <SectionTable
                      rows={block?.visits}
                      preferredColumns={['DatVisit', 'TypeVisit', 'ARTnum', 'Weight', 'Height', 'WHO', 'VLDetectable', 'DaApp']}
                      count={counts.visits}
                      limit={limits.visits}
                      fieldDictionary={fieldDictionary}
                      fillHeight
                    />
                  ) : null}

                  {activeSection === 'labs' && !isPnttOnly ? (
                    <div className="space-y-3">
                      <SectionTable
                        caption={P360_KH.blocks.vl}
                        rows={block?.labTests}
                        preferredColumns={['DaCollect', 'HIVLoad', 'CD4', 'CD', 'TestID']}
                        count={counts.labTests}
                        limit={limits.labTests}
                        hideIfEmpty
                        fieldDictionary={fieldDictionary}
                      />
                      <SectionTable
                        caption={P360_KH.blocks.eid}
                        rows={block?.eidTests}
                        preferredColumns={['DaReceive', 'Result', 'DNAPcr']}
                        count={counts.eidTests}
                        hideIfEmpty
                        fieldDictionary={fieldDictionary}
                      />
                    </div>
                  ) : null}

                  {activeSection === 'drugs' && !isPnttOnly ? (
                    <div className="space-y-3">
                      <SectionTable
                        caption={P360_KH.blocks.arv}
                        rows={block?.arvDrugs}
                        preferredColumns={['Da', 'DrugName', 'Status', 'Dose']}
                        count={counts.arvDrugs}
                        limit={limits.drugs}
                        hideIfEmpty
                        fieldDictionary={fieldDictionary}
                      />
                      <SectionTable
                        caption={P360_KH.blocks.tpt}
                        rows={block?.tptDrugs}
                        preferredColumns={['Da', 'DrugName', 'Status']}
                        count={counts.tptDrugs}
                        hideIfEmpty
                        fieldDictionary={fieldDictionary}
                      />
                      <SectionTable
                        caption={P360_KH.blocks.tb}
                        rows={block?.tbDrugs}
                        preferredColumns={['Da', 'DrugName', 'Status']}
                        count={counts.tbDrugs}
                        hideIfEmpty
                        fieldDictionary={fieldDictionary}
                      />
                      <SectionTable
                        caption={P360_KH.blocks.oi}
                        rows={block?.oiDrugs}
                        preferredColumns={['Da', 'DrugName', 'Status']}
                        count={counts.oiDrugs}
                        hideIfEmpty
                        fieldDictionary={fieldDictionary}
                      />
                    </div>
                  ) : null}

                  {activeSection === 'history' ? (
                    <div className="space-y-3">
                      <SectionTable
                        caption={P360_KH.blocks.allergy}
                        rows={block?.allergies}
                        preferredColumns={['DrugName', 'Allergy', 'Da']}
                        hideIfEmpty
                        fieldDictionary={fieldDictionary}
                      />
                      <SectionTable
                        caption={P360_KH.blocks.arvHist}
                        rows={block?.arvTreatHistory}
                        preferredColumns={['DrugName', 'DaStart', 'DaStop']}
                        hideIfEmpty
                        fieldDictionary={fieldDictionary}
                      />
                      <SectionTable
                        caption={P360_KH.blocks.oiPast}
                        rows={block?.oiPast}
                        preferredColumns={['DrugName', 'DaStart', 'DaStop']}
                        hideIfEmpty
                        fieldDictionary={fieldDictionary}
                      />
                      <SectionTable
                        caption={P360_KH.blocks.family}
                        rows={block?.family}
                        preferredColumns={['Faminily', 'Age', 'HIVstatus']}
                        hideIfEmpty
                        fieldDictionary={fieldDictionary}
                      />
                    </div>
                  ) : null}

                  {activeSection === 'care' ? (
                    sectionLoading && !anyBlockRows(block, CARE_BLOCK_KEYS) ? (
                      <Patient360LoadingPanel
                        label={P360_KH.loadingSection}
                        className="m-0 flex-1 border-0"
                        minHeight="min-h-[12rem]"
                      />
                    ) : anyBlockRows(block, CARE_BLOCK_KEYS) ? (
                      <div className="space-y-3">
                        <SectionTable
                          caption={P360_KH.blocks.demo}
                          rows={block?.demographics}
                          preferredColumns={['Daupdate', 'Phone', 'Village', 'District', 'Province']}
                          hideIfEmpty
                          fieldDictionary={fieldDictionary}
                        />
                        <SectionTable
                          caption={P360_KH.blocks.links}
                          rows={block?.programLinks}
                          preferredColumns={['Codes', 'Typecode']}
                          hideIfEmpty
                          fieldDictionary={fieldDictionary}
                        />
                        <SectionTable
                          caption={P360_KH.blocks.appt}
                          rows={block?.appointments}
                          preferredColumns={['DatVisit', 'DaApp', 'Att']}
                          limit={limits.appointments}
                          hideIfEmpty
                          fieldDictionary={fieldDictionary}
                        />
                        <SectionTable
                          caption={P360_KH.blocks.partners}
                          rows={block?.pnttPartners}
                          preferredColumns={['NumPart', 'StatusHIV', 'Result']}
                          hideIfEmpty
                          fieldDictionary={fieldDictionary}
                        />
                        <SectionTable
                          caption={P360_KH.blocks.children}
                          rows={block?.pnttChildren}
                          preferredColumns={['NumChild', 'Age', 'Sex']}
                          hideIfEmpty
                          fieldDictionary={fieldDictionary}
                        />
                      </div>
                    ) : (
                      <p className={cn('py-8 text-center', APP_NAV_MUTED)}>{P360_KH.table.noRecords}</p>
                    )
                  ) : null}

                  {activeSection === 'status' && !isPnttOnly ? (
                    sectionLoading && !(block?.patientStatus?.length > 0) ? (
                      <Patient360LoadingPanel
                        label={P360_KH.loadingSection}
                        className="m-0 flex-1 border-0"
                        minHeight="min-h-[12rem]"
                      />
                    ) : (
                      <SectionTable
                        caption={P360_KH.tabs.status}
                        rows={block?.patientStatus}
                        preferredColumns={
                          STATUS_COLUMNS_BY_PROGRAM[activeProgram] || [
                            'Da',
                            'DaStatus',
                            'Status',
                            'Cause',
                            'Place'
                          ]
                        }
                        headerOverrides={{
                          Da: P360_KH.peekHeaders.Da,
                          DaStatus: P360_KH.peekHeaders.DaStatus,
                          Status: P360_KH.peekHeaders.Status,
                          Cause: statusCauseColumnHeader(block?.patientStatus),
                          Place: P360_KH.peekHeaders.Place,
                          OPlace: P360_KH.peekHeaders.OPlace
                        }}
                        count={counts.patientStatus}
                        limit={limits.status}
                        fieldDictionary={fieldDictionary}
                        fillHeight
                      />
                    )
                  ) : null}

                  {activeSection === 'timeline' ? (
                    <Patient360TimelineCard events={timelineForProgram} className="min-h-0 flex-1" />
                  ) : null}
              </div>

              <p className={cn('shrink-0  px-0 py-0', APP_NAV_MUTED, 'opacity-80')}>
                {P360_KH.footer
                  .replace('{visits}', String(limits.visits ?? ''))
                  .replace('{lab}', String(limits.labTests ?? ''))
                  .replace('{drugs}', String(limits.drugs ?? ''))}
              </p>
              </div>
            </>
          ) : loading ? (
            <Patient360LoadingPanel label={P360_KH.loadingProfile} className="min-h-0 flex-1" />
          ) : null}
          </CardContent>
        </Card>
      </AppPageShell>
    </Patient360Layout>
    </>
  );
}
