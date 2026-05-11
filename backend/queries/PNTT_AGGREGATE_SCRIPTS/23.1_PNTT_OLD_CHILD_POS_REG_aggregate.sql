-- =====================================================
-- PNTT_OLD_CHILD_POS_REG - Old Patient - Child Positive and Register AGGREGATE
-- =====================================================
-- Child Pos and Reg
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
RIGHT OUTER
JOIN tblapntt
ON adultactive.ClinicID = tblapntt.ClinicID
LEFT OUTER
JOIN tblapnttchild
ON tblapntt.AsID = tblapnttchild.AsID
WHERE tblapntt.Agree=0
AND tblapnttchild.StatusHIV=2
AND tblapnttchild.Result=0
AND tblapnttchild.RegTreat=0
AND tblapntt.DaVisit BETWEEN @StartDate AND @EndDate
AND (adultactive.ClinicID is null
OR adultactive.OffIn=1
OR adultactive.TypeofReturn<>-1)
AND tblapnttchild.CAPID is not null;
