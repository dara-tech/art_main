-- Indicator 6: Number of transfer-in patients
-- This matches the old system logic exactly:
-- Adult: LEFT JOIN with tblaart (no ART requirement)
-- Child: LEFT JOIN with tblcart but requires tblcart.ClinicID IS NOT NULL
SELECT
    '6. Transfer-in patients' AS Indicator,
    IFNULL(COUNT(*), 0) AS TOTAL,
    IFNULL(SUM(CASE WHEN PatientList.type = 'Child' AND PatientList.Sex = 'Male' THEN 1 ELSE 0 END), 0) AS Male_0_14,
    IFNULL(SUM(CASE WHEN PatientList.type = 'Child' AND PatientList.Sex = 'Female' THEN 1 ELSE 0 END), 0) AS Female_0_14,
    IFNULL(SUM(CASE WHEN PatientList.type = 'Adult' AND PatientList.Sex = 'Male' THEN 1 ELSE 0 END), 0) AS Male_over_14,
    IFNULL(SUM(CASE WHEN PatientList.type = 'Adult' AND PatientList.Sex = 'Female' THEN 1 ELSE 0 END), 0) AS Female_over_14
FROM (
    -- Adult transfer-in patients: TypeofReturn = -1 (not lost and returned)
    SELECT 'Adult' as type, IF(p.Sex=0, 'Female', 'Male') as Sex 
    FROM tblaimain p 
    LEFT JOIN tblaart art ON p.ClinicID = art.ClinicID
    LEFT JOIN tblavpatientstatus pvs ON p.ClinicID = pvs.ClinicID
    WHERE p.DafirstVisit BETWEEN :StartDate AND :EndDate AND p.OffIn = 1
    AND p.TypeofReturn = -1
    UNION ALL
    -- Child transfer-in patients: LClinicID, ClinicIDold, SiteNameold all have values
    SELECT 'Child' as type, IF(p.Sex=0, 'Female', 'Male') as Sex 
    FROM tblcimain p 
    LEFT JOIN tblcart art ON p.ClinicID = art.ClinicID
    LEFT JOIN tblcvpatientstatus pvs ON p.ClinicID = pvs.ClinicID
    WHERE p.DafirstVisit BETWEEN :StartDate AND :EndDate AND p.OffIn = 1 
    AND art.ClinicID IS NOT NULL
    AND p.LClinicID IS NOT NULL AND p.LClinicID <> ''
    AND p.ClinicIDold IS NOT NULL AND p.ClinicIDold <> ''
    AND p.SiteNameold IS NOT NULL AND p.SiteNameold <> ''
) as PatientList;
