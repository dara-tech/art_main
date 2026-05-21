# Data Quality Assessment (DQA) — Script Reference

All scripts run against **one facility database** (single site). The app loads every `*.sql` file in this folder (except files starting with `_`).

**File naming:** `NN.short-description.sql` — the number `NN` is the check ID shown in the UI.

**SQL header (required):**

```sql
-- DQA NN: Human-readable title
```

---

## General conventions

| Item | Rule |
|------|------|
| **Adult / child** | Adult: `tblaimain`, `tblaart`, `tblavmain`, `tblavpatientstatus`. Child: `tblcimain`, `tblcart`, `tblcvmain`, `tblcvpatientstatus`. Many checks use `UNION ALL` for both. |
| **Clinic ID** | Main/ART tables use `ClinicID`. Visit/status tables use `clinicid`. In SQL use `ClinicID AS clinicid` to avoid ambiguous columns. |
| **Active patient** | Usually: no row in patient status (`pt.status IS NULL`) = not exited. |
| **TPT / INH** | Use `tblavtptdrug` / `tblcvtptdrug` (exclude `DrugName = 'B6'`) and Form A on `tblaimain` / `tblcimain`. **Do not** use `tblavoidrug` for TPT. |
| **Lost & Return** | New `ClinicID` with link to old ID: child `LClinicID`, adult `TypeofReturn >= 0`. Same ART on two IDs may be valid (see check **22**). |
| **issue_type** | Every result row should include `issue_type` (English text); Khmer labels are mapped in `frontend/src/pages/dqaKh.js`. |
| **Dates** | DQA uses `CURDATE()` / `NOW()` (no report `:EndDate` parameter). |

---

## Check 01 — Duplicate TPT start

**File:** `1.check ipt duplicate id on start.sql`  
**Khmer title:** ចាប់ផ្តើម TPT ស្ទួន (អ្នកជំងឺចាប់ផ្តើម TPT ច្រើនដងក្នុងកំណត់ត្រាពិនិត្យ)

**Purpose:** Find patients who have **more than one TPT start** on visit drug records.

**Tables:** `tblavtptdrug`, `tblcvtptdrug`, `tblavmain`, `tblcvmain`, `tblavpatientstatus`, `tblaart`

**Conditions:**

1. TPT drug rows with `Status = 0` (start), `DrugName != 'B6'`.
2. Join visit by `vid` to get `clinicid`.
3. Valid start date (`Da`); rank starts per `clinicid` by date.
4. Patient has a **second** start (`rn = 2` exists).
5. Only first start row shown per patient (`r1.rn = 1`).

**Issue type:** `Duplicate TPT start`

**Key columns:** `clinicid`, `ART`, `DaArt`, `DrugName`, `Da1`–`Da4` (start dates), `exit_status`, `exit_date`

---

## Check 02 — Invalid viral load result

**File:** `2.check result vl error.sql`  
**Khmer title:** លទ្ធផល Viral Load (VL) មិនត្រឹមត្រូវ

**Purpose:** VL result text contains invalid characters/format.

**Tables:** `tblpatienttest`

**Conditions (any match on `HIVLoad`):**

- Contains comma `,`
- Contains decimal point `.`
- Contains space
- Contains `@`
- Contains `<`

**Issue types:** `Contains comma`, `Contains decimal point`, `Contains space`, `Contains @`, `Contains <`, or `Invalid format`

**Key columns:** `TestID`, `ClinicID`, `Dat`, `DaCollect`, `HIVLoad`, …

---

## Check 03 — Duplicate exit/outcome

**File:** `3.patient outcome error.sql`  
**Khmer title:** ទិន្នន័យបញ្ឈប់ការព្យាបាល/លទ្ធផលស្ទួន

**Purpose:** Patient has **more than one** exit/outcome status record.

**Tables:** `tblavpatientstatus`, `tblcvpatientstatus`, `tblaart`

**Conditions:**

1. Union all exit records (adult + child).
2. `ROW_NUMBER` per `clinicid` by `da`.
3. At least two records (`rn = 2` exists for same `clinicid`).

**Issue type:** `Multiple exit records`

**Key columns:** `clinicid`, `ART`, `DaArt`, `status_1`, `exit_date_1`, `status_2`, `exit_date_2`

---

## Check 04 — Adult registered at age ≤14

