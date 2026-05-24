import { Link } from 'react-router-dom';
import Patient360DataTable from '../patient360/Patient360DataTable';
import { buildPatient360Path } from '../../utils/patient360Navigation';
import { cn } from '@/lib/utils';
import {
  P360_TABLE_PAD,
  P360_TABLE_TEXT,
  p360CardClass,
  p360ControlClass
} from '../layout/appNavStyles';
import { P360_KH } from '../../pages/patient360Kh';
import { VCCT_KH } from '../../pages/vcctKh';

function FactCell({ label, value }) {
  if (value == null || value === '') return null;
  const text = String(value);
  return (
    <div className="min-w-0 bg-card px-4 py-2">
      <div className={cn('truncate text-muted-foreground', P360_TABLE_TEXT)} title={label}>
        {label}
      </div>
      <div
        className={cn('mt-1 truncate font-medium text-foreground', P360_TABLE_TEXT)}
        title={text}
      >
        {text}
      </div>
    </div>
  );
}

function FieldGrid({ rows, emptyMessage = P360_KH.vcct.noDetail }) {
  if (!rows?.length) {
    return <p className={cn(P360_TABLE_PAD, P360_TABLE_TEXT, 'text-muted-foreground')}>{emptyMessage}</p>;
  }
  return (
    <dl className={cn('grid grid-cols-[minmax(9rem,auto)_1fr] gap-x-3 gap-y-1.5', P360_TABLE_PAD, P360_TABLE_TEXT)}>
      {rows.map((row) => (
        <div key={row.key} className="contents">
          <dt className="text-muted-foreground">{row.label}</dt>
          <dd className="break-words text-foreground">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

const RETEST_COLUMNS = [
  { id: 'test_date', label: VCCT_KH.columns.registrationDate, getValue: (r) => r.test_date },
  { id: 'result', label: VCCT_KH.columns.hivResult, getValue: (r) => r.result },
  { id: 'sex', label: VCCT_KH.columns.sex, getValue: (r) => r.sex_label ?? r.sex },
  { id: 'age', label: 'អាយុ', getValue: (r) => r.age },
  { id: 'status_id', label: 'ស្ថានភាព', getValue: (r) => r.status_id }
];

const ART_LINK_COLUMNS = (artSiteCode) => [
  {
    id: 'clinicId',
    label: VCCT_KH.columns.clinicId,
    width: 96,
    mono: true,
    getValue: (r) => r.clinicId
  },
  {
    id: 'program',
    label: VCCT_KH.columns.program,
    width: 88,
    getValue: (r) => r.programLabel ?? r.program
  },
  {
    id: 'artnum',
    label: VCCT_KH.columns.art,
    width: 100,
    getValue: (r) => r.artnum
  },
  {
    id: 'open',
    label: '',
    width: 120,
    renderCell: (row) => (
      <Link
        to={buildPatient360Path({
          siteCode: artSiteCode,
          clinicId: row.clinicId,
          program: row.program,
          section: 'care'
        })}
        className={cn(p360ControlClass, 'inline-flex h-7 items-center px-2 text-[11px] text-primary')}
        onClick={(e) => e.stopPropagation()}
      >
        {VCCT_KH.detail.openArt}
      </Link>
    )
  }
];

export function VcctSummaryCard({ rows, summary, caption = P360_KH.blocks.reg }) {
  if (!rows?.length) return null;

  const hivLabel = summary?.hiv_result_label;
  const vcctId = summary?.vcct_id != null ? String(summary.vcct_id).padStart(6, '0') : null;

  return (
    <div className={cn(p360CardClass, 'overflow-hidden shadow-sm ring-1 ring-border/50')}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 bg-linear-to-r from-primary/8 via-muted/20 to-transparent px-4 py-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            {caption}
          </p>
          {vcctId ? (
            <p className="mt-0.5 font-mono text-base font-semibold tabular-nums text-foreground">
              {vcctId}
            </p>
          ) : null}
        </div>
        {hivLabel ? (
          <span
            className={cn(
              'inline-flex h-6 items-center rounded-full border px-2.5 text-[10px] font-semibold',
              String(hivLabel).includes('អវិ')
                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                : String(hivLabel).includes('វិជ')
                  ? 'border-destructive/40 bg-destructive/10 text-destructive'
                  : 'border-border bg-muted/40 text-foreground'
            )}
          >
            {hivLabel}
          </span>
        ) : null}
      </div>
      <div className="grid grid-cols-1 gap-px bg-border/70 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {rows.map((row) => (
          <FactCell key={row.key} label={row.label} value={row.value} />
        ))}
      </div>
    </div>
  );
}

export function VcctArtLinksTable({ artLinks, artSiteCode }) {
  if (!artLinks?.length) return null;
  const rows = artLinks.map((r, i) => ({
    ...r,
    _key: `${r.program}-${r.clinicId}-${i}`
  }));
  return (
    <div className={cn(p360CardClass, 'overflow-hidden shadow-sm')}>
      <div
        className={cn(
          'flex min-h-8 items-center border-b border-border/80 bg-muted/30 font-medium text-foreground/90',
          P360_TABLE_PAD,
          P360_TABLE_TEXT
        )}
      >
        {VCCT_KH.detail.artLinks}
      </div>
      <Patient360DataTable
        columns={ART_LINK_COLUMNS(artSiteCode)}
        rows={rows}
        getRowKey={(r) => r._key}
        compactBodyRows
        className="border-0 shadow-none"
      />
    </div>
  );
}

export function VcctSectionBlock({ section }) {
  if (!section) return null;
  const hasRows = (section.rows?.length ?? 0) > 0;
  const hasTable = (section.tableRows?.length ?? 0) > 0;
  if (!hasRows && !hasTable) return null;

  return (
    <div className={cn(p360CardClass, 'overflow-hidden shadow-sm')}>
      <div
        className={cn(
          'flex min-h-8 items-center border-b border-border/80 bg-muted/30 font-medium text-foreground/90',
          P360_TABLE_PAD,
          P360_TABLE_TEXT
        )}
      >
        {section.title}
      </div>
      {hasTable ? (
        <Patient360DataTable
          columns={RETEST_COLUMNS}
          rows={section.tableRows.map((r, i) => ({ ...r, _key: String(r.id ?? r._key ?? i) }))}
          getRowKey={(r) => r._key}
          compactBodyRows
          className="border-0 shadow-none"
          emptyMessage={P360_KH.vcct.noDetail}
        />
      ) : (
        <FieldGrid rows={section.rows} />
      )}
    </div>
  );
}

export function sectionHasContent(section) {
  return (section?.rows?.length ?? 0) > 0 || (section?.tableRows?.length ?? 0) > 0;
}

export function buildVcctSubNavSummary(snapshot) {
  if (!snapshot) return null;
  const reg = snapshot.displaySections?.find((s) => s.id === 'registration');
  const pick = (key) => reg?.rows?.find((r) => r.key === key)?.value ?? null;
  const s = snapshot.summary || {};
  return {
    patientType: snapshot.vcctSiteCode ? `${VCCT_KH.list.vcctSite} ${snapshot.vcctSiteCode}` : null,
    sex: pick('sex') ?? s.sex_label ?? null,
    dateOfBirth: pick('dob') ?? s.dob ?? null,
    hivResult: pick('hiv_result') ?? s.hiv_result_label ?? null,
    registrationDate: pick('registration_date') ?? s.registration_date ?? null
  };
}

export function countVcctRecordSections(sections, formPages) {
  if (formPages?.length) return formPages.length;
  return (sections || []).filter((s) => s.id !== 'registration' && sectionHasContent(s)).length;
}


