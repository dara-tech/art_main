-- DQA 17: Invalid ART number format or length
WITH art_check AS (
    SELECT
        ClinicID AS clinicid,
        ART,
        DaArt,
        CASE
            WHEN LEFT(ART, 1) = 'P' AND LENGTH(ART) <> 10 THEN 'Wrong ART (P prefix)'
            WHEN LEFT(ART, 1) <> 'P' AND LENGTH(ART) <> 9 THEN 'Wrong ART (non-P)'
            ELSE NULL
        END AS issue_type
    FROM tblaart
    UNION ALL
    SELECT
        ClinicID,
        ART,
        DaArt,
        CASE
            WHEN LEFT(ART, 1) = 'P' AND LENGTH(ART) <> 10 THEN 'Wrong ART (P prefix)'
            WHEN LEFT(ART, 1) <> 'P' AND LENGTH(ART) <> 9 THEN 'Wrong ART (non-P)'
            ELSE NULL
        END
    FROM tblcart
)
SELECT clinicid, ART, DaArt, issue_type
FROM art_check
WHERE issue_type IS NOT NULL
ORDER BY clinicid;
