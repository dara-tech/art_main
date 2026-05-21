-- DQA 09: HIV positive date not entered (shows 01-Jan-1900)
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
    i.DaHIV AS hiv_positive_date,
    'Adult' AS patient_type,
    'Invalid HIV positive date' AS issue_type
FROM tblaimain i
INNER JOIN latest_visit lv ON lv.clinicid = i.ClinicID
LEFT JOIN tblavpatientstatus pt ON pt.clinicid = i.ClinicID
WHERE pt.status IS NULL
  AND i.DaHIV = '1900-01-01'

UNION ALL

SELECT
    i.ClinicID AS clinicid,
    i.DafirstVisit,
    lv.DatVisit,
    i.DaTest AS hiv_positive_date,
    'Child' AS patient_type,
    'Invalid HIV positive date' AS issue_type
FROM tblcimain i
INNER JOIN latest_visit lv ON lv.clinicid = i.ClinicID
LEFT JOIN tblcvpatientstatus pt ON pt.clinicid = i.ClinicID
WHERE pt.status IS NULL
  AND i.DaTest = '1900-01-01'

ORDER BY patient_type, clinicid;
