-- =====================================================
-- PNTT_NEW_REG_DETAILS - New Patient Registered DETAIL
-- =====================================================
-- Disaggregated records for: New Patient registered in PNTT (adult, new patient)
-- Logic matches `PNTT_NEW_REG_aggregate.sql`
-- =====================================================

-- =====================================================
-- PARAMETER SETUP
-- Set these parameters before running this query
-- =====================================================

-- Date parameters (Quarterly period)
SET @StartDate = '2025-04-01';             -- Start date (YYYY-MM-DD)
SET @EndDate   = '2025-06-30';             -- End date (YYYY-MM-DD)

-- =====================================================
-- MAIN QUERY
-- =====================================================
-- Source aggregate logic:
-- FROM (
--   SELECT ClinicID, Sex, TypeofReturn, OffIn
--   FROM tblaimain
--   WHERE DafirstVisit BETWEEN @StartDate AND @EndDate
-- ) adultactive
-- WHERE adultactive.typeofReturn=-1
--   AND adultactive.offIn<>1;
--
-- This detail query returns one row per patient matching that filter.

SELECT
    'PNTT_NEW_REG' AS indicator_code,
    adultactive.ClinicID AS clinicid,
    adultactive.Sex AS sex,
    CASE
        WHEN adultactive.Sex = 0 THEN 'Female'
        WHEN adultactive.Sex = 1 THEN 'Male'
        ELSE 'Unknown'
    END AS sex_display,
    adultactive.DaBirth AS date_of_birth,
    adultactive.DafirstVisit AS first_visit_date,
    TIMESTAMPDIFF(YEAR, adultactive.DaBirth, @EndDate) AS age,
    adultactive.TypeofReturn,
    adultactive.OffIn
FROM (
    SELECT ClinicID,
           Sex,
           TypeofReturn,
           OffIn,
           DaBirth,
           DafirstVisit
    FROM tblaimain
    WHERE DafirstVisit BETWEEN @StartDate AND @EndDate
) adultactive
WHERE adultactive.TypeofReturn = -1
  AND adultactive.OffIn <> 1
ORDER BY clinicid, first_visit_date;


