-- ===================================================================
-- Indicator 8a: Percentage of patients with CD4 count less than 350 receiving prophylaxis with Cotrimoxazole
-- ===================================================================

WITH patients_with_low_cd4 AS (
    -- Adults with CD4 < 350
    SELECT DISTINCT
        'Adult' as type,
        IF(p.Sex=0, "Female", "Male") as Sex,
        p.ClinicID,
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
        AND CAST(TRIM(pt.CD4) AS UNSIGNED) < 350
        AND (p.OffIn IS NULL OR p.OffIn <> 1)
    
    UNION
    
    -- Children with CD4 < 350
    SELECT DISTINCT
        'Child' as type,
        IF(p.Sex=0, "Female", "Male") as Sex,
        p.ClinicID,
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
        AND CAST(TRIM(pt.CD4) AS UNSIGNED) < 350
        AND (p.OffIn IS NULL OR p.OffIn <> 1)
),

tblcotrimoxazole AS (
    SELECT 
        p.type,
        p.Sex,
        p.ClinicID,
        p.LatestCD4,
        p.CD4TestDate,
        CASE 
            WHEN p.type = 'Adult' AND EXISTS (
                SELECT 1 FROM tblavarvdrug ard
                JOIN tblavmain v ON ard.Vid = v.Vid
                WHERE v.ClinicID = p.ClinicID 
                AND v.DatVisit >= p.CD4TestDate
                AND v.DatVisit <= :EndDate
                AND ard.DrugName LIKE '%CTX%' 
                AND ard.Status IN (0, 2)
            ) THEN 'Yes'
            WHEN p.type = 'Child' AND EXISTS (
                SELECT 1 FROM tblcvarvdrug crd
                JOIN tblcvmain v ON crd.Vid = v.Vid
                WHERE v.ClinicID = p.ClinicID 
                AND v.DatVisit >= p.CD4TestDate
                AND v.DatVisit <= :EndDate
                AND crd.DrugName LIKE '%CTX%' 
                AND crd.Status IN (0, 2)
            ) THEN 'Yes'
            ELSE 'No'
        END as ReceivingCotrimoxazole
    FROM patients_with_low_cd4 p
),

cotrimoxazole_stats AS (
    SELECT
        COUNT(DISTINCT ClinicID) AS Total_CD4_Low_350,
        COUNT(DISTINCT CASE WHEN ReceivingCotrimoxazole = 'Yes' THEN ClinicID END) AS Receiving_Cotrimoxazole,
        COUNT(DISTINCT CASE WHEN type = 'Child' AND Sex = 'Male' THEN ClinicID END) AS Male_0_14_Total,
        COUNT(DISTINCT CASE WHEN type = 'Child' AND Sex = 'Female' THEN ClinicID END) AS Female_0_14_Total,
        COUNT(DISTINCT CASE WHEN type = 'Adult' AND Sex = 'Male' THEN ClinicID END) AS Male_over_14_Total,
        COUNT(DISTINCT CASE WHEN type = 'Adult' AND Sex = 'Female' THEN ClinicID END) AS Female_over_14_Total,
        COUNT(DISTINCT CASE WHEN type = 'Child' AND Sex = 'Male' AND ReceivingCotrimoxazole = 'Yes' THEN ClinicID END) AS Male_0_14_Receiving,
        COUNT(DISTINCT CASE WHEN type = 'Child' AND Sex = 'Female' AND ReceivingCotrimoxazole = 'Yes' THEN ClinicID END) AS Female_0_14_Receiving,
        COUNT(DISTINCT CASE WHEN type = 'Adult' AND Sex = 'Male' AND ReceivingCotrimoxazole = 'Yes' THEN ClinicID END) AS Male_over_14_Receiving,
        COUNT(DISTINCT CASE WHEN type = 'Adult' AND Sex = 'Female' AND ReceivingCotrimoxazole = 'Yes' THEN ClinicID END) AS Female_over_14_Receiving
    FROM tblcotrimoxazole
)

SELECT
    '8a. Percentage of patients with CD4 < 350 receiving Cotrimoxazole prophylaxis' AS Indicator,
    CAST(IFNULL(s.Receiving_Cotrimoxazole, 0) AS UNSIGNED) AS Receiving_Cotrimoxazole,
    CAST(IFNULL(s.Receiving_Cotrimoxazole, 0) AS UNSIGNED) AS TOTAL,
    CAST(IFNULL(s.Total_CD4_Low_350, 0) AS UNSIGNED) AS Total_CD4_Low_350,
    CAST(CASE 
        WHEN s.Total_CD4_Low_350 > 0 
        THEN ROUND((s.Receiving_Cotrimoxazole * 100.0 / s.Total_CD4_Low_350), 2)
        ELSE 0.00 
    END AS DECIMAL(5,2)) AS Percentage,
    -- Numerators: patients receiving Cotrimoxazole
    CAST(IFNULL(s.Male_0_14_Receiving, 0) AS UNSIGNED) AS Male_0_14,
    CAST(IFNULL(s.Male_0_14_Receiving, 0) AS UNSIGNED) AS Male_0_14_Receiving,
    CAST(IFNULL(s.Female_0_14_Receiving, 0) AS UNSIGNED) AS Female_0_14,
    CAST(IFNULL(s.Female_0_14_Receiving, 0) AS UNSIGNED) AS Female_0_14_Receiving,
    CAST(IFNULL(s.Male_over_14_Receiving, 0) AS UNSIGNED) AS Male_over_14,
    CAST(IFNULL(s.Male_over_14_Receiving, 0) AS UNSIGNED) AS Male_over_14_Receiving,
    CAST(IFNULL(s.Female_over_14_Receiving, 0) AS UNSIGNED) AS Female_over_14,
    CAST(IFNULL(s.Female_over_14_Receiving, 0) AS UNSIGNED) AS Female_over_14_Receiving,
    -- Denominators: total patients with CD4 < 350 by demographic
    CAST(IFNULL(s.Male_0_14_Total, 0) AS UNSIGNED) AS Male_0_14_Total,
    CAST(IFNULL(s.Female_0_14_Total, 0) AS UNSIGNED) AS Female_0_14_Total,
    CAST(IFNULL(s.Male_over_14_Total, 0) AS UNSIGNED) AS Male_over_14_Total,
    CAST(IFNULL(s.Female_over_14_Total, 0) AS UNSIGNED) AS Female_over_14_Total,
    -- Aggregated totals for easier frontend access
    CAST(IFNULL(s.Male_0_14_Total, 0) + IFNULL(s.Female_0_14_Total, 0) AS UNSIGNED) AS Children_Total,
    CAST(IFNULL(s.Male_over_14_Total, 0) + IFNULL(s.Female_over_14_Total, 0) AS UNSIGNED) AS Adults_Total
FROM cotrimoxazole_stats s;


