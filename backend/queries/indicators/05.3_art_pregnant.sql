-- Indicator 5.3: New ART patients who are pregnant (NCHADS quarterly report)
-- Pregnancy: tblavmain.Womenstatus = 0 (per schema: 0 = pregnant, 1 = not pregnant)
WITH tblnewartpregnant AS (
    SELECT
        'Adult' AS type,
        IF(p.Sex = 0, 'Female', 'Male') AS Sex,
        p.ClinicID,
        art.DaArt
    FROM tblaimain p
    JOIN tblaart art ON p.ClinicID = art.ClinicID
    JOIN tblavmain v ON p.ClinicID = v.ClinicID AND v.DatVisit = art.DaArt
    WHERE
        art.DaArt BETWEEN :StartDate AND :EndDate
        AND (p.OffIn IS NULL OR p.OffIn <> :transfer_in_code)
        AND (p.TypeofReturn IS NULL OR p.TypeofReturn = -1)
        AND p.Sex = 0
        AND v.Womenstatus = 0
)

SELECT
    '5.3. New ART patients who are pregnant' AS Indicator,
    IFNULL(COUNT(*), 0) AS TOTAL,
    0 AS Male_0_14,
    0 AS Female_0_14,
    0 AS Male_over_14,
    IFNULL(SUM(CASE WHEN type = 'Adult' AND Sex = 'Female' THEN 1 ELSE 0 END), 0) AS Female_over_14
FROM tblnewartpregnant;
