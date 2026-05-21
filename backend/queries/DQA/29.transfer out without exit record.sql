-- DQA 29: Marked transfer-out (OffIn) but no exit/outcome record
SELECT
    i.ClinicID AS clinicid,
    i.OffIn,
    i.DafirstVisit,
    'Adult' AS patient_type,
    'Transfer out without exit record' AS issue_type
FROM tblaimain i
LEFT JOIN tblavpatientstatus pt ON pt.clinicid = i.ClinicID
WHERE i.OffIn = 3
  AND pt.status IS NULL

UNION ALL

SELECT
    i.ClinicID AS clinicid,
    i.OffIn,
    i.DafirstVisit,
    'Child' AS patient_type,
    'Transfer out without exit record' AS issue_type
FROM tblcimain i
LEFT JOIN tblcvpatientstatus pt ON pt.clinicid = i.ClinicID
WHERE i.OffIn = 3
  AND pt.status IS NULL

ORDER BY patient_type, clinicid;
