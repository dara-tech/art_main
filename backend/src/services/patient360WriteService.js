const { siteDatabaseManager } = require('../config/siteDatabase');

function escapeSqlLiteral(value) {
  return String(value ?? '').replace(/'/g, "''");
}

async function writeAuditLog(conn, clinicId, tableName, type) {
  // type: 1 = Insert, 2 = Update, 3 = Delete
  const sql = `INSERT INTO tbllog (ClinicID, Status, Type, Dat) VALUES (:clinicId, :tableName, :type, NOW())`;
  await conn.query(sql, {
    replacements: { clinicId, tableName, type },
    type: conn.QueryTypes.INSERT
  });
}

async function createAdultRegistration(siteCode, payload) {
  const conn = await siteDatabaseManager.getSiteConnection(siteCode);
  const t = await conn.transaction();

  try {
    const {
      ClinicID,
      DafirstVisit,
      DaBirth,
      Sex,
      TypeofReturn,
      LClinicID,
      Education,
      Rea,
      Write,
      Referred,
      Orefferred,
      DaHIV,
      Vcctcode,
      VcctID,
      PclinicID,
      OffIn,
      SiteName,
      DaART,
      Artnum,
      TbPast,
      TPT,
      TPTdrug,
      DaStartTPT,
      DaEndTPT,
      TypeTB,
      ResultTB,
      Daonset,
      Tbtreat,
      Datreat,
      ResultTreat,
      DaResultTreat,
      ARVTreatHis,
      Diabete,
      Hyper,
      Abnormal,
      Renal,
      Anemia,
      Liver,
      HepBC,
      MedOther,
      Allergy,
      Nationality,
      Targroup,
      Refugstatus,
      RefugART,
      Refugsite
    } = payload;

    const sql = `
      INSERT INTO tblaimain (
        site_code, ClinicID, DafirstVisit, DaBirth, Sex, TypeofReturn, LClinicID, 
        Education, Rea, \`Write\`, Referred, Orefferred, DaHIV, Vcctcode, VcctID, PclinicID, OffIn, SiteName, 
        DaART, Artnum, TbPast, TPT, TPTdrug, DaStartTPT, DaEndTPT, TypeTB, ResultTB, 
        Daonset, Tbtreat, Datreat, ResultTreat, DaResultTreat, ARVTreatHis, 
        Diabete, Hyper, Abnormal, Renal, Anemia, Liver, HepBC, MedOther, Allergy, 
        Nationality, Targroup, Refugstatus, RefugART, Refugsite
      ) VALUES (
        :siteCode, :ClinicID, :DafirstVisit, :DaBirth, :Sex, :TypeofReturn, :LClinicID, 
        :Education, :Rea, :Write, :Referred, :Orefferred, :DaHIV, :Vcctcode, :VcctID, :PclinicID, :OffIn, :SiteName, 
        :DaART, :Artnum, :TbPast, :TPT, :TPTdrug, :DaStartTPT, :DaEndTPT, :TypeTB, :ResultTB, 
        :Daonset, :Tbtreat, :Datreat, :ResultTreat, :DaResultTreat, :ARVTreatHis, 
        :Diabete, :Hyper, :Abnormal, :Renal, :Anemia, :Liver, :HepBC, :MedOther, :Allergy, 
        :Nationality, :Targroup, :Refugstatus, :RefugART, :Refugsite
      )
    `;

    await conn.query(sql, {
      replacements: {
        siteCode, ClinicID, DafirstVisit, DaBirth, Sex, TypeofReturn, LClinicID, 
        Education, Rea, Write, Referred, Orefferred, DaHIV, Vcctcode, VcctID, PclinicID, OffIn, SiteName, 
        DaART, Artnum, TbPast, TPT, TPTdrug, DaStartTPT, DaEndTPT, TypeTB, ResultTB, 
        Daonset, Tbtreat, Datreat, ResultTreat, DaResultTreat, ARVTreatHis, 
        Diabete, Hyper, Abnormal, Renal, Anemia, Liver, HepBC, MedOther, Allergy, 
        Nationality, Targroup, Refugstatus, RefugART, Refugsite
      },
      type: conn.QueryTypes.INSERT,
      transaction: t
    });

    await writeAuditLog(conn, ClinicID, 'tblaimain', 1);

    if (payload.Province) {
      await conn.query(`
        INSERT INTO tblaumain (site_code, ClinicID, Daupdate, Province) 
        VALUES (:siteCode, :ClinicID, CURDATE(), :Province)`, {
        replacements: { siteCode, ClinicID, Province: payload.Province },
        type: conn.QueryTypes.INSERT,
        transaction: t
      });
      await writeAuditLog(conn, ClinicID, 'tblaumain', 1);
    }

    await t.commit();
    return { success: true, clinicId: ClinicID };
  } catch (error) {
    await t.rollback();
    throw error;
  }
}

async function updateAdultRegistration(siteCode, clinicId, payload) {
  const conn = await siteDatabaseManager.getSiteConnection(siteCode);
  const t = await conn.transaction();

  try {
    const fields = [];
    const replacements = { siteCode, clinicId };

    Object.keys(payload).forEach(key => {
      // Prevent updating primary keys
      if (key !== 'site_code' && key !== 'ClinicID' && key !== 'id') {
        fields.push(`\`${key}\` = :${key}`);
        replacements[key] = payload[key];
      }
    });

    if (fields.length === 0) {
        return { success: true, message: 'No fields to update' };
    }

    const sql = `UPDATE tblaimain SET ${fields.join(', ')} WHERE site_code = :siteCode AND ClinicID = :clinicId`;
    
    await conn.query(sql, {
      replacements,
      type: conn.QueryTypes.UPDATE,
      transaction: t
    });

    await writeAuditLog(conn, clinicId, 'tblaimain', 2);

    if (payload.Province !== undefined) {
      const existing = await conn.query(`SELECT 1 FROM tblaumain WHERE ClinicID = :clinicId LIMIT 1`, {
         replacements: { clinicId }, type: conn.QueryTypes.SELECT, transaction: t
      });
      if (existing.length > 0) {
        await conn.query(`UPDATE tblaumain SET Province = :Province WHERE ClinicID = :clinicId ORDER BY Daupdate DESC LIMIT 1`, {
          replacements: { clinicId, Province: payload.Province },
          type: conn.QueryTypes.UPDATE,
          transaction: t
        });
        await writeAuditLog(conn, clinicId, 'tblaumain', 2);
      } else {
        await conn.query(`
          INSERT INTO tblaumain (site_code, ClinicID, Daupdate, Province) 
          VALUES (:siteCode, :clinicId, CURDATE(), :Province)`, {
          replacements: { siteCode, clinicId, Province: payload.Province },
          type: conn.QueryTypes.INSERT,
          transaction: t
        });
        await writeAuditLog(conn, clinicId, 'tblaumain', 1);
      }
    }

    await t.commit();
    return { success: true, clinicId };
  } catch (error) {
    await t.rollback();
    throw error;
  }
}

async function saveDrugPrescriptions(conn, siteCode, vid, tableName, drugs, t) {
  if (!drugs || !Array.isArray(drugs)) return;

  // Clear existing for this visit
  await conn.query(`DELETE FROM ${tableName} WHERE site_code = :siteCode AND Vid = :vid`, {
    replacements: { siteCode, vid },
    type: conn.QueryTypes.DELETE,
    transaction: t
  });

  if (drugs.length === 0) return;

  // Insert new drugs
  const fields = ['site_code', 'Vid', 'DrugName', 'Dose', 'Quantity', 'Freq', 'Form', 'Status', 'Da', 'Reason', 'Remark'];
  const placeholders = fields.map(f => `:${f}`).join(', ');
  
  const sql = `INSERT INTO ${tableName} (\`${fields.join('`, `')}\`) VALUES (${placeholders})`;

  for (const drug of drugs) {
    await conn.query(sql, {
      replacements: {
        siteCode,
        vid,
        DrugName: drug.DrugName || '',
        Dose: drug.Dose || '',
        Quantity: drug.Quantity || null,
        Freq: drug.Freq || '',
        Form: drug.Form || '',
        Status: drug.Status !== undefined ? drug.Status : null,
        Da: drug.Da || null,
        Reason: drug.Reason || '',
        Remark: drug.Remark || ''
      },
      type: conn.QueryTypes.INSERT,
      transaction: t
    });
  }
}

async function createAdultVisit(siteCode, payload) {
  const conn = await siteDatabaseManager.getSiteConnection(siteCode);
  const t = await conn.transaction();

  try {
    const { arvDrugs, tbDrugs, oiDrugs, ...mainPayload } = payload;
    const fields = Object.keys(mainPayload).filter(key => key !== 'id' && key !== 'site_code' && key !== 'created_at' && key !== 'updated_at');
    const values = fields.map(k => `:${k}`);
    
    // Auto-generate Vid if not provided (it's a double acting as unique ID/timestamp)
    if (!mainPayload.Vid) {
      mainPayload.Vid = Date.now();
      fields.push('Vid');
      values.push(':Vid');
    }

    const sql = `
      INSERT INTO tblavmain (site_code, ${fields.map(f => `\`${f}\``).join(', ')})
      VALUES (:siteCode, ${values.join(', ')})
    `;

    await conn.query(sql, {
      replacements: { siteCode, ...mainPayload },
      type: conn.QueryTypes.INSERT,
      transaction: t
    });

    await writeAuditLog(conn, mainPayload.ClinicID, 'tblavmain', 1);

    await saveDrugPrescriptions(conn, siteCode, mainPayload.Vid, 'tblavarvdrug', arvDrugs, t);
    await saveDrugPrescriptions(conn, siteCode, mainPayload.Vid, 'tblavtbdrug', tbDrugs, t);
    await saveDrugPrescriptions(conn, siteCode, mainPayload.Vid, 'tblavoidrug', oiDrugs, t);

    await t.commit();
    return { success: true, vid: mainPayload.Vid };
  } catch (error) {
    await t.rollback();
    throw error;
  }
}

async function updateAdultVisit(siteCode, vid, payload) {
  const conn = await siteDatabaseManager.getSiteConnection(siteCode);
  const t = await conn.transaction();

  try {
    const { arvDrugs, tbDrugs, oiDrugs, ...mainPayload } = payload;
    const fields = [];
    const replacements = { siteCode, vid };

    Object.keys(mainPayload).forEach(key => {
      if (key !== 'site_code' && key !== 'Vid' && key !== 'id' && key !== 'ClinicID') {
        fields.push(`\`${key}\` = :${key}`);
        replacements[key] = mainPayload[key];
      }
    });

    if (fields.length === 0) {
        return { success: true, message: 'No fields to update' };
    }

    const sql = `UPDATE tblavmain SET ${fields.join(', ')} WHERE site_code = :siteCode AND Vid = :vid`;
    
    await conn.query(sql, {
      replacements,
      type: conn.QueryTypes.UPDATE,
      transaction: t
    });

    // In legacy tbllog, the clinicId is logged, so we need it from payload or DB
    const clinicId = mainPayload.ClinicID || 0; 
    await writeAuditLog(conn, clinicId, 'tblavmain', 2);

    await saveDrugPrescriptions(conn, siteCode, vid, 'tblavarvdrug', arvDrugs, t);
    await saveDrugPrescriptions(conn, siteCode, vid, 'tblavtbdrug', tbDrugs, t);
    await saveDrugPrescriptions(conn, siteCode, vid, 'tblavoidrug', oiDrugs, t);

    await t.commit();
    return { success: true, vid };
  } catch (error) {
    await t.rollback();
    throw error;
  }
}

module.exports = {
  createAdultRegistration,
  updateAdultRegistration,
  createAdultVisit,
  updateAdultVisit
};
