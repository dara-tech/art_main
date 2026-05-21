-- DQA 26: Form A TPT recorded but no visit TPT drug row
WITH forma_tpt AS (
    SELECT ClinicID AS clinicid, DaStartTPT, TPTdrug
    FROM tblaimain
    WHERE DaStartTPT >= '1990-01-02'
      AND TPTdrug >= 0
      AND TPT IN (1, 2)
    UNION ALL
    SELECT ClinicID AS clinicid, DaStartTPT, TPTdrug
    FROM tblcimain
    WHERE DaStartTPT >= '1990-01-02'
      AND TPTdrug >= 0
      AND Inh IN (0, 3)
),
visit_tpt AS (
    SELECT DISTINCT v.clinicid
    FROM (
        SELECT Vid FROM tblavtptdrug WHERE DrugName != 'B6'
        UNION ALL
        SELECT Vid FROM tblcvtptdrug WHERE DrugName != 'B6'
    ) tp
    INNER JOIN (
        SELECT clinicid, vid FROM tblavmain
        UNION ALL
        SELECT clinicid, vid FROM tblcvmain
    ) v ON v.vid = tp.Vid
)
SELECT
    f.clinicid,
    f.DaStartTPT AS Date_Start_TPT,
    f.TPTdrug,
    'Form A TPT without visit TPT' AS issue_type
FROM forma_tpt f
LEFT JOIN visit_tpt vt ON vt.clinicid = f.clinicid
WHERE vt.clinicid IS NULL
ORDER BY f.clinicid;
