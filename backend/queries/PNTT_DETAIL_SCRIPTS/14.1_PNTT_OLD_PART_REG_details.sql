-- =====================================================
-- PNTT_OLD_PART_REG_DETAILS - Old Patient - Partner Registered DETAIL
-- =====================================================
-- Disaggregated records for: Old partners registered
-- Logic matches `PNTT_OLD_PART_REG_aggregate.sql`
-- =====================================================

SET @StartDate = '2025-04-01';
SET @EndDate   = '2025-06-30';

SELECT
    'PNTT_OLD_PART_REG' AS indicator_code,
    ai.ClinicID AS clinicid,
    ai.Sex AS index_sex,
    CASE
        WHEN ai.Sex = 0 THEN 'Female'
        WHEN ai.Sex = 1 THEN 'Male'
        ELSE 'Unknown'
    END AS index_sex_display,
    ai.DaBirth AS index_date_of_birth,
    ai.DafirstVisit AS index_first_visit_date,
    TIMESTAMPDIFF(YEAR, ai.DaBirth, @EndDate) AS index_age,
    ai.TypeofReturn,
    ai.OffIn,
    pntt.AsID AS pntt_asid,
    pntt.DaVisit AS pntt_visit_date,
    part.Sex AS partner_sex,
    CASE
        WHEN part.Sex = 0 THEN 'Female'
        WHEN part.Sex = 1 THEN 'Male'
        ELSE 'Unknown'
    END AS partner_sex_display
FROM (
    SELECT ClinicID, Sex, TypeofReturn, OffIn
    FROM tblaimain
    WHERE DafirstVisit BETWEEN @StartDate AND @EndDate
) adultactive
RIGHT OUTER JOIN tblapntt pntt
    ON adultactive.ClinicID = pntt.ClinicID
LEFT OUTER JOIN tblapnttpart part
    ON pntt.AsID = part.AsID
LEFT OUTER JOIN tblaimain ai
    ON ai.ClinicID = pntt.ClinicID
WHERE pntt.Agree = 0
  AND pntt.DaVisit BETWEEN @StartDate AND @EndDate
  AND (adultactive.ClinicID IS NULL
       OR adultactive.OffIn = 1
       OR adultactive.TypeofReturn <> -1)
ORDER BY pntt_visit_date, clinicid;


