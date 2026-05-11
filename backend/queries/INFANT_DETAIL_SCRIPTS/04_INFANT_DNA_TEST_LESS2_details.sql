-- =====================================================
-- INFANT DNA PCR TEST (< 2 months) DETAILS
-- =====================================================

-- =====================================================
-- PARAMETER SETUP
-- Set these parameters before running this query

-- Date parameters
SET @StartDate = '2025-04-01';             -- Start date (YYYY-MM-DD)
SET @EndDate = '2025-06-30';               -- End date (YYYY-MM-DD)

-- MAIN QUERY
-- =====================================================
-- DNA PCR Test Counts - Less than 2 months (76 days) from birth
-- Matches logic from Rinfants.vb: count(DISTINCT ClinicID) where timestampdiff(Day, DaBirth, TestDate) <= 76
-- IMPORTANT: This query shows ONE row per ClinicID (matching the count query logic)
SELECT 
    c.ClinicID as clinicid,
    c.Sex as sex,
    CASE 
        WHEN c.Sex = 0 THEN 'Female'
        WHEN c.Sex = 1 THEN 'Male'
        ELSE 'Unknown'
    END as sex_display,
    c.DaBirth as DaBirth,
    ei.DafirstVisit as DafirstVisit,
    v.DatVisit as DatVisit,
    c.TestDate as TestDate,
    CASE WHEN TIMESTAMPDIFF(DAY, c.DaBirth, c.TestDate) < 31 THEN CONCAT(CAST(TIMESTAMPDIFF(DAY, c.DaBirth, c.TestDate) AS CHAR), ' days') WHEN TIMESTAMPDIFF(DAY, c.DaBirth, c.TestDate) < 365 THEN CONCAT(CAST(FLOOR(TIMESTAMPDIFF(DAY, c.DaBirth, c.TestDate)/30) AS CHAR), ' mo') ELSE CONCAT(CAST(FLOOR(TIMESTAMPDIFF(DAY, c.DaBirth, c.TestDate)/365) AS CHAR), ' yr') END AS age_at_test,
    CASE WHEN TIMESTAMPDIFF(DAY, c.DaBirth, c.TestDate) <= 76 THEN '< 2 months' ELSE '> 2 months' END as age_category,
    'Infant' as patient_type
FROM (
    SELECT 
        c.ClinicID,
        MAX(c.Sex) as Sex,
        MAX(c.DaBirth) as DaBirth,
        MAX(c.TestDate) as TestDate
    FROM (
        SELECT DISTINCT 
            v.ClinicID, 
            ei.Sex, 
            ei.DaBirth, 
            COALESCE(et.DaBlood, v.DatVisit) as TestDate
        FROM tblevmain v 
        INNER JOIN tbleimain ei ON v.ClinicID = ei.ClinicID 
        LEFT JOIN (
            SELECT ClinicID, MAX(DaBlood) as DaBlood 
            FROM tbletest 
            WHERE DaBlood BETWEEN @StartDate AND @EndDate 
            GROUP BY ClinicID
        ) et ON v.ClinicID = et.ClinicID
        WHERE v.DNA <> -1 
        AND v.DatVisit BETWEEN @StartDate AND @EndDate
    ) c
    WHERE TIMESTAMPDIFF(DAY, c.DaBirth, c.TestDate) <= 76
    GROUP BY c.ClinicID
) c
INNER JOIN tbleimain ei ON c.ClinicID = ei.ClinicID
LEFT JOIN (
    SELECT ClinicID, MAX(DatVisit) as DatVisit
    FROM tblevmain
    WHERE DNA <> -1 
    AND DatVisit BETWEEN @StartDate AND @EndDate
    GROUP BY ClinicID
) v ON c.ClinicID = v.ClinicID
GROUP BY c.ClinicID, c.Sex, c.DaBirth, ei.DafirstVisit, v.DatVisit, c.TestDate
ORDER BY c.TestDate DESC, c.ClinicID;

