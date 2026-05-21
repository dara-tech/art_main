-- DQA 02: Invalid viral load result (bad characters or format)
SELECT
    TestID,
    ClinicID,
    Dat,
    DaCollect,
    CD4,
    CD,
    CD8,
    HIVLoad,
    HIVLog,
    HCV,
    HCVlog,
    CASE
        WHEN HIVLoad LIKE '%,%' THEN 'Contains comma'
        WHEN HIVLoad LIKE '%.%' THEN 'Contains decimal point'
        WHEN HIVLoad LIKE '% %' THEN 'Contains space'
        WHEN HIVLoad LIKE '%@%' THEN 'Contains @'
        WHEN HIVLoad LIKE '%<%' THEN 'Contains <'
        ELSE 'Invalid format'
    END AS issue_type
FROM tblpatienttest
WHERE HIVLoad LIKE '%,%'
   OR HIVLoad LIKE '%.%'
   OR HIVLoad LIKE '% %'
   OR HIVLoad LIKE '%@%'
   OR HIVLoad LIKE '%<%'
ORDER BY ClinicID, Dat;
