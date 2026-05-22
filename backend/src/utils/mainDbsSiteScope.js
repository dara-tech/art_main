const AGGREGATE_SITE_TABLES = new Set([
  'tblaimain',
  'tblaumain',
  'tblcimain',
  'tblcumain',
  'tbleimain',
  'tblavmain',
  'tblcvmain',
  'tblevmain',
  'tblaart',
  'tblcart',
  'tbleart',
  'tblavpatientstatus',
  'tblcvpatientstatus',
  'tblevpatientstatus',
  'tblpatienttest',
  'tblavarvdrug',
  'tblcvarvdrug',
  'tblevarvdrug',
  'tblavtptdrug',
  'tblcvtptdrug',
  'tbletest',
  'tblapntt',
  'tblapnttpart',
  'tblapnttchild',
  'tblapnttpartcont',
  'tblapnttchildcont'
]);

function applyMainDbsSiteScope(sql, siteCode) {
  const q = String(siteCode || '').replace(/'/g, "''");
  const tables = Array.from(AGGREGATE_SITE_TABLES).sort((a, b) => b.length - a.length);
  const tableAlt = tables.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');

  const joinKw =
    '(?:FROM|LEFT\\s+OUTER\\s+JOIN|RIGHT\\s+OUTER\\s+JOIN|LEFT\\s+JOIN|RIGHT\\s+JOIN|INNER\\s+JOIN|JOIN)';

  const re = new RegExp(
    `\\b(${joinKw})\\s+(${tableAlt})\\b(?:\\s+(?!WHERE\\b|ON\\b|ORDER\\b|GROUP\\b|LIMIT\\b|HAVING\\b|UNION\\b|SELECT\\b|INNER\\b|LEFT\\b|RIGHT\\b|OUTER\\b|JOIN\\b)([a-zA-Z_][a-zA-Z0-9_]*))?`,
    'gi'
  );

  const blocks = [];
  let i = 0;

  const withPlaceholders = sql.replace(re, (match, keyword, tbl, alias) => {
    const id = `__AGG_SCOPE_${i++}__`;
    blocks.push({ id, tbl, q });
    if (alias) return `${keyword} ${id} ${alias}`;
    return `${keyword} ${id} AS ${tbl}`;
  });

  let out = withPlaceholders;
  for (const b of blocks) {
    const sub = b.q.toLowerCase() === 'all' || !b.q
      ? `(SELECT * FROM ${b.tbl})`
      : `(SELECT * FROM ${b.tbl} WHERE site_code = '${b.q}')`;
    out = out.split(b.id).join(sub);
  }
  return out;
}

module.exports = { applyMainDbsSiteScope };