**File:** `4.Find age less then 14 in Adult.sql`  
**Khmer title:** ចុះឈ្មោះជាមនុស្សពេញវ័យ (Adult) ប៉ុន្តែអាយុ ≤ ១៤ ឆ្នាំ

**Purpose:** Patient is on **adult** initial form but age at first visit is 14 or younger.

**Tables:** `tblaimain`, `tblaart`

**Conditions:**

1. `tblaimain` only (adult registration).
2. `LClinicID` is empty (not lost-and-return child-style link).
3. `OffIn <> 1` (not transfer-in only case).
4. `TIMESTAMPDIFF(YEAR, DaBirth, DafirstVisit) <= 14`.

**Issue type:** `Adult age <= 14`

---

## Check 05 — ART without initial registration

**File:** `5.find ART patient but don't have initail.sql`  
**Khmer title:** មានលេខ ART ប៉ុន្តែមិនមានទម្រង់ចុះឈ្មោះអ្នកជំងឺ

**Purpose:** ART record exists but **no** matching row on initial form (`tblaimain` / `tblcimain`).

**Tables:** `tblaart`, `tblcart`, `tblaimain`, `tblcimain`

**Conditions:**

1. Row in `tblaart` or `tblcart`.
2. `LEFT JOIN` initial form on `ClinicID`.
3. `WHERE i.ClinicID IS NULL` (no registration).

**Issue type:** `ART without initial form`

**Key columns:** `clinicid`, `ART`, `DaArt`, `patient_type`

---

## Check 06 — On ART but no visit

**File:** `6.find ART patient but don't have followup visit.sql`  
**Khmer title:** កំពុងទទួល ART ប៉ុន្តែមិនមានកំណត់ត្រាមកទទួលសេវា

**Purpose:** Patient has ART start but **no** visit in `tblavmain` / `tblcvmain`.

**Tables:** `tblaart`, `tblcart`, `tblavmain`, `tblcvmain`

**Conditions:**

1. Patient in `tblaart` or `tblcart`.
2. No matching `clinicid` in visit tables (latest visit CTE empty).

**Issue type:** `No visit on record`

---

## Check 07 — Transfer-in missing ART date or number

**File:** `7.find ART TI don't have date and art number.sql`  
**Khmer title:** អ្នកជំងឺផ្ទេរចូល (TI) ខ្វះថ្ងៃចាប់ផ្តើម ART ឬខ្វះលេខ ART

**Purpose:** Transfer-in patient (`OffIn = 1`) without valid ART start date or ART number.

**Tables:** `tblaimain`, `tblcimain`, `tblaart`, `tblcart`, visits, `tblavpatientstatus` / `tblcvpatientstatus`

**Conditions:**

1. `OffIn = 1` (transfer in).
2. Not exited (`pt.status IS NULL`).
3. `DaArt < '2000-01-01'` **OR** `ART` is null/empty.

**Issue type:** `TI missing ART date or number`

---

## Check 08 — Visit vs appointment date invalid

**File:** `8.find datevisit and date appointment missing.sql`  
**Khmer title:** កាលបរិច្ឆេទពិនិត្យ និងថ្ងៃណាត់ជួបមិនត្រឹមត្រូវ

**Purpose:** Visit date and next appointment (`DaApp`) are inconsistent.

**Tables:** `tblavmain`, `tblcvmain`

**Conditions (per visit row):**

| Condition | issue_type |
|-----------|------------|
| `DatVisit > DaApp` | `Wrong appointment date` |
| `DATEDIFF(DaApp, DatVisit) > 190` (~6+ months) | `More than six months` |

---

## Check 09 — HIV positive date not entered

**File:** `9.find datposthiv.sql`  
**Khmer title:** មិនបានបញ្ចូលកាលបរិច្ឆេទរកឃើញ HIV វិជ្ជមាន

**Purpose:** HIV positive date still default **01-Jan-1900**.

**Tables:** `tblaimain` (`DaHIV`), `tblcimain` (`DaTest`), visits, patient status

**Conditions:**

1. Has a latest visit (active pipeline).
2. Not exited.
3. Adult: `DaHIV = '1900-01-01'`. Child: `DaTest = '1900-01-01'`.

**Issue type:** `Invalid HIV positive date`

---

## Check 10 — Visit without initial form

**File:** `10.find miss initial.sql`  
**Khmer title:** មានទិន្នន័យមកទទួលសេវា ប៉ុន្តែមិនមានទម្រង់ចុះឈ្មោះ

