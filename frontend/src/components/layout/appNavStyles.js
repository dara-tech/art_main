import { cn } from '@/lib/utils';

/** One row height everywhere: top nav, P360 toolbars, inputs */
export const APP_NAV_ROW = 'h-8 min-h-8';
export const APP_NAV_ICON = 'size-3.5 shrink-0';
export const APP_NAV_TEXT = 'text-[11px] font-medium leading-none';
export const APP_NAV_MUTED = 'text-[11px] font-medium leading-none text-muted-foreground';

export const appNavItemClass = (active, disabled = false) =>
  cn(
    'inline-flex shrink-0 items-center justify-center gap-1 rounded-none border-b-2 px-2.5 transition-colors',
    APP_NAV_ROW,
    APP_NAV_TEXT,
    active
      ? 'border-primary bg-primary/10 text-foreground shadow-none'
      : 'border-transparent text-muted-foreground hover:border-border/70 hover:bg-muted/55 hover:text-foreground',
    disabled && 'pointer-events-none opacity-40'
  );

export const appNavPillActiveClass = 'border-primary/40 bg-primary/10 text-foreground shadow-none';

export const appSubnavShellClass =
  'w-full shrink-0 border-0 bg-card/95 backdrop-blur-sm';

/** Fixed flush under main app top bar (overlap header border-b by 1px) */
export const p360FixedShellClass = 'shrink-0 border-0 bg-card/95 backdrop-blur-sm fixed inset-x-0 z-40 -mt-px border-t-0';

/** @deprecated use fixed — kept for type compat */
export const p360StackedShellClass = cn(appSubnavShellClass, 'relative z-30 border-t-0');

export const P360_TOOLBAR_PAD = 'px-4';
/** Horizontal padding for captions / outer wrappers. */
export const P360_TABLE_PAD = 'px-4';
export const P360_CELL_PAD = P360_TABLE_PAD;
export const P360_HEAD_PAD = P360_TABLE_PAD;
/** Same typography + min height for th and td (Khmer needs line-height > 1; never leading-none). */
export const P360_TABLE_TEXT = 'text-[11px] font-medium leading-[1.5]';
/** P360 toolbar / summary facts — Khmer-safe line height (not APP_NAV_TEXT leading-none). */
export const P360_TOOLBAR_TEXT = P360_TABLE_TEXT;
/** @deprecated use P360_TABLE_TEXT */
export const P360_TABLE_HEAD_TEXT = P360_TABLE_TEXT;

/** Detail section tabs — same border on every tab; active = tint only */
export const p360TabClass = (active, disabled = false) =>
  cn(
    'inline-flex shrink-0 items-center justify-center gap-1 rounded-none border-b border-border/80 px-2.5 transition-colors',
    APP_NAV_ROW,
    P360_TABLE_TEXT,
    active
      ? 'bg-primary/10 text-foreground'
      : 'bg-muted/15 text-muted-foreground hover:bg-muted/35 hover:text-foreground',
    disabled && 'pointer-events-none opacity-40'
  );
/** Inner cell: fixed h-8 row, centered text, horizontal ellipsis only (no vertical clip). */
export const P360_TABLE_ROW_INNER = cn(
  'flex min-h-8 items-center',
  P360_TABLE_PAD,
  'py-1.5',
  P360_TABLE_TEXT,
  'min-w-0 max-w-full whitespace-nowrap text-ellipsis overflow-x-hidden'
);

/** Tighter body cells (e.g. visualize chart detail patient list). */
export const P360_TABLE_BODY_ROW_INNER = cn(
  'flex min-h-7 items-center',
  P360_TABLE_PAD,
  'py-1',
  P360_TABLE_TEXT,
  'min-w-0 max-w-full whitespace-nowrap text-ellipsis overflow-x-hidden'
);

export const p360ToolbarRowClass = (extra) =>
  cn(
    'flex min-h-10 items-center gap-2 py-2 overflow-x-auto no-scrollbar',
    P360_TOOLBAR_PAD,
    extra
  );

export const p360ControlClass = cn(
  APP_NAV_ROW,
  APP_NAV_TEXT,
  'rounded-none border border-border/80 bg-background px-3 shadow-none',
  'placeholder:text-muted-foreground/70 focus-visible:border-primary/40 focus-visible:ring-1 focus-visible:ring-primary/25'
);

export const p360CardClass =
  'w-full rounded-none border-0 py-0 shadow-none gap-0 overflow-hidden ring-0';

export const p360AccentBarClass = 'h-0.5 w-full shrink-0 bg-primary/75';

/** Data Visualize — same flat P360 surface as list/detail */
export const vizKpiCardClass =
  'flex min-h-8 flex-col justify-center border border-border/80 bg-muted/15 px-3 py-2';

export const vizSectionHeaderClass = cn(
  P360_TABLE_ROW_INNER,
  'shrink-0 bg-muted/25 font-medium text-foreground'
);

export const vizChartBodyClass = cn(P360_TABLE_PAD, 'flex min-h-0 flex-1 flex-col pt-2 pb-1');

export const vizChartPlotClass = 'min-h-48 w-full min-h-0 flex-1 basis-0 pb-2';

export const vizEmptyStateClass = cn(
  'flex min-h-48 items-center justify-center text-muted-foreground',
  P360_TABLE_TEXT
);

export const vizTooltipClass = cn(
  'border border-border/80 bg-popover px-3 py-2 shadow-none',
  P360_TABLE_TEXT
);

export const vizDeltaUpClass = 'text-[11px] font-medium tabular-nums text-emerald-800 dark:text-emerald-400';
export const vizDeltaDownClass = 'text-[11px] font-medium tabular-nums text-destructive';
export const vizDeltaMutedClass = 'text-[11px] font-medium tabular-nums text-muted-foreground';
