-- Indicator 3: Newly Enrolled
SELECT
    '3. Newly Enrolled' AS Indicator,
    IFNULL(COUNT(*), 0) AS TOTAL,
    IFNULL(SUM(CASE WHEN PatientList.type = 'Child' AND PatientList.Sex = 'Male' THEN 1 ELSE 0 END), 0) AS Male_0_14,
    IFNULL(SUM(CASE WHEN PatientList.type = 'Child' AND PatientList.Sex = 'Female' THEN 1 ELSE 0 END), 0) AS Female_0_14,
    IFNULL(SUM(CASE WHEN PatientList.type = 'Adult' AND PatientList.Sex = 'Male' THEN 1 ELSE 0 END), 0) AS Male_over_14,
    IFNULL(SUM(CASE WHEN PatientList.type = 'Adult' AND PatientList.Sex = 'Female' THEN 1 ELSE 0 END), 0) AS Female_over_14
FROM (
    -- Adults: Must have Pre-ART registration in quarter, NOT be a transfer-in, NOT be a lost-return patient, NOT be a refugee, and NO SiteNameold
    SELECT 'Adult' as type, IF(p.Sex=0, "Female", "Male") as Sex
    FROM tblaimain p 
    LEFT OUTER JOIN tblaart art ON p.ClinicID = art.ClinicID
    WHERE 
        p.DafirstVisit BETWEEN :StartDate AND :EndDate 
        AND (p.OffIn IS NULL OR p.OffIn <> :transfer_in_code)
        AND (p.TypeofReturn IS NULL OR p.TypeofReturn = -1)
        AND (p.Refugstatus IS NULL OR p.Refugstatus = -1)
        AND (p.SiteNameold IS NULL OR p.SiteNameold = '')
    GROUP BY p.ClinicID
    
    UNION ALL
    
    -- Children: Must have Pre-ART registration in quarter, NOT be a transfer-in, have empty LClinicID, and NO SiteNameold
    SELECT 'Child' as type, IF(p.Sex=0, "Female", "Male") as Sex
    FROM tblcimain p 
    LEFT OUTER JOIN tblcart art ON p.ClinicID = art.ClinicID
    WHERE 
        p.DaFirstVisit BETWEEN :StartDate AND :EndDate 
        AND (p.OffIn IS NULL OR p.OffIn <> :transfer_in_code)
        AND (p.LClinicID IS NULL OR p.LClinicID = '')
        AND (p.SiteNameold IS NULL OR p.SiteNameold = '')
    GROUP BY p.ClinicID
) AS PatientList;
