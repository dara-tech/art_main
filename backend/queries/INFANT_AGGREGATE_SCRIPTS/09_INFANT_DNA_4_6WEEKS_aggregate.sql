-- =====================================================
-- INFANT_DNA_4_6WEEKS_aggregate - DNA PCR Test at 4-6 Weeks AGGREGATE
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
  COUNT(IF(c.Sex = 1 AND c.DNAPcr = 1 AND c.Result = 1, 1, NULL)) as m_po_46,
  COUNT(IF(c.Sex = 0 AND c.DNAPcr = 1 AND c.Result = 1, 1, NULL)) as f_po_46,
  COUNT(IF(c.Sex = 1 AND c.DNAPcr = 1 AND c.Result = 0, 1, NULL)) as m_ne_46,
  COUNT(IF(c.Sex = 0 AND c.DNAPcr = 1 AND c.Result = 0, 1, NULL)) as f_ne_46,
  COUNT(IF(c.Sex = 1 AND c.DNAPcr = 1 AND c.Result IS NULL, 1, NULL)) as m_w_46,
  COUNT(IF(c.Sex = 0 AND c.DNAPcr = 1 AND c.Result IS NULL, 1, NULL)) as f_w_46
FROM (
  SELECT DISTINCT re.ClinicID, re.Sex, re.DNAPcr, re.Result
  FROM (
    SELECT n.ClinicID, ei.Sex, n.DNAPcr, n.Result
    FROM (
      SELECT DISTINCT et.ClinicID, et.DNAPcr, et.Result, et.DatTestArr
      FROM (
        SELECT ClinicID, DNAPcr, If(DaPcrArr = '1900-01-01', DaRresult, DaPcrArr) as DatTestArr, Result
        FROM tbletest
        WHERE DNAPcr = 1
        ORDER BY ClinicID, DaBlood
      ) et
      WHERE et.DatTestArr BETWEEN @StartDate AND @EndDate
    ) n
    INNER JOIN tbleimain ei ON n.ClinicID = ei.ClinicID
  ) re
  UNION
  (
    SELECT req.ClinicID, ei.Sex, req.DNA, et.Result
    FROM (
      SELECT ev.ClinicID, ev.DatVisit, ev.DNA
      FROM tblevmain ev
      WHERE ev.DNA = 1
        AND (ev.DatVisit BETWEEN @StartDate AND @EndDate)
    ) req
    LEFT JOIN (
      SELECT t.ClinicID, t.DNAPcr, t.Result
      FROM (
        SELECT ClinicID, DNAPcr, If(DaPcrArr = '1900-01-01', DaRresult, DaPcrArr) as DatTestArr, Result
        FROM tbletest
        WHERE DNAPcr = 1
        ORDER BY ClinicID, DaBlood
      ) t
      WHERE t.DatTestArr BETWEEN @StartDate AND @EndDate
    ) et ON req.ClinicID = et.ClinicID AND req.DNA = et.DNAPcr
    INNER JOIN tbleimain ei ON req.ClinicID = ei.ClinicID
    WHERE et.Result IS NULL
  )
) c;
