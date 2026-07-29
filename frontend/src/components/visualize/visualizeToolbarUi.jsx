import { useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { APP_NAV_ICON, APP_NAV_MUTED, APP_NAV_TEXT, appNavItemClass, p360ControlClass } from '../layout/appNavStyles';

const VIZ_SELECT_ITEM =
  'rounded-none px-2 py-1.5 text-[11px] data-[selected]:bg-primary data-[selected]:text-primary-foreground';

/** Toolbar control — icon-first; label in tooltip + sr-only unless showLabel. */
export function VizToolbarBtn({
  icon: Icon,
  label,
  shortLabel,
  showLabel = false,
  iconClassName,
  active = false,
  disabled = false,
  onClick,
  title,
  className,
  children,
  'aria-pressed': ariaPressed,
  'aria-expanded': ariaExpanded
}) {
  const tip = title || (typeof label === 'string' ? label : undefined);
  const IconComp = typeof Icon === 'function' || (typeof Icon === 'object' && Icon !== null) ? Icon : null;
  const iconOnly = Boolean(IconComp) && !showLabel;

  const labelNode = label ? (
    iconOnly ? (
      <span className="sr-only">{label}</span>
    ) : shortLabel ? (
      <>
        <span className="hidden md:inline">{label}</span>
        <span className="md:hidden">{shortLabel}</span>
      </>
    ) : (
      <span>{label}</span>
    )
  ) : null;

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      title={tip}
      aria-label={iconOnly ? tip : undefined}
      aria-pressed={ariaPressed}
      aria-expanded={ariaExpanded}
      className={cn(appNavItemClass(active, disabled), iconOnly && 'px-2', className)}
    >
      {IconComp ? (
        <IconComp
          className={cn(
            APP_NAV_ICON,
            iconClassName || (active ? 'text-primary' : 'text-muted-foreground')
          )}
          aria-hidden
        />
      ) : null}
      {children}
      {labelNode}
    </button>
  );
}

/** Icon + label + shadcn Select (chart type, etc.). */
export function VizToolbarSelect({
  icon: Icon,
  label,
  value,
  onValueChange,
  disabled,
  title,
  className,
  iconClassName,
  options = []
}) {
  return (
    <div
      className={cn(
        'inline-flex shrink-0 items-center gap-1 rounded-none border border-border/80 bg-background px-2',
        APP_NAV_TEXT,
        'h-8 min-h-8',
        disabled && 'opacity-40',
        className
      )}
      title={title || label}
    >
      {Icon ? (
        <Icon className={cn(APP_NAV_ICON, iconClassName || 'text-violet-600 dark:text-violet-400')} aria-hidden />
      ) : null}
      {label ? <span className="sr-only">{label}</span> : null}
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger
          className={cn(
            p360ControlClass,
            'h-7 min-h-7 w-auto min-w-[6.5rem] max-w-[12rem] rounded-none border-0 bg-transparent px-1 shadow-none focus-visible:ring-0',
            APP_NAV_TEXT,
            'data-[size=default]:h-7'
          )}
          aria-label={title || label}
        >
          <SelectValue placeholder={label} />
        </SelectTrigger>
        <SelectContent className="rounded-none p-1" align="start">
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value} className={VIZ_SELECT_ITEM}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

/** Fixed popover below toolbar trigger — escapes overflow:hidden on nav rows. */
export function ToolbarAnchoredPanel({
  open,
  anchorRef,
  panelRef,
  children,
  className,
  align = 'end',
  width = 352
}) {
  const [pos, setPos] = useState(null);
  const innerRef = useRef(null);
  const setPanelRef = (node) => {
    innerRef.current = node;
    if (typeof panelRef === 'function') panelRef(node);
    else if (panelRef) panelRef.current = node;
  };

  useLayoutEffect(() => {
    if (!open || !anchorRef?.current) {
      setPos(null);
      return undefined;
    }

    const update = () => {
      const anchor = anchorRef.current?.getBoundingClientRect();
      if (!anchor) return;
      const panelW = innerRef.current?.offsetWidth || width;
      const panelH = innerRef.current?.offsetHeight || 280;
      const margin = 8;
      let left = align === 'end' ? anchor.right - panelW : anchor.left;
      left = Math.max(margin, Math.min(left, window.innerWidth - panelW - margin));
      let top = anchor.bottom + 4;
      if (top + panelH > window.innerHeight - margin) {
        top = Math.max(margin, anchor.top - panelH - 4);
      }
      setPos({ top, left });
    };

    update();
    const ro = new ResizeObserver(update);
    if (innerRef.current) ro.observe(innerRef.current);
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [open, align, width, anchorRef]);

  if (!open || !pos) return null;

  return createPortal(
    <div
      ref={setPanelRef}
      className={className}
      style={{ position: 'fixed', top: pos.top, left: pos.left, zIndex: 200, width }}
    >
      {children}
    </div>,
    document.body
  );
}
