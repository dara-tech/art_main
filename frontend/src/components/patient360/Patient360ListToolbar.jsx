import {
  RiArrowLeftSLine,
  RiArrowRightSLine,
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
import { TOOLBAR_ICON } from '../layout/toolbarIconColors';
import { P360_KH } from '../../pages/patient360Kh';
import { VizToolbarBtn } from '../visualize/visualizeToolbarUi';
import { Patient360NavBar, Patient360NavRow } from './Patient360NavBar';

/** 2 fixed rows: filters · programs+pager */
export const P360_LIST_NAV_ROWS = 2;

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
            className={cn(
              'pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2',
              TOOLBAR_ICON.blue
            )}
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
        <VizToolbarBtn
          icon={listPending ? RiLoader4Line : RiRefreshLine}
          iconClassName={listPending ? TOOLBAR_ICON.brand : TOOLBAR_ICON.cyan}
          label={listPending ? P360_KH.loading : P360_KH.list.refresh}
          disabled={listPending}
          onClick={onRefresh}
          className={listPending ? '[&_svg]:animate-spin' : undefined}
        />
        <VizToolbarBtn
          icon={RiFilter3Line}
          iconClassName={TOOLBAR_ICON.amber}
          label={P360_KH.list.filterTitle}
          active={activeFilterCount > 0}
          onClick={onOpenFilter}
        >
          {activeFilterCount > 0 ? (
            <span className="tabular-nums text-[10px] font-semibold leading-none">{activeFilterCount}</span>
          ) : null}
        </VizToolbarBtn>
        <VizToolbarBtn
          icon={RiLayoutColumnLine}
          iconClassName={TOOLBAR_ICON.violet}
          label={P360_KH.list.columnConfigTitle}
          onClick={onOpenColumnConfig}
        />
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
          <VizToolbarBtn
            icon={RiArrowLeftSLine}
            iconClassName={TOOLBAR_ICON.slate}
            label={P360_KH.list.prev}
            disabled={listPending || !pagination?.hasPrev}
            onClick={() => onPageChange((p) => Math.max(1, p - 1))}
          />
          <VizToolbarBtn
            icon={RiArrowRightSLine}
            iconClassName={TOOLBAR_ICON.slate}
            label={P360_KH.list.next}
            disabled={listPending || !pagination?.hasNext}
            onClick={() => onPageChange((p) => p + 1)}
          />
        </div>
      </Patient360NavRow>
    </Patient360NavBar>
  );
}
