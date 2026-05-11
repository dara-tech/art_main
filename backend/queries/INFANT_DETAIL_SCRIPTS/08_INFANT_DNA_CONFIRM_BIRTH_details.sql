-- =====================================================
-- INFANT DNA PCR CONFIRMATORY AT BIRTH DETAILS
-- =====================================================

-- =====================================================
-- PARAMETER SETUP
-- Set these parameters before running this query
-- =====================================================

-- Date parameters
SET @StartDate = '2025-04-01';             -- Start date (YYYY-MM-DD)
SET @EndDate = '2025-06-30';               -- End date (YYYY-MM-DD)

-- =====================================================
-- MAIN QUERY
-- DNA PCR Confirmatory Test for Birth (DNAPcr = 4, Con_At = 0)
-- Matches logic from Rinfants.vb line 419-424: c.DNAPcr = 4 and c.Con_At=0
-- =====================================================
SELECT DISTINCT
  c.ClinicID AS clinicid,
  c.Sex AS sex,
  CASE
    WHEN c.Sex = 0 THEN 'Female'
    WHEN c.Sex = 1 THEN 'Male'
    ELSE 'Unknown'
  END AS sex_display,
  c.DaBirth,
  c.DafirstVisit,
  COALESCE(c.DatTestArr, c.DatVisit) AS TestDate,
  4 AS dna_test_type,
  'Confirmatory at Birth' AS dna_test_display,
  c.OI AS other_dna,
  c.Con_At AS Con_At,
  c.Result AS result,
  CASE
    WHEN c.Result IS NULL THEN 'Waiting'
    WHEN c.Result = 1 THEN 'Positive'
    WHEN c.Result = 0 THEN 'Negative'
    ELSE CONCAT('Result: ', c.Result)
  END AS result_display,
  CASE WHEN TIMESTAMPDIFF(DAY, c.DaBirth, COALESCE(c.DatTestArr, c.DatVisit)) < 31 THEN CONCAT(CAST(TIMESTAMPDIFF(DAY, c.DaBirth, COALESCE(c.DatTestArr, c.DatVisit)) AS CHAR), ' days') WHEN TIMESTAMPDIFF(DAY, c.DaBirth, COALESCE(c.DatTestArr, c.DatVisit)) < 365 THEN CONCAT(CAST(FLOOR(TIMESTAMPDIFF(DAY, c.DaBirth, COALESCE(c.DatTestArr, c.DatVisit))/30) AS CHAR), ' mo') ELSE CONCAT(CAST(FLOOR(TIMESTAMPDIFF(DAY, c.DaBirth, COALESCE(c.DatTestArr, c.DatVisit))/365) AS CHAR), ' yr') END AS age_at_test,
  'Infant' AS patient_type
