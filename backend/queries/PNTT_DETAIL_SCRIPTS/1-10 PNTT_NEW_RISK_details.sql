-- =====================================================
-- PNTT_NEW_RISK_DETAILS - New Patient - Risk Factors DETAIL
-- =====================================================
-- Disaggregated records for: PNTT Risk new register
-- Logic matches `PNTT_NEW_RISK_aggregate.sql`
-- =====================================================

-- =====================================================
-- PARAMETER SETUP
-- Set these parameters before running this query
-- =====================================================

-- Date parameters (Quarterly period)
SET @StartDate = '2025-04-01';             -- Start date (YYYY-MM-DD)
SET @EndDate   = '2025-06-30';             -- End date (YYYY-MM-DD)

-- =====================================================
-- MAIN QUERY
-- =====================================================
-- Aggregate logic uses the latest PNTT visit per ClinicID in the period:
-- FROM (
--   SELECT ClinicID, Sex, TypeofReturn, OffIn
--   FROM tblaimain
--   WHERE DafirstVisit BETWEEN @StartDate AND @EndDate
-- ) adultactive
-- LEFT OUTER JOIN (
--   SELECT p.ClinicID, p.DaVisit, SexHIV, Wsex, SexM, SexTran, Sex4, Drug, Pill,
--          SexMoney, SexProvice, WOut, Agree, AsID
--   FROM tblapntt p
--   INNER JOIN (
--     SELECT ClinicID, MAX(DaVisit) AS DaVisit
--     FROM tblapntt
--     WHERE DaVisit BETWEEN @StartDate AND @EndDate
--     GROUP BY ClinicID
--   ) mp
--   ON mp.ClinicID = p.ClinicID AND p.DaVisit = mp.DaVisit
-- ) tblapntt
--   ON adultactive.ClinicID = tblapntt.ClinicID
-- WHERE (adultactive.TypeofReturn=-1 AND adultactive.offin<>1);
--
-- This detail query returns one row per qualifying patient with their risk factors.

SELECT
    'PNTT_NEW_RISK' AS indicator_code,
    adultactive.ClinicID AS clinicid,
    adultactive.Sex AS sex,
    CASE
        WHEN adultactive.Sex = 0 THEN 'Female'
        WHEN adultactive.Sex = 1 THEN 'Male'
        ELSE 'Unknown'
    END AS sex_display,
    adultactive.DaBirth AS date_of_birth,
    adultactive.DafirstVisit AS first_visit_date,
    TIMESTAMPDIFF(YEAR, adultactive.DaBirth, @EndDate) AS age,
    adultactive.TypeofReturn,
    adultactive.OffIn,
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
    SELECT ClinicID,
           Sex,
           TypeofReturn,
           OffIn,
           DaBirth,
           DafirstVisit
    FROM tblaimain
    WHERE DafirstVisit BETWEEN @StartDate AND @EndDate
) adultactive
LEFT OUTER JOIN (
    SELECT
        p.ClinicID,
        p.DaVisit,
        p.SexHIV,
        p.Wsex,
        p.SexM,
        p.SexTran,
        p.Sex4,
        p.Drug,
        p.Pill,
        p.SexMoney,
        p.SexProvice,
        p.WOut,
        p.Agree,
        p.AsID
    FROM tblapntt p
    INNER JOIN (
        SELECT
            ClinicID,
            MAX(DaVisit) AS DaVisit
        FROM tblapntt
        WHERE DaVisit BETWEEN @StartDate AND @EndDate
        GROUP BY ClinicID
    ) mp
        ON mp.ClinicID = p.ClinicID
       AND p.DaVisit = mp.DaVisit
) pntt
    ON adultactive.ClinicID = pntt.ClinicID
WHERE adultactive.TypeofReturn = -1
  AND adultactive.OffIn <> 1
ORDER BY pntt_visit_date, clinicid;


