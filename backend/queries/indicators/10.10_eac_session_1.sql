-- 10.10: Eligible high VL patients who received EAC session 1 (VLDetectable = 1)
WITH adult_vl AS (
    SELECT
        '15+' AS typepatients,
        IFNULL(p.Sex, 0) AS Sex,
        CONVERT(p.ClinicID, CHAR) AS ClinicID,
        pt.Dat AS VLDate,
        CAST(REPLACE(REPLACE(REPLACE(pt.HIVLoad, '<', ''), '>', ''), '=', '') AS UNSIGNED) AS VLValue
    FROM tblaimain p
    INNER JOIN tblpatienttest pt ON CONVERT(p.ClinicID, CHAR) = CONVERT(pt.ClinicID, CHAR)
    WHERE pt.HIVLoad IS NOT NULL
      AND pt.HIVLoad <> ''
      AND pt.Dat BETWEEN :StartDate AND :EndDate
      AND EXISTS (SELECT 1 FROM tblaart a WHERE a.ClinicID = p.ClinicID AND a.DaArt <= :EndDate)
),
child_vl AS (
    SELECT
        '≤14' AS typepatients,
        IFNULL(p.Sex, 0) AS Sex,
        CONVERT(p.ClinicID, CHAR) AS ClinicID,
        pt.Dat AS VLDate,
        CAST(REPLACE(REPLACE(REPLACE(pt.HIVLoad, '<', ''), '>', ''), '=', '') AS UNSIGNED) AS VLValue
    FROM tblcimain p
    INNER JOIN tblpatienttest pt ON p.ClinicID = pt.ClinicID
    WHERE pt.HIVLoad IS NOT NULL
      AND pt.HIVLoad <> ''
      AND pt.Dat BETWEEN :StartDate AND :EndDate
      AND EXISTS (SELECT 1 FROM tblcart a WHERE a.ClinicID = p.ClinicID AND a.DaArt <= :EndDate)
),
vl_tests AS (
    SELECT * FROM adult_vl
    UNION ALL
    SELECT * FROM child_vl
),
latest_high_vl AS (
    SELECT ClinicID, typepatients, Sex, VLDate, VLValue
    FROM (
        SELECT vt.*,
               ROW_NUMBER() OVER (PARTITION BY ClinicID ORDER BY VLDate DESC) AS rn
        FROM vl_tests vt
    ) ranked
    WHERE rn = 1
      AND VLValue >= 40
),
adult_eac AS (
    SELECT CONVERT(p.ClinicID, CHAR) AS ClinicID, v.DatVisit AS EACDate, v.VLDetectable AS EACSession
    FROM tblaimain p
    INNER JOIN tblavmain v ON p.ClinicID = v.ClinicID
    WHERE v.VLDetectable IN (1, 2, 3)
),
child_eac AS (
    SELECT CONVERT(p.ClinicID, CHAR) AS ClinicID, v.DatVisit AS EACDate, v.VLDetectable AS EACSession
    FROM tblcimain p
    INNER JOIN tblcvmain v ON p.ClinicID = v.ClinicID
    WHERE v.VLDetectable IN (1, 2, 3)
),
eac_visits AS (
    SELECT * FROM adult_eac
    UNION ALL
    SELECT * FROM child_eac
),
matched AS (
    SELECT DISTINCT h.ClinicID, h.typepatients, h.Sex
    FROM latest_high_vl h
    INNER JOIN eac_visits e
      ON e.ClinicID = h.ClinicID
     AND e.EACSession = 1
     AND e.EACDate BETWEEN DATE_SUB(h.VLDate, INTERVAL 60 DAY) AND DATE_ADD(h.VLDate, INTERVAL 12 MONTH)
)

SELECT
    '10.10. EAC session 1 (EAC1)' AS Indicator,
    IFNULL(COUNT(*), 0) AS TOTAL,
    IFNULL(SUM(CASE WHEN typepatients = '≤14' AND Sex = 1 THEN 1 ELSE 0 END), 0) AS Male_0_14,
    IFNULL(SUM(CASE WHEN typepatients = '≤14' AND Sex = 0 THEN 1 ELSE 0 END), 0) AS Female_0_14,
    IFNULL(SUM(CASE WHEN typepatients = '15+' AND Sex = 1 THEN 1 ELSE 0 END), 0) AS Male_over_14,
    IFNULL(SUM(CASE WHEN typepatients = '15+' AND Sex = 0 THEN 1 ELSE 0 END), 0) AS Female_over_14
FROM matched;
