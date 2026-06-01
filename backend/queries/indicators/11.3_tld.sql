-- TLD (reduced scan)

WITH tblvisit AS (
    SELECT clinicid, vid
    FROM (
        SELECT
            clinicid,
            vid,
            ROW_NUMBER() OVER (PARTITION BY clinicid ORDER BY DatVisit DESC) AS rn
        FROM (
            SELECT clinicid, DatVisit, vid
            FROM tblavmain
            WHERE DatVisit <= :EndDate

            UNION ALL

            SELECT clinicid, DatVisit, vid
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
tblarvdrug AS (
    WITH tbldrug AS (
        SELECT
            vid,
            GROUP_CONCAT(DISTINCT DrugName ORDER BY DrugName ASC SEPARATOR '+') AS drugname
        FROM tblavarvdrug
        WHERE status <> 1
        GROUP BY vid

        UNION ALL

        SELECT
            vid,
            GROUP_CONCAT(DISTINCT DrugName ORDER BY DrugName ASC SEPARATOR '+') AS drugname
        FROM tblcvarvdrug
        WHERE status <> 1
        GROUP BY vid
    )
    SELECT vid, drugname
    FROM tbldrug
)

SELECT
    '11.3. TLD' AS Indicator,
    IFNULL(SUM(IF(i.Sex = 1 AND i.typepatients = '≤14', 1, 0)), 0) AS Male_0_14,
    IFNULL(SUM(IF(i.Sex = 0 AND i.typepatients = '≤14', 1, 0)), 0) AS Female_0_14,
    IFNULL(SUM(IF(i.Sex = 1 AND i.typepatients = '15+', 1, 0)), 0) AS Male_over_14,
    IFNULL(SUM(IF(i.Sex = 0 AND i.typepatients = '15+', 1, 0)), 0) AS Female_over_14,
    IFNULL(COUNT(*), 0) AS TOTAL
FROM tblvisit v
LEFT JOIN tblimain i ON i.ClinicID = v.clinicid
LEFT JOIN tblart a ON a.ClinicID = v.clinicid
LEFT JOIN tblexit e ON e.clinicid = v.clinicid
LEFT JOIN tblarvdrug rd ON rd.vid = v.vid
WHERE e.status IS NULL
  AND a.ART IS NOT NULL
  AND (
    LOCATE('3TC+DTG+TDF', rd.drugname) > 0
    OR (LEFT(i.ClinicID, 1) = 'P' AND LOCATE('DTG', rd.drugname) > 0)
  );
