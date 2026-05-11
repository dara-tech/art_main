-- ===================================================================
-- Indicator 14b detail: Percentage of PLHIV receiving second line ART with two consecutive VL ≥1000 copies/mL switching to third line
-- Returns patient-level records for patients with consecutive high VL and their switch status
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
adult_third_line_history AS (
    SELECT 
        v.ClinicID,
        COALESCE(ard.Da, v.DatVisit) AS SwitchDate
    FROM tblavmain v
    JOIN tblavarvdrug ard ON ard.Vid = v.Vid
    WHERE COALESCE(ard.Da, v.DatVisit) IS NOT NULL
      AND ard.DrugName IS NOT NULL
      AND UPPER(ard.DrugName) LIKE '%3RD%'
),
child_third_line_history AS (
    SELECT 
        v.ClinicID,
        COALESCE(crd.Da, v.DatVisit) AS SwitchDate
    FROM tblcvmain v
    JOIN tblcvarvdrug crd ON crd.Vid = v.Vid
    WHERE COALESCE(crd.Da, v.DatVisit) IS NOT NULL
      AND crd.DrugName IS NOT NULL
      AND UPPER(crd.DrugName) LIKE '%3RD%'
),
tblsecond_to_third_line AS (
    -- Adults switching from second line to third line
    SELECT 
        'Adult' as type,
        IF(p.Sex=0, "Female", "Male") as Sex,
        p.ClinicID,
        p.DaBirth,
        pt1.Dat as FirstVLDate,
        pt1.HIVLoad as FirstVLLoad,
        pt2.Dat as SecondVLDate,
        pt2.HIVLoad as SecondVLLoad,
        CAST(REPLACE(REPLACE(REPLACE(pt1.HIVLoad, '<', ''), '>', ''), '=', '') AS UNSIGNED) AS FirstVLValue,
        CAST(REPLACE(REPLACE(REPLACE(pt2.HIVLoad, '<', ''), '>', ''), '=', '') AS UNSIGNED) AS SecondVLValue,
        DATEDIFF(pt2.Dat, pt1.Dat) AS DaysBetweenVL,
        CASE 
            WHEN pt1.HIVLoad IS NOT NULL 
                AND pt2.HIVLoad IS NOT NULL
                AND CAST(REPLACE(REPLACE(REPLACE(pt1.HIVLoad, '<', ''), '>', ''), '=', '') AS UNSIGNED) >= 1000
                AND CAST(REPLACE(REPLACE(REPLACE(pt2.HIVLoad, '<', ''), '>', ''), '=', '') AS UNSIGNED) >= 1000
                AND pt2.Dat > pt1.Dat
                AND DATEDIFF(pt2.Dat, pt1.Dat) BETWEEN 30 AND 180
                AND EXISTS (
                    SELECT 1 
                    FROM adult_second_line_history h
                    WHERE h.ClinicID = p.ClinicID
                      AND h.SwitchDate <= pt1.Dat
                )
                AND NOT EXISTS (
                    SELECT 1
                    FROM adult_third_line_history h
                    WHERE h.ClinicID = p.ClinicID
                      AND h.SwitchDate < pt1.Dat
                )
                AND EXISTS (
                    SELECT 1 
                    FROM adult_third_line_history h
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
                AND EXISTS (
                    SELECT 1 
                    FROM adult_second_line_history h
                    WHERE h.ClinicID = p.ClinicID
                      AND h.SwitchDate <= pt1.Dat
                )
                AND NOT EXISTS (
                    SELECT 1
                    FROM adult_third_line_history h
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
    
    -- Children switching from second line to third line
    SELECT 
        'Child' as type,
        IF(p.Sex=0, "Female", "Male") as Sex,
        p.ClinicID,
        p.DaBirth,
        pt1.Dat as FirstVLDate,
        pt1.HIVLoad as FirstVLLoad,
        pt2.Dat as SecondVLDate,
        pt2.HIVLoad as SecondVLLoad,
        CAST(REPLACE(REPLACE(REPLACE(pt1.HIVLoad, '<', ''), '>', ''), '=', '') AS UNSIGNED) AS FirstVLValue,
        CAST(REPLACE(REPLACE(REPLACE(pt2.HIVLoad, '<', ''), '>', ''), '=', '') AS UNSIGNED) AS SecondVLValue,
        DATEDIFF(pt2.Dat, pt1.Dat) AS DaysBetweenVL,
        CASE 
            WHEN pt1.HIVLoad IS NOT NULL 
                AND pt2.HIVLoad IS NOT NULL
                AND CAST(REPLACE(REPLACE(REPLACE(pt1.HIVLoad, '<', ''), '>', ''), '=', '') AS UNSIGNED) >= 1000
                AND CAST(REPLACE(REPLACE(REPLACE(pt2.HIVLoad, '<', ''), '>', ''), '=', '') AS UNSIGNED) >= 1000
                AND pt2.Dat > pt1.Dat
                AND DATEDIFF(pt2.Dat, pt1.Dat) BETWEEN 30 AND 180
                AND EXISTS (
                    SELECT 1 
                    FROM child_second_line_history h
                    WHERE h.ClinicID = p.ClinicID
                      AND h.SwitchDate <= pt1.Dat
                )
                AND NOT EXISTS (
                    SELECT 1
                    FROM child_third_line_history h
                    WHERE h.ClinicID = p.ClinicID
                      AND h.SwitchDate < pt1.Dat
                )
                AND EXISTS (
                    SELECT 1 
                    FROM child_third_line_history h
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
                AND EXISTS (
                    SELECT 1 
                    FROM child_second_line_history h
                    WHERE h.ClinicID = p.ClinicID
                      AND h.SwitchDate <= pt1.Dat
                )
                AND NOT EXISTS (
                    SELECT 1
                    FROM child_third_line_history h
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
),

active_patients_check AS (
    -- Check which patients are still active at EndDate
    SELECT DISTINCT
        v.clinicid
    FROM (
        SELECT 
            clinicid,
            DatVisit,
            ROW_NUMBER() OVER (PARTITION BY clinicid ORDER BY DatVisit DESC) AS id 
        FROM tblavmain 
        WHERE DatVisit <= :EndDate
        
        UNION ALL 
        
        SELECT 
            clinicid,
            DatVisit,
            ROW_NUMBER() OVER (PARTITION BY clinicid ORDER BY DatVisit DESC) AS id 
        FROM tblcvmain 
        WHERE DatVisit <= :EndDate
    ) v
    LEFT JOIN (
        SELECT DISTINCT clinicid FROM tblaart WHERE DaArt <= :EndDate
        UNION
        SELECT DISTINCT clinicid FROM tblcart WHERE DaArt <= :EndDate
    ) a ON a.clinicid = v.clinicid
    LEFT JOIN (
        SELECT clinicid, status FROM tblavpatientstatus WHERE da <= :EndDate
        UNION ALL
        SELECT clinicid, status FROM tblcvpatientstatus WHERE da <= :EndDate
    ) e ON v.clinicid = e.clinicid
    WHERE v.id = 1 AND e.status IS NULL AND a.clinicid IS NOT NULL
),

patient_exit_status AS (
    -- Get latest exit status for each patient
    SELECT 
        clinicid,
        status,
        MAX(da) as exit_date
    FROM (
        SELECT clinicid, status, da
        FROM tblavpatientstatus 
        WHERE da <= :EndDate
        
        UNION ALL
        
        SELECT clinicid, status, da
        FROM tblcvpatientstatus 
        WHERE da <= :EndDate
    ) ps
    GROUP BY clinicid, status
)

SELECT
    main.ClinicID AS clinicid,
    art.ART AS art_number,
    s.Sex AS sex,
    CASE WHEN s.Sex = 'Female' THEN 'Female' ELSE 'Male' END AS sex_display,
    CASE WHEN s.type = 'Child' THEN 'Child' ELSE 'Adult' END AS patient_type,
    TIMESTAMPDIFF(YEAR, s.DaBirth, :EndDate) AS age,
    main.DafirstVisit AS DafirstVisit,
    s.FirstVLDate AS first_vl_date,
    s.FirstVLValue AS first_vl_value,
    s.SecondVLDate AS second_vl_date,
    s.SecondVLValue AS second_vl_value,
    s.DaysBetweenVL AS days_between_vl,
    s.SwitchStatus AS switch_status,
    CASE 
        WHEN apc.clinicid IS NOT NULL THEN 'Active'
        WHEN pes.status = :dead_code THEN 'Dead'
        WHEN pes.status = :transfer_out_code THEN 'Transfer Out'
        WHEN pes.status = :lost_code THEN 'Lost to Follow-up'
        ELSE 'Unknown'
    END AS Status,
    pes.exit_date AS exit_date
FROM tblsecond_to_third_line s
JOIN tblaimain main ON main.ClinicID = s.ClinicID
LEFT JOIN tblaart art ON main.ClinicID = art.ClinicID
LEFT JOIN active_patients_check apc ON s.ClinicID = apc.clinicid
LEFT JOIN patient_exit_status pes ON s.ClinicID = pes.clinicid
WHERE s.type = 'Adult'
  AND s.SwitchStatus IN ('Switched', 'Not_Switched')

UNION ALL

SELECT
    main.ClinicID AS clinicid,
    art.ART AS art_number,
    s.Sex AS sex,
    CASE WHEN s.Sex = 'Female' THEN 'Female' ELSE 'Male' END AS sex_display,
    CASE WHEN s.type = 'Child' THEN 'Child' ELSE 'Adult' END AS patient_type,
    TIMESTAMPDIFF(YEAR, s.DaBirth, :EndDate) AS age,
    main.DafirstVisit AS DafirstVisit,
    s.FirstVLDate AS first_vl_date,
    s.FirstVLValue AS first_vl_value,
    s.SecondVLDate AS second_vl_date,
    s.SecondVLValue AS second_vl_value,
    s.DaysBetweenVL AS days_between_vl,
    s.SwitchStatus AS switch_status,
    CASE 
        WHEN apc.clinicid IS NOT NULL THEN 'Active'
        WHEN pes.status = :dead_code THEN 'Dead'
        WHEN pes.status = :transfer_out_code THEN 'Transfer Out'
        WHEN pes.status = :lost_code THEN 'Lost to Follow-up'
        ELSE 'Unknown'
    END AS Status,
    pes.exit_date AS exit_date
FROM tblsecond_to_third_line s
JOIN tblcimain main ON main.ClinicID = s.ClinicID
LEFT JOIN tblcart art ON main.ClinicID = art.ClinicID
LEFT JOIN active_patients_check apc ON s.ClinicID = apc.clinicid
LEFT JOIN patient_exit_status pes ON s.ClinicID = pes.clinicid
WHERE s.type = 'Child'
  AND s.SwitchStatus IN ('Switched', 'Not_Switched')

ORDER BY Status DESC, first_vl_date DESC, clinicid;

