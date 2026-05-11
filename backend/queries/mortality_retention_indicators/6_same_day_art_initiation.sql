-- ===================================================================
-- Indicator 6: Percentage of patients newly initiating ART on same-day as diagnosed date
-- (disaggregate: 0 day, 1-7 days, >7 days)
-- ===================================================================

WITH tblsame_day_art AS (
    -- Adults with same-day ART initiation
    SELECT 
        'Adult' as type,
        IF(p.Sex=0, "Female", "Male") as Sex,
        p.ClinicID,
        p.DaHIV as DiagnosisDate,
        p.DaART as ARTStartDate,
        DATEDIFF(p.DaART, p.DaHIV) as DaysBetween,
        CASE 
            WHEN DATEDIFF(p.DaART, p.DaHIV) = 0 THEN '0 day'
            WHEN DATEDIFF(p.DaART, p.DaHIV) BETWEEN 1 AND 7 THEN '1-7 days'
            WHEN DATEDIFF(p.DaART, p.DaHIV) > 7 THEN '>7 days'
            ELSE 'Unknown'
        END as TimeToART
    FROM tblaimain p 
    JOIN tblaart art ON p.ClinicID = art.ClinicID
    WHERE 
        art.DaArt BETWEEN :StartDate AND :EndDate
        AND p.DaHIV IS NOT NULL
        AND p.DaHIV <> '0000-00-00'
        AND (p.OffIn IS NULL OR p.OffIn <> 1)
    
    UNION ALL
    
    -- Children with same-day ART initiation
    SELECT 
        'Child' as type,
        IF(p.Sex=0, "Female", "Male") as Sex,
        p.ClinicID,
        p.DaTest as DiagnosisDate,
        p.DaART as ARTStartDate,
        DATEDIFF(p.DaART, p.DaTest) as DaysBetween,
        CASE 
            WHEN DATEDIFF(p.DaART, p.DaTest) = 0 THEN '0 day'
            WHEN DATEDIFF(p.DaART, p.DaTest) BETWEEN 1 AND 7 THEN '1-7 days'
            WHEN DATEDIFF(p.DaART, p.DaTest) > 7 THEN '>7 days'
            ELSE 'Unknown'
        END as TimeToART
    FROM tblcimain p 
    JOIN tblcart art ON p.ClinicID = art.ClinicID
    WHERE 
        art.DaArt BETWEEN :StartDate AND :EndDate
        AND p.DaTest IS NOT NULL
        AND p.DaTest <> '0000-00-00'
        AND (p.OffIn IS NULL OR p.OffIn <> 1)
),

-- Calculate statistics
same_day_stats AS (
    SELECT
        COUNT(*) AS Total_Newly_Initiated,
        SUM(CASE WHEN TimeToART = '0 day' THEN 1 ELSE 0 END) AS Same_Day_Count,
        SUM(CASE WHEN type = 'Child' AND Sex = 'Male' AND TimeToART = '0 day' THEN 1 ELSE 0 END) AS Male_0_14_Same_Day,
        SUM(CASE WHEN type = 'Child' AND Sex = 'Female' AND TimeToART = '0 day' THEN 1 ELSE 0 END) AS Female_0_14_Same_Day,
        SUM(CASE WHEN type = 'Adult' AND Sex = 'Male' AND TimeToART = '0 day' THEN 1 ELSE 0 END) AS Male_over_14_Same_Day,
        SUM(CASE WHEN type = 'Adult' AND Sex = 'Female' AND TimeToART = '0 day' THEN 1 ELSE 0 END) AS Female_over_14_Same_Day,
        SUM(CASE WHEN type = 'Child' AND Sex = 'Male' THEN 1 ELSE 0 END) AS Male_0_14_Total,
        SUM(CASE WHEN type = 'Child' AND Sex = 'Female' THEN 1 ELSE 0 END) AS Female_0_14_Total,
        SUM(CASE WHEN type = 'Adult' AND Sex = 'Male' THEN 1 ELSE 0 END) AS Male_over_14_Total,
        SUM(CASE WHEN type = 'Adult' AND Sex = 'Female' THEN 1 ELSE 0 END) AS Female_over_14_Total
    FROM tblsame_day_art
)

SELECT
    '6. Percentage of patients newly initiating ART on same-day as diagnosed date' AS Indicator,
    CAST(IFNULL(s.Same_Day_Count, 0) AS UNSIGNED) AS Same_Day_Initiation,
    CAST(IFNULL(s.Same_Day_Count, 0) AS UNSIGNED) AS TOTAL,
    CAST(IFNULL(s.Total_Newly_Initiated, 0) AS UNSIGNED) AS Total_Newly_Initiated,
    CAST(CASE 
        WHEN s.Total_Newly_Initiated > 0 
        THEN ROUND((s.Same_Day_Count * 100.0 / s.Total_Newly_Initiated), 2)
        ELSE 0.00 
    END AS DECIMAL(5,2)) AS Percentage,
    CAST(IFNULL(s.Male_0_14_Total, 0) AS UNSIGNED) AS Male_0_14,
    CAST(IFNULL(s.Male_0_14_Same_Day, 0) AS UNSIGNED) AS Male_0_14_Same_Day,
    CAST(IFNULL(s.Female_0_14_Total, 0) AS UNSIGNED) AS Female_0_14,
    CAST(IFNULL(s.Female_0_14_Same_Day, 0) AS UNSIGNED) AS Female_0_14_Same_Day,
    CAST(IFNULL(s.Male_over_14_Total, 0) AS UNSIGNED) AS Male_over_14,
    CAST(IFNULL(s.Male_over_14_Same_Day, 0) AS UNSIGNED) AS Male_over_14_Same_Day,
    CAST(IFNULL(s.Female_over_14_Total, 0) AS UNSIGNED) AS Female_over_14,
    CAST(IFNULL(s.Female_over_14_Same_Day, 0) AS UNSIGNED) AS Female_over_14_Same_Day
FROM same_day_stats s;



