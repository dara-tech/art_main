# Mortality and Retention Indicators

This folder contains SQL queries for the 15 mortality and retention indicators as specified in section 5.7 of the ART program requirements.

## 5.7.1 Mortality indicators and re-engage into care indicators

1. **1_percentage_died.sql** - Percentage of ART patients who died
2. **2_percentage_lost_to_followup.sql** - Percentage of ART patients who were lost to follow-up
3. **3_reengaged_within_28_days.sql** - Percentage of ART patients with no clinical contact or ARV pick up for within 28 days since their last expected contact reengaged in care
4. **4_reengaged_over_28_days.sql** - Percentage of ART patients with no clinical contact or ARV pick up for more than 28 days since their last expected contact reengaged in care

## 5.7.2 Visit status indicators

5a. **5a_late_visits_beyond_buffer.sql** - Percentage of late visits beyond ARV supply buffer date
5b. **5b_late_visits_within_buffer.sql** - Percentage of late visits within ARV supply buffer date
5c. **5c_visits_on_schedule.sql** - Percentage of visits on schedule among ART patients
5d. **5d_early_visits.sql** - Percentage of early visits among ART patients

## 5.7.3 Treatment and preventive therapeutic indicators

6a. **6a_same_day_art_initiation.sql** - Percentage of patients newly initiating ART on same-day (0 day) as diagnosed date
6b. **6b_art_initiation_1_7_days.sql** - Percentage of patients newly initiating ART within 1-7 days of diagnosed date
6c. **6c_art_initiation_over_7_days.sql** - Percentage of patients newly initiating ART after >7 days of diagnosed date
7. **7_baseline_cd4_before_art.sql** - Percentage of HIV infected patients who received a baseline CD4 count before starting ART
8a. **8a_cotrimoxazole_prophylaxis.sql** - Percentage of patients with CD4 count less than 350 receiving prophylaxis with Cotrimoxazole
8b. **8b_fluconazole_prophylaxis.sql** - Percentage of patients with CD4 counts less than 100 c/mm3 receiving prophylaxis with Fluconazole
9. **9_mmd_3_months.sql** - Percentage of ART patients have received MMD ≥ 3 months (disaggregated: <3m, 3m, 4m, 5m, ≥ 6m)
10a. **10a_tld_new_initiation.sql** - Percentage of patients newly initiating ART with TLD as 1st line regimen
10b. **10b_tld_cumulative.sql** - Percentage of ART patients using TLD as 1st line regimen (cumulative)
11a. **11a_tpt_received.sql** - Percentage of ART patients received TPT (cumulative including those who completed TPT)
11b. **11b_tpt_completed.sql** - Percentage of ART patients completed the TPT course (cumulative)

## 5.7.4 Viral load indicators

12a. **12a_vl_testing_coverage.sql** - Percentage of people receiving antiretroviral therapy receiving a viral load test in the past 12 months (the coverage of viral load testing)
12b. **12b_vl_monitored_six_months.sql** - Percentage of people receiving antiretroviral therapy who had viral load monitored at six months [WHO VLS.6]
12c. **12c_vl_suppression_12_months.sql** - Percentage of people receiving antiretroviral therapy tested for viral load at <1000 copies/mL at 12 months after initiating antiretroviral therapy [WHO: VLS.1]
12d. **12d_vl_suppression_overall.sql** - Percentage of people living with HIV and receiving antiretroviral therapy who have suppressed viral load [WHO VLS.3]
12e. **12e_vl_results_10_days.sql** - Percentage of viral load tests results received at sites within 10 days of sample taken (Note: WHO within one month)

## 5.7.5 Enhanced adherence counseling indicators

13a. **13a_enhanced_adherence_counseling.sql** - Percentage of PLHIV receiving ART with a viral load ≥1000 copies/mL who received enhanced adherence counselling
13b. **13b_followup_vl_after_counseling.sql** - Percentage of PLHIV receiving ART with viral load ≥1000 copies/mL who received a follow-up viral load test within six months after enhanced adherence counselling
13c. **13c_vl_suppression_after_counseling.sql** - Percentage of PLHIV receiving ART with viral load ≥1000 copies/mL who achieved viral suppression after enhanced adherence counselling

## 5.7.6 Switching regimen and Retention indicators

14a. **14a_first_line_to_second_line.sql** - Percentage of PLHIV receiving first line ART with two consecutive documented viral load test results ≥1000 copies/mL switching to second line
14b. **14b_second_line_to_third_line.sql** - Percentage of PLHIV receiving second line ART with two consecutive documented viral load test results ≥1000 copies/mL switching to third-line ART regimen
15. **15_retention_rate.sql** - Retention rate (quarterly, annually)

## Usage

Each SQL file contains a complete query that can be executed with the following parameters:
- `:StartDate` - Start date for the reporting period
- `:EndDate` - End date for the reporting period  
- `:transfer_in_code` - Code for patients transferred in (usually 1)

All queries return results with:
- Indicator name
- Numerator and denominator values
- Percentage calculations
- Age and sex disaggregation (Male_0_14, Female_0_14, Male_over_14, Female_over_14)

## Database Schema Dependencies

These queries depend on the following main tables:
- `tblaimain`, `tblcimain` - Patient main information (adults and children)
- `tblaart`, `tblcart` - ART start information
- `tblavmain`, `tblcvmain` - Visit information
- `tblavpatientstatus`, `tblcvpatientstatus` - Patient status (deaths, lost to follow-up, transfers)
- `tblpatienttest` - Laboratory test results
- `tblavarvdrug`, `tblcvarvdrug` - ARV drug prescriptions
- `tblavtptdrug`, `tblcvtptdrug` - TPT drug prescriptions



