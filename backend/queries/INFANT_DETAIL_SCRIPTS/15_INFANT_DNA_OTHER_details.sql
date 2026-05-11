-- =====================================================
-- INFANT DNA PCR OTHER (CUSTOM INPUT, NOT OI) DETAILS
-- =====================================================

-- =====================================================
-- PARAMETER SETUP
-- Set these parameters before running this query

-- Date parameters
SET @StartDate = '2025-04-01';             -- Start date (YYYY-MM-DD)
SET @EndDate = '2025-06-30';               -- End date (YYYY-MM-DD)

-- MAIN QUERY
-- =====================================================
-- DNA PCR Other (DNA = 3 and OtherDNA != 'OI' and has user input value)
-- Matches logic from Rinfants.vb line 327-328: COUNT(DISTINCT If(c.DNA = 3 And c.OtherDNA != 'OI' and not empty, c.ClinicID, null))
-- The aggregate query counts DISTINCT ClinicID from tblevmain visits where DNA = 3 and OtherDNA != 'OI' and not empty
SELECT 
    c.ClinicID as clinicid,
    MAX(c.Sex) as sex,
    CASE 
        WHEN MAX(c.Sex) = 0 THEN 'Female'
        WHEN MAX(c.Sex) = 1 THEN 'Male'
        ELSE 'Unknown'
    END as sex_display,
    MAX(c.DaBirth) as DaBirth,
    MAX(c.DafirstVisit) as DafirstVisit,
    MAX(c.DatVisit) as DatVisit,
    MAX(et.DaBlood) as TestDate,
    MAX(c.DNA) as dna_test_type,
    CASE 
        WHEN MAX(c.DNA) = 0 THEN 'At Birth'
        WHEN MAX(c.DNA) = 1 THEN '4-6 Weeks'
        WHEN MAX(c.DNA) = 5 THEN '9 Months'
        WHEN MAX(c.DNA) = 3 THEN 'OI'
        WHEN MAX(c.DNA) = 4 THEN 'Confirmatory'
        ELSE CONCAT('Type: ', MAX(c.DNA))
    END as dna_test_display,
    MAX(c.OtherDNA) as other_dna,
    MAX(et.Result) as Result,
    CASE 
        WHEN MAX(et.Result) = 1 THEN 'Positive'
        WHEN MAX(et.Result) = 0 THEN 'Negative'
        WHEN MAX(et.Result) IS NULL THEN 'Waiting'
        ELSE CONCAT('Result: ', MAX(et.Result))
    END as result_display,
    CASE WHEN TIMESTAMPDIFF(DAY, MAX(c.DaBirth), COALESCE(MAX(et.DaBlood), MAX(c.DatVisit))) IS NULL THEN NULL WHEN TIMESTAMPDIFF(DAY, MAX(c.DaBirth), COALESCE(MAX(et.DaBlood), MAX(c.DatVisit))) < 31 THEN CONCAT(CAST(TIMESTAMPDIFF(DAY, MAX(c.DaBirth), COALESCE(MAX(et.DaBlood), MAX(c.DatVisit))) AS CHAR), ' days') WHEN TIMESTAMPDIFF(DAY, MAX(c.DaBirth), COALESCE(MAX(et.DaBlood), MAX(c.DatVisit))) < 365 THEN CONCAT(CAST(FLOOR(TIMESTAMPDIFF(DAY, MAX(c.DaBirth), COALESCE(MAX(et.DaBlood), MAX(c.DatVisit)))/30) AS CHAR), ' mo') ELSE CONCAT(CAST(FLOOR(TIMESTAMPDIFF(DAY, MAX(c.DaBirth), COALESCE(MAX(et.DaBlood), MAX(c.DatVisit)))/365) AS CHAR), ' yr') END AS age_at_test,
    'Infant' as patient_type
FROM (
    SELECT DISTINCT 
        v.ClinicID, 
        ei.Sex, 
        ei.DaBirth, 
        ei.DafirstVisit,
        v.DatVisit, 
        v.DNA, 
        CAST(v.OtherDNA AS CHAR CHARACTER SET utf8mb4) COLLATE utf8mb4_general_ci as OtherDNA
    FROM tblevmain v 
    INNER JOIN tbleimain ei ON v.ClinicID = ei.ClinicID 
    WHERE v.DNA <> -1 
    AND v.DatVisit BETWEEN @StartDate AND @EndDate
    AND v.DNA = 3
    AND v.OtherDNA IS NOT NULL 
    AND CAST(v.OtherDNA AS CHAR CHARACTER SET utf8mb4) COLLATE utf8mb4_general_ci != '' 
    AND TRIM(CAST(v.OtherDNA AS CHAR CHARACTER SET utf8mb4) COLLATE utf8mb4_general_ci) != '' 
    AND UPPER(TRIM(CAST(v.OtherDNA AS CHAR CHARACTER SET utf8mb4) COLLATE utf8mb4_general_ci)) != 'OI'
) c
LEFT JOIN (
    SELECT ClinicID, DaBlood, Result
    FROM tbletest
    WHERE DNAPcr = 3
    AND (OI IS NULL OR OI = 0 OR OI = False OR OI = 'False')
    AND DaBlood BETWEEN @StartDate AND @EndDate
) et ON c.ClinicID = et.ClinicID
GROUP BY c.ClinicID
ORDER BY DatVisit DESC, clinicid;

