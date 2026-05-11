-- =====================================================
-- PNTT_OLD_AGREE - Old Patient - Agree Provide Partner AGGREGATE
-- =====================================================
-- Counts old PNTT patients (NOT visits): 1 row per ClinicID.
-- =====================================================
-- PARAMETER SETUP
-- =====================================================
SET @StartDate = '2025-04-01';
SET @EndDate = '2025-06-30';

-- =====================================================
-- MAIN QUERY
-- Build patient-level rows, then count distinct ClinicID overall and by sex.
SELECT
  COUNT(DISTINCT x.clinicid) AS Tsex,
  COUNT(DISTINCT CASE WHEN x.sex = 0 THEN x.clinicid END) AS Female,
  COUNT(DISTINCT CASE WHEN x.sex = 1 THEN x.clinicid END) AS Male
FROM (
  SELECT
    ai.ClinicID AS clinicid,
    ai.Sex      AS sex
  FROM (
    SELECT ClinicID, Sex, TypeofReturn, OffIn
    FROM tblaimain
    WHERE DafirstVisit BETWEEN @StartDate AND @EndDate
  ) adultactive
  RIGHT OUTER JOIN tblapntt
    ON adultactive.ClinicID = tblapntt.ClinicID
  LEFT OUTER JOIN tblaimain ai
    ON ai.ClinicID = tblapntt.ClinicID
  WHERE tblapntt.Agree = 0
    AND tblapntt.DaVisit BETWEEN @StartDate AND @EndDate
    AND (adultactive.ClinicID IS NULL
         OR adultactive.OffIn = 1
         OR adultactive.TypeofReturn <> -1)
) x;
