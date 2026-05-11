-- 01_active_art_previous - Detailed Records (matching corrected aggregate logic)
-- This uses the exact same CTE structure and logic as the corrected aggregate query
WITH tblactive AS (
    WITH tblvisit AS (
        SELECT 
            clinicid,
            DatVisit,
            ARTnum,
            DaApp,
            vid,
            ROW_NUMBER() OVER (PARTITION BY clinicid ORDER BY DatVisit DESC) AS id 
        FROM tblavmain 
        WHERE DatVisit <= :PreviousEndDate
        
        UNION ALL 
        
        SELECT 
            clinicid,
            DatVisit,
            ARTnum,
            DaApp,
            vid,
            ROW_NUMBER() OVER (PARTITION BY clinicid ORDER BY DatVisit DESC) AS id 
        FROM tblcvmain 
        WHERE DatVisit <= :PreviousEndDate
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
            TIMESTAMPDIFF(year, DaBirth, :PreviousEndDate) AS age,
            Sex,
            DaHIV,
            OffIn
        FROM tblaimain 
        WHERE DafirstVisit <= :PreviousEndDate
        
        UNION ALL 
        
        SELECT 
            ClinicID,
            DafirstVisit,
            "≤14" AS typepatients,
            '' AS TypeofReturn,
            LClinicID,
            SiteNameold,
            DaBirth,
            TIMESTAMPDIFF(year, DaBirth, :PreviousEndDate) AS age,
            Sex,
            DaTest AS DaHIV,
            OffIn
        FROM tblcimain 
        WHERE DafirstVisit <= :PreviousEndDate
    ),
    
    tblart AS (
        SELECT 
            *,
            TIMESTAMPDIFF(month, DaArt, :PreviousEndDate) AS nmonthART 
        FROM tblaart 
        WHERE DaArt <= :PreviousEndDate 
        
        UNION ALL 
        
        SELECT 
            *,
            TIMESTAMPDIFF(month, DaArt, :PreviousEndDate) AS nmonthART 
        FROM tblcart 
        WHERE DaArt <= :PreviousEndDate
    ),
    
    tblexit AS (
        SELECT * 
        FROM tblavpatientstatus 
        WHERE da <= :PreviousEndDate  
        
        UNION ALL 
        
        SELECT * 
        FROM tblcvpatientstatus  
        WHERE da <= :PreviousEndDate
    )

    SELECT 
        i.clinicid, 
        i.DafirstVisit,
        i.typepatients, 
        i.TypeofReturn, 
        i.LClinicID, 
        i.SiteNameold, 
        i.DaBirth,
        i.age, 
        i.Sex, 
        i.DaHIV, 
        i.OffIn,
        a.ART, 
        a.DaArt,
        a.nmonthART,
        v.DatVisit, 
        v.ARTnum, 
        v.DaApp
    FROM tblvisit v
    LEFT JOIN tblimain i ON i.clinicid = v.clinicid
    LEFT JOIN tblart a ON a.clinicid = v.clinicid
    LEFT JOIN tblexit e ON v.clinicid = e.clinicid
    WHERE id = 1 AND e.status IS NULL AND a.ART IS NOT NULL
)


SELECT
    ClinicID as clinicid,
    Sex as sex,
    CASE 
        WHEN Sex = 0 THEN 'Female'
        WHEN Sex = 1 THEN 'Male'
        ELSE 'Unknown'
    END as sex_display,
    typepatients,
    age,
    CASE 
        WHEN typepatients = '15+' THEN 'Adult'
        WHEN typepatients = '≤14' THEN 'Child'
        ELSE 'Unknown'
    END as patient_type,
    ART,
    DaArt,
    DafirstVisit,
    DaBirth,
    OffIn,
    CASE 
        WHEN OffIn = 0 THEN 'Not Transferred'
        WHEN OffIn = 1 THEN 'Transferred In'
        WHEN OffIn = 3 THEN 'Transferred Out'
        ELSE CONCAT('Status: ', OffIn)
    END as transfer_status,
    IF(nmonthART >= 6, '>6M', '<6M') as Startartstatus
FROM tblactive
ORDER BY DaArt DESC, ClinicID;