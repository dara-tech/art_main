-- =====================================================
-- PNTT_OLD_AGREE_DETAILS - Old Patient - Agree Provide Partner DETAIL
-- =====================================================
-- Disaggregated records for: Old patients who agree to provide partner
-- Logic matches `PNTT_OLD_AGREE_aggregate.sql`
-- =====================================================

SET @StartDate = '2025-04-01';
SET @EndDate   = '2025-06-30';

-- Aggregate: one row per tblapntt visit (old patients, Agree=0).
-- Detail must return one row per visit so count matches aggregate.

SELECT
    'PNTT_OLD_AGREE' AS indicator_code,
    ai.ClinicID AS clinicid,
    ai.Sex AS sex,
    CASE
        WHEN ai.Sex = 0 THEN 'Female'
        WHEN ai.Sex = 1 THEN 'Male'
        ELSE 'Unknown'
    END AS sex_display,
    ai.DaBirth AS date_of_birth,
    ai.DafirstVisit AS first_visit_date,
    TIMESTAMPDIFF(YEAR, ai.DaBirth, @EndDate) AS age,
    ai.TypeofReturn,
    ai.OffIn,
    pntt.AsID AS pntt_asid,
    pntt.DaVisit AS pntt_visit_date
FROM (
    SELECT ClinicID, Sex, TypeofReturn, OffIn, DaBirth, DafirstVisit
    FROM tblaimain
    WHERE DafirstVisit BETWEEN @StartDate AND @EndDate
) adultactive
RIGHT OUTER JOIN tblapntt pntt
    ON adultactive.ClinicID = pntt.ClinicID
LEFT OUTER JOIN tblaimain ai
    ON ai.ClinicID = pntt.ClinicID
WHERE pntt.Agree = 0
  AND pntt.DaVisit BETWEEN @StartDate AND @EndDate
  AND (adultactive.ClinicID IS NULL
       OR adultactive.OffIn = 1
       OR adultactive.TypeofReturn <> -1)
ORDER BY pntt_visit_date, clinicid;


