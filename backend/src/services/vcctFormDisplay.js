/**
 * VCCT HTS form — read-only display matching paper form (all options + selection state).
 */

const SEX_OPTIONS = [
  { id: 1, label: 'ប្រុស' },
  { id: 0, label: 'ស្រី' }
];

const MARITAL_OPTIONS = [
  { id: 0, label: 'នៅលីវ' },
  { id: 1, label: 'រៀបការហើយ' },
  { id: 2, label: 'ពោះម៉ាយ/មេម៉ាយ' },
  { id: 3, label: 'ប័ណ្ណអាពាហ៍ពិពារ' }
];

const EDUCATION_OPTIONS = [
  { id: 1, label: 'មិនដែលរៀន' },
  { id: 2, label: 'បឋមសិក្ធម' },
  { id: 3, label: 'អនុវិទ្យាល័យ' },
  { id: 4, label: 'វិទ្យាល័យ' },
  { id: 5, label: 'ក្រោយវិទ្យាល័យ' }
];

const COUNTRY_OPTIONS = [
  { id: 1, label: 'កម្ពុជា' },
  { id: 2, label: 'វៀតណាម' },
  { id: 3, label: 'ចិន' },
  { id: 4, label: 'ប្រទេសផ្សេងៗ' }
];

const CONSENT_OPTIONS = [
  { id: 1, label: 'យល់ព្រម' },
  { id: 0, label: 'មិនយល់ព្រម' }
];

const HISTORY_TEST_OPTIONS = [
  { id: 1, label: 'មិនធ្លាប់ធ្វើតេស្ត' },
  { id: 2, label: 'ធ្លាប់ធ្វើតេស្ត' }
];

const HIV_RESULT_OPTIONS = [
  { id: 1, label: 'អវិជ្ជមាន' },
  { id: 2, label: 'វិជ្ជមាន' },
  { id: 3, label: 'មិនអាចកំណត់បាន' },
  { id: 4, label: 'មិនបានយកលទ្ធផល' }
];

const COMBO_RESULT_OPTIONS = [
  { id: 1, label: 'គ្មានប្រតិកម្ម' },
  { id: 2, label: 'ប្រតិកម្ម' }
];

const POST_COUNSEL_OPTIONS = [
  { id: 1, label: 'បានផ្តល់ប្រឹក្សា' },
  { id: 2, label: 'មិនបានផ្តល់ប្រឹក្សា' }
];

const RTRI_RESULT_OPTIONS = [
  { id: 1, label: 'ឆ្លងយូរ' },
  { id: 2, label: 'ឆ្លងថ្មី' },
  { id: 3, label: 'មិនអាចកំណត់បាន' },
  { id: 4, label: 'មិនអាចយកជាការបាន' }
];

function fixRtriLabels(options) {
  return options.map((o) =>
    o.id === 2 ? { ...o, label: 'ឆ្លងថ្មី' } : o
  );
}

function n(v) {
  const x = Number(v);
  return Number.isFinite(x) ? x : null;
}

function textVal(v) {
  if (v == null || v === '') return null;
  const s = String(v).trim();
  return s || null;
}

function fmtDate(v) {
  if (!v) return null;
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return textVal(v);
  return d.toISOString().slice(0, 10);
}

function ageFromDob(dob) {
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age -= 1;
  return age >= 0 && age < 130 ? age : null;
}

function textItem(label, value) {
  return { type: 'text', label, value: value ?? '—' };
}

function singleChoice(label, options, selectedId) {
  const sel = n(selectedId);
  return {
    type: 'single',
    label,
    options: options.map((o) => ({
      id: o.id,
      label: o.label,
      selected: sel != null && sel === n(o.id)
    }))
  };
}

function multiChoice(label, options, selectedIds) {
  const set = selectedIds instanceof Set ? selectedIds : new Set(selectedIds || []);
  return {
    type: 'multi',
    label,
    options: options.map((o) => ({
      id: o.id,
      label: o.label,
      selected: set.has(o.id)
    }))
  };
}

function yesNoItem(index, label, raw) {
  const v = n(raw);
  return {
    type: 'yesNo',
    index,
    label,
    yes: v === 1,
    no: v === 0,
    unknown: v == null || v === -1
  };
}

function noteItem(text) {
  return { type: 'note', text };
}

function numberedOptions(options, { otherId = null } = {}) {
  return options.map((o) => {
    const n = otherId != null && o.id === otherId ? options.length : o.id;
    return { id: o.id, label: `${n}. ${o.label}` };
  });
}

function fmtVcctId(v) {
  if (v == null || v === '') return null;
  const s = String(v).trim();
  if (/^\d+$/.test(s) && s.length < 6) return s.padStart(6, '0');
  return s;
}
function flagSelectedIds(record, prefix, max) {
  const ids = [];
  if (!record) return ids;
  for (let i = 1; i <= max; i += 1) {
    if (Number(record[`${prefix}${i}`]) === 1) ids.push(i);
  }
  return ids;
}

