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
  compactBodyRows = false,
  density = 'normal',
  fontSize = 'normal',
  fixRowHeaders = false
}) {
  const bodyRowH = density === 'compact'
    ? 'h-7 min-h-7'
    : density === 'comfortable'
      ? 'h-10 min-h-10'
      : 'h-8 min-h-8';

  const bodyRowInner = density === 'compact'
    ? P360_TABLE_BODY_ROW_INNER
    : density === 'comfortable'
      ? cn(P360_TABLE_ROW_INNER, 'min-h-10 py-2.5')
      : P360_TABLE_ROW_INNER;

  const tableMinWidth = sizedColumns.reduce((sum, col) => sum + col._w, 0);
  const textSizeClass = fontSize === 'small' ? 'text-[10px]' : fontSize === 'large' ? 'text-[12px]' : 'text-[11px]';

  return (
    <table
      className={cn("border-collapse table-fixed", textSizeClass)}
      style={{ width: tableMinWidth, minWidth: '100%' }}
    >
      <colgroup>
        {sizedColumns.map((col) => (
          <col key={col.id} style={{ width: col._w }} />
        ))}
      </colgroup>
      <thead>
        <tr className="border-0 border-b border-border/20 bg-muted/50">
          {sizedColumns.map((col, colIndex) => {
            const sortable = Boolean(onSortColumn);
            const active = sortable && sortKey === col.id;
            const inner = (
              <>
                <span className="truncate">{col.label}</span>
                {sortable ? <SortIndicator active={active} direction={sortDirection} /> : null}
              </>
            );
            const isFirstCol = colIndex === 0;
            const isStickyLeft = fixRowHeaders && isFirstCol;
            return (
              <th
                key={col.id}
                scope="col"
                title={col.label}
                className={cn(
                  'h-8 min-h-8 p-0 align-middle font-semibold text-muted-foreground uppercase tracking-wider text-[10px] border-0',
                  col.align === 'right' ? 'text-right' : 'text-left',
                  stickyHeader &&
                    (scrollBody
                      ? 'sticky top-0 z-20 border-0 border-b border-border/20 bg-muted/95 backdrop-blur-md'
                      : 'sticky top-0 z-10 border-0 bg-muted/95 backdrop-blur-md'),
                  isStickyLeft && 'sticky left-0 border-r border-r-border/30 bg-muted/95 shadow-[1px_0_3px_rgba(0,0,0,0.04)]',
                  stickyHeader && isStickyLeft && 'z-30',
                  col.headerClassName
                )}
                style={isStickyLeft ? { left: 0 } : undefined}
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
                      'h-8 min-h-8 w-full cursor-pointer select-none border-0 bg-transparent p-0 font-semibold text-muted-foreground uppercase tracking-wider text-[10px]',
                      'hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
                      active && 'text-foreground font-bold'
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
          const clickable = Boolean(onRowClick) && !row.isTotal;
          return (
            <tr
              key={key}
              className={cn(
                bodyRowH,
                'border-0 border-b border-border/20',
                row.isTotal && 'font-semibold bg-muted/15 border-t border-t-border/30 border-b-2 border-b-double border-b-border/30',
                clickable && 'cursor-pointer group hover:bg-muted/20 transition-colors duration-150'
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
              {sizedColumns.map((col, colIndex) => {
                const raw = col.getValue ? col.getValue(row) : row[col.id];
                const text = raw == null || raw === '' ? '—' : String(raw);
                const content = col.renderCell ? (
                  col.renderCell(row, text)
                ) : (
                  <span
                    className={cn(
                      bodyRowInner,
                      col.mono && 'font-mono tabular-nums',
                      col.align === 'right' && 'justify-end',
                      row.isTotal && 'font-bold text-foreground'
                    )}
                  >
                    {text}
                  </span>
                );
                const isFirstCol = colIndex === 0;
                const isStickyLeft = fixRowHeaders && isFirstCol;
                return (
                  <td
                    key={col.id}
                    title={typeof text === 'string' ? text : undefined}
                    className={cn(
                      bodyRowH,
                      'p-0 align-middle border-0 bg-card',
                      isStickyLeft && cn(
                        'sticky left-0 border-r border-r-border/30 shadow-[1px_0_3px_rgba(0,0,0,0.04)]',
                        row.isTotal ? 'bg-muted/15 z-20' : 'bg-card z-10 group-hover:bg-muted/20 transition-colors duration-150'
                      ),
                      col.cellClassName
                    )}
                    style={isStickyLeft ? { left: 0 } : undefined}
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
  compactBodyRows = false,
  density = 'normal',
  fontSize = 'normal',
  fixRowHeaders = false
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
            density={density}
            fontSize={fontSize}
            fixRowHeaders={fixRowHeaders}
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
        density={density}
        fontSize={fontSize}
        fixRowHeaders={fixRowHeaders}
      />
    </div>
  );
}
