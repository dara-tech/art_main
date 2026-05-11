-- TPT Start (reduced scan)

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
    SELECT ClinicID, ART
    FROM tblaart
    WHERE DaArt <= :EndDate

    UNION ALL

    SELECT ClinicID, ART
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
tbltptstart AS (
    WITH tbltptdrugs AS (
        SELECT DrugName, Status, Vid
        FROM tblavtptdrug
        WHERE DrugName != "B6"

        UNION ALL

        SELECT DrugName, Status, Vid
        FROM tblcvtptdrug
        WHERE DrugName != "B6"
    ),
    tptvisit AS (
        SELECT clinicid, DatVisit, vid
        FROM tblavmain
        WHERE DatVisit <= :EndDate

        UNION ALL

        SELECT clinicid, DatVisit, vid
        FROM tblcvmain
        WHERE DatVisit <= :EndDate
    ),
    tbltptall AS (
        SELECT
            v.clinicid,
            v.DatVisit,
            tp.Status
        FROM tbltptdrugs tp
        LEFT JOIN tptvisit v ON tp.vid = v.vid
    )
    SELECT clinicid
    FROM (
        SELECT
            clinicid,
            ROW_NUMBER() OVER (PARTITION BY clinicid ORDER BY DatVisit ASC) AS rn
        FROM tbltptall
        WHERE status = 0
          AND DatVisit <= :EndDate
    ) started
    WHERE rn = 1
)

SELECT
    '10.4. TPT Start' AS Indicator,
    IFNULL(SUM(IF(i.Sex = 1 AND i.typepatients = '≤14', 1, 0)), 0) AS Male_0_14,
    IFNULL(SUM(IF(i.Sex = 0 AND i.typepatients = '≤14', 1, 0)), 0) AS Female_0_14,
    IFNULL(SUM(IF(i.Sex = 1 AND i.typepatients = '15+', 1, 0)), 0) AS Male_over_14,
    IFNULL(SUM(IF(i.Sex = 0 AND i.typepatients = '15+', 1, 0)), 0) AS Female_over_14,
    IFNULL(COUNT(*), 0) AS TOTAL
FROM tblvisit v
LEFT JOIN tblimain i ON i.ClinicID = v.clinicid
LEFT JOIN tblart a ON a.ClinicID = v.clinicid
LEFT JOIN tblexit e ON e.clinicid = v.clinicid
LEFT JOIN tbltptstart tp ON tp.clinicid = v.clinicid
WHERE e.status IS NULL
  AND a.ART IS NOT NULL
  AND tp.clinicid IS NOT NULL;
