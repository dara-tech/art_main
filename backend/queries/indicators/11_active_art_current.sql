-- Indicator 11: Number of active ART patients in this quarter
-- Safe for single-site and country-level (warehouse) execution
WITH tblvisit AS (
    SELECT site_code, clinicid
    FROM (
        SELECT
            site_code,
            clinicid,
            ROW_NUMBER() OVER (PARTITION BY site_code, clinicid ORDER BY DatVisit DESC) AS rn
        FROM (
            SELECT site_code, clinicid, DatVisit
            FROM tblavmain
            WHERE DatVisit <= :EndDate

            UNION ALL

            SELECT site_code, clinicid, DatVisit
            FROM tblcvmain
            WHERE DatVisit <= :EndDate
        ) all_visits
    ) latest_visit
    WHERE rn = 1
),

tblimain AS (
    SELECT
        site_code,
        ClinicID,
        "15+" AS typepatients,
        Sex
    FROM tblaimain
    WHERE DafirstVisit <= :EndDate

    UNION ALL

    SELECT
        site_code,
        ClinicID,
        "≤14" AS typepatients,
        Sex
    FROM tblcimain
    WHERE DafirstVisit <= :EndDate
),

tblart AS (
    SELECT site_code, ClinicID, ART
    FROM tblaart
    WHERE DaArt <= :EndDate

    UNION ALL

    SELECT site_code, ClinicID, ART
    FROM tblcart
    WHERE DaArt <= :EndDate
),

tblexit AS (
    SELECT site_code, clinicid, status
    FROM tblavpatientstatus
    WHERE da <= :EndDate

    UNION ALL

    SELECT site_code, clinicid, status
    FROM tblcvpatientstatus
    WHERE da <= :EndDate
)

SELECT
    '11. Active ART patients at end of this quarter' AS Indicator,
    IFNULL(COUNT(*), 0) AS TOTAL,
    IFNULL(SUM(CASE WHEN typepatients = '≤14' AND Sex = 1 THEN 1 ELSE 0 END), 0) AS Male_0_14,
    IFNULL(SUM(CASE WHEN typepatients = '≤14' AND Sex = 0 THEN 1 ELSE 0 END), 0) AS Female_0_14,
    IFNULL(SUM(CASE WHEN typepatients = '15+' AND Sex = 1 THEN 1 ELSE 0 END), 0) AS Male_over_14,
    IFNULL(SUM(CASE WHEN typepatients = '15+' AND Sex = 0 THEN 1 ELSE 0 END), 0) AS Female_over_14
FROM tblvisit v
LEFT JOIN tblimain i 
    ON (i.site_code = v.site_code OR i.site_code IS NULL OR v.site_code IS NULL) 
   AND i.ClinicID = v.clinicid
LEFT JOIN tblart a 
    ON (a.site_code = v.site_code OR a.site_code IS NULL OR v.site_code IS NULL) 
   AND a.ClinicID = v.clinicid
LEFT JOIN tblexit e 
    ON (e.site_code = v.site_code OR e.site_code IS NULL OR v.site_code IS NULL) 
   AND e.clinicid = v.clinicid
WHERE e.status IS NULL
  AND a.ART IS NOT NULL;
