import { cn } from '@/lib/utils';
import {
  P360_TABLE_PAD,
  P360_TABLE_TEXT,
  vizChartBodyClass,
  vizChartPlotClass,
  vizDeltaDownClass,
  vizDeltaMutedClass,
  vizDeltaUpClass,
  vizEmptyStateClass,
  vizKpiCardClass,
  vizSectionHeaderClass,
  vizTooltipClass
} from '../layout/appNavStyles';
import { VIZ_KH } from '../../pages/visualizeKh';

export function VizEmpty({ children }) {
  return <p className={vizEmptyStateClass}>{children}</p>;
}

export function VizTooltipBox({ title, children }) {
  return (
    <div className={vizTooltipClass}>
      {title ? <p className="mb-1 font-medium text-foreground">{title}</p> : null}
      {children}
    </div>
  );
}

export function VizSectionHeader({ children, className }) {
  return <h3 className={cn(vizSectionHeaderClass, className)}>{children}</h3>;
}

export function VizChartShell({ title, legend, children, className }) {
  return (
    <div className={cn('flex min-h-0 flex-1 flex-col overflow-hidden bg-background', className)}>
      {title ? <VizSectionHeader>{title}</VizSectionHeader> : null}
      <div className={vizChartBodyClass}>
        {children}
        {legend ? <div className="shrink-0">{legend}</div> : null}
      </div>
    </div>
  );
}

/** Fills remaining panel height (parent must be flex column with flex-1). */
export function VizChartPlot({ children, className }) {
  return <div className={cn(vizChartPlotClass, className)}>{children}</div>;
}

/** Flat legend row — no border-top (P360 style). */
export function VizLegend({ items = [] }) {
  if (!items.length) return null;
  return (
    <ul
      className={cn(
        'mx-auto flex w-full shrink-0 list-none flex-wrap items-center justify-center gap-x-4 gap-y-1.5 border-0 px-2 pb-2 pt-3',
        P360_TABLE_TEXT
      )}
      aria-label="legend"
    >
      {items.map((item) => (
        <li key={item.key} className="inline-flex items-center gap-1.5 text-muted-foreground">
          <span
            className="size-2.5 shrink-0 border border-border/60"
            style={{ backgroundColor: item.color }}
            aria-hidden
          />
          <span className="text-foreground">{item.label}</span>
        </li>
      ))}
    </ul>
  );
}

export function VizKpiGrid({ kpis }) {
  if (!kpis?.length) return null;
  return (
    <div
      className={cn(
        'grid shrink-0 gap-2 sm:grid-cols-2 lg:grid-cols-4',
        P360_TABLE_PAD,
        'py-2'
      )}
    >
      {kpis.map((k) => (
        <div key={k.periodKey} className={vizKpiCardClass}>
          <p className={cn('text-muted-foreground', P360_TABLE_TEXT)}>{k.period}</p>
          <p className="text-base font-semibold tabular-nums leading-tight text-foreground">{k.value}</p>
          {k.delta != null ? (
            <p
              className={
                k.delta > 0 ? vizDeltaUpClass : k.delta < 0 ? vizDeltaDownClass : vizDeltaMutedClass
              }
            >
              {k.delta > 0 ? '▲' : k.delta < 0 ? '▼' : '—'} {k.deltaLabel}
              {k.pct != null ? ` (${k.pct > 0 ? '+' : ''}${k.pct}%)` : ''}
            </p>
          ) : (
            <p className={vizDeltaMutedClass}>{VIZ_KH.chartBaseline}</p>
          )}
        </div>
      ))}
    </div>
  );
}
