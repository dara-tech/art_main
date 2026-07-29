-- =====================================================
-- 01 ACTIVE ART PREVIOUS
-- Indicator 1: Number of active ART patients in previous quarter
-- Exact match with VB.NET RTNational reporting engine
-- Safe for single-site and country-level (warehouse) execution
-- =====================================================
WITH tblaimain_prev AS (
    SELECT site_code, ClinicID, Sex, DafirstVisit, OffIn 
    FROM tblaimain 
    WHERE DafirstVisit <= :PreviousEndDate
),
tblaart_prev AS (
    SELECT site_code, ClinicID, MIN(ART) AS ART, MIN(DaArt) AS DaArt 
    FROM tblaart 
    WHERE DaArt <= :PreviousEndDate 
    GROUP BY site_code, ClinicID
),
tblavstatus_prev AS (
    SELECT site_code, ClinicID, MAX(Status) AS Status, MAX(Da) AS Da 
    FROM tblavpatientstatus 
    WHERE da <= :PreviousEndDate 
    GROUP BY site_code, ClinicID
),
adult_active AS (
    SELECT ai.site_code, ai.ClinicID, ai.Sex, '15+' AS typepatients 
    FROM tblaimain_prev ai
    INNER JOIN tblaart_prev ar ON (ai.site_code = ar.site_code OR ai.site_code IS NULL OR ar.site_code IS NULL) AND ai.ClinicID = ar.ClinicID
    LEFT JOIN tblavstatus_prev st ON (ai.site_code = st.site_code OR ai.site_code IS NULL OR st.site_code IS NULL) AND ai.ClinicID = st.ClinicID
    WHERE st.Status IS NULL
),
tblcimain_prev AS (
    SELECT site_code, ClinicID, Sex, DafirstVisit, OffIn 
    FROM tblcimain 
    WHERE DafirstVisit <= :PreviousEndDate
),
tblcart_prev AS (
    SELECT site_code, ClinicID, MIN(ART) AS ART, MIN(DaArt) AS DaArt 
    FROM tblcart 
    WHERE DaArt <= :PreviousEndDate 
    GROUP BY site_code, ClinicID
),
tblcvstatus_prev AS (
    SELECT site_code, ClinicID, MAX(Status) AS Status, MAX(Da) AS Da 
    FROM tblcvpatientstatus 
    WHERE da <= :PreviousEndDate 
    GROUP BY site_code, ClinicID
),
child_active AS (
    SELECT ci.site_code, ci.ClinicID, ci.Sex, '≤14' AS typepatients 
    FROM tblcimain_prev ci
    INNER JOIN tblcart_prev cr ON (ci.site_code = cr.site_code OR ci.site_code IS NULL OR cr.site_code IS NULL) AND ci.ClinicID = cr.ClinicID
    LEFT JOIN tblcvstatus_prev st ON (ci.site_code = st.site_code OR ci.site_code IS NULL OR st.site_code IS NULL) AND ci.ClinicID = st.ClinicID
    WHERE st.Status IS NULL
),
all_active AS (
    SELECT * FROM adult_active
    UNION ALL
    SELECT * FROM child_active
)
SELECT 
    '1. Active ART patients in previous quarter' AS Indicator,
    IFNULL(COUNT(*), 0) AS TOTAL,
    IFNULL(SUM(CASE WHEN typepatients = '≤14' AND Sex = 1 THEN 1 ELSE 0 END), 0) AS Male_0_14,
    IFNULL(SUM(CASE WHEN typepatients = '≤14' AND Sex = 0 THEN 1 ELSE 0 END), 0) AS Female_0_14,
    IFNULL(SUM(CASE WHEN typepatients = '15+' AND Sex = 1 THEN 1 ELSE 0 END), 0) AS Male_over_14,
    IFNULL(SUM(CASE WHEN typepatients = '15+' AND Sex = 0 THEN 1 ELSE 0 END), 0) AS Female_over_14
FROM all_active;
