-- =====================================================
-- 02 ACTIVE PRE ART PREVIOUS DETAILS
-- Indicator 2: Active Pre-ART patients in previous quarter - Detailed Records
-- Safe for single-site and country-level (warehouse) execution
-- =====================================================
WITH tblimain AS (
    SELECT site_code, ClinicID, DafirstVisit, "15+" AS typepatients, TypeofReturn, LClinicID, 
           SiteNameold, DaBirth, TIMESTAMPDIFF(year, DaBirth, :PreviousEndDate) AS age, 
           Sex, DaHIV, OffIn 
    FROM tblaimain 
    WHERE DafirstVisit <= :PreviousEndDate
    UNION ALL 
    SELECT site_code, ClinicID, DafirstVisit, "≤14" AS typepatients, '' AS TypeofReturn, 
           LClinicID, SiteNameold, DaBirth, TIMESTAMPDIFF(year, DaBirth, :PreviousEndDate) AS age, 
           Sex, DaTest AS DaHIV, OffIn 
    FROM tblcimain 
    WHERE DafirstVisit <= :PreviousEndDate
),

tblart AS (
    SELECT site_code, ClinicID, ART, DaArt, TIMESTAMPDIFF(month, DaArt, :PreviousEndDate) AS nmonthART 
    FROM tblaart 
    WHERE DaArt <= :PreviousEndDate 
    UNION ALL 
    SELECT site_code, ClinicID, ART, DaArt, TIMESTAMPDIFF(month, DaArt, :PreviousEndDate) AS nmonthART 
    FROM tblcart 
    WHERE DaArt <= :PreviousEndDate
),

tblexit AS (
    SELECT site_code, ClinicID, Status, Da 
    FROM tblavpatientstatus 
    WHERE da <= :PreviousEndDate  
    UNION ALL 
    SELECT site_code, ClinicID, Status, Da 
    FROM tblcvpatientstatus  
    WHERE da <= :PreviousEndDate
),

tblvisit AS (
    SELECT site_code, clinicid, DatVisit, ARTnum, DaApp, vid, 
           ROW_NUMBER() OVER (PARTITION BY site_code, clinicid ORDER BY DatVisit DESC) AS id 
    FROM tblavmain 
    WHERE DatVisit <= :PreviousEndDate
    UNION ALL 
    SELECT site_code, clinicid, DatVisit, ARTnum, DaApp, vid, 
           ROW_NUMBER() OVER (PARTITION BY site_code, clinicid ORDER BY DatVisit DESC) AS id 
    FROM tblcvmain 
    WHERE DatVisit <= :PreviousEndDate
),

tblactive AS (
    SELECT i.site_code, i.clinicid, i.DafirstVisit, i.typepatients, i.TypeofReturn, i.LClinicID, 
           i.SiteNameold, i.DaBirth, i.age, i.Sex, i.DaHIV, i.OffIn, 
           a.ART, a.DaArt, v.DatVisit, v.ARTnum, v.DaApp, a.nmonthART
    FROM tblimain i
    LEFT JOIN tblart a 
        ON (i.site_code = a.site_code OR i.site_code IS NULL OR a.site_code IS NULL) 
       AND i.clinicid = a.clinicid
    LEFT JOIN tblexit e 
        ON (i.site_code = e.site_code OR i.site_code IS NULL OR e.site_code IS NULL) 
       AND i.clinicid = e.clinicid
    LEFT JOIN tblvisit v 
        ON (i.site_code = v.site_code OR i.site_code IS NULL OR v.site_code IS NULL) 
       AND i.clinicid = v.clinicid 
       AND v.id = 1
    WHERE e.status IS NULL AND i.OffIn <> 1
)

SELECT 
    clinicid,
    sex,
    CASE 
        WHEN sex = 0 THEN 'Female'
        WHEN sex = 1 THEN 'Male'
        ELSE 'Unknown'
    END AS sex_display,
    typepatients,
    DaBirth,
    DafirstVisit,
    DaArt,
    DatVisit,
    OffIn,
    CASE 
        WHEN typepatients = '≤14' THEN 'Child'
        WHEN typepatients = '15+' THEN 'Adult'
        ELSE 'Unknown'
    END AS patient_type,
    age,
    CASE 
        WHEN OffIn = 0 THEN 'Not Transferred'
        WHEN OffIn = 1 THEN 'Transferred In'
        WHEN OffIn = 3 THEN 'Transferred Out'
        ELSE CONCAT('Status: ', OffIn)
    END AS transfer_status
FROM tblactive
WHERE ART IS NULL
ORDER BY DafirstVisit DESC, clinicid;
