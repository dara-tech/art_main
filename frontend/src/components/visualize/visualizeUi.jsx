import { cn } from '@/lib/utils';
import {
  APP_NAV_TEXT,
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

export function VizTooltipBox({ title, children, typography }) {
  const titleStyle = typography
    ? { fontSize: typography.fontSize, fontWeight: typography.fontWeight }
    : undefined;
  const bodyStyle = typography ? { fontSize: typography.fontSize } : undefined;
  return (
    <div className={vizTooltipClass} style={bodyStyle}>
      {title ? (
        <p className="mb-1 text-foreground" style={titleStyle}>
          {title}
        </p>
      ) : null}
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

/** All period labels aligned under bar groups (reliable vs SVG axis ticks). */
export function VizPeriodAxis({
  rows = [],
  xDataKey = 'period',
  yAxisWidth = 52,
  title,
  dense = false,
  typography
}) {
  if (!rows.length) return null;
  const fontSize = dense && typography ? typography.periodDenseSize : typography?.fontSize;
  const labelStyle = typography
    ? {
        fontSize: fontSize ?? typography.fontSize,
        fontWeight: typography.fontWeight,
        color: typography.fill
      }
    : undefined;
  const titleStyle = typography
    ? { fontSize: typography.fontSize, fontWeight: typography.fontWeight }
    : undefined;
  return (
    <div
      className="shrink-0 border-t border-border/70 bg-card pr-3 pt-2 pb-2"
      style={{ paddingLeft: yAxisWidth }}
    >
      <div
        className="grid w-full gap-1"
        style={{ gridTemplateColumns: `repeat(${rows.length}, minmax(0, 1fr))` }}
      >
        {rows.map((row, i) => {
          const text = String(row[xDataKey] ?? row.period ?? row.xLabel ?? '').trim();
          if (!text) return <div key={`empty-${i}`} />;
          return (
            <div
              key={row.periodKey || `${text}-${i}`}
              className={cn('px-0.5 text-center leading-snug', !typography && P360_TABLE_TEXT, dense && !typography && 'text-[10px]', !dense && !typography && 'text-[11px] font-medium text-[#73695c]')}
              style={labelStyle}
              title={text}
            >
              <span className={dense ? 'line-clamp-2 break-words' : 'block truncate'}>{text}</span>
            </div>
          );
        })}
      </div>
      {title ? (
        <p
          className={cn('mt-1.5 text-center text-muted-foreground', !typography && APP_NAV_TEXT, typography && 'font-semibold')}
          style={titleStyle}
        >
          {title}
        </p>
      ) : null}
    </div>
  );
}

/** Flat legend row — no border-top (P360 style). */
export function VizLegend({ items = [], typography, scrollable = false, activeKeys, onToggle }) {
  if (!items.length) return null;
  const textStyle = typography
    ? { fontSize: typography.fontSize, fontWeight: typography.fontWeight }
    : undefined;
  return (
    <ul
      className={cn(
        'mx-auto w-full shrink-0 list-none border-0 px-2 pb-2 pt-3',
        scrollable
          ? 'max-h-48 overflow-y-auto overscroll-contain [scrollbar-gutter:stable] sm:max-h-56'
          : 'flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5',
        scrollable && 'grid grid-cols-1 gap-0.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
        !typography && P360_TABLE_TEXT
      )}
      style={textStyle}
      aria-label="legend"
    >
      {items.map((item) => {
        const isHidden = activeKeys && !activeKeys.has(item.key);
        return (
          <li
            key={item.key}
            className={cn(
              'inline-flex min-w-0 items-center gap-1.5 text-muted-foreground select-none',
              scrollable && 'py-0.5',
              onToggle && 'cursor-pointer hover:text-foreground transition-opacity duration-150',
              isHidden && 'opacity-35 line-through'
            )}
            onClick={onToggle ? () => onToggle(item.key) : undefined}
          >
            {item.dashed ? (
              <span
                className="w-4 h-0.5 shrink-0 border-t-2 border-dashed"
                style={{ borderColor: item.color }}
                aria-hidden
              />
            ) : (
              <span
                className="size-2.5 shrink-0 border border-border/60"
                style={{ backgroundColor: item.color }}
                aria-hidden
              />
            )}
            <span className={cn('text-foreground', scrollable && 'truncate')} title={item.label}>
              {item.label}
            </span>
          </li>
        );
      })}
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
