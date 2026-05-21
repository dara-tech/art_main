-- Indicator 10.5: TPT Complete - Detailed Records (matching aggregate logic)
-- TPT source: adult/child visit (tblavtptdrug/tblcvtptdrug) preferred; Form A (tblaimain/tblcimain) fallback
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

tbltptdrug_visit AS (
    WITH tbltptdrugs AS (
        SELECT DrugName, Status, Da, Vid 
        FROM tblavtptdrug 
        WHERE DrugName != "B6"
        UNION ALL 
        SELECT DrugName, Status, Da, Vid 
        FROM tblcvtptdrug 
        WHERE DrugName != "B6"
    ),
    
    tblvisit_tpt AS (
        SELECT clinicid, DatVisit, vid 
        FROM tblavmain 
        UNION ALL 
        SELECT clinicid, DatVisit, vid 
        FROM tblcvmain 
    ),
    
    tbltptall AS (
        SELECT clinicid, DatVisit, DrugName, Status, Da 
        FROM tbltptdrugs tp 
        LEFT JOIN tblvisit_tpt v ON tp.vid = v.vid
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
           st.da AS Datestop, DATEDIFF(st.da, s.DatVisit) / 30 AS duration
    FROM tbltptstart s
    LEFT JOIN tbltptstope st ON s.clinicid = st.clinicid
),

tbltptdrug_forma AS (
    SELECT 
        ClinicID AS clinicid,
        DaStartTPT AS dateStart,
        CASE TPTdrug
            WHEN 0 THEN '3HP'
            WHEN 1 THEN '6H'
            WHEN 2 THEN '3RH'
            WHEN 3 THEN 'INH'
            ELSE NULL
        END AS Tptdrugname,
        IF(DaEndTPT >= '1990-01-02', DaEndTPT, NULL) AS Datestop,
        IF(DaEndTPT >= '1990-01-02', DATEDIFF(DaEndTPT, DaStartTPT) / 30, NULL) AS duration,
        TPT AS forma_tpt
    FROM tblaimain
    WHERE DaStartTPT >= '1990-01-02'
        AND TPTdrug >= 0
        AND TPT IN (1, 2)
        AND DafirstVisit <= :EndDate

    UNION ALL

    -- Child initial form uses Inh (not TPT): 0=Yes, 1=No, 2=Unknown, 3=Ongoing
    SELECT 
        ClinicID AS clinicid,
        DaStartTPT AS dateStart,
        CASE TPTdrug
            WHEN 0 THEN '3HP'
            WHEN 1 THEN '6H'
            WHEN 2 THEN '3RH'
            WHEN 3 THEN 'INH'
            ELSE NULL
        END AS Tptdrugname,
        IF(DaEndTPT >= '1990-01-02', DaEndTPT, NULL) AS Datestop,
        IF(DaEndTPT >= '1990-01-02', DATEDIFF(DaEndTPT, DaStartTPT) / 30, NULL) AS duration,
        CASE Inh WHEN 0 THEN 1 WHEN 3 THEN 2 ELSE 0 END AS forma_tpt
    FROM tblcimain
    WHERE DaStartTPT >= '1990-01-02'
        AND TPTdrug >= 0
        AND Inh IN (0, 3)
        AND DaFirstVisit <= :EndDate
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
    i.TypeofReturn,
    CASE 
        WHEN i.typepatients = '15+' THEN 'Adult'
        ELSE 'Child'
    END AS patient_type,
    i.age,
    CASE
        WHEN i.OffIn = 0 THEN 'Not Transferred'
        WHEN i.OffIn = 1 THEN 'Transferred In'
        WHEN i.OffIn = 3 THEN 'Transferred Out'
        ELSE CONCAT('Status: ', i.OffIn)
    END AS transfer_status,
    IF(tv.Tptdrugname IS NOT NULL, tv.Tptdrugname, tf.Tptdrugname) AS Tptdrugname,
    IF(tv.Tptdrugname IS NOT NULL, tv.dateStart, tf.dateStart) AS dateStart,
    IF(tv.Tptdrugname IS NOT NULL, tv.Datestop, tf.Datestop) AS Datestop,
    IF(tv.Tptdrugname IS NOT NULL, tv.duration, tf.duration) AS duration,
    IF(tv.Tptdrugname IS NOT NULL, 'Visit', IF(tf.Tptdrugname IS NOT NULL, 'Form A', NULL)) AS tpt_source,
    IF(
        tv.Tptdrugname IS NOT NULL,
        IF(LEFT(tv.Tptdrugname, 1) = 3 AND tv.duration >= 2.50, 'TPT Complete',
           IF(LEFT(tv.Tptdrugname, 1) = 6 AND tv.duration >= 5.50, 'TPT Complete',
              IF(tv.Tptdrugname IS NULL, 'Not Start', 'Not complete'))),
        IF(LEFT(tf.Tptdrugname, 1) = 3 AND tf.duration >= 2.50, 'TPT Complete',
           IF(LEFT(tf.Tptdrugname, 1) = 6 AND tf.duration >= 5.50, 'TPT Complete',
              IF(tf.forma_tpt = 1, 'TPT Complete',
                 IF(tf.Tptdrugname IS NULL, 'Not Start', 'Not complete'))))
    ) AS tptstatus
FROM tblvisit v
LEFT JOIN tblimain i ON i.clinicid = v.clinicid
LEFT JOIN tblart a ON a.clinicid = v.clinicid
LEFT JOIN tblexit e ON v.clinicid = e.clinicid
LEFT JOIN tbltptdrug_visit tv ON tv.clinicid = v.clinicid
LEFT JOIN tbltptdrug_forma tf ON tf.clinicid = v.clinicid
WHERE v.id = 1 AND e.status IS NULL AND a.ART IS NOT NULL
  AND IF(
        tv.Tptdrugname IS NOT NULL,
        IF(LEFT(tv.Tptdrugname, 1) = 3 AND tv.duration >= 2.50, 'TPT Complete',
           IF(LEFT(tv.Tptdrugname, 1) = 6 AND tv.duration >= 5.50, 'TPT Complete',
              IF(tv.Tptdrugname IS NULL, 'Not Start', 'Not complete'))),
        IF(LEFT(tf.Tptdrugname, 1) = 3 AND tf.duration >= 2.50, 'TPT Complete',
           IF(LEFT(tf.Tptdrugname, 1) = 6 AND tf.duration >= 5.50, 'TPT Complete',
              IF(tf.forma_tpt = 1, 'TPT Complete',
                 IF(tf.Tptdrugname IS NULL, 'Not Start', 'Not complete'))))
      ) = 'TPT Complete'
ORDER BY v.DatVisit DESC, i.clinicid;
