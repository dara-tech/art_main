-- =====================================================
-- INFANT_DNA_CONFIRM_aggregate - DNA PCR Confirmatory Test (All) AGGREGATE
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
  COUNT(IF(c.Sex = 1 AND c.DNAPcr = 4 AND c.Result = 1, 1, NULL)) as m_po_confirm,
  COUNT(IF(c.Sex = 0 AND c.DNAPcr = 4 AND c.Result = 1, 1, NULL)) as f_po_confirm,
  COUNT(IF(c.Sex = 1 AND c.DNAPcr = 4 AND c.Result = 0, 1, NULL)) as m_ne_confirm,
  COUNT(IF(c.Sex = 0 AND c.DNAPcr = 4 AND c.Result = 0, 1, NULL)) as f_ne_confirm,
  COUNT(IF(c.Sex = 1 AND c.DNAPcr = 4 AND c.Result IS NULL, 1, NULL)) as m_w_confirm,
  COUNT(IF(c.Sex = 0 AND c.DNAPcr = 4 AND c.Result IS NULL, 1, NULL)) as f_w_confirm
FROM (
  SELECT DISTINCT
    re.ClinicID,
    re.Sex,
    re.DNAPcr,
    re.Result
  FROM (
    SELECT n.ClinicID, ei.Sex, n.DNAPcr, n.Result
    FROM (
      SELECT DISTINCT et.ClinicID, et.DNAPcr, et.Result, et.DatTestArr
      FROM (
        SELECT ClinicID, DNAPcr, If(DaPcrArr = '1900-01-01', DaRresult, DaPcrArr) as DatTestArr, Result
        FROM tbletest
        WHERE DNAPcr = 4
        ORDER BY ClinicID, DaBlood
      ) et
      WHERE et.DatTestArr BETWEEN @StartDate AND @EndDate
    ) n
    INNER JOIN tbleimain ei ON n.ClinicID = ei.ClinicID
  ) re
) c;
