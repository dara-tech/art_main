-- 10.11 EAC2 — patient detail
WITH adult_vl AS (
    SELECT '15+' AS typepatients, IFNULL(p.Sex, 0) AS Sex, CONVERT(p.ClinicID, CHAR) AS ClinicID, p.DaBirth,
        pt.Dat AS VLDate, CAST(REPLACE(REPLACE(REPLACE(pt.HIVLoad, '<', ''), '>', ''), '=', '') AS UNSIGNED) AS VLValue
    FROM tblaimain p
    INNER JOIN tblpatienttest pt ON CONVERT(p.ClinicID, CHAR) = CONVERT(pt.ClinicID, CHAR)
    WHERE pt.HIVLoad IS NOT NULL AND pt.HIVLoad <> '' AND pt.Dat BETWEEN :StartDate AND :EndDate
      AND EXISTS (SELECT 1 FROM tblaart a WHERE a.ClinicID = p.ClinicID AND a.DaArt <= :EndDate)
),
child_vl AS (
    SELECT '≤14' AS typepatients, IFNULL(p.Sex, 0) AS Sex, CONVERT(p.ClinicID, CHAR) AS ClinicID, p.DaBirth,
        pt.Dat AS VLDate, CAST(REPLACE(REPLACE(REPLACE(pt.HIVLoad, '<', ''), '>', ''), '=', '') AS UNSIGNED) AS VLValue
    FROM tblcimain p
    INNER JOIN tblpatienttest pt ON p.ClinicID = pt.ClinicID
    WHERE pt.HIVLoad IS NOT NULL AND pt.HIVLoad <> '' AND pt.Dat BETWEEN :StartDate AND :EndDate
      AND EXISTS (SELECT 1 FROM tblcart a WHERE a.ClinicID = p.ClinicID AND a.DaArt <= :EndDate)
),
latest_high_vl AS (
    SELECT ClinicID, typepatients, Sex, DaBirth, VLDate, VLValue
    FROM (SELECT vt.*, ROW_NUMBER() OVER (PARTITION BY ClinicID ORDER BY VLDate DESC) rn FROM (
        SELECT * FROM adult_vl UNION ALL SELECT * FROM child_vl) vt) ranked
    WHERE rn = 1 AND VLValue >= 40
),
eac_visits AS (
    SELECT CONVERT(p.ClinicID, CHAR) AS ClinicID, v.DatVisit AS EACDate, v.VLDetectable AS EACSession
    FROM tblaimain p INNER JOIN tblavmain v ON p.ClinicID = v.ClinicID WHERE v.VLDetectable IN (1, 2, 3)
    UNION ALL
    SELECT CONVERT(p.ClinicID, CHAR), v.DatVisit, v.VLDetectable
    FROM tblcimain p INNER JOIN tblcvmain v ON p.ClinicID = v.ClinicID WHERE v.VLDetectable IN (1, 2, 3)
),
matched AS (
    SELECT h.ClinicID, h.typepatients, h.Sex, h.DaBirth, h.VLDate, h.VLValue, MIN(e.EACDate) AS eac2_date
    FROM latest_high_vl h
    INNER JOIN eac_visits e ON e.ClinicID = h.ClinicID AND e.EACSession = 2
     AND e.EACDate BETWEEN DATE_SUB(h.VLDate, INTERVAL 60 DAY) AND DATE_ADD(h.VLDate, INTERVAL 12 MONTH)
    GROUP BY h.ClinicID, h.typepatients, h.Sex, h.DaBirth, h.VLDate, h.VLValue
)

SELECT main.ClinicID AS clinicid, art.ART AS art_number, m.Sex AS sex,
    CASE WHEN m.Sex = 0 THEN 'Female' ELSE 'Male' END AS sex_display,
    CASE WHEN m.typepatients = '≤14' THEN 'Child' ELSE 'Adult' END AS patient_type, m.typepatients,
    TIMESTAMPDIFF(YEAR, m.DaBirth, :EndDate) AS age, m.VLDate AS high_vl_date, m.VLValue AS high_vl_value, m.eac2_date
FROM matched m
JOIN tblaimain main ON CONVERT(main.ClinicID, CHAR) = m.ClinicID
LEFT JOIN tblaart art ON main.ClinicID = art.ClinicID
WHERE m.typepatients = '15+'
UNION ALL
SELECT main.ClinicID, art.ART, m.Sex, CASE WHEN m.Sex = 0 THEN 'Female' ELSE 'Male' END,
    CASE WHEN m.typepatients = '≤14' THEN 'Child' ELSE 'Adult' END, m.typepatients,
    TIMESTAMPDIFF(YEAR, m.DaBirth, :EndDate), m.VLDate, m.VLValue, m.eac2_date
FROM matched m
JOIN tblcimain main ON CONVERT(main.ClinicID, CHAR) = m.ClinicID
LEFT JOIN tblcart art ON main.ClinicID = art.ClinicID
WHERE m.typepatients = '≤14'
ORDER BY high_vl_date DESC, clinicid;
