-- ===================================================================
-- Indicator 6c: Percentage of patients newly initiating ART after >7 days of diagnosed date
-- ===================================================================

WITH all_newly_initiated AS (
    -- Total newly initiated patients (6a + 6b + 6c combined) for denominator
    -- Adults: Same-day (0 day) - matches 6a
    SELECT DISTINCT
        p.ClinicID,
        'Adult' as type, 
        IF(p.Sex=0, "Female", "Male") as Sex 
    FROM tblaimain p 
    JOIN tblaart art ON p.ClinicID = art.ClinicID 
    WHERE 
        art.DaArt BETWEEN :StartDate AND :EndDate 
        AND DATEDIFF(art.DaArt, p.DafirstVisit) = 0 
        AND (p.OffIn IS NULL OR p.OffIn <> :transfer_in_code) 
        AND (p.TypeofReturn IS NULL OR p.TypeofReturn = -1)
    
    UNION
    
    -- Adults: 1-7 days - matches 6b
    SELECT DISTINCT
        p.ClinicID,
        'Adult' as type, 
        IF(p.Sex=0, "Female", "Male") as Sex 
    FROM tblaimain p 
    JOIN tblaart art ON p.ClinicID = art.ClinicID 
    WHERE 
        art.DaArt BETWEEN :StartDate AND :EndDate 
        AND DATEDIFF(art.DaArt, p.DafirstVisit) BETWEEN 1 AND 7 
        AND (p.TypeofReturn IS NULL OR p.TypeofReturn = -1)
    
    UNION
    
    -- Adults: >7 days - matches 6c
    SELECT DISTINCT
        p.ClinicID,
        'Adult' as type, 
        IF(p.Sex=0, "Female", "Male") as Sex 
    FROM tblaimain p 
    JOIN tblaart art ON p.ClinicID = art.ClinicID 
    WHERE 
        art.DaArt BETWEEN :StartDate AND :EndDate 
        AND DATEDIFF(art.DaArt, p.DafirstVisit) > 7 
        AND (p.OffIn IS NULL OR p.OffIn <> :transfer_in_code) 
        AND (p.TypeofReturn IS NULL OR p.TypeofReturn = -1)
    
    UNION
    
    -- Children: Same-day (0 day)
    SELECT DISTINCT
        p.ClinicID,
        'Child' as type, 
        IF(p.Sex=0, "Female", "Male") as Sex 
    FROM tblcimain p 
    JOIN tblcart art ON p.ClinicID = art.ClinicID 
    WHERE 
        art.DaArt BETWEEN :StartDate AND :EndDate 
        AND DATEDIFF(art.DaArt, p.DafirstVisit) = 0
    
    UNION
    
    -- Children: 1-7 days
    SELECT DISTINCT
        p.ClinicID,
        'Child' as type, 
        IF(p.Sex=0, "Female", "Male") as Sex 
    FROM tblcimain p 
    JOIN tblcart art ON p.ClinicID = art.ClinicID 
    WHERE 
        art.DaArt BETWEEN :StartDate AND :EndDate 
        AND DATEDIFF(art.DaArt, p.DafirstVisit) BETWEEN 1 AND 7
    
    UNION
    
    -- Children: >7 days
    SELECT DISTINCT
        p.ClinicID,
        'Child' as type, 
        IF(p.Sex=0, "Female", "Male") as Sex 
    FROM tblcimain p 
    JOIN tblcart art ON p.ClinicID = art.ClinicID 
    WHERE 
        art.DaArt BETWEEN :StartDate AND :EndDate 
        AND DATEDIFF(art.DaArt, p.DafirstVisit) > 7
),

PatientList AS (
    -- Adults: Must not be a lost-return patient
    SELECT DISTINCT
        p.ClinicID,
        'Adult' as type, 
        IF(p.Sex=0, "Female", "Male") as Sex 
    FROM tblaimain p 
    JOIN tblaart art ON p.ClinicID = art.ClinicID 
    WHERE 
        art.DaArt BETWEEN :StartDate AND :EndDate 
        AND DATEDIFF(art.DaArt, p.DafirstVisit) > 7 
        AND (p.OffIn IS NULL OR p.OffIn <> :transfer_in_code) 
        AND (p.TypeofReturn IS NULL OR p.TypeofReturn = -1)
    
    UNION
    
    -- Children
    SELECT DISTINCT
        p.ClinicID,
        'Child' as type, 
        IF(p.Sex=0, "Female", "Male") as Sex 
    FROM tblcimain p 
    JOIN tblcart art ON p.ClinicID = art.ClinicID 
    WHERE 
        art.DaArt BETWEEN :StartDate AND :EndDate 
        AND DATEDIFF(art.DaArt, p.DafirstVisit) > 7
),