FROM (
    -- Part 1: Tests from tbletest where DNAPcr = 4 and Con_At = 0
    SELECT DISTINCT
        n.ClinicID,
        ei.Sex,
        ei.DaBirth,
        ei.DafirstVisit,
        n.DatTestArr,
        NULL AS DatVisit,
        CAST(n.OI AS CHAR CHARACTER SET utf8mb4) COLLATE utf8mb4_general_ci AS OI,
        IF(n.Rn = r.Rn + 1 AND n.DNAPcr = 4, r.DNAPcr, NULL) AS Con_At,
        n.Result
    FROM (
        SELECT DISTINCT
            et.ClinicID,
            et.DNAPcr,
            CAST(et.OI AS CHAR CHARACTER SET utf8mb4) COLLATE utf8mb4_general_ci AS OI,
            et.Result,
            et.DaRresult,
            et.DatTestArr,
            et.DaBlood,
            (SELECT COUNT(*) + 1 FROM tbletest e 
             WHERE e.ClinicID = et.ClinicID AND et.DaBlood > e.DaBlood 
             ORDER BY e.ClinicID, e.DaBlood) AS Rn
        FROM (
            SELECT ClinicID, DNAPcr, CAST(OI AS CHAR CHARACTER SET utf8mb4) COLLATE utf8mb4_general_ci AS OI,
                   DaPcrArr, DaBlood, IF(DaPcrArr = '1900-01-01', DaRresult, DaPcrArr) AS DatTestArr,
                   Result, DaRresult
            FROM tbletest
            ORDER BY ClinicID, DaBlood
        ) et
        ORDER BY et.ClinicID, et.DaBlood
    ) n
    LEFT JOIN (
        SELECT DISTINCT
            et.ClinicID,
            et.DNAPcr,
            CAST(et.OI AS CHAR CHARACTER SET utf8mb4) COLLATE utf8mb4_general_ci AS OI,
            et.Result,
            et.DaRresult,
            et.DatTestArr,
            et.DaBlood,
            (SELECT COUNT(*) + 1 FROM tbletest e 
             WHERE e.ClinicID = et.ClinicID AND et.DaBlood > e.DaBlood 
             ORDER BY e.ClinicID, e.DaBlood) AS Rn
        FROM (
            SELECT ClinicID, DNAPcr, CAST(OI AS CHAR CHARACTER SET utf8mb4) COLLATE utf8mb4_general_ci AS OI,
                   DaPcrArr, DaBlood, IF(DaPcrArr = '1900-01-01', DaRresult, DaPcrArr) AS DatTestArr,
                   Result, DaRresult
            FROM tbletest
            ORDER BY ClinicID, DaBlood
        ) et
        ORDER BY et.ClinicID, et.DaBlood
    ) r ON n.ClinicID = r.ClinicID AND n.Rn = r.Rn + 1
    INNER JOIN tbleimain ei ON n.ClinicID = ei.ClinicID
    WHERE n.DatTestArr BETWEEN @StartDate AND @EndDate
     AND n.DNAPcr = 4
    
    UNION
    
    -- Part 2: Visits from tblevmain where DNA = 4 and Con_At = 0 (waiting)
    SELECT DISTINCT
        req.ClinicID,
        ei.Sex,
        ei.DaBirth,
        ei.DafirstVisit,
        et.DatTestArr,
        req.DatVisit,
        CAST(req.OI AS CHAR CHARACTER SET utf8mb4) COLLATE utf8mb4_general_ci AS OI,
        IF(req.Rn = st.Rn + 1 AND req.DNA = 4, st.DNA, NULL) AS Con_At,
        et.Result
    FROM (
        SELECT ev.ClinicID, ev.DatVisit, ev.DNA,
               CAST(IF(ev.OtherDNA = 'OI', 'True', 'False') AS CHAR CHARACTER SET utf8mb4) COLLATE utf8mb4_general_ci AS OI,
               (SELECT COUNT(*) + 1 FROM tblevmain es 
                WHERE es.DatVisit BETWEEN @StartDate AND @EndDate
                AND es.DNA <> -1 AND es.ClinicID = ev.ClinicID AND es.DatVisit < ev.DatVisit 
                ORDER BY es.ClinicID, es.DatVisit) AS Rn
        FROM tblevmain ev
        WHERE ev.DNA <> -1
        AND ev.DatVisit BETWEEN @StartDate AND @EndDate
        AND ev.DNA = 4
        ORDER BY ev.ClinicID, ev.DatVisit
    ) req
    LEFT JOIN (
        SELECT t.*,
               (SELECT COUNT(*) + 1 FROM tbletest es 
                WHERE IF(es.DaPcrArr = '1900-01-01', es.DaRresult, es.DaPcrArr) BETWEEN @StartDate AND @EndDate
                AND es.ClinicID = t.ClinicID AND es.DaBlood < t.DaBlood 
                ORDER BY es.ClinicID, es.DaBlood) AS Rn
        FROM (
            SELECT ClinicID, DNAPcr, CAST(OI AS CHAR CHARACTER SET utf8mb4) COLLATE utf8mb4_general_ci AS OI,
                   DaPcrArr, DaBlood, IF(DaPcrArr = '1900-01-01', DaRresult, DaPcrArr) AS DatTestArr,
                   Result, DaRresult
            FROM tbletest
            ORDER BY ClinicID, DaBlood
        ) t
        WHERE t.DatTestArr BETWEEN @StartDate AND @EndDate
    ) et ON req.ClinicID = et.ClinicID AND req.DNA = et.DNAPcr AND req.Rn = et.Rn
    LEFT JOIN (
        SELECT ev.ClinicID, ev.DatVisit, ev.DNA,
               CAST(IF(ev.OtherDNA = 'OI', 'True', 'False') AS CHAR CHARACTER SET utf8mb4) COLLATE utf8mb4_general_ci AS OI,
               (SELECT COUNT(*) + 1 FROM tblevmain es 
                WHERE es.DatVisit BETWEEN @StartDate AND @EndDate
                AND es.DNA <> -1 AND es.ClinicID = ev.ClinicID AND es.DatVisit < ev.DatVisit 
                ORDER BY es.ClinicID, es.DatVisit) AS Rn
        FROM tblevmain ev
        WHERE ev.DNA <> -1
        AND ev.DatVisit BETWEEN @StartDate AND @EndDate
        ORDER BY ev.ClinicID, ev.DatVisit
    ) st ON req.ClinicID = st.ClinicID AND req.Rn = st.Rn + 1
    INNER JOIN tbleimain ei ON req.ClinicID = ei.ClinicID
    WHERE et.Result IS NULL
     AND req.DNA = 4
) c
WHERE c.Con_At IS NOT NULL AND c.Con_At = 0
ORDER BY TestDate DESC, clinicid;
