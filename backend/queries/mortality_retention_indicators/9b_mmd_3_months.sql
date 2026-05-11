-- ===================================================================
-- Indicator 9b: Percentage of ART patients with MMD 3 months
-- ===================================================================

WITH tblactive AS (
    -- Active ART patients (using proper Indicator 10 logic)
    SELECT DISTINCT
        i.clinicid, 
        i.typepatients, 
        IF(i.Sex=0, 'Female', 'Male') AS Sex,
        CASE WHEN i.typepatients = "≤14" THEN 'Child' ELSE 'Adult' END as type
    FROM (
        SELECT 
            clinicid,
            DatVisit,
            ROW_NUMBER() OVER (PARTITION BY clinicid ORDER BY DatVisit DESC) AS id 
        FROM tblavmain 
        WHERE DatVisit <= :EndDate
        
        UNION ALL 
        
        SELECT 
            clinicid,
            DatVisit,
            ROW_NUMBER() OVER (PARTITION BY clinicid ORDER BY DatVisit DESC) AS id 
        FROM tblcvmain 
        WHERE DatVisit <= :EndDate
    ) v
    LEFT JOIN (
        SELECT 
            ClinicID,
            "15+" AS typepatients,
            Sex,
            OffIn 
        FROM tblaimain 
        WHERE DafirstVisit <= :EndDate
        
        UNION ALL 
        
        SELECT 
            ClinicID,
            "≤14" AS typepatients,
            Sex,
            OffIn 
        FROM tblcimain 
        WHERE DafirstVisit <= :EndDate
    ) i ON i.clinicid = v.clinicid
    LEFT JOIN (
        SELECT DISTINCT clinicid FROM tblaart WHERE DaArt <= :EndDate
        UNION
        SELECT DISTINCT clinicid FROM tblcart WHERE DaArt <= :EndDate
    ) a ON a.clinicid = v.clinicid
    LEFT JOIN (
        SELECT clinicid, status FROM tblavpatientstatus WHERE da <= :EndDate
        UNION ALL
        SELECT clinicid, status FROM tblcvpatientstatus WHERE da <= :EndDate
    ) e ON v.clinicid = e.clinicid
    WHERE v.id = 1 AND e.status IS NULL AND a.clinicid IS NOT NULL
),

active_patients AS (
    -- Get latest visit with appointment date for MMD calculation
    SELECT DISTINCT
        a.clinicid AS ClinicID,
        a.type,
        a.Sex,
        v.DatVisit,
        v.DaApp,
        art.DaArt,
        TIMESTAMPDIFF(MONTH, art.DaArt, :EndDate) AS months_on_art,
        DATEDIFF(v.DaApp, v.DatVisit) AS ndays
    FROM tblactive a
    INNER JOIN (
        SELECT 
            clinicid,
            DatVisit,
            DaApp,
            ROW_NUMBER() OVER (PARTITION BY clinicid ORDER BY DatVisit DESC) AS rn
        FROM tblavmain 
        WHERE DatVisit <= :EndDate
        
        UNION ALL 
        
        SELECT 
            clinicid,
            DatVisit,
            DaApp,
            ROW_NUMBER() OVER (PARTITION BY clinicid ORDER BY DatVisit DESC) AS rn
        FROM tblcvmain 
        WHERE DatVisit <= :EndDate
    ) v ON v.clinicid = a.clinicid AND v.rn = 1
    LEFT JOIN (
        SELECT ClinicID, DaArt FROM tblaart WHERE DaArt <= :EndDate
        UNION ALL
        SELECT ClinicID, DaArt FROM tblcart WHERE DaArt <= :EndDate
    ) art ON art.ClinicID = a.clinicid
    WHERE art.DaArt IS NOT NULL
        AND TIMESTAMPDIFF(MONTH, art.DaArt, :EndDate) >= 6
        AND v.DatVisit IS NOT NULL
        AND v.DatVisit <> '0000-00-00'
        AND v.DaApp IS NOT NULL
        AND v.DaApp <> '0000-00-00'
),

