-- Indicator 8.1: Dead - Detailed Records (matching aggregate logic exactly)
SELECT
    main.ClinicID as clinicid,
    art.ART as art_number,
    main.Sex as sex,
    CASE 
        WHEN main.Sex = 0 THEN 'Female'
        WHEN main.Sex = 1 THEN 'Male'
        ELSE 'Unknown'
    END as sex_display,
    '15+' as typepatients,
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
    s.Da as death_date,
    s.Status as death_status,
    CASE 
        WHEN s.Place = 0 THEN 'Home'
        WHEN s.Place = 1 THEN 'Hospital'
        WHEN s.Place = 2 THEN COALESCE(s.OPlace, 'Other')
        ELSE 'Unknown'
    END as death_place,
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
    END as death_reason
FROM tblaimain main 
JOIN tblavpatientstatus s ON main.ClinicID = s.ClinicID
LEFT JOIN tblaart art ON main.ClinicID = art.ClinicID
LEFT JOIN tblreason r ON CAST(SUBSTRING_INDEX(s.Cause, '/', 1) AS UNSIGNED) = r.Rid
WHERE s.Da BETWEEN :StartDate AND :EndDate 
    AND s.Status = :dead_code

UNION ALL

SELECT
    main.ClinicID as clinicid,
    art.ART as art_number,
    main.Sex as sex,
    CASE 
        WHEN main.Sex = 0 THEN 'Female'
        WHEN main.Sex = 1 THEN 'Male'
        ELSE 'Unknown'
    END as sex_display,
    '≤14' as typepatients,
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
    s.Da as death_date,
    s.Status as death_status,
    CASE 
        WHEN s.Place = 0 THEN 'Home'
        WHEN s.Place = 1 THEN 'Hospital'
        WHEN s.Place = 2 THEN COALESCE(s.OPlace, 'Other')
        ELSE 'Unknown'
    END as death_place,
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
    END as death_reason
FROM tblcimain main 
JOIN tblcvpatientstatus s ON main.ClinicID = s.ClinicID
LEFT JOIN tblcart art ON main.ClinicID = art.ClinicID
LEFT JOIN tblreason r ON CAST(SUBSTRING_INDEX(s.Cause, '/', 1) AS UNSIGNED) = r.Rid
WHERE s.Da BETWEEN :StartDate AND :EndDate 
    AND s.Status = :dead_code
ORDER BY death_date DESC, clinicid;
