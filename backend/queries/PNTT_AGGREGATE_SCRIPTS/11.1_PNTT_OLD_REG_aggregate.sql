-- =====================================================
-- 11.1_PNTT_OLD_REG_aggregate.sql
-- Old Patient Registered (PNTT) - AGGREGATE
-- =====================================================
-- Counts OLD PNTT patients (existing clients) who have a PNTT visit
-- in the period, excluding NEW patients in the quarter
-- (DafirstVisit between @StartDate and @EndDate with TypeofReturn = -1 and OffIn <> 1).
-- One row, 3 columns: Tsex, Female, Male
-- =====================================================

SET @StartDate = '2025-04-01';
SET @EndDate   = '2025-06-30';

SELECT
  COUNT(*)                           AS Tsex,
  SUM(CASE WHEN ai.Sex = 0 THEN 1 ELSE 0 END) AS Female,
  SUM(CASE WHEN ai.Sex = 1 THEN 1 ELSE 0 END) AS Male
FROM (
  SELECT ClinicID, Sex, TypeofReturn, OffIn
  FROM tblaimain
  WHERE DafirstVisit BETWEEN @StartDate AND @EndDate
) adultactive
RIGHT OUTER JOIN tblapntt pntt
  ON adultactive.ClinicID = pntt.ClinicID
LEFT OUTER JOIN tblaimain ai
  ON ai.ClinicID = pntt.ClinicID
WHERE pntt.DaVisit BETWEEN @StartDate AND @EndDate
  AND (adultactive.ClinicID IS NULL
       OR adultactive.OffIn = 1
       OR adultactive.TypeofReturn <> -1);

