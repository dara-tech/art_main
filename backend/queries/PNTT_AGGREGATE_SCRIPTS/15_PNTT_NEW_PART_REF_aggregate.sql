-- =====================================================
-- PNTT_NEW_PART_REF - New Patient - Partner Referral AGGREGATE
-- =====================================================
-- Partner Referal + Test HIV + Positive
-- =====================================================
-- PARAMETER SETUP
-- =====================================================
SET @StartDate = '2025-04-01';
SET @EndDate = '2025-06-30';

-- =====================================================
-- MAIN QUERY
SELECT
  COUNT(tblapnttpart.Sex) as Tsex,
  SUM(tblapnttpart.Sex=0) as Female,
  SUM(tblapnttpart.Sex=1) as Male
FROM (
  
  
SELECT ClinicID, Sex, TypeofReturn, OffIn
FROM tblaimain
WHERE DafirstVisit BETWEEN @StartDate AND @EndDate
) adultactive
LEFT OUTER
JOIN tblapntt
ON adultactive.ClinicID = tblapntt.ClinicID
LEFT OUTER
JOIN tblapnttpart
ON tblapntt.AsID = tblapnttpart.AsID
WHERE (adultactive.TypeofReturn=-1
AND adultactive.offin<>1)
AND tblapntt.Agree=0
AND tblapnttpart.NotificationIPV = 1
AND tblapntt.DaVisit BETWEEN @StartDate AND @EndDate;
