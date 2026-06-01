-- Indicator 5.3: New ART patients who are pregnant - Detailed Records
SELECT
    '5.3' AS step,
    p.ClinicID AS clinicid,
    art.ART AS art_number,
    p.Sex AS sex,
    'Female' AS sex_display,
    '15+' AS typepatients,
    p.DaBirth AS DaBirth,
    p.DafirstVisit AS DafirstVisit,
    art.DaArt AS DaArt,
    v.DatVisit AS DatVisit,
    p.OffIn AS OffIn,
    'Adult' AS patient_type,
    TIMESTAMPDIFF(YEAR, p.DaBirth, :EndDate) AS age,
    v.Womenstatus AS Womenstatus,
    v.DaPreg AS DaPreg,
    CASE
        WHEN p.OffIn = 0 THEN 'Not Transferred'
        WHEN p.OffIn = 2 THEN 'Transferred In'
        WHEN p.OffIn = 3 THEN 'Transferred Out'
        ELSE CONCAT('Status: ', p.OffIn)
    END AS transfer_status
FROM tblaimain p
JOIN tblaart art ON p.ClinicID = art.ClinicID
JOIN tblavmain v ON p.ClinicID = v.ClinicID AND v.DatVisit = art.DaArt
WHERE
    art.DaArt BETWEEN :StartDate AND :EndDate
    AND (p.OffIn IS NULL OR p.OffIn <> :transfer_in_code)
    AND (p.TypeofReturn IS NULL OR p.TypeofReturn = -1)
    AND p.Sex = 0
    AND v.Womenstatus = 0
ORDER BY DaArt DESC, ClinicID;
