-- Latest patient status at or before :EndDate (for visualize period compare).
WITH patient_exit AS (
    SELECT clinicid, status, da
    FROM (
        SELECT ClinicID AS clinicid, Status AS status, Da AS da
        FROM tblavpatientstatus
        WHERE Da <= :EndDate
        UNION ALL
        SELECT ClinicID AS clinicid, Status AS status, Da AS da
        FROM tblcvpatientstatus
        WHERE Da <= :EndDate
    ) s
),
latest_exit AS (
    SELECT clinicid, status, da
    FROM (
        SELECT
            clinicid,
            status,
            da,
            ROW_NUMBER() OVER (PARTITION BY clinicid ORDER BY da DESC) AS rn
        FROM patient_exit
    ) x
    WHERE rn = 1
),
tblart AS (
    SELECT ClinicID AS clinicid
    FROM tblaart
    WHERE DaArt <= :EndDate
    UNION
    SELECT ClinicID AS clinicid
    FROM tblcart
    WHERE DaArt <= :EndDate
)
SELECT
  'compare' AS step,
  art.clinicid,
  le.status AS patient_status_code,
  le.da AS patient_status_date,
  CASE
    WHEN le.status IS NULL THEN 'Active ART'
    WHEN le.status = :dead_code THEN 'Dead'
    WHEN le.status = :lost_code THEN 'Lost to follow up (LTFU)'
    WHEN le.status = :transfer_out_code THEN 'Transfer-out'
    ELSE CONCAT('Exit (', le.status, ')')
  END AS patient_status_label
FROM tblart art
LEFT JOIN latest_exit le ON le.clinicid = art.clinicid
ORDER BY art.clinicid;
