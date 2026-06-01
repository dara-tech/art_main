-- Indicator 10: Active ART patients in this quarter - Detailed Records
-- This replicates the exact same CTE structure and logic as the aggregate query
WITH tblvisit AS (
    SELECT 
        clinicid,
        DatVisit,
        ARTnum,
        DaApp,
        vid,
        ROW_NUMBER() OVER (PARTITION BY clinicid ORDER BY DatVisit DESC) AS id 
    FROM tblavmain 
    WHERE DatVisit <= :EndDate
    
    UNION ALL 
    
    SELECT 
        clinicid,
        DatVisit,
        ARTnum,
        DaApp,
        vid,
        ROW_NUMBER() OVER (PARTITION BY clinicid ORDER BY DatVisit DESC) AS id 
    FROM tblcvmain 
    WHERE DatVisit <= :EndDate
),

tblimain AS (
    SELECT 
        ClinicID,
        DafirstVisit,
        "15+" AS typepatients,
        TypeofReturn,
        LClinicID,
        SiteNameold,
        DaBirth,
        TIMESTAMPDIFF(year, DaBirth, :EndDate) AS age,
        Sex,
        DaHIV,
        OffIn 
    FROM tblaimain 
    WHERE DafirstVisit <= :EndDate
    
    UNION ALL 
    
    SELECT 
        ClinicID,
        DafirstVisit,
        "≤14" AS typepatients,
        '' AS TypeofReturn,
        LClinicID,
        SiteNameold,
        DaBirth,
        TIMESTAMPDIFF(year, DaBirth, :EndDate) AS age,
        Sex,
        DaTest AS DaHIV,
        OffIn 
    FROM tblcimain 
    WHERE DafirstVisit <= :EndDate
),

tblart AS (
    SELECT 
        *,
        TIMESTAMPDIFF(month, DaArt, :EndDate) AS nmonthART 
    FROM tblaart 
    WHERE DaArt <= :EndDate
    
    UNION ALL 
    
    SELECT 
        *,
        TIMESTAMPDIFF(month, DaArt, :EndDate) AS nmonthART 
    FROM tblcart 
    WHERE DaArt <= :EndDate
),

tblexit AS (
    SELECT * 
    FROM tblavpatientstatus 
    WHERE da <= :EndDate
    
    UNION ALL 
    
    SELECT * 
    FROM tblcvpatientstatus  
    WHERE da <= :EndDate
)

SELECT
    '10' as step,
    i.clinicid as site_code,
    i.clinicid,
    i.Sex AS sex,
    CASE 
        WHEN i.Sex = 0 THEN 'Female'
        WHEN i.Sex = 1 THEN 'Male'
        ELSE 'Unknown'
    END AS sex_display,
    i.typepatients,
    i.DaBirth,
    i.DafirstVisit,
    a.ART,
    a.DaArt,
    a.nmonthART,
    IF(a.nmonthART >= 6, ">6M", "<6M") AS Startartstatus,
    v.DatVisit,
    v.ARTnum,
    v.DaApp,
    i.OffIn,
    CASE 
        WHEN i.typepatients = '15+' THEN 'Adult'
        WHEN i.typepatients = '≤14' THEN 'Child'
        ELSE 'Unknown'
    END AS patient_type,
    i.age,
    CASE
        WHEN i.OffIn = 0 THEN 'Not Transferred'
        WHEN i.OffIn = 2 THEN 'Transferred In'
        WHEN i.OffIn = 3 THEN 'Transferred Out'
        ELSE CONCAT('Status: ', i.OffIn)
    END AS transfer_status
FROM tblvisit v
LEFT JOIN tblimain i ON i.clinicid = v.clinicid
LEFT JOIN tblart a ON a.clinicid = v.clinicid
LEFT JOIN tblexit e ON v.clinicid = e.clinicid
WHERE v.id = 1 AND e.status IS NULL AND a.ART IS NOT NULL
ORDER BY v.DatVisit DESC, i.clinicid;
