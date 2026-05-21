-- DQA 01: Duplicate TPT start (patient started TPT more than once on visit records)
-- TPT source: tblavtptdrug / tblcvtptdrug — not tblavoidrug (OI drug).
WITH tpt_drugs AS (
    SELECT DrugName, Status, Da, Vid
    FROM tblavtptdrug
    WHERE DrugName != 'B6' AND Status = 0
    UNION ALL
    SELECT DrugName, Status, Da, Vid
    FROM tblcvtptdrug
    WHERE DrugName != 'B6' AND Status = 0
),
visit_map AS (
    SELECT clinicid, vid FROM tblavmain
    UNION ALL
    SELECT clinicid, vid FROM tblcvmain
),
tpt_starts AS (
    SELECT
        v.clinicid,
        tp.DrugName,
        tp.Status,
        CASE
            WHEN tp.Da IS NULL OR tp.Da = '1900-12-31' OR YEAR(tp.Da) < 2000 OR YEAR(tp.Da) > 2030
            THEN NULL
            ELSE tp.Da
        END AS Da
    FROM tpt_drugs tp
    INNER JOIN visit_map v ON v.vid = tp.Vid
),
tpt_ranked AS (
    SELECT
        clinicid,
        DrugName,
        Status,
        Da,
        ROW_NUMBER() OVER (PARTITION BY clinicid ORDER BY Da) AS rn
    FROM tpt_starts
    WHERE clinicid IS NOT NULL
      AND Da IS NOT NULL
)
SELECT
    r1.clinicid,
    a.ART,
    a.DaArt,
    r1.DrugName,
    r1.Status,
    r1.Da AS Da1,
    r2.Da AS Da2,
    r3.Da AS Da3,
    r4.Da AS Da4,
    p.Status AS exit_status,
    p.Da AS exit_date,
    'Duplicate TPT start' AS issue_type
FROM tpt_ranked r1
LEFT JOIN tpt_ranked r2 ON r2.clinicid = r1.clinicid AND r2.rn = 2
LEFT JOIN tpt_ranked r3 ON r3.clinicid = r1.clinicid AND r3.rn = 3
LEFT JOIN tpt_ranked r4 ON r4.clinicid = r1.clinicid AND r4.rn = 4
LEFT JOIN tblavpatientstatus p ON p.clinicid = r1.clinicid
LEFT JOIN tblaart a ON a.ClinicID = r1.clinicid
WHERE r1.rn = 1
  AND r2.Da IS NOT NULL
ORDER BY r1.clinicid;
