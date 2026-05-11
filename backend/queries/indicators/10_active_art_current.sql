-- Indicator 10: Number of active ART patients in this quarter
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
),

tblactive AS (
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
        v.DatVisit, 
        v.ARTnum, 
        v.DaApp
    FROM tblvisit v
    LEFT JOIN tblimain i ON i.clinicid = v.clinicid
    LEFT JOIN tblart a ON a.clinicid = v.clinicid
    LEFT JOIN tblexit e ON v.clinicid = e.clinicid
    WHERE v.id = 1 AND e.status IS NULL AND a.ART IS NOT NULL
)

SELECT 
    '10. Active ART patients in this quarter' AS Indicator,
    IFNULL(COUNT(*), 0) AS TOTAL,
    IFNULL(SUM(CASE WHEN typepatients = '≤14' AND Sex = 1 THEN 1 ELSE 0 END), 0) AS Male_0_14,
    IFNULL(SUM(CASE WHEN typepatients = '≤14' AND Sex = 0 THEN 1 ELSE 0 END), 0) AS Female_0_14,
    IFNULL(SUM(CASE WHEN typepatients = '15+' AND Sex = 1 THEN 1 ELSE 0 END), 0) AS Male_over_14,
    IFNULL(SUM(CASE WHEN typepatients = '15+' AND Sex = 0 THEN 1 ELSE 0 END), 0) AS Female_over_14
FROM tblactive;
