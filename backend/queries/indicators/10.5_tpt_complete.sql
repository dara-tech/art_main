-- TPT Complete (10.5) — visit TPT preferred; Form A fallback
WITH tblvisit AS (
    SELECT clinicid
    FROM (
        SELECT
            clinicid,
            ROW_NUMBER() OVER (PARTITION BY clinicid ORDER BY DatVisit DESC) AS rn
        FROM (
            SELECT clinicid, DatVisit
            FROM tblavmain
            WHERE DatVisit <= :EndDate
            UNION ALL
            SELECT clinicid, DatVisit
            FROM tblcvmain
            WHERE DatVisit <= :EndDate
        ) all_visits
    ) latest_visit
    WHERE rn = 1
),
tblimain AS (
    SELECT ClinicID, "15+" AS typepatients, Sex
    FROM tblaimain
    WHERE DafirstVisit <= :EndDate
    UNION ALL
    SELECT ClinicID, "≤14" AS typepatients, Sex
    FROM tblcimain
    WHERE DafirstVisit <= :EndDate
),
tblart AS (
    SELECT ClinicID, ART
    FROM tblaart
    WHERE DaArt <= :EndDate
    UNION ALL
    SELECT ClinicID, ART
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
        s.DatVisit AS dateStart,
        s.DrugName AS Tptdrugname,
        st.Da AS Datestop,
        DATEDIFF(st.Da, s.DatVisit) / 30 AS duration
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
),
tpt_merged AS (
    SELECT
        v.clinicid,
        i.typepatients,
        i.Sex,
        IF(tv.Tptdrugname IS NOT NULL, tv.Tptdrugname, tf.Tptdrugname) AS Tptdrugname,
        IF(tv.Tptdrugname IS NOT NULL, tv.duration, tf.duration) AS duration,
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
                    IF(tf.forma_tpt = 1, 'TPT Complete',
                        IF(tf.Tptdrugname IS NULL, 'Not Start', 'Not complete')
                    )
                )
            )
        ) AS tptstatus
    FROM tblvisit v
    LEFT JOIN tblimain i ON i.ClinicID = v.clinicid
    LEFT JOIN tblart a ON a.ClinicID = v.clinicid
    LEFT JOIN tblexit e ON e.clinicid = v.clinicid
    LEFT JOIN tbltptdrug_visit tv ON tv.clinicid = v.clinicid
    LEFT JOIN tbltptdrug_forma tf ON tf.clinicid = v.clinicid
    WHERE e.status IS NULL
      AND a.ART IS NOT NULL
)

SELECT
    '10.5. TPT Complete' AS Indicator,
    IFNULL(SUM(IF(Sex = 1 AND typepatients = '≤14', 1, 0)), 0) AS Male_0_14,
    IFNULL(SUM(IF(Sex = 0 AND typepatients = '≤14', 1, 0)), 0) AS Female_0_14,
    IFNULL(SUM(IF(Sex = 1 AND typepatients = '15+', 1, 0)), 0) AS Male_over_14,
    IFNULL(SUM(IF(Sex = 0 AND typepatients = '15+', 1, 0)), 0) AS Female_over_14,
    IFNULL(COUNT(*), 0) AS TOTAL
FROM tpt_merged
WHERE tptstatus = 'TPT Complete';
