-- =====================================================
-- INFANT DNA PCR AT BIRTH DETAILS
-- =====================================================

-- =====================================================
-- PARAMETER SETUP
-- Set these parameters before running this query

-- Date parameters
SET @StartDate = '2025-04-01';             -- Start date (YYYY-MM-DD)
SET @EndDate = '2025-06-30';               -- End date (YYYY-MM-DD)

-- MAIN QUERY
-- =====================================================
-- DNA PCR Test at Birth (DNAPcr = 0)
-- One row per test or waiting visit (like 09/11) so detail grid shows all records and click filter works
SELECT 
    c.ClinicID as clinicid,
    c.Sex as sex,
    CASE 
        WHEN c.Sex = 0 THEN 'Female'
        WHEN c.Sex = 1 THEN 'Male'
        ELSE 'Unknown'
    END as sex_display,
    c.DaBirth as DaBirth,
    c.DafirstVisit as DafirstVisit,
    c.DatVisit as DatVisit,
    COALESCE(c.DaBlood, c.DatVisit) as TestDate,
    c.DNAPcr as dna_test_type,
    CASE 
        WHEN c.DNAPcr = 0 THEN 'At Birth'
        WHEN c.DNAPcr = 1 THEN '4-6 Weeks'
        WHEN c.DNAPcr = 5 THEN '9 Months'
        WHEN c.DNAPcr = 3 THEN 'OI'
        WHEN c.DNAPcr = 4 THEN 'Confirmatory'
        ELSE CONCAT('Type: ', c.DNAPcr)
    END as dna_test_display,
    c.OI as other_dna,
    c.Result as result,
    CASE 
        WHEN c.Result IS NULL THEN 'Waiting'
        WHEN c.Result = 1 THEN 'Positive'
        WHEN c.Result = 0 THEN 'Negative'
        ELSE CONCAT('Result: ', c.Result)
    END as result_display,
    'Infant' as patient_type
FROM (
    -- Part 1: Tests from tbletest where DatTestArr is in date range
    SELECT DISTINCT 
        n.ClinicID,
        ei.Sex,
        ei.DaBirth,
        ei.DafirstVisit,
        COALESCE(v.DatVisit, n.DatTestArr) as DatVisit,
        n.DNAPcr,
        CAST(n.OI AS CHAR CHARACTER SET utf8mb4) COLLATE utf8mb4_general_ci as OI,
        n.DaBlood,
        n.Result
    FROM (
        SELECT DISTINCT 
            et.ClinicID, 
            et.DNAPcr, 
            CAST(et.OI AS CHAR CHARACTER SET utf8mb4) COLLATE utf8mb4_general_ci as OI, 
            et.Result, 
            et.DaRresult, 
            et.DatTestArr, 
            et.DaBlood,
            (SELECT COUNT(*) + 1 FROM tbletest e 
             WHERE e.ClinicID = et.ClinicID AND et.DaBlood > e.DaBlood 
             ORDER BY e.ClinicID, e.DaBlood) as Rn
        FROM (
            SELECT ClinicID, DNAPcr, CAST(OI AS CHAR CHARACTER SET utf8mb4) COLLATE utf8mb4_general_ci as OI, 
                   DaPcrArr, DaBlood, If(DaPcrArr = '1900-01-01', DaRresult, DaPcrArr) as DatTestArr,
                   Result, DaRresult
            FROM tbletest
            WHERE DNAPcr = 0
            ORDER BY ClinicID, DaBlood
        ) et
        ORDER BY et.ClinicID, et.DaBlood
    ) n
    INNER JOIN tbleimain ei ON n.ClinicID = ei.ClinicID
    LEFT JOIN tblevmain v ON n.ClinicID = v.ClinicID AND v.DNA = n.DNAPcr
    WHERE n.DatTestArr BETWEEN @StartDate AND @EndDate
    
    UNION ALL
    
    -- Part 2: Visits from tblevmain where DNA=0 and (no matching test OR matching test has null result) (waiting)
    SELECT DISTINCT
        req.ClinicID,
        ei.Sex,
        ei.DaBirth,
        ei.DafirstVisit,
        req.DatVisit,
        req.DNA as DNAPcr,
        CAST(If(req.OtherDNA = 'OI', 'True', 'False') AS CHAR CHARACTER SET utf8mb4) COLLATE utf8mb4_general_ci as OI,
        COALESCE(et.DaBlood, req.DatVisit) as DaBlood,
        et.Result
    FROM (
        SELECT ev.ClinicID, ev.DatVisit, ev.DNA,
               (SELECT COUNT(*) + 1 FROM tblevmain es 
                WHERE es.DatVisit BETWEEN @StartDate AND @EndDate 
                AND es.DNA <> -1 AND es.ClinicID = ev.ClinicID AND es.DatVisit < ev.DatVisit 
                ORDER BY es.ClinicID, es.DatVisit) as Rn,
               ev.OtherDNA
        FROM tblevmain ev
        WHERE ev.DNA <> -1 
        AND ev.DatVisit BETWEEN @StartDate AND @EndDate
        AND ev.DNA = 0
    ) req
    LEFT JOIN (
        SELECT t.*, 
               (SELECT COUNT(*) + 1 FROM tbletest es 
                WHERE If(es.DaPcrArr = '1900-01-01', es.DaRresult, es.DaPcrArr) BETWEEN @StartDate AND @EndDate 
                AND es.ClinicID = t.ClinicID AND es.DaBlood < t.DaBlood 
                ORDER BY es.ClinicID, es.DaBlood) as Rn
        FROM (
            SELECT ClinicID, DNAPcr, CAST(OI AS CHAR CHARACTER SET utf8mb4) COLLATE utf8mb4_general_ci as OI,
                   DaPcrArr, DaBlood, If(DaPcrArr = '1900-01-01', DaRresult, DaPcrArr) as DatTestArr,
                   Result, DaRresult
            FROM tbletest
            WHERE DNAPcr = 0
            ORDER BY ClinicID, DaBlood
        ) t
        WHERE t.DatTestArr BETWEEN @StartDate AND @EndDate
    ) et ON req.ClinicID = et.ClinicID AND req.DNA = et.DNAPcr AND req.Rn = et.Rn
    INNER JOIN tbleimain ei ON req.ClinicID = ei.ClinicID
    WHERE et.Result IS NULL  -- No matching test OR matching test has no result (waiting)
) c
ORDER BY TestDate DESC, clinicid;

