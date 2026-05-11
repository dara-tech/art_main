-- Indicator 4: Re-tested positive
-- This matches the old VB.NET implementation exactly
SELECT
    '4. Re-tested positive' AS Indicator,
    IFNULL(COUNT(*), 0) AS TOTAL,
    IFNULL(SUM(CASE WHEN PatientList.type = 'Child' AND PatientList.Sex = 'Male' THEN 1 ELSE 0 END), 0) AS Male_0_14,
    IFNULL(SUM(CASE WHEN PatientList.type = 'Child' AND PatientList.Sex = 'Female' THEN 1 ELSE 0 END), 0) AS Female_0_14,
    IFNULL(SUM(CASE WHEN PatientList.type = 'Adult' AND PatientList.Sex = 'Male' THEN 1 ELSE 0 END), 0) AS Male_over_14,
    IFNULL(SUM(CASE WHEN PatientList.type = 'Adult' AND PatientList.Sex = 'Female' THEN 1 ELSE 0 END), 0) AS Female_over_14
FROM (
    -- Adult re-tested positive: OffIn <> 1, TypeofReturn = -1, DafirstVisit in quarter
    SELECT 'Adult' as type, IF(p.Sex=0, 'Female', 'Male') as Sex
    FROM (
        SELECT ai.ClinicID, ai.sex, ai.DafirstVisit, lt.DatVisit, lt.TestHIV, lt.ResultHIV
        FROM (
            SELECT v.ClinicID, v.ARTnum, v.DatVisit, v.TestHIV, v.ResultHIV, v.DaApp, v.Vid
            FROM (
                SELECT ClinicID, ARTnum, DatVisit, TestHIV, ResultHIV, DaApp, Vid
                FROM tblavmain
                WHERE DatVisit BETWEEN :StartDate AND :EndDate
            ) v
            INNER JOIN (
                SELECT vv.ClinicID, MAX(vv.DatVisit) as DatVisit, vv.TestHIV, vv.ResultHIV
                FROM (
                    SELECT ClinicID, ARTnum, DatVisit, TestHIV, ResultHIV, DaApp, Vid
                    FROM tblavmain
                    WHERE DatVisit BETWEEN :StartDate AND :EndDate AND TestHIV = 'True'
                ) vv
                GROUP BY vv.ClinicID
            ) mv ON mv.ClinicID = v.ClinicID AND mv.DatVisit = v.DatVisit
        ) lt
        LEFT JOIN tblaimain ai ON ai.ClinicID = lt.ClinicID
        WHERE ai.OffIn <> 1 AND ai.TypeofReturn = -1 AND ai.DafirstVisit BETWEEN :StartDate AND :EndDate
    ) p
    
    UNION ALL
    
    -- Child re-tested positive: OffIn <> 1, LClinicID = '', DafirstVisit in quarter
    SELECT 'Child' as type, IF(p.Sex=0, 'Female', 'Male') as Sex
    FROM (
        SELECT ci.ClinicID, ci.sex, ci.DafirstVisit, lt.DatVisit, lt.TestHIV, lt.ResultHIV
        FROM (
            SELECT c.ClinicID, c.ARTnum, c.DatVisit, c.TestHIV, c.ResultHIV, c.DaApp, c.Vid
            FROM (
                SELECT ClinicID, ARTnum, DatVisit, TestHIV, ResultHIV, DaApp, Vid
                FROM tblcvmain
                WHERE DatVisit BETWEEN :StartDate AND :EndDate
            ) c
            INNER JOIN (
                SELECT cc.ClinicID, MAX(cc.DatVisit) as DatVisit, cc.TestHIV, cc.ResultHIV
                FROM (
                    SELECT ClinicID, ARTnum, DatVisit, TestHIV, ResultHIV, DaApp, Vid
                    FROM tblcvmain
                    WHERE DatVisit BETWEEN :StartDate AND :EndDate AND TestHIV = 'True'
                ) cc
                GROUP BY cc.ClinicID
            ) mcv ON mcv.ClinicID = c.ClinicID AND mcv.DatVisit = c.DatVisit
        ) lt
        LEFT JOIN tblcimain ci ON ci.ClinicID = lt.ClinicID
        WHERE ci.OffIn <> 1 AND ci.LClinicID = '' AND ci.DafirstVisit BETWEEN :StartDate AND :EndDate
    ) p
) as PatientList;
