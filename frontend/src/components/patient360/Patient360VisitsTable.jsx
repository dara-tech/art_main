import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { P360_KH } from '../../pages/patient360Kh';
import Patient360DataTable from './Patient360DataTable';
import { buildVisitTableColumns } from './patient360VisitColumns';

export default function Patient360VisitsTable({
  visits = [],
  programFilter = '',
  sortKey = null,
  sortDirection = 'asc',
  onSortColumn,
  emptyMessage = 'មិនមានទិន្នន័យ (No Data)',
  onOpenVisit,
  scrollBody = true,
  fillHeight = false
}) {
  const columns = useMemo(
    () => buildVisitTableColumns(programFilter),
    [programFilter]
  );

  return (
    <Patient360DataTable
      columns={columns}
      rows={visits}
      sortKey={sortKey}
      sortDirection={sortDirection}
      onSortColumn={onSortColumn}
      emptyMessage={emptyMessage}
      getRowKey={(row) => `${row.program}-${row.clinicId}-${row.vid}`}
      onRowClick={onOpenVisit}
      scrollBody={scrollBody}
      fillHeight={fillHeight}
      className={cn(
        scrollBody && fillHeight && 'min-h-0 flex-1',
        !visits.length && !scrollBody && 'min-h-[12rem]'
      )}
    />
  );
}
