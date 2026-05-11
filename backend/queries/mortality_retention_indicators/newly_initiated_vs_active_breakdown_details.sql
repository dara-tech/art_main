-- ===================================================================
-- Diagnostic Query: Patient-level detail with Status
-- Shows each newly initiated patient with their status (Active, Dead, Lost, Transfer Out)
-- ===================================================================

WITH newly_initiated_patients AS (
    -- All newly initiated patients (same definition as 10a, 6a+6b+6c)
    -- Adults: Same-day initiation (0 day)
    SELECT DISTINCT
        'Adult' as type,
        IF(p.Sex=0, "Female", "Male") as Sex,
        p.ClinicID,
        art.DaArt as ARTStartDate,
        p.DaBirth,
        p.DafirstVisit
    FROM tblaimain p 
    JOIN tblaart art ON p.ClinicID = art.ClinicID
    WHERE 
        art.DaArt BETWEEN :StartDate AND :EndDate
        AND DATEDIFF(art.DaArt, p.DafirstVisit) = 0
        AND (p.OffIn IS NULL OR p.OffIn <> :transfer_in_code)
        AND (p.TypeofReturn IS NULL OR p.TypeofReturn = -1)
    
    UNION
    
    -- Adults: Initiation 1-7 days
    SELECT DISTINCT
        'Adult' as type,
        IF(p.Sex=0, "Female", "Male") as Sex,
        p.ClinicID,
        art.DaArt as ARTStartDate,
        p.DaBirth,
        p.DafirstVisit
    FROM tblaimain p 
    JOIN tblaart art ON p.ClinicID = art.ClinicID
    WHERE 
        art.DaArt BETWEEN :StartDate AND :EndDate
        AND DATEDIFF(art.DaArt, p.DafirstVisit) BETWEEN 1 AND 7
        AND (p.TypeofReturn IS NULL OR p.TypeofReturn = -1)
    
    UNION
    
    -- Adults: Initiation >7 days
    SELECT DISTINCT
        'Adult' as type,
        IF(p.Sex=0, "Female", "Male") as Sex,
        p.ClinicID,
        art.DaArt as ARTStartDate,
        p.DaBirth,
        p.DafirstVisit
    FROM tblaimain p 
    JOIN tblaart art ON p.ClinicID = art.ClinicID
    WHERE 
        art.DaArt BETWEEN :StartDate AND :EndDate
        AND DATEDIFF(art.DaArt, p.DafirstVisit) > 7
        AND (p.OffIn IS NULL OR p.OffIn <> :transfer_in_code)
        AND (p.TypeofReturn IS NULL OR p.TypeofReturn = -1)
    
    UNION
    
    -- Children: All initiation days
    SELECT DISTINCT
        'Child' as type,
        IF(p.Sex=0, "Female", "Male") as Sex,
        p.ClinicID,
        art.DaArt as ARTStartDate,
        p.DaBirth,
        p.DafirstVisit
    FROM tblcimain p 
    JOIN tblcart art ON p.ClinicID = art.ClinicID
    WHERE 
        art.DaArt BETWEEN :StartDate AND :EndDate
),

active_patients AS (
    -- Active ART patients at EndDate
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

-- Patient-level detail with status
SELECT
    nip.ClinicID AS clinicid,
    nip.ClinicID AS art_number,
    nip.Sex AS sex,
    CASE WHEN nip.Sex = 'Female' THEN 'Female' ELSE 'Male' END AS sex_display,
    nip.type AS patient_type,
    TIMESTAMPDIFF(YEAR, nip.DaBirth, :EndDate) AS age,
    nip.DafirstVisit AS DafirstVisit,
    nip.ARTStartDate AS art_start_date,
    nip.ARTStartDate AS DaArt,
    CASE 
        WHEN ap.clinicid IS NOT NULL THEN 'Active'
        WHEN pes.status = :dead_code THEN 'Dead'
        WHEN pes.status = :transfer_out_code THEN 'Transfer Out'
        WHEN pes.status = :lost_code THEN 'Lost to Follow-up'
        ELSE 'Unknown'
    END AS Status,
    pes.exit_date AS exit_date,
    pes.status AS exit_status_code
FROM newly_initiated_patients nip
LEFT JOIN active_patients ap ON nip.ClinicID = ap.clinicid
    AND nip.type = ap.type
    AND nip.Sex = ap.Sex
LEFT JOIN patient_exit_status pes ON nip.ClinicID = pes.clinicid
ORDER BY 
    CASE 
        WHEN ap.clinicid IS NOT NULL THEN 1
        WHEN pes.status = :dead_code THEN 2
        WHEN pes.status = :transfer_out_code THEN 3
        WHEN pes.status = :lost_code THEN 4
        ELSE 5
    END,
    nip.ClinicID;

