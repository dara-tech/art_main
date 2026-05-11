-- =====================================================
-- PNTT_OLD_PART_REG_DETAILS - Old Patient - Partner Registered DETAIL
-- =====================================================
-- Disaggregated records for: Old partners registered
-- Logic matches `PNTT_OLD_PART_REG_aggregate.sql`
-- adultactive + index join: one tblaimain row per ClinicID (ROW_NUMBER) so joins do not multiply
-- detail rows when duplicate ClinicID rows exist in tblaimain. Requires MySQL 8+.
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
    FROM (
        SELECT ClinicID,
               Sex,
               TypeofReturn,
               OffIn,
               ROW_NUMBER() OVER (PARTITION BY ClinicID ORDER BY DafirstVisit ASC, OffIn ASC, TypeofReturn ASC) AS rn
        FROM tblaimain
        WHERE DafirstVisit BETWEEN @StartDate AND @EndDate
    ) ranked_adult
    WHERE rn = 1
) adultactive
RIGHT OUTER JOIN tblapntt pntt
    ON adultactive.ClinicID = pntt.ClinicID
LEFT OUTER JOIN tblapnttpart part
    ON pntt.AsID = part.AsID
LEFT OUTER JOIN (
    SELECT ClinicID,
           Sex,
           TypeofReturn,
           OffIn,
           DaBirth,
           DafirstVisit
    FROM (
        SELECT ClinicID,
               Sex,
               TypeofReturn,
               OffIn,
               DaBirth,
               DafirstVisit,
               ROW_NUMBER() OVER (PARTITION BY ClinicID ORDER BY DafirstVisit ASC, OffIn ASC, TypeofReturn ASC) AS rn
        FROM tblaimain
    ) ranked_ai
    WHERE rn = 1
) ai
    ON ai.ClinicID = pntt.ClinicID
WHERE pntt.Agree = 0
  AND pntt.DaVisit BETWEEN @StartDate AND @EndDate
  AND (adultactive.ClinicID IS NULL
       OR adultactive.OffIn = 1
       OR adultactive.TypeofReturn <> -1)
ORDER BY pntt_visit_date, clinicid;


