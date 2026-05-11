-- ===================================================================
-- Indicator 10b detail: Percentage of ART patients using TLD as 1st line regimen (cumulative)
-- Returns patient-level records for all active ART patients with their TLD status
-- ===================================================================

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
            TIMESTAMPDIFF(YEAR, DaBirth, :EndDate) AS age,
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
            TIMESTAMPDIFF(YEAR, DaBirth, :EndDate) AS age,
            Sex,
            DaTest AS DaHIV,
            OffIn 
        FROM tblcimain 
        WHERE DafirstVisit <= :EndDate
    ),
    
    tblart AS (
        SELECT 
            *,
            TIMESTAMPDIFF(MONTH, DaArt, :EndDate) AS nmonthART 
        FROM tblaart 
        WHERE DaArt <= :EndDate
        
        UNION ALL 
        
        SELECT 
            *,
            TIMESTAMPDIFF(MONTH, DaArt, :EndDate) AS nmonthART 
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
    
    tblarvdrug AS ( 
        WITH tbldrug AS (
            SELECT 
                vid,
                GROUP_CONCAT(DISTINCT DrugName ORDER BY DrugName ASC SEPARATOR '+') AS drugname 
            FROM tblavarvdrug 
            WHERE status <> 1
            GROUP BY vid 
            
            UNION ALL 
            
            SELECT 
                vid,
                GROUP_CONCAT(DISTINCT DrugName ORDER BY DrugName ASC SEPARATOR '+') AS drugname 
            FROM tblcvarvdrug 
            WHERE status <> 1
            GROUP BY vid
        )
        SELECT 
            vid,
            drugname,
            IF(LOCATE('3TC+DTG+TDF', drugname) > 0, "TLD", "Not-TLD") AS TLDStatus 
        FROM tbldrug
    )

    SELECT DISTINCT
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
        v.DaApp,
        a.nmonthART,
        IF(a.nmonthART >= 6, ">6M", "<6M") AS Startartstatus,
        DATEDIFF(v.DaApp, v.DatVisit) AS ndays,
        IF(DATEDIFF(v.DaApp, v.DatVisit) > 80, "MMD", "Not-MMD") AS MMDStatus,
        rd.drugname,
        IF(LEFT(i.clinicid, 1) = "P" AND rd.TLDStatus != "TLD" AND LOCATE('DTG', rd.drugname) > 0, "TLD", rd.TLDStatus) AS TLDStatus
    FROM tblvisit v
    LEFT JOIN tblimain i ON i.clinicid = v.clinicid
    LEFT JOIN tblart a ON a.clinicid = v.clinicid
    LEFT JOIN tblexit e ON v.clinicid = e.clinicid
    LEFT JOIN tblarvdrug rd ON rd.vid = v.vid
    WHERE id = 1 AND e.status IS NULL AND a.ART IS NOT NULL
)

SELECT
    main.ClinicID AS clinicid,
    ta.ART AS art_number,
    main.Sex AS sex,
    CASE WHEN main.Sex = 0 THEN 'Female' ELSE 'Male' END AS sex_display,
    CASE WHEN ta.typepatients = '≤14' THEN 'Child' ELSE 'Adult' END AS patient_type,
    ta.age AS age,
    main.DafirstVisit AS DafirstVisit,
    ta.DaArt AS art_start_date,
    ta.DaArt AS DaArt,
    ta.nmonthART AS months_on_art,
    ta.DatVisit AS visit_date,
    ta.drugname AS drug_name,
    ta.TLDStatus AS tld_status
FROM tblactive ta
JOIN tblaimain main ON main.ClinicID = ta.clinicid
WHERE ta.typepatients = '15+'

UNION ALL

SELECT
    main.ClinicID AS clinicid,
    ta.ART AS art_number,
    main.Sex AS sex,
    CASE WHEN main.Sex = 0 THEN 'Female' ELSE 'Male' END AS sex_display,
    CASE WHEN ta.typepatients = '≤14' THEN 'Child' ELSE 'Adult' END AS patient_type,
    ta.age AS age,
    main.DafirstVisit AS DafirstVisit,
    ta.DaArt AS art_start_date,
    ta.DaArt AS DaArt,
    ta.nmonthART AS months_on_art,
    ta.DatVisit AS visit_date,
    ta.drugname AS drug_name,
    ta.TLDStatus AS tld_status
FROM tblactive ta
JOIN tblcimain main ON main.ClinicID = ta.clinicid
WHERE ta.typepatients = '≤14'

ORDER BY visit_date DESC, clinicid;