**Purpose:** Visit exists but patient is **not** on `tblaimain` or `tblcimain`.

**Tables:** `tblavmain`, `tblcvmain`, `tblaimain`, `tblcimain`

**Conditions:**

1. `clinicid` appears in visit tables.
2. No row in `tblaimain` **and** no row in `tblcimain` for that ID.

**Issue type:** `Visit without initial form`

---

## Check 11 — Sex not recorded

**File:** `11.find patient missing sex.sql`  
**Khmer title:** មិនបានកត់ត្រាភេទរបស់អ្នកជំងឺ

**Purpose:** Active patient with missing/unknown sex on initial form.

**Tables:** `tblaimain`, `tblcimain`, visits, patient status

**Conditions:**

1. Has latest visit.
2. Not exited.
3. `Sex = -1` OR `Sex IS NULL`.

**Issue type:** `Missing sex`

---

## Check 12 — Registered but no visit

**File:** `12.Find patient missing Visit date.sql`  
**Khmer title:** បានចុះឈ្មោះអ្នកជំងឺ ប៉ុន្តែមិនទាន់មានកំណត់ត្រាមកទទួលសេវា

**Purpose:** Initial registration exists but **no** visit row.

**Tables:** `tblaimain`, `tblcimain`, `tblavmain`, `tblcvmain`, patient status

**Conditions:**

1. Row on initial form.
2. Not exited.
3. `clinicid` not found in visit tables.

**Issue type:** `No visit on record`

---

## Check 13 — Exit date before year 2000

**File:** `13.find patient dat exit less then 2000.sql`  
**Khmer title:** កាលបរិច្ឆេទបញ្ឈប់ការព្យាបាល ឬមរណភាពមុនឆ្នាំ ២០០០

**Purpose:** Exit/outcome date `da` is before 2000.

**Tables:** `tblavpatientstatus`, `tblcvpatientstatus`

**Conditions:**

- `da < '2000-01-01'`

**Issue type:** `Exit date before 2000`

---

## Check 14 — OffIn not set

**File:** `14.find patient don't check offin.sql`  
**Khmer title:** មិនបានជ្រើសរើសស្ថានភាពផ្ទេរចូល/ផ្ទេរចេញ (OffIn ទំនេរ)

**Purpose:** Transfer in/out field not selected on registration.

**Tables:** `tblaimain`, `tblcimain`, patient status

**Conditions:**

1. `OffIn = -1` (not selected).
2. Not exited.

**Issue type:** `OffIn not set`

---

## Check 15 — Active patient not on ART

**File:** `15.find patient don't start art.sql`  
**Khmer title:** អ្នកជំងឺសកម្ម (Active) ប៉ុន្តែមិនទាន់បានចាប់ផ្តើម ART

**Purpose:** Registered active patient with **no** ART record.

**Tables:** `tblaimain`, `tblcimain`, `tblaart`, `tblcart`, patient status

**Conditions:**

1. On initial form.
2. Not exited.
3. No row in `tblaart` / `tblcart`.

**Issue type:** `No ART record`

---

## Check 16 — Exit without initial form

**File:** `16.find outcome patient don't have initial.sql`  
**Khmer title:** មានកំណត់ត្រាបញ្ឈប់ការព្យាបាល/លទ្ធផល ប៉ុន្តែមិនមានទម្រង់ចុះឈ្មោះអ្នកជំងឺ

**Purpose:** Exit/outcome exists but **no** initial registration.

**Tables:** `tblavpatientstatus`, `tblcvpatientstatus`, `tblaimain`, `tblcimain`

**Conditions:**

1. Row in patient status (exited).
2. No matching `ClinicID` on `tblaimain` / `tblcimain`.

**Issue type:** `Exit without initial form`

---

## Check 17 — Invalid ART number format

**File:** `17.find wrong ART.sql`  
**Khmer title:** ទម្រង់ ឬប្រវែងលេខ ART មិនត្រឹមត្រូវ

**Purpose:** ART number length does not match national format rules.

**Tables:** `tblaart`, `tblcart`

**Conditions:**

| ART pattern | Expected length | issue_type |
|-------------|-----------------|------------|
| Starts with `P` | 10 characters | `Wrong ART (P prefix)` |
| Does not start with `P` | 9 characters | `Wrong ART (non-P)` |

---

## Check 18 — ART start before 2000

