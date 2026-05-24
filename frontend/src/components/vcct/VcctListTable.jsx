import Patient360DataTable from '../patient360/Patient360DataTable';
import { P360_KH } from '../../pages/patient360Kh';
import { VCCT_KH } from '../../pages/vcctKh';
import { cn } from '@/lib/utils';

const columns = [
  {
    id: 'vcctId',
    label: VCCT_KH.columns.vcctId,
    width: 88,
    mono: true,
    getValue: (r) => r.vcctId
  },
  {
    id: 'registrationDate',
    label: VCCT_KH.columns.registrationDate,
    width: 108,
    getValue: (r) => r.registrationDate
  },
  { id: 'sex', label: VCCT_KH.columns.sex, width: 72, getValue: (r) => r.sexLabel ?? r.sex },
  { id: 'dob', label: VCCT_KH.columns.dob, width: 108, getValue: (r) => r.dob },
  {
    id: 'hiv',
    label: VCCT_KH.columns.hivResult,
    width: 120,
    getValue: (r) => r.hivResultLabel ?? r.hivResult
  },
  { id: 'pmrs', label: VCCT_KH.columns.pmrs, width: 120, getValue: (r) => r.pmrsCode },
  { id: 'hts', label: VCCT_KH.columns.hts, width: 120, getValue: (r) => r.htsCode },
  { id: 'uuic', label: VCCT_KH.columns.uuic, width: 120, mono: true, getValue: (r) => r.uuic }
];

export default function VcctListTable({
  patients = [],
  emptyMessage = VCCT_KH.list.empty,
  onOpenPatient,
  scrollBody = true,
  fillHeight = false
}) {
  return (
    <Patient360DataTable
      columns={columns}
      rows={patients}
      emptyMessage={emptyMessage}
      getRowKey={(row) => `${row.siteCode}-${row.vcctId}`}
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
