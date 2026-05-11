-- =====================================================
-- PNTT_OLD_CHILD_PROV_DETAILS - Old Patient - Child Provider DETAIL
-- =====================================================
-- Disaggregated records for: Old child provider + Test + Positive
-- Logic matches `PNTT_OLD_CHILD_PROV_aggregate.sql`
-- =====================================================

SET @StartDate = '2025-04-01';
SET @EndDate   = '2025-06-30';

SELECT
    'PNTT_OLD_CHILD_PROV' AS indicator_code,
    ai.ClinicID AS clinicid,
    ai.Sex AS caregiver_sex,
    CASE
        WHEN ai.Sex = 0 THEN 'Female'
        WHEN ai.Sex = 1 THEN 'Male'
        ELSE 'Unknown'
    END AS caregiver_sex_display,
    ai.DaBirth AS caregiver_date_of_birth,
    ai.DafirstVisit AS caregiver_first_visit_date,
    TIMESTAMPDIFF(YEAR, ai.DaBirth, @EndDate) AS caregiver_age,
    ai.TypeofReturn,
    ai.OffIn,
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
    SELECT ClinicID, Sex, TypeofReturn, OffIn, DaBirth, DafirstVisit
    FROM tblaimain
    WHERE DafirstVisit BETWEEN @StartDate AND @EndDate
) adultactive
RIGHT OUTER JOIN tblapntt pntt
    ON adultactive.ClinicID = pntt.ClinicID
LEFT OUTER JOIN tblaimain ai
    ON ai.ClinicID = pntt.ClinicID
LEFT OUTER JOIN tblapnttchild child
    ON pntt.AsID = child.AsID
WHERE pntt.Agree = 0
  AND child.PlanChild = 1
  AND pntt.DaVisit BETWEEN @StartDate AND @EndDate
  AND (adultactive.ClinicID IS NULL
       OR adultactive.OffIn = 1
       OR adultactive.TypeofReturn <> -1)
  AND child.CAPID IS NOT NULL
ORDER BY pntt_visit_date, clinicid, child_id;



