/**
 * Curated clinical data sources for insight analysis (read-only SELECT).
 * Each maps to known tables/joins — not an open table browser.
 */
const INSIGHT_EVENTS = [
  {
    id: 'art_start',
    labelKh: 'ចាប់ផ្តើម ART',
    descriptionKh: 'អ្នកជំងឺដែលមានថ្ងៃចាប់ផ្តើម ARV (tblaart / tblcart) ក្នុងរយៈពេល',
    tables: ['tblaart', 'tblcart', 'tblaimain', 'tblcimain'],
    dateField: 'DaArt'
  },
  {
    id: 'first_visit',
    labelKh: 'ចុះឈ្មោះ / មកពិនិត្យលើកដំបូង',
    descriptionKh: 'ថ្ងៃចុះឈ្មោះពិនិត្យលើកដំបូង (DafirstVisit / DaFirstVisit)',
    tables: ['tblaimain', 'tblcimain'],
    dateField: 'DafirstVisit'
  },
  {
    id: 'clinical_visit',
    labelKh: 'មកពិនិត្យព្យាបាល (visit)',
    descriptionKh: 'អ្នកជំងឺដែលមាន visit (tblavmain / tblcvmain) ក្នុងរយៈពេល',
    tables: ['tblavmain', 'tblcvmain', 'tblaimain', 'tblcimain'],
    dateField: 'DatVisit'
  },
  {
    id: 'vl_test',
    labelKh: 'តេស្ត Viral Load',
    descriptionKh: 'តេស្ត VL ពី tblpatienttest (មានលទ្ធផល HIVLoad)',
    tables: ['tblpatienttest', 'tblaimain', 'tblcimain'],
    dateField: 'Dat / DaCollect'
  },
  {
    id: 'exit_dead',
    labelKh: 'ស្លាប់',
    descriptionKh: 'ការកត់ត្រាស្លាប់ (tblavpatientstatus / tblcvpatientstatus)',
    tables: ['tblavpatientstatus', 'tblcvpatientstatus', 'tblaimain', 'tblcimain'],
    dateField: 'Da (status)'
  },
  {
    id: 'exit_ltfu',
    labelKh: 'បោះបង់ (LTFU)',
    descriptionKh: 'Lost to follow-up — status = 0',
    tables: ['tblavpatientstatus', 'tblcvpatientstatus'],
    dateField: 'Da (status)'
  },
  {
    id: 'exit_transfer_out',
    labelKh: 'ផ្ទេរចេញ',
    descriptionKh: 'Transfer out — status = 3',
    tables: ['tblavpatientstatus', 'tblcvpatientstatus'],
    dateField: 'Da (status)'
  }
];

const DIMENSIONS = [
  { id: 'sex', labelKh: 'ភេទ' },
  { id: 'age_group', labelKh: 'ក្រុមអាយុ (≤១៤ / ១៥+)' },
  { id: 'program', labelKh: 'កម្មវិធី (មនុស្សពេញវ័យ / កុមារ)' }
];

module.exports = { INSIGHT_EVENTS, DIMENSIONS };
