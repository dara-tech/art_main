import { cn } from '@/lib/utils';
import { APP_NAV_ICON, APP_NAV_MUTED, APP_NAV_TEXT, appNavItemClass, p360ControlClass } from '../layout/appNavStyles';

/** Toolbar control: icon + label (consistent with top nav). */
export function VizToolbarBtn({
  icon: Icon,
  label,
  shortLabel,
  active = false,
  disabled = false,
  onClick,
  title,
  className,
  children,
  'aria-pressed': ariaPressed
}) {
  const display = shortLabel ? (
    <>
      <span className="hidden md:inline">{label}</span>
      <span className="md:hidden">{shortLabel}</span>
    </>
  ) : (
    <span>{label}</span>
  );

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      title={title || (typeof label === 'string' ? label : undefined)}
      aria-pressed={ariaPressed}
      className={cn(appNavItemClass(active, disabled), className)}
    >
      {Icon ? <Icon className={APP_NAV_ICON} aria-hidden /> : null}
      {children}
      {display}
    </button>
  );
}

/** Icon + label + native select (chart type, etc.). */
export function VizToolbarSelect({
  icon: Icon,
  label,
  value,
  onChange,
  disabled,
  title,
  className,
  children
}) {
  return (
    <label
      className={cn(
        'inline-flex shrink-0 items-center gap-1 rounded-none border border-border/80 bg-background px-2',
        APP_NAV_TEXT,
        'h-8 min-h-8',
        disabled && 'opacity-40',
        className
      )}
      title={title || label}
    >
      {Icon ? <Icon className={APP_NAV_ICON} aria-hidden /> : null}
      <span className={cn('hidden shrink-0 text-muted-foreground lg:inline', APP_NAV_MUTED)}>{label}</span>
      <select
        value={value}
        disabled={disabled}
        onChange={onChange}
        className={cn(
          p360ControlClass,
          'min-w-0 flex-1 border-0 bg-transparent px-1 py-0 shadow-none focus-visible:ring-0'
        )}
      >
        {children}
      </select>
    </label>
  );
}
