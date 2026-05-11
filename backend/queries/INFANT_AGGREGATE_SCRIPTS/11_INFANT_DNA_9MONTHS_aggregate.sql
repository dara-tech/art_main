-- =====================================================
-- INFANT_DNA_9MONTHS_aggregate - DNA PCR Test at 9 Months AGGREGATE
-- =====================================================
-- Derived from corresponding detail script
-- =====================================================
-- PARAMETER SETUP
-- =====================================================
SET @StartDate = '2025-01-01';
SET @EndDate = '2025-03-31';

-- =====================================================
-- MAIN QUERY
-- Same union as 11_INFANT_DNA_9MONTHS_details: Part 1 = tests in period, Part 2 = visits with Rn-matched test (no result).
-- Part 2 uses req.Rn = et.Rn so nth visit pairs with nth test; ensures aggregate counts match detail (e.g. 6 pending = 3 M, 3 F).
-- =====================================================
SELECT
  COUNT(IF(c.Sex = 1 AND c.DNAPcr = 5 AND c.Result = 1, 1, NULL)) as m_po_9,
  COUNT(IF(c.Sex = 0 AND c.DNAPcr = 5 AND c.Result = 1, 1, NULL)) as f_po_9,
  COUNT(IF(c.Sex = 1 AND c.DNAPcr = 5 AND c.Result = 0, 1, NULL)) as m_ne_9,
  COUNT(IF(c.Sex = 0 AND c.DNAPcr = 5 AND c.Result = 0, 1, NULL)) as f_ne_9,
  COUNT(IF(c.Sex = 1 AND c.DNAPcr = 5 AND c.Result IS NULL, 1, NULL)) as m_w_9,
  COUNT(IF(c.Sex = 0 AND c.DNAPcr = 5 AND c.Result IS NULL, 1, NULL)) as f_w_9
FROM (
  SELECT DISTINCT re.ClinicID, re.Sex, re.DNAPcr, re.Result
  FROM (
    SELECT n.ClinicID, ei.Sex, n.DNAPcr, n.Result
    FROM (
      SELECT DISTINCT et.ClinicID, et.DNAPcr, et.Result, et.DatTestArr
      FROM (
        SELECT ClinicID, DNAPcr, If(DaPcrArr = '1900-01-01', DaRresult, DaPcrArr) as DatTestArr, Result
        FROM tbletest
        WHERE DNAPcr = 5
        ORDER BY ClinicID, DaBlood
      ) et
      WHERE et.DatTestArr BETWEEN @StartDate AND @EndDate
    ) n
    INNER JOIN tbleimain ei ON n.ClinicID = ei.ClinicID
  ) re
  UNION
  -- Part 2: same as detail – nth visit (DNA=5) matched to nth test by Rn, keep only when et.Result IS NULL
  (
    SELECT req.ClinicID, ei.Sex, req.DNA, et.Result
    FROM (
      SELECT ev.ClinicID, ev.DatVisit, ev.DNA,
             (SELECT COUNT(*) + 1 FROM tblevmain es
              WHERE es.DatVisit BETWEEN @StartDate AND @EndDate
                AND es.DNA <> -1 AND es.ClinicID = ev.ClinicID AND es.DatVisit < ev.DatVisit
              ORDER BY es.ClinicID, es.DatVisit) AS Rn
      FROM tblevmain ev
      WHERE ev.DNA <> -1
        AND ev.DatVisit BETWEEN @StartDate AND @EndDate
        AND ev.DNA = 5
    ) req
    LEFT JOIN (
      SELECT t.ClinicID, t.DNAPcr, t.Result,
             (SELECT COUNT(*) + 1 FROM tbletest es
              WHERE If(es.DaPcrArr = '1900-01-01', es.DaRresult, es.DaPcrArr) BETWEEN @StartDate AND @EndDate
                AND es.ClinicID = t.ClinicID AND es.DaBlood < t.DaBlood
              ORDER BY es.ClinicID, es.DaBlood) AS Rn
      FROM (
        SELECT ClinicID, DNAPcr, If(DaPcrArr = '1900-01-01', DaRresult, DaPcrArr) as DatTestArr, Result, DaBlood
        FROM tbletest
        ORDER BY ClinicID, DaBlood
      ) t
      WHERE t.DatTestArr BETWEEN @StartDate AND @EndDate
    ) et ON req.ClinicID = et.ClinicID AND req.DNA = et.DNAPcr AND req.Rn = et.Rn
    INNER JOIN tbleimain ei ON req.ClinicID = ei.ClinicID
    WHERE et.Result IS NULL
  )
) c;