**File:** `18.find wrong Date Start Art.sql`  
**Khmer title:** ខ្វះកាលបរិច្ឆេទចាប់ផ្តើម ART ឬកាលបរិច្ឆេទមុនឆ្នាំ ២០០០

**Purpose:** ART start date `DaArt` before 1 Jan 2000.

**Tables:** `tblaart`, `tblcart`

**Conditions:**

- `DaArt < '2000-01-01'`

**Issue type:** `ART start before 2000`

---

## Check 19 — Invalid TPT/INH start and stop

**File:** `19.TPT Or INH Start and Stope.sql`  
**Khmer title:** កាលបរិច្ឆេទចាប់ផ្តើម/បញ្ឈប់ TPT ឬ INH មិនត្រឹមត្រូវ

**Purpose:** TPT start/stop dates are inconsistent (visit TPT preferred, Form A fallback).

**Tables:** `tblavtptdrug`, `tblcvtptdrug`, `tblavmain`, `tblcvmain`, `tblaimain`, `tblcimain`, `tblaart`, `tblcart`, patient status

**Logic:**

1. Build start/stop from visit TPT drugs (`Status` 0/1); invalid `Da` → use `DatVisit` for start.
2. Form A: `DaStartTPT`, `DaEndTPT`, `TPTdrug` on initial form (adult `TPT IN (1,2)`, child `Inh IN (0,3)`).
3. Active on ART, not exited, has TPT from visit and/or Form A.

**Reported when (issue_type):**

| issue_type | Condition |
|------------|-----------|
| `Stop without start` | Stop date set, no start |
| `Stop before start` | Stop &lt; start |
| `Invalid start date` | Start year &lt; 2000 or `1900-12-31` |
| `Invalid stop date` | Stop year &lt; 2000 or `1900-12-31` |
| `Review start/stop` | Other combinations in SELECT (filtered by WHERE on invalid cases above) |

---

## Check 20 — No VL in 12 months (on ART ≥6 months)

**File:** `20.no vl test in 12 months on active art.sql`  
**Khmer title:** កំពុង ART ≥៦ខែ តែគ្មានតេស្ត VL ក្នុង ១២ខែចុងក្រោយ

**Purpose:** Patient on ART at least 6 months with no recent VL test.

**Tables:** `tblaart`, `tblcart`, `tblpatienttest`, patient status

**Conditions:**

1. `DaArt` at least 6 months before today.
2. Not exited.
3. No VL in `tblpatienttest` **OR** last VL date older than 12 months (valid `HIVLoad`, not suppressed marker).

**Issue types:** `No VL on record`, `No VL in 12 months`

---

## Check 21 — Visit interval over 80 days

**File:** `21.long visit interval over 80 days.sql`  
**Khmer title:** ពិនិត្យចុងក្រោយ ចន្លោះណាត់ជួបលើស ៨០ថ្ងៃ

**Purpose:** Active on ART; latest visit has appointment gap **&gt; 80 days** (possible MMD data issue).

**Tables:** `tblaart`, `tblcart`, `tblavmain`, `tblcvmain`, patient status

**Conditions:**

1. On ART, not exited.
2. Latest visit: `DATEDIFF(DaApp, DatVisit) > 80`.

**Issue type:** `Visit interval over 80 days`

---

## Check 22 — Duplicate ART (not Lost & Return)

**File:** `22.duplicate art number across patients.sql`  
**Khmer title:** លេខ ART ដូចគ្នាលើ Clinic ID ច្រើន (មិនមែន Lost & Return)

**Purpose:** Same ART number on multiple Clinic IDs **without** a valid lost-and-return explanation.

**Tables:** `tblaart`, `tblcart`, `tblaimain`, `tblcimain`

**Lost & Return (excluded from flag):**

- Child: `LClinicID` points to another `clinicid` in the same ART group.
- Adult: `TypeofReturn >= 0`.

**Flag when:**

- Same `ART` on **≥ 2** clinic IDs, and **≥ 2** IDs are **not** lost-return links.

**Issue type:** `Duplicate ART not lost-return`

**Key columns:** `clinicid`, `ART`, `DaArt`, `LClinicID`, `TypeofReturn`

---

## Check 23 — Child ART on adult table only

**File:** `23.child art on adult table only.sql`  
**Khmer title:** ចុះឈ្មោះជាកុមារ តែ ART នៅតារាងមនុស្សពេញវ័យ

**Purpose:** Child in `tblcimain` but ART only in `tblaart` (not `tblcart`).

