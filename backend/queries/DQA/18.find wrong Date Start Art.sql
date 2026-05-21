-- DQA 18: ART start date missing or before year 2000
SELECT
    ClinicID AS clinicid,
    ART,
    DaArt,
    'Adult' AS patient_type,
    'ART start before 2000' AS issue_type
FROM tblaart
WHERE DaArt < '2000-01-01'

UNION ALL

SELECT
    ClinicID AS clinicid,
    ART,
    DaArt,
    'Child' AS patient_type,
    'ART start before 2000' AS issue_type
FROM tblcart
WHERE DaArt < '2000-01-01'

ORDER BY patient_type, clinicid;
