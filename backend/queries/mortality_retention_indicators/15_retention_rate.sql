-- ===================================================================
-- Indicator 15: Retention rate (quarterly calculation based on TX_CURR/TX_NEW)
-- Formula: Retention = (1 - (TX_CURR_prior + TX_NEW - TX_CURR_current) / TX_CURR_prior)
-- ===================================================================

WITH tx_new_patients AS (
    SELECT 
        '≤14' AS typepatients,
        IF(p.Sex=0, 'Female', 'Male') AS Sex
    FROM tblcimain p
    JOIN tblcart art ON p.ClinicID = art.ClinicID
    WHERE art.DaArt BETWEEN :StartDate AND :EndDate
    
    UNION ALL
    
    SELECT 
        '15+' AS typepatients,
        IF(p.Sex=0, 'Female', 'Male') AS Sex
    FROM tblaimain p
    JOIN tblaart art ON p.ClinicID = art.ClinicID
    WHERE art.DaArt BETWEEN :StartDate AND :EndDate
),
tx_new AS (
    SELECT 
        COUNT(*) AS Total_New,
        SUM(CASE WHEN typepatients = '≤14' AND Sex = 'Male' THEN 1 ELSE 0 END) AS Male_0_14_New,
        SUM(CASE WHEN typepatients = '≤14' AND Sex = 'Female' THEN 1 ELSE 0 END) AS Female_0_14_New,
        SUM(CASE WHEN typepatients = '15+' AND Sex = 'Male' THEN 1 ELSE 0 END) AS Male_over_14_New,
        SUM(CASE WHEN typepatients = '15+' AND Sex = 'Female' THEN 1 ELSE 0 END) AS Female_over_14_New
    FROM tx_new_patients
),

latest_visits_prior AS (
    SELECT clinicid, DatVisit, ROW_NUMBER() OVER (PARTITION BY clinicid ORDER BY DatVisit DESC) AS rn
    FROM tblavmain
    WHERE DatVisit <= DATE_SUB(:StartDate, INTERVAL 1 DAY)
    
    UNION ALL
    
    SELECT clinicid, DatVisit, ROW_NUMBER() OVER (PARTITION BY clinicid ORDER BY DatVisit DESC) AS rn
    FROM tblcvmain
    WHERE DatVisit <= DATE_SUB(:StartDate, INTERVAL 1 DAY)
),
patient_info_prior AS (
    SELECT ClinicID, '15+' AS typepatients, IF(Sex=0, 'Female', 'Male') AS Sex
    FROM tblaimain
    WHERE DafirstVisit <= DATE_SUB(:StartDate, INTERVAL 1 DAY)
    
    UNION ALL
    
    SELECT ClinicID, '≤14' AS typepatients, IF(Sex=0, 'Female', 'Male') AS Sex
    FROM tblcimain
    WHERE DafirstVisit <= DATE_SUB(:StartDate, INTERVAL 1 DAY)
),
art_start_prior AS (
    SELECT ClinicID FROM tblaart WHERE DaArt <= DATE_SUB(:StartDate, INTERVAL 1 DAY)
    
    UNION ALL
    
    SELECT ClinicID FROM tblcart WHERE DaArt <= DATE_SUB(:StartDate, INTERVAL 1 DAY)
),
exit_status_prior AS (
    SELECT ClinicID, Status FROM tblavpatientstatus WHERE Da <= DATE_SUB(:StartDate, INTERVAL 1 DAY)
    
    UNION ALL
    
    SELECT ClinicID, Status FROM tblcvpatientstatus WHERE Da <= DATE_SUB(:StartDate, INTERVAL 1 DAY)
),
tx_curr_prior AS (
    SELECT DISTINCT i.ClinicID, i.typepatients, i.Sex
    FROM latest_visits_prior v
    JOIN patient_info_prior i ON i.ClinicID = v.ClinicID
    LEFT JOIN art_start_prior a ON a.ClinicID = v.ClinicID
    LEFT JOIN exit_status_prior e ON e.ClinicID = v.ClinicID
    WHERE v.rn = 1 AND a.ClinicID IS NOT NULL AND e.Status IS NULL
),
tx_curr_prior_stats AS (
    SELECT 
        COUNT(DISTINCT ClinicID) AS Total_Prior,
        SUM(CASE WHEN typepatients = '≤14' AND Sex = 'Male' THEN 1 ELSE 0 END) AS Male_0_14_Prior,
        SUM(CASE WHEN typepatients = '≤14' AND Sex = 'Female' THEN 1 ELSE 0 END) AS Female_0_14_Prior,
        SUM(CASE WHEN typepatients = '15+' AND Sex = 'Male' THEN 1 ELSE 0 END) AS Male_over_14_Prior,
        SUM(CASE WHEN typepatients = '15+' AND Sex = 'Female' THEN 1 ELSE 0 END) AS Female_over_14_Prior
    FROM tx_curr_prior
),

