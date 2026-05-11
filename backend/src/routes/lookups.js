const express = require('express');
const { siteDatabaseManager } = require('../config/siteDatabase');

const router = express.Router();

router.get('/sites-registry', async (req, res, next) => {
  try {
    const sites = await siteDatabaseManager.getAllSitesForManagement();
    const formatted = sites.map((site) => ({
      code: site.code,
      name: site.display_name || site.short_name || site.name,
      fullName: site.name,
      shortName: site.short_name,
      searchTerms: site.search_terms,
      fileName: site.file_name,
      tblsite: site.tblsite,
      province: site.province,
      type: site.type,
      database_name: site.database_name
    }));
    res.json(formatted);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
