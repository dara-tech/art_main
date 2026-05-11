-- ===================================================================
-- Indicator 3: Percentage of lost patients reengaged within 28 days
-- ===================================================================

WITH adult_visits AS (
    SELECT
        'Adult' AS type,
        CASE WHEN p.Sex = 0 THEN 'Female' ELSE 'Male' END AS Sex,
        p.ClinicID,
        v.DatVisit,
        v.DaApp AS ScheduledAppointment,
        DATE_ADD(v.DaApp, INTERVAL 7 DAY) AS GraceDeadline,
        LEAD(v.DatVisit) OVER (PARTITION BY v.ClinicID ORDER BY v.DatVisit) AS NextVisitDate
    FROM tblaimain p
    JOIN tblavmain v ON p.ClinicID = v.ClinicID
    WHERE v.DaApp IS NOT NULL
      AND v.DaApp <> '0000-00-00'
),

child_visits AS (
    SELECT
        'Child' AS type,
        CASE WHEN p.Sex = 0 THEN 'Female' ELSE 'Male' END AS Sex,
        p.ClinicID,
        v.DatVisit,
        v.DaApp AS ScheduledAppointment,
        DATE_ADD(v.DaApp, INTERVAL 7 DAY) AS GraceDeadline,
        LEAD(v.DatVisit) OVER (PARTITION BY v.ClinicID ORDER BY v.DatVisit) AS NextVisitDate
    FROM tblcimain p
    JOIN tblcvmain v ON p.ClinicID = v.ClinicID
    WHERE v.DaApp IS NOT NULL
      AND v.DaApp <> '0000-00-00'
),

missed_appointments AS (
    -- Missed appointments: using same logic as CQI script
    -- Scheduled appointment where next visit is after grace deadline or null
    -- Only count appointments whose grace deadline falls within reporting period
    -- Exclude patients who are dead or transferred out
    SELECT 
        av.type,
        av.Sex,
        av.ClinicID,
        av.ScheduledAppointment AS MissDate
    FROM adult_visits av
    WHERE av.ScheduledAppointment BETWEEN :StartDate AND :EndDate
      AND av.GraceDeadline <= :EndDate
      AND (
          av.NextVisitDate IS NULL 
          OR av.NextVisitDate > av.GraceDeadline
      )
      AND NOT EXISTS (
          SELECT 1
          FROM tblavpatientstatus s
          WHERE s.ClinicID = av.ClinicID
            AND s.Status IN (:dead_code, :transfer_out_code)
            AND s.Da IS NOT NULL
            AND s.Da <> '0000-00-00'
            AND s.Da <= av.GraceDeadline
      )
    
    UNION ALL
    
    SELECT 
        cv.type,
        cv.Sex,
        cv.ClinicID,
        cv.ScheduledAppointment AS MissDate
    FROM child_visits cv
    WHERE cv.ScheduledAppointment BETWEEN :StartDate AND :EndDate
      AND cv.GraceDeadline <= :EndDate
      AND (
          cv.NextVisitDate IS NULL 
          OR cv.NextVisitDate > cv.GraceDeadline
      )
      AND NOT EXISTS (
          SELECT 1
          FROM tblcvpatientstatus s
          WHERE s.ClinicID = cv.ClinicID
            AND s.Status IN (:dead_code, :transfer_out_code)
            AND s.Da IS NOT NULL
            AND s.Da <> '0000-00-00'
            AND s.Da <= cv.GraceDeadline
      )
),

all_visits AS (
    SELECT ClinicID, DatVisit
    FROM tblavmain
    WHERE DatVisit IS NOT NULL
      AND DatVisit <> '0000-00-00'
    
    UNION ALL
    
    SELECT ClinicID, DatVisit
    FROM tblcvmain
    WHERE DatVisit IS NOT NULL
      AND DatVisit <> '0000-00-00'
),

