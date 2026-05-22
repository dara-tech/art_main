import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { P360_KH } from '../../pages/patient360Kh';
import Patient360DataTable from './Patient360DataTable';
import { buildListTableColumns } from './patient360ListColumns';

export default function Patient360ListTable({
  patients = [],
  programFilter = '',
  columnOrder = [],
  sortKey = null,
  sortDirection = 'asc',
  onSortColumn,
  emptyMessage = P360_KH.list.empty,
  onOpenPatient,
  scrollBody = true,
  fillHeight = false
}) {
  const columns = useMemo(
    () => buildListTableColumns(programFilter, columnOrder),
    [programFilter, columnOrder]
  );

  return (
    <Patient360DataTable
      columns={columns}
      rows={patients}
      sortKey={sortKey}
      sortDirection={sortDirection}
      onSortColumn={onSortColumn}
      emptyMessage={emptyMessage}
      getRowKey={(row) => `${row.program}-${row.clinicId}`}
      onRowClick={onOpenPatient}
      scrollBody={scrollBody}
      fillHeight={fillHeight}
      className={cn(
        scrollBody && fillHeight && 'min-h-0 flex-1',
        !patients.length && !scrollBody && 'min-h-[12rem]'
      )}
    />
  );
}
