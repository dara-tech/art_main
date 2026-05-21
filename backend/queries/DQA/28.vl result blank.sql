-- DQA 28: VL test row exists but HIV load result is blank
SELECT
    ClinicID AS clinicid,
    Dat,
    DaCollect,
    HIVLoad,
    'VL result blank' AS issue_type
FROM tblpatienttest
WHERE (HIVLoad IS NULL OR TRIM(HIVLoad) = '')
  AND (Dat IS NOT NULL OR (DaCollect IS NOT NULL AND DaCollect <> '1900-12-31'))
ORDER BY ClinicID, Dat;
