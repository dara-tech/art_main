-- DQA 13: Exit or death date before year 2000
SELECT
    clinicid,
    status,
    da AS exit_date,
    'Adult' AS patient_type,
    'Exit date before 2000' AS issue_type
FROM tblavpatientstatus
WHERE da < '2000-01-01'

UNION ALL

SELECT
    clinicid,
    status,
    da AS exit_date,
    'Child' AS patient_type,
    'Exit date before 2000' AS issue_type
FROM tblcvpatientstatus
WHERE da < '2000-01-01'

ORDER BY patient_type, clinicid, exit_date;
