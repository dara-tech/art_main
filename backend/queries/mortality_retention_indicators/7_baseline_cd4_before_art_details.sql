-- ===================================================================
-- Indicator 7 detail: Percentage of HIV infected patients who received a baseline CD4 count before starting ART
-- Returns patient-level records for newly initiated patients with their baseline CD4 status
-- ===================================================================

WITH patient_art AS (
    -- Adults newly initiated on ART
    SELECT 
        'Adult' as type,
        IF(p.Sex=0, "Female", "Male") as Sex,
        p.ClinicID,
        p.DaBirth,
        art.DaArt as ARTStartDate
    FROM tblaimain p 
    JOIN tblaart art ON p.ClinicID = art.ClinicID
    WHERE 
        art.DaArt BETWEEN :StartDate AND :EndDate
        AND (p.OffIn IS NULL OR p.OffIn <> 1)
    
    UNION ALL
    
    -- Children newly initiated on ART
    SELECT 
        'Child' as type,
        IF(p.Sex=0, "Female", "Male") as Sex,
        p.ClinicID,
        p.DaBirth,
        art.DaArt as ARTStartDate
    FROM tblcimain p 
    JOIN tblcart art ON p.ClinicID = art.ClinicID
    WHERE 
        art.DaArt BETWEEN :StartDate AND :EndDate
        AND (p.OffIn IS NULL OR p.OffIn <> 1)
),

-- Get latest CD4 test before ART for each patient
latest_cd4_before_art AS (
    -- Adults: Get latest CD4 test before ART start
    SELECT 
        p.ClinicID,
        art.DaArt as ARTStartDate,
        pt.CD4,
        pt.Dat as CD4TestDate,
        ROW_NUMBER() OVER (
            PARTITION BY p.ClinicID 
            ORDER BY pt.Dat DESC
        ) as rn
    FROM tblaimain p 
    JOIN tblaart art ON p.ClinicID = art.ClinicID
    LEFT JOIN tblpatienttest pt ON CONVERT(p.ClinicID, CHAR) = pt.ClinicID 
        AND pt.CD4 IS NOT NULL 
        AND TRIM(pt.CD4) <> ''
        AND TRIM(pt.CD4) <> '0'
        AND pt.Dat IS NOT NULL
        AND pt.Dat <> '0000-00-00'
        AND pt.Dat <= art.DaArt
    WHERE 
        art.DaArt BETWEEN :StartDate AND :EndDate
        AND (p.OffIn IS NULL OR p.OffIn <> 1)
    
    UNION ALL
    
    -- Children: Get latest CD4 test before ART start
    SELECT 
        p.ClinicID,
        art.DaArt as ARTStartDate,
        pt.CD4,
        pt.Dat as CD4TestDate,
        ROW_NUMBER() OVER (
            PARTITION BY p.ClinicID 
            ORDER BY pt.Dat DESC
        ) as rn
    FROM tblcimain p 
    JOIN tblcart art ON p.ClinicID = art.ClinicID
    LEFT JOIN tblpatienttest pt ON p.ClinicID = pt.ClinicID 
        AND pt.CD4 IS NOT NULL 
        AND TRIM(pt.CD4) <> ''
        AND TRIM(pt.CD4) <> '0'
        AND pt.Dat IS NOT NULL
        AND pt.Dat <> '0000-00-00'
        AND pt.Dat <= art.DaArt
    WHERE 
        art.DaArt BETWEEN :StartDate AND :EndDate
        AND (p.OffIn IS NULL OR p.OffIn <> 1)
),

tblbaseline_cd4 AS (
    SELECT 
        pa.type,
        pa.Sex,
        pa.ClinicID,
        pa.DaBirth,
        pa.ARTStartDate,
        lcd4.CD4 as BaselineCD4,
        lcd4.CD4TestDate,
        CASE 
            WHEN lcd4.CD4 IS NOT NULL 
                AND TRIM(lcd4.CD4) <> ''
                AND TRIM(lcd4.CD4) <> '0'
                AND lcd4.CD4TestDate IS NOT NULL
                AND lcd4.CD4TestDate <> '0000-00-00'
                AND lcd4.rn = 1
            THEN 'Yes'
            ELSE 'No'
        END as HasBaselineCD4
    FROM patient_art pa
    LEFT JOIN latest_cd4_before_art lcd4 ON pa.ClinicID = lcd4.ClinicID 
        AND pa.ARTStartDate = lcd4.ARTStartDate
        AND lcd4.rn = 1
)

SELECT
    main.ClinicID AS clinicid,
    art.ART AS art_number,
    main.Sex AS sex,
    CASE WHEN main.Sex = 0 THEN 'Female' ELSE 'Male' END AS sex_display,
    'Adult' AS patient_type,
    TIMESTAMPDIFF(YEAR, main.DaBirth, :EndDate) AS age,
    main.DafirstVisit AS DafirstVisit,
    bcd4.ARTStartDate AS art_start_date,
    bcd4.BaselineCD4 AS baseline_cd4,
    bcd4.CD4TestDate AS cd4_test_date,
    bcd4.HasBaselineCD4 AS has_baseline_cd4,
    CASE 
        WHEN bcd4.CD4TestDate IS NOT NULL 
            AND bcd4.CD4TestDate <> '0000-00-00' 
            AND bcd4.ARTStartDate IS NOT NULL
            AND bcd4.ARTStartDate <> '0000-00-00'
        THEN COALESCE(DATEDIFF(bcd4.ARTStartDate, bcd4.CD4TestDate), 0)
        ELSE NULL
    END AS days_between_cd4_and_art
FROM tblbaseline_cd4 bcd4
JOIN tblaimain main ON main.ClinicID = bcd4.ClinicID
LEFT JOIN tblaart art ON main.ClinicID = art.ClinicID AND art.DaArt = bcd4.ARTStartDate
WHERE bcd4.type = 'Adult'

UNION ALL

SELECT
    main.ClinicID AS clinicid,
    art.ART AS art_number,
    main.Sex AS sex,
    CASE WHEN main.Sex = 0 THEN 'Female' ELSE 'Male' END AS sex_display,
    'Child' AS patient_type,
    TIMESTAMPDIFF(YEAR, main.DaBirth, :EndDate) AS age,
    main.DafirstVisit AS DafirstVisit,
    bcd4.ARTStartDate AS art_start_date,
    bcd4.BaselineCD4 AS baseline_cd4,
    bcd4.CD4TestDate AS cd4_test_date,
    bcd4.HasBaselineCD4 AS has_baseline_cd4,
    CASE 
        WHEN bcd4.CD4TestDate IS NOT NULL 
            AND bcd4.CD4TestDate <> '0000-00-00' 
            AND bcd4.ARTStartDate IS NOT NULL
            AND bcd4.ARTStartDate <> '0000-00-00'
        THEN COALESCE(DATEDIFF(bcd4.ARTStartDate, bcd4.CD4TestDate), 0)
        ELSE NULL
    END AS days_between_cd4_and_art
FROM tblbaseline_cd4 bcd4
JOIN tblcimain main ON main.ClinicID = bcd4.ClinicID
LEFT JOIN tblcart art ON main.ClinicID = art.ClinicID AND art.DaArt = bcd4.ARTStartDate
WHERE bcd4.type = 'Child'

ORDER BY art_start_date DESC, clinicid;

