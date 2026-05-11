-- ===================================================================
-- Indicator 12e detail: Percentage of VL test results received within 10 days of sample taken
-- Returns patient-level records for VL tests with turnaround time information
-- ===================================================================

WITH tblvl_turnaround AS (
    -- Adults with VL test turnaround time
    SELECT 
        'Adult' as type,
        IF(p.Sex=0, "Female", "Male") as Sex,
        p.ClinicID,
        p.DaBirth,
        art.ART AS art_number,
        pt.HIVLoad as ViralLoad,
        pt.Dat as TestDate,
        IF(pt.DaCollect IS NOT NULL AND pt.DaCollect <> '0000-00-00', pt.DaCollect, pt.Dat) as SampleDate,
        pt.DaArrival as ResultReceiveDate,
        DATEDIFF(pt.DaArrival, IF(pt.DaCollect IS NOT NULL AND pt.DaCollect <> '0000-00-00', pt.DaCollect, pt.Dat)) as TurnaroundDays,
        CASE 
            WHEN pt.DaArrival IS NOT NULL
                AND pt.DaArrival <> '0000-00-00'
                AND IF(pt.DaCollect IS NOT NULL AND pt.DaCollect <> '0000-00-00', pt.DaCollect, pt.Dat) IS NOT NULL
                AND IF(pt.DaCollect IS NOT NULL AND pt.DaCollect <> '0000-00-00', pt.DaCollect, pt.Dat) <> '0000-00-00'
                AND DATEDIFF(pt.DaArrival, IF(pt.DaCollect IS NOT NULL AND pt.DaCollect <> '0000-00-00', pt.DaCollect, pt.Dat)) <= 10 THEN 'Within_10_Days'
            WHEN pt.DaArrival IS NOT NULL
                AND pt.DaArrival <> '0000-00-00'
                AND IF(pt.DaCollect IS NOT NULL AND pt.DaCollect <> '0000-00-00', pt.DaCollect, pt.Dat) IS NOT NULL
                AND IF(pt.DaCollect IS NOT NULL AND pt.DaCollect <> '0000-00-00', pt.DaCollect, pt.Dat) <> '0000-00-00'
                AND DATEDIFF(pt.DaArrival, IF(pt.DaCollect IS NOT NULL AND pt.DaCollect <> '0000-00-00', pt.DaCollect, pt.Dat)) > 10 THEN 'Over_10_Days'
            ELSE 'No_Result_Yet'
        END as TurnaroundStatus
    FROM tblaimain p 
    INNER JOIN tblpatienttest pt ON CONVERT(p.ClinicID, CHAR) = CONVERT(pt.ClinicID, CHAR)
    LEFT JOIN tblaart art ON p.ClinicID = art.ClinicID
    WHERE 
        pt.Dat BETWEEN :StartDate AND :EndDate
    
    UNION ALL
    
    -- Children with VL test turnaround time
    SELECT 
        'Child' as type,
        IF(p.Sex=0, "Female", "Male") as Sex,
        p.ClinicID,
        p.DaBirth,
        art.ART AS art_number,
        pt.HIVLoad as ViralLoad,
        pt.Dat as TestDate,
        IF(pt.DaCollect IS NOT NULL AND pt.DaCollect <> '0000-00-00', pt.DaCollect, pt.Dat) as SampleDate,
        pt.DaArrival as ResultReceiveDate,
        DATEDIFF(pt.DaArrival, IF(pt.DaCollect IS NOT NULL AND pt.DaCollect <> '0000-00-00', pt.DaCollect, pt.Dat)) as TurnaroundDays,
        CASE 
            WHEN pt.DaArrival IS NOT NULL
                AND pt.DaArrival <> '0000-00-00'
                AND IF(pt.DaCollect IS NOT NULL AND pt.DaCollect <> '0000-00-00', pt.DaCollect, pt.Dat) IS NOT NULL
                AND IF(pt.DaCollect IS NOT NULL AND pt.DaCollect <> '0000-00-00', pt.DaCollect, pt.Dat) <> '0000-00-00'
                AND DATEDIFF(pt.DaArrival, IF(pt.DaCollect IS NOT NULL AND pt.DaCollect <> '0000-00-00', pt.DaCollect, pt.Dat)) <= 10 THEN 'Within_10_Days'
            WHEN pt.DaArrival IS NOT NULL
                AND pt.DaArrival <> '0000-00-00'
                AND IF(pt.DaCollect IS NOT NULL AND pt.DaCollect <> '0000-00-00', pt.DaCollect, pt.Dat) IS NOT NULL
                AND IF(pt.DaCollect IS NOT NULL AND pt.DaCollect <> '0000-00-00', pt.DaCollect, pt.Dat) <> '0000-00-00'
                AND DATEDIFF(pt.DaArrival, IF(pt.DaCollect IS NOT NULL AND pt.DaCollect <> '0000-00-00', pt.DaCollect, pt.Dat)) > 10 THEN 'Over_10_Days'
            ELSE 'No_Result_Yet'
        END as TurnaroundStatus
    FROM tblcimain p 
    INNER JOIN tblpatienttest pt ON p.ClinicID = pt.ClinicID
    LEFT JOIN tblcart art ON p.ClinicID = art.ClinicID
    WHERE 
        pt.Dat BETWEEN :StartDate AND :EndDate
),

