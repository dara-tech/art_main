-- =====================================================
-- INFANT_NEW_GREAT2_aggregate - New Infant Enrollment Greater than 2 months AGGREGATE
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
  COUNT(IF(c.Sex = 1 AND TIMESTAMPDIFF(DAY, c.DaBirth, c.DafirstVisit) > 76, 1, NULL)) as M_great2,
  COUNT(IF(c.Sex = 0 AND TIMESTAMPDIFF(DAY, c.DaBirth, c.DafirstVisit) > 76, 1, NULL)) as F_great2
FROM (
  SELECT ClinicID, Sex, DafirstVisit, DaBirth, Offin 
  FROM tbleimain 
  WHERE DafirstVisit BETWEEN @StartDate AND @EndDate 
    AND Offin <> 1
) c
WHERE TIMESTAMPDIFF(DAY, c.DaBirth, c.DafirstVisit) > 76;
