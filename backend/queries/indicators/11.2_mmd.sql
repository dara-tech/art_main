-- MMD (reduced scan)

WITH tblvisit AS (
    SELECT clinicid, DatVisit, DaApp
    FROM (
        SELECT
            clinicid,
            DatVisit,
            DaApp,
            ROW_NUMBER() OVER (PARTITION BY clinicid ORDER BY DatVisit DESC) AS rn
        FROM (
            SELECT clinicid, DatVisit, DaApp
            FROM tblavmain
            WHERE DatVisit <= :EndDate

            UNION ALL

            SELECT clinicid, DatVisit, DaApp
            FROM tblcvmain
            WHERE DatVisit <= :EndDate
        ) all_visits
    ) latest_visit
    WHERE rn = 1
),
tblimain AS (
    SELECT ClinicID, "15+" AS typepatients, Sex
    FROM tblaimain
    WHERE DafirstVisit <= :EndDate

    UNION ALL

    SELECT ClinicID, "≤14" AS typepatients, Sex
    FROM tblcimain
    WHERE DafirstVisit <= :EndDate
),
tblart AS (
    SELECT ClinicID, ART, TIMESTAMPDIFF(MONTH, DaArt, :EndDate) AS nmonthART
    FROM tblaart
    WHERE DaArt <= :EndDate

    UNION ALL

    SELECT ClinicID, ART, TIMESTAMPDIFF(MONTH, DaArt, :EndDate) AS nmonthART
    FROM tblcart
    WHERE DaArt <= :EndDate
),
tblexit AS (
    SELECT clinicid, status
    FROM tblavpatientstatus
    WHERE da <= :EndDate

    UNION ALL

    SELECT clinicid, status
    FROM tblcvpatientstatus
    WHERE da <= :EndDate
)

SELECT
    '10.2. MMD' AS Indicator,
    IFNULL(SUM(IF(i.Sex = 1 AND i.typepatients = '≤14', 1, 0)), 0) AS Male_0_14,
    IFNULL(SUM(IF(i.Sex = 0 AND i.typepatients = '≤14', 1, 0)), 0) AS Female_0_14,
    IFNULL(SUM(IF(i.Sex = 1 AND i.typepatients = '15+', 1, 0)), 0) AS Male_over_14,
    IFNULL(SUM(IF(i.Sex = 0 AND i.typepatients = '15+', 1, 0)), 0) AS Female_over_14,
    IFNULL(COUNT(*), 0) AS TOTAL
FROM tblvisit v
LEFT JOIN tblimain i ON i.ClinicID = v.clinicid
LEFT JOIN tblart a ON a.ClinicID = v.clinicid
LEFT JOIN tblexit e ON e.clinicid = v.clinicid
WHERE e.status IS NULL
  AND a.ART IS NOT NULL
  AND a.nmonthART >= 6
  AND CASE
      WHEN DATEDIFF(v.DaApp, v.DatVisit) <= 80 THEN 'Not-MMD'
      WHEN DATEDIFF(v.DaApp, v.DatVisit) BETWEEN 81 AND 100 THEN '3M'
      WHEN DATEDIFF(v.DaApp, v.DatVisit) BETWEEN 101 AND 130 THEN '4M'
      WHEN DATEDIFF(v.DaApp, v.DatVisit) BETWEEN 131 AND 160 THEN '5M'
      WHEN DATEDIFF(v.DaApp, v.DatVisit) >= 161 THEN '6M'
      ELSE 'Not-MMD'
  END IN ('3M', '4M', '5M', '6M');
