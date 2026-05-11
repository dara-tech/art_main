-- ===================================================================
-- Indicator 12e: Percentage of VL test results received within 10 days of sample taken
-- ===================================================================

WITH tblvl_turnaround AS (
    -- Adults with VL test turnaround time
    -- Denominator: All VL tests in the reporting period (who tested in that period)
    -- Numerator: VL tests returned within 10 days (who return in 10 days)
    SELECT 
        'Adult' as type,
        IF(p.Sex=0, "Female", "Male") as Sex,
        p.ClinicID,
        pt.HIVLoad as ViralLoad,
        pt.Dat as TestDate,
        IF(pt.DaCollect IS NOT NULL AND pt.DaCollect <> '0000-00-00', pt.DaCollect, pt.Dat) as SampleDate,
        pt.DaArrival as ResultReceiveDate,
        DATEDIFF(pt.DaArrival, IF(pt.DaCollect IS NOT NULL AND pt.DaCollect <> '0000-00-00', pt.DaCollect, pt.Dat)) as TurnaroundDays,
        CASE 
            WHEN pt.DaArrival IS NOT NULL
                AND pt.DaArrival <> '0000-00-00'
                AND IF(pt.DaCollect IS NOT NULL AND pt.DaCollect <> '0000-00-00', pt.DaCollect, pt.Dat) IS NOT NULL
                AND IF(pt.DaCollect IS NOT NULL AND pt.DaCollect <> '0000-00-00', pt.DaCollect, pt.Dat) <> '0000-00-00'
                AND DATEDIFF(pt.DaArrival, IF(pt.DaCollect IS NOT NULL AND pt.DaCollect <> '0000-00-00', pt.DaCollect, pt.Dat)) <= 10 THEN 'Within_10_Days'
            WHEN pt.DaArrival IS NOT NULL
                AND pt.DaArrival <> '0000-00-00'
                AND IF(pt.DaCollect IS NOT NULL AND pt.DaCollect <> '0000-00-00', pt.DaCollect, pt.Dat) IS NOT NULL
                AND IF(pt.DaCollect IS NOT NULL AND pt.DaCollect <> '0000-00-00', pt.DaCollect, pt.Dat) <> '0000-00-00'
                AND DATEDIFF(pt.DaArrival, IF(pt.DaCollect IS NOT NULL AND pt.DaCollect <> '0000-00-00', pt.DaCollect, pt.Dat)) > 10 THEN 'Over_10_Days'
            ELSE 'No_Result_Yet'
        END as TurnaroundStatus
    FROM tblaimain p 
    INNER JOIN tblpatienttest pt ON CONVERT(p.ClinicID, CHAR) = CONVERT(pt.ClinicID, CHAR)
    WHERE 
        pt.Dat BETWEEN :StartDate AND :EndDate
    
    UNION ALL
    
    -- Children with VL test turnaround time
    SELECT 
        'Child' as type,
        IF(p.Sex=0, "Female", "Male") as Sex,
        p.ClinicID,
        pt.HIVLoad as ViralLoad,
        pt.Dat as TestDate,
        IF(pt.DaCollect IS NOT NULL AND pt.DaCollect <> '0000-00-00', pt.DaCollect, pt.Dat) as SampleDate,
        pt.DaArrival as ResultReceiveDate,
        DATEDIFF(pt.DaArrival, IF(pt.DaCollect IS NOT NULL AND pt.DaCollect <> '0000-00-00', pt.DaCollect, pt.Dat)) as TurnaroundDays,
        CASE 
            WHEN pt.DaArrival IS NOT NULL
                AND pt.DaArrival <> '0000-00-00'
                AND IF(pt.DaCollect IS NOT NULL AND pt.DaCollect <> '0000-00-00', pt.DaCollect, pt.Dat) IS NOT NULL
                AND IF(pt.DaCollect IS NOT NULL AND pt.DaCollect <> '0000-00-00', pt.DaCollect, pt.Dat) <> '0000-00-00'
                AND DATEDIFF(pt.DaArrival, IF(pt.DaCollect IS NOT NULL AND pt.DaCollect <> '0000-00-00', pt.DaCollect, pt.Dat)) <= 10 THEN 'Within_10_Days'
            WHEN pt.DaArrival IS NOT NULL
                AND pt.DaArrival <> '0000-00-00'
                AND IF(pt.DaCollect IS NOT NULL AND pt.DaCollect <> '0000-00-00', pt.DaCollect, pt.Dat) IS NOT NULL
                AND IF(pt.DaCollect IS NOT NULL AND pt.DaCollect <> '0000-00-00', pt.DaCollect, pt.Dat) <> '0000-00-00'
                AND DATEDIFF(pt.DaArrival, IF(pt.DaCollect IS NOT NULL AND pt.DaCollect <> '0000-00-00', pt.DaCollect, pt.Dat)) > 10 THEN 'Over_10_Days'
            ELSE 'No_Result_Yet'
        END as TurnaroundStatus
    FROM tblcimain p 
    INNER JOIN tblpatienttest pt ON p.ClinicID = pt.ClinicID
    WHERE 
        pt.Dat BETWEEN :StartDate AND :EndDate
)

