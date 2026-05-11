-- =====================================================
-- INFANT_DNA_CONFIRM_OTHER_aggregate - DNA PCR Confirmatory Test Other Category AGGREGATE
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
  COUNT(IF(c.Sex = 1 AND c.DNA = 4 AND c.Con_At = 3 AND (c.Con_OtherDNA IS NULL OR c.Con_OtherDNA != 'OI') AND c.Result = 1, 1, NULL)) as m_po_other_confirm,
  COUNT(IF(c.Sex = 0 AND c.DNA = 4 AND c.Con_At = 3 AND (c.Con_OtherDNA IS NULL OR c.Con_OtherDNA != 'OI') AND c.Result = 1, 1, NULL)) as f_po_other_confirm,
  COUNT(IF(c.Sex = 1 AND c.DNA = 4 AND c.Con_At = 3 AND (c.Con_OtherDNA IS NULL OR c.Con_OtherDNA != 'OI') AND c.Result = 0, 1, NULL)) as m_ne_other_confirm,
  COUNT(IF(c.Sex = 0 AND c.DNA = 4 AND c.Con_At = 3 AND (c.Con_OtherDNA IS NULL OR c.Con_OtherDNA != 'OI') AND c.Result = 0, 1, NULL)) as f_ne_other_confirm,
  COUNT(IF(c.Sex = 1 AND c.DNA = 4 AND c.Con_At = 3 AND (c.Con_OtherDNA IS NULL OR c.Con_OtherDNA != 'OI') AND c.Result IS NULL, 1, NULL)) as m_w_other_confirm,
  COUNT(IF(c.Sex = 0 AND c.DNA = 4 AND c.Con_At = 3 AND (c.Con_OtherDNA IS NULL OR c.Con_OtherDNA != 'OI') AND c.Result IS NULL, 1, NULL)) as f_w_other_confirm
FROM (
  SELECT req.ClinicID, ei.Sex, req.DNA, if(req.Rn = st.Rn + 1 AND req.DNA = 4, st.DNA, NULL) Con_At,
    CAST(If(req.Rn = st.Rn + 1 AND req.DNA = 4, st.OtherDNA, NULL) AS CHAR CHARACTER SET utf8mb4) COLLATE utf8mb4_general_ci as Con_OtherDNA,
    et.Result
  FROM (
    SELECT ev.ClinicID, ev.DatVisit, ev.DNA,
      (SELECT COUNT(*) + 1 FROM tblevmain es
       WHERE (es.DatVisit BETWEEN @StartDate AND @EndDate)
         AND es.DNA <> -1
         AND es.ClinicID = ev.ClinicID
         AND es.DatVisit < ev.DatVisit
       ORDER BY es.ClinicID, es.DatVisit) as Rn
    FROM tblevmain ev
    WHERE ev.DNA <> -1
      AND (ev.DatVisit BETWEEN @StartDate AND @EndDate)
    ORDER BY ev.ClinicID, ev.DatVisit
  ) req
  LEFT JOIN (
    SELECT t.*,
      (SELECT COUNT(*) + 1 FROM tbletest es
       WHERE (if(es.DaPcrArr = '1900-01-01', es.DaRresult, es.DaPcrArr) BETWEEN @StartDate AND @EndDate)
         AND es.ClinicID = t.ClinicID
         AND es.DaBlood < t.DaBlood
       ORDER BY es.ClinicID, es.DaBlood) as Rn
    FROM (
      SELECT ClinicID, DNAPcr, OI, DaPcrArr, DaBlood, If(DaPcrArr = '1900-01-01', DaRresult, DaPcrArr) as DatTestArr, Result, DaRresult
      FROM tbletest
      ORDER BY ClinicID, DaBlood
    ) t
    WHERE (t.DatTestArr BETWEEN @StartDate AND @EndDate)
  ) et ON req.ClinicID = et.ClinicID AND req.DNA = et.DNAPcr AND req.Rn = et.Rn
  LEFT JOIN (
    SELECT ev.ClinicID, ev.DatVisit, ev.DNA, CAST(ev.OtherDNA AS CHAR CHARACTER SET utf8mb4) COLLATE utf8mb4_general_ci as OtherDNA,
      (SELECT COUNT(*) + 1 FROM tblevmain es
       WHERE (es.DatVisit BETWEEN @StartDate AND @EndDate)
         AND es.DNA <> -1
         AND es.ClinicID = ev.ClinicID
         AND es.DatVisit < ev.DatVisit
       ORDER BY es.ClinicID, es.DatVisit) as Rn
    FROM tblevmain ev
    WHERE ev.DNA <> -1
      AND (ev.DatVisit BETWEEN @StartDate AND @EndDate)
    ORDER BY ev.ClinicID, ev.DatVisit
  ) st ON req.ClinicID = st.ClinicID AND req.Rn = st.Rn + 1
  INNER JOIN tbleimain ei ON req.ClinicID = ei.ClinicID
  WHERE req.DNA = 4
    AND if(req.Rn = st.Rn + 1 AND req.DNA = 4, st.DNA, NULL) = 3
    AND (CAST(If(req.Rn = st.Rn + 1 AND req.DNA = 4, st.OtherDNA, NULL) AS CHAR CHARACTER SET utf8mb4) COLLATE utf8mb4_general_ci IS NULL
      OR CAST(If(req.Rn = st.Rn + 1 AND req.DNA = 4, st.OtherDNA, NULL) AS CHAR CHARACTER SET utf8mb4) COLLATE utf8mb4_general_ci != 'OI')
  ORDER BY req.ClinicID, req.DatVisit
) c;
