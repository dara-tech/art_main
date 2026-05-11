-- TPT Complete (reduced scan)

with tblvisit as (
    select clinicid
    from (
        select
            clinicid,
            row_number() over (partition by clinicid order by DatVisit desc) as rn
        from (
            select clinicid, DatVisit
            from tblavmain
            where DatVisit <= :EndDate

            union all

            select clinicid, DatVisit
            from tblcvmain
            where DatVisit <= :EndDate
        ) all_visits
    ) latest_visit
    where rn = 1
),
tblimain as (
    select
        ClinicID,
        "15+" as typepatients,
        Sex
    from tblaimain
    where DafirstVisit <= :EndDate

    union all

    select
        ClinicID,
        "≤14" as typepatients,
        Sex
    from tblcimain
    where DafirstVisit <= :EndDate
),
tblart as (
    select ClinicID, ART
    from tblaart
    where DaArt <= :EndDate

    union all

    select ClinicID, ART
    from tblcart
    where DaArt <= :EndDate
),
tblexit as (
    select clinicid, status
    from tblavpatientstatus
    where da <= :EndDate

    union all

    select clinicid, status
    from tblcvpatientstatus
    where da <= :EndDate
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
    tptvisit as (
        select clinicid, DatVisit, vid
        from tblavmain
        where DatVisit <= :EndDate

        union all

        select clinicid, DatVisit, vid
        from tblcvmain
        where DatVisit <= :EndDate
    ),
    tbltptall as (
        select
            v.clinicid,
            v.DatVisit,
            tp.DrugName,
            tp.Status,
            tp.Da
        from tbltptdrugs tp
        left join tptvisit v on tp.vid = v.vid
    ),
    tbltptstart as (
        select *
        from (
            select
                *,
                row_number() over (partition by clinicid order by DatVisit asc) as rn
            from tbltptall
            where status = 0
              and DatVisit <= :EndDate
        ) s
        where rn = 1
    ),
    tbltptstope as (
        select *
        from (
            select
                *,
                row_number() over (partition by clinicid order by Da desc) as rn
            from tbltptall
            where status = 1
              and Da <= :EndDate
        ) s
        where rn = 1
    )
    select
        s.clinicid,
        if(
            left(s.DrugName, 1) = 3 and datediff(st.Da, s.DatVisit) / 30 >= 2.50, "TPT Complete",
            if(
                left(s.DrugName, 1) = 6 and datediff(st.Da, s.DatVisit) / 30 >= 5.50, "TPT Complete",
                if(s.DrugName is null, "Not Start", "Not complete")
            )
        ) as tptstatus
    from tbltptstart s
    left join tbltptstope st on s.clinicid = st.clinicid
)

select
    '10.5. TPT Complete' as Indicator,
    ifnull(sum(if(i.Sex = 1 and i.typepatients = '≤14', 1, 0)), 0) as Male_0_14,
    ifnull(sum(if(i.Sex = 0 and i.typepatients = '≤14', 1, 0)), 0) as Female_0_14,
    ifnull(sum(if(i.Sex = 1 and i.typepatients = '15+', 1, 0)), 0) as Male_over_14,
    ifnull(sum(if(i.Sex = 0 and i.typepatients = '15+', 1, 0)), 0) as Female_over_14,
    ifnull(count(*), 0) as TOTAL
from tblvisit v
left join tblimain i on i.ClinicID = v.clinicid
left join tblart a on a.ClinicID = v.clinicid
left join tblexit e on e.clinicid = v.clinicid
left join tbltptdrug tp on tp.clinicid = v.clinicid
where e.status is null
  and a.ART is not null
  and tp.tptstatus = 'TPT Complete';
