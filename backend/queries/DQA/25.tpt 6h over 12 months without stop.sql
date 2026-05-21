-- DQA 25: TPT 6H started over 12 months ago without stop
-- TPT source: tblavtptdrug / tblcvtptdrug (not OI drug tables)
WITH tpt_drugs AS (
    SELECT DrugName, Status, Da, Vid FROM tblavtptdrug WHERE DrugName != 'B6'
    UNION ALL
    SELECT DrugName, Status, Da, Vid FROM tblcvtptdrug WHERE DrugName != 'B6'
),
visit_map AS (
    SELECT clinicid, DatVisit, vid FROM tblavmain
    UNION ALL
    SELECT clinicid, DatVisit, vid FROM tblcvmain
),
tpt_all AS (
    SELECT v.clinicid, v.DatVisit, tp.DrugName, tp.Status, tp.Da
    FROM tpt_drugs tp
    INNER JOIN visit_map v ON v.vid = tp.Vid
),
tpt_start AS (
    SELECT clinicid, DrugName AS Tptdrugname, dateStart
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
        WHERE Status = 0
          AND DatVisit IS NOT NULL
          AND LEFT(DrugName, 1) = '6'
    ) s
    WHERE rn = 1
),
tpt_stop AS (
    SELECT clinicid, MAX(Da) AS dateStop
    FROM tpt_all
    WHERE Status = 1
      AND Da IS NOT NULL
      AND Da >= '1990-01-02'
    GROUP BY clinicid
)
SELECT
    ts.clinicid,
    ts.Tptdrugname,
    ts.dateStart AS Date_Start_TPT,
    st.dateStop AS Date_Stop_TPT,
    '6H TPT over 12 months without stop' AS issue_type
FROM tpt_start ts
LEFT JOIN tpt_stop st ON st.clinicid = ts.clinicid
WHERE ts.dateStart < DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
  AND (st.dateStop IS NULL OR st.dateStop < ts.dateStart)
ORDER BY ts.clinicid;