latest_visits_current AS (
    SELECT clinicid, DatVisit, ROW_NUMBER() OVER (PARTITION BY clinicid ORDER BY DatVisit DESC) AS rn
    FROM tblavmain
    WHERE DatVisit <= :EndDate
    
    UNION ALL
    
    SELECT clinicid, DatVisit, ROW_NUMBER() OVER (PARTITION BY clinicid ORDER BY DatVisit DESC) AS rn
    FROM tblcvmain
    WHERE DatVisit <= :EndDate
),
patient_info_current AS (
    SELECT ClinicID, '15+' AS typepatients, IF(Sex=0, 'Female', 'Male') AS Sex
    FROM tblaimain
    WHERE DafirstVisit <= :EndDate
    
    UNION ALL
    
    SELECT ClinicID, '≤14' AS typepatients, IF(Sex=0, 'Female', 'Male') AS Sex
    FROM tblcimain
    WHERE DafirstVisit <= :EndDate
),
art_start_current AS (
    SELECT ClinicID FROM tblaart WHERE DaArt <= :EndDate
    
    UNION ALL
    
    SELECT ClinicID FROM tblcart WHERE DaArt <= :EndDate
),
exit_status_current AS (
    SELECT ClinicID, Status FROM tblavpatientstatus WHERE Da <= :EndDate
    
    UNION ALL
    
    SELECT ClinicID, Status FROM tblcvpatientstatus WHERE Da <= :EndDate
),
tx_curr_current AS (
    SELECT DISTINCT i.ClinicID, i.typepatients, i.Sex
    FROM latest_visits_current v
    JOIN patient_info_current i ON i.ClinicID = v.ClinicID
    LEFT JOIN art_start_current a ON a.ClinicID = v.ClinicID
    LEFT JOIN exit_status_current e ON e.ClinicID = v.ClinicID
    WHERE v.rn = 1 AND a.ClinicID IS NOT NULL AND e.Status IS NULL
),
tx_curr_current_stats AS (
    SELECT 
        COUNT(DISTINCT ClinicID) AS Total_Current,
        SUM(CASE WHEN typepatients = '≤14' AND Sex = 'Male' THEN 1 ELSE 0 END) AS Male_0_14_Current,
        SUM(CASE WHEN typepatients = '≤14' AND Sex = 'Female' THEN 1 ELSE 0 END) AS Female_0_14_Current,
        SUM(CASE WHEN typepatients = '15+' AND Sex = 'Male' THEN 1 ELSE 0 END) AS Male_over_14_Current,
        SUM(CASE WHEN typepatients = '15+' AND Sex = 'Female' THEN 1 ELSE 0 END) AS Female_over_14_Current
    FROM tx_curr_current
),

retention_calc AS (
    SELECT
        COALESCE(prior.Total_Prior, 0) AS TX_CURR_Prior,
        COALESCE(curr.Total_Current, 0) AS TX_CURR_Current,
        COALESCE(newstats.Total_New, 0) AS TX_NEW,
        CASE 
            WHEN COALESCE(prior.Total_Prior, 0) > 0 THEN 
                1 - ((COALESCE(prior.Total_Prior, 0) + COALESCE(newstats.Total_New, 0) - COALESCE(curr.Total_Current, 0)) / COALESCE(prior.Total_Prior, 0))
            ELSE 0
        END AS Retention_Quarter_Ratio
    FROM tx_curr_prior_stats prior
    CROSS JOIN tx_curr_current_stats curr
    CROSS JOIN tx_new newstats
)

SELECT
    '15. Retention rate (quarterly)' AS Indicator,
    CAST(retention.TX_CURR_Prior AS UNSIGNED) AS TX_CURR_Prior,
    CAST(retention.TX_NEW AS UNSIGNED) AS TX_NEW,
    CAST(retention.TX_CURR_Current AS UNSIGNED) AS TX_CURR_Current,
    CAST(retention.TX_CURR_Current AS UNSIGNED) AS TOTAL,
    CAST(CASE 
        WHEN retention.TX_CURR_Prior > 0 
        THEN ROUND(retention.Retention_Quarter_Ratio * 100, 2)
        ELSE 0
    END AS DECIMAL(6,2)) AS Percentage,
    CAST(CASE 
        WHEN retention.TX_CURR_Prior > 0 
        THEN ROUND(retention.Retention_Quarter_Ratio * 100, 2)
        ELSE 0
    END AS DECIMAL(6,2)) AS Retention_Quarter_Percentage,
    CAST(CASE 
        WHEN retention.TX_CURR_Prior > 0 
        THEN ROUND(POW(GREATEST(retention.Retention_Quarter_Ratio, 0), 4) * 100, 2)
        ELSE 0
    END AS DECIMAL(6,2)) AS Retention_Annualized_Percentage,
    CAST(COALESCE(curr_stats.Male_0_14_Current, 0) AS UNSIGNED) AS Male_0_14,
    CAST(COALESCE(curr_stats.Female_0_14_Current, 0) AS UNSIGNED) AS Female_0_14,
    CAST(COALESCE(curr_stats.Male_over_14_Current, 0) AS UNSIGNED) AS Male_over_14,
    CAST(COALESCE(curr_stats.Female_over_14_Current, 0) AS UNSIGNED) AS Female_over_14
FROM retention_calc retention
CROSS JOIN tx_curr_current_stats curr_stats;
