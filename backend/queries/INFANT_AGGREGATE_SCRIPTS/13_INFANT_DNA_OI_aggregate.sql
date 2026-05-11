-- =====================================================
-- INFANT_DNA_OI_aggregate - DNA PCR Test at OI (Opportunistic Infection) AGGREGATE
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
  COUNT(DISTINCT IF(c.Sex = 1 AND c.DNA = 3 AND CAST(c.OtherDNA AS CHAR CHARACTER SET utf8mb4) COLLATE utf8mb4_general_ci = 'OI', c.ClinicID, NULL)) as m_OI,
  COUNT(DISTINCT IF(c.Sex = 0 AND c.DNA = 3 AND CAST(c.OtherDNA AS CHAR CHARACTER SET utf8mb4) COLLATE utf8mb4_general_ci = 'OI', c.ClinicID, NULL)) as f_OI
FROM (
  SELECT DISTINCT
    v.ClinicID,
    ei.Sex,
    v.DNA,
    CAST(v.OtherDNA AS CHAR CHARACTER SET utf8mb4) COLLATE utf8mb4_general_ci as OtherDNA
  FROM tblevmain v
  INNER JOIN tbleimain ei ON v.ClinicID = ei.ClinicID
  WHERE v.DNA = 3
    AND CAST(v.OtherDNA AS CHAR CHARACTER SET utf8mb4) COLLATE utf8mb4_general_ci = 'OI'
    AND v.DatVisit BETWEEN @StartDate AND @EndDate
) c;
