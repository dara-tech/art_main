import { forwardRef, useLayoutEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { p360FixedShellClass, p360ToolbarRowClass } from '../layout/appNavStyles';

function mergeRefs(...refs) {
  return (node) => {
    refs.forEach((r) => {
      if (!r) return;
      if (typeof r === 'function') r(node);
      else r.current = node;
    });
  };
}

/** Sticks under AppNavActions; sets --p360-toolbar-h for content offset */
export const Patient360NavBar = forwardRef(function Patient360NavBar(
  { ariaLabel, rowCount, children, className },
  forwardedRef
) {
  const navRef = useRef(null);

  useLayoutEffect(() => {
    const el = navRef.current;
    if (!el) return undefined;

    const measure = () => {
      const h = Math.ceil(el.getBoundingClientRect().height);
      if (h > 0) {
        document.documentElement.style.setProperty('--p360-toolbar-h', `${h}px`);
      }
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [rowCount]);

  return (
    <nav
      ref={mergeRefs(navRef, forwardedRef)}
      className={cn(p360FixedShellClass, className)}
      style={{
        top: 'var(--app-topbar-h)',
        left: 'var(--sidebar-w, 0px)'
      }}
      aria-label={ariaLabel}
      data-p360-rows={rowCount}
      data-p360-variant="fixed"
    >
      {children}
    </nav>
  );
});

/** One toolbar row (h-8). tone: default | filters | muted | tabs | plain */
export function Patient360NavRow({ tone = 'default', className, children }) {
  const toneClass =
    tone === 'filters'
      ? 'border-b border-border/80 bg-muted/15'
      : tone === 'plain'
        ? 'border-0 bg-card/95'
        : tone === 'tabs'
          ? 'border-b border-border/80 bg-card/95'
          : 'border-b border-border/80 bg-card/95';

  return <div className={p360ToolbarRowClass(cn(toneClass, className))}>{children}</div>;
}
