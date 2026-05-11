-- ===================================================================
-- Indicator 13b: Percentage of PLHIV receiving ART with viral load ≥1000 copies/mL who received a follow-up viral load test ~3 months after enhanced adherence counselling
-- ===================================================================

WITH adult_vl AS (
    SELECT 
        '15+' AS typepatients,
        IFNULL(p.Sex, 0) AS Sex,
        CONVERT(p.ClinicID, CHAR) AS ClinicID,
        pt.Dat AS VLDate,
        CAST(REPLACE(REPLACE(REPLACE(pt.HIVLoad, '<', ''), '>', ''), '=', '') AS UNSIGNED) AS VLValue
    FROM tblaimain p
    JOIN tblpatienttest pt ON CONVERT(p.ClinicID, CHAR) = CONVERT(pt.ClinicID, CHAR)
    WHERE pt.HIVLoad IS NOT NULL
      AND pt.HIVLoad <> ''
      AND pt.Dat BETWEEN :StartDate AND :EndDate
),
child_vl AS (
    SELECT 
        '≤14' AS typepatients,
        IFNULL(p.Sex, 0) AS Sex,
        CONVERT(p.ClinicID, CHAR) AS ClinicID,
        pt.Dat AS VLDate,
        CAST(REPLACE(REPLACE(REPLACE(pt.HIVLoad, '<', ''), '>', ''), '=', '') AS UNSIGNED) AS VLValue
    FROM tblcimain p
    JOIN tblpatienttest pt ON p.ClinicID = pt.ClinicID
    WHERE pt.HIVLoad IS NOT NULL
      AND pt.HIVLoad <> ''
      AND pt.Dat BETWEEN :StartDate AND :EndDate
),
vl_tests AS (
    SELECT * FROM adult_vl
    UNION ALL
    SELECT * FROM child_vl
),
latest_high_vl AS (
    SELECT ClinicID,
           typepatients,
           Sex,
           VLDate,
           VLValue
    FROM (
        SELECT vt.*,
               ROW_NUMBER() OVER (PARTITION BY ClinicID ORDER BY VLDate DESC) AS rn
        FROM vl_tests vt
    ) ranked
    WHERE rn = 1
      AND VLValue >= 1000
),
adult_eac AS (
    SELECT 
        '15+' AS typepatients,
        IFNULL(p.Sex, 0) AS Sex,
        CONVERT(p.ClinicID, CHAR) AS ClinicID,
        v.DatVisit AS EACDate
    FROM tblaimain p
    JOIN tblavmain v ON p.ClinicID = v.ClinicID
    WHERE v.VLDetectable IS NOT NULL
      AND v.VLDetectable > 0
),
child_eac AS (
    SELECT 
        '≤14' AS typepatients,
        IFNULL(p.Sex, 0) AS Sex,
        CONVERT(p.ClinicID, CHAR) AS ClinicID,
        v.DatVisit AS EACDate
    FROM tblcimain p
    JOIN tblcvmain v ON p.ClinicID = v.ClinicID
    WHERE v.VLDetectable IS NOT NULL
      AND v.VLDetectable > 0
),
eac_sessions AS (
    SELECT * FROM adult_eac
    UNION ALL
    SELECT * FROM child_eac
),
high_vl_with_eac AS (
    SELECT 
        h.ClinicID,
        h.typepatients,
        h.Sex,
        h.VLDate,
        h.VLValue,
        MIN(e.EACDate) AS EACDate
    FROM latest_high_vl h
    LEFT JOIN eac_sessions e
      ON e.ClinicID = h.ClinicID
     AND e.EACDate >= h.VLDate
    GROUP BY h.ClinicID, h.typepatients, h.Sex, h.VLDate, h.VLValue
),
eac_received AS (
    SELECT *
    FROM high_vl_with_eac
    WHERE EACDate IS NOT NULL
),
adult_followup_vl AS (
    SELECT 
        '15+' AS typepatients,
        IFNULL(p.Sex, 0) AS Sex,
        CONVERT(p.ClinicID, CHAR) AS ClinicID,
        pt.Dat AS VLDate,
        CAST(REPLACE(REPLACE(REPLACE(pt.HIVLoad, '<', ''), '>', ''), '=', '') AS UNSIGNED) AS VLValue
    FROM tblaimain p
    JOIN tblpatienttest pt ON CONVERT(p.ClinicID, CHAR) = CONVERT(pt.ClinicID, CHAR)
    WHERE pt.HIVLoad IS NOT NULL
      AND pt.HIVLoad <> ''
      AND pt.Dat BETWEEN :StartDate AND DATE_ADD(:EndDate, INTERVAL 4 MONTH)
),
child_followup_vl AS (
    SELECT 
        '≤14' AS typepatients,
        IFNULL(p.Sex, 0) AS Sex,
        CONVERT(p.ClinicID, CHAR) AS ClinicID,
        pt.Dat AS VLDate,
        CAST(REPLACE(REPLACE(REPLACE(pt.HIVLoad, '<', ''), '>', ''), '=', '') AS UNSIGNED) AS VLValue
    FROM tblcimain p
    JOIN tblpatienttest pt ON p.ClinicID = pt.ClinicID
    WHERE pt.HIVLoad IS NOT NULL
      AND pt.HIVLoad <> ''
      AND pt.Dat BETWEEN :StartDate AND DATE_ADD(:EndDate, INTERVAL 4 MONTH)
),
followup_tests AS (
    SELECT * FROM adult_followup_vl
    UNION ALL
    SELECT * FROM child_followup_vl
),
followup_ranked AS (
    SELECT 
        e.ClinicID,
        e.typepatients,
        e.Sex,
        e.VLDate,
        e.VLValue,
        e.EACDate,
        f.VLDate AS FollowupDate,
        f.VLValue AS FollowupValue,
        ROW_NUMBER() OVER (PARTITION BY e.ClinicID ORDER BY f.VLDate) AS rn
    FROM eac_received e
    LEFT JOIN followup_tests f
      ON f.ClinicID = e.ClinicID
     AND f.VLDate BETWEEN DATE_ADD(e.EACDate, INTERVAL 3 MONTH) AND DATE_ADD(e.EACDate, INTERVAL 4 MONTH)
),
followup_ready AS (
    SELECT 
        ClinicID,
        typepatients,
        Sex,
        VLDate,
        VLValue,
        EACDate,
        MAX(CASE WHEN rn = 1 THEN FollowupDate END) AS FollowupDate,
        MAX(CASE WHEN rn = 1 THEN FollowupValue END) AS FollowupValue
    FROM followup_ranked
    GROUP BY ClinicID, typepatients, Sex, VLDate, VLValue, EACDate
)

