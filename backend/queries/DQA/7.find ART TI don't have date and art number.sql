-- DQA 07: Transfer-in patient missing ART start date or ART number
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
    a.DaArt,
    a.ART,
    i.OffIn,
    'Adult' AS patient_type,
    'TI missing ART date or number' AS issue_type
FROM tblaimain i
LEFT JOIN latest_visit lv ON lv.clinicid = i.ClinicID
LEFT JOIN tblaart a ON a.ClinicID = i.ClinicID
LEFT JOIN tblavpatientstatus pt ON pt.clinicid = i.ClinicID
WHERE i.OffIn = 1
  AND pt.status IS NULL
  AND (a.DaArt < '2000-01-01' OR IFNULL(a.ART, '') = '')

UNION ALL

SELECT
    i.ClinicID AS clinicid,
    i.DafirstVisit,
    lv.DatVisit,
    a.DaArt,
    a.ART,
    i.OffIn,
    'Child' AS patient_type,
    'TI missing ART date or number' AS issue_type
FROM tblcimain i
LEFT JOIN latest_visit lv ON lv.clinicid = i.ClinicID
LEFT JOIN tblcart a ON a.ClinicID = i.ClinicID
LEFT JOIN tblcvpatientstatus pt ON pt.clinicid = i.ClinicID
WHERE i.OffIn = 1
  AND pt.status IS NULL
  AND (a.DaArt < '2000-01-01' OR IFNULL(a.ART, '') = '')

ORDER BY patient_type, clinicid;
