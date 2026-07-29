-- =====================================================
-- 02 ACTIVE PRE ART PREVIOUS
-- Indicator 2: Active Pre-ART patients in previous quarter
-- Deduplicated per patient (GROUP BY site_code, ClinicID)
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
    SELECT site_code, ClinicID, MIN(ART) AS ART, MIN(DaArt) AS DaArt 
    FROM (
        SELECT site_code, ClinicID, ART, DaArt FROM tblaart WHERE DaArt <= :PreviousEndDate
        UNION ALL
        SELECT site_code, ClinicID, ART, DaArt FROM tblcart WHERE DaArt <= :PreviousEndDate
    ) raw_art
    GROUP BY site_code, ClinicID
),

tblexit AS (
    SELECT site_code, ClinicID, MAX(Status) AS Status, MAX(Da) AS Da 
    FROM (
        SELECT site_code, ClinicID, Status, Da FROM tblavpatientstatus WHERE da <= :PreviousEndDate
        UNION ALL
        SELECT site_code, ClinicID, Status, Da FROM tblcvpatientstatus WHERE da <= :PreviousEndDate
    ) raw_exit
    GROUP BY site_code, ClinicID
),

tblactive AS (
    SELECT i.site_code, i.clinicid, i.DafirstVisit, i.typepatients, i.TypeofReturn, i.LClinicID, 
           i.SiteNameold, i.DaBirth, i.age, i.Sex, i.DaHIV, i.OffIn, 
           a.ART, a.DaArt
    FROM tblimain i
    LEFT JOIN tblart a 
        ON (i.site_code = a.site_code OR i.site_code IS NULL OR a.site_code IS NULL) 
       AND i.clinicid = a.clinicid
    LEFT JOIN tblexit e 
        ON (i.site_code = e.site_code OR i.site_code IS NULL OR e.site_code IS NULL) 
       AND i.clinicid = e.clinicid
    WHERE e.status IS NULL AND i.OffIn <> 1
)

SELECT '2. Active Pre-ART patients in previous quarter' AS Indicator, 
       IFNULL(COUNT(*), 0) AS TOTAL,
       IFNULL(SUM(IF(typepatients = '≤14' AND sex = 1, 1, 0)), 0) AS Male_0_14,
       IFNULL(SUM(IF(typepatients = '≤14' AND sex = 0, 1, 0)), 0) AS Female_0_14,
       IFNULL(SUM(IF(typepatients = '15+' AND sex = 1, 1, 0)), 0) AS Male_over_14,
       IFNULL(SUM(IF(typepatients = '15+' AND sex = 0, 1, 0)), 0) AS Female_over_14
FROM tblactive
WHERE ART IS NULL;
