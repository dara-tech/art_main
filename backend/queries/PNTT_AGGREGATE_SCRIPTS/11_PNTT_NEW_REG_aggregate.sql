-- =====================================================
-- PNTT_NEW_REG - New Patient Registered AGGREGATE
-- =====================================================
-- Number of Patient register PNTT on this quarter (New Patient)
-- =====================================================
-- PARAMETER SETUP
-- =====================================================
SET @StartDate = '2025-04-01';
SET @EndDate = '2025-06-30';

-- =====================================================
-- MAIN QUERY
SELECT
  COUNT(adultactive.sex) as Tsex,
  SUM(adultactive.sex=0) as Female,
  SUM(adultactive.sex=1) as Male
FROM (
  
  
SELECT ClinicID, Sex, TypeofReturn, OffIn
FROM tblaimain
WHERE DafirstVisit BETWEEN @StartDate AND @EndDate
) adultactive
WHERE adultactive.typeofReturn=-1
AND adultactive.offIn<>1;
