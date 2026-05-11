# PNTT Aggregate SQL Scripts

## Overview
This folder contains 43 aggregate SQL scripts extracted from `PNTT.vb`. Each script calculates summary statistics (Total, Female, Male counts) for different PNTT report sections.

## Usage Instructions

### Step 1: Find Date Range with Data
Before running any script, first run `FIND_DATE_RANGE.sql` to determine what date ranges have data in your database:

```sql
-- This will show you:
-- 1. Earliest and latest patient dates
-- 2. Earliest and latest PNTT visit dates  
-- 3. Recent quarters with data
```

### Step 2: Update Date Parameters
Open any aggregate script and update lines 8-9 with dates that match your data:

```sql
SET @StartDate = '2024-01-01';  -- Change to match your data
SET @EndDate = '2024-03-31';    -- Change to match your data
```

### Step 3: Run the Script
Execute the entire script in MySQL Workbench. The script will:
1. Set date parameters
2. Create the `Adultactive` view
3. Execute the aggregate query
4. Clean up the view

## Script Structure

Each script follows this structure:

```sql
-- PARAMETER SETUP
SET @StartDate = '2025-01-01';
SET @EndDate = '2025-03-31';

-- CREATE VIEW
DROP VIEW IF EXISTS `Adultactive`;
CREATE VIEW `Adultactive` AS
SELECT ClinicID, Sex, TypeofReturn, OffIn 
FROM tblaimain 
WHERE DafirstVisit BETWEEN @StartDate AND @EndDate;

-- MAIN QUERY
SELECT count(...) as Tsex, sum(...) as Female, sum(...) as Male
FROM ...

-- CLEANUP
DROP VIEW IF EXISTS `Adultactive`;
```

## Available Scripts

### New Patient Scripts (22 files)
- `PNTT_NEW_REG_aggregate.sql` - New Patient Registered
- `PNTT_NEW_PNS_aggregate.sql` - Partner Notification Service
- `PNTT_NEW_AGREE_aggregate.sql` - Agree Provide Partner
- `PNTT_NEW_RISK_aggregate.sql` - Risk Factors
- `PNTT_NEW_PART_*_aggregate.sql` (10 files) - Partner sections
- `PNTT_NEW_CHILD_*_aggregate.sql` (8 files) - Children sections

### Old Patient Scripts (21 files)
- `PNTT_OLD_PNS_aggregate.sql` - Partner Notification Service
- `PNTT_OLD_AGREE_aggregate.sql` - Agree Provide Partner
- `PNTT_OLD_RISK_aggregate.sql` - Risk Factors
- `PNTT_OLD_PART_*_aggregate.sql` (10 files) - Partner sections
- `PNTT_OLD_CHILD_*_aggregate.sql` (8 files) - Children sections

## Troubleshooting

### No Results Returned
- **Check date parameters**: Make sure `@StartDate` and `@EndDate` match dates that exist in your database
- **Run FIND_DATE_RANGE.sql**: This will show you what date ranges have data
- **Verify data exists**: Check if there's data in `tblaimain` and `tblapntt` tables for your date range

### View Already Exists Error
- This is normal - the scripts use `DROP VIEW IF EXISTS` which handles this
- If you see warnings, they're harmless (just means the view didn't exist before)

### Syntax Errors
- All scripts have been validated and should work
- Make sure you're running the entire script, not just parts of it
- Check that you're using MySQL 5.7+ or MySQL 8.0+

## Notes

- The `Adultactive` view is temporary and is dropped at the end of each script
- Date parameters use quarterly periods (Q1, Q2, Q3, Q4)
- All scripts return 3 columns: `Tsex` (Total), `Female`, `Male`
- The view filters patients by `DafirstVisit` date range
- New patient queries filter by `TypeofReturn=-1` and `OffIn<>1`
- Old patient queries use `RIGHT OUTER JOIN` to exclude new patients

