-- DQA 12: Registered patient with no clinic visit
SELECT
    i.ClinicID AS clinicid,
    i.DafirstVisit,
    'Adult' AS patient_type,
    'No visit on record' AS issue_type
FROM tblaimain i
LEFT JOIN (
    SELECT clinicid FROM tblavmain GROUP BY clinicid
) v ON v.clinicid = i.ClinicID
LEFT JOIN tblavpatientstatus pt ON pt.clinicid = i.ClinicID
WHERE pt.status IS NULL
  AND v.clinicid IS NULL

UNION ALL

SELECT
    i.ClinicID AS clinicid,
    i.DafirstVisit,
    'Child' AS patient_type,
    'No visit on record' AS issue_type
FROM tblcimain i
LEFT JOIN (
    SELECT clinicid FROM tblcvmain GROUP BY clinicid
) v ON v.clinicid = i.ClinicID
LEFT JOIN tblcvpatientstatus pt ON pt.clinicid = i.ClinicID
WHERE pt.status IS NULL
  AND v.clinicid IS NULL

ORDER BY patient_type, clinicid;
