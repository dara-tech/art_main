-- =====================================================
-- 01 ACTIVE ART PREVIOUS DETAILS
-- Indicator 1: Active ART patients in previous quarter - Detailed Records
-- Exact match with VB.NET RTNational reporting engine
-- Safe for single-site and country-level (warehouse) execution
-- =====================================================
WITH tblaimain_prev AS (
    SELECT site_code, ClinicID, Sex, DafirstVisit, DaBirth, OffIn 
    FROM tblaimain 
    WHERE DafirstVisit <= :PreviousEndDate
),
tblaart_prev AS (
    SELECT site_code, ClinicID, MIN(ART) AS ART, MIN(DaArt) AS DaArt, TIMESTAMPDIFF(month, MIN(DaArt), :PreviousEndDate) AS nmonthART 
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
    SELECT 
        ai.site_code, ai.ClinicID as clinicid, ai.Sex as sex, '15+' AS typepatients,
        TIMESTAMPDIFF(year, ai.DaBirth, :PreviousEndDate) AS age, 'Adult' AS patient_type,
        ar.ART, ar.DaArt, ai.DafirstVisit, ai.DaBirth, ai.OffIn, ar.nmonthART
    FROM tblaimain_prev ai
    INNER JOIN tblaart_prev ar ON (ai.site_code = ar.site_code OR ai.site_code IS NULL OR ar.site_code IS NULL) AND ai.ClinicID = ar.ClinicID
    LEFT JOIN tblavstatus_prev st ON (ai.site_code = st.site_code OR ai.site_code IS NULL OR st.site_code IS NULL) AND ai.ClinicID = st.ClinicID
    WHERE st.Status IS NULL
),
tblcimain_prev AS (
    SELECT site_code, ClinicID, Sex, DafirstVisit, DaBirth, OffIn 
    FROM tblcimain 
    WHERE DafirstVisit <= :PreviousEndDate
),
tblcart_prev AS (
    SELECT site_code, ClinicID, MIN(ART) AS ART, MIN(DaArt) AS DaArt, TIMESTAMPDIFF(month, MIN(DaArt), :PreviousEndDate) AS nmonthART 
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
    SELECT 
        ci.site_code, ci.ClinicID as clinicid, ci.Sex as sex, '≤14' AS typepatients,
        TIMESTAMPDIFF(year, ci.DaBirth, :PreviousEndDate) AS age, 'Child' AS patient_type,
        cr.ART, cr.DaArt, ci.DafirstVisit, ci.DaBirth, ci.OffIn, cr.nmonthART
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
    clinicid,
    sex,
    CASE 
        WHEN sex = 0 THEN 'Female'
        WHEN sex = 1 THEN 'Male'
        ELSE 'Unknown'
    END as sex_display,
    typepatients,
    age,
    patient_type,
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
FROM all_active
ORDER BY DaArt DESC, clinicid;
