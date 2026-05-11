-- =====================================================
-- PNTT_NEW_CHILD_POS - New Patient - Child Tested Positive AGGREGATE
-- =====================================================
-- Child who was tested HIV positive
-- =====================================================
-- PARAMETER SETUP
-- =====================================================
SET @StartDate = '2025-04-01';
SET @EndDate = '2025-06-30';

-- =====================================================
-- MAIN QUERY
SELECT
  COUNT(tblapnttchild.Sex) as Tsex ,
  SUM(tblapnttchild.Sex=0) as Female,
  SUM(tblapnttchild.Sex) as Male
FROM (
  
  
SELECT ClinicID, Sex, TypeofReturn, OffIn
FROM tblaimain
WHERE DafirstVisit BETWEEN @StartDate AND @EndDate
) adultactive
LEFT OUTER
JOIN tblapntt
ON adultactive.ClinicID = tblapntt.ClinicID
LEFT OUTER
JOIN tblapnttchild
ON tblapntt.AsID = tblapnttchild.AsID
WHERE (adultactive.typeofReturn=-1
AND adultactive.offIn<>1)
AND tblapntt.Agree=0
AND tblapnttchild.StatusHIV=2
AND tblapnttchild.Result=0
AND tblapnttchild.Sex IN (0,1)
AND tblapntt.DaVisit BETWEEN @StartDate AND @EndDate;
