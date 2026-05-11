-- ===================================================================
-- Indicator 10a: Percentage of patients newly initiating ART with TLD as 1st line regimen
-- This must include ALL newly initiated patients (same as 6a + 6b + 6c combined)
-- ===================================================================

WITH newly_initiated_patients AS (
    -- Adults: Same-day initiation (0 day) - matches 6a
    SELECT 
        'Adult' as type,
        IF(p.Sex=0, "Female", "Male") as Sex,
        p.ClinicID,
        art.DaArt as ARTStartDate
    FROM tblaimain p 
    JOIN tblaart art ON p.ClinicID = art.ClinicID
    WHERE 
        art.DaArt BETWEEN :StartDate AND :EndDate
        AND DATEDIFF(art.DaArt, p.DafirstVisit) = 0
        AND (p.OffIn IS NULL OR p.OffIn <> :transfer_in_code)
        AND (p.TypeofReturn IS NULL OR p.TypeofReturn = -1)
    
    UNION ALL
    
    -- Adults: Initiation 1-7 days - matches 6b (note: 6b doesn't check OffIn)
    SELECT 
        'Adult' as type,
        IF(p.Sex=0, "Female", "Male") as Sex,
        p.ClinicID,
        art.DaArt as ARTStartDate
    FROM tblaimain p 
    JOIN tblaart art ON p.ClinicID = art.ClinicID
    WHERE 
        art.DaArt BETWEEN :StartDate AND :EndDate
        AND DATEDIFF(art.DaArt, p.DafirstVisit) BETWEEN 1 AND 7
        AND (p.TypeofReturn IS NULL OR p.TypeofReturn = -1)
        -- Note: 6b doesn't filter by OffIn, so we match that
    
    UNION ALL
    
    -- Adults: Initiation >7 days - matches 6c
    SELECT 
        'Adult' as type,
        IF(p.Sex=0, "Female", "Male") as Sex,
        p.ClinicID,
        art.DaArt as ARTStartDate
    FROM tblaimain p 
    JOIN tblaart art ON p.ClinicID = art.ClinicID
    WHERE 
        art.DaArt BETWEEN :StartDate AND :EndDate
        AND DATEDIFF(art.DaArt, p.DafirstVisit) > 7
        AND (p.OffIn IS NULL OR p.OffIn <> :transfer_in_code)
        AND (p.TypeofReturn IS NULL OR p.TypeofReturn = -1)
    
    UNION ALL
    
    -- Children: Same-day initiation (0 day)
    SELECT 
        'Child' as type,
        IF(p.Sex=0, "Female", "Male") as Sex,
        p.ClinicID,
        art.DaArt as ARTStartDate
    FROM tblcimain p 
    JOIN tblcart art ON p.ClinicID = art.ClinicID
    WHERE 
        art.DaArt BETWEEN :StartDate AND :EndDate
        AND DATEDIFF(art.DaArt, p.DafirstVisit) = 0
    
    UNION ALL
    
    -- Children: Initiation 1-7 days
    SELECT 
        'Child' as type,
        IF(p.Sex=0, "Female", "Male") as Sex,
        p.ClinicID,
        art.DaArt as ARTStartDate
    FROM tblcimain p 
    JOIN tblcart art ON p.ClinicID = art.ClinicID
    WHERE 
        art.DaArt BETWEEN :StartDate AND :EndDate
        AND DATEDIFF(art.DaArt, p.DafirstVisit) BETWEEN 1 AND 7
    
    UNION ALL
    
    -- Children: Initiation >7 days
    SELECT 
        'Child' as type,
        IF(p.Sex=0, "Female", "Male") as Sex,
        p.ClinicID,
        art.DaArt as ARTStartDate
    FROM tblcimain p 
    JOIN tblcart art ON p.ClinicID = art.ClinicID
    WHERE 
        art.DaArt BETWEEN :StartDate AND :EndDate
        AND DATEDIFF(art.DaArt, p.DafirstVisit) > 7
),

-- Get drug information from the visit on ART start date
art_initiation_drugs AS (
    -- Adults: Get drugs from visit on ART start date
    SELECT 
        nip.ClinicID,
        nip.ARTStartDate,
        GROUP_CONCAT(DISTINCT ard.DrugName ORDER BY ard.DrugName ASC SEPARATOR '+') AS drugname
    FROM newly_initiated_patients nip
    LEFT JOIN tblavmain v ON nip.ClinicID = v.ClinicID 
        AND v.DatVisit = nip.ARTStartDate
        AND v.DatVisit IS NOT NULL
        AND v.DatVisit <> '0000-00-00'
    LEFT JOIN tblavarvdrug ard ON v.Vid = ard.Vid
        AND ard.status <> 1
    WHERE nip.type = 'Adult'
    GROUP BY nip.ClinicID, nip.ARTStartDate
    
    UNION ALL
    
    -- Children: Get drugs from visit on ART start date
    SELECT 
        nip.ClinicID,
        nip.ARTStartDate,
        GROUP_CONCAT(DISTINCT crd.DrugName ORDER BY crd.DrugName ASC SEPARATOR '+') AS drugname
    FROM newly_initiated_patients nip
    LEFT JOIN tblcvmain v ON nip.ClinicID = v.ClinicID 
        AND v.DatVisit = nip.ARTStartDate
        AND v.DatVisit IS NOT NULL
        AND v.DatVisit <> '0000-00-00'
    LEFT JOIN tblcvarvdrug crd ON v.Vid = crd.Vid
        AND crd.status <> 1
    WHERE nip.type = 'Child'
    GROUP BY nip.ClinicID, nip.ARTStartDate
),

-- Determine TLD status
tld_status AS (
    SELECT 
        nip.ClinicID,
        nip.type,
        nip.Sex,
        nip.ARTStartDate,
        aid.drugname,
        CASE 
            WHEN aid.drugname IS NOT NULL 
                AND aid.drugname <> '' 
                AND LOCATE('3TC+DTG+TDF', aid.drugname) > 0 THEN 'TLD'
            WHEN aid.drugname IS NOT NULL 
                AND aid.drugname <> '' 
                AND LEFT(nip.ClinicID, 1) = 'P' 
                AND LOCATE('DTG', aid.drugname) > 0 THEN 'TLD'
            ELSE 'Not-TLD'
        END AS TLDStatus
    FROM newly_initiated_patients nip
    LEFT JOIN art_initiation_drugs aid ON nip.ClinicID = aid.ClinicID 
        AND nip.ARTStartDate = aid.ARTStartDate
),

-- Statistics
tld_stats AS (
    SELECT
        COUNT(DISTINCT ClinicID) AS Total_Newly_Initiated,
        COUNT(DISTINCT CASE WHEN TLDStatus = 'TLD' THEN ClinicID END) AS TLD_New_Initiation,
        COUNT(DISTINCT CASE WHEN type = 'Child' AND Sex = 'Male' THEN ClinicID END) AS Male_0_14_Total,
        COUNT(DISTINCT CASE WHEN type = 'Child' AND Sex = 'Female' THEN ClinicID END) AS Female_0_14_Total,
        COUNT(DISTINCT CASE WHEN type = 'Adult' AND Sex = 'Male' THEN ClinicID END) AS Male_over_14_Total,
        COUNT(DISTINCT CASE WHEN type = 'Adult' AND Sex = 'Female' THEN ClinicID END) AS Female_over_14_Total,
        COUNT(DISTINCT CASE WHEN type = 'Child' AND Sex = 'Male' AND TLDStatus = 'TLD' THEN ClinicID END) AS Male_0_14_TLD,
        COUNT(DISTINCT CASE WHEN type = 'Child' AND Sex = 'Female' AND TLDStatus = 'TLD' THEN ClinicID END) AS Female_0_14_TLD,
        COUNT(DISTINCT CASE WHEN type = 'Adult' AND Sex = 'Male' AND TLDStatus = 'TLD' THEN ClinicID END) AS Male_over_14_TLD,
        COUNT(DISTINCT CASE WHEN type = 'Adult' AND Sex = 'Female' AND TLDStatus = 'TLD' THEN ClinicID END) AS Female_over_14_TLD
    FROM tld_status
)

SELECT
    '10a. Percentage of patients newly initiating ART with TLD as 1st line regimen' AS Indicator,
    CAST(IFNULL(s.TLD_New_Initiation, 0) AS UNSIGNED) AS TLD_New_Initiation,
    CAST(IFNULL(s.TLD_New_Initiation, 0) AS UNSIGNED) AS TOTAL,
    CAST(IFNULL(s.Total_Newly_Initiated, 0) AS UNSIGNED) AS Total_Newly_Initiated,
    CAST(CASE 
        WHEN s.Total_Newly_Initiated > 0 
        THEN ROUND((s.TLD_New_Initiation * 100.0 / s.Total_Newly_Initiated), 2)
        ELSE 0.00 
    END AS DECIMAL(5,2)) AS Percentage,
    -- Numerators: patients with TLD
    CAST(IFNULL(s.Male_0_14_TLD, 0) AS UNSIGNED) AS Male_0_14,
    CAST(IFNULL(s.Male_0_14_TLD, 0) AS UNSIGNED) AS Male_0_14_TLD,
    CAST(IFNULL(s.Female_0_14_TLD, 0) AS UNSIGNED) AS Female_0_14,
    CAST(IFNULL(s.Female_0_14_TLD, 0) AS UNSIGNED) AS Female_0_14_TLD,
    CAST(IFNULL(s.Male_over_14_TLD, 0) AS UNSIGNED) AS Male_over_14,
    CAST(IFNULL(s.Male_over_14_TLD, 0) AS UNSIGNED) AS Male_over_14_TLD,
    CAST(IFNULL(s.Female_over_14_TLD, 0) AS UNSIGNED) AS Female_over_14,
    CAST(IFNULL(s.Female_over_14_TLD, 0) AS UNSIGNED) AS Female_over_14_TLD,
    -- Denominators: total newly initiated patients by demographic
    CAST(IFNULL(s.Male_0_14_Total, 0) AS UNSIGNED) AS Male_0_14_Total,
    CAST(IFNULL(s.Female_0_14_Total, 0) AS UNSIGNED) AS Female_0_14_Total,
    CAST(IFNULL(s.Male_over_14_Total, 0) AS UNSIGNED) AS Male_over_14_Total,
    CAST(IFNULL(s.Female_over_14_Total, 0) AS UNSIGNED) AS Female_over_14_Total,
    -- Aggregated totals for easier frontend access
    CAST(IFNULL(s.Male_0_14_Total, 0) + IFNULL(s.Female_0_14_Total, 0) AS UNSIGNED) AS Children_Total,
    CAST(IFNULL(s.Male_over_14_Total, 0) + IFNULL(s.Female_over_14_Total, 0) AS UNSIGNED) AS Adults_Total
FROM tld_stats s;
