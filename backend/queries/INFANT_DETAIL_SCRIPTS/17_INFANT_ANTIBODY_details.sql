-- =====================================================
-- INFANT ANTIBODY TEST DETAILS
-- =====================================================

-- =====================================================
-- PARAMETER SETUP
-- Set these parameters before running this query

-- Date parameters
SET @StartDate = '2025-04-01';             -- Start date (YYYY-MM-DD)
SET @EndDate = '2025-06-30';               -- End date (YYYY-MM-DD)

-- MAIN QUERY
-- =====================================================
-- Antibody Test Results
-- Antibody: 0 = Positive, 1 = Negative
SELECT
    tbleimain.ClinicID as clinicid,
    tbleimain.Sex as sex,
    CASE 
        WHEN tbleimain.Sex = 0 THEN 'Female'
        WHEN tbleimain.Sex = 1 THEN 'Male'
        ELSE 'Unknown'
    END as sex_display,
    tbleimain.DaBirth as DaBirth,
    NULL as DafirstVisit,
    tblevmain.DatVisit as DatVisit,
    NULL as TestDate,
    tblevmain.Antibody as antibody_result,
    CASE 
        WHEN tblevmain.Antibody = 1 THEN 'Negative'
        WHEN tblevmain.Antibody = 0 THEN 'Positive'
        ELSE CONCAT('Result: ', tblevmain.Antibody)
    END as antibody_display,
    tblevmain.DaAntibody as antibody_test_date,
    CASE WHEN TIMESTAMPDIFF(DAY, tbleimain.DaBirth, COALESCE(tblevmain.DaAntibody, tblevmain.DatVisit)) < 31 THEN CONCAT(CAST(TIMESTAMPDIFF(DAY, tbleimain.DaBirth, COALESCE(tblevmain.DaAntibody, tblevmain.DatVisit)) AS CHAR), ' days') WHEN TIMESTAMPDIFF(DAY, tbleimain.DaBirth, COALESCE(tblevmain.DaAntibody, tblevmain.DatVisit)) < 365 THEN CONCAT(CAST(FLOOR(TIMESTAMPDIFF(DAY, tbleimain.DaBirth, COALESCE(tblevmain.DaAntibody, tblevmain.DatVisit))/30) AS CHAR), ' mo') ELSE CONCAT(CAST(FLOOR(TIMESTAMPDIFF(DAY, tbleimain.DaBirth, COALESCE(tblevmain.DaAntibody, tblevmain.DatVisit))/365) AS CHAR), ' yr') END AS age_at_test,
    'Infant' as patient_type
FROM tblevmain 
INNER JOIN tbleimain ON tblevmain.ClinicID = tbleimain.ClinicID
WHERE 
    tblevmain.DatVisit BETWEEN @StartDate AND @EndDate
    AND tblevmain.Antibody IS NOT NULL
ORDER BY tblevmain.DatVisit DESC, tbleimain.ClinicID;

