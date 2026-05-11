# PNTT Detail SQL Scripts

## Overview
This folder contains disaggregated (detail) SQL scripts for PNTT indicators.  
Each script is paired with a corresponding aggregate script in `PNTT_AGGREGATE_SCRIPTS` and returns **row-level records** instead of totals.

## Current Scripts

- `PNTT_NEW_REG_details.sql` – Detail records for `PNTT_NEW_REG_aggregate.sql` (New Patient Registered)
- `PNTT_NEW_AGREE_details.sql` – Detail records for `PNTT_NEW_AGREE_aggregate.sql` (New Patient Agree Provide Partner)
- `PNTT_NEW_CHILD_PROV_details.sql` – Detail records for `PNTT_NEW_CHILD_PROV_aggregate.sql` (New Patient Child Provider)
- `PNTT_NEW_CHILD_POS_details.sql` – Detail records for `PNTT_NEW_CHILD_POS_aggregate.sql` (New Patient Child Tested Positive)

## Usage

1. Open the desired detail script.
2. Update `@StartDate` and `@EndDate` at the top of the file to match the reporting quarter.
3. Run the entire script in MySQL Workbench / phpMyAdmin.
4. To verify alignment with the aggregate:
   - Run the **aggregate** script and note the totals.
   - Run the **detail** script and check that:
     - Total rows = `Tsex`
     - Female rows = `Female`
     - Male rows = `Male`

Additional PNTT detail scripts can be added here following the same naming convention:

- `PNTT_XXXX_details.sql` ↔ `PNTT_XXXX_aggregate.sql`


