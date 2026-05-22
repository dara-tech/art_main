/**
 * DHIS2-style event analytics metadata: programs (domains) + dimensions (data elements).
 * Users pick a program, then dimensions to group — not 141 raw tables.
 */

const POPULATION_FILTER = [
  { id: 'both', labelKh: 'មនុស្សពេញវ័យ + កុមារ' },
  { id: 'adult', labelKh: 'មនុស្សពេញវ័យ' },
  { id: 'child', labelKh: 'កុមារ' }
];

const INSIGHT_PROGRAMS = [
  {
    id: 'enrollment',
    labelKh: 'ចុះឈ្មោះ (Patient registry)',
    descriptionKh: 'ព័ត៌មានចុះឈ្មោះ — tblaimain / tblcimain',
    tables: ['tblaimain', 'tblcimain'],
    dateFieldKh: 'ថ្ងៃចុះឈ្មោះពិនិត្យលើកដំបូង',
    legacyEventId: 'first_visit',
    dimensions: [
      { id: 'sex', labelKh: 'ភេទ', table: 'patient' },
      { id: 'age_group', labelKh: 'ក្រុមអាយុ', table: 'patient' },
      { id: 'program', labelKh: 'កម្មវិធី', table: 'patient' },
      { id: 'referred', labelKh: 'បញ្ជូនមកពី', table: 'tblaimain' },
      { id: 'education', labelKh: 'កម្រិតអប់រំ', table: 'tblaimain' }
    ]
  },
  {
    id: 'art',
    labelKh: 'ART (ការព្យាបាល ARV)',
    descriptionKh: 'ថ្ងៃចាប់ផ្តើម ARV — tblaart / tblcart',
    tables: ['tblaart', 'tblcart', 'tblaimain', 'tblcimain'],
    dateFieldKh: 'ថ្ងៃចាប់ផ្តើម ARV (DaArt)',
    legacyEventId: 'art_start',
    dimensions: [
      { id: 'sex', labelKh: 'ភេទ', table: 'patient' },
      { id: 'age_group', labelKh: 'ក្រុមអាយុ', table: 'patient' },
      { id: 'program', labelKh: 'កម្មវិធី', table: 'patient' }
    ]
  },
  {
    id: 'visit',
    labelKh: 'Visit (មកពិនិត្យ)',
    descriptionKh: 'ការមកពិនិត្យ — tblavmain / tblcvmain',
    tables: ['tblavmain', 'tblcvmain', 'tblaimain', 'tblcimain'],
    dateFieldKh: 'ថ្ងៃ visit (DatVisit)',
    legacyEventId: 'clinical_visit',
    dimensions: [
      { id: 'sex', labelKh: 'ភេទ', table: 'patient' },
      { id: 'age_group', labelKh: 'ក្រុមអាយុ', table: 'patient' },
      { id: 'program', labelKh: 'កម្មវិធី', table: 'patient' },
      { id: 'type_visit', labelKh: 'ប្រភេទ visit', table: 'tblavmain' }
    ]
  },
  {
    id: 'lab',
    labelKh: 'មន្ទីរពិសោធន៍ (Lab)',
    descriptionKh: 'តេស្ត — tblpatienttest',
    tables: ['tblpatienttest', 'tblaimain', 'tblcimain'],
    dateFieldKh: 'ថ្ងៃតេស្ត (Dat / DaCollect)',
    legacyEventId: 'vl_test',
    dimensions: [
      { id: 'sex', labelKh: 'ភេទ', table: 'patient' },
      { id: 'age_group', labelKh: 'ក្រុមអាយុ', table: 'patient' },
      { id: 'program', labelKh: 'កម្មវិធី', table: 'patient' },
      { id: 'has_vl', labelKh: 'មានលទ្ធផល VL', table: 'tblpatienttest' }
    ]
  },
  {
    id: 'outcome',
    labelKh: 'លទ្ធផល (Outcome)',
    descriptionKh: 'ស្លាប់ / LTFU / ផ្ទេរចេញ — tblavpatientstatus / tblcvpatientstatus',
    tables: ['tblavpatientstatus', 'tblcvpatientstatus', 'tblaimain', 'tblcimain'],
    dateFieldKh: 'ថ្ងៃកត់ត្រា (Da)',
    legacyEventId: 'exit_dead',
    dimensions: [
      { id: 'sex', labelKh: 'ភេទ', table: 'patient' },
      { id: 'age_group', labelKh: 'ក្រុមអាយុ', table: 'patient' },
      { id: 'program', labelKh: 'កម្មវិធី', table: 'patient' },
      { id: 'outcome_status', labelKh: 'ប្រភេទលទ្ធផល', table: 'status' }
    ]
  }
];

const LEGACY_EVENT_TO_PROGRAM = Object.fromEntries(
  INSIGHT_PROGRAMS.filter((p) => p.legacyEventId).map((p) => [p.legacyEventId, p.id])
);

/** Outcome sub-filter when program = outcome (like DHIS2 stage) */
const OUTCOME_STATUS_OPTIONS = [
  { id: 'all', labelKh: 'ទាំងអស់', statusCodes: [0, 1, 3] },
  { id: 'dead', labelKh: 'ស្លាប់', statusCodes: [1], legacyEventId: 'exit_dead' },
  { id: 'ltfu', labelKh: 'បោះបង់', statusCodes: [0], legacyEventId: 'exit_ltfu' },
  { id: 'transfer_out', labelKh: 'ផ្ទេរចេញ', statusCodes: [3], legacyEventId: 'exit_transfer_out' }
];

module.exports = {
  INSIGHT_PROGRAMS,
  POPULATION_FILTER,
  OUTCOME_STATUS_OPTIONS,
  LEGACY_EVENT_TO_PROGRAM
};
