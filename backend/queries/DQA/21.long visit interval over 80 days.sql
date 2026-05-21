-- DQA 21: Latest visit appointment gap over 80 days (active on ART)
WITH latest_visit AS (
    SELECT clinicid, DatVisit, DaApp, appt_gap
    FROM (
        SELECT
            clinicid,
            DatVisit,
            DaApp,
            DATEDIFF(DaApp, DatVisit) AS appt_gap,
            ROW_NUMBER() OVER (PARTITION BY clinicid ORDER BY DatVisit DESC) AS rn
        FROM (
            SELECT clinicid, DatVisit, DaApp FROM tblavmain
            UNION ALL
            SELECT clinicid, DatVisit, DaApp FROM tblcvmain
        ) v
        WHERE DatVisit IS NOT NULL
          AND DaApp IS NOT NULL
    ) x
    WHERE rn = 1
),
on_art AS (
    SELECT ClinicID AS clinicid, ART, DaArt, 'Adult' AS patient_type FROM tblaart
    UNION ALL
    SELECT ClinicID AS clinicid, ART, DaArt, 'Child' AS patient_type FROM tblcart
),
patient_exit AS (
    SELECT clinicid FROM tblavpatientstatus WHERE status IS NOT NULL
    UNION ALL
    SELECT clinicid FROM tblcvpatientstatus WHERE status IS NOT NULL
)
SELECT
    a.clinicid,
    a.ART,
    a.DaArt,
    lv.DatVisit,
    lv.DaApp,
    lv.appt_gap,
    a.patient_type,
    'Visit interval over 80 days' AS issue_type
FROM on_art a
INNER JOIN latest_visit lv ON lv.clinicid = a.clinicid
LEFT JOIN patient_exit ex ON ex.clinicid = a.clinicid
WHERE ex.clinicid IS NULL
  AND lv.appt_gap > 80
ORDER BY a.patient_type, a.clinicid;
