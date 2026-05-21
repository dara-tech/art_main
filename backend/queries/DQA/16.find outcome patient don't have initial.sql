-- DQA 16: Exit/outcome recorded but patient registration missing
SELECT
    pt.clinicid,
    pt.status,
    pt.da AS exit_date,
    'Adult' AS patient_type,
    'Exit without initial form' AS issue_type
FROM tblavpatientstatus pt
LEFT JOIN tblaimain i ON i.ClinicID = pt.clinicid
WHERE i.ClinicID IS NULL

UNION ALL

SELECT
    pt.clinicid,
    pt.status,
    pt.da AS exit_date,
    'Child' AS patient_type,
    'Exit without initial form' AS issue_type
FROM tblcvpatientstatus pt
LEFT JOIN tblcimain i ON i.ClinicID = pt.clinicid
WHERE i.ClinicID IS NULL

ORDER BY patient_type, clinicid;
