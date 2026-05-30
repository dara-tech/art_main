-- 10.4.1 TPT Start (new start) - Detailed Records (matching aggregate logic)
WITH tblvisit AS (
    SELECT clinicid, DatVisit, DaApp, vid
    FROM (
        SELECT
            clinicid,
            DatVisit,
            DaApp,
            vid,
            ROW_NUMBER() OVER (PARTITION BY clinicid ORDER BY DatVisit DESC) AS rn
        FROM (
            SELECT clinicid, DatVisit, DaApp, vid
            FROM tblavmain
            WHERE DatVisit <= :EndDate
            UNION ALL
            SELECT clinicid, DatVisit, DaApp, vid
            FROM tblcvmain
            WHERE DatVisit <= :EndDate
        ) all_visits
    ) latest_visit
    WHERE rn = 1
),
tblimain AS (
    SELECT
        ClinicID,
        DafirstVisit,
        "15+" AS typepatients,
        TypeofReturn,
        DaBirth,
        TIMESTAMPDIFF(YEAR, DaBirth, :EndDate) AS age,
        Sex,
        OffIn
    FROM tblaimain
    WHERE DafirstVisit <= :EndDate
    UNION ALL
    SELECT
        ClinicID,
        DafirstVisit,
        "≤14" AS typepatients,
        '' AS TypeofReturn,
        DaBirth,
        TIMESTAMPDIFF(YEAR, DaBirth, :EndDate) AS age,
        Sex,
        OffIn
    FROM tblcimain
    WHERE DafirstVisit <= :EndDate
),
tblart AS (
    SELECT ClinicID, ART, DaArt, TIMESTAMPDIFF(MONTH, DaArt, :EndDate) AS nmonthART
    FROM tblaart
    WHERE DaArt <= :EndDate
    UNION ALL
    SELECT ClinicID, ART, DaArt, TIMESTAMPDIFF(MONTH, DaArt, :EndDate) AS nmonthART
    FROM tblcart
    WHERE DaArt <= :EndDate
),
tblexit AS (
    SELECT clinicid, status
    FROM tblavpatientstatus
    WHERE da <= :EndDate
    UNION ALL
    SELECT clinicid, status
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
        IF(LOCATE('3TC+DTG+TDF', drugname) > 0, 'TLD', 'Not-TLD') AS TLDStatus
    FROM tbldrug
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
    tptvisit AS (
        SELECT clinicid, DatVisit, vid
        FROM tblavmain
        UNION ALL
        SELECT clinicid, DatVisit, vid
        FROM tblcvmain
    ),
    tbltptall AS (
        SELECT
            v.clinicid,
            v.DatVisit,
            tp.DrugName,
            tp.Status,
            tp.Da
        FROM tbltptdrugs tp
        LEFT JOIN tptvisit v ON tp.vid = v.vid
    ),
    tbltptstart AS (
        SELECT *
        FROM (
            SELECT
                *,
                ROW_NUMBER() OVER (PARTITION BY clinicid ORDER BY DatVisit ASC) AS rn
            FROM tbltptall
            WHERE status = 0
              AND DatVisit <= :EndDate
        ) s
        WHERE rn = 1
    ),
    tbltptstope AS (
        SELECT *
        FROM (
            SELECT
                *,
                ROW_NUMBER() OVER (PARTITION BY clinicid ORDER BY Da DESC) AS rn
            FROM tbltptall
            WHERE status = 1
              AND Da <= :EndDate
        ) s
        WHERE rn = 1
    )
    SELECT
        s.clinicid,
        CASE
            WHEN s.Da IS NULL OR s.Da = '1900-12-31' OR YEAR(s.Da) < 2000 OR YEAR(s.Da) > 2030
            THEN s.DatVisit
            ELSE s.Da
        END AS dateStart,
        s.DrugName AS Tptdrugname,
        st.Da AS Datestop,
        DATEDIFF(
            st.Da,
            CASE
                WHEN s.Da IS NULL OR s.Da = '1900-12-31' OR YEAR(s.Da) < 2000 OR YEAR(s.Da) > 2030
                THEN s.DatVisit
                ELSE s.Da
            END
        ) / 30 AS duration
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
        IF(DaEndTPT >= '1990-01-02', DATEDIFF(DaEndTPT, DaStartTPT) / 30, NULL) AS duration
    FROM tblaimain
    WHERE DaStartTPT >= '1990-01-02'
      AND TPTdrug >= 0
      AND TPT IN (1, 2)
      AND DafirstVisit <= :EndDate
    UNION ALL
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
        IF(DaEndTPT >= '1990-01-02', DATEDIFF(DaEndTPT, DaStartTPT) / 30, NULL) AS duration
    FROM tblcimain
    WHERE DaStartTPT >= '1990-01-02'
      AND TPTdrug >= 0
      AND Inh IN (0, 3)
      AND DaFirstVisit <= :EndDate
)

