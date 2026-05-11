-- Indicator 5.1.1: New ART started: Same day
SELECT
    '5.1.1. New ART started: Same day' AS Indicator,
    IFNULL(COUNT(*), 0) AS TOTAL,
    IFNULL(SUM(CASE WHEN PatientList.type = 'Child' AND PatientList.Sex = 'Male' THEN 1 ELSE 0 END), 0) AS Male_0_14,
    IFNULL(SUM(CASE WHEN PatientList.type = 'Child' AND PatientList.Sex = 'Female' THEN 1 ELSE 0 END), 0) AS Female_0_14,
    IFNULL(SUM(CASE WHEN PatientList.type = 'Adult' AND PatientList.Sex = 'Male' THEN 1 ELSE 0 END), 0) AS Male_over_14,
    IFNULL(SUM(CASE WHEN PatientList.type = 'Adult' AND PatientList.Sex = 'Female' THEN 1 ELSE 0 END), 0) AS Female_over_14
FROM (
    -- Adults: Must not be a lost-return patient or transfer-in patient
    SELECT 'Adult' as type, IF(p.Sex=0, "Female", "Male") as Sex FROM tblaimain p JOIN tblaart art ON p.ClinicID = art.ClinicID WHERE art.DaArt BETWEEN :StartDate AND :EndDate AND DATEDIFF(art.DaArt, p.DafirstVisit) = 0 AND (p.OffIn IS NULL OR p.OffIn <> :transfer_in_code) AND (p.TypeofReturn IS NULL OR p.TypeofReturn = -1)
    UNION ALL
    -- Children
    SELECT 'Child' as type, IF(p.Sex=0, "Female", "Male") as Sex FROM tblcimain p JOIN tblcart art ON p.ClinicID = art.ClinicID WHERE art.DaArt BETWEEN :StartDate AND :EndDate AND DATEDIFF(art.DaArt, p.DafirstVisit) = 0
) as PatientList;
