-- Indicator 10.5: TPT Complete - Detailed Records (matching aggregate logic)
-- This replicates the exact same CTE structure and logic as the aggregate query
WITH tblvisit AS (
    SELECT clinicid, DatVisit, ARTnum, DaApp, vid, 
           ROW_NUMBER() OVER (PARTITION BY clinicid ORDER BY DatVisit DESC) AS id 
    FROM tblavmain 
    WHERE DatVisit <= :EndDate
    UNION ALL 
    SELECT clinicid, DatVisit, ARTnum, DaApp, vid, 
           ROW_NUMBER() OVER (PARTITION BY clinicid ORDER BY DatVisit DESC) AS id 
    FROM tblcvmain 
    WHERE DatVisit <= :EndDate
),

tblimain AS (
    SELECT ClinicID, DafirstVisit, "15+" AS typepatients, TypeofReturn, LClinicID, 
           SiteNameold, DaBirth, TIMESTAMPDIFF(YEAR, DaBirth, :EndDate) AS age, 
           Sex, DaHIV, OffIn 
    FROM tblaimain 
    WHERE DafirstVisit <= :EndDate
    UNION ALL 
    SELECT ClinicID, DafirstVisit, "≤14" AS typepatients, '' AS TypeofReturn, 
           LClinicID, SiteNameold, DaBirth, TIMESTAMPDIFF(YEAR, DaBirth, :EndDate) AS age, 
           Sex, DaTest AS DaHIV, OffIn 
    FROM tblcimain 
    WHERE DafirstVisit <= :EndDate
),

tblart AS (
    SELECT *, TIMESTAMPDIFF(MONTH, DaArt, :EndDate) AS nmonthART 
    FROM tblaart 
    WHERE DaArt <= :EndDate
    UNION ALL 
    SELECT *, TIMESTAMPDIFF(MONTH, DaArt, :EndDate) AS nmonthART 
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

tbltptdrug AS (
    WITH tbltptdrugs AS (
        SELECT DrugName, Status, Da, Vid 
        FROM tblavtptdrug 
        WHERE DrugName != "B6"
        UNION ALL 
        SELECT DrugName, Status, Da, Vid 
        FROM tblcvtptdrug 
        WHERE DrugName != "B6"
    ),
    
    tblvisit AS (
        SELECT clinicid, DatVisit, vid 
        FROM tblavmain 
        UNION ALL 
        SELECT clinicid, DatVisit, vid 
        FROM tblcvmain 
    ),
    
    tbltptall AS (
        SELECT clinicid, DatVisit, DrugName, Status, Da 
        FROM tbltptdrugs tp 
        LEFT JOIN tblvisit v ON tp.vid = v.vid
    ),
    
    tbltptstart AS (
        SELECT * 
        FROM (
            SELECT *, ROW_NUMBER() OVER(PARTITION BY clinicid ORDER BY DatVisit ASC) AS id 
            FROM tbltptall 
            WHERE status = 0 AND DatVisit <= :EndDate
        ) s 
        WHERE id = 1
    ),
    
    tbltptstope AS (
        SELECT * 
        FROM (
            SELECT *, ROW_NUMBER() OVER(PARTITION BY clinicid ORDER BY Da DESC) AS id 
            FROM tbltptall 
            WHERE status = 1 AND Da <= :EndDate
        ) s 
        WHERE id = 1
    )
    
    SELECT s.clinicid, s.DatVisit AS dateStart, s.DrugName AS Tptdrugname, 
           st.da AS Datestop, DATEDIFF(st.da, s.DatVisit) / 30 AS duration,
           IF(LEFT(s.DrugName, 1) = 3 AND DATEDIFF(st.da, s.DatVisit) / 30 >= 2.50, "TPT Complete",
              IF(LEFT(s.DrugName, 1) = 6 AND DATEDIFF(st.da, s.DatVisit) / 30 >= 5.50, "TPT Complete",
                 IF(s.DrugName IS NULL, "Not Start", "Not complete"))) AS tptstatus
    FROM tbltptstart s
    LEFT JOIN tbltptstope st ON s.clinicid = st.clinicid
)

SELECT
    '10.5' as step,
    i.clinicid,
    a.ART as art_number,
    i.Sex AS sex,
    CASE 
        WHEN i.Sex = 0 THEN 'Female'
        WHEN i.Sex = 1 THEN 'Male'
        ELSE 'Unknown'
    END AS sex_display,
    i.typepatients,
    i.DaBirth,
    i.DafirstVisit,
    a.DaArt,
    v.DatVisit,
    i.OffIn,
    CASE 
        WHEN i.typepatients = '15+' THEN 'Adult'
        ELSE 'Child'
    END AS patient_type,
    i.age,
    CASE
        WHEN i.OffIn = 0 THEN 'Not Transferred'
        WHEN i.OffIn = 2 THEN 'Transferred In'
        WHEN i.OffIn = 3 THEN 'Transferred Out'
        ELSE CONCAT('Status: ', i.OffIn)
    END AS transfer_status,
    tp.Tptdrugname,
    tp.dateStart,
    tp.Datestop,
    tp.duration,
    tp.tptstatus
FROM tblvisit v
LEFT JOIN tblimain i ON i.clinicid = v.clinicid
LEFT JOIN tblart a ON a.clinicid = v.clinicid
LEFT JOIN tblexit e ON v.clinicid = e.clinicid
LEFT JOIN tbltptdrug tp ON tp.clinicid = v.clinicid
WHERE v.id = 1 AND e.status IS NULL AND a.ART IS NOT NULL
  AND tp.tptstatus = 'TPT Complete'
ORDER BY v.DatVisit DESC, i.clinicid;
