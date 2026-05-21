-- DQA 04: Adult registered at age 14 or younger
SELECT
    i.ClinicID AS clinicid,
    i.DafirstVisit,
    a.ART,
    a.DaArt,
    i.LClinicID,
    i.DaBirth,
    i.Sex,
    TIMESTAMPDIFF(YEAR, i.DaBirth, i.DafirstVisit) AS age_at_first_visit,
    i.OffIn,
    'Adult age <= 14' AS issue_type
FROM tblaimain i
LEFT JOIN tblaart a ON a.ClinicID = i.ClinicID
WHERE IFNULL(i.LClinicID, '') = ''
  AND i.OffIn <> 1
  AND TIMESTAMPDIFF(YEAR, i.DaBirth, i.DafirstVisit) <= 14
ORDER BY i.ClinicID;
