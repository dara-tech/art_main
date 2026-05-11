-- =====================================================
-- PNTT_OLD_PART_HTS_POS - Old Patient - Partner Tested Positive by HTS AGGREGATE
-- =====================================================
-- Partners who were tested HIV positive by HTS
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
RIGHT OUTER
JOIN tblapntt
ON adultactive.ClinicID = tblapntt.ClinicID
LEFT OUTER
JOIN tblapnttpart
ON tblapntt.AsID = tblapnttpart.AsID
WHERE tblapntt.Agree=0
AND tblapnttpart.StatusHIV = 2
AND tblapnttpart.HTS=0
AND tblapnttpart.Result = 0
AND tblapntt.DaVisit BETWEEN @StartDate AND @EndDate
AND (adultactive.ClinicID is null
OR adultactive.OffIn=1
OR adultactive.TypeofReturn<>-1);
