-- 10.14 VL follow-up 6+ months after high VL — patient detail
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
    SELECT CONVERT(p.ClinicID, CHAR) AS ClinicID, v.DatVisit AS EACDate
    FROM tblaimain p INNER JOIN tblavmain v ON p.ClinicID = v.ClinicID WHERE v.VLDetectable IN (1, 2, 3)
    UNION ALL
    SELECT CONVERT(p.ClinicID, CHAR), v.DatVisit FROM tblcimain p INNER JOIN tblcvmain v ON p.ClinicID = v.ClinicID WHERE v.VLDetectable IN (1, 2, 3)
),
with_eac AS (
    SELECT DISTINCT h.ClinicID, h.typepatients, h.Sex, h.DaBirth, h.VLDate, h.VLValue
    FROM latest_high_vl h
    INNER JOIN eac_visits e ON e.ClinicID = h.ClinicID
     AND e.EACDate BETWEEN DATE_SUB(h.VLDate, INTERVAL 60 DAY) AND DATE_ADD(h.VLDate, INTERVAL 12 MONTH)
),
followup_ranked AS (
    SELECT e.*, pt.Dat AS FollowupDate,
        CAST(REPLACE(REPLACE(REPLACE(pt.HIVLoad, '<', ''), '>', ''), '=', '') AS UNSIGNED) AS FollowupValue,
        ROW_NUMBER() OVER (PARTITION BY e.ClinicID ORDER BY pt.Dat) rn
    FROM with_eac e
    INNER JOIN tblpatienttest pt ON CONVERT(pt.ClinicID, CHAR) = e.ClinicID
    WHERE pt.HIVLoad IS NOT NULL AND pt.HIVLoad <> ''
      AND pt.Dat >= DATE_ADD(e.VLDate, INTERVAL 6 MONTH) AND pt.Dat > e.VLDate
),
followup_met AS (SELECT * FROM followup_ranked WHERE rn = 1)

SELECT main.ClinicID AS clinicid, art.ART AS art_number, f.Sex AS sex,
    CASE WHEN f.Sex = 0 THEN 'Female' ELSE 'Male' END AS sex_display,
    CASE WHEN f.typepatients = '≤14' THEN 'Child' ELSE 'Adult' END AS patient_type, f.typepatients,
    TIMESTAMPDIFF(YEAR, f.DaBirth, :EndDate) AS age, f.VLDate AS high_vl_date, f.VLValue AS high_vl_value,
    f.FollowupDate AS followup_vl_date, f.FollowupValue AS followup_vl_value
FROM followup_met f
JOIN tblaimain main ON CONVERT(main.ClinicID, CHAR) = f.ClinicID
LEFT JOIN tblaart art ON main.ClinicID = art.ClinicID
WHERE f.typepatients = '15+'
UNION ALL
SELECT main.ClinicID, art.ART, f.Sex, CASE WHEN f.Sex = 0 THEN 'Female' ELSE 'Male' END,
    CASE WHEN f.typepatients = '≤14' THEN 'Child' ELSE 'Adult' END, f.typepatients,
    TIMESTAMPDIFF(YEAR, f.DaBirth, :EndDate), f.VLDate, f.VLValue, f.FollowupDate, f.FollowupValue
FROM followup_met f
JOIN tblcimain main ON CONVERT(main.ClinicID, CHAR) = f.ClinicID
LEFT JOIN tblcart art ON main.ClinicID = art.ClinicID
WHERE f.typepatients = '≤14'
ORDER BY high_vl_date DESC, clinicid;
