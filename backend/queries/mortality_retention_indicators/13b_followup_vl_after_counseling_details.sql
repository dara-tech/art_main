-- ===================================================================
-- Indicator 13b detail: Percentage of PLHIV with VL ≥1000 copies/mL who received follow-up VL test ~3 months after enhanced adherence counselling
-- Returns patient-level records for patients who received EAC and follow-up VL test
-- ===================================================================

WITH adult_vl AS (
    SELECT 
        '15+' AS typepatients,
        IFNULL(p.Sex, 0) AS Sex,
        CONVERT(p.ClinicID, CHAR) AS ClinicID,
        p.DaBirth,
        pt.Dat AS VLDate,
        CAST(REPLACE(REPLACE(REPLACE(pt.HIVLoad, '<', ''), '>', ''), '=', '') AS UNSIGNED) AS VLValue
    FROM tblaimain p
    JOIN tblpatienttest pt ON CONVERT(p.ClinicID, CHAR) = CONVERT(pt.ClinicID, CHAR)
    WHERE pt.HIVLoad IS NOT NULL
      AND pt.HIVLoad <> ''
      AND pt.Dat BETWEEN :StartDate AND :EndDate
),
child_vl AS (
    SELECT 
        '≤14' AS typepatients,
        IFNULL(p.Sex, 0) AS Sex,
        CONVERT(p.ClinicID, CHAR) AS ClinicID,
        p.DaBirth,
        pt.Dat AS VLDate,
        CAST(REPLACE(REPLACE(REPLACE(pt.HIVLoad, '<', ''), '>', ''), '=', '') AS UNSIGNED) AS VLValue
    FROM tblcimain p
    JOIN tblpatienttest pt ON p.ClinicID = pt.ClinicID
    WHERE pt.HIVLoad IS NOT NULL
      AND pt.HIVLoad <> ''
      AND pt.Dat BETWEEN :StartDate AND :EndDate
),
vl_tests AS (
    SELECT * FROM adult_vl
    UNION ALL
    SELECT * FROM child_vl
),
latest_high_vl AS (
    SELECT ClinicID,
           typepatients,
           Sex,
           DaBirth,
           VLDate,
           VLValue
    FROM (
        SELECT vt.*,
               ROW_NUMBER() OVER (PARTITION BY ClinicID ORDER BY VLDate DESC) AS rn
        FROM vl_tests vt
    ) ranked
    WHERE rn = 1
      AND VLValue >= 1000
),
adult_eac AS (
    SELECT 
        '15+' AS typepatients,
        IFNULL(p.Sex, 0) AS Sex,
        CONVERT(p.ClinicID, CHAR) AS ClinicID,
        v.DatVisit AS EACDate
    FROM tblaimain p
    JOIN tblavmain v ON p.ClinicID = v.ClinicID
    WHERE v.VLDetectable IS NOT NULL
      AND v.VLDetectable > 0
),
child_eac AS (
    SELECT 
        '≤14' AS typepatients,
        IFNULL(p.Sex, 0) AS Sex,
        CONVERT(p.ClinicID, CHAR) AS ClinicID,
        v.DatVisit AS EACDate
    FROM tblcimain p
    JOIN tblcvmain v ON p.ClinicID = v.ClinicID
    WHERE v.VLDetectable IS NOT NULL
      AND v.VLDetectable > 0
),
eac_sessions AS (
    SELECT * FROM adult_eac
    UNION ALL
    SELECT * FROM child_eac
),
high_vl_with_eac AS (
    SELECT 
        h.ClinicID,
        h.typepatients,
        h.Sex,
        h.DaBirth,
        h.VLDate,
        h.VLValue,
        MIN(e.EACDate) AS EACDate
    FROM latest_high_vl h
    LEFT JOIN eac_sessions e
      ON e.ClinicID = h.ClinicID
     AND e.EACDate >= h.VLDate
    GROUP BY h.ClinicID, h.typepatients, h.Sex, h.DaBirth, h.VLDate, h.VLValue
),
eac_received AS (
    SELECT *
    FROM high_vl_with_eac
    WHERE EACDate IS NOT NULL
),
adult_followup_vl AS (
    SELECT 
        '15+' AS typepatients,
        IFNULL(p.Sex, 0) AS Sex,
        CONVERT(p.ClinicID, CHAR) AS ClinicID,
        pt.Dat AS VLDate,
        CAST(REPLACE(REPLACE(REPLACE(pt.HIVLoad, '<', ''), '>', ''), '=', '') AS UNSIGNED) AS VLValue
    FROM tblaimain p
    JOIN tblpatienttest pt ON CONVERT(p.ClinicID, CHAR) = CONVERT(pt.ClinicID, CHAR)
    WHERE pt.HIVLoad IS NOT NULL
      AND pt.HIVLoad <> ''
      AND pt.Dat BETWEEN :StartDate AND DATE_ADD(:EndDate, INTERVAL 4 MONTH)
),
child_followup_vl AS (
    SELECT 
        '≤14' AS typepatients,
        IFNULL(p.Sex, 0) AS Sex,
        CONVERT(p.ClinicID, CHAR) AS ClinicID,
        pt.Dat AS VLDate,
        CAST(REPLACE(REPLACE(REPLACE(pt.HIVLoad, '<', ''), '>', ''), '=', '') AS UNSIGNED) AS VLValue
    FROM tblcimain p
    JOIN tblpatienttest pt ON p.ClinicID = pt.ClinicID
    WHERE pt.HIVLoad IS NOT NULL
      AND pt.HIVLoad <> ''
      AND pt.Dat BETWEEN :StartDate AND DATE_ADD(:EndDate, INTERVAL 4 MONTH)
),
followup_tests AS (
    SELECT * FROM adult_followup_vl
    UNION ALL
    SELECT * FROM child_followup_vl
),
followup_ranked AS (
    SELECT 
        e.ClinicID,
        e.typepatients,
        e.Sex,
        e.DaBirth,
        e.VLDate,
        e.VLValue,
        e.EACDate,
        f.VLDate AS FollowupDate,
        f.VLValue AS FollowupValue,
        ROW_NUMBER() OVER (PARTITION BY e.ClinicID ORDER BY f.VLDate) AS rn
    FROM eac_received e
    LEFT JOIN followup_tests f
      ON f.ClinicID = e.ClinicID
     AND f.VLDate BETWEEN DATE_ADD(e.EACDate, INTERVAL 3 MONTH) AND DATE_ADD(e.EACDate, INTERVAL 4 MONTH)
),
followup_ready AS (
    SELECT 
        ClinicID,
        typepatients,
        Sex,
        DaBirth,
        VLDate,
        VLValue,
        EACDate,
        MAX(CASE WHEN rn = 1 THEN FollowupDate END) AS FollowupDate,
        MAX(CASE WHEN rn = 1 THEN FollowupValue END) AS FollowupValue
    FROM followup_ranked
    GROUP BY ClinicID, typepatients, Sex, DaBirth, VLDate, VLValue, EACDate
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
    f.Sex AS sex,
    CASE WHEN f.Sex = 0 THEN 'Female' ELSE 'Male' END AS sex_display,
    CASE WHEN f.typepatients = '≤14' THEN 'Child' ELSE 'Adult' END AS patient_type,
    TIMESTAMPDIFF(YEAR, f.DaBirth, :EndDate) AS age,
    main.DafirstVisit AS DafirstVisit,
    f.VLDate AS high_vl_date,
    f.VLValue AS high_vl_value,
    f.EACDate AS eac_date,
    f.FollowupDate AS followup_vl_date,
    f.FollowupValue AS followup_vl_value,
    CASE WHEN f.FollowupDate IS NOT NULL THEN 'Yes' ELSE 'No' END AS received_followup_vl,
    CASE 
        WHEN apc.clinicid IS NOT NULL THEN 'Active'
        WHEN pes.status = :dead_code THEN 'Dead'
        WHEN pes.status = :transfer_out_code THEN 'Transfer Out'
        WHEN pes.status = :lost_code THEN 'Lost to Follow-up'
        ELSE 'Unknown'
    END AS Status,
    pes.exit_date AS exit_date
FROM followup_ready f
JOIN tblaimain main ON CONVERT(main.ClinicID, CHAR) = f.ClinicID
LEFT JOIN tblaart art ON main.ClinicID = art.ClinicID
LEFT JOIN active_patients_check apc ON CONVERT(f.ClinicID, CHAR) = CONVERT(apc.clinicid, CHAR)
LEFT JOIN patient_exit_status pes ON CONVERT(f.ClinicID, CHAR) = CONVERT(pes.clinicid, CHAR)
WHERE f.typepatients = '15+'
  AND f.EACDate IS NOT NULL

UNION ALL

SELECT
    main.ClinicID AS clinicid,
    art.ART AS art_number,
    f.Sex AS sex,
    CASE WHEN f.Sex = 0 THEN 'Female' ELSE 'Male' END AS sex_display,
    CASE WHEN f.typepatients = '≤14' THEN 'Child' ELSE 'Adult' END AS patient_type,
    TIMESTAMPDIFF(YEAR, f.DaBirth, :EndDate) AS age,
    main.DafirstVisit AS DafirstVisit,
    f.VLDate AS high_vl_date,
    f.VLValue AS high_vl_value,
    f.EACDate AS eac_date,
    f.FollowupDate AS followup_vl_date,
    f.FollowupValue AS followup_vl_value,
    CASE WHEN f.FollowupDate IS NOT NULL THEN 'Yes' ELSE 'No' END AS received_followup_vl,
    CASE 
        WHEN apc.clinicid IS NOT NULL THEN 'Active'
        WHEN pes.status = :dead_code THEN 'Dead'
        WHEN pes.status = :transfer_out_code THEN 'Transfer Out'
        WHEN pes.status = :lost_code THEN 'Lost to Follow-up'
        ELSE 'Unknown'
    END AS Status,
    pes.exit_date AS exit_date
FROM followup_ready f
JOIN tblcimain main ON CONVERT(main.ClinicID, CHAR) = f.ClinicID
LEFT JOIN tblcart art ON main.ClinicID = art.ClinicID
LEFT JOIN active_patients_check apc ON CONVERT(f.ClinicID, CHAR) = CONVERT(apc.clinicid, CHAR)
LEFT JOIN patient_exit_status pes ON CONVERT(f.ClinicID, CHAR) = CONVERT(pes.clinicid, CHAR)
WHERE f.typepatients = '≤14'
  AND f.EACDate IS NOT NULL

ORDER BY Status DESC, high_vl_date DESC, clinicid;

