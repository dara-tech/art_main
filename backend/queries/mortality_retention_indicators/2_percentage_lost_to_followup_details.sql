-- Indicator 2 detail: Percentage of ART patients who were lost to follow-up
-- Mirrors the logic from indicator 8.2 detail query to surface patient-level records.

SELECT
    main.ClinicID AS clinicid,
    art.ART AS art_number,
    main.Sex AS sex,
    CASE 
        WHEN main.Sex = 0 THEN 'Female'
        WHEN main.Sex = 1 THEN 'Male'
        ELSE 'Unknown'
    END AS sex_display,
    '15+' AS typepatients,
    main.DaBirth AS DaBirth,
    main.DafirstVisit AS DafirstVisit,
    main.OffIn AS OffIn,
    'Adult' AS patient_type,
    TIMESTAMPDIFF(YEAR, main.DaBirth, :EndDate) AS age,
    CASE 
        WHEN main.OffIn = 0 THEN 'Not Transferred'
        WHEN main.OffIn = 2 THEN 'Transferred In'
        WHEN main.OffIn = 3 THEN 'Transferred Out'
        ELSE CONCAT('Status: ', main.OffIn)
    END AS transfer_status,
    s.Da AS ltf_date,
    s.Status AS ltf_status_code
FROM tblaimain main 
LEFT JOIN tblaart art ON main.ClinicID = art.ClinicID
JOIN tblavpatientstatus s ON main.ClinicID = s.ClinicID
WHERE s.Da BETWEEN :StartDate AND :EndDate 
    AND s.Status = :lost_code

UNION ALL

SELECT
    main.ClinicID AS clinicid,
    art.ART AS art_number,
    main.Sex AS sex,
    CASE 
        WHEN main.Sex = 0 THEN 'Female'
        WHEN main.Sex = 1 THEN 'Male'
        ELSE 'Unknown'
    END AS sex_display,
    '≤14' AS typepatients,
    main.DaBirth AS DaBirth,
    main.DafirstVisit AS DafirstVisit,
    main.OffIn AS OffIn,
    'Child' AS patient_type,
    TIMESTAMPDIFF(YEAR, main.DaBirth, :EndDate) AS age,
    CASE 
        WHEN main.OffIn = 0 THEN 'Not Transferred'
        WHEN main.OffIn = 2 THEN 'Transferred In'
        WHEN main.OffIn = 3 THEN 'Transferred Out'
        ELSE CONCAT('Status: ', main.OffIn)
    END AS transfer_status,
    s.Da AS ltf_date,
    s.Status AS ltf_status_code
FROM tblcimain main 
LEFT JOIN tblcart art ON main.ClinicID = art.ClinicID
JOIN tblcvpatientstatus s ON main.ClinicID = s.ClinicID
WHERE s.Da BETWEEN :StartDate AND :EndDate 
    AND s.Status = :lost_code

ORDER BY ltf_date DESC, clinicid;

