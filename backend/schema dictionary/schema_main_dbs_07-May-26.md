# main_dbs Schema Reference

Generated: 2026-05-07T11:17:26.748Z

## Overview

- Database: `main_dbs`
- Total tables: 141
- Source: MySQL INFORMATION_SCHEMA

## Tables Summary

| Table | Est. Rows | Columns | Engine | Collation |
|---|---:|---:|---|---|
| `aggregate_sites` | 6 | 5 | InnoDB | latin1_swedish_ci |
| `analytics_indicators` | 0 | 20 | InnoDB | utf8mb4_unicode_ci |
| `art_report_precompute_jobs` | 0 | 17 | InnoDB | utf8mb4_unicode_ci |
| `art_report_precomputes` | 49 | 132 | InnoDB | utf8mb4_unicode_ci |
| `art_sync_logs` | 111 | 10 | InnoDB | utf8mb4_unicode_ci |
| `blacklisted_tokens` | 238 | 3 | InnoDB | utf8mb3_general_ci |
| `cache` | 119 | 3 | InnoDB | utf8mb3_unicode_ci |
| `cache_locks` | 1 | 3 | InnoDB | utf8mb3_unicode_ci |
| `code_tables` | 2 | 4 | InnoDB | utf8mb3_unicode_ci |
| `counselor_dhis2_optionsets` | 247 | 14 | InnoDB | utf8mb3_unicode_ci |
| `counselors` | 314 | 15 | InnoDB | utf8mb4_unicode_ci |
| `cqi_scheduler_config` | 4 | 14 | InnoDB | utf8mb4_unicode_ci |
| `dashboards` | 4 | 11 | InnoDB | utf8mb4_unicode_ci |
| `failed_jobs` | 0 | 7 | InnoDB | utf8mb3_unicode_ci |
| `imports` | 94 | 11 | InnoDB | utf8mb4_general_ci |
| `indicator_status` | 0 | 7 | InnoDB | utf8mb4_unicode_ci |
| `ip_addresses` | 2 | 7 | InnoDB | latin1_swedish_ci |
| `job_batches` | 0 | 10 | InnoDB | utf8mb3_unicode_ci |
| `jobs` | 0 | 7 | InnoDB | utf8mb3_unicode_ci |
| `laravel_migrations` | 29 | 3 | InnoDB | utf8mb3_unicode_ci |
| `main_deletes` | 18 | 6 | InnoDB | utf8mb4_unicode_ci |
| `migrations` | 34 | 3 | InnoDB | utf8mb3_general_ci |
| `my_table` | 0 | 2 | InnoDB | utf8mb4_unicode_ci |
| `occupations` | 12 | 5 | InnoDB | utf8mb3_general_ci |
| `password_reset_tokens` | 0 | 3 | InnoDB | utf8mb3_unicode_ci |
| `roles` | 11 | 5 | InnoDB | utf8mb3_general_ci |
| `sessions` | 2 | 6 | InnoDB | utf8mb3_unicode_ci |
| `setting_sites` | 0 | 11 | InnoDB | utf8mb3_unicode_ci |
| `site_manipulations_delete` | 0 | 8 | InnoDB | utf8mb3_general_ci |
| `tbl_old_commune` | 1651 | 8 | InnoDB | utf8mb3_general_ci |
| `tbl_old_district` | 197 | 6 | InnoDB | utf8mb3_general_ci |
| `tbl_old_province` | 25 | 5 | InnoDB | utf8mb3_general_ci |
| `tbl_old_village` | 14271 | 8 | InnoDB | utf8mb3_general_ci |
| `tbl_villages_wrong` | 14052 | 6 | InnoDB | utf8mb3_general_ci |
| `tblaart` | 119264 | 7 | InnoDB | utf8mb3_general_ci |
| `tblaccess` | 255580 | 7 | InnoDB | utf8mb3_general_ci |
| `tblaiallergy` | 226 | 9 | InnoDB | latin1_swedish_ci |
| `tblaiarvtreathis` | 23852 | 11 | InnoDB | utf8mb3_general_ci |
| `tblaimain` | 151633 | 51 | InnoDB | utf8mb3_unicode_ci |
| `tblaiothmedabnormal` | 17 | 11 | InnoDB | utf8mb3_general_ci |
| `tblaiothmedanemia` | 21 | 11 | InnoDB | utf8mb3_general_ci |
| `tblaiothmeddiabete` | 146 | 11 | InnoDB | utf8mb3_general_ci |
| `tblaiothmedhepbc` | 33 | 11 | InnoDB | utf8mb3_general_ci |
| `tblaiothmedhyper` | 157 | 11 | InnoDB | utf8mb3_general_ci |
| `tblaiothmedliver` | 12 | 11 | InnoDB | utf8mb3_general_ci |
| `tblaiothmedother` | 23 | 11 | InnoDB | utf8mb3_general_ci |
| `tblaiothmedrenal` | 19 | 11 | InnoDB | utf8mb3_general_ci |
| `tblalink` | 54545 | 10 | InnoDB | utf8mb3_unicode_ci |
| `tblallergy` | 10 | 6 | InnoDB | utf8mb3_general_ci |
| `tblapntt` | 23269 | 18 | InnoDB | utf8mb3_general_ci |
| `tblapnttchild` | 1789 | 27 | InnoDB | utf8mb3_general_ci |
| `tblapnttchildcont` | 213 | 10 | InnoDB | utf8mb3_general_ci |
| `tblapnttpart` | 10494 | 38 | InnoDB | utf8mb3_general_ci |
| `tblapnttpartcont` | 828 | 10 | InnoDB | utf8mb3_general_ci |
| `tblappointment` | 4199563 | 8 | InnoDB | utf8mb3_general_ci |
| `tblartsite` | 76 | 6 | InnoDB | utf8mb3_general_ci |
| `tblaumain` | 135772 | 27 | InnoDB | utf8mb4_unicode_ci |
| `tblavarvdrug` | 12481197 | 15 | InnoDB | latin1_swedish_ci |
| `tblavhydrug` | 4959 | 15 | InnoDB | latin1_swedish_ci |
| `tblavmain` | 4529569 | 85 | InnoDB | utf8mb4_general_ci |
| `tblavoidrug` | 1585510 | 15 | InnoDB | utf8mb4_unicode_ci |
| `tblavpatientstatus` | 78610 | 11 | InnoDB | utf8mb3_general_ci |
| `tblavtbdrug` | 42130 | 15 | InnoDB | utf8mb4_unicode_ci |
| `tblavtptdrug` | 464856 | 15 | InnoDB | utf8mb4_unicode_ci |
| `tblbackupetest` | 576 | 19 | InnoDB | utf8mb3_general_ci |
| `tblcart` | 8018 | 7 | InnoDB | utf8mb3_general_ci |
| `tblcausedeath` | 0 | 8 | InnoDB | utf8mb3_general_ci |
| `tblciallergy` | 10 | 8 | InnoDB | utf8mb3_general_ci |
| `tblcicotrim` | 1123 | 10 | InnoDB | utf8mb3_general_ci |
| `tblcifamily` | 16510 | 14 | InnoDB | utf8mb3_general_ci |
| `tblcifluconazole` | 189 | 10 | InnoDB | utf8mb3_general_ci |
| `tblcimain` | 10172 | 40 | InnoDB | utf8mb3_general_ci |
| `tblciothpast` | 2228 | 11 | InnoDB | utf8mb3_general_ci |
| `tblclinic` | 5 | 5 | InnoDB | utf8mb3_general_ci |
| `tblclink` | 1912 | 10 | InnoDB | utf8mb3_unicode_ci |
| `tblcommune` | 1651 | 8 | InnoDB | utf8mb4_0900_ai_ci |
| `tblcumain` | 8662 | 23 | InnoDB | utf8mb4_unicode_ci |
| `tblcvarvdrug` | 936484 | 15 | InnoDB | utf8mb4_unicode_ci |
| `tblcvmain` | 406535 | 50 | InnoDB | utf8mb3_general_ci |
| `tblcvoidrug` | 160731 | 15 | InnoDB | utf8mb4_unicode_ci |
| `tblcvpatientstatus` | 10138 | 11 | InnoDB | utf8mb3_general_ci |
| `tblcvtbdrug` | 1226 | 15 | InnoDB | utf8mb4_unicode_ci |
| `tblcvtptdrug` | 9922 | 15 | InnoDB | utf8mb4_unicode_ci |
| `tbldistrict` | 203 | 7 | InnoDB | utf8mb4_0900_ai_ci |
| `tbldoctor` | 3010 | 7 | InnoDB | utf8mb3_general_ci |
| `tbldrug` | 36 | 8 | InnoDB | utf8mb3_general_ci |
| `tbldrugtreat` | 6 | 5 | InnoDB | utf8mb3_general_ci |
| `tbleimain` | 5800 | 45 | InnoDB | utf8mb4_unicode_ci |
| `tblelink` | 131 | 10 | InnoDB | utf8mb4_unicode_ci |
| `tbletest` | 7504 | 19 | InnoDB | utf8mb4_unicode_ci |
| `tblevarvdrug` | 21879 | 15 | InnoDB | utf8mb4_unicode_ci |
| `tblevmain` | 24476 | 30 | InnoDB | utf8mb4_unicode_ci |
| `tblevpatientstatus` | 5103 | 8 | InnoDB | utf8mb4_unicode_ci |
| `tbllog` | 66528 | 6 | InnoDB | utf8mb3_general_ci |
| `tbllostlog` | 9 | 12 | InnoDB | utf8mb3_general_ci |
| `tblmargins` | 1 | 7 | InnoDB | utf8mb3_general_ci |
| `tblnationality` | 225 | 5 | InnoDB | utf8mb3_general_ci |
| `tbloccupation` | 26 | 5 | InnoDB | utf8mb3_general_ci |
| `tblods` | 64 | 10 | InnoDB | utf8mb4_general_ci |
| `tblpatienttest` | 1186873 | 81 | InnoDB | utf8mb3_general_ci |
| `tblpatienttestabdominal` | 16 | 9 | InnoDB | latin1_swedish_ci |
| `tblpatienttestcxr` | 22 | 9 | InnoDB | latin1_swedish_ci |
| `tblprovince` | 25 | 5 | InnoDB | utf8mb4_0900_ai_ci |
| `tblreason` | 40 | 5 | InnoDB | utf8mb3_general_ci |
| `tblsetlost` | 1 | 11 | InnoDB | utf8mb3_general_ci |
| `tblsite_syncs` | 35409 | 6 | InnoDB | utf8mb4_unicode_ci |
| `tblsitename` | 1 | 9 | InnoDB | utf8mb3_general_ci |
| `tblsites` | 75 | 21 | InnoDB | utf8mb4_general_ci |
| `tbltargroup` | 8 | 7 | InnoDB | utf8mb3_general_ci |
| `tbltemp` | 0 | 7 | InnoDB | utf8mb3_general_ci |
| `tbltempart` | 0 | 2 | InnoDB | utf8mb3_general_ci |
| `tbltempdrug` | 0 | 2 | InnoDB | utf8mb3_general_ci |
| `tbltempoi` | 0 | 2 | InnoDB | utf8mb3_general_ci |
| `tbluser` | 1 | 8 | InnoDB | utf8mb3_general_ci |
| `tblvcctsite` | 77 | 4 | InnoDB | utf8mb3_general_ci |
| `tblversion` | 1 | 3 | InnoDB | utf8mb3_general_ci |
| `tblvillage` | 14367 | 8 | InnoDB | utf8mb4_0900_ai_ci |
| `typeorm_metadata` | 0 | 6 | InnoDB | utf8mb4_unicode_ci |
| `user_logins` | 142 | 8 | InnoDB | latin1_swedish_ci |
| `user_org_units` | 0 | 7 | InnoDB | utf8mb3_general_ci |
| `user_roles` | 3 | 5 | InnoDB | utf8mb3_general_ci |
| `users` | 318 | 13 | InnoDB | utf8mb4_unicode_ci |
| `vcct_hiv_results` | 3 | 6 | InnoDB | utf8mb3_general_ci |
| `vcct_line_test_results` | 153828 | 11 | InnoDB | utf8mb3_general_ci |
| `vcct_number_recencies` | 0 | 30 | InnoDB | utf8mb3_general_ci |
| `vcct_number_retests` | 0 | 24 | InnoDB | utf8mb3_general_ci |
| `vcct_number_test_a1_reactives` | 0 | 23 | InnoDB | utf8mb3_general_ci |
| `vcct_number_tests` | 0 | 27 | InnoDB | utf8mb3_general_ci |
| `vcct_patient_types` | 8 | 6 | InnoDB | utf8mb3_general_ci |
| `vcct_reason_to_services` | 160368 | 20 | InnoDB | utf8mb3_general_ci |
| `vcct_reasons` | 14 | 5 | InnoDB | utf8mb3_general_ci |
| `vcct_refer_froms` | 20 | 5 | InnoDB | utf8mb3_general_ci |
| `vcct_refer_to_services` | 5 | 6 | InnoDB | utf8mb3_general_ci |
| `vcct_retest_outs` | 0 | 7 | InnoDB | utf8mb3_unicode_ci |
| `vcct_retests` | 12668 | 14 | InnoDB | utf8mb4_unicode_ci |
| `vcct_risks` | 160339 | 24 | InnoDB | utf8mb3_general_ci |
| `vcct_rtri_lines_delete` | 144 | 10 | InnoDB | utf8mb3_general_ci |
| `vcct_rtri_results` | 4 | 5 | InnoDB | utf8mb3_general_ci |
| `vcct_sites_delete` | 66 | 9 | InnoDB | latin1_swedish_ci |
| `vcct_vl_rita_results` | 2 | 6 | InnoDB | utf8mb3_general_ci |
| `vccts` | 158496 | 47 | InnoDB | utf8mb4_unicode_ci |

## Detailed Structure

### `aggregate_sites`

- Estimated rows: 6
- Engine: InnoDB
- Created: Sun Nov 09 2025 11:07:51 GMT+0700 (Indochina Time)
- Updated: N/A

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `id` | int | NO | NULL | PRI | auto_increment |
| 2 | `site_code` | char(4) | YES | NULL |  |  |
| 3 | `site_name` | varchar(50) | YES | NULL |  |  |
| 4 | `file_name` | varchar(50) | YES | NULL |  |  |
| 5 | `created_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |

#### Indexes

- UNIQUE `PRIMARY` (id)

### `analytics_indicators`

- Estimated rows: 0
- Engine: InnoDB
- Created: Thu May 07 2026 05:01:05 GMT+0700 (Indochina Time)
- Updated: N/A

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `id` | int | NO | NULL | PRI | auto_increment |
| 2 | `indicator_id` | varchar(50) | NO | NULL |  |  |
| 3 | `indicator_name` | varchar(255) | NO | NULL |  |  |
| 4 | `site_code` | varchar(20) | NO | NULL |  |  |
| 5 | `site_name` | varchar(255) | NO | NULL |  |  |
| 6 | `period_type` | enum('quarterly','monthly','yearly') | NO | quarterly |  |  |
| 7 | `period_year` | int | NO | NULL |  |  |
| 8 | `period_quarter` | int | YES | NULL |  |  |
| 9 | `period_month` | int | YES | NULL |  |  |
| 10 | `start_date` | date | NO | NULL |  |  |
| 11 | `end_date` | date | NO | NULL |  |  |
| 12 | `total` | int | NO | 0 |  |  |
| 13 | `male_0_14` | int | NO | 0 |  |  |
| 14 | `female_0_14` | int | NO | 0 |  |  |
| 15 | `male_over_14` | int | NO | 0 |  |  |
| 16 | `female_over_14` | int | NO | 0 |  |  |
| 17 | `calculation_status` | enum('pending','calculating','completed','failed') | NO | pending |  |  |
| 18 | `last_updated` | datetime | YES | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |
| 19 | `created_at` | datetime | YES | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |
| 20 | `updated_at` | datetime | YES | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED on update CURRENT_TIMESTAMP |

#### Indexes

- UNIQUE `PRIMARY` (id)

### `art_report_precompute_jobs`

- Estimated rows: 0
- Engine: InnoDB
- Created: Sun Feb 08 2026 17:53:58 GMT+0700 (Indochina Time)
- Updated: N/A

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `id` | bigint unsigned | NO | NULL | PRI | auto_increment |
| 2 | `uuid` | char(36) | NO | NULL | UNI |  |
| 3 | `site_type` | varchar(16) | NO | NULL |  |  |
| 4 | `site_code` | varchar(32) | NO | NULL |  |  |
| 5 | `is_no_od` | tinyint unsigned | NO | 0 |  |  |
| 6 | `duration` | varchar(16) | NO | NULL |  |  |
| 7 | `start_period` | varchar(32) | NO | NULL |  |  |
| 8 | `end_period` | varchar(32) | NO | NULL |  |  |
| 9 | `total` | int unsigned | NO | 0 |  |  |
| 10 | `processed` | int unsigned | NO | 0 |  |  |
| 11 | `status` | varchar(16) | NO | queued |  |  |
| 12 | `message` | text | YES | NULL |  |  |
| 13 | `error` | text | YES | NULL |  |  |
| 14 | `started_at` | timestamp | YES | NULL |  |  |
| 15 | `finished_at` | timestamp | YES | NULL |  |  |
| 16 | `created_at` | timestamp | YES | NULL |  |  |
| 17 | `updated_at` | timestamp | YES | NULL |  |  |

#### Indexes

- UNIQUE `art_report_precompute_jobs_uuid_unique` (uuid)
- UNIQUE `PRIMARY` (id)

### `art_report_precomputes`

- Estimated rows: 49
- Engine: InnoDB
- Created: Sun Feb 08 2026 17:54:05 GMT+0700 (Indochina Time)
- Updated: Tue May 05 2026 13:18:52 GMT+0700 (Indochina Time)

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `id` | bigint unsigned | NO | NULL | PRI | auto_increment |
| 2 | `site_type` | varchar(16) | NO | NULL | MUL |  |
| 3 | `site_code` | varchar(32) | NO | NULL |  |  |
| 4 | `is_no_od` | tinyint unsigned | NO | 0 |  |  |
| 5 | `duration` | varchar(16) | NO | NULL |  |  |
| 6 | `period` | varchar(32) | NO | NULL |  |  |
| 7 | `start_date` | date | NO | NULL |  |  |
| 8 | `end_date` | date | NO | NULL |  |  |
| 9 | `prev_end` | date | NO | NULL |  |  |
| 10 | `computed_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |
| 11 | `created_at` | timestamp | YES | NULL |  |  |
| 12 | `updated_at` | timestamp | YES | NULL |  |  |
| 13 | `i1_m0` | int unsigned | NO | 0 |  |  |
| 14 | `i1_f0` | int unsigned | NO | 0 |  |  |
| 15 | `i1_m15` | int unsigned | NO | 0 |  |  |
| 16 | `i1_f15` | int unsigned | NO | 0 |  |  |
| 17 | `i2_m0` | int unsigned | NO | 0 |  |  |
| 18 | `i2_f0` | int unsigned | NO | 0 |  |  |
| 19 | `i2_m15` | int unsigned | NO | 0 |  |  |
| 20 | `i2_f15` | int unsigned | NO | 0 |  |  |
| 21 | `i3_m0` | int unsigned | NO | 0 |  |  |
| 22 | `i3_f0` | int unsigned | NO | 0 |  |  |
| 23 | `i3_m15` | int unsigned | NO | 0 |  |  |
| 24 | `i3_f15` | int unsigned | NO | 0 |  |  |
| 25 | `i4_m0` | int unsigned | NO | 0 |  |  |
| 26 | `i4_f0` | int unsigned | NO | 0 |  |  |
| 27 | `i4_m15` | int unsigned | NO | 0 |  |  |
| 28 | `i4_f15` | int unsigned | NO | 0 |  |  |
| 29 | `i5_m0` | int unsigned | NO | 0 |  |  |
| 30 | `i5_f0` | int unsigned | NO | 0 |  |  |
| 31 | `i5_m15` | int unsigned | NO | 0 |  |  |
| 32 | `i5_f15` | int unsigned | NO | 0 |  |  |
| 33 | `i5_1_m0` | int unsigned | NO | 0 |  |  |
| 34 | `i5_1_f0` | int unsigned | NO | 0 |  |  |
| 35 | `i5_1_m15` | int unsigned | NO | 0 |  |  |
| 36 | `i5_1_f15` | int unsigned | NO | 0 |  |  |
| 37 | `i5_1_1_m0` | int unsigned | NO | 0 |  |  |
| 38 | `i5_1_1_f0` | int unsigned | NO | 0 |  |  |
| 39 | `i5_1_1_m15` | int unsigned | NO | 0 |  |  |
| 40 | `i5_1_1_f15` | int unsigned | NO | 0 |  |  |
| 41 | `i5_1_2_m0` | int unsigned | NO | 0 |  |  |
| 42 | `i5_1_2_f0` | int unsigned | NO | 0 |  |  |
| 43 | `i5_1_2_m15` | int unsigned | NO | 0 |  |  |
| 44 | `i5_1_2_f15` | int unsigned | NO | 0 |  |  |
| 45 | `i5_1_3_m0` | int unsigned | NO | 0 |  |  |
| 46 | `i5_1_3_f0` | int unsigned | NO | 0 |  |  |
| 47 | `i5_1_3_m15` | int unsigned | NO | 0 |  |  |
| 48 | `i5_1_3_f15` | int unsigned | NO | 0 |  |  |
| 49 | `i5_2_m0` | int unsigned | NO | 0 |  |  |
| 50 | `i5_2_f0` | int unsigned | NO | 0 |  |  |
| 51 | `i5_2_m15` | int unsigned | NO | 0 |  |  |
| 52 | `i5_2_f15` | int unsigned | NO | 0 |  |  |
| 53 | `i5_3_m0` | int unsigned | NO | 0 |  |  |
| 54 | `i5_3_f0` | int unsigned | NO | 0 |  |  |
| 55 | `i5_3_m15` | int unsigned | NO | 0 |  |  |
| 56 | `i5_3_f15` | int unsigned | NO | 0 |  |  |
| 57 | `i6_m0` | int unsigned | NO | 0 |  |  |
| 58 | `i6_f0` | int unsigned | NO | 0 |  |  |
| 59 | `i6_m15` | int unsigned | NO | 0 |  |  |
| 60 | `i6_f15` | int unsigned | NO | 0 |  |  |
| 61 | `i7_m0` | int unsigned | NO | 0 |  |  |
| 62 | `i7_f0` | int unsigned | NO | 0 |  |  |
| 63 | `i7_m15` | int unsigned | NO | 0 |  |  |
| 64 | `i7_f15` | int unsigned | NO | 0 |  |  |
| 65 | `i7_1_m0` | int unsigned | NO | 0 |  |  |
| 66 | `i7_1_f0` | int unsigned | NO | 0 |  |  |
| 67 | `i7_1_m15` | int unsigned | NO | 0 |  |  |
| 68 | `i7_1_f15` | int unsigned | NO | 0 |  |  |
| 69 | `i7_2_m0` | int unsigned | NO | 0 |  |  |
| 70 | `i7_2_f0` | int unsigned | NO | 0 |  |  |
| 71 | `i7_2_m15` | int unsigned | NO | 0 |  |  |
| 72 | `i7_2_f15` | int unsigned | NO | 0 |  |  |
| 73 | `i8_m0` | int unsigned | NO | 0 |  |  |
| 74 | `i8_f0` | int unsigned | NO | 0 |  |  |
| 75 | `i8_m15` | int unsigned | NO | 0 |  |  |
| 76 | `i8_f15` | int unsigned | NO | 0 |  |  |
| 77 | `i9_m0` | int unsigned | NO | 0 |  |  |
| 78 | `i9_f0` | int unsigned | NO | 0 |  |  |
| 79 | `i9_m15` | int unsigned | NO | 0 |  |  |
| 80 | `i9_f15` | int unsigned | NO | 0 |  |  |
| 81 | `i9_1_m0` | int unsigned | NO | 0 |  |  |
| 82 | `i9_1_f0` | int unsigned | NO | 0 |  |  |
| 83 | `i9_1_m15` | int unsigned | NO | 0 |  |  |
| 84 | `i9_1_f15` | int unsigned | NO | 0 |  |  |
| 85 | `i9_2_m0` | int unsigned | NO | 0 |  |  |
| 86 | `i9_2_f0` | int unsigned | NO | 0 |  |  |
| 87 | `i9_2_m15` | int unsigned | NO | 0 |  |  |
| 88 | `i9_2_f15` | int unsigned | NO | 0 |  |  |
| 89 | `i9_3_m0` | int unsigned | NO | 0 |  |  |
| 90 | `i9_3_f0` | int unsigned | NO | 0 |  |  |
| 91 | `i9_3_m15` | int unsigned | NO | 0 |  |  |
| 92 | `i9_3_f15` | int unsigned | NO | 0 |  |  |
| 93 | `i10_m0` | int unsigned | NO | 0 |  |  |
| 94 | `i10_f0` | int unsigned | NO | 0 |  |  |
| 95 | `i10_m15` | int unsigned | NO | 0 |  |  |
| 96 | `i10_f15` | int unsigned | NO | 0 |  |  |
| 97 | `i11_m0` | int unsigned | NO | 0 |  |  |
| 98 | `i11_f0` | int unsigned | NO | 0 |  |  |
| 99 | `i11_m15` | int unsigned | NO | 0 |  |  |
| 100 | `i11_f15` | int unsigned | NO | 0 |  |  |
| 101 | `i11_1_m0` | int unsigned | NO | 0 |  |  |
| 102 | `i11_1_f0` | int unsigned | NO | 0 |  |  |
| 103 | `i11_1_m15` | int unsigned | NO | 0 |  |  |
| 104 | `i11_1_f15` | int unsigned | NO | 0 |  |  |
| 105 | `i11_2_m0` | int unsigned | NO | 0 |  |  |
| 106 | `i11_2_f0` | int unsigned | NO | 0 |  |  |
| 107 | `i11_2_m15` | int unsigned | NO | 0 |  |  |
| 108 | `i11_2_f15` | int unsigned | NO | 0 |  |  |
| 109 | `i11_3_m0` | int unsigned | NO | 0 |  |  |
| 110 | `i11_3_f0` | int unsigned | NO | 0 |  |  |
| 111 | `i11_3_m15` | int unsigned | NO | 0 |  |  |
| 112 | `i11_3_f15` | int unsigned | NO | 0 |  |  |
| 113 | `i11_4_m0` | int unsigned | NO | 0 |  |  |
| 114 | `i11_4_f0` | int unsigned | NO | 0 |  |  |
| 115 | `i11_4_m15` | int unsigned | NO | 0 |  |  |
| 116 | `i11_4_f15` | int unsigned | NO | 0 |  |  |
| 117 | `i11_5_m0` | int unsigned | NO | 0 |  |  |
| 118 | `i11_5_f0` | int unsigned | NO | 0 |  |  |
| 119 | `i11_5_m15` | int unsigned | NO | 0 |  |  |
| 120 | `i11_5_f15` | int unsigned | NO | 0 |  |  |
| 121 | `i11_6_m0` | int unsigned | NO | 0 |  |  |
| 122 | `i11_6_f0` | int unsigned | NO | 0 |  |  |
| 123 | `i11_6_m15` | int unsigned | NO | 0 |  |  |
| 124 | `i11_6_f15` | int unsigned | NO | 0 |  |  |
| 125 | `i11_7_m0` | int unsigned | NO | 0 |  |  |
| 126 | `i11_7_f0` | int unsigned | NO | 0 |  |  |
| 127 | `i11_7_m15` | int unsigned | NO | 0 |  |  |
| 128 | `i11_7_f15` | int unsigned | NO | 0 |  |  |
| 129 | `i11_8_m0` | int unsigned | NO | 0 |  |  |
| 130 | `i11_8_f0` | int unsigned | NO | 0 |  |  |
| 131 | `i11_8_m15` | int unsigned | NO | 0 |  |  |
| 132 | `i11_8_f15` | int unsigned | NO | 0 |  |  |

