-- =====================================================
-- INFANT_TOTAL_ON_CARE_aggregate - Total Number of Exposed Infants on Follow up and Care at end of this quarter AGGREGATE
-- =====================================================
-- Derived from corresponding detail script
-- Formula: Previous quarter on care + New enrollments + Transfers in
-- =====================================================
-- PARAMETER SETUP
-- =====================================================
SET @StartDate = '2025-01-01';
SET @EndDate = '2025-03-31';

-- =====================================================
-- MAIN QUERY
-- =====================================================
-- Count all patients on care at end of this quarter:
-- = Previous quarter patients (on care at start) + New enrollments + Transfers in
SELECT
  COUNT(DISTINCT IF(c.Sex = 1, c.ClinicID, NULL)) as M_total,
  COUNT(DISTINCT IF(c.Sex = 0, c.ClinicID, NULL)) as F_total
FROM (
  SELECT DISTINCT
    ei.ClinicID,
    ei.Sex
  FROM tbleimain ei
  LEFT OUTER JOIN tblevpatientstatus ps ON ei.ClinicID = ps.ClinicID
  WHERE (
    -- Previous quarter patients (on care at start of current quarter)
    -- Logic matches Exposed() function: DafirstVisit < Sdate AND (DaStatus empty OR DaStatus >= Sdate)
    (
      ei.DafirstVisit < @StartDate
      AND (
        -- No status record (still on care)
        (ps.DaStatus IS NULL OR TRIM(COALESCE(ps.DaStatus, '')) = '')
        -- OR status date >= start date (still on care at start of current quarter)
        OR (ps.DaStatus IS NOT NULL AND ps.DaStatus >= @StartDate)
      )
    )
    -- OR New enrollments this quarter (not transfer in)
    -- Logic matches: DafirstVisit BETWEEN Sdate AND Edate AND Offin <> 1
    OR (
      ei.DafirstVisit BETWEEN @StartDate AND @EndDate
      AND ei.Offin <> 1
    )
    -- OR Transfer in this quarter
    -- Logic matches: DafirstVisit BETWEEN Sdate AND Edate AND Offin = 1
    OR (
      ei.DafirstVisit BETWEEN @StartDate AND @EndDate
      AND ei.Offin = 1
    )
  )
) c;


