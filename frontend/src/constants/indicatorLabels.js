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
  '5.3. New ART patients who are pregnant': '5.3. ចំនួនអ្នកជំងឺ ART ថ្មីដែលមានផ្ទៃពោះ',
  '6. Transfer-in patients': '6. បញ្ជូនចូល',
  '7. Lost and Return': '7. បោះបង់ហើយត្រឡប់',
  '8. Number of patients started TPT in this quarter': '8. ចំនួនអ្នកជំងឺចាប់ផ្តើម TPT ក្នុងត្រីមាសនេះ',
  '9. Number of patients who left the service': '9. ចំនួនអ្នកជំងឺដែលចាកចេញពីសេវា',
  '9.1. Dead': '9.1. ស្លាប់',
  '9.2. Lost to follow up (LTFU)': '9.2. បោះបង់',
  '9.3. Transfer-out': '9.3. ផ្ទេរចេញ',
  '10. Active Pre-ART': '10. Pre-ART សកម្ម (ត្រីមាសនេះ)',
  '11. Active ART patients in this quarter': '11. ART សកម្ម (ត្រីមាសនេះ)',
  '11.1. Eligible MMD': '11.1. សមស្រប MMD',
  '11.2. MMD': '11.2. MMD',
  '11.3. TLD': '11.3. TLD',
  '11.4. TPT Start': '11.4. ចាប់ផ្តើម TPT',
  '11.4.1. TPT Start (new start)': '11.4.1. ចាប់ផ្តើម TPT ថ្មី (ក្នុងត្រីមាស)',
  '11.5. TPT Complete': '11.5. បញ្ចប់ TPT',
  '(old) 11.4. TPT Start': '(old) 11.4. ចាប់ផ្តើម TPT — វិធីចាស់',
  '(old) 11.5. TPT Complete': '(old) 11.5. បញ្ចប់ TPT — វិធីចាស់',
  '11.5.1. Started ART > 6 months': '11.5.1. ចាប់ផ្តើម ART > ៦ ខែ (Started ART > 6 months)',
  '11.6. Eligible for VL test': '11.6. សមស្របតេស្ត VL',
  '11.7. VL tested in 12M': '11.7. VL ក្នុង ១២ ខែ',
  '11.8. VL suppression': '11.8. VL បង្ក្រាប',
  '11.9. Eligible for EAC (VL 40+)': '11.9. សមស្រប EAC',
  '11.10. EAC session 1 (EAC1)': '11.10. EAC1',
  '11.11. EAC session 2 (EAC2)': '11.11. EAC2',
  '11.12. EAC session 3 (EAC3)': '11.12. EAC3',
  '11.13. VL follow-up within 6 months after EAC': '11.13. VL តាមដាន ≤៦ខែ',
  '11.14. VL follow-up 6+ months after high VL': '11.14. VL តាមដាន ≥៦ខែ'
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
  '5.3. New ART patients who are pregnant': '05.3_art_pregnant',
  '6. Transfer-in patients': '06_transfer_in',
  '7. Lost and Return': '07_lost_and_return',
  '8. Number of patients started TPT in this quarter': '08_tpt_new_start',
  '9. Number of patients who left the service': '9_left_service_total',
  '9.1. Dead': '09.1_dead',
  '9.2. Lost to follow up (LTFU)': '09.2_lost_to_followup',
  '9.3. Transfer-out': '09.3_transfer_out',
  '10. Active Pre-ART': '10_active_pre_art',
  '11. Active ART patients in this quarter': '11_active_art_current',
  '11.1. Eligible MMD': '11.1_eligible_mmd',
  '11.2. MMD': '11.2_mmd',
  '11.3. TLD': '11.3_tld',
  '11.4. TPT Start': '11.4_tpt_start',
  '11.4.1. TPT Start (new start)': '11.4.1_tpt_new_start',
  '11.5. TPT Complete': '11.5_tpt_complete',
  '(old) 11.4. TPT Start': '11.4_tpt_start_old',
  '(old) 11.5. TPT Complete': '11.5_tpt_complete_old',
  '11.5.1. Started ART > 6 months': '11.5.1_started_art_over_6m',
  '11.6. Eligible for VL test': '11.6_eligible_vl_test',
  '11.7. VL tested in 12M': '11.7_vl_tested_12m',
  '11.8. VL suppression': '11.8_vl_suppression',
  '11.9. Eligible for EAC (VL 40+)': '11.9_eligible_eac_high_vl',
  '11.10. EAC session 1 (EAC1)': '11.10_eac_session_1',
  '11.11. EAC session 2 (EAC2)': '11.11_eac_session_2',
  '11.12. EAC session 3 (EAC3)': '11.12_eac_session_3',
  '11.13. VL follow-up within 6 months after EAC': '11.13_vl_followup_6m_after_eac',
  '11.14. VL follow-up 6+ months after high VL': '11.14_vl_followup_6m_apart_high_vl'
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
      '11.5.1_started_art_over_6m',
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
  },
  retention: {
    label: 'Retention',
    ids: ['09.1_dead', '09.2_lost_to_followup', '09.3_transfer_out', '07_lost_and_return']
  },
  quality: {
    label: 'Quality (11.x)',
    ids: [
      '08_tpt_new_start',
      '11.1_eligible_mmd',
      '11.2_mmd',
      '11.3_tld',
      '11.4_tpt_start',
      '11.4.1_tpt_new_start',
      '11.5_tpt_complete',
      '11.4_tpt_start_old',
      '11.5_tpt_complete_old',
      '11.5.1_started_art_over_6m',
      '11.6_eligible_vl_test',
      '11.7_vl_tested_12m',
      '11.8_vl_suppression'
    ]
  }
};
