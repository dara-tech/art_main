import { RiCloseLine } from '@remixicon/react';
import { cn } from '@/lib/utils';
import { P360_TABLE_TEXT, p360ControlClass } from '../layout/appNavStyles';

export default function AdminModalShell({
  title,
  description,
  onClose,
  children,
  footer,
  wide = false,
  asForm = false,
  onSubmit
}) {
  const Shell = asForm ? 'form' : 'div';

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4"
      role="presentation"
      onClick={onClose}
    >
      <Shell
        className={cn(
          'flex max-h-[min(88vh,42rem)] w-full flex-col overflow-hidden bg-card shadow-2xl shadow-black/15 border-none rounded-2xl',
          wide ? 'max-w-2xl' : 'max-w-xl'
        )}
        onClick={(e) => e.stopPropagation()}
        onSubmit={asForm ? onSubmit : undefined}
      >
        <div className="flex shrink-0 items-center justify-between gap-3 bg-[#2a1720] border-b border-white/10 px-5 py-3.5 text-white">
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-semibold leading-tight text-white">{title}</h2>
            {description ? (
              <p className={cn('mt-0.5 text-xs leading-snug text-white/70', P360_TABLE_TEXT)}>
                {description}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            className="inline-flex size-7 shrink-0 items-center justify-center rounded-md cursor-pointer text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            onClick={onClose}
            aria-label="Close"
          >
            <RiCloseLine className="size-4.5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>

        {footer ? (
          <div className="flex shrink-0 justify-end gap-2 border-t border-border/80 bg-muted/20 px-5 py-3">
            {footer}
          </div>
        ) : null}
      </Shell>
    </div>
  );
}

export function AdminModalBtn({ children, variant = 'default', className, ...props }) {
  return (
    <button
      type="button"
      className={cn(
        p360ControlClass,
        'h-8 px-3',
        variant === 'primary' && 'border-primary/50 bg-primary/10 text-foreground',
        variant === 'danger' && 'text-destructive',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function AdminModalSection({ title, children, className }) {
  return (
    <section className={cn('space-y-2 border border-border/80 bg-muted/10 p-3', className)}>
      {title ? (
        <p className={cn('font-medium text-muted-foreground', P360_TABLE_TEXT)}>{title}</p>
      ) : null}
      {children}
    </section>
  );
}
