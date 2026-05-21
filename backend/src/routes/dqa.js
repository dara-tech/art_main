const express = require('express');
const dqaService = require('../services/dqaService');
const { authenticateToken } = require('../middleware/auth');
const { enforceSiteAccess } = require('../utils/siteAccess');

const router = express.Router();

function requireSiteCode(req, res) {
  const siteCode = String(req.query.siteCode || '').trim();
  if (!siteCode || siteCode.toLowerCase() === 'all') {
    res.status(400).json({
      success: false,
      error: 'siteCode is required and must be a single facility site'
    });
    return null;
  }
  return siteCode;
}

router.get('/scripts', authenticateToken, (_req, res) => {
  try {
    const data = dqaService.listScripts();
    res.json({ success: true, count: data.length, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/query-reference', authenticateToken, (_req, res) => {
  try {
    const data = dqaService.getQueryReference();
    res.json({ success: true, count: data.length, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/summary', authenticateToken, async (req, res) => {
  try {
    const siteCode = requireSiteCode(req, res);
    if (!siteCode) return;
    if (!enforceSiteAccess(req, res, siteCode, { resolvedSiteCodes: [siteCode] })) return;
    const data = await dqaService.executeSummary(siteCode);
    res.json({ success: true, siteCode, count: data.length, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/run/:scriptId', authenticateToken, async (req, res) => {
  try {
    const siteCode = requireSiteCode(req, res);
    if (!siteCode) return;
    if (!enforceSiteAccess(req, res, siteCode, { resolvedSiteCodes: [siteCode] })) return;
    const scriptId = decodeURIComponent(req.params.scriptId || '');
    const result = await dqaService.executeOnePaged(siteCode, scriptId, {
      page: req.query.page,
      limit: req.query.limit,
      search: req.query.search
    });
    res.json({ success: true, siteCode, ...result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