SELECT
    '10.4.1' AS step,
    i.clinicid,
    i.Sex AS sex,
    CASE
        WHEN i.Sex = 0 THEN 'Female'
        WHEN i.Sex = 1 THEN 'Male'
        ELSE 'Unknown'
    END AS sex_display,
    i.typepatients,
    i.age,
    CASE
        WHEN i.typepatients = '15+' THEN 'Adult'
        WHEN i.typepatients = '≤14' THEN 'Child'
        ELSE 'Unknown'
    END AS patient_type,
    a.ART,
    a.DaArt,
    i.DafirstVisit,
    i.DaBirth,
    i.OffIn,
    i.TypeofReturn,
    CASE
        WHEN i.OffIn = 0 THEN 'Not Transferred'
        WHEN i.OffIn = 1 THEN 'Transferred In'
        WHEN i.OffIn = 3 THEN 'Transferred Out'
        ELSE CONCAT('Status: ', i.OffIn)
    END AS transfer_status,
    IF(a.nmonthART >= 6, '>6M', '<6M') AS Startartstatus,
    IF(DATEDIFF(v.DaApp, v.DatVisit) > 80, 'MMD', 'Not-MMD') AS MMDStatus,
    IF(
        LEFT(i.ClinicID, 1) = 'P' AND rd.TLDStatus != 'TLD' AND LOCATE('DTG', rd.drugname) > 0,
        'TLD',
        rd.TLDStatus
    ) AS TLDStatus,
    IF(tv.Tptdrugname IS NOT NULL, tv.Tptdrugname, tf.Tptdrugname) AS Tptdrugname,
    IF(tv.Tptdrugname IS NOT NULL, tv.dateStart, tf.dateStart) AS dateStart,
    IF(tv.Tptdrugname IS NOT NULL, 'Visit', IF(tf.Tptdrugname IS NOT NULL, 'Form A', NULL)) AS tpt_source,
    IF(
        tv.Tptdrugname IS NOT NULL,
        IF(
            LEFT(tv.Tptdrugname, 1) = 3 AND tv.duration >= 2.50, 'TPT Complete',
            IF(
                LEFT(tv.Tptdrugname, 1) = 6 AND tv.duration >= 5.50, 'TPT Complete',
                IF(tv.Tptdrugname IS NULL, 'Not Start', 'Not complete')
            )
        ),
        IF(
            LEFT(tf.Tptdrugname, 1) = 3 AND tf.duration >= 2.50, 'TPT Complete',
            IF(
                LEFT(tf.Tptdrugname, 1) = 6 AND tf.duration >= 5.50, 'TPT Complete',
                IF(tf.Tptdrugname IS NOT NULL, 'Not complete', 'Not Start')
            )
        )
    ) AS tptstatus
FROM tblvisit v
LEFT JOIN tblimain i ON i.ClinicID = v.clinicid
LEFT JOIN tblart a ON a.ClinicID = v.clinicid
LEFT JOIN tblexit e ON e.clinicid = v.clinicid
LEFT JOIN tblarvdrug rd ON rd.vid = v.vid
LEFT JOIN tbltptdrug_visit tv ON tv.clinicid = v.clinicid
LEFT JOIN tbltptdrug_forma tf ON tf.clinicid = v.clinicid
WHERE e.status IS NULL
  AND a.ART IS NOT NULL
  AND IF(
        tv.Tptdrugname IS NOT NULL,
        IF(
            LEFT(tv.Tptdrugname, 1) = 3 AND tv.duration >= 2.50, 'TPT Complete',
            IF(
                LEFT(tv.Tptdrugname, 1) = 6 AND tv.duration >= 5.50, 'TPT Complete',
                IF(tv.Tptdrugname IS NULL, 'Not Start', 'Not complete')
            )
        ),
        IF(
            LEFT(tf.Tptdrugname, 1) = 3 AND tf.duration >= 2.50, 'TPT Complete',
            IF(
                LEFT(tf.Tptdrugname, 1) = 6 AND tf.duration >= 5.50, 'TPT Complete',
                IF(tf.Tptdrugname IS NOT NULL, 'Not complete', 'Not Start')
            )
        )
      ) != 'Not Start'
  AND IF(tv.Tptdrugname IS NOT NULL, tv.dateStart, tf.dateStart) BETWEEN :StartDate AND :EndDate
ORDER BY a.DaArt DESC, i.clinicid;
