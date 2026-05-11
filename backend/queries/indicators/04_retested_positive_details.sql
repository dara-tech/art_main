-- Indicator 4: Re-tested positive - Detailed Records
-- This matches the old VB.NET implementation exactly
SELECT
    p.ClinicID as clinicid,
    COALESCE(art.ART, art2.ART) as art_number,
    p.Sex as sex,
    CASE 
        WHEN p.Sex = 0 THEN 'Female'
        WHEN p.Sex = 1 THEN 'Male'
        ELSE 'Unknown'
    END as sex_display,
    CASE 
        WHEN p.type = 'Adult' THEN '15+'
        WHEN p.type = 'Child' THEN '≤14'
        ELSE 'Unknown'
    END as typepatients,
    p.DaBirth as DaBirth,
    p.DafirstVisit as DafirstVisit,
    COALESCE(art.DaArt, art2.DaArt) as DaArt,
    p.DatVisit as DatVisit,
    p.OffIn as OffIn,
    p.type as patient_type,
    TIMESTAMPDIFF(YEAR, p.DaBirth, :EndDate) as age,
    CASE 
        WHEN p.OffIn = 0 THEN 'Not Transferred'
        WHEN p.OffIn = 1 THEN 'Transferred In'
        WHEN p.OffIn = 3 THEN 'Transferred Out'
        ELSE CONCAT('Status: ', p.OffIn)
    END as transfer_status
FROM (
    -- Adult re-tested positive: OffIn <> 1, TypeofReturn = -1, DafirstVisit in quarter
    SELECT 'Adult' as type, ai.ClinicID, ai.Sex, ai.DaBirth, ai.DafirstVisit, ai.OffIn, ai.TypeofReturn, lt.DatVisit, lt.TestHIV, lt.ResultHIV
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
    
    UNION ALL
    
    -- Child re-tested positive: OffIn <> 1, LClinicID = '', DafirstVisit in quarter
    SELECT 'Child' as type, ci.ClinicID, ci.Sex, ci.DaBirth, ci.DafirstVisit, ci.OffIn, ci.LClinicID, lt.DatVisit, lt.TestHIV, lt.ResultHIV
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
LEFT JOIN tblaart art ON p.ClinicID = art.ClinicID AND p.type = 'Adult'
LEFT JOIN tblcart art2 ON p.ClinicID = art2.ClinicID AND p.type = 'Child'
ORDER BY p.DafirstVisit DESC, p.ClinicID;