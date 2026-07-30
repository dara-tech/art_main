import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  RiBarChartGroupedLine,
  RiCheckLine,
  RiCloseLine,
  RiSearchLine,
  RiArrowDownSLine,
  RiFilter3Line
} from '@remixicon/react';

export const NATIONAL_REPORT_INDICATORS = [
  // --- Category 1: Cohort & Active Patients ---
  {
    id: 'active_art',
    sql_file: '11_active_art_current.sql',
    name_kh: '១១. អ្នកជំងឺ ART សកម្ម (Current Active ART)',
    name_en: 'Active ART Cohort (End of Period)',
    category: 'Cohort & Active Patients',
    category_kh: '១. អ្នកជំងឺសកម្ម & សហកូអរ',
    desc: 'ចំនួនអ្នកជំងឺកំពុងទទួលការព្យាបាលដោយថ្នាំប្រឆាំងមេរោគអេដស៍សកម្ម ចុងត្រីមាស'
  },
  {
    id: '01_active_art_previous',
    sql_file: '01_active_art_previous.sql',
    name_kh: '០១. អ្នកជំងឺ ART សកម្មដើមត្រីមាស',
    name_en: 'Active ART Cohort (Start of Period)',
    category: 'Cohort & Active Patients',
    category_kh: '១. អ្នកជំងឺសកម្ម & សហកូអរ',
    desc: 'ចំនួនអ្នកជំងឺ ART សកម្មពីត្រីមាសមុន ( baseline )'
  },
  {
    id: '03_newly_enrolled',
    sql_file: '03_newly_enrolled.sql',
    name_kh: '០៣. អ្នកជំងឺចុះឈ្មោះថ្មីក្នុងសេវា',
    name_en: 'Newly Enrolled in Care',
    category: 'Cohort & Active Patients',
    category_kh: '១. អ្នកជំងឺសកម្ម & សហកូអរ',
    desc: 'ចំនួនអ្នកជំងឺឆ្លងមេរោគអេដស៍ដែលទើបចុះឈ្មោះចូលសេវាថែទាំ'
  },
  {
    id: '04_retested_positive',
    sql_file: '04_retested_positive.sql',
    name_kh: '០៤. អ្នកជំងឺតេស្តឡើងវិញឃើញវិជ្ជមាន',
    name_en: 'Retested HIV Positive',
    category: 'Cohort & Active Patients',
    category_kh: '១. អ្នកជំងឺសកម្ម & សហកូអរ',
    desc: 'ចំនួនអ្នកជំងឺតេស្តបញ្ជាក់ឡើងវិញឃើញវិជ្ជមានមេរោគអេដស៍'
  },
  {
    id: '10_active_pre_art',
    sql_file: '10_active_pre_art.sql',
    name_kh: '១០. អ្នកជំងឺ Pre-ART សកម្ម',
    name_en: 'Active Pre-ART Patients',
    category: 'Cohort & Active Patients',
    category_kh: '១. អ្នកជំងឺសកម្ម & សហកូអរ',
    desc: 'ចំនួនអ្នកជំងឺសកម្មក្នុងសេវាថែទាំមុនផ្ដើម ART'
  },

  // --- Category 2: ART Initiation & Timing ---
  {
    id: 'newly_initiated',
    sql_file: '05_newly_initiated.sql',
    name_kh: '០៥. អ្នកជំងឺផ្ដើមព្យាបាល ART ថ្មី',
    name_en: 'Newly Initiated on ART',
    category: 'ART Initiation & Timing',
    category_kh: '២. ការផ្ដើមព្យាបាល ART ថ្មី',
    desc: 'ចំនួនអ្នកជំងឺដែលបានចាប់ផ្ដើមព្យាបាល ART ជាលើកដំបូងក្នុងត្រីមាស'
  },
  {
    id: '05.1.1_same_day',
    sql_file: '05.1.1_art_same_day.sql',
    name_kh: '០៥.១.១. ផ្ដើម ART ក្នុងថ្ងៃតែមួយ (Same Day)',
    name_en: 'Same Day ART Initiation',
    category: 'ART Initiation & Timing',
    category_kh: '២. ការផ្ដើមព្យាបាល ART ថ្មី',
    desc: 'អ្នកជំងឺផ្ដើម ART ភ្លាមៗក្នុងថ្ងៃទទួលបានលទ្ធផលតេស្តវិជ្ជមាន'
  },
  {
    id: '05.1.2_1_7_days',
    sql_file: '05.1.2_art_1_7_days.sql',
    name_kh: '០៥.១.២. ផ្ដើម ART រវាង ១-៧ ថ្ងៃ',
    name_en: 'Rapid ART Initiation (1-7 Days)',
    category: 'ART Initiation & Timing',
    category_kh: '២. ការផ្ដើមព្យាបាល ART ថ្មី',
    desc: 'អ្នកជំងឺផ្ដើម ART រហ័សក្នុងកំឡុង ១ ទៅ ៧ ថ្ងៃ'
  },
  {
    id: '05.1.3_over_7_days',
    sql_file: '05.1.3_art_over_7_days.sql',
    name_kh: '០៥.១.៣. ផ្ដើម ART លើសពី ៧ ថ្ងៃ',
    name_en: 'ART Initiation (>7 Days)',
    category: 'ART Initiation & Timing',
    category_kh: '២. ការផ្ដើមព្យាបាល ART ថ្មី',
    desc: 'អ្នកជំងឺផ្ដើម ART ក្រោយរយៈពេល ៧ ថ្ងៃនៃការបញ្ជាក់រោគវិនិច្ឆ័យ'
  },
  {
    id: '05.2_started_tld',
    sql_file: '05.2_art_with_tld.sql',
    name_kh: '០៥.២. ផ្ដើម ART ដោយប្រើរូបមន្ត TLD',
    name_en: 'Initiated ART with TLD Regimen',
    category: 'ART Initiation & Timing',
    category_kh: '២. ការផ្ដើមព្យាបាល ART ថ្មី',
    desc: 'អ្នកជំងឺថ្មីដែលបានចាប់ផ្ដើមព្យាបាលជាមួយរូបមន្តថ្នាំ TLD'
  },
  {
    id: '05.3_pregnant',
    sql_file: '05.3_art_pregnant.sql',
    name_kh: '០៥.៣. ស្ត្រីមានផ្ទៃពោះផ្ដើមព្យាបាល ART',
    name_en: 'Pregnant Women Initiated ART',
    category: 'ART Initiation & Timing',
    category_kh: '២. ការផ្ដើមព្យាបាល ART ថ្មី',
    desc: 'ស្ត្រីមានផ្ទៃពោះឆ្លង HIV ដែលបានផ្ដើមការព្យាបាល ART'
  },

  // --- Category 3: Retention & Patient Flow ---
  {
    id: '06_transfer_in',
    sql_file: '06_transfer_in.sql',
    name_kh: '០៦. អ្នកជំងឺផ្លាស់ប្ដូរចូល (Transfer In)',
    name_en: 'Transferred In Patients',
    category: 'Retention & Patient Flow',
    category_kh: '៣. ការរក្សាទុក & ចលនាអ្នកជំងឺ',
    desc: 'ចំនួនអ្នកជំងឺ ART ដែលបានផ្លាស់ប្ដូរទីតាំងព្យាបាលចូលមកមណ្ឌល'
  },
  {
    id: '07_lost_returned',
    sql_file: '07_lost_and_return.sql',
    name_kh: '០៧. ត្រឡប់មកព្យាបាលវិញ (Returned to Care)',
    name_en: 'Lost & Returned to Care (RTT)',
    category: 'Retention & Patient Flow',
    category_kh: '៣. ការរក្សាទុក & ចលនាអ្នកជំងឺ',
    desc: 'អ្នកជំងឺ LTFU ដែលបានត្រឡប់មកបន្តការព្យាបាល ART ឡើងវិញ'
  },
  {
    id: 'ltfu',
    sql_file: '09.2_lost_to_followup.sql',
    name_kh: '០៩.២. បាត់បង់ការតាមដាន (LTFU)',
    name_en: 'Lost to Follow-Up (LTFU)',
    category: 'Retention & Patient Flow',
    category_kh: '៣. ការរក្សាទុក & ចលនាអ្នកជំងឺ',
    desc: 'អ្នកជំងឺខកខានមិនបានមកទទួលថ្នាំ ART លើសពី ៩០ ថ្ងៃ'
  },
  {
    id: '09.1_dead',
    sql_file: '09.1_dead.sql',
    name_kh: '០៩.១. អត្រាអ្នកជំងឺស្លាប់ (Mortality)',
    name_en: 'Reported Deceased Patients',
    category: 'Retention & Patient Flow',
    category_kh: '៣. ការរក្សាទុក & ចលនាអ្នកជំងឺ',
    desc: 'ចំនួនអ្នកជំងឺ ART ដែលបានទទួលមរណភាពក្នុងកំឡុងត្រីមាស'
  },
  {
    id: '09.3_transfer_out',
    sql_file: '09.3_transfer_out.sql',
    name_kh: '០៩.៣. អ្នកជំងឺផ្លាស់ប្ដូរចេញ (Transfer Out)',
    name_en: 'Transferred Out Patients',
    category: 'Retention & Patient Flow',
    category_kh: '៣. ការរក្សាទុក & ចលនាអ្នកជំងឺ',
    desc: 'ចំនួនអ្នកជំងឺ ART ដែលបានផ្លាស់ប្ដូរចេញទៅមណ្ឌលព្យាបាលផ្សេង'
  },

  // --- Category 4: Multi-Month Dispensing & Regimens ---
  {
    id: '11.1_eligible_mmd',
    sql_file: '11.1_eligible_mmd.sql',
    name_kh: '១១.១. អ្នកជំងឺសមស្របទទួលបានថ្នាំ MMD',
    name_en: 'Patients Eligible for MMD',
    category: 'MMD & Drug Regimens',
    category_kh: '៤. ថ្នាំ MMD & រូបមន្តព្យាបាល',
    desc: 'អ្នកជំងឺ ART ស្ថិតក្នុងស្ថានភាពនឹងនរដែលសមស្របទទួលថ្នាំ MMD'
  },
  {
    id: 'mmd',
    sql_file: '11.2_mmd.sql',
    name_kh: '១១.២. ថ្នាំពន្យារ MMD ៣-៦ ខែ',
    name_en: 'Multi-Month Dispensing (MMD 3-6M)',
    category: 'MMD & Drug Regimens',
    category_kh: '៤. ថ្នាំ MMD & រូបមន្តព្យាបាល',
    desc: 'អ្នកជំងឺ ART ដែលទទួលបានការផ្តល់ថ្នាំពន្យារពេល ៣ ទៅ ៦ ខែ'
  },
  {
    id: 'tld',
    sql_file: '11.3_tld.sql',
    name_kh: '១១.៣. ការប្រើប្រាស់រូបមន្តថ្នាំ TLD',
    name_en: 'TLD Regimen Transition',
    category: 'MMD & Drug Regimens',
    category_kh: '៤. ថ្នាំ MMD & រូបមន្តព្យាបាល',
    desc: 'អត្រាអ្នកជំងឺ ART ដែលកំពុងប្រើប្រាស់រូបមន្តថ្នាំ TLD'
  },

  // --- Category 5: TB Preventive Treatment (TPT) ---
  {
    id: '08_tpt_new_start',
    sql_file: '08_tpt_new_start.sql',
    name_kh: '០៨. អ្នកជំងឺផ្ដើម TPT ថ្មី',
    name_en: 'Newly Started TPT',
    category: 'TB Preventive Treatment',
    category_kh: '៥. ការព្យាបាលបង្ការរបេង (TPT)',
    desc: 'អ្នកជំងឺ ART ចុះឈ្មោះថ្មីដែលបានចាប់ផ្ដើមព្យាបាលបង្ការរបេង TPT'
  },
  {
    id: '11.4_tpt_start',
    sql_file: '11.4_tpt_start.sql',
    name_kh: '១១.៤. អ្នកជំងឺ ART កំពុងទទួល TPT',
    name_en: 'Active ART Patients Started TPT',
    category: 'TB Preventive Treatment',
    category_kh: '៥. ការព្យាបាលបង្ការរបេង (TPT)',
    desc: 'ចំនួនអ្នកជំងឺ ART សកម្មដែលបានចាប់ផ្ដើមទទួលការព្យាបាល TPT'
  },
  {
    id: 'tpt',
    sql_file: '11.5_tpt_complete.sql',
    name_kh: '១១.៥. បានបញ្ចប់ការព្យាបាល TPT',
    name_en: 'Completed TPT Course',
    category: 'TB Preventive Treatment',
    category_kh: '៥. ការព្យាបាលបង្ការរបេង (TPT)',
    desc: 'អ្នកជំងឺ ART ដែលបានបញ្ចប់វគ្គការព្យាបាលបង្ការជំងឺរបេងពេញលេញ'
  },

  // --- Category 6: Viral Load Testing & Suppression ---
  {
    id: '11.5.1_art_over_6m',
    sql_file: '11.5.1_started_art_over_6m.sql',
    name_kh: '១១.៥.១. ព្យាបាល ART លើសពី ៦ ខែ',
    name_en: 'On ART for >6 Months',
    category: 'Viral Load & Quality',
    category_kh: '៦. បន្ទុកមេរោគ VL & គុណភាព',
    desc: 'ចំនួនអ្នកជំងឺដែលបានព្យាបាល ART រយៈពេល ៦ ខែឡើងទៅ'
  },
  {
    id: '11.6_eligible_vl',
    sql_file: '11.6_eligible_vl_test.sql',
    name_kh: '១១.៦. អ្នកជំងឺសមស្របតេស្តបន្ទុកមេរោគ VL',
    name_en: 'Eligible for Viral Load Test',
    category: 'Viral Load & Quality',
    category_kh: '៦. បន្ទុកមេរោគ VL & គុណភាព',
    desc: 'អ្នកជំងឺ ART ដែលដល់កាលកំណត់ត្រូវតេស្តបន្ទុកមេរោគ'
  },
  {
    id: '11.7_vl_tested',
    sql_file: '11.7_vl_tested_12m.sql',
    name_kh: '១១.៧. បានតេស្តបន្ទុកមេរោគ VL ក្នុង ១២ខែ',
    name_en: 'Routine VL Tested (Past 12M)',
    category: 'Viral Load & Quality',
    category_kh: '៦. បន្ទុកមេរោគ VL & គុណភាព',
    desc: 'អ្នកជំងឺ ART ដែលទទួលបានការតេស្ត VL ក្នុងរយ:ពេល ១២ ខែចុងក្រោយ'
  },
  {
    id: 'vl_suppressed',
    sql_file: '11.8_vl_suppression.sql',
    name_kh: '១១.៨. អត្រាបង្ក្រាបមេរោគ VL (<1000 c/mL)',
    name_en: 'Viral Load Suppression Rate',
    category: 'Viral Load & Quality',
    category_kh: '៦. បន្ទុកមេរោគ VL & គុណភាព',
    desc: 'ភាគរយអ្នកជំងឺតេស្ត VL ឃើញបង្ក្រាបមេរោគ (<1000 copies/mL)'
  },

  // --- Category 7: Enhanced Adherence Counseling (EAC) ---
  {
    id: '11.9_eligible_eac',
    sql_file: '11.9_eligible_eac_high_vl.sql',
    name_kh: '១១.៩. សមស្របទទួល EAC (VL ខ្ពស់)',
    name_en: 'Eligible for EAC (High VL >=1000)',
    category: 'EAC & High VL Management',
    category_kh: '៧. ការប្រឹក្សា EAC (VL ខ្ពស់)',
    desc: 'អ្នកជំងឺតេស្តឃើញ VL >= 1000 copies/mL ដែលត្រូវទទួលការប្រឹក្សា EAC'
  },
  {
    id: '11.10_eac_1',
    sql_file: '11.10_eac_session_1.sql',
    name_kh: '១១.១០. បញ្ចប់ការប្រឹក្សា EAC លើកទី ១',
    name_en: 'EAC Session 1 Completed',
    category: 'EAC & High VL Management',
    category_kh: '៧. ការប្រឹក្សា EAC (VL ខ្ពស់)',
    desc: 'ចំនួនអ្នកជំងឺដែលបានបញ្ចប់ការប្រឹក្សាពង្រឹងការហូបថ្នាំ លើកទី១'
  },
  {
    id: '11.11_eac_2',
    sql_file: '11.11_eac_session_2.sql',
    name_kh: '១១.១១. បញ្ចប់ការប្រឹក្សា EAC លើកទី ២',
    name_en: 'EAC Session 2 Completed',
    category: 'EAC & High VL Management',
    category_kh: '៧. ការប្រឹក្សា EAC (VL ខ្ពស់)',
    desc: 'ចំនួនអ្នកជំងឺដែលបានបញ្ចប់ការប្រឹក្សាពង្រឹងការហូបថ្នាំ លើកទី២'
  },
  {
    id: '11.12_eac_3',
    sql_file: '11.12_eac_session_3.sql',
    name_kh: '១១.១២. បញ្ចប់ការប្រឹក្សា EAC លើកទី ៣',
    name_en: 'EAC Session 3 Completed',
    category: 'EAC & High VL Management',
    category_kh: '៧. ការប្រឹក្សា EAC (VL ខ្ពស់)',
    desc: 'ចំនួនអ្នកជំងឺដែលបានបញ្ចប់ការប្រឹក្សាពង្រឹងការហូបថ្នាំ លើកទី៣'
  },
  {
    id: '11.13_vl_after_eac',
    sql_file: '11.13_vl_followup_6m_after_eac.sql',
    name_kh: '១១.១៣. តេស្ត VL តាមដាន ៦ខែ ក្រោយ EAC',
    name_en: 'VL Follow-up 6M After EAC',
    category: 'EAC & High VL Management',
    category_kh: '៧. ការប្រឹក្សា EAC (VL ខ្ពស់)',
    desc: 'អ្នកជំងឺដែលបានតេស្ត VL ឡើងវិញ ៦ ខែ បន្ទាប់ពីបញ្ចប់វគ្គ EAC'
  },

  // --- Category 8: Site Performance & Evaluation ---
  {
    id: 'site_active_art',
    sql_file: '11_active_art_current.sql',
    name_kh: '០៨.១. ចំនួនអ្នកជំងឺ ART សកម្ម តាមមណ្ឌលព្យាបាល',
    name_en: 'Active ART Patients by Facility Site',
    category: 'Site Performance & Evaluation',
    category_kh: '៨. សមត្ថកិច្ចមណ្ឌល (Sites Performance)',
    desc: 'ចំនួនអ្នកជំងឺទទួលការព្យាបាល ART សកម្ម តាមមណ្ឌលព្យាបាលនីមួយៗ'
  },
  {
    id: 'site_newly_initiated',
    sql_file: '05_newly_initiated.sql',
    name_kh: '០៨.២. ចំនួនអ្នកជំងឺចាប់ផ្តើម ART ថ្មី តាមមណ្ឌល',
    name_en: 'Newly Initiated ART Patients by Facility Site',
    category: 'Site Performance & Evaluation',
    category_kh: '៨. សមត្ថកិច្ចមណ្ឌល (Sites Performance)',
    desc: 'ចំនួនអ្នកជំងឺដែលទើបចាប់ផ្តើមទទួលការព្យាបាល ART ថ្មី តាមមណ្ឌល'
  },
  {
    id: 'site_mmd_rate',
    sql_file: '11.2_mmd_patients.sql',
    name_kh: '០៨.៣. អត្រាផ្តល់ថ្នាំ MMD (3M/6M) តាមមណ្ឌល (%)',
    name_en: 'MMD Coverage Rate by Facility Site (%)',
    category: 'Site Performance & Evaluation',
    category_kh: '៨. សមត្ថកិច្ចមណ្ឌល (Sites Performance)',
    desc: 'សមាមាត្រអ្នកជំងឺ ART ដែលទទួលបានសេវាផ្តល់ថ្នាំ MMD តាមមណ្ឌល'
  },
  {
    id: 'site_vl_suppression',
    sql_file: '11.8_vl_suppression.sql',
    name_kh: '០៨.៤. អត្រាបង្ក្រាបវីរុស VL តាមមណ្ឌល (%)',
    name_en: 'VL Suppression Rate by Facility Site (%)',
    category: 'Site Performance & Evaluation',
    category_kh: '៨. សមត្ថកិច្ចមណ្ឌល (Sites Performance)',
    desc: 'អត្រាបង្ក្រាបមេរោគអេដស៍ (VL Suppression < 1000 copies/mL) តាមមណ្ឌល'
  }
];

