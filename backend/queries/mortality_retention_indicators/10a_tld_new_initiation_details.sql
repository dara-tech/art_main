-- ===================================================================
-- Indicator 10a detail: Percentage of patients newly initiating ART with TLD as 1st line regimen
-- Returns patient-level records for newly initiated patients with their TLD status
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
),

newly_initiated_patients AS (
    -- Adults: Same-day initiation (0 day) - matches 6a
    SELECT 
        'Adult' as type,
        IF(p.Sex=0, "Female", "Male") as Sex,
        p.ClinicID,
        p.DaBirth,
        COALESCE(
            NULLIF(p.DafirstVisit, '0000-00-00'),
            fv.FirstVisitDate,
            art.DaArt
        ) AS DafirstVisit,
        art.DaArt as ARTStartDate
    FROM tblaimain p 
    JOIN tblaart art ON p.ClinicID = art.ClinicID
    LEFT JOIN first_visits_adult fv ON fv.ClinicID = p.ClinicID
    WHERE 
        art.DaArt BETWEEN :StartDate AND :EndDate
        AND DATEDIFF(art.DaArt,
            COALESCE(
                NULLIF(p.DafirstVisit, '0000-00-00'),
                fv.FirstVisitDate,
                art.DaArt
            )
        ) = 0
        AND (p.OffIn IS NULL OR p.OffIn <> :transfer_in_code)
        AND (p.TypeofReturn IS NULL OR p.TypeofReturn = -1)
    
    UNION ALL
    
    -- Adults: Initiation 1-7 days - matches 6b
    SELECT 
        'Adult' as type,
        IF(p.Sex=0, "Female", "Male") as Sex,
        p.ClinicID,
        p.DaBirth,
        COALESCE(
            NULLIF(p.DafirstVisit, '0000-00-00'),
            fv.FirstVisitDate,
            art.DaArt
        ) AS DafirstVisit,
        art.DaArt as ARTStartDate
    FROM tblaimain p 
    JOIN tblaart art ON p.ClinicID = art.ClinicID
    LEFT JOIN first_visits_adult fv ON fv.ClinicID = p.ClinicID
    WHERE 
        art.DaArt BETWEEN :StartDate AND :EndDate
        AND DATEDIFF(art.DaArt,
            COALESCE(
                NULLIF(p.DafirstVisit, '0000-00-00'),
                fv.FirstVisitDate,
                art.DaArt
            )
        ) BETWEEN 1 AND 7
        AND (p.TypeofReturn IS NULL OR p.TypeofReturn = -1)
    
    UNION ALL
    
    -- Adults: Initiation >7 days - matches 6c
    SELECT 
        'Adult' as type,
        IF(p.Sex=0, "Female", "Male") as Sex,
        p.ClinicID,
        p.DaBirth,
        COALESCE(
            NULLIF(p.DafirstVisit, '0000-00-00'),
            fv.FirstVisitDate,
            art.DaArt
        ) AS DafirstVisit,
        art.DaArt as ARTStartDate
    FROM tblaimain p 
    JOIN tblaart art ON p.ClinicID = art.ClinicID
    LEFT JOIN first_visits_adult fv ON fv.ClinicID = p.ClinicID
    WHERE 
        art.DaArt BETWEEN :StartDate AND :EndDate
        AND DATEDIFF(art.DaArt,
            COALESCE(
                NULLIF(p.DafirstVisit, '0000-00-00'),
                fv.FirstVisitDate,
                art.DaArt
            )
        ) > 7
        AND (p.OffIn IS NULL OR p.OffIn <> :transfer_in_code)
        AND (p.TypeofReturn IS NULL OR p.TypeofReturn = -1)
    
    UNION ALL
    
    -- Children: Same-day initiation (0 day)
    SELECT 
        'Child' as type,
        IF(p.Sex=0, "Female", "Male") as Sex,
        p.ClinicID,
        p.DaBirth,
        COALESCE(
            NULLIF(p.DafirstVisit, '0000-00-00'),
            fv.FirstVisitDate,
            art.DaArt
        ) AS DafirstVisit,
        art.DaArt as ARTStartDate
    FROM tblcimain p 
    JOIN tblcart art ON p.ClinicID = art.ClinicID
    LEFT JOIN first_visits_child fv ON fv.ClinicID = p.ClinicID
    WHERE 
        art.DaArt BETWEEN :StartDate AND :EndDate
        AND DATEDIFF(art.DaArt,
            COALESCE(
                NULLIF(p.DafirstVisit, '0000-00-00'),
                fv.FirstVisitDate,
                art.DaArt
            )
        ) = 0
    
    UNION ALL
    
    -- Children: Initiation 1-7 days
    SELECT 
        'Child' as type,
        IF(p.Sex=0, "Female", "Male") as Sex,
        p.ClinicID,
        p.DaBirth,
        COALESCE(
            NULLIF(p.DafirstVisit, '0000-00-00'),
            fv.FirstVisitDate,
            art.DaArt
        ) AS DafirstVisit,
        art.DaArt as ARTStartDate
    FROM tblcimain p 
    JOIN tblcart art ON p.ClinicID = art.ClinicID
    LEFT JOIN first_visits_child fv ON fv.ClinicID = p.ClinicID
    WHERE 
        art.DaArt BETWEEN :StartDate AND :EndDate
        AND DATEDIFF(art.DaArt,
            COALESCE(
                NULLIF(p.DafirstVisit, '0000-00-00'),
                fv.FirstVisitDate,
                art.DaArt
            )
        ) BETWEEN 1 AND 7
    
    UNION ALL
    
    -- Children: Initiation >7 days
    SELECT 
        'Child' as type,
        IF(p.Sex=0, "Female", "Male") as Sex,
        p.ClinicID,
        p.DaBirth,
        COALESCE(
            NULLIF(p.DafirstVisit, '0000-00-00'),
            fv.FirstVisitDate,
            art.DaArt
        ) AS DafirstVisit,
        art.DaArt as ARTStartDate
    FROM tblcimain p 
    JOIN tblcart art ON p.ClinicID = art.ClinicID
    LEFT JOIN first_visits_child fv ON fv.ClinicID = p.ClinicID
    WHERE 
        art.DaArt BETWEEN :StartDate AND :EndDate
        AND DATEDIFF(art.DaArt,
            COALESCE(
                NULLIF(p.DafirstVisit, '0000-00-00'),
                fv.FirstVisitDate,
                art.DaArt
            )
        ) > 7
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
    SELECT DISTINCT
        nip.ClinicID,
        nip.type,
        nip.Sex,
        nip.DaBirth,
        nip.DafirstVisit,
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
)

