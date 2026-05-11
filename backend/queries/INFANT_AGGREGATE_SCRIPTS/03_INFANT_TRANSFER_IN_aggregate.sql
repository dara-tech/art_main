-- =====================================================
-- INFANT_TRANSFER_IN_aggregate - Infant Transfer In AGGREGATE
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
  COUNT(IF(c.Sex = 1 AND TIMESTAMPDIFF(DAY, c.DaBirth, c.DafirstVisit) <= 76, 1, NULL)) as M_less2,
  COUNT(IF(c.Sex = 0 AND TIMESTAMPDIFF(DAY, c.DaBirth, c.DafirstVisit) <= 76, 1, NULL)) as F_less2,
  COUNT(IF(c.Sex = 1 AND TIMESTAMPDIFF(DAY, c.DaBirth, c.DafirstVisit) > 76, 1, NULL)) as M_great2,
  COUNT(IF(c.Sex = 0 AND TIMESTAMPDIFF(DAY, c.DaBirth, c.DafirstVisit) > 76, 1, NULL)) as F_great2
FROM (
  SELECT ClinicID, Sex, DafirstVisit, DaBirth, Offin 
  FROM tbleimain 
  WHERE DafirstVisit BETWEEN @StartDate AND @EndDate 
    AND Offin = 1
) c;
