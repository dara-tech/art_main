-- =====================================================
-- INFANT_OUTCOME_aggregate - Infant Outcomes AGGREGATE
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
  ei.Sex,
  ps.Status,
  COUNT(DISTINCT ei.ClinicID) as count
FROM tbleimain ei
INNER JOIN tblevpatientstatus ps ON ei.ClinicID = ps.ClinicID
WHERE ps.DaStatus BETWEEN @StartDate AND @EndDate
GROUP BY ei.Sex, ps.Status
ORDER BY ei.Sex, ps.Status;
