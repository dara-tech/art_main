const { sequelize } = require('./database');
const { getAggregateSequelize } = require('./aggregateDatabase');
const { applyMainDbsSiteScope } = require('../utils/mainDbsSiteScope');

const SITES_CACHE_TTL_MS = Number(process.env.SITES_CACHE_TTL_MS || 15 * 60 * 1000);

class SiteDatabaseManager {
  constructor() {
    this.parentCodeColumn = null;
    this.sitesCache = null;
    this.sitesCacheExpiresAt = 0;
  }

  async getParentCodeColumn() {
    if (this.parentCodeColumn !== null) return this.parentCodeColumn;
    const rows = await sequelize.query(
      `SELECT COLUMN_NAME
       FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME = 'tblsites'
         AND COLUMN_NAME IN ('tblsite', 'tblSite', 'parent_code', 'parentCode', 'parent_site_code')
       ORDER BY FIELD(COLUMN_NAME, 'tblsite', 'tblSite', 'parent_site_code', 'parent_code', 'parentCode')
       LIMIT 1`,
      { type: sequelize.QueryTypes.SELECT }
    );
    this.parentCodeColumn = rows?.[0]?.COLUMN_NAME || '';
    return this.parentCodeColumn;
  }

  async getSiteInfo(siteCode) {
    const code = String(siteCode || '').trim();
    if (!code) return null;
    const rows = await sequelize.query(
      `SELECT s.art_site_code as code, s.site_name as name
       FROM tblsites s
       WHERE s.art_site_code = :siteCode
       LIMIT 1`,
      { replacements: { siteCode: code }, type: sequelize.QueryTypes.SELECT }
    );
    return rows[0] || null;
  }

  async getAllSitesForManagement({ bypassCache = false } = {}) {
    if (!bypassCache && this.sitesCache && this.sitesCacheExpiresAt > Date.now()) {
      return this.sitesCache;
    }
    const parentCodeColumn = await this.getParentCodeColumn();
    const parentCodeSelect = parentCodeColumn ? `s.${parentCodeColumn} as tblsite,` : `NULL as tblsite,`;
    const rows = await sequelize.query(
      `SELECT 
        s.art_site_code as code,
        s.site_name as name,
        s.site_name as short_name,
        s.site_name as display_name,
        s.site_name as search_terms,
        s.art_site_code as file_name,
        ${parentCodeSelect}
        s.province_id as province_id,
        p.province_en as province,
        'ART' as type,
        'main_dbs' as database_name
      FROM tblsites s
      LEFT JOIN tblprovince p ON s.province_id = p.id
      ORDER BY s.art_site_code`,
      { type: sequelize.QueryTypes.SELECT }
    );
    this.sitesCache = rows;
    this.sitesCacheExpiresAt = Date.now() + SITES_CACHE_TTL_MS;
    return rows;
  }

  async getSiteConnection(siteCode) {
    const aggregate = getAggregateSequelize();
    return {
      QueryTypes: aggregate.QueryTypes,
      query: async (sql, options = {}) => {
        const scoped = applyMainDbsSiteScope(String(sql), siteCode);
        return aggregate.query(scoped, options);
      }
    };
  }

  async executeSiteQuery(siteCode, sql) {
    const connection = await this.getSiteConnection(siteCode);
    const [rows] = await connection.query(sql);
    return rows;
  }
}

const siteDatabaseManager = new SiteDatabaseManager();

async function testConnections() {
  const aggregate = getAggregateSequelize();
  await aggregate.authenticate();
}

module.exports = { siteDatabaseManager, testConnections };
