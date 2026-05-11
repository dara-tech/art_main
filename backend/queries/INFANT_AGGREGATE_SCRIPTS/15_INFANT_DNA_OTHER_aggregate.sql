-- =====================================================
-- INFANT_DNA_OTHER_aggregate - DNA PCR Test Other Category AGGREGATE
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
  COUNT(DISTINCT IF(c.Sex = 1 AND c.DNA = 3 AND c.OtherDNA IS NOT NULL AND CAST(c.OtherDNA AS CHAR CHARACTER SET utf8mb4) COLLATE utf8mb4_general_ci != '' AND TRIM(CAST(c.OtherDNA AS CHAR CHARACTER SET utf8mb4) COLLATE utf8mb4_general_ci) != '' AND UPPER(TRIM(CAST(c.OtherDNA AS CHAR CHARACTER SET utf8mb4) COLLATE utf8mb4_general_ci)) != 'OI', c.ClinicID, NULL)) as m_Other,
  COUNT(DISTINCT IF(c.Sex = 0 AND c.DNA = 3 AND c.OtherDNA IS NOT NULL AND CAST(c.OtherDNA AS CHAR CHARACTER SET utf8mb4) COLLATE utf8mb4_general_ci != '' AND TRIM(CAST(c.OtherDNA AS CHAR CHARACTER SET utf8mb4) COLLATE utf8mb4_general_ci) != '' AND UPPER(TRIM(CAST(c.OtherDNA AS CHAR CHARACTER SET utf8mb4) COLLATE utf8mb4_general_ci)) != 'OI', c.ClinicID, NULL)) as f_Other
FROM (
  SELECT DISTINCT
    v.ClinicID,
    ei.Sex,
    v.DNA,
    CAST(v.OtherDNA AS CHAR CHARACTER SET utf8mb4) COLLATE utf8mb4_general_ci as OtherDNA
  FROM tblevmain v
  INNER JOIN tbleimain ei ON v.ClinicID = ei.ClinicID
  WHERE v.DNA = 3
    AND v.OtherDNA IS NOT NULL
    AND CAST(v.OtherDNA AS CHAR CHARACTER SET utf8mb4) COLLATE utf8mb4_general_ci != ''
    AND TRIM(CAST(v.OtherDNA AS CHAR CHARACTER SET utf8mb4) COLLATE utf8mb4_general_ci) != ''
    AND UPPER(TRIM(CAST(v.OtherDNA AS CHAR CHARACTER SET utf8mb4) COLLATE utf8mb4_general_ci)) != 'OI'
    AND v.DatVisit BETWEEN @StartDate AND @EndDate
) c;
