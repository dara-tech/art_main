const express = require('express');
const router = express.Router();
const { getWarehouseSequelize } = require('../config/warehouseDatabase');

/**
 * Fetch real national + province-level summary data from warehouse DB.
 * Returns a structured context object to enrich the AI prompt with live data.
 */
async function fetchLiveDatabaseContext(periodLabel = '2026-Q3') {
  const db = getWarehouseSequelize();

  // ── National rollup ──────────────────────────────────────────────────────
  const nationalRows = await db.query(
    `SELECT indicator,
       SUM(male_0_14 + female_0_14 + male_over_14 + female_over_14) AS total,
       COUNT(DISTINCT site_code) AS site_count,
       COUNT(DISTINCT province_id) AS province_count
     FROM analytics_indicator_summary
     WHERE period_label = :periodLabel
     GROUP BY indicator`,
    { replacements: { periodLabel }, type: db.QueryTypes.SELECT }
  );

  const nat = {};
  for (const r of nationalRows) nat[r.indicator] = r;
  const g = (k) => Number(nat[k]?.total || 0);

  const activeART       = g('11. Active ART patients at end of this quarter');
  const activePreART    = g('10. Active Pre-ART patients at end of this quarter');
  const newlyInitiated  = g('5. Newly Initiated');
  const sameDay         = g('5.1.1. New ART started: Same day');
  const withTLD         = g('5.2. New ART started with TLD');
  const eligibleVL      = g('11.6. Eligible for VL test');
  const vlTested        = g('11.7. VL tested in 12M');
  const vlSuppressed    = g('11.8. VL suppression');
  const eligibleMMD     = g('11.1. Eligible MMD');
  const onMMD           = g('11.2. MMD');
  const onTLD           = g('11.3. TLD');
  const tptStart        = g('11.4. TPT Start');
  const tptComplete     = g('11.5. TPT Complete');
  const dead            = g('9.1. Dead');
  const ltfu            = g('9.2. Lost to follow up (LTFU)');
  const transferOut     = g('9.3. Transferred-out');
  const siteCount       = Number(nat['11. Active ART patients at end of this quarter']?.site_count || 0);
  const provinceCount   = Number(nat['11. Active ART patients at end of this quarter']?.province_count || 0);

  const pct = (n, d) => d > 0 ? ((n / d) * 100).toFixed(1) + '%' : 'N/A';

  // ── Province-level rollup ────────────────────────────────────────────────
  const provRows = await db.query(
    `SELECT province_name, indicator,
       SUM(male_0_14 + female_0_14 + male_over_14 + female_over_14) AS total
     FROM analytics_indicator_summary
     WHERE period_label = :periodLabel
     GROUP BY province_name, indicator
     ORDER BY province_name, indicator`,
    { replacements: { periodLabel }, type: db.QueryTypes.SELECT }
  );

  // Build { provinceName: { indicatorName: total } }
  const byProvince = {};
  for (const r of provRows) {
    if (!byProvince[r.province_name]) byProvince[r.province_name] = {};
    byProvince[r.province_name][r.indicator] = Number(r.total || 0);
  }

  // Build a compact province summary table string for the AI prompt
  const provinceLines = Object.entries(byProvince).map(([prov, ind]) => {
    const pActiveART   = ind['11. Active ART patients at end of this quarter'] || 0;
    const pEligVL      = ind['11.6. Eligible for VL test'] || 0;
    const pVLTested    = ind['11.7. VL tested in 12M'] || 0;
    const pVLSupp      = ind['11.8. VL suppression'] || 0;
    const pMMD         = ind['11.2. MMD'] || 0;
    const pEligMMD     = ind['11.1. Eligible MMD'] || 0;
    const pTLD         = ind['11.3. TLD'] || 0;
    const pDead        = ind['9.1. Dead'] || 0;
    const pLTFU        = ind['9.2. Lost to follow up (LTFU)'] || 0;
    const pVLSuppRate  = pEligVL > 0 ? ((pVLSupp / pEligVL) * 100).toFixed(1) + '%' : 'N/A';
    const pMMDRate     = pEligMMD > 0 ? ((pMMD / pEligMMD) * 100).toFixed(1) + '%' : 'N/A';
    return `  ${prov}: Active ART=${pActiveART}, VL Eligible=${pEligVL}, VL Tested=${pVLTested}, VL Suppressed=${pVLSupp} (${pVLSuppRate}), MMD=${pMMD}/${pEligMMD} (${pMMDRate}), TLD=${pTLD}, LTFU=${pLTFU}, Dead=${pDead}`;
  }).join('\n');

  return {
    periodLabel,
    activeART, activePreART, newlyInitiated, sameDay, withTLD,
    eligibleVL, vlTested, vlSuppressed,
    vlSuppressionRate: pct(vlSuppressed, eligibleVL),
    eligibleMMD, onMMD, mmdRate: pct(onMMD, eligibleMMD),
    onTLD, tldRate: pct(withTLD, newlyInitiated),
    sameDayRate: pct(sameDay, newlyInitiated),
    tptStart, tptComplete, dead, ltfu, transferOut,
    siteCount, provinceCount,
    provinceLines
  };
}

/**
 * POST /apiv1/ai/copilot-query
 * Fetches live database context then calls Gemini to produce a structured Khmer response.
 */
