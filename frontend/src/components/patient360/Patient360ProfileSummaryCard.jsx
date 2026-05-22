import { cn } from '@/lib/utils';
import { p360CardClass, P360_TABLE_PAD, P360_TABLE_TEXT } from '../layout/appNavStyles';
import { P360_KH } from '../../pages/patient360Kh';

function FactCell({ label, value }) {
  if (value == null || value === '') return null;
  const text = String(value);
  return (
    <div className={cn('min-w-0 bg-card px-4 py-2')}>
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

/** Slim alert card for non-overview tabs */
export function Patient360AlertBanner({ alerts, className }) {
  if (!alerts?.length) return null;
  return (
    <div className={cn(p360CardClass, 'overflow-hidden', className)}>
      <div className="space-y-1.5 bg-amber-50/90">
        {alerts.map((a, i) => (
          <p key={i} className={cn('min-h-8 flex items-center py-1.5', P360_TABLE_PAD, P360_TABLE_TEXT, 'text-amber-950')}>
            {a.text}
          </p>
        ))}
      </div>
    </div>
  );
}

/**
 * Overview summary: clinical alerts + registration fields in one card grid.
 */
export default function Patient360ProfileSummaryCard({
  alerts = [],
  registration,
  fieldDictionary,
  overviewKeys,
  skipKeys,
  formatValue
}) {
  const items = [];
  if (registration) {
    for (const key of overviewKeys) {
      if (skipKeys.has(key)) continue;
      const v = registration[key];
      if (v == null || v === '') continue;
      items.push([
        key,
        formatValue(registration, key, fieldDictionary),
        fieldDictionary?.fieldLabels?.[key] || key
      ]);
    }
  }

  if (!alerts.length && !items.length) return null;

  return (
    <div className={cn(p360CardClass, 'overflow-hidden shadow-sm')}>
      {alerts.length ? (
        <div className="border-b border-amber-200/90 bg-amber-50/90">
          {alerts.map((a, i) => (
            <p
              key={i}
              className={cn('min-h-8 flex items-center py-1.5', P360_TABLE_PAD, P360_TABLE_TEXT, 'text-amber-950')}
            >
              {a.text}
            </p>
          ))}
        </div>
      ) : null}

      {items.length ? (
        <>
          <div
            className={cn(
              'flex min-h-8 items-center border-b border-border/80 bg-muted/30 font-medium text-foreground/90',
              P360_TABLE_PAD,
              P360_TABLE_TEXT
            )}
          >
            {P360_KH.blocks.reg}
          </div>
          <div className="grid grid-cols-1 gap-px bg-border/70 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map(([key, val, label]) => (
              <FactCell key={key} label={label} value={val} />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
