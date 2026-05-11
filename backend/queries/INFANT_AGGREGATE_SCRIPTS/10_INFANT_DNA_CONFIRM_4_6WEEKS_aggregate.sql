-- =====================================================
-- INFANT_DNA_CONFIRM_4_6WEEKS_aggregate - DNA PCR Confirmatory Test at 4-6 Weeks AGGREGATE
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
  COUNT(IF(c.Sex = 1 AND c.DNAPcr = 4 AND c.Con_At = 1 AND c.Result = 1, 1, NULL)) as m_po_c46,
  COUNT(IF(c.Sex = 0 AND c.DNAPcr = 4 AND c.Con_At = 1 AND c.Result = 1, 1, NULL)) as f_po_c46,
  COUNT(IF(c.Sex = 1 AND c.DNAPcr = 4 AND c.Con_At = 1 AND c.Result = 0, 1, NULL)) as m_ne_c46,
  COUNT(IF(c.Sex = 0 AND c.DNAPcr = 4 AND c.Con_At = 1 AND c.Result = 0, 1, NULL)) as f_ne_c46,
  COUNT(IF(c.Sex = 1 AND c.DNAPcr = 4 AND c.Con_At = 1 AND c.Result IS NULL, 1, NULL)) as m_w_c46,
  COUNT(IF(c.Sex = 0 AND c.DNAPcr = 4 AND c.Con_At = 1 AND c.Result IS NULL, 1, NULL)) as f_w_c46
FROM (
  SELECT DISTINCT
    re.ClinicID,
    re.Sex,
    re.DNAPcr,
    re.Con_At,
    re.Result
  FROM (
    SELECT n.ClinicID, ei.Sex, n.DNAPcr, If(n.Rn = r.Rn + 1 AND n.DNAPcr = 4, r.DNAPcr, NULL) As Con_At, n.Result
    FROM (
      SELECT DISTINCT et.ClinicID, et.DNAPcr, et.Result, et.DatTestArr,
        (SELECT COUNT(*) + 1 FROM tbletest e WHERE e.ClinicID = et.ClinicID AND et.DaBlood > e.DaBlood ORDER BY e.ClinicID, e.DaBlood) as Rn
      FROM (
        SELECT ClinicID, DNAPcr, DaBlood, If(DaPcrArr = '1900-01-01', DaRresult, DaPcrArr) as DatTestArr, Result
        FROM tbletest
        WHERE DNAPcr IN (1, 4)
        ORDER BY ClinicID, DaBlood
      ) et
      WHERE et.DatTestArr BETWEEN @StartDate AND @EndDate
    ) n
    LEFT JOIN (
      SELECT DISTINCT et.ClinicID, et.DNAPcr, et.Result,
        (SELECT COUNT(*) + 1 FROM tbletest e WHERE e.ClinicID = et.ClinicID AND et.DaBlood > e.DaBlood ORDER BY e.ClinicID, e.DaBlood) as Rn
      FROM (
        SELECT ClinicID, DNAPcr, DaBlood, If(DaPcrArr = '1900-01-01', DaRresult, DaPcrArr) as DatTestArr, Result
        FROM tbletest
        WHERE DNAPcr IN (1, 4)
        ORDER BY ClinicID, DaBlood
      ) et
      WHERE et.DatTestArr BETWEEN @StartDate AND @EndDate
    ) r ON n.ClinicID = r.ClinicID AND n.Rn = r.Rn + 1
    INNER JOIN tbleimain ei ON n.ClinicID = ei.ClinicID
    WHERE n.DNAPcr = 4 AND If(n.Rn = r.Rn + 1 AND n.DNAPcr = 4, r.DNAPcr, NULL) = 1
  ) re
) c;
