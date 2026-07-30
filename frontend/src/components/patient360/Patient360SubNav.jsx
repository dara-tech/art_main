import { toast } from 'sonner';
import { RiArrowLeftLine, RiLoader4Line } from '@remixicon/react';
import { cn } from '@/lib/utils';
import {
  APP_NAV_ICON,
  APP_NAV_MUTED,
  APP_NAV_TEXT,
  P360_TOOLBAR_TEXT,
  appNavItemClass,
  p360TabClass
} from '../layout/appNavStyles';
import { P360_KH } from '../../pages/patient360Kh';
import { Patient360NavBar, Patient360NavRow } from './Patient360NavBar';

export function SubNavFact({ label, value, mono }) {
  if (value == null || value === '') return null;
  return (
    <span className={cn('inline-flex max-w-52 shrink-0 items-center gap-1', P360_TOOLBAR_TEXT)}>
      <span className="shrink-0 font-normal text-muted-foreground">{label}</span>
      <span
        className={cn(
          'min-w-0 font-medium text-foreground whitespace-nowrap overflow-x-hidden text-ellipsis',
          mono && 'font-mono tabular-nums'
        )}
        title={String(value)}
      >
        {value}
      </span>
    </span>
  );
}

export default function Patient360SubNav({
  clinicId,
  onBack,
  summary,
  programKeys = [],
  activeProgram,
  onProgramChange,
  tabs = [],
  activeSection,
  onSectionChange,
  tabCount,
  sectionLoading = false,
  profileLoading = false
}) {
  const programLabel = (p) => P360_KH.programs[p] || p;
  const multiProgram = programKeys.length > 1;
  const showTabs = tabs.length > 0;
  /** Keep 2-row height on detail while profile loads (tabs row not ready yet). */
  const showRow2 = multiProgram || showTabs || profileLoading;
  const rowCount = showRow2 ? 2 : 1;

  return (
    <Patient360NavBar ariaLabel={P360_KH.pageTitle} rowCount={rowCount}>
      <Patient360NavRow tone="default">
        <button type="button" onClick={onBack} className={cn(appNavItemClass(false), 'gap-1')}>
          <RiArrowLeftLine className={APP_NAV_ICON} aria-hidden />
          <span>{P360_KH.detail.back}</span>
        </button>

        <div className="mx-0.5 h-4 w-px shrink-0 bg-border/80" aria-hidden />

        <span className={cn('shrink-0 font-mono font-semibold tabular-nums', APP_NAV_TEXT)}>
          {clinicId}
        </span>
        <button
          type="button"
          onClick={() => {
            navigator.clipboard.writeText(String(clinicId));
            toast.success(`បានចម្លង Clinic ID: ${clinicId}`);
          }}
          title="ចម្លង Clinic ID"
          className="ml-1 inline-flex h-6 w-6 items-center justify-center rounded border border-border/60 bg-muted/30 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>

        {!multiProgram && summary?.patientType ? (
          <span
            className={cn(
              'inline-flex shrink-0 items-center border border-border/60 bg-muted/40 px-1.5 py-1',
              P360_TOOLBAR_TEXT
            )}
          >
            {summary.patientType}
          </span>
        ) : null}

        {profileLoading ? (
          <span className={cn('inline-flex shrink-0 items-center gap-1', P360_TOOLBAR_TEXT, 'text-muted-foreground')}>
            <RiLoader4Line className={cn(APP_NAV_ICON, 'animate-spin text-primary')} aria-hidden />
            {P360_KH.loadingProfile}
          </span>
        ) : null}

        {!profileLoading && summary ? (
          <div className="ml-auto flex shrink-0 items-center gap-3 border-l border-border/80 pl-3">
            {summary.sex ? <SubNavFact label={P360_KH.summary.sex} value={summary.sex} /> : null}
            {summary.dateOfBirth ? (
              <SubNavFact label={P360_KH.summary.dob} value={formatShortDate(summary.dateOfBirth)} />
            ) : null}
            {summary.registrationDate ? (
              <SubNavFact label={P360_KH.vcct.registered} value={formatShortDate(summary.registrationDate)} />
            ) : null}
            {summary.hivResult ? (
              <SubNavFact label={P360_KH.vcct.hivResult} value={summary.hivResult} />
            ) : null}
            {summary.artNumber ? (
              <SubNavFact label={P360_KH.summary.art} value={summary.artNumber} mono />
            ) : null}
          </div>
        ) : null}
      </Patient360NavRow>

      {showRow2 ? (
        <Patient360NavRow
          tone={showTabs || multiProgram ? 'tabs' : 'default'}
          className="gap-1 overflow-x-auto"
        >
          {multiProgram
            ? programKeys.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => onProgramChange(p)}
                  disabled={profileLoading}
                  className={cn(appNavItemClass(activeProgram === p, profileLoading), P360_TOOLBAR_TEXT)}
                >
                  {programLabel(p)}
                </button>
              ))
            : null}

          {multiProgram && showTabs ? (
            <div className="mx-0.5 h-4 w-px shrink-0 bg-border/80" aria-hidden />
          ) : null}

          {showTabs
            ? tabs.map((tab) => {
                const n = tabCount?.(tab.countKey);
                const isActive = activeSection === tab.id;
                const tabDisabled = profileLoading || (sectionLoading && !isActive);
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => onSectionChange(tab.id)}
                    disabled={tabDisabled}
                    className={cn(
                      p360TabClass(isActive, tabDisabled),
                      sectionLoading && !isActive && !tabDisabled && 'opacity-55'
                    )}
                  >
                    {tab.label}
                    {n != null ? <span className="font-normal opacity-60">({n})</span> : null}
                    {sectionLoading && isActive ? (
                      <RiLoader4Line
                        className={cn(APP_NAV_ICON, 'animate-spin text-primary')}
                        aria-hidden
                      />
                    ) : null}
                  </button>
                );
              })
            : null}

          {sectionLoading ? (
            <span
              className={cn('ml-auto inline-flex shrink-0 items-center gap-1', APP_NAV_MUTED)}
              role="status"
              aria-live="polite"
            >
              <RiLoader4Line className={cn(APP_NAV_ICON, 'animate-spin text-primary')} aria-hidden />
              {P360_KH.loadingSection}
            </span>
          ) : null}
        </Patient360NavRow>
      ) : null}
    </Patient360NavBar>
  );
}

function formatShortDate(value) {
  if (value == null || value === '') return null;
  const s = String(value);
  if (s.startsWith('1900-01-01')) return null;
  return s.length >= 10 ? s.slice(0, 10) : s;
}
