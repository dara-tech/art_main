-- Indicator 11.5.1: Active ART patients who started ART >= 6 months ago - Detailed Records
WITH tblvisit AS (
    SELECT 
        site_code,
        clinicid,
        DatVisit,
        ARTnum,
        DaApp,
        vid,
        ROW_NUMBER() OVER (PARTITION BY site_code, clinicid ORDER BY DatVisit DESC) AS id 
    FROM tblavmain 
    WHERE DatVisit <= :EndDate
    
    UNION ALL 
    
    SELECT 
        site_code,
        clinicid,
        DatVisit,
        ARTnum,
        DaApp,
        vid,
        ROW_NUMBER() OVER (PARTITION BY site_code, clinicid ORDER BY DatVisit DESC) AS id 
    FROM tblcvmain 
    WHERE DatVisit <= :EndDate
),

tblimain AS (
    SELECT 
        site_code,
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
        site_code,
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
        site_code,
        ClinicID,
        ART,
        DaArt,
        TIMESTAMPDIFF(month, DaArt, :EndDate) AS nmonthART 
    FROM tblaart 
    WHERE DaArt <= :EndDate
    
    UNION ALL 
    
    SELECT 
        site_code,
        ClinicID,
        ART,
        DaArt,
        TIMESTAMPDIFF(month, DaArt, :EndDate) AS nmonthART 
    FROM tblcart 
    WHERE DaArt <= :EndDate
),

tblexit AS (
    SELECT site_code, clinicid, status, da
    FROM tblavpatientstatus 
    WHERE da <= :EndDate
    
    UNION ALL 
    
    SELECT site_code, clinicid, status, da
    FROM tblcvpatientstatus  
    WHERE da <= :EndDate
)

SELECT
    '11.5.1' as step,
    v.site_code as site_code,
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
LEFT JOIN tblimain i ON i.clinicid = v.clinicid AND i.site_code = v.site_code
LEFT JOIN tblart a ON a.clinicid = v.clinicid AND a.site_code = v.site_code
LEFT JOIN tblexit e ON e.clinicid = v.clinicid AND e.site_code = v.site_code
WHERE v.id = 1 AND e.status IS NULL AND a.ART IS NOT NULL AND a.nmonthART >= 6
ORDER BY v.DatVisit DESC, i.clinicid;