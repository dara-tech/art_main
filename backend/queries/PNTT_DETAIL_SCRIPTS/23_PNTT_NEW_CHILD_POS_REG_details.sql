-- =====================================================
-- PNTT_NEW_CHILD_POS_REG_DETAILS - New Patient - Child Positive and Register DETAIL
-- =====================================================
-- Disaggregated records for: Children HIV positive and registered
-- Logic matches `PNTT_NEW_CHILD_POS_REG_aggregate.sql`
-- =====================================================

SET @StartDate = '2025-04-01';
SET @EndDate   = '2025-06-30';

-- Aggregate WHERE adds:
--   tblapnttchild.StatusHIV = 2
--   tblapnttchild.Result = 0
--   tblapnttchild.RegTreat = 0

SELECT DISTINCT
    'PNTT_NEW_CHILD_POS_REG' AS indicator_code,
    adultactive.ClinicID AS clinicid,
    adultactive.Sex AS caregiver_sex,
    CASE
        WHEN adultactive.Sex = 0 THEN 'Female'
        WHEN adultactive.Sex = 1 THEN 'Male'
        ELSE 'Unknown'
    END AS caregiver_sex_display,
    adultactive.DaBirth AS caregiver_date_of_birth,
    adultactive.DafirstVisit AS caregiver_first_visit_date,
    TIMESTAMPDIFF(YEAR, adultactive.DaBirth, @EndDate) AS caregiver_age,
    adultactive.TypeofReturn,
    adultactive.OffIn,
    pntt.AsID AS pntt_asid,
    pntt.DaVisit AS pntt_visit_date,
    child.CAPID AS child_id,
    child.Sex AS child_sex,
    CASE
        WHEN child.Sex = 0 THEN 'Female'
        WHEN child.Sex = 1 THEN 'Male'
        ELSE 'Unknown'
    END AS child_sex_display,
    child.StatusHIV AS child_status_hiv_code,
    child.Result AS child_result_code,
    child.RegTreat AS child_reg_treat_code
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
LEFT OUTER JOIN tblapnttchild child
    ON pntt.AsID = child.AsID
WHERE (adultactive.TypeofReturn = -1
       AND adultactive.OffIn <> 1)
  AND pntt.Agree = 0
  AND child.StatusHIV = 2
  AND child.Result = 0
  AND child.RegTreat = 0
  AND child.Sex IN (0,1)
  AND pntt.DaVisit BETWEEN @StartDate AND @EndDate
ORDER BY pntt_visit_date, clinicid, child_id;


