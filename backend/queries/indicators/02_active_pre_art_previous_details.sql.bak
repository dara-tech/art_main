-- Indicator 2: Active Pre-ART patients in previous quarter - Detailed Records
-- Based on script 9 logic but for previous quarter
with tblactive as (
    with tblvisit as (
        select clinicid, DatVisit, ARTnum, DaApp, vid, 
               ROW_NUMBER() OVER (PARTITION BY clinicid ORDER BY DatVisit DESC) as id 
        from tblavmain 
        where DatVisit <= :PreviousEndDate
        union all 
        select clinicid, DatVisit, ARTnum, DaApp, vid, 
               ROW_NUMBER() OVER (PARTITION BY clinicid ORDER BY DatVisit DESC) as id 
        from tblcvmain 
        where DatVisit <= :PreviousEndDate
    ),
    
    tblimain as (
        select ClinicID, DafirstVisit, "15+" as typepatients, TypeofReturn, LClinicID, 
               SiteNameold, DaBirth, timestampdiff(year, DaBirth, :PreviousEndDate) as age, 
               Sex, DaHIV, OffIn 
        from tblaimain 
        where DafirstVisit <= :PreviousEndDate
        union all 
        select ClinicID, DafirstVisit, "≤14" as typepatients, '' as TypeofReturn, 
               LClinicID, SiteNameold, DaBirth, timestampdiff(year, DaBirth, :PreviousEndDate) as age, 
               Sex, DaTest as DaHIV, OffIn 
        from tblcimain 
        where DafirstVisit <= :PreviousEndDate
    ),
    
    tblart as (
        select *, timestampdiff(month, DaArt, :PreviousEndDate) as nmonthART 
        from tblaart 
        where DaArt <= :PreviousEndDate 
        union all 
        select *, timestampdiff(month, DaArt, :PreviousEndDate) as nmonthART 
        from tblcart 
        where DaArt <= :PreviousEndDate
    ),
    
    tblexit as (
        select * 
        from tblavpatientstatus 
        where da <= :PreviousEndDate  
        union all 
        select * 
        from tblcvpatientstatus  
        where da <= :PreviousEndDate
    )
    
    select i.clinicid, i.DafirstVisit, i.typepatients, i.TypeofReturn, i.LClinicID, 
           i.SiteNameold, i.DaBirth, i.age, i.Sex, i.DaHIV, i.OffIn, 
           a.ART, a.DaArt, v.DatVisit, v.ARTnum, v.DaApp, a.nmonthART
    from tblvisit v
    left join tblimain i on i.clinicid = v.clinicid
    left join tblart a on a.clinicid = v.clinicid
    left join tblexit e on v.clinicid = e.clinicid
    where id = 1 and e.status is null
)

select 
    clinicid,
    sex,
    case 
        when sex = 0 then 'Female'
        when sex = 1 then 'Male'
        else 'Unknown'
    end as sex_display,
    typepatients,
    DaBirth,
    DafirstVisit,
    DaArt,
    DatVisit,
    OffIn,
    case 
        when typepatients = '≤14' then 'Child'
        when typepatients = '15+' then 'Adult'
        else 'Unknown'
    end as patient_type,
    age,
    case 
        when OffIn = 0 then 'Not Transferred'
        when OffIn = 1 then 'Transferred In'
        when OffIn = 3 then 'Transferred Out'
        else concat('Status: ', OffIn)
    end as transfer_status
from tblactive
where ART is null
order by DafirstVisit DESC, clinicid;