/**
 * Curated clinical "events" for Data Visualize — maps to existing indicator SQL ids.
 * UI shows these groups only (not raw DB tables or schema).
 */

/** Adult/Child ART — grouped by national report chapters */
export const ART_EVENT_GROUPS = [
  {
    id: 'baseline',
    labelKh: 'គោលដ្ឋាន (ត្រីមាសមុន)',
    indicatorIds: ['01_active_art_previous', '02_active_pre_art_previous']
  },
  {
    id: 'enrollment',
    labelKh: 'ចុះឈ្មោះ / ចាប់ផ្តើម ART',
    indicatorIds: [
      '03_newly_enrolled',
      '04_retested_positive',
      '05_newly_initiated',
      '05.1.1_art_same_day',
      '05.1.2_art_1_7_days',
      '05.1.3_art_over_7_days',
      '05.2_art_with_tld',
      '05.3_art_pregnant'
    ]
  },
  {
    id: 'movement',
    labelKh: 'ផ្ទេរ / បោះបង់ហើយត្រឡប់',
    indicatorIds: ['06_transfer_in', '07_lost_and_return']
  },
  {
    id: 'outcomes',
    labelKh: 'លទ្ធផល (ស្លាប់ / LTFU / ផ្ទេរចេញ)',
    indicatorIds: ['09.1_dead', '09.2_lost_to_followup', '09.3_transfer_out']
  },
  {
    id: 'active',
    labelKh: 'សកម្ម (Pre-ART / ART ត្រីមាសនេះ)',
    indicatorIds: ['10_active_pre_art', '11_active_art_current']
  },
  {
    id: 'quality',
    labelKh: 'គុណភាពព្យាបាល (MMD / TLD / TPT)',
    indicatorIds: [
      '08_tpt_new_start',
      '11.1_eligible_mmd',
      '11.2_mmd',
      '11.3_tld',
      '11.4_tpt_start',
      '11.4.1_tpt_new_start',
      '11.5_tpt_complete',
      '11.4_tpt_start_old',
      '11.5_tpt_complete_old'
    ]
  },
  {
    id: 'vl_eac',
    labelKh: 'VL / EAC',
    indicatorIds: [
      '11.6_eligible_vl_test',
      '11.7_vl_tested_12m',
      '11.8_vl_suppression',
      '11.9_eligible_eac_high_vl',
      '11.10_eac_session_1',
      '11.11_eac_session_2',
      '11.12_eac_session_3',
      '11.13_vl_followup_6m_after_eac',
      '11.14_vl_followup_6m_apart_high_vl'
    ]
  }
];

export const INFANT_EVENT_GROUP_TITLE = 'ទារក EID (តាមផ្នែករបាយការណ៍)';
export const PNTT_EVENT_GROUP_TITLE = 'តម្រុយ PNTT (តាមផ្នែករបាយការណ៍)';
