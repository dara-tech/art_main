-- Indicator 8.3: Transfer-out - Detailed Records (matching aggregate logic)
SELECT
    '8.3' as step,
    main.ClinicID as clinicid,
    art.ART as art_number,
    main.Sex as sex,
    CASE 
        WHEN main.Sex = 0 THEN 'Female'
        WHEN main.Sex = 1 THEN 'Male'
        ELSE 'Unknown'
    END as sex_display,
    '15+' as typepatients,
    main.DaBirth as DaBirth,
    main.DafirstVisit as DafirstVisit,
    main.OffIn as OffIn,
    'Adult' as patient_type,
    TIMESTAMPDIFF(YEAR, main.DaBirth, :EndDate) as age,
    CASE 
        WHEN main.OffIn = 0 THEN 'Not Transferred'
        WHEN main.OffIn = 2 THEN 'Transferred In'
        WHEN main.OffIn = 3 THEN 'Transferred Out'
        ELSE CONCAT('Status: ', main.OffIn)
    END as transfer_status,
    s.Da as transfer_date,
    s.Status as transfer_status_code
FROM tblaimain main 
LEFT JOIN tblaart art ON main.ClinicID = art.ClinicID
JOIN tblavpatientstatus s ON main.ClinicID = s.ClinicID
WHERE 
    s.Da BETWEEN :StartDate AND :EndDate 
    AND s.Status = :transfer_out_code

UNION ALL

SELECT
    '8.3' as step,
    main.ClinicID as clinicid,
    art.ART as art_number,
    main.Sex as sex,
    CASE 
        WHEN main.Sex = 0 THEN 'Female'
        WHEN main.Sex = 1 THEN 'Male'
        ELSE 'Unknown'
    END as sex_display,
    '≤14' as typepatients,
    main.DaBirth as DaBirth,
    main.DafirstVisit as DafirstVisit,
    main.OffIn as OffIn,
    'Child' as patient_type,
    TIMESTAMPDIFF(YEAR, main.DaBirth, :EndDate) as age,
    CASE 
        WHEN main.OffIn = 0 THEN 'Not Transferred'
        WHEN main.OffIn = 2 THEN 'Transferred In'
        WHEN main.OffIn = 3 THEN 'Transferred Out'
        ELSE CONCAT('Status: ', main.OffIn)
    END as transfer_status,
    s.Da as transfer_date,
    s.Status as transfer_status_code
FROM tblcimain main 
LEFT JOIN tblcart art ON main.ClinicID = art.ClinicID
JOIN tblcvpatientstatus s ON main.ClinicID = s.ClinicID
WHERE 
    s.Da BETWEEN :StartDate AND :EndDate 
    AND s.Status = :transfer_out_code
ORDER BY transfer_date DESC, clinicid;
