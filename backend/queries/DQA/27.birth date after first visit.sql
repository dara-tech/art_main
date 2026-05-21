-- DQA 27: Date of birth after first visit date
SELECT
    i.ClinicID AS clinicid,
    i.DaBirth,
    i.DafirstVisit,
    'Adult' AS patient_type,
    'Birth date after first visit' AS issue_type
FROM tblaimain i
WHERE i.DaBirth IS NOT NULL
  AND i.DafirstVisit IS NOT NULL
  AND i.DaBirth > i.DafirstVisit

UNION ALL

SELECT
    i.ClinicID AS clinicid,
    i.DaBirth,
    i.DafirstVisit,
    'Child' AS patient_type,
    'Birth date after first visit' AS issue_type
FROM tblcimain i
WHERE i.DaBirth IS NOT NULL
  AND i.DafirstVisit IS NOT NULL
  AND i.DaBirth > i.DafirstVisit

ORDER BY patient_type, clinicid;
