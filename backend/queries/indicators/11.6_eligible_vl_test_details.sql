-- 10.6_eligible_vl_test - Detailed Records (matching corrected aggregate logic)
WITH tblimain AS (
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
    WHERE DaART <= :EndDate
    
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
    WHERE DaART <= :EndDate
),
tblactive AS (
    SELECT 
        a.ClinicID, 
        a.ART, 
        a.DaArt, 
        lvl.Dat as LastVLDate,
        lvl.HIVLoad as LastVLLoad,
        i.typepatients,
        i.Sex,
        i.age,
        i.DaBirth,
        i.DafirstVisit,
        i.OffIn,
        TIMESTAMPDIFF(MONTH, a.daart, :EndDate) as MonthsOnART,
        TIMESTAMPDIFF(MONTH, lvl.Dat, :EndDate) as MonthsSinceLastVL,
        -- Use exact audit query logic
        IF(lvl.hivload IS NULL AND TIMESTAMPDIFF(MONTH, a.daart, :EndDate) >= 5, 'DO VL',
        IF(lvl.hivload >= 40 AND TIMESTAMPDIFF(MONTH, lvl.Dat, :EndDate) > 4, 'DO VL',
        IF(lvl.hivload < 40 AND TIMESTAMPDIFF(MONTH, lvl.Dat, :EndDate) >= 10, 'DO VL',
        IF(lvl.hivload < 40 AND TIMESTAMPDIFF(MONTH, a.DaART, lvl.Dat) >= 5 AND TIMESTAMPDIFF(MONTH, a.DaART, lvl.Dat) <= 7 AND TIMESTAMPDIFF(MONTH, lvl.Dat, :EndDate) >= 5 AND TIMESTAMPDIFF(MONTH, lvl.Dat, :EndDate) <= 7, 'DO VL',
        '')))) AS StatusVL
    FROM (SELECT DISTINCT * FROM tblaart UNION SELECT DISTINCT * FROM tblcart) a
    LEFT JOIN (
        SELECT DISTINCT * FROM tblavpatientstatus WHERE Da <= :StartDate
        UNION
        SELECT DISTINCT * FROM tblcvpatientstatus WHERE Da <= :StartDate
    ) ps ON ps.clinicid = a.clinicid
    LEFT JOIN (
        SELECT DISTINCT p.ClinicID, p.Dat, p.DaCollect, p.HIVLoad, p.HIVLog 
        FROM tblpatienttest p
        INNER JOIN (
            SELECT pt.ClinicID, MAX(pt.dat) AS dat 
            FROM (
                SELECT CAST(ClinicID AS SIGNED) AS clinicid, Dat, DaCollect, HIVLoad, HIVLog 
                FROM tblpatienttest
                WHERE hivload <> '' AND Dat < :StartDate AND clinicid NOT LIKE 'P%'
                UNION
                SELECT ClinicID, Dat, DaCollect, HIVLoad, HIVLog 
                FROM tblpatienttest
                WHERE hivload <> '' AND Dat < :StartDate AND clinicid LIKE 'P%'
            ) pt
            GROUP BY pt.clinicid
        ) mp ON mp.clinicid = p.clinicid AND mp.dat = p.dat
    ) lvl ON lvl.clinicid = a.ClinicID
    LEFT JOIN tblimain i ON CAST(i.clinicid AS CHAR) = CAST(a.clinicid AS CHAR)
    WHERE ps.da IS NULL OR ps.da > :EndDate
)

SELECT
    '10.6' as step,
    ClinicID as clinicid,
    Sex as sex,
    CASE 
        WHEN Sex = 0 THEN 'Female'
        WHEN Sex = 1 THEN 'Male'
        WHEN Sex IS NULL THEN 'Unknown (No patient data)'
        ELSE 'Unknown'
    END as sex_display,
    typepatients,
    age,
    CASE 
        WHEN typepatients = '15+' THEN 'Adult'
        WHEN typepatients = '≤14' THEN 'Child'
        WHEN typepatients IS NULL THEN 'Unknown (No patient data)'
        ELSE 'Unknown'
    END as patient_type,
    ART,
    DaArt,
    DaBirth,
    DafirstVisit,
    OffIn as transfer_status,
    LastVLDate,
    LastVLLoad,
    MonthsOnART,
    MonthsSinceLastVL,
    StatusVL
FROM tblactive
WHERE StatusVL <> ''
ORDER BY DaArt DESC, ClinicID;