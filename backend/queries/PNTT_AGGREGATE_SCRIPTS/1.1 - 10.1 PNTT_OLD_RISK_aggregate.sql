-- =====================================================
-- PNTT_OLD_RISK - Old Patient - Risk Factors AGGREGATE
-- =====================================================
-- PNTT Risk old register
-- =====================================================
-- PARAMETER SETUP
-- =====================================================
SET @StartDate = '2025-04-01';
SET @EndDate = '2025-06-30';

-- =====================================================
-- MAIN QUERY
SELECT
  SUM(pntt.SexHIV=0) as R,
  SUM(pntt.SexHIV=1) as R1,
  SUM(pntt.SexHIV=2) as R2,
  SUM(pntt.Wsex=0) as 1R,
  SUM(pntt.Wsex=1) as 1R1,
  SUM(pntt.Wsex=2) as 1R2,
  SUM(pntt.SexM=0) as 2R,
  SUM(pntt.SexM=1) as 2R1,
  SUM(pntt.SexM=2) as 2R2,
  SUM(pntt.SexTran=0) as 3R,
  SUM(pntt.SexTran=1) as 3R1,
  SUM(pntt.SexTran=2) as 3R2,
  SUM(pntt.Sex4=0) as 4R,
  SUM(pntt.Sex4=1) as 4R1,
  SUM(pntt.Sex4=2) as 4R2,
  SUM(pntt.Drug=0) as 5R,
  SUM(pntt.Drug=1) as 5R1,
  SUM(pntt.Drug=2) as 5R2,
  SUM(pntt.Pill=0) as 6R,
  SUM(pntt.Pill=1) as 6R1,
  SUM(pntt.Pill=2) as 6R2,
  SUM(pntt.SexMoney=0) as 7R,
  SUM(pntt.SexMoney=1) as 7R1,
  SUM(pntt.SexMoney=2) as 7R2,
  SUM(pntt.SexProvice =0) as 8R,
  SUM(pntt.SexProvice=1) as 8R1,
  SUM(pntt.SexProvice=2) as 8R2,
  SUM(pntt.WOut=0) as 9R,
  SUM(pntt.WOut=1) as 9R1,
  SUM(pntt.WOut=2) as 9R2
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
AND (adultactive.ClinicID is null
OR adultactive.OffIn=1
OR adultactive.TypeofReturn<>-1);
