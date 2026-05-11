-- ===================================================================
-- Indicator 10b: Percentage of ART patients using TLD as 1st line regimen (cumulative)
-- Follows the same structure as 10.3_tld.sql
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
        v.DaApp,
        a.nmonthART,
        IF(a.nmonthART >= 6, ">6M", "<6M") AS Startartstatus,
        DATEDIFF(v.DaApp, v.DatVisit) AS ndays,
        IF(DATEDIFF(v.DaApp, v.DatVisit) > 80, "MMD", "Not-MMD") AS MMDStatus,
        rd.drugname,
        IF(LEFT(i.clinicid, 1) = "P" AND rd.TLDStatus != "TLD" AND LOCATE('DTG', drugname) > 0, "TLD", rd.TLDStatus) AS TLDStatus
    FROM tblvisit v
    LEFT JOIN tblimain i ON i.clinicid = v.clinicid
    LEFT JOIN tblart a ON a.clinicid = v.clinicid
    LEFT JOIN tblexit e ON v.clinicid = e.clinicid
    LEFT JOIN tblarvdrug rd ON rd.vid = v.vid
    WHERE id = 1 AND e.status IS NULL AND a.ART IS NOT NULL
)

SELECT
    '10b. Percentage of ART patients using TLD as 1st line regimen (cumulative)' AS Indicator,
    CAST(COUNT(DISTINCT CASE WHEN TLDStatus = 'TLD' THEN clinicid END) AS UNSIGNED) AS TLD_Cumulative,
    CAST(COUNT(DISTINCT CASE WHEN TLDStatus = 'TLD' THEN clinicid END) AS UNSIGNED) AS TOTAL,
    CAST(COUNT(DISTINCT clinicid) AS UNSIGNED) AS Total_ART_Patients,
    CAST(CASE 
        WHEN COUNT(DISTINCT clinicid) > 0 
        THEN ROUND((COUNT(DISTINCT CASE WHEN TLDStatus = 'TLD' THEN clinicid END) * 100.0 / COUNT(DISTINCT clinicid)), 2)
        ELSE 0.00 
    END AS DECIMAL(5,2)) AS Percentage,
    -- Numerators: patients with TLD
    CAST(COUNT(DISTINCT CASE WHEN Sex = 1 AND typepatients = '≤14' AND TLDStatus = 'TLD' THEN clinicid END) AS UNSIGNED) AS Male_0_14,
    CAST(COUNT(DISTINCT CASE WHEN Sex = 1 AND typepatients = '≤14' AND TLDStatus = 'TLD' THEN clinicid END) AS UNSIGNED) AS Male_0_14_TLD,
    CAST(COUNT(DISTINCT CASE WHEN Sex = 0 AND typepatients = '≤14' AND TLDStatus = 'TLD' THEN clinicid END) AS UNSIGNED) AS Female_0_14,
    CAST(COUNT(DISTINCT CASE WHEN Sex = 0 AND typepatients = '≤14' AND TLDStatus = 'TLD' THEN clinicid END) AS UNSIGNED) AS Female_0_14_TLD,
    CAST(COUNT(DISTINCT CASE WHEN Sex = 1 AND typepatients = '15+' AND TLDStatus = 'TLD' THEN clinicid END) AS UNSIGNED) AS Male_over_14,
    CAST(COUNT(DISTINCT CASE WHEN Sex = 1 AND typepatients = '15+' AND TLDStatus = 'TLD' THEN clinicid END) AS UNSIGNED) AS Male_over_14_TLD,
    CAST(COUNT(DISTINCT CASE WHEN Sex = 0 AND typepatients = '15+' AND TLDStatus = 'TLD' THEN clinicid END) AS UNSIGNED) AS Female_over_14,
    CAST(COUNT(DISTINCT CASE WHEN Sex = 0 AND typepatients = '15+' AND TLDStatus = 'TLD' THEN clinicid END) AS UNSIGNED) AS Female_over_14_TLD,
    -- Denominators: total ART patients by demographic
    CAST(COUNT(DISTINCT CASE WHEN Sex = 1 AND typepatients = '≤14' THEN clinicid END) AS UNSIGNED) AS Male_0_14_Total,
    CAST(COUNT(DISTINCT CASE WHEN Sex = 0 AND typepatients = '≤14' THEN clinicid END) AS UNSIGNED) AS Female_0_14_Total,
    CAST(COUNT(DISTINCT CASE WHEN Sex = 1 AND typepatients = '15+' THEN clinicid END) AS UNSIGNED) AS Male_over_14_Total,
    CAST(COUNT(DISTINCT CASE WHEN Sex = 0 AND typepatients = '15+' THEN clinicid END) AS UNSIGNED) AS Female_over_14_Total,
    -- Aggregated totals for easier frontend access
    CAST(COUNT(DISTINCT CASE WHEN typepatients = '≤14' THEN clinicid END) AS UNSIGNED) AS Children_Total,
    CAST(COUNT(DISTINCT CASE WHEN typepatients = '15+' THEN clinicid END) AS UNSIGNED) AS Adults_Total
FROM tblactive
WHERE ART IS NOT NULL;
