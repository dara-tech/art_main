/**
 * Khmer labels for Infant indicators (mirrors infantReportService SECTION_DEFS).
 */

const INFANT_SECTIONS = [
  [1, '01_INFANT_PREVIOUS_QUARTER_aggregate', 'ចំនួនកុមារប្រឈមដែលបាននិងកំពុងទទួលការថែទាំ រហូតដល់ចុងត្រីមាសមុន'],
  [2, '02_INFANT_NEW_LESS2_aggregate', 'ចំនួនកុមារថ្មី ទទួលការថែទាំលើកដំបូង'],
  [3, '03_INFANT_TRANSFER_IN_aggregate', 'កុមារបញ្ជូនចូល'],
  [4, '04_INFANT_DNA_TEST_LESS2_aggregate', 'ចំនួនកុមារដែលបានធ្វើតេស្ត DNA PCR នៅក្នុងត្រីមាសនេះ'],
  [5, '05_INFANT_COTRIM_aggregate', 'ចំនួនកុមារចាប់ផ្តើមប្រើថ្នាំ Cotrimoxazole'],
  [6, '06_INFANT_DNA_REQUESTED_aggregate', 'ចំនួនតេស្ត DNA PCR ដែលគ្រូពេទ្យស្នើក្នុងត្រីមាសនេះ'],
  [7, '07_INFANT_DNA_BIRTH_aggregate', 'ចំនួនលទ្ធផលតេស្ត DNA PCR នៅពេលកើត'],
  [8, '08_INFANT_DNA_CONFIRM_BIRTH_aggregate', 'ចំនួនលទ្ធផលតេស្តបញ្ជាក់ DNA PCR នៅពេលកើត'],
  [9, '09_INFANT_DNA_4_6WEEKS_aggregate', 'ចំនួនលទ្ធផលតេស្ត DNA PCR នៅអាយុចន្លោះពី ៤ ទៅ ៦ សប្តាហ៍'],
  [10, '10_INFANT_DNA_CONFIRM_4_6WEEKS_aggregate', 'ចំនួនលទ្ធផលតេស្តបញ្ជាក់ DNA PCR ចន្លោះពី ៤ ទៅ ៦ សប្តាហ៍'],
  [11, '11_INFANT_DNA_9MONTHS_aggregate', 'ចំនួនលទ្ធផលតេស្ត DNA PCR អាយុ ៩ ខែ'],
  [12, '12_INFANT_DNA_CONFIRM_9MONTHS_aggregate', 'ចំនួនលទ្ធផលតេស្តបញ្ជាក់ DNA PCR អាយុ ៩ ខែ'],
  [13, '13_INFANT_DNA_OI_aggregate', 'ចំនួនលទ្ធផលតេស្ត DNA PCR ករណីមានជំងឺឱកាសនិយម'],
  [14, '14_INFANT_DNA_CONFIRM_OI_aggregate', 'ចំនួនលទ្ធផលតេស្តបញ្ជាក់ DNA PCR ករណី OI'],
  [15, '15_INFANT_DNA_OTHER_aggregate', 'ចំនួនតេស្ត DNA PCR ករណីផ្សេងៗទៀត'],
  [16, '16_INFANT_DNA_CONFIRM_OTHER_aggregate', 'តេស្តបញ្ជាក់ករណីផ្សេងៗ'],
  [17, '17_INFANT_ANTIBODY_aggregate', 'ចំនួនកុមារប្រឈមដែលធ្វើតេស្ត Antibody'],
  [18, '18_INFANT_OUTCOME_aggregate', 'ចំនួនកុមារដែលបានចាកចេញពីការថែទាំ'],
  [19, '19_INFANT_TOTAL_ON_CARE_aggregate', 'ចំនួនកុមារប្រឈមសរុបក្នុងការតាមដាននិងថែទាំដល់ចុងត្រីមាស']
];

export const INFANT_LABEL_BY_SCRIPT = Object.fromEntries(
  INFANT_SECTIONS.map(([n, scriptId, kh]) => [scriptId, `${n}. ${kh}`])
);

export function labelKhForInfantIndicatorId(id) {
  const scriptId = String(id || '').replace(/^infant:/, '');
  return INFANT_LABEL_BY_SCRIPT[scriptId] || null;
}