SELECT
    main.ClinicID AS clinicid,
    art.ART AS art_number,
    main.Sex AS sex,
    CASE WHEN main.Sex = 0 THEN 'Female' ELSE 'Male' END AS sex_display,
    'Adult' AS patient_type,
    TIMESTAMPDIFF(YEAR, main.DaBirth, :EndDate) AS age,
    ts.DafirstVisit AS DafirstVisit,
    ts.ARTStartDate AS art_start_date,
    art.DaArt AS DaArt,
    ts.drugname AS drug_name,
    ts.TLDStatus AS tld_status
FROM tld_status ts
JOIN tblaimain main ON main.ClinicID = ts.ClinicID
JOIN tblaart art ON main.ClinicID = art.ClinicID
WHERE ts.type = 'Adult'
  AND art.DaArt = ts.ARTStartDate

UNION ALL

SELECT
    main.ClinicID AS clinicid,
    art.ART AS art_number,
    main.Sex AS sex,
    CASE WHEN main.Sex = 0 THEN 'Female' ELSE 'Male' END AS sex_display,
    'Child' AS patient_type,
    TIMESTAMPDIFF(YEAR, main.DaBirth, :EndDate) AS age,
    ts.DafirstVisit AS DafirstVisit,
    ts.ARTStartDate AS art_start_date,
    art.DaArt AS DaArt,
    ts.drugname AS drug_name,
    ts.TLDStatus AS tld_status
FROM tld_status ts
JOIN tblcimain main ON main.ClinicID = ts.ClinicID
JOIN tblcart art ON main.ClinicID = art.ClinicID
WHERE ts.type = 'Child'
  AND art.DaArt = ts.ARTStartDate

ORDER BY art_start_date DESC, clinicid;

