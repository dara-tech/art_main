-- ===================================================================
-- Indicator 5d detail: Percentage of early visits among ART patients
-- Returns patient-level records for visits that are early (<0 days difference)
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

early_visits AS (
    -- Visits that are before the previous visit's appointment date (negative days difference)
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
      AND DaysFromPreviousApp < 0  -- Early (visit before appointment)
)

SELECT
    main.ClinicID AS clinicid,
    art.ART AS art_number,
    main.Sex AS sex,
    CASE WHEN main.Sex = 0 THEN 'Female' ELSE 'Male' END AS sex_display,
    'Adult' AS patient_type,
    TIMESTAMPDIFF(YEAR, main.DaBirth, :EndDate) AS age,
    main.DafirstVisit AS DafirstVisit,
    e.DatVisit AS visit_date,
    e.PreviousVisitAppointment AS previous_appointment_date,
    e.CurrentAppointment AS current_appointment_date,
    ABS(e.DaysFromPreviousApp) AS days_early,
    'Early' AS visit_status
FROM early_visits e
JOIN tblaimain main ON main.ClinicID = e.ClinicID
LEFT JOIN tblaart art ON main.ClinicID = art.ClinicID
WHERE e.type = 'Adult'

UNION ALL

SELECT
    main.ClinicID AS clinicid,
    art.ART AS art_number,
    main.Sex AS sex,
    CASE WHEN main.Sex = 0 THEN 'Female' ELSE 'Male' END AS sex_display,
    'Child' AS patient_type,
    TIMESTAMPDIFF(YEAR, main.DaBirth, :EndDate) AS age,
    main.DafirstVisit AS DafirstVisit,
    e.DatVisit AS visit_date,
    e.PreviousVisitAppointment AS previous_appointment_date,
    e.CurrentAppointment AS current_appointment_date,
    ABS(e.DaysFromPreviousApp) AS days_early,
    'Early' AS visit_status
FROM early_visits e
JOIN tblcimain main ON main.ClinicID = e.ClinicID
LEFT JOIN tblcart art ON main.ClinicID = art.ClinicID
WHERE e.type = 'Child'

ORDER BY visit_date DESC, clinicid;

