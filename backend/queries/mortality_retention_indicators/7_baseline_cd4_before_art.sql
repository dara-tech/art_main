-- ===================================================================
-- Indicator 7: Percentage of HIV infected patients who received a baseline CD4 count before starting ART
-- ===================================================================

WITH patient_art AS (
    -- Adults newly initiated on ART
    SELECT DISTINCT
        'Adult' as type,
        IF(p.Sex=0, "Female", "Male") as Sex,
        p.ClinicID,
        art.DaArt as ARTStartDate
    FROM tblaimain p 
    JOIN tblaart art ON p.ClinicID = art.ClinicID
    WHERE 
        art.DaArt BETWEEN :StartDate AND :EndDate
        AND (p.OffIn IS NULL OR p.OffIn <> 1)
    
    UNION
    
    -- Children newly initiated on ART
    SELECT DISTINCT
        'Child' as type,
        IF(p.Sex=0, "Female", "Male") as Sex,
        p.ClinicID,
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
),

-- Calculate statistics
baseline_cd4_stats AS (
    SELECT
        COUNT(DISTINCT ClinicID) AS Total_Newly_Initiated,
        COUNT(DISTINCT CASE WHEN HasBaselineCD4 = 'Yes' THEN ClinicID END) AS With_CD4_Count,
        COUNT(DISTINCT CASE WHEN type = 'Child' AND Sex = 'Male' THEN ClinicID END) AS Male_0_14_Total,
        COUNT(DISTINCT CASE WHEN type = 'Child' AND Sex = 'Female' THEN ClinicID END) AS Female_0_14_Total,
        COUNT(DISTINCT CASE WHEN type = 'Adult' AND Sex = 'Male' THEN ClinicID END) AS Male_over_14_Total,
        COUNT(DISTINCT CASE WHEN type = 'Adult' AND Sex = 'Female' THEN ClinicID END) AS Female_over_14_Total,
        COUNT(DISTINCT CASE WHEN type = 'Child' AND Sex = 'Male' AND HasBaselineCD4 = 'Yes' THEN ClinicID END) AS Male_0_14_With_CD4,
        COUNT(DISTINCT CASE WHEN type = 'Child' AND Sex = 'Female' AND HasBaselineCD4 = 'Yes' THEN ClinicID END) AS Female_0_14_With_CD4,
        COUNT(DISTINCT CASE WHEN type = 'Adult' AND Sex = 'Male' AND HasBaselineCD4 = 'Yes' THEN ClinicID END) AS Male_over_14_With_CD4,
        COUNT(DISTINCT CASE WHEN type = 'Adult' AND Sex = 'Female' AND HasBaselineCD4 = 'Yes' THEN ClinicID END) AS Female_over_14_With_CD4
    FROM tblbaseline_cd4
)

SELECT
    '7. Percentage of HIV infected patients who received a baseline CD4 count before starting ART' AS Indicator,
    CAST(IFNULL(s.With_CD4_Count, 0) AS UNSIGNED) AS With_Baseline_CD4,
    CAST(IFNULL(s.With_CD4_Count, 0) AS UNSIGNED) AS TOTAL,
    CAST(IFNULL(s.Total_Newly_Initiated, 0) AS UNSIGNED) AS Total_Newly_Initiated,
    CAST(CASE 
        WHEN s.Total_Newly_Initiated > 0 
        THEN ROUND((s.With_CD4_Count * 100.0 / s.Total_Newly_Initiated), 2)
        ELSE 0.00 
    END AS DECIMAL(5,2)) AS Percentage,
    -- Numerators: patients with baseline CD4
    CAST(IFNULL(s.Male_0_14_With_CD4, 0) AS UNSIGNED) AS Male_0_14,
    CAST(IFNULL(s.Male_0_14_With_CD4, 0) AS UNSIGNED) AS Male_0_14_With_CD4,
    CAST(IFNULL(s.Female_0_14_With_CD4, 0) AS UNSIGNED) AS Female_0_14,
    CAST(IFNULL(s.Female_0_14_With_CD4, 0) AS UNSIGNED) AS Female_0_14_With_CD4,
    CAST(IFNULL(s.Male_over_14_With_CD4, 0) AS UNSIGNED) AS Male_over_14,
    CAST(IFNULL(s.Male_over_14_With_CD4, 0) AS UNSIGNED) AS Male_over_14_With_CD4,
    CAST(IFNULL(s.Female_over_14_With_CD4, 0) AS UNSIGNED) AS Female_over_14,
    CAST(IFNULL(s.Female_over_14_With_CD4, 0) AS UNSIGNED) AS Female_over_14_With_CD4,
    -- Denominators: total newly initiated patients by demographic
    CAST(IFNULL(s.Male_0_14_Total, 0) AS UNSIGNED) AS Male_0_14_Total,
    CAST(IFNULL(s.Female_0_14_Total, 0) AS UNSIGNED) AS Female_0_14_Total,
    CAST(IFNULL(s.Male_over_14_Total, 0) AS UNSIGNED) AS Male_over_14_Total,
    CAST(IFNULL(s.Female_over_14_Total, 0) AS UNSIGNED) AS Female_over_14_Total,
    -- Aggregated totals for easier frontend access
    CAST(IFNULL(s.Male_0_14_Total, 0) + IFNULL(s.Female_0_14_Total, 0) AS UNSIGNED) AS Children_Total,
    CAST(IFNULL(s.Male_over_14_Total, 0) + IFNULL(s.Female_over_14_Total, 0) AS UNSIGNED) AS Adults_Total
FROM baseline_cd4_stats s;



