-- Indicator 3: Newly Enrolled - Detailed Records
SELECT
    p.site_code as site_code,
    p.ClinicID as clinicid,
    art.ART as art_number,
    p.Sex as sex,
    CASE 
        WHEN p.Sex = 0 THEN 'Female'
        WHEN p.Sex = 1 THEN 'Male'
        ELSE 'Unknown'
    END as sex_display,
    '15+' as typepatients,
    p.DaBirth as DaBirth,
    p.DafirstVisit as DafirstVisit,
    art.DaArt as DaArt,
    NULL as DatVisit,
    p.OffIn as OffIn,
    'Adult' as patient_type,
    TIMESTAMPDIFF(YEAR, p.DaBirth, :EndDate) as age,
    CASE 
        WHEN p.OffIn IS NULL OR p.OffIn = 0 OR p.OffIn = -1 THEN 'Not Transferred'
        WHEN p.OffIn = 2 THEN 'Transferred In'
        WHEN p.OffIn = 3 THEN 'Transferred Out'
        ELSE CONCAT('Status: ', p.OffIn)
    END as transfer_status,
    COALESCE(
        CASE 
            WHEN s.Status = 1 THEN 'Active'
            WHEN s.Status = 2 THEN 'Dead'
            WHEN s.Status = 3 THEN 'Lost'
            WHEN s.Status = 4 THEN 'Transferred Out'
        END,
        'Active'
    ) as patient_status
FROM tblaimain p 
LEFT OUTER JOIN tblaart art ON p.ClinicID = art.ClinicID AND p.site_code = art.site_code
LEFT OUTER JOIN (
    SELECT site_code, ClinicID, Status, ROW_NUMBER() OVER (PARTITION BY site_code, ClinicID ORDER BY Da DESC) as rn
    FROM tblavpatientstatus
    WHERE Da <= :EndDate
) s ON p.ClinicID = s.ClinicID AND p.site_code = s.site_code AND s.rn = 1
WHERE 
    p.DafirstVisit BETWEEN :StartDate AND :EndDate 
    AND (p.OffIn IS NULL OR p.OffIn <> :transfer_in_code)
    AND (p.TypeofReturn IS NULL OR p.TypeofReturn = -1)
    AND (p.Refugstatus IS NULL OR p.Refugstatus = -1)
    AND (p.SiteNameold IS NULL OR p.SiteNameold = '')

UNION ALL

SELECT
    p.site_code as site_code,
    p.ClinicID as clinicid,
    art.ART as art_number,
    p.Sex as sex,
    CASE 
        WHEN p.Sex = 0 THEN 'Female'
        WHEN p.Sex = 1 THEN 'Male'
        ELSE 'Unknown'
    END as sex_display,
    '≤14' as typepatients,
    p.DaBirth as DaBirth,
    p.DaFirstVisit as DafirstVisit,
    art.DaArt as DaArt,
    NULL as DatVisit,
    p.OffIn as OffIn,
    'Child' as patient_type,
    TIMESTAMPDIFF(YEAR, p.DaBirth, :EndDate) as age,
    CASE 
        WHEN p.OffIn IS NULL OR p.OffIn = 0 OR p.OffIn = -1 THEN 'Not Transferred'
        WHEN p.OffIn = 2 THEN 'Transferred In'
        WHEN p.OffIn = 3 THEN 'Transferred Out'
        ELSE CONCAT('Status: ', p.OffIn)
    END as transfer_status,
    COALESCE(
        CASE 
            WHEN s.Status = 1 THEN 'Active'
            WHEN s.Status = 2 THEN 'Dead'
            WHEN s.Status = 3 THEN 'Lost'
            WHEN s.Status = 4 THEN 'Transferred Out'
        END,
        'Active'
    ) as patient_status
FROM tblcimain p 
LEFT OUTER JOIN tblcart art ON p.ClinicID = art.ClinicID AND p.site_code = art.site_code
LEFT OUTER JOIN (
    SELECT site_code, ClinicID, Status, ROW_NUMBER() OVER (PARTITION BY site_code, ClinicID ORDER BY Da DESC) as rn
    FROM tblcvpatientstatus
    WHERE Da <= :EndDate
) s ON p.ClinicID = s.ClinicID AND p.site_code = s.site_code AND s.rn = 1
WHERE 
    p.DaFirstVisit BETWEEN :StartDate AND :EndDate 
    AND (p.OffIn IS NULL OR p.OffIn <> :transfer_in_code)
    AND (p.LClinicID IS NULL OR p.LClinicID = '')
    AND (p.SiteNameold IS NULL OR p.SiteNameold = '')
ORDER BY DafirstVisit DESC, clinicid;