-- =====================================================
-- PNTT_OLD_RISK_DETAILS - Old Patient - Risk Factors DETAIL
-- =====================================================
-- Disaggregated records for: PNTT Risk old register
-- Logic matches `PNTT_OLD_RISK_aggregate.sql`
-- =====================================================

SET @StartDate = '2025-04-01';
SET @EndDate   = '2025-06-30';

SELECT
    'PNTT_OLD_RISK' AS indicator_code,
    ai.ClinicID AS clinicid,
    ai.Sex AS sex,
    CASE
        WHEN ai.Sex = 0 THEN 'Female'
        WHEN ai.Sex = 1 THEN 'Male'
        ELSE 'Unknown'
    END AS sex_display,
    ai.DaBirth AS date_of_birth,
    ai.DafirstVisit AS first_visit_date,
    TIMESTAMPDIFF(YEAR, ai.DaBirth, @EndDate) AS age,
    ai.TypeofReturn,
    ai.OffIn,
    pntt.AsID AS pntt_asid,
    pntt.DaVisit AS pntt_visit_date,
    pntt.SexHIV,
    pntt.Wsex,
    pntt.SexM,
    pntt.SexTran,
    pntt.Sex4,
    pntt.Drug,
    pntt.Pill,
    pntt.SexMoney,
    pntt.SexProvice,
    pntt.WOut
FROM (
    SELECT ClinicID, Sex, TypeofReturn, OffIn
    FROM tblaimain
    WHERE DafirstVisit BETWEEN @StartDate AND @EndDate
) adultactive
RIGHT OUTER JOIN tblapntt pntt
    ON adultactive.ClinicID = pntt.ClinicID
LEFT OUTER JOIN tblaimain ai
    ON ai.ClinicID = pntt.ClinicID
WHERE pntt.DaVisit BETWEEN @StartDate AND @EndDate
  AND (adultactive.ClinicID IS NULL
       OR adultactive.OffIn = 1
       OR adultactive.TypeofReturn <> -1)
ORDER BY pntt_visit_date, clinicid;


