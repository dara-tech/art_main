-- =====================================================
-- INFANT_ANTIBODY_aggregate - Antibody Test Results AGGREGATE
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
-- Antibody: 0 = Positive, 1 = Negative
SELECT
  COUNT(IF(ei.Sex = 1 AND ev.Antibody = 0, 1, NULL)) as m_positive,
  COUNT(IF(ei.Sex = 0 AND ev.Antibody = 0, 1, NULL)) as f_positive,
  COUNT(IF(ei.Sex = 1 AND ev.Antibody = 1, 1, NULL)) as m_negative,
  COUNT(IF(ei.Sex = 0 AND ev.Antibody = 1, 1, NULL)) as f_negative
FROM tblevmain ev
INNER JOIN tbleimain ei ON ev.ClinicID = ei.ClinicID
WHERE ev.DatVisit BETWEEN @StartDate AND @EndDate
  AND ev.Antibody IS NOT NULL;
