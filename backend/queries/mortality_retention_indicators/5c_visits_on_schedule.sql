-- ===================================================================
-- Indicator 5c: Percentage of visits on schedule among ART patients
-- Logic: Compare current visit date with previous visit's appointment date
-- On schedule: Visit date equals previous visit's appointment date (0 days difference)
-- Matches CQI script logic: DATEDIFF(current_visit_date, previous_visit_appointment) = 0
-- ===================================================================

WITH adult_visits_all AS (
    -- Get ALL visits first to properly calculate LAG (previous visit appointment)
    SELECT
        'Adult' AS type,
        CASE WHEN p.Sex = 0 THEN 'Female' ELSE 'Male' END AS Sex,
        p.ClinicID,
        v.DatVisit,
        v.DaApp AS CurrentAppointment,
        LAG(v.DaApp) OVER (PARTITION BY v.ClinicID ORDER BY v.DatVisit) AS PreviousVisitAppointment,
        DATEDIFF(v.DatVisit, LAG(v.DaApp) OVER (PARTITION BY v.ClinicID ORDER BY v.DatVisit)) AS DaysFromPreviousApp
    FROM tblaimain p
    JOIN tblavmain v ON p.ClinicID = v.ClinicID
    WHERE v.DatVisit IS NOT NULL
      AND v.DatVisit <> '0000-00-00'
      AND v.DaApp IS NOT NULL
      AND v.DaApp <> '0000-00-00'
),

child_visits_all AS (
    -- Get ALL visits first to properly calculate LAG (previous visit appointment)
    SELECT
        'Child' AS type,
        CASE WHEN p.Sex = 0 THEN 'Female' ELSE 'Male' END AS Sex,
        p.ClinicID,
        v.DatVisit,
        v.DaApp AS CurrentAppointment,
        LAG(v.DaApp) OVER (PARTITION BY v.ClinicID ORDER BY v.DatVisit) AS PreviousVisitAppointment,
        DATEDIFF(v.DatVisit, LAG(v.DaApp) OVER (PARTITION BY v.ClinicID ORDER BY v.DatVisit)) AS DaysFromPreviousApp
    FROM tblcimain p
    JOIN tblcvmain v ON p.ClinicID = v.ClinicID
    WHERE v.DatVisit IS NOT NULL
      AND v.DatVisit <> '0000-00-00'
      AND v.DaApp IS NOT NULL
      AND v.DaApp <> '0000-00-00'
),

all_visits AS (
    -- Filter to only visits in the reporting period AFTER calculating LAG
    SELECT type, Sex, ClinicID, DatVisit, CurrentAppointment, PreviousVisitAppointment, DaysFromPreviousApp
    FROM adult_visits_all
    WHERE DatVisit BETWEEN :StartDate AND :EndDate
    UNION ALL
    SELECT type, Sex, ClinicID, DatVisit, CurrentAppointment, PreviousVisitAppointment, DaysFromPreviousApp
    FROM child_visits_all
    WHERE DatVisit BETWEEN :StartDate AND :EndDate
),

on_schedule_visits AS (
    -- Visits that are exactly on the previous visit's appointment date (0 days difference)
    -- DATEDIFF(current_visit_date, previous_visit_appointment) = 0
    SELECT
        type,
        Sex,
        ClinicID,
        DatVisit
    FROM all_visits
    WHERE PreviousVisitAppointment IS NOT NULL
      AND PreviousVisitAppointment <> '0000-00-00'
      AND DaysFromPreviousApp = 0  -- On schedule
),

