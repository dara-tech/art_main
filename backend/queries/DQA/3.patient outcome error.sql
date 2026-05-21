-- DQA 03: Duplicate exit/outcome (more than one status record)
WITH exit_ranked AS (
    SELECT
        clinicid,
        status,
        da,
        ROW_NUMBER() OVER (PARTITION BY clinicid ORDER BY da) AS rn,
        CASE status
            WHEN 0 THEN 'lost'
            WHEN 1 THEN 'Dead'
            WHEN 2 THEN 'Neg'
            WHEN 3 THEN 'T-out'
            ELSE ''
        END AS status_label
    FROM (
        SELECT clinicid, status, da FROM tblavpatientstatus
        UNION ALL
        SELECT clinicid, status, da FROM tblcvpatientstatus
    ) all_exit
)
SELECT
    e1.clinicid,
    a.DaArt,
    a.ART,
    e1.status_label AS status_1,
    e1.da AS exit_date_1,
    e2.status_label AS status_2,
    e2.da AS exit_date_2,
    'Multiple exit records' AS issue_type
FROM exit_ranked e1
INNER JOIN exit_ranked e2 ON e2.clinicid = e1.clinicid AND e2.rn = 2
LEFT JOIN tblaart a ON a.ClinicID = e1.clinicid
WHERE e1.rn = 1
ORDER BY e1.clinicid;
