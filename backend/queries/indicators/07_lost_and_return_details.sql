-- Indicator 7: Lost and Return - Detailed Records (matching corrected aggregate logic)
SELECT
    p.ClinicID as clinicid,
    p.Sex as sex,
    CASE 
        WHEN p.Sex = 0 THEN 'Female'
        WHEN p.Sex = 1 THEN 'Male'
        ELSE 'Unknown'
    END as sex_display,
    '15+' as typepatients,
    p.DaBirth as DaBirth,
    p.DafirstVisit as DafirstVisit,
    art.DaArt as DaArt,
    p.OffIn as OffIn,
    'Adult' as patient_type,
    TIMESTAMPDIFF(YEAR, p.DaBirth, :EndDate) as age,
    CASE 
        WHEN p.OffIn = 0 THEN 'Not Transferred'
        WHEN p.OffIn = 2 THEN 'Transferred In'
        WHEN p.OffIn = 3 THEN 'Transferred Out'
        ELSE CONCAT('Status: ', p.OffIn)
    END as transfer_status,
    CASE 
        WHEN p.TypeofReturn = 0 THEN 'Lost and Return'
        WHEN p.TypeofReturn = 1 THEN 'Return'
        WHEN p.TypeofReturn = 2 THEN 'Transfer In'
        WHEN p.TypeofReturn = 3 THEN 'Transfer Out'
        WHEN p.TypeofReturn = 4 THEN 'Re-enrollment'
        ELSE CONCAT('Type: ', p.TypeofReturn)
    END as return_type,
    art.ART as art_number
FROM tblaimain p
LEFT OUTER JOIN tblaart art ON p.ClinicID = art.ClinicID
WHERE p.TypeofReturn IS NOT NULL 
    AND p.TypeofReturn >= 0
    AND p.DafirstVisit BETWEEN :StartDate AND :EndDate
GROUP BY p.Sex, art.ART, p.ClinicID

UNION ALL

SELECT
    p.ClinicID as clinicid,
    p.Sex as sex,
    CASE 
        WHEN p.Sex = 0 THEN 'Female'
        WHEN p.Sex = 1 THEN 'Male'
        ELSE 'Unknown'
    END as sex_display,
    '≤14' as typepatients,
    p.DaBirth as DaBirth,
    p.DafirstVisit as DafirstVisit,
    art.DaArt as DaArt,
    p.OffIn as OffIn,
    'Child' as patient_type,
    TIMESTAMPDIFF(YEAR, p.DaBirth, :EndDate) as age,
    CASE 
        WHEN p.OffIn = 0 THEN 'Not Transferred'
        WHEN p.OffIn = 2 THEN 'Transferred In'
        WHEN p.OffIn = 3 THEN 'Transferred Out'
        ELSE CONCAT('Status: ', p.OffIn)
    END as transfer_status,
    'Lost and Return' as return_type,
    art.ART as art_number
FROM tblcimain p
LEFT OUTER JOIN tblcart art ON p.ClinicID = art.ClinicID
WHERE p.LClinicID IS NOT NULL 
    AND p.LClinicID <> ''
    AND p.DafirstVisit BETWEEN :StartDate AND :EndDate
GROUP BY p.Sex, art.ART

ORDER BY DafirstVisit DESC, clinicid;
