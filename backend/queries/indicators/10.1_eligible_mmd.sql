-- Eligible for MMD

with tblactive as (
    with tblvisit as (
        select clinicid, DatVisit, ARTnum, DaApp, vid, 
               ROW_NUMBER() OVER (PARTITION BY clinicid ORDER BY DatVisit DESC) as id 
        from tblavmain 
        where DatVisit <= :EndDate
        union all 
        select clinicid, DatVisit, ARTnum, DaApp, vid, 
               ROW_NUMBER() OVER (PARTITION BY clinicid ORDER BY DatVisit DESC) as id 
        from tblcvmain 
        where DatVisit <= :EndDate
    ),
    
    tblimain as (
        select ClinicID, DafirstVisit, "15+" as typepatients, TypeofReturn, LClinicID, 
               SiteNameold, DaBirth, timestampdiff(year, DaBirth, :EndDate) as age, 
               Sex, DaHIV, OffIn 
        from tblaimain 
        where DafirstVisit <= :EndDate
        union all 
        select ClinicID, DafirstVisit, "≤14" as typepatients, '' as TypeofReturn, 
               LClinicID, SiteNameold, DaBirth, timestampdiff(year, DaBirth, :EndDate) as age, 
               Sex, DaTest as DaHIV, OffIn 
        from tblcimain 
        where DafirstVisit <= :EndDate
    ),
    
    tblart as (
        select *, timestampdiff(month, DaArt, :EndDate) as nmonthART 
        from tblaart 
        where DaArt <= :EndDate
        union all 
        select *, timestampdiff(month, DaArt, :EndDate) as nmonthART 
        from tblcart 
        where DaArt <= :EndDate
    ),
    
    tblexit as (
        select * 
        from tblavpatientstatus 
        where da <= :EndDate  
        union all 
        select * 
        from tblcvpatientstatus  
        where da <= :EndDate
    ),
    
    tblarvdrug as (
        with tbldrug as (
            select vid, group_concat(distinct DrugName order by DrugName asc SEPARATOR '+') as drugname 
            from tblavarvdrug 
            where status <> 1 
            group by vid 
            union all 
            select vid, group_concat(distinct DrugName order by DrugName asc SEPARATOR '+') as drugname 
            from tblcvarvdrug 
            where status <> 1 
            group by vid
        )
        select vid, drugname, 
               if(LOCATE('3TC+DTG+TDF', drugname) > 0, "TLD", "Not-TLD") as TLDStatus 
        from tbldrug
    ),
    
    tblvltested as (
        with tblvltest as (
            select ClinicID, if(DaArrival < Dat, Dat, DaArrival) as DateResult, HIVLoad 
            from tblpatienttest 
            where HIVLoad != ''
            having DateResult <= :EndDate
        ) 
        select distinct ClinicID, DateResult, HIVLoad,
               if(DateResult > datelast, "Do_VL_in_12M", "Do_VL_greatn_12M") as VLdostatus,
               if(HIVLoad < 1000, "VL-Suppression", "Not-Suppression") as vlresultstatus  
        from (
            select ClinicID, DateResult, HIVLoad, 
                   date_sub(:EndDate, interval 1 year) as datelast, 
                   row_number() over (partition by clinicid order by DateResult desc) as id 
            from tblvltest 
        ) pt 
        where pt.id = 1
    ),
    
    tbltptdrug as (
        with tbltptdrugs as (
            select DrugName, Status, Da, Vid 
            from tblavtptdrug 
            where DrugName != "B6" 
            union all 
            select DrugName, Status, Da, Vid 
            from tblcvtptdrug 
            where DrugName != "B6"
        ),
        
        tblvisit as (
            select clinicid, DatVisit, vid 
            from tblavmain 
            union all 
            select clinicid, DatVisit, vid 
            from tblcvmain 
        ),
        
        tbltptall as (
            select clinicid, DatVisit, DrugName, Status, Da 
            from tbltptdrugs tp 
            left join tblvisit v on tp.vid = v.vid
        ),
        
        tbltptstart as (
            select * 
            from (
                select *, row_number() over(partition by clinicid order by DatVisit asc) as id 
                from tbltptall 
                where status = 0 and DatVisit <= :EndDate
            ) s 
            where id = 1
        ),
        
        tbltptstope as (
            select * 
            from (
                select *, row_number() over(partition by clinicid order by Da desc) as id 
                from tbltptall 
                where status = 1 and Da <= :EndDate
            ) s 
            where id = 1
        )
        
        select s.clinicid, s.DatVisit as dateStart, s.DrugName as Tptdrugname, 
               st.da as Datestop, datediff(st.da, s.DatVisit) / 30 as duration  
        from tbltptstart s
        left join tbltptstope st on s.clinicid = st.clinicid
    )

    select i.clinicid, i.DafirstVisit, i.typepatients, i.TypeofReturn, i.LClinicID, 
           i.SiteNameold, i.DaBirth, i.age, i.Sex, i.DaHIV, i.OffIn, 
           a.ART, a.DaArt, v.DatVisit, v.ARTnum, v.DaApp, a.nmonthART,
           if(a.nmonthART >= 6, ">6M", "<6M") as Startartstatus,
           datediff(v.DaApp, v.DatVisit) as ndays,
           if(datediff(v.DaApp, v.DatVisit) > 80, "MMD", "Not-MMD") as MMDStatus,
           rd.drugname,
           if(left(i.clinicid, 1) = "P" and rd.TLDStatus != "TLD" and LOCATE('DTG', drugname) > 0, 
              "TLD", rd.TLDStatus) as TLDStatus,
           vl.DateResult, vl.HIVLoad, vl.VLdostatus, vl.vlresultstatus,
           tp.Tptdrugname, tp.dateStart, tp.Datestop, tp.duration,
           if(left(tp.Tptdrugname, 1) = 3 and tp.duration >= 2.50, "TPT Complete",
              if(left(tp.Tptdrugname, 1) = 6 and tp.duration >= 5.50, "TPT Complete",
                 if(tp.Tptdrugname is null, "Not Start", "Not complete"))) as tptstatus 
    from tblvisit v
    left join tblimain i on i.clinicid = v.clinicid
    left join tblart a on a.clinicid = v.clinicid
    left join tblexit e on v.clinicid = e.clinicid
    left join tblarvdrug rd on rd.vid = v.vid
    left join tblvltested vl on vl.clinicid = v.clinicid
    left join tbltptdrug tp on tp.clinicid = v.clinicid
    where id = 1 and e.status is null and a.ART is not null 
)

select '10.1. Eligible MMD' as Indicator, 
       sum(if(sex = 1 and typepatients = '≤14', 1, 0)) as Male_0_14,
       sum(if(sex = 0 and typepatients = '≤14', 1, 0)) as Female_0_14,
       sum(if(sex = 1 and typepatients = '15+', 1, 0)) as Male_over_14,
       sum(if(sex = 0 and typepatients = '15+', 1, 0)) as Female_over_14,
       count(*) as TOTAL
from tblactive
where ART is not null and Startartstatus = '>6M';
