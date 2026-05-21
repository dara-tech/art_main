-- DQA 23: Child registered but ART record only on adult table
SELECT
    c.ClinicID AS clinicid,
    a.ART,
    a.DaArt,
    'Child' AS patient_type,
    'Child ART on adult table only' AS issue_type
FROM tblcimain c
INNER JOIN tblaart a ON a.ClinicID = c.ClinicID
LEFT JOIN tblcart ch ON ch.ClinicID = c.ClinicID
WHERE ch.ClinicID IS NULL
ORDER BY c.ClinicID;
