-- Detail script for Indicator 19: Total Number of Exposed Infants on Follow up and Care at end of this quarter
-- Formula: Previous quarter on care + New enrollments + Transfers in
-- Parameters: @StartDate, @EndDate
-- 
-- Formula breakdown (from Rinfants.Designer.vb):
-- Male: xMP (previous quarter) + XrTableCell710 (new + transfer) - XrTableCell686 (left care)
-- Female: XrTableCell503 (previous quarter) + XrTableCell711 (new + transfer) - XrTableCell687 (left care)
-- Where:
--   xMP/XrTableCell503 = Previous quarter on care (from Exposed() function)
--     - DafirstVisit < Sdate (enrolled before current quarter)
--     - AND (DaStatus empty OR DaStatus >= Sdate) (still on care at start of current quarter)
--   XrTableCell710 = New enrollments (M_less2 + M_great2) + Transfer in (M_less2 + M_great2)
--     - DafirstVisit BETWEEN Sdate AND Edate
--     - New: Offin <> 1
--     - Transfer: Offin = 1
--   XrTableCell711 = New enrollments (F_less2 + F_great2) + Transfer in (F_less2 + F_great2)
--   XrTableCell686/XrTableCell687 = Empty (0) in Designer, so no subtraction
--
-- This query shows all patients who are on care at the end of this quarter:
-- = Previous quarter patients (on care at start) + New enrollments + Transfers in

SELECT DISTINCT
  ei.ClinicID,
  ei.Sex,
  CASE 
    WHEN ei.Sex = 0 THEN 'Female'
    WHEN ei.Sex = 1 THEN 'Male'
    ELSE 'Unknown'
  END as sex_display,
  ei.DaBirth,
  ei.DafirstVisit,
  ei.Offin,
  CASE 
    WHEN ei.DafirstVisit < @StartDate THEN 'Previous Quarter'
    WHEN ei.Offin = 1 THEN 'Transfer In'
    ELSE 'New Enrollment'
  END as enrollment_type,
  CASE WHEN TIMESTAMPDIFF(DAY, ei.DaBirth, ei.DafirstVisit) < 31 THEN CONCAT(CAST(TIMESTAMPDIFF(DAY, ei.DaBirth, ei.DafirstVisit) AS CHAR), ' days') WHEN TIMESTAMPDIFF(DAY, ei.DaBirth, ei.DafirstVisit) < 365 THEN CONCAT(CAST(FLOOR(TIMESTAMPDIFF(DAY, ei.DaBirth, ei.DafirstVisit)/30) AS CHAR), ' mo') ELSE CONCAT(CAST(FLOOR(TIMESTAMPDIFF(DAY, ei.DaBirth, ei.DafirstVisit)/365) AS CHAR), ' yr') END AS age_at_test,
  CASE WHEN TIMESTAMPDIFF(DAY, ei.DaBirth, COALESCE(ps.DaStatus, @EndDate)) < 31 THEN CONCAT(CAST(TIMESTAMPDIFF(DAY, ei.DaBirth, COALESCE(ps.DaStatus, @EndDate)) AS CHAR), ' days') WHEN TIMESTAMPDIFF(DAY, ei.DaBirth, COALESCE(ps.DaStatus, @EndDate)) < 365 THEN CONCAT(CAST(FLOOR(TIMESTAMPDIFF(DAY, ei.DaBirth, COALESCE(ps.DaStatus, @EndDate))/30) AS CHAR), ' mo') ELSE CONCAT(CAST(FLOOR(TIMESTAMPDIFF(DAY, ei.DaBirth, COALESCE(ps.DaStatus, @EndDate))/365) AS CHAR), ' yr') END AS age_at_outcome,
  CASE WHEN TIMESTAMPDIFF(DAY, ei.DaBirth, ei.DafirstVisit) <= 76 THEN '< 2 months' ELSE '> 2 months' END as age_category,
  ps.DaStatus as outcome_date,
  ps.Status as outcome_status,
  CASE 
    WHEN ps.Status = 0 OR ps.Status = 1 THEN 'Alive'
    WHEN ps.Status = 3 THEN 'Dead'
    WHEN ps.Status = 4 THEN 'Lost to Follow-up'
    WHEN ps.Status = 5 THEN 'Transfer Out'
    ELSE 'On Care'
  END as current_status
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
ORDER BY ei.Sex, ei.DafirstVisit, ei.ClinicID;
