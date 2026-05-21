-- DQA 24: Patient has exit/outcome but latest appointment is in the future
WITH patient_exit AS (
    SELECT clinicid, status, da AS exit_date
    FROM tblavpatientstatus
    WHERE status IS NOT NULL
    UNION ALL
    SELECT clinicid, status, da AS exit_date
    FROM tblcvpatientstatus
    WHERE status IS NOT NULL
),
latest_visit AS (
    SELECT clinicid, DatVisit, DaApp
    FROM (
        SELECT
            clinicid,
            DatVisit,
            DaApp,
            ROW_NUMBER() OVER (PARTITION BY clinicid ORDER BY DatVisit DESC) AS rn
        FROM (
            SELECT clinicid, DatVisit, DaApp FROM tblavmain
            UNION ALL
            SELECT clinicid, DatVisit, DaApp FROM tblcvmain
        ) v
    ) x
    WHERE rn = 1
)
SELECT
    ex.clinicid,
    ex.status AS exit_status,
    ex.exit_date,
    lv.DatVisit,
    lv.DaApp,
    'Exit with future appointment' AS issue_type
FROM patient_exit ex
INNER JOIN latest_visit lv ON lv.clinicid = ex.clinicid
WHERE lv.DaApp > CURDATE()
ORDER BY ex.clinicid;
