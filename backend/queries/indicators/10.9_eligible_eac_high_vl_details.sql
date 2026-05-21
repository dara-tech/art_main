-- 10.9 Eligible for EAC — patient detail with EAC1/2/3 dates
WITH adult_vl AS (
    SELECT
        '15+' AS typepatients,
        IFNULL(p.Sex, 0) AS Sex,
        CONVERT(p.ClinicID, CHAR) AS ClinicID,
        p.DaBirth,
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
        p.DaBirth,
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
eligible AS (
    SELECT ClinicID, typepatients, Sex, DaBirth, VLDate, VLValue
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
eac_pivot AS (
    SELECT
        h.ClinicID,
        MIN(CASE WHEN e.EACSession = 1 THEN e.EACDate END) AS eac1_date,
        MIN(CASE WHEN e.EACSession = 2 THEN e.EACDate END) AS eac2_date,
        MIN(CASE WHEN e.EACSession = 3 THEN e.EACDate END) AS eac3_date,
        MAX(e.EACDate) AS last_eac_date
    FROM eligible h
    LEFT JOIN eac_visits e
      ON e.ClinicID = h.ClinicID
     AND e.EACDate BETWEEN DATE_SUB(h.VLDate, INTERVAL 60 DAY) AND DATE_ADD(h.VLDate, INTERVAL 12 MONTH)
    GROUP BY h.ClinicID
)

SELECT
    main.ClinicID AS clinicid,
    art.ART AS art_number,
    e.Sex AS sex,
    CASE WHEN e.Sex = 0 THEN 'Female' ELSE 'Male' END AS sex_display,
    CASE WHEN e.typepatients = '≤14' THEN 'Child' ELSE 'Adult' END AS patient_type,
    e.typepatients,
    TIMESTAMPDIFF(YEAR, e.DaBirth, :EndDate) AS age,
    e.VLDate AS high_vl_date,
    e.VLValue AS high_vl_value,
    p.eac1_date,
    p.eac2_date,
    p.eac3_date,
    p.last_eac_date
FROM eligible e
LEFT JOIN eac_pivot p ON p.ClinicID = e.ClinicID
JOIN tblaimain main ON CONVERT(main.ClinicID, CHAR) = e.ClinicID
LEFT JOIN tblaart art ON main.ClinicID = art.ClinicID
WHERE e.typepatients = '15+'

UNION ALL

SELECT
    main.ClinicID AS clinicid,
    art.ART AS art_number,
    e.Sex AS sex,
    CASE WHEN e.Sex = 0 THEN 'Female' ELSE 'Male' END AS sex_display,
    CASE WHEN e.typepatients = '≤14' THEN 'Child' ELSE 'Adult' END AS patient_type,
    e.typepatients,
    TIMESTAMPDIFF(YEAR, e.DaBirth, :EndDate) AS age,
    e.VLDate AS high_vl_date,
    e.VLValue AS high_vl_value,
    p.eac1_date,
    p.eac2_date,
    p.eac3_date,
    p.last_eac_date
FROM eligible e
LEFT JOIN eac_pivot p ON p.ClinicID = e.ClinicID
JOIN tblcimain main ON CONVERT(main.ClinicID, CHAR) = e.ClinicID
LEFT JOIN tblcart art ON main.ClinicID = art.ClinicID
WHERE e.typepatients = '≤14'

ORDER BY high_vl_date DESC, clinicid;
