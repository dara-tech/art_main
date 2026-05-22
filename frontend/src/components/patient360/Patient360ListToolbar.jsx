import {
  RiFilter3Line,
  RiLayoutColumnLine,
  RiLoader4Line,
  RiRefreshLine,
  RiSearchLine,
  RiUserSearchLine
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
import { Patient360NavBar, Patient360NavRow } from './Patient360NavBar';

/** 3 fixed rows: title · filters · programs+pager */
export const P360_LIST_NAV_ROWS = 3;

export default function Patient360ListToolbar({
  sites,
  siteCode,
  onSiteChange,
  listQ,
  onListQChange,
  onSearchEnter,
  programFilter,
  onProgramFilterChange,
  programFilters,
  listPending,
  onRefresh,
  pagination,
  page,
  onPageChange,
  patientsCount,
  total,
  hasTotal,
  totalPages,
  onOpenColumnConfig,
  onOpenFilter,
  activeFilterCount = 0
}) {
  return (
    <Patient360NavBar ariaLabel={P360_KH.pageTitle} rowCount={P360_LIST_NAV_ROWS}>
      <Patient360NavRow>
        <RiUserSearchLine className={cn(APP_NAV_ICON, 'shrink-0 text-primary')} aria-hidden />
        <span className={cn('shrink-0 font-semibold', APP_NAV_TEXT)}>{P360_KH.list.title}</span>
        <span className={cn('hidden min-w-0 truncate text-muted-foreground lg:inline', APP_NAV_MUTED)}>
          {P360_KH.pageDescription}
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
            placeholder={P360_KH.searchPlaceholder}
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
        <button
          type="button"
          onClick={onOpenFilter}
          className={cn(appNavItemClass(false), activeFilterCount > 0 && 'border-primary/40 bg-primary/10')}
          title={P360_KH.list.filterTitle}
          aria-label={P360_KH.list.filterTitle}
        >
          <RiFilter3Line className={APP_NAV_ICON} aria-hidden />
          <span className="hidden sm:inline">{P360_KH.list.filter}</span>
          {activeFilterCount > 0 ? (
            <span className="font-normal opacity-70">({activeFilterCount})</span>
          ) : null}
        </button>
        <button
          type="button"
          onClick={onOpenColumnConfig}
          className={appNavItemClass(false)}
          title={P360_KH.list.columnConfigTitle}
          aria-label={P360_KH.list.columnConfigTitle}
        >
          <RiLayoutColumnLine className={APP_NAV_ICON} aria-hidden />
          <span className="hidden sm:inline">{P360_KH.list.columnConfig}</span>
        </button>
      </Patient360NavRow>

      <Patient360NavRow tone="muted" className="justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto">
          {programFilters.map((f) => (
            <button
              key={f.id || 'all'}
              type="button"
              onClick={() => onProgramFilterChange(f.id)}
              className={appNavItemClass(programFilter === f.id)}
            >
              {f.label}
            </button>
          ))}
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