reengaged_within_28 AS (
    -- Patients with a documented visit within 28 days after a missed appointment
    SELECT
        m.type,
        m.Sex,
        m.ClinicID,
        m.MissDate,
        MIN(v.DatVisit) AS ReengageDate
    FROM missed_appointments m
    INNER JOIN all_visits v
      ON v.ClinicID = m.ClinicID
     AND v.DatVisit > m.MissDate
     AND v.DatVisit <= DATE_ADD(m.MissDate, INTERVAL 28 DAY)
    GROUP BY
        m.type,
        m.Sex,
        m.ClinicID,
        m.MissDate
),

reengaged_stats AS (
    SELECT
        COUNT(*) AS Reengaged_Within_28,
        SUM(CASE WHEN type = 'Child' AND Sex = 'Male' THEN 1 ELSE 0 END) AS Male_0_14_Reengaged,
        SUM(CASE WHEN type = 'Child' AND Sex = 'Female' THEN 1 ELSE 0 END) AS Female_0_14_Reengaged,
        SUM(CASE WHEN type = 'Adult' AND Sex = 'Male' THEN 1 ELSE 0 END) AS Male_over_14_Reengaged,
        SUM(CASE WHEN type = 'Adult' AND Sex = 'Female' THEN 1 ELSE 0 END) AS Female_over_14_Reengaged
    FROM reengaged_within_28
),

missed_stats AS (
    SELECT 
        COUNT(*) AS Total_Missed,
        SUM(CASE WHEN type = 'Child' AND Sex = 'Male' THEN 1 ELSE 0 END) AS Male_0_14_Total,
        SUM(CASE WHEN type = 'Child' AND Sex = 'Female' THEN 1 ELSE 0 END) AS Female_0_14_Total,
        SUM(CASE WHEN type = 'Adult' AND Sex = 'Male' THEN 1 ELSE 0 END) AS Male_over_14_Total,
        SUM(CASE WHEN type = 'Adult' AND Sex = 'Female' THEN 1 ELSE 0 END) AS Female_over_14_Total
    FROM missed_appointments
)

SELECT
    '3. Percentage of missed appointments reengaged within 28 days' AS Indicator,
    CAST(IFNULL(rs.Reengaged_Within_28, 0) AS UNSIGNED) AS Reengaged_Within_28,
    CAST(IFNULL(rs.Reengaged_Within_28, 0) AS UNSIGNED) AS TOTAL,
    CAST(IFNULL(ms.Total_Missed, 0) AS UNSIGNED) AS Total_Lost,
    CAST(CASE 
        WHEN ms.Total_Missed > 0 
        THEN ROUND((IFNULL(rs.Reengaged_Within_28, 0) * 100.0 / ms.Total_Missed), 2)
        ELSE 0.00 
    END AS DECIMAL(5,2)) AS Percentage,
    CAST(IFNULL(ms.Male_0_14_Total, 0) AS UNSIGNED) AS Male_0_14,
    CAST(IFNULL(rs.Male_0_14_Reengaged, 0) AS UNSIGNED) AS Male_0_14_Reengaged,
    CAST(IFNULL(ms.Female_0_14_Total, 0) AS UNSIGNED) AS Female_0_14,
    CAST(IFNULL(rs.Female_0_14_Reengaged, 0) AS UNSIGNED) AS Female_0_14_Reengaged,
    CAST(IFNULL(ms.Male_over_14_Total, 0) AS UNSIGNED) AS Male_over_14,
    CAST(IFNULL(rs.Male_over_14_Reengaged, 0) AS UNSIGNED) AS Male_over_14_Reengaged,
    CAST(IFNULL(ms.Female_over_14_Total, 0) AS UNSIGNED) AS Female_over_14,
    CAST(IFNULL(rs.Female_over_14_Reengaged, 0) AS UNSIGNED) AS Female_over_14_Reengaged,
    -- Aggregated totals for easier frontend access
    CAST(IFNULL(ms.Male_0_14_Total, 0) + IFNULL(ms.Female_0_14_Total, 0) AS UNSIGNED) AS Children_Total,
    CAST(IFNULL(ms.Male_over_14_Total, 0) + IFNULL(ms.Female_over_14_Total, 0) AS UNSIGNED) AS Adults_Total
FROM missed_stats ms
LEFT JOIN reengaged_stats rs ON 1 = 1;