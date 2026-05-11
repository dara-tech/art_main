-- ===================================================================
-- Indicator 1 Detail: Percentage of ART patients who died
-- Lists patient-level records for all deaths within the reporting period.
-- ===================================================================

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
    main.DafirstVisit AS DafirstVisit,
    main.OffIn AS transfer_status_code,
    'Adult' AS patient_type,
    TIMESTAMPDIFF(YEAR, main.DaBirth, :EndDate) AS age,
    CASE 
        WHEN main.OffIn = 0 THEN 'Not Transferred'
        WHEN main.OffIn = 2 THEN 'Transferred In'
        WHEN main.OffIn = 3 THEN 'Transferred Out'
        ELSE CONCAT('Status: ', main.OffIn)
    END AS transfer_status,
    s.Da AS death_date,
    s.Status AS death_status_code,
    CASE 
        WHEN s.Place = 0 THEN 'Home'
        WHEN s.Place = 1 THEN 'Hospital'
        WHEN s.Place = 2 THEN COALESCE(s.OPlace, 'Other')
        ELSE 'Unknown'
    END AS death_place,
    CASE 
        WHEN s.Cause LIKE '%/%' THEN 
            CASE 
                WHEN SUBSTRING_INDEX(s.Cause, '/', -1) REGEXP '^[0-9]+$' THEN 
                    COALESCE(r.Reason, 'Unknown')
                ELSE 
                    CONCAT(
                        COALESCE(r.Reason, 'Unknown'), 
                        ' - ', 
                        SUBSTRING_INDEX(s.Cause, '/', -1)
                    )
            END
        ELSE COALESCE(r.Reason, s.Cause)
    END AS death_reason
FROM tblaimain main 
JOIN tblavpatientstatus s ON main.ClinicID = s.ClinicID
LEFT JOIN tblaart art ON main.ClinicID = art.ClinicID
LEFT JOIN tblreason r ON CAST(SUBSTRING_INDEX(s.Cause, '/', 1) AS UNSIGNED) = r.Rid
WHERE s.Da BETWEEN :StartDate AND :EndDate 
    AND s.Status = :dead_code

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
    main.DafirstVisit AS DafirstVisit,
    main.OffIn AS transfer_status_code,
    'Child' AS patient_type,
    TIMESTAMPDIFF(YEAR, main.DaBirth, :EndDate) AS age,
    CASE 
        WHEN main.OffIn = 0 THEN 'Not Transferred'
        WHEN main.OffIn = 2 THEN 'Transferred In'
        WHEN main.OffIn = 3 THEN 'Transferred Out'
        ELSE CONCAT('Status: ', main.OffIn)
    END AS transfer_status,
    s.Da AS death_date,
    s.Status AS death_status_code,
    CASE 
        WHEN s.Place = 0 THEN 'Home'
        WHEN s.Place = 1 THEN 'Hospital'
        WHEN s.Place = 2 THEN COALESCE(s.OPlace, 'Other')
        ELSE 'Unknown'
    END AS death_place,
    CASE 
        WHEN s.Cause LIKE '%/%' THEN 
            CASE 
                WHEN SUBSTRING_INDEX(s.Cause, '/', -1) REGEXP '^[0-9]+$' THEN 
                    COALESCE(r.Reason, 'Unknown')
                ELSE 
                    CONCAT(
                        COALESCE(r.Reason, 'Unknown'), 
                        ' - ', 
                        SUBSTRING_INDEX(s.Cause, '/', -1)
                    )
            END
        ELSE COALESCE(r.Reason, s.Cause)
    END AS death_reason
FROM tblcimain main 
JOIN tblcvpatientstatus s ON main.ClinicID = s.ClinicID
LEFT JOIN tblcart art ON main.ClinicID = art.ClinicID
LEFT JOIN tblreason r ON CAST(SUBSTRING_INDEX(s.Cause, '/', 1) AS UNSIGNED) = r.Rid
WHERE s.Da BETWEEN :StartDate AND :EndDate 
    AND s.Status = :dead_code

ORDER BY death_date DESC, clinicid;

