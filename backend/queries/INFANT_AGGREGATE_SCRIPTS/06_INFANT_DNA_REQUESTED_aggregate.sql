-- =====================================================
-- INFANT_DNA_REQUESTED_aggregate - DNA PCR REQUESTED BY CLINICIAN AGGREGATE
-- =====================================================
-- Section 6: Counts of DNA PCR requests by type (At Birth, 4-6 Weeks, 9 Months, Confirmatory, OI)
-- Matches detail scripts: DNA=0 At Birth, DNA=1 4-6 Weeks, DNA=5 9 Months, DNA=4 Confirmatory, DNA=3+OtherDNA='OI' OI
-- =====================================================
-- PARAMETER SETUP
-- =====================================================
SET @StartDate = '2025-01-01';
SET @EndDate = '2025-03-31';

-- =====================================================
-- MAIN QUERY
-- =====================================================
SELECT
  COUNT(DISTINCT CASE WHEN v.DNA = 0 AND ei.Sex = 1 THEN v.ClinicID END) AS m_birth,
  COUNT(DISTINCT CASE WHEN v.DNA = 0 AND ei.Sex = 0 THEN v.ClinicID END) AS f_birth,
  COUNT(DISTINCT CASE WHEN v.DNA = 1 AND ei.Sex = 1 THEN v.ClinicID END) AS m_46w,
  COUNT(DISTINCT CASE WHEN v.DNA = 1 AND ei.Sex = 0 THEN v.ClinicID END) AS f_46w,
  COUNT(DISTINCT CASE WHEN v.DNA = 5 AND ei.Sex = 1 THEN v.ClinicID END) AS m_9m,
  COUNT(DISTINCT CASE WHEN v.DNA = 5 AND ei.Sex = 0 THEN v.ClinicID END) AS f_9m,
  COUNT(DISTINCT CASE WHEN v.DNA = 4 AND ei.Sex = 1 THEN v.ClinicID END) AS m_confirm,
  COUNT(DISTINCT CASE WHEN v.DNA = 4 AND ei.Sex = 0 THEN v.ClinicID END) AS f_confirm,
  COUNT(DISTINCT CASE WHEN v.DNA = 3 AND CAST(v.OtherDNA AS CHAR CHARACTER SET utf8mb4) COLLATE utf8mb4_general_ci = 'OI' AND ei.Sex = 1 THEN v.ClinicID END) AS m_oi,
  COUNT(DISTINCT CASE WHEN v.DNA = 3 AND CAST(v.OtherDNA AS CHAR CHARACTER SET utf8mb4) COLLATE utf8mb4_general_ci = 'OI' AND ei.Sex = 0 THEN v.ClinicID END) AS f_oi
FROM tblevmain v
INNER JOIN tbleimain ei ON v.ClinicID = ei.ClinicID
WHERE v.DNA <> -1
  AND v.DatVisit BETWEEN @StartDate AND @EndDate;
