import {
  RiLoader4Line,
  RiRefreshLine,
  RiSearchLine,
  RiTestTubeLine
} from '@remixicon/react';
import SiteSelectModal from '../sites/SiteSelectModal';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  APP_NAV_ICON,
  APP_NAV_MUTED,
  APP_NAV_TEXT,
  appNavItemClass,
  p360ControlClass
} from '../layout/appNavStyles';
import { P360_KH } from '../../pages/patient360Kh';
import { VCCT_KH } from '../../pages/vcctKh';
import { Patient360NavBar, Patient360NavRow } from '../patient360/Patient360NavBar';

/** Same 3-row toolbar as Patient 360 list */
export const VCCT_LIST_NAV_ROWS = 3;

export default function VcctListToolbar({
  sites,
  siteCode,
  onSiteChange,
  listQ,
  onListQChange,
  onSearchEnter,
  listPending,
  onRefresh,
  pagination,
  page,
  onPageChange,
  patientsCount,
  total,
  hasTotal,
  totalPages,
  vcctSiteCode
}) {
  return (
    <Patient360NavBar ariaLabel={VCCT_KH.pageTitle} rowCount={VCCT_LIST_NAV_ROWS}>
      <Patient360NavRow>
        <RiTestTubeLine className={cn(APP_NAV_ICON, 'shrink-0 text-primary')} aria-hidden />
        <span className={cn('shrink-0 font-semibold', APP_NAV_TEXT)}>{VCCT_KH.list.title}</span>
        <span className={cn('hidden min-w-0 truncate text-muted-foreground lg:inline', APP_NAV_MUTED)}>
          {VCCT_KH.pageDescription}
        </span>
      </Patient360NavRow>

      <Patient360NavRow tone="filters" className="gap-3">
        <SiteSelectModal
          sites={sites}
          value={siteCode}
          onChange={onSiteChange}
          label={P360_KH.facility}
          facilityOnly={false}
          showLabel={false}
          compact
          className="w-[11.5rem] shrink-0"
          modalText={P360_KH.siteModal}
        />
        <div className="relative min-w-[8rem] flex-1">
          <RiSearchLine
            className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            value={listQ}
            onChange={(e) => onListQChange(e.target.value)}
            placeholder={VCCT_KH.list.searchPlaceholder}
            aria-label={P360_KH.search}
            className={cn(p360ControlClass, 'w-full pl-8')}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSearchEnter?.();
            }}
          />
        </div>
        <button
          type="button"
          disabled={listPending}
          onClick={onRefresh}
          className={appNavItemClass(false, listPending)}
        >
          {listPending ? (
            <RiLoader4Line className={cn(APP_NAV_ICON, 'animate-spin text-primary')} aria-hidden />
          ) : (
            <RiRefreshLine className={APP_NAV_ICON} aria-hidden />
          )}
          <span className="hidden sm:inline">{listPending ? P360_KH.loading : P360_KH.list.refresh}</span>
        </button>
      </Patient360NavRow>

      <Patient360NavRow tone="muted" className="justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto">
          {vcctSiteCode ? (
            <span
              className={cn(
                'inline-flex shrink-0 items-center border border-border/60 bg-muted/40 px-1.5 py-1',
                APP_NAV_TEXT
              )}
            >
              {VCCT_KH.list.vcctSite}: <span className="ml-1 font-mono tabular-nums">{vcctSiteCode}</span>
            </span>
          ) : (
            <span className={cn('text-amber-800 dark:text-amber-400', APP_NAV_TEXT)}>
              {VCCT_KH.list.noVcctSite}
            </span>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className={cn('hidden truncate sm:inline', APP_NAV_MUTED)} role="status">
            {P360_KH.list.showing} <strong className="text-foreground">{patientsCount}</strong>
            {hasTotal ? (
              <>
                {' '}
                {P360_KH.list.of} <strong className="text-foreground">{total}</strong>
                {totalPages > 0 ? ` · ${pagination?.page ?? page}/${totalPages}` : ''}
              </>
            ) : (
              ` · ${P360_KH.list.page} ${pagination?.page ?? page}`
            )}
          </span>
          <button
            type="button"
            disabled={listPending || !pagination?.hasPrev}
            onClick={() => onPageChange((p) => Math.max(1, p - 1))}
            className={appNavItemClass(false, listPending || !pagination?.hasPrev)}
          >
            {P360_KH.list.prev}
          </button>
          <button
            type="button"
            disabled={listPending || !pagination?.hasNext}
            onClick={() => onPageChange((p) => p + 1)}
            className={appNavItemClass(false, listPending || !pagination?.hasNext)}
          >
            {P360_KH.list.next}
          </button>
        </div>
      </Patient360NavRow>
    </Patient360NavBar>
  );
}
