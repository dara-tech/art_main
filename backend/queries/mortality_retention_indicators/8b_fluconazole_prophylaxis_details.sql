-- ===================================================================
-- Indicator 8b detail: Percentage of patients with CD4 < 100 receiving Fluconazole prophylaxis
-- Returns patient-level records for patients with CD4 < 100 and their prophylaxis status
-- ===================================================================

WITH patients_with_low_cd4 AS (
    -- Adults with CD4 < 100
    SELECT 
        'Adult' as type,
        IF(p.Sex=0, "Female", "Male") as Sex,
        p.ClinicID,
        p.DaBirth,
        pt.CD4 as LatestCD4,
        pt.Dat as CD4TestDate
    FROM tblaimain p 
    JOIN tblpatienttest pt ON CONVERT(p.ClinicID, CHAR) = pt.ClinicID
    WHERE 
        pt.CD4 IS NOT NULL 
        AND TRIM(pt.CD4) <> ''
        AND TRIM(pt.CD4) <> '0'
        AND pt.Dat IS NOT NULL
        AND pt.Dat <> '0000-00-00'
        AND pt.Dat BETWEEN :StartDate AND :EndDate
        AND CAST(TRIM(pt.CD4) AS UNSIGNED) < 100
        AND (p.OffIn IS NULL OR p.OffIn <> 1)
    
    UNION ALL
    
    -- Children with CD4 < 100
    SELECT 
        'Child' as type,
        IF(p.Sex=0, "Female", "Male") as Sex,
        p.ClinicID,
        p.DaBirth,
        pt.CD4 as LatestCD4,
        pt.Dat as CD4TestDate
    FROM tblcimain p 
    JOIN tblpatienttest pt ON p.ClinicID = pt.ClinicID
    WHERE 
        pt.CD4 IS NOT NULL 
        AND TRIM(pt.CD4) <> ''
        AND TRIM(pt.CD4) <> '0'
        AND pt.Dat IS NOT NULL
        AND pt.Dat <> '0000-00-00'
        AND pt.Dat BETWEEN :StartDate AND :EndDate
        AND CAST(TRIM(pt.CD4) AS UNSIGNED) < 100
        AND (p.OffIn IS NULL OR p.OffIn <> 1)
),

tblfluconazole AS (
    SELECT 
        p.type,
        p.Sex,
        p.ClinicID,
        p.DaBirth,
        p.LatestCD4,
        p.CD4TestDate,
        CASE 
            WHEN p.type = 'Adult' AND EXISTS (
                SELECT 1 FROM tblavarvdrug ard
                JOIN tblavmain v ON ard.Vid = v.Vid
                WHERE v.ClinicID = p.ClinicID 
                AND v.DatVisit >= p.CD4TestDate
                AND v.DatVisit <= :EndDate
                AND ard.DrugName LIKE '%FLU%' 
                AND ard.Status IN (0, 2)
            ) THEN 'Yes'
            WHEN p.type = 'Child' AND EXISTS (
                SELECT 1 FROM tblcvarvdrug crd
                JOIN tblcvmain v ON crd.Vid = v.Vid
                WHERE v.ClinicID = p.ClinicID 
                AND v.DatVisit >= p.CD4TestDate
                AND v.DatVisit <= :EndDate
                AND crd.DrugName LIKE '%FLU%' 
                AND crd.Status IN (0, 2)
            ) THEN 'Yes'
            ELSE 'No'
        END as ReceivingFluconazole
    FROM patients_with_low_cd4 p
)

SELECT
    main.ClinicID AS clinicid,
    art.ART AS art_number,
    main.Sex AS sex,
    CASE WHEN main.Sex = 0 THEN 'Female' ELSE 'Male' END AS sex_display,
    'Adult' AS patient_type,
    TIMESTAMPDIFF(YEAR, main.DaBirth, :EndDate) AS age,
    main.DafirstVisit AS DafirstVisit,
    flu.LatestCD4 AS latest_cd4,
    flu.CD4TestDate AS cd4_test_date,
    flu.ReceivingFluconazole AS receiving_fluconazole
FROM tblfluconazole flu
JOIN tblaimain main ON main.ClinicID = flu.ClinicID
LEFT JOIN tblaart art ON main.ClinicID = art.ClinicID
WHERE flu.type = 'Adult'

UNION ALL

SELECT
    main.ClinicID AS clinicid,
    art.ART AS art_number,
    main.Sex AS sex,
    CASE WHEN main.Sex = 0 THEN 'Female' ELSE 'Male' END AS sex_display,
    'Child' AS patient_type,
    TIMESTAMPDIFF(YEAR, main.DaBirth, :EndDate) AS age,
    main.DafirstVisit AS DafirstVisit,
    flu.LatestCD4 AS latest_cd4,
    flu.CD4TestDate AS cd4_test_date,
    flu.ReceivingFluconazole AS receiving_fluconazole
FROM tblfluconazole flu
JOIN tblcimain main ON main.ClinicID = flu.ClinicID
LEFT JOIN tblcart art ON main.ClinicID = art.ClinicID
WHERE flu.type = 'Child'

ORDER BY cd4_test_date DESC, clinicid;