#### Indexes

- UNIQUE `art_report_precomputes_key` (site_type, site_code, is_no_od, duration, period)
- UNIQUE `PRIMARY` (id)

### `art_sync_logs`

- Estimated rows: 111
- Engine: InnoDB
- Created: Sun Feb 22 2026 09:51:49 GMT+0700 (Indochina Time)
- Updated: N/A

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `id` | bigint unsigned | NO | NULL | PRI | auto_increment |
| 2 | `site_code` | varchar(20) | YES | NULL |  |  |
| 3 | `table_name` | varchar(128) | YES | NULL |  |  |
| 4 | `sync_status` | varchar(10) | NO | NULL |  |  |
| 5 | `error_message` | text | YES | NULL |  |  |
| 6 | `total_tables` | int unsigned | YES | NULL |  |  |
| 7 | `viewed_status` | tinyint | YES | 1 |  |  |
| 8 | `viewed_by_user_id` | int | YES | NULL |  |  |
| 9 | `viewed_at` | timestamp | YES | NULL |  |  |
| 10 | `created_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |

#### Indexes

- UNIQUE `PRIMARY` (id)

### `blacklisted_tokens`

- Estimated rows: 238
- Engine: InnoDB
- Created: Thu Oct 16 2025 09:50:05 GMT+0700 (Indochina Time)
- Updated: N/A

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `id` | bigint | NO | NULL | PRI | auto_increment |
| 2 | `token` | text | NO | NULL |  |  |
| 3 | `created_at` | timestamp | YES | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |

#### Indexes

- UNIQUE `PRIMARY` (id)

### `cache`

- Estimated rows: 119
- Engine: InnoDB
- Created: Thu Oct 16 2025 09:50:05 GMT+0700 (Indochina Time)
- Updated: Tue May 05 2026 13:20:44 GMT+0700 (Indochina Time)

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `key` | varchar(255) | NO | NULL | PRI |  |
| 2 | `value` | mediumtext | NO | NULL |  |  |
| 3 | `expiration` | int | NO | NULL |  |  |

#### Indexes

- UNIQUE `PRIMARY` (key)

### `cache_locks`

- Estimated rows: 1
- Engine: InnoDB
- Created: Thu Oct 16 2025 09:50:05 GMT+0700 (Indochina Time)
- Updated: Tue May 05 2026 14:21:08 GMT+0700 (Indochina Time)

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `key` | varchar(255) | NO | NULL | PRI |  |
| 2 | `owner` | varchar(255) | NO | NULL |  |  |
| 3 | `expiration` | int | NO | NULL |  |  |

#### Indexes

- UNIQUE `PRIMARY` (key)

### `code_tables`

- Estimated rows: 2
- Engine: InnoDB
- Created: Thu Oct 16 2025 09:50:06 GMT+0700 (Indochina Time)
- Updated: N/A

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `code_id` | varchar(64) | YES | NULL |  |  |
| 2 | `code_desc` | varchar(128) | YES | NULL |  |  |
| 3 | `code_status` | tinyint | YES | 1 |  |  |
| 4 | `table_ref` | varchar(64) | YES | NULL |  |  |

### `counselor_dhis2_optionsets`

- Estimated rows: 247
- Engine: InnoDB
- Created: Thu Oct 16 2025 09:50:06 GMT+0700 (Indochina Time)
- Updated: N/A

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `id` | int | NO | NULL | PRI | auto_increment |
| 2 | `code_name` | varchar(256) | YES | NULL |  |  |
| 3 | `first_name` | varchar(128) | YES | NULL |  |  |
| 4 | `last_name` | varchar(128) | YES | NULL |  |  |
| 5 | `sex` | int | YES | NULL |  |  |
| 6 | `phone` | char(12) | YES | NULL |  |  |
| 7 | `status_id` | tinyint | YES | 1 |  |  |
| 8 | `created_at` | timestamp | YES | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |
| 9 | `updated_at` | timestamp | YES | NULL |  | on update CURRENT_TIMESTAMP |
| 10 | `created_by_user_id` | int | YES | NULL |  |  |
| 11 | `updated_by_user_id` | int | YES | NULL |  |  |
| 12 | `pin_code` | varchar(255) | YES | NULL |  |  |
| 13 | `user_id` | int | YES | NULL |  |  |
| 14 | `site_code` | varchar(255) | YES | NULL |  |  |

#### Indexes

- UNIQUE `PRIMARY` (id)

### `counselors`

- Estimated rows: 314
- Engine: InnoDB
- Created: Sat Nov 15 2025 03:33:03 GMT+0700 (Indochina Time)
- Updated: N/A

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `id` | int | NO | NULL | PRI | auto_increment |
| 2 | `code_name` | varchar(256) | YES | NULL |  |  |
| 3 | `first_name` | varchar(128) | YES | NULL |  |  |
| 4 | `last_name` | varchar(128) | YES | NULL |  |  |
| 5 | `sex` | int | YES | NULL |  |  |
| 6 | `phone` | char(12) | YES | NULL |  |  |
| 7 | `status_id` | tinyint | YES | 1 |  |  |
| 8 | `last_log_pin` | datetime | YES | NULL |  |  |
| 9 | `created_at` | timestamp | YES | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |
| 10 | `updated_at` | timestamp | YES | NULL |  | on update CURRENT_TIMESTAMP |
| 11 | `created_by_user_id` | int | YES | NULL |  |  |
| 12 | `updated_by_user_id` | int | YES | NULL |  |  |
| 13 | `pin_code` | varchar(255) | YES | NULL |  |  |
| 14 | `user_id` | int | YES | NULL |  |  |
| 15 | `site_code` | char(6) | YES | NULL |  |  |

#### Indexes

- UNIQUE `PRIMARY` (id)

### `cqi_scheduler_config`

- Estimated rows: 4
- Engine: InnoDB
- Created: Thu May 07 2026 04:47:51 GMT+0700 (Indochina Time)
- Updated: Thu May 07 2026 04:47:51 GMT+0700 (Indochina Time)

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `id` | int | NO | NULL | PRI | auto_increment |
| 2 | `job_name` | varchar(100) | NO | NULL | UNI |  |
| 3 | `job_type` | enum('data_update','validation','cleanup','report') | NO | NULL | MUL |  |
| 4 | `cron_expression` | varchar(50) | NO | NULL |  |  |
| 5 | `description` | text | YES | NULL |  |  |
| 6 | `site_id` | varchar(20) | YES | NULL |  |  |
| 7 | `parameters` | json | YES | NULL |  |  |
| 8 | `is_active` | tinyint(1) | YES | 1 | MUL |  |
| 9 | `last_run` | timestamp | YES | NULL | MUL |  |
| 10 | `last_status` | enum('success','error','running') | YES | NULL |  |  |
| 11 | `last_error` | text | YES | NULL |  |  |
| 12 | `run_count` | int | YES | 0 |  |  |
| 13 | `created_at` | timestamp | YES | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |
| 14 | `updated_at` | timestamp | YES | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED on update CURRENT_TIMESTAMP |

#### Indexes

- INDEX `idx_is_active` (is_active)
- INDEX `idx_job_type` (job_type)
- INDEX `idx_last_run` (last_run)
- UNIQUE `job_name` (job_name)
- UNIQUE `PRIMARY` (id)

### `dashboards`

- Estimated rows: 4
- Engine: InnoDB
- Created: Fri Nov 28 2025 07:19:27 GMT+0700 (Indochina Time)
- Updated: N/A

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `id` | int | NO | NULL | PRI | auto_increment |
| 2 | `title` | varchar(99) | YES | NULL |  |  |
| 3 | `description` | varchar(150) | YES | NULL |  |  |
| 4 | `model` | varchar(50) | YES | NULL |  |  |
| 5 | `view` | varchar(50) | YES | NULL |  |  |
| 6 | `controller` | varchar(50) | YES | NULL |  |  |
| 7 | `is_favorite` | tinyint(1) | YES | 0 |  |  |
| 8 | `ordering` | tinyint | YES | 0 |  |  |
| 9 | `uid` | char(11) | NO | concat(char((floor((rand() * 26)) + 65)),char((floor((rand() * 26)) + 97)),floor((rand() * 10)),char((floor((rand() * 26)) + 97)),char((floor((rand() * 26)) + 65)),char((floor((rand() * 26)) + 97)),floor((rand() * 10)),char((floor((rand() * 26)) + 97))) |  | DEFAULT_GENERATED |
| 10 | `created_at` | timestamp | YES | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |
| 11 | `updated_at` | timestamp | YES | NULL |  | on update CURRENT_TIMESTAMP |

#### Indexes

- UNIQUE `PRIMARY` (id)

### `failed_jobs`

- Estimated rows: 0
- Engine: InnoDB
- Created: Thu Oct 16 2025 09:50:06 GMT+0700 (Indochina Time)
- Updated: N/A

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `id` | bigint unsigned | NO | NULL | PRI | auto_increment |
| 2 | `uuid` | varchar(255) | NO | NULL | UNI |  |
| 3 | `connection` | text | NO | NULL |  |  |
| 4 | `queue` | text | NO | NULL |  |  |
| 5 | `payload` | longtext | NO | NULL |  |  |
| 6 | `exception` | longtext | NO | NULL |  |  |
| 7 | `failed_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |

#### Indexes

- UNIQUE `failed_jobs_uuid_unique` (uuid)
- UNIQUE `PRIMARY` (id)

### `imports`

- Estimated rows: 94
- Engine: InnoDB
- Created: Tue May 05 2026 14:21:27 GMT+0700 (Indochina Time)
- Updated: N/A

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `id` | int unsigned | NO | NULL | PRI | auto_increment |
| 2 | `directory` | char(15) | YES | NULL |  |  |
| 3 | `filename` | varchar(250) | YES | NULL |  |  |
| 4 | `note` | varchar(250) | YES | NULL |  |  |
| 5 | `last_initial` | date | YES | NULL |  |  |
| 6 | `last_visited` | date | YES | NULL |  |  |
| 7 | `tables_count` | smallint | YES | 0 |  |  |
| 8 | `import_type_id` | smallint | YES | 0 |  |  |
| 9 | `site_code` | char(6) | YES | NULL |  |  |
| 10 | `created_at` | timestamp | YES | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |
| 11 | `created_by_user_id` | int | YES | 0 |  |  |

#### Indexes

- UNIQUE `PRIMARY` (id)

### `indicator_status`

- Estimated rows: 0
- Engine: InnoDB
- Created: Thu May 07 2026 05:01:05 GMT+0700 (Indochina Time)
- Updated: N/A

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `id` | int | NO | NULL | PRI | auto_increment |
| 2 | `indicator_id` | varchar(100) | NO | NULL | UNI |  |
| 3 | `indicator_name` | varchar(255) | NO | NULL |  |  |
| 4 | `is_active` | tinyint(1) | NO | 1 |  |  |
| 5 | `description` | text | YES | NULL |  |  |
| 6 | `created_at` | datetime | YES | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |
| 7 | `updated_at` | datetime | YES | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED on update CURRENT_TIMESTAMP |

#### Indexes

- UNIQUE `indicator_id` (indicator_id)
- UNIQUE `PRIMARY` (id)

### `ip_addresses`

- Estimated rows: 2
- Engine: InnoDB
- Created: Fri Nov 28 2025 07:19:27 GMT+0700 (Indochina Time)
- Updated: N/A

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `ip` | char(15) | NO | NULL | PRI |  |
| 2 | `country` | varchar(50) | YES | NULL |  |  |
| 3 | `city` | varchar(50) | YES | NULL |  |  |
| 4 | `region_code` | char(10) | YES | NULL |  |  |
| 5 | `region_name` | varchar(50) | YES | NULL |  |  |
| 6 | `isp` | varchar(50) | YES | NULL |  |  |
| 7 | `org` | varchar(50) | YES | NULL |  |  |

#### Indexes

- UNIQUE `PRIMARY` (ip)

### `job_batches`

- Estimated rows: 0
- Engine: InnoDB
- Created: Thu Oct 16 2025 09:50:07 GMT+0700 (Indochina Time)
- Updated: N/A

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `id` | varchar(255) | NO | NULL | PRI |  |
| 2 | `name` | varchar(255) | NO | NULL |  |  |
| 3 | `total_jobs` | int | NO | NULL |  |  |
| 4 | `pending_jobs` | int | NO | NULL |  |  |
| 5 | `failed_jobs` | int | NO | NULL |  |  |
| 6 | `failed_job_ids` | longtext | NO | NULL |  |  |
| 7 | `options` | mediumtext | YES | NULL |  |  |
| 8 | `cancelled_at` | int | YES | NULL |  |  |
| 9 | `created_at` | int | NO | NULL |  |  |
| 10 | `finished_at` | int | YES | NULL |  |  |

#### Indexes

- UNIQUE `PRIMARY` (id)

### `jobs`

- Estimated rows: 0
- Engine: InnoDB
- Created: Thu Oct 16 2025 09:50:07 GMT+0700 (Indochina Time)
- Updated: N/A

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `id` | bigint unsigned | NO | NULL | PRI | auto_increment |
| 2 | `queue` | varchar(255) | NO | NULL | MUL |  |
| 3 | `payload` | longtext | NO | NULL |  |  |
| 4 | `attempts` | tinyint unsigned | NO | NULL |  |  |
| 5 | `reserved_at` | int unsigned | YES | NULL |  |  |
| 6 | `available_at` | int unsigned | NO | NULL |  |  |
| 7 | `created_at` | int unsigned | NO | NULL |  |  |

#### Indexes

- INDEX `jobs_queue_index` (queue)
- UNIQUE `PRIMARY` (id)

### `laravel_migrations`

- Estimated rows: 29
- Engine: InnoDB
- Created: Thu Oct 16 2025 09:50:07 GMT+0700 (Indochina Time)
- Updated: N/A

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `id` | int unsigned | NO | NULL | PRI | auto_increment |
| 2 | `migration` | varchar(255) | NO | NULL |  |  |
| 3 | `batch` | int | NO | NULL |  |  |

#### Indexes

- UNIQUE `PRIMARY` (id)

### `main_deletes`

- Estimated rows: 18
- Engine: InnoDB
- Created: Thu Oct 16 2025 09:50:07 GMT+0700 (Indochina Time)
- Updated: N/A

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `id` | bigint | NO | NULL | PRI | auto_increment |
| 2 | `table_name` | varchar(90) | NO | NULL |  |  |
| 3 | `site_code` | char(6) | NO | NULL |  |  |
| 4 | `delete_id` | bigint | NO | NULL |  |  |
| 5 | `created_at` | timestamp | YES | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |
| 6 | `created_by_user_id` | int | YES | NULL |  |  |

#### Indexes

- UNIQUE `PRIMARY` (id)

### `migrations`

- Estimated rows: 34
- Engine: InnoDB
- Created: Thu Oct 16 2025 09:50:07 GMT+0700 (Indochina Time)
- Updated: N/A

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `id` | int | NO | NULL | PRI | auto_increment |
| 2 | `timestamp` | bigint | NO | NULL |  |  |
| 3 | `name` | varchar(255) | NO | NULL |  |  |

#### Indexes

- UNIQUE `PRIMARY` (id)

### `my_table`

