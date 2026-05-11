-- =====================================================
-- INFANT_PREVIOUS_QUARTER_aggregate - Number of HEI receiving CARE at the end of preceding quarter AGGREGATE
-- =====================================================
-- Derived from corresponding detail script
-- Logic matches Rinfants.vb Exposed() function exactly
-- =====================================================
-- PARAMETER SETUP
-- =====================================================
SET @StartDate = '2025-01-01';
SET @EndDate = '2025-03-31';

-- =====================================================
-- MAIN QUERY
-- =====================================================
-- Count patients who were on care at the end of previous quarter
-- Logic: DafirstVisit < @StartDate AND (DaStatus empty OR DaStatus >= @StartDate)
SELECT
  COUNT(DISTINCT IF(c.Sex = 1, c.ClinicID, NULL)) as M_total,
  COUNT(DISTINCT IF(c.Sex = 0, c.ClinicID, NULL)) as F_total
FROM (
  SELECT DISTINCT
    ei.ClinicID,
    ei.Sex
  FROM tbleimain ei
  LEFT OUTER JOIN tblevpatientstatus ps ON ei.ClinicID = ps.ClinicID
  WHERE ei.DafirstVisit < @StartDate
    AND (
      -- Patients with no status record (still on care)
      (ps.DaStatus IS NULL OR TRIM(COALESCE(ps.DaStatus, '')) = '')
      -- OR patients whose status date is >= start date (still on care at start of current quarter)
      OR (ps.DaStatus IS NOT NULL AND ps.DaStatus >= @StartDate)
    )
) c;


