-- ===================================================================
-- Indicator 9c detail: Percentage of ART patients with MMD 4 months
-- Returns patient-level records for patients with MMD 4 months
-- ===================================================================

WITH tblactive AS (
    -- Active ART patients (using proper Indicator 10 logic)
    SELECT DISTINCT
        i.clinicid, 
        i.typepatients, 
        IF(i.Sex=0, 'Female', 'Male') AS Sex,
        CASE WHEN i.typepatients = "≤14" THEN 'Child' ELSE 'Adult' END as type
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
        SELECT 
            ClinicID,
            "15+" AS typepatients,
            Sex,
            OffIn 
        FROM tblaimain 
        WHERE DafirstVisit <= :EndDate
        
        UNION ALL 
        
        SELECT 
            ClinicID,
            "≤14" AS typepatients,
            Sex,
            OffIn 
        FROM tblcimain 
        WHERE DafirstVisit <= :EndDate
    ) i ON i.clinicid = v.clinicid
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

active_patients AS (
    -- Get latest visit with appointment date for MMD calculation
    SELECT DISTINCT
        a.clinicid AS ClinicID,
        a.type,
        a.Sex,
        COALESCE(p.DaBirth, c.DaBirth) AS DaBirth,
        COALESCE(p.DafirstVisit, c.DafirstVisit) AS DafirstVisit,
        COALESCE(TIMESTAMPDIFF(YEAR, p.DaBirth, :EndDate), TIMESTAMPDIFF(YEAR, c.DaBirth, :EndDate)) AS age,
        v.DatVisit,
        v.DaApp,
        art.DaArt,
        TIMESTAMPDIFF(MONTH, art.DaArt, :EndDate) AS months_on_art,
        DATEDIFF(v.DaApp, v.DatVisit) AS ndays
    FROM tblactive a
    INNER JOIN (
        SELECT 
            clinicid,
            DatVisit,
            DaApp,
            ROW_NUMBER() OVER (PARTITION BY clinicid ORDER BY DatVisit DESC) AS rn
        FROM tblavmain 
        WHERE DatVisit <= :EndDate
        
        UNION ALL 
        
        SELECT 
            clinicid,
            DatVisit,
            DaApp,
            ROW_NUMBER() OVER (PARTITION BY clinicid ORDER BY DatVisit DESC) AS rn
        FROM tblcvmain 
        WHERE DatVisit <= :EndDate
    ) v ON v.clinicid = a.clinicid AND v.rn = 1
    LEFT JOIN (
        SELECT ClinicID, DaArt FROM tblaart WHERE DaArt <= :EndDate
        UNION ALL
        SELECT ClinicID, DaArt FROM tblcart WHERE DaArt <= :EndDate
    ) art ON art.ClinicID = a.clinicid
    LEFT JOIN tblaimain p ON p.ClinicID = a.clinicid
    LEFT JOIN tblcimain c ON c.ClinicID = a.clinicid
    WHERE art.DaArt IS NOT NULL
        AND TIMESTAMPDIFF(MONTH, art.DaArt, :EndDate) >= 6
        AND v.DatVisit IS NOT NULL
        AND v.DatVisit <> '0000-00-00'
        AND v.DaApp IS NOT NULL
        AND v.DaApp <> '0000-00-00'
        AND DATEDIFF(v.DaApp, v.DatVisit) BETWEEN 101 AND 130
)

SELECT
    main.ClinicID AS clinicid,
    art.ART AS art_number,
    main.Sex AS sex,
    CASE WHEN main.Sex = 0 THEN 'Female' ELSE 'Male' END AS sex_display,
    ap.type AS patient_type,
    ap.age AS age,
    main.DafirstVisit AS DafirstVisit,
    ap.DaArt AS art_start_date,
    ap.months_on_art AS months_on_art,
    ap.DatVisit AS visit_date,
    ap.DaApp AS appointment_date,
    ap.ndays AS days_difference,
    'MMD 4 months' AS mmd_status
FROM active_patients ap
JOIN tblaimain main ON main.ClinicID = ap.ClinicID
LEFT JOIN tblaart art ON main.ClinicID = art.ClinicID AND art.DaArt = ap.DaArt
WHERE ap.type = 'Adult'

UNION ALL

SELECT
    main.ClinicID AS clinicid,
    art.ART AS art_number,
    main.Sex AS sex,
    CASE WHEN main.Sex = 0 THEN 'Female' ELSE 'Male' END AS sex_display,
    ap.type AS patient_type,
    ap.age AS age,
    main.DafirstVisit AS DafirstVisit,
    ap.DaArt AS art_start_date,
    ap.months_on_art AS months_on_art,
    ap.DatVisit AS visit_date,
    ap.DaApp AS appointment_date,
    ap.ndays AS days_difference,
    'MMD 4 months' AS mmd_status
FROM active_patients ap
JOIN tblcimain main ON main.ClinicID = ap.ClinicID
LEFT JOIN tblcart art ON main.ClinicID = art.ClinicID AND art.DaArt = ap.DaArt
WHERE ap.type = 'Child'

ORDER BY visit_date DESC, clinicid;

