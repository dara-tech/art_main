-- DQA 14: Transfer in/out status not selected (OffIn blank)
SELECT
    i.ClinicID AS clinicid,
    i.DafirstVisit,
    i.OffIn,
    'Adult' AS patient_type,
    'OffIn not set' AS issue_type
FROM tblaimain i
LEFT JOIN tblavpatientstatus pt ON pt.clinicid = i.ClinicID
WHERE i.OffIn = -1
  AND pt.status IS NULL

UNION ALL

SELECT
    i.ClinicID AS clinicid,
    i.DafirstVisit,
    i.OffIn,
    'Child' AS patient_type,
    'OffIn not set' AS issue_type
FROM tblcimain i
LEFT JOIN tblcvpatientstatus pt ON pt.clinicid = i.ClinicID
WHERE i.OffIn = -1
  AND pt.status IS NULL

ORDER BY patient_type, clinicid;
