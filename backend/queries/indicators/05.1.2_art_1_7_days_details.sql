-- Indicator 5.1.2: New ART started: 1-7 days - Detailed Records
SELECT
    '5.1.2' as step,
    p.ClinicID as clinicid,
    art.ART as art_number,
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
    v.DatVisit as DatVisit,
    p.OffIn as OffIn,
    'Adult' as patient_type,
    TIMESTAMPDIFF(YEAR, p.DaBirth, :EndDate) as age,
    CASE 
        WHEN p.OffIn = 0 THEN 'Not Transferred'
        WHEN p.OffIn = 2 THEN 'Transferred In'
        WHEN p.OffIn = 3 THEN 'Transferred Out'
        ELSE CONCAT('Status: ', p.OffIn)
    END as transfer_status
FROM tblaimain p 
JOIN tblaart art ON p.ClinicID = art.ClinicID
JOIN tblavmain v ON p.ClinicID = v.ClinicID AND v.DatVisit = art.DaArt 
WHERE art.DaArt BETWEEN :StartDate AND :EndDate
    AND DATEDIFF(art.DaArt, p.DafirstVisit) BETWEEN 1 AND 7
    AND (p.TypeofReturn IS NULL OR p.TypeofReturn = -1)

UNION ALL

SELECT
    '5.1.2' as step,
    p.ClinicID as clinicid,
    art.ART as art_number,
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
    v.DatVisit as DatVisit,
    p.OffIn as OffIn,
    'Child' as patient_type,
    TIMESTAMPDIFF(YEAR, p.DaBirth, :EndDate) as age,
    CASE 
        WHEN p.OffIn = 0 THEN 'Not Transferred'
        WHEN p.OffIn = 2 THEN 'Transferred In'
        WHEN p.OffIn = 3 THEN 'Transferred Out'
        ELSE CONCAT('Status: ', p.OffIn)
    END as transfer_status
FROM tblcimain p 
JOIN tblcart art ON p.ClinicID = art.ClinicID
JOIN tblcvmain v ON p.ClinicID = v.ClinicID AND v.DatVisit = art.DaArt
WHERE art.DaArt BETWEEN :StartDate AND :EndDate
    AND DATEDIFF(art.DaArt, p.DafirstVisit) BETWEEN 1 AND 7
ORDER BY DaArt DESC, ClinicID;
