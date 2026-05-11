# Infant Aggregate SQL Scripts

## Overview
This folder contains aggregate SQL scripts extracted from `Rinfants.vb`. Each script calculates summary statistics (Male/Female counts by age group) for different Infant report sections.

## Key Differences from PNTT
- **No VIEWs**: Infant queries don't use VIEWs, so they work directly with MySQL variables
- **Age Groups**: Infant reports use "Less than 2 months" and "Greater than 2 months" instead of just Male/Female
- **Tables**: Uses `tbleimain` (Infant main), `tblevmain` (Infant visits), `tbletest` (Infant tests)

## Indicator list (follow-up report) and matching scripts

The infant report has 19 indicators. The numbered aggregate scripts are aligned to that list as follows:

1. **Number of HEI receiving CARE at the end of preceding quarter**  
   - Script: `01_INFANT_PREVIOUS_QUARTER_aggregate.sql`  
   - Counts patients on care at end of previous quarter (M/F totals)

2. **Number of New HEI first visit CARE during this quarter**  
   - Scripts: `01_INFANT_NEW_LESS2_aggregate.sql`, `02_INFANT_NEW_GREAT2_aggregate.sql`  
   - These give M/F counts for **\< 2 months** and **\> 2 months**.

3. **Number of Official Transferred In**  
   - Script: `03_INFANT_TRANSFER_IN_aggregate.sql`

4. **Number of Exposed Infant tested DNA PCR during this quarter / DNA PCR tests requested by clinician**  
   - Scripts: `04_INFANT_DNA_TEST_LESS2_aggregate.sql`, `06_INFANT_DNA_TEST_GREAT2_aggregate.sql`

5. **Number of HEI started Cotrimoxazole during this quarter**  
   - Script: `05_INFANT_COTRIM_aggregate.sql`

6. **Number of DNA PCR tested results at birth**  
   - Script: `07_INFANT_DNA_BIRTH_aggregate.sql`

7. **Number of DNA PCR tested results at 4‑6 weeks after birth**  
   - Script: `09_INFANT_DNA_4_6WEEKS_aggregate.sql`

8. **Number of DNA PCR tested results at 9 months**  
   - Script: `11_INFANT_DNA_9MONTHS_aggregate.sql`

9. **Number of DNA PCR tested results in case of OI symptomatic**  
   - Script: `13_INFANT_DNA_OI_aggregate.sql`

10. **Number of DNA PCR Other test**  
    - Script: `15_INFANT_DNA_OTHER_aggregate.sql`

11. **Number of DNA PCR Confirmatory tested results at birth**  
    - Script: `08_INFANT_DNA_CONFIRM_BIRTH_aggregate.sql`

12. **Number of DNA PCR Confirmatory tested results at 4‑6 weeks after birth**  
    - Script: `10_INFANT_DNA_CONFIRM_4_6WEEKS_aggregate.sql`

13. **Number of DNA PCR Confirmatory tested results at 9 months**  
    - Script: `12_INFANT_DNA_CONFIRM_9MONTHS_aggregate.sql`

14. **Number of DNA PCR Confirmatory tested results in case of OI symptomatic**  
    - Script: `14_INFANT_DNA_CONFIRM_OI_aggregate.sql`

15. **Other DNA PCR Confirmatory test**  
    - Script: `16_INFANT_DNA_CONFIRM_OTHER_aggregate.sql`

16. **Number of HIV Exposed Infants with HIV Antibody tested results**  
    - Script: `17_INFANT_ANTIBODY_aggregate.sql`

17. **Number of Exposed Infants who left care**  
    - Script: `18_INFANT_OUTCOME_aggregate.sql` (filter on status in the result set)

18. **Total Number of Exposed Infants on Follow up and Care at end of this quarter**  
    - Script: `19_INFANT_TOTAL_ON_CARE_aggregate.sql`  
    - Formula: Previous quarter + New enrollments + Transfers in (M/F totals)

Note: `19_INFANT_DNA_CONFIRM_aggregate.sql` gives **overall total DNA PCR confirmatory tests (all stages combined)** and is used for cross‑checks, not a single row in the printed report.

## Usage

1. Set date parameters at the top of each script:
```sql
SET @StartDate = '2025-01-01';
SET @EndDate = '2025-03-31';
```

2. Run the entire script in MySQL Workbench

## Notes

- All queries use `timestampdiff(Day, DaBirth, DafirstVisit)` to calculate age groups
- Less than 2 months = <= 76 days
- Greater than 2 months = > 76 days
- Date format in original VB code: `yyyy/MM/dd` (converted to `yyyy-MM-dd` in SQL scripts)

