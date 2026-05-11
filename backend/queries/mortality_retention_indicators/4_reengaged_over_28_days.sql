-- ===================================================================
-- Indicator 4: Percentage of lost patients reengaged after 28+ days
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
    -- For indicator 4 (late reengagement after 28+ days), only include patients who have at least 28 days from miss date to end date
    -- Exclude patients who are dead or transferred out
    SELECT 
        av.type,
        av.Sex,
        av.ClinicID,
        av.ScheduledAppointment AS MissDate
    FROM adult_visits av
    WHERE av.ScheduledAppointment BETWEEN :StartDate AND :EndDate
      AND av.GraceDeadline <= :EndDate
      AND DATEDIFF(:EndDate, av.ScheduledAppointment) >= 28
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
      AND DATEDIFF(:EndDate, cv.ScheduledAppointment) >= 28
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
    -- Patients who reengaged within 28 days (to exclude from indicator 4)
    SELECT
        m.type,
        m.Sex,
        m.ClinicID,
        m.MissDate
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

reengaged_over_28 AS (
    -- Patients with a documented visit more than 28 days after a missed appointment
    -- BUT who did NOT reengage within 28 days
    SELECT
        m.type,
        m.Sex,
        m.ClinicID,
        m.MissDate,
        MIN(v.DatVisit) AS ReengageDate
    FROM missed_appointments m
    INNER JOIN all_visits v
      ON v.ClinicID = m.ClinicID
     AND v.DatVisit > DATE_ADD(m.MissDate, INTERVAL 28 DAY)
    WHERE NOT EXISTS (
        SELECT 1
        FROM reengaged_within_28 r28
        WHERE r28.ClinicID = m.ClinicID
          AND r28.MissDate = m.MissDate
          AND r28.type = m.type
          AND r28.Sex = m.Sex
    )
    GROUP BY
        m.type,
        m.Sex,
        m.ClinicID,
        m.MissDate
),

reengaged_within_28_stats AS (
    SELECT
        COUNT(*) AS Reengaged_Within_28,
        SUM(CASE WHEN type = 'Child' AND Sex = 'Male' THEN 1 ELSE 0 END) AS Male_0_14_Within_28,
        SUM(CASE WHEN type = 'Child' AND Sex = 'Female' THEN 1 ELSE 0 END) AS Female_0_14_Within_28,
        SUM(CASE WHEN type = 'Adult' AND Sex = 'Male' THEN 1 ELSE 0 END) AS Male_over_14_Within_28,
        SUM(CASE WHEN type = 'Adult' AND Sex = 'Female' THEN 1 ELSE 0 END) AS Female_over_14_Within_28
    FROM reengaged_within_28
),

reengaged_stats AS (
    SELECT
        COUNT(*) AS Reengaged_Over_28,
        SUM(CASE WHEN type = 'Child' AND Sex = 'Male' THEN 1 ELSE 0 END) AS Male_0_14_Reengaged,
        SUM(CASE WHEN type = 'Child' AND Sex = 'Female' THEN 1 ELSE 0 END) AS Female_0_14_Reengaged,
        SUM(CASE WHEN type = 'Adult' AND Sex = 'Male' THEN 1 ELSE 0 END) AS Male_over_14_Reengaged,
        SUM(CASE WHEN type = 'Adult' AND Sex = 'Female' THEN 1 ELSE 0 END) AS Female_over_14_Reengaged
    FROM reengaged_over_28
),

missed_stats AS (
    SELECT 
        COUNT(*) AS Total_Missed,
        SUM(CASE WHEN type = 'Child' AND Sex = 'Male' THEN 1 ELSE 0 END) AS Male_0_14_Total,
        SUM(CASE WHEN type = 'Child' AND Sex = 'Female' THEN 1 ELSE 0 END) AS Female_0_14_Total,
        SUM(CASE WHEN type = 'Adult' AND Sex = 'Male' THEN 1 ELSE 0 END) AS Male_over_14_Total,
        SUM(CASE WHEN type = 'Adult' AND Sex = 'Female' THEN 1 ELSE 0 END) AS Female_over_14_Total
    FROM missed_appointments
),

