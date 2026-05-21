const { assertResolvedSiteAccess } = require('../services/userRoleService');

function enforceSiteAccess(req, res, siteCode, options = {}) {
  const result = assertResolvedSiteAccess(req.user, siteCode, options);
  if (!result.ok) {
    res.status(403).json({ success: false, error: result.message });
    return false;
  }
  return true;
}

module.exports = { enforceSiteAccess };