- Estimated rows: 0
- Engine: InnoDB
- Created: Sat Nov 15 2025 03:33:03 GMT+0700 (Indochina Time)
- Updated: N/A

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `uid` | char(11) | NO | concat(char((floor((rand() * 26)) + 65)),char((floor((rand() * 26)) + 97)),substr(replace(uuid(),_utf8mb3\'-\',_utf8mb3\'\'),4,10),char((floor((rand() * 26)) + 65)),char((floor((rand() * 26)) + 97))) | PRI | DEFAULT_GENERATED |
| 2 | `data` | varchar(255) | YES | NULL |  |  |

#### Indexes

- UNIQUE `PRIMARY` (uid)

### `occupations`

- Estimated rows: 12
- Engine: InnoDB
- Created: Thu Oct 16 2025 09:50:07 GMT+0700 (Indochina Time)
- Updated: N/A

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `id` | int | NO | NULL | PRI | auto_increment |
| 2 | `occupation` | varchar(45) | NO | NULL |  |  |
| 3 | `status_id` | int | NO | NULL |  |  |
| 4 | `created_at` | timestamp | YES | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |
| 5 | `updated_at` | timestamp | YES | NULL |  | on update CURRENT_TIMESTAMP |

#### Indexes

- UNIQUE `ocid_UNIQUE` (id)
- UNIQUE `PRIMARY` (id)

### `password_reset_tokens`

- Estimated rows: 0
- Engine: InnoDB
- Created: Thu Oct 16 2025 09:50:08 GMT+0700 (Indochina Time)
- Updated: N/A

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `email` | varchar(255) | NO | NULL | PRI |  |
| 2 | `token` | varchar(255) | NO | NULL |  |  |
| 3 | `created_at` | timestamp | YES | NULL |  |  |

#### Indexes

- UNIQUE `PRIMARY` (email)

### `roles`

- Estimated rows: 11
- Engine: InnoDB
- Created: Thu Oct 16 2025 09:50:08 GMT+0700 (Indochina Time)
- Updated: N/A

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `id` | bigint | NO | NULL | PRI | auto_increment |
| 2 | `role_name` | varchar(90) | NO | NULL |  |  |
| 3 | `role_desc` | varchar(150) | YES | NULL |  |  |
| 4 | `created_dt` | timestamp | YES | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |
| 5 | `updated_dt` | timestamp | YES | NULL |  | on update CURRENT_TIMESTAMP |

#### Indexes

- UNIQUE `PRIMARY` (id)

### `sessions`

- Estimated rows: 2
- Engine: InnoDB
- Created: Thu Oct 16 2025 09:50:08 GMT+0700 (Indochina Time)
- Updated: Thu May 07 2026 10:50:26 GMT+0700 (Indochina Time)

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `id` | varchar(255) | NO | NULL | PRI |  |
| 2 | `user_id` | bigint unsigned | YES | NULL | MUL |  |
| 3 | `ip_address` | varchar(45) | YES | NULL |  |  |
| 4 | `user_agent` | text | YES | NULL |  |  |
| 5 | `payload` | longtext | NO | NULL |  |  |
| 6 | `last_activity` | int | NO | NULL | MUL |  |

#### Indexes

- UNIQUE `PRIMARY` (id)
- INDEX `sessions_last_activity_index` (last_activity)
- INDEX `sessions_user_id_index` (user_id)

### `setting_sites`

- Estimated rows: 0
- Engine: InnoDB
- Created: Thu Oct 16 2025 09:50:08 GMT+0700 (Indochina Time)
- Updated: N/A

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `id` | int | NO | NULL | PRI | auto_increment |
| 2 | `site_code` | varchar(6) | YES | NULL |  |  |
| 3 | `site_name` | varchar(128) | YES | NULL |  |  |
| 4 | `od_code` | varchar(64) | YES | NULL |  |  |
| 5 | `od_name` | varchar(128) | YES | NULL |  |  |
| 6 | `district_id` | smallint | YES | NULL |  |  |
| 7 | `province_id` | tinyint | YES | NULL |  |  |
| 8 | `created_at` | timestamp | YES | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |
| 9 | `updated_at` | timestamp | YES | NULL |  | on update CURRENT_TIMESTAMP |
| 10 | `created_by_user_id` | int | YES | NULL |  |  |
| 11 | `updated_by_user_id` | int | YES | NULL |  |  |

#### Indexes

- UNIQUE `PRIMARY` (id)

### `site_manipulations_delete`

- Estimated rows: 0
- Engine: InnoDB
- Created: Thu Oct 16 2025 09:50:08 GMT+0700 (Indochina Time)
- Updated: N/A

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `id` | bigint | NO | NULL | PRI | auto_increment |
| 2 | `site_code` | varchar(255) | NO | NULL |  |  |
| 3 | `vcct_id_start` | bigint | NO | NULL |  |  |
| 4 | `device_name` | varchar(255) | NO | NULL |  |  |
| 5 | `created_by_user_id` | bigint | NO | NULL |  |  |
| 6 | `updated_by_user_id` | bigint | NO | NULL |  |  |
| 7 | `created_dt` | timestamp | YES | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |
| 8 | `updated_dt` | timestamp | YES | NULL |  | on update CURRENT_TIMESTAMP |

#### Indexes

- UNIQUE `PRIMARY` (id)

### `tbl_old_commune`

- Estimated rows: 1651
- Engine: InnoDB
- Created: Sun Feb 01 2026 16:50:02 GMT+0700 (Indochina Time)
- Updated: N/A

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `Did` | int | NO | NULL |  |  |
| 2 | `Cid` | int | NO | NULL | PRI | auto_increment |
| 3 | `CommuneEN` | varchar(50) | NO | NULL |  |  |
| 4 | `created_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |
| 5 | `updated_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED on update CURRENT_TIMESTAMP |
| 6 | `synced_at` | timestamp | YES | NULL |  |  |
| 7 | `commune_id` | int | YES | NULL |  |  |
| 8 | `Pid` | int | YES | NULL |  |  |

#### Indexes

- UNIQUE `PRIMARY` (Cid)

### `tbl_old_district`

- Estimated rows: 197
- Engine: InnoDB
- Created: Sun Nov 09 2025 11:31:50 GMT+0700 (Indochina Time)
- Updated: N/A

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `Pid` | int | NO | NULL |  |  |
| 2 | `Did` | int | NO | NULL | PRI | auto_increment |
| 3 | `DistrictEng` | varchar(30) | NO | NULL |  |  |
| 4 | `created_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |
| 5 | `updated_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED on update CURRENT_TIMESTAMP |
| 6 | `synced_at` | timestamp | YES | NULL |  |  |

#### Indexes

- UNIQUE `PRIMARY` (Did)

### `tbl_old_province`

- Estimated rows: 25
- Engine: InnoDB
- Created: Sun Nov 09 2025 11:31:51 GMT+0700 (Indochina Time)
- Updated: N/A

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `Pid` | int | NO | NULL | PRI | auto_increment |
| 2 | `ProvinceEng` | varchar(20) | NO | NULL |  |  |
| 3 | `created_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |
| 4 | `updated_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED on update CURRENT_TIMESTAMP |
| 5 | `synced_at` | timestamp | YES | NULL |  |  |

#### Indexes

- UNIQUE `PRIMARY` (Pid)

### `tbl_old_village`

- Estimated rows: 14271
- Engine: InnoDB
- Created: Mon Feb 02 2026 13:50:31 GMT+0700 (Indochina Time)
- Updated: N/A

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `Cid` | int | NO | NULL |  |  |
| 2 | `Vid` | int | NO | NULL | PRI | auto_increment |
| 3 | `VillageEn` | varchar(35) | YES | NULL |  |  |
| 4 | `Did` | int | YES | NULL |  |  |
| 5 | `Pid` | int | YES | NULL |  |  |
| 6 | `created_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |
| 7 | `updated_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED on update CURRENT_TIMESTAMP |
| 8 | `synced_at` | timestamp | YES | NULL |  |  |

#### Indexes

- UNIQUE `PRIMARY` (Vid)

### `tbl_villages_wrong`

- Estimated rows: 14052
- Engine: InnoDB
- Created: Thu Oct 16 2025 09:50:10 GMT+0700 (Indochina Time)
- Updated: N/A

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `id` | int | NO | NULL | PRI |  |
| 2 | `village_en` | varchar(35) | NO | NULL |  |  |
| 3 | `village_kH` | varchar(35) | NO | NULL |  |  |
| 4 | `commune_id` | smallint | NO | NULL |  |  |
| 5 | `created_at` | timestamp | YES | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |
| 6 | `updated_at` | timestamp | YES | NULL |  | on update CURRENT_TIMESTAMP |

#### Indexes

- UNIQUE `PRIMARY` (id)
- UNIQUE `Vid_UNIQUE` (id)

### `tblaart`

- Estimated rows: 119264
- Engine: InnoDB
- Created: Wed Apr 29 2026 17:13:46 GMT+0700 (Indochina Time)
- Updated: Mon May 04 2026 17:00:33 GMT+0700 (Indochina Time)

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `site_code` | char(4) | NO | NULL | PRI |  |
| 2 | `ClinicID` | int | NO | NULL | PRI |  |
| 3 | `ART` | char(10) | NO | NULL |  |  |
| 4 | `DaArt` | date | NO | NULL | MUL |  |
| 5 | `created_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |
| 6 | `updated_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED on update CURRENT_TIMESTAMP |
| 7 | `synced_at` | timestamp | YES | NULL |  |  |

#### Indexes

- INDEX `idx_tblaart_clinic_daart_art` (ClinicID, DaArt, ART)
- INDEX `idx_tblaart_clinicid_daart` (ClinicID, DaArt)
- INDEX `idx_tblaart_daart_clinicid` (DaArt, ClinicID)
- INDEX `idx_tblaart_site_clinicid` (site_code, ClinicID)
- INDEX `idx_tblaart_site_daart_clinic` (site_code, DaArt, ClinicID)
- UNIQUE `PRIMARY` (site_code, ClinicID)

### `tblaccess`

- Estimated rows: 255580
- Engine: InnoDB
- Created: Sun Nov 09 2025 11:31:47 GMT+0700 (Indochina Time)
- Updated: Mon May 04 2026 17:00:33 GMT+0700 (Indochina Time)

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `site_code` | char(4) | NO | NULL | PRI |  |
| 2 | `id` | int | NO | NULL | PRI |  |
| 3 | `Uid` | int | NO | NULL |  |  |
| 4 | `Type` | int | NO | NULL |  |  |
| 5 | `Dat` | datetime | NO | NULL |  |  |
| 6 | `created_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |
| 7 | `synced_at` | timestamp | YES | NULL |  |  |

#### Indexes

- UNIQUE `PRIMARY` (id, site_code)

### `tblaiallergy`

- Estimated rows: 226
- Engine: InnoDB
- Created: Sun Nov 09 2025 11:31:47 GMT+0700 (Indochina Time)
- Updated: Mon May 04 2026 12:17:23 GMT+0700 (Indochina Time)

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `site_code` | char(4) | NO | NULL | PRI |  |
| 2 | `id` | int | NO | NULL | PRI |  |
| 3 | `ClinicID` | int | NO | NULL |  |  |
| 4 | `DrugName` | char(15) | NO | NULL |  |  |
| 5 | `Allergy` | char(25) | NO | NULL |  |  |
| 6 | `Da` | date | NO | NULL |  |  |
| 7 | `created_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |
| 8 | `updated_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED on update CURRENT_TIMESTAMP |
| 9 | `synced_at` | timestamp | YES | NULL |  |  |

#### Indexes

- UNIQUE `PRIMARY` (id, site_code)

### `tblaiarvtreathis`

- Estimated rows: 23852
- Engine: InnoDB
- Created: Sun Nov 09 2025 11:31:47 GMT+0700 (Indochina Time)
- Updated: Mon May 04 2026 12:41:03 GMT+0700 (Indochina Time)

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `site_code` | char(4) | NO | NULL | PRI |  |
| 2 | `id` | int | NO | NULL | PRI |  |
| 3 | `ClinicID` | int | NO | NULL |  |  |
| 4 | `DrugName` | char(15) | NO | NULL |  |  |
| 5 | `Clinic` | char(20) | NO | NULL |  |  |
| 6 | `DaStart` | date | NO | NULL |  |  |
| 7 | `DaStop` | date | NO | NULL |  |  |
| 8 | `Note` | char(40) | NO | NULL |  |  |
| 9 | `created_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |
| 10 | `updated_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED on update CURRENT_TIMESTAMP |
| 11 | `synced_at` | timestamp | YES | NULL |  |  |

#### Indexes

- UNIQUE `PRIMARY` (id, site_code)

### `tblaimain`

- Estimated rows: 151633
- Engine: InnoDB
- Created: Sun Apr 26 2026 17:29:12 GMT+0700 (Indochina Time)
- Updated: Mon May 04 2026 17:00:33 GMT+0700 (Indochina Time)

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `site_code` | char(4) | NO | NULL | PRI |  |
| 2 | `ClinicID` | int | NO | NULL | PRI |  |
| 3 | `DafirstVisit` | date | NO | NULL | MUL |  |
| 4 | `TypeofReturn` | int | YES | NULL |  |  |
| 5 | `LClinicID` | char(10) | YES | NULL |  |  |
| 6 | `SiteNameold` | char(4) | YES | NULL |  |  |
| 7 | `DaBirth` | date | NO | NULL | MUL |  |
| 8 | `Sex` | int | NO | NULL | MUL |  |
| 9 | `Education` | int | NO | NULL |  |  |
| 10 | `Rea` | int | NO | NULL |  |  |
| 11 | `Write` | int | NO | NULL |  |  |
| 12 | `Referred` | int | NO | NULL |  |  |
| 13 | `Orefferred` | varchar(50) | NO | NULL |  |  |
| 14 | `DaHIV` | date | NO | NULL |  |  |
| 15 | `Vcctcode` | char(9) | NO | NULL |  |  |
| 16 | `VcctID` | char(9) | NO | NULL |  |  |
| 17 | `PclinicID` | char(7) | NO | NULL |  |  |
| 18 | `OffIn` | int | NO | NULL |  |  |
| 19 | `SiteName` | char(4) | NO | NULL |  |  |
| 20 | `DaART` | date | NO | NULL |  |  |
| 21 | `Artnum` | char(10) | NO | NULL |  |  |
| 22 | `TbPast` | int | NO | NULL |  |  |
| 23 | `TPT` | int | NO | NULL |  |  |
| 24 | `TPTdrug` | int | NO | NULL |  |  |
| 25 | `DaStartTPT` | date | YES | NULL |  |  |
| 26 | `DaEndTPT` | date | YES | NULL |  |  |
| 27 | `TypeTB` | int | NO | NULL |  |  |
| 28 | `ResultTB` | int | NO | NULL |  |  |
| 29 | `Daonset` | date | NO | NULL |  |  |
| 30 | `Tbtreat` | int | NO | NULL |  |  |
| 31 | `Datreat` | date | NO | NULL |  |  |
| 32 | `ResultTreat` | int | NO | NULL |  |  |
| 33 | `DaResultTreat` | date | NO | NULL |  |  |
| 34 | `ARVTreatHis` | int | NO | NULL |  |  |
| 35 | `Diabete` | char(5) | NO | NULL |  |  |
| 36 | `Hyper` | char(5) | NO | NULL |  |  |
| 37 | `Abnormal` | char(5) | NO | NULL |  |  |
| 38 | `Renal` | char(5) | NO | NULL |  |  |
| 39 | `Anemia` | char(5) | NO | NULL |  |  |
| 40 | `Liver` | char(5) | NO | NULL |  |  |
| 41 | `HepBC` | char(5) | NO | NULL |  |  |
| 42 | `MedOther` | char(5) | NO | NULL |  |  |
| 43 | `Allergy` | int | NO | NULL |  |  |
| 44 | `Nationality` | int | YES | NULL |  |  |
| 45 | `Targroup` | int | YES | NULL |  |  |
| 46 | `Refugstatus` | int | YES | NULL |  |  |
| 47 | `RefugART` | char(10) | YES | NULL |  |  |
| 48 | `Refugsite` | char(4) | YES | NULL |  |  |
| 49 | `created_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |
| 50 | `updated_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED on update CURRENT_TIMESTAMP |
| 51 | `synced_at` | timestamp | YES | NULL |  |  |

#### Indexes

- INDEX `idx_aimain_dabirth_sex_site_clinic` (DaBirth, Sex, site_code, ClinicID)
- INDEX `idx_aimain_sex_dabirth_site_clinic` (Sex, DaBirth, site_code, ClinicID)
- INDEX `idx_aimain_sex_site_clinic` (Sex, site_code, ClinicID)
- INDEX `idx_aimain_site_clinic` (site_code, ClinicID)
- INDEX `idx_aimain_site_dabirth_sex_clinic` (site_code, DaBirth, Sex, ClinicID)
- INDEX `idx_aimain_site_sex_clinic` (site_code, Sex, ClinicID)
- INDEX `idx_tblaimain_dafirstvisit_clinicid` (DafirstVisit, ClinicID)
- INDEX `idx_tblaimain_site_clinic_sex_dob` (site_code, ClinicID, Sex, DaBirth)
- INDEX `idx_tblaimain_site_clinicid` (site_code, ClinicID)
- INDEX `idx_tblaimain_site_first_clinic` (site_code, DafirstVisit, ClinicID)
- INDEX `idx_tblaimain_site_synced_first_clinic` (site_code, synced_at, DafirstVisit, ClinicID)
- UNIQUE `PRIMARY` (site_code, ClinicID)
- INDEX `tblaimain_clinic_site_idx` (ClinicID, site_code)

### `tblaiothmedabnormal`

- Estimated rows: 17
- Engine: InnoDB
- Created: Sun Nov 09 2025 11:31:47 GMT+0700 (Indochina Time)
- Updated: N/A

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `site_code` | char(4) | NO | NULL | PRI |  |
| 2 | `id` | int | NO | NULL | PRI |  |
| 3 | `ClinicID` | int | NO | NULL |  |  |
| 4 | `DrugName` | char(10) | NO | NULL |  |  |
| 5 | `Clinic` | char(20) | NO | NULL |  |  |
| 6 | `DaStart` | date | NO | NULL |  |  |
| 7 | `Dastop` | date | NO | NULL |  |  |
| 8 | `Note` | char(40) | NO | NULL |  |  |
| 9 | `created_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |
| 10 | `updated_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED on update CURRENT_TIMESTAMP |
| 11 | `synced_at` | timestamp | YES | NULL |  |  |

#### Indexes

- UNIQUE `PRIMARY` (id, site_code)

### `tblaiothmedanemia`

- Estimated rows: 21
- Engine: InnoDB
- Created: Sun Nov 09 2025 11:31:47 GMT+0700 (Indochina Time)
- Updated: N/A

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `site_code` | char(4) | NO | NULL | PRI |  |
| 2 | `id` | int | NO | NULL | PRI |  |
| 3 | `ClinicID` | int | NO | NULL |  |  |
| 4 | `DrugName` | char(10) | NO | NULL |  |  |
| 5 | `Clinic` | char(20) | NO | NULL |  |  |
| 6 | `DaStart` | date | NO | NULL |  |  |
| 7 | `Dastop` | date | NO | NULL |  |  |
| 8 | `Note` | char(40) | NO | NULL |  |  |
| 9 | `created_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |
| 10 | `updated_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED on update CURRENT_TIMESTAMP |
| 11 | `synced_at` | timestamp | YES | NULL |  |  |

#### Indexes

- UNIQUE `PRIMARY` (id, site_code)

### `tblaiothmeddiabete`

- Estimated rows: 146
- Engine: InnoDB
- Created: Sun Nov 09 2025 11:31:47 GMT+0700 (Indochina Time)
- Updated: N/A

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `site_code` | char(4) | NO | NULL | PRI |  |
| 2 | `id` | int | NO | NULL | PRI |  |
| 3 | `ClinicID` | int | NO | NULL |  |  |
| 4 | `DrugName` | char(10) | NO | NULL |  |  |
| 5 | `Clinic` | char(20) | NO | NULL |  |  |
| 6 | `DaStart` | date | NO | NULL |  |  |
| 7 | `Dastop` | date | NO | NULL |  |  |
| 8 | `Note` | char(40) | NO | NULL |  |  |
| 9 | `created_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |
| 10 | `updated_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED on update CURRENT_TIMESTAMP |
| 11 | `synced_at` | timestamp | YES | NULL |  |  |

#### Indexes

- UNIQUE `PRIMARY` (id, site_code)

### `tblaiothmedhepbc`

- Estimated rows: 33
- Engine: InnoDB
- Created: Sun Nov 09 2025 11:31:47 GMT+0700 (Indochina Time)
- Updated: Mon May 04 2026 12:34:23 GMT+0700 (Indochina Time)

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `site_code` | char(4) | NO | NULL | PRI |  |
| 2 | `id` | int | NO | NULL | PRI |  |
| 3 | `ClinicID` | int | NO | NULL |  |  |
| 4 | `DrugName` | char(10) | NO | NULL |  |  |
| 5 | `Clinic` | char(20) | NO | NULL |  |  |
| 6 | `DaStart` | date | NO | NULL |  |  |
| 7 | `Dastop` | date | NO | NULL |  |  |
| 8 | `Note` | char(40) | NO | NULL |  |  |
| 9 | `created_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |
| 10 | `updated_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED on update CURRENT_TIMESTAMP |
| 11 | `synced_at` | timestamp | YES | NULL |  |  |

#### Indexes

- UNIQUE `PRIMARY` (id, site_code)

### `tblaiothmedhyper`

- Estimated rows: 157
- Engine: InnoDB
- Created: Sun Nov 09 2025 11:31:47 GMT+0700 (Indochina Time)
- Updated: Mon May 04 2026 10:18:25 GMT+0700 (Indochina Time)

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `site_code` | char(4) | NO | NULL | PRI |  |
| 2 | `id` | int | NO | NULL | PRI |  |
| 3 | `ClinicID` | int | NO | NULL |  |  |
| 4 | `DrugName` | char(10) | NO | NULL |  |  |
| 5 | `Clinic` | char(20) | NO | NULL |  |  |
| 6 | `DaStart` | date | NO | NULL |  |  |
| 7 | `Dastop` | date | NO | NULL |  |  |
| 8 | `Note` | char(40) | NO | NULL |  |  |
| 9 | `created_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |
| 10 | `updated_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED on update CURRENT_TIMESTAMP |
| 11 | `synced_at` | timestamp | YES | NULL |  |  |

#### Indexes

- UNIQUE `PRIMARY` (id, site_code)

### `tblaiothmedliver`

- Estimated rows: 12
- Engine: InnoDB
- Created: Sun Nov 09 2025 11:31:47 GMT+0700 (Indochina Time)
- Updated: N/A

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `site_code` | char(4) | NO | NULL | PRI |  |
| 2 | `id` | int | NO | NULL | PRI |  |
| 3 | `ClinicID` | int | NO | NULL |  |  |
| 4 | `DrugName` | char(10) | NO | NULL |  |  |
| 5 | `Clinic` | char(20) | NO | NULL |  |  |
| 6 | `DaStart` | date | NO | NULL |  |  |
| 7 | `Dastop` | date | NO | NULL |  |  |
| 8 | `Note` | char(40) | NO | NULL |  |  |
| 9 | `created_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |
| 10 | `updated_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED on update CURRENT_TIMESTAMP |
| 11 | `synced_at` | timestamp | YES | NULL |  |  |

#### Indexes

- UNIQUE `PRIMARY` (id, site_code)

### `tblaiothmedother`

- Estimated rows: 23
- Engine: InnoDB
- Created: Sun Nov 09 2025 11:31:47 GMT+0700 (Indochina Time)
- Updated: N/A

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `site_code` | char(4) | NO | NULL | PRI |  |
| 2 | `id` | int | NO | NULL | PRI |  |
| 3 | `ClinicID` | int | NO | NULL |  |  |
| 4 | `DrugName` | char(10) | NO | NULL |  |  |
| 5 | `Clinic` | char(20) | NO | NULL |  |  |
| 6 | `DaStart` | date | NO | NULL |  |  |
| 7 | `Dastop` | date | NO | NULL |  |  |
| 8 | `Note` | char(40) | NO | NULL |  |  |
| 9 | `created_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |
| 10 | `updated_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED on update CURRENT_TIMESTAMP |
| 11 | `synced_at` | timestamp | YES | NULL |  |  |

#### Indexes

- UNIQUE `PRIMARY` (id, site_code)

### `tblaiothmedrenal`

- Estimated rows: 19
- Engine: InnoDB
- Created: Sun Nov 09 2025 11:31:47 GMT+0700 (Indochina Time)
- Updated: N/A

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `site_code` | char(4) | NO | NULL | PRI |  |
| 2 | `id` | int | NO | NULL | PRI |  |
| 3 | `ClinicID` | int | NO | NULL |  |  |
| 4 | `DrugName` | char(10) | NO | NULL |  |  |
| 5 | `Clinic` | char(20) | NO | NULL |  |  |
| 6 | `DaStart` | date | NO | NULL |  |  |
| 7 | `Dastop` | date | NO | NULL |  |  |
| 8 | `Note` | char(40) | NO | NULL |  |  |
| 9 | `created_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |
| 10 | `updated_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED on update CURRENT_TIMESTAMP |
| 11 | `synced_at` | timestamp | YES | NULL |  |  |

#### Indexes

- UNIQUE `PRIMARY` (id, site_code)

### `tblalink`

- Estimated rows: 54545
- Engine: InnoDB
- Created: Mon Apr 06 2026 09:51:02 GMT+0700 (Indochina Time)
- Updated: Mon May 04 2026 17:00:33 GMT+0700 (Indochina Time)

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `site_code` | char(4) | NO | NULL | PRI |  |
| 2 | `ClinicID` | int | NO | NULL | PRI |  |
| 3 | `Codes` | varchar(20) | NO | NULL | PRI |  |
| 4 | `Typecode` | char(15) | NO | NULL | PRI |  |
| 5 | `ARTIss` | int | NO | NULL |  |  |
| 6 | `DaExpiry` | date | NO | NULL |  |  |
| 7 | `Dacreate` | datetime | NO | NULL |  |  |
| 8 | `created_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |
| 9 | `updated_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED on update CURRENT_TIMESTAMP |
| 10 | `synced_at` | timestamp | YES | NULL |  |  |

#### Indexes

- UNIQUE `PRIMARY` (ClinicID, Codes, Typecode, site_code)

### `tblallergy`

- Estimated rows: 10
- Engine: InnoDB
- Created: Sun Nov 09 2025 11:31:48 GMT+0700 (Indochina Time)
- Updated: N/A

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `Aid` | int | NO | NULL | PRI | auto_increment |
| 2 | `AllergyStatus` | varchar(30) | YES | NULL |  |  |
| 3 | `Type` | int | YES | NULL |  |  |
| 4 | `created_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |
| 5 | `updated_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED on update CURRENT_TIMESTAMP |
| 6 | `synced_at` | timestamp | YES | NULL |  |  |

#### Indexes

- UNIQUE `PRIMARY` (Aid)

### `tblapntt`

- Estimated rows: 23269
- Engine: InnoDB
- Created: Sun Apr 26 2026 13:27:44 GMT+0700 (Indochina Time)
- Updated: Mon May 04 2026 17:00:33 GMT+0700 (Indochina Time)

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `site_code` | char(4) | NO | NULL | PRI |  |
| 2 | `ClinicID` | int | NO | NULL |  |  |
| 3 | `DaVisit` | date | NO | NULL |  |  |
| 4 | `SexHIV` | int | NO | NULL |  |  |
| 5 | `Wsex` | int | NO | NULL |  |  |
| 6 | `SexM` | int | NO | NULL |  |  |
| 7 | `SexTran` | int | NO | NULL |  |  |
| 8 | `Sex4` | int | NO | NULL |  |  |
| 9 | `Drug` | int | NO | NULL |  |  |
| 10 | `Pill` | int | NO | NULL |  |  |
| 11 | `SexMoney` | int | NO | NULL |  |  |
| 12 | `SexProvice` | int | NO | NULL |  |  |
| 13 | `WOut` | int | NO | NULL |  |  |
| 14 | `Agree` | int | NO | NULL |  |  |
| 15 | `AsID` | double | NO | NULL | PRI |  |
| 16 | `created_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |
| 17 | `updated_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED on update CURRENT_TIMESTAMP |
| 18 | `synced_at` | timestamp | YES | NULL |  |  |

#### Indexes

- INDEX `idx_tblapntt_site_synced_visit_asid` (site_code, synced_at, DaVisit, AsID)
- UNIQUE `PRIMARY` (site_code, AsID)

### `tblapnttchild`

- Estimated rows: 1789
- Engine: InnoDB
- Created: Fri Apr 24 2026 14:27:51 GMT+0700 (Indochina Time)
- Updated: Mon May 04 2026 17:00:33 GMT+0700 (Indochina Time)

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `site_code` | char(4) | NO | NULL | PRI |  |
| 2 | `APID` | double | NO | NULL |  |  |
| 3 | `NumChild` | int | NO | NULL |  |  |
| 4 | `Age` | int | NO | NULL |  |  |
| 5 | `Sex` | int | NO | NULL |  |  |
| 6 | `Grou` | char(10) | NO | NULL |  |  |
| 7 | `House` | varchar(20) | NO | NULL |  |  |
| 8 | `Street` | varchar(20) | NO | NULL |  |  |
| 9 | `Village` | varchar(70) | NO | NULL |  |  |
| 10 | `Commune` | varchar(70) | NO | NULL |  |  |
| 11 | `District` | char(30) | NO | NULL |  |  |
| 12 | `Province` | char(30) | NO | NULL |  |  |
| 13 | `Phone` | char(12) | NO | NULL |  |  |
| 14 | `PlanChild` | int | YES | NULL |  |  |
| 15 | `PatientDate` | date | NO | NULL |  |  |
| 16 | `SeviceDate` | date | NO | NULL |  |  |
| 17 | `StatusHIV` | int | YES | NULL |  |  |
| 18 | `Result` | int | NO | NULL |  |  |
| 19 | `RegTreat` | int | YES | NULL |  |  |
| 20 | `ClinicID` | char(7) | NO | NULL |  |  |
| 21 | `ArtNumber` | char(10) | NO | NULL |  |  |
| 22 | `Other` | char(30) | NO | NULL |  |  |
| 23 | `CAPID` | double | NO | NULL | PRI |  |
| 24 | `AsID` | double | NO | NULL |  |  |
| 25 | `created_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |
| 26 | `updated_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED on update CURRENT_TIMESTAMP |
| 27 | `synced_at` | timestamp | YES | NULL |  |  |

#### Indexes

- UNIQUE `PRIMARY` (CAPID, site_code)

### `tblapnttchildcont`

- Estimated rows: 213
- Engine: InnoDB
- Created: Sun Nov 09 2025 11:31:48 GMT+0700 (Indochina Time)
- Updated: Mon May 04 2026 17:00:33 GMT+0700 (Indochina Time)

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `site_code` | char(4) | NO | NULL | PRI |  |
| 2 | `id` | int | NO | NULL | PRI |  |
| 3 | `Dat` | date | NO | NULL |  |  |
| 4 | `TypeContact` | int | NO | NULL |  |  |
| 5 | `Contact` | int | NO | NULL |  |  |
| 6 | `Confirm` | char(30) | NO | NULL |  |  |
| 7 | `CAPID` | double | NO | NULL |  |  |
| 8 | `created_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |
| 9 | `updated_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED on update CURRENT_TIMESTAMP |
| 10 | `synced_at` | timestamp | YES | NULL |  |  |

#### Indexes

- UNIQUE `PRIMARY` (id, site_code)

### `tblapnttpart`

- Estimated rows: 10494
- Engine: InnoDB
- Created: Fri Apr 24 2026 14:27:51 GMT+0700 (Indochina Time)
- Updated: Mon May 04 2026 17:00:33 GMT+0700 (Indochina Time)

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `site_code` | char(4) | NO | NULL | PRI |  |
| 2 | `AsID` | double | NO | NULL |  |  |
| 3 | `NumSexPart` | char(2) | YES | NULL |  |  |
| 4 | `NumPin` | char(2) | YES | NULL |  |  |
| 5 | `NumChildren` | char(2) | YES | NULL |  |  |
| 6 | `NumPart` | int | NO | NULL |  |  |
| 7 | `Age` | int | NO | NULL |  |  |
| 8 | `Sex` | int | NO | NULL |  |  |
| 9 | `Grou` | char(10) | NO | NULL |  |  |
| 10 | `House` | varchar(20) | NO | NULL |  |  |
| 11 | `Street` | varchar(20) | NO | NULL |  |  |
| 12 | `Village` | varchar(60) | NO | NULL |  |  |
| 13 | `Commune` | varchar(50) | NO | NULL |  |  |
| 14 | `District` | char(30) | NO | NULL |  |  |
| 15 | `Province` | char(30) | NO | NULL |  |  |
| 16 | `Phone` | char(12) | NO | NULL |  |  |
| 17 | `RePatient` | int | NO | NULL |  |  |
| 18 | `OtherPatient` | char(30) | NO | NULL |  |  |
| 19 | `IpvHit` | int | NO | NULL |  |  |
| 20 | `IpvThreat` | int | NO | NULL |  |  |
| 21 | `IpvSex` | int | NO | NULL |  |  |
| 22 | `ProIPV` | int | YES | NULL |  |  |
| 23 | `SupIPV` | int | YES | NULL |  |  |
| 24 | `RefIPV` | int | YES | NULL |  |  |
| 25 | `NotificationIPV` | int | YES | NULL |  |  |
| 26 | `PatientDate` | date | NO | NULL |  |  |
| 27 | `SeviceDate` | date | NO | NULL |  |  |
| 28 | `StatusHIV` | int | YES | NULL |  |  |
| 29 | `HTS` | int | NO | NULL |  |  |
| 30 | `Result` | int | NO | NULL |  |  |
| 31 | `RegTreat` | int | YES | NULL |  |  |
| 32 | `ClinicID` | int | NO | NULL |  |  |
| 33 | `ArtNumber` | char(10) | NO | NULL |  |  |
| 34 | `Other` | char(30) | NO | NULL |  |  |
| 35 | `APID` | double | NO | NULL | PRI |  |
| 36 | `created_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |
| 37 | `updated_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED on update CURRENT_TIMESTAMP |
| 38 | `synced_at` | timestamp | YES | NULL |  |  |

#### Indexes

- UNIQUE `PRIMARY` (APID, site_code)

### `tblapnttpartcont`

- Estimated rows: 828
- Engine: InnoDB
- Created: Sun Nov 09 2025 11:31:48 GMT+0700 (Indochina Time)
- Updated: Mon May 04 2026 17:00:33 GMT+0700 (Indochina Time)

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `site_code` | char(4) | NO | NULL | PRI |  |
| 2 | `id` | int | NO | NULL | PRI |  |
| 3 | `Dat` | date | NO | NULL |  |  |
| 4 | `TypeContact` | int | NO | NULL |  |  |
| 5 | `Contact` | int | NO | NULL |  |  |
| 6 | `Confirm` | char(30) | NO | NULL |  |  |
| 7 | `APID` | double | NO | NULL |  |  |
| 8 | `created_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |
| 9 | `updated_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED on update CURRENT_TIMESTAMP |
| 10 | `synced_at` | timestamp | YES | NULL |  |  |

#### Indexes

- UNIQUE `PRIMARY` (id, site_code)

### `tblappointment`

- Estimated rows: 4199563
- Engine: InnoDB
- Created: Sun Nov 09 2025 11:31:48 GMT+0700 (Indochina Time)
- Updated: Mon May 04 2026 17:00:34 GMT+0700 (Indochina Time)

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `site_code` | char(4) | NO | NULL | PRI |  |
| 2 | `Vid` | varchar(17) | NO | NULL | PRI |  |
| 3 | `Doctore` | int | NO | NULL |  |  |
| 4 | `Time` | int | NO | NULL |  |  |
| 5 | `Att` | int | NO | NULL |  |  |
| 6 | `created_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |
| 7 | `updated_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED on update CURRENT_TIMESTAMP |
| 8 | `synced_at` | timestamp | YES | NULL |  |  |

#### Indexes

- UNIQUE `PRIMARY` (Vid, site_code)

### `tblartsite`

- Estimated rows: 76
- Engine: InnoDB
- Created: Sun Nov 09 2025 11:31:48 GMT+0700 (Indochina Time)
- Updated: N/A

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `Sid` | varchar(4) | NO | NULL | PRI |  |
| 2 | `SiteName` | varchar(40) | NO | NULL |  |  |
| 3 | `Status` | int | NO | NULL |  |  |
| 4 | `created_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |
| 5 | `updated_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED on update CURRENT_TIMESTAMP |
| 6 | `synced_at` | timestamp | YES | NULL |  |  |

#### Indexes

- UNIQUE `PRIMARY` (Sid)

### `tblaumain`

- Estimated rows: 135772
- Engine: InnoDB
- Created: Sun Apr 26 2026 19:25:29 GMT+0700 (Indochina Time)
- Updated: Mon May 04 2026 17:00:34 GMT+0700 (Indochina Time)

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `site_code` | char(4) | NO | NULL | PRI |  |
| 2 | `ClinicID` | int | NO | NULL |  |  |
| 3 | `Daupdate` | date | NO | NULL |  |  |
| 4 | `Marital` | int | NO | NULL |  |  |
| 5 | `Occupation` | char(30) | NO | NULL |  |  |
| 6 | `HIVshow` | int | YES | NULL |  |  |
| 7 | `Relative` | char(6) | YES | NULL |  |  |
| 8 | `Family` | char(6) | YES | NULL |  |  |
| 9 | `Community` | char(6) | YES | NULL |  |  |
| 10 | `Grou` | char(10) | NO | NULL |  |  |
| 11 | `House` | varchar(20) | NO | NULL |  |  |
| 12 | `Street` | varchar(20) | NO | NULL |  |  |
| 13 | `Village` | varchar(70) | NO | NULL |  |  |
| 14 | `Commune` | varchar(70) | NO | NULL |  |  |
| 15 | `District` | char(40) | NO | NULL |  |  |
| 16 | `Province` | char(40) | NO | NULL |  |  |
| 17 | `Phone` | varchar(25) | NO | NULL |  |  |
| 18 | `AddCont1` | varchar(70) | NO | NULL |  |  |
| 19 | `Phone1` | varchar(25) | NO | NULL |  |  |
| 20 | `AddCont2` | varchar(70) | NO | NULL |  |  |
| 21 | `Phone2` | varchar(25) | NO | NULL |  |  |
| 22 | `NGO` | char(6) | NO | NULL |  |  |
| 23 | `NameNGO` | varchar(50) | NO | NULL |  |  |
| 24 | `AUID` | double | NO | NULL | PRI |  |
| 25 | `created_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |
| 26 | `updated_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED on update CURRENT_TIMESTAMP |
| 27 | `synced_at` | timestamp | YES | NULL |  |  |

#### Indexes

- INDEX `idx_tblaumain_site_synced_update_auid` (site_code, synced_at, Daupdate, AUID)
- UNIQUE `PRIMARY` (site_code, AUID)

### `tblavarvdrug`

- Estimated rows: 12481197
- Engine: InnoDB
- Created: Sun Apr 26 2026 13:29:08 GMT+0700 (Indochina Time)
- Updated: Mon May 04 2026 17:00:59 GMT+0700 (Indochina Time)

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `site_code` | char(4) | NO | NULL | PRI |  |
| 2 | `id` | int | NO | NULL | PRI |  |
| 3 | `DrugName` | char(16) | NO | NULL |  |  |
| 4 | `Dose` | char(20) | NO | NULL |  |  |
| 5 | `Quantity` | int | NO | NULL |  |  |
| 6 | `Freq` | char(5) | NO | NULL |  |  |
| 7 | `Form` | char(15) | NO | NULL |  |  |
| 8 | `Status` | int | NO | NULL |  |  |
| 9 | `Da` | date | NO | NULL |  |  |
| 10 | `Reason` | char(40) | NO | NULL |  |  |
| 11 | `Remark` | char(6) | NO | NULL |  |  |
| 12 | `Vid` | double | NO | NULL | MUL |  |
| 13 | `created_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |
| 14 | `updated_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED on update CURRENT_TIMESTAMP |
| 15 | `synced_at` | timestamp | YES | NULL |  |  |

#### Indexes

- INDEX `idx_tblavarvdrug_site_vid_status_drug` (site_code, Vid, Status, DrugName)
- INDEX `idx_tblavarvdrug_vid_status` (Vid, Status)
- INDEX `idx_tblavarvdrug_vid_status_drug` (Vid, Status, DrugName)
- UNIQUE `PRIMARY` (id, site_code)

### `tblavhydrug`

- Estimated rows: 4959
- Engine: InnoDB
- Created: Tue Feb 17 2026 05:00:40 GMT+0700 (Indochina Time)
- Updated: Mon May 04 2026 17:00:59 GMT+0700 (Indochina Time)

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `site_code` | char(4) | NO | NULL | PRI |  |
| 2 | `id` | int | NO | NULL | PRI |  |
| 3 | `DrugName` | char(16) | NO | NULL |  |  |
| 4 | `Dose` | char(20) | NO | NULL |  |  |
| 5 | `Quantity` | int | NO | NULL |  |  |
| 6 | `Freq` | char(5) | NO | NULL |  |  |
| 7 | `Form` | char(15) | NO | NULL |  |  |
| 8 | `Status` | int | NO | NULL |  |  |
| 9 | `Da` | date | NO | NULL |  |  |
| 10 | `Reason` | char(40) | NO | NULL |  |  |
| 11 | `Remark` | char(6) | NO | NULL |  |  |
| 12 | `Vid` | double | NO | NULL | MUL |  |
| 13 | `created_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |
| 14 | `updated_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED on update CURRENT_TIMESTAMP |
| 15 | `synced_at` | timestamp | YES | NULL |  |  |

#### Indexes

- INDEX `idx_tblavhydrug_vid_status_drug` (Vid, Status, DrugName)
- UNIQUE `PRIMARY` (id, site_code)

### `tblavmain`

- Estimated rows: 4529569
- Engine: InnoDB
- Created: Wed Apr 29 2026 17:13:20 GMT+0700 (Indochina Time)
- Updated: Mon May 04 2026 17:01:04 GMT+0700 (Indochina Time)

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `site_code` | char(4) | NO | NULL | PRI |  |
| 2 | `ClinicID` | int | NO | NULL | MUL |  |
| 3 | `ARTnum` | char(10) | NO | NULL |  |  |
| 4 | `DatVisit` | date | NO | NULL | MUL |  |
| 5 | `TypeVisit` | int | NO | NULL | MUL |  |
| 6 | `Womenstatus` | int | NO | NULL |  |  |
| 7 | `PregStatus` | int | NO | NULL |  |  |
| 8 | `DaPreg` | date | NO | NULL |  |  |
| 9 | `ANCservice` | int | YES | NULL |  |  |
| 10 | `Weight` | float | NO | NULL |  |  |
| 11 | `Height` | float | NO | NULL |  |  |
| 12 | `Temp` | float | NO | NULL |  |  |
| 13 | `Pulse` | int | NO | NULL |  |  |
| 14 | `Resp` | int | NO | NULL |  |  |
| 15 | `Blood` | char(7) | NO | NULL |  |  |
| 16 | `STIPreven` | char(6) | NO | NULL |  |  |
| 17 | `ARTAdher` | char(6) | NO | NULL |  |  |
| 18 | `Birthspac` | char(6) | NO | NULL |  |  |
| 19 | `TBinfect` | char(6) | NO | NULL |  |  |
| 20 | `Partner` | char(6) | NO | NULL |  |  |
| 21 | `Condoms` | char(6) | NO | NULL |  |  |
| 22 | `CMTypeClient` | int | NO | NULL |  |  |
| 23 | `CMDaUse` | date | NO | NULL |  |  |
| 24 | `CMCondom` | char(3) | NO | NULL |  |  |
| 25 | `CoC` | char(2) | NO | NULL |  |  |
| 26 | `Poc` | char(2) | NO | NULL |  |  |
| 27 | `CMVaccine` | char(2) | NO | NULL |  |  |
| 28 | `UseOther` | char(6) | NO | NULL |  |  |
| 29 | `OCMcondom` | char(3) | NO | NULL |  |  |
| 30 | `OCoc` | char(2) | NO | NULL |  |  |
| 31 | `OPoC` | char(2) | NO | NULL |  |  |
| 32 | `OCMVaccin` | char(2) | NO | NULL |  |  |
| 33 | `OCMother` | char(3) | NO | NULL |  |  |
| 34 | `Cough` | int | NO | NULL |  |  |
| 35 | `Fever` | int | NO | NULL |  |  |
| 36 | `Wlost` | int | NO | NULL |  |  |
| 37 | `Drenching` | int | NO | NULL |  |  |
| 38 | `Urine` | int | NO | NULL |  |  |
| 39 | `Genital` | int | NO | NULL |  |  |
| 40 | `Chemnah` | int | NO | NULL |  |  |
| 41 | `Hospital` | int | NO | NULL |  |  |
| 42 | `NumDay` | char(3) | NO | NULL |  |  |
| 43 | `CauseHospital` | char(30) | NO | NULL |  |  |
| 44 | `MissARV` | int | NO | NULL |  |  |
| 45 | `MissTime` | char(3) | NO | NULL |  |  |
| 46 | `WHO` | int | NO | NULL |  |  |
| 47 | `Eligible` | int | NO | NULL |  |  |
| 48 | `TestID` | char(15) | NO | NULL |  |  |
| 49 | `Function` | int | NO | NULL |  |  |
| 50 | `TB` | int | NO | NULL |  |  |
| 51 | `TypeTB` | int | NO | NULL |  |  |
| 52 | `TBtreat` | int | NO | NULL |  |  |
| 53 | `DaTBtreat` | date | NO | NULL |  |  |
| 54 | `TestHIV` | char(6) | NO | NULL |  |  |
| 55 | `ResultHIV` | int | NO | NULL |  |  |
| 56 | `ReCD4` | int | NO | NULL |  |  |
| 57 | `ReVL` | int | NO | NULL |  |  |
| 58 | `ReHCV` | int | NO | NULL |  |  |
| 59 | `CrAG` | char(6) | NO | NULL |  |  |
| 60 | `CrAGResult` | int | NO | NULL |  |  |
| 61 | `VLDetectable` | int | NO | NULL |  |  |
| 62 | `Referred` | int | NO | NULL |  |  |
| 63 | `OReferred` | char(30) | NO | NULL |  |  |
| 64 | `Moderate` | char(6) | NO | NULL |  |  |
| 65 | `Renal` | char(6) | NO | NULL |  |  |
| 66 | `Rash` | char(6) | NO | NULL |  |  |
| 67 | `Hepatitis` | char(6) | NO | NULL |  |  |
| 68 | `Peripheral` | char(6) | NO | NULL |  |  |
| 69 | `Neutropenia` | char(6) | NO | NULL |  |  |
| 70 | `Hyperlipidemia` | char(6) | NO | NULL |  |  |
| 71 | `Lactic` | char(6) | NO | NULL |  |  |
| 72 | `Hypersensitivity` | char(6) | NO | NULL |  |  |
| 73 | `Jaundice` | char(6) | NO | NULL |  |  |
| 74 | `MTother` | char(30) | NO | NULL |  |  |
| 75 | `ARVreg` | int | YES | NULL |  |  |
| 76 | `ResultHC` | int | NO | NULL |  |  |
| 77 | `TPTout` | int | YES | NULL |  |  |
| 78 | `TBout` | int | YES | NULL |  |  |
| 79 | `DaApp` | date | NO | NULL |  |  |
| 80 | `Vid` | double | NO | NULL | PRI |  |
| 81 | `Foworker` | int | NO | NULL |  |  |
| 82 | `Country` | int | NO | NULL |  |  |
| 83 | `created_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |
| 84 | `updated_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED on update CURRENT_TIMESTAMP |
| 85 | `synced_at` | timestamp | YES | NULL |  |  |

#### Indexes

- INDEX `idx_avmain_site_clinic_datvisit_vid` (site_code, ClinicID, DatVisit, Vid)
- INDEX `idx_avmain_site_clinic_typevisit_datvisit_vid` (site_code, ClinicID, TypeVisit, DatVisit, Vid)
- INDEX `idx_avmain_site_datvisit` (site_code, DatVisit, Vid, ClinicID)
- INDEX `idx_avmain_site_datvisit_vid` (site_code, DatVisit, Vid)
- INDEX `idx_avmain_site_typevisit_datvisit_vid` (site_code, TypeVisit, DatVisit, Vid)
- INDEX `idx_avmain_typevisit_site_datvisit_vid` (TypeVisit, site_code, DatVisit, Vid)
- INDEX `idx_tblavmain_clinic_testhiv_visit` (ClinicID, TestHIV, DatVisit)
- INDEX `idx_tblavmain_clinic_visit_app_vid` (ClinicID, DatVisit, DaApp, Vid)
- INDEX `idx_tblavmain_clinicid_datvisit` (ClinicID, DatVisit)
- INDEX `idx_tblavmain_datvisit_clinicid_vid` (DatVisit, ClinicID, Vid)
- INDEX `idx_tblavmain_site_clinic_datvisit` (site_code, ClinicID, DatVisit)
- INDEX `idx_tblavmain_site_clinicid` (site_code, ClinicID)
- INDEX `idx_tblavmain_site_datvisit` (site_code, DatVisit)
- INDEX `idx_tblavmain_site_datvisit_clinic` (site_code, DatVisit, ClinicID)
- INDEX `idx_tblavmain_site_synced_datvisit_vid` (site_code, synced_at, DatVisit, Vid)
- INDEX `idx_tblavmain_site_updated` (site_code, updated_at)
- INDEX `idx_tblavmain_site_vid` (site_code, Vid)
- INDEX `idx_tblavmain_vid_datvisit_clinicid` (Vid, DatVisit, ClinicID)
- UNIQUE `PRIMARY` (site_code, Vid)

### `tblavoidrug`

- Estimated rows: 1585510
- Engine: InnoDB
- Created: Tue Feb 17 2026 05:00:36 GMT+0700 (Indochina Time)
- Updated: Mon May 04 2026 17:01:04 GMT+0700 (Indochina Time)

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `site_code` | char(4) | NO | NULL | PRI |  |
| 2 | `id` | int | NO | NULL | PRI |  |
| 3 | `DrugName` | char(16) | NO | NULL |  |  |
| 4 | `Dose` | char(20) | NO | NULL |  |  |
| 5 | `Quantity` | int | NO | NULL |  |  |
| 6 | `Freq` | char(5) | NO | NULL |  |  |
| 7 | `Form` | char(15) | NO | NULL |  |  |
| 8 | `Status` | int | NO | NULL |  |  |
| 9 | `Da` | date | NO | NULL |  |  |
| 10 | `Reason` | char(40) | NO | NULL |  |  |
| 11 | `Remark` | char(6) | NO | NULL |  |  |
| 12 | `Vid` | double | NO | NULL | MUL |  |
| 13 | `created_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |
| 14 | `updated_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED on update CURRENT_TIMESTAMP |
| 15 | `synced_at` | timestamp | YES | NULL |  |  |

#### Indexes

- INDEX `idx_tblavoidrug_vid_status_drug` (Vid, Status, DrugName)
- UNIQUE `PRIMARY` (id, site_code)

### `tblavpatientstatus`

- Estimated rows: 78610
- Engine: InnoDB
- Created: Sun Apr 26 2026 13:27:45 GMT+0700 (Indochina Time)
- Updated: Mon May 04 2026 17:01:04 GMT+0700 (Indochina Time)

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `site_code` | char(4) | NO | NULL | PRI |  |
| 2 | `ClinicID` | int | NO | NULL | PRI |  |
| 3 | `Status` | int | NO | NULL | PRI |  |
| 4 | `Place` | int | NO | NULL |  |  |
| 5 | `OPlace` | varchar(50) | NO | NULL |  |  |
| 6 | `Da` | date | NO | NULL | MUL |  |
| 7 | `Cause` | char(50) | NO | NULL |  |  |
| 8 | `Vid` | double | NO | NULL |  |  |
| 9 | `created_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |
| 10 | `updated_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED on update CURRENT_TIMESTAMP |
| 11 | `synced_at` | timestamp | YES | NULL |  |  |

#### Indexes

- INDEX `idx_patientstatus_site_status_vid` (site_code, Status, Vid)
- INDEX `idx_patientstatus_site_vid` (site_code, Vid)
- INDEX `idx_patientstatus_status_site_vid` (Status, site_code, Vid)
- INDEX `idx_tblavpatientstatus_clinicid_da_status` (ClinicID, Da, Status)
- INDEX `idx_tblavpatientstatus_da_clinicid_status` (Da, ClinicID, Status)
- INDEX `idx_tblavpatientstatus_site_da_clinic_status` (site_code, Da, ClinicID, Status)
- INDEX `idx_tblavpatientstatus_site_status` (site_code, Status)
- INDEX `idx_tblavpatientstatus_site_vid` (site_code, Vid)
- INDEX `idx_tblavpatientstatus_site_vid_status` (site_code, Vid, Status)
- UNIQUE `PRIMARY` (site_code, ClinicID, Status)

### `tblavtbdrug`

- Estimated rows: 42130
- Engine: InnoDB
- Created: Tue Feb 17 2026 05:00:40 GMT+0700 (Indochina Time)
- Updated: Mon May 04 2026 17:01:04 GMT+0700 (Indochina Time)

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `site_code` | char(4) | NO | NULL | PRI |  |
| 2 | `id` | int | NO | NULL | PRI |  |
| 3 | `DrugName` | char(16) | NO | NULL |  |  |
| 4 | `Dose` | char(20) | NO | NULL |  |  |
| 5 | `Quantity` | int | NO | NULL |  |  |
| 6 | `Freq` | char(5) | NO | NULL |  |  |
| 7 | `Form` | char(15) | NO | NULL |  |  |
| 8 | `Status` | int | NO | NULL |  |  |
| 9 | `Da` | date | NO | NULL |  |  |
| 10 | `Reason` | char(40) | NO | NULL |  |  |
| 11 | `Remark` | char(6) | NO | NULL |  |  |
| 12 | `Vid` | double | NO | NULL | MUL |  |
| 13 | `created_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |
| 14 | `updated_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED on update CURRENT_TIMESTAMP |
| 15 | `synced_at` | timestamp | YES | NULL |  |  |

#### Indexes

- INDEX `idx_tblavtbdrug_vid_status_drug` (Vid, Status, DrugName)
- UNIQUE `PRIMARY` (id, site_code)

### `tblavtptdrug`

- Estimated rows: 464856
- Engine: InnoDB
- Created: Sun Apr 26 2026 13:29:05 GMT+0700 (Indochina Time)
- Updated: Mon May 04 2026 17:01:04 GMT+0700 (Indochina Time)

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `site_code` | char(4) | NO | NULL | PRI |  |
| 2 | `id` | int | NO | NULL | PRI |  |
| 3 | `DrugName` | char(10) | NO | NULL |  |  |
| 4 | `Dose` | char(10) | NO | NULL |  |  |
| 5 | `Quantity` | int | NO | NULL |  |  |
| 6 | `Freq` | char(5) | NO | NULL |  |  |
| 7 | `Form` | char(15) | NO | NULL |  |  |
| 8 | `Status` | int | NO | NULL |  |  |
| 9 | `Da` | date | NO | NULL |  |  |
| 10 | `Reason` | char(40) | NO | NULL |  |  |
| 11 | `Remark` | char(6) | NO | NULL |  |  |
| 12 | `Vid` | double | NO | NULL | MUL |  |
| 13 | `created_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |
| 14 | `updated_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED on update CURRENT_TIMESTAMP |
| 15 | `synced_at` | timestamp | YES | NULL |  |  |

#### Indexes

- INDEX `idx_tblavtptdrug_vid_status_da_drug` (Vid, Status, Da, DrugName)
- INDEX `idx_tblavtptdrug_vid_status_drug` (Vid, Status, DrugName)
- UNIQUE `PRIMARY` (id, site_code)

### `tblbackupetest`

- Estimated rows: 576
- Engine: InnoDB
- Created: Sun Nov 09 2025 11:31:49 GMT+0700 (Indochina Time)
- Updated: N/A

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `ClinicID` | char(9) | NO | NULL |  |  |
| 2 | `PCR` | char(6) | NO | NULL |  |  |
| 3 | `ConfirmPCR` | char(6) | NO | NULL |  |  |
| 4 | `OI` | char(6) | NO | NULL |  |  |
| 5 | `TestConfirm` | char(6) | NO | NULL |  |  |
| 6 | `DaBlood` | date | NO | NULL |  |  |
| 7 | `LabID` | char(10) | NO | NULL |  |  |
| 8 | `DaReceive` | date | NO | NULL |  |  |
| 9 | `DaAnalys` | date | NO | NULL |  |  |
| 10 | `Result` | int | NO | NULL |  |  |
| 11 | `DaRresult` | date | NO | NULL |  |  |
| 12 | `DBS` | char(6) | NO | NULL |  |  |
| 13 | `Technic` | char(6) | NO | NULL |  |  |
| 14 | `ResultIn` | char(6) | NO | NULL |  |  |
| 15 | `Other` | char(30) | NO | NULL |  |  |
| 16 | `TID` | char(17) | NO | NULL |  |  |
| 17 | `created_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |
| 18 | `updated_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED on update CURRENT_TIMESTAMP |
| 19 | `synced_at` | timestamp | YES | NULL |  |  |

### `tblcart`

- Estimated rows: 8018
- Engine: InnoDB
- Created: Wed Apr 29 2026 17:13:47 GMT+0700 (Indochina Time)
- Updated: Mon May 04 2026 12:43:40 GMT+0700 (Indochina Time)

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `site_code` | char(4) | NO | NULL | PRI |  |
| 2 | `ClinicID` | char(7) | NO | NULL | PRI |  |
| 3 | `ART` | char(11) | NO | NULL |  |  |
| 4 | `DaArt` | date | NO | NULL | MUL |  |
| 5 | `created_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |
| 6 | `updated_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED on update CURRENT_TIMESTAMP |
| 7 | `synced_at` | timestamp | YES | NULL |  |  |

#### Indexes

- INDEX `idx_tblcart_clinic_daart_art` (ClinicID, DaArt, ART)
- INDEX `idx_tblcart_clinicid_daart` (ClinicID, DaArt)
- INDEX `idx_tblcart_daart_clinicid` (DaArt, ClinicID)
- INDEX `idx_tblcart_site_clinicid` (site_code, ClinicID)
- INDEX `idx_tblcart_site_daart_clinic` (site_code, DaArt, ClinicID)
- UNIQUE `PRIMARY` (site_code, ClinicID)

### `tblcausedeath`

- Estimated rows: 0
- Engine: InnoDB
- Created: Sun Nov 09 2025 11:31:49 GMT+0700 (Indochina Time)
- Updated: N/A

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `site_code` | char(4) | NO | NULL | PRI |  |
| 2 | `id` | int | NO | NULL | PRI |  |
| 3 | `Ctype` | int | NO | NULL |  |  |
| 4 | `Cause` | varchar(65) | NO | NULL |  |  |
| 5 | `Status` | int | NO | NULL |  |  |
| 6 | `created_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |
| 7 | `updated_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED on update CURRENT_TIMESTAMP |
| 8 | `synced_at` | timestamp | YES | NULL |  |  |

#### Indexes

- UNIQUE `PRIMARY` (id, site_code)

### `tblciallergy`

- Estimated rows: 10
- Engine: InnoDB
- Created: Sun Nov 09 2025 11:31:49 GMT+0700 (Indochina Time)
- Updated: Mon May 04 2026 12:13:34 GMT+0700 (Indochina Time)

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `site_code` | char(4) | NO | NULL | PRI |  |
| 2 | `id` | int | NO | NULL | PRI |  |
| 3 | `ClinicID` | char(7) | NO | NULL |  |  |
| 4 | `DrugName` | char(5) | NO | NULL |  |  |
| 5 | `Allergy` | char(10) | NO | NULL |  |  |
| 6 | `created_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |
| 7 | `updated_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED on update CURRENT_TIMESTAMP |
| 8 | `synced_at` | timestamp | YES | NULL |  |  |

#### Indexes

- UNIQUE `PRIMARY` (id, site_code)

### `tblcicotrim`

- Estimated rows: 1123
- Engine: InnoDB
- Created: Sun Nov 09 2025 11:31:49 GMT+0700 (Indochina Time)
- Updated: Mon May 04 2026 12:43:40 GMT+0700 (Indochina Time)

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `site_code` | char(4) | NO | NULL | PRI |  |
| 2 | `id` | int | NO | NULL | PRI |  |
| 3 | `ClinicID` | char(10) | NO | NULL |  |  |
| 4 | `ClinicName` | char(20) | NO | NULL |  |  |
| 5 | `StartDate` | date | NO | NULL |  |  |
| 6 | `StopDate` | date | NO | NULL |  |  |
| 7 | `ReasonStop` | char(30) | NO | NULL |  |  |
| 8 | `created_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |
| 9 | `updated_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED on update CURRENT_TIMESTAMP |
| 10 | `synced_at` | timestamp | YES | NULL |  |  |

#### Indexes

- UNIQUE `PRIMARY` (id, site_code)

### `tblcifamily`

- Estimated rows: 16510
- Engine: InnoDB
- Created: Sun Nov 09 2025 11:31:49 GMT+0700 (Indochina Time)
- Updated: Mon May 04 2026 12:43:40 GMT+0700 (Indochina Time)

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `site_code` | char(4) | NO | NULL | PRI |  |
| 2 | `id` | int | NO | NULL | PRI |  |
| 3 | `ClinicID` | char(7) | NO | NULL |  |  |
| 4 | `Faminily` | int | NO | NULL |  |  |
| 5 | `Age` | int | NO | NULL |  |  |
| 6 | `HIVstatus` | int | NO | NULL |  |  |
| 7 | `Status` | int | NO | NULL |  |  |
| 8 | `StartARV` | int | NO | NULL |  |  |
| 9 | `Pregnant` | int | NO | NULL |  |  |
| 10 | `SiteName` | char(4) | NO | NULL |  |  |
| 11 | `HTB` | int | NO | NULL |  |  |
| 12 | `created_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |
| 13 | `updated_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED on update CURRENT_TIMESTAMP |
| 14 | `synced_at` | timestamp | YES | NULL |  |  |

#### Indexes

- UNIQUE `PRIMARY` (id, site_code)

### `tblcifluconazole`

- Estimated rows: 189
- Engine: InnoDB
- Created: Sun Nov 09 2025 11:31:49 GMT+0700 (Indochina Time)
- Updated: Mon May 04 2026 12:43:40 GMT+0700 (Indochina Time)

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `site_code` | char(4) | NO | NULL | PRI |  |
| 2 | `id` | int | NO | NULL | PRI |  |
| 3 | `ClinicID` | char(10) | NO | NULL |  |  |
| 4 | `ClinicName` | char(20) | NO | NULL |  |  |
| 5 | `StartDate` | date | NO | NULL |  |  |
| 6 | `StopDate` | date | NO | NULL |  |  |
| 7 | `ReasonStop` | char(30) | NO | NULL |  |  |
| 8 | `created_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |
| 9 | `updated_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED on update CURRENT_TIMESTAMP |
| 10 | `synced_at` | timestamp | YES | NULL |  |  |

#### Indexes

- UNIQUE `PRIMARY` (id, site_code)

### `tblcimain`

- Estimated rows: 10172
- Engine: InnoDB
- Created: Mon Apr 27 2026 10:26:41 GMT+0700 (Indochina Time)
- Updated: Mon May 04 2026 12:43:41 GMT+0700 (Indochina Time)

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `site_code` | char(4) | NO | NULL | PRI |  |
| 2 | `ClinicID` | char(7) | NO | NULL | PRI |  |
| 3 | `DaFirstVisit` | date | NO | NULL | MUL |  |
| 4 | `LClinicID` | char(7) | NO | NULL |  |  |
| 5 | `DaBirth` | date | NO | NULL |  |  |
| 6 | `Sex` | int | NO | NULL |  |  |
| 7 | `Referred` | int | NO | NULL |  |  |
| 8 | `Oreferred` | varchar(50) | NO | NULL |  |  |
| 9 | `EClinicID` | char(9) | NO | NULL |  |  |
| 10 | `DaTest` | date | NO | NULL |  |  |
| 11 | `TypeTest` | int | NO | NULL |  |  |
| 12 | `Vcctcode` | char(6) | NO | NULL |  |  |
| 13 | `VcctID` | char(9) | NO | NULL |  |  |
| 14 | `OffIn` | int | NO | NULL |  |  |
| 15 | `SiteName` | char(4) | NO | NULL |  |  |
| 16 | `DaART` | date | NO | NULL |  |  |
| 17 | `Artnum` | char(10) | NO | NULL |  |  |
| 18 | `Feeding` | int | NO | NULL |  |  |
| 19 | `TbPast` | int | NO | NULL |  |  |
| 20 | `TypeTB` | int | NO | NULL |  |  |
| 21 | `ResultTB` | int | NO | NULL |  |  |
| 22 | `Daonset` | date | NO | NULL |  |  |
| 23 | `Tbtreat` | int | NO | NULL |  |  |
| 24 | `Datreat` | date | NO | NULL |  |  |
| 25 | `ResultTreat` | int | NO | NULL |  |  |
| 26 | `DaResultTreat` | date | NO | NULL |  |  |
| 27 | `Inh` | int | NO | NULL |  |  |
| 28 | `TPTdrug` | int | NO | NULL |  |  |
| 29 | `DaStartTPT` | date | YES | NULL |  |  |
| 30 | `DaEndTPT` | date | YES | NULL |  |  |
| 31 | `OtherPast` | int | NO | NULL |  |  |
| 32 | `Cotrim` | int | NO | NULL |  |  |
| 33 | `Fluco` | int | NO | NULL |  |  |
| 34 | `Allergy` | int | NO | NULL |  |  |
| 35 | `ClinicIDold` | char(7) | YES | NULL |  |  |
| 36 | `SiteNameOld` | char(4) | YES | NULL |  |  |
| 37 | `Nationality` | int | YES | NULL |  |  |
| 38 | `created_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |
| 39 | `updated_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED on update CURRENT_TIMESTAMP |
| 40 | `synced_at` | timestamp | YES | NULL |  |  |

#### Indexes

- INDEX `idx_tblcimain_dafirstvisit_clinicid` (DaFirstVisit, ClinicID)
- INDEX `idx_tblcimain_site_clinicid` (site_code, ClinicID)
- INDEX `idx_tblcimain_site_first_clinic` (site_code, DaFirstVisit, ClinicID)
- INDEX `idx_tblcimain_site_synced_first_clinic` (site_code, synced_at, DaFirstVisit, ClinicID)
- UNIQUE `PRIMARY` (site_code, ClinicID)

### `tblciothpast`

- Estimated rows: 2228
- Engine: InnoDB
- Created: Sun Nov 09 2025 11:31:49 GMT+0700 (Indochina Time)
- Updated: Mon May 04 2026 12:43:41 GMT+0700 (Indochina Time)

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `site_code` | char(4) | NO | NULL | PRI |  |
| 2 | `id` | int | NO | NULL | PRI |  |
| 3 | `ClinicID` | char(7) | NO | NULL |  |  |
| 4 | `DrugName` | char(10) | NO | NULL |  |  |
| 5 | `Clinic` | char(25) | NO | NULL |  |  |
| 6 | `DaStart` | date | NO | NULL |  |  |
| 7 | `DaStop` | date | NO | NULL |  |  |
| 8 | `Note` | char(20) | NO | NULL |  |  |
| 9 | `created_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |
| 10 | `updated_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED on update CURRENT_TIMESTAMP |
| 11 | `synced_at` | timestamp | YES | NULL |  |  |

#### Indexes

- UNIQUE `PRIMARY` (id, site_code)

### `tblclinic`

- Estimated rows: 5
- Engine: InnoDB
- Created: Sun Nov 09 2025 11:31:49 GMT+0700 (Indochina Time)
- Updated: N/A

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `Cid` | int | NO | NULL | PRI | auto_increment |
| 2 | `ClinicName` | char(20) | NO | NULL |  |  |
| 3 | `created_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |
| 4 | `updated_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED on update CURRENT_TIMESTAMP |
| 5 | `synced_at` | timestamp | YES | NULL |  |  |

#### Indexes

- UNIQUE `PRIMARY` (Cid)

### `tblclink`

- Estimated rows: 1912
- Engine: InnoDB
- Created: Mon Apr 06 2026 09:51:02 GMT+0700 (Indochina Time)
- Updated: Mon May 04 2026 12:18:05 GMT+0700 (Indochina Time)

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `site_code` | char(4) | NO | NULL | PRI |  |
| 2 | `ClinicID` | char(7) | NO | NULL | PRI |  |
| 3 | `Codes` | varchar(20) | NO | NULL | PRI |  |
| 4 | `Typecode` | char(15) | NO | NULL | PRI |  |
| 5 | `ARTIss` | int | NO | NULL |  |  |
| 6 | `DaExpiry` | date | NO | NULL |  |  |
| 7 | `Dacreate` | datetime | NO | NULL |  |  |
| 8 | `created_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |
| 9 | `updated_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED on update CURRENT_TIMESTAMP |
| 10 | `synced_at` | timestamp | YES | NULL |  |  |

#### Indexes

- UNIQUE `PRIMARY` (ClinicID, Codes, Typecode, site_code)

### `tblcommune`

- Estimated rows: 1651
- Engine: InnoDB
- Created: Mon Feb 02 2026 17:14:26 GMT+0700 (Indochina Time)
- Updated: N/A

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `id` | int | NO | NULL | PRI |  |
| 2 | `commune_en` | varchar(50) | NO | NULL |  |  |
| 3 | `commune_kh` | varchar(50) | YES | NULL |  |  |
| 4 | `district_id` | int | NO | NULL |  |  |
| 5 | `created_at` | timestamp | YES | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |
| 6 | `updated_at` | timestamp | YES | NULL |  | on update CURRENT_TIMESTAMP |
| 7 | `_Cid` | int | YES | NULL |  |  |
| 8 | `_Did` | int | YES | NULL |  |  |

#### Indexes

- UNIQUE `PRIMARY` (id)

### `tblcumain`

- Estimated rows: 8662
- Engine: InnoDB
- Created: Sun Apr 26 2026 13:27:44 GMT+0700 (Indochina Time)
- Updated: Mon May 04 2026 12:43:41 GMT+0700 (Indochina Time)

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `site_code` | char(4) | NO | NULL | PRI |  |
| 2 | `ClinicID` | char(7) | NO | NULL |  |  |
| 3 | `Daupdate` | date | NO | NULL |  |  |
| 4 | `AddGuardian` | int | NO | NULL |  |  |
| 5 | `Grou` | char(10) | NO | NULL |  |  |
| 6 | `House` | varchar(20) | NO | NULL |  |  |
| 7 | `Street` | varchar(20) | NO | NULL |  |  |
| 8 | `Village` | varchar(70) | NO | NULL |  |  |
| 9 | `Commune` | varchar(70) | NO | NULL |  |  |
| 10 | `District` | char(25) | NO | NULL |  |  |
| 11 | `Province` | char(25) | NO | NULL |  |  |
| 12 | `AddContact` | char(30) | NO | NULL |  |  |
| 13 | `Phone` | char(12) | NO | NULL |  |  |
| 14 | `ChildStatus` | int | NO | NULL |  |  |
| 15 | `Foccupation` | int | NO | NULL |  |  |
| 16 | `Moccupation` | int | NO | NULL |  |  |
| 17 | `Education` | int | NO | NULL |  |  |
| 18 | `ChildSupport` | char(30) | NO | NULL |  |  |
| 19 | `Vaccine` | int | NO | NULL |  |  |
| 20 | `CUID` | char(15) | NO | NULL | PRI |  |
| 21 | `created_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |
| 22 | `updated_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED on update CURRENT_TIMESTAMP |
| 23 | `synced_at` | timestamp | YES | NULL |  |  |

#### Indexes

- INDEX `idx_tblcumain_site_synced_update_cuid` (site_code, synced_at, Daupdate, CUID)
- UNIQUE `PRIMARY` (CUID, site_code)

### `tblcvarvdrug`

- Estimated rows: 936484
- Engine: InnoDB
- Created: Sun Apr 26 2026 13:30:06 GMT+0700 (Indochina Time)
- Updated: Mon May 04 2026 12:43:43 GMT+0700 (Indochina Time)

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `site_code` | char(4) | NO | NULL | PRI |  |
| 2 | `id` | int | NO | NULL | PRI |  |
| 3 | `DrugName` | char(16) | NO | NULL |  |  |
| 4 | `Dose` | char(20) | NO | NULL |  |  |
| 5 | `Quantity` | int | NO | NULL |  |  |
| 6 | `Freq` | char(5) | NO | NULL |  |  |
| 7 | `Form` | char(15) | NO | NULL |  |  |
| 8 | `Status` | int | NO | NULL |  |  |
| 9 | `Da` | date | NO | NULL |  |  |
| 10 | `Reason` | char(40) | NO | NULL |  |  |
| 11 | `Remark` | char(6) | NO | NULL |  |  |
| 12 | `Vid` | char(15) | NO | NULL | MUL |  |
| 13 | `created_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |
| 14 | `updated_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED on update CURRENT_TIMESTAMP |
| 15 | `synced_at` | timestamp | YES | NULL |  |  |

#### Indexes

- INDEX `idx_tblcvarvdrug_site_vid_status_drug` (site_code, Vid, Status, DrugName)
- INDEX `idx_tblcvarvdrug_vid_status` (Vid, Status)
- INDEX `idx_tblcvarvdrug_vid_status_drug` (Vid, Status, DrugName)
- UNIQUE `PRIMARY` (id, site_code)

### `tblcvmain`

- Estimated rows: 406535
- Engine: InnoDB
- Created: Wed Apr 29 2026 17:13:44 GMT+0700 (Indochina Time)
- Updated: Mon May 04 2026 12:43:41 GMT+0700 (Indochina Time)

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `site_code` | char(4) | NO | NULL | PRI |  |
| 2 | `ClinicID` | char(7) | NO | NULL | MUL |  |
| 3 | `ARTnum` | char(10) | NO | NULL |  |  |
| 4 | `DatVisit` | date | NO | NULL | MUL |  |
| 5 | `TypeVisit` | int | NO | NULL |  |  |
| 6 | `Temp` | float | NO | NULL |  |  |
| 7 | `Pulse` | float | NO | NULL |  |  |
| 8 | `Resp` | float | NO | NULL |  |  |
| 9 | `Blood` | char(7) | NO | NULL |  |  |
| 10 | `Weight` | float | NO | NULL |  |  |
| 11 | `Height` | float | NO | NULL |  |  |
| 12 | `Malnutrition` | int | NO | NULL |  |  |
| 13 | `WH` | int | NO | NULL |  |  |
| 14 | `PTB` | int | NO | NULL |  |  |
| 15 | `Wlost` | int | NO | NULL |  |  |
| 16 | `Cough` | int | NO | NULL |  |  |
| 17 | `Fever` | int | NO | NULL |  |  |
| 18 | `Enlarg` | int | NO | NULL |  |  |
| 19 | `Hospital` | int | NO | NULL |  |  |
| 20 | `NumDay` | int | NO | NULL |  |  |
| 21 | `CauseHospital` | char(30) | NO | NULL |  |  |
| 22 | `Miss1` | int | NO | NULL |  |  |
| 23 | `Miss1Time` | int | NO | NULL |  |  |
| 24 | `Miss3` | int | NO | NULL |  |  |
| 25 | `Miss3Time` | int | NO | NULL |  |  |
| 26 | `Function` | int | NO | NULL |  |  |
| 27 | `WHO` | int | NO | NULL |  |  |
| 28 | `Eligible` | int | NO | NULL |  |  |
| 29 | `Treatfail` | int | NO | NULL |  |  |
| 30 | `TypeFail` | int | NO | NULL |  |  |
| 31 | `TB` | int | NO | NULL |  |  |
| 32 | `TypeTB` | int | NO | NULL |  |  |
| 33 | `TBtreat` | int | NO | NULL |  |  |
| 34 | `DaTBtreat` | date | NO | NULL |  |  |
| 35 | `TestID` | char(15) | NO | NULL |  |  |
| 36 | `TestHIV` | char(6) | NO | NULL |  |  |
| 37 | `ResultHIV` | int | NO | NULL |  |  |
| 38 | `ReCD4` | int | NO | NULL |  |  |
| 39 | `ReVL` | int | NO | NULL |  |  |
| 40 | `CrAG` | char(6) | NO | NULL |  |  |
| 41 | `CrAGResult` | int | NO | NULL |  |  |
| 42 | `VLDetectable` | int | NO | NULL |  |  |
| 43 | `Referred` | int | NO | NULL |  |  |
| 44 | `OReferred` | char(30) | NO | NULL |  |  |
| 45 | `DaApp` | date | NO | NULL |  |  |
| 46 | `Vid` | char(15) | NO | NULL | PRI |  |
| 47 | `TPTout` | int | YES | NULL |  |  |
| 48 | `created_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |
| 49 | `updated_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED on update CURRENT_TIMESTAMP |
| 50 | `synced_at` | timestamp | YES | NULL |  |  |

#### Indexes

- INDEX `idx_tblcvmain_clinic_testhiv_visit` (ClinicID, TestHIV, DatVisit)
- INDEX `idx_tblcvmain_clinic_visit_app_vid` (ClinicID, DatVisit, DaApp, Vid)
- INDEX `idx_tblcvmain_clinicid_datvisit` (ClinicID, DatVisit)
- INDEX `idx_tblcvmain_datvisit_clinicid_vid` (DatVisit, ClinicID, Vid)
- INDEX `idx_tblcvmain_site_clinicid` (site_code, ClinicID)
- INDEX `idx_tblcvmain_site_datvisit_clinic` (site_code, DatVisit, ClinicID)
- INDEX `idx_tblcvmain_site_synced_datvisit_vid` (site_code, synced_at, DatVisit, Vid)
- INDEX `idx_tblcvmain_site_vid` (site_code, Vid)
- INDEX `idx_tblcvmain_vid_datvisit_clinicid` (Vid, DatVisit, ClinicID)
- UNIQUE `PRIMARY` (site_code, Vid)

### `tblcvoidrug`

- Estimated rows: 160731
- Engine: InnoDB
- Created: Wed Apr 15 2026 12:36:41 GMT+0700 (Indochina Time)
- Updated: Mon May 04 2026 12:43:43 GMT+0700 (Indochina Time)

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `site_code` | char(4) | NO | NULL | PRI |  |
| 2 | `id` | int | NO | NULL | PRI |  |
| 3 | `DrugName` | char(16) | NO | NULL |  |  |
| 4 | `Dose` | char(20) | NO | NULL |  |  |
| 5 | `Quantity` | int | NO | NULL |  |  |
| 6 | `Freq` | char(5) | NO | NULL |  |  |
| 7 | `Form` | char(15) | NO | NULL |  |  |
| 8 | `Status` | int | NO | NULL |  |  |
| 9 | `Da` | date | NO | NULL |  |  |
| 10 | `Reason` | char(40) | NO | NULL |  |  |
| 11 | `Remark` | varchar(30) | NO | NULL |  |  |
| 12 | `Vid` | char(15) | NO | NULL | MUL |  |
| 13 | `created_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |
| 14 | `updated_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED on update CURRENT_TIMESTAMP |
| 15 | `synced_at` | timestamp | YES | NULL |  |  |

#### Indexes

- INDEX `idx_tblcvoidrug_vid_status_drug` (Vid, Status, DrugName)
- UNIQUE `PRIMARY` (id, site_code)

### `tblcvpatientstatus`

- Estimated rows: 10138
- Engine: InnoDB
- Created: Sun Apr 26 2026 13:27:45 GMT+0700 (Indochina Time)
- Updated: Mon May 04 2026 12:43:43 GMT+0700 (Indochina Time)

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `site_code` | char(4) | NO | NULL | PRI |  |
| 2 | `ClinicID` | char(7) | NO | NULL | PRI |  |
| 3 | `Status` | int | NO | NULL | PRI |  |
| 4 | `Place` | int | NO | NULL |  |  |
| 5 | `OPlace` | char(20) | NO | NULL |  |  |
| 6 | `Da` | date | NO | NULL | MUL |  |
| 7 | `Cause` | char(50) | NO | NULL |  |  |
| 8 | `Vid` | char(15) | NO | NULL |  |  |
| 9 | `created_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |
| 10 | `updated_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED on update CURRENT_TIMESTAMP |
| 11 | `synced_at` | timestamp | YES | NULL |  |  |

#### Indexes

- INDEX `idx_tblcvpatientstatus_clinicid_da_status` (ClinicID, Da, Status)
- INDEX `idx_tblcvpatientstatus_da_clinicid_status` (Da, ClinicID, Status)
- INDEX `idx_tblcvpatientstatus_site_da_clinic_status` (site_code, Da, ClinicID, Status)
- INDEX `idx_tblcvpatientstatus_site_status` (site_code, Status)
- INDEX `idx_tblcvpatientstatus_site_vid_status` (site_code, Vid, Status)
- UNIQUE `PRIMARY` (site_code, ClinicID, Status)

### `tblcvtbdrug`

- Estimated rows: 1226
- Engine: InnoDB
- Created: Sat Nov 15 2025 03:33:12 GMT+0700 (Indochina Time)
- Updated: Mon May 04 2026 12:43:43 GMT+0700 (Indochina Time)

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `site_code` | char(4) | NO | NULL | PRI |  |
| 2 | `id` | int | NO | NULL | PRI |  |
| 3 | `DrugName` | char(16) | NO | NULL |  |  |
| 4 | `Dose` | char(20) | NO | NULL |  |  |
| 5 | `Quantity` | int | NO | NULL |  |  |
| 6 | `Freq` | char(5) | NO | NULL |  |  |
| 7 | `Form` | char(15) | NO | NULL |  |  |
| 8 | `Status` | int | NO | NULL |  |  |
| 9 | `Da` | date | NO | NULL |  |  |
| 10 | `Reason` | char(40) | NO | NULL |  |  |
| 11 | `Remark` | char(6) | NO | NULL |  |  |
| 12 | `Vid` | char(15) | NO | NULL |  |  |
| 13 | `created_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |
| 14 | `updated_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED on update CURRENT_TIMESTAMP |
| 15 | `synced_at` | timestamp | YES | NULL |  |  |

#### Indexes

- UNIQUE `PRIMARY` (id, site_code)

### `tblcvtptdrug`

- Estimated rows: 9922
- Engine: InnoDB
- Created: Sun Apr 26 2026 13:29:08 GMT+0700 (Indochina Time)
- Updated: Mon May 04 2026 12:43:43 GMT+0700 (Indochina Time)

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `site_code` | char(4) | NO | NULL | PRI |  |
| 2 | `id` | int | NO | NULL | PRI |  |
| 3 | `DrugName` | char(10) | NO | NULL |  |  |
| 4 | `Dose` | char(10) | NO | NULL |  |  |
| 5 | `Quantity` | int | NO | NULL |  |  |
| 6 | `Freq` | char(5) | NO | NULL |  |  |
| 7 | `Form` | char(15) | NO | NULL |  |  |
| 8 | `Status` | int | NO | NULL |  |  |
| 9 | `Da` | date | NO | NULL |  |  |
| 10 | `Reason` | char(40) | NO | NULL |  |  |
| 11 | `Remark` | char(6) | NO | NULL |  |  |
| 12 | `Vid` | char(15) | NO | NULL | MUL |  |
| 13 | `created_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |
| 14 | `updated_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED on update CURRENT_TIMESTAMP |
| 15 | `synced_at` | timestamp | YES | NULL |  |  |

#### Indexes

- INDEX `idx_tblcvtptdrug_vid_status_da_drug` (Vid, Status, Da, DrugName)
- INDEX `idx_tblcvtptdrug_vid_status_drug` (Vid, Status, DrugName)
- UNIQUE `PRIMARY` (id, site_code)

### `tbldistrict`

- Estimated rows: 203
- Engine: InnoDB
- Created: Mon Feb 02 2026 17:14:44 GMT+0700 (Indochina Time)
- Updated: N/A

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `id` | int | NO | NULL | PRI |  |
| 2 | `district_en` | varchar(30) | NO | NULL |  |  |
| 3 | `district_kh` | varchar(35) | NO | NULL |  |  |
| 4 | `province_id` | int | NO | NULL |  |  |
| 5 | `created_at` | timestamp | YES | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |
| 6 | `updated_at` | timestamp | YES | NULL |  | on update CURRENT_TIMESTAMP |
| 7 | `_Did` | int | YES | NULL |  |  |

#### Indexes

- UNIQUE `PRIMARY` (id)

### `tbldoctor`

- Estimated rows: 3010
- Engine: InnoDB
- Created: Sun Apr 26 2026 17:29:17 GMT+0700 (Indochina Time)
- Updated: Mon May 04 2026 17:01:05 GMT+0700 (Indochina Time)

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `site_code` | char(4) | NO | NULL | PRI |  |
| 2 | `Did` | int | NO | NULL | PRI | auto_increment |
| 3 | `Name` | varchar(40) | NO | NULL | PRI |  |
| 4 | `Status` | int | NO | NULL | PRI |  |
| 5 | `created_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |
| 6 | `updated_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED on update CURRENT_TIMESTAMP |
| 7 | `synced_at` | timestamp | YES | NULL |  |  |

#### Indexes

- UNIQUE `PRIMARY` (Did, Name, Status, site_code)

### `tbldrug`

- Estimated rows: 36
- Engine: InnoDB
- Created: Sun Nov 09 2025 11:31:50 GMT+0700 (Indochina Time)
- Updated: N/A

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `Did` | int | NO | NULL | PRI | auto_increment |
| 2 | `DrugName` | varchar(20) | NO | NULL |  |  |
| 3 | `TypeDrug` | int | NO | NULL |  |  |
| 4 | `Status` | int | NO | NULL |  |  |
| 5 | `Detail` | varchar(30) | NO | NULL |  |  |
| 6 | `created_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |
| 7 | `updated_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED on update CURRENT_TIMESTAMP |
| 8 | `synced_at` | timestamp | YES | NULL |  |  |

#### Indexes

- UNIQUE `PRIMARY` (Did)

### `tbldrugtreat`

- Estimated rows: 6
- Engine: InnoDB
- Created: Sun Nov 09 2025 11:31:50 GMT+0700 (Indochina Time)
- Updated: N/A

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `Tid` | int | NO | NULL | PRI | auto_increment |
| 2 | `DrugName` | char(30) | NO | NULL |  |  |
| 3 | `created_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |
| 4 | `updated_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED on update CURRENT_TIMESTAMP |
| 5 | `synced_at` | timestamp | YES | NULL |  |  |

#### Indexes

- UNIQUE `PRIMARY` (Tid)

### `tbleimain`

- Estimated rows: 5800
- Engine: InnoDB
- Created: Sun Apr 26 2026 13:26:59 GMT+0700 (Indochina Time)
- Updated: Mon May 04 2026 12:43:43 GMT+0700 (Indochina Time)

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `site_code` | char(4) | NO | NULL | PRI |  |
| 2 | `ClinicID` | char(10) | NO | NULL | PRI |  |
| 3 | `DafirstVisit` | date | NO | NULL |  |  |
| 4 | `DaBirth` | date | NO | NULL |  |  |
| 5 | `Sex` | int | NO | NULL |  |  |
| 6 | `AddGuardian` | int | NO | NULL |  |  |
| 7 | `Grou` | char(10) | NO | NULL |  |  |
| 8 | `House` | varchar(20) | NO | NULL |  |  |
| 9 | `Street` | varchar(20) | NO | NULL |  |  |
| 10 | `Village` | varchar(70) | NO | NULL |  |  |
| 11 | `Commune` | varchar(70) | NO | NULL |  |  |
| 12 | `District` | char(40) | NO | NULL |  |  |
| 13 | `Province` | char(40) | NO | NULL |  |  |
| 14 | `NameContact` | char(25) | NO | NULL |  |  |
| 15 | `AddContact` | char(50) | NO | NULL |  |  |
| 16 | `Phone` | char(12) | NO | NULL |  |  |
| 17 | `Fage` | int | NO | NULL |  |  |
| 18 | `FHIV` | int | NO | NULL |  |  |
| 19 | `Fstatus` | int | NO | NULL |  |  |
| 20 | `Mage` | int | NO | NULL |  |  |
| 21 | `MClinicID` | int | NO | NULL |  |  |
| 22 | `MArt` | char(10) | NO | NULL |  |  |
| 23 | `HospitalName` | char(30) | NO | NULL |  |  |
| 24 | `Mstatus` | int | NO | NULL |  |  |
| 25 | `CatPlaceDelivery` | char(25) | NO | NULL |  |  |
| 26 | `PlaceDelivery` | char(50) | NO | NULL |  |  |
| 27 | `PMTCT` | char(10) | NO | NULL |  |  |
| 28 | `DaDelivery` | date | NO | NULL |  |  |
| 29 | `DeliveryStatus` | int | NO | NULL |  |  |
| 30 | `LenBaby` | float | NO | NULL |  |  |
| 31 | `WBaby` | float | NO | NULL |  |  |
| 32 | `KnownHIV` | int | NO | NULL |  |  |
| 33 | `Received` | int | NO | NULL |  |  |
| 34 | `Syrup` | int | NO | NULL |  |  |
| 35 | `Cotrim` | int | NO | NULL |  |  |
| 36 | `Offin` | int | NO | NULL |  |  |
| 37 | `SiteName` | char(40) | NO | NULL |  |  |
| 38 | `HIVtest` | int | NO | NULL |  |  |
| 39 | `MHIV` | int | NO | NULL |  |  |
| 40 | `MLastvl` | char(10) | NO | NULL |  |  |
| 41 | `DaMLastvl` | date | NO | NULL |  |  |
| 42 | `EOClinicID` | char(10) | NO | NULL |  |  |
| 43 | `created_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |
| 44 | `updated_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED on update CURRENT_TIMESTAMP |
| 45 | `synced_at` | timestamp | YES | NULL |  |  |

#### Indexes

- INDEX `idx_tbleimain_clinic_sex_birth` (ClinicID, Sex, DaBirth)
- INDEX `idx_tbleimain_site_clinicid` (site_code, ClinicID)
- INDEX `idx_tbleimain_site_synced_first_clinic` (site_code, synced_at, DafirstVisit, ClinicID)
- UNIQUE `PRIMARY` (site_code, ClinicID)

### `tblelink`

- Estimated rows: 131
- Engine: InnoDB
- Created: Mon Apr 06 2026 09:51:03 GMT+0700 (Indochina Time)
- Updated: Mon May 04 2026 12:19:54 GMT+0700 (Indochina Time)

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `site_code` | char(4) | NO | NULL | PRI |  |
| 2 | `ClinicID` | char(10) | NO | NULL | PRI |  |
| 3 | `Codes` | varchar(20) | NO | NULL | PRI |  |
| 4 | `Typecode` | char(15) | NO | NULL | PRI |  |
| 5 | `ARTIss` | int | NO | NULL |  |  |
| 6 | `DaExpiry` | date | NO | NULL |  |  |
| 7 | `Dacreate` | datetime | NO | NULL |  |  |
| 8 | `created_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |
| 9 | `updated_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED on update CURRENT_TIMESTAMP |
| 10 | `synced_at` | timestamp | YES | NULL |  |  |

#### Indexes

- UNIQUE `PRIMARY` (ClinicID, Codes, Typecode, site_code)

### `tbletest`

- Estimated rows: 7504
- Engine: InnoDB
- Created: Sun Apr 26 2026 13:29:05 GMT+0700 (Indochina Time)
- Updated: Mon May 04 2026 12:43:43 GMT+0700 (Indochina Time)

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `site_code` | char(4) | NO | NULL | PRI |  |
| 2 | `ClinicID` | char(9) | NO | NULL | MUL |  |
| 3 | `DNAPcr` | int | NO | NULL |  |  |
| 4 | `DaPcrArr` | date | NO | NULL |  |  |
| 5 | `OI` | char(6) | NO | NULL |  |  |
| 6 | `DaBlood` | date | NO | NULL |  |  |
| 7 | `LabID` | char(10) | NO | NULL |  |  |
| 8 | `DaReceive` | date | NO | NULL |  |  |
| 9 | `DaAnalys` | date | NO | NULL |  |  |
| 10 | `Result` | int | NO | NULL |  |  |
| 11 | `DaRresult` | date | NO | NULL |  |  |
| 12 | `DBS` | char(6) | NO | NULL |  |  |
| 13 | `Technic` | char(6) | NO | NULL |  |  |
| 14 | `ResultIn` | char(6) | NO | NULL |  |  |
| 15 | `Other` | char(30) | NO | NULL |  |  |
| 16 | `TID` | char(17) | NO | NULL | PRI |  |
| 17 | `created_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |
| 18 | `updated_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED on update CURRENT_TIMESTAMP |
| 19 | `synced_at` | timestamp | YES | NULL |  |  |

#### Indexes

- INDEX `idx_tbletest_clinic_dablood` (ClinicID, DaBlood)
- INDEX `idx_tbletest_clinic_dnapcr_oi_dates` (ClinicID, DNAPcr, OI, DaRresult)
- INDEX `idx_tbletest_site_synced_receive_tid` (site_code, synced_at, DaReceive, TID)
- UNIQUE `PRIMARY` (site_code, TID)

### `tblevarvdrug`

- Estimated rows: 21879
- Engine: InnoDB
- Created: Sat Nov 15 2025 03:33:12 GMT+0700 (Indochina Time)
- Updated: Mon May 04 2026 12:43:43 GMT+0700 (Indochina Time)

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `site_code` | char(4) | NO | NULL | PRI |  |
| 2 | `id` | int | NO | NULL | PRI |  |
| 3 | `DrugName` | char(16) | NO | NULL |  |  |
| 4 | `Dose` | char(20) | NO | NULL |  |  |
| 5 | `Quantity` | int | NO | NULL |  |  |
| 6 | `Freq` | char(5) | NO | NULL |  |  |
| 7 | `Form` | char(15) | NO | NULL |  |  |
| 8 | `Status` | int | NO | NULL |  |  |
| 9 | `Da` | date | NO | NULL |  |  |
| 10 | `Reason` | char(40) | NO | NULL |  |  |
| 11 | `Remark` | char(6) | NO | NULL |  |  |
| 12 | `Vid` | char(17) | NO | NULL |  |  |
| 13 | `created_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |
| 14 | `updated_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED on update CURRENT_TIMESTAMP |
| 15 | `synced_at` | timestamp | YES | NULL |  |  |

#### Indexes

- UNIQUE `PRIMARY` (id, site_code)

### `tblevmain`

- Estimated rows: 24476
- Engine: InnoDB
- Created: Sun Apr 26 2026 13:27:44 GMT+0700 (Indochina Time)
- Updated: Mon May 04 2026 12:43:43 GMT+0700 (Indochina Time)

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `site_code` | char(4) | NO | NULL | PRI |  |
| 2 | `ClinicID` | char(10) | NO | NULL |  |  |
| 3 | `DatVisit` | date | NO | NULL |  |  |
| 4 | `TypeVisit` | int | NO | NULL |  |  |
| 5 | `Temp` | float | NO | NULL |  |  |
| 6 | `Pulse` | float | NO | NULL |  |  |
| 7 | `Resp` | float | NO | NULL |  |  |
| 8 | `Head` | float | NO | NULL |  |  |
| 9 | `Weight` | float | NO | NULL |  |  |
| 10 | `Height` | float | NO | NULL |  |  |
| 11 | `Malnutrition` | int | NO | NULL |  |  |
| 12 | `WH` | int | NO | NULL |  |  |
| 13 | `BCG` | int | NO | NULL |  |  |
| 14 | `OPV` | int | NO | NULL |  |  |
| 15 | `Measles` | int | NO | NULL |  |  |
| 16 | `Other` | char(20) | NO | NULL |  |  |
| 17 | `Feeding` | int | NO | NULL |  |  |
| 18 | `DNA` | int | NO | NULL |  |  |
| 19 | `DaResult` | date | NO | NULL |  |  |
| 20 | `Vid` | char(17) | NO | NULL | PRI |  |
| 21 | `DNAPre` | int | YES | NULL |  |  |
| 22 | `TestID` | char(17) | NO | NULL |  |  |
| 23 | `DaApp` | date | NO | NULL |  |  |
| 24 | `Antibody` | int | YES | NULL |  |  |
| 25 | `DaAntibody` | date | YES | NULL |  |  |
| 26 | `Antiaffeeding` | int | NO | NULL |  |  |
| 27 | `OtherDNA` | char(30) | NO | NULL |  |  |
| 28 | `created_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |
| 29 | `updated_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED on update CURRENT_TIMESTAMP |
| 30 | `synced_at` | timestamp | YES | NULL |  |  |

#### Indexes

- INDEX `idx_tblevmain_site_clinicid` (site_code, ClinicID)
- INDEX `idx_tblevmain_site_synced_datvisit_vid` (site_code, synced_at, DatVisit, Vid)
- INDEX `idx_tblevmain_site_vid` (site_code, Vid)
- UNIQUE `PRIMARY` (site_code, Vid)

### `tblevpatientstatus`

- Estimated rows: 5103
- Engine: InnoDB
- Created: Sun Apr 26 2026 13:27:45 GMT+0700 (Indochina Time)
- Updated: Mon May 04 2026 12:43:43 GMT+0700 (Indochina Time)

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `site_code` | char(4) | NO | NULL | PRI |  |
| 2 | `ClinicID` | char(10) | NO | NULL | PRI |  |
| 3 | `Status` | int | NO | NULL | PRI |  |
| 4 | `DaStatus` | date | NO | NULL |  |  |
| 5 | `Vid` | char(17) | NO | NULL |  |  |
| 6 | `created_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |
| 7 | `updated_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED on update CURRENT_TIMESTAMP |
| 8 | `synced_at` | timestamp | YES | NULL |  |  |

#### Indexes

- INDEX `idx_tblevpatientstatus_site_vid_status` (site_code, Vid, Status)
- UNIQUE `PRIMARY` (ClinicID, Status, site_code)

### `tbllog`

- Estimated rows: 66528
- Engine: InnoDB
- Created: Sun Nov 09 2025 11:31:50 GMT+0700 (Indochina Time)
- Updated: N/A

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `ClinicID` | char(10) | NO | NULL |  |  |
| 2 | `Status` | char(20) | NO | NULL |  |  |
| 3 | `Type` | int | NO | NULL |  |  |
| 4 | `Dat` | datetime | NO | NULL |  |  |
| 5 | `created_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |
| 6 | `synced_at` | timestamp | YES | NULL |  |  |

### `tbllostlog`

- Estimated rows: 9
- Engine: InnoDB
- Created: Sun Nov 09 2025 11:31:50 GMT+0700 (Indochina Time)
- Updated: N/A

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `Exsposed` | int | NO | NULL | PRI |  |
| 2 | `Child` | int | NO | NULL | PRI |  |
| 3 | `ChildARV` | int | NO | NULL | PRI |  |
| 4 | `Adult` | int | NO | NULL | PRI |  |
| 5 | `AdultARV` | int | NO | NULL | PRI |  |
| 6 | `Ed` | int | YES | NULL |  |  |
| 7 | `Cd` | int | YES | NULL |  |  |
| 8 | `Ad` | int | YES | NULL |  |  |
| 9 | `DateChange` | date | NO | NULL | PRI |  |
| 10 | `created_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |
| 11 | `updated_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED on update CURRENT_TIMESTAMP |
| 12 | `synced_at` | timestamp | YES | NULL |  |  |

#### Indexes

- UNIQUE `PRIMARY` (Exsposed, Child, ChildARV, Adult, AdultARV, DateChange)

### `tblmargins`

- Estimated rows: 1
- Engine: InnoDB
- Created: Sun Nov 09 2025 11:31:50 GMT+0700 (Indochina Time)
- Updated: N/A

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `mleft` | float | NO | NULL |  |  |
| 2 | `mright` | float | NO | NULL |  |  |
| 3 | `mtop` | float | NO | NULL |  |  |
| 4 | `mbottom` | float | NO | NULL |  |  |
| 5 | `created_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |
| 6 | `updated_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED on update CURRENT_TIMESTAMP |
| 7 | `synced_at` | timestamp | YES | NULL |  |  |

### `tblnationality`

- Estimated rows: 225
- Engine: InnoDB
- Created: Sun Nov 09 2025 11:31:51 GMT+0700 (Indochina Time)
- Updated: N/A

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `Nid` | int | NO | NULL | PRI | auto_increment |
| 2 | `Nationality` | varchar(40) | YES | NULL |  |  |
| 3 | `created_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |
| 4 | `updated_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED on update CURRENT_TIMESTAMP |
| 5 | `synced_at` | timestamp | YES | NULL |  |  |

#### Indexes

- UNIQUE `PRIMARY` (Nid)

### `tbloccupation`

- Estimated rows: 26
- Engine: InnoDB
- Created: Sun Nov 09 2025 11:31:51 GMT+0700 (Indochina Time)
- Updated: N/A

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `OcID` | int | NO | NULL | PRI | auto_increment |
| 2 | `Name` | char(30) | NO | NULL |  |  |
| 3 | `created_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |
| 4 | `updated_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED on update CURRENT_TIMESTAMP |
| 5 | `synced_at` | timestamp | YES | NULL |  |  |

#### Indexes

- UNIQUE `PRIMARY` (OcID)

### `tblods`

- Estimated rows: 64
- Engine: InnoDB
- Created: Thu Oct 16 2025 09:50:09 GMT+0700 (Indochina Time)
- Updated: N/A

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `od_code` | char(4) | NO | NULL | PRI |  |
| 2 | `name_kh` | varchar(200) | NO | NULL |  |  |
| 3 | `name_en` | varchar(150) | NO | NULL |  |  |
| 4 | `latitude` | double unsigned | YES | NULL |  |  |
| 5 | `longitude` | double unsigned | YES | NULL |  |  |
| 6 | `province_id` | tinyint unsigned | YES | NULL |  |  |
| 7 | `created_dt` | datetime | YES | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |
| 8 | `updated_dt` | datetime | YES | NULL |  | on update CURRENT_TIMESTAMP |
| 9 | `created_by_user_id` | int | YES | NULL |  |  |
| 10 | `updated_by_user_id` | int | YES | NULL |  |  |

#### Indexes

- UNIQUE `PRIMARY` (od_code)

### `tblpatienttest`

- Estimated rows: 1186873
- Engine: InnoDB
- Created: Wed Apr 29 2026 17:13:47 GMT+0700 (Indochina Time)
- Updated: Mon May 04 2026 17:01:05 GMT+0700 (Indochina Time)

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `site_code` | char(4) | NO | NULL | PRI |  |
| 2 | `TestID` | char(15) | NO | NULL | PRI |  |
| 3 | `ClinicID` | char(10) | NO | NULL | MUL |  |
| 4 | `DaArrival` | date | YES | NULL |  |  |
| 5 | `Dat` | date | NO | NULL |  |  |
| 6 | `DaCollect` | date | NO | NULL |  |  |
| 7 | `CD4Rapid` | int | NO | NULL |  |  |
| 8 | `CD4` | char(5) | NO | NULL |  |  |
| 9 | `CD` | char(6) | NO | NULL |  |  |
| 10 | `CD8` | char(6) | NO | NULL |  |  |
| 11 | `HIVLoad` | char(10) | NO | NULL |  |  |
| 12 | `HIVLog` | char(6) | NO | NULL |  |  |
| 13 | `HCV` | char(9) | NO | NULL |  |  |
| 14 | `HCVlog` | char(6) | NO | NULL |  |  |
| 15 | `HIVAb` | int | NO | NULL |  |  |
| 16 | `HBsAg` | int | NO | NULL |  |  |
| 17 | `HCVPCR` | int | NO | NULL |  |  |
| 18 | `HBeAg` | int | NO | NULL |  |  |
| 19 | `TPHA` | int | NO | NULL |  |  |
| 20 | `AntiHBcAb` | int | NO | NULL |  |  |
| 21 | `RPR` | int | NO | NULL |  |  |
| 22 | `AntiHBeAb` | int | NO | NULL |  |  |
| 23 | `RPRab` | char(10) | NO | NULL |  |  |
| 24 | `HCVAb` | int | NO | NULL |  |  |
| 25 | `HBsAb` | int | NO | NULL |  |  |
| 26 | `WBC` | char(10) | NO | NULL |  |  |
| 27 | `Neutrophils` | char(10) | NO | NULL |  |  |
| 28 | `HGB` | char(10) | NO | NULL |  |  |
| 29 | `Eosinophis` | char(10) | NO | NULL |  |  |
| 30 | `HCT` | char(10) | NO | NULL |  |  |
| 31 | `Lymphocyte` | char(10) | NO | NULL |  |  |
| 32 | `MCV` | char(10) | NO | NULL |  |  |
| 33 | `Monocyte` | char(10) | NO | NULL |  |  |
| 34 | `PLT` | char(10) | NO | NULL |  |  |
| 35 | `Reticulocte` | char(10) | NO | NULL |  |  |
| 36 | `Prothrombin` | char(10) | NO | NULL |  |  |
| 37 | `ProReticulocyte` | char(10) | NO | NULL |  |  |
| 38 | `Creatinine` | char(10) | NO | NULL |  |  |
| 39 | `HDL` | char(10) | NO | NULL |  |  |
| 40 | `Bilirubin` | char(10) | NO | NULL |  |  |
| 41 | `Glucose` | char(10) | NO | NULL |  |  |
| 42 | `Sodium` | char(10) | NO | NULL |  |  |
| 43 | `AlPhosphate` | char(10) | NO | NULL |  |  |
| 44 | `GotASAT` | char(10) | NO | NULL |  |  |
| 45 | `Potassium` | char(10) | NO | NULL |  |  |
| 46 | `Amylase` | char(10) | NO | NULL |  |  |
| 47 | `GPTALAT` | char(10) | NO | NULL |  |  |
| 48 | `Chloride` | char(10) | NO | NULL |  |  |
| 49 | `CK` | char(10) | NO | NULL |  |  |
| 50 | `CHOL` | char(10) | NO | NULL |  |  |
| 51 | `Bicarbonate` | char(10) | NO | NULL |  |  |
| 52 | `Lactate` | char(10) | NO | NULL |  |  |
| 53 | `Triglyceride` | char(10) | NO | NULL |  |  |
| 54 | `Urea` | char(10) | NO | NULL |  |  |
| 55 | `Magnesium` | char(10) | NO | NULL |  |  |
| 56 | `Phosphorus` | char(10) | NO | NULL |  |  |
| 57 | `Calcium` | char(10) | NO | NULL |  |  |
| 58 | `BHCG` | int | NO | NULL |  |  |
| 59 | `SputumAFB` | int | NO | NULL |  |  |
| 60 | `AFBCulture` | int | NO | NULL |  |  |
| 61 | `AFBCulture1` | char(15) | NO | NULL |  |  |
| 62 | `UrineMicroscopy` | int | NO | NULL |  |  |
| 63 | `UrineComment` | char(15) | NO | NULL |  |  |
| 64 | `CSFCell` | char(10) | NO | NULL |  |  |
| 65 | `CSFGram` | char(10) | NO | NULL |  |  |
| 66 | `CSFAFB` | char(10) | NO | NULL |  |  |
| 67 | `CSFIndian` | int | NO | NULL |  |  |
| 68 | `CSFCCag` | char(10) | NO | NULL |  |  |
| 69 | `CSFProtein` | char(10) | NO | NULL |  |  |
| 70 | `CSFGlucose` | char(10) | NO | NULL |  |  |
| 71 | `BloodCulture` | int | NO | NULL |  |  |
| 72 | `BloodCulture0` | char(10) | NO | NULL |  |  |
| 73 | `BloodCulture1` | int | NO | NULL |  |  |
| 74 | `BloodCulture10` | char(10) | NO | NULL |  |  |
| 75 | `CTNA` | int | NO | NULL |  |  |
| 76 | `GCNA` | int | NO | NULL |  |  |
| 77 | `CXR` | int | NO | NULL |  |  |
| 78 | `Abdominal` | int | NO | NULL |  |  |
| 79 | `created_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |
| 80 | `updated_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED on update CURRENT_TIMESTAMP |
| 81 | `synced_at` | timestamp | YES | NULL |  |  |

#### Indexes

- INDEX `idx_patienttest_site_clinic_dat` (site_code, ClinicID, Dat)
- INDEX `idx_tblpatienttest_clinic_arrival_dat` (ClinicID, DaArrival, Dat)
- INDEX `idx_tblpatienttest_clinic_dat_arrival` (ClinicID, Dat, DaArrival)
- INDEX `idx_tblpatienttest_site_clinic_dat_arrival` (site_code, ClinicID, Dat, DaArrival)
- INDEX `idx_tblpatienttest_site_synced_arrival_test` (site_code, synced_at, DaArrival, TestID)
- UNIQUE `PRIMARY` (site_code, TestID)

### `tblpatienttestabdominal`

- Estimated rows: 16
- Engine: InnoDB
- Created: Sun Nov 09 2025 11:31:51 GMT+0700 (Indochina Time)
- Updated: Mon May 04 2026 12:43:47 GMT+0700 (Indochina Time)

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `site_code` | char(4) | NO | NULL | PRI |  |
| 2 | `id` | int | NO | NULL | PRI |  |
| 3 | `TestID` | char(15) | NO | NULL |  |  |
| 4 | `Abdo` | char(20) | NO | NULL |  |  |
| 5 | `Abdo1` | char(20) | NO | NULL |  |  |
| 6 | `Abdo2` | char(20) | NO | NULL |  |  |
| 7 | `created_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |
| 8 | `updated_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED on update CURRENT_TIMESTAMP |
| 9 | `synced_at` | timestamp | YES | NULL |  |  |

#### Indexes

- UNIQUE `PRIMARY` (id, site_code)

### `tblpatienttestcxr`

- Estimated rows: 22
- Engine: InnoDB
- Created: Sun Nov 09 2025 11:31:51 GMT+0700 (Indochina Time)
- Updated: Mon May 04 2026 12:43:47 GMT+0700 (Indochina Time)

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `site_code` | char(4) | NO | NULL | PRI |  |
| 2 | `id` | int | NO | NULL | PRI |  |
| 3 | `TestID` | char(15) | NO | NULL |  |  |
| 4 | `CXR` | char(20) | NO | NULL |  |  |
| 5 | `CXR1` | char(20) | NO | NULL |  |  |
| 6 | `CXR2` | char(20) | NO | NULL |  |  |
| 7 | `created_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |
| 8 | `updated_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED on update CURRENT_TIMESTAMP |
| 9 | `synced_at` | timestamp | YES | NULL |  |  |

#### Indexes

- UNIQUE `PRIMARY` (id, site_code)

### `tblprovince`

- Estimated rows: 25
- Engine: InnoDB
- Created: Mon Feb 02 2026 17:13:55 GMT+0700 (Indochina Time)
- Updated: N/A

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `id` | int | NO | NULL | PRI |  |
| 2 | `province_en` | varchar(20) | NO | NULL |  |  |
| 3 | `province_kh` | varchar(40) | NO | NULL |  |  |
| 4 | `created_at` | timestamp | YES | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |
| 5 | `updated_at` | timestamp | YES | NULL |  | on update CURRENT_TIMESTAMP |

#### Indexes

- UNIQUE `PRIMARY` (id)

### `tblreason`

- Estimated rows: 40
- Engine: InnoDB
- Created: Sun Nov 09 2025 11:31:51 GMT+0700 (Indochina Time)
- Updated: N/A

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `Rid` | int | NO | NULL | PRI | auto_increment |
| 2 | `Reason` | char(40) | NO | NULL |  |  |
| 3 | `created_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |
| 4 | `updated_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED on update CURRENT_TIMESTAMP |
| 5 | `synced_at` | timestamp | YES | NULL |  |  |

#### Indexes

- UNIQUE `PRIMARY` (Rid)

### `tblsetlost`

- Estimated rows: 1
- Engine: InnoDB
- Created: Sun Nov 09 2025 11:31:51 GMT+0700 (Indochina Time)
- Updated: N/A

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `Exsposed` | int | NO | NULL |  |  |
| 2 | `Child` | int | NO | NULL |  |  |
| 3 | `ChildARV` | int | NO | NULL |  |  |
| 4 | `Adult` | int | NO | NULL |  |  |
| 5 | `AdultARV` | int | NO | NULL |  |  |
| 6 | `Ed` | int | YES | NULL |  |  |
| 7 | `Cd` | int | YES | NULL |  |  |
| 8 | `Ad` | int | YES | NULL |  |  |
| 9 | `created_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |
| 10 | `updated_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED on update CURRENT_TIMESTAMP |
| 11 | `synced_at` | timestamp | YES | NULL |  |  |

### `tblsite_syncs`

- Estimated rows: 35409
- Engine: InnoDB
- Created: Thu Oct 16 2025 09:50:09 GMT+0700 (Indochina Time)
- Updated: N/A

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `id` | bigint | NO | NULL | PRI | auto_increment |
| 2 | `synced_at` | timestamp | YES | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |
| 3 | `last_data_created_at` | timestamp | YES | NULL |  |  |
| 4 | `last_data_updated_at` | timestamp | YES | NULL |  |  |
| 5 | `site_code` | char(6) | YES | NULL |  |  |
| 6 | `program_id` | tinyint unsigned | NO | NULL |  |  |

#### Indexes

- UNIQUE `PRIMARY` (id)

### `tblsitename`

- Estimated rows: 1
- Engine: InnoDB
- Created: Sun Nov 09 2025 11:31:51 GMT+0700 (Indochina Time)
- Updated: N/A

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `NameEn` | char(40) | NO | NULL |  |  |
| 2 | `NameKh` | char(40) | NO | NULL |  |  |
| 3 | `SiteCode` | char(4) | NO | NULL | PRI |  |
| 4 | `Province` | char(20) | NO | NULL |  |  |
| 5 | `District` | char(25) | NO | NULL |  |  |
| 6 | `ODname` | char(30) | NO | NULL |  |  |
| 7 | `created_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |
| 8 | `updated_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED on update CURRENT_TIMESTAMP |
| 9 | `synced_at` | timestamp | YES | NULL |  |  |

#### Indexes

- UNIQUE `PRIMARY` (SiteCode)

### `tblsites`

- Estimated rows: 75
- Engine: InnoDB
- Created: Sun Apr 26 2026 13:26:58 GMT+0700 (Indochina Time)
- Updated: N/A

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `id` | int | NO | NULL | PRI | auto_increment |
| 2 | `art_site_code` | char(4) | YES | NULL | MUL |  |
| 3 | `vcct_site_code` | varchar(255) | YES | NULL | MUL |  |
| 4 | `site_name` | varchar(128) | YES | NULL |  |  |
| 5 | `od_code` | char(6) | YES | NULL | MUL |  |
| 6 | `od_name` | varchar(128) | YES | NULL |  |  |
| 7 | `district_id` | smallint | YES | NULL |  |  |
| 8 | `province_id` | tinyint | YES | NULL | MUL |  |
| 9 | `status_id` | tinyint | YES | 1 |  |  |
| 10 | `last_vcct_synced_at` | timestamp | YES | NULL |  |  |
| 11 | `last_vcct_data_created_at` | timestamp | YES | NULL |  |  |
| 12 | `last_vcct_data_updated_at` | timestamp | YES | NULL |  |  |
| 13 | `last_art_synced_at` | timestamp | YES | NULL |  |  |
| 14 | `last_art_data_created_at` | timestamp | YES | NULL |  |  |
| 15 | `last_art_data_updated_at` | timestamp | YES | NULL |  |  |
| 16 | `last_art_count_sync_remain` | int | YES | NULL |  |  |
| 17 | `last_art_version` | char(9) | YES | NULL |  |  |
| 18 | `created_at` | timestamp | YES | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |
| 19 | `updated_at` | timestamp | YES | NULL |  | on update CURRENT_TIMESTAMP |
| 20 | `created_by_user_id` | int | YES | NULL |  |  |
| 21 | `updated_by_user_id` | int | YES | NULL |  |  |

#### Indexes

- INDEX `idx_site_site_code` (vcct_site_code)
- INDEX `idx_tblsites_art_site_code` (art_site_code)
- INDEX `idx_tblsites_od_site` (od_code, art_site_code)
- INDEX `idx_tblsites_province_site` (province_id, art_site_code)
- UNIQUE `PRIMARY` (id)

### `tbltargroup`

- Estimated rows: 8
- Engine: InnoDB
- Created: Sun Nov 09 2025 11:31:51 GMT+0700 (Indochina Time)
- Updated: N/A

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `Tid` | int | NO | NULL | PRI |  |
| 2 | `Targroup` | char(10) | NO | NULL |  |  |
| 3 | `Targroupkh` | char(50) | NO | NULL |  |  |
| 4 | `Status` | int | NO | NULL |  |  |
| 5 | `created_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |
| 6 | `updated_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED on update CURRENT_TIMESTAMP |
| 7 | `synced_at` | timestamp | YES | NULL |  |  |

#### Indexes

- UNIQUE `PRIMARY` (Tid)

### `tbltemp`

- Estimated rows: 0
- Engine: InnoDB
- Created: Sun Nov 09 2025 11:19:48 GMT+0700 (Indochina Time)
- Updated: N/A

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `f` | char(30) | NO | NULL | PRI |  |
| 2 | `f1` | char(30) | NO | NULL |  |  |
| 3 | `f2` | char(30) | NO | NULL |  |  |
| 4 | `f3` | char(30) | NO | NULL |  |  |
| 5 | `f4` | char(30) | NO | NULL |  |  |
| 6 | `f5` | date | NO | NULL |  |  |
| 7 | `f6` | date | NO | NULL |  |  |

#### Indexes

- UNIQUE `PRIMARY` (f)

### `tbltempart`

- Estimated rows: 0
- Engine: InnoDB
- Created: Sun Nov 09 2025 11:19:48 GMT+0700 (Indochina Time)
- Updated: N/A

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `ClinicID` | char(7) | NO | NULL | PRI |  |
| 2 | `Sex` | int | YES | NULL |  |  |

#### Indexes

- UNIQUE `PRIMARY` (ClinicID)

### `tbltempdrug`

- Estimated rows: 0
- Engine: InnoDB
- Created: Sun Nov 09 2025 11:19:48 GMT+0700 (Indochina Time)
- Updated: N/A

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `Vid` | double | NO | NULL |  |  |
| 2 | `ClinicID` | int | NO | NULL | PRI |  |

#### Indexes

- UNIQUE `PRIMARY` (ClinicID)

### `tbltempoi`

- Estimated rows: 0
- Engine: InnoDB
- Created: Sun Nov 09 2025 11:19:48 GMT+0700 (Indochina Time)
- Updated: N/A

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `ClinicID` | char(7) | NO | NULL | PRI |  |
| 2 | `Sex` | int | YES | NULL |  |  |

#### Indexes

- UNIQUE `PRIMARY` (ClinicID)

### `tbluser`

- Estimated rows: 1
- Engine: InnoDB
- Created: Sun Nov 09 2025 11:31:51 GMT+0700 (Indochina Time)
- Updated: N/A

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `Uid` | int | NO | NULL |  |  |
| 2 | `Fullname` | varchar(40) | NO | NULL |  |  |
| 3 | `User` | varchar(40) | NO | NULL |  |  |
| 4 | `Pass` | char(40) | NO | NULL |  |  |
| 5 | `Status` | int | NO | NULL |  |  |
| 6 | `created_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |
| 7 | `updated_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED on update CURRENT_TIMESTAMP |
| 8 | `synced_at` | timestamp | YES | NULL |  |  |

### `tblvcctsite`

- Estimated rows: 77
- Engine: InnoDB
- Created: Sun Nov 09 2025 11:19:49 GMT+0700 (Indochina Time)
- Updated: N/A

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `Vid` | varchar(10) | NO | NULL | PRI |  |
| 2 | `SiteName` | varchar(30) | NO | NULL |  |  |
| 3 | `ODname` | varchar(20) | NO | NULL |  |  |
| 4 | `Status` | int | NO | NULL |  |  |

#### Indexes

- UNIQUE `PRIMARY` (Vid)

### `tblversion`

- Estimated rows: 1
- Engine: InnoDB
- Created: Sun Nov 09 2025 11:31:51 GMT+0700 (Indochina Time)
- Updated: N/A

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `Version` | char(15) | NO | NULL | PRI |  |
| 2 | `created_at` | timestamp | NO | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |
| 3 | `synced_at` | timestamp | YES | NULL |  |  |

#### Indexes

- UNIQUE `PRIMARY` (Version)

### `tblvillage`

- Estimated rows: 14367
- Engine: InnoDB
- Created: Mon Feb 02 2026 17:15:10 GMT+0700 (Indochina Time)
- Updated: N/A

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `id` | int | NO | NULL | PRI |  |
| 2 | `village_en` | varchar(35) | NO | NULL |  |  |
| 3 | `village_kh` | varchar(35) | NO | NULL |  |  |
| 4 | `commune_id` | int | NO | NULL |  |  |
| 5 | `created_at` | timestamp | YES | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |
| 6 | `updated_at` | timestamp | YES | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED on update CURRENT_TIMESTAMP |
| 7 | `_Vid` | int | YES | NULL |  |  |
| 8 | `_Cid` | int | YES | NULL |  |  |

#### Indexes

- UNIQUE `PRIMARY` (id)

### `typeorm_metadata`

- Estimated rows: 0
- Engine: InnoDB
- Created: Sat Nov 15 2025 03:33:13 GMT+0700 (Indochina Time)
- Updated: N/A

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `type` | varchar(255) | NO | NULL |  |  |
| 2 | `database` | varchar(255) | YES | NULL |  |  |
| 3 | `schema` | varchar(255) | YES | NULL |  |  |
| 4 | `table` | varchar(255) | YES | NULL |  |  |
| 5 | `name` | varchar(255) | YES | NULL |  |  |
| 6 | `value` | text | YES | NULL |  |  |

### `user_logins`

- Estimated rows: 142
- Engine: InnoDB
- Created: Fri Nov 28 2025 07:19:27 GMT+0700 (Indochina Time)
- Updated: Thu May 07 2026 08:56:55 GMT+0700 (Indochina Time)

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `id` | int unsigned | NO | NULL | MUL | auto_increment |
| 2 | `ip_address` | char(15) | NO | NULL |  |  |
| 3 | `platform` | varchar(50) | YES | NULL |  |  |
| 4 | `browser` | varchar(50) | YES | NULL |  |  |
| 5 | `browser_v` | float(6,2) unsigned | YES | NULL |  |  |
| 6 | `is_valid` | tinyint(1) | YES | 1 |  |  |
| 7 | `created_at` | timestamp | YES | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |
| 8 | `user_id` | int | NO | NULL |  |  |

#### Indexes

- INDEX `id` (id)

### `user_org_units`

- Estimated rows: 0
- Engine: InnoDB
- Created: Thu Oct 16 2025 09:50:11 GMT+0700 (Indochina Time)
- Updated: N/A

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `id` | smallint unsigned | NO | NULL | PRI | auto_increment |
| 2 | `province_id` | tinyint unsigned | YES | NULL |  |  |
| 3 | `od_code` | char(4) | YES | NULL |  |  |
| 4 | `site_id` | smallint unsigned | YES | NULL |  |  |
| 5 | `user_id` | int | YES | NULL |  |  |
| 6 | `created_at` | timestamp | YES | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |
| 7 | `updated_at` | timestamp | YES | NULL |  | on update CURRENT_TIMESTAMP |

#### Indexes

- UNIQUE `PRIMARY` (id)

### `user_roles`

- Estimated rows: 3
- Engine: InnoDB
- Created: Thu Oct 16 2025 09:50:11 GMT+0700 (Indochina Time)
- Updated: N/A

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `id` | bigint | NO | NULL | PRI | auto_increment |
| 2 | `role_id` | bigint | NO | NULL |  |  |
| 3 | `user_id` | bigint | NO | NULL |  |  |
| 4 | `created_at` | timestamp | YES | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |
| 5 | `updated_at` | timestamp | YES | NULL |  | on update CURRENT_TIMESTAMP |

#### Indexes

- UNIQUE `PRIMARY` (id)

### `users`

- Estimated rows: 318
- Engine: InnoDB
- Created: Thu Oct 16 2025 09:50:11 GMT+0700 (Indochina Time)
- Updated: Thu May 07 2026 08:56:55 GMT+0700 (Indochina Time)

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `id` | bigint unsigned | NO | NULL | PRI | auto_increment |
| 2 | `first_name` | varchar(100) | YES | NULL |  |  |
| 3 | `last_name` | varchar(100) | YES | NULL |  |  |
| 4 | `username` | varchar(255) | NO | NULL | UNI |  |
| 5 | `email` | varchar(255) | YES | NULL | UNI |  |
| 6 | `email_verified_at` | timestamp | YES | NULL |  |  |
| 7 | `password` | varchar(255) | NO | NULL |  |  |
| 8 | `remember_token` | varchar(100) | YES | NULL |  |  |
| 9 | `status_id` | tinyint | YES | 1 |  |  |
| 10 | `login_at` | timestamp | YES | NULL |  |  |
| 11 | `last_login_at` | timestamp | YES | NULL |  |  |
| 12 | `created_at` | timestamp | YES | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |
| 13 | `updated_at` | timestamp | YES | NULL |  | on update CURRENT_TIMESTAMP |

#### Indexes

- UNIQUE `PRIMARY` (id)
- UNIQUE `users_email_unique` (email)
- UNIQUE `users_username_unique` (username)

### `vcct_hiv_results`

- Estimated rows: 3
- Engine: InnoDB
- Created: Thu Oct 16 2025 09:50:12 GMT+0700 (Indochina Time)
- Updated: N/A

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `id` | int | NO | NULL | PRI | auto_increment |
| 2 | `result_en` | char(10) | NO | NULL |  |  |
| 3 | `result_kh` | char(10) | NO | NULL |  |  |
| 4 | `status_id` | int | NO | NULL |  |  |
| 5 | `created_at` | timestamp | YES | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |
| 6 | `updated_at` | timestamp | YES | NULL |  | on update CURRENT_TIMESTAMP |

#### Indexes

- UNIQUE `ID_UNIQUE` (id)
- UNIQUE `PRIMARY` (id)

### `vcct_line_test_results`

- Estimated rows: 153828
- Engine: InnoDB
- Created: Thu Oct 16 2025 09:50:12 GMT+0700 (Indochina Time)
- Updated: N/A

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `site_code` | char(6) | NO | NULL | PRI |  |
| 2 | `vcct_id` | int | NO | NULL | PRI |  |
| 3 | `line_control` | int | NO | NULL |  |  |
| 4 | `line_positive` | int | NO | NULL |  |  |
| 5 | `line_longterm` | int | NO | NULL |  |  |
| 6 | `cambo_ag` | int | NO | NULL |  |  |
| 7 | `cambo_ab` | int | NO | NULL |  |  |
| 8 | `created_at` | timestamp | YES | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |
| 9 | `updated_at` | timestamp | YES | NULL |  | on update CURRENT_TIMESTAMP |
| 10 | `created_by_user_id` | int | YES | NULL |  |  |
| 11 | `updated_by_user_id` | int | YES | NULL |  |  |

#### Indexes

- UNIQUE `PRIMARY` (vcct_id, site_code)

### `vcct_number_recencies`

- Estimated rows: 0
- Engine: InnoDB
- Created: Thu Oct 16 2025 09:50:22 GMT+0700 (Indochina Time)
- Updated: N/A

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `id` | int | NO | NULL | PRI | auto_increment |
| 2 | `site_code` | char(6) | NO | NULL |  |  |
| 3 | `client_type_id` | smallint | NO | NULL |  |  |
| 4 | `age_0_4_male` | smallint | YES | 0 |  |  |
| 5 | `age_5_9_female` | smallint | YES | 0 |  |  |
| 6 | `age_10_14_male` | smallint | YES | 0 |  |  |
| 7 | `age_15_19_female` | smallint | YES | 0 |  |  |
| 8 | `age_20_24_male` | smallint | YES | 0 |  |  |
| 9 | `age_25_29_female` | smallint | YES | 0 |  |  |
| 10 | `age_30_34_male` | smallint | YES | 0 |  |  |
| 11 | `age_35_39_female` | smallint | YES | 0 |  |  |
| 12 | `age_40_44_male` | smallint | YES | 0 |  |  |
| 13 | `age_45_49_female` | smallint | YES | 0 |  |  |
| 14 | `age_50_plus_male` | smallint | YES | 0 |  |  |
| 15 | `age_50_plus_female` | smallint | YES | 0 |  |  |
| 16 | `total_male` | smallint | YES | 0 |  |  |
| 17 | `total_female` | smallint | YES | 0 |  |  |
| 18 | `total_rtri_longterm` | smallint | YES | 0 |  |  |
| 19 | `total_rtri_recent` | smallint | YES | 0 |  |  |
| 20 | `total_rtri_inconclusive` | smallint | YES | 0 |  |  |
| 21 | `total_rtri_invalid` | smallint | YES | 0 |  |  |
| 22 | `total_rtri_is_repeat_onetime` | smallint | YES | 0 |  |  |
| 23 | `total_rita_longterm` | smallint | YES | 0 |  |  |
| 24 | `total_rita_recent` | smallint | YES | 0 |  |  |
| 25 | `total` | smallint | YES | 0 |  |  |
| 26 | `register_year` | smallint | YES | 0 |  |  |
| 27 | `register_month` | tinyint | YES | 0 |  |  |
| 28 | `register_date` | date | NO | NULL |  |  |
| 29 | `created_at` | timestamp | YES | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |
| 30 | `updated_at` | timestamp | YES | NULL |  | on update CURRENT_TIMESTAMP |

#### Indexes

- UNIQUE `PRIMARY` (id)

### `vcct_number_retests`

- Estimated rows: 0
- Engine: InnoDB
- Created: Thu Oct 16 2025 09:50:23 GMT+0700 (Indochina Time)
- Updated: N/A

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `id` | int | NO | NULL | PRI | auto_increment |
| 2 | `site_code` | char(6) | NO | NULL |  |  |
| 3 | `age_0_4_male` | smallint | YES | 0 |  |  |
| 4 | `age_5_9_female` | smallint | YES | 0 |  |  |
| 5 | `age_10_14_male` | smallint | YES | 0 |  |  |
| 6 | `age_15_19_female` | smallint | YES | 0 |  |  |
| 7 | `age_20_24_male` | smallint | YES | 0 |  |  |
| 8 | `age_25_29_female` | smallint | YES | 0 |  |  |
| 9 | `age_30_34_male` | smallint | YES | 0 |  |  |
| 10 | `age_35_39_female` | smallint | YES | 0 |  |  |
| 11 | `age_40_44_male` | smallint | YES | 0 |  |  |
| 12 | `age_45_49_female` | smallint | YES | 0 |  |  |
| 13 | `age_50_plus_male` | smallint | YES | 0 |  |  |
| 14 | `age_50_plus_female` | smallint | YES | 0 |  |  |
| 15 | `total_male` | smallint | YES | 0 |  |  |
| 16 | `total_female` | smallint | YES | 0 |  |  |
| 17 | `total_negative` | smallint | YES | 0 |  |  |
| 18 | `total_postive` | smallint | YES | 0 |  |  |
| 19 | `total` | smallint | YES | 0 |  |  |
| 20 | `retest_year` | smallint | YES | 0 |  |  |
| 21 | `retest_month` | tinyint | YES | 0 |  |  |
| 22 | `retest_date` | date | NO | NULL |  |  |
| 23 | `created_at` | timestamp | YES | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |
| 24 | `updated_at` | timestamp | YES | NULL |  | on update CURRENT_TIMESTAMP |

#### Indexes

- UNIQUE `PRIMARY` (id)

### `vcct_number_test_a1_reactives`

- Estimated rows: 0
- Engine: InnoDB
- Created: Thu Oct 16 2025 09:50:23 GMT+0700 (Indochina Time)
- Updated: N/A

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `id` | int | NO | NULL | PRI | auto_increment |
| 2 | `site_code` | char(6) | NO | NULL |  |  |
| 3 | `client_type_id` | smallint | NO | NULL |  |  |
| 4 | `age_0_4_male` | smallint | YES | 0 |  |  |
| 5 | `age_5_9_female` | smallint | YES | 0 |  |  |
| 6 | `age_10_14_male` | smallint | YES | 0 |  |  |
| 7 | `age_15_19_female` | smallint | YES | 0 |  |  |
| 8 | `age_20_24_male` | smallint | YES | 0 |  |  |
| 9 | `age_25_29_female` | smallint | YES | 0 |  |  |
| 10 | `age_30_34_male` | smallint | YES | 0 |  |  |
| 11 | `age_35_39_female` | smallint | YES | 0 |  |  |
| 12 | `age_40_44_male` | smallint | YES | 0 |  |  |
| 13 | `age_45_49_female` | smallint | YES | 0 |  |  |
| 14 | `age_50_plus_male` | smallint | YES | 0 |  |  |
| 15 | `age_50_plus_female` | smallint | YES | 0 |  |  |
| 16 | `total_male` | smallint | YES | 0 |  |  |
| 17 | `total_female` | smallint | YES | 0 |  |  |
| 18 | `total` | smallint | YES | 0 |  |  |
| 19 | `register_year` | smallint | YES | 0 |  |  |
| 20 | `register_month` | tinyint | YES | 0 |  |  |
| 21 | `register_date` | date | NO | NULL |  |  |
| 22 | `created_at` | timestamp | YES | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |
| 23 | `updated_at` | timestamp | YES | NULL |  | on update CURRENT_TIMESTAMP |

#### Indexes

- UNIQUE `PRIMARY` (id)

### `vcct_number_tests`

- Estimated rows: 0
- Engine: InnoDB
- Created: Thu Oct 16 2025 09:50:23 GMT+0700 (Indochina Time)
- Updated: N/A

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `id` | int | NO | NULL | PRI | auto_increment |
| 2 | `site_code` | char(6) | NO | NULL |  |  |
| 3 | `client_type_id` | smallint | NO | NULL |  |  |
| 4 | `referred_to_id` | smallint | NO | NULL |  |  |
| 5 | `age_0_4_male` | smallint | YES | 0 |  |  |
| 6 | `age_5_9_female` | smallint | YES | 0 |  |  |
| 7 | `age_10_14_male` | smallint | YES | 0 |  |  |
| 8 | `age_15_19_female` | smallint | YES | 0 |  |  |
| 9 | `age_20_24_male` | smallint | YES | 0 |  |  |
| 10 | `age_25_29_female` | smallint | YES | 0 |  |  |
| 11 | `age_30_34_male` | smallint | YES | 0 |  |  |
| 12 | `age_35_39_female` | smallint | YES | 0 |  |  |
| 13 | `age_40_44_male` | smallint | YES | 0 |  |  |
| 14 | `age_45_49_female` | smallint | YES | 0 |  |  |
| 15 | `age_50_plus_male` | smallint | YES | 0 |  |  |
| 16 | `age_50_plus_female` | smallint | YES | 0 |  |  |
| 17 | `total_male` | smallint | YES | 0 |  |  |
| 18 | `total_female` | smallint | YES | 0 |  |  |
| 19 | `total_negative` | smallint | YES | 0 |  |  |
| 20 | `total_postive` | smallint | YES | 0 |  |  |
| 21 | `total_inconclusive` | smallint | YES | 0 |  |  |
| 22 | `total` | smallint | YES | 0 |  |  |
| 23 | `register_year` | smallint | YES | 0 |  |  |
| 24 | `register_month` | tinyint | YES | 0 |  |  |
| 25 | `register_date` | date | NO | NULL |  |  |
| 26 | `created_at` | timestamp | YES | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |
| 27 | `updated_at` | timestamp | YES | NULL |  | on update CURRENT_TIMESTAMP |

#### Indexes

- UNIQUE `PRIMARY` (id)

### `vcct_patient_types`

- Estimated rows: 8
- Engine: InnoDB
- Created: Thu Oct 16 2025 09:50:23 GMT+0700 (Indochina Time)
- Updated: N/A

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `id` | int | NO | NULL | PRI |  |
| 2 | `type_en` | char(10) | YES | NULL |  |  |
| 3 | `type_kh` | varchar(80) | NO | NULL |  |  |
| 4 | `status_id` | tinyint | NO | NULL |  |  |
| 5 | `created_at` | timestamp | YES | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |
| 6 | `updated_at` | timestamp | YES | NULL |  | on update CURRENT_TIMESTAMP |

#### Indexes

- UNIQUE `Pid_UNIQUE` (id)
- UNIQUE `PRIMARY` (id)

### `vcct_reason_to_services`

- Estimated rows: 160368
- Engine: InnoDB
- Created: Thu Oct 16 2025 09:50:23 GMT+0700 (Indochina Time)
- Updated: N/A

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `site_code` | char(6) | NO | NULL | PRI |  |
| 2 | `vcct_id` | int | NO | NULL | PRI |  |
| 3 | `rs1` | tinyint | NO | NULL |  |  |
| 4 | `rs2` | tinyint | NO | NULL |  |  |
| 5 | `rs3` | tinyint | NO | NULL |  |  |
| 6 | `rs4` | tinyint | NO | NULL |  |  |
| 7 | `rs5` | tinyint | NO | NULL |  |  |
| 8 | `rs6` | tinyint | NO | NULL |  |  |
| 9 | `rs7` | tinyint | NO | NULL |  |  |
| 10 | `rs8` | tinyint | NO | NULL |  |  |
| 11 | `rs9` | tinyint | NO | NULL |  |  |
| 12 | `rs10` | tinyint | NO | NULL |  |  |
| 13 | `rs11` | tinyint | NO | NULL |  |  |
| 14 | `rs12` | tinyint | NO | NULL |  |  |
| 15 | `rs13` | tinyint | NO | NULL |  |  |
| 16 | `rs14` | tinyint | NO | NULL |  |  |
| 17 | `created_at` | timestamp | YES | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |
| 18 | `updated_at` | timestamp | YES | NULL |  | on update CURRENT_TIMESTAMP |
| 19 | `created_by_user_id` | int | YES | NULL |  |  |
| 20 | `updated_by_user_id` | int | YES | NULL |  |  |

#### Indexes

- INDEX `idx_reason_to_services_vcct_site` (vcct_id, site_code)
- UNIQUE `PRIMARY` (vcct_id, site_code)

### `vcct_reasons`

- Estimated rows: 14
- Engine: InnoDB
- Created: Thu Oct 16 2025 09:50:36 GMT+0700 (Indochina Time)
- Updated: N/A

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `id` | int | NO | NULL | PRI |  |
| 2 | `reason` | char(45) | NO | NULL |  |  |
| 3 | `status_id` | int | NO | NULL |  |  |
| 4 | `created_at` | timestamp | YES | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |
| 5 | `updated_at` | timestamp | YES | NULL |  | on update CURRENT_TIMESTAMP |

#### Indexes

- UNIQUE `PRIMARY` (id)
- UNIQUE `Rsid_UNIQUE` (id)

### `vcct_refer_froms`

- Estimated rows: 20
- Engine: InnoDB
- Created: Thu Oct 16 2025 09:50:36 GMT+0700 (Indochina Time)
- Updated: N/A

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `id` | tinyint | NO | NULL | PRI |  |
| 2 | `refer_name` | varchar(45) | NO | NULL |  |  |
| 3 | `status_id` | int | NO | NULL |  |  |
| 4 | `created_at` | timestamp | YES | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |
| 5 | `updated_at` | timestamp | YES | NULL |  | on update CURRENT_TIMESTAMP |

#### Indexes

- UNIQUE `PRIMARY` (id)
- UNIQUE `TID_UNIQUE` (id)

### `vcct_refer_to_services`

- Estimated rows: 5
- Engine: InnoDB
- Created: Thu Oct 16 2025 09:50:36 GMT+0700 (Indochina Time)
- Updated: N/A

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `id` | int | NO | NULL | PRI |  |
| 2 | `service_en` | varchar(20) | YES | NULL |  |  |
| 3 | `service_kh` | varchar(90) | NO | NULL |  |  |
| 4 | `status_id` | tinyint | NO | NULL |  |  |
| 5 | `created_at` | timestamp | YES | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |
| 6 | `updated_at` | timestamp | YES | NULL |  | on update CURRENT_TIMESTAMP |

#### Indexes

- UNIQUE `PRIMARY` (id)

### `vcct_retest_outs`

- Estimated rows: 0
- Engine: InnoDB
- Created: Thu Oct 16 2025 09:50:37 GMT+0700 (Indochina Time)
- Updated: N/A

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `id` | int | NO | NULL | PRI | auto_increment |
| 2 | `vcct_id` | int | NO | NULL |  |  |
| 3 | `site_code` | char(6) | NO | NULL |  |  |
| 4 | `sex` | int | NO | NULL |  |  |
| 5 | `age` | int | NO | NULL |  |  |
| 6 | `result` | int | NO | NULL |  |  |
| 7 | `test_date` | date | NO | NULL |  |  |

#### Indexes

- UNIQUE `PRIMARY` (id)

### `vcct_retests`

- Estimated rows: 12668
- Engine: InnoDB
- Created: Wed Dec 03 2025 18:28:37 GMT+0700 (Indochina Time)
- Updated: N/A

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `id` | int | NO | NULL | PRI | auto_increment |
| 2 | `site_code` | char(6) | NO | NULL |  |  |
| 3 | `site_code_from` | char(6) | YES | NULL |  |  |
| 4 | `vcct_id` | int | NO | 0 |  |  |
| 5 | `sex` | int | NO | NULL |  |  |
| 6 | `age` | int | NO | NULL |  |  |
| 7 | `result` | int | NO | NULL |  |  |
| 8 | `test_date` | date | NO | NULL |  |  |
| 9 | `status_id` | int | NO | NULL |  |  |
| 10 | `created_at` | timestamp | YES | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |
| 11 | `updated_at` | timestamp | YES | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED on update CURRENT_TIMESTAMP |
| 12 | `created_by_user_id` | int | YES | NULL |  |  |
| 13 | `updated_by_user_id` | int | YES | NULL |  |  |
| 14 | `sorted_at` | timestamp | YES | NULL |  | STORED GENERATED |

#### Indexes

- UNIQUE `PRIMARY` (id)

### `vcct_risks`

- Estimated rows: 160339
- Engine: InnoDB
- Created: Thu Oct 16 2025 09:50:38 GMT+0700 (Indochina Time)
- Updated: N/A

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `site_code` | char(6) | NO | NULL | PRI |  |
| 2 | `vcct_id` | int | NO | NULL | PRI |  |
| 3 | `risk1` | tinyint | NO | NULL |  |  |
| 4 | `risk2` | tinyint | NO | NULL |  |  |
| 5 | `risk3` | tinyint | NO | NULL |  |  |
| 6 | `risk4` | tinyint | NO | NULL |  |  |
| 7 | `risk5` | tinyint | NO | NULL |  |  |
| 8 | `risk6` | tinyint | NO | NULL |  |  |
| 9 | `risk7` | tinyint | NO | NULL |  |  |
| 10 | `risk8` | tinyint | NO | NULL |  |  |
| 11 | `risk9` | tinyint | NO | NULL |  |  |
| 12 | `risk10` | tinyint | NO | NULL |  |  |
| 13 | `risk11` | tinyint | NO | NULL |  |  |
| 14 | `risk12` | tinyint | NO | NULL |  |  |
| 15 | `risk13` | tinyint | NO | NULL |  |  |
| 16 | `risk14` | tinyint | NO | NULL |  |  |
| 17 | `risk15` | tinyint | NO | NULL |  |  |
| 18 | `risk16` | tinyint | NO | NULL |  |  |
| 19 | `risk17` | tinyint | NO | NULL |  |  |
| 20 | `risk18` | tinyint | NO | NULL |  |  |
| 21 | `created_at` | timestamp | YES | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |
| 22 | `updated_at` | timestamp | YES | NULL |  | on update CURRENT_TIMESTAMP |
| 23 | `created_by_user_id` | int | YES | NULL |  |  |
| 24 | `updated_by_user_id` | int | YES | NULL |  |  |

#### Indexes

- UNIQUE `PRIMARY` (vcct_id, site_code)

### `vcct_rtri_lines_delete`

- Estimated rows: 144
- Engine: InnoDB
- Created: Thu Oct 16 2025 09:50:53 GMT+0700 (Indochina Time)
- Updated: N/A

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `vcct_id` | int | NO | NULL | PRI |  |
| 2 | `l_control` | char(6) | NO | NULL |  |  |
| 3 | `l_positive` | char(6) | NO | NULL |  |  |
| 4 | `l_longterm` | char(6) | NO | NULL |  |  |
| 5 | `cambo_ag` | char(6) | NO | NULL |  |  |
| 6 | `cambo_ab` | char(6) | NO | NULL |  |  |
| 7 | `created_at` | timestamp | YES | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |
| 8 | `updated_at` | timestamp | YES | NULL |  | on update CURRENT_TIMESTAMP |
| 9 | `created_by_user_id` | int | YES | NULL |  |  |
| 10 | `updated_by_user_id` | int | YES | NULL |  |  |

#### Indexes

- UNIQUE `PRIMARY` (vcct_id)
- UNIQUE `VCCTID_UNIQUE` (vcct_id)

### `vcct_rtri_results`

- Estimated rows: 4
- Engine: InnoDB
- Created: Thu Oct 16 2025 09:50:53 GMT+0700 (Indochina Time)
- Updated: N/A

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `id` | tinyint | NO | NULL | PRI | auto_increment |
| 2 | `result` | char(20) | NO | NULL |  |  |
| 3 | `status_id` | tinyint | NO | NULL |  |  |
| 4 | `created_at` | timestamp | YES | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |
| 5 | `updated_at` | timestamp | YES | NULL |  | on update CURRENT_TIMESTAMP |

#### Indexes

- UNIQUE `ID_UNIQUE` (id)
- UNIQUE `PRIMARY` (id)

### `vcct_sites_delete`

- Estimated rows: 66
- Engine: InnoDB
- Created: Thu Oct 16 2025 09:50:53 GMT+0700 (Indochina Time)
- Updated: N/A

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `id` | smallint | NO | NULL | PRI | auto_increment |
| 2 | `site_code` | char(6) | NO | NULL | PRI |  |
| 3 | `site_name` | varchar(50) | YES | NULL |  |  |
| 4 | `od_name` | varchar(50) | YES | NULL |  |  |
| 5 | `status_id` | tinyint | YES | 1 |  |  |
| 6 | `created_at` | timestamp | YES | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |
| 7 | `updated_at` | timestamp | YES | NULL |  | on update CURRENT_TIMESTAMP |
| 8 | `device_name` | varchar(255) | YES | NULL |  |  |
| 9 | `vcct_id_start` | bigint | YES | NULL |  |  |

#### Indexes

- UNIQUE `PRIMARY` (id, site_code)

### `vcct_vl_rita_results`

- Estimated rows: 2
- Engine: InnoDB
- Created: Thu Oct 16 2025 09:50:53 GMT+0700 (Indochina Time)
- Updated: N/A

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `id` | int | NO | NULL | PRI | auto_increment |
| 2 | `result_vl` | char(20) | YES | NULL |  |  |
| 3 | `result_rita` | char(30) | YES | NULL |  |  |
| 4 | `status_id` | tinyint | YES | NULL |  |  |
| 5 | `created_at` | timestamp | YES | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |
| 6 | `updated_at` | timestamp | YES | NULL |  | on update CURRENT_TIMESTAMP |

#### Indexes

- UNIQUE `ID_UNIQUE` (id)
- UNIQUE `PRIMARY` (id)

### `vccts`

- Estimated rows: 158496
- Engine: InnoDB
- Created: Wed Dec 03 2025 18:28:31 GMT+0700 (Indochina Time)
- Updated: N/A

#### Columns

| # | Column | Type / Allowed Values | Null | Default | Key | Extra |
|---:|---|---|---|---|---|---|
| 1 | `site_code` | char(6) | NO | NULL | PRI |  |
| 2 | `vcct_id` | int | NO | NULL | PRI |  |
| 3 | `vcct_id_duplicated` | int | YES | NULL |  |  |
| 4 | `registration_date` | date | NO | NULL |  |  |
| 5 | `pmrs_code` | char(20) | NO | NULL |  |  |
| 6 | `hts_code` | char(20) | NO | NULL |  |  |
| 7 | `sex` | tinyint | NO | NULL |  |  |
| 8 | `dob` | date | NO | NULL | MUL |  |
| 9 | `marital_status_id` | tinyint | NO | NULL |  |  |
| 10 | `occupation_id` | smallint | NO | NULL |  |  |
| 11 | `occupation_other` | varchar(50) | NO | NULL |  |  |
| 12 | `education_id` | smallint | NO | NULL |  |  |
| 13 | `province_id` | int | NO | NULL |  |  |
| 14 | `district_id` | int | NO | NULL |  |  |
| 15 | `commune_id` | int | YES | NULL |  |  |
| 16 | `village_id` | int | YES | NULL |  |  |
| 17 | `country_of_birth_id` | int | NO | NULL |  |  |
| 18 | `country_of_birth_other` | varchar(40) | NO | NULL |  |  |
| 19 | `refer_from_id` | tinyint | NO | NULL |  |  |
| 20 | `patient_type_id` | tinyint | NO | NULL |  |  |
| 21 | `history_of_test` | tinyint | NO | NULL |  |  |
| 22 | `history_of_test_result` | tinyint | NO | NULL |  |  |
| 23 | `history_partner_result1` | tinyint | NO | NULL |  |  |
| 24 | `history_partner_result2` | tinyint | NO | NULL |  |  |
| 25 | `is_agree_test_hiv` | tinyint | NO | NULL |  |  |
| 26 | `combo_result` | tinyint | NO | NULL |  |  |
| 27 | `hiv_result` | tinyint | NO | NULL |  |  |
| 28 | `is_agree_test_rtri` | tinyint | NO | NULL |  |  |
| 29 | `rtri_result_id` | tinyint | NO | NULL |  |  |
| 30 | `is_first_invalid` | tinyint | NO | NULL |  |  |
| 31 | `is_agree_test_vl` | tinyint | NO | NULL |  |  |
| 32 | `vl_result` | int | NO | NULL |  |  |
| 33 | `rita_result` | int | NO | NULL |  |  |
| 34 | `post_counseling_id` | tinyint | NO | NULL |  |  |
| 35 | `post_counseling_date` | date | YES | NULL |  |  |
| 36 | `refer_to_service_id` | tinyint | NO | NULL |  |  |
| 37 | `refer_to_other` | varchar(45) | YES | NULL |  |  |
| 38 | `counselor_code_deprecated` | varchar(256) | YES | NULL |  |  |
| 39 | `counselor_id` | int | YES | NULL |  |  |
| 40 | `created_at` | timestamp | YES | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED |
| 41 | `updated_at` | timestamp | YES | CURRENT_TIMESTAMP |  | DEFAULT_GENERATED on update CURRENT_TIMESTAMP |
| 42 | `created_by_user_id` | int | YES | NULL |  |  |
| 43 | `updated_by_user_id` | int | YES | NULL |  |  |
| 44 | `device_name` | varchar(255) | YES | NULL |  |  |
| 45 | `device_id` | varchar(255) | YES | NULL | MUL |  |
| 46 | `sorted_at` | timestamp | YES | NULL |  | STORED GENERATED |
| 47 | `uuic` | char(15) | YES | NULL |  |  |

#### Indexes

- INDEX `idx_vcct_device_id_name` (device_id, device_name)
- INDEX `idx_vcct_dob` (dob)
- UNIQUE `PRIMARY` (vcct_id, site_code)
- INDEX `vcct_site_code_vcct_id_index` (vcct_id, site_code)

