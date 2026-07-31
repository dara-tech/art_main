const express = require('express');
const router = express.Router();
const axios = require('axios');

const LAB_USER = 'mpi.sys';
const LAB_PASS = 'fT.!ga~Ndc8z@EM>7X4B2=F9?';
const DEFAULT_PUBLIC_URL = 'http://36.37.175.123:9091';
const DEFAULT_LAN_URL = 'http://192.168.0.27:9091';

// Basic Auth Header
const authHeader = `Basic ${Buffer.from(`${LAB_USER}:${LAB_PASS}`).toString('base64')}`;

// Mock Generator for Lab Results when external service is offline or unreachable
function generateFallbackLabResults(start, end, type = 'hiv') {
  const sampleFacilities = [
    { code: '1201', name: 'National Pediatric Hospital (NPH) Lab', province: 'Phnom Penh' },
    { code: '1202', name: 'Calmette Hospital Central Lab', province: 'Phnom Penh' },
    { code: '1203', name: 'Khmer-Soviet Friendship Hospital Lab', province: 'Phnom Penh' },
    { code: '0201', name: 'Battambang Provincial Hospital Lab', province: 'Battambang' },
    { code: '1701', site_name: 'Siem Reap Provincial Hospital Lab', province: 'Siem Reap' },
    { code: '0101', site_name: 'Banteay Meanchey Hospital Lab', province: 'Banteay Meanchey' }
  ];

  const results = [];
  const testTypes = type === 'all' ? ['hiv_rapid', 'viral_load', 'cd4'] : [type];

  for (let i = 1; i <= 240; i++) {
    const fac = sampleFacilities[(i - 1) % sampleFacilities.length];
    const currentType = testTypes[(i - 1) % testTypes.length];
    const patientCode = `CAM-${fac.code}-${String(1000 + i * 7).padStart(5, '0')}`;
    
    let testName = 'HIV Rapid Test (Stat-Pak / Uni-Gold)';
    let resultValue = i % 7 === 0 ? 'Positive (Reactive)' : 'Negative (Non-Reactive)';
    let unit = '';
    let category = 'HIV Screening';
    let isFlagged = i % 7 === 0;

    if (currentType === 'viral_load' || currentType.includes('vl')) {
      testName = 'HIV-1 RNA Viral Load (Abbott m2000)';
      unit = 'copies/mL';
      category = 'Viral Load Monitoring';
      if (i % 8 === 0) {
        resultValue = `${15400 + i * 1200}`;
        isFlagged = true;
      } else if (i % 3 === 0) {
        resultValue = '< 40 (Target Not Detected)';
        isFlagged = false;
      } else {
        resultValue = '< 20 (Suppressed)';
        isFlagged = false;
      }
    } else if (currentType === 'cd4') {
      testName = 'CD4+ T-Lymphocyte Count (BD FACSVia)';
      unit = 'cells/mm³';
      category = 'Immunological';
      const cd4Val = 180 + (i * 35) % 600;
      resultValue = `${cd4Val}`;
      isFlagged = cd4Val < 200;
    }

    const year = start ? start.substring(0, 4) : '2024';
    const month = start ? start.substring(4, 6) : '09';
    const day = String(Math.max(1, Math.min(28, (i % 28) + 1))).padStart(2, '0');
    const hour = String(8 + (i % 10)).padStart(2, '0');
    const minute = String((i * 12) % 60).padStart(2, '0');

    results.push({
      sample_id: `LAB-2024-${String(80000 + i * 19).padStart(6, '0')}`,
      patient_id: patientCode,
      clinic_code: fac.code,
      facility_name: fac.name || fac.site_name,
      province: fac.province,
      test_type: currentType,
      test_name: testName,
      category,
      result_value: resultValue,
      unit,
      flagged: isFlagged,
      status: 'COMPLETED',
      sample_date: `${year}-${month}-${day} ${hour}:${minute}:00`,
      result_date: `${year}-${month}-${day} ${String(Number(hour) + 1).padStart(2, '0')}:${minute}:00`,
      tested_by: `Lab Tech ${String.fromCharCode(65 + (i % 6))}`
    });
  }

  return results;
}

// GET /apiv1/lab/test-results
router.get('/test-results', async (req, res) => {
  const {
    start = '20240901130000',
    end = '20240902235959',
    type = 'hiv',
    host = 'public' // 'public' | 'lan' | 'custom'
  } = req.query;

  let baseUrl = DEFAULT_PUBLIC_URL;
  if (host === 'lan') baseUrl = DEFAULT_LAN_URL;
  else if (host.startsWith('http://') || host.startsWith('https://')) baseUrl = host;

  const targetUrl = `${baseUrl}/test_result?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}&type=${encodeURIComponent(type)}`;

  try {
    const response = await axios.get(targetUrl, {
      headers: {
        'Authorization': authHeader,
        'Accept': 'application/json',
        'User-Agent': 'ARTWeb-MPI-LabIntegration/1.0'
      },
      timeout: 4000
    });

    return res.json({
      success: true,
      isLive: true,
      sourceUrl: targetUrl,
      count: Array.isArray(response.data) ? response.data.length : 1,
      data: response.data
    });
  } catch (error) {
    console.warn(`Lab API endpoint (${targetUrl}) unavailable: ${error.message}. Returning fallback dataset.`);
    
    const fallbackData = generateFallbackLabResults(start, end, type);
    return res.json({
      success: true,
      isLive: false,
      note: `Lab API Server unreachable (${error.message}). Showing simulated response.`,
      sourceUrl: targetUrl,
      count: fallbackData.length,
      data: fallbackData
    });
  }
});

module.exports = router;
