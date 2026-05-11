-- ===================================================================
-- Indicator 12c detail: Percentage of ART patients with VL <1000 copies/mL at 12 months [WHO VLS.1]
-- Returns patient-level records for patients with VL suppressed in past 12 months
-- ===================================================================

WITH tblactive AS (
    WITH tblvisit AS (
        SELECT 
            clinicid,
            DatVisit,
            ARTnum,
            DaApp,
            vid,
            ROW_NUMBER() OVER (PARTITION BY clinicid ORDER BY DatVisit DESC) AS id 
        FROM tblavmain 
        WHERE DatVisit <= :EndDate
        
        UNION ALL 
        
        SELECT 
            clinicid,
            DatVisit,
            ARTnum,
            DaApp,
            vid,
            ROW_NUMBER() OVER (PARTITION BY clinicid ORDER BY DatVisit DESC) AS id 
        FROM tblcvmain 
        WHERE DatVisit <= :EndDate
    ),
    
    tblimain AS (
        SELECT 
            ClinicID,
            DafirstVisit,
            "15+" AS typepatients,
            TypeofReturn,
            LClinicID,
            SiteNameold,
            DaBirth,
            TIMESTAMPDIFF(YEAR, DaBirth, :EndDate) AS age,
            Sex,
            DaHIV,
            OffIn 
        FROM tblaimain 
        WHERE DafirstVisit <= :EndDate
        
        UNION ALL 
        
        SELECT 
            ClinicID,
            DafirstVisit,
            "≤14" AS typepatients,
            '' AS TypeofReturn,
            LClinicID,
            SiteNameold,
            DaBirth,
            TIMESTAMPDIFF(YEAR, DaBirth, :EndDate) AS age,
            Sex,
            DaTest AS DaHIV,
            OffIn 
        FROM tblcimain 
        WHERE DafirstVisit <= :EndDate
    ),
    
    tblart AS (
        SELECT *,
            TIMESTAMPDIFF(MONTH, DaArt, :EndDate) AS nmonthART 
        FROM tblaart 
        WHERE DaArt <= :EndDate
        
        UNION ALL 
        
        SELECT *,
            TIMESTAMPDIFF(MONTH, DaArt, :EndDate) AS nmonthART 
        FROM tblcart 
        WHERE DaArt <= :EndDate
    ),
    
    tblexit AS (
        SELECT * 
        FROM tblavpatientstatus 
        WHERE da <= :EndDate
        
        UNION ALL 
        
        SELECT * 
        FROM tblcvpatientstatus  
        WHERE da <= :EndDate
    ),
    
    tblarvdrug AS ( 
        WITH tbldrug AS (
            SELECT 
                vid,
                GROUP_CONCAT(DISTINCT DrugName ORDER BY DrugName ASC SEPARATOR '+') AS drugname 
            FROM tblavarvdrug 
            WHERE status <> 1
            GROUP BY vid 
            
            UNION ALL 
            
            SELECT 
                vid,
                GROUP_CONCAT(DISTINCT DrugName ORDER BY DrugName ASC SEPARATOR '+') AS drugname 
            FROM tblcvarvdrug 
            WHERE status <> 1
            GROUP BY vid
        )
        SELECT 
            vid,
            drugname,
            IF(LOCATE('3TC+DTG+TDF', drugname) > 0, "TLD", "Not-TLD") AS TLDStatus 
        FROM tbldrug
    ),
    
    tblvltested AS (
        WITH tblvltest AS (
            SELECT 
                ClinicID,
                IF(DaArrival < Dat, Dat, DaArrival) AS DateResult,
                HIVLoad 
            FROM tblpatienttest 
            WHERE HIVLoad != ''
            HAVING DateResult <= :EndDate
        )
        SELECT DISTINCT 
            ClinicID,
            DateResult,
            HIVLoad,
            IF(DateResult > datelast, "Do_VL_in_12M", "Do_VL_greatn_12M") AS VLdostatus,
            IF(HIVLoad < 1000, "VL-Suppression", "Not-Suppression") AS vlresultstatus  
        FROM (
            SELECT 
                ClinicID,
                DateResult,
                HIVLoad,
                DATE_SUB(:EndDate, INTERVAL 1 YEAR) AS datelast,
                ROW_NUMBER() OVER (PARTITION BY clinicid ORDER BY DateResult DESC) AS id 
            FROM tblvltest 
        ) pt 
        WHERE pt.id = 1
    ),
    
    tbltptdrug AS (
        WITH tbltptdrugs AS (
            SELECT DrugName, Status, Da, Vid 
            FROM tblavtptdrug 
            WHERE DrugName != "B6"
            
            UNION ALL 
            
            SELECT DrugName, Status, Da, Vid 
            FROM tblcvtptdrug 
            WHERE DrugName != "B6"
        ),
        tblvisit AS (
            SELECT clinicid, DatVisit, vid 
            FROM tblavmain 
            
            UNION ALL 
            
            SELECT clinicid, DatVisit, vid 
            FROM tblcvmain 
        ),
        tbltptall AS (
            SELECT 
                clinicid,
                DatVisit,
                DrugName, 
                Status, 
                Da 
            FROM tbltptdrugs tp 
            LEFT JOIN tblvisit v ON tp.vid = v.vid
        ),
        tbltptstart AS (
            SELECT * 
            FROM (
                SELECT 
                    *,
                    ROW_NUMBER() OVER (PARTITION BY clinicid ORDER BY DatVisit ASC) AS id 
                FROM tbltptall 
                WHERE status = 0 AND DatVisit <= :EndDate
            ) s 
            WHERE id = 1
        ),
        tbltptstope AS (
            SELECT * 
            FROM (
                SELECT 
                    *,
                    ROW_NUMBER() OVER (PARTITION BY clinicid ORDER BY Da DESC) AS id 
                FROM tbltptall 
                WHERE status = 1 AND Da <= :EndDate
            ) s 
            WHERE id = 1
        )
        SELECT 
            s.clinicid,
            CASE 
                WHEN s.Da IS NULL OR s.Da = '1900-12-31' OR YEAR(s.Da) < 2000 OR YEAR(s.Da) > 2030 
                THEN s.DatVisit 
                ELSE s.Da 
            END AS dateStart,
            s.DrugName AS Tptdrugname,
            st.da AS Datestop,
            DATEDIFF(st.da, CASE 
                WHEN s.Da IS NULL OR s.Da = '1900-12-31' OR YEAR(s.Da) < 2000 OR YEAR(s.Da) > 2030 
                THEN s.DatVisit 
                ELSE s.Da 
            END) / 30 AS duration  
        FROM tbltptstart s
        LEFT JOIN tbltptstope st ON s.clinicid = st.clinicid
    )

    SELECT DISTINCT
        i.clinicid,
        i.DafirstVisit,
        i.typepatients,
        i.TypeofReturn,
        i.LClinicID,
        i.SiteNameold,
        i.DaBirth,
        i.age,
        i.Sex,
        i.DaHIV,
        i.OffIn,
        a.ART,
        a.DaArt,
        v.DatVisit,
        v.ARTnum,
        v.DaApp,
        a.nmonthART,
        IF(a.nmonthART >= 6, ">6M", "<6M") AS Startartstatus,
        DATEDIFF(v.DaApp, v.DatVisit) AS ndays,
        IF(DATEDIFF(v.DaApp, v.DatVisit) > 80, "MMD", "Not-MMD") AS MMDStatus,
        rd.drugname,
        IF(LEFT(i.clinicid, 1) = "P" AND rd.TLDStatus != "TLD" AND LOCATE('DTG', drugname) > 0, "TLD", rd.TLDStatus) AS TLDStatus,
        vl.DateResult,
        vl.HIVLoad,
        vl.VLdostatus,
        vl.vlresultstatus,
        tp.Tptdrugname,
        tp.dateStart,
        tp.Datestop,
        tp.duration,
        IF(LEFT(tp.Tptdrugname, 1) = 3 AND tp.duration >= 2.50, "TPT Complete",
           IF(LEFT(tp.Tptdrugname, 1) = 6 AND tp.duration >= 5.50, "TPT Complete",
              IF(tp.Tptdrugname IS NULL, "Not Start", "Not complete"))) AS tptstatus 
    FROM tblvisit v
    LEFT JOIN tblimain i ON i.clinicid = v.clinicid
    LEFT JOIN tblart a ON a.clinicid = v.clinicid
    LEFT JOIN tblexit e ON v.clinicid = e.clinicid
    LEFT JOIN tblarvdrug rd ON rd.vid = v.vid
    LEFT JOIN tblvltested vl ON vl.clinicid = v.clinicid
    LEFT JOIN tbltptdrug tp ON tp.clinicid = v.clinicid
    WHERE id = 1 AND e.status IS NULL
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
    ta.ART AS art_number,
    main.Sex AS sex,
    CASE WHEN main.Sex = 0 THEN 'Female' ELSE 'Male' END AS sex_display,
    CASE WHEN ta.typepatients = '≤14' THEN 'Child' ELSE 'Adult' END AS patient_type,
    ta.age AS age,
    main.DafirstVisit AS DafirstVisit,
    ta.DaArt AS art_start_date,
    ta.DaArt AS DaArt,
    ta.nmonthART AS months_on_art,
    ta.DatVisit AS visit_date,
    ta.DateResult AS last_vl_date,
    ta.DateResult AS LastVLDate,
    ta.DateResult AS DateResult,
    ta.HIVLoad AS last_vl_load,
    ta.HIVLoad AS LastVLLoad,
    ta.HIVLoad AS HIVLoad,
    ta.vlresultstatus AS vl_status,
    ta.vlresultstatus AS StatusVL,
    ta.vlresultstatus AS vlresultstatus,
    ta.VLdostatus AS vl_do_status,
    ta.VLdostatus AS VLdostatus,
    CASE 
        WHEN apc.clinicid IS NOT NULL THEN 'Active'
        WHEN pes.status = :dead_code THEN 'Dead'
        WHEN pes.status = :transfer_out_code THEN 'Transfer Out'
        WHEN pes.status = :lost_code THEN 'Lost to Follow-up'
        ELSE 'Unknown'
    END AS Status,
    pes.exit_date AS exit_date
FROM tblactive ta
JOIN tblaimain main ON CONVERT(main.ClinicID, CHAR) = CONVERT(ta.clinicid, CHAR)
LEFT JOIN active_patients_check apc ON CONVERT(ta.clinicid, CHAR) = CONVERT(apc.clinicid, CHAR)
LEFT JOIN patient_exit_status pes ON CONVERT(ta.clinicid, CHAR) = CONVERT(pes.clinicid, CHAR)
WHERE ta.typepatients = '15+'
  AND ta.ART IS NOT NULL
  AND ta.Startartstatus = '>6M'
  AND ta.VLdostatus = 'Do_VL_in_12M'
  AND ta.DateResult IS NOT NULL

UNION ALL

SELECT
    main.ClinicID AS clinicid,
    ta.ART AS art_number,
    main.Sex AS sex,
    CASE WHEN main.Sex = 0 THEN 'Female' ELSE 'Male' END AS sex_display,
    CASE WHEN ta.typepatients = '≤14' THEN 'Child' ELSE 'Adult' END AS patient_type,
    ta.age AS age,
    main.DafirstVisit AS DafirstVisit,
    ta.DaArt AS art_start_date,
    ta.DaArt AS DaArt,
    ta.nmonthART AS months_on_art,
    ta.DatVisit AS visit_date,
    ta.DateResult AS last_vl_date,
    ta.DateResult AS LastVLDate,
    ta.DateResult AS DateResult,
    ta.HIVLoad AS last_vl_load,
    ta.HIVLoad AS LastVLLoad,
    ta.HIVLoad AS HIVLoad,
    ta.vlresultstatus AS vl_status,
    ta.vlresultstatus AS StatusVL,
    ta.vlresultstatus AS vlresultstatus,
    ta.VLdostatus AS vl_do_status,
    ta.VLdostatus AS VLdostatus,
    CASE 
        WHEN apc.clinicid IS NOT NULL THEN 'Active'
        WHEN pes.status = :dead_code THEN 'Dead'
        WHEN pes.status = :transfer_out_code THEN 'Transfer Out'
        WHEN pes.status = :lost_code THEN 'Lost to Follow-up'
        ELSE 'Unknown'
    END AS Status,
    pes.exit_date AS exit_date
FROM tblactive ta
JOIN tblcimain main ON CONVERT(main.ClinicID, CHAR) = CONVERT(ta.clinicid, CHAR)
LEFT JOIN active_patients_check apc ON CONVERT(ta.clinicid, CHAR) = CONVERT(apc.clinicid, CHAR)
LEFT JOIN patient_exit_status pes ON CONVERT(ta.clinicid, CHAR) = CONVERT(pes.clinicid, CHAR)
WHERE ta.typepatients = '≤14'
  AND ta.ART IS NOT NULL
  AND ta.Startartstatus = '>6M'
  AND ta.VLdostatus = 'Do_VL_in_12M'
  AND ta.DateResult IS NOT NULL

ORDER BY Status DESC, vlresultstatus DESC, last_vl_date DESC, clinicid;

