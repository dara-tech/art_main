-- DQA 20: On ART 6+ months but no VL test in the last 12 months
WITH art_patients AS (
    SELECT ClinicID AS clinicid, ART, DaArt, 'Adult' AS patient_type
    FROM tblaart
    WHERE DaArt IS NOT NULL
      AND DaArt < DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
    UNION ALL
    SELECT ClinicID AS clinicid, ART, DaArt, 'Child' AS patient_type
    FROM tblcart
    WHERE DaArt IS NOT NULL
      AND DaArt < DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
),
patient_exit AS (
    SELECT clinicid FROM tblavpatientstatus WHERE status IS NOT NULL
    UNION ALL
    SELECT clinicid FROM tblcvpatientstatus WHERE status IS NOT NULL
),
last_vl AS (
    SELECT
        ClinicID AS clinicid,
        MAX(COALESCE(NULLIF(DaCollect, '1900-12-31'), Dat)) AS last_vl_date
    FROM tblpatienttest
    WHERE HIVLoad IS NOT NULL
      AND TRIM(HIVLoad) <> ''
      AND HIVLoad NOT LIKE '%<%'
    GROUP BY ClinicID
)
SELECT
    ap.clinicid,
    ap.ART,
    ap.DaArt,
    ap.patient_type,
    lv.last_vl_date,
    CASE
        WHEN lv.clinicid IS NULL THEN 'No VL on record'
        ELSE 'No VL in 12 months'
    END AS issue_type
FROM art_patients ap
LEFT JOIN patient_exit ex ON ex.clinicid = ap.clinicid
LEFT JOIN last_vl lv ON lv.clinicid = ap.clinicid
WHERE ex.clinicid IS NULL
  AND (lv.clinicid IS NULL OR lv.last_vl_date < DATE_SUB(CURDATE(), INTERVAL 12 MONTH))
ORDER BY ap.patient_type, ap.clinicid;