total_visits AS (
    -- All visits (excluding first visits where there's no previous visit appointment)
    SELECT
        type,
        Sex,
        ClinicID,
        DatVisit
    FROM all_visits
    WHERE PreviousVisitAppointment IS NOT NULL
      AND PreviousVisitAppointment <> '0000-00-00'
),

total_visits_stats AS (
    -- Calculate demographic totals for denominator using COUNT DISTINCT
    SELECT
        COUNT(DISTINCT CASE WHEN type = 'Child' AND Sex = 'Male' THEN CONCAT(ClinicID, '-', DatVisit) END) AS Male_0_14_Total,
        COUNT(DISTINCT CASE WHEN type = 'Child' AND Sex = 'Female' THEN CONCAT(ClinicID, '-', DatVisit) END) AS Female_0_14_Total,
        COUNT(DISTINCT CASE WHEN type = 'Adult' AND Sex = 'Male' THEN CONCAT(ClinicID, '-', DatVisit) END) AS Male_over_14_Total,
        COUNT(DISTINCT CASE WHEN type = 'Adult' AND Sex = 'Female' THEN CONCAT(ClinicID, '-', DatVisit) END) AS Female_over_14_Total
    FROM total_visits
),
total_visits_calc AS (
    -- Calculate Total_Visits as sum of all demographic groups to ensure consistency
    SELECT
        (COUNT(DISTINCT CASE WHEN type = 'Child' AND Sex = 'Male' THEN CONCAT(ClinicID, '-', DatVisit) END) +
         COUNT(DISTINCT CASE WHEN type = 'Child' AND Sex = 'Female' THEN CONCAT(ClinicID, '-', DatVisit) END) +
         COUNT(DISTINCT CASE WHEN type = 'Adult' AND Sex = 'Male' THEN CONCAT(ClinicID, '-', DatVisit) END) +
         COUNT(DISTINCT CASE WHEN type = 'Adult' AND Sex = 'Female' THEN CONCAT(ClinicID, '-', DatVisit) END)) AS Total_Visits
    FROM total_visits
)

SELECT
    '5c. Percentage of visits on schedule among ART patients' AS Indicator,
    CAST(IFNULL(COUNT(o.ClinicID), 0) AS UNSIGNED) AS On_Schedule_Visits,
    CAST(IFNULL(COUNT(o.ClinicID), 0) AS UNSIGNED) AS TOTAL,
    CAST(IFNULL(tvc.Total_Visits, 0) AS UNSIGNED) AS Total_Visits,
    CAST(CASE 
        WHEN tvc.Total_Visits > 0 
        THEN ROUND((COUNT(o.ClinicID) * 100.0 / tvc.Total_Visits), 2)
        ELSE 0.00 
    END AS DECIMAL(5,2)) AS Percentage,
    CAST(IFNULL(SUM(CASE WHEN o.type = 'Child' AND o.Sex = 'Male' THEN 1 ELSE 0 END), 0) AS UNSIGNED) AS Male_0_14,
    CAST(IFNULL(SUM(CASE WHEN o.type = 'Child' AND o.Sex = 'Female' THEN 1 ELSE 0 END), 0) AS UNSIGNED) AS Female_0_14,
    CAST(IFNULL(SUM(CASE WHEN o.type = 'Adult' AND o.Sex = 'Male' THEN 1 ELSE 0 END), 0) AS UNSIGNED) AS Male_over_14,
    CAST(IFNULL(SUM(CASE WHEN o.type = 'Adult' AND o.Sex = 'Female' THEN 1 ELSE 0 END), 0) AS UNSIGNED) AS Female_over_14,
    -- Individual demographic totals for denominator
    CAST(IFNULL(tvs.Male_0_14_Total, 0) AS UNSIGNED) AS Male_0_14_Total,
    CAST(IFNULL(tvs.Female_0_14_Total, 0) AS UNSIGNED) AS Female_0_14_Total,
    CAST(IFNULL(tvs.Male_over_14_Total, 0) AS UNSIGNED) AS Male_over_14_Total,
    CAST(IFNULL(tvs.Female_over_14_Total, 0) AS UNSIGNED) AS Female_over_14_Total,
    -- Aggregated totals for easier frontend access
    CAST(IFNULL(tvs.Male_0_14_Total, 0) + IFNULL(tvs.Female_0_14_Total, 0) AS UNSIGNED) AS Children_Total,
    CAST(IFNULL(tvs.Male_over_14_Total, 0) + IFNULL(tvs.Female_over_14_Total, 0) AS UNSIGNED) AS Adults_Total
FROM total_visits t
LEFT JOIN on_schedule_visits o ON o.ClinicID = t.ClinicID 
    AND o.DatVisit = t.DatVisit 
    AND o.type = t.type 
    AND o.Sex = t.Sex
CROSS JOIN total_visits_stats tvs
CROSS JOIN total_visits_calc tvc;
