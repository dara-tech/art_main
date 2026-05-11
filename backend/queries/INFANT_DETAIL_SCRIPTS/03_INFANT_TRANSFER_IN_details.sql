-- =====================================================
-- INFANT TRANSFER IN DETAILS
-- =====================================================

-- =====================================================
-- PARAMETER SETUP
-- Set these parameters before running this query

-- Date parameters
SET @StartDate = '2025-04-01';             -- Start date (YYYY-MM-DD)
SET @EndDate = '2025-06-30';               -- End date (YYYY-MM-DD)

-- MAIN QUERY
-- =====================================================
-- Transfer In - Infants transferred from another facility
-- Matches logic from Rinfants.vb: Offin = 1
SELECT
    c.ClinicID as clinicid,
    c.Sex as sex,
    CASE 
        WHEN c.Sex = 0 THEN 'Female'
        WHEN c.Sex = 1 THEN 'Male'
        ELSE 'Unknown'
    END as sex_display,
    c.DaBirth as DaBirth,
    c.DafirstVisit as DafirstVisit,
    NULL as DatVisit,
    CASE WHEN TIMESTAMPDIFF(DAY, c.DaBirth, c.DafirstVisit) < 31 THEN CONCAT(CAST(TIMESTAMPDIFF(DAY, c.DaBirth, c.DafirstVisit) AS CHAR), ' days') WHEN TIMESTAMPDIFF(DAY, c.DaBirth, c.DafirstVisit) < 365 THEN CONCAT(CAST(FLOOR(TIMESTAMPDIFF(DAY, c.DaBirth, c.DafirstVisit)/30) AS CHAR), ' mo') ELSE CONCAT(CAST(FLOOR(TIMESTAMPDIFF(DAY, c.DaBirth, c.DafirstVisit)/365) AS CHAR), ' yr') END AS age_at_test,
    CASE WHEN TIMESTAMPDIFF(DAY, c.DaBirth, c.DafirstVisit) <= 76 THEN '< 2 months' ELSE '> 2 months' END as age_category,
    c.Offin as Offin,
    CASE 
        WHEN c.Offin = 0 THEN 'Not Transferred'
        WHEN c.Offin = 1 THEN 'Transferred In'
        ELSE CONCAT('Status: ', c.Offin)
    END as transfer_status,
    'Infant' as patient_type
FROM (
    SELECT ClinicID, Sex, DafirstVisit, DaBirth, Offin 
    FROM tbleimain 
    WHERE DafirstVisit BETWEEN @StartDate AND @EndDate 
    AND Offin = 1
) c
ORDER BY c.DafirstVisit DESC, c.ClinicID;

