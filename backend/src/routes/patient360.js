const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { enforceSiteAccess } = require('../utils/siteAccess');
const patient360Service = require('../services/patient360Service');
const patient360WriteService = require('../services/patient360WriteService');
const { getPatient360Dictionary } = require('../services/patient360Dictionary');
const { requireRole } = require('../middleware/auth');

const router = express.Router();

function handleError(res, error) {
  const status = error.statusCode || 500;
  const sqlMsg = error.parent?.sqlMessage || error.original?.sqlMessage;
  const message = sqlMsg && status === 500 ? `${error.message}: ${sqlMsg}` : error.message;
  if (status === 500) console.error('[patient-360]', message);
  res.status(status).json({ success: false, message });
}

/** Paginated patient registry (main tables) — default entry for Patient 360° */
router.get('/patients', authenticateToken, async (req, res) => {
  try {
    const siteCode = patient360Service.validateSiteCode(req.query.siteCode);
    if (!enforceSiteAccess(req, res, siteCode, { resolvedSiteCodes: [siteCode] })) return;
    const data = await patient360Service.listPatients(siteCode, {
      page: req.query.page,
      limit: req.query.limit,
      program: req.query.program,
      q: req.query.q,
      sex: req.query.sex,
      province: req.query.province,
      patientStatus: req.query.patientStatus,
      includeTotal: req.query.includeTotal,
      sortBy: req.query.sortBy,
      sortDir: req.query.sortDir
    });
    res.json({ success: true, readOnly: true, ...data });
  } catch (error) {
    handleError(res, error);
  }
});

router.get('/visits', authenticateToken, async (req, res) => {
  try {
    const siteCode = patient360Service.validateSiteCode(req.query.siteCode);
    if (!enforceSiteAccess(req, res, siteCode, { resolvedSiteCodes: [siteCode] })) return;
    const data = await patient360Service.listVisits(siteCode, {
      page: req.query.page,
      limit: req.query.limit,
      program: req.query.program,
      q: req.query.q,
      sortBy: req.query.sortBy,
      sortDir: req.query.sortDir
    });
    res.json({ success: true, readOnly: true, ...data });
  } catch (error) {
    handleError(res, error);
  }
});

router.get('/search', authenticateToken, async (req, res) => {
  try {
    const siteCode = patient360Service.validateSiteCode(req.query.siteCode);
    if (!enforceSiteAccess(req, res, siteCode, { resolvedSiteCodes: [siteCode] })) return;
    const matches = await patient360Service.searchPatients(siteCode, req.query.q, req.query.limit);
    res.json({ success: true, readOnly: true, siteCode, count: matches.length, matches });
  } catch (error) {
    handleError(res, error);
  }
});

/** Khmer field labels + value maps — cached in memory; load once per browser session */
router.get('/dictionary', authenticateToken, async (req, res) => {
  try {
    const dict = await getPatient360Dictionary(req.query.locale || 'kh');
    res.set('Cache-Control', 'private, max-age=3600');
    res.json({ success: true, ...dict });
  } catch (error) {
    handleError(res, error);
  }
});

router.get('/provinces', authenticateToken, async (req, res) => {
  try {
    const siteCode = req.query.siteCode;
    if (!patient360Service.validateSiteCode(siteCode)) {
      return res.status(400).json({ success: false, error: 'Invalid siteCode' });
    }
    const provinces = await patient360Service.getProvinces(siteCode);
    res.json({ success: true, provinces });
  } catch (err) {
    console.error('Get Provinces Error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch provinces' });
  }
});

router.get('/drugs', authenticateToken, async (req, res) => {
  try {
    const siteCode = patient360Service.validateSiteCode(req.query.siteCode);
    if (!enforceSiteAccess(req, res, siteCode, { resolvedSiteCodes: [siteCode] })) return;
    const drugs = await patient360Service.getDrugOptions(siteCode);
    res.set('Cache-Control', 'private, max-age=3600');
    res.json({ success: true, drugs });
  } catch (error) {
    handleError(res, error);
  }
});

router.get('/', authenticateToken, async (req, res) => {
  try {
    const siteCode = patient360Service.validateSiteCode(req.query.siteCode);
    const clinicId = patient360Service.validateClinicId(req.query.clinicId);
    if (!enforceSiteAccess(req, res, siteCode, { resolvedSiteCodes: [siteCode] })) return;
    const data = await patient360Service.getPatient360(siteCode, clinicId, {
      tab: req.query.tab || req.query.mode || 'summary',
      program: req.query.program,
      programs: req.query.programs
    });
    res.json({ success: true, ...data });
  } catch (error) {
    handleError(res, error);
  }
});

router.post('/registration', authenticateToken, requireRole(['admin', 'doctor', 'counselor', 'data_entry']), async (req, res) => {
  try {
    const siteCode = patient360Service.validateSiteCode(req.body.siteCode);
    if (!enforceSiteAccess(req, res, siteCode, { resolvedSiteCodes: [siteCode] })) return;
    
    const result = await patient360WriteService.createAdultRegistration(siteCode, req.body);
    res.json(result);
  } catch (error) {
    handleError(res, error);
  }
});

router.put('/registration/:clinicId', authenticateToken, requireRole(['admin', 'doctor', 'counselor', 'data_entry']), async (req, res) => {
  try {
    const siteCode = patient360Service.validateSiteCode(req.body.siteCode);
    const clinicId = patient360Service.validateClinicId(req.params.clinicId);
    if (!enforceSiteAccess(req, res, siteCode, { resolvedSiteCodes: [siteCode] })) return;
    
    const result = await patient360WriteService.updateAdultRegistration(siteCode, clinicId, req.body);
    res.json(result);
  } catch (error) {
    handleError(res, error);
  }
});

router.post('/visits', authenticateToken, requireRole(['admin', 'doctor', 'counselor', 'data_entry']), async (req, res) => {
  try {
    const siteCode = patient360Service.validateSiteCode(req.body.siteCode);
    if (!enforceSiteAccess(req, res, siteCode, { resolvedSiteCodes: [siteCode] })) return;
    
    const result = await patient360WriteService.createAdultVisit(siteCode, req.body);
    res.json(result);
  } catch (error) {
    handleError(res, error);
  }
});

router.put('/visits/:vid', authenticateToken, requireRole(['admin', 'doctor', 'counselor', 'data_entry']), async (req, res) => {
  try {
    const siteCode = patient360Service.validateSiteCode(req.body.siteCode);
    const vid = req.params.vid;
    if (!enforceSiteAccess(req, res, siteCode, { resolvedSiteCodes: [siteCode] })) return;
    
    const result = await patient360WriteService.updateAdultVisit(siteCode, vid, req.body);
    res.json(result);
  } catch (error) {
    handleError(res, error);
  }
});

module.exports = router;