**Tables:** `tblcimain`, `tblaart`, `tblcart`

**Conditions:**

1. Child registration exists.
2. ART on adult table `tblaart`.
3. No ART on `tblcart`.

**Issue type:** `Child ART on adult table only`

---

## Check 24 — Exit with future appointment

**File:** `24.exit patient with future appointment.sql`  
**Khmer title:** មានកំណត់ត្រាចេញ/លទ្ធផល តែណាត់ជួបនៅពេលអនាគត

**Purpose:** Patient has exit/outcome but latest visit appointment is still in the future.

**Tables:** patient status, `tblavmain`, `tblcvmain`

**Conditions:**

1. Exit record exists (`status IS NOT NULL`).
2. Latest visit `DaApp > CURDATE()`.

**Issue type:** `Exit with future appointment`

---

## Check 25 — 6H TPT over 12 months without stop

**File:** `25.tpt 6h over 12 months without stop.sql`  
**Khmer title:** TPT 6H ចាប់លើស ១២ខែ មិនទាន់មានថ្ងៃឈប់

**Purpose:** 6H TPT regimen started more than 12 months ago with no valid stop.

**Tables:** `tblavtptdrug`, `tblcvtptdrug`, visits

**Conditions:**

1. First TPT start on visit with drug name starting with `6`.
2. `dateStart < 12 months ago`.
3. No stop date, or stop before start.

**Issue type:** `6H TPT over 12 months without stop`

---

## Check 26 — Form A TPT without visit TPT

**File:** `26.form a tpt without visit tpt.sql`  
**Khmer title:** មាន TPT ក្នុង Form A តែគ្មាន TPT ក្នុងពិនិត្យ

**Purpose:** TPT recorded on initial form but no TPT drug row on any visit.

**Tables:** `tblaimain`, `tblcimain`, `tblavtptdrug`, `tblcvtptdrug`, visits

**Conditions:**

1. Form A: `DaStartTPT >= '1990-01-02'`, valid `TPTdrug` (adult/child rules).
2. No visit-linked TPT drug (`DrugName != 'B6'`) for that `clinicid`.

**Issue type:** `Form A TPT without visit TPT`

---

## Check 27 — Birth date after first visit

**File:** `27.birth date after first visit.sql`  
**Khmer title:** ថ្ងៃខែឆ្នាំកំណើត ក្រោយថ្ងៃមកទទួលសេវាដំបូង

**Purpose:** Date of birth is **after** first visit date (impossible chronology).

**Tables:** `tblaimain`, `tblcimain`

**Conditions:**

- `DaBirth > DafirstVisit` (both not null)

**Issue type:** `Birth date after first visit`

---

## Check 28 — VL result blank

**File:** `28.vl result blank.sql`  
**Khmer title:** មានតេស្ត VL តែលទ្ធផល VL ទទេ

**Purpose:** VL test row exists but `HIVLoad` is empty.

**Tables:** `tblpatienttest`

**Conditions:**

- `HIVLoad` IS NULL OR blank
- Test date (`Dat` or `DaCollect`) present

**Issue type:** `VL result blank`

---

## Check 29 — Transfer out without exit record

**File:** `29.transfer out without exit record.sql`  
**Khmer title:** បានចំណាំថាផ្ទេរចេញ (OffIn) តែមិនមានកំណត់ត្រាបញ្ឈប់

**Purpose:** Registration says transfer-out but no exit/outcome in status table.

**Tables:** `tblaimain`, `tblcimain`, patient status

**Conditions:**

1. `OffIn = 3` (transferred out).
2. No row in `tblavpatientstatus` / `tblcvpatientstatus` (`pt.status IS NULL` on join = no exit).

**Issue type:** `Transfer out without exit record`

---

## Adding a new check

1. Create `NN.description.sql` in this folder.
2. First line: `-- DQA NN: Title`
3. Return rows with `issue_type`; use `ClinicID AS clinicid` where needed.
4. Add Khmer strings in `frontend/src/pages/dqaKh.js` (`checkTitles`, `issueTypes`, `columnLabels`).
5. Restart backend to reload scripts.

---

## Related files

| Path | Role |
|------|------|
| `backend/src/services/dqaService.js` | Loads and runs SQL |
| `frontend/src/pages/DqaPage.jsx` | DQA UI |
| `frontend/src/pages/dqaKh.js` | Khmer labels |
| `.cursor/rules/tpt-data-source.mdc` | TPT table convention |
