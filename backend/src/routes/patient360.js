const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { enforceSiteAccess } = require('../utils/siteAccess');
const patient360Service = require('../services/patient360Service');
const { getPatient360Dictionary } = require('../services/patient360Dictionary');

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

module.exports = router;
