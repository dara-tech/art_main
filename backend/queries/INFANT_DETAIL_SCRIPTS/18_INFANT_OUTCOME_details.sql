-- =====================================================
-- INFANT PATIENT OUTCOME DETAILS
-- =====================================================

-- =====================================================
-- PARAMETER SETUP
-- Set these parameters before running this query

-- Date parameters
SET @StartDate = '2025-04-01';             -- Start date (YYYY-MM-DD)
SET @EndDate = '2025-06-30';               -- End date (YYYY-MM-DD)

-- MAIN QUERY
-- =====================================================
-- Patient Outcomes
-- Status codes match frmExVisit.vb form: 0=DNA PCR(+), 1=HIV+, 2=HIV-, 3=Death, 4=Lost, 5=Transfer Out
SELECT
    tbleimain.ClinicID as clinicid,
    tbleimain.Sex as sex,
    CASE 
        WHEN tbleimain.Sex = 0 THEN 'Female'
        WHEN tbleimain.Sex = 1 THEN 'Male'
        ELSE 'Unknown'
    END as sex_display,
    tbleimain.DaBirth as DaBirth,
    tbleimain.DafirstVisit as DafirstVisit,
    NULL as DatVisit,
    tblevpatientstatus.DaStatus as outcome_date,
    tblevpatientstatus.Status as status,
    CASE 
        WHEN tblevpatientstatus.Status = 0 THEN 'DNA PCR(+)'
        WHEN tblevpatientstatus.Status = 1 THEN 'HIV+'
        WHEN tblevpatientstatus.Status = 2 THEN 'HIV-'
        WHEN tblevpatientstatus.Status = 3 THEN 'Death'
        WHEN tblevpatientstatus.Status = 4 THEN 'Lost'
        WHEN tblevpatientstatus.Status = 5 THEN 'Transfer Out'
        ELSE CONCAT('Status: ', tblevpatientstatus.Status)
    END as status_display,
    tblevpatientstatus.transfer_to_site as transfer_to_site,
    CASE WHEN TIMESTAMPDIFF(DAY, tbleimain.DaBirth, tbleimain.DafirstVisit) < 31 THEN CONCAT(CAST(TIMESTAMPDIFF(DAY, tbleimain.DaBirth, tbleimain.DafirstVisit) AS CHAR), ' days') WHEN TIMESTAMPDIFF(DAY, tbleimain.DaBirth, tbleimain.DafirstVisit) < 365 THEN CONCAT(CAST(FLOOR(TIMESTAMPDIFF(DAY, tbleimain.DaBirth, tbleimain.DafirstVisit)/30) AS CHAR), ' mo') ELSE CONCAT(CAST(FLOOR(TIMESTAMPDIFF(DAY, tbleimain.DaBirth, tbleimain.DafirstVisit)/365) AS CHAR), ' yr') END AS age_at_test,
    CASE WHEN TIMESTAMPDIFF(DAY, tbleimain.DaBirth, tblevpatientstatus.DaStatus) < 31 THEN CONCAT(CAST(TIMESTAMPDIFF(DAY, tbleimain.DaBirth, tblevpatientstatus.DaStatus) AS CHAR), ' days') WHEN TIMESTAMPDIFF(DAY, tbleimain.DaBirth, tblevpatientstatus.DaStatus) < 365 THEN CONCAT(CAST(FLOOR(TIMESTAMPDIFF(DAY, tbleimain.DaBirth, tblevpatientstatus.DaStatus)/30) AS CHAR), ' mo') ELSE CONCAT(CAST(FLOOR(TIMESTAMPDIFF(DAY, tbleimain.DaBirth, tblevpatientstatus.DaStatus)/365) AS CHAR), ' yr') END AS age_at_outcome,
    'Infant' as patient_type
FROM tbleimain 
INNER JOIN tblevpatientstatus ON tbleimain.ClinicID = tblevpatientstatus.ClinicID
WHERE 
    tblevpatientstatus.DaStatus BETWEEN @StartDate AND @EndDate
ORDER BY outcome_date DESC, clinicid;

