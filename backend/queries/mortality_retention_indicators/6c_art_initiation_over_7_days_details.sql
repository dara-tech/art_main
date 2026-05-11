-- ===================================================================
-- Indicator 6c detail: Percentage of patients newly initiating ART after >7 days of diagnosed date
-- Returns patient-level records for patients who started ART more than 7 days after diagnosis
-- ===================================================================

WITH first_visits_adult AS (
    SELECT 
        ClinicID,
        MIN(DatVisit) AS FirstVisitDate
    FROM tblavmain
    WHERE DatVisit IS NOT NULL 
      AND DatVisit <> '0000-00-00'
    GROUP BY ClinicID
),
first_visits_child AS (
    SELECT 
        ClinicID,
        MIN(DatVisit) AS FirstVisitDate
    FROM tblcvmain
    WHERE DatVisit IS NOT NULL 
      AND DatVisit <> '0000-00-00'
    GROUP BY ClinicID
)

SELECT
    main.ClinicID AS clinicid,
    art.ART AS art_number,
    main.Sex AS sex,
    CASE WHEN main.Sex = 0 THEN 'Female' ELSE 'Male' END AS sex_display,
    'Adult' AS patient_type,
    TIMESTAMPDIFF(YEAR, main.DaBirth, :EndDate) AS age,
    COALESCE(
        NULLIF(main.DafirstVisit, '0000-00-00'),
        fv.FirstVisitDate,
        art.DaArt
    ) AS DafirstVisit,
    COALESCE(
        NULLIF(main.DafirstVisit, '0000-00-00'),
        fv.FirstVisitDate,
        art.DaArt
    ) AS diagnosis_date,
    art.DaArt AS art_start_date,
    COALESCE(
        DATEDIFF(art.DaArt, 
            COALESCE(
                NULLIF(main.DafirstVisit, '0000-00-00'),
                fv.FirstVisitDate,
                art.DaArt
            )
        ),
        0
    ) AS days_to_initiation,
    '>7 Days' AS initiation_status
FROM tblaimain main
JOIN tblaart art ON main.ClinicID = art.ClinicID
LEFT JOIN first_visits_adult fv ON fv.ClinicID = main.ClinicID
WHERE art.DaArt BETWEEN :StartDate AND :EndDate
  AND DATEDIFF(art.DaArt, 
      COALESCE(
          NULLIF(main.DafirstVisit, '0000-00-00'),
          fv.FirstVisitDate,
          art.DaArt
      )
  ) > 7
  AND (main.OffIn IS NULL OR main.OffIn <> :transfer_in_code)
  AND (main.TypeofReturn IS NULL OR main.TypeofReturn = -1)

UNION ALL

SELECT
    main.ClinicID AS clinicid,
    art.ART AS art_number,
    main.Sex AS sex,
    CASE WHEN main.Sex = 0 THEN 'Female' ELSE 'Male' END AS sex_display,
    'Child' AS patient_type,
    TIMESTAMPDIFF(YEAR, main.DaBirth, :EndDate) AS age,
    COALESCE(
        NULLIF(main.DafirstVisit, '0000-00-00'),
        fv.FirstVisitDate,
        art.DaArt
    ) AS DafirstVisit,
    COALESCE(
        NULLIF(main.DafirstVisit, '0000-00-00'),
        fv.FirstVisitDate,
        art.DaArt
    ) AS diagnosis_date,
    art.DaArt AS art_start_date,
    COALESCE(
        DATEDIFF(art.DaArt,
            COALESCE(
                NULLIF(main.DafirstVisit, '0000-00-00'),
                fv.FirstVisitDate,
                art.DaArt
            )
        ),
        0
    ) AS days_to_initiation,
    '>7 Days' AS initiation_status
FROM tblcimain main
JOIN tblcart art ON main.ClinicID = art.ClinicID
LEFT JOIN first_visits_child fv ON fv.ClinicID = main.ClinicID
WHERE art.DaArt BETWEEN :StartDate AND :EndDate
  AND DATEDIFF(art.DaArt,
      COALESCE(
          NULLIF(main.DafirstVisit, '0000-00-00'),
          fv.FirstVisitDate,
          art.DaArt
      )
  ) > 7

ORDER BY art_start_date DESC, clinicid;

