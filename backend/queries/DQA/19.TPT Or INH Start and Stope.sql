-- DQA 19: Invalid TPT or INH start/stop dates
-- TPT source: tblavtptdrug / tblcvtptdrug (visit) + Form A (tblaimain / tblcimain).
-- Do NOT use tblavoidrug / OI drug tables for TPT or INH.
WITH tpt_drugs AS (
    SELECT DrugName, Status, Da, Vid FROM tblavtptdrug WHERE DrugName != 'B6'
    UNION ALL
    SELECT DrugName, Status, Da, Vid FROM tblcvtptdrug WHERE DrugName != 'B6'
),
visit_map AS (
    SELECT clinicid, DatVisit, DaApp, vid FROM tblavmain
    UNION ALL
    SELECT clinicid, DatVisit, DaApp, vid FROM tblcvmain
),
tpt_all AS (
    SELECT v.clinicid, v.DatVisit, tp.DrugName, tp.Status, tp.Da
    FROM tpt_drugs tp
    LEFT JOIN visit_map v ON v.vid = tp.vid
),
tpt_visit AS (
    SELECT
        s.clinicid,
        s.DrugName AS Tptdrugname,
        s.dateStart,
        st.dateStop,
        'Visit' AS tpt_source
    FROM (
        SELECT
            clinicid,
            DrugName,
            CASE
                WHEN Da IS NULL OR Da = '1900-12-31' OR YEAR(Da) < 2000 OR YEAR(Da) > 2030
                THEN DatVisit
                ELSE Da
            END AS dateStart,
            ROW_NUMBER() OVER (PARTITION BY clinicid ORDER BY DatVisit ASC) AS rn
        FROM tpt_all
        WHERE status = 0 AND DatVisit IS NOT NULL
    ) s
    LEFT JOIN (
        SELECT clinicid, Da AS dateStop
        FROM (
            SELECT clinicid, Da, ROW_NUMBER() OVER (PARTITION BY clinicid ORDER BY Da DESC) AS rn
            FROM tpt_all
            WHERE status = 1 AND Da IS NOT NULL
        ) x
        WHERE rn = 1
    ) st ON st.clinicid = s.clinicid
    WHERE s.rn = 1
),
tpt_forma AS (
    SELECT
        ClinicID AS clinicid,
        CASE TPTdrug WHEN 0 THEN '3HP' WHEN 1 THEN '6H' WHEN 2 THEN '3RH' WHEN 3 THEN 'INH' END AS Tptdrugname,
        DaStartTPT AS dateStart,
        IF(DaEndTPT >= '1990-01-02', DaEndTPT, NULL) AS dateStop,
        'Form A' AS tpt_source
    FROM tblaimain
    WHERE DaStartTPT >= '1990-01-02' AND TPTdrug >= 0 AND TPT IN (1, 2)
    UNION ALL
    SELECT
        ClinicID AS clinicid,
        CASE TPTdrug WHEN 0 THEN '3HP' WHEN 1 THEN '6H' WHEN 2 THEN '3RH' WHEN 3 THEN 'INH' END,
        DaStartTPT,
        IF(DaEndTPT >= '1990-01-02', DaEndTPT, NULL),
        'Form A'
    FROM tblcimain
    WHERE DaStartTPT >= '1990-01-02' AND TPTdrug >= 0 AND Inh IN (0, 3)
),
latest_visit AS (
    SELECT clinicid, DatVisit, DaApp
    FROM (
        SELECT clinicid, DatVisit, DaApp,
               ROW_NUMBER() OVER (PARTITION BY clinicid ORDER BY DatVisit DESC) AS rn
        FROM visit_map
    ) x
    WHERE rn = 1
),
tpt_merged AS (
    SELECT
        pat.clinicid,
        pat.DafirstVisit,
        TIMESTAMPDIFF(YEAR, pat.DaBirth, CURDATE()) AS Age,
        IF(pat.Sex = 0, 'Female', 'Male') AS Sex,
        pat.patient_type,
        art.DaArt,
        art.ART,
        IF(tv.Tptdrugname IS NOT NULL, tv.Tptdrugname, tf.Tptdrugname) AS Tptdrugname,
        IF(tv.Tptdrugname IS NOT NULL, tv.dateStart, tf.dateStart) AS Date_Start_TPT,
        IF(tv.Tptdrugname IS NOT NULL, tv.dateStop, tf.dateStop) AS Date_Stop_TPT,
        IF(tv.Tptdrugname IS NOT NULL, tv.tpt_source, tf.tpt_source) AS tpt_source,
        lv.DatVisit,
        lv.DaApp
    FROM (
        SELECT ClinicID AS clinicid, DafirstVisit, DaBirth, Sex, 'Adult' AS patient_type
        FROM tblaimain
        UNION ALL
        SELECT ClinicID AS clinicid, DafirstVisit, DaBirth, Sex, 'Child' AS patient_type
        FROM tblcimain
    ) pat
    INNER JOIN (
        SELECT ClinicID AS clinicid, DaArt, ART FROM tblaart
        UNION ALL
        SELECT ClinicID AS clinicid, DaArt, ART FROM tblcart
    ) art ON art.clinicid = pat.clinicid
    LEFT JOIN (
        SELECT clinicid, status FROM tblavpatientstatus
        UNION ALL
        SELECT clinicid, status FROM tblcvpatientstatus
    ) pex ON pex.clinicid = pat.clinicid
    LEFT JOIN latest_visit lv ON lv.clinicid = pat.clinicid
    LEFT JOIN tpt_visit tv ON tv.clinicid = pat.clinicid
    LEFT JOIN tpt_forma tf ON tf.clinicid = pat.clinicid
    WHERE pex.status IS NULL
      AND (tv.clinicid IS NOT NULL OR tf.clinicid IS NOT NULL)
)
SELECT
    m.clinicid,
    m.DafirstVisit,
    m.Age,
    m.Sex,
    m.patient_type,
    m.DaArt,
    m.ART,
    m.Tptdrugname,
    m.tpt_source,
    m.Date_Start_TPT,
    m.Date_Stop_TPT,
    ROUND(DATEDIFF(IFNULL(m.Date_Stop_TPT, CURDATE()), m.Date_Start_TPT) / 30, 0) AS Num_Month,
    m.DatVisit,
    m.DaApp,
    CASE
        WHEN m.Date_Start_TPT IS NULL AND m.Date_Stop_TPT IS NOT NULL THEN 'Stop without start'
        WHEN m.Date_Stop_TPT < m.Date_Start_TPT THEN 'Stop before start'
        WHEN YEAR(m.Date_Start_TPT) < 2000 OR m.Date_Start_TPT = '1900-12-31' THEN 'Invalid start date'
        WHEN m.Date_Stop_TPT IS NOT NULL AND (YEAR(m.Date_Stop_TPT) < 2000 OR m.Date_Stop_TPT = '1900-12-31')
            THEN 'Invalid stop date'
        ELSE 'Review start/stop'
    END AS issue_type
FROM tpt_merged m
WHERE (m.Date_Start_TPT IS NULL AND m.Date_Stop_TPT IS NOT NULL)
   OR (m.Date_Start_TPT IS NOT NULL AND m.Date_Stop_TPT IS NOT NULL AND m.Date_Stop_TPT < m.Date_Start_TPT)
   OR (m.Date_Start_TPT IS NOT NULL AND (YEAR(m.Date_Start_TPT) < 2000 OR m.Date_Start_TPT = '1900-12-31'))
   OR (m.Date_Stop_TPT IS NOT NULL AND (YEAR(m.Date_Stop_TPT) < 2000 OR m.Date_Stop_TPT = '1900-12-31'))
ORDER BY m.patient_type, m.clinicid;
