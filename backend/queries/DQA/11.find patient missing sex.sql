-- DQA 11: Patient sex not recorded
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
    i.ClinicID AS clinicid,
    i.DafirstVisit,
    lv.DatVisit,
    i.Sex,
    'Adult' AS patient_type,
    'Missing sex' AS issue_type
FROM tblaimain i
INNER JOIN latest_visit lv ON lv.clinicid = i.ClinicID
LEFT JOIN tblavpatientstatus pt ON pt.clinicid = i.ClinicID
WHERE pt.status IS NULL
  AND (i.Sex = -1 OR i.Sex IS NULL)

UNION ALL

SELECT
    i.ClinicID AS clinicid,
    i.DafirstVisit,
    lv.DatVisit,
    i.Sex,
    'Child' AS patient_type,
    'Missing sex' AS issue_type
FROM tblcimain i
INNER JOIN latest_visit lv ON lv.clinicid = i.ClinicID
LEFT JOIN tblcvpatientstatus pt ON pt.clinicid = i.ClinicID
WHERE pt.status IS NULL
  AND (i.Sex = -1 OR i.Sex IS NULL)

ORDER BY patient_type, clinicid;
