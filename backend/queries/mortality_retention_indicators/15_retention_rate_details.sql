-- ===================================================================
-- Indicator 15 detail: Retention rate (quarterly calculation based on TX_CURR/TX_NEW)
-- Returns patient-level records for patients currently on ART (TX_CURR_Current)
-- ===================================================================

WITH latest_visits_current AS (
    SELECT clinicid, DatVisit, ROW_NUMBER() OVER (PARTITION BY clinicid ORDER BY DatVisit DESC) AS rn
    FROM tblavmain
    WHERE DatVisit <= :EndDate
    
    UNION ALL
    
    SELECT clinicid, DatVisit, ROW_NUMBER() OVER (PARTITION BY clinicid ORDER BY DatVisit DESC) AS rn
    FROM tblcvmain
    WHERE DatVisit <= :EndDate
),
patient_info_current AS (
    SELECT 
        ClinicID, 
        '15+' AS typepatients, 
        IF(Sex=0, 'Female', 'Male') AS Sex,
        DaBirth,
        DafirstVisit
    FROM tblaimain
    WHERE DafirstVisit <= :EndDate
    
    UNION ALL
    
    SELECT 
        ClinicID, 
        '≤14' AS typepatients, 
        IF(Sex=0, 'Female', 'Male') AS Sex,
        DaBirth,
        DafirstVisit
    FROM tblcimain
    WHERE DafirstVisit <= :EndDate
),
art_start_current AS (
    SELECT ClinicID, DaArt FROM tblaart WHERE DaArt <= :EndDate
    
    UNION ALL
    
    SELECT ClinicID, DaArt FROM tblcart WHERE DaArt <= :EndDate
),
exit_status_current AS (
    SELECT ClinicID, Status FROM tblavpatientstatus WHERE Da <= :EndDate
    
    UNION ALL
    
    SELECT ClinicID, Status FROM tblcvpatientstatus WHERE Da <= :EndDate
),
tx_curr_current AS (
    SELECT DISTINCT 
        i.ClinicID, 
        i.typepatients, 
        i.Sex,
        i.DaBirth,
        i.DafirstVisit,
        a.DaArt,
        v.DatVisit AS LastVisitDate
    FROM latest_visits_current v
    JOIN patient_info_current i ON i.ClinicID = v.ClinicID
    LEFT JOIN art_start_current a ON a.ClinicID = v.ClinicID
    LEFT JOIN exit_status_current e ON e.ClinicID = v.ClinicID
    WHERE v.rn = 1 
      AND a.ClinicID IS NOT NULL 
      AND e.Status IS NULL
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
    t.Sex AS sex,
    CASE WHEN t.Sex = 'Female' THEN 'Female' ELSE 'Male' END AS sex_display,
    CASE WHEN t.typepatients = '≤14' THEN 'Child' ELSE 'Adult' END AS patient_type,
    TIMESTAMPDIFF(YEAR, t.DaBirth, :EndDate) AS age,
    t.DafirstVisit AS DafirstVisit,
    t.DaArt AS art_start_date,
    t.LastVisitDate AS last_visit_date,
    TIMESTAMPDIFF(MONTH, t.DaArt, :EndDate) AS months_on_art,
    'Active' AS Status,
    NULL AS exit_date
FROM tx_curr_current t
JOIN tblaimain main ON main.ClinicID = t.ClinicID
LEFT JOIN tblaart art ON main.ClinicID = art.ClinicID AND art.DaArt = t.DaArt
WHERE t.typepatients = '15+'

UNION ALL

SELECT
    main.ClinicID AS clinicid,
    art.ART AS art_number,
    t.Sex AS sex,
    CASE WHEN t.Sex = 'Female' THEN 'Female' ELSE 'Male' END AS sex_display,
    CASE WHEN t.typepatients = '≤14' THEN 'Child' ELSE 'Adult' END AS patient_type,
    TIMESTAMPDIFF(YEAR, t.DaBirth, :EndDate) AS age,
    t.DafirstVisit AS DafirstVisit,
    t.DaArt AS art_start_date,
    t.LastVisitDate AS last_visit_date,
    TIMESTAMPDIFF(MONTH, t.DaArt, :EndDate) AS months_on_art,
    'Active' AS Status,
    NULL AS exit_date
FROM tx_curr_current t
JOIN tblcimain main ON main.ClinicID = t.ClinicID
LEFT JOIN tblcart art ON main.ClinicID = art.ClinicID AND art.DaArt = t.DaArt
WHERE t.typepatients = '≤14'

ORDER BY last_visit_date DESC, clinicid;