SELECT
    '13b. Percentage of PLHIV with VL ≥1000 copies/mL who received follow-up VL test ~3 months after enhanced adherence counselling' AS Indicator,
    CAST(COALESCE(SUM(CASE WHEN FollowupDate IS NOT NULL THEN 1 ELSE 0 END), 0) AS UNSIGNED) AS Followup_Received,
    CAST(COALESCE(COUNT(*), 0) AS UNSIGNED) AS Eligible_Patients,
    CAST(COALESCE(COUNT(*), 0) AS UNSIGNED) AS Total_High_VL_Counseled,
    CAST(
        CASE 
            WHEN COUNT(*) > 0 
            THEN ROUND(COALESCE(SUM(CASE WHEN FollowupDate IS NOT NULL THEN 1 ELSE 0 END), 0) * 100.0 / COUNT(*), 2)
            ELSE 0 
        END AS DECIMAL(5,2)
    ) AS Percentage,
    CAST(COALESCE(SUM(CASE WHEN typepatients = '≤14' AND Sex = 1 AND FollowupDate IS NOT NULL THEN 1 ELSE 0 END), 0) AS UNSIGNED) AS Male_0_14_Followup,
    CAST(COALESCE(SUM(CASE WHEN typepatients = '≤14' AND Sex = 0 AND FollowupDate IS NOT NULL THEN 1 ELSE 0 END), 0) AS UNSIGNED) AS Female_0_14_Followup,
    CAST(COALESCE(SUM(CASE WHEN typepatients = '15+' AND Sex = 1 AND FollowupDate IS NOT NULL THEN 1 ELSE 0 END), 0) AS UNSIGNED) AS Male_over_14_Followup,
    CAST(COALESCE(SUM(CASE WHEN typepatients = '15+' AND Sex = 0 AND FollowupDate IS NOT NULL THEN 1 ELSE 0 END), 0) AS UNSIGNED) AS Female_over_14_Followup,
    CAST(COALESCE(SUM(CASE WHEN typepatients = '≤14' AND Sex = 1 THEN 1 ELSE 0 END), 0) AS UNSIGNED) AS Male_0_14_Total,
    CAST(COALESCE(SUM(CASE WHEN typepatients = '≤14' AND Sex = 0 THEN 1 ELSE 0 END), 0) AS UNSIGNED) AS Female_0_14_Total,
    CAST(COALESCE(SUM(CASE WHEN typepatients = '15+' AND Sex = 1 THEN 1 ELSE 0 END), 0) AS UNSIGNED) AS Male_over_14_Total,
    CAST(COALESCE(SUM(CASE WHEN typepatients = '15+' AND Sex = 0 THEN 1 ELSE 0 END), 0) AS UNSIGNED) AS Female_over_14_Total,
    CAST(COALESCE(SUM(CASE WHEN typepatients = '≤14' THEN 1 ELSE 0 END), 0) AS UNSIGNED) AS Children_Total,
    CAST(COALESCE(SUM(CASE WHEN typepatients = '15+' THEN 1 ELSE 0 END), 0) AS UNSIGNED) AS Adults_Total
FROM followup_ready;



