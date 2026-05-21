# DQA scripts

- One `.sql` file per check; filename prefix is the check number.
- Files starting with `_` are not loaded by the API (helpers only).
- Title: first line `-- DQA NN: Human-readable check name` (shown in the DQA UI).
- Conventions: uppercase SQL keywords, `WITH` CTEs, explicit column lists, `issue_type` where useful.
- Active patient: `exit_status.status IS NULL` when the check applies to patients still in care.
- Adult/child: `UNION ALL` when both `tbla*` and `tblc*` tables apply.
