-- Indicator 7: Lost and Return
-- Corrected to match old VB.NET implementation exactly
SELECT
    '7. Lost and Return' AS Indicator,
    IFNULL(COUNT(*), 0) AS TOTAL,
    IFNULL(SUM(CASE WHEN PatientList.type = 'Child' AND PatientList.Sex = 'Male' THEN 1 ELSE 0 END), 0) AS Male_0_14,
    IFNULL(SUM(CASE WHEN PatientList.type = 'Child' AND PatientList.Sex = 'Female' THEN 1 ELSE 0 END), 0) AS Female_0_14,
    IFNULL(SUM(CASE WHEN PatientList.type = 'Adult' AND PatientList.Sex = 'Male' THEN 1 ELSE 0 END), 0) AS Male_over_14,
    IFNULL(SUM(CASE WHEN PatientList.type = 'Adult' AND PatientList.Sex = 'Female' THEN 1 ELSE 0 END), 0) AS Female_over_14
FROM (
    -- Adult Lost & Return: TypeofReturn <> -1 AND DafirstVisit in quarter
    SELECT 'Adult' as type, IF(p.Sex=0, 'Female', 'Male') as Sex
    FROM tblaimain p
    LEFT OUTER JOIN tblaart art ON p.ClinicID = art.ClinicID
    WHERE p.TypeofReturn IS NOT NULL
      AND p.TypeofReturn >= 0
      AND p.DafirstVisit BETWEEN :StartDate AND :EndDate
    GROUP BY p.Sex, art.ART, p.ClinicID
    
    UNION ALL
    
    -- Child Lost & Return: LClinicID <> '' AND DafirstVisit in quarter
    SELECT 'Child' as type, IF(p.Sex=0, 'Female', 'Male') as Sex
    FROM tblcimain p
    LEFT OUTER JOIN tblcart art ON p.ClinicID = art.ClinicID
    WHERE p.LClinicID IS NOT NULL
      AND p.LClinicID <> ''
      AND p.DafirstVisit BETWEEN :StartDate AND :EndDate
    GROUP BY p.Sex, art.ART
) as PatientList;
