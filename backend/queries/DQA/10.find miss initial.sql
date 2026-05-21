-- DQA 10: Clinic visit exists but registration form missing
WITH latest_visit AS (
    SELECT clinicid, MAX(DatVisit) AS DatVisit
    FROM (
        SELECT clinicid, DatVisit FROM tblavmain
        UNION ALL
        SELECT clinicid, DatVisit FROM tblcvmain
    ) v
    GROUP BY clinicid
)
SELECT
    lv.clinicid,
    lv.DatVisit,
    'Visit without initial form' AS issue_type
FROM latest_visit lv
LEFT JOIN tblaimain ia ON ia.ClinicID = lv.clinicid
LEFT JOIN tblcimain ic ON ic.ClinicID = lv.clinicid
WHERE ia.ClinicID IS NULL
  AND ic.ClinicID IS NULL
ORDER BY lv.clinicid;