router.post('/copilot-query', async (req, res) => {
  const startTime = Date.now();
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const query = String(req.body?.query || '').trim();
    const periodLabel = req.body?.periodLabel || '2026-Q3';

    if (!query) {
      return res.status(400).json({ success: false, error: 'Query is required' });
    }
    if (!apiKey) {
      return res.status(500).json({ success: false, error: 'GEMINI_API_KEY not configured' });
    }

    // ── 1. Fetch live data from database ─────────────────────────────────────
    let dbContext = null;
    try {
      dbContext = await fetchLiveDatabaseContext(periodLabel);
    } catch (dbErr) {
      console.warn('DB context fetch failed (AI will work without live data):', dbErr.message);
    }

    // ── 2. Build system instruction with real DB data ────────────────────────
    const dataSection = dbContext
      ? `
LIVE DATABASE DATA (${dbContext.periodLabel}) — Always use these exact real numbers. Do NOT invent or estimate values.

NATIONAL TOTALS:
- Active ART Patients: ${dbContext.activeART.toLocaleString()}
- Active Pre-ART Patients: ${dbContext.activePreART.toLocaleString()}
- Newly Initiated on ART: ${dbContext.newlyInitiated.toLocaleString()}
- Same-Day ART Start Rate: ${dbContext.sameDayRate} (${dbContext.sameDay.toLocaleString()} patients)
- New Patients Started on TLD: ${dbContext.withTLD.toLocaleString()} (${dbContext.tldRate})
- Eligible for VL Test: ${dbContext.eligibleVL.toLocaleString()}
- VL Tested in 12 Months: ${dbContext.vlTested.toLocaleString()}
- VL Suppressed (<1000 copies): ${dbContext.vlSuppressed.toLocaleString()} — VL Suppression Rate: ${dbContext.vlSuppressionRate}
- Eligible for MMD: ${dbContext.eligibleMMD.toLocaleString()}
- On Multi-Month Dispensing (MMD): ${dbContext.onMMD.toLocaleString()} (${dbContext.mmdRate})
- On TLD Regimen: ${dbContext.onTLD.toLocaleString()}
- TPT Started: ${dbContext.tptStart.toLocaleString()}
- TPT Completed: ${dbContext.tptComplete.toLocaleString()}
- Deaths: ${dbContext.dead.toLocaleString()}
- Lost to Follow-Up (LTFU): ${dbContext.ltfu.toLocaleString()}
- Transferred Out: ${dbContext.transferOut.toLocaleString()}
- Reporting Sites: ${dbContext.siteCount}
- Reporting Provinces: ${dbContext.provinceCount}

PROVINCE-LEVEL BREAKDOWN (format: Active ART, VL Eligible, VL Tested, VL Suppressed (Rate%), MMD/Eligible (Rate%), TLD, LTFU, Dead):
${dbContext.provinceLines}

IMPORTANT RULES FOR DATA:
- VL Suppression Rate = VL Suppressed ÷ VL Eligible × 100 (must be ≤100%)
- MMD Rate = MMD ÷ Eligible MMD × 100
- Always use province-specific numbers when the user asks about a specific province`
      : `
No live database connection available. Use your general knowledge about Cambodia's NCHADS HIV/ART program to answer.`;

    const systemInstruction = `You are an intelligent AI assistant built into the NCHADS ART Data Intelligence Platform for Cambodia.
You can answer ANY question — general knowledge, healthcare data analysis, calculations, programming, and more.
Always respond in professional Khmer (ភាសាខ្មែរ). Do not use emojis.
${dataSection}

ALWAYS return a valid JSON object with exactly these fields:
- title: short Khmer string summarizing the answer topic
- badge: most fitting label from: "សង្ខេបថ្នាក់ជាតិ", "ត្រួតពិនិត្យ DQA", "ការផ្តល់ថ្នាំ", "សមត្ថកិច្ចគ្រូពេទ្យ", "ចំណេះដឹងទូទៅ", "AI វិភាគ", "ការគណនា"
- sql: relevant PostgreSQL query if data-related, otherwise empty string ""
- stats: array of exactly 3 objects with "label" (Khmer) and "val" (Khmer) — use real numbers from the data above when applicable
- findings: array of exactly 3 short Khmer plain-text sentences as the main answer — NO JSON objects inside
- action: single Khmer sentence with a useful recommendation or takeaway`;

    // ── 3. Call Gemini ────────────────────────────────────────────────────────
    const requestBody = {
      system_instruction: { parts: [{ text: systemInstruction }] },
      contents: [{ role: 'user', parts: [{ text: query }] }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 2048,
        responseMimeType: 'application/json'
      }
    };

    const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API Error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    const candidate = data?.candidates?.[0];
    const finishReason = candidate?.finishReason || 'UNKNOWN';
    const rawText = (candidate?.content?.parts || []).map(p => p.text || '').join('');
    const executionLatency = `${Date.now() - startTime}ms`;

    console.log(`Gemini finish_reason=${finishReason}, raw_length=${rawText.length}`);

    if (!rawText) {
      throw new Error(`Gemini returned empty response. finish_reason=${finishReason}`);
    }

    // ── 4. Parse JSON response ────────────────────────────────────────────────
    let parsedResult;
    try {
      parsedResult = JSON.parse(rawText);
    } catch (_e) {
      const match = rawText.match(/\{[\s\S]*\}/);
      if (!match) throw new Error('Gemini returned non-JSON response.');
      try { parsedResult = JSON.parse(match[0]); }
      catch (e2) { throw new Error('Gemini returned malformed JSON.'); }
    }

    return res.json({
      success: true,
      data: { ...parsedResult, latency: executionLatency }
    });

  } catch (error) {
    console.error('Gemini AI Query Error:', error.message);
    return res.status(500).json({
      success: false,
      error: error.message || 'AI processing failed'
    });
  }
});

module.exports = router;
