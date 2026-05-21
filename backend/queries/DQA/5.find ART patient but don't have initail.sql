-- DQA 05: ART number exists but patient registration missing
SELECT
    a.ClinicID AS clinicid,
    a.ART,
    a.DaArt,
    'Adult' AS patient_type,
    'ART without initial form' AS issue_type
FROM tblaart a
LEFT JOIN tblaimain i ON i.ClinicID = a.ClinicID
WHERE i.ClinicID IS NULL

UNION ALL

SELECT
    a.ClinicID AS clinicid,
    a.ART,
    a.DaArt,
    'Child' AS patient_type,
    'ART without initial form' AS issue_type
FROM tblcart a
LEFT JOIN tblcimain i ON i.ClinicID = a.ClinicID
WHERE i.ClinicID IS NULL

ORDER BY patient_type, clinicid;
