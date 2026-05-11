-- =====================================================
-- INFANT DNA PCR AT 4-6 WEEKS (Simplified)
-- =====================================================
SET @StartDate = '2025-04-01';
SET @EndDate = '2025-06-30';

-- Outer query: filter only 4-6 weeks
-- Matches logic from Rinfants.vb line 425-430: COUNT(IF(c.DNAPcr = 1 and c.Result = X, 1, null))
-- The aggregate query uses UNION: tests from tbletest + visits from tblevmain with null results
-- Waiting results: COUNT(IF(c.DNAPcr = 1 and c.Result is null, 1, null)) - matches line 429-430
-- Detail form will add WHERE result IS NULL when demographic group is "Male_Waiting" or "Female_Waiting"
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
    c.DatVisit,
    COALESCE(c.DaBlood, c.DatVisit) AS TestDate,
    c.DNAPcr AS dna_test_type,
    CASE 
        WHEN c.DNAPcr = 0 THEN 'At Birth'
        WHEN c.DNAPcr = 1 THEN '4-6 Weeks'
        WHEN c.DNAPcr = 5 THEN '9 Months'
        WHEN c.DNAPcr = 3 THEN 'OI'
        WHEN c.DNAPcr = 4 THEN 'Confirmatory'
        ELSE CONCAT('Type: ', c.DNAPcr)
    END AS dna_test_display,
    c.OI AS other_dna,
    c.Result AS result,
    CASE 
        WHEN c.Result IS NULL THEN 'Waiting'
        WHEN c.Result = 1 THEN 'Positive'
        WHEN c.Result = 0 THEN 'Negative'
        ELSE CONCAT('Result: ', c.Result)
    END AS result_display,
    CASE WHEN TIMESTAMPDIFF(DAY, c.DaBirth, COALESCE(c.DaBlood, c.DatVisit)) < 31 THEN CONCAT(CAST(TIMESTAMPDIFF(DAY, c.DaBirth, COALESCE(c.DaBlood, c.DatVisit)) AS CHAR), ' days') WHEN TIMESTAMPDIFF(DAY, c.DaBirth, COALESCE(c.DaBlood, c.DatVisit)) < 365 THEN CONCAT(CAST(FLOOR(TIMESTAMPDIFF(DAY, c.DaBirth, COALESCE(c.DaBlood, c.DatVisit))/30) AS CHAR), ' mo') ELSE CONCAT(CAST(FLOOR(TIMESTAMPDIFF(DAY, c.DaBirth, COALESCE(c.DaBlood, c.DatVisit))/365) AS CHAR), ' yr') END AS age_at_test,
    'Infant' AS patient_type
FROM (
    -- Part 1: Tests from tbletest where DatTestArr is in date range (includes all tests, even with NULL results)
    -- Match aggregate query Part 1: selects n.ClinicID, ei.Sex, n.DNAPcr, n.OI, n.Result, n.DaRresult, n.DatTestArr, n.DaBlood
    SELECT DISTINCT 
        n.ClinicID,
        ei.Sex,
        ei.DaBirth,
        ei.DafirstVisit,
        n.DatTestArr as DatVisit,  -- Match aggregate: uses n.DatTestArr directly
        n.DNAPcr,
        CAST(n.OI AS CHAR CHARACTER SET utf8mb4) COLLATE utf8mb4_general_ci as OI,
        n.DaBlood,
        n.Result,
        n.DaRresult,  -- Match aggregate query structure
        n.DatTestArr  -- Match aggregate query structure (for UNION duplicate removal)
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
            WHERE DNAPcr = 1
            ORDER BY ClinicID, DaBlood
        ) et
        ORDER BY et.ClinicID, et.DaBlood
    ) n
    INNER JOIN tbleimain ei ON n.ClinicID = ei.ClinicID
    WHERE n.DatTestArr BETWEEN @StartDate AND @EndDate
    AND n.DNAPcr = 1  -- Filter to 4-6 weeks tests only
    
    UNION
    
    -- Part 2: Visits from tblevmain where DNA=1 and (no matching test OR matching test has null result) (waiting)
    -- Match aggregate query: Part 2 gets ALL visits where DNA <> -1, then filters WHERE et.Result Is null
    -- This matches the aggregate query Part 2 exactly: selects columns from et (test), so when no match, et columns are NULL
    -- Aggregate query Part 2 selects: req.ClinicID, ei.Sex, req.DNA, req.OI, et.Result, et.DaRresult, et.DatTestArr, et.DaBlood
    SELECT DISTINCT
        req.ClinicID,
        ei.Sex,
        ei.DaBirth,
        ei.DafirstVisit,
        COALESCE(et.DatTestArr, req.DatVisit) as DatVisit,  -- Use et.DatTestArr when available, else req.DatVisit
        req.DNA as DNAPcr,
        CAST(If(req.OtherDNA = 'OI', 'True', 'False') AS CHAR CHARACTER SET utf8mb4) COLLATE utf8mb4_general_ci as OI,
        COALESCE(et.DaBlood, req.DatVisit) as DaBlood,  -- Use et.DaBlood when available, else req.DatVisit
        et.Result,
        et.DaRresult,  -- Match aggregate query structure
        et.DatTestArr as DatTestArr  -- Match aggregate query structure (for UNION duplicate removal)
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
        AND ev.DNA = 1  -- Filter to 4-6 weeks visits only
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
            ORDER BY ClinicID, DaBlood
        ) t
        WHERE t.DatTestArr BETWEEN @StartDate AND @EndDate
        -- Match aggregate query: no DNAPcr filter here, let JOIN condition handle it
    ) et ON req.ClinicID = et.ClinicID AND req.DNA = et.DNAPcr AND req.Rn = et.Rn
    INNER JOIN tbleimain ei ON req.ClinicID = ei.ClinicID
    WHERE et.Result IS NULL  -- Match aggregate query: WHERE et.Result Is null (includes both no match and null result)
) c
ORDER BY TestDate DESC, clinicid
