-- =====================================================
-- INFANT_COTRIM_aggregate - Cotrimoxazole Prophylaxis AGGREGATE
-- =====================================================
-- Derived from corresponding detail script
-- =====================================================
-- PARAMETER SETUP
-- =====================================================
SET @StartDate = '2025-01-01';
SET @EndDate = '2025-03-31';

-- =====================================================
-- MAIN QUERY
-- =====================================================
SELECT
  tbleimain.ClinicID,
  tbleimain.DaBirth,
  tbleimain.Sex,
  tblevmain.DatVisit,
  tblevarvdrug.Status,
  tblevarvdrug.Da,
  tbleimain.DafirstVisit
FROM tblevmain
INNER JOIN tbleimain ON tblevmain.ClinicID = tbleimain.ClinicID
RIGHT OUTER JOIN tblevarvdrug ON tblevmain.Vid = tblevarvdrug.Vid
WHERE (tblevarvdrug.Status = 0 
  AND tblevarvdrug.DrugName = 'Cotrimoxazole') 
  AND (tblevarvdrug.Da BETWEEN @StartDate AND @EndDate)
GROUP BY tbleimain.clinicid
ORDER BY tblevarvdrug.Da, tbleimain.Sex;
