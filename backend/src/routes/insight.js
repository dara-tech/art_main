const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { assertResolvedSiteAccess } = require('../services/userRoleService');
const { siteDatabaseManager } = require('../config/siteDatabase');
const insightService = require('../services/insightService');

const router = express.Router();

router.use(authenticateToken);

router.get('/catalog', (_req, res) => {
  res.json({ success: true, ...insightService.getCatalog() });
});

router.post('/run', async (req, res) => {
  try {
    const siteCode = String(req.body?.siteCode || '').trim();
    if (!siteCode) {
      return res.status(400).json({ success: false, error: 'siteCode is required' });
    }
    const access = assertResolvedSiteAccess(req.user, siteCode);
    if (!access.ok) {
      return res.status(403).json({ success: false, error: access.message || 'Access denied' });
    }
    await siteDatabaseManager.getSiteConnection(siteCode);
    const result = await insightService.runAnalysis(siteCode, req.body);
    res.json(result);
  } catch (e) {
    const msg = String(e?.message || e?.parent?.message || 'Analysis failed');
    const code = e?.parent?.code || e?.code || '';
    const timedOut =
      e?.name === 'SequelizeDatabaseError' &&
      (msg.includes('MAX_EXECUTION_TIME') || msg.includes('timeout') || code === 'ER_QUERY_TIMEOUT');
    const dbUnavailable =
      code === 'ECONNREFUSED' ||
      code === 'ETIMEDOUT' ||
      code === 'PROTOCOL_CONNECTION_LOST' ||
      msg.includes('ECONNREFUSED') ||
      msg.includes('ETIMEDOUT') ||
      msg.includes('connect ETIMEDOUT');
    const status = e.statusCode || (timedOut ? 504 : dbUnavailable ? 503 : 500);
    res.status(status).json({
      success: false,
      error: timedOut
        ? 'Query took too long. Try a shorter period or a different data source.'
        : dbUnavailable
          ? 'Database is not reachable. Check that the backend can connect to the site database, then try again.'
          : msg
    });
  }
});

module.exports = router;