function lookupName(map, id) {
  if (id == null) return null;
  return map?.get(Number(id)) || null;
}

function buildVcctFormPages({ summary, lineTest, risks, reasons, retests, ctx }) {
  if (!summary) return [];

  const s = summary;
  const dob = fmtDate(s.dob);
  const age = ageFromDob(s.dob);

  const occupationOpts = numberedOptions(ctx.occupationOptions || [], { otherId: 99 });
  const referFromOpts = numberedOptions(ctx.referFromOptions || []);
  const reasonOpts = numberedOptions(ctx.reasonOptions || []);
  const patientTypeOpts = numberedOptions(ctx.patientTypeOptions || []);
  const referToOpts = numberedOptions(ctx.referToOptions || []);

  const riskItems = [];
  for (let i = 1; i <= 18; i += 1) {
    const label = ctx.risks?.get(i) || `ហានិភ័យ ${i}`;
    riskItems.push(yesNoItem(i, label, risks?.[`risk${i}`]));
  }

  const hivNegative =
    n(s.hiv_result) === 1 ||
    (s.hiv_result_label && String(s.hiv_result_label).includes('អវិ'));

  const pages = [
    {
      id: 'page1',
      title: 'រូបភាពទី ១ — រដ្ឋបាល និងព័ត៌មានអតិថិជន',
      groups: [
        {
          title: 'ឧបករណ៍កំណត់អត្តសញ្ញាណ',
          items: [
            textItem('1. លេខកូដអតិថិជន (Client ID)', fmtVcctId(s.vcct_id)),
            textItem('2. កាលបរិច្ឆេទ (Date)', fmtDate(s.registration_date)),
            textItem('3. លេខកូដ PMRS', textVal(s.pmrs_code)),
            textItem('4. លេខកូដ HTS', textVal(s.hts_code)),
            textItem('5. លេខកូដ UUIC', textVal(s.uuic))
          ]
        },
        {
          title: 'ព័ត៌មានអតិថិជន',
          items: [
            singleChoice('6. ភេទកំណើត', SEX_OPTIONS, s.sex),
            textItem(
              '7. ថ្ងៃខែឆ្នាំកំណើត / អាយុ',
              dob ? `${dob}${age != null ? ` · អាយុ ${age}` : ''}` : '—'
            ),
            singleChoice('8. ស្ថានភាពអាពាហ៍ពិពាហ៍', MARITAL_OPTIONS, s.marital_status_id),
            singleChoice('9. មុខរបរ', occupationOpts, s.occupation_id),
            ...(textVal(s.occupation_other)
              ? [textItem('9. មុខរបរផ្សេង', s.occupation_other)]
              : []),
            singleChoice('10. កម្រិតវប្បធម៌', EDUCATION_OPTIONS, s.education_id),
            textItem('11. ខេត្ត', lookupName(ctx.province, s.province_id) || '—'),
            textItem('11. ស្រុក', lookupName(ctx.district, s.district_id) || '—'),
            textItem('11. ឃុំ', lookupName(ctx.commune, s.commune_id) || '—'),
            textItem('11. ភូមិ', lookupName(ctx.village, s.village_id) || '—'),
            singleChoice(
              '12. ប្រទេសកំណើត',
              COUNTRY_OPTIONS,
              s.country_of_birth_id
            ),
            ...(textVal(s.country_of_birth_other)
              ? [textItem('12. ប្រទេសកំណើតផ្សេង', s.country_of_birth_other)]
              : [])
          ]
        }
      ]
    },
    {
      id: 'page2',
      title: 'រូបភាពទី ២ — ការចូលរកសេវា',
      groups: [
        {
          title: '13. បញ្ជូនមកពី',
          items: [singleChoice('', referFromOpts, s.refer_from_id)]
        },
        {
          title: '14. មូលហេតុរកសេវា',
          items: [
            multiChoice('', reasonOpts, flagSelectedIds(reasons, 'rs', 14))
          ]
        }
      ]
    },
    {
      id: 'page3',
      title: 'រូបភាពទី ៣ — វាយតម្លៃហានិភ័យ (១២ ខែ)',
      groups: [{ title: '15. ការប្រឈមមុខ', items: riskItems }]
    },
    {
      id: 'page4',
      title: 'រូបភាពទី ៤ — ប្រភេទអតិថិជន និងតេស្ត',
      groups: [
        {
          title: '16. ប្រភេទអតិថិជន',
          items: [singleChoice('', patientTypeOpts, s.patient_type_id)]
        },
        {
          title: '17. ប្រវត្តិធ្វើតេស្ត',
          items: [
            singleChoice('', HISTORY_TEST_OPTIONS, s.history_of_test),
            ...(n(s.history_of_test) === 2
              ? [
                  singleChoice(
                    'លទ្ធផលក្នុង ១២ ខែចុងក្រោយ',
                    HIV_RESULT_OPTIONS,
                    s.history_of_test_result
                  ),
                  singleChoice('លទ្ធផលដៃគូ ១', HIV_RESULT_OPTIONS, s.history_partner_result1),
                  singleChoice('លទ្ធផលដៃគូ ២', HIV_RESULT_OPTIONS, s.history_partner_result2)
                ]
              : [noteItem('លទ្ធផលតេស្តមុន — (មិនធ្លាប់ធ្វើតេស្ត)')])
          ]
        },
        {
          title: '18. ផ្តល់ការធ្វើតេស្ត HIV',
          items: [
            singleChoice('យល់ព្រមតេស្ត', CONSENT_OPTIONS, s.is_agree_test_hiv),
            singleChoice('លទ្ធផល HIV Alere Combo', COMBO_RESULT_OPTIONS, s.combo_result),
            ...(lineTest
              ? [
                  yesNoItem(null, 'Ag (Cambo Ag)', lineTest.cambo_ag),
                  yesNoItem(null, 'Ab (Cambo Ab)', lineTest.cambo_ab),
                  yesNoItem(null, 'បន្ទាត់គុណ', lineTest.line_control),
                  yesNoItem(null, 'បន្ទាត់វិជ្ជមាន', lineTest.line_positive),
                  yesNoItem(null, 'បន្ទាត់រយៈពេលវែង', lineTest.line_longterm)
                ]
              : []),
            singleChoice(
              'លទ្ធផលចុងក្រោយ (Diagnosis)',
              HIV_RESULT_OPTIONS.slice(0, 3),
              s.hiv_result
            )
          ]
        }
      ]
    },
    {
      id: 'page5',
      title: 'រូបភាពទី ៥ — តេស្តបន្ថែម និងបញ្ជូន',
      groups: [
        {
          title: '19. តេស្ត RTRI',
          items: hivNegative
            ? [noteItem(
            ' លទ្ធផល HIV អវិជ្ជមាន')]
            : [
                singleChoice('យល់ព្រម RTRI', CONSENT_OPTIONS, s.is_agree_test_rtri),
                singleChoice('លទ្ធផល RTRI', fixRtriLabels(RTRI_RESULT_OPTIONS), s.rtri_result_id),
                yesNoItem(null, 'តេស្តដំបូងមិនត្រឹមត្រូវ', s.is_first_invalid)
              ]
        },
        {
          title: '20. តេស្ត VL / RITA',
          items: [
            singleChoice('យល់ព្រម VL', CONSENT_OPTIONS, s.is_agree_test_vl),
            textItem('លទ្ធផល VL', lookupName(ctx.vl, s.vl_result) || textVal(s.vl_result)),
            textItem('លទ្ធផល RITA', lookupName(ctx.rita, s.rita_result) || textVal(s.rita_result))
          ]
        },
        {
          title: '21. ប្រឹក្សាក្រោយតេស្ត',
          items: [
            singleChoice('', POST_COUNSEL_OPTIONS, s.post_counseling_id),
            textItem('កាលបរិច្ឆេទ', fmtDate(s.post_counseling_date))
          ]
        },
        {
          title: '22. បញ្ជូនទៅ',
          items: [
            singleChoice('', referToOpts, s.refer_to_service_id),
            ...(textVal(s.refer_to_other) ? [textItem('សេវាផ្សេង', s.refer_to_other)] : [])
          ]
        },
        {
          title: 'ហត្ថលេខា / ឈ្មោះ',
          items: [
            textItem(
              'អ្នកផ្តល់ប្រឹក្សា',
              textVal(s.counselor_code_deprecated) || textVal(s.counselor_id) || '—'
            )
          ]
        },
        ...(retests?.length
          ? [
              {
                title: 'តេស្តម្តងទៀត',
                items: retests.slice(0, 10).map((r, i) =>
                  textItem(
                    `#${i + 1} ${fmtDate(r.test_date) || ''}`,
                    [r.result, r.sex_label ?? r.sex, r.age != null ? `អាយុ ${r.age}` : null]
                      .filter(Boolean)
                      .join(' · ')
                  )
                )
              }
            ]
          : []),
        {
          title: 'ប្រព័ន្ធ',
          items: [
            textItem('កូដ VCCT', textVal(s.site_code)),
            textItem('បង្កើត', fmtDate(s.created_at)),
            textItem('ធ្វើបច្ចុប្បន្នភាព', fmtDate(s.updated_at)),
            ...(s.device_name || s.device_id
              ? [textItem('ឧបករណ៍', [s.device_name, s.device_id].filter(Boolean).join(' · '))]
              : [])
          ]
        }
      ]
    }
  ];

  return pages;
}

module.exports = { buildVcctFormPages };
