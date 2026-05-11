-- =====================================================
-- PNTT_NEW_PART_POS_REG_DETAILS - New Patient - Partner Positive and Register DETAIL
-- =====================================================
-- Disaggregated records for: Number of partners positive and register
-- Logic matches `PNTT_NEW_PART_POS_REG_aggregate.sql`
-- =====================================================

SET @StartDate = '2025-04-01';
SET @EndDate   = '2025-06-30';

-- Aggregate WHERE adds:
--   tblapnttpart.StatusHIV = 2
--   tblapnttpart.Result = 0
--   tblapnttpart.RegTreat = 0

SELECT
    'PNTT_NEW_PART_POS_REG' AS indicator_code,
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
    part.Result AS partner_result_code,
    part.RegTreat AS partner_reg_treat_code
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
  AND part.Result = 0
  AND part.RegTreat = 0
  AND pntt.DaVisit BETWEEN @StartDate AND @EndDate
ORDER BY pntt_visit_date, clinicid;


