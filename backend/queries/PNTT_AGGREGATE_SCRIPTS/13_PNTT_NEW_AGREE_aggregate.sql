-- =====================================================
-- PNTT_NEW_AGREE - New Patient - Agree Provide Partner AGGREGATE
-- =====================================================
-- New Patient aggree provide partner
-- =====================================================
-- PARAMETER SETUP
-- =====================================================
SET @StartDate = '2025-04-01';
SET @EndDate = '2025-06-30';

-- =====================================================
-- MAIN QUERY
SELECT
  COUNT(*) as Tsex,
  SUM(case when adultactive.sex=0 then 1 else 0 end) as Female,
  SUM(case when adultactive.sex=1 then 1 else 0 end) as Male
FROM (
SELECT ClinicID, Sex, TypeofReturn, OffIn
FROM tblaimain
WHERE DafirstVisit BETWEEN @StartDate AND @EndDate
) adultactive
LEFT OUTER JOIN tblapntt pntt
ON adultactive.ClinicID = pntt.ClinicID
WHERE (adultactive.TypeofReturn=-1
AND adultactive.offin<>1)
AND pntt.Agree = 0
AND pntt.DaVisit BETWEEN @StartDate AND @EndDate;
