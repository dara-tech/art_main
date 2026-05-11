-- =====================================================
-- PNTT_NEW_PART_HIVST_POS_DETAILS - New Patient - Partner Tested Positive by HIVST DETAIL
-- =====================================================
-- Disaggregated records for: Partner who were tested HIV positive by HIVST
-- Logic matches `PNTT_NEW_PART_HIVST_POS_aggregate.sql`
-- =====================================================

SET @StartDate = '2025-04-01';
SET @EndDate   = '2025-06-30';

-- Aggregate WHERE adds:
--   tblapnttpart.StatusHIV = 2
--   tblapnttpart.HTS = 1
--   tblapnttpart.Result = 0

SELECT
    'PNTT_NEW_PART_HIVST_POS' AS indicator_code,
    adultactive.ClinicID AS clinicid,
    adultactive.Sex AS index_sex,
    CASE
        WHEN adultactive.Sex = 0 THEN 'Female'
        WHEN adultactive.Sex = 1 THEN 'Male'
        ELSE 'Unknown'
    END AS index_sex_display,
    adultactive.DaBirth AS index_date_of_birth,
    adultactive.DafirstVisit AS index_first_visit_date,
    TIMESTAMPDIFF(YEAR, adultactive.DaBirth, @EndDate) AS index_age,
    adultactive.TypeofReturn,
    adultactive.OffIn,
    pntt.AsID AS pntt_asid,
    pntt.DaVisit AS pntt_visit_date,
    part.Sex AS partner_sex,
    CASE
        WHEN part.Sex = 0 THEN 'Female'
        WHEN part.Sex = 1 THEN 'Male'
        ELSE 'Unknown'
    END AS partner_sex_display,
    part.StatusHIV AS partner_status_hiv_code,
    part.HTS AS partner_hts_code,
    part.Result AS partner_result_code
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
LEFT OUTER JOIN tblapnttpart part
    ON pntt.AsID = part.AsID
WHERE (adultactive.TypeofReturn = -1
       AND adultactive.OffIn <> 1)
  AND pntt.Agree = 0
  AND part.StatusHIV = 2
  AND part.HTS = 1
  AND part.Result = 0
  AND pntt.DaVisit BETWEEN @StartDate AND @EndDate
ORDER BY pntt_visit_date, clinicid;


