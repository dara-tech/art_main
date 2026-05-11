-- ===================================================================
-- Indicator 5a detail: Percentage of late visits beyond ARV supply buffer date
-- Returns patient-level records for visits that are >5 days late from previous visit's appointment
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

late_beyond_buffer AS (
    -- Visits that are more than 5 days late from previous visit's appointment
    SELECT
        type,
        Sex,
        ClinicID,
        DatVisit,
        CurrentAppointment,
        PreviousVisitAppointment,
        DaysFromPreviousApp
    FROM all_visits
    WHERE PreviousVisitAppointment IS NOT NULL
      AND PreviousVisitAppointment <> '0000-00-00'
      AND DaysFromPreviousApp > 5  -- More than 5 days late
)

SELECT
    main.ClinicID AS clinicid,
    art.ART AS art_number,
    main.Sex AS sex,
    CASE WHEN main.Sex = 0 THEN 'Female' ELSE 'Male' END AS sex_display,
    'Adult' AS patient_type,
    TIMESTAMPDIFF(YEAR, main.DaBirth, :EndDate) AS age,
    main.DafirstVisit AS DafirstVisit,
    l.DatVisit AS visit_date,
    l.PreviousVisitAppointment AS previous_appointment_date,
    l.CurrentAppointment AS current_appointment_date,
    l.DaysFromPreviousApp AS days_late,
    'Late Beyond Buffer (>5 days)' AS visit_status
FROM late_beyond_buffer l
JOIN tblaimain main ON main.ClinicID = l.ClinicID
LEFT JOIN tblaart art ON main.ClinicID = art.ClinicID
WHERE l.type = 'Adult'

UNION ALL

SELECT
    main.ClinicID AS clinicid,
    art.ART AS art_number,
    main.Sex AS sex,
    CASE WHEN main.Sex = 0 THEN 'Female' ELSE 'Male' END AS sex_display,
    'Child' AS patient_type,
    TIMESTAMPDIFF(YEAR, main.DaBirth, :EndDate) AS age,
    main.DafirstVisit AS DafirstVisit,
    l.DatVisit AS visit_date,
    l.PreviousVisitAppointment AS previous_appointment_date,
    l.CurrentAppointment AS current_appointment_date,
    l.DaysFromPreviousApp AS days_late,
    'Late Beyond Buffer (>5 days)' AS visit_status
FROM late_beyond_buffer l
JOIN tblcimain main ON main.ClinicID = l.ClinicID
LEFT JOIN tblcart art ON main.ClinicID = art.ClinicID
WHERE l.type = 'Child'

ORDER BY visit_date DESC, clinicid;

