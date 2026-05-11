-- ===================================================================
-- Diagnostic Query: Breakdown of Newly Initiated vs Active Patients
-- This query shows why Active - Newly Initiated doesn't equal pre-existing active
-- ===================================================================

WITH newly_initiated_patients AS (
    -- All newly initiated patients (same definition as 10a, 6a+6b+6c)
    -- Adults: Same-day initiation (0 day)
    SELECT DISTINCT
        'Adult' as type,
        IF(p.Sex=0, "Female", "Male") as Sex,
        p.ClinicID,
        art.DaArt as ARTStartDate
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
        art.DaArt as ARTStartDate
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
        art.DaArt as ARTStartDate
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
        art.DaArt as ARTStartDate
    FROM tblcimain p 
    JOIN tblcart art ON p.ClinicID = art.ClinicID
    WHERE 
        art.DaArt BETWEEN :StartDate AND :EndDate
),

active_patients AS (
    -- Active ART patients at EndDate (same definition as Indicator 1, 10)
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

pre_existing_active AS (
    -- Patients who started ART BEFORE the period and are still active at EndDate
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
        SELECT DISTINCT clinicid FROM tblaart WHERE DaArt < :StartDate
        UNION
        SELECT DISTINCT clinicid FROM tblcart WHERE DaArt < :StartDate
    ) a ON a.clinicid = v.clinicid
    LEFT JOIN (
        SELECT clinicid, status FROM tblavpatientstatus WHERE da <= :EndDate
        UNION ALL
        SELECT clinicid, status FROM tblcvpatientstatus WHERE da <= :EndDate
    ) e ON v.clinicid = e.clinicid
    WHERE v.id = 1 AND e.status IS NULL AND a.clinicid IS NOT NULL
),

newly_initiated_active AS (
    -- Newly initiated patients who are STILL ACTIVE at EndDate
    SELECT DISTINCT
        nip.ClinicID,
        nip.type,
        nip.Sex
    FROM newly_initiated_patients nip
    INNER JOIN active_patients ap ON nip.ClinicID = ap.clinicid
        AND nip.type = ap.type
        AND nip.Sex = ap.Sex
),

newly_initiated_not_active AS (
    -- Newly initiated patients who are NOT active at EndDate (died/transferred/LTFU)
    SELECT DISTINCT
        nip.ClinicID,
        nip.type,
        nip.Sex
    FROM newly_initiated_patients nip
    LEFT JOIN active_patients ap ON nip.ClinicID = ap.clinicid
        AND nip.type = ap.type
        AND nip.Sex = ap.Sex
    WHERE ap.clinicid IS NULL
),

patient_status AS (
    -- Get exit status for all patients (dead, transferred, lost)
    SELECT 
        clinicid,
        status,
        da as exit_date
    FROM tblavpatientstatus 
    WHERE da <= :EndDate
    
    UNION ALL
    
    SELECT 
        clinicid,
        status,
        da as exit_date
    FROM tblcvpatientstatus 
    WHERE da <= :EndDate
),

newly_initiated_with_status AS (
    -- Newly initiated patients with their status
    SELECT 
        nip.ClinicID,
        nip.type,
        nip.Sex,
        nip.ARTStartDate,
        CASE 
            WHEN ap.clinicid IS NOT NULL THEN 'Active'
            WHEN ps.status = :dead_code THEN 'Dead'
            WHEN ps.status = :transfer_out_code THEN 'Transfer Out'
            WHEN ps.status = :lost_code THEN 'Lost to Follow-up'
            ELSE 'Unknown'
        END AS Status,
        ps.exit_date,
        ps.status AS exit_status_code
    FROM newly_initiated_patients nip
    LEFT JOIN active_patients ap ON nip.ClinicID = ap.clinicid
        AND nip.type = ap.type
        AND nip.Sex = ap.Sex
    LEFT JOIN (
        SELECT 
            clinicid,
            status,
            MAX(da) as exit_date
        FROM patient_status
        GROUP BY clinicid, status
    ) ps ON nip.ClinicID = ps.clinicid
)

-- Summary query
SELECT
    'Breakdown: Newly Initiated vs Active' AS Indicator,
    -- Total counts
    (SELECT COUNT(DISTINCT ClinicID) FROM newly_initiated_patients) AS Total_Newly_Initiated,
    (SELECT COUNT(DISTINCT clinicid) FROM active_patients) AS Total_Active_At_EndDate,
    (SELECT COUNT(DISTINCT clinicid) FROM pre_existing_active) AS Pre_Existing_Active,
    (SELECT COUNT(DISTINCT ClinicID) FROM newly_initiated_active) AS Newly_Initiated_Still_Active,
    (SELECT COUNT(DISTINCT ClinicID) FROM newly_initiated_not_active) AS Newly_Initiated_Not_Active,
    -- Status breakdown
    (SELECT COUNT(DISTINCT ClinicID) FROM newly_initiated_with_status WHERE Status = 'Active') AS Status_Active,
    (SELECT COUNT(DISTINCT ClinicID) FROM newly_initiated_with_status WHERE Status = 'Dead') AS Status_Dead,
    (SELECT COUNT(DISTINCT ClinicID) FROM newly_initiated_with_status WHERE Status = 'Transfer Out') AS Status_Transfer_Out,
    (SELECT COUNT(DISTINCT ClinicID) FROM newly_initiated_with_status WHERE Status = 'Lost to Follow-up') AS Status_Lost,
    -- Calculation check
    (SELECT COUNT(DISTINCT clinicid) FROM active_patients) - 
    (SELECT COUNT(DISTINCT ClinicID) FROM newly_initiated_active) AS Active_Minus_Newly_Initiated_Active,
    (SELECT COUNT(DISTINCT clinicid) FROM pre_existing_active) AS Should_Equal_Pre_Existing,
    -- Difference explanation
    (SELECT COUNT(DISTINCT ClinicID) FROM newly_initiated_not_active) AS Difference_Explanation_Newly_Initiated_Who_Exited,
    -- Formula explanation
    CONCAT(
        'Active (', (SELECT COUNT(DISTINCT clinicid) FROM active_patients), 
        ') = Pre-existing (', (SELECT COUNT(DISTINCT clinicid) FROM pre_existing_active),
        ') + Newly initiated still active (', (SELECT COUNT(DISTINCT ClinicID) FROM newly_initiated_active),
        ') - NOT (Newly initiated who exited: ', (SELECT COUNT(DISTINCT ClinicID) FROM newly_initiated_not_active), ')'
    ) AS Formula_Explanation

UNION ALL

-- Detail query: Patient-level with status
SELECT
    'Patient Detail' AS Indicator,
    NULL AS Total_Newly_Initiated,
    NULL AS Total_Active_At_EndDate,
    NULL AS Pre_Existing_Active,
    NULL AS Newly_Initiated_Still_Active,
    NULL AS Newly_Initiated_Not_Active,
    NULL AS Status_Active,
    NULL AS Status_Dead,
    NULL AS Status_Transfer_Out,
    NULL AS Status_Lost,
    NULL AS Active_Minus_Newly_Initiated_Active,
    NULL AS Should_Equal_Pre_Existing,
    NULL AS Difference_Explanation_Newly_Initiated_Who_Exited,
    CONCAT('ClinicID: ', nis.ClinicID, ', Type: ', nis.type, ', Sex: ', nis.Sex, ', ART Start: ', nis.ARTStartDate, ', Status: ', nis.Status) AS Formula_Explanation
FROM newly_initiated_with_status nis
ORDER BY nis.Status, nis.ClinicID;

