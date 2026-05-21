-- DQA 08: Visit date and next appointment invalid or over 6 months apart
WITH visit_check AS (
    SELECT
        clinicid,
        DatVisit,
        DaApp,
        CASE
            WHEN DatVisit > DaApp THEN 'Wrong appointment date'
            WHEN DATEDIFF(DaApp, DatVisit) > 190 THEN 'More than six months'
            ELSE NULL
        END AS issue_type
    FROM (
        SELECT clinicid, DatVisit, DaApp FROM tblavmain
        UNION ALL
        SELECT clinicid, DatVisit, DaApp FROM tblcvmain
    ) v
)
SELECT
    clinicid,
    DatVisit,
    DaApp,
    issue_type
FROM visit_check
WHERE issue_type IS NOT NULL
ORDER BY clinicid, DatVisit;
