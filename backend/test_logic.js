const ids = ['11.2_mmd', '11.14_vl_followup_6m_apart_high_vl'];
const sqls = {
  '11.2_mmd': `SELECT '11.2. MMD' AS Indicator, IFNULL(SUM(1),0) FROM x`,
  '11.14_vl_followup_6m_apart_high_vl': `SELECT '11.14. VL follow-up 6+ months after high VL' AS Indicator FROM x`
};
const countryRows = [
  { indicator: '11.2. MMD' },
  { indicator: '11.14. VL follow-up 6+ months after high VL' }
];

const missing = [];
ids.forEach(id => {
  const sql = sqls[id];
  const match = sql.match(/['"]([^'"]+)['"]\s+AS\s+Indicator/i);
  const expectedLabel = match ? match[1].trim() : id.trim();
  console.log(`id: ${id}, expectedLabel: "${expectedLabel}"`);
  
  const isPresent = countryRows.some(r => {
    const rInd = String(r.indicator).trim();
    return rInd === expectedLabel || rInd === id;
  });
  console.log(`isPresent: ${isPresent}`);
  if (!isPresent) {
    missing.push(id);
  }
});
console.log('Missing:', missing);
