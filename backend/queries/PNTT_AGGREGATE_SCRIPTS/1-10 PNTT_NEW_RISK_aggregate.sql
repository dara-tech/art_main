-- =====================================================
-- PNTT_NEW_RISK - New Patient - Risk Factors AGGREGATE
-- =====================================================
-- PNTT Risk new register
-- =====================================================
-- PARAMETER SETUP
-- =====================================================
SET @StartDate = '2025-04-01';
SET @EndDate = '2025-06-30';

-- =====================================================
-- MAIN QUERY
SELECT
  SUM(tblapntt.SexHIV=0) as R,
  SUM(tblapntt.SexHIV=1) as R1,
  SUM(tblapntt.SexHIV=2) as R2,
  SUM(tblapntt.Wsex=0) as 1R,
  SUM(tblapntt.Wsex=1) as 1R1,
  SUM(tblapntt.Wsex=2) as 1R2,
  SUM(tblapntt.SexM=0) as 2R,
  SUM(tblapntt.SexM=1) as 2R1,
  SUM(tblapntt.SexM=2) as 2R2,
  SUM(tblapntt.SexTran=0) as 3R,
  SUM(tblapntt.SexTran=1) as 3R1,
  SUM(tblapntt.SexTran=2) as 3R2,
  SUM(tblapntt.Sex4=0) as 4R,
  SUM(tblapntt.Sex4=1) as 4R1,
  SUM(tblapntt.Sex4=2) as 4R2,
  SUM(tblapntt.Drug=0) as 5R,
  SUM(tblapntt.Drug=1) as 5R1,
  SUM(tblapntt.Drug=2) as 5R2,
  SUM(tblapntt.Pill=0) as 6R,
  SUM(tblapntt.Pill=1) as 6R1,
  SUM(tblapntt.Pill=2) as 6R2,
  SUM(tblapntt.SexMoney=0) as 7R,
  SUM(tblapntt.SexMoney=1) as 7R1,
  SUM(tblapntt.SexMoney=2) as 7R2,
  SUM(tblapntt.SexProvice =0) as 8R,
  SUM(tblapntt.SexProvice=1) as 8R1,
  SUM(tblapntt.SexProvice=2) as 8R2,
  SUM(tblapntt.WOut=0) as 9R,
  SUM(tblapntt.WOut=1) as 9R1,
  SUM(tblapntt.WOut=2) as 9R2
FROM (
  
  
SELECT ClinicID, Sex, TypeofReturn, OffIn
FROM tblaimain
WHERE DafirstVisit BETWEEN @StartDate AND @EndDate
) adultactive
LEFT OUTER
JOIN (
SELECT
  p.ClinicID, p.DaVisit, SexHIV, Wsex, SexM, SexTran, Sex4, Drug, Pill, SexMoney, SexProvice, WOut, Agree, AsID
FROM tblapntt p
INNER
JOIN (
SELECT
  ClinicID, max(DaVisit) as DaVisit
FROM tblapntt
WHERE tblapntt.DaVisit BETWEEN @StartDate AND @EndDate
GROUP BY ClinicID ) mp
ON mp.ClinicID=p.ClinicID
AND p.DaVisit=mp.DaVisit) tblapntt
ON adultactive.ClinicID = tblapntt.ClinicID
WHERE (adultactive.TypeofReturn=-1
AND adultactive.offin<>1);
