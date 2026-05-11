-- ===================================================================
-- Indicator 14a: Percentage of PLHIV receiving first line ART with two consecutive documented viral load test results ≥1000 copies/mL switching to second line
-- ===================================================================

WITH adult_second_line_history AS (
    SELECT 
        v.ClinicID,
        COALESCE(ard.Da, v.DatVisit) AS SwitchDate
    FROM tblavmain v
    JOIN tblavarvdrug ard ON ard.Vid = v.Vid
    WHERE COALESCE(ard.Da, v.DatVisit) IS NOT NULL
      AND ard.DrugName IS NOT NULL
      AND UPPER(ard.DrugName) LIKE '%2ND%'
),
child_second_line_history AS (
    SELECT 
        v.ClinicID,
        COALESCE(crd.Da, v.DatVisit) AS SwitchDate
    FROM tblcvmain v
    JOIN tblcvarvdrug crd ON crd.Vid = v.Vid
    WHERE COALESCE(crd.Da, v.DatVisit) IS NOT NULL
      AND crd.DrugName IS NOT NULL
      AND UPPER(crd.DrugName) LIKE '%2ND%'
),
tblfirst_to_second_line AS (
    -- Adults switching from first line to second line
    SELECT 
        'Adult' as type,
        IF(p.Sex=0, "Female", "Male") as Sex,
        p.ClinicID,
        pt1.Dat as FirstVLDate,
        pt2.Dat as SecondVLDate,
        CASE 
            WHEN pt1.HIVLoad IS NOT NULL 
                AND pt2.HIVLoad IS NOT NULL
                AND CAST(REPLACE(REPLACE(REPLACE(pt1.HIVLoad, '<', ''), '>', ''), '=', '') AS UNSIGNED) >= 1000
                AND CAST(REPLACE(REPLACE(REPLACE(pt2.HIVLoad, '<', ''), '>', ''), '=', '') AS UNSIGNED) >= 1000
                AND pt2.Dat > pt1.Dat
                AND DATEDIFF(pt2.Dat, pt1.Dat) BETWEEN 30 AND 180
                AND NOT EXISTS (
                    SELECT 1 
                    FROM adult_second_line_history h
                    WHERE h.ClinicID = p.ClinicID
                      AND h.SwitchDate < pt1.Dat
                )
                AND EXISTS (
                    SELECT 1 
                    FROM adult_second_line_history h
                    WHERE h.ClinicID = p.ClinicID
                      AND h.SwitchDate >= pt2.Dat
                      AND h.SwitchDate <= DATE_ADD(pt2.Dat, INTERVAL 365 DAY)
                )
                THEN 'Switched'
            WHEN pt1.HIVLoad IS NOT NULL 
                AND pt2.HIVLoad IS NOT NULL
                AND CAST(REPLACE(REPLACE(REPLACE(pt1.HIVLoad, '<', ''), '>', ''), '=', '') AS UNSIGNED) >= 1000
                AND CAST(REPLACE(REPLACE(REPLACE(pt2.HIVLoad, '<', ''), '>', ''), '=', '') AS UNSIGNED) >= 1000
                AND pt2.Dat > pt1.Dat
                AND DATEDIFF(pt2.Dat, pt1.Dat) BETWEEN 30 AND 180
                AND NOT EXISTS (
                    SELECT 1 
                    FROM adult_second_line_history h
                    WHERE h.ClinicID = p.ClinicID
                      AND h.SwitchDate < pt1.Dat
                )
                THEN 'Not_Switched'
            ELSE 'Not_Eligible'
        END as SwitchStatus
    FROM tblaimain p 
    JOIN tblaart art ON p.ClinicID = art.ClinicID
    JOIN tblpatienttest pt1 ON p.ClinicID = pt1.ClinicID
    JOIN tblpatienttest pt2 ON p.ClinicID = pt2.ClinicID
        AND pt2.Dat > pt1.Dat
        AND DATEDIFF(pt2.Dat, pt1.Dat) BETWEEN 30 AND 180
    WHERE 
        pt1.HIVLoad IS NOT NULL
        AND pt2.HIVLoad IS NOT NULL
        AND pt1.Dat BETWEEN :StartDate AND :EndDate
        AND CAST(REPLACE(REPLACE(REPLACE(pt1.HIVLoad, '<', ''), '>', ''), '=', '') AS UNSIGNED) >= 1000
        AND CAST(REPLACE(REPLACE(REPLACE(pt2.HIVLoad, '<', ''), '>', ''), '=', '') AS UNSIGNED) >= 1000
    
    UNION ALL
    
    -- Children switching from first line to second line
    SELECT 
        'Child' as type,
        IF(p.Sex=0, "Female", "Male") as Sex,
        p.ClinicID,
        pt1.Dat as FirstVLDate,
        pt2.Dat as SecondVLDate,
        CASE 
            WHEN pt1.HIVLoad IS NOT NULL 
                AND pt2.HIVLoad IS NOT NULL
                AND CAST(REPLACE(REPLACE(REPLACE(pt1.HIVLoad, '<', ''), '>', ''), '=', '') AS UNSIGNED) >= 1000
                AND CAST(REPLACE(REPLACE(REPLACE(pt2.HIVLoad, '<', ''), '>', ''), '=', '') AS UNSIGNED) >= 1000
                AND pt2.Dat > pt1.Dat
                AND DATEDIFF(pt2.Dat, pt1.Dat) BETWEEN 30 AND 180
                AND NOT EXISTS (
                    SELECT 1 
                    FROM child_second_line_history h
                    WHERE h.ClinicID = p.ClinicID
                      AND h.SwitchDate < pt1.Dat
                )
                AND EXISTS (
                    SELECT 1 
                    FROM child_second_line_history h
                    WHERE h.ClinicID = p.ClinicID
                      AND h.SwitchDate >= pt2.Dat
                      AND h.SwitchDate <= DATE_ADD(pt2.Dat, INTERVAL 365 DAY)
                )
                THEN 'Switched'
            WHEN pt1.HIVLoad IS NOT NULL 
                AND pt2.HIVLoad IS NOT NULL
                AND CAST(REPLACE(REPLACE(REPLACE(pt1.HIVLoad, '<', ''), '>', ''), '=', '') AS UNSIGNED) >= 1000
                AND CAST(REPLACE(REPLACE(REPLACE(pt2.HIVLoad, '<', ''), '>', ''), '=', '') AS UNSIGNED) >= 1000
                AND pt2.Dat > pt1.Dat
                AND DATEDIFF(pt2.Dat, pt1.Dat) BETWEEN 30 AND 180
                AND NOT EXISTS (
                    SELECT 1 
                    FROM child_second_line_history h
                    WHERE h.ClinicID = p.ClinicID
                      AND h.SwitchDate < pt1.Dat
                )
                THEN 'Not_Switched'
            ELSE 'Not_Eligible'
        END as SwitchStatus
    FROM tblcimain p 
    JOIN tblcart art ON p.ClinicID = art.ClinicID
    JOIN tblpatienttest pt1 ON p.ClinicID = pt1.ClinicID
    JOIN tblpatienttest pt2 ON p.ClinicID = pt2.ClinicID
        AND pt2.Dat > pt1.Dat
        AND DATEDIFF(pt2.Dat, pt1.Dat) BETWEEN 30 AND 180
    WHERE 
        pt1.HIVLoad IS NOT NULL
        AND pt2.HIVLoad IS NOT NULL
        AND pt1.Dat BETWEEN :StartDate AND :EndDate
        AND CAST(REPLACE(REPLACE(REPLACE(pt1.HIVLoad, '<', ''), '>', ''), '=', '') AS UNSIGNED) >= 1000
        AND CAST(REPLACE(REPLACE(REPLACE(pt2.HIVLoad, '<', ''), '>', ''), '=', '') AS UNSIGNED) >= 1000
)