mmd_stats AS (
    SELECT
        COUNT(DISTINCT ClinicID) AS Total_Patients,
        COUNT(DISTINCT CASE WHEN ndays BETWEEN 81 AND 100 THEN ClinicID END) AS Three_Months,
        COUNT(DISTINCT CASE WHEN type = 'Child' AND Sex = 'Male' THEN ClinicID END) AS Male_0_14_Total,
        COUNT(DISTINCT CASE WHEN type = 'Child' AND Sex = 'Female' THEN ClinicID END) AS Female_0_14_Total,
        COUNT(DISTINCT CASE WHEN type = 'Adult' AND Sex = 'Male' THEN ClinicID END) AS Male_over_14_Total,
        COUNT(DISTINCT CASE WHEN type = 'Adult' AND Sex = 'Female' THEN ClinicID END) AS Female_over_14_Total,
        COUNT(DISTINCT CASE WHEN type = 'Child' AND Sex = 'Male' AND ndays BETWEEN 81 AND 100 THEN ClinicID END) AS Male_0_14_3M,
        COUNT(DISTINCT CASE WHEN type = 'Child' AND Sex = 'Female' AND ndays BETWEEN 81 AND 100 THEN ClinicID END) AS Female_0_14_3M,
        COUNT(DISTINCT CASE WHEN type = 'Adult' AND Sex = 'Male' AND ndays BETWEEN 81 AND 100 THEN ClinicID END) AS Male_over_14_3M,
        COUNT(DISTINCT CASE WHEN type = 'Adult' AND Sex = 'Female' AND ndays BETWEEN 81 AND 100 THEN ClinicID END) AS Female_over_14_3M
    FROM active_patients
)

SELECT
    '9b. Percentage of ART patients with MMD 3 months' AS Indicator,
    CAST(IFNULL(s.Three_Months, 0) AS UNSIGNED) AS TOTAL,
    CAST(IFNULL(s.Total_Patients, 0) AS UNSIGNED) AS Total_Patients,
    CAST(CASE 
        WHEN s.Total_Patients > 0 
        THEN ROUND((s.Three_Months * 100.0 / s.Total_Patients), 2)
        ELSE 0.00 
    END AS DECIMAL(5,2)) AS Percentage,
    -- Numerators: patients with MMD 3 months
    CAST(IFNULL(s.Male_0_14_3M, 0) AS UNSIGNED) AS Male_0_14,
    CAST(IFNULL(s.Male_0_14_3M, 0) AS UNSIGNED) AS Male_0_14_3M,
    CAST(IFNULL(s.Female_0_14_3M, 0) AS UNSIGNED) AS Female_0_14,
    CAST(IFNULL(s.Female_0_14_3M, 0) AS UNSIGNED) AS Female_0_14_3M,
    CAST(IFNULL(s.Male_over_14_3M, 0) AS UNSIGNED) AS Male_over_14,
    CAST(IFNULL(s.Male_over_14_3M, 0) AS UNSIGNED) AS Male_over_14_3M,
    CAST(IFNULL(s.Female_over_14_3M, 0) AS UNSIGNED) AS Female_over_14,
    CAST(IFNULL(s.Female_over_14_3M, 0) AS UNSIGNED) AS Female_over_14_3M,
    -- Denominators: total eligible patients by demographic
    CAST(IFNULL(s.Male_0_14_Total, 0) AS UNSIGNED) AS Male_0_14_Total,
    CAST(IFNULL(s.Female_0_14_Total, 0) AS UNSIGNED) AS Female_0_14_Total,
    CAST(IFNULL(s.Male_over_14_Total, 0) AS UNSIGNED) AS Male_over_14_Total,
    CAST(IFNULL(s.Female_over_14_Total, 0) AS UNSIGNED) AS Female_over_14_Total,
    -- Aggregated totals for easier frontend access
    CAST(IFNULL(s.Male_0_14_Total, 0) + IFNULL(s.Female_0_14_Total, 0) AS UNSIGNED) AS Children_Total,
    CAST(IFNULL(s.Male_over_14_Total, 0) + IFNULL(s.Female_over_14_Total, 0) AS UNSIGNED) AS Adults_Total
FROM mmd_stats s;

