-- =====================================================
-- PNTT_NEW_PART_REG_DETAILS - New Patient - Partner Registered DETAIL
-- =====================================================
-- Disaggregated records for: Number of partners registered
-- Logic matches `PNTT_NEW_PART_REG_aggregate.sql`
-- =====================================================

-- Date parameters (Quarterly period)
SET @StartDate = '2025-04-01';
SET @EndDate   = '2025-06-30';

-- Detail logic mirrors:
-- FROM (
--   SELECT ClinicID, Sex, TypeofReturn, OffIn
--   FROM tblaimain
--   WHERE DafirstVisit BETWEEN @StartDate AND @EndDate
-- ) adultactive
-- LEFT JOIN tblapntt      ON adultactive.ClinicID = tblapntt.ClinicID
-- LEFT JOIN tblapnttpart  ON tblapntt.AsID        = tblapnttpart.AsID
-- WHERE (adultactive.TypeofReturn=-1 AND adultactive.offin<>1)
--   AND tblapntt.Agree=0
--   AND tblapntt.DaVisit BETWEEN @StartDate AND @EndDate;

SELECT
    'PNTT_NEW_PART_REG' AS indicator_code,
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
    END AS partner_sex_display
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
  AND pntt.DaVisit BETWEEN @StartDate AND @EndDate
ORDER BY pntt_visit_date, clinicid;


