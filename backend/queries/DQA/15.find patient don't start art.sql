-- DQA 15: Active patient not started on ART
SELECT
    i.ClinicID AS clinicid,
    i.DafirstVisit,
    'Adult' AS patient_type,
    'No ART record' AS issue_type
FROM tblaimain i
LEFT JOIN tblaart a ON a.ClinicID = i.ClinicID
LEFT JOIN tblavpatientstatus pt ON pt.clinicid = i.ClinicID
WHERE pt.status IS NULL
  AND a.ClinicID IS NULL

UNION ALL

SELECT
    i.ClinicID AS clinicid,
    i.DafirstVisit,
    'Child' AS patient_type,
    'No ART record' AS issue_type
FROM tblcimain i
LEFT JOIN tblcart a ON a.ClinicID = i.ClinicID
LEFT JOIN tblcvpatientstatus pt ON pt.clinicid = i.ClinicID
WHERE pt.status IS NULL
  AND a.ClinicID IS NULL

ORDER BY patient_type, clinicid;
