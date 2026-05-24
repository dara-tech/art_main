import { useLayoutEffect, useMemo, useRef } from 'react';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { P360_KH } from '../../pages/patient360Kh';
import {
  P360_TABLE_BODY_ROW_INNER,
  P360_TABLE_PAD,
  P360_TABLE_ROW_INNER,
  P360_TABLE_TEXT
} from '../layout/appNavStyles';

function resolveWidth(col) {
  const w = col.width ?? col.minWidth ?? 80;
  return typeof w === 'number' ? w : parseInt(String(w), 10) || 80;
}

function SortIndicator({ active, direction }) {
  if (!active) return null;
  const Icon = direction === 'asc' ? ArrowUp : ArrowDown;
  return <Icon className="ml-1 h-3 w-3 shrink-0 text-muted-foreground" aria-hidden />;
}

function TableContent({
  sizedColumns,
  rows,
  getRowKey,
  onRowClick,
  emptyMessage,
  stickyHeader,
  scrollBody,
  sortKey,
  sortDirection,
  onSortColumn,
  compactBodyRows = false
}) {
  const bodyRowInner = compactBodyRows ? P360_TABLE_BODY_ROW_INNER : P360_TABLE_ROW_INNER;
  const bodyRowH = compactBodyRows ? 'h-7 min-h-7' : 'h-8 min-h-8';
  const tableMinWidth = sizedColumns.reduce((sum, col) => sum + col._w, 0);

  return (
    <table
      className="border-collapse text-[11px] table-fixed"
      style={{ width: tableMinWidth, minWidth: '100%' }}
    >
      <colgroup>
        {sizedColumns.map((col) => (
          <col key={col.id} style={{ width: col._w }} />
        ))}
      </colgroup>
      <thead>
        <tr className="border-0 border-b border-border/80 bg-muted">
          {sizedColumns.map((col) => {
            const sortable = Boolean(onSortColumn);
            const active = sortable && sortKey === col.id;
            const inner = (
              <>
                <span className="truncate">{col.label}</span>
                {sortable ? <SortIndicator active={active} direction={sortDirection} /> : null}
              </>
            );
            return (
              <th
                key={col.id}
                scope="col"
                title={col.label}
                className={cn(
                  'h-8 min-h-8 p-0 align-middle font-medium text-foreground border-0',
                  col.align === 'right' ? 'text-right' : 'text-left',
                  stickyHeader &&
                    (scrollBody
                      ? 'sticky top-0 z-20 border-0 border-b border-border/80 bg-muted'
                      : 'sticky top-0 z-10 border-0 bg-muted/95 backdrop-blur-sm'),
                  col.headerClassName
                )}
              >
                {sortable ? (
                  <button
                    type="button"
                    onClick={() => onSortColumn(col.id)}
                    title={
                      active
                        ? sortDirection === 'asc'
                          ? P360_KH.listHeaders.sortAsc
                          : P360_KH.listHeaders.sortDesc
                        : col.label
                    }
                    aria-sort={active ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
                    className={cn(
                      'h-8 min-h-8 w-full cursor-pointer select-none border-0 bg-transparent p-0 font-medium text-foreground',
                      'hover:text-foreground/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
                      active && 'text-foreground'
                    )}
                  >
                    <span className={cn(P360_TABLE_ROW_INNER, col.align === 'right' && 'justify-end')}>
                      {inner}
                    </span>
                  </button>
                ) : (
                  <span className={cn(P360_TABLE_ROW_INNER, col.align === 'right' && 'justify-end')}>
                    {inner}
                  </span>
                )}
              </th>
            );
          })}
        </tr>
      </thead>
      <tbody>
        {!rows.length ? (
          <tr>
            <td colSpan={sizedColumns.length} className="p-0">
              <span
                className={cn(
                  'flex min-h-8 items-center justify-center py-12',
                  P360_TABLE_PAD,
                  P360_TABLE_TEXT,
                  'text-muted-foreground'
                )}
              >
              {emptyMessage}
              </span>
            </td>
          </tr>
        ) : null}
        {rows.map((row, idx) => {
          const key = getRowKey ? getRowKey(row, idx) : idx;
          const clickable = Boolean(onRowClick);
          return (
            <tr
              key={key}
              className={cn(
                bodyRowH,
                'border-0 border-b border-border/40',
                clickable && 'cursor-pointer hover:bg-muted/40'
              )}
              onClick={
                clickable
                  ? (e) => {
                      e.stopPropagation();
                      onRowClick(row);
                    }
                  : undefined
              }
            >
              {sizedColumns.map((col) => {
                const raw = col.getValue ? col.getValue(row) : row[col.id];
                const text = raw == null || raw === '' ? '—' : String(raw);
                const content = col.renderCell ? (
                  col.renderCell(row, text)
                ) : (
                  <span
                    className={cn(
                      bodyRowInner,
                      col.mono && 'font-mono tabular-nums',
                      col.align === 'right' && 'justify-end'
                    )}
                  >
                    {text}
                  </span>
                );
                return (
                  <td
                    key={col.id}
                    title={typeof text === 'string' ? text : undefined}
                    className={cn(bodyRowH, 'p-0 align-middle border-0', col.cellClassName)}
                  >
                    {content}
                  </td>
                );
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

/**
 * Data table with colgroup widths — headers do not overlap.
 * scrollBody: vertical scroll inside table only (header sticks to top of scroll area).
 */
export default function Patient360DataTable({
  columns,
  rows = [],
  getRowKey,
  onRowClick,
  emptyMessage,
  className,
  stickyHeader = true,
  scrollBody = false,
  /** List lockViewport: grow scroll area to fill parent (no 58vh cap). */
  fillHeight = false,
  maxHeight,
  sortKey,
  sortDirection,
  onSortColumn,
  compactBodyRows = false
}) {
  const sizedColumns = useMemo(
    () =>
      (columns || []).map((col) => ({
        ...col,
        _w: resolveWidth(col)
      })),
    [columns]
  );

  const scrollRef = useRef(null);

  useLayoutEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollLeft = 0;
  }, [columns, rows, scrollBody]);

  if (!sizedColumns.length) return null;

  if (scrollBody) {
    return (
      <div
        className={cn(
          'flex min-h-0 min-w-0 w-full max-w-full flex-1 flex-col overflow-hidden border-0 border-b border-border/80',
          className
        )}
      >
        <div
          ref={scrollRef}
          className={cn(
            'min-w-0 w-full max-w-full overflow-auto overscroll-contain [scrollbar-gutter:stable]',
            maxHeight ||
              (fillHeight
                ? 'min-h-0 flex-1'
                : 'min-h-0 max-h-[min(58vh,calc(100dvh-14rem))] flex-1')
          )}
        >
          <TableContent
            sizedColumns={sizedColumns}
            rows={rows}
            getRowKey={getRowKey}
            onRowClick={onRowClick}
            emptyMessage={emptyMessage}
            stickyHeader={stickyHeader}
            scrollBody
            sortKey={sortKey}
            sortDirection={sortDirection}
            onSortColumn={onSortColumn}
            compactBodyRows={compactBodyRows}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'min-w-0 w-full max-w-full overflow-x-auto border-0 border-b border-border/80',
        className
      )}
    >
      <TableContent
        sizedColumns={sizedColumns}
        rows={rows}
        getRowKey={getRowKey}
        onRowClick={onRowClick}
        emptyMessage={emptyMessage}
        stickyHeader={stickyHeader}
        scrollBody={false}
        sortKey={sortKey}
        sortDirection={sortDirection}
        onSortColumn={onSortColumn}
        compactBodyRows={compactBodyRows}
      />
    </div>
  );
}
