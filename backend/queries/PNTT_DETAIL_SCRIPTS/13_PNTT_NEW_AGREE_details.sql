-- =====================================================
-- PNTT_NEW_AGREE_DETAILS - New Patient - Agree Provide Partner DETAIL
-- =====================================================
-- Disaggregated records for: New Patient agree provide partner
-- Logic matches `PNTT_NEW_AGREE_aggregate.sql`
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
-- LEFT OUTER JOIN tblapntt
--   ON adultactive.ClinicID = tblapntt.ClinicID
-- WHERE (adultactive.TypeofReturn=-1
--        AND adultactive.offin<>1)
--   AND tblapntt.Agree = 0
--   AND tblapntt.DaVisit BETWEEN @StartDate AND @EndDate;
--
-- This detail query returns one row per patient/PNTT record matching that filter.

SELECT
    'PNTT_NEW_AGREE' AS indicator_code,
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
    adultactive.OffIn,
    pntt.AsID AS pntt_asid,
    pntt.Agree AS pntt_agree_code,
    pntt.DaVisit AS pntt_visit_date
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
LEFT OUTER JOIN tblapntt pntt
    ON adultactive.ClinicID = pntt.ClinicID
WHERE (adultactive.TypeofReturn = -1
       AND adultactive.OffIn <> 1)
  AND pntt.Agree = 0
  AND pntt.DaVisit BETWEEN @StartDate AND @EndDate
ORDER BY pntt_visit_date, clinicid;