SELECT
    '12e. Percentage of VL test results received within 10 days of sample taken' AS Indicator,
    CAST(COUNT(CASE WHEN TurnaroundStatus = 'Within_10_Days' THEN 1 END) AS UNSIGNED) AS Within_10_Days,
    CAST(COUNT(CASE WHEN TurnaroundStatus = 'Within_10_Days' THEN 1 END) AS UNSIGNED) AS TOTAL,
    -- Denominator: All VL tests in the reporting period (who tested in that period)
    CAST(COUNT(*) AS UNSIGNED) AS Total_With_Dates,
    CAST(CASE 
        WHEN COUNT(*) > 0 
        THEN ROUND((COUNT(CASE WHEN TurnaroundStatus = 'Within_10_Days' THEN 1 END) * 100.0 / COUNT(*)), 2)
        ELSE 0.00 
    END AS DECIMAL(5,2)) AS Percentage,
    -- Numerators: VL tests within 10 days
    CAST(COUNT(CASE WHEN type = 'Child' AND Sex = 'Male' AND TurnaroundStatus = 'Within_10_Days' THEN 1 END) AS UNSIGNED) AS Male_0_14,
    CAST(COUNT(CASE WHEN type = 'Child' AND Sex = 'Male' AND TurnaroundStatus = 'Within_10_Days' THEN 1 END) AS UNSIGNED) AS Male_0_14_Within_10_Days,
    CAST(COUNT(CASE WHEN type = 'Child' AND Sex = 'Female' AND TurnaroundStatus = 'Within_10_Days' THEN 1 END) AS UNSIGNED) AS Female_0_14,
    CAST(COUNT(CASE WHEN type = 'Child' AND Sex = 'Female' AND TurnaroundStatus = 'Within_10_Days' THEN 1 END) AS UNSIGNED) AS Female_0_14_Within_10_Days,
    CAST(COUNT(CASE WHEN type = 'Adult' AND Sex = 'Male' AND TurnaroundStatus = 'Within_10_Days' THEN 1 END) AS UNSIGNED) AS Male_over_14,
    CAST(COUNT(CASE WHEN type = 'Adult' AND Sex = 'Male' AND TurnaroundStatus = 'Within_10_Days' THEN 1 END) AS UNSIGNED) AS Male_over_14_Within_10_Days,
    CAST(COUNT(CASE WHEN type = 'Adult' AND Sex = 'Female' AND TurnaroundStatus = 'Within_10_Days' THEN 1 END) AS UNSIGNED) AS Female_over_14,
    CAST(COUNT(CASE WHEN type = 'Adult' AND Sex = 'Female' AND TurnaroundStatus = 'Within_10_Days' THEN 1 END) AS UNSIGNED) AS Female_over_14_Within_10_Days,
    -- Denominators: total VL tests in the reporting period by demographic
    CAST(COUNT(CASE WHEN type = 'Child' AND Sex = 'Male' THEN 1 END) AS UNSIGNED) AS Male_0_14_Total,
    CAST(COUNT(CASE WHEN type = 'Child' AND Sex = 'Female' THEN 1 END) AS UNSIGNED) AS Female_0_14_Total,
    CAST(COUNT(CASE WHEN type = 'Adult' AND Sex = 'Male' THEN 1 END) AS UNSIGNED) AS Male_over_14_Total,
    CAST(COUNT(CASE WHEN type = 'Adult' AND Sex = 'Female' THEN 1 END) AS UNSIGNED) AS Female_over_14_Total,
    -- Aggregated totals for easier frontend access
    CAST(COUNT(CASE WHEN type = 'Child' THEN 1 END) AS UNSIGNED) AS Children_Total,
    CAST(COUNT(CASE WHEN type = 'Adult' THEN 1 END) AS UNSIGNED) AS Adults_Total
FROM tblvl_turnaround;