active_patients_check AS (
    -- Check which patients are still active at EndDate
    SELECT DISTINCT
        v.clinicid
    FROM (
        SELECT 
            clinicid,
            DatVisit,
            ROW_NUMBER() OVER (PARTITION BY clinicid ORDER BY DatVisit DESC) AS id 
        FROM tblavmain 
        WHERE DatVisit <= :EndDate
        
        UNION ALL 
        
        SELECT 
            clinicid,
            DatVisit,
            ROW_NUMBER() OVER (PARTITION BY clinicid ORDER BY DatVisit DESC) AS id 
        FROM tblcvmain 
        WHERE DatVisit <= :EndDate
    ) v
    LEFT JOIN (
        SELECT DISTINCT clinicid FROM tblaart WHERE DaArt <= :EndDate
        UNION
        SELECT DISTINCT clinicid FROM tblcart WHERE DaArt <= :EndDate
    ) a ON a.clinicid = v.clinicid
    LEFT JOIN (
        SELECT clinicid, status FROM tblavpatientstatus WHERE da <= :EndDate
        UNION ALL
        SELECT clinicid, status FROM tblcvpatientstatus WHERE da <= :EndDate
    ) e ON v.clinicid = e.clinicid
    WHERE v.id = 1 AND e.status IS NULL AND a.clinicid IS NOT NULL
),

patient_exit_status AS (
    -- Get latest exit status for each patient
    SELECT 
        clinicid,
        status,
        MAX(da) as exit_date
    FROM (
        SELECT clinicid, status, da
        FROM tblavpatientstatus 
        WHERE da <= :EndDate
        
        UNION ALL
        
        SELECT clinicid, status, da
        FROM tblcvpatientstatus 
        WHERE da <= :EndDate
    ) ps
    GROUP BY clinicid, status
)

SELECT
    main.ClinicID AS clinicid,
    vt.art_number AS art_number,
    main.Sex AS sex,
    CASE WHEN main.Sex = 0 THEN 'Female' ELSE 'Male' END AS sex_display,
    'Adult' AS patient_type,
    TIMESTAMPDIFF(YEAR, main.DaBirth, :EndDate) AS age,
    main.DafirstVisit AS DafirstVisit,
    vt.TestDate AS test_date,
    vt.TestDate AS TestDate,
    vt.SampleDate AS sample_date,
    vt.SampleDate AS SampleDate,
    vt.ResultReceiveDate AS result_receive_date,
    vt.ResultReceiveDate AS ResultReceiveDate,
    vt.ViralLoad AS viral_load,
    vt.ViralLoad AS ViralLoad,
    vt.ViralLoad AS HIVLoad,
    vt.TurnaroundDays AS turnaround_days,
    vt.TurnaroundDays AS TurnaroundDays,
    vt.TurnaroundStatus AS turnaround_status,
    vt.TurnaroundStatus AS TurnaroundStatus,
    CASE 
        WHEN apc.clinicid IS NOT NULL THEN 'Active'
        WHEN pes.status = :dead_code THEN 'Dead'
        WHEN pes.status = :transfer_out_code THEN 'Transfer Out'
        WHEN pes.status = :lost_code THEN 'Lost to Follow-up'
        ELSE 'Unknown'
    END AS Status,
    pes.exit_date AS exit_date
FROM tblvl_turnaround vt
JOIN tblaimain main ON CONVERT(main.ClinicID, CHAR) = CONVERT(vt.ClinicID, CHAR)
LEFT JOIN active_patients_check apc ON CONVERT(vt.ClinicID, CHAR) = CONVERT(apc.clinicid, CHAR)
LEFT JOIN patient_exit_status pes ON CONVERT(vt.ClinicID, CHAR) = CONVERT(pes.clinicid, CHAR)
WHERE vt.type = 'Adult'

UNION ALL

SELECT
    main.ClinicID AS clinicid,
    vt.art_number AS art_number,
    main.Sex AS sex,
    CASE WHEN main.Sex = 0 THEN 'Female' ELSE 'Male' END AS sex_display,
    'Child' AS patient_type,
    TIMESTAMPDIFF(YEAR, main.DaBirth, :EndDate) AS age,
    main.DafirstVisit AS DafirstVisit,
    vt.TestDate AS test_date,
    vt.TestDate AS TestDate,
    vt.SampleDate AS sample_date,
    vt.SampleDate AS SampleDate,
    vt.ResultReceiveDate AS result_receive_date,
    vt.ResultReceiveDate AS ResultReceiveDate,
    vt.ViralLoad AS viral_load,
    vt.ViralLoad AS ViralLoad,
    vt.ViralLoad AS HIVLoad,
    vt.TurnaroundDays AS turnaround_days,
    vt.TurnaroundDays AS TurnaroundDays,
    vt.TurnaroundStatus AS turnaround_status,
    vt.TurnaroundStatus AS TurnaroundStatus,
    CASE 
        WHEN apc.clinicid IS NOT NULL THEN 'Active'
        WHEN pes.status = :dead_code THEN 'Dead'
        WHEN pes.status = :transfer_out_code THEN 'Transfer Out'
        WHEN pes.status = :lost_code THEN 'Lost to Follow-up'
        ELSE 'Unknown'
    END AS Status,
    pes.exit_date AS exit_date
FROM tblvl_turnaround vt
JOIN tblcimain main ON CONVERT(main.ClinicID, CHAR) = CONVERT(vt.ClinicID, CHAR)
LEFT JOIN active_patients_check apc ON CONVERT(vt.ClinicID, CHAR) = CONVERT(apc.clinicid, CHAR)
LEFT JOIN patient_exit_status pes ON CONVERT(vt.ClinicID, CHAR) = CONVERT(pes.clinicid, CHAR)
WHERE vt.type = 'Child'

ORDER BY Status DESC, test_date DESC, clinicid;

