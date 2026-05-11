-- ===================================================================
-- Indicator 3 detail: Percentage of missed appointments reengaged within 28 days
-- Returns patient-level records for each reengagement event (≤28 days).
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
)

SELECT
    main.ClinicID AS clinicid,
    art.ART AS art_number,
    main.Sex AS sex,
    CASE WHEN main.Sex = 0 THEN 'Female' ELSE 'Male' END AS sex_display,
    'Adult' AS patient_type,
    TIMESTAMPDIFF(YEAR, main.DaBirth, :EndDate) AS age,
    main.DafirstVisit AS DafirstVisit,
    m.MissDate AS miss_date,
    r.ReengageDate AS reengage_date,
    CASE 
        WHEN r.ReengageDate IS NOT NULL THEN 'Returned (≤28 days)'
        ELSE 'Not Returned'
    END AS return_status,
    CASE 
        WHEN r.ReengageDate IS NOT NULL 
        THEN TIMESTAMPDIFF(DAY, m.MissDate, r.ReengageDate)
        ELSE NULL
    END AS days_to_reengage
FROM missed_appointments m
JOIN tblaimain main ON main.ClinicID = m.ClinicID
LEFT JOIN tblaart art ON main.ClinicID = art.ClinicID
LEFT JOIN reengaged_within_28 r
  ON r.ClinicID = m.ClinicID
 AND r.MissDate = m.MissDate
WHERE m.type = 'Adult'

UNION ALL

SELECT
    main.ClinicID AS clinicid,
    art.ART AS art_number,
    main.Sex AS sex,
    CASE WHEN main.Sex = 0 THEN 'Female' ELSE 'Male' END AS sex_display,
    'Child' AS patient_type,
    TIMESTAMPDIFF(YEAR, main.DaBirth, :EndDate) AS age,
    main.DafirstVisit AS DafirstVisit,
    m.MissDate AS miss_date,
    r.ReengageDate AS reengage_date,
    CASE 
        WHEN r.ReengageDate IS NOT NULL THEN 'Returned (≤28 days)'
        ELSE 'Not Returned'
    END AS return_status,
    CASE 
        WHEN r.ReengageDate IS NOT NULL 
        THEN TIMESTAMPDIFF(DAY, m.MissDate, r.ReengageDate)
        ELSE NULL
    END AS days_to_reengage
FROM missed_appointments m
JOIN tblcimain main ON main.ClinicID = m.ClinicID
LEFT JOIN tblcart art ON main.ClinicID = art.ClinicID
LEFT JOIN reengaged_within_28 r
  ON r.ClinicID = m.ClinicID
 AND r.MissDate = m.MissDate
WHERE m.type = 'Child'

ORDER BY miss_date DESC, clinicid;