total_newly_initiated_stats AS (
    -- Calculate total newly initiated patients by demographic for denominator
    SELECT
        COUNT(DISTINCT CASE WHEN type = 'Child' AND Sex = 'Male' THEN ClinicID END) AS Male_0_14_Total,
        COUNT(DISTINCT CASE WHEN type = 'Child' AND Sex = 'Female' THEN ClinicID END) AS Female_0_14_Total,
        COUNT(DISTINCT CASE WHEN type = 'Adult' AND Sex = 'Male' THEN ClinicID END) AS Male_over_14_Total,
        COUNT(DISTINCT CASE WHEN type = 'Adult' AND Sex = 'Female' THEN ClinicID END) AS Female_over_14_Total
    FROM all_newly_initiated
),

total_newly_initiated_calc AS (
    -- Calculate Total_Newly_Initiated as sum of all demographic groups
    SELECT
        (COUNT(DISTINCT CASE WHEN type = 'Child' AND Sex = 'Male' THEN ClinicID END) +
         COUNT(DISTINCT CASE WHEN type = 'Child' AND Sex = 'Female' THEN ClinicID END) +
         COUNT(DISTINCT CASE WHEN type = 'Adult' AND Sex = 'Male' THEN ClinicID END) +
         COUNT(DISTINCT CASE WHEN type = 'Adult' AND Sex = 'Female' THEN ClinicID END)) AS Total_Newly_Initiated
    FROM all_newly_initiated
)

SELECT
    '6c. Percentage of patients newly initiating ART after >7 days of diagnosed date' AS Indicator,
    CAST(IFNULL(COUNT(DISTINCT pl.ClinicID), 0) AS UNSIGNED) AS Initiation_Over_7_Days,
    CAST(IFNULL(COUNT(DISTINCT pl.ClinicID), 0) AS UNSIGNED) AS TOTAL,
    CAST(IFNULL(tnic.Total_Newly_Initiated, 0) AS UNSIGNED) AS Total_Newly_Initiated,
    CAST(CASE 
        WHEN tnic.Total_Newly_Initiated > 0 
        THEN ROUND((COUNT(DISTINCT pl.ClinicID) * 100.0 / tnic.Total_Newly_Initiated), 2)
        ELSE 0.00 
    END AS DECIMAL(5,2)) AS Percentage,
    CAST(IFNULL(COUNT(DISTINCT CASE WHEN pl.type = 'Child' AND pl.Sex = 'Male' THEN pl.ClinicID END), 0) AS UNSIGNED) AS Male_0_14,
    CAST(IFNULL(COUNT(DISTINCT CASE WHEN pl.type = 'Child' AND pl.Sex = 'Female' THEN pl.ClinicID END), 0) AS UNSIGNED) AS Female_0_14,
    CAST(IFNULL(COUNT(DISTINCT CASE WHEN pl.type = 'Adult' AND pl.Sex = 'Male' THEN pl.ClinicID END), 0) AS UNSIGNED) AS Male_over_14,
    CAST(IFNULL(COUNT(DISTINCT CASE WHEN pl.type = 'Adult' AND pl.Sex = 'Female' THEN pl.ClinicID END), 0) AS UNSIGNED) AS Female_over_14,
    -- Individual demographic totals for denominator (total newly initiated, not just >7 days)
    CAST(IFNULL(tnis.Male_0_14_Total, 0) AS UNSIGNED) AS Male_0_14_Total,
    CAST(IFNULL(tnis.Female_0_14_Total, 0) AS UNSIGNED) AS Female_0_14_Total,
    CAST(IFNULL(tnis.Male_over_14_Total, 0) AS UNSIGNED) AS Male_over_14_Total,
    CAST(IFNULL(tnis.Female_over_14_Total, 0) AS UNSIGNED) AS Female_over_14_Total,
    -- Aggregated totals for easier frontend access
    CAST(IFNULL(tnis.Male_0_14_Total, 0) + IFNULL(tnis.Female_0_14_Total, 0) AS UNSIGNED) AS Children_Total,
    CAST(IFNULL(tnis.Male_over_14_Total, 0) + IFNULL(tnis.Female_over_14_Total, 0) AS UNSIGNED) AS Adults_Total
FROM PatientList pl
CROSS JOIN total_newly_initiated_stats tnis
CROSS JOIN total_newly_initiated_calc tnic;

