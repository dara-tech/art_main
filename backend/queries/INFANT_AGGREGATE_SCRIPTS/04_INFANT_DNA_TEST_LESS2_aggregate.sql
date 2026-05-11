-- =====================================================
-- INFANT_DNA_TEST_LESS2_aggregate - DNA PCR Test Less than 2 months AGGREGATE
-- =====================================================
-- Derived from corresponding detail script
-- =====================================================
-- PARAMETER SETUP
-- =====================================================
SET @StartDate = '2025-01-01';
SET @EndDate = '2025-03-31';

-- =====================================================
-- MAIN QUERY
-- =====================================================
SELECT
  COUNT(DISTINCT IF(c.Sex = 1 AND TIMESTAMPDIFF(DAY, c.DaBirth, c.TestDate) <= 76, c.ClinicID, NULL)) as m_less2m,
  COUNT(DISTINCT IF(c.Sex = 0 AND TIMESTAMPDIFF(DAY, c.DaBirth, c.TestDate) <= 76, c.ClinicID, NULL)) as f_less2m
FROM (
  SELECT DISTINCT 
    v.ClinicID, 
    ei.Sex, 
    ei.DaBirth, 
    COALESCE(et.DaBlood, v.DatVisit) as TestDate
  FROM tblevmain v
  INNER JOIN tbleimain ei ON v.ClinicID = ei.ClinicID
  LEFT JOIN (
    SELECT ClinicID, MAX(DaBlood) as DaBlood 
    FROM tbletest 
    WHERE DaBlood BETWEEN @StartDate AND @EndDate 
    GROUP BY ClinicID
  ) et ON v.ClinicID = et.ClinicID
  WHERE v.DNA <> -1 
    AND v.DatVisit BETWEEN @StartDate AND @EndDate
) c
WHERE TIMESTAMPDIFF(DAY, c.DaBirth, c.TestDate) <= 76;
