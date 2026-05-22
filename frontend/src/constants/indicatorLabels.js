import { labelKhForInfantIndicatorId } from './infantIndicatorLabels';
import { labelKhForPnttIndicatorId } from './pnttIndicatorLabels';

/** Display labels for indicator SQL ids (aligned with Report Home). */
export const INDICATOR_LABEL_BY_NAME = {
  '1. Active ART patients in previous quarter':
    '1. ចំនួនអ្នកជំងឺ ART សកម្មដល់ចុងត្រីមាសមុន',
  '2. Active Pre-ART patients in previous quarter':
    '2. ចំនួនអ្នកជំងឺ Pre-ART សកម្មដល់ចុងត្រីមាសមុន',
  '3. Newly Enrolled': '3. ចំនួនអ្នកជំងឺចុះឈ្មោះថ្មី',
  '4. Re-tested positive': '4. ចំនួនអ្នកជំងឺដែលវិជ្ជមានពីតេស្តបញ្ជាក់',
  '5. Newly Initiated': '5. ចំនួនអ្នកជំងឺចាប់ផ្តើមព្យាបាលដោយ ARV ថ្មី',
  '5.1.1. New ART started: Same day': '5.1.1. ក្នុងថ្ងៃតែមួយ',
  '5.1.2. New ART started: 1-7 days': '5.1.2. ពី ១ ទៅ ៧ ថ្ងៃ',
  '5.1.3. New ART started: >7 days': '5.1.3. ច្រើនជាង ៧ ថ្ងៃ',
  '5.2. New ART started with TLD': '5.2. ចាប់ផ្តើម ART ដោយ TLD',
  '6. Transfer-in patients': '6. បញ្ជូនចូល',
  '7. Lost and Return': '7. បោះបង់ហើយត្រឡប់',
  '8.1. Dead': '8.1. ស្លាប់',
  '8.2. Lost to follow up (LTFU)': '8.2. បោះបង់',
  '8.3. Transfer-out': '8.3. ផ្ទេរចេញ',
  '9. Active Pre-ART': '9. Pre-ART សកម្ម (ត្រីមាសនេះ)',
  '10. Active ART patients in this quarter': '10. ART សកម្ម (ត្រីមាសនេះ)',
  '10.1. Eligible MMD': '10.1. សមស្រប MMD',
  '10.2. MMD': '10.2. MMD',
  '10.3. TLD': '10.3. TLD',
  '10.4. TPT Start': '10.4. ចាប់ផ្តើម TPT',
  '10.5. TPT Complete': '10.5. បញ្ចប់ TPT',
  '10.6. Eligible for VL test': '10.6. សមស្របតេស្ត VL',
  '10.7. VL tested in 12M': '10.7. VL ក្នុង ១២ ខែ',
  '10.8. VL suppression': '10.8. VL បង្ក្រាប',
  '10.9. Eligible for EAC (VL 40+)': '10.9. សមស្រប EAC',
  '10.10. EAC session 1 (EAC1)': '10.10. EAC1',
  '10.11. EAC session 2 (EAC2)': '10.11. EAC2',
  '10.12. EAC session 3 (EAC3)': '10.12. EAC3',
  '10.13. VL follow-up within 6 months after EAC': '10.13. VL តាមដាន ≤៦ខែ',
  '10.14. VL follow-up 6+ months after high VL': '10.14. VL តាមដាន ≥៦ខែ'
};

export const INDICATOR_ID_BY_NAME = {
  '1. Active ART patients in previous quarter': '01_active_art_previous',
  '2. Active Pre-ART patients in previous quarter': '02_active_pre_art_previous',
  '3. Newly Enrolled': '03_newly_enrolled',
  '4. Re-tested positive': '04_retested_positive',
  '5. Newly Initiated': '05_newly_initiated',
  '5.1.1. New ART started: Same day': '05.1.1_art_same_day',
  '5.1.2. New ART started: 1-7 days': '05.1.2_art_1_7_days',
  '5.1.3. New ART started: >7 days': '05.1.3_art_over_7_days',
  '5.2. New ART started with TLD': '05.2_art_with_tld',
  '6. Transfer-in patients': '06_transfer_in',
  '7. Lost and Return': '07_lost_and_return',
  '8.1. Dead': '08.1_dead',
  '8.2. Lost to follow up (LTFU)': '08.2_lost_to_followup',
  '8.3. Transfer-out': '08.3_transfer_out',
  '9. Active Pre-ART': '09_active_pre_art',
  '10. Active ART patients in this quarter': '10_active_art_current',
  '10.1. Eligible MMD': '10.1_eligible_mmd',
  '10.2. MMD': '10.2_mmd',
  '10.3. TLD': '10.3_tld',
  '10.4. TPT Start': '10.4_tpt_start',
  '10.5. TPT Complete': '10.5_tpt_complete',
  '10.6. Eligible for VL test': '10.6_eligible_vl_test',
  '10.7. VL tested in 12M': '10.7_vl_tested_12m',
  '10.8. VL suppression': '10.8_vl_suppression',
  '10.9. Eligible for EAC (VL 40+)': '10.9_eligible_eac_high_vl',
  '10.10. EAC session 1 (EAC1)': '10.10_eac_session_1',
  '10.11. EAC session 2 (EAC2)': '10.11_eac_session_2',
  '10.12. EAC session 3 (EAC3)': '10.12_eac_session_3',
  '10.13. VL follow-up within 6 months after EAC': '10.13_vl_followup_6m_after_eac',
  '10.14. VL follow-up 6+ months after high VL': '10.14_vl_followup_6m_apart_high_vl'
};

const NAME_BY_ID = Object.fromEntries(
  Object.entries(INDICATOR_ID_BY_NAME).map(([name, id]) => [id, name])
);

export function labelForIndicatorId(id, fallbackName, catalogLabel) {
  if (catalogLabel) return catalogLabel;
  const sid = String(id || '');
  if (sid.startsWith('pntt:')) {
    return labelKhForPnttIndicatorId(sid) || fallbackName || sid.replace(/^pntt:/, '').replace(/_/g, ' ');
  }
  if (sid.startsWith('infant:')) {
    return labelKhForInfantIndicatorId(sid) || fallbackName || sid.replace(/^infant:/, '').replace(/_/g, ' ');
  }
  const name = NAME_BY_ID[id] || fallbackName;
  if (name && INDICATOR_LABEL_BY_NAME[name]) return INDICATOR_LABEL_BY_NAME[name];
  if (name) return name;
  return String(id || '').replace(/_/g, ' ');
}

export const VISUALIZE_PRESETS = {
  vl: {
    label: 'VL / EAC',
    ids: [
      '10.6_eligible_vl_test',
      '10.7_vl_tested_12m',
      '10.8_vl_suppression',
      '10.9_eligible_eac_high_vl',
      '10.10_eac_session_1',
      '10.11_eac_session_2',
      '10.12_eac_session_3',
      '10.13_vl_followup_6m_after_eac',
      '10.14_vl_followup_6m_apart_high_vl'
    ]
  },
  retention: {
    label: 'Retention',
    ids: ['08.1_dead', '08.2_lost_to_followup', '08.3_transfer_out', '07_lost_and_return']
  },
  quality: {
    label: 'Quality (10.x)',
    ids: [
      '10.1_eligible_mmd',
      '10.2_mmd',
      '10.3_tld',
      '10.4_tpt_start',
      '10.5_tpt_complete',
      '10.6_eligible_vl_test',
      '10.7_vl_tested_12m',
      '10.8_vl_suppression'
    ]
  }
};
