/**
 * Khmer labels for PNTT aggregate scripts — aligned with Report Home PnttReportTable.jsx
 */

const RISK_BLOCK_KH = 'របាយការណ៍សរុបនៃការស្រាវជ្រាវរកកត្តាប្រឈមរបស់អ្នកជំងឺតម្រុយ';

const INDEX_STRUCTURE = [
  { displayNum: 11, labelKh: 'ចំនួនអ្នកជំងឺតម្រុយ (>១៤ ឆ្នាំ) ក្នុងត្រីមាស', newScriptId: '11_PNTT_NEW_REG_aggregate', oldScriptId: '11.1_PNTT_OLD_REG_aggregate' },
  { displayNum: 12, labelKh: 'ចំនួនអ្នកជំងឺតម្រុយ ដែលបានផ្តល់សេវាតាមរកដៃគូ', newScriptId: '12_PNTT_NEW_PNS_aggregate', oldScriptId: '12.1_PNTT_OLD_PNS_aggregate' },
  { displayNum: 13, labelKh: 'ចំនួនអ្នកជំងឺតម្រុយ ដែលយល់ព្រមទទួលយកសេវាតាមរកដៃគូ', newScriptId: '13_PNTT_NEW_AGREE_aggregate', oldScriptId: '13.1_PNTT_OLD_AGREE_aggregate' }
];

const PARTNERS_STRUCTURE = [
  { displayNum: 14, labelKh: 'ចំនួនដៃគូដែលបានចុះបញ្ជី', newScriptId: '14_PNTT_NEW_PART_REG_aggregate', oldScriptId: '14.1_PNTT_OLD_PART_REG_aggregate' },
  {
    displayNum: 15,
    labelKh: 'ចំនួនដៃគូដែលបានជួបជូនព័ត៌មាន',
    subRows: [
      { labelKh: 'ដោយអ្នកជំងឺ', newScriptId: '15_PNTT_NEW_PART_REF_aggregate', oldScriptId: '15.1_PNTT_OLD_PART_REF_aggregate' },
      { labelKh: 'ដោយអ្នកផ្តល់សេវា', newScriptId: '18_PNTT_NEW_PART_PROV_aggregate', oldScriptId: '18.1_PNTT_OLD_PART_PROV_aggregate' },
      { labelKh: 'ដោយមានលក្ខខណ្ឌ', newScriptId: '21_PNTT_NEW_PART_CONT_aggregate', oldScriptId: '21.1_PNTT_OLD_PART_CONT_aggregate' },
      { labelKh: 'ដោយអ្នកជំងឺ និងអ្នកផ្តល់សេវា', newScriptId: '22_PNTT_NEW_PART_DUAL_aggregate', oldScriptId: '22.1_PNTT_OLD_PART_DUAL_aggregate' }
    ]
  },
  {
    displayNum: 16,
    labelKh: 'ចំនួនដៃគូដែលបានធ្វើតេស្តរកមេរោគអេដស៍',
    subRows: [
      { labelKh: 'ដៃគូដែលបានធ្វើតេស្តតាម HTS', newScriptId: '16_PNTT_NEW_PART_HTS_aggregate', oldScriptId: '16.1_PNTT_OLD_PART_HTS_aggregate' },
      { labelKh: 'ដៃគូដែលបានធ្វើតេស្តតាមរយៈ HIVST', newScriptId: '19_PNTT_NEW_PART_HIVST_aggregate', oldScriptId: '19.1_PNTT_OLD_PART_HIVST_aggregate' }
    ]
  },
  {
    displayNum: 17,
    labelKh: 'ចំនួនដៃគូដែលបានធ្វើតេស្តរកមេរោគអេដស៍ ហើយមានលទ្ធផលវិជ្ជមាន',
    subRows: [
      { labelKh: 'ដៃគូដែលបានធ្វើតេស្តដំបូងតាម HTS', newScriptId: '17_PNTT_NEW_PART_HTS_POS_aggregate', oldScriptId: '17.1_PNTT_OLD_PART_HTS_POS_aggregate' },
      { labelKh: 'ដៃគូដែលបានធ្វើតេស្តដំបូងតាមរយៈ HIVST', newScriptId: '20_PNTT_NEW_PART_HIVST_POS_aggregate', oldScriptId: '20.1_PNTT_OLD_PART_HIVST_POS_aggregate' }
    ]
  },
  {
    displayNum: 18,
    labelKh: 'ចំនួនដៃគូដែលមានលទ្ធផលវិជ្ជមានបានចុះឈ្មោះទទួលការព្យាបាល សរុប',
    newScriptId: '23_PNTT_NEW_PART_POS_REG_aggregate',
    oldScriptId: '23.1_PNTT_OLD_PART_POS_REG_aggregate'
  }
];