eligible_for_late_reengagement AS (
    -- Total missed MINUS those who reengaged within 28 days
    SELECT
        ms.Total_Missed - IFNULL(rw28.Reengaged_Within_28, 0) AS Total_Eligible,
        ms.Male_0_14_Total - IFNULL(rw28.Male_0_14_Within_28, 0) AS Male_0_14_Eligible,
        ms.Female_0_14_Total - IFNULL(rw28.Female_0_14_Within_28, 0) AS Female_0_14_Eligible,
        ms.Male_over_14_Total - IFNULL(rw28.Male_over_14_Within_28, 0) AS Male_over_14_Eligible,
        ms.Female_over_14_Total - IFNULL(rw28.Female_over_14_Within_28, 0) AS Female_over_14_Eligible
    FROM missed_stats ms
    CROSS JOIN reengaged_within_28_stats rw28
)

SELECT
    '4. Percentage of missed appointments reengaged after 28+ days' AS Indicator,
    CAST(IFNULL(rs.Reengaged_Over_28, 0) AS UNSIGNED) AS Reengaged_Over_28,
    CAST(IFNULL(rs.Reengaged_Over_28, 0) AS UNSIGNED) AS TOTAL,
    CAST(IFNULL(e.Total_Eligible, 0) AS UNSIGNED) AS Total_Lost,
    CAST(CASE 
        WHEN e.Total_Eligible > 0 
        THEN ROUND((IFNULL(rs.Reengaged_Over_28, 0) * 100.0 / e.Total_Eligible), 2)
        ELSE 0.00 
    END AS DECIMAL(5,2)) AS Percentage,
    -- Demographic breakdown: use ELIGIBLE counts (not total missed) to match denominator
    -- This ensures Male_0_14 + Female_0_14 + Male_over_14 + Female_over_14 = Total_Lost
    CAST(IFNULL(e.Male_0_14_Eligible, 0) AS UNSIGNED) AS Male_0_14,
    CAST(IFNULL(rs.Male_0_14_Reengaged, 0) AS UNSIGNED) AS Male_0_14_Reengaged,
    CAST(IFNULL(e.Female_0_14_Eligible, 0) AS UNSIGNED) AS Female_0_14,
    CAST(IFNULL(rs.Female_0_14_Reengaged, 0) AS UNSIGNED) AS Female_0_14_Reengaged,
    CAST(IFNULL(e.Male_over_14_Eligible, 0) AS UNSIGNED) AS Male_over_14,
    CAST(IFNULL(rs.Male_over_14_Reengaged, 0) AS UNSIGNED) AS Male_over_14_Reengaged,
    CAST(IFNULL(e.Female_over_14_Eligible, 0) AS UNSIGNED) AS Female_over_14,
    CAST(IFNULL(rs.Female_over_14_Reengaged, 0) AS UNSIGNED) AS Female_over_14_Reengaged,
    -- Eligible fields for denominator calculation (same as above, kept for backward compatibility)
    CAST(IFNULL(e.Male_0_14_Eligible, 0) AS UNSIGNED) AS Male_0_14_Eligible,
    CAST(IFNULL(e.Female_0_14_Eligible, 0) AS UNSIGNED) AS Female_0_14_Eligible,
    CAST(IFNULL(e.Male_over_14_Eligible, 0) AS UNSIGNED) AS Male_over_14_Eligible,
    CAST(IFNULL(e.Female_over_14_Eligible, 0) AS UNSIGNED) AS Female_over_14_Eligible,
    -- Aggregated totals: use eligible counts to match Total_Lost
    CAST(IFNULL(e.Male_0_14_Eligible, 0) + IFNULL(e.Female_0_14_Eligible, 0) AS UNSIGNED) AS Children_Total,
    CAST(IFNULL(e.Male_over_14_Eligible, 0) + IFNULL(e.Female_over_14_Eligible, 0) AS UNSIGNED) AS Adults_Total
FROM eligible_for_late_reengagement e
LEFT JOIN reengaged_stats rs ON 1 = 1;
