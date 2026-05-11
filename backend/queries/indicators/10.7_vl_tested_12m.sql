-- Indicator 10.7: VL tested in 12M (visit-based logic, reduced scan)
WITH tblvisit AS (
    SELECT clinicid
    FROM (
        SELECT
            clinicid,
            ROW_NUMBER() OVER (PARTITION BY clinicid ORDER BY DatVisit DESC) AS rn
        FROM (
            SELECT clinicid, DatVisit
            FROM tblavmain
            WHERE DatVisit <= :EndDate

            UNION ALL

            SELECT clinicid, DatVisit
            FROM tblcvmain
            WHERE DatVisit <= :EndDate
        ) all_visits
    ) latest_visit
    WHERE rn = 1
),
tblimain AS (
    SELECT
        ClinicID,
        "15+" AS typepatients,
        Sex
    FROM tblaimain
    WHERE DafirstVisit <= :EndDate

    UNION ALL

    SELECT
        ClinicID,
        "≤14" AS typepatients,
        Sex
    FROM tblcimain
    WHERE DafirstVisit <= :EndDate
),
tblart AS (
    SELECT
        ClinicID,
        ART,
        TIMESTAMPDIFF(MONTH, DaArt, :EndDate) AS nmonthART
    FROM tblaart
    WHERE DaArt <= :EndDate

    UNION ALL

    SELECT
        ClinicID,
        ART,
        TIMESTAMPDIFF(MONTH, DaArt, :EndDate) AS nmonthART
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
),
tblvltested AS (
    SELECT
        ClinicID,
        DateResult
    FROM (
        SELECT
            ClinicID,
            IF(DaArrival < Dat, Dat, DaArrival) AS DateResult,
            ROW_NUMBER() OVER (
                PARTITION BY ClinicID
                ORDER BY IF(DaArrival < Dat, Dat, DaArrival) DESC
            ) AS rn
        FROM tblpatienttest
        WHERE HIVLoad != ''
          AND IF(DaArrival < Dat, Dat, DaArrival) <= :EndDate
    ) latest_vl
    WHERE rn = 1
)

SELECT
    '10.7. VL tested in 12M' AS Indicator,
    IFNULL(COUNT(*), 0) AS TOTAL,
    IFNULL(SUM(CASE WHEN i.typepatients = '≤14' AND i.Sex = 1 THEN 1 ELSE 0 END), 0) AS Male_0_14,
    IFNULL(SUM(CASE WHEN i.typepatients = '≤14' AND i.Sex = 0 THEN 1 ELSE 0 END), 0) AS Female_0_14,
    IFNULL(SUM(CASE WHEN i.typepatients = '15+' AND i.Sex = 1 THEN 1 ELSE 0 END), 0) AS Male_over_14,
    IFNULL(SUM(CASE WHEN i.typepatients = '15+' AND i.Sex = 0 THEN 1 ELSE 0 END), 0) AS Female_over_14
FROM tblvisit v
LEFT JOIN tblimain i ON i.ClinicID = v.clinicid
LEFT JOIN tblart a ON a.ClinicID = v.clinicid
LEFT JOIN tblexit e ON e.clinicid = v.clinicid
LEFT JOIN tblvltested vl ON vl.ClinicID = v.clinicid
WHERE e.status IS NULL
  AND a.ART IS NOT NULL
  AND a.nmonthART >= 6
  AND vl.DateResult IS NOT NULL
  AND vl.DateResult > DATE_SUB(:EndDate, INTERVAL 1 YEAR);