export default function IndicatorSelectModal({
  value = 'active_art',
  onChange,
  className = ''
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [tempValue, setTempValue] = useState(value);

  const selectedIndicator = useMemo(() => {
    return NATIONAL_REPORT_INDICATORS.find((i) => i.id === value) || NATIONAL_REPORT_INDICATORS[0];
  }, [value]);

  const categories = useMemo(() => {
    const set = new Set();
    NATIONAL_REPORT_INDICATORS.forEach((i) => set.add(i.category_kh));
    return ['ALL', ...Array.from(set)];
  }, []);

  const filteredIndicators = useMemo(() => {
    return NATIONAL_REPORT_INDICATORS.filter((i) => {
      const matchCat = selectedCategory === 'ALL' || i.category_kh === selectedCategory;
      if (!matchCat) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        i.name_kh.toLowerCase().includes(q) ||
        i.name_en.toLowerCase().includes(q) ||
        i.id.toLowerCase().includes(q) ||
        i.sql_file.toLowerCase().includes(q)
      );
    });
  }, [search, selectedCategory]);

  const handleOpen = () => {
    setTempValue(value);
    setSearch('');
    setSelectedCategory('ALL');
    setIsOpen(true);
  };

  const handleConfirm = () => {
    onChange(tempValue);
    setIsOpen(false);
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={handleOpen}
        className={`flex items-center gap-1.5 border border-primary/40 bg-primary/10 hover:bg-primary/20 px-3 py-1 text-xs rounded-none transition-colors cursor-pointer font-khmer ${className}`}
      >
        <RiBarChartGroupedLine className="size-3.5 text-primary shrink-0" />
        <span className="text-primary text-[10px] font-bold uppercase">សូចនាករ:</span>
        <span className="font-extrabold text-foreground truncate max-w-[210px]">
          {selectedIndicator.name_kh}
        </span>
        <RiArrowDownSLine className="size-3.5 text-muted-foreground shrink-0" />
      </button>

      {/* Modal Dialog Portal */}
      {isOpen &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div
              className="w-full max-w-2xl border border-border/80 bg-card p-5 shadow-2xl rounded-none space-y-4 font-khmer max-h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-border/60 pb-3 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="size-8 bg-primary/20 text-primary border border-primary/30 flex items-center justify-center">
                    <RiBarChartGroupedLine className="size-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-foreground uppercase tracking-wide">
                      បញ្ជីសូចនាកររបាយការណ៍ជាតិសរុប ({NATIONAL_REPORT_INDICATORS.length} Indicators)
                    </h3>
                    <p className="text-[11px] text-muted-foreground">
                      ជ្រើសរើសសូចនាករជាតិពីប្រព័ន្ធទិន្នន័យដើម្បីប្រៀបធៀបការវិវត្តតាមកាលបរិច្ឆេទ
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-none transition-colors"
                >
                  <RiCloseLine className="size-5" />
                </button>
              </div>

              {/* Search & Category Filter Header */}
              <div className="space-y-2.5 shrink-0">
                <div className="relative">
                  <RiSearchLine className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="ស្វែងរកតាមឈ្មោះសូចនាករ លេខកូដ ឬ ឯកសារ SQL (ឧ. 11.2, VL, MMD, TPT)..."
                    className="h-9 w-full border border-border/80 bg-background pl-9 pr-3 text-xs text-foreground outline-none focus:border-primary rounded-none"
                  />
                </div>

                {/* Category Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-2.5 py-1 text-[11px] font-bold shrink-0 transition-colors rounded-none border ${
                        selectedCategory === cat
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-muted/30 border-border/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      {cat === 'ALL' ? `គ្រប់សូចនាករទាំងអស់ (${NATIONAL_REPORT_INDICATORS.length})` : cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Indicator Items List */}
              <div className="overflow-y-auto space-y-2 pr-1 flex-1 min-h-[280px] no-scrollbar">
                {filteredIndicators.map((ind) => {
                  const isSelected = tempValue === ind.id;
                  return (
                    <div
                      key={ind.id}
                      onClick={() => setTempValue(ind.id)}
                      className={`p-3 border rounded-none cursor-pointer transition-all flex items-start justify-between gap-3 ${
                        isSelected
                          ? 'border-primary bg-primary/10 text-foreground font-bold shadow-xs'
                          : 'border-border/60 bg-muted/20 hover:bg-muted/50 text-muted-foreground'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-xs font-black ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                            {ind.name_kh}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-mono bg-muted/50 px-1.5 py-0.5 border border-border/40">
                            {ind.name_en}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-normal">
                          {ind.desc}
                        </p>
                        <div className="flex items-center gap-2 text-[9px] font-mono text-muted-foreground">
                          <span className="text-primary/90 font-bold bg-primary/5 px-1.5 py-0.5 border border-primary/20">
                            {ind.category_kh}
                          </span>
                          <span>SQL: {ind.sql_file}</span>
                        </div>
                      </div>

                      <div className={`size-5 rounded-none border flex items-center justify-center shrink-0 mt-0.5 ${
                        isSelected ? 'bg-primary text-primary-foreground border-primary' : 'border-border/80 bg-background'
                      }`}>
                        {isSelected && <RiCheckLine className="size-3.5" />}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Modal Footer Actions */}
              <div className="flex items-center justify-between border-t border-border/60 pt-3 shrink-0">
                <span className="text-[11px] text-muted-foreground truncate max-w-[280px]">
                  បានជ្រើស: <strong className="text-primary">{NATIONAL_REPORT_INDICATORS.find(i=>i.id===tempValue)?.name_kh}</strong>
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-3 py-1.5 text-xs font-bold border border-border/80 bg-background text-foreground hover:bg-muted transition-colors rounded-none cursor-pointer"
                  >
                    បោះបង់ (Cancel)
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirm}
                    className="px-4 py-1.5 text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors rounded-none cursor-pointer shadow-xs"
                  >
                    យល់ព្រម (Apply Selection)
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
