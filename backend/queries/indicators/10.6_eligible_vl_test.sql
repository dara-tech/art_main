-- Indicator 10.6: Eligible for Viral Load test (Corrected to match audit query exactly)
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
        lvl.Dat, 
        lvl.HIVLoad,
        i.typepatients,
        i.Sex,
        -- Use exact audit query logic
        IF(lvl.hivload IS NULL AND TIMESTAMPDIFF(MONTH, a.daart, :EndDate) >= 5, "DO VL",
        IF(lvl.hivload >= 40 AND TIMESTAMPDIFF(MONTH, lvl.Dat, :EndDate) > 4, "DO VL",
        IF(lvl.hivload < 40 AND TIMESTAMPDIFF(MONTH, lvl.Dat, :EndDate) >= 10, "DO VL",
        IF(lvl.hivload < 40 AND TIMESTAMPDIFF(MONTH, a.DaART, lvl.Dat) >= 5 AND TIMESTAMPDIFF(MONTH, a.DaART, lvl.Dat) <= 7 AND TIMESTAMPDIFF(MONTH, lvl.Dat, :EndDate) >= 5 AND TIMESTAMPDIFF(MONTH, lvl.Dat, :EndDate) <= 7, "DO VL",
        "")))) AS StatusVL
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
    '10.6. Eligible for VL test' AS Indicator,
    IFNULL(COUNT(*), 0) AS TOTAL,
    IFNULL(SUM(CASE WHEN typepatients = '≤14' AND Sex = 1 THEN 1 ELSE 0 END), 0) AS Male_0_14,
    IFNULL(SUM(CASE WHEN typepatients = '≤14' AND Sex = 0 THEN 1 ELSE 0 END), 0) AS Female_0_14,
    IFNULL(SUM(CASE WHEN typepatients = '15+' AND Sex = 1 THEN 1 ELSE 0 END), 0) AS Male_over_14,
    IFNULL(SUM(CASE WHEN typepatients = '15+' AND Sex = 0 THEN 1 ELSE 0 END), 0) AS Female_over_14
FROM tblactive
WHERE StatusVL <> '';
