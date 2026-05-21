-- DQA 22: Same ART on multiple clinic IDs (not explained by lost-and-return)
-- Lost-and-return patients get a new ClinicID; LClinicID (child) or TypeofReturn (adult) links to the prior ID.
WITH art_base AS (
    SELECT
        a.ClinicID AS clinicid,
        a.ART AS art_number,
        a.DaArt AS da_art,
        'Adult' AS patient_type
    FROM tblaart a
    WHERE IFNULL(a.ART, '') <> ''

    UNION ALL

    SELECT
        c.ClinicID AS clinicid,
        c.ART AS art_number,
        c.DaArt AS da_art,
        'Child' AS patient_type
    FROM tblcart c
    WHERE IFNULL(c.ART, '') <> ''
),
art_enriched AS (
    SELECT
        b.clinicid,
        b.art_number,
        b.da_art,
        b.patient_type,
        TRIM(
            IFNULL(
                CASE WHEN b.patient_type = 'Adult' THEN ia.LClinicID ELSE ic.LClinicID END,
                ''
            )
        ) AS l_clinic_id,
        CASE
            WHEN b.patient_type = 'Adult' THEN IFNULL(ia.TypeofReturn, -1)
            ELSE -1
        END AS typeof_return
    FROM art_base b
    LEFT JOIN tblaimain ia
        ON b.patient_type = 'Adult' AND ia.ClinicID = b.clinicid
    LEFT JOIN tblcimain ic
        ON b.patient_type = 'Child' AND ic.ClinicID = b.clinicid
),
lost_return_link AS (
    SELECT
        e.clinicid,
        e.art_number,
        e.da_art,
        e.patient_type,
        e.l_clinic_id,
        e.typeof_return,
        CASE
            WHEN e.l_clinic_id <> ''
                AND EXISTS (
                    SELECT 1
                    FROM art_enriched prior
                    WHERE prior.art_number = e.art_number
                      AND CAST(prior.clinicid AS CHAR) = e.l_clinic_id
                )
            THEN 1
            WHEN e.patient_type = 'Adult'
                AND e.typeof_return >= 0
            THEN 1
            ELSE 0
        END AS is_lost_return
    FROM art_enriched e
),
dup_art AS (
    SELECT lr.art_number
    FROM lost_return_link lr
    GROUP BY lr.art_number
    HAVING COUNT(DISTINCT lr.clinicid) > 1
),
dup_needs_review AS (
    SELECT lr.art_number
    FROM lost_return_link lr
    INNER JOIN dup_art d ON d.art_number = lr.art_number
    GROUP BY lr.art_number
    HAVING SUM(CASE WHEN lr.is_lost_return = 0 THEN 1 ELSE 0 END) >= 2
)
SELECT
    lr.clinicid,
    lr.art_number AS ART,
    lr.da_art AS DaArt,
    lr.patient_type,
    lr.l_clinic_id AS LClinicID,
    lr.typeof_return AS TypeofReturn,
    'Duplicate ART not lost-return' AS issue_type
FROM lost_return_link lr
INNER JOIN dup_needs_review d ON d.art_number = lr.art_number
WHERE lr.is_lost_return = 0
ORDER BY lr.art_number, lr.patient_type, lr.clinicid;
