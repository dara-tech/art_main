-- =====================================================
-- PNTT_NEW_CHILD_REF_DETAILS - New Patient - Child Referral DETAIL
-- =====================================================
-- Disaggregated records for: Number of child referrals + Test + Positive
-- Logic matches `PNTT_NEW_CHILD_REF_aggregate.sql`
-- =====================================================

SET @StartDate = '2025-04-01';
SET @EndDate   = '2025-06-30';

-- Aggregate WHERE adds: tblapnttchild.PlanChild = 0

SELECT DISTINCT
    'PNTT_NEW_CHILD_REF' AS indicator_code,
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
    child.PlanChild AS child_plan_code
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
  AND child.PlanChild = 0
  AND child.Sex IN (0,1)
  AND pntt.DaVisit BETWEEN @StartDate AND @EndDate
ORDER BY pntt_visit_date, clinicid, child_id;


