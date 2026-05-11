-- Detail script for Indicator 1: Number of HEI receiving CARE at the end of preceding quarter
-- This shows all exposed infants who were on care at the end of the previous quarter
-- Parameters: @StartDate (start date of current quarter - this is Sdate in VB code)
-- Logic matches Rinfants.vb Exposed() function exactly
-- 
-- Original query: SELECT tblEImain.ClinicID, tblEImain.Sex, tblevpatientstatus.DaStatus, tblEImain.DafirstVisit 
--                 FROM tblevpatientstatus RIGHT OUTER JOIN tblEImain ON tblevpatientstatus.ClinicID = tblEImain.ClinicID 
--                 WHERE tblEImain.DafirstVisit < Sdate
--                 GROUP BY tblEImain.ClinicID, tblEImain.Sex, tblevpatientstatus.DaStatus, tblEImain.DafirstVisit
--
-- Logic in VB code (lines 100-112):
--   Line 100: If DaStatus is empty AND DafirstVisit < Sdate → count (GoTo K1)
--             (Note: DafirstVisit < Sdate is already in WHERE, so this is: if DaStatus empty → count)
--   Line 101: If DaStatus is empty → skip (GoTo k2) - only executes if line 100 was false
--             (This means: if DaStatus is empty but DafirstVisit >= Sdate → skip, but WHERE already filters DafirstVisit < Sdate)
--   Line 102: If DaStatus >= Sdate → count (GoTo K1)
-- 
-- Simplified logic: Count if DaStatus is empty OR DaStatus >= Sdate
-- Note: Sdate = Start of CURRENT quarter (not end of previous quarter!)
-- Note: RIGHT OUTER JOIN = FROM tblEImain LEFT OUTER JOIN tblevpatientstatus
-- Note: GROUP BY can create duplicates, so we use DISTINCT to get unique patients

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
  ps.DaStatus,
  ps.Status,
  CASE 
    WHEN ps.Status = 0 OR ps.Status = 1 THEN 'Alive'
    WHEN ps.Status = 3 THEN 'Dead'
    WHEN ps.Status = 4 THEN 'Lost to Follow-up'
    WHEN ps.Status = 5 THEN 'Transfer Out'
    ELSE 'On Care'
  END as status_display,
  CASE WHEN TIMESTAMPDIFF(DAY, ei.DaBirth, ei.DafirstVisit) < 31 THEN CONCAT(CAST(TIMESTAMPDIFF(DAY, ei.DaBirth, ei.DafirstVisit) AS CHAR), ' days') WHEN TIMESTAMPDIFF(DAY, ei.DaBirth, ei.DafirstVisit) < 365 THEN CONCAT(CAST(FLOOR(TIMESTAMPDIFF(DAY, ei.DaBirth, ei.DafirstVisit)/30) AS CHAR), ' mo') ELSE CONCAT(CAST(FLOOR(TIMESTAMPDIFF(DAY, ei.DaBirth, ei.DafirstVisit)/365) AS CHAR), ' yr') END AS age_at_test,
  CASE WHEN TIMESTAMPDIFF(DAY, ei.DaBirth, COALESCE(ps.DaStatus, @EndDate)) < 31 THEN CONCAT(CAST(TIMESTAMPDIFF(DAY, ei.DaBirth, COALESCE(ps.DaStatus, @EndDate)) AS CHAR), ' days') WHEN TIMESTAMPDIFF(DAY, ei.DaBirth, COALESCE(ps.DaStatus, @EndDate)) < 365 THEN CONCAT(CAST(FLOOR(TIMESTAMPDIFF(DAY, ei.DaBirth, COALESCE(ps.DaStatus, @EndDate))/30) AS CHAR), ' mo') ELSE CONCAT(CAST(FLOOR(TIMESTAMPDIFF(DAY, ei.DaBirth, COALESCE(ps.DaStatus, @EndDate))/365) AS CHAR), ' yr') END AS age_at_outcome,
  CASE WHEN TIMESTAMPDIFF(DAY, ei.DaBirth, ei.DafirstVisit) <= 76 THEN '< 2 months' ELSE '> 2 months' END as age_category
FROM tbleimain ei
LEFT OUTER JOIN tblevpatientstatus ps ON ei.ClinicID = ps.ClinicID
WHERE ei.DafirstVisit < @StartDate
  AND (
    -- Patients with no status record (still on care)
    (ps.DaStatus IS NULL OR TRIM(COALESCE(ps.DaStatus, '')) = '')
    -- OR patients whose status date is >= start date (still on care at start of current quarter = end of previous quarter)
    OR (ps.DaStatus IS NOT NULL AND ps.DaStatus >= @StartDate)
  )
ORDER BY ei.Sex, ei.DafirstVisit, ei.ClinicID;
