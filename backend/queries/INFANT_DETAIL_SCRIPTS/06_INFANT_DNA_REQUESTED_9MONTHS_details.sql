-- =====================================================
-- INDICATOR 6: DNA PCR REQUESTED BY CLINICIAN - 9 MONTHS
-- =====================================================
-- Lists visits (requests) where DNA = 5 in date range.
-- Matches Rinfants.vb CmdAllpcr: COUNT(DISTINCT If(c.DNA = 5, c.ClinicID, null))
SET @StartDate = '2025-04-01';
SET @EndDate = '2025-06-30';

SELECT 
    v.ClinicID AS clinicid,
    ei.Sex AS sex,
    CASE WHEN ei.Sex = 0 THEN 'Female' WHEN ei.Sex = 1 THEN 'Male' ELSE 'Unknown' END AS sex_display,
    ei.DaBirth AS DaBirth,
    ei.DafirstVisit AS DafirstVisit,
    v.DatVisit AS DatVisit,
    v.DatVisit AS TestDate,
    5 AS dna_test_type,
    '9 Months' AS dna_test_display,
    CAST(v.OtherDNA AS CHAR CHARACTER SET utf8mb4) COLLATE utf8mb4_general_ci AS other_dna,
    NULL AS result,
    'Requested' AS result_display,
    CASE WHEN TIMESTAMPDIFF(DAY, ei.DaBirth, v.DatVisit) < 31 THEN CONCAT(CAST(TIMESTAMPDIFF(DAY, ei.DaBirth, v.DatVisit) AS CHAR), ' days') WHEN TIMESTAMPDIFF(DAY, ei.DaBirth, v.DatVisit) < 365 THEN CONCAT(CAST(FLOOR(TIMESTAMPDIFF(DAY, ei.DaBirth, v.DatVisit)/30) AS CHAR), ' mo') ELSE CONCAT(CAST(FLOOR(TIMESTAMPDIFF(DAY, ei.DaBirth, v.DatVisit)/365) AS CHAR), ' yr') END AS age_at_test,
    'Infant' AS patient_type
FROM tblevmain v
INNER JOIN tbleimain ei ON v.ClinicID = ei.ClinicID
WHERE v.DNA <> -1
AND v.DatVisit BETWEEN @StartDate AND @EndDate
AND v.DNA = 5
ORDER BY v.DatVisit DESC, v.ClinicID;
