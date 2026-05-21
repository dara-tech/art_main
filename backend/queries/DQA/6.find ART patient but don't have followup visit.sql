-- DQA 06: On ART but no clinic visit recorded
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
    a.ClinicID AS clinicid,
    a.ART,
    a.DaArt,
    'Adult' AS patient_type,
    'No visit on record' AS issue_type
FROM tblaart a
LEFT JOIN latest_visit lv ON lv.clinicid = a.ClinicID
WHERE lv.clinicid IS NULL

UNION ALL

SELECT
    a.ClinicID AS clinicid,
    a.ART,
    a.DaArt,
    'Child' AS patient_type,
    'No visit on record' AS issue_type
FROM tblcart a
LEFT JOIN latest_visit lv ON lv.clinicid = a.ClinicID
WHERE lv.clinicid IS NULL

ORDER BY patient_type, clinicid;
