-- Indicator 2: Active Pre-ART patients in previous quarter
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

select '2. Active Pre-ART patients in previous quarter' as Indicator, 
       sum(if(typepatients = '≤14' and sex = 1, 1, 0)) as Male_0_14,
       sum(if(typepatients = '≤14' and sex = 0, 1, 0)) as Female_0_14,
       sum(if(typepatients = '15+' and sex = 1, 1, 0)) as Male_over_14,
       sum(if(typepatients = '15+' and sex = 0, 1, 0)) as Female_over_14,
       count(*) as TOTAL
from tblactive
where ART is null;
