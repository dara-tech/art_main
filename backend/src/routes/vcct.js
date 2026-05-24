const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { enforceSiteAccess } = require('../utils/siteAccess');
const patient360Service = require('../services/patient360Service');
const vcctReadService = require('../services/vcctReadService');

const router = express.Router();

function handleError(res, error) {
  const status = error.statusCode || 500;
  const message = error.message || 'Request failed';
  if (status === 500) console.error('[vcct]', message);
  res.status(status).json({ success: false, message });
}

/** Paginated VCCT client list (read-only). */
router.get('/patients', authenticateToken, async (req, res) => {
  try {
    const siteCode = patient360Service.validateSiteCode(req.query.siteCode);
    if (!enforceSiteAccess(req, res, siteCode, { resolvedSiteCodes: [siteCode] })) return;

    const data = await vcctReadService.listVcctPatients(siteCode, {
      page: req.query.page,
      limit: req.query.limit,
      q: req.query.q
    });
    res.json({ success: true, ...data });
  } catch (error) {
    handleError(res, error);
  }
});

/** Full VCCT detail by vcct_id + VCCT site (read-only). */
router.get('/detail', authenticateToken, async (req, res) => {
  try {
    const siteCode = patient360Service.validateSiteCode(req.query.siteCode);
    if (!enforceSiteAccess(req, res, siteCode, { resolvedSiteCodes: [siteCode] })) return;

    const vcctId = req.query.vcctId ?? req.query.id;
    const vcctSiteCode = req.query.vcctSiteCode || req.query.vcctSite || null;

    const data = await vcctReadService.getDetailByVcctId(siteCode, vcctId, vcctSiteCode);
    res.json({ success: true, ...data });
  } catch (error) {
    handleError(res, error);
  }
});

module.exports = router;