const CHILDREN_STRUCTURE = [
  { displayNum: 19, labelKh: 'ចំនួនកូនអតិថិជនតម្រុយ ដែលបានចុះបញ្ជី', newScriptId: '19_PNTT_NEW_CHILD_REG_aggregate', oldScriptId: '19.1_PNTT_OLD_CHILD_REG_aggregate' },
  {
    displayNum: 20,
    labelKh: 'ចំនួនកូន ដែលបានជួប/ជូនព័ត៌មាន',
    subRows: [
      { labelKh: 'ដោយអ្នកជំងឺ', newScriptId: '20_PNTT_NEW_CHILD_REF_aggregate', oldScriptId: '20.1_PNTT_OLD_CHILD_REF_aggregate' },
      { labelKh: 'ដោយអ្នកផ្តល់សេវា', newScriptId: '20 PNTT_NEW_CHILD_PROV_aggregate', oldScriptId: '20.1 . PNTT_OLD_CHILD_PROV_aggregate' },
      { labelKh: 'ដោយមានលក្ខខណ្ឌ', newScriptId: '20.PNTT_NEW_CHILD_CONT_aggregate', oldScriptId: '20.1 PNTT_OLD_CHILD_CONT_aggregate' },
      { labelKh: 'ដោយអ្នកជំងឺ និងអ្នកផ្តល់សេវា', newScriptId: '20.1_PNTT_NEW_CHILD_DUAL_aggregate', oldScriptId: '20.1 PNTT_OLD_CHILD_DUAL_aggregate' }
    ]
  },
  {
    displayNum: 21,
    labelKh: 'ចំនួនកូនដែលបានធ្វើតេស្តរកមេរោគអេដស៍',
    subRows: [
      { labelKh: 'កូនដែលបានធ្វើតេស្តតាម HTS', newScriptId: '21_PNTT_NEW_CHILD_TEST_aggregate', oldScriptId: '21.1_PNTT_OLD_CHILD_TEST_aggregate' }
    ]
  },
  {
    displayNum: 22,
    labelKh: 'ចំនួនកូនដែលបានធ្វើតេស្ត ហើយមានលទ្ធផលវិជ្ជមាន',
    subRows: [
      { labelKh: 'កូនដែលបានធ្វើតេស្តដំបូងតាម HTS', newScriptId: '22_PNTT_NEW_CHILD_POS_aggregate', oldScriptId: '22.1_PNTT_OLD_CHILD_POS_aggregate' }
    ]
  },
  {
    displayNum: 23,
    labelKh: 'ចំនួនកូន ដែលមានលទ្ធផលវិជ្ជមាន បានចុះឈ្មោះទទួលការព្យាបាល',
    newScriptId: '23_PNTT_NEW_CHILD_POS_REG_aggregate',
    oldScriptId: '23.1_PNTT_OLD_CHILD_POS_REG_aggregate'
  }
];

function normScriptId(id) {
  return String(id || '').trim();
}

function compactScriptId(id) {
  return normScriptId(id).replace(/\s+/g, '');
}

function addLabel(map, scriptId, text) {
  const key = normScriptId(scriptId);
  if (!key || !text) return;
  map.set(key, text);
  map.set(compactScriptId(key), text);
}

function addPair(map, newId, oldId, parentKh, displayNum, subKh) {
  const head = displayNum != null ? `${displayNum}. ${parentKh}` : parentKh;
  const label = subKh ? `${head} — ${subKh}` : head;
  addLabel(map, newId, label);
  addLabel(map, oldId, label);
}

function buildLabelMap() {
  const map = new Map();
  addLabel(map, '1-10 PNTT_NEW_RISK_aggregate', RISK_BLOCK_KH);
  addLabel(map, '1.1-10.1 PNTT_OLD_RISK_aggregate', RISK_BLOCK_KH);
  addLabel(map, '1.1 - 10.1 PNTT_OLD_RISK_aggregate', RISK_BLOCK_KH);

  for (const block of [INDEX_STRUCTURE, PARTNERS_STRUCTURE, CHILDREN_STRUCTURE]) {
    for (const item of block) {
      if (item.subRows) {
        for (const sub of item.subRows) {
          addPair(map, sub.newScriptId, sub.oldScriptId, item.labelKh, item.displayNum, sub.labelKh);
        }
      } else {
        addPair(map, item.newScriptId, item.oldScriptId, item.labelKh, item.displayNum);
      }
    }
  }
  return map;
}

const PNTT_LABEL_BY_SCRIPT = buildLabelMap();

function labelKhForPnttScript(scriptId) {
  const key = normScriptId(scriptId);
  if (PNTT_LABEL_BY_SCRIPT.has(key)) return PNTT_LABEL_BY_SCRIPT.get(key);
  const compact = compactScriptId(key);
  if (PNTT_LABEL_BY_SCRIPT.has(compact)) return PNTT_LABEL_BY_SCRIPT.get(compact);
  return null;
}

module.exports = {
  labelKhForPnttScript,
  PNTT_LABEL_BY_SCRIPT
};
