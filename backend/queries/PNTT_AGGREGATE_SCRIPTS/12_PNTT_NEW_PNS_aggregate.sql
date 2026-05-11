-- =====================================================
-- PNTT_NEW_PNS - New Patient - Partner Notification Service AGGREGATE
-- =====================================================
-- Partner notification service
-- =====================================================
-- PARAMETER SETUP
-- =====================================================
SET @StartDate = '2025-04-01';
SET @EndDate = '2025-06-30';

-- =====================================================
-- MAIN QUERY
SELECT
  COUNT(adultactive.sex) as Tsex,
  SUM(case when adultactive.sex=0 then 1 else 0 end) as Female,
  SUM(case when adultactive.sex=1 then 1 else 0 end) as Male
FROM (
  
  
SELECT ClinicID, Sex, TypeofReturn, OffIn
FROM tblaimain
WHERE DafirstVisit BETWEEN @StartDate AND @EndDate
) adultactive
LEFT OUTER
JOIN tblapntt
ON adultactive.ClinicID = tblapntt.ClinicID
WHERE (adultactive.TypeofReturn=-1
AND adultactive.offin<>1)
AND tblapntt.DaVisit BETWEEN @StartDate AND @EndDate;
