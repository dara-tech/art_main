/** Pixel width for one column — sized for single-line Khmer/English headers (no wrap). */
export function columnWidthForField(key, label, columnCount) {
  const k = String(key || '');
  const text = String(label || k);
  const L = text.length;
  const khmer = /[\u1780-\u17FF]/.test(text);
  const pxPerChar = khmer ? 12 : 10;

  const fromLabel = Math.min(200, Math.max(88, L * pxPerChar + 24));

  if (/^(Da|Dat|Date)/i.test(k) || /ថ្ងៃ/i.test(text)) return Math.max(fromLabel, 112);
  if (/^(Weight|Height|WHO|CD4|CD8|Age|Num|Sex|ARTnum|TestID)$/i.test(k)) return Math.max(fromLabel, 88);
  if (/^(Status|Type|Result|Drug|Dose|Place|Cause)$/i.test(k)) return Math.max(fromLabel, 100);
  if (/^(DrugName|Allergy|Province|District|Village|Faminily)/i.test(k)) return Math.max(fromLabel, 128);
  if (/^vcct$/i.test(k)) return Math.max(fromLabel, 128);

  if (columnCount > 16) return Math.max(fromLabel, 112);
  if (columnCount > 12) return Math.max(fromLabel, 104);
  return fromLabel;
}