SELECT
    '14a. Percentage of PLHIV receiving first line ART with two consecutive VL ≥1000 copies/mL switching to second line' AS Indicator,
    CAST(COUNT(DISTINCT CASE WHEN SwitchStatus = 'Switched' THEN ClinicID END) AS UNSIGNED) AS Switched_To_Second_Line,
    CAST(COUNT(DISTINCT CASE WHEN SwitchStatus IN ('Switched', 'Not_Switched') THEN ClinicID END) AS UNSIGNED) AS Eligible_Patients,
    CAST(COUNT(DISTINCT ClinicID) AS UNSIGNED) AS Total_With_Consecutive_High_VL,
    CAST(CASE 
        WHEN COUNT(DISTINCT CASE WHEN SwitchStatus IN ('Switched', 'Not_Switched') THEN ClinicID END) > 0 
        THEN ROUND((COUNT(DISTINCT CASE WHEN SwitchStatus = 'Switched' THEN ClinicID END) * 100.0 / COUNT(DISTINCT CASE WHEN SwitchStatus IN ('Switched', 'Not_Switched') THEN ClinicID END)), 2)
        ELSE 0.00 
    END AS DECIMAL(5,2)) AS Percentage,
    -- Numerators: patients who switched by demographic
    CAST(COUNT(DISTINCT CASE WHEN type = 'Child' AND Sex = 'Male' AND SwitchStatus = 'Switched' THEN ClinicID END) AS UNSIGNED) AS Male_0_14_Switched,
    CAST(COUNT(DISTINCT CASE WHEN type = 'Child' AND Sex = 'Female' AND SwitchStatus = 'Switched' THEN ClinicID END) AS UNSIGNED) AS Female_0_14_Switched,
    CAST(COUNT(DISTINCT CASE WHEN type = 'Adult' AND Sex = 'Male' AND SwitchStatus = 'Switched' THEN ClinicID END) AS UNSIGNED) AS Male_over_14_Switched,
    CAST(COUNT(DISTINCT CASE WHEN type = 'Adult' AND Sex = 'Female' AND SwitchStatus = 'Switched' THEN ClinicID END) AS UNSIGNED) AS Female_over_14_Switched,
    -- Denominators: total eligible patients by demographic
    CAST(COUNT(DISTINCT CASE WHEN type = 'Child' AND Sex = 'Male' AND SwitchStatus IN ('Switched', 'Not_Switched') THEN ClinicID END) AS UNSIGNED) AS Male_0_14_Total,
    CAST(COUNT(DISTINCT CASE WHEN type = 'Child' AND Sex = 'Female' AND SwitchStatus IN ('Switched', 'Not_Switched') THEN ClinicID END) AS UNSIGNED) AS Female_0_14_Total,
    CAST(COUNT(DISTINCT CASE WHEN type = 'Adult' AND Sex = 'Male' AND SwitchStatus IN ('Switched', 'Not_Switched') THEN ClinicID END) AS UNSIGNED) AS Male_over_14_Total,
    CAST(COUNT(DISTINCT CASE WHEN type = 'Adult' AND Sex = 'Female' AND SwitchStatus IN ('Switched', 'Not_Switched') THEN ClinicID END) AS UNSIGNED) AS Female_over_14_Total,
    -- Aggregated totals for easier frontend access
    CAST(COUNT(DISTINCT CASE WHEN type = 'Child' AND SwitchStatus IN ('Switched', 'Not_Switched') THEN ClinicID END) AS UNSIGNED) AS Children_Total,
    CAST(COUNT(DISTINCT CASE WHEN type = 'Adult' AND SwitchStatus IN ('Switched', 'Not_Switched') THEN ClinicID END) AS UNSIGNED) AS Adults_Total
FROM tblfirst_to_second_line;



