import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

const NAV_SELECTOR = 'nav[data-p360-rows]';

/**
 * lockViewport (list): full-height panel below app top bar; only inner table scrolls.
 * default (detail): fixed sub-nav + measured padding on content.
 */
export default function Patient360Layout({ toolbar, children, className, lockViewport = false }) {
  const wrapRef = useRef(null);
  const [toolbarPad, setToolbarPad] = useState(0);

  useLayoutEffect(() => {
    if (lockViewport) return undefined;

    const measure = () => {
      const el = wrapRef.current?.querySelector(NAV_SELECTOR);
      const h = el ? Math.ceil(el.getBoundingClientRect().height) : 0;
      setToolbarPad(h);
      if (h > 0) {
        document.documentElement.style.setProperty('--p360-toolbar-h', `${h}px`);
      }
    };

    measure();
    const ro = new ResizeObserver(measure);
    const el = wrapRef.current?.querySelector(NAV_SELECTOR);
    if (el) ro.observe(el);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [toolbar, lockViewport]);

  useEffect(() => {
    if (!lockViewport) return undefined;
    const prevHtml = document.documentElement.style.overflow;
    const prevBody = document.body.style.overflow;
    const prevHtmlX = document.documentElement.style.overflowX;
    const prevBodyX = document.body.style.overflowX;
    document.documentElement.style.overflow = 'hidden';
    document.documentElement.style.overflowX = 'hidden';
    document.body.style.overflow = 'hidden';
    document.body.style.overflowX = 'hidden';
    window.scrollTo(0, 0);
    document.documentElement.scrollLeft = 0;
    document.body.scrollLeft = 0;
    return () => {
      document.documentElement.style.overflow = prevHtml;
      document.documentElement.style.overflowX = prevHtmlX;
      document.body.style.overflow = prevBody;
      document.body.style.overflowX = prevBodyX;
    };
  }, [lockViewport]);

  if (lockViewport) {
    return (
      <div
        className={cn(
          'fixed bottom-0 left-0 right-0 z-30 flex min-h-0 flex-col overflow-x-hidden overflow-y-hidden bg-card',
          className
        )}
        style={{
          top: 'calc(var(--app-topbar-h) + var(--p360-toolbar-h, 4.5rem))',
          left: 'var(--sidebar-w, 0px)'
        }}
      >
        {children}
      </div>
    );
  }

  return (
    <div className="-mx-3 flex flex-col sm:-mx-5 xl:-mx-6">
      {toolbar ? <div ref={wrapRef}>{toolbar}</div> : null}
      <div
        className={cn('flex flex-col', className)}
        style={{
          paddingTop: toolbarPad > 0 ? toolbarPad : 'calc(var(--p360-row-h) * 3)'
        }}
      >
        {children}
      </div>
    </div>
  );
}
